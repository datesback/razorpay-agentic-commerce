"""
Razorpay Webhook Handler & Signature Verification Module.
Implements RFC-compliant HMAC-SHA256 signature verification for inbound
Razorpay webhook payloads, captures payment.captured and payment.failed events,
and syncs session memory and database records.
"""

import hmac
import hashlib
import json
from typing import Any, Dict, Tuple
import redis
from app.config import settings
from app.database import get_connection, save_order, get_order_by_id


def get_redis_client() -> Any:
    """Provides a Redis client instance with fallback handling."""
    try:
        r = redis.Redis.from_url(settings.REDIS_URL, decode_responses=True)
        # Test connection ping
        r.ping()
        return r
    except Exception:
        # Return None if Redis server is not running locally (sandbox fallback)
        return None


def verify_razorpay_signature(raw_body: bytes, signature_header: str) -> bool:
    """
    Validates X-Razorpay-Signature using HMAC-SHA256 against RAZORPAY_WEBHOOK_SECRET.

    Args:
        raw_body: Exact raw bytes of the incoming webhook HTTP request body
        signature_header: The value of the 'X-Razorpay-Signature' header

    Returns:
        True if signature matches, False otherwise.
    """
    if not signature_header or not settings.RAZORPAY_WEBHOOK_SECRET:
        return False

    secret_bytes = settings.RAZORPAY_WEBHOOK_SECRET.encode("utf-8")
    expected_mac = hmac.new(
        key=secret_bytes,
        msg=raw_body,
        digestmod=hashlib.sha256,
    ).hexdigest()

    return hmac.compare_digest(expected_mac, signature_header.strip())


def generate_mock_signature(raw_body: bytes, secret: str = None) -> str:
    """Helper method used by test suites and simulators to generate valid signatures."""
    key = (secret or settings.RAZORPAY_WEBHOOK_SECRET).encode("utf-8")
    return hmac.new(key=key, msg=raw_body, digestmod=hashlib.sha256).hexdigest()


def process_webhook_payload(
    raw_body: bytes,
    signature_header: str,
) -> Tuple[bool, str, Dict[str, Any]]:
    """
    Verifies signature and processes Razorpay webhook events.
    Supports events: 'payment.captured', 'payment.failed', 'order.paid'.

    Returns:
        (success: bool, status_message: str, parsed_event: dict)
    """
    is_valid = verify_razorpay_signature(raw_body, signature_header)
    
    try:
        payload = json.loads(raw_body.decode("utf-8"))
    except Exception as e:
        return False, f"Invalid JSON payload: {str(e)}", {}

    event_name = payload.get("event", "unknown")
    event_id = payload.get("id")

    # Record event in SQLite audit log
    try:
        conn = get_connection()
        cursor = conn.cursor()
        cursor.execute(
            """
            INSERT INTO webhook_events (event_id, event_type, payload_json, processed_status, signature_verified)
            VALUES (?, ?, ?, ?, ?)
            """,
            (
                event_id,
                event_name,
                json.dumps(payload),
                "VERIFIED" if is_valid else "SIGNATURE_FAILED",
                1 if is_valid else 0,
            ),
        )
        conn.commit()
        conn.close()
    except Exception:
        pass

    if not is_valid:
        return False, "Invalid Razorpay Webhook HMAC Signature", payload

    # Process events
    payment_entity = (
        payload.get("payload", {})
        .get("payment", {})
        .get("entity", {})
    )
    payment_id = payment_entity.get("id")
    razorpay_order_id = payment_entity.get("order_id")
    status = payment_entity.get("status")
    notes = payment_entity.get("notes", {})
    session_id = notes.get("session_id")

    # Update database order if order_id is present
    if razorpay_order_id:
        existing_order = get_order_by_id(razorpay_order_id)
        if existing_order:
            if event_name in ["payment.captured", "order.paid"] or status == "captured":
                existing_order["payment_status"] = "CAPTURED"
                existing_order["razorpay_payment_id"] = payment_id
            elif event_name == "payment.failed" or status == "failed":
                existing_order["payment_status"] = "FAILED"
            save_order(existing_order)

    # Sync Redis Session Memory for instant conversational awareness
    redis_client = get_redis_client()
    if redis_client and session_id:
        cache_key = f"rac:session:{session_id}"
        redis_client.hset(
            cache_key,
            mapping={
                "last_webhook_event": event_name,
                "payment_id": payment_id or "",
                "order_id": razorpay_order_id or "",
                "payment_status": "CAPTURED" if event_name == "payment.captured" else "FAILED",
            },
        )
        redis_client.expire(cache_key, settings.REDIS_SESSION_TTL_SECONDS)

    return True, f"Event {event_name} processed successfully", {
        "event": event_name,
        "payment_id": payment_id,
        "order_id": razorpay_order_id,
        "status": status,
        "session_id": session_id,
    }
