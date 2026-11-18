import React, { useState, useEffect } from 'react';
import { 
  X, 
  Search, 
  Package, 
  Loader2, 
  QrCode, 
  AlertCircle, 
  RefreshCw, 
  CheckCircle2, 
  Clock, 
  Truck, 
  ChevronRight, 
  ArrowLeft, 
  Copy, 
  Check, 
  MapPin, 
  Ticket,
  FileText
} from 'lucide-react';
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
  onOpenVietQR: _onOpenVietQR,
}) => {
  const [phone, setPhone] = useState<string>(() => localStorage.getItem('loopshop_customer_phone') || '0987654321');
  const [orders, setOrders] = useState<Order[]>([]);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Copy indicators
  const [copiedField, setCopiedField] = useState<'acc' | 'memo' | 'amount' | null>(null);
  const [qrMode, setQrMode] = useState<'card' | 'dynamic'>('card');

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
      setErrorMsg(null);
      setHasSearched(true);
      setSelectedOrder(null);
      localStorage.setItem('loopshop_customer_phone', phone.trim());
      const res = await api.trackOrdersByPhone(phone.trim());
      setOrders(res);
    } catch (err) {
      console.error(err);
      setErrorMsg('Máy chủ Render đang phản hồi. Vui lòng bấm Thử lại để tải đơn hàng!');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopy = (text: string, field: 'acc' | 'memo' | 'amount') => {
    navigator.clipboard.writeText(text);
    setCopiedField(field);
    setTimeout(() => setCopiedField(null), 2000);
  };

  if (!isOpen) return null;

  // Determine current step index in 4-step progress: 0 (pending), 1 (confirmed), 2 (shipping), 3 (completed)
  const getStepIndex = (status: Order['status']) => {
    switch (status) {
      case 'completed': return 3;
      case 'shipping': return 2;
      case 'confirmed': return 1;
      case 'preparing': return 1;
      case 'pending': return 0;
      default: return 0;
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 md:p-4 bg-black/80 backdrop-blur-md animate-fade-in">
      <div 
        className="w-full max-w-lg bg-neutral-900 text-white rounded-3xl overflow-hidden shadow-2xl border border-neutral-800 flex flex-col max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-neutral-800 bg-neutral-900/95 sticky top-0 z-10">
          <div className="flex items-center space-x-2">
            {selectedOrder ? (
              <button
                onClick={() => setSelectedOrder(null)}
                className="p-1 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-neutral-300 hover:text-white transition-colors flex items-center space-x-1 text-xs pr-2"
                title="Quay lại danh sách"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Quay lại</span>
              </button>
            ) : (
              <div className="w-8 h-8 rounded-xl bg-orange-500/20 text-orange-400 flex items-center justify-center">
                <Package className="w-4 h-4" />
              </div>
            )}
            <div>
              <h3 className="font-bold text-sm text-neutral-100">
                {selectedOrder ? `Tiến trình đơn #${selectedOrder.order_code}` : 'Đơn mua của tôi'}
              </h3>
              <p className="text-[10px] text-neutral-400">
                {selectedOrder ? 'Cập nhật trạng thái thời gian thực' : 'Nhập SĐT để tra cứu lịch sử mua hàng'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full bg-neutral-800 hover:bg-neutral-700 text-neutral-400 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Search Bar (Only shown when not viewing a single order detail) */}
        {!selectedOrder && (
          <form onSubmit={handleSearch} className="p-3 border-b border-neutral-800 bg-neutral-950/70 flex flex-col space-y-2">
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
                { phone: '0987654321', name: 'Tuấn (Đã nhận hàng)' },
                { phone: '0912345678', name: 'Nam (Đã xác nhận)' },
                { phone: '0933221100', name: 'Mai (Đang giao)' },
                { phone: '0908889999', name: 'Bảo (Chờ QR)' },
              ].map((p) => (
                <button
                  key={p.phone}
                  type="button"
                  onClick={async () => {
                    setPhone(p.phone);
                    localStorage.setItem('loopshop_customer_phone', p.phone);
                    try {
                      setIsLoading(true);
                      setErrorMsg(null);
                      setHasSearched(true);
                      setSelectedOrder(null);
                      const res = await api.trackOrdersByPhone(p.phone);
                      setOrders(res);
                    } catch (err) {
                      console.error(err);
                      setErrorMsg('Máy chủ đang phản hồi. Vui lòng bấm Thử lại!');
                    } finally {
                      setIsLoading(false);
                    }
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
        )}

        {/* Content Body */}
        <div className="p-4 overflow-y-auto space-y-3 flex-1">
          {/* VIEW 1: DETAILED ORDER TRACKING VIEW (When an order is clicked) */}
          {selectedOrder ? (
            <div className="space-y-4 animate-in fade-in-50 duration-200">
              {/* Stepper Progress Bar */}
              <div className="bg-neutral-950 p-4 rounded-2xl border border-neutral-800 space-y-4">
                <div className="flex items-center justify-between pb-2 border-b border-neutral-800/80">
                  <span className="text-xs font-bold text-neutral-300 flex items-center space-x-1.5">
                    <Truck className="w-4 h-4 text-orange-400" />
                    <span>Trạng thái đơn hàng:</span>
                  </span>
                  <span className={`text-xs font-extrabold px-2.5 py-0.5 rounded-full ${
                    selectedOrder.status === 'completed'
                      ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                      : selectedOrder.status === 'shipping'
                      ? 'bg-sky-500/20 text-sky-400 border border-sky-500/30'
                      : selectedOrder.status === 'confirmed'
                      ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                      : selectedOrder.status === 'cancelled'
                      ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                      : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                  }`}>
                    {selectedOrder.status === 'pending' && '⏳ Chờ thanh toán VietQR'}
                    {selectedOrder.status === 'confirmed' && '📦 Đã xác nhận & Đóng gói'}
                    {selectedOrder.status === 'shipping' && '🚚 Đang giao hàng'}
                    {selectedOrder.status === 'completed' && '🎉 Giao hàng thành công'}
                    {selectedOrder.status === 'cancelled' && '❌ Đã hủy đơn'}
                  </span>
                </div>

                {/* 4-Step Visual Stepper */}
                {selectedOrder.status !== 'cancelled' ? (
                  <div className="relative pt-2 pb-1">
                    {/* Connecting line */}
                    <div className="absolute top-6 left-6 right-6 h-1 bg-neutral-800 rounded">
                      <div 
                        className="h-full bg-gradient-to-r from-orange-500 to-emerald-500 transition-all duration-500 rounded"
                        style={{ width: `${(getStepIndex(selectedOrder.status) / 3) * 100}%` }}
                      ></div>
                    </div>

                    <div className="relative flex justify-between z-10">
                      {[
                        { label: 'Đặt đơn', desc: 'Đã tạo', icon: FileText, stepIdx: 0 },
                        { label: 'Xác nhận', desc: 'Đóng gói', icon: Package, stepIdx: 1 },
                        { label: 'Vận chuyển', desc: 'Đang giao', icon: Truck, stepIdx: 2 },
                        { label: 'Hoàn tất', desc: 'Đã nhận', icon: CheckCircle2, stepIdx: 3 },
                      ].map((s) => {
                        const currentIdx = getStepIndex(selectedOrder.status);
                        const isDone = currentIdx >= s.stepIdx;
                        const isCurrent = currentIdx === s.stepIdx;
                        const Icon = s.icon;

                        return (
                          <div key={s.stepIdx} className="flex flex-col items-center text-center">
                            <div className={`w-9 h-9 rounded-full flex items-center justify-center transition-all shadow-md ${
                              isDone 
                                ? 'bg-gradient-to-tr from-emerald-500 to-teal-400 text-black font-bold scale-105' 
                                : 'bg-neutral-800 text-neutral-500 border border-neutral-700'
                            } ${isCurrent ? 'ring-2 ring-orange-400 ring-offset-2 ring-offset-neutral-950' : ''}`}>
                              <Icon className="w-4 h-4" />
                            </div>
                            <span className={`text-[11px] font-bold mt-2 ${isDone ? 'text-white' : 'text-neutral-500'}`}>
                              {s.label}
                            </span>
                            <span className="text-[9px] text-neutral-400">
                              {s.desc}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ) : (
                  <div className="p-3 bg-rose-950/30 border border-rose-800/40 rounded-xl text-xs text-rose-300">
                    Đơn hàng này đã bị hủy. Nếu có thắc mắc vui lòng liên hệ bộ phận hỗ trợ.
                  </div>
                )}

                {/* Helpful status text note */}
                <div className="p-3 bg-neutral-900 rounded-xl border border-neutral-800 text-xs text-neutral-300 flex items-start space-x-2">
                  <Clock className="w-4 h-4 text-orange-400 flex-shrink-0 mt-0.5" />
                  <div className="leading-relaxed text-[11px]">
                    {selectedOrder.status === 'pending' && (
                      <span>Đơn hàng đang chờ thanh toán chuyển khoản. Bạn có thể quét mã VietQR bên dưới để thanh toán ngay.</span>
                    )}
                    {selectedOrder.status === 'confirmed' && (
                      <span>Người bán đã nhận đơn, đang đóng gói kỹ càng và chuẩn bị bàn giao cho bưu tá giao hàng.</span>
                    )}
                    {selectedOrder.status === 'shipping' && (
                      <span>Đơn hàng đang trên xe giao hàng tới bạn. Shipper sẽ gọi điện trước khi đến nơi. Dự kiến giao hôm nay hoặc ngày mai!</span>
                    )}
                    {selectedOrder.status === 'completed' && (
                      <span>Kiện hàng đã giao thành công và bạn đã nhận đầy đủ. Cảm ơn bạn đã mua hàng tại LoopShop!</span>
                    )}
                  </div>
                </div>
              </div>

              {/* VIETQR PAYMENT SECTION (If order is pending and not paid) */}
              {!selectedOrder.is_paid && selectedOrder.status === 'pending' && (
                <div className="bg-neutral-950 p-4 rounded-2xl border border-emerald-500/40 space-y-3.5 text-center">
                  <div className="flex items-center justify-between pb-2 border-b border-neutral-800">
                    <span className="text-xs font-bold text-emerald-400 flex items-center space-x-1.5">
                      <QrCode className="w-4 h-4" />
                      <span>Thanh toán chuyển khoản VietQR</span>
                    </span>
                    <span className="text-[10px] bg-emerald-500/20 text-emerald-300 px-2 py-0.5 rounded-full font-bold">
                      Napas247 Miễn Phí
                    </span>
                  </div>

                  {/* QR Mode Switcher */}
                  <div className="flex items-center justify-center space-x-1.5 p-1 bg-neutral-900 rounded-xl border border-neutral-800 w-fit mx-auto text-xs">
                    <button
                      type="button"
                      onClick={() => setQrMode('card')}
                      className={`px-3 py-1 rounded-lg font-semibold transition-all cursor-pointer ${
                        qrMode === 'card'
                          ? 'bg-emerald-600 text-white shadow-md'
                          : 'text-neutral-400 hover:text-white'
                      }`}
                    >
                      Thẻ QR Phát
                    </button>
                    <button
                      type="button"
                      onClick={() => setQrMode('dynamic')}
                      className={`px-3 py-1 rounded-lg font-semibold transition-all cursor-pointer ${
                        qrMode === 'dynamic'
                          ? 'bg-emerald-600 text-white shadow-md'
                          : 'text-neutral-400 hover:text-white'
                      }`}
                    >
                      Mã QR điền sẵn tiền
                    </button>
                  </div>

                  {/* QR Image Box */}
                  <div className="bg-white p-3 rounded-2xl mx-auto w-fit shadow-2xl border-4 border-emerald-500/30">
                    {qrMode === 'card' ? (
                      <img
                        src="/images/vietqr-phat.jpg"
                        alt="Mã VietQR Lu Tien Phat"
                        className="w-48 h-auto object-contain mx-auto rounded-lg"
                      />
                    ) : (
                      <img
                        src={`https://img.vietqr.io/image/ICB-93287556868-compact2.png?amount=${selectedOrder.total_amount}&addInfo=DON%20HANG%20${selectedOrder.order_code}&accountName=LU%20TIEN%20PHAT`}
                        alt="VietQR Code"
                        className="w-48 h-auto object-contain mx-auto"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = '/images/vietqr-phat.jpg';
                        }}
                      />
                    )}
                    <div className="mt-1.5 text-[10px] font-bold text-neutral-800">
                      LU TIEN PHAT • 93287556868
                    </div>
                  </div>

                  {/* Banking Info Box */}
                  <div className="bg-neutral-900 rounded-xl p-3 border border-neutral-800 text-left space-y-2 text-xs">
                    <div className="flex justify-between items-center py-1 border-b border-neutral-800">
                      <span className="text-neutral-400">Ngân hàng:</span>
                      <span className="font-bold text-white">VietinBank (Công Thương)</span>
                    </div>

                    <div className="flex justify-between items-center py-1 border-b border-neutral-800">
                      <span className="text-neutral-400">Số tài khoản:</span>
                      <div className="flex items-center space-x-1.5">
                        <span className="font-mono font-bold text-amber-300">93287556868</span>
                        <button
                          onClick={() => handleCopy('93287556868', 'acc')}
                          className="p-1 hover:bg-neutral-800 rounded text-neutral-400 hover:text-white"
                          title="Copy STK"
                        >
                          {copiedField === 'acc' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                        </button>
                      </div>
                    </div>

                    <div className="flex justify-between items-center py-1 border-b border-neutral-800">
                      <span className="text-neutral-400">Chủ tài khoản:</span>
                      <span className="font-bold text-white">LU TIEN PHAT</span>
                    </div>

                    <div className="flex justify-between items-center py-1 border-b border-neutral-800">
                      <span className="text-neutral-400">Số tiền:</span>
                      <div className="flex items-center space-x-1.5">
                        <span className="font-bold text-emerald-400">
                          {Number(selectedOrder.total_amount).toLocaleString('vi-VN')}₫
                        </span>
                        <button
                          onClick={() => handleCopy(String(selectedOrder.total_amount), 'amount')}
                          className="p-1 hover:bg-neutral-800 rounded text-neutral-400 hover:text-white"
                          title="Copy số tiền"
                        >
                          {copiedField === 'amount' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                        </button>
                      </div>
                    </div>

                    <div className="flex justify-between items-center py-1">
                      <span className="text-neutral-400">Nội dung CK:</span>
                      <div className="flex items-center space-x-1.5">
                        <span className="font-mono font-bold text-rose-400">DON HANG {selectedOrder.order_code}</span>
                        <button
                          onClick={() => handleCopy(`DON HANG ${selectedOrder.order_code}`, 'memo')}
                          className="p-1 hover:bg-neutral-800 rounded text-neutral-400 hover:text-white"
                          title="Copy nội dung"
                        >
                          {copiedField === 'memo' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Order Items List */}
              <div className="bg-neutral-950 p-4 rounded-2xl border border-neutral-800 space-y-3">
                <h4 className="text-xs font-bold text-neutral-300 flex items-center space-x-1.5">
                  <Package className="w-4 h-4 text-orange-400" />
                  <span>Sản phẩm trong kiện hàng ({selectedOrder.items?.length || 0}):</span>
                </h4>

                <div className="space-y-2">
                  {selectedOrder.items && selectedOrder.items.length > 0 ? (
                    selectedOrder.items.map((item, idx) => (
                      <div key={idx} className="flex justify-between items-center bg-neutral-900 p-2.5 rounded-xl border border-neutral-800/80 text-xs">
                        <div className="flex-1 min-w-0 pr-2">
                          <p className="font-semibold text-neutral-200 line-clamp-1">{item.product_title}</p>
                          <span className="text-[11px] text-neutral-400 font-mono">
                            Số lượng: {item.quantity} x {Number(item.price).toLocaleString('vi-VN')}₫
                          </span>
                        </div>
                        <span className="font-bold text-white font-mono whitespace-nowrap">
                          {(item.price * item.quantity).toLocaleString('vi-VN')}₫
                        </span>
                      </div>
                    ))
                  ) : (
                    <p className="text-xs text-neutral-500">Đơn hàng sản phẩm tổng hợp</p>
                  )}
                </div>

                {/* Price Breakdown */}
                <div className="pt-2 border-t border-neutral-800/80 space-y-1.5 text-xs">
                  {selectedOrder.voucher_code && Number(selectedOrder.discount_amount) > 0 && (
                    <div className="flex justify-between text-emerald-400">
                      <span className="flex items-center space-x-1">
                        <Ticket className="w-3.5 h-3.5" />
                        <span>Mã giảm giá ({selectedOrder.voucher_code}):</span>
                      </span>
                      <span>-{Number(selectedOrder.discount_amount).toLocaleString('vi-VN')}₫</span>
                    </div>
                  )}

                  <div className="flex justify-between items-center pt-1 border-t border-neutral-800 font-bold">
                    <span className="text-neutral-300">Tổng thanh toán:</span>
                    <span className="text-sm text-orange-400 font-extrabold font-mono">
                      {Number(selectedOrder.total_amount).toLocaleString('vi-VN')}₫
                    </span>
                  </div>
                </div>
              </div>

              {/* Delivery Information */}
              <div className="bg-neutral-950 p-4 rounded-2xl border border-neutral-800 space-y-2 text-xs text-neutral-300">
                <h4 className="font-bold text-neutral-200 flex items-center space-x-1.5 mb-2">
                  <MapPin className="w-4 h-4 text-rose-400" />
                  <span>Địa chỉ nhận hàng:</span>
                </h4>
                <div className="space-y-1 text-[11px] bg-neutral-900 p-3 rounded-xl border border-neutral-800/80">
                  <p><strong>Người nhận:</strong> {selectedOrder.customer_name}</p>
                  <p><strong>Số điện thoại:</strong> {selectedOrder.customer_phone}</p>
                  <p><strong>Địa chỉ:</strong> {selectedOrder.shipping_address}</p>
                  {selectedOrder.note && <p><strong>Ghi chú:</strong> {selectedOrder.note}</p>}
                  <p className="text-neutral-500 pt-1 text-[10px]">
                    Đặt lúc: {new Date(selectedOrder.created_at).toLocaleString('vi-VN')}
                  </p>
                </div>
              </div>

              {/* Back to list button */}
              <button
                type="button"
                onClick={() => setSelectedOrder(null)}
                className="w-full py-2.5 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-white font-bold text-xs transition-colors flex items-center justify-center space-x-1.5"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Xem các đơn hàng khác</span>
              </button>
            </div>
          ) : (
            /* VIEW 2: LIST OF ALL ORDERS FOR PHONE NUMBER */
            errorMsg ? (
              <div className="py-8 px-4 flex flex-col items-center justify-center text-center space-y-3 bg-neutral-950/60 rounded-2xl border border-rose-500/30">
                <AlertCircle className="w-8 h-8 text-rose-400" />
                <p className="text-xs text-rose-200 max-w-xs">{errorMsg}</p>
                <button
                  type="button"
                  onClick={() => handleSearch()}
                  className="px-4 py-2 rounded-xl bg-orange-500 hover:bg-orange-600 text-black text-xs font-bold transition-all shadow cursor-pointer active:scale-95 flex items-center space-x-1.5"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  <span>Thử lại ngay</span>
                </button>
              </div>
            ) : isLoading ? (
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
                  onClick={() => setSelectedOrder(order)}
                  className="bg-neutral-800/60 hover:bg-neutral-800 rounded-2xl p-4 border border-neutral-700/60 hover:border-orange-500/50 space-y-3 transition-all cursor-pointer active:scale-98 shadow-md"
                >
                  <div className="flex items-center justify-between pb-2 border-b border-neutral-700/60">
                    <div className="flex items-center space-x-2">
                      <span className="font-mono font-bold text-xs text-orange-400">
                        {order.order_code}
                      </span>
                      <span className="text-[10px] text-neutral-500">
                        {new Date(order.created_at).toLocaleDateString('vi-VN')}
                      </span>
                    </div>

                    <span className={`text-[10px] font-extrabold px-2.5 py-0.5 rounded-full ${
                      order.status === 'completed'
                        ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                        : order.status === 'shipping'
                        ? 'bg-sky-500/20 text-sky-400 border border-sky-500/30'
                        : order.status === 'confirmed'
                        ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                        : order.status === 'cancelled'
                        ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                        : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                    }`}>
                      {order.status === 'pending' && 'Chờ thanh toán VietQR'}
                      {order.status === 'confirmed' && 'Đã xác nhận & Đóng gói'}
                      {order.status === 'shipping' && 'Đang giao hàng'}
                      {order.status === 'completed' && 'Đã nhận hàng'}
                      {order.status === 'cancelled' && 'Đã hủy'}
                    </span>
                  </div>

                  {/* Summary of Items */}
                  <div className="space-y-1 text-xs">
                    <div className="flex justify-between text-neutral-300">
                      <span>Người nhận: <strong>{order.customer_name}</strong></span>
                      <span className="text-neutral-400">
                        {order.items?.length || 1} sản phẩm
                      </span>
                    </div>
                    <p className="text-neutral-400 text-[11px] line-clamp-1">
                      Đ/c: {order.shipping_address}
                    </p>
                  </div>

                  {/* Bottom Action Bar */}
                  <div className="flex items-center justify-between pt-2 border-t border-neutral-700/50">
                    <div className="text-xs">
                      <span className="text-neutral-400">Tổng tiền: </span>
                      <span className="font-bold text-orange-400 text-sm font-mono">
                        {Number(order.total_amount).toLocaleString('vi-VN')}₫
                      </span>
                    </div>

                    <div className="flex items-center space-x-1 text-xs font-semibold text-orange-400 hover:text-orange-300">
                      <span>Xem tiến trình</span>
                      <ChevronRight className="w-4 h-4" />
                    </div>
                  </div>
                </div>
              ))
            )
          )}
        </div>
      </div>
    </div>
  );
};
