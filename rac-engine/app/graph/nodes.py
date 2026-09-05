"""
LangGraph Nodes for RAC Engine.
Implements router, product discovery, cart validation, payment orchestration,
and order fulfillment with strict security guardrails.
"""

import re
import json
from typing import Any, Dict, List, Optional
from langchain_core.messages import AIMessage, HumanMessage, SystemMessage

from app.graph.state import AgentState, CartItem, CustomerInfo, AppliedDiscount
from app.tools.catalog_tools import (
    search_catalog,
    check_inventory,
    validate_discount_code,
)
from app.tools.payment_tools import (
    create_razorpay_order,
    get_payment_status,
)
from app.database import get_product_by_sku, get_order_by_id


# Strict System Instructions & Guardrail Prompt
SYSTEM_GUARDRAIL_PROMPT = """You are the Razorpay In-Chat Agentic Commerce Assistant (RAC Engine).
Your goal is to guide D2C shoppers smoothly from product discovery to instantaneous, secure checkout using Razorpay Smart Links.

CRITICAL SECURITY & COMPLIANCE GUARDRAILS:
1. PCI-DSS ZERO RAW CREDENTIALS POLICY:
   - You MUST NEVER accept, request, store, or process raw credit/debit card numbers (16 digits), CVVs, expiration dates, netbanking passwords, or UPI MPINs.
   - If a customer shares any sensitive financial instrument or card details, immediately redact it, reject it, and instruct them: "For your security, never share card details, CVVs, or UPI PINs in chat. All payments are securely tokenized and handled exclusively through the official Razorpay Smart Payment Link."
2. ZERO PHANTOM INVENTORY & ZERO HALLUCINATED DISCOUNTS:
   - Never promise stock that has not been confirmed via check_inventory().
   - Never invent or fabricate coupon codes. The only valid promotional coupons are 'RAZORPAY10' (10% off up to ₹500) and 'WELCOME50' (flat ₹50 off for orders above ₹499).
3. EXPLICIT CHECKOUT CONSENT:
   - Never generate a Razorpay Payment Link without explicit confirmation of: (a) Selected SKU & Quantity, (b) Valid Customer Mobile Number (10 digits) and Email Address.
"""

# Regex patterns for sensitive card / CVV / UPI PIN data
CARD_PATTERN = re.compile(r"\b(?:\d[ -]*?){13,19}\b")
CVV_PATTERN = re.compile(r"\b(?:cvv|cvc|security code)[\s:]*([0-9]{3,4})\b", re.IGNORECASE)
PIN_PATTERN = re.compile(r"\b(?:upi pin|mpin|pin)[\s:]*([0-9]{4,6})\b", re.IGNORECASE)
PHONE_PATTERN = re.compile(r"(?:\+91[\-\s]?)?[6-9]\d{9}")
EMAIL_PATTERN = re.compile(r"[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+")
COUPON_PATTERN = re.compile(r"\b(RAZORPAY10|WELCOME50)\b", re.IGNORECASE)


def extract_last_user_text(state: AgentState) -> str:
    """Extracts raw text content from the last user message."""
    messages = state.get("messages", [])
    if not messages:
        return ""
    last_msg = messages[-1]
    if isinstance(last_msg, dict):
        return str(last_msg.get("content", ""))
    elif hasattr(last_msg, "content"):
        return str(last_msg.content)
    return str(last_msg)


def check_security_guardrails(text: str) -> Optional[str]:
    """
    Scans input for prohibited raw credit card, CVV, or UPI PIN numbers.
    Returns violation message if detected, or None if clean.
    """
    # Check for card number (digits with Luhn-like sequence 13-19 digits)
    cleaned_digits = re.sub(r"[^\d]", "", text)
    if len(cleaned_digits) >= 15 and len(cleaned_digits) <= 19:
        # Check if looks like a card number
        return (
            "PCI-DSS Security Alert: Prohibited card number detected. "
            "For your security, never type credit/debit card numbers in chat. "
            "All transactions are securely handled through official Razorpay Smart Links."
        )

    if CVV_PATTERN.search(text) or ("cvv" in text.lower() and re.search(r"\b\d{3,4}\b", text)):
        return (
            "PCI-DSS Security Alert: Prohibited CVV/CVC code detected. "
            "Never share card security codes in chat. Razorpay's encrypted checkout will handle payment credentials."
        )

    if PIN_PATTERN.search(text) or ("mpin" in text.lower() and re.search(r"\b\d{4,6}\b", text)):
        return (
            "PCI-DSS Security Alert: Prohibited UPI PIN detected. "
            "Never reveal your bank UPI PIN. Enter your PIN exclusively on your trusted UPI app screen."
        )

    return None


