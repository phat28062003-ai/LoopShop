import React, { useState, useEffect } from 'react';
import { X, Search, Package, Loader2, QrCode } from 'lucide-react';
import type { Order } from '../types';
import { api } from '../services/api';

interface OrderHistoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenVietQR?: (order: Order) => void;
}

export const OrderHistoryModal: React.FC<OrderHistoryModalProps> = ({
  isOpen,
  onClose,
  onOpenVietQR,
}) => {
  const [phone, setPhone] = useState<string>(() => localStorage.getItem('loopshop_customer_phone') || '0987654321');
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);

  useEffect(() => {
    if (isOpen && phone.trim()) {
      handleSearch();
    }
  }, [isOpen]);

  const handleSearch = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!phone.trim()) return;

    try {
      setIsLoading(true);
      setHasSearched(true);
      localStorage.setItem('loopshop_customer_phone', phone.trim());
      const res = await api.trackOrdersByPhone(phone.trim());
      setOrders(res);
    } catch (err) {
      console.error(err);
      alert('Không thể tra cứu đơn hàng, vui lòng thử lại!');
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md animate-fade-in">
      <div 
        className="w-full max-w-md bg-neutral-900 text-white rounded-2xl overflow-hidden shadow-2xl border border-neutral-800 flex flex-col max-h-[85vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-neutral-800 bg-neutral-900/90">
          <div className="flex items-center space-x-2">
            <Package className="w-5 h-5 text-orange-400" />
            <h3 className="font-bold text-sm text-neutral-100">
              Tra cứu Đơn hàng của tôi
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full bg-neutral-800 hover:bg-neutral-700 text-neutral-400 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Search Bar */}
        <form onSubmit={handleSearch} className="p-3 border-b border-neutral-800 bg-neutral-950/60 flex flex-col space-y-2">
          <div className="flex space-x-2">
            <input
              type="tel"
              required
              placeholder="Nhập số điện thoại đặt hàng (ví dụ: 0987654321)..."
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="flex-1 bg-neutral-800 border border-neutral-700 rounded-xl px-3.5 py-2 text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-orange-500 font-mono"
            />
            <button
              type="submit"
              disabled={isLoading || !phone.trim()}
              className="px-4 py-2 rounded-xl bg-orange-500 hover:bg-orange-600 disabled:opacity-40 text-black font-bold text-xs flex items-center space-x-1.5 transition-all active:scale-95 flex-shrink-0 cursor-pointer"
            >
              {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
              <span>Tìm</span>
            </button>
          </div>

          {/* Quick Demo Phone Chips */}
          <div className="flex items-center space-x-1.5 overflow-x-auto no-scrollbar pt-0.5">
            <span className="text-[10px] text-neutral-400 whitespace-nowrap">SĐT mẫu:</span>
            {[
              { phone: '0987654321', name: 'Tuấn (Đã nhận)' },
              { phone: '0912345678', name: 'Nam (Đã CK)' },
              { phone: '0933221100', name: 'Mai (Đang giao)' },
              { phone: '0908889999', name: 'Bảo (Chờ QR)' },
            ].map((p) => (
              <button
                key={p.phone}
                type="button"
                onClick={() => {
                  setPhone(p.phone);
                  localStorage.setItem('loopshop_customer_phone', p.phone);
                  api.trackOrdersByPhone(p.phone).then((res) => {
                    setOrders(res);
                    setHasSearched(true);
                  });
                }}
                className={`text-[10px] px-2 py-0.5 rounded-full whitespace-nowrap border transition-all cursor-pointer ${
                  phone === p.phone
                    ? 'bg-orange-500 text-black border-orange-500 font-bold'
                    : 'bg-neutral-800 text-neutral-300 border-neutral-700 hover:border-orange-500/50'
                }`}
              >
                {p.name}
              </button>
            ))}
          </div>
        </form>

        {/* Content */}
        <div className="p-4 overflow-y-auto space-y-3 flex-1">
          {isLoading ? (
            <div className="py-12 flex flex-col items-center justify-center text-neutral-500 space-y-2">
              <Loader2 className="w-6 h-6 animate-spin text-orange-500" />
              <p className="text-xs">Đang tìm đơn hàng...</p>
            </div>
          ) : hasSearched && orders.length === 0 ? (
            <div className="py-12 flex flex-col items-center justify-center text-neutral-500 space-y-2 text-center">
              <Package className="w-10 h-10 text-neutral-700" />
              <p className="text-xs">Không tìm thấy đơn hàng nào cho SĐT: <strong>{phone}</strong></p>
              <span className="text-[11px] text-neutral-600">Hãy kiểm tra lại số điện thoại bạn đã điền lúc thanh toán.</span>
            </div>
          ) : (
            orders.map((order) => (
              <div
                key={order.id}
                className="bg-neutral-800/60 rounded-xl p-3.5 border border-neutral-700/60 space-y-2.5"
              >
                <div className="flex items-center justify-between pb-2 border-b border-neutral-700/60">
                  <span className="font-mono font-bold text-xs text-orange-400">
                    {order.order_code}
                  </span>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                    order.status === 'completed'
                      ? 'bg-emerald-500/20 text-emerald-400'
                      : order.status === 'shipping'
                      ? 'bg-sky-500/20 text-sky-400'
                      : order.status === 'confirmed'
                      ? 'bg-emerald-500/20 text-emerald-400'
                      : 'bg-amber-500/20 text-amber-300'
                  }`}>
                    {order.status === 'pending' && 'Chờ thanh toán VietQR'}
                    {order.status === 'confirmed' && 'Đã xác nhận & Đóng gói'}
                    {order.status === 'shipping' && 'Đang giao hàng'}
                    {order.status === 'completed' && 'Đã nhận hàng'}
                    {order.status === 'cancelled' && 'Đã hủy'}
                  </span>
                </div>

                <div className="space-y-1 text-xs">
                  <div className="flex justify-between text-neutral-300">
                    <span>Người nhận: {order.customer_name}</span>
                    <span className="text-[11px] text-neutral-500">
                      {new Date(order.created_at).toLocaleDateString('vi-VN')}
                    </span>
                  </div>
                  <p className="text-neutral-400 text-[11px] line-clamp-1">
                    Đ/c: {order.shipping_address}
                  </p>
                </div>

                <div className="flex items-center justify-between pt-1 border-t border-neutral-700/40">
                  <div className="text-xs">
                    <span className="text-neutral-400">Tổng tiền: </span>
                    <span className="font-bold text-orange-400 text-sm">
                      {Number(order.total_amount).toLocaleString('vi-VN')}₫
                    </span>
                  </div>

                  {!order.is_paid && order.vietqr_url && onOpenVietQR && (
                    <button
                      onClick={() => onOpenVietQR(order)}
                      className="px-2.5 py-1 rounded-lg bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 text-[11px] font-semibold flex items-center space-x-1 border border-emerald-500/30 transition-colors"
                    >
                      <QrCode className="w-3.5 h-3.5" />
                      <span>Xem mã VietQR</span>
                    </button>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
