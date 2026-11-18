import React, { useState, useEffect, useRef } from 'react';
import { Upload, Plus, Package, CheckCircle2, Check, RefreshCw, Loader2, Video, FileVideo, AlertTriangle, ShoppingBag, Trash2 } from 'lucide-react';
import type { Product, Order } from '../types';
import { api, resolveMediaUrl } from '../services/api';

export const SellerStudio: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'upload' | 'products' | 'orders'>('upload');
  const [products, setProducts] = useState<Product[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // New Product Form state in SellerStudio
  const [isAddingProd, setIsAddingProd] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newPrice, setNewPrice] = useState<number>(189000);
  const [newOriginalPrice, setNewOriginalPrice] = useState<number | ''>(250000);
  const [newCategory, setNewCategory] = useState('tech');
  const [newStock, setNewStock] = useState<number>(100);
  const [newImage, setNewImage] = useState('https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600');
  const [newDesc, setNewDesc] = useState('');
  const [isSavingProd, setIsSavingProd] = useState(false);

  // Upload Form state
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [videoUrl, setVideoUrl] = useState('');
  const [previewUrl, setPreviewUrl] = useState('');
  const [previewError, setPreviewError] = useState<string | null>(null);
  const [uploaderName, setUploaderName] = useState('phat_seller');
  const [selectedProductId, setSelectedProductId] = useState<number | ''>('');
  const [uploadSuccess, setUploadSuccess] = useState<string | null>(null);

  // 1-Click Auto Upload & Publish State
  const [autoPublish, setAutoPublish] = useState<boolean>(true);
  const [showAdvancedUrl, setShowAdvancedUrl] = useState<boolean>(false);

  // Direct File Upload state
  const [isUploadingFile, setIsUploadingFile] = useState(false);
  const [uploadedFileName, setUploadedFileName] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Sample video templates for quick test
  const sampleVideos = [
    { label: 'Demo 1: Công nghệ', url: '/videos/v1.mp4' },
    { label: 'Demo 2: Thời trang', url: '/videos/v2.mp4' },
    { label: 'Demo 3: Lifestyle', url: '/videos/v4.mp4' },
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

    // Reset input
    e.target.value = '';

    // Kiểm tra nếu người dùng chọn nhầm file HTML / Trang web
    if (file.type === 'text/html' || file.name.endsWith('.html') || file.name.endsWith('.htm') || file.name.endsWith('.mhtml')) {
      alert('Tệp tin này là trang web (HTML) chứ không phải file video MP4/WebM! Nếu bạn lấy kịch bản từ AI (như Dola), hãy xuất file video thực tế hoặc chọn mẫu video có sẵn bên dưới.');
      return;
    }

    // Xem trước tức thì 0ms qua blob
    try {
      const localBlob = URL.createObjectURL(file);
      setPreviewUrl(localBlob);
      setPreviewError(null);
    } catch {}

    // Tự động trích xuất tiêu đề sạch từ tên file
    const cleanTitle = file.name
      .replace(/\.[^/.]+$/, '')
      .replace(/[_-]+/g, ' ')
      .trim();
    const finalTitle = cleanTitle ? (cleanTitle.charAt(0).toUpperCase() + cleanTitle.slice(1)) : 'Video sản phẩm mới';

    setTitle(finalTitle);
    setUploadedFileName(file.name);

    try {
      setIsUploadingFile(true);
      const res = await api.uploadVideoFile(file);
      const targetUrl = res.video_url || res.full_url || resolveMediaUrl(res.relative_url);
      setVideoUrl(targetUrl);

      // NẾU BẬT CHẾ ĐỘ "UP FILE LÀ LÊN LUÔN" (AUTO PUBLISH)
      if (autoPublish) {
        setIsLoading(true);
        const prodId = selectedProductId || (products.length > 0 ? products[0].id : undefined);
        const selectedProd = products.find(p => p.id === Number(prodId));

        const newVideo = await api.createVideo({
          title: finalTitle,
          description: description.trim() || 'Video giới thiệu sản phẩm trực tiếp từ Shop!',
          video_url: targetUrl,
          uploader_name: uploaderName || 'phat_seller',
          thumbnail_url: selectedProd?.image_url || '',
          product_id: prodId ? Number(prodId) : undefined,
        });

        if (prodId) {
          await api.attachProductToVideo(newVideo.id, Number(prodId)).catch(() => null);
        }

        setUploadSuccess(`🎉 ĐÃ ĐĂNG VIDEO LÊN FEED THÀNH CÔNG! "${finalTitle}" đã sẵn sàng cho khách hàng xem và mua sắm.`);
        setTitle('');
        setDescription('');
        setVideoUrl('');
        setPreviewUrl('');
        setUploadedFileName(null);
        setTimeout(() => setUploadSuccess(null), 8000);
      }
    } catch (err: any) {
      console.error(err);
      alert(err?.message || 'Không thể tải file video lên, bạn có thể dán link URL trực tiếp!');
    } finally {
      setIsUploadingFile(false);
      setIsLoading(false);
    }
  };

  const handleCreateVideo = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      alert('Vui lòng nhập tiêu đề video!');
      return;
    }
    if (!videoUrl.trim()) {
      alert('Vui lòng chọn file video hoặc nhập link URL!');
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

  const handleCreateProductInStudio = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) {
      alert('Vui lòng nhập tên sản phẩm!');
      return;
    }
    if (!newPrice || newPrice <= 0) {
      alert('Vui lòng nhập giá hợp lệ!');
      return;
    }

    try {
      setIsSavingProd(true);
      const created = await api.createProduct({
        title: newTitle.trim(),
        description: newDesc.trim(),
        category: newCategory,
        price: newPrice,
        original_price: newOriginalPrice ? Number(newOriginalPrice) : undefined,
        stock: Number(newStock) || 0,
        seller_name: 'Phát Official Store',
        image_url: newImage.trim() || 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600',
        is_active: true,
      });

      await loadData();
      setSelectedProductId(created.id);
      setIsAddingProd(false);
      setNewTitle('');
      setNewDesc('');
      alert(`🎉 Đã thêm sản phẩm "${created.title}" thành công!`);
    } catch (err: any) {
      console.error(err);
      alert(err?.message || 'Không thể tạo sản phẩm mới!');
    } finally {
      setIsSavingProd(false);
    }
  };

  const handleDeleteProductInStudio = async (id: number, name: string) => {
    if (!confirm(`Bạn có chắc chắn muốn xóa sản phẩm "${name}"?`)) return;
    try {
      await api.deleteProduct(id);
      await loadData();
    } catch (err: any) {
      console.error(err);
      alert('Không thể xóa sản phẩm!');
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
          onClick={() => setActiveTab('products')}
          className={`flex-1 py-2.5 text-xs font-semibold rounded-lg flex items-center justify-center space-x-2 transition-all ${
            activeTab === 'products'
              ? 'bg-orange-500 text-black shadow-lg font-bold'
              : 'text-neutral-400 hover:text-white'
          }`}
        >
          <ShoppingBag className="w-4 h-4" />
          <span>Sản phẩm của Shop ({products.length})</span>
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

            {/* Direct File Upload Zone */}
            <div className="space-y-3">
              {/* Auto Publish Switch */}
              <div className="flex items-center justify-between p-3.5 rounded-2xl bg-gradient-to-r from-orange-500/15 via-neutral-900 to-neutral-900 border border-orange-500/30">
                <div className="flex items-center space-x-2.5">
                  <span className="text-lg">⚡</span>
                  <div>
                    <p className="text-xs font-bold text-orange-300">Chế độ Siêu Tốc (Up file là đăng luôn)</p>
                    <p className="text-[11px] text-neutral-400">
                      Chọn file video từ thiết bị $\rightarrow$ Hệ thống tự động đặt tiêu đề & đăng ngay lên feed
                    </p>
                  </div>
                </div>
                <input
                  type="checkbox"
                  checked={autoPublish}
                  onChange={(e) => setAutoPublish(e.target.checked)}
                  className="w-4 h-4 rounded text-orange-500 focus:ring-orange-400 bg-neutral-800 border-neutral-700 cursor-pointer"
                />
              </div>

              {/* Upload Dropzone */}
              <div 
                onClick={() => fileInputRef.current?.click()}
                className={`border-2 border-dashed rounded-2xl p-5 text-center cursor-pointer transition-all flex flex-col items-center justify-center space-y-2 ${
                  isUploadingFile
                    ? 'border-orange-500 bg-orange-500/10'
                    : uploadedFileName
                    ? 'border-emerald-500/60 bg-emerald-950/20 hover:border-emerald-500'
                    : 'border-neutral-700 hover:border-orange-500/70 bg-neutral-800/40'
                }`}
              >
                <input
                  type="file"
                  ref={fileInputRef}
                  accept="video/*"
                  onChange={handleFileChange}
                  className="hidden"
                />

                {isUploadingFile ? (
                  <div className="flex flex-col items-center space-y-2 py-3 text-orange-400 text-xs">
                    <Loader2 className="w-7 h-7 animate-spin" />
                    <span className="font-bold">
                      {autoPublish ? 'Đang tải file & tự động đăng ngay lên Feed...' : 'Đang tải file video lên server...'}
                    </span>
                    <span className="text-[10px] text-neutral-400">{uploadedFileName}</span>
                  </div>
                ) : uploadedFileName ? (
                  <div className="flex flex-col items-center space-y-1.5 text-emerald-400 text-xs py-1">
                    <div className="flex items-center space-x-2">
                      <FileVideo className="w-5 h-5 text-emerald-400" />
                      <span className="font-bold text-sm text-emerald-300">{uploadedFileName}</span>
                    </div>
                    <span className="text-neutral-400 text-[11px]">✅ Đã tải lên máy chủ! (Bấm vào đây nếu muốn đổi file khác)</span>
                  </div>
                ) : (
                  <>
                    <div className="w-12 h-12 rounded-2xl bg-orange-500/20 text-orange-400 flex items-center justify-center">
                      <FileVideo className="w-6 h-6" />
                    </div>
                    <div>
                      <p className="text-xs text-neutral-200 font-bold">
                        Bấm vào đây để chọn video từ máy hoặc điện thoại
                      </p>
                      <p className="text-[10px] text-neutral-400 mt-0.5">
                        {autoPublish ? '⚡ Video sẽ tự động đăng ngay sau khi chọn' : 'Hỗ trợ file MP4, MOV, WebM'}
                      </p>
                    </div>
                  </>
                )}
              </div>

              {/* Optional Advanced URL Input (Collapsible) */}
              <div className="pt-1">
                {!uploadedFileName && (
                  <button
                    type="button"
                    onClick={() => setShowAdvancedUrl(!showAdvancedUrl)}
                    className="text-[11px] text-neutral-400 hover:text-neutral-200 flex items-center space-x-1"
                  >
                    <span>{showAdvancedUrl ? '▲ Thu gọn nhập link' : '▼ Hoặc dán link video / chọn video mẫu'}</span>
                  </button>
                )}

                {showAdvancedUrl && !uploadedFileName && (
                  <div className="mt-2 space-y-2 p-3 bg-neutral-800/40 rounded-xl border border-neutral-700/60">
                    <input
                      type="text"
                      placeholder="Dán link video MP4 (ví dụ: https://... hoặc /videos/v1.mp4)"
                      value={videoUrl}
                      onChange={(e) => {
                        setVideoUrl(e.target.value);
                        setPreviewUrl(e.target.value);
                        setPreviewError(null);
                      }}
                      className="w-full bg-neutral-800 border border-neutral-700 rounded-xl px-3.5 py-2 text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-orange-500 font-mono"
                    />
                    <div className="flex flex-wrap gap-1.5 items-center">
                      <span className="text-[10px] text-neutral-500">Mẫu có sẵn:</span>
                      {sampleVideos.map((sample, idx) => (
                        <button
                          type="button"
                          key={idx}
                          onClick={() => {
                            setVideoUrl(sample.url);
                            setPreviewUrl(sample.url);
                            setPreviewError(null);
                            setUploadedFileName(null);
                          }}
                          className="text-[10px] bg-neutral-800 hover:bg-neutral-700 px-2 py-0.5 rounded text-orange-400 border border-neutral-700 transition-colors"
                        >
                          {sample.label}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Video Form (Only needed if NOT auto-published, or for manual editing) */}
            <form onSubmit={handleCreateVideo} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-neutral-300 mb-1.5">
                  Tiêu đề video <span className="text-rose-400">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ví dụ: Kịch bản giới thiệu tai nghe 20s..."
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

              {/* Video Preview if URL exists */}
              {(previewUrl || videoUrl) && (
                <div className="p-3 bg-neutral-800/60 rounded-xl border border-neutral-700/60 space-y-2">
                  <div className="flex items-center justify-between text-xs font-semibold text-neutral-300">
                    <span className="flex items-center space-x-1.5">
                      <Video className="w-3.5 h-3.5 text-orange-400" />
                      <span>Xem trước video:</span>
                    </span>
                    {previewError ? (
                      <span className="text-[11px] text-rose-400 font-normal flex items-center space-x-1">
                        <AlertTriangle className="w-3 h-3 flex-shrink-0" />
                        <span>{previewError}</span>
                      </span>
                    ) : (
                      <span className="text-[11px] text-emerald-400 font-normal flex items-center space-x-1">
                        <Check className="w-3 h-3 flex-shrink-0" />
                        <span>Video sẵn sàng</span>
                      </span>
                    )}
                  </div>
                  <div className="w-32 h-44 rounded-lg overflow-hidden bg-black mx-auto relative border border-neutral-700">
                    <video
                      key={previewUrl || videoUrl}
                      src={previewUrl || resolveMediaUrl(videoUrl)}
                      className="w-full h-full object-cover"
                      controls
                      playsInline
                      onLoadedData={() => setPreviewError(null)}
                      onError={() => setPreviewError('Không thể phát video (file lỗi hoặc định dạng không hỗ trợ)')}
                    />
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

        {activeTab === 'products' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-neutral-800">
              <div>
                <h2 className="text-sm font-bold text-neutral-200 flex items-center space-x-2">
                  <ShoppingBag className="w-4 h-4 text-orange-400" />
                  <span>Sản phẩm của Shop ({products.length})</span>
                </h2>
                <p className="text-xs text-neutral-400 mt-0.5">
                  Thêm mới sản phẩm để gắn vào video hoặc hiển thị cho khách mua sắm
                </p>
              </div>

              <button
                type="button"
                onClick={() => setIsAddingProd(!isAddingProd)}
                className="px-3.5 py-1.5 rounded-xl bg-orange-500 hover:bg-orange-400 text-black text-xs font-bold flex items-center space-x-1.5 shadow transition-all active:scale-95 cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>{isAddingProd ? 'Đóng form' : '+ Thêm sản phẩm mới'}</span>
              </button>
            </div>

            {/* Quick Add Product Card in Studio */}
            {isAddingProd && (
              <form onSubmit={handleCreateProductInStudio} className="p-4 bg-neutral-900 rounded-2xl border border-orange-500/40 space-y-3 animate-in fade-in duration-200">
                <h3 className="text-xs font-bold text-orange-400 flex items-center space-x-1.5">
                  <Plus className="w-3.5 h-3.5" />
                  <span>Nhập thông tin sản phẩm mới</span>
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-semibold text-neutral-300 mb-1">
                      Tên sản phẩm *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="Ví dụ: Áo hoodie nỉ bông form rộng..."
                      value={newTitle}
                      onChange={(e) => setNewTitle(e.target.value)}
                      className="w-full bg-neutral-800 border border-neutral-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-orange-500"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-neutral-300 mb-1">
                      Danh mục
                    </label>
                    <select
                      value={newCategory}
                      onChange={(e) => setNewCategory(e.target.value)}
                      className="w-full bg-neutral-800 border border-neutral-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-orange-500"
                    >
                      <option value="tech">⚡ Công nghệ</option>
                      <option value="fashion">👕 Thời trang</option>
                      <option value="lifestyle">🏠 Đời sống</option>
                      <option value="food">🍔 Ẩm thực</option>
                      <option value="beauty">💄 Làm đẹp</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-[11px] font-semibold text-neutral-300 mb-1">
                      Giá bán (VND) *
                    </label>
                    <input
                      type="number"
                      required
                      min={1000}
                      step={1000}
                      value={newPrice}
                      onChange={(e) => setNewPrice(Number(e.target.value))}
                      className="w-full bg-neutral-800 border border-neutral-700 rounded-xl px-3 py-2 text-xs text-white font-mono focus:outline-none focus:border-orange-500"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-neutral-300 mb-1">
                      Giá gốc (gạch ngang)
                    </label>
                    <input
                      type="number"
                      min={0}
                      step={1000}
                      placeholder="Không bắt buộc"
                      value={newOriginalPrice}
                      onChange={(e) => setNewOriginalPrice(e.target.value ? Number(e.target.value) : '')}
                      className="w-full bg-neutral-800 border border-neutral-700 rounded-xl px-3 py-2 text-xs text-white font-mono focus:outline-none focus:border-orange-500"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-neutral-300 mb-1">
                      Số lượng kho
                    </label>
                    <input
                      type="number"
                      min={0}
                      value={newStock}
                      onChange={(e) => setNewStock(Number(e.target.value))}
                      className="w-full bg-neutral-800 border border-neutral-700 rounded-xl px-3 py-2 text-xs text-white font-mono focus:outline-none focus:border-orange-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-neutral-300 mb-1">
                    Link ảnh sản phẩm
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="https://images.unsplash.com/..."
                    value={newImage}
                    onChange={(e) => setNewImage(e.target.value)}
                    className="w-full bg-neutral-800 border border-neutral-700 rounded-xl px-3 py-2 text-xs text-white font-mono focus:outline-none focus:border-orange-500"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-neutral-300 mb-1">
                    Mô tả ngắn
                  </label>
                  <textarea
                    rows={2}
                    placeholder="Mô tả công năng, ưu điểm sản phẩm..."
                    value={newDesc}
                    onChange={(e) => setNewDesc(e.target.value)}
                    className="w-full bg-neutral-800 border border-neutral-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-orange-500 resize-none"
                  />
                </div>

                <div className="flex items-center justify-end space-x-2 pt-1">
                  <button
                    type="button"
                    onClick={() => setIsAddingProd(false)}
                    className="px-3 py-1.5 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-neutral-300 text-xs transition-colors"
                  >
                    Hủy
                  </button>
                  <button
                    type="submit"
                    disabled={isSavingProd}
                    className="px-4 py-1.5 rounded-xl bg-orange-500 hover:bg-orange-400 text-black text-xs font-bold transition-all active:scale-95 disabled:opacity-50"
                  >
                    {isSavingProd ? 'Đang tạo...' : 'Lưu sản phẩm ngay'}
                  </button>
                </div>
              </form>
            )}

            {/* Product List Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
              {products.map((p) => (
                <div
                  key={p.id}
                  className="p-3 rounded-2xl bg-neutral-900 border border-neutral-800 flex flex-col justify-between space-y-2"
                >
                  <div className="space-y-2">
                    <div className="w-full h-36 rounded-xl overflow-hidden bg-neutral-950 border border-neutral-800 relative">
                      <img
                        src={p.image_url}
                        alt={p.title}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600';
                        }}
                      />
                      <span className="absolute top-2 right-2 bg-black/70 backdrop-blur-md px-2 py-0.5 rounded-full text-[10px] text-white font-mono">
                        Kho: {p.stock}
                      </span>
                    </div>

                    <div>
                      <h4 className="text-xs font-bold text-white line-clamp-2">{p.title}</h4>
                      <p className="text-xs font-bold text-orange-400 font-mono mt-1">
                        {Number(p.price).toLocaleString('vi-VN')}₫
                      </p>
                    </div>
                  </div>

                  <div className="pt-2 border-t border-neutral-800/80 flex items-center justify-between">
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedProductId(p.id);
                        setActiveTab('upload');
                      }}
                      className="text-[11px] text-orange-400 hover:underline font-semibold"
                    >
                      ⚡ Gắn vào video mới
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDeleteProductInStudio(p.id, p.title)}
                      className="p-1.5 text-neutral-500 hover:text-rose-400 rounded-lg hover:bg-neutral-800 transition-colors"
                      title="Xóa sản phẩm"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
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
