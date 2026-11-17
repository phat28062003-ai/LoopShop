import React, { useState, useEffect, useRef } from 'react';
import { Upload, Plus, Package, CheckCircle2, Check, RefreshCw, Loader2, Video, FileVideo } from 'lucide-react';
import type { Product, Order } from '../types';
import { api } from '../services/api';

export const SellerStudio: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'upload' | 'orders'>('upload');
  const [products, setProducts] = useState<Product[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Upload Form state
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [videoUrl, setVideoUrl] = useState('');
  const [uploaderName, setUploaderName] = useState('phat_seller');
  const [selectedProductId, setSelectedProductId] = useState<number | ''>('');
  const [uploadSuccess, setUploadSuccess] = useState<string | null>(null);

  // Direct File Upload state
  const [isUploadingFile, setIsUploadingFile] = useState(false);
  const [uploadedFileName, setUploadedFileName] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Sample video templates for quick test
  const sampleVideos = [
    { label: 'Demo 1: Công nghệ', url: 'https://assets.mixkit.co/videos/preview/mixkit-hands-of-a-man-working-on-a-computer-43288-large.mp4' },
    { label: 'Demo 2: Thời trang', url: 'https://assets.mixkit.co/videos/preview/mixkit-model-posing-with-a-modern-look-41614-large.mp4' },
    { label: 'Demo 3: Lifestyle', url: 'https://assets.mixkit.co/videos/preview/mixkit-girl-taking-photos-with-a-retro-camera-41620-large.mp4' },
  ];

  const loadData = async () => {
    try {
      setIsRefreshing(true);
      const [prodsData, ordersData] = await Promise.all([
        api.getProducts(),
        api.getOrders(),
      ]);
      setProducts(prodsData);
      setOrders(ordersData);
      if (prodsData.length > 0 && selectedProductId === '') {
        setSelectedProductId(prodsData[0].id);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setIsUploadingFile(true);
      setUploadedFileName(file.name);
      const res = await api.uploadVideoFile(file);
      setVideoUrl(res.video_url);
    } catch (err) {
      console.error(err);
      alert('Không thể tải file video lên, bạn có thể dán link URL trực tiếp!');
    } finally {
      setIsUploadingFile(false);
    }
  };

  const handleCreateVideo = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !videoUrl.trim()) {
      alert('Vui lòng nhập tiêu đề và đường link video!');
      return;
    }

    try {
      setIsLoading(true);
      const newVideo = await api.createVideo({
        title,
        description,
        video_url: videoUrl,
        uploader_name: uploaderName,
        thumbnail_url: products.find(p => p.id === Number(selectedProductId))?.image_url || '',
      });

      // Attach selected product if any
      if (selectedProductId) {
        await api.attachProductToVideo(newVideo.id, Number(selectedProductId));
      }

      setUploadSuccess(`Đã đăng tải video thành công và gắn sản phẩm vào feed!`);
      setTitle('');
      setDescription('');
      setVideoUrl('');
      setUploadedFileName(null);
      setTimeout(() => setUploadSuccess(null), 5000);
    } catch (err) {
      console.error(err);
      alert('Đăng video thất bại, vui lòng thử lại!');
    } finally {
      setIsLoading(false);
    }
  };

  const handleConfirmPayment = async (orderId: number) => {
    try {
      await api.confirmOrderPayment(orderId);
      await loadData();
    } catch (err) {
      console.error(err);
      alert('Không thể xác nhận đơn hàng!');
    }
  };

  const handleStatusChange = async (orderId: number, newStatus: string) => {
    try {
      await api.updateOrderStatus(orderId, newStatus);
      await loadData();
    } catch (err) {
      console.error(err);
      alert('Không thể cập nhật trạng thái đơn hàng!');
    }
  };

  return (
    <div className="w-full h-full bg-neutral-950 text-white overflow-y-auto p-4 md:p-6 pb-24">
      {/* Header */}
      <div className="max-w-4xl mx-auto flex flex-col md:flex-row md:items-center justify-between pb-4 border-b border-neutral-800 gap-3">
        <div>
          <div className="flex items-center space-x-2">
            <span className="w-3 h-3 rounded-full bg-orange-500"></span>
            <h1 className="text-xl font-bold tracking-tight text-white">Kênh Người Bán (Seller Studio)</h1>
          </div>
          <p className="text-xs text-neutral-400 mt-1">
            Đăng tải video ngắn kèm gắn thẻ sản phẩm & Quản lý đơn hàng chuyển khoản VietQR
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={loadData}
            disabled={isRefreshing}
            className="p-2 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-neutral-300 transition-colors flex items-center space-x-1.5 text-xs"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin' : ''}`} />
            <span>Làm mới</span>
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="max-w-4xl mx-auto mt-5 flex space-x-2 bg-neutral-900/80 p-1 rounded-xl border border-neutral-800">
        <button
          onClick={() => setActiveTab('upload')}
          className={`flex-1 py-2.5 text-xs font-semibold rounded-lg flex items-center justify-center space-x-2 transition-all ${
            activeTab === 'upload'
              ? 'bg-orange-500 text-black shadow-lg font-bold'
              : 'text-neutral-400 hover:text-white'
          }`}
        >
          <Upload className="w-4 h-4" />
          <span>Đăng tải Video & Gắn thẻ SP</span>
        </button>

        <button
          onClick={() => setActiveTab('orders')}
          className={`flex-1 py-2.5 text-xs font-semibold rounded-lg flex items-center justify-center space-x-2 transition-all ${
            activeTab === 'orders'
              ? 'bg-orange-500 text-black shadow-lg font-bold'
              : 'text-neutral-400 hover:text-white'
          }`}
        >
          <Package className="w-4 h-4" />
          <span>Quản lý Đơn hàng ({orders.length})</span>
        </button>
      </div>

      {/* Main Tab Content */}
      <div className="max-w-4xl mx-auto mt-6">
        {activeTab === 'upload' && (
          <div className="bg-neutral-900 rounded-2xl border border-neutral-800 p-5 md:p-6 space-y-5">
            <div>
              <h2 className="text-sm font-bold text-neutral-200">Thêm Video ngắn mới vào Feed</h2>
              <p className="text-xs text-neutral-400 mt-0.5">
                Tải video trực tiếp từ điện thoại hoặc chọn video mẫu để gắn thẻ sản phẩm vào feed người mua.
              </p>
            </div>

            {uploadSuccess && (
              <div className="p-3 rounded-xl bg-emerald-950/40 border border-emerald-800 text-emerald-300 text-xs flex items-center space-x-2">
                <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
                <span>{uploadSuccess}</span>
              </div>
            )}

            <form onSubmit={handleCreateVideo} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-neutral-300 mb-1.5">
                  Tiêu đề video <span className="text-rose-400">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ví dụ: Review tai nghe chống ồn siêu đỉnh dưới 400k..."
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full bg-neutral-800 border border-neutral-700 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-orange-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-neutral-300 mb-1.5">
                  Mô tả & Hashtags
                </label>
                <textarea
                  rows={2}
                  placeholder="Nhập mô tả sản phẩm, mã freeship, cách thức đặt hàng..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full bg-neutral-800 border border-neutral-700 rounded-xl px-3.5 py-2 text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-orange-500 resize-none"
                />
              </div>

              {/* Direct File Upload & URL Picker */}
              <div className="space-y-2">
                <label className="block text-xs font-semibold text-neutral-300">
                  Video ngắn (Chọn file từ thiết bị hoặc nhập link) <span className="text-rose-400">*</span>
                </label>

                {/* Upload box */}
                <div 
                  onClick={() => fileInputRef.current?.click()}
                  className="border-2 border-dashed border-neutral-700 hover:border-orange-500/70 bg-neutral-800/40 rounded-2xl p-4 text-center cursor-pointer transition-colors flex flex-col items-center justify-center space-y-2"
                >
                  <input
                    type="file"
                    ref={fileInputRef}
                    accept="video/mp4,video/quicktime,video/webm"
                    onChange={handleFileChange}
                    className="hidden"
                  />
                  {isUploadingFile ? (
                    <div className="flex items-center space-x-2 text-orange-400 text-xs py-2">
                      <Loader2 className="w-5 h-5 animate-spin" />
                      <span>Đang tải file video lên server...</span>
                    </div>
                  ) : uploadedFileName ? (
                    <div className="flex items-center space-x-2 text-emerald-400 text-xs py-1">
                      <FileVideo className="w-5 h-5" />
                      <span className="font-semibold">{uploadedFileName}</span>
                      <span className="text-neutral-500 text-[10px]">(Bấm để đổi file khác)</span>
                    </div>
                  ) : (
                    <>
                      <FileVideo className="w-8 h-8 text-neutral-500" />
                      <p className="text-xs text-neutral-300 font-medium">
                        Bấm vào đây để chọn file video từ điện thoại / máy tính
                      </p>
                      <span className="text-[10px] text-neutral-500">Hỗ trợ MP4, MOV, WebM</span>
                    </>
                  )}
                </div>

                {/* Fallback URL Input */}
                <div className="mt-2">
                  <input
                    type="url"
                    required
                    placeholder="Hoặc dán link video MP4 trực tiếp..."
                    value={videoUrl}
                    onChange={(e) => setVideoUrl(e.target.value)}
                    className="w-full bg-neutral-800 border border-neutral-700 rounded-xl px-3.5 py-2 text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-orange-500 font-mono"
                  />
                </div>

                {/* Quick Pick Samples */}
                <div className="flex flex-wrap gap-2 items-center pt-1">
                  <span className="text-[11px] text-neutral-400">Hoặc chọn nhanh video mẫu:</span>
                  {sampleVideos.map((sample, idx) => (
                    <button
                      type="button"
                      key={idx}
                      onClick={() => {
                        setVideoUrl(sample.url);
                        setUploadedFileName(null);
                      }}
                      className="text-[10px] bg-neutral-800 hover:bg-neutral-700 px-2 py-1 rounded-md text-orange-400 border border-neutral-700 transition-colors"
                    >
                      {sample.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Video Preview if URL exists */}
              {videoUrl && (
                <div className="p-3 bg-neutral-800/60 rounded-xl border border-neutral-700/60 space-y-2">
                  <span className="text-xs font-semibold text-neutral-300 flex items-center space-x-1.5">
                    <Video className="w-3.5 h-3.5 text-orange-400" />
                    <span>Xem trước video:</span>
                  </span>
                  <div className="w-32 h-44 rounded-lg overflow-hidden bg-black mx-auto">
                    <video src={videoUrl} className="w-full h-full object-cover" controls playsInline />
                  </div>
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-neutral-300 mb-1.5">
                    Tên kênh / Người bán
                  </label>
                  <input
                    type="text"
                    value={uploaderName}
                    onChange={(e) => setUploaderName(e.target.value)}
                    className="w-full bg-neutral-800 border border-neutral-700 rounded-xl px-3.5 py-2 text-xs text-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-neutral-300 mb-1.5">
                    Gắn thẻ Sản phẩm nổi trên video
                  </label>
                  <select
                    value={selectedProductId}
                    onChange={(e) => setSelectedProductId(Number(e.target.value))}
                    className="w-full bg-neutral-800 border border-neutral-700 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-orange-500"
                  >
                    <option value="">-- Không gắn sản phẩm --</option>
                    {products.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.title} ({Number(p.price).toLocaleString('vi-VN')}₫)
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading || isUploadingFile}
                className="w-full py-3 rounded-xl bg-orange-500 hover:bg-orange-600 text-black font-bold text-xs flex items-center justify-center space-x-2 shadow-lg shadow-orange-500/20 transition-all active:scale-95 disabled:opacity-50 mt-2"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Đang đăng tải...</span>
                  </>
                ) : (
                  <>
                    <Plus className="w-4 h-4" />
                    <span>Đăng video lên Feed ngay</span>
                  </>
                )}
              </button>
            </form>
          </div>
        )}

        {activeTab === 'orders' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-bold text-neutral-200">Danh sách Đơn hàng & Quản lý VietQR</h2>
              <span className="text-xs text-neutral-400">{orders.length} đơn hàng</span>
            </div>

            {orders.length === 0 ? (
              <div className="bg-neutral-900 rounded-2xl border border-neutral-800 p-12 text-center text-neutral-500 space-y-2">
                <Package className="w-10 h-10 mx-auto text-neutral-600" />
                <p className="text-xs">Chưa có đơn hàng nào.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {orders.map((ord) => (
                  <div
                    key={ord.id}
                    className="bg-neutral-900 rounded-2xl border border-neutral-800 p-4 space-y-3 transition-colors hover:border-neutral-700"
                  >
                    <div className="flex flex-col md:flex-row md:items-center justify-between pb-2 border-b border-neutral-800 gap-2">
                      <div className="flex items-center space-x-2">
                        <span className="font-mono font-bold text-xs text-orange-400">
                          {ord.order_code}
                        </span>
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                          ord.is_paid
                            ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                            : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                        }`}>
                          {ord.is_paid ? 'Đã thanh toán VietQR' : 'Chờ chuyển khoản'}
                        </span>
                        <span className="text-[11px] text-neutral-500">
                          {new Date(ord.created_at).toLocaleString('vi-VN')}
                        </span>
                      </div>

                      <div className="flex items-center space-x-2">
                        <span className="text-xs text-neutral-400">Trạng thái:</span>
                        <select
                          value={ord.status}
                          onChange={(e) => handleStatusChange(ord.id, e.target.value)}
                          className="bg-neutral-800 border border-neutral-700 text-neutral-200 text-xs rounded-lg px-2 py-1 focus:outline-none"
                        >
                          <option value="pending">Chờ thanh toán</option>
                          <option value="confirmed">Đã xác nhận</option>
                          <option value="shipping">Đang vận chuyển</option>
                          <option value="completed">Đã hoàn thành</option>
                          <option value="cancelled">Đã hủy</option>
                        </select>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                      <div className="space-y-1">
                        <p className="text-neutral-300">
                          <strong>Khách hàng:</strong> {ord.customer_name} ({ord.customer_phone})
                        </p>
                        <p className="text-neutral-400 line-clamp-1">
                          <strong>Địa chỉ:</strong> {ord.shipping_address}
                        </p>
                        {ord.note && (
                          <p className="text-amber-300/80 text-[11px]">
                            <strong>Ghi chú:</strong> {ord.note}
                          </p>
                        )}
                      </div>

                      <div className="flex flex-col md:items-end justify-between">
                        <div className="space-y-0.5 md:text-right">
                          <p className="text-neutral-400">
                            {ord.items?.length || 1} sản phẩm
                          </p>
                          <p className="text-base font-extrabold text-orange-400">
                            {Number(ord.total_amount).toLocaleString('vi-VN')}₫
                          </p>
                        </div>

                        {!ord.is_paid && (
                          <button
                            onClick={() => handleConfirmPayment(ord.id)}
                            className="mt-2 md:mt-0 px-3 py-1.5 rounded-lg bg-emerald-500 hover:bg-emerald-600 text-black font-bold text-[11px] flex items-center space-x-1 shadow transition-all active:scale-95 self-start md:self-auto"
                          >
                            <Check className="w-3.5 h-3.5" />
                            <span>Xác nhận đã nhận tiền (VietQR)</span>
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