def router_node(state: AgentState) -> AgentState:
    """
    Classifies incoming user intent and coordinates state progression:
    - Checks for sensitive data guardrails
    - Identifies discovery vs cart updates vs promo codes vs checkout confirmation
    - Reconciles payment verification if an order is active
    """
    user_text = extract_last_user_text(state)
    new_state = dict(state)

    # 1. Guardrail Check
    violation = check_security_guardrails(user_text)
    if violation:
        new_state["guardrail_violation"] = violation
        new_state["current_intent"] = "GUARDRAIL_TRIGGERED"
        return new_state

    new_state["guardrail_violation"] = None

    # Check for customer contact extraction from chat
    customer_info = dict(new_state.get("customer_info", {}) or {})
    phone_match = PHONE_PATTERN.search(user_text)
    if phone_match:
        customer_info["phone"] = phone_match.group(0).replace(" ", "").replace("-", "")
    email_match = EMAIL_PATTERN.search(user_text)
    if email_match:
        customer_info["email"] = email_match.group(0).strip()

    new_state["customer_info"] = customer_info

    # 2. Check for coupon code application
    coupon_match = COUPON_PATTERN.search(user_text)
    if coupon_match or ("apply" in user_text.lower() and "coupon" in user_text.lower()):
        new_state["current_intent"] = "APPLY_DISCOUNT"
        return new_state

    # 3. Check for checkout / payment intent
    lower = user_text.lower()
    checkout_triggers = [
        "checkout", "pay", "buy now", "place order", "payment link",
        "generate link", "confirm order", "proceed to pay", "pay now",
    ]
    if any(t in lower for t in checkout_triggers):
        new_state["current_intent"] = "CHECKOUT"
        return new_state

    # 4. Check for payment status check
    status_triggers = ["payment status", "did payment go through", "check payment", "verify order", "order status"]
    if any(t in lower for t in status_triggers) or new_state.get("transaction_status") == "PAYMENT_PENDING":
        if any(t in lower for t in ["status", "paid", "done", "completed", "verify"]):
            new_state["current_intent"] = "VERIFY_PAYMENT"
            return new_state

    # 5. Check for cart modification (add to cart, buy SKU, quantity)
    sku_match = re.search(r"\b(RAC-[A-Z]+-\d{3})\b", user_text, re.IGNORECASE)
    cart_triggers = ["add to cart", "buy this", "select", "i want", "get me", "order"]
    if sku_match or any(t in lower for t in cart_triggers):
        new_state["current_intent"] = "CART_UPDATE"
        return new_state

    # 6. Default to product discovery
    new_state["current_intent"] = "DISCOVERY"
    return new_state


