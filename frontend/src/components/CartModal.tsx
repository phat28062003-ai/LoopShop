import React from 'react';
import { X, Trash2, Plus, Minus, ArrowRight, ShoppingBag } from 'lucide-react';
import type { CartItem } from '../types';

interface CartModalProps {
  isOpen: boolean;
  cart: CartItem[];
  onClose: () => void;
  onUpdateQuantity: (productId: number, newQty: number) => void;
  onRemoveItem: (productId: number) => void;
  onProceedCheckout: () => void;
}

export const CartModal: React.FC<CartModalProps> = ({
  isOpen,
  cart,
  onClose,
  onUpdateQuantity,
  onRemoveItem,
  onProceedCheckout,
}) => {
  if (!isOpen) return null;

  const totalAmount = cart.reduce(
    (sum, item) => sum + item.product.price * item.quantity,
    0
  );

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
            className="p-1.5 rounded-full bg-neutral-800 hover:bg-neutral-700 text-neutral-400 hover:text-white transition-colors"
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
                className="text-xs text-orange-400 hover:underline font-semibold"
              >
                Khám phá video và săn deal ngay
              </button>
            </div>
          ) : (
            cart.map((item) => (
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
                        className="w-5 h-5 flex items-center justify-center text-neutral-300 hover:text-white"
                      >
                        <Minus className="w-3 h-3" />
                      </button>
                      <span className="text-xs font-semibold px-1">{item.quantity}</span>
                      <button
                        onClick={() => onUpdateQuantity(item.product.id, item.quantity + 1)}
                        className="w-5 h-5 flex items-center justify-center text-neutral-300 hover:text-white"
                      >
                        <Plus className="w-3 h-3" />
                      </button>
                    </div>

                    <button
                      onClick={() => onRemoveItem(item.product.id)}
                      className="text-neutral-500 hover:text-rose-400 p-1 transition-colors"
                      title="Xóa sản phẩm"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        {cart.length > 0 && (
          <div className="p-4 border-t border-neutral-800 bg-neutral-900 space-y-3">
            <div className="flex items-center justify-between text-sm">
              <span className="text-neutral-400">Tổng thanh toán:</span>
              <span className="text-lg font-black text-orange-500">
                {totalAmount.toLocaleString('vi-VN')}₫
              </span>
            </div>

            <button
              onClick={() => {
                onProceedCheckout();
                onClose();
              }}
              className="w-full py-3 rounded-xl bg-gradient-to-r from-orange-500 to-rose-600 hover:from-orange-600 hover:to-rose-700 text-white font-bold text-xs flex items-center justify-center space-x-2 shadow-lg shadow-orange-500/25 transition-all active:scale-95"
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
