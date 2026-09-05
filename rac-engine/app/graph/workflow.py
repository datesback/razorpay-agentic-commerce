"""
LangGraph Workflow Definition for RAC Engine.
Assembles the StateGraph with conditional routing and state checkpointing.
"""

from typing import Dict, Any, Literal
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
    """
    Evaluates current_intent set by router_node to determine the next graph node.
    """
    intent = state.get("current_intent", "DISCOVERY")

    if intent == "GUARDRAIL_TRIGGERED":
        return "guardrail"
    elif intent in ["CART_UPDATE", "APPLY_DISCOUNT"]:
        return "cart"
    elif intent == "CHECKOUT":
        return "payment"
    elif intent == "VERIFY_PAYMENT":
        return "fulfillment"
    else:
        return "discovery"


def create_rac_graph() -> StateGraph:
    """
    Constructs the uncompiled LangGraph StateGraph for the RAC Engine.
    """
    workflow = StateGraph(AgentState)

    # Add Nodes
    workflow.add_node("router", router_node)
    workflow.add_node("discovery", product_discovery_node)
    workflow.add_node("cart", cart_validation_node)
    workflow.add_node("payment", payment_orchestration_node)
    workflow.add_node("fulfillment", order_fulfillment_node)
    workflow.add_node("guardrail", guardrail_node)

    # Edge from START to router
    workflow.add_edge(START, "router")

    # Conditional branching from router to specialized nodes
    workflow.add_conditional_edges(
        "router",
        route_intent_condition,
        {
            "guardrail": "guardrail",
            "discovery": "discovery",
            "cart": "cart",
            "payment": "payment",
            "fulfillment": "fulfillment",
        },
    )

    # Leaf nodes terminate back to END
    workflow.add_edge("discovery", END)
    workflow.add_edge("cart", END)
    workflow.add_edge("payment", END)
    workflow.add_edge("fulfillment", END)
    workflow.add_edge("guardrail", END)

    return workflow


def compile_rac_workflow(checkpointer: Any = None):
    """
    Compiles the RAC Engine StateGraph with an optional MemorySaver or Redis checkpointer.
    """
    graph = create_rac_graph()
    memory = checkpointer if checkpointer is not None else MemorySaver()
    return graph.compile(checkpointer=memory)


# Global compiled workflow instance for the application runtime
rac_app = compile_rac_workflow()
