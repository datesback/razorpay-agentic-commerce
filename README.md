1. Project Title
Razorpay In-Chat Agentic Commerce Engine (RAC Engine)
(Alternative Simple Title: Autonomous In-Chat Checkout with LangGraph & Razorpay)
2. Project Objective
Build an autonomous AI shopping agent that allows customers to discover products, apply discounts, and complete payments directly inside a chat thread (WhatsApp, Instagram, web chat).
Eliminate external browser redirects by integrating Razorpay Smart Payment Links and instant in-chat checkout modals.
Maintain strict PCI-DSS Level 1 compliance so sensitive card or payment details are never exposed to the AI model or chat logs.
3. Why We Are Solving This Problem
85%+ Cart Abandonment: Most shoppers drop off when they are forced to leave their chat conversation to fill out external web checkout forms.
Friction & Lost Context: Switching browser tabs, typing passwords, and re-entering addresses causes high checkout fatigue (averaging 3.5 minutes per order).
Security & Compliance Risk: Simple chatbots that ask customers for credit card numbers or UPI MPINs in chat violate banking regulations and create severe fraud risks.
Lost Revenue for D2C Brands: Businesses spend heavily to acquire chat leads, but fail to convert them due to clumsy checkout handoffs.
4. How We Are Solving This Problem
LangGraph State Machine: Uses a compiled 5-node agent state graph (IDLE → CART_REVIEW → PAYMENT_PENDING → CAPTURED) to keep conversation flow deterministic and reliable.
Zero-Hallucination Catalog: Connects directly to an inventory database (SQLite) so product stock and prices are verified in real time before checkout.
Deterministic Coupon Engine: Accurately calculates promotional discounts (e.g., RAZORPAY10 capped at ₹500, WELCOME50 on ₹499+ carts).
Razorpay Smart Payment Links: Calls Razorpay's REST API to create an official order and generate an encrypted, 15-minute expiring payment link.
In-Chat Modal Checkout: Displays an action card in chat that launches Razorpay’s Level-1 PCI-certified Standard Checkout modal (UPI QR, Cards, NetBanking).
PCI-DSS Guardrail Interceptor: Automatically detects and redacts any card numbers or CVVs typed into chat before the message ever reaches the AI.
HMAC-SHA256 Webhook Verification: Verifies payment completion cryptographically using constant-time signature matching before updating inventory and confirming the order.