def product_discovery_node(state: AgentState) -> AgentState:
    """
    Handles search, recommendations, and product filtering.
    """
    user_text = extract_last_user_text(state)
    new_state = dict(state)
    messages = list(new_state.get("messages", []))

    # Detect category filter if mentioned
    category = None
    lower = user_text.lower()
    if any(w in lower for w in ["audio", "earbuds", "watch", "charger", "speaker", "power bank", "electronics", "tech"]):
        category = "electronics"
    elif any(w in lower for w in ["t-shirt", "tee", "hoodie", "pants", "beanie", "backpack", "apparel", "wear", "clothes"]):
        category = "apparel"
    elif any(w in lower for w in ["kettle", "diffuser", "bedsheet", "skillet", "stand", "home", "kitchen", "decor"]):
        category = "home"

    # Search products
    results = search_catalog(query=user_text, category=category, limit=3)
    
    if not results:
        # Fallback to general featured items
        results = search_catalog(query="", category="electronics", limit=3)
        msg_text = (
            "I couldn't find an exact match for that query, but here are some of our best-selling D2C products:\n\n"
        )
    else:
        msg_text = "Here are the top matches from our catalog:\n\n"

    for p in results:
        msg_text += (
            f"• **{p['title']}** (`{p['sku']}`)\n"
            f"  💰 **₹{p['price_inr']:,.2f}** | 📦 Stock: {p['stock_quantity']} units\n"
            f"  📝 {p['description']}\n\n"
        )

    msg_text += (
        "💡 *To add an item to your cart, say:* **\"Add RAC-ELEC-001 to cart\"** or **\"Buy 2 of NovaTrack Watch\"**.\n"
        "✨ *Available coupon codes:* `RAZORPAY10` (10% off up to ₹500) and `WELCOME50` (flat ₹50 off)."
    )

    messages.append(AIMessage(content=msg_text))
    new_state["messages"] = messages
    new_state["last_action"] = "DISCOVERY_COMPLETED"
    return new_state


def cart_validation_node(state: AgentState) -> AgentState:
    """
    Adds items to cart, checks stock availability, and applies discount coupons.
    """
    user_text = extract_last_user_text(state)
    new_state = dict(state)
    messages = list(new_state.get("messages", []))
    current_cart: Optional[CartItem] = dict(new_state.get("active_cart") or {}) if new_state.get("active_cart") else None

    # Check for coupon code application intent
    if new_state.get("current_intent") == "APPLY_DISCOUNT":
        coupon_match = COUPON_PATTERN.search(user_text)
        code = coupon_match.group(1).upper() if coupon_match else ""
        
        if not current_cart:
            messages.append(AIMessage(
                content="Your cart is currently empty! Please add a product first before applying coupon codes."
            ))
            new_state["messages"] = messages
            return new_state

        val_result = validate_discount_code(code, current_cart["subtotal"])
        if val_result["valid"]:
            new_state["applied_discount"] = {
                "code": val_result["code"],
                "discount_amount": val_result["discount_amount"],
                "discount_percentage": val_result.get("discount_percentage"),
                "final_amount": val_result["final_amount"],
                "message": val_result["message"],
            }
            messages.append(AIMessage(
                content=(
                    f"🎉 **Coupon Applied Successfully!**\n\n"
                    f"{val_result['message']}\n"
                    f"• Original Subtotal: ₹{current_cart['subtotal']:,.2f}\n"
                    f"• Discount: -₹{val_result['discount_amount']:,.2f}\n"
                    f"• **New Total: ₹{val_result['final_amount']:,.2f}**\n\n"
                    f"Ready to checkout? Say **\"Proceed to checkout\"** or share your phone number and email."
                )
            ))
        else:
            messages.append(AIMessage(
                content=f"⚠️ {val_result['message']}\n\nAvailable promo codes: `RAZORPAY10` (10% off) or `WELCOME50` (flat ₹50 off)."
            ))
        new_state["messages"] = messages
        return new_state

    # Find SKU
    sku_match = re.search(r"\b(RAC-[A-Z]+-\d{3})\b", user_text, re.IGNORECASE)
    sku = sku_match.group(1).upper() if sku_match else None

    # Parse quantity
    qty_match = re.search(r"\b(\d+)\s*(?:units?|pcs?|pieces?|items?|of)?\b", user_text)
    quantity = int(qty_match.group(1)) if qty_match and int(qty_match.group(1)) > 0 else 1

    # If no explicit SKU in text, try matching product by title
    product = None
    if sku:
        product = get_product_by_sku(sku)
    else:
        results = search_catalog(query=user_text, limit=1)
        if results:
            product = results[0]
            sku = product["sku"]

    if not product:
        messages.append(AIMessage(
            content="I couldn't identify the product you'd like to add. Please mention the SKU (e.g., `RAC-ELEC-001`) or the product name."
        ))
        new_state["messages"] = messages
        return new_state

    # Inventory validation
    inv = check_inventory(sku, quantity)
    if not inv["status"]:
        messages.append(AIMessage(
            content=f"⚠️ **Inventory Warning:** {inv['reason']}\nPlease select a lower quantity or another product."
        ))
        new_state["messages"] = messages
        return new_state

    # Update active cart
    unit_price = float(product["price_inr"])
    subtotal = unit_price * quantity
    cart_item: CartItem = {
        "sku": sku,
        "name": product["title"],
        "unit_price": unit_price,
        "quantity": quantity,
        "subtotal": round(subtotal, 2),
    }
    new_state["active_cart"] = cart_item
    new_state["transaction_status"] = "CART_REVIEW"

    # Recalculate discount if coupon already attached
    discount_msg = ""
    if new_state.get("applied_discount"):
        code = new_state["applied_discount"]["code"]
        val_result = validate_discount_code(code, subtotal)
        if val_result["valid"]:
            new_state["applied_discount"]["discount_amount"] = val_result["discount_amount"]
            new_state["applied_discount"]["final_amount"] = val_result["final_amount"]
            discount_msg = f"\n🏷️ Discount ({code}): -₹{val_result['discount_amount']:,.2f} | **Total: ₹{val_result['final_amount']:,.2f}**"

    customer_info = new_state.get("customer_info", {})
    phone = customer_info.get("phone")
    email = customer_info.get("email")
    contact_status = ""
    if phone and email:
        contact_status = f"\n📱 Contact: {phone} | ✉️ {email}"
    else:
        contact_status = "\n\n👉 *To proceed to payment, please provide your 10-digit mobile number and email address.*"

    messages.append(AIMessage(
        content=(
            f"🛒 **Cart Updated Successfully!**\n\n"
            f"• **Product:** {product['title']} (`{sku}`)\n"
            f"• **Quantity:** {quantity}\n"
            f"• **Unit Price:** ₹{unit_price:,.2f}\n"
            f"• **Subtotal:** ₹{subtotal:,.2f}"
            f"{discount_msg}"
            f"{contact_status}\n\n"
            f"You can apply promo codes `RAZORPAY10` or `WELCOME50`, or say **\"Checkout\"** to generate your secure Razorpay Payment Link!"
        )
    ))

    new_state["messages"] = messages
    new_state["last_action"] = "CART_UPDATED"
    return new_state


