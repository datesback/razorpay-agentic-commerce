"""
Unit Tests for LangGraph Conversation State Machine.
Verifies intent classification, state transitions, discount flows,
payment orchestration, fulfillment, and PCI-DSS guardrail interception.
"""

import pytest
from app.database import init_db
from app.graph.state import AgentState
from app.graph.workflow import compile_rac_workflow


@pytest.fixture(autouse=True)
def setup_test_env():
    """Initializes database and clean workflow checkpointer before test."""
    init_db(force_reseed=True)


class TestLangGraphStateTransitions:
    """Test suite for LangGraph StateGraph nodes and edges."""

    def test_discovery_node_intent(self):
        workflow = compile_rac_workflow()
        config = {"configurable": {"thread_id": "test_thread_discovery"}}

        initial_state = {
            "messages": [{"role": "user", "content": "Show me wireless earbuds"}],
            "session_id": "test_thread_discovery",
            "transaction_status": "IDLE",
        }

        output = workflow.invoke(initial_state, config=config)
        assert output["current_intent"] == "DISCOVERY"
        assert len(output["messages"]) >= 2
        last_msg = output["messages"][-1]
        msg_content = getattr(last_msg, "content", str(last_msg))
        assert "AuraPods" in msg_content

    def test_cart_validation_and_stock_check(self):
        workflow = compile_rac_workflow()
        config = {"configurable": {"thread_id": "test_thread_cart"}}

        initial_state = {
            "messages": [{"role": "user", "content": "Add 2 of RAC-ELEC-001 to cart"}],
            "session_id": "test_thread_cart",
            "transaction_status": "IDLE",
        }

        output = workflow.invoke(initial_state, config=config)
        assert output["transaction_status"] == "CART_REVIEW"
        assert output["active_cart"] is not None
        assert output["active_cart"]["sku"] == "RAC-ELEC-001"
        assert output["active_cart"]["quantity"] == 2
        assert output["active_cart"]["subtotal"] == 6998.0  # 3499 * 2

    def test_discount_code_application_flow(self):
        workflow = compile_rac_workflow()
        config = {"configurable": {"thread_id": "test_thread_discount"}}

        # Step 1: Add product to cart
        state_1 = {
            "messages": [{"role": "user", "content": "Add RAC-APPR-001 to cart"}],
            "session_id": "test_thread_discount",
        }
        output_1 = workflow.invoke(state_1, config=config)
        assert output_1["active_cart"]["subtotal"] == 999.0

        # Step 2: Apply coupon RAZORPAY10
        state_2 = {
            "messages": [
                *output_1["messages"],
                {"role": "user", "content": "Apply coupon RAZORPAY10"},
            ],
            "session_id": "test_thread_discount",
            "active_cart": output_1["active_cart"],
        }
        output_2 = workflow.invoke(state_2, config=config)
        assert output_2["applied_discount"] is not None
        assert output_2["applied_discount"]["code"] == "RAZORPAY10"
        assert output_2["applied_discount"]["discount_amount"] == 99.9  # 10% of 999
        assert output_2["applied_discount"]["final_amount"] == 899.1

    def test_checkout_missing_customer_contact_prompts_user(self):
        workflow = compile_rac_workflow()
        config = {"configurable": {"thread_id": "test_thread_checkout_missing"}}

        state = {
            "messages": [{"role": "user", "content": "I want to checkout now"}],
            "session_id": "test_thread_checkout_missing",
            "active_cart": {
                "sku": "RAC-ELEC-001",
                "name": "AuraPods Pro",
                "unit_price": 3499.0,
                "quantity": 1,
                "subtotal": 3499.0,
            },
            "customer_info": {},
            "transaction_status": "CART_REVIEW",
        }

        output = workflow.invoke(state, config=config)
        # Should stay in CART_REVIEW until phone and email are provided
        assert output["transaction_status"] == "CART_REVIEW"
        last_msg = output["messages"][-1]
        msg_content = getattr(last_msg, "content", str(last_msg))
        assert "mobile number" in msg_content or "email" in msg_content

    def test_checkout_with_contact_dispatches_payment_link(self):
        workflow = compile_rac_workflow()
        config = {"configurable": {"thread_id": "test_thread_checkout_complete"}}

        state = {
            "messages": [{
                "role": "user",
                "content": "Checkout my order. My phone is 9876543210 and email is shopper@example.com",
            }],
            "session_id": "test_thread_checkout_complete",
            "active_cart": {
                "sku": "RAC-ELEC-001",
                "name": "AuraPods Pro",
                "unit_price": 3499.0,
                "quantity": 1,
                "subtotal": 3499.0,
            },
            "transaction_status": "CART_REVIEW",
        }

        output = workflow.invoke(state, config=config)
        assert output["transaction_status"] == "PAYMENT_PENDING"
        assert output["razorpay_order_id"] is not None
        assert output["payment_link_url"] is not None

    def test_pci_dss_guardrail_intercepts_raw_card(self):
        workflow = compile_rac_workflow()
        config = {"configurable": {"thread_id": "test_thread_guardrail"}}

        # Attempt sending 16-digit card number and CVV
        state = {
            "messages": [{
                "role": "user",
                "content": "Here is my card 4111 2222 3333 4444 and cvv 789 to pay",
            }],
            "session_id": "test_thread_guardrail",
            "transaction_status": "IDLE",
        }

        output = workflow.invoke(state, config=config)
        assert output["current_intent"] == "GUARDRAIL_TRIGGERED"
        last_msg = output["messages"][-1]
        msg_content = getattr(last_msg, "content", str(last_msg))
        assert "Security Guardrail" in msg_content
        assert "CVV" in msg_content or "card" in msg_content
