/**
 * Types for Razorpay In-Chat Agentic Commerce Engine (RAC Engine)
 */

export interface Product {
  sku: string;
  title: string;
  category: 'electronics' | 'apparel' | 'home';
  price_inr: number;
  stock_quantity: number;
  description: string;
  specs: Record<string, string>;
}

export type TransactionStatus =
  | 'IDLE'
  | 'CART_REVIEW'
  | 'PAYMENT_PENDING'
  | 'CAPTURED'
  | 'FAILED';

export interface CartItem {
  sku: string;
  name: string;
  unit_price: number;
  quantity: number;
  subtotal: number;
}

export interface AppliedDiscount {
  code: string;
  discount_amount: number;
  discountAmount?: number;
  discount_percentage?: number;
  discountPercentage?: number;
  final_amount: number;
  finalAmount?: number;
  message: string;
}

export interface CustomerInfo {
  name?: string;
  phone?: string;
  email?: string;
}

export interface AgentState {
  sessionId: string;
  customerInfo: CustomerInfo;
  activeCart: CartItem | null;
  appliedDiscount: AppliedDiscount | null;
  razorpayOrderId: string | null;
  paymentLinkUrl: string | null;
  transactionStatus: TransactionStatus;
  currentIntent?: string;
  guardrailViolation?: string | null;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: string;
  orderId?: string;
  paymentUrl?: string;
  cartSnapshot?: CartItem | null;
  discountSnapshot?: AppliedDiscount | null;
  isGuardrailAlert?: boolean;
}

export interface RepoFile {
  path: string;
  name: string;
  language: string;
  category: 'app' | 'tools' | 'graph' | 'ui' | 'tests' | 'config' | 'docs';
  content: string;
  description: string;
}

export interface TestCase {
  id: string;
  suite: 'test_tools.py' | 'test_graph.py';
  name: string;
  description: string;
  status: 'passed' | 'failed' | 'pending' | 'running';
  durationMs: number;
  outputLog: string;
}
