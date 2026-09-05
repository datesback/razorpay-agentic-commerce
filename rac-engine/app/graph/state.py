"""
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
    """
    Central State of the LangGraph Agentic Commerce Engine.
    """
    messages: List[Union[BaseMessage, Dict[str, Any]]]
    session_id: str
    customer_info: CustomerInfo
    active_cart: Optional[CartItem]
    applied_discount: Optional[AppliedDiscount]
    razorpay_order_id: Optional[str]
    payment_link_url: Optional[str]
    transaction_status: TransactionStatus
    
    # Operational routing & guardrail metadata
    current_intent: Optional[str]
    guardrail_violation: Optional[str]
    last_action: Optional[str]
    error_message: Optional[str]
