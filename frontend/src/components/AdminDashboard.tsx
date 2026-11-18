import React, { useState, useEffect, useRef } from 'react';
import { 
  ShieldAlert, 
  TrendingUp, 
  DollarSign, 
  Package, 
  Eye, 
  EyeOff, 
  CheckCircle2, 
  RefreshCw, 
  LogOut,
  Send,
  BellRing,
  Key,
  MessageSquare,
  Sparkles,
  Check,
  Users,
  Crown,
  PhoneCall,
  MapPin,
  Calendar,
  ChevronDown,
  ChevronUp,
  Copy,
  Search,
  ExternalLink,
  Download,
  Plus,
  Edit2,
  Trash2,
  Upload,
  X,
  Tag,
  Film,
  AlertTriangle,
  Loader2,
  ShoppingBag,
  PackageCheck
} from 'lucide-react';
import type { AdminStats, VideoItem, Report, Order, CRMResponse, Product } from '../types';
import { api, resolveMediaUrl } from '../services/api';

interface AdminDashboardProps {
  onLogout?: () => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({ onLogout }) => {
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [videos, setVideos] = useState<VideoItem[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [reports, setReports] = useState<Report[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [crmData, setCrmData] = useState<CRMResponse | null>(null);
  const [activeTab, setActiveTab] = useState<'overview' | 'customers' | 'moderation' | 'videos' | 'products' | 'orders' | 'telegram'>('overview');
  const [isLoading, setIsLoading] = useState(false);

  // CRM state
  const [customerSearch, setCustomerSearch] = useState<string>('');
  const [customerTierFilter, setCustomerTierFilter] = useState<'all' | 'vip' | 'regular' | 'lead'>('all');
  const [expandedPhone, setExpandedPhone] = useState<string | null>(null);
  const [copiedPhone, setCopiedPhone] = useState<string | null>(null);

  // Video Management state
  const [videoSearch, setVideoSearch] = useState<string>('');
  const [videoFilter, setVideoFilter] = useState<'all' | 'visible' | 'hidden'>('all');
  const [isVideoModalOpen, setIsVideoModalOpen] = useState<boolean>(false);
  const [editingVideo, setEditingVideo] = useState<VideoItem | null>(null);
  const [deletingVideo, setDeletingVideo] = useState<VideoItem | null>(null);
  const [isSubmittingVideo, setIsSubmittingVideo] = useState<boolean>(false);
  const [isUploadingVideoFile, setIsUploadingVideoFile] = useState<boolean>(false);
  const [videoToastMessage, setVideoToastMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [modalUploadStatus, setModalUploadStatus] = useState<{
    status: 'idle' | 'uploading' | 'success' | 'error';
    filename?: string;
    sizeFormatted?: string;
    message?: string;
  }>({ status: 'idle' });
  const videoFileInputRef = useRef<HTMLInputElement>(null);
  const quickUploadInputRef = useRef<HTMLInputElement>(null);
  const [isQuickUploading, setIsQuickUploading] = useState<boolean>(false);

  // Video Form Fields
  const [formTitle, setFormTitle] = useState('');
  const [formDescription, setFormDescription] = useState('');
  const [formCategory, setFormCategory] = useState('tech');
  const [formVideoUrl, setFormVideoUrl] = useState('');
  const [formPreviewUrl, setFormPreviewUrl] = useState('');
  const [videoPreviewError, setVideoPreviewError] = useState<string | null>(null);
  const [formThumbnailUrl, setFormThumbnailUrl] = useState('');
  const [formUploaderName, setFormUploaderName] = useState('phat_official');
  const [formSelectedProductId, setFormSelectedProductId] = useState<number | ''>('');
  const [formLikesCount, setFormLikesCount] = useState<number>(150);
  const [formSharesCount, setFormSharesCount] = useState<number>(25);
  const [formIsHidden, setFormIsHidden] = useState<boolean>(false);

  // Sample videos for quick testing
  const sampleVideos = [
    { label: 'Bình giữ nhiệt (Công nghệ)', url: '/videos/v1.mp4' },
    { label: 'Áo thun phong cách (Thời trang)', url: '/videos/v2.mp4' },
    { label: 'Tai nghe Bluetooth ANC', url: '/videos/v3.mp4' },
    { label: 'Đèn ngủ hoàng hôn LED', url: '/videos/v4.mp4' },
    { label: 'Bàn phím cơ không dây', url: '/videos/v5.mp4' },
    { label: 'Balo du lịch chống nước', url: '/videos/v6.mp4' },
    { label: 'Nồi chiên không dầu 6L', url: '/videos/v7.mp4' },
    { label: 'Máy sấy tóc ion âm cao cấp', url: '/videos/v8.mp4' },
  ];

  // Product Management state
  const [productSearch, setProductSearch] = useState<string>('');
  const [productCategoryFilter, setProductCategoryFilter] = useState<string>('all');
  const [isProductModalOpen, setIsProductModalOpen] = useState<boolean>(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [deletingProduct, setDeletingProduct] = useState<Product | null>(null);
  const [isSubmittingProduct, setIsSubmittingProduct] = useState<boolean>(false);
  const [isSeedingProducts, setIsSeedingProducts] = useState<boolean>(false);
  const [productToastMessage, setProductToastMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Product Form Fields
  const [prodTitle, setProdTitle] = useState('');
  const [prodDescription, setProdDescription] = useState('');
  const [prodCategory, setProdCategory] = useState('tech');
  const [prodPrice, setProdPrice] = useState<number>(199000);
  const [prodOriginalPrice, setProdOriginalPrice] = useState<number | ''>(299000);
  const [prodCostPrice, setProdCostPrice] = useState<number | ''>(120000);
  const [prodCommissionRate, setProdCommissionRate] = useState<number>(15);
  const [prodAffiliateUrl, setProdAffiliateUrl] = useState<string>('');
  const [prodIsDropship, setProdIsDropship] = useState<boolean>(true);
  const [prodStock, setProdStock] = useState<number>(100);
  const [prodSellerName, setProdSellerName] = useState('Phát Official Store');
  const [prodImageUrl, setProdImageUrl] = useState('');

  // 1-Click Dropship Copy Order State
  const [copiedOrderId, setCopiedOrderId] = useState<number | null>(null);

  // Sample images for quick selection in product form
  const sampleProductImages = [
    { label: 'Tai nghe TWS', category: 'tech', url: 'https://images.unsplash.com/photo-1590658268037-6bf12165a8df?w=600&auto=format&fit=crop&q=80' },
    { label: 'Smartwatch', category: 'tech', url: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600&auto=format&fit=crop&q=80' },
    { label: 'Bàn phím cơ', category: 'tech', url: 'https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=600&auto=format&fit=crop&q=80' },
    { label: 'Loa Bluetooth', category: 'tech', url: 'https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?w=600&auto=format&fit=crop&q=80' },
    { label: 'Áo thun Unisex', category: 'fashion', url: 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?w=600&auto=format&fit=crop&q=80' },
    { label: 'Kính râm phi công', category: 'fashion', url: 'https://images.unsplash.com/photo-1511499767150-a48a237f0083?w=600&auto=format&fit=crop&q=80' },
    { label: 'Giày Sneaker', category: 'fashion', url: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=600&auto=format&fit=crop&q=80' },
    { label: 'Túi Canvas', category: 'fashion', url: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=600&auto=format&fit=crop&q=80' },
    { label: 'Bình giữ nhiệt', category: 'lifestyle', url: 'https://images.unsplash.com/photo-1602143407151-7111542de6e8?w=600&auto=format&fit=crop&q=80' },
    { label: 'Đèn bàn LED', category: 'lifestyle', url: 'https://images.unsplash.com/photo-1507473885765-e6ed057f782c?w=600&auto=format&fit=crop&q=80' },
    { label: 'Khô gà lá chanh', category: 'food', url: 'https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=600&auto=format&fit=crop&q=80' },
    { label: 'Son dưỡng môi', category: 'beauty', url: 'https://images.unsplash.com/photo-1586495777744-4413f21062fa?w=600&auto=format&fit=crop&q=80' },
    { label: 'Serum Vitamin C', category: 'beauty', url: 'https://images.unsplash.com/photo-1620916566398-39f1143ab7be?w=600&auto=format&fit=crop&q=80' },
  ];

  // Telegram state
  const [telegramToken, setTelegramToken] = useState<string>(() => localStorage.getItem('loopshop_telegram_token') || '');
  const [telegramChatId, setTelegramChatId] = useState<string>(() => localStorage.getItem('loopshop_telegram_chatid') || '');
  const [isTelegramConfigured, setIsTelegramConfigured] = useState<boolean>(false);
  const [isSavingTelegram, setIsSavingTelegram] = useState<boolean>(false);
  const [isTestingTelegram, setIsTestingTelegram] = useState<boolean>(false);
  const [telegramStatusMessage, setTelegramStatusMessage] = useState<{
    type: 'success' | 'error';
    title?: string;
    text: string;
    hint?: string;
  } | null>(null);

  const parseFriendlyTelegramError = (err: any): { title: string; text: string; hint?: string } => {
    if (!err) {
      return {
        title: 'Không thể gửi tin nhắn',
        text: 'Không nhận được phản hồi từ Telegram.',
        hint: 'Vui lòng kiểm tra lại kết nối mạng hoặc thử lại sau vài giây.',
      };
    }

    if (typeof err === 'object') {
      if (err.title && err.message) {
        return {
          title: err.title,
          text: err.message,
          hint: err.hint,
        };
      }
    }

    const raw = typeof err === 'string' ? err : (err.error || err.message || JSON.stringify(err));

    // Handle raw Telegram JSON string e.g. {"ok":false,"error_code":404,"description":"Not Found"}
    if (typeof raw === 'string' && (raw.startsWith('{') || raw.includes('error_code'))) {
      try {
        const parsed = JSON.parse(raw);
        const code = parsed.error_code;
        const desc = (parsed.description || '').toLowerCase();

        if (code === 404 || desc.includes('not found')) {
          return {
            title: 'Bot Token không tồn tại',
            text: 'Mã Bot Token không tìm thấy trên hệ sinh thái Telegram.',
            hint: 'Vui lòng kiểm tra lại Token bạn copy từ @BotFather (Token hợp lệ dạng: 123456789:AAH...).',
          };
        }
        if (desc.includes('chat not found')) {
          return {
            title: 'Không tìm thấy Chat ID',
            text: 'Telegram không tìm thấy cuộc trò chuyện với Chat ID này.',
            hint: 'Bạn cần mở Telegram tìm bot vừa tạo và bấm nút "Bắt đầu" (Start) trước khi nhận tin.',
          };
        }
        if (code === 401 || desc.includes('unauthorized')) {
          return {
            title: 'Bot Token không hợp lệ',
            text: 'Bot Token sai hoặc đã bị thu hồi quyền truy cập.',
            hint: 'Hãy mở chat với @BotFather và gõ /token để lấy mã Token mới.',
          };
        }
        if (code === 403 || desc.includes('blocked by the user')) {
          return {
            title: 'Bot đang bị chặn',
            text: 'Bạn đang chặn (block) Bot này trên ứng dụng Telegram.',
            hint: 'Vui lòng mở cuộc trò chuyện với Bot và chọn "Bỏ chặn" (Unblock).',
          };
        }
        return {
          title: 'Telegram phản hồi lỗi',
          text: parsed.description || 'Không thể gửi tin nhắn qua Telegram.',
          hint: 'Kiểm tra lại tính chính xác của Bot Token và Chat ID.',
        };
      } catch {
        // Fallback
      }
    }

    const rawLower = String(raw).toLowerCase();
    if (rawLower.includes('not found') || rawLower.includes('404')) {
      return {
        title: 'Bot Token không tồn tại',
        text: 'Mã Bot Token không tìm thấy trên Telegram.',
        hint: 'Vui lòng kiểm tra lại Token bạn copy từ @BotFather (dạng 123456789:AAH...).',
      };
    }
    if (rawLower.includes('chat not found')) {
      return {
        title: 'Không tìm thấy Chat ID',
        text: 'Telegram không tìm thấy cuộc trò chuyện với Chat ID này.',
        hint: 'Bạn hãy mở Telegram, tìm bot của mình và bấm Bắt đầu (Start) trước.',
      };
    }

    return {
      title: 'Gửi tin nhắn test thất bại',
      text: String(raw),
      hint: 'Kiểm tra lại Bot Token từ @BotFather và Chat ID từ @userinfobot.',
    };
  };

  const loadAdminData = async () => {
    try {
      setIsLoading(true);
      const [statsData, videosData, reportsData, ordersData, crmResult, prodsData] = await Promise.all([
        api.getAdminStats(),
        api.getVideos(true), // get all videos including hidden
        api.getReports(),
        api.getOrders(),
        api.getAdminCustomers().catch(() => null),
        api.getProducts().catch(() => []),
      ]);
      setStats(statsData);
      setVideos(videosData);
      setReports(reportsData);
      setOrders(ordersData);
      if (crmResult) {
        setCrmData(crmResult);
      }
      if (prodsData) {
        setProducts(prodsData);
      }

      // Load telegram config
      try {
        const tgConfig = await api.getTelegramConfig();
        if (tgConfig.is_configured) {
          setIsTelegramConfigured(true);
          if (!telegramChatId && tgConfig.chat_id) {
            setTelegramChatId(tgConfig.chat_id);
          }
        }
      } catch {
        // ignore
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  // Video CRUD Handlers
  const handleOpenAddVideo = () => {
    setEditingVideo(null);
    setFormTitle('');
    setFormDescription('');
    setFormCategory('tech');
    setFormVideoUrl('/videos/v1.mp4');
    setFormPreviewUrl('/videos/v1.mp4');
    setVideoPreviewError(null);
    setFormThumbnailUrl('');
    setFormUploaderName('phat_official');
    setFormSelectedProductId(products.length > 0 ? products[0].id : '');
    setFormLikesCount(168);
    setFormSharesCount(28);
    setFormIsHidden(false);
    setModalUploadStatus({ status: 'idle' });
    setIsVideoModalOpen(true);
  };

  const handleOpenEditVideo = (v: VideoItem) => {
    setEditingVideo(v);
    setFormTitle(v.title);
    setFormDescription(v.description || '');
    setFormCategory(v.category || 'tech');
    setFormVideoUrl(v.video_url);
    setFormPreviewUrl(resolveMediaUrl(v.video_url));
    setVideoPreviewError(null);
    setFormThumbnailUrl(v.thumbnail_url || '');
    setFormUploaderName(v.uploader_name || 'phat_official');
    if (v.products && v.products.length > 0) {
      setFormSelectedProductId(v.products[0].id);
    } else {
      setFormSelectedProductId('');
    }
    setFormLikesCount(v.likes_count || 0);
    setFormSharesCount(v.shares_count || 0);
    setFormIsHidden(v.is_hidden || false);
    setModalUploadStatus({ status: 'idle' });
    setIsVideoModalOpen(true);
  };

  const handleUploadVideoFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Reset input để có thể chọn lại cùng một file nếu cần
    e.target.value = '';

    // Kiểm tra nếu người dùng chọn nhầm file HTML / Trang web
    if (file.type === 'text/html' || file.name.endsWith('.html') || file.name.endsWith('.htm') || file.name.endsWith('.mhtml')) {
      setModalUploadStatus({
        status: 'error',
        filename: file.name,
        message: 'Tệp tin này là trang web (HTML) chứ không phải file video MP4/WebM! Nếu bạn lấy kịch bản từ AI (như Dola), hãy xuất file video thực tế hoặc chọn mẫu video có sẵn bên dưới.',
      });
      return;
    }

    // Xem trước tức thì 0ms bằng URL.createObjectURL
    try {
      const localBlob = URL.createObjectURL(file);
      setFormPreviewUrl(localBlob);
      setVideoPreviewError(null);
    } catch {
      // fallback
    }

    const sizeMB = (file.size / (1024 * 1024)).toFixed(1);
    setModalUploadStatus({
      status: 'uploading',
      filename: file.name,
      sizeFormatted: `${sizeMB} MB`,
      message: `Đang tải lên file "${file.name}" (${sizeMB} MB)... Vui lòng đợi trong giây lát.`,
    });

    // Tự động điền tiêu đề từ tên file nếu chưa có
    if (!formTitle.trim()) {
      const cleanTitle = file.name
        .replace(/\.[^/.]+$/, '')
        .replace(/[_-]+/g, ' ')
        .trim();
      if (cleanTitle) {
        setFormTitle(cleanTitle.charAt(0).toUpperCase() + cleanTitle.slice(1));
      }
    }

    try {
      setIsUploadingVideoFile(true);
      const res = await api.uploadVideoFile(file);
      const targetUrl = res.video_url || res.full_url || resolveMediaUrl(res.relative_url);
      setFormVideoUrl(targetUrl);
      setModalUploadStatus({
        status: 'success',
        filename: file.name,
        sizeFormatted: `${sizeMB} MB`,
        message: `Đã tải tệp video lên máy chủ thành công! Hãy kiểm tra thông tin và bấm nút "Đăng Video Mới" bên dưới để đưa lên feed.`,
      });
      setVideoToastMessage({ type: 'success', text: `Tải lên file video "${file.name}" thành công!` });
      setTimeout(() => setVideoToastMessage(null), 5000);
    } catch (err: any) {
      console.error(err);
      const errMsg = err?.message || 'Không thể tải file video lên máy chủ. Bạn có thể dán link URL trực tiếp.';
      setModalUploadStatus({
        status: 'error',
        filename: file.name,
        message: errMsg,
      });
      setVideoToastMessage({ type: 'error', text: errMsg });
      setTimeout(() => setVideoToastMessage(null), 7000);
    } finally {
      setIsUploadingVideoFile(false);
    }
  };

  const handleSaveVideo = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formTitle.trim()) {
      alert('Vui lòng nhập tiêu đề cho video!');
      return;
    }
    if (!formVideoUrl.trim()) {
      alert('Vui lòng nhập đường dẫn video hoặc tải file MP4 lên!');
      return;
    }

    try {
      setIsSubmittingVideo(true);
      const selectedProd = products.find(p => p.id === Number(formSelectedProductId));
      const thumb = formThumbnailUrl.trim() || selectedProd?.image_url || '';

      if (editingVideo) {
        // Cập nhật video hiện có
        await api.updateVideo(editingVideo.id, {
          title: formTitle.trim(),
          description: formDescription.trim(),
          category: formCategory,
          video_url: formVideoUrl.trim(),
          thumbnail_url: thumb,
          uploader_name: formUploaderName.trim() || 'phat_official',
          likes_count: Number(formLikesCount) || 0,
          shares_count: Number(formSharesCount) || 0,
          is_hidden: formIsHidden,
          product_id: formSelectedProductId ? Number(formSelectedProductId) : undefined,
        });
        setVideoToastMessage({ type: 'success', text: `Đã cập nhật video "${formTitle}" thành công!` });
      } else {
        // Thêm video mới
        const created = await api.createVideo({
          title: formTitle.trim(),
          description: formDescription.trim(),
          category: formCategory,
          video_url: formVideoUrl.trim(),
          thumbnail_url: thumb,
          uploader_name: formUploaderName.trim() || 'phat_official',
          product_id: formSelectedProductId ? Number(formSelectedProductId) : undefined,
        });
        if (formSelectedProductId) {
          await api.attachProductToVideo(created.id, Number(formSelectedProductId)).catch(() => null);
        }
        setVideoToastMessage({ type: 'success', text: `Đã thêm video mới "${formTitle}" vào hệ thống feed!` });
      }

      setIsVideoModalOpen(false);
      setEditingVideo(null);
      await loadAdminData();
      setTimeout(() => setVideoToastMessage(null), 5000);
    } catch (err) {
      console.error(err);
      alert('Thao tác video thất bại, vui lòng kiểm tra lại!');
    } finally {
      setIsSubmittingVideo(false);
    }
  };

  const handleConfirmDeleteVideo = async () => {
    if (!deletingVideo) return;
    try {
      setIsSubmittingVideo(true);
      await api.deleteVideo(deletingVideo.id);
      setVideoToastMessage({ type: 'success', text: `Đã xóa vĩnh viễn video "${deletingVideo.title}" khỏi hệ thống!` });
      setDeletingVideo(null);
      await loadAdminData();
      setTimeout(() => setVideoToastMessage(null), 5000);
    } catch (err) {
      console.error(err);
      alert('Không thể xóa video, vui lòng thử lại!');
    } finally {
      setIsSubmittingVideo(false);
    }
  };

  // Product CRUD Handlers
  const handleOpenAddProduct = () => {
    setEditingProduct(null);
    setProdTitle('');
    setProdDescription('');
    setProdCategory('tech');
    setProdPrice(199000);
    setProdOriginalPrice(299000);
    setProdCostPrice(120000);
    setProdCommissionRate(15);
    setProdAffiliateUrl('');
    setProdIsDropship(true);
    setProdStock(100);
    setProdSellerName('Phát Official Store');
    setProdImageUrl(sampleProductImages[0].url);
    setIsProductModalOpen(true);
  };

  const handleOpenEditProduct = (p: Product) => {
    setEditingProduct(p);
    setProdTitle(p.title);
    setProdDescription(p.description || '');
    setProdCategory(p.category || 'tech');
    setProdPrice(Number(p.price));
    setProdOriginalPrice(p.original_price ? Number(p.original_price) : '');
    setProdCostPrice(p.cost_price ? Number(p.cost_price) : '');
    setProdCommissionRate(p.commission_rate !== undefined ? Number(p.commission_rate) : 15);
    setProdAffiliateUrl(p.affiliate_url || '');
    setProdIsDropship(p.is_dropship !== undefined ? p.is_dropship : true);
    setProdStock(p.stock || 0);
    setProdSellerName(p.seller_name || 'Phát Official Store');
    setProdImageUrl(p.image_url || '');
    setIsProductModalOpen(true);
  };

  const handleCopyDropshipOrder = (ord: Order) => {
    const itemsSummary = ord.items && ord.items.length > 0
      ? ord.items.map(it => `• ${it.quantity}x ${it.product_title} (${Number(it.price).toLocaleString('vi-VN')}₫)`).join('\n')
      : '• 1x Đơn hàng LoopShop';

    const textToCopy = `📦 THÔNG TIN ĐƠN GIAO HÀNG DROPSHIP LOOPSHOP [Mã: ${ord.order_code}]
👤 Người nhận: ${ord.customer_name}
📞 Số điện thoại: ${ord.customer_phone}
📍 Địa chỉ giao hàng: ${ord.shipping_address}
🛒 Danh sách sản phẩm:
${itemsSummary}
💰 Tiền thu hộ COD: ${ord.is_paid ? '0đ (Khách ĐÃ THANH TOÁN chuyển khoản VietQR cho Shop)' : `${Number(ord.total_amount).toLocaleString('vi-VN')}₫ (Khách chưa trả tiền)`}
📝 Ghi chú: ${ord.note || 'Giao hàng giờ hành chính'}`;

    if (navigator?.clipboard?.writeText) {
      navigator.clipboard.writeText(textToCopy);
    } else {
      const textarea = document.createElement('textarea');
      textarea.value = textToCopy;
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand('copy');
      document.body.removeChild(textarea);
    }

    setCopiedOrderId(ord.id);
    setTimeout(() => setCopiedOrderId(null), 3000);
  };

  const handleSaveProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!prodTitle.trim()) {
      alert('Vui lòng nhập tên sản phẩm!');
      return;
    }
    if (!prodPrice || prodPrice <= 0) {
      alert('Vui lòng nhập giá sản phẩm hợp lệ!');
      return;
    }

    try {
      setIsSubmittingProduct(true);
      const payload: Partial<Product> = {
        title: prodTitle.trim(),
        description: prodDescription.trim(),
        category: prodCategory,
        price: prodPrice,
        original_price: prodOriginalPrice ? Number(prodOriginalPrice) : undefined,
        cost_price: prodCostPrice ? Number(prodCostPrice) : undefined,
        commission_rate: Number(prodCommissionRate) || 0,
        affiliate_url: prodAffiliateUrl.trim(),
        is_dropship: prodIsDropship,
        stock: Number(prodStock) || 0,
        seller_name: prodSellerName.trim() || 'Phát Official Store',
        image_url: prodImageUrl.trim() || sampleProductImages[0].url,
        is_active: true,
      };

      if (editingProduct) {
        await api.updateProduct(editingProduct.id, payload);
        setProductToastMessage({
          type: 'success',
          text: `🎉 Đã cập nhật sản phẩm "${prodTitle}" thành công!`
        });
      } else {
        await api.createProduct(payload);
        setProductToastMessage({
          type: 'success',
          text: `🎉 Đã thêm mới sản phẩm "${prodTitle}" vào kho thành công!`
        });
      }

      await loadAdminData();
      setIsProductModalOpen(false);
      setTimeout(() => setProductToastMessage(null), 5000);
    } catch (err: any) {
      console.error(err);
      alert(err?.message || 'Không thể lưu sản phẩm, vui lòng thử lại!');
    } finally {
      setIsSubmittingProduct(false);
    }
  };

  const handleDeleteProduct = async () => {
    if (!deletingProduct) return;
    try {
      setIsSubmittingProduct(true);
      await api.deleteProduct(deletingProduct.id);
      await loadAdminData();
      setProductToastMessage({
        type: 'success',
        text: `Đã xóa sản phẩm "${deletingProduct.title}" khỏi kho.`
      });
      setDeletingProduct(null);
      setTimeout(() => setProductToastMessage(null), 5000);
    } catch (err: any) {
      console.error(err);
      alert(err?.message || 'Không thể xóa sản phẩm!');
    } finally {
      setIsSubmittingProduct(false);
    }
  };

  const handleSeedMoreProducts = async () => {
    try {
      setIsSeedingProducts(true);
      const res = await api.seedMoreProducts();
      await loadAdminData();
      setProductToastMessage({
        type: 'success',
        text: `🎉 ${res.message || 'Đã nạp thêm sản phẩm thịnh hành vào kho thành công!'}`
      });
      setTimeout(() => setProductToastMessage(null), 6000);
    } catch (err: any) {
      console.error(err);
      alert(err?.message || 'Không thể nạp sản phẩm mẫu!');
    } finally {
      setIsSeedingProducts(false);
    }
  };

  const handleQuickUploadAndPost = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    e.target.value = '';

    // Kiểm tra nếu chọn nhầm file HTML / Trang web
    if (file.type === 'text/html' || file.name.endsWith('.html') || file.name.endsWith('.htm') || file.name.endsWith('.mhtml')) {
      setVideoToastMessage({
        type: 'error',
        text: `Tệp "${file.name}" là trang web HTML chứ không phải video MP4/WebM! Vui lòng chọn file video thực tế.`
      });
      setTimeout(() => setVideoToastMessage(null), 8000);
      return;
    }

    const cleanTitle = file.name
      .replace(/\.[^/.]+$/, '')
      .replace(/[_-]+/g, ' ')
      .trim();
    const finalTitle = cleanTitle ? (cleanTitle.charAt(0).toUpperCase() + cleanTitle.slice(1)) : 'Video sản phẩm mới';

    try {
      setIsQuickUploading(true);
      setVideoToastMessage({
        type: 'success',
        text: `⏳ Đang tải file và đăng ngay video "${finalTitle}" lên Feed...`
      });

      // 1. Tải file video lên server
      const uploadRes = await api.uploadVideoFile(file);
      const videoPath = uploadRes.video_url || uploadRes.full_url || resolveMediaUrl(uploadRes.relative_url);

      // 2. Gắn sản phẩm mặc định đầu tiên nếu có
      const defaultProd = products.length > 0 ? products[0] : null;

      // 3. Tạo bài đăng video ngay lập tức
      const created = await api.createVideo({
        title: finalTitle,
        description: 'Video giới thiệu sản phẩm chính hãng LoopShop',
        category: 'tech',
        video_url: videoPath,
        uploader_name: 'phat_official',
        thumbnail_url: defaultProd?.image_url || '',
        product_id: defaultProd ? defaultProd.id : undefined,
      });

      if (defaultProd) {
        await api.attachProductToVideo(created.id, defaultProd.id).catch(() => null);
      }

      await loadAdminData();
      setVideoToastMessage({
        type: 'success',
        text: `🎉 ĐÃ ĐĂNG VIDEO THÀNH CÔNG! "${finalTitle}" đã sẵn sàng trên Feed người xem.`
      });
      setTimeout(() => setVideoToastMessage(null), 8000);
    } catch (err: any) {
      console.error(err);
      setVideoToastMessage({
        type: 'error',
        text: err?.message || 'Tải video lên thất bại, vui lòng thử lại!'
      });
      setTimeout(() => setVideoToastMessage(null), 7000);
    } finally {
      setIsQuickUploading(false);
    }
  };

  const handleSaveTelegram = async () => {
    const token = telegramToken.trim();
    const chatId = telegramChatId.trim();

    if (!token || !chatId) {
      setTelegramStatusMessage({
        type: 'error',
        title: 'Chưa đủ thông tin cấu hình',
        text: 'Vui lòng điền đủ cả Bot Token và Chat ID trước khi lưu!',
        hint: 'Xem hướng dẫn 2 bước ở bên dưới để lấy Token từ @BotFather và Chat ID từ @userinfobot.',
      });
      return;
    }

    if (!token.includes(':') || token.length < 15) {
      setTelegramStatusMessage({
        type: 'error',
        title: 'Định dạng Bot Token chưa đúng',
        text: `Chuỗi "${token}" không phải là Token chuẩn của Telegram.`,
        hint: 'Token chuẩn từ @BotFather thường có dấu hai chấm ":" ngăn cách, ví dụ: 7891234567:AAHk_xY82b...',
      });
      return;
    }

    try {
      setIsSavingTelegram(true);
      setTelegramStatusMessage(null);
      const res = await api.saveTelegramConfig({
        bot_token: token,
        chat_id: chatId,
      });

      if (!res.success) {
        const friendly = parseFriendlyTelegramError(res);
        setTelegramStatusMessage({
          type: 'error',
          title: friendly.title,
          text: friendly.text,
          hint: friendly.hint,
        });
        return;
      }

      localStorage.setItem('loopshop_telegram_token', token);
      localStorage.setItem('loopshop_telegram_chatid', chatId);
      setIsTelegramConfigured(true);
      setTelegramStatusMessage({
        type: 'success',
        title: 'Đã lưu cấu hình thành công! ✅',
        text: 'LoopShop sẽ tự động gửi thông báo ting-ting về Telegram này mỗi khi có khách đặt hàng mới hoặc thanh toán VietQR!',
      });
    } catch {
      setTelegramStatusMessage({
        type: 'error',
        title: 'Lỗi lưu cấu hình',
        text: 'Không thể kết nối đến máy chủ để lưu cấu hình Telegram.',
        hint: 'Vui lòng kiểm tra lại kết nối mạng của bạn.',
      });
    } finally {
      setIsSavingTelegram(false);
    }
  };

  const handleTestTelegram = async () => {
    const token = telegramToken.trim();
    const chatId = telegramChatId.trim();

    // 1. Kiểm tra rỗng
    if (!token || !chatId) {
      setTelegramStatusMessage({
        type: 'error',
        title: 'Chưa đủ thông tin cấu hình',
        text: 'Vui lòng nhập đầy đủ cả Telegram Bot Token và Chat ID trước khi gửi test!',
        hint: 'Mẹo: Xem hướng dẫn 2 bước ở bên dưới để lấy Token từ @BotFather và Chat ID từ @userinfobot.',
      });
      return;
    }

    // 2. Kiểm tra định dạng Token
    if (!token.includes(':') || token.length < 15) {
      setTelegramStatusMessage({
        type: 'error',
        title: 'Định dạng Bot Token chưa đúng',
        text: `Chuỗi "${token}" không phải là định dạng Token chuẩn của Telegram.`,
        hint: 'Token từ @BotFather thường gồm dãy số, dấu hai chấm và chuỗi ký tự ngẫu nhiên (ví dụ: 7891234567:AAHk_xY82b...).',
      });
      return;
    }

    // 3. Kiểm tra định dạng Chat ID
    if (!/^-?\d+$/.test(chatId)) {
      setTelegramStatusMessage({
        type: 'error',
        title: 'Định dạng Chat ID chưa đúng',
        text: `"${chatId}" không hợp lệ. Chat ID Telegram phải là một dãy số.`,
        hint: 'Mẹo: Tìm bot @userinfobot trên Telegram, bấm Start để xem ID của bạn (ví dụ: 123456789).',
      });
      return;
    }

    try {
      setIsTestingTelegram(true);
      setTelegramStatusMessage(null);
      const res = await api.testTelegramNotification({
        bot_token: token || undefined,
        chat_id: chatId || undefined,
      });

      if (res.success) {
        setTelegramStatusMessage({
          type: 'success',
          title: 'Đã gửi test thành công! 🎉',
          text: 'Tin nhắn thử nghiệm đã được gửi đến Telegram của bạn. Hãy mở điện thoại kiểm tra xem có chuông ting-ting chưa nhé!',
        });
      } else {
        const friendly = parseFriendlyTelegramError(res);
        setTelegramStatusMessage({
          type: 'error',
          title: friendly.title,
          text: friendly.text,
          hint: friendly.hint,
        });
      }
    } catch (err: any) {
      const friendly = parseFriendlyTelegramError(err?.message || 'Không thể kết nối đến máy chủ gửi tin nhắn.');
      setTelegramStatusMessage({
        type: 'error',
        title: friendly.title,
        text: friendly.text,
        hint: friendly.hint,
      });
    } finally {
      setIsTestingTelegram(false);
    }
  };

  useEffect(() => {
    loadAdminData();
  }, []);

  const handleToggleHide = async (videoId: number) => {
    try {
      const res = await api.toggleVideoHidden(videoId);
      await loadAdminData();
      setVideoToastMessage({
        type: 'success',
        text: res.is_hidden 
          ? 'Đã ẩn video khỏi feed người xem!' 
          : '🎉 ĐÃ BỎ ẨN THÀNH CÔNG! Video đã xuất hiện lại trên feed người xem.'
      });
      setTimeout(() => setVideoToastMessage(null), 5000);
    } catch (err: any) {
      console.error(err);
      setVideoToastMessage({
        type: 'error',
        text: err?.message || 'Không thể cập nhật trạng thái ẩn video!'
      });
      setTimeout(() => setVideoToastMessage(null), 5000);
    }
  };

  const handleResolveReport = async (reportId: number) => {
    try {
      await api.resolveReport(reportId);
      await loadAdminData();
      setVideoToastMessage({
        type: 'success',
        text: 'Đã ẩn video vi phạm và hoàn tất xử lý báo cáo!'
      });
      setTimeout(() => setVideoToastMessage(null), 5000);
    } catch (err) {
      console.error(err);
      alert('Thao tác thất bại!');
    }
  };

  const handleUnhideReport = async (reportId: number) => {
    try {
      await api.unhideReportVideo(reportId);
      await loadAdminData();
      setVideoToastMessage({
        type: 'success',
        text: '🎉 Đã bỏ ẩn video vi phạm thành công! Video đã xuất hiện lại trên feed.'
      });
      setTimeout(() => setVideoToastMessage(null), 5000);
    } catch (err) {
      console.error(err);
      alert('Không thể bỏ ẩn video!');
    }
  };

  const handleDismissReport = async (reportId: number) => {
    try {
      await api.dismissReport(reportId);
      await loadAdminData();
    } catch (err) {
      console.error(err);
      alert('Thao tác thất bại!');
    }
  };

  const handleCopyPhone = (phone: string) => {
    navigator.clipboard.writeText(phone);
    setCopiedPhone(phone);
    setTimeout(() => setCopiedPhone(null), 2000);
  };

  const toggleExpandPhone = (phone: string) => {
    setExpandedPhone(prev => (prev === phone ? null : phone));
  };

  const handleExportOrdersCSV = () => {
    if (orders.length === 0) {
      alert('Chưa có đơn hàng nào để xuất!');
      return;
    }

    const headers = ['Mã Đơn', 'Khách Hàng', 'Số Điện Thoại', 'Địa Chỉ Giao Hàng', 'Tổng Tiền (VNĐ)', 'Voucher', 'Tiền Giảm (VNĐ)', 'Trạng Thái', 'Đã Thanh Toán', 'Ngày Đặt'];
    
    const statusMap: Record<string, string> = {
      pending: 'Chờ chuyển khoản',
      confirmed: 'Đã thanh toán',
      preparing: 'Đang đóng gói',
      shipping: 'Đang giao hàng',
      completed: 'Hoàn thành',
      cancelled: 'Đã hủy',
    };

    const rows = orders.map((o) => {
      const cleanField = (val: string | number | undefined) => {
        const str = String(val ?? '').replace(/"/g, '""');
        return `"${str}"`;
      };
      return [
        cleanField(o.order_code),
        cleanField(o.customer_name),
        cleanField(o.customer_phone),
        cleanField(o.shipping_address),
        cleanField(o.total_amount),
        cleanField(o.voucher_code || 'Không có'),
        cleanField(o.discount_amount || 0),
        cleanField(statusMap[o.status] || o.status),
        cleanField(o.is_paid ? 'ĐÃ THANH TOÁN' : 'CHƯA THANH TOÁN'),
        cleanField(new Date(o.created_at).toLocaleString('vi-VN')),
      ].join(',');
    });

    const csvContent = '\uFEFF' + [headers.join(','), ...rows].join('\r\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `LoopShop_DonHang_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleUpdateOrderStatus = async (orderId: number, newStatus: string) => {
    try {
      await api.updateOrderStatus(orderId, newStatus);
      await loadAdminData();
    } catch {
      alert('Không thể cập nhật trạng thái đơn hàng!');
    }
  };

  const filteredCustomers = (crmData?.customers || []).filter((c) => {
    if (customerTierFilter !== 'all' && c.tier !== customerTierFilter) {
      return false;
    }
    if (customerSearch.trim()) {
      const q = customerSearch.trim().toLowerCase();
      const matchName = c.name.toLowerCase().includes(q);
      const matchPhone = c.phone.includes(q);
      const matchAddr = (c.shipping_address || '').toLowerCase().includes(q);
      if (!matchName && !matchPhone && !matchAddr) {
        return false;
      }
    }
    return true;
  });

  const pendingReports = reports.filter(r => r.status === 'pending');

  const renderTelegramSection = () => (
    <div className="bg-neutral-900 rounded-2xl p-5 border border-neutral-800 space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-neutral-800 gap-2">
        <div className="flex items-center space-x-2.5">
          <div className="w-9 h-9 rounded-xl bg-sky-500/20 text-sky-400 flex items-center justify-center">
            <BellRing className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-bold text-sm text-white flex items-center space-x-2">
              <span>Thông báo Đơn hàng & VietQR qua Telegram Bot</span>
              <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${
                isTelegramConfigured ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' : 'bg-neutral-800 text-neutral-400'
              }`}>
                {isTelegramConfigured ? 'Đang hoạt động' : 'Chưa kích hoạt'}
              </span>
            </h3>
            <p className="text-xs text-neutral-400">
              Nhận thông báo ting ting tức thì khi có khách đặt hàng hoặc chuyển khoản VietQR thành công
            </p>
          </div>
        </div>
      </div>

      {telegramStatusMessage && (
        <div className={`p-4 rounded-2xl text-xs space-y-2 transition-all border animate-in fade-in-50 duration-200 ${
          telegramStatusMessage.type === 'success' 
            ? 'bg-emerald-950/40 text-emerald-300 border-emerald-500/30' 
            : 'bg-rose-950/40 text-rose-200 border-rose-500/30'
        }`}>
          <div className="flex items-start space-x-3">
            {telegramStatusMessage.type === 'success' ? (
              <div className="w-6 h-6 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center flex-shrink-0 mt-0.5 border border-emerald-500/30">
                <Check className="w-3.5 h-3.5" />
              </div>
            ) : (
              <div className="w-6 h-6 rounded-full bg-rose-500/20 text-rose-400 flex items-center justify-center flex-shrink-0 mt-0.5 border border-rose-500/30">
                <ShieldAlert className="w-3.5 h-3.5" />
              </div>
            )}
            <div className="flex-1 space-y-1">
              <p className="font-bold text-sm text-white">
                {telegramStatusMessage.title || (telegramStatusMessage.type === 'success' ? 'Thành công' : 'Gửi tin nhắn test thất bại')}
              </p>
              <p className="text-xs leading-relaxed text-neutral-300">
                {telegramStatusMessage.text}
              </p>
              {telegramStatusMessage.hint && (
                <div className="mt-2 p-2.5 rounded-xl bg-neutral-900/90 border border-neutral-800 text-[11px] text-amber-300 flex items-start space-x-2">
                  <span className="flex-shrink-0 text-sm">💡</span>
                  <span className="leading-relaxed">{telegramStatusMessage.hint}</span>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Inputs */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-medium text-neutral-300 mb-1.5 flex items-center space-x-1">
            <Key className="w-3.5 h-3.5 text-sky-400" />
            <span>Telegram Bot Token</span>
          </label>
          <input
            type="text"
            placeholder="Ví dụ: 7891234567:AAH..."
            value={telegramToken}
            onChange={(e) => setTelegramToken(e.target.value)}
            className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-sky-500 transition-colors font-mono"
          />
        </div>

        <div>
          <label className="block text-xs font-medium text-neutral-300 mb-1.5 flex items-center space-x-1">
            <MessageSquare className="w-3.5 h-3.5 text-sky-400" />
            <span>Chat ID của bạn</span>
          </label>
          <input
            type="text"
            placeholder="Ví dụ: 123456789 hoặc -100..."
            value={telegramChatId}
            onChange={(e) => setTelegramChatId(e.target.value)}
            className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-sky-500 transition-colors font-mono"
          />
        </div>
      </div>

      {/* Buttons */}
      <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
        <div className="flex items-center space-x-2">
          <button
            onClick={handleSaveTelegram}
            disabled={isSavingTelegram}
            className="px-4 py-2 rounded-xl bg-sky-600 hover:bg-sky-500 text-white text-xs font-semibold flex items-center space-x-1.5 transition-all shadow-md active:scale-95 disabled:opacity-50 cursor-pointer"
          >
            <Check className="w-3.5 h-3.5" />
            <span>{isSavingTelegram ? 'Đang lưu...' : 'Lưu cấu hình'}</span>
          </button>

          <button
            onClick={handleTestTelegram}
            disabled={isTestingTelegram}
            className="px-4 py-2 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-neutral-200 text-xs font-semibold flex items-center space-x-1.5 transition-all active:scale-95 disabled:opacity-50 border border-neutral-700 cursor-pointer"
          >
            <Send className={`w-3.5 h-3.5 text-sky-400 ${isTestingTelegram ? 'animate-spin' : ''}`} />
            <span>{isTestingTelegram ? 'Đang gửi test...' : 'Gửi tin nhắn test'}</span>
          </button>
        </div>

        <div className="text-[11px] text-neutral-400 flex items-center space-x-1">
          <Sparkles className="w-3.5 h-3.5 text-amber-400" />
          <span>Tự động gửi khi có đơn hàng mới & thanh toán VietQR</span>
        </div>
      </div>

      {/* How to setup guide */}
      <div className="p-3 bg-neutral-950/60 rounded-xl border border-neutral-800/80 text-[11px] text-neutral-400 space-y-1.5">
        <p className="font-semibold text-neutral-300">💡 Hướng dẫn 2 bước nhận thông báo về điện thoại:</p>
        <ol className="list-decimal list-inside space-y-1 text-neutral-400">
          <li>Mở Telegram tìm bot <span className="text-sky-400 font-mono">@BotFather</span> → gõ <code className="text-amber-300">/newbot</code> để tạo bot và lấy <b>Token</b>.</li>
          <li>Tìm bot <span className="text-sky-400 font-mono">@userinfobot</span> trên Telegram → bấm Start để lấy <b>Chat ID</b> cá nhân của bạn.</li>
          <li>Dán Token & Chat ID vào 2 ô phía trên rồi bấm <b>"Gửi tin nhắn test"</b> để kiểm tra chuông ting ting!</li>
        </ol>
      </div>
    </div>
  );

  return (
    <div className="w-full h-full bg-neutral-950 text-white overflow-y-auto p-4 md:p-6 pb-24">
      {/* Header */}
      <div className="max-w-5xl mx-auto flex flex-col md:flex-row md:items-center justify-between pb-4 border-b border-neutral-800 gap-3">
        <div>
          <div className="flex items-center space-x-2">
            <span className="w-3 h-3 rounded-full bg-rose-500 animate-pulse"></span>
            <h1 className="text-xl font-bold tracking-tight text-white">
              Bảng Điều Khiển Admin (Phát)
            </h1>
          </div>
          <p className="text-xs text-neutral-400 mt-1">
            Trung tâm kiểm duyệt an toàn (Safety First), thống kê doanh thu VietQR và giám sát nội dung
          </p>
        </div>

        <div className="flex items-center space-x-2 self-start md:self-auto">
          <button
            onClick={loadAdminData}
            disabled={isLoading}
            className="p-2 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-neutral-300 transition-colors flex items-center space-x-1.5 text-xs"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
            <span>Làm mới dữ liệu</span>
          </button>

          {onLogout && (
            <button
              onClick={onLogout}
              className="p-2 rounded-xl bg-rose-950/40 hover:bg-rose-900/60 border border-rose-800/60 text-rose-300 transition-colors flex items-center space-x-1.5 text-xs"
              title="Khóa quyền Admin và quay về chế độ người xem"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Khóa Admin</span>
            </button>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div className="max-w-5xl mx-auto mt-5 flex space-x-2 bg-neutral-900/80 p-1 rounded-xl border border-neutral-800 overflow-x-auto no-scrollbar">
        <button
          onClick={() => setActiveTab('overview')}
          className={`py-2 px-4 text-xs font-semibold rounded-lg flex items-center space-x-1.5 transition-all whitespace-nowrap ${
            activeTab === 'overview'
              ? 'bg-rose-500 text-white font-bold shadow'
              : 'text-neutral-400 hover:text-white'
          }`}
        >
          <TrendingUp className="w-3.5 h-3.5" />
          <span>Tổng quan</span>
        </button>

        <button
          onClick={() => setActiveTab('customers')}
          className={`py-2 px-4 text-xs font-semibold rounded-lg flex items-center space-x-1.5 transition-all whitespace-nowrap ${
            activeTab === 'customers'
              ? 'bg-rose-500 text-white font-bold shadow'
              : 'text-neutral-400 hover:text-white'
          }`}
        >
          <Users className="w-3.5 h-3.5" />
          <span>Khách hàng (CRM)</span>
          {crmData?.summary.total_customers ? (
            <span className="bg-sky-500/20 text-sky-300 text-[10px] font-bold px-1.5 rounded-full ml-1 border border-sky-500/30">
              {crmData.summary.total_customers}
            </span>
          ) : null}
        </button>

        <button
          onClick={() => setActiveTab('moderation')}
          className={`py-2 px-4 text-xs font-semibold rounded-lg flex items-center space-x-1.5 transition-all whitespace-nowrap ${
            activeTab === 'moderation'
              ? 'bg-rose-500 text-white font-bold shadow'
              : 'text-neutral-400 hover:text-white'
          }`}
        >
          <ShieldAlert className="w-3.5 h-3.5" />
          <span>Kiểm duyệt vi phạm</span>
          {pendingReports.length > 0 && (
            <span className="bg-amber-400 text-black text-[10px] font-black px-1.5 rounded-full ml-1">
              {pendingReports.length}
            </span>
          )}
        </button>

        <button
          onClick={() => setActiveTab('videos')}
          className={`py-2 px-4 text-xs font-semibold rounded-lg flex items-center space-x-1.5 transition-all whitespace-nowrap ${
            activeTab === 'videos'
              ? 'bg-rose-500 text-white font-bold shadow'
              : 'text-neutral-400 hover:text-white'
          }`}
        >
          <Eye className="w-3.5 h-3.5" />
          <span>Quản lý Video ({videos.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('products')}
          className={`py-2 px-4 text-xs font-semibold rounded-lg flex items-center space-x-1.5 transition-all whitespace-nowrap ${
            activeTab === 'products'
              ? 'bg-rose-500 text-white font-bold shadow'
              : 'text-neutral-400 hover:text-white'
          }`}
        >
          <ShoppingBag className="w-3.5 h-3.5" />
          <span>Quản lý Sản phẩm ({products.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('orders')}
          className={`py-2 px-4 text-xs font-semibold rounded-lg flex items-center space-x-1.5 transition-all whitespace-nowrap ${
            activeTab === 'orders'
              ? 'bg-rose-500 text-white font-bold shadow'
              : 'text-neutral-400 hover:text-white'
          }`}
        >
          <Package className="w-3.5 h-3.5" />
          <span>Đơn hàng & VietQR ({orders.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('telegram')}
          className={`py-2 px-4 text-xs font-semibold rounded-lg flex items-center space-x-1.5 transition-all whitespace-nowrap ${
            activeTab === 'telegram'
              ? 'bg-rose-500 text-white font-bold shadow'
              : 'text-neutral-400 hover:text-white'
          }`}
        >
          <BellRing className="w-3.5 h-3.5" />
          <span>Thông báo Telegram Bot</span>
          <span className={`w-2 h-2 rounded-full ${isTelegramConfigured ? 'bg-emerald-400' : 'bg-neutral-600'}`}></span>
        </button>
      </div>

      {/* Main Content Area */}
      <div className="max-w-5xl mx-auto mt-6">
        {activeTab === 'overview' && (
          <div className="space-y-6">
            {/* 6 Stat Cards */}
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3.5">
              <div className="p-4 rounded-2xl bg-neutral-900 border border-neutral-800 space-y-1">
                <div className="flex items-center justify-between text-neutral-400">
                  <span className="text-xs font-medium">Doanh thu đã thu</span>
                  <DollarSign className="w-4 h-4 text-emerald-400" />
                </div>
                <p className="text-lg md:text-xl font-black text-emerald-400">
                  {stats?.revenue.formatted || '0 VND'}
                </p>
                <span className="text-[10px] text-neutral-500">Qua quét mã VietQR</span>
              </div>

              <div className="p-4 rounded-2xl bg-neutral-900 border border-neutral-800 space-y-1">
                <div className="flex items-center justify-between text-neutral-400">
                  <span className="text-xs font-medium">Tổng đơn hàng</span>
                  <Package className="w-4 h-4 text-orange-400" />
                </div>
                <p className="text-lg md:text-xl font-black text-white">
                  {stats?.orders.total || 0}
                </p>
                <span className="text-[10px] text-neutral-500">
                  {stats?.orders.pending || 0} đơn chờ chuyển khoản
                </span>
              </div>

              <div 
                onClick={() => setActiveTab('customers')}
                className="p-4 rounded-2xl bg-neutral-900 border border-neutral-800 space-y-1 hover:border-amber-500/50 cursor-pointer transition-colors"
                title="Bấm để xem danh sách khách hàng"
              >
                <div className="flex items-center justify-between text-neutral-400">
                  <span className="text-xs font-medium">Khách hàng CRM</span>
                  <Crown className="w-4 h-4 text-amber-400" />
                </div>
                <p className="text-lg md:text-xl font-black text-amber-400">
                  {crmData?.summary.total_customers || 0}
                </p>
                <span className="text-[10px] text-amber-300/80">
                  👑 {crmData?.summary.vip_customers || 0} VIP (bấm xem)
                </span>
              </div>

              <div 
                onClick={() => setActiveTab('products')}
                className="p-4 rounded-2xl bg-neutral-900 border border-neutral-800 space-y-1 hover:border-rose-500/60 cursor-pointer transition-all hover:scale-[1.02] active:scale-95 group"
                title="Bấm để vào trang Quản lý Sản phẩm"
              >
                <div className="flex items-center justify-between text-neutral-400 group-hover:text-rose-400">
                  <span className="text-xs font-medium">Kho sản phẩm</span>
                  <ShoppingBag className="w-4 h-4 text-rose-500" />
                </div>
                <p className="text-lg md:text-xl font-black text-white">
                  {products.length}
                </p>
                <span className="text-[10px] text-rose-300 font-bold flex items-center space-x-1">
                  <span>🛍️ Thêm / Nạp mẫu</span>
                </span>
              </div>

              <div className="p-4 rounded-2xl bg-neutral-900 border border-neutral-800 space-y-1">
                <div className="flex items-center justify-between text-neutral-400">
                  <span className="text-xs font-medium">Báo cáo vi phạm</span>
                  <ShieldAlert className="w-4 h-4 text-amber-400" />
                </div>
                <p className="text-lg md:text-xl font-black text-amber-400">
                  {pendingReports.length}
                </p>
                <span className="text-[10px] text-neutral-500">Cần xử lý gấp</span>
              </div>

              <div 
                onClick={() => setActiveTab('videos')}
                className="p-4 rounded-2xl bg-neutral-900 border border-neutral-800 space-y-1 hover:border-rose-500/60 cursor-pointer transition-all hover:scale-[1.02] active:scale-95 group"
                title="Bấm để vào trang Quản lý: Thêm, Sửa, Xóa video"
              >
                <div className="flex items-center justify-between text-neutral-400 group-hover:text-rose-400">
                  <span className="text-xs font-medium">Video hệ thống</span>
                  <Film className="w-4 h-4 text-rose-500" />
                </div>
                <p className="text-lg md:text-xl font-black text-white">
                  {videos.length}
                </p>
                <span className="text-[10px] text-rose-300 font-bold flex items-center space-x-1">
                  <span>🎬 Thêm / Sửa / Xóa</span>
                </span>
              </div>
            </div>

            {/* Quick Action Banner for Videos right on Overview */}
            <div className="p-4 rounded-2xl bg-gradient-to-r from-rose-950/60 via-neutral-900 to-neutral-900 border border-rose-500/40 flex flex-col md:flex-row md:items-center justify-between gap-3 shadow-xl">
              <div className="space-y-1">
                <div className="flex items-center space-x-2">
                  <Film className="w-5 h-5 text-rose-500 animate-pulse" />
                  <h3 className="text-sm font-bold text-white">
                    Quản Lý Video Feed ({videos.length} video đang phát)
                  </h3>
                </div>
                <p className="text-xs text-neutral-300 leading-relaxed max-w-xl">
                  Bạn có thể <strong>Thêm video mới</strong> từ máy tính, <strong>Chỉnh sửa</strong> tiêu đề và sản phẩm gắn kèm, hoặc <strong>Xóa vĩnh viễn</strong> video khỏi hệ thống.
                </p>
              </div>

              <div className="flex items-center space-x-2 flex-wrap gap-2">
                <button
                  onClick={() => {
                    setActiveTab('videos');
                    handleOpenAddVideo();
                  }}
                  className="px-3.5 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold flex items-center space-x-1.5 shadow-lg shadow-rose-600/30 active:scale-95 transition-all cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                  <span>➕ Thêm Video Mới</span>
                </button>

                <button
                  onClick={() => setActiveTab('videos')}
                  className="px-3.5 py-2 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-neutral-200 text-xs font-semibold flex items-center space-x-1.5 border border-neutral-700 active:scale-95 transition-all cursor-pointer"
                >
                  <Film className="w-4 h-4 text-sky-400" />
                  <span>🎬 Xem & Sửa/Xóa Video</span>
                </button>
              </div>
            </div>

            {/* TikTok Shop Affiliate & Dropshipping Operating Banner */}
            {(() => {
              const estimatedDropshipProfit = orders.reduce((sum, ord) => {
                if (ord.status === 'cancelled') return sum;
                const orderProfit = ord.items?.reduce((itemSum, it) => {
                  const matched = products.find(p => p.title === it.product_title || p.id === it.product_id);
                  const cost = matched?.cost_price ? Number(matched.cost_price) : Number(it.price) * 0.65;
                  return itemSum + Math.max(0, (Number(it.price) - cost) * it.quantity);
                }, 0) || (Number(ord.total_amount) * 0.35);
                return sum + orderProfit;
              }, 0);

              return (
                <div className="p-4 rounded-2xl bg-gradient-to-r from-purple-950/70 via-neutral-900 to-neutral-900 border border-purple-500/40 flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-xl">
                  <div className="space-y-1">
                    <div className="flex items-center space-x-2">
                      <PackageCheck className="w-5 h-5 text-purple-400" />
                      <h3 className="text-sm font-bold text-white">
                        Mô hình TikTok Shop Affiliate & Dropshipping (Không cần vốn ôm hàng)
                      </h3>
                      <span className="bg-purple-500/20 text-purple-300 text-[10px] font-bold px-2 py-0.5 rounded-full border border-purple-500/30">
                        Đang kích hoạt
                      </span>
                    </div>
                    <p className="text-xs text-neutral-300 leading-relaxed max-w-2xl">
                      Khách xem video và chốt đơn quét <strong>VietQR</strong> trực tiếp về STK của <strong>Lữ Tiến Phát (VietinBank 93287556868)</strong>. Bạn dùng tính năng <strong>1-Click Copy</strong> trong mục Đơn Hàng để đặt từ nguồn hàng sỉ/Shopee giao thẳng cho khách mà không cần ôm hàng tồn!
                    </p>
                  </div>

                  <div className="flex items-center space-x-4 bg-neutral-950/80 p-3 rounded-xl border border-purple-500/30 flex-shrink-0">
                    <div>
                      <div className="text-[10px] text-neutral-400 uppercase font-semibold">Ước tính Lợi Nhuận Ròng Dropship</div>
                      <div className="text-lg font-black text-emerald-400 font-mono">
                        +{Math.round(estimatedDropshipProfit).toLocaleString('vi-VN')}₫
                      </div>
                      <div className="text-[10px] text-purple-300 font-medium">Biên lợi nhuận ~35-40% / đơn</div>
                    </div>
                  </div>
                </div>
              );
            })()}

            {/* Safety & Legal Note for Admin */}
            <div className="bg-gradient-to-r from-rose-950/40 via-neutral-900 to-amber-950/30 p-4 rounded-2xl border border-rose-900/50 flex items-start space-x-3">
              <ShieldAlert className="w-6 h-6 text-rose-400 flex-shrink-0 mt-0.5" />
              <div>
                <h3 className="text-xs font-bold text-rose-200">Cam kết An toàn & Pháp lý (Safety First)</h3>
                <p className="text-xs text-neutral-300 mt-1 leading-relaxed">
                  Là Admin tối cao, Phát có quyền hạn 1-click để <strong>ẩn hoặc xóa ngay lập tức</strong> bất kỳ video nào vi phạm bản quyền hình ảnh/âm thanh hoặc buôn bán hàng kém chất lượng. Khi bấm Ẩn, video sẽ biến mất khỏi feed người xem ngay lập tức mà không cần khởi động lại server.
                </p>
              </div>
            </div>

            {/* Telegram Notification Bot Card */}
            {renderTelegramSection()}
          </div>
        )}

        {activeTab === 'customers' && (
          <div className="space-y-5">
            {/* 4 CRM Metric Cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3.5">
              <div className="p-4 rounded-2xl bg-neutral-900 border border-neutral-800 space-y-1">
                <div className="flex items-center justify-between text-neutral-400">
                  <span className="text-xs font-medium">Tổng tệp khách hàng</span>
                  <Users className="w-4 h-4 text-sky-400" />
                </div>
                <p className="text-lg md:text-xl font-black text-white">
                  {crmData?.summary.total_customers || 0}
                </p>
                <span className="text-[10px] text-neutral-500">Người mua đã lưu SĐT</span>
              </div>

              <div className="p-4 rounded-2xl bg-neutral-900 border border-neutral-800 space-y-1">
                <div className="flex items-center justify-between text-neutral-400">
                  <span className="text-xs font-medium">Khách VIP</span>
                  <Crown className="w-4 h-4 text-amber-400" />
                </div>
                <p className="text-lg md:text-xl font-black text-amber-400">
                  {crmData?.summary.vip_customers || 0}
                </p>
                <span className="text-[10px] text-amber-500/80">Mua ≥ 2 đơn hoặc ≥ 500k</span>
              </div>

              <div className="p-4 rounded-2xl bg-neutral-900 border border-neutral-800 space-y-1">
                <div className="flex items-center justify-between text-neutral-400">
                  <span className="text-xs font-medium">Tổng tiền khách đã chi</span>
                  <DollarSign className="w-4 h-4 text-emerald-400" />
                </div>
                <p className="text-lg md:text-xl font-black text-emerald-400">
                  {crmData?.summary.formatted_total_spent || '0 VND'}
                </p>
                <span className="text-[10px] text-neutral-500">Giá trị trọn đời (LTV)</span>
              </div>

              <div className="p-4 rounded-2xl bg-neutral-900 border border-neutral-800 space-y-1">
                <div className="flex items-center justify-between text-neutral-400">
                  <span className="text-xs font-medium">Chi tiêu TB / Khách</span>
                  <TrendingUp className="w-4 h-4 text-rose-400" />
                </div>
                <p className="text-lg md:text-xl font-black text-rose-400">
                  {crmData?.summary.formatted_avg_spent || '0 VND'}
                </p>
                <span className="text-[10px] text-neutral-500">Giá trị đơn TB (AOV)</span>
              </div>
            </div>

            {/* Filter & Search Bar */}
            <div className="bg-neutral-900 p-3.5 rounded-2xl border border-neutral-800 flex flex-col md:flex-row gap-3 items-center justify-between">
              <div className="relative w-full md:w-80">
                <Search className="w-4 h-4 text-neutral-500 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Tìm theo tên, SĐT (ví dụ: 0912...), địa chỉ..."
                  value={customerSearch}
                  onChange={(e) => setCustomerSearch(e.target.value)}
                  className="w-full bg-neutral-950 border border-neutral-800 rounded-xl pl-9 pr-8 py-2 text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-rose-500 transition-colors"
                />
                {customerSearch && (
                  <button
                    onClick={() => setCustomerSearch('')}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-neutral-500 hover:text-neutral-300 text-xs px-1 cursor-pointer"
                  >
                    ✕
                  </button>
                )}
              </div>

              <div className="flex items-center space-x-1.5 w-full md:w-auto overflow-x-auto no-scrollbar">
                <button
                  onClick={() => setCustomerTierFilter('all')}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-colors cursor-pointer ${
                    customerTierFilter === 'all'
                      ? 'bg-neutral-100 text-neutral-900 font-bold'
                      : 'bg-neutral-950 text-neutral-400 hover:text-white border border-neutral-800'
                  }`}
                >
                  Tất cả ({crmData?.customers.length || 0})
                </button>
                <button
                  onClick={() => setCustomerTierFilter('vip')}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-colors flex items-center space-x-1 cursor-pointer ${
                    customerTierFilter === 'vip'
                      ? 'bg-amber-500 text-black font-bold'
                      : 'bg-neutral-950 text-amber-400 hover:bg-neutral-800 border border-neutral-800'
                  }`}
                >
                  <Crown className="w-3 h-3" />
                  <span>👑 VIP ({crmData?.summary.vip_customers || 0})</span>
                </button>
                <button
                  onClick={() => setCustomerTierFilter('regular')}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-colors flex items-center space-x-1 cursor-pointer ${
                    customerTierFilter === 'regular'
                      ? 'bg-emerald-500 text-black font-bold'
                      : 'bg-neutral-950 text-emerald-400 hover:bg-neutral-800 border border-neutral-800'
                  }`}
                >
                  <span>🛍️ Thân thiết</span>
                </button>
                <button
                  onClick={() => setCustomerTierFilter('lead')}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-colors flex items-center space-x-1 cursor-pointer ${
                    customerTierFilter === 'lead'
                      ? 'bg-rose-500 text-white font-bold'
                      : 'bg-neutral-950 text-neutral-400 hover:bg-neutral-800 border border-neutral-800'
                  }`}
                >
                  <span>⏳ Chờ thanh toán</span>
                </button>
              </div>
            </div>

            {/* Customer List */}
            {filteredCustomers.length === 0 ? (
              <div className="text-center py-12 bg-neutral-900/50 rounded-2xl border border-neutral-800">
                <Users className="w-10 h-10 text-neutral-600 mx-auto mb-2" />
                <p className="text-sm font-semibold text-neutral-400">Không tìm thấy khách hàng nào</p>
                <p className="text-xs text-neutral-500 mt-1">
                  Thử đổi từ khóa tìm kiếm hoặc lọc theo phân hạng khác
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {filteredCustomers.map((cust) => {
                  const isExpanded = expandedPhone === cust.phone;
                  const isCopied = copiedPhone === cust.phone;
                  const initials = cust.name.trim().slice(0, 2).toUpperCase() || 'KH';

                  return (
                    <div
                      key={cust.phone}
                      className="bg-neutral-900 rounded-2xl p-4 border border-neutral-800 hover:border-neutral-700/80 transition-all space-y-3"
                    >
                      {/* Top Header */}
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                        <div className="flex items-center space-x-3">
                          <div className={`w-11 h-11 rounded-full flex items-center justify-center font-bold text-sm text-white shadow-md ${
                            cust.tier === 'vip'
                              ? 'bg-gradient-to-tr from-amber-500 to-orange-500'
                              : cust.tier === 'regular'
                              ? 'bg-gradient-to-tr from-emerald-600 to-teal-500'
                              : 'bg-neutral-800 text-neutral-300'
                          }`}>
                            {initials}
                          </div>

                          <div>
                            <div className="flex items-center space-x-2">
                              <h3 className="font-bold text-sm text-white">{cust.name}</h3>
                              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                                cust.tier === 'vip'
                                  ? 'bg-amber-500/10 text-amber-400 border-amber-500/30'
                                  : cust.tier === 'regular'
                                  ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                                  : 'bg-neutral-800 text-neutral-400 border-neutral-700'
                              }`}>
                                {cust.tier_display}
                              </span>
                            </div>
                            <p className="text-xs font-mono text-neutral-400 mt-0.5">
                              {cust.phone}
                            </p>
                          </div>
                        </div>

                        {/* Financial summary */}
                        <div className="flex sm:flex-col items-center sm:items-end justify-between sm:justify-center border-t sm:border-t-0 pt-2 sm:pt-0 border-neutral-800/80">
                          <span className="text-base font-extrabold text-emerald-400">
                            {cust.formatted_spent}
                          </span>
                          <span className="text-[11px] text-neutral-400 font-medium">
                            {cust.total_orders} đơn hàng
                          </span>
                        </div>
                      </div>

                      {/* Info snippet */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-neutral-400 bg-neutral-950/60 p-2.5 rounded-xl border border-neutral-800/60">
                        <div className="flex items-center space-x-1.5 truncate">
                          <MapPin className="w-3.5 h-3.5 text-rose-400 flex-shrink-0" />
                          <span className="truncate">{cust.shipping_address || 'Chưa cập nhật địa chỉ'}</span>
                        </div>
                        <div className="flex items-center space-x-1.5">
                          <Calendar className="w-3.5 h-3.5 text-sky-400 flex-shrink-0" />
                          <span>Đơn gần nhất: {cust.last_order_date ? new Date(cust.last_order_date).toLocaleDateString('vi-VN') : 'Mới'}</span>
                        </div>
                      </div>

                      {/* 1-Click Action Bar */}
                      <div className="flex flex-wrap items-center justify-between gap-2 pt-1 border-t border-neutral-800/60">
                        <div className="flex items-center space-x-2">
                          <a
                            href={`tel:${cust.phone}`}
                            className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold shadow transition-all active:scale-95"
                          >
                            <PhoneCall className="w-3.5 h-3.5" />
                            <span>Gọi điện</span>
                          </a>

                          <a
                            href={`https://zalo.me/${cust.phone.replace(/^0/, '84')}`}
                            target="_blank"
                            rel="noreferrer"
                            className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-sky-600 hover:bg-sky-500 text-white text-xs font-semibold shadow transition-all active:scale-95"
                          >
                            <MessageSquare className="w-3.5 h-3.5" />
                            <span>Nhắn Zalo</span>
                          </a>

                          <button
                            onClick={() => handleCopyPhone(cust.phone)}
                            className="inline-flex items-center space-x-1 px-2.5 py-1.5 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-neutral-300 text-xs font-medium border border-neutral-700 transition-colors cursor-pointer"
                          >
                            {isCopied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                            <span>{isCopied ? 'Đã copy' : 'Copy SĐT'}</span>
                          </button>
                        </div>

                        <button
                          onClick={() => toggleExpandPhone(cust.phone)}
                          className="inline-flex items-center space-x-1 px-3 py-1.5 rounded-xl bg-neutral-800/80 hover:bg-neutral-800 text-neutral-300 text-xs font-medium border border-neutral-700/80 transition-colors ml-auto cursor-pointer"
                        >
                          <span>{isExpanded ? 'Thu gọn' : `Xem ${cust.orders.length} đơn hàng`}</span>
                          {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                        </button>
                      </div>

                      {/* Expandable Order History */}
                      {isExpanded && (
                        <div className="pt-2 border-t border-neutral-800 space-y-2">
                          <p className="text-xs font-bold text-neutral-300 flex items-center space-x-1">
                            <Package className="w-3.5 h-3.5 text-orange-400" />
                            <span>Chi tiết lịch sử đặt hàng của khách:</span>
                          </p>

                          <div className="space-y-2">
                            {cust.orders.map((ord) => (
                              <div
                                key={ord.id}
                                className="bg-neutral-950 p-3 rounded-xl border border-neutral-800/80 text-xs space-y-2"
                              >
                                <div className="flex items-center justify-between">
                                  <div className="flex items-center space-x-2">
                                    <span className="font-mono font-bold text-orange-400">{ord.order_code}</span>
                                    <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
                                      ord.is_paid ? 'bg-emerald-500/20 text-emerald-400' : 'bg-amber-500/20 text-amber-300'
                                    }`}>
                                      {ord.status_display}
                                    </span>
                                  </div>
                                  <span className="text-[11px] text-neutral-500">
                                    {new Date(ord.created_at).toLocaleString('vi-VN')}
                                  </span>
                                </div>

                                <div className="space-y-1 pl-2 border-l-2 border-neutral-800">
                                  {ord.items.map((item, idx) => (
                                    <div key={idx} className="flex justify-between text-neutral-300 text-[11px]">
                                      <span>
                                        {item.quantity}x {item.title}
                                      </span>
                                      <span className="font-mono text-neutral-400">
                                        {(item.price * item.quantity).toLocaleString('vi-VN')}₫
                                      </span>
                                    </div>
                                  ))}
                                </div>

                                <div className="flex items-center justify-between pt-1 border-t border-neutral-900">
                                  <span className="text-[11px] text-neutral-400">Tổng tiền đơn:</span>
                                  <div className="flex items-center space-x-2">
                                    <span className="font-extrabold text-white">
                                      {Number(ord.total_amount).toLocaleString('vi-VN')}₫
                                    </span>
                                    {ord.vietqr_url && (
                                      <a
                                        href={ord.vietqr_url}
                                        target="_blank"
                                        rel="noreferrer"
                                        className="text-[10px] px-2 py-0.5 rounded bg-neutral-800 hover:bg-neutral-700 text-sky-400 flex items-center space-x-1"
                                      >
                                        <span>QR</span>
                                        <ExternalLink className="w-2.5 h-2.5" />
                                      </a>
                                    )}
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {activeTab === 'moderation' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-bold text-neutral-200">
                Danh sách Báo cáo Vi phạm ({reports.length})
              </h2>
              <span className="text-xs text-amber-400 font-semibold">
                {pendingReports.length} báo cáo chưa xử lý
              </span>
            </div>

            {reports.length === 0 ? (
              <div className="bg-neutral-900 rounded-2xl border border-neutral-800 p-12 text-center text-neutral-500 space-y-2">
                <CheckCircle2 className="w-10 h-10 mx-auto text-emerald-500/50" />
                <p className="text-xs">Không có báo cáo vi phạm nào. Nền tảng đang an toàn!</p>
              </div>
            ) : (
              <div className="space-y-3">
                {reports.map((rep) => (
                  <div
                    key={rep.id}
                    className="bg-neutral-900 rounded-2xl border border-neutral-800 p-4 space-y-3"
                  >
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-2 pb-2 border-b border-neutral-800">
                      <div className="flex items-center space-x-2">
                        <span className="font-bold text-xs text-rose-400">
                          Báo cáo #{rep.id}
                        </span>
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                          rep.status === 'pending'
                            ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                            : rep.status === 'resolved'
                            ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                            : 'bg-neutral-800 text-neutral-400'
                        }`}>
                          {rep.status === 'pending' && 'Chờ xử lý'}
                          {rep.status === 'resolved' && 'Đã xử lý (Ẩn video)'}
                          {rep.status === 'dismissed' && 'Đã bỏ qua'}
                        </span>
                      </div>

                      <span className="text-[11px] text-neutral-500">
                        {new Date(rep.created_at).toLocaleString('vi-VN')}
                      </span>
                    </div>

                    <div className="space-y-1.5 text-xs">
                      <p className="text-neutral-300">
                        <strong>Video bị báo cáo:</strong>{' '}
                        <span className="text-white font-medium">{rep.video_title}</span>
                      </p>
                      <p className="text-neutral-400">
                        <strong>Lý do:</strong>{' '}
                        <span className="text-amber-300 font-semibold">
                          {rep.reason === 'copyright' && 'Vi phạm bản quyền âm thanh / hình ảnh'}
                          {rep.reason === 'scam' && 'Lừa đảo / Hàng giả kém chất lượng'}
                          {rep.reason === 'inappropriate' && 'Nội dung phản cảm / Không phù hợp'}
                          {rep.reason === 'other' && 'Lý do khác'}
                        </span>
                      </p>
                      {rep.details && (
                        <p className="text-neutral-300 bg-neutral-800/60 p-2.5 rounded-lg border border-neutral-700">
                          <strong>Chi tiết:</strong> {rep.details}
                        </p>
                      )}
                    </div>

                    {rep.status === 'pending' && (
                      <div className="flex items-center justify-end space-x-2 pt-2 border-t border-neutral-800">
                        <button
                          onClick={() => handleDismissReport(rep.id)}
                          className="px-3 py-1.5 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-neutral-300 text-xs font-semibold transition-colors"
                        >
                          Bỏ qua
                        </button>

                        <button
                          onClick={() => handleResolveReport(rep.id)}
                          className="px-3 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold flex items-center space-x-1.5 shadow-lg shadow-rose-600/20 transition-all active:scale-95"
                        >
                          <EyeOff className="w-3.5 h-3.5" />
                          <span>Ẩn video ngay lập tức</span>
                        </button>
                      </div>
                    )}

                    {rep.status === 'resolved' && (
                      <div className="flex items-center justify-between pt-2 border-t border-neutral-800">
                        <span className="text-[11px] text-rose-400 flex items-center space-x-1">
                          <EyeOff className="w-3.5 h-3.5" />
                          <span>Video này đang bị ẩn khỏi feed</span>
                        </span>
                        <button
                          onClick={() => handleUnhideReport(rep.id)}
                          className="px-3 py-1.5 rounded-lg bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-300 border border-emerald-500/30 text-xs font-semibold flex items-center space-x-1.5 transition-all active:scale-95 cursor-pointer"
                        >
                          <Eye className="w-3.5 h-3.5 text-emerald-400" />
                          <span>Bỏ ẩn & Khôi phục video</span>
                        </button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === 'videos' && (
          <div className="space-y-4">
            {/* Header + Add Button */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-2 border-b border-neutral-800 gap-3">
              <div>
                <h2 className="text-sm font-bold text-neutral-200 flex items-center space-x-2">
                  <Film className="w-4 h-4 text-rose-500" />
                  <span>Quản lý Toàn bộ Video ({videos.length})</span>
                </h2>
                <p className="text-xs text-neutral-400 mt-0.5">
                  Thêm mới video từ máy/TikTok, chỉnh sửa tiêu đề & sản phẩm gắn kèm, hoặc xóa vĩnh viễn
                </p>
              </div>

              <div className="flex items-center space-x-2 self-start sm:self-auto">
                {/* 1-Click Fast Upload and Publish Button */}
                <input
                  type="file"
                  ref={quickUploadInputRef}
                  onChange={handleQuickUploadAndPost}
                  accept="video/*"
                  className="hidden"
                />

                <button
                  onClick={() => quickUploadInputRef.current?.click()}
                  disabled={isQuickUploading}
                  className="px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold flex items-center space-x-1.5 shadow-lg shadow-emerald-600/20 active:scale-95 transition-all cursor-pointer disabled:opacity-50"
                  title="Chọn file video là hệ thống tự động đăng ngay lập tức lên feed"
                >
                  {isQuickUploading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Đang đăng video...</span>
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4 text-amber-300" />
                      <span>⚡ Up File Đăng Luôn</span>
                    </>
                  )}
                </button>

                <button
                  onClick={handleOpenAddVideo}
                  className="px-3.5 py-2 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-neutral-200 text-xs font-semibold flex items-center space-x-1.5 border border-neutral-700 active:scale-95 transition-all cursor-pointer"
                  title="Mở bảng tùy chỉnh chi tiết tiêu đề, sản phẩm gắn kèm"
                >
                  <Plus className="w-4 h-4 text-rose-400" />
                  <span>Tùy chỉnh chi tiết</span>
                </button>
              </div>
            </div>

            {/* Video Action Toast */}
            {videoToastMessage && (
              <div className={`p-3 rounded-xl text-xs font-medium flex items-center justify-between animate-in fade-in-50 duration-200 ${
                videoToastMessage.type === 'success' 
                  ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30' 
                  : 'bg-rose-500/15 text-rose-400 border border-rose-500/30'
              }`}>
                <div className="flex items-center space-x-2">
                  {videoToastMessage.type === 'success' ? <CheckCircle2 className="w-4 h-4 flex-shrink-0" /> : <AlertTriangle className="w-4 h-4 flex-shrink-0" />}
                  <span>{videoToastMessage.text}</span>
                </div>
                <button 
                  onClick={() => setVideoToastMessage(null)} 
                  className="text-neutral-400 hover:text-white ml-2 p-0.5"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            )}

            {/* Search & Filter Bar */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
              <div className="relative flex-1 max-w-md">
                <Search className="w-3.5 h-3.5 text-neutral-500 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Tìm video theo tiêu đề, người đăng, sản phẩm..."
                  value={videoSearch}
                  onChange={(e) => setVideoSearch(e.target.value)}
                  className="w-full bg-neutral-900 border border-neutral-800 rounded-xl pl-9 pr-3.5 py-2 text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-rose-500 transition-colors"
                />
              </div>

              <div className="flex items-center space-x-1.5 bg-neutral-900 p-1 rounded-xl border border-neutral-800 text-xs">
                <button
                  onClick={() => setVideoFilter('all')}
                  className={`px-3 py-1 rounded-lg font-medium transition-all ${
                    videoFilter === 'all'
                      ? 'bg-rose-600 text-white font-bold shadow'
                      : 'text-neutral-400 hover:text-white'
                  }`}
                >
                  Tất cả ({videos.length})
                </button>
                <button
                  onClick={() => setVideoFilter('visible')}
                  className={`px-3 py-1 rounded-lg font-medium transition-all ${
                    videoFilter === 'visible'
                      ? 'bg-emerald-600 text-white font-bold shadow'
                      : 'text-neutral-400 hover:text-white'
                  }`}
                >
                  Đang hiện ({videos.filter(v => !v.is_hidden).length})
                </button>
                <button
                  onClick={() => setVideoFilter('hidden')}
                  className={`px-3 py-1 rounded-lg font-medium transition-all ${
                    videoFilter === 'hidden'
                      ? 'bg-rose-950 text-rose-300 font-bold border border-rose-800/60 shadow'
                      : 'text-neutral-400 hover:text-white'
                  }`}
                >
                  Đang ẩn ({videos.filter(v => v.is_hidden).length})
                </button>
              </div>
            </div>

            {/* Video Cards Grid */}
            {(() => {
              const filteredVideos = videos.filter((v) => {
                if (videoSearch.trim()) {
                  const q = videoSearch.toLowerCase();
                  const matchTitle = v.title.toLowerCase().includes(q);
                  const matchDesc = (v.description || '').toLowerCase().includes(q);
                  const matchUploader = (v.uploader_name || '').toLowerCase().includes(q);
                  const matchProd = v.products?.some(p => p.title.toLowerCase().includes(q));
                  if (!matchTitle && !matchDesc && !matchUploader && !matchProd) return false;
                }
                if (videoFilter === 'visible' && v.is_hidden) return false;
                if (videoFilter === 'hidden' && !v.is_hidden) return false;
                return true;
              });

              if (filteredVideos.length === 0) {
                return (
                  <div className="text-center py-12 bg-neutral-900/50 rounded-2xl border border-neutral-800 space-y-3">
                    <Film className="w-10 h-10 text-neutral-600 mx-auto" />
                    <p className="text-sm font-semibold text-neutral-400">Không tìm thấy video nào</p>
                    <p className="text-xs text-neutral-500">
                      Thử đổi bộ lọc hoặc bấm "Thêm Video Mới" để tạo video đầu tiên
                    </p>
                    <button
                      onClick={handleOpenAddVideo}
                      className="px-3.5 py-1.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-semibold inline-flex items-center space-x-1.5 transition-all shadow"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Thêm Video Ngay</span>
                    </button>
                  </div>
                );
              }

              return (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                  {filteredVideos.map((v) => {
                    const attachedProd = v.products && v.products.length > 0 ? v.products[0] : null;
                    const categoryLabel = 
                      v.category === 'tech' ? 'Công nghệ ⚡' :
                      v.category === 'fashion' ? 'Thời trang 👕' :
                      v.category === 'lifestyle' ? 'Đời sống 🏠' :
                      v.category === 'food' ? 'Ẩm thực 🍔' :
                      v.category === 'beauty' ? 'Làm đẹp 💄' : 'Tất cả';

                    return (
                      <div
                        key={v.id}
                        className={`p-3.5 rounded-2xl border transition-all flex flex-col justify-between ${
                          v.is_hidden
                            ? 'bg-neutral-900/50 border-rose-900/60 opacity-80'
                            : 'bg-neutral-900 border-neutral-800 hover:border-neutral-700/80'
                        }`}
                      >
                        <div className="flex space-x-3">
                          {/* 9:16 Video Thumbnail */}
                          <div className="w-24 h-36 rounded-xl overflow-hidden bg-black flex-shrink-0 relative border border-neutral-800">
                            <video
                              src={resolveMediaUrl(v.video_url)}
                              className="w-full h-full object-cover"
                              muted
                              playsInline
                              preload="metadata"
                              onError={(e) => {
                                const target = e.currentTarget;
                                const fallback = `/videos/v${((v.id - 1) % 8) + 1}.mp4`;
                                if (!target.src.endsWith(fallback)) {
                                  target.src = fallback;
                                }
                              }}
                            />
                            {v.is_hidden && (
                              <div className="absolute inset-0 bg-black/75 flex flex-col items-center justify-center p-1 text-center">
                                <EyeOff className="w-5 h-5 text-rose-400 mb-1" />
                                <span className="text-[9px] text-rose-300 font-bold">Đã ẩn</span>
                              </div>
                            )}
                            <div className="absolute bottom-1 right-1 bg-black/70 px-1 py-0.5 rounded text-[9px] font-mono text-neutral-300">
                              #{v.id}
                            </div>
                          </div>

                          {/* Info Column */}
                          <div className="flex-1 flex flex-col justify-between min-w-0">
                            <div className="space-y-1">
                              <div className="flex items-center justify-between gap-1">
                                <span className="text-[10px] text-neutral-400 truncate">@{v.uploader_name}</span>
                                <div className="flex items-center space-x-1">
                                  <span className="text-[9px] px-1.5 py-0.5 rounded bg-neutral-800 text-neutral-300 font-medium">
                                    {categoryLabel}
                                  </span>
                                  <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded ${
                                    v.is_hidden
                                      ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                                      : 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                                  }`}>
                                    {v.is_hidden ? 'Đang ẩn' : 'Đang hiện'}
                                  </span>
                                </div>
                              </div>

                              <h4 className="text-xs font-bold text-white line-clamp-2 leading-snug" title={v.title}>
                                {v.title}
                              </h4>

                              {v.description && (
                                <p className="text-[11px] text-neutral-400 line-clamp-1">
                                  {v.description}
                                </p>
                              )}

                              {/* Attached Product Box */}
                              {attachedProd ? (
                                <div className="flex items-center space-x-2 p-1.5 rounded-xl bg-neutral-950 border border-neutral-800/80 mt-1">
                                  <img 
                                    src={attachedProd.image_url} 
                                    alt="" 
                                    className="w-8 h-8 rounded-lg object-cover flex-shrink-0"
                                    onError={(e) => { (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=100'; }}
                                  />
                                  <div className="flex-1 min-w-0">
                                    <p className="text-[11px] font-semibold text-neutral-200 truncate">
                                      {attachedProd.title}
                                    </p>
                                    <p className="text-[10px] font-extrabold text-amber-400 font-mono">
                                      {Number(attachedProd.price).toLocaleString('vi-VN')}₫
                                    </p>
                                  </div>
                                </div>
                              ) : (
                                <div className="p-1 rounded-lg bg-neutral-950/60 border border-neutral-800/60 text-[10px] text-neutral-500 flex items-center space-x-1">
                                  <Tag className="w-3 h-3 text-neutral-600" />
                                  <span>Chưa gắn sản phẩm</span>
                                </div>
                              )}
                            </div>

                            {/* Engagement stats */}
                            <div className="pt-2 text-[10px] text-neutral-400 flex items-center space-x-3">
                              <span>❤️ {v.likes_count}</span>
                              <span>💬 {v.comments_count}</span>
                              <span>↗️ {v.shares_count}</span>
                            </div>
                          </div>
                        </div>

                        {/* Action Buttons: Edit, Toggle Hide, Delete */}
                        <div className="pt-3 mt-3 border-t border-neutral-800/80 flex items-center justify-between gap-2">
                          <button
                            onClick={() => handleToggleHide(v.id)}
                            className={`px-2.5 py-1.5 rounded-xl text-xs font-semibold flex items-center space-x-1 transition-all active:scale-95 cursor-pointer ${
                              v.is_hidden
                                ? 'bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-400 border border-emerald-500/30'
                                : 'bg-neutral-800 hover:bg-neutral-700 text-neutral-300 border border-neutral-700'
                            }`}
                            title={v.is_hidden ? 'Hiện video lên feed' : 'Ẩn video khỏi feed'}
                          >
                            {v.is_hidden ? (
                              <>
                                <Eye className="w-3.5 h-3.5 text-emerald-400" />
                                <span>Bỏ ẩn</span>
                              </>
                            ) : (
                              <>
                                <EyeOff className="w-3.5 h-3.5 text-neutral-400" />
                                <span>Ẩn video</span>
                              </>
                            )}
                          </button>

                          <div className="flex items-center space-x-2">
                            <button
                              onClick={() => handleOpenEditVideo(v)}
                              className="px-3 py-1.5 rounded-xl bg-sky-600/20 hover:bg-sky-600/30 text-sky-400 border border-sky-500/30 text-xs font-semibold flex items-center space-x-1 transition-all active:scale-95 cursor-pointer"
                              title="Chỉnh sửa thông tin video & sản phẩm"
                            >
                              <Edit2 className="w-3.5 h-3.5" />
                              <span>Sửa</span>
                            </button>

                            <button
                              onClick={() => setDeletingVideo(v)}
                              className="px-3 py-1.5 rounded-xl bg-rose-600/20 hover:bg-rose-600/30 text-rose-400 border border-rose-500/30 text-xs font-semibold flex items-center space-x-1 transition-all active:scale-95 cursor-pointer"
                              title="Xóa vĩnh viễn video khỏi cơ sở dữ liệu"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                              <span>Xóa</span>
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              );
            })()}
          </div>
        )}

        {activeTab === 'products' && (
          <div className="space-y-4">
            {/* Header + Actions */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-2 border-b border-neutral-800 gap-3">
              <div>
                <h2 className="text-sm font-bold text-neutral-200 flex items-center space-x-2">
                  <ShoppingBag className="w-4 h-4 text-rose-500" />
                  <span>Quản lý Toàn bộ Sản phẩm ({products.length})</span>
                </h2>
                <p className="text-xs text-neutral-400 mt-0.5">
                  Thêm mới, sửa thông tin, giá bán, tồn kho và ảnh sản phẩm đính kèm vào video
                </p>
              </div>

              <div className="flex items-center space-x-2 flex-wrap gap-2">
                <button
                  type="button"
                  onClick={handleSeedMoreProducts}
                  disabled={isSeedingProducts}
                  className="px-3 py-1.5 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/30 text-xs font-semibold flex items-center space-x-1.5 transition-all active:scale-95 cursor-pointer disabled:opacity-50"
                  title="Nạp nhanh 10 sản phẩm thịnh hành (Tech, Fashion, Food, Beauty)"
                >
                  {isSeedingProducts ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      <span>Đang nạp...</span>
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                      <span>⚡ Nạp 10 SP thịnh hành</span>
                    </>
                  )}
                </button>

                <button
                  type="button"
                  onClick={handleOpenAddProduct}
                  className="px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-rose-600 to-pink-600 hover:from-rose-500 hover:to-pink-500 text-white text-xs font-bold flex items-center space-x-1.5 shadow-lg shadow-rose-600/30 transition-all active:scale-95 cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                  <span>Thêm sản phẩm mới</span>
                </button>
              </div>
            </div>

            {/* Product Toast Feedback */}
            {productToastMessage && (
              <div className={`p-3 rounded-xl border text-xs flex items-center space-x-2 animate-in fade-in duration-200 ${
                productToastMessage.type === 'success'
                  ? 'bg-emerald-950/40 border-emerald-500/30 text-emerald-300'
                  : 'bg-rose-950/40 border-rose-500/30 text-rose-300'
              }`}>
                {productToastMessage.type === 'success' ? (
                  <CheckCircle2 className="w-4 h-4 flex-shrink-0 text-emerald-400" />
                ) : (
                  <AlertTriangle className="w-4 h-4 flex-shrink-0 text-rose-400" />
                )}
                <span>{productToastMessage.text}</span>
              </div>
            )}

            {/* Search & Category Filter Pills */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
              <div className="relative flex-1 max-w-md">
                <Search className="w-4 h-4 text-neutral-500 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Tìm sản phẩm theo tên, mô tả hoặc người bán..."
                  value={productSearch}
                  onChange={(e) => setProductSearch(e.target.value)}
                  className="w-full bg-neutral-900 border border-neutral-800 rounded-xl pl-9 pr-4 py-2 text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-rose-500 transition-colors"
                />
                {productSearch && (
                  <button
                    onClick={() => setProductSearch('')}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-white"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>

              {/* Category Filter Pills */}
              <div className="flex items-center space-x-1.5 overflow-x-auto pb-1 text-xs">
                {[
                  { id: 'all', label: 'Tất cả' },
                  { id: 'tech', label: 'Công nghệ ⚡' },
                  { id: 'fashion', label: 'Thời trang 👕' },
                  { id: 'lifestyle', label: 'Đời sống 🏠' },
                  { id: 'food', label: 'Ẩm thực 🍔' },
                  { id: 'beauty', label: 'Làm đẹp 💄' },
                ].map((cat) => (
                  <button
                    key={cat.id}
                    onClick={() => setProductCategoryFilter(cat.id)}
                    className={`px-3 py-1.5 rounded-xl font-medium whitespace-nowrap transition-all text-xs cursor-pointer ${
                      productCategoryFilter === cat.id
                        ? 'bg-rose-600 text-white font-bold shadow'
                        : 'bg-neutral-900 hover:bg-neutral-800 text-neutral-400 hover:text-white border border-neutral-800'
                    }`}
                  >
                    {cat.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Product Cards Grid */}
            {(() => {
              const filteredProducts = products.filter((p) => {
                if (productSearch.trim()) {
                  const q = productSearch.toLowerCase().trim();
                  const matchTitle = p.title.toLowerCase().includes(q);
                  const matchDesc = (p.description || '').toLowerCase().includes(q);
                  const matchSeller = (p.seller_name || '').toLowerCase().includes(q);
                  if (!matchTitle && !matchDesc && !matchSeller) return false;
                }
                if (productCategoryFilter !== 'all' && p.category !== productCategoryFilter) {
                  return false;
                }
                return true;
              });

              if (filteredProducts.length === 0) {
                return (
                  <div className="text-center py-12 bg-neutral-900/50 rounded-2xl border border-neutral-800 space-y-3">
                    <ShoppingBag className="w-10 h-10 mx-auto text-neutral-600" />
                    <p className="text-xs text-neutral-400 font-medium">Không tìm thấy sản phẩm nào phù hợp</p>
                    <button
                      onClick={handleOpenAddProduct}
                      className="px-3.5 py-1.5 rounded-xl bg-rose-600/20 text-rose-400 border border-rose-500/30 text-xs font-semibold hover:bg-rose-600/30 transition-colors"
                    >
                      + Thêm sản phẩm đầu tiên
                    </button>
                  </div>
                );
              }

              return (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
                  {filteredProducts.map((p) => {
                    const discountPercent = p.original_price && Number(p.original_price) > Number(p.price)
                      ? Math.round(((Number(p.original_price) - Number(p.price)) / Number(p.original_price)) * 100)
                      : null;

                    const catLabel = 
                      p.category === 'tech' ? 'Công nghệ ⚡' :
                      p.category === 'fashion' ? 'Thời trang 👕' :
                      p.category === 'lifestyle' ? 'Đời sống 🏠' :
                      p.category === 'food' ? 'Ẩm thực 🍔' :
                      p.category === 'beauty' ? 'Làm đẹp 💄' : 'Sản phẩm';

                    return (
                      <div
                        key={p.id}
                        className="p-3.5 rounded-2xl bg-neutral-900 border border-neutral-800 hover:border-neutral-700/80 transition-all flex flex-col justify-between space-y-3"
                      >
                        <div className="space-y-2.5">
                          {/* Image + Badges */}
                          <div className="relative w-full h-44 rounded-xl overflow-hidden bg-neutral-950 border border-neutral-800">
                            <img
                              src={p.image_url}
                              alt={p.title}
                              className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                              onError={(e) => {
                                (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600';
                              }}
                            />
                            {/* Category Badge */}
                            <div className="absolute top-2 left-2 flex flex-col space-y-1">
                              <span className="bg-black/70 backdrop-blur-md px-2 py-0.5 rounded-full text-[10px] font-semibold text-white border border-white/10">
                                {catLabel}
                              </span>
                              {p.is_dropship && (
                                <span className="bg-purple-900/80 border border-purple-500/50 backdrop-blur-md px-2 py-0.5 rounded-full text-[9px] font-bold text-purple-200">
                                  📦 Dropship / Affiliate
                                </span>
                              )}
                            </div>
                            {/* Stock Badge */}
                            <div className="absolute top-2 right-2">
                              {p.stock > 0 ? (
                                <span className="bg-emerald-500/80 backdrop-blur-md text-white text-[10px] font-bold px-2 py-0.5 rounded-full shadow">
                                  Kho: {p.stock}
                                </span>
                              ) : (
                                <span className="bg-rose-500/80 backdrop-blur-md text-white text-[10px] font-bold px-2 py-0.5 rounded-full shadow">
                                  Hết hàng
                                </span>
                              )}
                            </div>
                            {/* ID */}
                            <div className="absolute bottom-2 right-2 bg-black/70 px-1.5 py-0.5 rounded text-[9px] font-mono text-neutral-300">
                              #{p.id}
                            </div>
                          </div>

                          {/* Info */}
                          <div>
                            <p className="text-[10px] text-neutral-400 font-medium">@{p.seller_name}</p>
                            <h3 className="text-xs font-bold text-white line-clamp-2 mt-0.5" title={p.title}>
                              {p.title}
                            </h3>
                            {p.description && (
                              <p className="text-[11px] text-neutral-400 line-clamp-2 mt-1 leading-relaxed">
                                {p.description}
                              </p>
                            )}
                          </div>

                          {/* Price & Rating */}
                          <div className="flex items-baseline justify-between pt-1">
                            <div>
                              <div className="flex items-center space-x-1.5">
                                <span className="text-sm font-black text-rose-400 font-mono">
                                  {Number(p.price).toLocaleString('vi-VN')}₫
                                </span>
                                {discountPercent && (
                                  <span className="text-[10px] font-bold text-amber-400 bg-amber-500/10 px-1.5 py-0.5 rounded border border-amber-500/20">
                                    -{discountPercent}%
                                  </span>
                                )}
                              </div>
                              {p.original_price && Number(p.original_price) > Number(p.price) && (
                                <span className="text-[10px] text-neutral-500 line-through font-mono">
                                  {Number(p.original_price).toLocaleString('vi-VN')}₫
                                </span>
                              )}
                            </div>

                            <div className="text-right text-[10px] text-neutral-400">
                              <span className="text-amber-400 font-bold">★ {p.rating || 4.9}</span>
                              <span className="mx-1">•</span>
                              <span>Đã bán {p.sold_count || 0}</span>
                            </div>
                          </div>

                          {/* Dropship & Profit Box */}
                          <div className="p-2.5 rounded-xl bg-neutral-950/80 border border-neutral-800 space-y-1.5 text-[11px]">
                            <div className="flex items-center justify-between">
                              <span className="text-neutral-400">Giá vốn Dropship:</span>
                              <span className="font-mono text-neutral-300">
                                {p.cost_price ? `${Number(p.cost_price).toLocaleString('vi-VN')}₫` : 'Chưa nhập'}
                              </span>
                            </div>
                            {p.cost_price && (
                              <div className="flex items-center justify-between">
                                <span className="text-emerald-400 font-semibold">Lợi nhuận ròng đút túi:</span>
                                <span className="font-mono font-bold text-emerald-400">
                                  +{Math.max(0, Number(p.price) - Number(p.cost_price)).toLocaleString('vi-VN')}₫ / sp
                                </span>
                              </div>
                            )}
                            {p.commission_rate !== undefined && (
                              <div className="flex items-center justify-between text-[10px]">
                                <span className="text-neutral-400">Hoa hồng Affiliate:</span>
                                <span className="text-purple-300 font-bold">{p.commission_rate}%</span>
                              </div>
                            )}
                            {p.affiliate_url && (
                              <a
                                href={p.affiliate_url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="mt-1 flex items-center justify-center space-x-1 py-1 px-2 rounded-lg bg-pink-500/10 hover:bg-pink-500/20 text-pink-300 border border-pink-500/30 text-[10px] font-semibold transition-colors"
                              >
                                <ExternalLink className="w-3 h-3 text-pink-400" />
                                <span>Nguồn hàng sỉ / TikTok / Shopee</span>
                              </a>
                            )}
                          </div>
                        </div>

                        {/* Actions: Edit & Delete */}
                        <div className="pt-2 border-t border-neutral-800 flex items-center justify-end space-x-2">
                          <button
                            onClick={() => handleOpenEditProduct(p)}
                            className="px-3 py-1.5 rounded-xl bg-sky-600/20 hover:bg-sky-600/30 text-sky-400 border border-sky-500/30 text-xs font-semibold flex items-center space-x-1 transition-all active:scale-95 cursor-pointer"
                            title="Sửa thông tin sản phẩm"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                            <span>Sửa</span>
                          </button>
                          <button
                            onClick={() => setDeletingProduct(p)}
                            className="px-3 py-1.5 rounded-xl bg-rose-600/20 hover:bg-rose-600/30 text-rose-400 border border-rose-500/30 text-xs font-semibold flex items-center space-x-1 transition-all active:scale-95 cursor-pointer"
                            title="Xóa sản phẩm"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                            <span>Xóa</span>
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              );
            })()}
          </div>
        )}

        {activeTab === 'orders' && (
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-2 border-b border-neutral-800 gap-2">
              <div>
                <h2 className="text-sm font-bold text-neutral-200">
                  Toàn bộ đơn hàng VietQR ({orders.length})
                </h2>
                <p className="text-xs text-neutral-400">
                  Theo dõi tiến độ thanh toán, cập nhật trạng thái vận đơn và xuất danh sách cho bên giao hàng
                </p>
              </div>

              <button
                onClick={handleExportOrdersCSV}
                className="px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold flex items-center space-x-1.5 shadow-md transition-all active:scale-95 cursor-pointer self-start sm:self-auto"
                title="Tải file CSV mở bằng Excel chuẩn tiếng Việt"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Xuất Excel / CSV giao hàng</span>
              </button>
            </div>

            <div className="space-y-2.5">
              {orders.length === 0 ? (
                <div className="text-center py-12 bg-neutral-900 rounded-2xl border border-neutral-800 text-neutral-500 text-xs">
                  Chưa có đơn hàng nào
                </div>
              ) : (
                orders.map((ord) => (
                  <div
                    key={ord.id}
                    className="bg-neutral-900 rounded-xl p-3.5 border border-neutral-800 flex flex-col md:flex-row md:items-center justify-between gap-3 text-xs"
                  >
                    <div className="space-y-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="font-mono font-bold text-orange-400">{ord.order_code}</span>
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                          ord.is_paid ? 'bg-emerald-500/20 text-emerald-400' : 'bg-amber-500/20 text-amber-300'
                        }`}>
                          {ord.is_paid ? '✓ Đã nhận tiền' : '⏳ Chờ chuyển khoản'}
                        </span>
                        {ord.voucher_code && Number(ord.discount_amount) > 0 && (
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/30">
                            Mã: {ord.voucher_code} (-{Number(ord.discount_amount).toLocaleString('vi-VN')}₫)
                          </span>
                        )}
                        <span className="text-[11px] text-neutral-500">
                          {new Date(ord.created_at).toLocaleString('vi-VN')}
                        </span>
                      </div>
                      <p className="text-neutral-300">
                        Khách: <strong className="text-white">{ord.customer_name}</strong> ({ord.customer_phone}) — {ord.shipping_address}
                      </p>
                      {ord.note && (
                        <p className="text-neutral-400 italic text-[11px]">
                          Ghi chú: {ord.note}
                        </p>
                      )}

                      {/* Dropship Order Items List */}
                      {ord.items && ord.items.length > 0 && (
                        <div className="pt-1.5 flex flex-wrap gap-1.5 items-center text-[11px]">
                          <span className="text-neutral-400 font-semibold">Sản phẩm:</span>
                          {ord.items.map((it, idx) => (
                            <span key={idx} className="bg-neutral-800/90 border border-neutral-700/60 px-2 py-0.5 rounded text-neutral-200">
                              {it.quantity}x {it.product_title} ({Number(it.price).toLocaleString('vi-VN')}₫)
                            </span>
                          ))}
                        </div>
                      )}
                    </div>

                    <div className="flex flex-wrap items-center gap-2.5 self-end md:self-auto">
                      {/* 1-Click Dropship Copy Button */}
                      <button
                        onClick={() => handleCopyDropshipOrder(ord)}
                        className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center space-x-1.5 transition-all shadow cursor-pointer ${
                          copiedOrderId === ord.id
                            ? 'bg-emerald-600 text-white'
                            : 'bg-purple-600/30 hover:bg-purple-600/50 text-purple-200 border border-purple-500/40'
                        }`}
                        title="Copy tên, SĐT, địa chỉ và món hàng để dán vào TikTok/Shopee/giao hàng ship thẳng cho khách"
                      >
                        {copiedOrderId === ord.id ? (
                          <>
                            <Check className="w-3.5 h-3.5 text-white" />
                            <span>Đã copy giao hàng!</span>
                          </>
                        ) : (
                          <>
                            <Copy className="w-3.5 h-3.5" />
                            <span>📋 1-Click Copy gửi hàng Dropship</span>
                          </>
                        )}
                      </button>

                      {/* Source supplier link if available */}
                      {(() => {
                        const matchedProd = ord.items?.[0] ? products.find(p => p.title === ord.items[0].product_title || p.id === ord.items[0].product_id) : null;
                        if (matchedProd?.affiliate_url) {
                          return (
                            <a
                              href={matchedProd.affiliate_url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="px-2.5 py-1.5 rounded-lg bg-pink-600/20 hover:bg-pink-600/30 text-pink-300 border border-pink-500/30 text-xs font-semibold flex items-center space-x-1"
                              title="Mở nguồn sỉ Shopee / TikTok Shop để đặt hàng giao cho khách"
                            >
                              <ExternalLink className="w-3.5 h-3.5" />
                              <span>Nguồn sỉ đặt hàng</span>
                            </a>
                          );
                        }
                        return null;
                      })()}

                      {/* Status selector */}
                      <div className="flex items-center space-x-1.5">
                        <span className="text-[11px] text-neutral-400">Tiến độ:</span>
                        <select
                          value={ord.status}
                          onChange={(e) => handleUpdateOrderStatus(ord.id, e.target.value)}
                          className="bg-neutral-950 border border-neutral-700 text-neutral-200 text-xs rounded-lg px-2.5 py-1 focus:outline-none focus:border-rose-500 cursor-pointer"
                        >
                          <option value="pending">⏳ Chờ chuyển khoản</option>
                          <option value="confirmed">💰 Đã thanh toán</option>
                          <option value="preparing">📦 Đang đóng gói</option>
                          <option value="shipping">🚚 Đang giao hàng</option>
                          <option value="completed">✅ Hoàn thành</option>
                          <option value="cancelled">❌ Đã hủy</option>
                        </select>
                      </div>

                      <div className="text-right">
                        <div className="font-extrabold text-white text-sm">
                          {Number(ord.total_amount).toLocaleString('vi-VN')}₫
                        </div>
                        {Number(ord.discount_amount) > 0 && ord.original_amount && (
                          <div className="text-[10px] text-neutral-500 line-through">
                            {Number(ord.original_amount).toLocaleString('vi-VN')}₫
                          </div>
                        )}
                      </div>

                      <a
                        href={ord.vietqr_url}
                        target="_blank"
                        rel="noreferrer"
                        className="px-2.5 py-1.5 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-neutral-300 text-xs font-medium border border-neutral-700 transition-colors"
                      >
                        Xem VietQR
                      </a>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {activeTab === 'telegram' && (
          <div className="space-y-4">
            <h2 className="text-sm font-bold text-neutral-200">
              Cài đặt & Thử nghiệm Thông báo Telegram Bot
            </h2>
            {renderTelegramSection()}
          </div>
        )}
      </div>

      {/* ================= MODAL: THÊM / SỬA VIDEO ================= */}
      {isVideoModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 md:p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-neutral-900 border border-neutral-800 rounded-3xl w-full max-w-xl max-h-[92vh] overflow-y-auto p-5 md:p-6 shadow-2xl space-y-5">
            {/* Modal Header */}
            <div className="flex items-center justify-between pb-3 border-b border-neutral-800">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 rounded-xl bg-rose-500/20 text-rose-400 flex items-center justify-center">
                  {editingVideo ? <Edit2 className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
                </div>
                <div>
                  <h3 className="text-base font-bold text-white">
                    {editingVideo ? `Chỉnh Sửa Video #${editingVideo.id}` : 'Thêm Video Mới Vào Feed'}
                  </h3>
                  <p className="text-[11px] text-neutral-400">
                    {editingVideo ? 'Cập nhật nội dung, liên kết sản phẩm hoặc thay đổi trạng thái' : 'Đăng tải video ngắn mới kèm sản phẩm bán hàng trực tiếp'}
                  </p>
                </div>
              </div>

              <button
                onClick={() => setIsVideoModalOpen(false)}
                className="p-1.5 rounded-full hover:bg-neutral-800 text-neutral-400 hover:text-white transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleSaveVideo} className="space-y-4 text-xs">
              {/* Tiêu đề */}
              <div>
                <label className="block text-neutral-300 font-semibold mb-1">
                  Tiêu đề video <span className="text-rose-400">*</span>
                </label>
                <input
                  type="text"
                  placeholder="Ví dụ: Đập hộp bình giữ nhiệt thông minh hiển thị nhiệt độ..."
                  value={formTitle}
                  onChange={(e) => setFormTitle(e.target.value)}
                  className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-3.5 py-2.5 text-white placeholder-neutral-500 focus:outline-none focus:border-rose-500 transition-colors"
                  required
                />
              </div>

              {/* Mô tả */}
              <div>
                <label className="block text-neutral-300 font-semibold mb-1">
                  Mô tả / Hashtag
                </label>
                <textarea
                  rows={2}
                  placeholder="Mô tả trải nghiệm, công năng sản phẩm hoặc hashtag (#loopshop #deal)..."
                  value={formDescription}
                  onChange={(e) => setFormDescription(e.target.value)}
                  className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-3.5 py-2 text-white placeholder-neutral-500 focus:outline-none focus:border-rose-500 transition-colors resize-none"
                />
              </div>

              {/* Thể loại & Người đăng */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-neutral-300 font-semibold mb-1">
                    Thể loại video
                  </label>
                  <select
                    value={formCategory}
                    onChange={(e) => setFormCategory(e.target.value)}
                    className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-3.5 py-2.5 text-white focus:outline-none focus:border-rose-500 transition-colors cursor-pointer"
                  >
                    <option value="tech">⚡ Công nghệ</option>
                    <option value="fashion">👕 Thời trang</option>
                    <option value="lifestyle">🏠 Đời sống</option>
                    <option value="food">🍔 Ẩm thực</option>
                    <option value="beauty">💄 Làm đẹp</option>
                  </select>
                </div>

                <div>
                  <label className="block text-neutral-300 font-semibold mb-1">
                    Kênh / Người đăng
                  </label>
                  <input
                    type="text"
                    placeholder="phat_official"
                    value={formUploaderName}
                    onChange={(e) => setFormUploaderName(e.target.value)}
                    className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-3.5 py-2.5 text-white placeholder-neutral-500 focus:outline-none focus:border-rose-500 transition-colors"
                  />
                </div>
              </div>

              {/* Nguồn Video: Upload file hoặc Dán Link */}
              <div className="p-3.5 bg-neutral-950/80 rounded-2xl border border-neutral-800 space-y-3">
                <div className="flex items-center justify-between">
                  <label className="text-neutral-300 font-semibold flex items-center space-x-1.5">
                    <Film className="w-3.5 h-3.5 text-rose-400" />
                    <span>Nguồn tệp Video (MP4)</span>
                    <span className="text-rose-400">*</span>
                  </label>

                  {/* Hidden file input */}
                  <input
                    type="file"
                    ref={videoFileInputRef}
                    onChange={handleUploadVideoFile}
                    accept="video/*"
                    className="hidden"
                  />

                  <button
                    type="button"
                    onClick={() => videoFileInputRef.current?.click()}
                    disabled={isUploadingVideoFile}
                    className="px-3.5 py-1.5 rounded-xl bg-sky-600/20 hover:bg-sky-600/30 text-sky-400 text-xs font-semibold flex items-center space-x-1.5 border border-sky-500/30 transition-all cursor-pointer disabled:opacity-50 shadow-sm"
                  >
                    {isUploadingVideoFile ? (
                      <>
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        <span>Đang tải lên server...</span>
                      </>
                    ) : (
                      <>
                        <Upload className="w-3.5 h-3.5" />
                        <span>Tải file từ máy / điện thoại</span>
                      </>
                    )}
                  </button>
                </div>

                {/* Upload Status Feedback Banner in Modal */}
                {modalUploadStatus.status === 'uploading' && (
                  <div className="p-3 rounded-xl bg-sky-950/40 border border-sky-500/30 text-sky-300 text-xs flex items-center space-x-2.5 animate-pulse">
                    <Loader2 className="w-4 h-4 animate-spin flex-shrink-0 text-sky-400" />
                    <span className="leading-relaxed">{modalUploadStatus.message}</span>
                  </div>
                )}

                {modalUploadStatus.status === 'success' && (
                  <div className="p-3 rounded-xl bg-emerald-950/40 border border-emerald-500/30 text-emerald-300 text-xs space-y-1 animate-in fade-in-50 duration-200">
                    <div className="flex items-center space-x-2 font-bold text-white">
                      <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                      <span>{modalUploadStatus.filename} ({modalUploadStatus.sizeFormatted})</span>
                    </div>
                    <p className="text-[11px] text-emerald-200/90 leading-relaxed">
                      ✅ File video đã tải lên máy chủ thành công! Hãy kiểm tra Tiêu đề & Sản phẩm rồi bấm nút <b>"🚀 Đăng Video Mới Lên Feed"</b> ở cuối bảng để hoàn tất.
                    </p>
                  </div>
                )}

                {modalUploadStatus.status === 'error' && (
                  <div className="p-3 rounded-xl bg-rose-950/40 border border-rose-500/30 text-rose-300 text-xs flex items-start space-x-2 animate-in fade-in-50 duration-200">
                    <AlertTriangle className="w-4 h-4 text-rose-400 flex-shrink-0 mt-0.5" />
                    <div className="flex-1">
                      <span className="font-bold">Lỗi tải video: </span>
                      <span>{modalUploadStatus.message}</span>
                    </div>
                  </div>
                )}

                <div>
                  <input
                    type="text"
                    placeholder="Hoặc dán URL video (ví dụ: /videos/v1.mp4 hoặc https://...)"
                    value={formVideoUrl}
                    onChange={(e) => {
                      setFormVideoUrl(e.target.value);
                      setFormPreviewUrl(e.target.value);
                      setVideoPreviewError(null);
                    }}
                    className="w-full bg-neutral-900 border border-neutral-800 rounded-xl px-3.5 py-2 text-white font-mono text-[11px] placeholder-neutral-500 focus:outline-none focus:border-rose-500 transition-colors"
                    required
                  />
                </div>

                {/* Quick sample chips */}
                <div>
                  <p className="text-[10px] text-neutral-400 mb-1.5">⚡ Hoặc chọn nhanh video chất lượng cao có sẵn:</p>
                  <div className="flex flex-wrap gap-1.5">
                    {sampleVideos.map((s, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => {
                          setFormVideoUrl(s.url);
                          setFormPreviewUrl(s.url);
                          setVideoPreviewError(null);
                        }}
                        className={`px-2 py-1 rounded-lg text-[10px] font-medium transition-all ${
                          formVideoUrl === s.url
                            ? 'bg-rose-600 text-white font-bold'
                            : 'bg-neutral-900 hover:bg-neutral-800 text-neutral-400 hover:text-white border border-neutral-800'
                        }`}
                      >
                        {s.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Mini Preview */}
                {(formPreviewUrl || formVideoUrl) && (
                  <div className="flex items-center space-x-3 pt-2 border-t border-neutral-800/80">
                    <div className="w-16 h-24 rounded-lg overflow-hidden bg-black flex-shrink-0 relative border border-neutral-700">
                      <video
                        key={formPreviewUrl || formVideoUrl}
                        src={formPreviewUrl || resolveMediaUrl(formVideoUrl)}
                        className="w-full h-full object-cover"
                        autoPlay
                        loop
                        muted
                        playsInline
                        onLoadedData={() => setVideoPreviewError(null)}
                        onError={() => {
                          setVideoPreviewError('⚠️ Không thể phát! Tệp có thể là văn bản/HTML bị đổi đuôi hoặc video bị hỏng.');
                        }}
                      />
                    </div>
                    <div className="text-[11px] text-neutral-400 space-y-0.5 flex-1 min-w-0">
                      {videoPreviewError ? (
                        <p className="text-rose-400 font-semibold flex items-center space-x-1">
                          <AlertTriangle className="w-3.5 h-3.5 flex-shrink-0" />
                          <span className="leading-tight">{videoPreviewError}</span>
                        </p>
                      ) : (
                        <p className="text-emerald-400 font-semibold flex items-center space-x-1">
                          <Check className="w-3.5 h-3.5 flex-shrink-0" />
                          <span>Video sẵn sàng phát tốt</span>
                        </p>
                      )}
                      <p className="font-mono text-[10px] truncate max-w-xs text-neutral-500">
                        {formVideoUrl || formPreviewUrl}
                      </p>
                    </div>
                  </div>
                )}
              </div>

              {/* Gắn sản phẩm đính kèm */}
              <div>
                <label className="block text-neutral-300 font-semibold mb-1 flex items-center space-x-1">
                  <Tag className="w-3.5 h-3.5 text-amber-400" />
                  <span>Sản phẩm đính kèm vào video (mua sắm tức thì)</span>
                </label>
                <select
                  value={formSelectedProductId}
                  onChange={(e) => setFormSelectedProductId(e.target.value ? Number(e.target.value) : '')}
                  className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-3.5 py-2.5 text-white focus:outline-none focus:border-rose-500 transition-colors cursor-pointer"
                >
                  <option value="">-- Không gắn sản phẩm nào --</option>
                  {products.map((p) => (
                    <option key={p.id} value={p.id}>
                      #{p.id} - {p.title} ({Number(p.price).toLocaleString('vi-VN')}₫) - Kho: {p.stock}
                    </option>
                  ))}
                </select>

                {/* Selected Product Preview */}
                {formSelectedProductId && (() => {
                  const p = products.find(prod => prod.id === Number(formSelectedProductId));
                  if (!p) return null;
                  return (
                    <div className="flex items-center space-x-2.5 p-2 rounded-xl bg-neutral-950 border border-neutral-800 mt-2">
                      <img src={p.image_url} alt="" className="w-10 h-10 rounded-lg object-cover flex-shrink-0" />
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-semibold text-white truncate">{p.title}</p>
                        <p className="text-[11px] font-bold text-amber-400">{Number(p.price).toLocaleString('vi-VN')}₫</p>
                      </div>
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 font-bold">
                        Sẵn sàng mua
                      </span>
                    </div>
                  );
                })()}
              </div>

              {/* Lượt thích & Chia sẻ ảo */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-neutral-300 font-semibold mb-1">
                    ❤️ Số lượt thích (Likes)
                  </label>
                  <input
                    type="number"
                    min={0}
                    value={formLikesCount}
                    onChange={(e) => setFormLikesCount(Number(e.target.value))}
                    className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-3.5 py-2 text-white focus:outline-none focus:border-rose-500 transition-colors font-mono"
                  />
                </div>

                <div>
                  <label className="block text-neutral-300 font-semibold mb-1">
                    ↗️ Số lượt chia sẻ (Shares)
                  </label>
                  <input
                    type="number"
                    min={0}
                    value={formSharesCount}
                    onChange={(e) => setFormSharesCount(Number(e.target.value))}
                    className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-3.5 py-2 text-white focus:outline-none focus:border-rose-500 transition-colors font-mono"
                  />
                </div>
              </div>

              {/* Trạng thái hiển thị */}
              <div className="flex items-center space-x-2 pt-1">
                <input
                  type="checkbox"
                  id="formIsHidden"
                  checked={!formIsHidden}
                  onChange={(e) => setFormIsHidden(!e.target.checked)}
                  className="w-4 h-4 rounded text-rose-600 focus:ring-rose-500 bg-neutral-950 border-neutral-800 cursor-pointer"
                />
                <label htmlFor="formIsHidden" className="text-xs text-neutral-300 cursor-pointer font-medium">
                  Hiển thị video này trên Feed cho người xem ngay sau khi lưu
                </label>
              </div>

              {/* Modal Buttons */}
              <div className="flex items-center justify-end space-x-3 pt-3 border-t border-neutral-800">
                <button
                  type="button"
                  onClick={() => setIsVideoModalOpen(false)}
                  disabled={isSubmittingVideo}
                  className="px-4 py-2 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-neutral-300 font-medium transition-colors cursor-pointer"
                >
                  Hủy bỏ
                </button>

                <button
                  type="submit"
                  disabled={isSubmittingVideo}
                  className="px-5 py-2 rounded-xl bg-gradient-to-r from-rose-600 to-pink-600 hover:from-rose-500 hover:to-pink-500 text-white font-bold flex items-center space-x-1.5 shadow-lg shadow-rose-600/30 transition-all active:scale-95 disabled:opacity-50 cursor-pointer"
                >
                  {isSubmittingVideo ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      <span>Đang lưu...</span>
                    </>
                  ) : (
                    <>
                      <Check className="w-3.5 h-3.5" />
                      <span>{editingVideo ? 'Cập nhật Video' : 'Đăng Video Mới'}</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ================= MODAL: XÁC NHẬN XÓA VIDEO ================= */}
      {deletingVideo && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-neutral-900 border border-rose-900/60 rounded-3xl w-full max-w-md p-5 md:p-6 shadow-2xl space-y-4">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-2xl bg-rose-500/20 text-rose-400 flex items-center justify-center flex-shrink-0">
                <Trash2 className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-white">Xác nhận xóa video</h3>
                <p className="text-xs text-neutral-400">Hành động này không thể hoàn tác</p>
              </div>
            </div>

            <div className="p-3 bg-neutral-950 rounded-2xl border border-neutral-800 flex space-x-3 items-center">
              <div className="w-14 h-20 rounded-xl overflow-hidden bg-black flex-shrink-0">
                <video src={resolveMediaUrl(deletingVideo.video_url)} className="w-full h-full object-cover" muted />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-[10px] text-neutral-400">#{deletingVideo.id} • @{deletingVideo.uploader_name}</p>
                <p className="text-xs font-bold text-white line-clamp-2 mt-0.5">{deletingVideo.title}</p>
              </div>
            </div>

            <p className="text-xs text-neutral-300 leading-relaxed">
              Bạn có chắc chắn muốn xóa video này? Khi xóa, toàn bộ bình luận, lượt tim và liên kết sản phẩm của video sẽ bị gỡ bỏ vĩnh viễn khỏi hệ thống.
            </p>

            <div className="flex items-center justify-end space-x-3 pt-2">
              <button
                type="button"
                onClick={() => setDeletingVideo(null)}
                disabled={isSubmittingVideo}
                className="px-4 py-2 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-neutral-300 text-xs font-medium transition-colors cursor-pointer"
              >
                Hủy bỏ
              </button>

              <button
                type="button"
                onClick={handleConfirmDeleteVideo}
                disabled={isSubmittingVideo}
                className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold flex items-center space-x-1.5 shadow-lg shadow-rose-600/30 transition-all active:scale-95 disabled:opacity-50 cursor-pointer"
              >
                {isSubmittingVideo ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    <span>Đang xóa...</span>
                  </>
                ) : (
                  <>
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Xác nhận xóa vĩnh viễn</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: Thêm / Chỉnh sửa Sản phẩm */}
      {isProductModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto animate-in fade-in duration-200">
          <div className="bg-neutral-900 border border-neutral-800 rounded-3xl p-5 md:p-6 w-full max-w-xl max-h-[90vh] overflow-y-auto space-y-4 shadow-2xl relative my-auto">
            {/* Modal Header */}
            <div className="flex items-center justify-between pb-3 border-b border-neutral-800">
              <div className="flex items-center space-x-2.5">
                <div className="w-9 h-9 rounded-2xl bg-rose-500/20 text-rose-400 flex items-center justify-center">
                  <ShoppingBag className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white">
                    {editingProduct ? 'Chỉnh sửa Sản phẩm' : 'Thêm Sản phẩm mới vào Kho'}
                  </h3>
                  <p className="text-[11px] text-neutral-400">
                    Sản phẩm sẽ hiển thị để người dùng mua sắm và có thể gắn vào video feed
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setIsProductModalOpen(false)}
                className="p-1.5 rounded-xl text-neutral-400 hover:text-white hover:bg-neutral-800 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveProduct} className="space-y-3.5 text-xs">
              {/* Tên sản phẩm */}
              <div>
                <label className="block text-neutral-300 font-semibold mb-1">
                  Tên sản phẩm <span className="text-rose-400">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ví dụ: Tai nghe Bluetooth ANC chống ồn..."
                  value={prodTitle}
                  onChange={(e) => setProdTitle(e.target.value)}
                  className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-3.5 py-2.5 text-white placeholder-neutral-500 focus:outline-none focus:border-rose-500 transition-colors"
                />
              </div>

              {/* Danh mục & Người bán */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <label className="block text-neutral-300 font-semibold mb-1">
                    Danh mục sản phẩm <span className="text-rose-400">*</span>
                  </label>
                  <select
                    value={prodCategory}
                    onChange={(e) => setProdCategory(e.target.value)}
                    className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-3.5 py-2.5 text-white focus:outline-none focus:border-rose-500 transition-colors cursor-pointer"
                  >
                    <option value="tech">⚡ Công nghệ</option>
                    <option value="fashion">👕 Thời trang</option>
                    <option value="lifestyle">🏠 Đời sống</option>
                    <option value="food">🍔 Ẩm thực</option>
                    <option value="beauty">💄 Làm đẹp</option>
                  </select>
                </div>

                <div>
                  <label className="block text-neutral-300 font-semibold mb-1">
                    Cửa hàng / Người bán
                  </label>
                  <input
                    type="text"
                    placeholder="Phát Official Store"
                    value={prodSellerName}
                    onChange={(e) => setProdSellerName(e.target.value)}
                    className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-3.5 py-2.5 text-white placeholder-neutral-500 focus:outline-none focus:border-rose-500 transition-colors"
                  />
                </div>
              </div>

              {/* Giá bán, Giá gốc & Tồn kho */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-neutral-300 font-semibold mb-1">
                    Giá bán (VND) <span className="text-rose-400">*</span>
                  </label>
                  <input
                    type="number"
                    required
                    min={1000}
                    step={1000}
                    value={prodPrice}
                    onChange={(e) => setProdPrice(Number(e.target.value))}
                    className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-3.5 py-2 text-white font-mono focus:outline-none focus:border-rose-500"
                  />
                </div>

                <div>
                  <label className="block text-neutral-300 font-semibold mb-1">
                    Giá gốc (gạch ngang)
                  </label>
                  <input
                    type="number"
                    min={0}
                    step={1000}
                    placeholder="Không bắt buộc"
                    value={prodOriginalPrice}
                    onChange={(e) => setProdOriginalPrice(e.target.value ? Number(e.target.value) : '')}
                    className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-3.5 py-2 text-white font-mono focus:outline-none focus:border-rose-500"
                  />
                </div>

                <div>
                  <label className="block text-neutral-300 font-semibold mb-1">
                    Số lượng trong kho
                  </label>
                  <input
                    type="number"
                    min={0}
                    value={prodStock}
                    onChange={(e) => setProdStock(Number(e.target.value))}
                    className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-3.5 py-2 text-white font-mono focus:outline-none focus:border-rose-500"
                  />
                </div>
              </div>

              {/* Cấu hình TikTok Shop Dropship & Affiliate */}
              <div className="p-3 bg-purple-950/20 rounded-2xl border border-purple-500/30 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <PackageCheck className="w-4 h-4 text-purple-400" />
                    <span className="font-bold text-white text-xs">Cấu hình Dropship & Affiliate</span>
                  </div>
                  <label className="flex items-center space-x-1.5 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={prodIsDropship}
                      onChange={(e) => setProdIsDropship(e.target.checked)}
                      className="rounded accent-purple-500 w-3.5 h-3.5"
                    />
                    <span className="text-[11px] text-purple-300 font-medium">Bán Dropship (không ôm hàng)</span>
                  </label>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-neutral-300 font-semibold mb-1">
                      Giá vốn nhập sỉ / Dropship (VND)
                    </label>
                    <input
                      type="number"
                      min={0}
                      step={1000}
                      placeholder="Ví dụ: 120000"
                      value={prodCostPrice}
                      onChange={(e) => setProdCostPrice(e.target.value ? Number(e.target.value) : '')}
                      className="w-full bg-neutral-900 border border-neutral-700 rounded-xl px-3 py-2 text-white font-mono focus:outline-none focus:border-purple-500"
                    />
                  </div>

                  <div>
                    <label className="block text-neutral-300 font-semibold mb-1">
                      % Hoa hồng Affiliate (%)
                    </label>
                    <input
                      type="number"
                      min={0}
                      max={100}
                      step={0.5}
                      value={prodCommissionRate}
                      onChange={(e) => setProdCommissionRate(Number(e.target.value))}
                      className="w-full bg-neutral-900 border border-neutral-700 rounded-xl px-3 py-2 text-white font-mono focus:outline-none focus:border-purple-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-neutral-300 font-semibold mb-1">
                    Link nguồn hàng sỉ / Shopee / TikTok Shop (URL)
                  </label>
                  <input
                    type="url"
                    placeholder="https://shopee.vn/... hoặc https://shop.tiktok.com/..."
                    value={prodAffiliateUrl}
                    onChange={(e) => setProdAffiliateUrl(e.target.value)}
                    className="w-full bg-neutral-900 border border-neutral-700 rounded-xl px-3 py-2 text-white font-mono text-[11px] placeholder-neutral-500 focus:outline-none focus:border-purple-500"
                  />
                </div>

                {/* Live Profit Preview */}
                {prodCostPrice && Number(prodPrice) > Number(prodCostPrice) && (
                  <div className="p-2 rounded-xl bg-emerald-950/40 border border-emerald-500/30 flex items-center justify-between text-[11px]">
                    <span className="text-emerald-300 font-semibold">Ước tính lợi nhuận ròng đút túi:</span>
                    <span className="font-mono font-bold text-emerald-400">
                      +{ (Number(prodPrice) - Number(prodCostPrice)).toLocaleString('vi-VN') }₫ / đơn
                      ({ Math.round(((Number(prodPrice) - Number(prodCostPrice)) / Number(prodPrice)) * 100) }%)
                    </span>
                  </div>
                )}
              </div>

              {/* Ảnh sản phẩm + Kho ảnh mẫu chọn nhanh */}
              <div className="p-3 bg-neutral-950/80 rounded-2xl border border-neutral-800 space-y-2.5">
                <label className="block text-neutral-300 font-semibold">
                  Link hình ảnh sản phẩm (URL) <span className="text-rose-400">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="https://images.unsplash.com/..."
                  value={prodImageUrl}
                  onChange={(e) => setProdImageUrl(e.target.value)}
                  className="w-full bg-neutral-900 border border-neutral-800 rounded-xl px-3.5 py-2 text-white font-mono text-[11px] focus:outline-none focus:border-rose-500"
                />

                {/* Quick Sample Image Chips */}
                <div>
                  <p className="text-[10px] text-neutral-400 mb-1.5">⚡ Hoặc chọn nhanh ảnh mẫu chất lượng cao theo ngành:</p>
                  <div className="flex flex-wrap gap-1.5 max-h-24 overflow-y-auto">
                    {sampleProductImages.map((item, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => {
                          setProdImageUrl(item.url);
                          setProdCategory(item.category);
                          if (!prodTitle) setProdTitle(item.label);
                        }}
                        className={`px-2 py-1 rounded-lg text-[10px] font-medium transition-all ${
                          prodImageUrl === item.url
                            ? 'bg-rose-600 text-white font-bold'
                            : 'bg-neutral-900 hover:bg-neutral-800 text-neutral-400 hover:text-white border border-neutral-800'
                        }`}
                      >
                        {item.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Mini Image Preview */}
                {prodImageUrl && (
                  <div className="flex items-center space-x-3 pt-2 border-t border-neutral-800/80">
                    <img
                      src={prodImageUrl}
                      alt="Xem trước"
                      className="w-14 h-14 rounded-xl object-cover bg-neutral-900 border border-neutral-700"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600';
                      }}
                    />
                    <div className="text-[11px] text-neutral-400">
                      <p className="text-emerald-400 font-semibold flex items-center space-x-1">
                        <Check className="w-3.5 h-3.5" />
                        <span>Ảnh xem trước hợp lệ</span>
                      </p>
                      <p className="font-mono text-[10px] truncate max-w-xs text-neutral-500">
                        {prodImageUrl}
                      </p>
                    </div>
                  </div>
                )}
              </div>

              {/* Mô tả chi tiết */}
              <div>
                <label className="block text-neutral-300 font-semibold mb-1">
                  Mô tả sản phẩm (Tính năng, chất liệu, hướng dẫn sử dụng)
                </label>
                <textarea
                  rows={2}
                  placeholder="Nhập mô tả chi tiết sản phẩm để thu hút khách hàng..."
                  value={prodDescription}
                  onChange={(e) => setProdDescription(e.target.value)}
                  className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-3.5 py-2 text-white placeholder-neutral-500 focus:outline-none focus:border-rose-500 transition-colors resize-none"
                />
              </div>

              {/* Modal Buttons */}
              <div className="flex items-center justify-end space-x-3 pt-3 border-t border-neutral-800">
                <button
                  type="button"
                  onClick={() => setIsProductModalOpen(false)}
                  disabled={isSubmittingProduct}
                  className="px-4 py-2 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-neutral-300 font-medium transition-colors cursor-pointer"
                >
                  Hủy bỏ
                </button>

                <button
                  type="submit"
                  disabled={isSubmittingProduct}
                  className="px-5 py-2 rounded-xl bg-gradient-to-r from-rose-600 to-pink-600 hover:from-rose-500 hover:to-pink-500 text-white font-bold flex items-center space-x-1.5 shadow-lg shadow-rose-600/30 transition-all active:scale-95 disabled:opacity-50 cursor-pointer"
                >
                  {isSubmittingProduct ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      <span>Đang lưu...</span>
                    </>
                  ) : (
                    <>
                      <Plus className="w-3.5 h-3.5" />
                      <span>{editingProduct ? 'Cập nhật sản phẩm' : 'Tạo sản phẩm mới'}</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: Xác nhận xóa sản phẩm */}
      {deletingProduct && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-neutral-900 border border-neutral-800 rounded-3xl p-5 md:p-6 w-full max-w-md space-y-4 shadow-2xl">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-2xl bg-rose-500/20 text-rose-400 flex items-center justify-center flex-shrink-0">
                <Trash2 className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-white">Xác nhận xóa sản phẩm</h3>
                <p className="text-xs text-neutral-400">Hành động này không thể hoàn tác</p>
              </div>
            </div>

            <div className="p-3 bg-neutral-950 rounded-2xl border border-neutral-800 flex space-x-3 items-center">
              <img
                src={deletingProduct.image_url}
                alt=""
                className="w-14 h-14 rounded-xl object-cover bg-neutral-900 flex-shrink-0"
              />
              <div className="min-w-0 flex-1">
                <p className="text-[10px] text-neutral-400">#{deletingProduct.id} • @{deletingProduct.seller_name}</p>
                <p className="text-xs font-bold text-white line-clamp-1 mt-0.5">{deletingProduct.title}</p>
                <p className="text-xs font-bold text-rose-400 font-mono mt-0.5">
                  {Number(deletingProduct.price).toLocaleString('vi-VN')}₫
                </p>
              </div>
            </div>

            <p className="text-xs text-neutral-300 leading-relaxed">
              Bạn có chắc chắn muốn xóa sản phẩm này khỏi kho hàng?
            </p>

            <div className="flex items-center justify-end space-x-3 pt-2 border-t border-neutral-800">
              <button
                type="button"
                onClick={() => setDeletingProduct(null)}
                disabled={isSubmittingProduct}
                className="px-4 py-2 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-neutral-300 text-xs font-medium transition-colors cursor-pointer"
              >
                Hủy bỏ
              </button>

              <button
                type="button"
                onClick={handleDeleteProduct}
                disabled={isSubmittingProduct}
                className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold flex items-center space-x-1.5 shadow-lg shadow-rose-600/30 transition-all active:scale-95 disabled:opacity-50 cursor-pointer"
              >
                {isSubmittingProduct ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    <span>Đang xóa...</span>
                  </>
                ) : (
                  <>
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Xác nhận xóa</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