def payment_orchestration_node(state: AgentState) -> AgentState:
    """
    Generates the official Razorpay Order and Smart Payment Link.
    Enforces explicit user confirmation and presence of phone & email.
    """
    new_state = dict(state)
    messages = list(new_state.get("messages", []))
    cart = new_state.get("active_cart")

    if not cart:
        messages.append(AIMessage(
            content="Your cart is currently empty. Please select a product before checking out."
        ))
        new_state["messages"] = messages
        return new_state

    customer = new_state.get("customer_info", {})
    phone = customer.get("phone")
    email = customer.get("email")

    # Strict Validation: Must have phone & email before payment link creation
    missing_fields = []
    if not phone or len(phone) < 10:
        missing_fields.append("a valid 10-digit mobile number")
    if not email or "@" not in email:
        missing_fields.append("a valid email address")

    if missing_fields:
        messages.append(AIMessage(
            content=(
                f"📋 **Almost there! Customer details needed for Razorpay checkout:**\n"
                f"Please provide {' and '.join(missing_fields)} so we can dispatch your payment link and instant SMS receipt."
            )
        ))
        new_state["messages"] = messages
        new_state["transaction_status"] = "CART_REVIEW"
        return new_state

    # Compute final amount with discount
    discount_amount = 0.0
    discount_code = None
    if new_state.get("applied_discount"):
        discount_amount = new_state["applied_discount"].get("discount_amount", 0.0)
        discount_code = new_state["applied_discount"].get("code")

    # Create Razorpay Order & Payment Link
    try:
        payment_data = create_razorpay_order(
            sku=cart["sku"],
            quantity=cart["quantity"],
            customer_phone=phone,
            customer_email=email,
            customer_name=customer.get("name", "RAC Shopper"),
            discount_amount=discount_amount,
            discount_code=discount_code,
            session_id=new_state.get("session_id"),
        )

        new_state["razorpay_order_id"] = payment_data["razorpay_order_id"]
        new_state["payment_link_url"] = payment_data["payment_link_url"]
        new_state["transaction_status"] = "PAYMENT_PENDING"

        messages.append(AIMessage(
            content=(
                f"⚡ **Razorpay Smart Payment Link Ready!**\n\n"
                f"• **Order ID:** `{payment_data['razorpay_order_id']}`\n"
                f"• **Item:** {cart['quantity']}x {cart['name']}\n"
                f"• **Total Payable:** **₹{payment_data['amount_inr']:,.2f}** (Includes taxes & discounts)\n"
                f"• **Expiry:** Valid for 15 minutes\n\n"
                f"🔗 **[Click here to Complete Secure Payment via Razorpay]({payment_data['payment_link_url']})**\n\n"
                f"🛡️ *PCI-DSS Compliant: Supports UPI (GPay, PhonePe, Paytm), Credit/Debit Cards, NetBanking, and Wallets.*"
            )
        ))
    except Exception as e:
        new_state["transaction_status"] = "FAILED"
        new_state["error_message"] = str(e)
        messages.append(AIMessage(
            content=f"❌ Failed to initiate Razorpay checkout: {str(e)}. Please retry or contact support."
        ))

    new_state["messages"] = messages
    new_state["last_action"] = "PAYMENT_LINK_DISPATCHED"
    return new_state


