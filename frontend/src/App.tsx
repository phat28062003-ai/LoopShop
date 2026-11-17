import React, { useState, useEffect, useRef } from 'react';
import { 
  Play, 
  ShoppingBag, 
  Upload, 
  ShieldCheck, 
  Smartphone, 
  Monitor, 
  RefreshCw, 
  ChevronDown, 
  ChevronUp,
  PackageCheck
} from 'lucide-react';
import type { VideoItem, Product, CartItem, Order } from './types';
import { api } from './services/api';
import { VideoPlayer } from './components/VideoPlayer';
import { ProductDrawer } from './components/ProductDrawer';
import { CartModal } from './components/CartModal';
import { VietQRCheckoutModal } from './components/VietQRCheckoutModal';
import { ReportModal } from './components/ReportModal';
import { CommentDrawer } from './components/CommentDrawer';
import { OrderHistoryModal } from './components/OrderHistoryModal';
import { AdminLoginModal } from './components/AdminLoginModal';
import { SellerStudio } from './components/SellerStudio';
import { AdminDashboard } from './components/AdminDashboard';

export const App: React.FC = () => {
  const [currentTab, setCurrentTab] = useState<'feed' | 'seller' | 'admin'>('feed');
  const [videos, setVideos] = useState<VideoItem[]>([]);
  const [currentVideoIndex, setCurrentVideoIndex] = useState<number>(0);
  const [isMuted, setIsMuted] = useState<boolean>(true); // start muted for autoplay compliance
  const [cart, setCart] = useState<CartItem[]>([]);
  const [isMobileFrame, setIsMobileFrame] = useState<boolean>(true); // preview frame on desktop
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Security & Admin Authentication State
  const [isAdminLoggedIn, setIsAdminLoggedIn] = useState<boolean>(
    () => localStorage.getItem('loopshop_admin_auth') === 'true'
  );
  const [isAdminLoginOpen, setIsAdminLoginOpen] = useState<boolean>(false);
  const pressTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Modals state
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [isProductDrawerOpen, setIsProductDrawerOpen] = useState<boolean>(false);
  const [isCartModalOpen, setIsCartModalOpen] = useState<boolean>(false);
  const [isCheckoutModalOpen, setIsCheckoutModalOpen] = useState<boolean>(false);
  const [reportVideo, setReportVideo] = useState<VideoItem | null>(null);
  const [isReportModalOpen, setIsReportModalOpen] = useState<boolean>(false);
  
  // Comment & Order History Modals
  const [activeCommentVideoId, setActiveCommentVideoId] = useState<number | null>(null);
  const [isCommentDrawerOpen, setIsCommentDrawerOpen] = useState<boolean>(false);
  const [isOrderHistoryOpen, setIsOrderHistoryOpen] = useState<boolean>(false);
  const [reopenVietQROrder, setReopenVietQROrder] = useState<Order | null>(null);

  const containerRef = useRef<HTMLDivElement>(null);

  // Check URL query param for secret admin trigger (e.g. ?admin=true)
  useEffect(() => {
    if (window.location.search.includes('admin=true')) {
      setIsAdminLoginOpen(true);
    }
  }, []);

  // Ensure unauthorized users cannot stay on seller or admin tabs
  useEffect(() => {
    if (!isAdminLoggedIn && (currentTab === 'seller' || currentTab === 'admin')) {
      setCurrentTab('feed');
    }
  }, [isAdminLoggedIn, currentTab]);

  // Long press handlers on Logo (1.5 seconds)
  const handleLogoPressStart = () => {
    pressTimerRef.current = setTimeout(() => {
      setIsAdminLoginOpen(true);
      if (navigator.vibrate) {
        navigator.vibrate(50); // haptic feedback on mobile if supported
      }
    }, 1500);
  };

  const handleLogoPressEnd = () => {
    if (pressTimerRef.current) {
      clearTimeout(pressTimerRef.current);
      pressTimerRef.current = null;
    }
  };

  const handleLoginSuccess = () => {
    setIsAdminLoggedIn(true);
    localStorage.setItem('loopshop_admin_auth', 'true');
    setCurrentTab('admin');
  };

  const handleAdminLogout = () => {
    localStorage.removeItem('loopshop_admin_auth');
    setIsAdminLoggedIn(false);
    setCurrentTab('feed');
  };

  // Load videos
  const fetchFeedVideos = async () => {
    try {
      setIsLoading(true);
      const data = await api.getVideos();
      setVideos(data);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchFeedVideos();
  }, []);

  // Keyboard navigation for video feed (Arrow Up / Down)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (currentTab !== 'feed') return;
      if (
        isProductDrawerOpen || 
        isCartModalOpen || 
        isCheckoutModalOpen || 
        isReportModalOpen || 
        isCommentDrawerOpen || 
        isOrderHistoryOpen ||
        isAdminLoginOpen
      ) return;

      if (e.key === 'ArrowDown') {
        e.preventDefault();
        scrollToIndex(Math.min(videos.length - 1, currentVideoIndex + 1));
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        scrollToIndex(Math.max(0, currentVideoIndex - 1));
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentVideoIndex, videos.length, currentTab, isProductDrawerOpen, isCartModalOpen, isCheckoutModalOpen, isReportModalOpen, isCommentDrawerOpen, isOrderHistoryOpen, isAdminLoginOpen]);

  // Handle scroll snap index detection
  const handleScroll = () => {
    const container = containerRef.current;
    if (!container) return;

    const height = container.clientHeight;
    if (height === 0) return;

    const newIndex = Math.round(container.scrollTop / height);
    if (newIndex !== currentVideoIndex && newIndex >= 0 && newIndex < videos.length) {
      setCurrentVideoIndex(newIndex);
    }
  };

  const scrollToIndex = (index: number) => {
    const container = containerRef.current;
    if (!container) return;
    const height = container.clientHeight;
    container.scrollTo({
      top: index * height,
      behavior: 'smooth',
    });
    setCurrentVideoIndex(index);
  };

  // Cart operations
  const handleAddToCart = (product: Product, quantity: number) => {
    setCart((prev) => {
      const existing = prev.find((item) => item.product.id === product.id);
      if (existing) {
        return prev.map((item) =>
          item.product.id === product.id
            ? { ...item, quantity: item.quantity + quantity }
            : item
        );
      }
      return [...prev, { product, quantity }];
    });
  };

  const handleUpdateCartQuantity = (productId: number, newQty: number) => {
    if (newQty <= 0) {
      handleRemoveCartItem(productId);
      return;
    }
    setCart((prev) =>
      prev.map((item) =>
        item.product.id === productId ? { ...item, quantity: newQty } : item
      )
    );
  };

  const handleRemoveCartItem = (productId: number) => {
    setCart((prev) => prev.filter((item) => item.product.id !== productId));
  };

  const handleBuyNow = (product: Product, quantity: number) => {
    handleAddToCart(product, quantity);
    setIsCheckoutModalOpen(true);
  };

  const handleLike = async (videoId: number) => {
    try {
      await api.likeVideo(videoId);
    } catch (err) {
      console.error(err);
    }
  };

  const handleOpenComments = (videoId: number) => {
    setActiveCommentVideoId(videoId);
    setIsCommentDrawerOpen(true);
  };

  const totalCartCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <div className="w-screen h-screen bg-neutral-950 flex flex-col md:flex-row items-center justify-center overflow-hidden">
      {/* Desktop Top Control Bar (Only visible on wide screens) */}
      <div className="hidden md:flex fixed top-3 left-4 right-4 z-40 items-center justify-between pointer-events-none">
        {/* Brand Logo with Long-Press Secret Gate */}
        <div 
          onMouseDown={handleLogoPressStart}
          onMouseUp={handleLogoPressEnd}
          onTouchStart={handleLogoPressStart}
          onTouchEnd={handleLogoPressEnd}
          className="flex items-center space-x-2 bg-neutral-900/90 backdrop-blur-md px-3.5 py-1.5 rounded-2xl border border-neutral-800 shadow-xl pointer-events-auto cursor-pointer select-none active:scale-95 transition-transform"
          title="Nhấn giữ 2 giây để mở đăng nhập Quản trị viên"
        >
          <div className="w-2.5 h-2.5 rounded-full bg-rose-500 animate-ping"></div>
          <span className="font-bold text-xs tracking-tight text-white">LoopShop</span>
          {isAdminLoggedIn ? (
            <span className="text-[10px] bg-rose-500/20 text-rose-400 font-bold px-2 py-0.5 rounded-full border border-rose-500/30">
              Admin Mode (Phát)
            </span>
          ) : (
            <span className="text-[10px] bg-orange-500/20 text-orange-400 font-semibold px-2 py-0.5 rounded-full">
              Video & Mua Sắm
            </span>
          )}
        </div>

        <div className="flex items-center space-x-2 pointer-events-auto">
          {/* Order Tracking button on desktop */}
          <button
            onClick={() => setIsOrderHistoryOpen(true)}
            className="flex items-center space-x-1.5 bg-neutral-900/90 backdrop-blur-md px-3 py-1.5 rounded-xl border border-neutral-800 text-xs text-neutral-300 hover:text-white shadow-xl transition-all"
            title="Tra cứu đơn hàng"
          >
            <PackageCheck className="w-4 h-4 text-emerald-400" />
            <span>Đơn mua của tôi</span>
          </button>

          {/* Toggle Mobile Frame view on PC */}
          <button
            onClick={() => setIsMobileFrame(!isMobileFrame)}
            className="flex items-center space-x-1.5 bg-neutral-900/90 backdrop-blur-md px-3 py-1.5 rounded-xl border border-neutral-800 text-xs text-neutral-300 hover:text-white shadow-xl transition-all"
            title="Đổi giữa khung điện thoại và toàn màn hình"
          >
            {isMobileFrame ? <Monitor className="w-4 h-4 text-amber-400" /> : <Smartphone className="w-4 h-4 text-emerald-400" />}
            <span>{isMobileFrame ? 'Chế độ Toàn màn hình' : 'Chế độ Khung Mobile'}</span>
          </button>
        </div>
      </div>

      {/* Main Container / Mobile Frame Wrapper */}
      <div
        className={`relative w-full h-full flex flex-col transition-all duration-300 overflow-hidden ${
          isMobileFrame
            ? 'md:max-w-[420px] md:h-[94vh] md:max-h-[880px] md:rounded-[40px] md:border-[10px] md:border-neutral-800 md:shadow-2xl md:ring-1 md:ring-white/10'
            : 'max-w-none h-full'
        }`}
      >
        {/* Dynamic Island / Mobile Notch on frame */}
        {isMobileFrame && (
          <div className="hidden md:flex absolute top-2 left-1/2 -translate-x-1/2 w-28 h-4 bg-neutral-800 rounded-full z-40 items-center justify-center">
            <span className="w-2 h-2 rounded-full bg-neutral-900"></span>
          </div>
        )}

        {/* Tab Views */}
        <div className="flex-1 w-full h-full relative overflow-hidden bg-black">
          {/* TAB 1: VERTICAL VIDEO FEED (Buyer) */}
          {currentTab === 'feed' && (
            <div className="relative w-full h-full">
              {isLoading ? (
                <div className="w-full h-full flex flex-col items-center justify-center text-neutral-400 space-y-3 bg-neutral-950">
                  <RefreshCw className="w-8 h-8 text-orange-500 animate-spin" />
                  <p className="text-xs">Đang tải video ngắn...</p>
                </div>
              ) : videos.length === 0 ? (
                <div className="w-full h-full flex flex-col items-center justify-center text-neutral-400 p-6 text-center space-y-3 bg-neutral-950">
                  <p className="text-sm font-semibold">Chưa có video nào trên Feed</p>
                  {isAdminLoggedIn && (
                    <button
                      onClick={() => setCurrentTab('seller')}
                      className="px-4 py-2 rounded-xl bg-orange-500 text-black text-xs font-bold"
                    >
                      Đăng video ngay
                    </button>
                  )}
                </div>
              ) : (
                <>
                  {/* Top Mobile Brand with Long-Press Secret Gate */}
                  <div 
                    onMouseDown={handleLogoPressStart}
                    onMouseUp={handleLogoPressEnd}
                    onTouchStart={handleLogoPressStart}
                    onTouchEnd={handleLogoPressEnd}
                    className="absolute top-4 left-4 z-30 select-none cursor-pointer flex items-center space-x-1.5 bg-black/40 backdrop-blur-md px-3 py-1 rounded-full border border-white/10 active:scale-95 transition-all"
                    title="Nhấn giữ 2 giây để mở Admin"
                  >
                    <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse"></span>
                    <span className="text-xs font-extrabold tracking-tight text-white">LoopShop</span>
                    {isAdminLoggedIn && (
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
                    )}
                  </div>

                  {/* Scrollable vertical snap feed */}
                  <div
                    ref={containerRef}
                    onScroll={handleScroll}
                    className="w-full h-full overflow-y-scroll snap-y-mandatory no-scrollbar"
                  >
                    {videos.map((video, idx) => (
                      <div
                        key={video.id}
                        className="w-full h-full snap-start relative flex-shrink-0"
                      >
                        <VideoPlayer
                          video={video}
                          isActive={idx === currentVideoIndex}
                          isMuted={isMuted}
                          onToggleMute={() => setIsMuted(!isMuted)}
                          onOpenProduct={(prod) => {
                            setSelectedProduct(prod);
                            setIsProductDrawerOpen(true);
                          }}
                          onOpenReport={(vid) => {
                            setReportVideo(vid);
                            setIsReportModalOpen(true);
                          }}
                          onOpenComments={handleOpenComments}
                          onLike={handleLike}
                        />
                      </div>
                    ))}
                  </div>

                  {/* Desktop floating scroll buttons */}
                  <div className="hidden md:flex flex-col space-y-2 absolute right-4 top-1/2 -translate-y-1/2 z-30 pointer-events-none">
                    <button
                      onClick={() => scrollToIndex(Math.max(0, currentVideoIndex - 1))}
                      disabled={currentVideoIndex === 0}
                      className="p-2 rounded-full bg-black/60 backdrop-blur-md text-white hover:bg-black/90 pointer-events-auto disabled:opacity-30 transition-all shadow"
                    >
                      <ChevronUp className="w-5 h-5" />
                    </button>
                    <button
                      onClick={() => scrollToIndex(Math.min(videos.length - 1, currentVideoIndex + 1))}
                      disabled={currentVideoIndex === videos.length - 1}
                      className="p-2 rounded-full bg-black/60 backdrop-blur-md text-white hover:bg-black/90 pointer-events-auto disabled:opacity-30 transition-all shadow"
                    >
                      <ChevronDown className="w-5 h-5" />
                    </button>
                  </div>

                  {/* Floating Top Right Buttons on Feed: Order Tracking + Cart */}
                  <div className="absolute top-4 right-14 z-30 flex items-center space-x-2">
                    <button
                      onClick={() => setIsOrderHistoryOpen(true)}
                      className="p-2.5 rounded-full bg-black/50 backdrop-blur-md text-white hover:bg-black/70 transition-all shadow-lg active:scale-95"
                      title="Đơn mua của tôi"
                    >
                      <PackageCheck className="w-5 h-5 text-emerald-400" />
                    </button>

                    <button
                      onClick={() => setIsCartModalOpen(true)}
                      className="relative p-2.5 rounded-full bg-black/50 backdrop-blur-md text-white hover:bg-black/70 transition-all shadow-lg active:scale-95"
                      title="Mở giỏ hàng"
                    >
                      <ShoppingBag className="w-5 h-5 text-orange-400" />
                      {totalCartCount > 0 && (
                        <span className="absolute -top-1 -right-1 bg-rose-500 text-white text-[10px] font-black w-5 h-5 rounded-full flex items-center justify-center shadow">
                          {totalCartCount}
                        </span>
                      )}
                    </button>
                  </div>
                </>
              )}
            </div>
          )}

          {/* TAB 2: SELLER STUDIO (Admin/Seller Only) */}
          {currentTab === 'seller' && isAdminLoggedIn && <SellerStudio />}

          {/* TAB 3: ADMIN DASHBOARD (Admin Phát Only) */}
          {currentTab === 'admin' && isAdminLoggedIn && (
            <AdminDashboard onLogout={handleAdminLogout} />
          )}
        </div>

        {/* Global Bottom Navigation Bar */}
        <div className="w-full bg-neutral-900/95 backdrop-blur-md border-t border-neutral-800 px-3 py-2 flex items-center justify-around z-30">
          {/* Public Tab 1: Video Feed */}
          <button
            onClick={() => setCurrentTab('feed')}
            className={`flex flex-col items-center py-1 px-3 rounded-xl transition-all ${
              currentTab === 'feed'
                ? 'text-orange-400 font-bold scale-105'
                : 'text-neutral-400 hover:text-white'
            }`}
          >
            <Play className={`w-5 h-5 ${currentTab === 'feed' ? 'fill-orange-400' : ''}`} />
            <span className="text-[10px] mt-0.5">Feed Video</span>
          </button>

          {/* Public Tab 2: Order Tracking */}
          <button
            onClick={() => setIsOrderHistoryOpen(true)}
            className="flex flex-col items-center py-1 px-3 text-neutral-400 hover:text-white transition-all"
          >
            <PackageCheck className="w-5 h-5 text-emerald-400" />
            <span className="text-[10px] mt-0.5">Đơn mua</span>
          </button>

          {/* Public Tab 3: Cart */}
          <button
            onClick={() => setIsCartModalOpen(true)}
            className="relative flex flex-col items-center py-1 px-3 text-neutral-400 hover:text-white transition-all"
          >
            <ShoppingBag className="w-5 h-5 text-orange-400" />
            <span className="text-[10px] mt-0.5">Giỏ hàng</span>
            {totalCartCount > 0 && (
              <span className="absolute top-0 right-3 bg-rose-500 text-white text-[9px] font-bold w-4 h-4 rounded-full flex items-center justify-center">
                {totalCartCount}
              </span>
            )}
          </button>

          {/* PRIVILEGED TABS: ONLY VISIBLE WHEN ADMIN LOGGED IN */}
          {isAdminLoggedIn && (
            <>
              <button
                onClick={() => setCurrentTab('seller')}
                className={`flex flex-col items-center py-1 px-3 rounded-xl transition-all ${
                  currentTab === 'seller'
                    ? 'text-orange-400 font-bold scale-105'
                    : 'text-neutral-400 hover:text-white'
                }`}
              >
                <Upload className="w-5 h-5" />
                <span className="text-[10px] mt-0.5">Người Bán</span>
              </button>

              <button
                onClick={() => setCurrentTab('admin')}
                className={`flex flex-col items-center py-1 px-3 rounded-xl transition-all ${
                  currentTab === 'admin'
                    ? 'text-rose-400 font-bold scale-105'
                    : 'text-neutral-400 hover:text-white'
                }`}
              >
                <ShieldCheck className="w-5 h-5 text-rose-400" />
                <span className="text-[10px] mt-0.5 text-rose-400 font-semibold">Admin Phát</span>
              </button>
            </>
          )}
        </div>
      </div>

      {/* Global Modals */}
      <ProductDrawer
        product={selectedProduct}
        isOpen={isProductDrawerOpen}
        onClose={() => setIsProductDrawerOpen(false)}
        onAddToCart={handleAddToCart}
        onBuyNow={handleBuyNow}
      />

      <CartModal
        isOpen={isCartModalOpen}
        cart={cart}
        onClose={() => setIsCartModalOpen(false)}
        onUpdateQuantity={handleUpdateCartQuantity}
        onRemoveItem={handleRemoveCartItem}
        onProceedCheckout={() => setIsCheckoutModalOpen(true)}
      />

      <VietQRCheckoutModal
        isOpen={isCheckoutModalOpen}
        cart={cart}
        onClose={() => setIsCheckoutModalOpen(false)}
        onOrderSuccess={() => setCart([])}
      />

      <ReportModal
        video={reportVideo}
        isOpen={isReportModalOpen}
        onClose={() => setIsReportModalOpen(false)}
      />

      <CommentDrawer
        videoId={activeCommentVideoId}
        isOpen={isCommentDrawerOpen}
        onClose={() => setIsCommentDrawerOpen(false)}
        onCommentAdded={fetchFeedVideos}
      />

      <OrderHistoryModal
        isOpen={isOrderHistoryOpen}
        onClose={() => setIsOrderHistoryOpen(false)}
        onOpenVietQR={(ord) => setReopenVietQROrder(ord)}
      />

      {/* Secret Admin Login Modal */}
      <AdminLoginModal
        isOpen={isAdminLoginOpen}
        onClose={() => setIsAdminLoginOpen(false)}
        onLoginSuccess={handleLoginSuccess}
      />

      {/* Reopen VietQR QR Code modal from order history */}
      {reopenVietQROrder && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in"
          onClick={() => setReopenVietQROrder(null)}
        >
          <div 
            className="w-full max-w-sm bg-neutral-900 rounded-2xl p-5 border border-neutral-800 text-center space-y-4"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="font-bold text-sm text-white">
              Mã VietQR - {reopenVietQROrder.order_code}
            </h3>
            <div className="bg-white p-3 rounded-xl mx-auto w-fit">
              <img src={reopenVietQROrder.vietqr_url} alt="VietQR" className="w-52 h-auto mx-auto" />
            </div>
            <p className="text-xs text-orange-400 font-bold">
              Số tiền: {Number(reopenVietQROrder.total_amount).toLocaleString('vi-VN')}₫
            </p>
            <p className="text-[11px] text-neutral-400">
              Nội dung CK: <strong className="text-rose-400">DON HANG {reopenVietQROrder.order_code}</strong>
            </p>
            <button
              onClick={() => setReopenVietQROrder(null)}
              className="w-full py-2 rounded-xl bg-neutral-800 text-white text-xs font-semibold"
            >
              Đóng
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default App;
