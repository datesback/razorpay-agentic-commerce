"""
Streamlit Frontend for Razorpay In-Chat Agentic Commerce Engine (RAC Engine).
Provides a conversational D2C shopping experience, interactive Razorpay payment links,
active cart state inspection, and instant webhook test simulation.
"""

import os
import json
import uuid
import requests
import streamlit as st

# Configuration
BACKEND_URL = os.getenv("BACKEND_URL", "http://localhost:8000")

# Page Layout & Styling
st.set_page_config(
    page_title="RAC Engine - Razorpay In-Chat Commerce",
    page_icon="⚡",
    layout="wide",
    initial_sidebar_state="expanded",
)

# Custom Styling
st.markdown(
    """
    <style>
    .main-title {
        font-size: 2.2rem;
        font-weight: 800;
        background: -webkit-linear-gradient(45deg, #0c2340, #0080ff, #528ff0);
        -webkit-background-clip: text;
        -webkit-text-fill-color: transparent;
        margin-bottom: 0.2rem;
    }
    .sub-title {
        font-size: 1.05rem;
        color: #4b5563;
        margin-bottom: 1.5rem;
    }
    .payment-card {
        background: linear-gradient(135deg, #f0f7ff 0%, #e0effe 100%);
        border: 1.5px solid #2563eb;
        border-radius: 12px;
        padding: 16px 20px;
        margin-top: 12px;
        box-shadow: 0 4px 12px rgba(37, 99, 235, 0.08);
    }
    .cart-badge {
        background-color: #dbeafe;
        color: #1e40af;
        padding: 4px 10px;
        border-radius: 9999px;
        font-weight: 600;
        font-size: 0.85rem;
    }
    .coupon-badge {
        background-color: #dcfce7;
        color: #166534;
        padding: 4px 10px;
        border-radius: 9999px;
        font-weight: 600;
        font-size: 0.85rem;
    }
    </style>
    """,
    unsafe_allow_html=True,
)

# Initialize Session State
if "session_id" not in st.session_state:
    st.session_state.session_id = f"rac_sess_{uuid.uuid4().hex[:8]}"

if "messages" not in st.session_state:
    st.session_state.messages = [
        {
            "role": "assistant",
            "content": (
                "👋 **Welcome to RAC Store!** I am your Razorpay In-Chat Agentic Commerce assistant.\n\n"
                "I can help you browse products, check real-time stock, apply coupons like **`RAZORPAY10`** (10% off) or **`WELCOME50`**, "
                "and generate a secure Razorpay Smart Payment Link in seconds.\n\n"
                "What are you looking for today? (e.g. *\"Show wireless earbuds\"*, *\"I want water-repellent pants\"*, *\"Gooseneck kettle\"*)"
            ),
        }
    ]

if "last_order_id" not in st.session_state:
    st.session_state.last_order_id = None

if "last_payment_url" not in st.session_state:
    st.session_state.last_payment_url = None

if "cart_data" not in st.session_state:
    st.session_state.cart_data = None

if "discount_data" not in st.session_state:
    st.session_state.discount_data = None

if "transaction_status" not in st.session_state:
    st.session_state.transaction_status = "IDLE"


