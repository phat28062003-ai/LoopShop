import React, { useState } from 'react';
import { X, Trash2, Plus, Minus, ArrowRight, ShoppingBag, Tag, Ticket, Check, AlertCircle, Loader2 } from 'lucide-react';
import type { CartItem } from '../types';
import { api } from '../services/api';

export interface AppliedVoucherInfo {
  code: string;
  discountAmount: number;
  finalAmount: number;
  title: string;
}

interface CartModalProps {
  isOpen: boolean;
  cart: CartItem[];
  onClose: () => void;
  onUpdateQuantity: (productId: number, newQty: number) => void;
  onRemoveItem: (productId: number) => void;
  onProceedCheckout: () => void;
  appliedVoucher?: AppliedVoucherInfo | null;
  onApplyVoucher?: (voucher: AppliedVoucherInfo | null) => void;
}

export const CartModal: React.FC<CartModalProps> = ({
  isOpen,
  cart,
  onClose,
  onUpdateQuantity,
  onRemoveItem,
  onProceedCheckout,
  appliedVoucher = null,
  onApplyVoucher,
}) => {
  const [voucherInput, setVoucherInput] = useState('');
  const [isApplying, setIsApplying] = useState(false);
  const [voucherMessage, setVoucherMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  if (!isOpen) return null;

  const totalAmount = cart.reduce(
    (sum, item) => sum + item.product.price * item.quantity,
    0
  );

  const discount = appliedVoucher ? Math.min(appliedVoucher.discountAmount, totalAmount) : 0;
  const finalPay = Math.max(0, totalAmount - discount);

  const quickVouchers = [
    { code: 'PHATVIP', label: '🔥 PHATVIP -30k', min: 200000 },
    { code: 'FREESHIP', label: '🚚 FREESHIP -25k', min: 150000 },
    { code: 'TIKTOK50K', label: '⚡ TIKTOK50K -50k', min: 350000 },
    { code: 'CHAOBANMOI', label: '🎁 CHAOBANMOI -20k', min: 100000 },
  ];

  const handleApply = async (codeToUse?: string) => {
    const code = (codeToUse || voucherInput).trim().toUpperCase();
    if (!code) {
      setVoucherMessage({ type: 'error', text: 'Vui lòng nhập mã giảm giá!' });
      return;
    }

    try {
      setIsApplying(true);
      setVoucherMessage(null);
      const res = await api.applyVoucher(code, totalAmount);
      if (res.valid) {
        if (onApplyVoucher) {
          onApplyVoucher({
            code: res.code || code,
            discountAmount: res.discount_amount,
            finalAmount: res.final_amount,
            title: res.title || code,
          });
        }
        setVoucherMessage({ type: 'success', text: res.message });
      } else {
        setVoucherMessage({ type: 'error', text: res.message });
      }
    } catch {
      setVoucherMessage({ type: 'error', text: 'Không thể kết nối để kiểm tra voucher.' });
    } finally {
      setIsApplying(false);
    }
  };

  const handleRemoveVoucher = () => {
    if (onApplyVoucher) onApplyVoucher(null);
    setVoucherInput('');
    setVoucherMessage(null);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fade-in">
      <div 
        className="w-full max-w-md bg-neutral-900 text-white rounded-2xl overflow-hidden shadow-2xl border border-neutral-800 flex flex-col max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-neutral-800 bg-neutral-900/90">
          <div className="flex items-center space-x-2">
            <ShoppingBag className="w-5 h-5 text-orange-500" />
            <h3 className="font-bold text-sm text-neutral-100">
              Giỏ hàng của bạn ({cart.length})
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full bg-neutral-800 hover:bg-neutral-700 text-neutral-400 hover:text-white transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Items List */}
        <div className="p-4 overflow-y-auto space-y-3 flex-1">
          {cart.length === 0 ? (
            <div className="py-12 flex flex-col items-center justify-center text-neutral-500 space-y-3">
              <ShoppingBag className="w-12 h-12 text-neutral-600" />
              <p className="text-sm">Giỏ hàng đang trống</p>
              <button
                onClick={onClose}
                className="text-xs text-orange-400 hover:underline font-semibold cursor-pointer"
              >
                Khám phá video và săn deal ngay
              </button>
            </div>
          ) : (
            <>
              {cart.map((item) => (
                <div
                  key={item.product.id}
                  className="flex items-center space-x-3 p-3 rounded-xl bg-neutral-800/60 border border-neutral-700/60"
                >
                  <img
                    src={item.product.image_url}
                    alt={item.product.title}
                    className="w-16 h-16 rounded-lg object-cover bg-neutral-800 flex-shrink-0"
                  />

                  <div className="flex-1 min-w-0">
                    <h4 className="text-xs font-medium text-white truncate">
                      {item.product.title}
                    </h4>
                    <p className="text-xs font-bold text-orange-400 mt-1">
                      {Number(item.product.price).toLocaleString('vi-VN')}₫
                    </p>

                    <div className="flex items-center justify-between mt-2">
                      <div className="flex items-center space-x-2 bg-neutral-900/80 rounded-md p-0.5 border border-neutral-700">
                        <button
                          onClick={() => onUpdateQuantity(item.product.id, item.quantity - 1)}
                          className="w-5 h-5 flex items-center justify-center text-neutral-300 hover:text-white cursor-pointer"
                        >
                          <Minus className="w-3 h-3" />
                        </button>
                        <span className="text-xs font-semibold px-1">{item.quantity}</span>
                        <button
                          onClick={() => onUpdateQuantity(item.product.id, item.quantity + 1)}
                          className="w-5 h-5 flex items-center justify-center text-neutral-300 hover:text-white cursor-pointer"
                        >
                          <Plus className="w-3 h-3" />
                        </button>
                      </div>

                      <button
                        onClick={() => onRemoveItem(item.product.id)}
                        className="text-neutral-500 hover:text-rose-400 p-1 transition-colors cursor-pointer"
                        title="Xóa sản phẩm"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}

              {/* Voucher Application Section */}
              <div className="mt-4 p-3.5 bg-neutral-950/70 rounded-xl border border-neutral-800 space-y-2.5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-1.5 text-xs font-bold text-amber-400">
                    <Ticket className="w-4 h-4" />
                    <span>Mã ưu đãi & Voucher LoopShop</span>
                  </div>
                  {appliedVoucher && (
                    <span className="text-[10px] bg-emerald-500/20 text-emerald-400 font-bold px-2 py-0.5 rounded-full border border-emerald-500/30">
                      Đã áp dụng
                    </span>
                  )}
                </div>

                {/* Input & Apply Button */}
                {!appliedVoucher ? (
                  <div className="flex space-x-2">
                    <div className="relative flex-1">
                      <Tag className="w-3.5 h-3.5 text-neutral-500 absolute left-3 top-1/2 -translate-y-1/2" />
                      <input
                        type="text"
                        placeholder="Nhập mã: PHATVIP, FREESHIP..."
                        value={voucherInput}
                        onChange={(e) => setVoucherInput(e.target.value.toUpperCase())}
                        className="w-full bg-neutral-900 border border-neutral-700 rounded-xl pl-8 pr-3 py-2 text-xs text-white uppercase placeholder-neutral-500 focus:outline-none focus:border-amber-500 transition-colors font-mono"
                      />
                    </div>
                    <button
                      onClick={() => handleApply()}
                      disabled={isApplying || !voucherInput.trim()}
                      className="px-3.5 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 disabled:opacity-50 text-black font-bold text-xs flex items-center space-x-1 transition-all active:scale-95 cursor-pointer"
                    >
                      {isApplying ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <span>Áp dụng</span>}
                    </button>
                  </div>
                ) : (
                  <div className="flex items-center justify-between p-2.5 rounded-lg bg-emerald-950/40 border border-emerald-700/60 text-xs">
                    <div className="flex items-center space-x-2">
                      <div className="w-6 h-6 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
                        <Check className="w-3.5 h-3.5" />
                      </div>
                      <div>
                        <span className="font-mono font-bold text-emerald-300">{appliedVoucher.code}</span>
                        <p className="text-[11px] text-emerald-400/90 font-medium">Giảm -{discount.toLocaleString('vi-VN')}₫</p>
                      </div>
                    </div>
                    <button
                      onClick={handleRemoveVoucher}
                      className="text-xs text-neutral-400 hover:text-rose-400 px-2 py-1 rounded bg-neutral-900 hover:bg-neutral-800 transition-colors cursor-pointer"
                    >
                      Gỡ mã
                    </button>
                  </div>
                )}

                {/* Voucher Message Alert */}
                {voucherMessage && (
                  <div className={`p-2 rounded-lg text-[11px] flex items-center space-x-1.5 ${
                    voucherMessage.type === 'success'
                      ? 'bg-emerald-500/10 text-emerald-300 border border-emerald-500/20'
                      : 'bg-rose-500/10 text-rose-300 border border-rose-500/20'
                  }`}>
                    {voucherMessage.type === 'success' ? <Check className="w-3.5 h-3.5 flex-shrink-0" /> : <AlertCircle className="w-3.5 h-3.5 flex-shrink-0" />}
                    <span>{voucherMessage.text}</span>
                  </div>
                )}

                {/* Quick Voucher Suggestions */}
                {!appliedVoucher && (
                  <div className="pt-1">
                    <p className="text-[10px] text-neutral-400 mb-1.5">Gợi ý mã giảm giá hôm nay (bấm để áp dụng):</p>
                    <div className="flex flex-wrap gap-1.5">
                      {quickVouchers.map((v) => (
                        <button
                          key={v.code}
                          onClick={() => {
                            setVoucherInput(v.code);
                            handleApply(v.code);
                          }}
                          className="px-2.5 py-1 rounded-lg bg-neutral-900 hover:bg-neutral-800 text-amber-300 hover:text-amber-200 border border-neutral-700/80 text-[10px] font-semibold transition-all active:scale-95 cursor-pointer"
                        >
                          {v.label}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </>
          )}
        </div>

        {/* Footer */}
        {cart.length > 0 && (
          <div className="p-4 border-t border-neutral-800 bg-neutral-900 space-y-3">
            {appliedVoucher ? (
              <div className="space-y-1.5 text-xs">
                <div className="flex justify-between text-neutral-400">
                  <span>Tạm tính ({cart.reduce((c, i) => c + i.quantity, 0)} món):</span>
                  <span>{totalAmount.toLocaleString('vi-VN')}₫</span>
                </div>
                <div className="flex justify-between text-emerald-400 font-medium">
                  <span>Voucher giảm giá ({appliedVoucher.code}):</span>
                  <span>-{discount.toLocaleString('vi-VN')}₫</span>
                </div>
                <div className="flex justify-between items-center pt-1 border-t border-neutral-800 text-sm">
                  <span className="text-white font-bold">Tổng thanh toán:</span>
                  <span className="text-lg font-black text-orange-400">
                    {finalPay.toLocaleString('vi-VN')}₫
                  </span>
                </div>
              </div>
            ) : (
              <div className="flex items-center justify-between text-sm">
                <span className="text-neutral-400">Tổng thanh toán:</span>
                <span className="text-lg font-black text-orange-500">
                  {totalAmount.toLocaleString('vi-VN')}₫
                </span>
              </div>
            )}

            <button
              onClick={() => {
                onProceedCheckout();
                onClose();
              }}
              className="w-full py-3 rounded-xl bg-gradient-to-r from-orange-500 to-rose-600 hover:from-orange-600 hover:to-rose-700 text-white font-bold text-xs flex items-center justify-center space-x-2 shadow-lg shadow-orange-500/25 transition-all active:scale-95 cursor-pointer"
            >
              <span>Thanh toán VietQR an toàn</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