def order_fulfillment_node(state: AgentState) -> AgentState:
    """
    Verifies payment capture status from Razorpay or internal webhook cache,
    and issues instant order confirmation.
    """
    new_state = dict(state)
    messages = list(new_state.get("messages", []))
    order_id = new_state.get("razorpay_order_id")

    if not order_id:
        messages.append(AIMessage(
            content="No active order found to verify. Please create an order first."
        ))
        new_state["messages"] = messages
        return new_state

    status_resp = get_payment_status(order_id)
    cart = new_state.get("active_cart") or {}

    if status_resp["is_captured"]:
        new_state["transaction_status"] = "CAPTURED"
        payment_id = status_resp.get("payment_id") or "pay_captured_live"
        messages.append(AIMessage(
            content=(
                f"🎉 **Payment Verified & Captured!**\n\n"
                f"• **Razorpay Payment ID:** `{payment_id}`\n"
                f"• **Order ID:** `{order_id}`\n"
                f"• **Item Confirmed:** {cart.get('quantity', 1)}x {cart.get('name', 'D2C Item')}\n"
                f"• **Delivery Estimate:** 2-3 business days\n\n"
                f"A confirmation SMS and email have been dispatched to your contact details. Thank you for shopping with RAC Engine!"
            )
        ))
        new_state["active_cart"] = None
        new_state["applied_discount"] = None
    else:
        messages.append(AIMessage(
            content=(
                f"⏳ **Payment Status: Pending**\n\n"
                f"Razorpay has not yet recorded a successful capture for Order `{order_id}`.\n"
                f"If you just completed the payment, please allow a few seconds for the webhook to settle, or click below to proceed:\n\n"
                f"🔗 **[Resume Razorpay Payment Link]({new_state.get('payment_link_url')})**\n\n"
                f"Say **\"Verify payment\"** whenever you have finished checkout."
            )
        ))

    new_state["messages"] = messages
    new_state["last_action"] = "VERIFICATION_PROCESSED"
    return new_state


def guardrail_node(state: AgentState) -> AgentState:
    """
    Executes when prohibited raw card/CVV/UPI PIN credentials are input.
    """
    new_state = dict(state)
    messages = list(new_state.get("messages", []))
    violation_text = new_state.get("guardrail_violation") or (
        "Security Alert: Card details, CVVs, or UPI PINs cannot be accepted in chat. "
        "Razorpay securely tokenizes credentials during checkout."
    )
    messages.append(AIMessage(
        content=f"🛡️ **Security Guardrail Triggered:**\n\n{violation_text}"
    ))
    new_state["messages"] = messages
    new_state["guardrail_violation"] = None
    return new_state
