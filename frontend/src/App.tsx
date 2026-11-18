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
  PackageCheck,
  MessageSquare,
  Search,
  X
} from 'lucide-react';
import type { VideoItem, Product, CartItem, Order } from './types';
import { api, resolveMediaUrl } from './services/api';
import { VideoPlayer } from './components/VideoPlayer';
import { ProductDrawer } from './components/ProductDrawer';
import { CartModal, type AppliedVoucherInfo } from './components/CartModal';
import { VietQRCheckoutModal } from './components/VietQRCheckoutModal';
import { ReportModal } from './components/ReportModal';
import { CommentDrawer } from './components/CommentDrawer';
import { OrderHistoryModal } from './components/OrderHistoryModal';
import { AdminLoginModal } from './components/AdminLoginModal';
import { ChatCenterModal } from './components/ChatCenterModal';
import { SellerStudio } from './components/SellerStudio';
import { AdminDashboard } from './components/AdminDashboard';
import { ShareModal } from './components/ShareModal';

const CATEGORIES = [
  { id: 'all', label: 'Tất cả', icon: '🔥' },
  { id: 'tech', label: 'Công nghệ', icon: '⚡' },
  { id: 'fashion', label: 'Thời trang', icon: '👕' },
  { id: 'lifestyle', label: 'Đời sống', icon: '🏠' },
  { id: 'food', label: 'Ẩm thực', icon: '🍔' },
  { id: 'beauty', label: 'Làm đẹp', icon: '💄' },
];

