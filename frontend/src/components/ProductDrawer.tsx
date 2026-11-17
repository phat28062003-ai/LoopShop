import React, { useState } from 'react';
import { X, Star, ShieldCheck, ShoppingCart, Zap, Plus, Minus, MessageCircle } from 'lucide-react';
import type { Product } from '../types';

interface ProductDrawerProps {
  product: Product | null;
  isOpen: boolean;
  onClose: () => void;
  onAddToCart: (product: Product, quantity: number) => void;
  onBuyNow: (product: Product, quantity: number) => void;
  onChatAboutProduct?: (product: Product) => void;
}

export const ProductDrawer: React.FC<ProductDrawerProps> = ({
  product,
  isOpen,
  onClose,
  onAddToCart,
  onBuyNow,
  onChatAboutProduct,
}) => {
  const [quantity, setQuantity] = useState<number>(1);

  if (!isOpen || !product) return null;

  const discountPercent = product.original_price
    ? Math.round(((product.original_price - product.price) / product.original_price) * 100)
    : 0;

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/60 backdrop-blur-sm animate-fade-in">
      <div 
        className="w-full max-w-lg bg-neutral-900 text-white rounded-t-3xl overflow-hidden shadow-2xl border-t border-white/10 flex flex-col max-h-[85vh] animate-slide-up"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-neutral-800">
          <div className="flex items-center space-x-2">
            <span className="w-2.5 h-2.5 rounded-full bg-orange-500"></span>
            <h3 className="font-bold text-sm tracking-wide text-neutral-200">
              Chi tiết sản phẩm trên Video
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full bg-neutral-800 hover:bg-neutral-700 text-neutral-400 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-4 overflow-y-auto space-y-4 flex-1">
          {/* Main Info */}
          <div className="flex space-x-3.5">
            <div className="w-24 h-24 rounded-xl overflow-hidden bg-neutral-800 flex-shrink-0 border border-neutral-700">
              <img
                src={product.image_url}
                alt={product.title}
                className="w-full h-full object-cover"
              />
            </div>

            <div className="flex-1 flex flex-col justify-between">
              <div>
                <h4 className="font-semibold text-sm line-clamp-2 text-white">
                  {product.title}
                </h4>
                <div className="flex items-center space-x-2 mt-1">
                  <span className="text-xl font-bold text-orange-500">
                    {Number(product.price).toLocaleString('vi-VN')}₫
                  </span>
                  {product.original_price && (
                    <span className="text-xs text-neutral-400 line-through">
                      {Number(product.original_price).toLocaleString('vi-VN')}₫
                    </span>
                  )}
                  {discountPercent > 0 && (
                    <span className="bg-rose-500/20 text-rose-400 text-[10px] font-bold px-1.5 py-0.5 rounded">
                      -{discountPercent}%
                    </span>
                  )}
                </div>
              </div>

              <div className="flex items-center space-x-3 text-xs text-neutral-400">
                <div className="flex items-center text-amber-400 font-medium">
                  <Star className="w-3.5 h-3.5 fill-current mr-1" />
                  <span>{product.rating}</span>
                </div>
                <span>•</span>
                <span>Đã bán {product.sold_count}</span>
                <span>•</span>
                <span className="text-emerald-400">Còn {product.stock} sp</span>
              </div>
            </div>
          </div>

          {/* Seller / Store info */}
          <div className="flex items-center justify-between p-3 rounded-xl bg-neutral-800/70 border border-neutral-700/60">
            <div className="flex items-center space-x-2.5">
              <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-orange-500 to-amber-400 flex items-center justify-center font-bold text-xs text-black">
                {product.seller_name.charAt(0)}
              </div>
              <div>
                <p className="text-xs font-semibold text-neutral-200">{product.seller_name}</p>
                <div className="flex items-center space-x-1 text-[11px] text-emerald-400">
                  <ShieldCheck className="w-3 h-3" />
                  <span>Người bán đã xác thực</span>
                </div>
              </div>
            </div>
            <span className="text-[11px] bg-neutral-700 text-neutral-300 px-2 py-1 rounded-md">
              Cộng đồng khép kín
            </span>
          </div>

          {/* Description */}
          <div className="space-y-1.5">
            <h5 className="text-xs font-semibold uppercase tracking-wider text-neutral-400">
              Mô tả sản phẩm
            </h5>
            <p className="text-xs text-neutral-300 leading-relaxed bg-neutral-800/40 p-3 rounded-xl border border-neutral-800">
              {product.description || 'Sản phẩm chính hãng, cam kết chất lượng chuẩn như review trên video.'}
            </p>
          </div>

          {/* Quantity Selector */}
          <div className="flex items-center justify-between py-2 border-t border-neutral-800">
            <span className="text-xs font-medium text-neutral-300">Số lượng mua</span>
            <div className="flex items-center space-x-3 bg-neutral-800 rounded-lg p-1 border border-neutral-700">
              <button
                onClick={() => setQuantity(prev => Math.max(1, prev - 1))}
                className="w-7 h-7 flex items-center justify-center rounded bg-neutral-700 text-neutral-200 hover:bg-neutral-600 transition-colors"
              >
                <Minus className="w-3.5 h-3.5" />
              </button>
              <span className="text-sm font-bold w-6 text-center">{quantity}</span>
              <button
                onClick={() => setQuantity(prev => Math.min(product.stock, prev + 1))}
                className="w-7 h-7 flex items-center justify-center rounded bg-neutral-700 text-neutral-200 hover:bg-neutral-600 transition-colors"
              >
                <Plus className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
          {/* Chat with Shop Button */}
          {onChatAboutProduct && (
            <button
              type="button"
              onClick={() => {
                onChatAboutProduct(product);
                onClose();
              }}
              className="w-full py-2.5 px-3 rounded-xl bg-orange-500/10 hover:bg-orange-500/20 text-orange-400 font-semibold text-xs flex items-center justify-center space-x-2 border border-orange-500/30 transition-all active:scale-95"
            >
              <MessageCircle className="w-4 h-4 text-orange-400" />
              <span>Chat hỏi Người Bán về sản phẩm này</span>
            </button>
          )}
        </div>

        {/* Footer Actions */}
        <div className="p-4 border-t border-neutral-800 bg-neutral-900/95 flex space-x-3">
          <button
            onClick={() => {
              onAddToCart(product, quantity);
              onClose();
            }}
            className="flex-1 py-3 px-4 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-white font-semibold text-xs flex items-center justify-center space-x-2 border border-neutral-700 transition-all active:scale-95"
          >
            <ShoppingCart className="w-4 h-4 text-orange-400" />
            <span>Thêm giỏ hàng</span>
          </button>

          <button
            onClick={() => {
              onBuyNow(product, quantity);
              onClose();
            }}
            className="flex-1 py-3 px-4 rounded-xl bg-gradient-to-r from-orange-500 to-rose-600 hover:from-orange-600 hover:to-rose-700 text-white font-bold text-xs flex items-center justify-center space-x-2 shadow-lg shadow-orange-500/20 transition-all active:scale-95"
          >
            <Zap className="w-4 h-4" />
            <span>Mua ngay (VietQR)</span>
          </button>
        </div>
      </div>
    </div>
  );
};