# Sidebar: Live Commerce Telemetry
with st.sidebar:
    st.image(
        "https://upload.wikimedia.org/wikipedia/commons/8/89/Razorpay_logo.svg",
        width=180,
    )
    st.markdown("### ⚡ RAC Engine Console")
    st.caption("Track: AI Growth & Agentic Commerce")
    st.divider()

    st.markdown("**Session Identifier:**")
    st.code(st.session_state.session_id, language="text")

    # Transaction Status Pill
    status_colors = {
        "IDLE": "⚪ IDLE",
        "CART_REVIEW": "🟡 CART REVIEW",
        "PAYMENT_PENDING": "🟠 PAYMENT PENDING",
        "CAPTURED": "🟢 PAYMENT CAPTURED",
        "FAILED": "🔴 PAYMENT FAILED",
    }
    st.markdown(f"**Engine Status:** `{status_colors.get(st.session_state.transaction_status, st.session_state.transaction_status)}`")

    # Active Cart Inspector
    st.markdown("---")
    st.markdown("#### 🛒 Live Cart State")
    if st.session_state.cart_data:
        cart = st.session_state.cart_data
        st.markdown(f"**Item:** {cart.get('name')}")
        st.markdown(f"**SKU:** `{cart.get('sku')}`")
        st.markdown(f"**Quantity:** {cart.get('quantity')}")
        st.markdown(f"**Subtotal:** ₹{cart.get('subtotal', 0):,.2f}")

        if st.session_state.discount_data:
            disc = st.session_state.discount_data
            st.markdown(f"**Coupon:** `{disc.get('code')}` (-₹{disc.get('discount_amount', 0):,.2f})")
            st.markdown(f"**Payable:** **₹{disc.get('final_amount', 0):,.2f}**")
    else:
        st.info("Your cart is currently empty.")

    # Promotional Coupons
    st.markdown("---")
    st.markdown("#### 🏷️ Active Promo Codes")
    st.markdown("• **`RAZORPAY10`**: 10% off up to ₹500\n• **`WELCOME50`**: Flat ₹50 off (min. ₹499)")

    # Simulate Webhook / Test Payment Section
    if st.session_state.last_order_id and st.session_state.transaction_status == "PAYMENT_PENDING":
        st.markdown("---")
        st.markdown("#### 🧪 Sandbox Webhook Simulator")
        st.caption("Simulate incoming Razorpay `payment.captured` event to trigger agent state reconciliation.")
        
        col_sim1, col_sim2 = st.columns(2)
        with col_sim1:
            if st.button("Simulate Capture", type="primary", use_container_width=True):
                try:
                    sim_res = requests.post(
                        f"{BACKEND_URL}/api/test/simulate-payment",
                        json={"order_id": st.session_state.last_order_id, "event_type": "payment.captured"},
                        timeout=5,
                    )
                    if sim_res.status_code == 200:
                        st.session_state.transaction_status = "CAPTURED"
                        st.session_state.messages.append({
                            "role": "assistant",
                            "content": f"🎉 **[Webhook Simulation Received]** Razorpay event `payment.captured` verified for Order `{st.session_state.last_order_id}`! Type **\"Verify payment\"** or continue chatting.",
                        })
                        st.rerun()
                except Exception as ex:
                    st.error(f"Simulator error: {str(ex)}")

        with col_sim2:
            if st.button("Simulate Fail", use_container_width=True):
                try:
                    requests.post(
                        f"{BACKEND_URL}/api/test/simulate-payment",
                        json={"order_id": st.session_state.last_order_id, "event_type": "payment.failed"},
                        timeout=5,
                    )
                    st.session_state.transaction_status = "FAILED"
                    st.warning("Simulated failure emitted.")
                    st.rerun()
                except Exception:
                    pass

    # Session Reset
    st.markdown("---")
    if st.button("🔄 Reset Chat Session", use_container_width=True):
        st.session_state.session_id = f"rac_sess_{uuid.uuid4().hex[:8]}"
        st.session_state.messages = [
            {
                "role": "assistant",
                "content": "Chat reset! How can I assist with your shopping today?",
            }
        ]
        st.session_state.last_order_id = None
        st.session_state.last_payment_url = None
        st.session_state.cart_data = None
        st.session_state.discount_data = None
        st.session_state.transaction_status = "IDLE"
        st.rerun()


# Main Chat View
st.markdown('<div class="main-title">Razorpay In-Chat Agentic Commerce</div>', unsafe_allow_html=True)
st.markdown(
    '<div class="sub-title">Autonomous conversational purchasing powered by LangGraph state machine & Razorpay Smart Links</div>',
    unsafe_allow_html=True,
)

