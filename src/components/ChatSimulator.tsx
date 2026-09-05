import React, { useState, useRef, useEffect } from 'react';
import { 
  Send, 
  RotateCcw, 
  ShieldAlert, 
  ExternalLink, 
  Tag, 
  CheckCircle2, 
  Clock, 
  Sparkles, 
  ArrowRight,
  ShieldCheck,
  AlertTriangle,
  Radio,
  FileCode,
  Copy,
  Check
} from 'lucide-react';
import { AgentState, ChatMessage, CartItem, AppliedDiscount } from '../types';
import { CATALOG_PRODUCTS } from '../data/catalog';
import { RazorpayModal } from './RazorpayModal';

export const ChatSimulator: React.FC = () => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome',
      role: 'assistant',
      content: 
        `👋 **Welcome to RAC Store!** I am your Razorpay In-Chat Agentic Commerce Assistant.\n\n` +
        `I guide you through product discovery, live stock verification, promo discounts (` +
        `\`RAZORPAY10\` for 10% off, \`WELCOME50\` for flat ₹50 off), and instant Razorpay Smart Payment Links without leaving chat.\n\n` +
        `Try asking for products like *"Show wireless earbuds"*, *"Find water-repellent pants"*, or click one of the quick test actions below.`,
      timestamp: 'Just now',
    }
  ]);

  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [copiedOrderId, setCopiedOrderId] = useState(false);

  // Central Agent State
  const [agentState, setAgentState] = useState<AgentState>({
    sessionId: `rac_sess_${Math.random().toString(36).substring(2, 9)}`,
    customerInfo: {},
    activeCart: null,
    appliedDiscount: null,
    razorpayOrderId: null,
    paymentLinkUrl: null,
    transactionStatus: 'IDLE',
    currentIntent: 'DISCOVERY',
    guardrailViolation: null,
  });

  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  // Handle User Input Submission
  const handleSendMessage = (textToSend?: string) => {
    const messageText = (textToSend !== undefined ? textToSend : input).trim();
    if (!messageText) return;

    if (!textToSend) setInput('');

    // Append User Message
    const userMsg: ChatMessage = {
      id: `user_${Date.now()}`,
      role: 'user',
      content: messageText,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setIsTyping(true);

    // Execute Simulated LangGraph State Machine
    setTimeout(() => {
      processAgentTurn(messageText);
      setIsTyping(false);
    }, 450);
  };

  // State Machine Turn Execution (Faithful mirror of app/graph/nodes.py)
  const processAgentTurn = (userText: string) => {
    const textLower = userText.toLowerCase();
    const nextState = { ...agentState };

    // 1. PCI-DSS Guardrail Detection
    const cardMatch = userText.match(/\b(?:\d[ -]*?){13,19}\b/);
    const cvvMatch = userText.match(/\b(?:cvv|cvc)[\s:]*([0-9]{3,4})\b/i) || (textLower.includes('cvv') && userText.match(/\b\d{3,4}\b/));
    const pinMatch = userText.match(/\b(?:upi pin|mpin|pin)[\s:]*([0-9]{4,6})\b/i);

    if (cardMatch || cvvMatch || pinMatch) {
      nextState.currentIntent = 'GUARDRAIL_TRIGGERED';
      nextState.guardrailViolation = 
        'PCI-DSS Compliance Rule: Card credentials, CVVs, and UPI PINs cannot be accepted in chat. ' +
        'Razorpay handles tokenization securely inside encrypted checkout modals.';
      
      setAgentState(nextState);
      setMessages((prev) => [
        ...prev,
        {
          id: `guardrail_${Date.now()}`,
          role: 'assistant',
          content: 
            `🛡️ **Security Guardrail Triggered (PCI-DSS Level 1):**\n\n` +
            `For your protection, never share raw credit/debit card numbers, CVVs, or UPI PINs in chat.\n\n` +
            `All payment credentials are tokenized directly within official Razorpay encrypted checkout screens. ` +
            `No sensitive financial data is ever stored on this server.`,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          isGuardrailAlert: true,
        }
      ]);
      return;
    }

    // 2. Parse Contact Info
    const phoneMatch = userText.match(/(?:\+91[\-\s]?)?[6-9]\d{9}/);
    const emailMatch = userText.match(/[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+/);
    if (phoneMatch || emailMatch) {
      nextState.customerInfo = {
        ...nextState.customerInfo,
        phone: phoneMatch ? phoneMatch[0].replace(/[\s-]/g, '') : nextState.customerInfo.phone,
        email: emailMatch ? emailMatch[0] : nextState.customerInfo.email,
      };
    }

    // 3. Check Coupon Intent
    if (textLower.includes('coupon') || textLower.includes('razorpay10') || textLower.includes('welcome50')) {
      nextState.currentIntent = 'APPLY_DISCOUNT';
      if (!nextState.activeCart) {
        setMessages((prev) => [
          ...prev,
          {
            id: `msg_${Date.now()}`,
            role: 'assistant',
            content: 'Your cart is currently empty! Please add an item to your cart before applying promo codes.',
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          }
        ]);
        setAgentState(nextState);
        return;
      }

      if (textLower.includes('razorpay10')) {
        const subtotal = nextState.activeCart.subtotal;
        const discountAmount = Math.min(500, Math.round(subtotal * 0.10 * 100) / 100);
        const finalAmount = Math.max(0, subtotal - discountAmount);
        const applied: AppliedDiscount = {
          code: 'RAZORPAY10',
          discount_amount: discountAmount,
          discountAmount,
          discountPercentage: 10,
          final_amount: finalAmount,
          finalAmount,
          message: `Coupon RAZORPAY10 applied! You saved ₹${discountAmount.toFixed(2)} (10% off up to ₹500).`,
        };
        nextState.appliedDiscount = applied;
        setAgentState(nextState);
        setMessages((prev) => [
          ...prev,
          {
            id: `msg_${Date.now()}`,
            role: 'assistant',
            content: 
              `🎉 **Coupon Applied Successfully!**\n\n` +
              `• **Code:** \`RAZORPAY10\`\n` +
              `• **Original Subtotal:** ₹${subtotal.toLocaleString('en-IN', { minimumFractionDigits: 2 })}\n` +
              `• **Discount:** -₹${discountAmount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}\n` +
              `• **Payable Total:** **₹${finalAmount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}**\n\n` +
              `Say *"Proceed to checkout"* or click the checkout quick action to generate your Razorpay Smart Link.`,
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            discountSnapshot: applied,
          }
        ]);
        return;
      } else if (textLower.includes('welcome50')) {
        const subtotal = nextState.activeCart.subtotal;
        if (subtotal < 499) {
          setMessages((prev) => [
            ...prev,
            {
              id: `msg_${Date.now()}`,
              role: 'assistant',
              content: `⚠️ Coupon \`WELCOME50\` requires a minimum cart subtotal of ₹499.00. (Current cart: ₹${subtotal.toFixed(2)})`,
              timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            }
          ]);
          setAgentState(nextState);
          return;
        }
        const discountAmount = 50.0;
        const finalAmount = Math.max(0, subtotal - discountAmount);
        const applied: AppliedDiscount = {
          code: 'WELCOME50',
          discount_amount: discountAmount,
          discountAmount,
          final_amount: finalAmount,
          finalAmount,
          message: `Coupon WELCOME50 applied! Flat ₹50 discount added.`,
        };
        nextState.appliedDiscount = applied;
        setAgentState(nextState);
        setMessages((prev) => [
          ...prev,
          {
            id: `msg_${Date.now()}`,
            role: 'assistant',
            content: 
              `🎉 **Coupon Applied Successfully!**\n\n` +
              `• **Code:** \`WELCOME50\`\n` +
              `• **Original Subtotal:** ₹${subtotal.toLocaleString('en-IN', { minimumFractionDigits: 2 })}\n` +
              `• **Discount:** -₹50.00\n` +
              `• **Payable Total:** **₹${finalAmount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}**`,
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            discountSnapshot: applied,
          }
        ]);
        return;
      } else {
        setMessages((prev) => [
          ...prev,
          {
            id: `msg_${Date.now()}`,
            role: 'assistant',
            content: `⚠️ Unknown coupon code. Available promotional coupons are \`RAZORPAY10\` (10% off up to ₹500) and \`WELCOME50\` (flat ₹50 off).`,
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          }
        ]);
        setAgentState(nextState);
        return;
      }
    }

    // 4. Check Checkout Intent
    const checkoutKeywords = ['checkout', 'pay', 'buy now', 'place order', 'generate link', 'confirm order', 'pay now'];
    if (checkoutKeywords.some((w) => textLower.includes(w))) {
      nextState.currentIntent = 'CHECKOUT';

      if (!nextState.activeCart) {
        setMessages((prev) => [
          ...prev,
          {
            id: `msg_${Date.now()}`,
            role: 'assistant',
            content: 'Your cart is empty! Please add a product to your cart first (e.g. *"Add RAC-ELEC-001 to cart"*).',
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          }
        ]);
        setAgentState(nextState);
        return;
      }

      // Check Contact Details
      const phone = nextState.customerInfo.phone;
      const email = nextState.customerInfo.email;

      if (!phone || !email) {
        setMessages((prev) => [
          ...prev,
          {
            id: `msg_${Date.now()}`,
            role: 'assistant',
            content: 
              `📋 **Customer Details Needed for Razorpay Checkout:**\n\n` +
              `To dispatch your secure Razorpay Payment Link and SMS receipt, please provide:\n` +
              (!phone ? `• Your 10-digit mobile number\n` : '') +
              (!email ? `• Your email address\n` : '') +
              `\n*Example:* *"My phone is 9876543210 and email is customer@example.com"*`,
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          }
        ]);
        nextState.transactionStatus = 'CART_REVIEW';
        setAgentState(nextState);
        return;
      }

      // Generate Razorpay Order & Smart Payment Link
      const orderId = `order_${Math.random().toString(36).substring(2, 11)}`;
      const paymentUrl = `https://rzp.io/i/rac_${orderId.slice(-6)}`;
      const payable = nextState.appliedDiscount ? nextState.appliedDiscount.finalAmount : nextState.activeCart.subtotal;

      nextState.razorpayOrderId = orderId;
      nextState.paymentLinkUrl = paymentUrl;
      nextState.transactionStatus = 'PAYMENT_PENDING';

      setAgentState(nextState);
      setMessages((prev) => [
        ...prev,
        {
          id: `msg_${Date.now()}`,
          role: 'assistant',
          content: 
            `⚡ **Razorpay Smart Payment Link Dispatched!**\n\n` +
            `• **Order ID:** \`${orderId}\`\n` +
            `• **Item:** ${nextState.activeCart?.quantity}x ${nextState.activeCart?.name}\n` +
            `• **Total Payable:** **₹${payable.toLocaleString('en-IN', { minimumFractionDigits: 2 })}**\n` +
            `• **Expiry:** Valid for 15 minutes\n` +
            `• **Delivery To:** ${phone} | ${email}\n\n` +
            `Click the secure button below to launch the Razorpay Checkout modal:`,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          orderId,
          paymentUrl,
        }
      ]);
      return;
    }

    // 5. Check Verification Intent
    if (textLower.includes('verify') || textLower.includes('status') || textLower.includes('did payment') || textLower.includes('completed')) {
      nextState.currentIntent = 'VERIFY_PAYMENT';
      if (nextState.transactionStatus === 'CAPTURED') {
        setMessages((prev) => [
          ...prev,
          {
            id: `msg_${Date.now()}`,
            role: 'assistant',
            content: 
              `🎉 **Payment Already Verified & Captured!**\n\n` +
              `• Order ID: \`${nextState.razorpayOrderId || 'ORD-COMPLETE'}\`\n` +
              `• Status: **CAPTURED (PAID)**\n` +
              `• Estimated Delivery: 2-3 business days via Express Courier.\n\n` +
              `Would you like to explore other products today?`,
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          }
        ]);
        setAgentState(nextState);
        return;
      } else if (nextState.transactionStatus === 'PAYMENT_PENDING') {
        setMessages((prev) => [
          ...prev,
          {
            id: `msg_${Date.now()}`,
            role: 'assistant',
            content: 
              `⏳ **Payment Status: Pending**\n\n` +
              `Razorpay has not yet recorded a captured transaction for Order \`${nextState.razorpayOrderId}\`.\n\n` +
              `If you completed payment, click **"Simulate Webhook Capture"** in the sidebar or launch the payment link below:`,
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            orderId: nextState.razorpayOrderId || undefined,
            paymentUrl: nextState.paymentLinkUrl || undefined,
          }
        ]);
        setAgentState(nextState);
        return;
      }
    }

    // 6. Check Cart Update / SKU addition
    const skuMatch = userText.match(/RAC-[A-Z]+-\d{3}/i);
    const cartKeywords = ['add to cart', 'buy', 'order', 'get me', 'select', 'cart'];
    if (skuMatch || cartKeywords.some((w) => textLower.includes(w))) {
      nextState.currentIntent = 'CART_UPDATE';
      
      let matchedProduct = skuMatch 
        ? CATALOG_PRODUCTS.find((p) => p.sku.toLowerCase() === skuMatch[0].toLowerCase())
        : null;

      if (!matchedProduct) {
        // Search by keyword
        matchedProduct = CATALOG_PRODUCTS.find((p) => 
          textLower.includes(p.title.toLowerCase()) || 
          p.title.toLowerCase().split(' ').some((word) => word.length > 3 && textLower.includes(word))
        );
      }

      if (!matchedProduct) {
        matchedProduct = CATALOG_PRODUCTS[0]; // Fallback to AuraPods
      }

      const qtyMatch = userText.match(/\b(\d+)\s*(?:units?|pcs?|pieces?|items?|of)?\b/);
      const quantity = qtyMatch && parseInt(qtyMatch[1], 10) > 0 ? parseInt(qtyMatch[1], 10) : 1;

      // Inventory check
      if (quantity > matchedProduct.stock_quantity) {
        setMessages((prev) => [
          ...prev,
          {
            id: `msg_${Date.now()}`,
            role: 'assistant',
            content: `⚠️ **Stock Warning:** Only ${matchedProduct.stock_quantity} units available for ${matchedProduct.title}. Please choose a smaller quantity.`,
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          }
        ]);
        setAgentState(nextState);
        return;
      }

      const subtotal = matchedProduct.price_inr * quantity;
      const cartItem: CartItem = {
        sku: matchedProduct.sku,
        name: matchedProduct.title,
        unit_price: matchedProduct.price_inr,
        quantity,
        subtotal,
      };

      nextState.activeCart = cartItem;
      nextState.transactionStatus = 'CART_REVIEW';

      // Recalculate discount if already present
      let discountMsg = '';
      if (nextState.appliedDiscount) {
        if (nextState.appliedDiscount.code === 'RAZORPAY10') {
          const disc = Math.min(500, Math.round(subtotal * 0.10 * 100) / 100);
          nextState.appliedDiscount.discountAmount = disc;
          nextState.appliedDiscount.finalAmount = subtotal - disc;
          discountMsg = `\n🏷️ Coupon RAZORPAY10: -₹${disc.toFixed(2)} | **Total: ₹${nextState.appliedDiscount.finalAmount.toFixed(2)}**`;
        }
      }

      setAgentState(nextState);
      setMessages((prev) => [
        ...prev,
        {
          id: `msg_${Date.now()}`,
          role: 'assistant',
          content: 
            `🛒 **Cart Updated!**\n\n` +
            `• **Product:** ${matchedProduct.title} (\`${matchedProduct.sku}\`)\n` +
            `• **Quantity:** ${quantity} unit(s)\n` +
            `• **Unit Price:** ₹${matchedProduct.price_inr.toLocaleString('en-IN', { minimumFractionDigits: 2 })}\n` +
            `• **Subtotal:** ₹${subtotal.toLocaleString('en-IN', { minimumFractionDigits: 2 })}` +
            discountMsg + `\n\n` +
            `You can apply coupon **\`RAZORPAY10\`** (10% off) or say **\"Proceed to checkout\"**!`,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          cartSnapshot: cartItem,
        }
      ]);
      return;
    }

    // 7. Product Discovery Default
    nextState.currentIntent = 'DISCOVERY';
    let filtered = CATALOG_PRODUCTS.filter((p) => {
      const q = textLower;
      return (
        p.title.toLowerCase().includes(q) ||
        p.category.toLowerCase().includes(q) ||
        p.description.toLowerCase().includes(q)
      );
    });

    if (filtered.length === 0) {
      // Return top 3 recommendations
      filtered = CATALOG_PRODUCTS.slice(0, 3);
    } else {
      filtered = filtered.slice(0, 3);
    }

    let responseMarkdown = `Here are the top matches from our verified D2C catalog:\n\n`;
    filtered.forEach((p) => {
      responseMarkdown += 
        `• **${p.title}** (\`${p.sku}\`)\n` +
        `  💰 **₹${p.price_inr.toLocaleString('en-IN', { minimumFractionDigits: 2 })}** | 📦 Stock: ${p.stock_quantity} units\n` +
        `  📝 ${p.description}\n\n`;
    });
    responseMarkdown += 
      `💡 *To buy, say:* **\"Add ${filtered[0].sku} to cart\"** or **\"Buy 1 of ${filtered[0].title}\"**.\n` +
      `✨ *Coupon Available:* \`RAZORPAY10\` (10% off up to ₹500).`;

    setAgentState(nextState);
    setMessages((prev) => [
      ...prev,
      {
        id: `msg_${Date.now()}`,
        role: 'assistant',
        content: responseMarkdown,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      }
    ]);
  };

  // Webhook Simulation Handlers
  const handleSimulateWebhook = (eventType: 'payment.captured' | 'payment.failed') => {
    if (eventType === 'payment.captured') {
      const paymentId = `pay_wh_${Math.random().toString(36).substring(2, 9)}`;
      setAgentState((prev) => ({
        ...prev,
        transactionStatus: 'CAPTURED',
      }));

      setMessages((prev) => [
        ...prev,
        {
          id: `wh_${Date.now()}`,
          role: 'system',
          content: 
            `📡 **[Webhook Event Received]** \`payment.captured\`\n` +
            `• Signature: \`HMAC-SHA256\` verified against \`RAZORPAY_WEBHOOK_SECRET\`\n` +
            `• Payment ID: \`${paymentId}\`\n` +
            `• Order ID: \`${agentState.razorpayOrderId || 'order_active'}\`\n` +
            `• Redis Session State: Updated to **CAPTURED**`,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        },
        {
          id: `fulfil_${Date.now()}`,
          role: 'assistant',
          content: 
            `🎉 **Payment Verified & Captured!**\n\n` +
            `• **Razorpay Payment ID:** \`${paymentId}\`\n` +
            `• **Order ID:** \`${agentState.razorpayOrderId || 'order_active'}\`\n` +
            `• **Confirmed Item:** ${agentState.activeCart?.quantity || 1}x ${agentState.activeCart?.name || 'AuraPods Pro'}\n` +
            `• **Delivery Estimate:** 2-3 business days via BlueDart Air Express.\n\n` +
            `An automated SMS receipt and email invoice have been dispatched to your contact details. Thank you for shopping with RAC Engine!`,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        }
      ]);
    } else {
      setAgentState((prev) => ({
        ...prev,
        transactionStatus: 'FAILED',
      }));
      setMessages((prev) => [
        ...prev,
        {
          id: `wh_fail_${Date.now()}`,
          role: 'system',
          content: 
            `📡 **[Webhook Event Received]** \`payment.failed\`\n` +
            `• Webhook HMAC Signature verified.\n` +
            `• Order \`${agentState.razorpayOrderId}\` marked as **FAILED** in database.\n` +
            `• Reason: Customer aborted payment or bank timeout.`,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        },
        {
          id: `fail_msg_${Date.now()}`,
          role: 'assistant',
          content: `⚠️ The payment attempt for order \`${agentState.razorpayOrderId}\` was not completed. You can retry with a new payment link by saying *"Generate new link"* or *"Retry checkout"*.`,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        }
      ]);
    }
  };

  const handleResetSession = () => {
    setAgentState({
      sessionId: `rac_sess_${Math.random().toString(36).substring(2, 9)}`,
      customerInfo: {},
      activeCart: null,
      appliedDiscount: null,
      razorpayOrderId: null,
      paymentLinkUrl: null,
      transactionStatus: 'IDLE',
      currentIntent: 'DISCOVERY',
      guardrailViolation: null,
    });
    setMessages([
      {
        id: 'welcome_reset',
        role: 'assistant',
        content: `Chat session reset! What product can I help you find in our D2C store today?`,
        timestamp: 'Just now',
      }
    ]);
  };

  const payableAmount = agentState.appliedDiscount 
    ? agentState.appliedDiscount.finalAmount 
    : (agentState.activeCart ? agentState.activeCart.subtotal : 3499);

  return (
    <div className="max-w-7xl mx-auto px-4 py-6 grid grid-cols-1 lg:grid-cols-12 gap-6">
      
      {/* Left / Main Chat Area (8 cols on desktop) */}
      <div className="lg:col-span-8 flex flex-col bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden h-[740px]">
        
        {/* Chat Header */}
        <div className="bg-slate-50 border-b border-slate-200 px-5 py-3.5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-3 w-3 rounded-full bg-emerald-500 animate-pulse"></div>
            <div>
              <h2 className="text-sm font-bold text-slate-800 flex items-center gap-2">
                RAC In-Chat Engine
                <span className="text-[10px] bg-indigo-50 text-indigo-700 border border-indigo-100 px-2 py-0.5 rounded font-mono font-semibold">
                  LangGraph Active
                </span>
              </h2>
              <p className="text-xs text-slate-500 font-mono">
                Thread ID: {agentState.sessionId}
              </p>
            </div>
          </div>

          <button
            onClick={handleResetSession}
            title="Reset Chat Session"
            className="flex items-center gap-1.5 text-xs text-slate-600 hover:text-slate-900 bg-white hover:bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-200 transition-colors shadow-2xs cursor-pointer font-medium"
          >
            <RotateCcw className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">Reset Session</span>
          </button>
        </div>

        {/* Message Thread */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4 bg-slate-50/40">
          {messages.map((msg) => {
            const isUser = msg.role === 'user';
            const isSystem = msg.role === 'system';

            if (isSystem) {
              return (
                <div key={msg.id} className="p-3 bg-slate-900 border border-slate-800 rounded-xl font-mono text-xs text-slate-200 shadow-xs">
                  <div className="flex items-center gap-1.5 text-indigo-400 font-semibold mb-1">
                    <Radio className="h-3.5 w-3.5 animate-pulse" />
                    System Telemetry Log
                  </div>
                  <div className="whitespace-pre-wrap">{msg.content}</div>
                </div>
              );
            }

            return (
              <div
                key={msg.id}
                className={`flex gap-3 ${isUser ? 'justify-end' : 'justify-start'}`}
              >
                {!isUser && (
                  <div className={`h-8 w-8 rounded-full flex-shrink-0 flex items-center justify-center font-bold text-xs ${
                    msg.isGuardrailAlert 
                      ? 'bg-amber-500 text-white' 
                      : 'bg-indigo-600 text-white shadow-xs'
                  }`}>
                    {msg.isGuardrailAlert ? <ShieldAlert className="h-4 w-4" /> : 'RAC'}
                  </div>
                )}

                <div
                  className={`max-w-[85%] rounded-2xl p-4 text-sm leading-relaxed ${
                    isUser
                      ? 'bg-indigo-600 text-white rounded-tr-none shadow-sm'
                      : msg.isGuardrailAlert
                      ? 'bg-amber-50 border border-amber-200 text-amber-900 rounded-tl-none shadow-xs'
                      : 'bg-white text-slate-800 border border-slate-200/80 rounded-tl-none shadow-xs'
                  }`}
                >
                  <div className="whitespace-pre-wrap">{msg.content}</div>

                  {/* Payment Card CTA if present */}
                  {msg.paymentUrl && (
                    <div className="mt-4 p-4 bg-white border border-indigo-200 rounded-xl shadow-xs text-sm space-y-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="h-2 w-2 rounded-full bg-emerald-500 animate-ping"></span>
                          <span className="text-xs font-bold text-indigo-900">Razorpay Smart Payment Link Ready</span>
                        </div>
                        <span className="text-[10px] text-slate-500 font-mono font-medium">15m Expiry</span>
                      </div>

                      <div className="text-xs text-slate-600">
                        Official encrypted checkout link generated for Order <span className="font-mono text-slate-900 font-bold">{msg.orderId}</span>.
                      </div>

                      <div className="flex items-center gap-2 pt-1">
                        <button
                          onClick={() => setIsModalOpen(true)}
                          className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2.5 px-4 rounded-lg text-xs flex items-center justify-center gap-2 shadow-xs transition-all cursor-pointer active:scale-95"
                        >
                          <span>⚡ Pay Securely via Razorpay</span>
                          <ExternalLink className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </div>
                  )}

                  <div className={`text-[10px] mt-2 text-right ${isUser ? 'text-indigo-100' : 'text-slate-400'}`}>
                    {msg.timestamp}
                  </div>
                </div>

                {isUser && (
                  <div className="h-8 w-8 rounded-full bg-indigo-100 flex-shrink-0 flex items-center justify-center font-bold text-[11px] text-indigo-700 uppercase">
                    You
                  </div>
                )}
              </div>
            );
          })}

          {isTyping && (
            <div className="flex gap-3 justify-start items-center">
              <div className="h-8 w-8 rounded-full bg-indigo-600 flex items-center justify-center font-bold text-xs text-white">
                RAC
              </div>
              <div className="bg-white border border-slate-200 text-slate-600 px-4 py-3 rounded-2xl rounded-tl-none text-xs flex items-center gap-1.5 shadow-2xs">
                <span className="h-2 w-2 rounded-full bg-indigo-500 animate-bounce"></span>
                <span className="h-2 w-2 rounded-full bg-indigo-500 animate-bounce [animation-delay:0.2s]"></span>
                <span className="h-2 w-2 rounded-full bg-indigo-500 animate-bounce [animation-delay:0.4s]"></span>
                <span className="ml-2 font-mono text-[11px] text-slate-500">LangGraph evaluating intent...</span>
              </div>
            </div>
          )}

          <div ref={chatEndRef} />
        </div>

        {/* Quick Action Prompt Chips */}
        <div className="px-4 py-2.5 bg-slate-50 border-t border-slate-200 overflow-x-auto scrollbar-none flex gap-2">
          <button
            onClick={() => handleSendMessage('Show wireless earbuds and audio')}
            className="text-xs whitespace-nowrap bg-white hover:bg-slate-100 text-slate-700 px-3 py-1.5 rounded-lg border border-slate-200 transition-colors font-medium shadow-2xs cursor-pointer"
          >
            🎧 Show Earbuds (Discovery)
          </button>
          <button
            onClick={() => handleSendMessage('Add 2 of RAC-ELEC-001 to cart')}
            className="text-xs whitespace-nowrap bg-white hover:bg-slate-100 text-slate-700 px-3 py-1.5 rounded-lg border border-slate-200 transition-colors font-medium shadow-2xs cursor-pointer"
          >
            🛒 Add 2x AuraPods (Cart)
          </button>
          <button
            onClick={() => handleSendMessage('Apply coupon RAZORPAY10')}
            className="text-xs whitespace-nowrap bg-indigo-50 hover:bg-indigo-100 text-indigo-700 px-3 py-1.5 rounded-lg border border-indigo-200 transition-colors font-semibold cursor-pointer"
          >
            🏷️ Apply RAZORPAY10 (10% Off)
          </button>
          <button
            onClick={() => handleSendMessage('Checkout now. My phone is 9876543210 and email is shopper@example.com')}
            className="text-xs whitespace-nowrap bg-emerald-50 hover:bg-emerald-100 text-emerald-700 px-3 py-1.5 rounded-lg border border-emerald-200 transition-colors font-semibold cursor-pointer"
          >
            ⚡ Checkout & Generate Link
          </button>
          <button
            onClick={() => handleSendMessage('Here is my card 4111 2222 3333 4444 and cvv 999 to pay')}
            className="text-xs whitespace-nowrap bg-amber-50 hover:bg-amber-100 text-amber-800 px-3 py-1.5 rounded-lg border border-amber-200 transition-colors font-semibold cursor-pointer"
          >
            🚨 Test PCI Guardrail (Send CVV)
          </button>
        </div>

        {/* Input Bar */}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSendMessage();
          }}
          className="p-4 bg-white border-t border-slate-200 flex gap-2"
        >
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask for products, add to cart, apply coupon, or say checkout..."
            className="flex-1 bg-slate-50 border border-slate-300 rounded-xl px-4 py-2.5 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:border-indigo-500 focus:bg-white transition-colors"
          />
          <button
            type="submit"
            disabled={!input.trim() || isTyping}
            className="bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white px-5 rounded-xl flex items-center justify-center transition-all cursor-pointer font-semibold shadow-xs"
          >
            <Send className="h-4 w-4" />
          </button>
        </form>

      </div>

      {/* Right / State Telemetry & Webhook Simulator Panel (4 cols on desktop) */}
      <div className="lg:col-span-4 space-y-5">
        
        {/* Agent State Inspector */}
        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold uppercase tracking-widest text-slate-400 flex items-center gap-2">
              <FileCode className="h-4 w-4 text-indigo-600" />
              Live LangGraph State
            </h3>
            
            <span className={`text-[11px] font-bold px-2.5 py-1 rounded-full ${
              agentState.transactionStatus === 'CAPTURED'
                ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                : agentState.transactionStatus === 'PAYMENT_PENDING'
                ? 'bg-amber-50 text-amber-700 border border-amber-200'
                : agentState.transactionStatus === 'CART_REVIEW'
                ? 'bg-indigo-50 text-indigo-700 border border-indigo-200'
                : 'bg-slate-100 text-slate-700 border border-slate-200'
            }`}>
              {agentState.transactionStatus}
            </span>
          </div>

          {/* Intent & Router Node */}
          <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-500">Current Node Intent:</span>
              <span className="font-mono font-bold text-indigo-600">{agentState.currentIntent || 'DISCOVERY'}</span>
            </div>
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-500">Session ID:</span>
              <span className="font-mono text-slate-700 truncate max-w-[140px]">{agentState.sessionId}</span>
            </div>
          </div>

          {/* Active Cart */}
          <div className="space-y-2">
            <div className="text-xs font-semibold text-slate-700 flex items-center justify-between">
              <span>Cart Summary</span>
              {agentState.activeCart && (
                <span className="text-[10px] bg-slate-100 text-slate-600 px-2 py-0.5 rounded font-mono border border-slate-200">
                  {agentState.activeCart.sku}
                </span>
              )}
            </div>

            {agentState.activeCart ? (
              <div className="bg-slate-50 rounded-xl p-3.5 border border-slate-200 text-xs space-y-2">
                <div className="font-bold text-slate-900">{agentState.activeCart.name}</div>
                <div className="flex justify-between text-slate-500">
                  <span>Quantity & Unit Price:</span>
                  <span className="text-slate-700">{agentState.activeCart.quantity}x @ ₹{agentState.activeCart.unit_price.toLocaleString('en-IN')}</span>
                </div>
                <div className="flex justify-between text-slate-500">
                  <span>Subtotal:</span>
                  <span className="font-semibold text-slate-800">₹{agentState.activeCart.subtotal.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
                </div>

                {agentState.appliedDiscount && (
                  <div className="flex justify-between text-emerald-700 pt-1 border-t border-slate-200 font-medium">
                    <span>Coupon ({agentState.appliedDiscount.code}):</span>
                    <span>-₹{agentState.appliedDiscount.discountAmount.toFixed(2)}</span>
                  </div>
                )}

                <div className="flex justify-between text-slate-900 font-bold pt-1 border-t border-slate-200 text-sm">
                  <span>Net Payable:</span>
                  <span className="text-indigo-600">
                    ₹{payableAmount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                  </span>
                </div>
              </div>
            ) : (
              <div className="text-xs text-slate-500 italic p-3 bg-slate-50 rounded-xl border border-slate-200 text-center">
                Cart is empty. Ask to add any item from catalog.
              </div>
            )}
          </div>

          {/* Verified Customer Contact */}
          <div className="space-y-1.5 text-xs">
            <span className="text-slate-500">Verified Contact Details:</span>
            <div className="grid grid-cols-2 gap-2">
              <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-200 text-slate-700">
                <div className="text-[10px] text-slate-400 uppercase font-medium">Phone</div>
                <div className="font-mono font-medium truncate">{agentState.customerInfo.phone || 'Not provided'}</div>
              </div>
              <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-200 text-slate-700">
                <div className="text-[10px] text-slate-400 uppercase font-medium">Email</div>
                <div className="font-mono font-medium truncate">{agentState.customerInfo.email || 'Not provided'}</div>
              </div>
            </div>
          </div>

          {/* Active Razorpay Order ID */}
          {agentState.razorpayOrderId && (
            <div className="p-3 bg-indigo-50/70 rounded-xl border border-indigo-100 space-y-1.5">
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-500">Active Order ID:</span>
                <span className="font-mono font-bold text-indigo-700">{agentState.razorpayOrderId}</span>
              </div>
              <button
                onClick={() => setIsModalOpen(true)}
                className="w-full bg-indigo-600 hover:bg-indigo-700 text-white py-1.5 px-3 rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 mt-2 transition-all cursor-pointer shadow-xs active:scale-95"
              >
                <span>Launch Razorpay Checkout Modal</span>
                <ExternalLink className="h-3 w-3" />
              </button>
            </div>
          )}

        </div>

        {/* Webhook HMAC Simulator */}
        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold uppercase tracking-widest text-slate-400 flex items-center gap-2">
              <Radio className="h-4 w-4 text-emerald-600" />
              Webhook HMAC-SHA256 Simulator
            </h3>
            <span className="text-[10px] bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded border border-emerald-200 font-semibold">
              Verified
            </span>
          </div>

          <p className="text-xs text-slate-500 leading-relaxed">
            Test instant asynchronous state reconciliation via simulated Razorpay webhook callbacks.
          </p>

          <div className="space-y-2">
            <button
              onClick={() => handleSimulateWebhook('payment.captured')}
              disabled={agentState.transactionStatus === 'CAPTURED'}
              className="w-full bg-emerald-600 hover:bg-emerald-700 disabled:opacity-40 text-white py-2.5 px-4 rounded-xl text-xs font-semibold flex items-center justify-center gap-2 shadow-xs transition-all cursor-pointer active:scale-95"
            >
              <CheckCircle2 className="h-4 w-4" />
              <span>Simulate Webhook: `payment.captured`</span>
            </button>

            <button
              onClick={() => handleSimulateWebhook('payment.failed')}
              className="w-full bg-white hover:bg-slate-50 text-slate-700 py-2 px-4 rounded-xl text-xs font-medium flex items-center justify-center gap-2 border border-slate-200 transition-all cursor-pointer"
            >
              <AlertTriangle className="h-4 w-4 text-amber-500" />
              <span>Simulate Webhook: `payment.failed`</span>
            </button>
          </div>

          <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-200 text-[11px] font-mono text-slate-600 space-y-1">
            <div className="text-slate-400 text-[10px] uppercase font-bold">HMAC Secret Check:</div>
            <div className="truncate">RAZORPAY_WEBHOOK_SECRET: rac_webhook_...</div>
            <div className="text-emerald-700 flex items-center gap-1 font-medium">
              <ShieldCheck className="h-3 w-3 text-emerald-600" />
              <span>Constant-time hmac.compare_digest active</span>
            </div>
          </div>
        </div>

        {/* Promo Code Reference Card */}
        <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm text-xs space-y-2">
          <div className="font-bold text-slate-700 flex items-center gap-1.5">
            <Tag className="h-3.5 w-3.5 text-indigo-600" />
            Promo Coupons Quick Reference
          </div>
          <div className="space-y-1.5 text-slate-600">
            <div className="flex justify-between items-center">
              <code className="text-indigo-700 font-bold bg-indigo-50 border border-indigo-100 px-1.5 py-0.5 rounded">RAZORPAY10</code>
              <span>10% off up to ₹500</span>
            </div>
            <div className="flex justify-between items-center">
              <code className="text-indigo-700 font-bold bg-indigo-50 border border-indigo-100 px-1.5 py-0.5 rounded">WELCOME50</code>
              <span>Flat ₹50 off (min. ₹499)</span>
            </div>
          </div>
        </div>

      </div>

      {/* Razorpay Checkout Modal Simulator */}
      <RazorpayModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        orderId={agentState.razorpayOrderId || 'order_demo_12345'}
        amountInr={payableAmount}
        productTitle={agentState.activeCart?.name || 'AuraPods Pro ANC Earbuds'}
        quantity={agentState.activeCart?.quantity || 1}
        customerPhone={agentState.customerInfo.phone || '9876543210'}
        customerEmail={agentState.customerInfo.email || 'shopper@example.com'}
        onPaymentSuccess={() => {
          handleSimulateWebhook('payment.captured');
        }}
      />

    </div>
  );
};
