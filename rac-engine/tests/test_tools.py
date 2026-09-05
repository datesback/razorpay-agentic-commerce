"""
Unit Tests for RAC Engine Tools & Razorpay Client Mocking.
Tests catalog searching, inventory checking, discount coupon validation,
and Razorpay Order / Payment Link generation.
"""

import json
import pytest
from unittest.mock import MagicMock, patch
from app.database import init_db, get_product_by_sku
from app.tools.catalog_tools import (
    search_catalog,
    check_inventory,
    validate_discount_code,
)
from app.tools.payment_tools import (
    create_razorpay_order,
    get_payment_status,
)
from app.webhook_handler import (
    verify_razorpay_signature,
    generate_mock_signature,
)


@pytest.fixture(autouse=True)
def setup_test_database():
    """Ensures test database is populated before each test."""
    init_db(force_reseed=True)


class TestCatalogTools:
    """Test suite for catalog querying and inventory constraints."""

    def test_search_catalog_with_keyword(self):
        results = search_catalog(query="earbuds")
        assert len(results) > 0
        assert any("AuraPods" in r["title"] for r in results)

    def test_search_catalog_with_category_filter(self):
        results = search_catalog(query="", category="apparel")
        assert len(results) > 0
        assert all(r["category"] == "apparel" for r in results)

    def test_search_catalog_no_match(self):
        results = search_catalog(query="completely_non_existent_gadget_xyz999")
        assert len(results) == 0

    def test_check_inventory_available(self):
        # RAC-ELEC-001 has initial stock of 42
        res = check_inventory("RAC-ELEC-001", quantity=2)
        assert res["status"] is True
        assert res["available_stock"] >= 2
        assert res["reason"] is None

    def test_check_inventory_insufficient(self):
        # Requesting more than available stock
        res = check_inventory("RAC-ELEC-001", quantity=9999)
        assert res["status"] is False
        assert "Insufficient stock" in res["reason"]

    def test_check_inventory_invalid_sku(self):
        res = check_inventory("RAC-FAKE-999", quantity=1)
        assert res["status"] is False
        assert "not found" in res["reason"]

    def test_check_inventory_zero_or_negative_quantity(self):
        res = check_inventory("RAC-ELEC-001", quantity=0)
        assert res["status"] is False
        assert "at least 1" in res["reason"]


class TestDiscountValidation:
    """Test suite for promo codes RAZORPAY10 and WELCOME50."""

    def test_razorpay10_standard_discount(self):
        # 10% of ₹2000 = ₹200 (less than ₹500 cap)
        res = validate_discount_code("RAZORPAY10", subtotal=2000.0)
        assert res["valid"] is True
        assert res["discount_amount"] == 200.0
        assert res["final_amount"] == 1800.0
        assert res["code"] == "RAZORPAY10"

    def test_razorpay10_cap_enforcement(self):
        # 10% of ₹8000 = ₹800 -> must cap at ₹500
        res = validate_discount_code("RAZORPAY10", subtotal=8000.0)
        assert res["valid"] is True
        assert res["discount_amount"] == 500.0
        assert res["final_amount"] == 7500.0

    def test_welcome50_valid_order(self):
        # ₹50 off on orders >= ₹499
        res = validate_discount_code("WELCOME50", subtotal=999.0)
        assert res["valid"] is True
        assert res["discount_amount"] == 50.0
        assert res["final_amount"] == 949.0

    def test_welcome50_below_minimum_threshold(self):
        # Subtotal below ₹499 should fail
        res = validate_discount_code("WELCOME50", subtotal=350.0)
        assert res["valid"] is False
        assert res["discount_amount"] == 0.0
        assert "minimum order value" in res["message"]

    def test_invalid_coupon_code(self):
        res = validate_discount_code("BOGUS_CODE_99", subtotal=1500.0)
        assert res["valid"] is False
        assert "Invalid coupon code" in res["message"]


class TestRazorpayIntegration:
    """Test suite for Razorpay Order, Smart Links, and Webhooks."""

    @patch("app.tools.payment_tools.get_razorpay_client")
    def test_create_razorpay_order_success(self, mock_client_getter):
        # Setup mock client
        mock_client = MagicMock()
        mock_client_getter.return_value = mock_client

        mock_client.order.create.return_value = {
            "id": "order_test_12345",
            "amount": 349900,
            "currency": "INR",
            "status": "created",
        }
        mock_client.payment_link.create.return_value = {
            "id": "plink_test_67890",
            "short_url": "https://rzp.io/i/test_link_123",
            "status": "created",
        }

        result = create_razorpay_order(
            sku="RAC-ELEC-001",
            quantity=1,
            customer_phone="9876543210",
            customer_email="customer@example.com",
            customer_name="Test Shopper",
            session_id="test_sess_001",
        )

        assert result["status"] == "success"
        assert result["razorpay_order_id"] == "order_test_12345"
        assert result["payment_link_url"] == "https://rzp.io/i/test_link_123"
        assert result["amount_inr"] == 3499.0
        assert result["receipt"].startswith("rac_rac_elec_001_")

        # Verify SDK was called with 15-minute expiration
        call_args = mock_client.payment_link.create.call_args[1]["data"]
        assert call_args["expire_by"] > 0
        assert call_args["notify"]["sms"] is True
        assert call_args["notify"]["email"] is True

    def test_webhook_hmac_sha256_verification(self):
        raw_payload = b'{"event":"payment.captured","payload":{"payment":{"entity":{"id":"pay_123"}}}}'
        valid_signature = generate_mock_signature(raw_payload)
        
        # Valid signature matches
        assert verify_razorpay_signature(raw_payload, valid_signature) is True
        
        # Tampered payload fails
        tampered_payload = b'{"event":"payment.captured","payload":{"payment":{"entity":{"id":"pay_TAMPERED"}}}}'
        assert verify_razorpay_signature(tampered_payload, valid_signature) is False

        # Bogus signature fails
        assert verify_razorpay_signature(raw_payload, "invalid_bogus_signature_hex") is False
