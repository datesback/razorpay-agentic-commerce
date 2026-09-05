import React, { useState } from 'react';
import { 
  ShieldCheck, 
  X, 
  QrCode, 
  CreditCard, 
  Smartphone, 
  Building2, 
  Lock, 
  CheckCircle2, 
  ExternalLink 
} from 'lucide-react';

interface RazorpayModalProps {
  isOpen: boolean;
  onClose: () => void;
  orderId: string;
  amountInr: number;
  productTitle: string;
  quantity: number;
  customerPhone: string;
  customerEmail: string;
  onPaymentSuccess: (paymentId: string) => void;
}

export const RazorpayModal: React.FC<RazorpayModalProps> = ({
  isOpen,
  onClose,
  orderId,
  amountInr,
  productTitle,
  quantity,
  customerPhone,
  customerEmail,
  onPaymentSuccess,
}) => {
  const [selectedMethod, setSelectedMethod] = useState<'upi' | 'card' | 'netbanking'>('upi');
  const [isProcessing, setIsProcessing] = useState(false);

  if (!isOpen) return null;

  const handleSimulatePayment = () => {
    setIsProcessing(true);
    setTimeout(() => {
      setIsProcessing(false);
      const paymentId = `pay_${Math.random().toString(36).substring(2, 11)}`;
      onPaymentSuccess(paymentId);
      onClose();
    }, 1200);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white text-slate-900 rounded-2xl w-full max-w-md shadow-xl overflow-hidden border border-slate-200">
        
        {/* Top Razorpay Header */}
        <div className="bg-slate-900 text-white p-5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-xl bg-indigo-600 flex items-center justify-center font-black text-white text-base shadow-2xs">
              R
            </div>
            <div>
              <h3 className="font-bold text-sm tracking-tight text-white flex items-center gap-1.5">
                Razorpay Trusted Business
                <ShieldCheck className="h-4 w-4 text-emerald-400" />
              </h3>
              <p className="text-xs text-slate-300">RAC D2C Storefront</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-white/10 transition-colors cursor-pointer"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Order Summary Ribbon */}
        <div className="bg-slate-50 border-b border-slate-200 px-5 py-3 flex items-center justify-between">
          <div>
            <div className="text-xs text-slate-500 font-medium">Order ID: {orderId}</div>
            <div className="text-xs font-semibold text-slate-800 truncate max-w-[220px]">
              {quantity}x {productTitle}
            </div>
          </div>
          <div className="text-right">
            <div className="text-xs text-slate-400 font-medium">Total Payable</div>
            <div className="text-lg font-black text-slate-900">
              ₹{amountInr.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
            </div>
          </div>
        </div>

        {/* Contact Strip */}
        <div className="px-5 py-2.5 bg-indigo-50/70 border-b border-indigo-100 flex items-center justify-between text-xs text-indigo-900">
          <span className="truncate">Contact: {customerPhone || '9876543210'}</span>
          <span className="truncate">{customerEmail || 'shopper@example.com'}</span>
        </div>

        {/* Payment Methods */}
        <div className="p-5 space-y-4">
          <div className="text-xs font-bold uppercase tracking-wider text-slate-400">
            Select Payment Method
          </div>

          <div className="grid grid-cols-3 gap-2">
            <button
              onClick={() => setSelectedMethod('upi')}
              className={`flex flex-col items-center gap-1.5 p-3 rounded-xl border text-xs font-semibold transition-all cursor-pointer ${
                selectedMethod === 'upi'
                  ? 'border-indigo-600 bg-indigo-50/60 text-indigo-950 shadow-2xs'
                  : 'border-slate-200 text-slate-600 hover:bg-slate-50'
              }`}
            >
              <Smartphone className="h-5 w-5 text-indigo-600" />
              <span>UPI & QR</span>
            </button>

            <button
              onClick={() => setSelectedMethod('card')}
              className={`flex flex-col items-center gap-1.5 p-3 rounded-xl border text-xs font-semibold transition-all cursor-pointer ${
                selectedMethod === 'card'
                  ? 'border-indigo-600 bg-indigo-50/60 text-indigo-950 shadow-2xs'
                  : 'border-slate-200 text-slate-600 hover:bg-slate-50'
              }`}
            >
              <CreditCard className="h-5 w-5 text-indigo-600" />
              <span>Cards</span>
            </button>

            <button
              onClick={() => setSelectedMethod('netbanking')}
              className={`flex flex-col items-center gap-1.5 p-3 rounded-xl border text-xs font-semibold transition-all cursor-pointer ${
                selectedMethod === 'netbanking'
                  ? 'border-indigo-600 bg-indigo-50/60 text-indigo-950 shadow-2xs'
                  : 'border-slate-200 text-slate-600 hover:bg-slate-50'
              }`}
            >
              <Building2 className="h-5 w-5 text-indigo-600" />
              <span>NetBanking</span>
            </button>
          </div>

          {/* Selected Method View */}
          {selectedMethod === 'upi' && (
            <div className="bg-slate-50 rounded-xl p-4 border border-slate-200 text-center space-y-3">
              <div className="inline-flex p-3 bg-white rounded-xl shadow-2xs border border-slate-200">
                <QrCode className="h-28 w-28 text-slate-800" />
              </div>
              <div className="text-xs text-slate-600">
                Scan with any UPI app: <strong>GPay, PhonePe, Paytm, CRED</strong>
              </div>
              <div className="flex items-center justify-center gap-2 text-[11px] font-bold text-slate-500">
                <span className="px-2 py-0.5 rounded bg-white border border-slate-200">GPay</span>
                <span className="px-2 py-0.5 rounded bg-white border border-slate-200">PhonePe</span>
                <span className="px-2 py-0.5 rounded bg-white border border-slate-200">Paytm</span>
                <span className="px-2 py-0.5 rounded bg-white border border-slate-200">BHIM</span>
              </div>
            </div>
          )}

          {selectedMethod === 'card' && (
            <div className="bg-slate-50 rounded-xl p-4 border border-slate-200 space-y-2.5">
              <div className="text-xs font-semibold text-slate-700 flex items-center justify-between">
                <span>Test Sandbox Card</span>
                <span className="text-[10px] bg-emerald-50 text-emerald-700 border border-emerald-200 px-2 py-0.5 rounded font-medium">PCI-DSS Tokenized</span>
              </div>
              <div className="bg-white p-3 rounded-lg border border-slate-200 font-mono text-xs text-slate-700">
                •••• •••• •••• 4242 &nbsp;|&nbsp; 12/28 &nbsp;|&nbsp; •••
              </div>
              <p className="text-[11px] text-slate-500">
                Zero sensitive card data touches chat. Tokenized exclusively in Razorpay’s secure vault.
              </p>
            </div>
          )}

          {selectedMethod === 'netbanking' && (
            <div className="bg-slate-50 rounded-xl p-4 border border-slate-200 space-y-2 text-xs">
              <div className="font-semibold text-slate-700">Popular Banks</div>
              <div className="grid grid-cols-2 gap-2">
                <div className="p-2 bg-white rounded border border-slate-200 font-medium text-slate-800">HDFC Bank</div>
                <div className="p-2 bg-white rounded border border-slate-200 font-medium text-slate-800">ICICI Bank</div>
                <div className="p-2 bg-white rounded border border-slate-200 font-medium text-slate-800">State Bank of India</div>
                <div className="p-2 bg-white rounded border border-slate-200 font-medium text-slate-800">Axis Bank</div>
              </div>
            </div>
          )}

          {/* Action Button */}
          <button
            onClick={handleSimulatePayment}
            disabled={isProcessing}
            className="w-full bg-indigo-600 hover:bg-indigo-700 text-white py-3 px-4 rounded-xl font-bold text-sm shadow-xs transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-95 disabled:opacity-75"
          >
            {isProcessing ? (
              <>
                <span className="h-4 w-4 rounded-full border-2 border-white border-t-transparent animate-spin"></span>
                <span>Authorizing with Razorpay...</span>
              </>
            ) : (
              <>
                <Lock className="h-4 w-4" />
                <span>Simulate Pay ₹{amountInr.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
              </>
            )}
          </button>

          {/* Compliance Footer */}
          <div className="flex items-center justify-center gap-2 text-[10px] text-slate-400">
            <Lock className="h-3 w-3" />
            <span>256-Bit SSL Encrypted • RBI & PCI-DSS Level 1 Compliant</span>
          </div>

        </div>

      </div>
    </div>
  );
};
