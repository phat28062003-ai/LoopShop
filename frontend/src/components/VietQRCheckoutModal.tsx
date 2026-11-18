import React, { useState } from 'react';
import { X, QrCode, CheckCircle2, Copy, Check, ShieldCheck, AlertCircle, Loader2, Ticket } from 'lucide-react';
import type { CartItem, Order } from '../types';
import type { AppliedVoucherInfo } from './CartModal';
import { api } from '../services/api';

interface VietQRCheckoutModalProps {
  isOpen: boolean;
  cart: CartItem[];
  onClose: () => void;
  onOrderSuccess: (order: Order) => void;
  appliedVoucher?: AppliedVoucherInfo | null;
}

export const VietQRCheckoutModal: React.FC<VietQRCheckoutModalProps> = ({
  isOpen,
  cart,
  onClose,
  onOrderSuccess,
  appliedVoucher = null,
}) => {
  const [step, setStep] = useState<'info' | 'qr' | 'done'>('info');
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [shippingAddress, setShippingAddress] = useState('');
  const [note, setNote] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [currentOrder, setCurrentOrder] = useState<Order | null>(null);

  // Copy status indicators
  const [copiedAccount, setCopiedAccount] = useState(false);
  const [copiedMemo, setCopiedMemo] = useState(false);
  const [copiedAmount, setCopiedAmount] = useState(false);
  const [qrMode, setQrMode] = useState<'card' | 'dynamic'>('card');

  if (!isOpen) return null;

  const totalAmount = cart.reduce(
    (sum, item) => sum + item.product.price * item.quantity,
    0
  );

  const discountAmount = appliedVoucher ? Math.min(appliedVoucher.discountAmount, totalAmount) : 0;
  const finalAmount = Math.max(0, totalAmount - discountAmount);

  const handleSubmitInfo = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!customerName.trim() || !customerPhone.trim() || !shippingAddress.trim()) {
      alert('Vui lòng điền đầy đủ họ tên, số điện thoại và địa chỉ giao hàng!');
      return;
    }

    try {
      setIsLoading(true);
      const itemsPayload = cart.map(i => ({
        product_id: i.product.id,
        product_title: i.product.title,
        price: i.product.price,
        quantity: i.quantity,
      }));

      const newOrder = await api.createOrder({
        customer_name: customerName,
        customer_phone: customerPhone,
        shipping_address: shippingAddress,
        total_amount: finalAmount,
        original_amount: totalAmount,
        discount_amount: discountAmount,
        voucher_code: appliedVoucher?.code || '',
        items: itemsPayload,
        note: note,
      });

      setCurrentOrder(newOrder);
      setStep('qr');
      onOrderSuccess(newOrder);
    } catch (err) {
      console.error(err);
      alert('Không thể tạo đơn hàng, vui lòng thử lại!');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopy = (text: string, type: 'acc' | 'memo' | 'amount') => {
    navigator.clipboard.writeText(text);
    if (type === 'acc') {
      setCopiedAccount(true);
      setTimeout(() => setCopiedAccount(false), 2000);
    } else if (type === 'memo') {
      setCopiedMemo(true);
      setTimeout(() => setCopiedMemo(false), 2000);
    } else if (type === 'amount') {
      setCopiedAmount(true);
      setTimeout(() => setCopiedAmount(false), 2000);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md animate-fade-in">
      <div 
        className="w-full max-w-md bg-neutral-900 text-white rounded-2xl overflow-hidden shadow-2xl border border-neutral-800 flex flex-col max-h-[92vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-neutral-800 bg-neutral-900/90">
          <div className="flex items-center space-x-2">
            <QrCode className="w-5 h-5 text-emerald-400" />
            <h3 className="font-bold text-sm text-neutral-100">
              {step === 'info' && 'Thông tin nhận hàng'}
              {step === 'qr' && 'Quét mã VietQR Chuyển khoản'}
              {step === 'done' && 'Đặt hàng thành công'}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full bg-neutral-800 hover:bg-neutral-700 text-neutral-400 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-4 overflow-y-auto space-y-4 flex-1">
          {step === 'info' && (
            <form onSubmit={handleSubmitInfo} className="space-y-3.5">
              <div className="bg-emerald-950/40 border border-emerald-800/60 p-3 rounded-xl flex items-start space-x-2.5">
                <ShieldCheck className="w-5 h-5 text-emerald-400 flex-shrink-0 mt-0.5" />
                <p className="text-xs text-emerald-200/90 leading-relaxed">
                  Cộng đồng khép kín & bảo mật. Bạn chỉ cần quét mã QR qua ứng dụng ngân hàng bất kỳ (VietQR Napas247), không mất phí giao dịch.
                </p>
              </div>

              <div>
                <label className="block text-xs font-semibold text-neutral-300 mb-1">
                  Họ và tên người nhận <span className="text-rose-400">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ví dụ: Nguyễn Văn A"
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  className="w-full bg-neutral-800 border border-neutral-700 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-emerald-500 transition-colors"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-neutral-300 mb-1">
                  Số điện thoại <span className="text-rose-400">*</span>
                </label>
                <input
                  type="tel"
                  required
                  placeholder="Ví dụ: 0901234567"
                  value={customerPhone}
                  onChange={(e) => setCustomerPhone(e.target.value)}
                  className="w-full bg-neutral-800 border border-neutral-700 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-emerald-500 transition-colors"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-neutral-300 mb-1">
                  Địa chỉ giao hàng chi tiết <span className="text-rose-400">*</span>
                </label>
                <textarea
                  required
                  rows={2}
                  placeholder="Số nhà, tên đường, phường/xã, quận/huyện, tỉnh/thành phố"
                  value={shippingAddress}
                  onChange={(e) => setShippingAddress(e.target.value)}
                  className="w-full bg-neutral-800 border border-neutral-700 rounded-xl px-3.5 py-2 text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-emerald-500 transition-colors resize-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-neutral-300 mb-1">
                  Ghi chú cho người bán / shipper
                </label>
                <input
                  type="text"
                  placeholder="Giao giờ hành chính, gọi trước khi giao..."
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  className="w-full bg-neutral-800 border border-neutral-700 rounded-xl px-3.5 py-2 text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-emerald-500 transition-colors"
                />
              </div>

              {/* Order Summary box */}
              <div className="p-3 bg-neutral-800/70 rounded-xl border border-neutral-700 space-y-1.5 text-xs">
                <div className="flex justify-between text-neutral-400">
                  <span>Số lượng sản phẩm:</span>
                  <span>{cart.reduce((c, i) => c + i.quantity, 0)} món</span>
                </div>
                {appliedVoucher && (
                  <>
                    <div className="flex justify-between text-neutral-400">
                      <span>Tạm tính giá gốc:</span>
                      <span>{totalAmount.toLocaleString('vi-VN')}₫</span>
                    </div>
                    <div className="flex justify-between text-emerald-400 font-semibold items-center">
                      <span className="flex items-center space-x-1">
                        <Ticket className="w-3.5 h-3.5" />
                        <span>Mã ưu đãi ({appliedVoucher.code}):</span>
                      </span>
                      <span>-{discountAmount.toLocaleString('vi-VN')}₫</span>
                    </div>
                  </>
                )}
                <div className="flex justify-between font-bold text-neutral-200 pt-1 border-t border-neutral-700/60">
                  <span>Số tiền chuyển khoản:</span>
                  <span className="text-sm font-extrabold text-orange-400">
                    {finalAmount.toLocaleString('vi-VN')}₫
                  </span>
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-3 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white font-bold text-xs flex items-center justify-center space-x-2 shadow-lg shadow-emerald-500/20 transition-all active:scale-95 disabled:opacity-50"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Đang tạo mã VietQR...</span>
                  </>
                ) : (
                  <>
                    <QrCode className="w-4 h-4" />
                    <span>Tạo mã QR Chuyển khoản</span>
                  </>
                )}
              </button>
            </form>
          )}

          {step === 'qr' && currentOrder && (
            <div className="space-y-4 text-center">
              {/* QR Mode Switcher */}
              <div className="flex items-center justify-center space-x-1.5 p-1 bg-neutral-950 rounded-xl border border-neutral-800 w-fit mx-auto text-xs">
                <button
                  type="button"
                  onClick={() => setQrMode('card')}
                  className={`px-3 py-1 rounded-lg font-semibold transition-all cursor-pointer ${
                    qrMode === 'card'
                      ? 'bg-gradient-to-r from-emerald-500 to-teal-600 text-white shadow-md'
                      : 'text-neutral-400 hover:text-white'
                  }`}
                >
                  Thẻ VietQR của Phát
                </button>
                <button
                  type="button"
                  onClick={() => setQrMode('dynamic')}
                  className={`px-3 py-1 rounded-lg font-semibold transition-all cursor-pointer ${
                    qrMode === 'dynamic'
                      ? 'bg-gradient-to-r from-emerald-500 to-teal-600 text-white shadow-md'
                      : 'text-neutral-400 hover:text-white'
                  }`}
                >
                  Mã QR Napas247 (Tự điền tiền)
                </button>
              </div>

              {/* VietQR Code Display */}
              <div className="bg-white p-3 rounded-2xl mx-auto w-fit shadow-2xl border-4 border-emerald-500/30 flex flex-col items-center">
                {qrMode === 'card' ? (
                  <img
                    src="/images/vietqr-phat.jpg"
                    alt="Thẻ VietQR Lu Tien Phat"
                    className="w-56 h-auto object-contain mx-auto rounded-lg"
                  />
                ) : (
                  <img
                    src={`https://img.vietqr.io/image/ICB-93287556868-compact2.png?amount=${currentOrder.total_amount}&addInfo=DON%20HANG%20${currentOrder.order_code}&accountName=LU%20TIEN%20PHAT`}
                    alt="VietQR Napas247 Code"
                    className="w-56 h-auto object-contain mx-auto"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = '/images/vietqr-phat.jpg';
                    }}
                  />
                )}
                <div className="mt-2 text-[11px] font-bold text-neutral-800 flex items-center space-x-1">
                  <span>LU TIEN PHAT</span>
                  <span>•</span>
                  <span className="font-mono text-emerald-700">93287556868</span>
                </div>
              </div>

              {currentOrder.voucher_code && Number(currentOrder.discount_amount) > 0 && (
                <div className="inline-flex items-center space-x-1 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-bold">
                  <Ticket className="w-3.5 h-3.5" />
                  <span>Đã áp dụng mã {currentOrder.voucher_code} (Tiết kiệm {Number(currentOrder.discount_amount).toLocaleString('vi-VN')}₫)</span>
                </div>
              )}

              <div className="text-xs text-neutral-400">
                Mở ứng dụng ngân hàng bất kỳ để quét mã và chuyển khoản
              </div>

              {/* Bank Details Table */}
              <div className="bg-neutral-800/80 rounded-xl p-3 border border-neutral-700 text-left space-y-2 text-xs">
                <div className="flex justify-between items-center py-1 border-b border-neutral-700/60">
                  <span className="text-neutral-400">Ngân hàng:</span>
                  <span className="font-bold text-white">VietinBank (Ngân hàng TMCP Công Thương)</span>
                </div>

                <div className="flex justify-between items-center py-1 border-b border-neutral-700/60">
                  <span className="text-neutral-400">Chủ tài khoản:</span>
                  <span className="font-bold text-white uppercase">{currentOrder.account_name || 'LU TIEN PHAT'}</span>
                </div>

                <div className="flex justify-between items-center py-1 border-b border-neutral-700/60">
                  <span className="text-neutral-400">Số tài khoản:</span>
                  <div className="flex items-center space-x-1.5">
                    <span className="font-mono font-bold text-amber-300">{currentOrder.account_no || '93287556868'}</span>
                    <button
                      onClick={() => handleCopy(currentOrder.account_no || '93287556868', 'acc')}
                      className="p-1 hover:bg-neutral-700 rounded text-neutral-400 hover:text-white transition-colors"
                      title="Sao chép số tài khoản"
                    >
                      {copiedAccount ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                </div>

                <div className="flex justify-between items-center py-1 border-b border-neutral-700/60">
                  <span className="text-neutral-400">Số tiền:</span>
                  <div className="flex items-center space-x-1.5">
                    <span className="font-bold text-emerald-400">
                      {Number(currentOrder.total_amount).toLocaleString('vi-VN')}₫
                    </span>
                    <button
                      onClick={() => handleCopy(String(currentOrder.total_amount), 'amount')}
                      className="p-1 hover:bg-neutral-700 rounded text-neutral-400 hover:text-white transition-colors"
                      title="Sao chép số tiền"
                    >
                      {copiedAmount ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                </div>

                <div className="flex justify-between items-center py-1">
                  <span className="text-neutral-400">Nội dung CK:</span>
                  <div className="flex items-center space-x-1.5">
                    <span className="font-mono font-bold text-rose-400">DON HANG {currentOrder.order_code}</span>
                    <button
                      onClick={() => handleCopy(`DON HANG ${currentOrder.order_code}`, 'memo')}
                      className="p-1 hover:bg-neutral-700 rounded text-neutral-400 hover:text-white transition-colors"
                      title="Sao chép nội dung"
                    >
                      {copiedMemo ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                </div>
              </div>

              <div className="flex items-center space-x-2 text-[11px] text-amber-300/90 bg-amber-950/30 p-2.5 rounded-lg border border-amber-800/40 text-left">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                <span>
                  Vui lòng giữ nguyên <strong>Nội dung chuyển khoản</strong> để người bán và Admin đối soát nhanh chóng!
                </span>
              </div>

              <button
                onClick={() => setStep('done')}
                className="w-full py-3 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white font-bold text-xs flex items-center justify-center space-x-2 shadow-lg shadow-emerald-500/25 transition-all active:scale-95"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>Tôi đã chuyển khoản thành công</span>
              </button>
            </div>
          )}

          {step === 'done' && currentOrder && (
            <div className="py-8 flex flex-col items-center justify-center text-center space-y-4 animate-fade-in">
              <div className="w-16 h-16 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
                <CheckCircle2 className="w-10 h-10" />
              </div>

              <div className="space-y-1">
                <h4 className="text-base font-bold text-white">Đã ghi nhận đơn hàng!</h4>
                <p className="text-xs text-neutral-400">
                  Mã đơn hàng: <span className="font-mono text-emerald-400 font-bold">{currentOrder.order_code}</span>
                </p>
              </div>

              <p className="text-xs text-neutral-300 max-w-xs leading-relaxed bg-neutral-800/60 p-3 rounded-xl border border-neutral-700">
                Người bán (Phát Store) đang kiểm tra giao dịch VietQR và sẽ liên hệ giao hàng sớm nhất qua số điện thoại: <strong>{currentOrder.customer_phone}</strong>.
              </p>

              <button
                onClick={onClose}
                className="px-6 py-2.5 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-white text-xs font-semibold border border-neutral-700 transition-colors"
              >
                Tiếp tục xem video
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
