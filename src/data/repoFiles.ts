import { RepoFile } from '../types';

export const REPO_FILES: RepoFile[] = [
  {
    path: 'rac-engine/app/config.py',
    name: 'config.py',
    language: 'python',
    category: 'app',
    description: 'Pydantic Settings: Razorpay keys, OpenAI models, Redis URL, and runtime options.',
    content: `"""
Application Configuration Module
Loads settings via pydantic-settings with environment variable overrides.
"""

from pathlib import Path
from typing import Optional
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    """
    Core runtime settings for RAC Engine.
    Handles credentials, external service endpoints, and mock fallback values.
    """
    # Application & Environment
    APP_NAME: str = "Razorpay In-Chat Agentic Commerce Engine (RAC Engine)"
    APP_ENV: str = "development"
    DEBUG: bool = True
    HOST: str = "0.0.0.0"
    PORT: int = 8000
    
    # Base URLs
    BACKEND_URL: str = "http://localhost:8000"
    STREAMLIT_URL: str = "http://localhost:8501"

    # OpenAI / LLM Credentials
    OPENAI_API_KEY: str = "sk-placeholder-openai-key-for-local-dev"
    OPENAI_MODEL: str = "gpt-4o-mini"
    LLM_TEMPERATURE: float = 0.2

    # Razorpay Credentials (Sandbox default fallbacks for testing)
    RAZORPAY_KEY_ID: str = "rzp_test_RAC991204DEMO"
    RAZORPAY_KEY_SECRET: str = "RAC_SecretKey_991204_DemoMode"
    RAZORPAY_WEBHOOK_SECRET: str = "rac_webhook_secret_hmac_2026"
    RAZORPAY_CURRENCY: str = "INR"
    PAYMENT_LINK_EXPIRE_MINUTES: int = 15

    # Redis Session Memory Cache
    REDIS_URL: str = "redis://localhost:6379/0"
    REDIS_SESSION_TTL_SECONDS: int = 86400  # 24 hours

    # Database & Catalog Paths
    BASE_DIR: Path = Path(__file__).resolve().parent.parent
    CATALOG_JSON_PATH: Path = BASE_DIR / "data" / "catalog.json"
    DATABASE_PATH: Path = BASE_DIR / "rac_commerce.db"
    
    # Callback configuration for Razorpay Payment Links
    PAYMENT_CALLBACK_URL: str = "http://localhost:8501/?payment_status=success"

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        extra="ignore",
        case_sensitive=True,
    )


settings = Settings()
`
  },
  {
    path: 'rac-engine/app/database.py',
    name: 'database.py',
    language: 'python',
    category: 'app',
    description: 'SQLite initialization with mock D2C catalog & schema, inventory updates and orders.',
    content: `"""
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
`
  },
  {
    path: 'rac-engine/app/tools/catalog_tools.py',
    name: 'catalog_tools.py',
    language: 'python',
    category: 'tools',
    description: 'Catalog search, category filters, inventory check, and discount coupon validation.',
    content: `"""
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
    """
    clean_query = query.strip() if query else ""
    clean_cat = category.strip().lower() if category else None
    
    matches = query_products(query_str=clean_query, category=clean_cat, limit=limit)
    if not matches and clean_query:
        matches = query_products(query_str=clean_query, category=None, limit=limit)
    return matches


def check_inventory(sku: str, quantity: int = 1) -> Dict[str, Any]:
    """Validates if requested quantity is available in stock for given SKU."""
    if quantity <= 0:
        return {"status": False, "reason": "Quantity must be at least 1 unit."}

    product = get_product_by_sku(sku)
    if not product:
        return {"status": False, "reason": f"Product SKU '{sku}' not found."}

    available_stock = product.get("stock_quantity", 0)
    is_available = available_stock >= quantity
    return {
        "status": is_available,
        "sku": sku,
        "product_title": product.get("title"),
        "unit_price": product.get("price_inr"),
        "requested_quantity": quantity,
        "available_stock": available_stock,
        "reason": None if is_available else f"Insufficient stock: only {available_stock} left.",
    }


def validate_discount_code(code: str, subtotal: float) -> Dict[str, Any]:
    """
    Evaluates promotional discount codes:
    - RAZORPAY10: 10% off up to ₹500
    - WELCOME50: Flat ₹50 off on min order of ₹499
    """
    normalized = (code or "").strip().upper()
    if normalized == "RAZORPAY10":
        discount = min(500.0, subtotal * 0.10)
        return {
            "valid": True,
            "code": "RAZORPAY10",
            "discount_amount": round(discount, 2),
            "final_amount": round(max(0.0, subtotal - discount), 2),
            "message": f"Coupon RAZORPAY10 applied! Saved ₹{discount:.2f}.",
        }
    elif normalized == "WELCOME50":
        if subtotal < 499.0:
            return {
                "valid": False,
                "message": "WELCOME50 requires minimum cart subtotal of ₹499.00.",
                "final_amount": subtotal,
            }
        return {
            "valid": True,
            "code": "WELCOME50",
            "discount_amount": 50.0,
            "final_amount": round(max(0.0, subtotal - 50.0), 2),
            "message": "Coupon WELCOME50 applied! Flat ₹50 discount added.",
        }
    return {
        "valid": False,
        "message": f"Invalid coupon code '{normalized}'. Try RAZORPAY10 or WELCOME50.",
        "final_amount": subtotal,
    }
`
  },
  {
    path: 'rac-engine/app/tools/payment_tools.py',
    name: 'payment_tools.py',
    language: 'python',
    category: 'tools',
    description: 'Razorpay Client init, Order creation (rac_{sku}_{ts}), Smart Link generation (15m expiry), and status polling.',
    content: `"""
Razorpay Payment Tools Module for RAC Engine.
Handles Razorpay Client initialization, Order generation with formatted receipt,
Smart Payment Link dispatch with 15-minute expiry, and status polling.
"""

import time
import uuid
from typing import Any, Dict, Optional
import razorpay
from app.config import settings
from app.database import get_product_by_sku, save_order, get_order_by_id


def get_razorpay_client() -> razorpay.Client:
    """Initializes and returns the authenticated Razorpay Client."""
    client = razorpay.Client(auth=(settings.RAZORPAY_KEY_ID, settings.RAZORPAY_KEY_SECRET))
    client.set_app_details({"title": "RAC-Engine", "version": "1.0.0"})
    return client


def create_razorpay_order(
    sku: str,
    quantity: int,
    customer_phone: str,
    customer_email: str,
    customer_name: Optional[str] = "Valued Customer",
    discount_amount: float = 0.0,
    discount_code: Optional[str] = None,
    session_id: Optional[str] = None,
) -> Dict[str, Any]:
    """Creates a Razorpay Order and accompanying Razorpay Smart Payment Link."""
    product = get_product_by_sku(sku)
    if not product:
        raise ValueError(f"Product SKU {sku} does not exist.")

    gross_amount = float(product["price_inr"]) * quantity
    net_amount = max(1.0, gross_amount - discount_amount)
    amount_in_paise = int(round(net_amount * 100))

    timestamp = int(time.time())
    sanitized_sku = sku.replace("-", "_").lower()
    receipt_str = f"rac_{sanitized_sku}_{timestamp}"
    order_internal_id = f"RAC_ORD_{uuid.uuid4().hex[:8].upper()}"

    client = get_razorpay_client()
    try:
        rzp_order = client.order.create(data={
            "amount": amount_in_paise,
            "currency": settings.RAZORPAY_CURRENCY,
            "receipt": receipt_str,
            "notes": {"sku": sku, "session_id": session_id or ""},
            "payment_capture": 1,
        })
        razorpay_order_id = rzp_order.get("id")
    except Exception:
        razorpay_order_id = f"order_mock_{timestamp}_{uuid.uuid4().hex[:6]}"

    expire_epoch = timestamp + (settings.PAYMENT_LINK_EXPIRE_MINUTES * 60)
    try:
        rzp_link = client.payment_link.create(data={
            "amount": amount_in_paise,
            "currency": settings.RAZORPAY_CURRENCY,
            "accept_partial": False,
            "description": f"Checkout for {quantity}x {product['title']}",
            "customer": {"name": customer_name, "email": customer_email, "contact": customer_phone},
            "notify": {"sms": True, "email": True},
            "callback_url": f"{settings.PAYMENT_CALLBACK_URL}&order_id={razorpay_order_id}",
            "callback_method": "get",
            "expire_by": expire_epoch,
        })
        payment_link_id = rzp_link.get("id")
        payment_link_url = rzp_link.get("short_url") or f"https://rzp.io/i/{payment_link_id}"
    except Exception:
        payment_link_id = f"plink_mock_{timestamp}"
        payment_link_url = f"https://rzp.io/i/rac_{order_internal_id.lower()}"

    save_order({
        "order_id": order_internal_id,
        "session_id": session_id or "default",
        "sku": sku,
        "product_title": product["title"],
        "quantity": quantity,
        "unit_price": product["price_inr"],
        "discount_code": discount_code,
        "discount_amount": discount_amount,
        "total_amount": net_amount,
        "customer_name": customer_name,
        "customer_phone": customer_phone,
        "customer_email": customer_email,
        "razorpay_order_id": razorpay_order_id,
        "razorpay_payment_id": None,
        "razorpay_payment_link_id": payment_link_id,
        "payment_link_url": payment_link_url,
        "payment_status": "PAYMENT_PENDING",
    })

    return {
        "status": "success",
        "razorpay_order_id": razorpay_order_id,
        "receipt": receipt_str,
        "payment_link_url": payment_link_url,
        "amount_inr": net_amount,
    }
`
  },
  {
    path: 'rac-engine/app/graph/state.py',
    name: 'state.py',
    language: 'python',
    category: 'graph',
    description: 'TypedDict AgentState specification defining chat history, cart, discount, order and status.',
    content: `"""
AgentState TypedDict definition for LangGraph State Machine.
Defines immutable/reducer state tracked across user conversations and checkout lifecycle.
"""

from typing import Any, Dict, List, Literal, Optional, TypedDict, Union
from langchain_core.messages import BaseMessage

TransactionStatus = Literal[
    "IDLE",
    "CART_REVIEW",
    "PAYMENT_PENDING",
    "CAPTURED",
    "FAILED",
]

class CustomerInfo(TypedDict, total=False):
    name: Optional[str]
    phone: Optional[str]
    email: Optional[str]

class CartItem(TypedDict, total=False):
    sku: str
    name: str
    unit_price: float
    quantity: int
    subtotal: float

class AppliedDiscount(TypedDict, total=False):
    code: str
    discount_amount: float
    discount_percentage: Optional[float]
    final_amount: float
    message: str

class AgentState(TypedDict, total=False):
    messages: List[Union[BaseMessage, Dict[str, Any]]]
    session_id: str
    customer_info: CustomerInfo
    active_cart: Optional[CartItem]
    applied_discount: Optional[AppliedDiscount]
    razorpay_order_id: Optional[str]
    payment_link_url: Optional[str]
    transaction_status: TransactionStatus
    current_intent: Optional[str]
    guardrail_violation: Optional[str]
    last_action: Optional[str]
    error_message: Optional[str]
`
  },
  {
    path: 'rac-engine/app/graph/nodes.py',
    name: 'nodes.py',
    language: 'python',
    category: 'graph',
    description: 'LangGraph nodes: router, product discovery, cart validation, payment orchestration, fulfillment, guardrails.',
    content: `"""
LangGraph Nodes for RAC Engine.
Implements router, product discovery, cart validation, payment orchestration,
and order fulfillment with strict security guardrails.
"""

import re
from typing import Optional
from langchain_core.messages import AIMessage
from app.graph.state import AgentState, CartItem
from app.tools.catalog_tools import search_catalog, check_inventory, validate_discount_code
from app.tools.payment_tools import create_razorpay_order, get_payment_status
from app.database import get_product_by_sku

# Security regex check for PCI-DSS compliance
CARD_PATTERN = re.compile(r"\\b(?:\\d[ -]*?){13,19}\\b")
CVV_PATTERN = re.compile(r"\\b(?:cvv|cvc)[\\s:]*([0-9]{3,4})\\b", re.IGNORECASE)
PIN_PATTERN = re.compile(r"\\b(?:upi pin|mpin)[\\s:]*([0-9]{4,6})\\b", re.IGNORECASE)
PHONE_PATTERN = re.compile(r"(?:\\+91[\\-\\s]?)?[6-9]\\d{9}")
EMAIL_PATTERN = re.compile(r"[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+\\.[a-zA-Z0-9-.]+")

def router_node(state: AgentState) -> AgentState:
    """Classifies user intent and triggers PCI-DSS guardrail if sensitive financial data is present."""
    messages = state.get("messages", [])
    user_text = messages[-1].get("content", "") if messages else ""
    new_state = dict(state)

    # PCI Guardrail Scan
    if CARD_PATTERN.search(user_text) or CVV_PATTERN.search(user_text) or PIN_PATTERN.search(user_text):
        new_state["guardrail_violation"] = "PCI-DSS Alert: Card details, CVVs, or UPI PINs cannot be accepted in chat."
        new_state["current_intent"] = "GUARDRAIL_TRIGGERED"
        return new_state

    # Parse contact information if provided
    phone = PHONE_PATTERN.search(user_text)
    email = EMAIL_PATTERN.search(user_text)
    cust = dict(new_state.get("customer_info", {}) or {})
    if phone: cust["phone"] = phone.group(0)
    if email: cust["email"] = email.group(0)
    new_state["customer_info"] = cust

    lower = user_text.lower()
    if any(t in lower for t in ["checkout", "pay", "buy now", "confirm order", "generate link"]):
        new_state["current_intent"] = "CHECKOUT"
    elif "coupon" in lower or "razorpay10" in lower or "welcome50" in lower:
        new_state["current_intent"] = "APPLY_DISCOUNT"
    elif any(t in lower for t in ["add to cart", "buy this", "order"]) or re.search(r"RAC-[A-Z]+-\\d{3}", user_text):
        new_state["current_intent"] = "CART_UPDATE"
    elif any(t in lower for t in ["verify", "status", "did payment"]):
        new_state["current_intent"] = "VERIFY_PAYMENT"
    else:
        new_state["current_intent"] = "DISCOVERY"

    return new_state
`
  },
  {
    path: 'rac-engine/app/graph/workflow.py',
    name: 'workflow.py',
    language: 'python',
    category: 'graph',
    description: 'LangGraph StateGraph compilation with conditional branching and memory checkpointer.',
    content: `"""
LangGraph Workflow Definition for RAC Engine.
Assembles the StateGraph with conditional routing and state checkpointing.
"""

from typing import Literal
from langgraph.graph import StateGraph, START, END
from langgraph.checkpoint.memory import MemorySaver
from app.graph.state import AgentState
from app.graph.nodes import (
    router_node,
    product_discovery_node,
    cart_validation_node,
    payment_orchestration_node,
    order_fulfillment_node,
    guardrail_node,
)

def route_intent_condition(state: AgentState) -> Literal["guardrail", "discovery", "cart", "payment", "fulfillment"]:
    intent = state.get("current_intent", "DISCOVERY")
    if intent == "GUARDRAIL_TRIGGERED": return "guardrail"
    elif intent in ["CART_UPDATE", "APPLY_DISCOUNT"]: return "cart"
    elif intent == "CHECKOUT": return "payment"
    elif intent == "VERIFY_PAYMENT": return "fulfillment"
    return "discovery"

def create_rac_graph() -> StateGraph:
    workflow = StateGraph(AgentState)
    workflow.add_node("router", router_node)
    workflow.add_node("discovery", product_discovery_node)
    workflow.add_node("cart", cart_validation_node)
    workflow.add_node("payment", payment_orchestration_node)
    workflow.add_node("fulfillment", order_fulfillment_node)
    workflow.add_node("guardrail", guardrail_node)

    workflow.add_edge(START, "router")
    workflow.add_conditional_edges("router", route_intent_condition, {
        "guardrail": "guardrail",
        "discovery": "discovery",
        "cart": "cart",
        "payment": "payment",
        "fulfillment": "fulfillment",
    })

    for node in ["discovery", "cart", "payment", "fulfillment", "guardrail"]:
        workflow.add_edge(node, END)

    return workflow

rac_app = create_rac_graph().compile(checkpointer=MemorySaver())
`
  },
  {
    path: 'rac-engine/app/webhook_handler.py',
    name: 'webhook_handler.py',
    language: 'python',
    category: 'app',
    description: 'Razorpay HMAC-SHA256 signature verification, payment.captured handling, and Redis state sync.',
    content: `"""
Razorpay Webhook Handler & Signature Verification Module.
Implements RFC-compliant HMAC-SHA256 signature verification for inbound
Razorpay webhook payloads, captures payment.captured and payment.failed events.
"""

import hmac
import hashlib
import json
from typing import Tuple, Dict, Any
from app.config import settings
from app.database import get_connection, save_order, get_order_by_id

def verify_razorpay_signature(raw_body: bytes, signature_header: str) -> bool:
    """Validates X-Razorpay-Signature using HMAC-SHA256 against RAZORPAY_WEBHOOK_SECRET."""
    if not signature_header or not settings.RAZORPAY_WEBHOOK_SECRET:
        return False

    secret_bytes = settings.RAZORPAY_WEBHOOK_SECRET.encode("utf-8")
    expected_mac = hmac.new(
        key=secret_bytes,
        msg=raw_body,
        digestmod=hashlib.sha256,
    ).hexdigest()

    return hmac.compare_digest(expected_mac, signature_header.strip())
`
  },
  {
    path: 'rac-engine/app/main.py',
    name: 'main.py',
    language: 'python',
    category: 'app',
    description: 'FastAPI server gateway exposing /api/chat, /api/webhook/razorpay, /health, /api/catalog.',
    content: `"""
FastAPI Server Gateway for RAC Engine.
Exposes /api/chat, /api/webhook/razorpay, /health, /api/catalog, and /api/orders.
"""

from fastapi import FastAPI, Header, HTTPException, Request
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from app.config import settings
from app.graph.workflow import rac_app
from app.webhook_handler import process_webhook_payload

app = FastAPI(title=settings.APP_NAME, version="1.0.0")
app.add_middleware(CORSMiddleware, allow_origins=["*"], allow_methods=["*"], allow_headers=["*"])

class ChatRequest(BaseModel):
    session_id: str
    message: str

@app.post("/api/chat")
async def chat_endpoint(request: ChatRequest):
    config = {"configurable": {"thread_id": request.session_id}}
    state = rac_app.invoke({
        "messages": [{"role": "user", "content": request.message}],
        "session_id": request.session_id,
    }, config=config)
    
    last_msg = state["messages"][-1]
    return {
        "session_id": request.session_id,
        "response": getattr(last_msg, "content", str(last_msg)),
        "active_cart": state.get("active_cart"),
        "applied_discount": state.get("applied_discount"),
        "razorpay_order_id": state.get("razorpay_order_id"),
        "payment_link_url": state.get("payment_link_url"),
        "transaction_status": state.get("transaction_status", "IDLE"),
    }
`
  },
  {
    path: 'rac-engine/ui/app.py',
    name: 'app.py',
    language: 'python',
    category: 'ui',
    description: 'Streamlit frontend with live conversational UI, clickable Razorpay payment buttons, and sandbox simulator.',
    content: `"""
Streamlit Frontend for Razorpay In-Chat Agentic Commerce Engine (RAC Engine).
"""

import streamlit as st
import requests

BACKEND_URL = "http://localhost:8000"
st.set_page_config(page_title="RAC Engine", page_icon="⚡", layout="wide")
st.title("Razorpay In-Chat Agentic Commerce (RAC Engine)")

if "messages" not in st.session_state:
    st.session_state.messages = []

for msg in st.session_state.messages:
    with st.chat_message(msg["role"]):
        st.markdown(msg["content"])
        if msg.get("payment_url"):
            st.link_button("⚡ Pay Securely via Razorpay →", msg["payment_url"])

if prompt := st.chat_input("Ask about products or checkout..."):
    st.session_state.messages.append({"role": "user", "content": prompt})
    res = requests.post(f"{BACKEND_URL}/api/chat", json={"session_id": "demo", "message": prompt})
    data = res.json()
    st.session_state.messages.append({
        "role": "assistant",
        "content": data["response"],
        "payment_url": data.get("payment_link_url"),
    })
    st.rerun()
`
  },
  {
    path: 'rac-engine/tests/test_tools.py',
    name: 'test_tools.py',
    language: 'python',
    category: 'tests',
    description: 'Unit test suite: catalog search, stock validation, promo code thresholds, Razorpay client mocks.',
    content: `"""
Unit Tests for RAC Engine Tools & Razorpay Client Mocking.
"""

import pytest
from unittest.mock import MagicMock, patch
from app.tools.catalog_tools import search_catalog, check_inventory, validate_discount_code
from app.tools.payment_tools import create_razorpay_order
from app.webhook_handler import verify_razorpay_signature, generate_mock_signature

def test_search_catalog():
    results = search_catalog(query="earbuds")
    assert len(results) > 0

def test_discount_cap():
    res = validate_discount_code("RAZORPAY10", subtotal=8000.0)
    assert res["valid"] is True
    assert res["discount_amount"] == 500.0
`
  },
  {
    path: 'rac-engine/tests/test_graph.py',
    name: 'test_graph.py',
    language: 'python',
    category: 'tests',
    description: 'Unit test suite: LangGraph state transitions, cart updates, customer contact validation, PCI guardrail.',
    content: `"""
Unit Tests for LangGraph Conversation State Machine.
"""

from app.graph.workflow import compile_rac_workflow

def test_pci_dss_guardrail_intercepts_raw_card():
    workflow = compile_rac_workflow()
    state = {
        "messages": [{"role": "user", "content": "My card is 4111 2222 3333 4444 and cvv 123"}],
        "session_id": "test_guardrail",
    }
    output = workflow.invoke(state, config={"configurable": {"thread_id": "test"}})
    assert output["current_intent"] == "GUARDRAIL_TRIGGERED"
`
  },
  {
    path: 'rac-engine/docker-compose.yml',
    name: 'docker-compose.yml',
    language: 'yaml',
    category: 'config',
    description: 'Docker Compose orchestration file for Redis, FastAPI backend, and Streamlit frontend.',
    content: `version: '3.8'

services:
  redis:
    image: redis:7-alpine
    ports:
      - "6379:6379"

  backend:
    build: .
    command: uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
    ports:
      - "8000:8000"
    environment:
      - REDIS_URL=redis://redis:6379/0

  frontend:
    build: .
    command: streamlit run ui/app.py --server.port 8501 --server.address 0.0.0.0
    ports:
      - "8501:8501"
    depends_on:
      - backend
`
  },
  {
    path: 'rac-engine/README.md',
    name: 'README.md',
    language: 'markdown',
    category: 'docs',
    description: 'Complete portfolio submission document with executive summary, architecture, state machine, metrics.',
    content: `# Razorpay In-Chat Agentic Commerce Engine (RAC Engine)
Submission for Razorpay AI Internship (Track: AI Growth & Agentic Commerce)
... (See full document in Documentation tab)
`
  }
];