# Render Chat History
for msg in st.session_state.messages:
    with st.chat_message(msg["role"]):
        st.markdown(msg["content"])
        
        # If assistant message has payment metadata attached
        if msg.get("payment_url"):
            st.markdown(
                f"""
                <div class="payment-card">
                    <h4 style="margin:0 0 8px 0; color:#1e40af;">⚡ Razorpay Smart Payment Link</h4>
                    <p style="margin:0 0 12px 0; font-size:0.95rem; color:#374151;">
                        Order <strong>{msg.get('order_id')}</strong> is ready for payment. Click below to launch Razorpay checkout.
                    </p>
                    <a href="{msg.get('payment_url')}" target="_blank" style="text-decoration:none;">
                        <button style="background-color:#2563eb; color:white; border:none; padding:10px 24px; border-radius:8px; font-weight:600; font-size:1rem; cursor:pointer;">
                            Pay Securely via Razorpay →
                        </button>
                    </a>
                </div>
                """,
                unsafe_allow_html=True,
            )

# Chat Input Handler
user_input = st.chat_input("Ask for products, add to cart, apply coupon, or say checkout...")

if user_input:
    # 1. Append and render user message
    st.session_state.messages.append({"role": "user", "content": user_input})
    with st.chat_message("user"):
        st.markdown(user_input)

    # 2. Call FastAPI backend
    with st.chat_message("assistant"):
        with st.spinner("RAC Agent thinking & querying catalog..."):
            try:
                payload = {
                    "session_id": st.session_state.session_id,
                    "message": user_input,
                }
                res = requests.post(f"{BACKEND_URL}/api/chat", json=payload, timeout=15)

                if res.status_code == 200:
                    data = res.json()
                    response_text = data.get("response", "Thank you for reaching out.")
                    
                    # Update local session tracking
                    st.session_state.cart_data = data.get("active_cart")
                    st.session_state.discount_data = data.get("applied_discount")
                    st.session_state.transaction_status = data.get("transaction_status", "IDLE")

                    payment_url = data.get("payment_link_url")
                    order_id = data.get("razorpay_order_id")

                    if order_id:
                        st.session_state.last_order_id = order_id
                    if payment_url:
                        st.session_state.last_payment_url = payment_url

                    # Render response
                    st.markdown(response_text)

                    if payment_url:
                        st.markdown(
                            f"""
                            <div class="payment-card">
                                <h4 style="margin:0 0 8px 0; color:#1e40af;">⚡ Razorpay Smart Payment Link</h4>
                                <p style="margin:0 0 12px 0; font-size:0.95rem; color:#374151;">
                                    Order <strong>{order_id}</strong> is ready for payment. Click below to launch Razorpay checkout.
                                </p>
                                <a href="{payment_url}" target="_blank" style="text-decoration:none;">
                                    <button style="background-color:#2563eb; color:white; border:none; padding:10px 24px; border-radius:8px; font-weight:600; font-size:1rem; cursor:pointer;">
                                        Pay Securely via Razorpay →
                                    </button>
                                </a>
                            </div>
                            """,
                            unsafe_allow_html=True,
                        )

                    # Save to state
                    st.session_state.messages.append({
                        "role": "assistant",
                        "content": response_text,
                        "payment_url": payment_url,
                        "order_id": order_id,
                    })

                else:
                    err_msg = f"Backend error: {res.status_code} - {res.text}"
                    st.error(err_msg)
                    st.session_state.messages.append({"role": "assistant", "content": err_msg})

            except requests.exceptions.ConnectionError:
                fallback_msg = (
                    "⚠️ Could not connect to the RAC Engine backend at `http://localhost:8000`.\n\n"
                    "Ensure you have started the FastAPI server with `uvicorn app.main:app --reload --port 8000` or via Docker Compose."
                )
                st.warning(fallback_msg)
                st.session_state.messages.append({"role": "assistant", "content": fallback_msg})

            except Exception as e:
                err_msg = f"Unexpected error: {str(e)}"
                st.error(err_msg)
                st.session_state.messages.append({"role": "assistant", "content": err_msg})