export const App: React.FC = () => {
  const [currentTab, setCurrentTab] = useState<'feed' | 'seller' | 'admin'>('feed');
  const [videos, setVideos] = useState<VideoItem[]>([]);
  const [currentVideoIndex, setCurrentVideoIndex] = useState<number>(0);
  const [isMuted, setIsMuted] = useState<boolean>(true); // start muted for autoplay compliance

  // Giỏ hàng mẫu có sẵn sản phẩm để người dùng / Phát vào xem và trải nghiệm ngay
  const [cart, setCart] = useState<CartItem[]>(() => {
    try {
      const saved = localStorage.getItem('loopshop_cart');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch {
      // fallback
    }
    return [
      {
        product: {
          id: 1,
          seller_name: 'Phát Audio Official',
          title: 'Tai nghe không dây chống ồn TWS Pro Max (Bluetooth 5.3)',
          description: 'Âm bass cực căng, khử ồn chủ động ANC 35dB, pin trâu 30h kèm hộp sạc.',
          category: 'tech',
          price: 399000,
          original_price: 650000,
          image_url: 'https://images.unsplash.com/photo-1590658268037-6bf12165a8df?w=600&auto=format&fit=crop&q=80',
          stock: 85,
          rating: 4.9,
          sold_count: 430,
          is_active: true,
        },
        quantity: 1,
      },
      {
        product: {
          id: 2,
          seller_name: 'Streetwear by Phát',
          title: 'Áo thun Oversize Unisex Cotton 100% 250gsm Local Brand',
          description: 'Form rộng chuẩn Hàn Quốc, chất vải cotton 2 chiều dày dặn.',
          category: 'fashion',
          price: 189000,
          original_price: 290000,
          image_url: 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?w=600&auto=format&fit=crop&q=80',
          stock: 120,
          rating: 4.8,
          sold_count: 612,
          is_active: true,
        },
        quantity: 1,
      },
    ];
  });

  // Lưu giỏ hàng vào localStorage mỗi khi thay đổi
  useEffect(() => {
    try {
      localStorage.setItem('loopshop_cart', JSON.stringify(cart));
    } catch {
      // ignore
    }
  }, [cart]);

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
  const [appliedVoucher, setAppliedVoucher] = useState<AppliedVoucherInfo | null>(null);
  const [reportVideo, setReportVideo] = useState<VideoItem | null>(null);
  const [isReportModalOpen, setIsReportModalOpen] = useState<boolean>(false);
  
  // Comment & Order History Modals
  const [activeCommentVideoId, setActiveCommentVideoId] = useState<number | null>(null);
  const [isCommentDrawerOpen, setIsCommentDrawerOpen] = useState<boolean>(false);
  const [isOrderHistoryOpen, setIsOrderHistoryOpen] = useState<boolean>(false);
  const [reopenVietQROrder, setReopenVietQROrder] = useState<Order | null>(null);

  // Community & Direct Messaging State
  const [isChatCenterOpen, setIsChatCenterOpen] = useState<boolean>(false);
  const [chatTargetUser, setChatTargetUser] = useState<string | null>(null);
  const [chatAttachedProduct, setChatAttachedProduct] = useState<Product | null>(null);

  // Category & Quick Search State
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [isSearchOpen, setIsSearchOpen] = useState<boolean>(false);
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Share Modal State
  const [shareVideo, setShareVideo] = useState<VideoItem | null>(null);
  const [isShareModalOpen, setIsShareModalOpen] = useState<boolean>(false);

  const containerRef = useRef<HTMLDivElement>(null);

  // Filtered videos based on active category and search keyword
  const filteredVideos = videos.filter((video) => {
    if (selectedCategory !== 'all') {
      const vCat = video.category || (video.products && video.products[0]?.category);
      if (vCat !== selectedCategory) return false;
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      const inTitle = video.title.toLowerCase().includes(q);
      const inDesc = video.description.toLowerCase().includes(q);
      const inUploader = video.uploader_name.toLowerCase().includes(q);
      const inProduct = video.products?.some(p => 
        p.title.toLowerCase().includes(q) || (p.description && p.description.toLowerCase().includes(q))
      );
      if (!inTitle && !inDesc && !inUploader && !inProduct) return false;
    }
    return true;
  });

  const handleVideoShared = (videoId: number, newCount: number) => {
    setVideos(prev => prev.map(v => v.id === videoId ? { ...v, shares_count: newCount } : v));
  };

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
    if (currentTab === 'feed') {
      fetchFeedVideos();
    }
  }, [currentTab]);

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
        isAdminLoginOpen ||
        isChatCenterOpen ||
        isShareModalOpen ||
        isSearchOpen
      ) return;

      if (e.key === 'ArrowDown') {
        e.preventDefault();
        scrollToIndex(Math.min(filteredVideos.length - 1, currentVideoIndex + 1));
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        scrollToIndex(Math.max(0, currentVideoIndex - 1));
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [
    currentVideoIndex, 
    filteredVideos.length, 
    currentTab, 
    isProductDrawerOpen, 
    isCartModalOpen, 
    isCheckoutModalOpen, 
    isReportModalOpen, 
    isCommentDrawerOpen, 
    isOrderHistoryOpen, 
    isAdminLoginOpen,
    isChatCenterOpen,
    isShareModalOpen,
    isSearchOpen
  ]);

  // Handle scroll snap index detection
  const handleScroll = () => {
    const container = containerRef.current;
    if (!container) return;

    const height = container.clientHeight;
    if (height === 0) return;

    const newIndex = Math.round(container.scrollTop / height);
    if (newIndex !== currentVideoIndex && newIndex >= 0 && newIndex < filteredVideos.length) {
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

  // Chat handlers
  const handleStartChatWithCreator = (creatorName: string) => {
    setChatTargetUser(creatorName);
    setChatAttachedProduct(null);
    setIsChatCenterOpen(true);
  };

  const handleChatAboutProduct = (prod: Product) => {
    setChatTargetUser(prod.seller_name);
    setChatAttachedProduct(prod);
    setIsChatCenterOpen(true);
  };

  const totalCartCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <div className="w-screen h-screen bg-neutral-950 flex flex-col md:flex-row items-center justify-center overflow-hidden">
      {/* Desktop Top Control Bar (Only visible on wide screens) */}
      <div className="hidden md:flex fixed top-3 left-4 right-4 z-40 items-center justify-between pointer-events-none">
        {/* Brand Logo with 1-Click & Long-Press Secret Gate */}
        <div 
          onClick={() => {
            if (!isAdminLoggedIn) {
              setIsAdminLoginOpen(true);
            } else {
              setCurrentTab(currentTab === 'admin' ? 'feed' : 'admin');
            }
          }}
          onMouseDown={handleLogoPressStart}
          onMouseUp={handleLogoPressEnd}
          onTouchStart={handleLogoPressStart}
          onTouchEnd={handleLogoPressEnd}
          className="flex items-center space-x-2 bg-neutral-900/90 backdrop-blur-md px-3.5 py-1.5 rounded-2xl border border-neutral-800 shadow-xl pointer-events-auto cursor-pointer select-none active:scale-95 hover:border-neutral-700 transition-all"
          title="Bấm hoặc nhấn giữ để mở bảng Quản trị viên"
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
          {/* Admin & Seller controls on PC */}
          {isAdminLoggedIn ? (
            <>
              <button
                onClick={() => setCurrentTab(currentTab === 'seller' ? 'feed' : 'seller')}
                className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-xl border text-xs shadow-xl transition-all cursor-pointer ${
                  currentTab === 'seller'
                    ? 'bg-orange-500 text-black font-bold border-orange-400 scale-105'
                    : 'bg-neutral-900/90 backdrop-blur-md border-neutral-800 text-neutral-300 hover:text-white'
                }`}
                title="Đăng tải video & sản phẩm mới"
              >
                <Upload className="w-4 h-4" />
                <span>Người Bán</span>
              </button>

              <button
                onClick={() => setCurrentTab(currentTab === 'admin' ? 'feed' : 'admin')}
                className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-xl border text-xs shadow-xl transition-all cursor-pointer ${
                  currentTab === 'admin'
                    ? 'bg-rose-500 text-white font-bold border-rose-400 scale-105'
                    : 'bg-neutral-900/90 backdrop-blur-md border-rose-500/40 text-rose-300 hover:text-rose-200'
                }`}
                title="Bảng điều khiển Quản trị viên"
              >
                <ShieldCheck className="w-4 h-4 text-rose-400" />
                <span>Admin Phát</span>
              </button>
            </>
          ) : (
            <button
              onClick={() => setIsAdminLoginOpen(true)}
              className="flex items-center space-x-1.5 bg-neutral-900/90 backdrop-blur-md px-3 py-1.5 rounded-xl border border-rose-500/40 text-xs text-rose-300 hover:text-white hover:bg-rose-500/20 shadow-xl transition-all cursor-pointer"
              title="Đăng nhập Quản trị viên"
            >
              <ShieldCheck className="w-4 h-4 text-rose-400" />
              <span>Admin Phát</span>
            </button>
          )}

          {/* Chat Center button on desktop */}
          <button
            onClick={() => {
              setChatTargetUser(null);
              setChatAttachedProduct(null);
              setIsChatCenterOpen(true);
            }}
            className="flex items-center space-x-1.5 bg-neutral-900/90 backdrop-blur-md px-3 py-1.5 rounded-xl border border-neutral-800 text-xs text-orange-400 hover:text-orange-300 shadow-xl transition-all"
            title="Mở phòng chat cộng đồng & tin nhắn"
          >
            <MessageSquare className="w-4 h-4" />
            <span>Trò chuyện</span>
          </button>

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
                  <p className="text-sm font-semibold">Chưa tải được video trên Feed</p>
                  <p className="text-xs text-neutral-500 max-w-xs">
                    Máy chủ Render có thể mất vài giây để phản hồi lần đầu. Bấm nút dưới để thử lại nhé!
                  </p>
                  <button
                    onClick={fetchFeedVideos}
                    className="px-4 py-2 rounded-xl bg-orange-500 hover:bg-orange-600 text-black text-xs font-bold transition-all shadow cursor-pointer flex items-center space-x-1.5 active:scale-95"
                  >
                    <RefreshCw className="w-4 h-4" />
                    <span>Tải lại video ngay</span>
                  </button>
                  {isAdminLoggedIn && (
                    <button
                      onClick={() => setCurrentTab('seller')}
                      className="px-4 py-2 rounded-xl bg-neutral-800 text-neutral-300 text-xs font-medium"
                    >
                      Đăng video mới
                    </button>
                  )}
                </div>
              ) : (
                <>
                  {/* Top Expandable Search Overlay */}
                  {isSearchOpen && (
                    <div className="absolute top-3 left-3 right-3 z-40 flex items-center bg-neutral-900/95 backdrop-blur-md rounded-2xl border border-white/20 p-1.5 shadow-2xl animate-fade-in">
                      <Search className="w-4 h-4 text-orange-400 ml-2.5 flex-shrink-0" />
                      <input
                        ref={searchInputRef}
                        type="text"
                        value={searchQuery}
                        onChange={(e) => {
                          setSearchQuery(e.target.value);
                          scrollToIndex(0);
                        }}
                        placeholder="Tìm kiếm sản phẩm, video, idol..."
                        className="flex-1 bg-transparent text-xs text-white px-2.5 py-1.5 outline-none placeholder-neutral-400"
                        autoFocus
                      />
                      {searchQuery && (
                        <button
                          onClick={() => {
                            setSearchQuery('');
                            scrollToIndex(0);
                          }}
                          className="p-1 text-neutral-400 hover:text-white cursor-pointer"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      )}
                      <button
                        onClick={() => {
                          setIsSearchOpen(false);
                          setSearchQuery('');
                          scrollToIndex(0);
                        }}
                        className="px-2.5 py-1 text-xs text-neutral-300 hover:text-white font-medium cursor-pointer"
                      >
                        Đóng
                      </button>
                    </div>
                  )}

                  {/* Top Mobile Brand with 1-Click & Long-Press Secret Gate */}
                  <div 
                    onClick={() => {
                      if (!isAdminLoggedIn) {
                        setIsAdminLoginOpen(true);
                      } else {
                        setCurrentTab('admin');
                      }
                    }}
                    onMouseDown={handleLogoPressStart}
                    onMouseUp={handleLogoPressEnd}
                    onTouchStart={handleLogoPressStart}
                    onTouchEnd={handleLogoPressEnd}
                    className="absolute top-4 left-4 z-30 select-none cursor-pointer flex items-center space-x-1.5 bg-black/40 backdrop-blur-md px-3 py-1 rounded-full border border-white/10 active:scale-95 transition-all"
                    title="Bấm hoặc nhấn giữ để mở Admin"
                  >
                    <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse"></span>
                    <span className="text-xs font-extrabold tracking-tight text-white">LoopShop</span>
                    {isAdminLoggedIn && (
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
                    )}
                  </div>

                  {/* Horizontal Category Filter Pills */}
                  <div className="absolute top-16 left-0 right-0 z-30 px-3 flex items-center space-x-1.5 overflow-x-auto no-scrollbar pointer-events-auto">
                    {CATEGORIES.map((cat) => {
                      const isActive = selectedCategory === cat.id;
                      return (
                        <button
                          key={cat.id}
                          onClick={() => {
                            setSelectedCategory(cat.id);
                            scrollToIndex(0);
                          }}
                          className={`px-3 py-1 rounded-full text-xs font-semibold whitespace-nowrap transition-all shadow-md backdrop-blur-md flex items-center space-x-1 cursor-pointer ${
                            isActive
                              ? 'bg-gradient-to-r from-rose-500 to-orange-500 text-white shadow-rose-500/30 scale-105'
                              : 'bg-black/50 hover:bg-black/70 text-white/80 border border-white/10'
                          }`}
                        >
                          <span>{cat.icon}</span>
                          <span>{cat.label}</span>
                        </button>
                      );
                    })}
                  </div>

                  {/* Feed or Empty Filter Results */}
                  {filteredVideos.length === 0 ? (
                    <div className="w-full h-full flex flex-col items-center justify-center p-6 text-center space-y-3 bg-neutral-950 text-neutral-400">
                      <Search className="w-12 h-12 text-neutral-600 stroke-1" />
                      <p className="text-sm font-semibold text-neutral-200">Không tìm thấy video nào</p>
                      <p className="text-xs text-neutral-400 max-w-xs">
                        {searchQuery 
                          ? `Không có video phù hợp với từ khóa "${searchQuery}"`
                          : `Chưa có video nào trong danh mục này.`}
                      </p>
                      <button
                        onClick={() => {
                          setSelectedCategory('all');
                          setSearchQuery('');
                          scrollToIndex(0);
                        }}
                        className="px-4 py-2 rounded-xl bg-orange-500 text-black text-xs font-bold transition-all shadow hover:bg-orange-400 active:scale-95 cursor-pointer"
                      >
                        Xem tất cả video
                      </button>
                    </div>
                  ) : (
                    /* Scrollable vertical snap feed */
                    <div
                      ref={containerRef}
                      onScroll={handleScroll}
                      className="w-full h-full overflow-y-scroll snap-y-mandatory no-scrollbar"
                    >
                      {filteredVideos.map((video, idx) => (
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
                            onOpenShare={(vid) => {
                              setShareVideo(vid);
                              setIsShareModalOpen(true);
                            }}
                            onStartChatWithCreator={handleStartChatWithCreator}
                            onLike={handleLike}
                          />
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Desktop floating scroll buttons */}
                  <div className="hidden md:flex flex-col space-y-2 absolute right-4 top-1/2 -translate-y-1/2 z-30 pointer-events-none">
                    <button
                      onClick={() => scrollToIndex(Math.max(0, currentVideoIndex - 1))}
                      disabled={currentVideoIndex === 0}
                      className="p-2 rounded-full bg-black/60 backdrop-blur-md text-white hover:bg-black/90 pointer-events-auto disabled:opacity-30 transition-all shadow cursor-pointer"
                    >
                      <ChevronUp className="w-5 h-5" />
                    </button>
                    <button
                      onClick={() => scrollToIndex(Math.min(filteredVideos.length - 1, currentVideoIndex + 1))}
                      disabled={currentVideoIndex >= filteredVideos.length - 1}
                      className="p-2 rounded-full bg-black/60 backdrop-blur-md text-white hover:bg-black/90 pointer-events-auto disabled:opacity-30 transition-all shadow cursor-pointer"
                    >
                      <ChevronDown className="w-5 h-5" />
                    </button>
                  </div>

                  {/* Preload next video in background for instant 0ms playback on swipe */}
                  {filteredVideos[currentVideoIndex + 1] && (
                    <video
                      key={`preload-${filteredVideos[currentVideoIndex + 1].id}`}
                      src={resolveMediaUrl(filteredVideos[currentVideoIndex + 1].video_url)}
                      preload="auto"
                      muted
                      className="hidden"
                      aria-hidden="true"
                    />
                  )}

                  {/* Floating Top Right Buttons on Feed: Search + Chat Center + Order Tracking + Cart */}
                  <div className="absolute top-4 right-14 z-30 flex items-center space-x-2">
                    <button
                      onClick={() => setIsSearchOpen(true)}
                      className={`p-2.5 rounded-full backdrop-blur-md text-white transition-all shadow-lg active:scale-95 cursor-pointer ${
                        searchQuery ? 'bg-orange-500 text-black' : 'bg-black/50 hover:bg-black/70'
                      }`}
                      title="Tìm kiếm video / sản phẩm"
                    >
                      <Search className="w-5 h-5" />
                    </button>

                    <button
                      onClick={() => {
                        setChatTargetUser(null);
                        setChatAttachedProduct(null);
                        setIsChatCenterOpen(true);
                      }}
                      className="relative p-2.5 rounded-full bg-black/50 backdrop-blur-md text-white hover:bg-black/70 transition-all shadow-lg active:scale-95 cursor-pointer"
                      title="Phòng trò chuyện & tin nhắn"
                    >
                      <MessageSquare className="w-5 h-5 text-orange-400" />
                      <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                    </button>

                    <button
                      onClick={() => setIsOrderHistoryOpen(true)}
                      className="p-2.5 rounded-full bg-black/50 backdrop-blur-md text-white hover:bg-black/70 transition-all shadow-lg active:scale-95 cursor-pointer"
                      title="Đơn mua của tôi"
                    >
                      <PackageCheck className="w-5 h-5 text-emerald-400" />
                    </button>

                    <button
                      onClick={() => setIsCartModalOpen(true)}
                      className="relative p-2.5 rounded-full bg-black/50 backdrop-blur-md text-white hover:bg-black/70 transition-all shadow-lg active:scale-95 cursor-pointer"
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

          {/* Public Tab 2: Community Chat & Direct Messages */}
          <button
            onClick={() => {
              setChatTargetUser(null);
              setChatAttachedProduct(null);
              setIsChatCenterOpen(true);
            }}
            className="relative flex flex-col items-center py-1 px-3 text-neutral-400 hover:text-white transition-all"
          >
            <MessageSquare className="w-5 h-5 text-orange-400" />
            <span className="text-[10px] mt-0.5">Trò chuyện</span>
            <span className="absolute top-1 right-3 w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
          </button>

          {/* Public Tab 3: Order Tracking */}
          <button
            onClick={() => setIsOrderHistoryOpen(true)}
            className="flex flex-col items-center py-1 px-3 text-neutral-400 hover:text-white transition-all"
          >
            <PackageCheck className="w-5 h-5 text-emerald-400" />
            <span className="text-[10px] mt-0.5">Đơn mua</span>
          </button>

          {/* Public Tab 4: Cart */}
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
        onChatAboutProduct={handleChatAboutProduct}
      />

      <CartModal
        isOpen={isCartModalOpen}
        cart={cart}
        onClose={() => setIsCartModalOpen(false)}
        onUpdateQuantity={handleUpdateCartQuantity}
        onRemoveItem={handleRemoveCartItem}
        onProceedCheckout={() => setIsCheckoutModalOpen(true)}
        appliedVoucher={appliedVoucher}
        onApplyVoucher={setAppliedVoucher}
      />

      <VietQRCheckoutModal
        isOpen={isCheckoutModalOpen}
        cart={cart}
        onClose={() => setIsCheckoutModalOpen(false)}
        onOrderSuccess={() => {
          setCart([]);
          setAppliedVoucher(null);
        }}
        appliedVoucher={appliedVoucher}
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

      {/* Community & 1-on-1 Chat Center Modal */}
      <ChatCenterModal
        isOpen={isChatCenterOpen}
        onClose={() => setIsChatCenterOpen(false)}
        initialTargetUser={chatTargetUser}
        initialAttachedProduct={chatAttachedProduct}
        onViewProduct={(p) => {
          setSelectedProduct(p);
          setIsProductDrawerOpen(true);
        }}
      />

      {/* Share Modal */}
      <ShareModal
        isOpen={isShareModalOpen}
        video={shareVideo}
        onClose={() => setIsShareModalOpen(false)}
        onShared={handleVideoShared}
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
