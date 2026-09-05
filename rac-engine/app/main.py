"""
FastAPI Server Gateway for RAC Engine.
Exposes /api/chat, /api/webhook/razorpay, /health, /api/catalog, and /api/orders.
"""

from contextlib import asynccontextmanager
from typing import Any, Dict, List, Optional
from fastapi import FastAPI, Header, HTTPException, Request, Response, status
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field

from app.config import settings
from app.database import init_db, query_products, get_order_by_id, save_order
from app.graph.workflow import rac_app
from app.webhook_handler import process_webhook_payload, get_redis_client


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Initializes SQLite database and catalog data on startup."""
    init_db()
    yield


app = FastAPI(
    title=settings.APP_NAME,
    description="In-Chat Agentic Commerce Engine for D2C Brands with autonomous checkout and Razorpay integration.",
    version="1.0.0",
    lifespan=lifespan,
)

# Enable CORS for Streamlit / Frontend web clients
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# Pydantic Schemas
class ChatRequest(BaseModel):
    session_id: str = Field(..., description="Unique conversation session ID")
    message: str = Field(..., description="Customer user message")


class ChatResponse(BaseModel):
    session_id: str
    response: str
    active_cart: Optional[Dict[str, Any]] = None
    applied_discount: Optional[Dict[str, Any]] = None
    razorpay_order_id: Optional[str] = None
    payment_link_url: Optional[str] = None
    transaction_status: str
    guardrail_triggered: bool = False


class SimulatePaymentRequest(BaseModel):
    order_id: str
    event_type: str = Field(default="payment.captured", description="'payment.captured' or 'payment.failed'")


@app.get("/health", tags=["System"])
def health_check():
    """Returns runtime health, environment, and Redis connectivity."""
    redis_conn = get_redis_client()
    return {
        "status": "healthy",
        "app_name": settings.APP_NAME,
        "environment": settings.APP_ENV,
        "database": "sqlite_initialized",
        "redis_connected": redis_conn is not None,
    }


@app.get("/api/catalog", tags=["Commerce"])
def get_catalog(
    query: Optional[str] = None,
    category: Optional[str] = None,
    limit: int = 15,
):
    """Returns products from the mock catalog with optional search/category filters."""
    products = query_products(query_str=query, category=category, limit=limit)
    return {"count": len(products), "products": products}


@app.get("/api/orders/{order_id}", tags=["Commerce"])
def get_order_details(order_id: str):
    """Retrieves order metadata and current payment status."""
    order = get_order_by_id(order_id)
    if not order:
        raise HTTPException(status_code=404, detail=f"Order '{order_id}' not found.")
    return order


@app.post("/api/chat", response_model=ChatResponse, tags=["Agent"])
async def chat_endpoint(request: ChatRequest):
    """
    Executes a turn of the LangGraph Agentic Commerce Engine.
    Passes user message through state machine, evaluates intent, executes catalog/payment tools,
    and returns response text along with Razorpay payment metadata.
    """
    session_id = request.session_id.strip() or "default_session"
    config = {"configurable": {"thread_id": session_id}}

    # Check Redis for asynchronous webhook updates that occurred outside chat
    redis_client = get_redis_client()
    webhook_synced_status = None
    if redis_client:
        cache_data = redis_client.hgetall(f"rac:session:{session_id}")
        if cache_data and cache_data.get("payment_status") == "CAPTURED":
            webhook_synced_status = "CAPTURED"

    # Fetch current graph state
    current_state = rac_app.get_state(config).values or {}
    messages = list(current_state.get("messages", []))
    messages.append({"role": "user", "content": request.message})

    # Update state input
    input_state = {
        "messages": messages,
        "session_id": session_id,
        "customer_info": current_state.get("customer_info", {}),
        "active_cart": current_state.get("active_cart"),
        "applied_discount": current_state.get("applied_discount"),
        "razorpay_order_id": current_state.get("razorpay_order_id"),
        "payment_link_url": current_state.get("payment_link_url"),
        "transaction_status": webhook_synced_status or current_state.get("transaction_status", "IDLE"),
    }

    # Run LangGraph workflow
    try:
        final_state = rac_app.invoke(input_state, config=config)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Graph execution failed: {str(e)}")

    # Extract final assistant reply
    output_messages = final_state.get("messages", [])
    reply_text = "I'm here to assist you with your purchase."
    if output_messages:
        last_msg = output_messages[-1]
        reply_text = getattr(last_msg, "content", None) or str(last_msg.get("content", ""))

    return ChatResponse(
        session_id=session_id,
        response=reply_text,
        active_cart=final_state.get("active_cart"),
        applied_discount=final_state.get("applied_discount"),
        razorpay_order_id=final_state.get("razorpay_order_id"),
        payment_link_url=final_state.get("payment_link_url"),
        transaction_status=final_state.get("transaction_status", "IDLE"),
        guardrail_triggered=final_state.get("guardrail_violation") is not None,
    )


@app.post("/api/webhook/razorpay", tags=["Payments"])
async def razorpay_webhook(
    request: Request,
    x_razorpay_signature: Optional[str] = Header(None, alias="X-Razorpay-Signature"),
):
    """
    Receives incoming Razorpay Webhook notifications.
    Validates HMAC-SHA256 signature using RAZORPAY_WEBHOOK_SECRET,
    updates orders and session state.
    """
    raw_body = await request.body()
    
    if not x_razorpay_signature:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Missing X-Razorpay-Signature header",
        )

    success, message, event_data = process_webhook_payload(raw_body, x_razorpay_signature)
    if not success:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=message,
        )

    return {"status": "success", "message": message, "data": event_data}


@app.post("/api/test/simulate-payment", tags=["Testing"])
def simulate_payment(req: SimulatePaymentRequest):
    """
    Test helper endpoint: Simulates capture or failure of a Razorpay Order in the database and Redis.
    """
    order = get_order_by_id(req.order_id)
    if not order:
        raise HTTPException(status_code=404, detail=f"Order {req.order_id} not found.")

    new_status = "CAPTURED" if req.event_type == "payment.captured" else "FAILED"
    order["payment_status"] = new_status
    order["razorpay_payment_id"] = f"pay_sim_{req.order_id[-6:]}"
    save_order(order)

    # Sync Redis
    redis_client = get_redis_client()
    if redis_client and order.get("session_id"):
        redis_client.hset(
            f"rac:session:{order['session_id']}",
            mapping={
                "last_webhook_event": req.event_type,
                "payment_id": order["razorpay_payment_id"],
                "order_id": req.order_id,
                "payment_status": new_status,
            },
        )

    return {
        "status": "success",
        "order_id": req.order_id,
        "payment_status": new_status,
        "payment_id": order["razorpay_payment_id"],
    }
