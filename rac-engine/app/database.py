"""
Database Module for RAC Engine.
Initializes SQLite schema, seeds catalog from catalog.json, and exposes
transactional helper methods for inventory management and orders.
"""

import json
import sqlite3
from typing import Any, Dict, List, Optional
from datetime import datetime
from app.config import settings


def get_connection() -> sqlite3.Connection:
    """Provides a SQLite connection with row dict access enabled."""
    conn = sqlite3.connect(str(settings.DATABASE_PATH), check_same_thread=False)
    conn.row_factory = sqlite3.Row
    return conn


def init_db(force_reseed: bool = False) -> None:
    """
    Initializes database tables (products, orders, audit_logs)
    and seeds the products table from catalog.json if empty or force_reseed=True.
    """
    conn = get_connection()
    cursor = conn.cursor()

    # 1. Products Table
    cursor.execute(
        """
        CREATE TABLE IF NOT EXISTS products (
            sku TEXT PRIMARY KEY,
            title TEXT NOT NULL,
            category TEXT NOT NULL,
            price_inr REAL NOT NULL,
            stock_quantity INTEGER NOT NULL,
            description TEXT NOT NULL,
            specs_json TEXT NOT NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
        """
    )

    # 2. Orders Table
    cursor.execute(
        """
        CREATE TABLE IF NOT EXISTS orders (
            order_id TEXT PRIMARY KEY,
            session_id TEXT NOT NULL,
            sku TEXT NOT NULL,
            product_title TEXT NOT NULL,
            quantity INTEGER NOT NULL,
            unit_price REAL NOT NULL,
            discount_code TEXT,
            discount_amount REAL DEFAULT 0.0,
            total_amount REAL NOT NULL,
            customer_name TEXT,
            customer_phone TEXT NOT NULL,
            customer_email TEXT NOT NULL,
            razorpay_order_id TEXT,
            razorpay_payment_id TEXT,
            razorpay_payment_link_id TEXT,
            payment_link_url TEXT,
            payment_status TEXT NOT NULL DEFAULT 'PAYMENT_PENDING',
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY(sku) REFERENCES products(sku)
        );
        """
    )

    # 3. Webhook Audit Event Log
    cursor.execute(
        """
        CREATE TABLE IF NOT EXISTS webhook_events (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            event_id TEXT,
            event_type TEXT NOT NULL,
            payload_json TEXT NOT NULL,
            processed_status TEXT NOT NULL,
            signature_verified INTEGER NOT NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
        """
    )

    # Seed products if empty or force_reseed
    cursor.execute("SELECT COUNT(*) as cnt FROM products")
    count = cursor.fetchone()["cnt"]

    if count == 0 or force_reseed:
        if force_reseed:
            cursor.execute("DELETE FROM products")

        if settings.CATALOG_JSON_PATH.exists():
            with open(settings.CATALOG_JSON_PATH, "r", encoding="utf-8") as f:
                catalog_data = json.load(f)

            for item in catalog_data:
                cursor.execute(
                    """
                    INSERT INTO products (sku, title, category, price_inr, stock_quantity, description, specs_json)
                    VALUES (?, ?, ?, ?, ?, ?, ?)
                    """,
                    (
                        item["sku"],
                        item["title"],
                        item["category"].lower(),
                        float(item["price_inr"]),
                        int(item["stock_quantity"]),
                        item["description"],
                        json.dumps(item.get("specs", {})),
                    ),
                )
            conn.commit()

    conn.close()


def query_products(
    query_str: Optional[str] = None,
    category: Optional[str] = None,
    limit: int = 10,
) -> List[Dict[str, Any]]:
    """
    Queries products matching category and/or text keywords.
    Computes a relevance score based on title and description matching.
    """
    conn = get_connection()
    cursor = conn.cursor()

    sql = "SELECT * FROM products WHERE 1=1"
    params: List[Any] = []

    if category:
        sql += " AND LOWER(category) = LOWER(?)"
        params.append(category.strip())

    cursor.execute(sql, params)
    rows = cursor.fetchall()
    conn.close()

    results = []
    tokens = [t.lower() for t in query_str.strip().split()] if query_str else []

    for r in rows:
        item = {
            "sku": r["sku"],
            "title": r["title"],
            "category": r["category"],
            "price_inr": r["price_inr"],
            "stock_quantity": r["stock_quantity"],
            "description": r["description"],
            "specs": json.loads(r["specs_json"]) if r["specs_json"] else {},
        }

        # Match relevance
        if tokens:
            title_lower = item["title"].lower()
            desc_lower = item["description"].lower()
            score = 0
            for t in tokens:
                if t in title_lower:
                    score += 3
                elif t in desc_lower:
                    score += 1
            if score > 0:
                item["_score"] = score
                results.append(item)
        else:
            item["_score"] = 1
            results.append(item)

    results.sort(key=lambda x: x.get("_score", 0), reverse=True)
    return results[:limit]


def get_product_by_sku(sku: str) -> Optional[Dict[str, Any]]:
    """Retrieves a single product by SKU."""
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM products WHERE sku = ?", (sku.strip(),))
    row = cursor.fetchone()
    conn.close()

    if not row:
        return None

    return {
        "sku": row["sku"],
        "title": row["title"],
        "category": row["category"],
        "price_inr": row["price_inr"],
        "stock_quantity": row["stock_quantity"],
        "description": row["description"],
        "specs": json.loads(row["specs_json"]) if row["specs_json"] else {},
    }


def update_inventory(sku: str, quantity_delta: int) -> bool:
    """
    Decrements (or increments) product stock atomically.
    Returns True if stock quantity successfully updated.
    """
    conn = get_connection()
    cursor = conn.cursor()
    try:
        cursor.execute(
            """
            UPDATE products
            SET stock_quantity = stock_quantity + ?
            WHERE sku = ? AND (stock_quantity + ?) >= 0
            """,
            (quantity_delta, sku, quantity_delta),
        )
        affected = cursor.rowcount
        conn.commit()
        return affected > 0
    finally:
        conn.close()


def save_order(order_data: Dict[str, Any]) -> None:
    """Inserts or updates an order record in the database."""
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute(
        """
        INSERT INTO orders (
            order_id, session_id, sku, product_title, quantity, unit_price,
            discount_code, discount_amount, total_amount, customer_name,
            customer_phone, customer_email, razorpay_order_id,
            razorpay_payment_id, razorpay_payment_link_id, payment_link_url,
            payment_status, updated_at
        ) VALUES (
            :order_id, :session_id, :sku, :product_title, :quantity, :unit_price,
            :discount_code, :discount_amount, :total_amount, :customer_name,
            :customer_phone, :customer_email, :razorpay_order_id,
            :razorpay_payment_id, :razorpay_payment_link_id, :payment_link_url,
            :payment_status, CURRENT_TIMESTAMP
        )
        ON CONFLICT(order_id) DO UPDATE SET
            payment_status = excluded.payment_status,
            razorpay_payment_id = COALESCE(excluded.razorpay_payment_id, orders.razorpay_payment_id),
            updated_at = CURRENT_TIMESTAMP
        """,
        order_data,
    )
    conn.commit()
    conn.close()


def get_order_by_id(order_id: str) -> Optional[Dict[str, Any]]:
    """Fetches order details by internal order_id or razorpay_order_id."""
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute(
        """
        SELECT * FROM orders 
        WHERE order_id = ? OR razorpay_order_id = ?
        """,
        (order_id, order_id),
    )
    row = cursor.fetchone()
    conn.close()
    return dict(row) if row else None
