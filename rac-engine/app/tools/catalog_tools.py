"""
Catalog & Inventory Tools for RAC Engine.
Provides functions for semantic and keyword catalog search, real-time stock
validation, and strict discount code verification.
"""

from typing import Any, Dict, List, Optional
from app.database import query_products, get_product_by_sku


def search_catalog(
    query: str,
    category: Optional[str] = None,
    limit: int = 5,
) -> List[Dict[str, Any]]:
    """
    Searches the D2C catalog using text tokens and category filter.
    Returns matched products with metadata, price, and current stock.

    Args:
        query: User search term (e.g. "wireless earbuds", "supima cotton", "charger")
        category: Optional category filter ("electronics", "apparel", "home")
        limit: Max products to return

    Returns:
        List of product dicts matching query criteria.
    """
    clean_query = query.strip() if query else ""
    clean_cat = category.strip().lower() if category else None
    
    # Standardize category synonyms if applicable
    if clean_cat in ["tech", "gadgets", "electronic"]:
        clean_cat = "electronics"
    elif clean_cat in ["clothing", "clothes", "fashion"]:
        clean_cat = "apparel"
    elif clean_cat in ["kitchen", "living", "decor"]:
        clean_cat = "home"

    matches = query_products(query_str=clean_query, category=clean_cat, limit=limit)
    
    # If no results and category was supplied, fallback to broader query
    if not matches and clean_query:
        matches = query_products(query_str=clean_query, category=None, limit=limit)

    return matches


def check_inventory(sku: str, quantity: int = 1) -> Dict[str, Any]:
    """
    Validates if requested quantity is available in stock for given SKU.

    Args:
        sku: Product SKU code (e.g. "RAC-ELEC-001")
        quantity: Quantity requested by customer

    Returns:
        Dict with status: bool, available_stock: int, product: Optional[Dict], reason: Optional[str]
    """
    if quantity <= 0:
        return {
            "status": False,
            "sku": sku,
            "available_stock": 0,
            "product": None,
            "reason": "Requested quantity must be at least 1 unit.",
        }

    product = get_product_by_sku(sku)
    if not product:
        return {
            "status": False,
            "sku": sku,
            "available_stock": 0,
            "product": None,
            "reason": f"Product SKU '{sku}' not found in catalog.",
        }

    available_stock = product.get("stock_quantity", 0)
    is_available = available_stock >= quantity

    return {
        "status": is_available,
        "sku": sku,
        "product_title": product.get("title"),
        "unit_price": product.get("price_inr"),
        "requested_quantity": quantity,
        "available_stock": available_stock,
        "reason": None if is_available else f"Insufficient stock: requested {quantity}, only {available_stock} remaining.",
    }


def validate_discount_code(code: str, subtotal: float) -> Dict[str, Any]:
    """
    Evaluates promotional discount codes.
    Supported codes:
    - RAZORPAY10: 10% off up to ₹500 maximum cap.
    - WELCOME50: Flat ₹50 off on minimum cart subtotal of ₹499.

    Args:
        code: Discount code string (case-insensitive)
        subtotal: Current cart subtotal in INR

    Returns:
        Dict containing valid: bool, discount_amount: float, final_amount: float, message: str
    """
    if not code:
        return {
            "valid": False,
            "code": "",
            "discount_amount": 0.0,
            "final_amount": round(subtotal, 2),
            "message": "No discount code provided.",
        }

    normalized_code = code.strip().upper()
    subtotal = max(0.0, float(subtotal))

    if normalized_code == "RAZORPAY10":
        # 10% off capped at ₹500
        raw_discount = subtotal * 0.10
        discount_amount = min(500.0, raw_discount)
        final_amount = max(0.0, subtotal - discount_amount)
        return {
            "valid": True,
            "code": "RAZORPAY10",
            "discount_percentage": 10.0,
            "cap": 500.0,
            "discount_amount": round(discount_amount, 2),
            "final_amount": round(final_amount, 2),
            "message": f"Coupon RAZORPAY10 applied! You saved ₹{discount_amount:.2f} (10% off up to ₹500).",
        }

    elif normalized_code == "WELCOME50":
        # Flat ₹50 off on min order of ₹499
        min_order = 499.0
        if subtotal < min_order:
            return {
                "valid": False,
                "code": "WELCOME50",
                "discount_amount": 0.0,
                "final_amount": round(subtotal, 2),
                "message": f"Coupon WELCOME50 requires a minimum order value of ₹{min_order:.2f}.",
            }
        
        discount_amount = min(50.0, subtotal)
        final_amount = max(0.0, subtotal - discount_amount)
        return {
            "valid": True,
            "code": "WELCOME50",
            "discount_amount": round(discount_amount, 2),
            "final_amount": round(final_amount, 2),
            "message": "Coupon WELCOME50 applied! Flat ₹50 discount added.",
        }

    else:
        return {
            "valid": False,
            "code": normalized_code,
            "discount_amount": 0.0,
            "final_amount": round(subtotal, 2),
            "message": f"Invalid coupon code '{normalized_code}'. Valid codes are 'RAZORPAY10' and 'WELCOME50'.",
        }
