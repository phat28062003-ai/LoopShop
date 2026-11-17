import React, { useState, useEffect } from 'react';
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
  ExternalLink
} from 'lucide-react';
import type { AdminStats, VideoItem, Report, Order, CRMResponse } from '../types';
import { api } from '../services/api';

interface AdminDashboardProps {
  onLogout?: () => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({ onLogout }) => {
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [videos, setVideos] = useState<VideoItem[]>([]);
  const [reports, setReports] = useState<Report[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [crmData, setCrmData] = useState<CRMResponse | null>(null);
  const [activeTab, setActiveTab] = useState<'overview' | 'customers' | 'moderation' | 'videos' | 'orders' | 'telegram'>('overview');
  const [isLoading, setIsLoading] = useState(false);

  // CRM state
  const [customerSearch, setCustomerSearch] = useState<string>('');
  const [customerTierFilter, setCustomerTierFilter] = useState<'all' | 'vip' | 'regular' | 'lead'>('all');
  const [expandedPhone, setExpandedPhone] = useState<string | null>(null);
  const [copiedPhone, setCopiedPhone] = useState<string | null>(null);

  // Telegram state
  const [telegramToken, setTelegramToken] = useState<string>(() => localStorage.getItem('loopshop_telegram_token') || '');
  const [telegramChatId, setTelegramChatId] = useState<string>(() => localStorage.getItem('loopshop_telegram_chatid') || '');
  const [isTelegramConfigured, setIsTelegramConfigured] = useState<boolean>(false);
  const [isSavingTelegram, setIsSavingTelegram] = useState<boolean>(false);
  const [isTestingTelegram, setIsTestingTelegram] = useState<boolean>(false);
  const [telegramStatusMessage, setTelegramStatusMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const loadAdminData = async () => {
    try {
      setIsLoading(true);
      const [statsData, videosData, reportsData, ordersData, crmResult] = await Promise.all([
        api.getAdminStats(),
        api.getVideos(true), // get all videos including hidden
        api.getReports(),
        api.getOrders(),
        api.getAdminCustomers().catch(() => null),
      ]);
      setStats(statsData);
      setVideos(videosData);
      setReports(reportsData);
      setOrders(ordersData);
      if (crmResult) {
        setCrmData(crmResult);
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

  const handleSaveTelegram = async () => {
    if (!telegramToken.trim() || !telegramChatId.trim()) {
      setTelegramStatusMessage({ type: 'error', text: 'Vui lòng điền đủ Bot Token và Chat ID!' });
      return;
    }
    try {
      setIsSavingTelegram(true);
      setTelegramStatusMessage(null);
      await api.saveTelegramConfig({
        bot_token: telegramToken.trim(),
        chat_id: telegramChatId.trim()
      });
      localStorage.setItem('loopshop_telegram_token', telegramToken.trim());
      localStorage.setItem('loopshop_telegram_chatid', telegramChatId.trim());
      setIsTelegramConfigured(true);
      setTelegramStatusMessage({ type: 'success', text: 'Đã lưu cấu hình Telegram Bot thành công!' });
    } catch {
      setTelegramStatusMessage({ type: 'error', text: 'Không thể lưu cấu hình Telegram.' });
    } finally {
      setIsSavingTelegram(false);
    }
  };

  const handleTestTelegram = async () => {
    try {
      setIsTestingTelegram(true);
      setTelegramStatusMessage(null);
      const res = await api.testTelegramNotification({
        bot_token: telegramToken.trim() || undefined,
        chat_id: telegramChatId.trim() || undefined,
      });
      if (res.success) {
        setTelegramStatusMessage({ type: 'success', text: 'Đã gửi tin nhắn test thành công! Hãy kiểm tra ứng dụng Telegram của bạn.' });
      } else {
        setTelegramStatusMessage({ type: 'error', text: `Gửi test thất bại: ${res.error || res.message}` });
      }
    } catch {
      setTelegramStatusMessage({ type: 'error', text: 'Không thể kết nối đến máy chủ gửi tin nhắn.' });
    } finally {
      setIsTestingTelegram(false);
    }
  };

  useEffect(() => {
    loadAdminData();
  }, []);

  const handleToggleHide = async (videoId: number) => {
    try {
      await api.toggleVideoHidden(videoId);
      await loadAdminData();
    } catch (err) {
      console.error(err);
      alert('Không thể cập nhật trạng thái ẩn video!');
    }
  };

  const handleResolveReport = async (reportId: number) => {
    try {
      await api.resolveReport(reportId);
      await loadAdminData();
      alert('Đã ẩn video vi phạm và hoàn tất xử lý báo cáo!');
    } catch (err) {
      console.error(err);
      alert('Thao tác thất bại!');
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
        <div className={`p-3 rounded-xl text-xs font-medium flex items-center space-x-2 ${
          telegramStatusMessage.type === 'success' 
            ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' 
            : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
        }`}>
          {telegramStatusMessage.type === 'success' ? <Check className="w-4 h-4 flex-shrink-0" /> : <ShieldAlert className="w-4 h-4 flex-shrink-0" />}
          <span>{telegramStatusMessage.text}</span>
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
            {/* 5 Stat Cards */}
            <div className="grid grid-cols-2 md:grid-cols-5 gap-3.5">
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

              <div className="p-4 rounded-2xl bg-neutral-900 border border-neutral-800 space-y-1">
                <div className="flex items-center justify-between text-neutral-400">
                  <span className="text-xs font-medium">Video hệ thống</span>
                  <Eye className="w-4 h-4 text-indigo-400" />
                </div>
                <p className="text-lg md:text-xl font-black text-white">
                  {videos.length}
                </p>
                <span className="text-[10px] text-rose-400">
                  {videos.filter(v => v.is_hidden).length} video bị ẩn
                </span>
              </div>
            </div>

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
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === 'videos' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-bold text-neutral-200">
                Toàn bộ Video trên hệ thống ({videos.length})
              </h2>
              <span className="text-xs text-neutral-400">Bật/tắt công tắc để ẩn hoặc hiện tức thì</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
              {videos.map((v) => (
                <div
                  key={v.id}
                  className={`p-3.5 rounded-2xl border transition-all ${
                    v.is_hidden
                      ? 'bg-neutral-900/50 border-rose-900/60 opacity-75'
                      : 'bg-neutral-900 border-neutral-800'
                  }`}
                >
                  <div className="flex space-x-3">
                    <div className="w-20 h-28 rounded-xl overflow-hidden bg-black flex-shrink-0 relative">
                      <video
                        src={v.video_url}
                        className="w-full h-full object-cover"
                        muted
                      />
                      {v.is_hidden && (
                        <div className="absolute inset-0 bg-black/70 flex items-center justify-center">
                          <EyeOff className="w-5 h-5 text-rose-400" />
                        </div>
                      )}
                    </div>

                    <div className="flex-1 flex flex-col justify-between min-w-0">
                      <div>
                        <div className="flex items-center justify-between">
                          <span className="text-[10px] text-neutral-400">@{v.uploader_name}</span>
                          <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
                            v.is_hidden
                              ? 'bg-rose-500/20 text-rose-400'
                              : 'bg-emerald-500/20 text-emerald-400'
                          }`}>
                            {v.is_hidden ? 'Đang ẩn' : 'Đang hiện'}
                          </span>
                        </div>

                        <h4 className="text-xs font-semibold text-white mt-1 line-clamp-2">
                          {v.title}
                        </h4>
                      </div>

                      <div className="pt-2 flex items-center justify-between">
                        <span className="text-[11px] text-neutral-400">
                          {v.likes_count} ❤️ • {v.products?.length || 0} SP gắn
                        </span>

                        <button
                          onClick={() => handleToggleHide(v.id)}
                          className={`px-3 py-1 rounded-lg text-xs font-semibold flex items-center space-x-1 transition-colors ${
                            v.is_hidden
                              ? 'bg-emerald-600 hover:bg-emerald-500 text-white'
                              : 'bg-rose-600 hover:bg-rose-500 text-white'
                          }`}
                        >
                          {v.is_hidden ? (
                            <>
                              <Eye className="w-3 h-3" />
                              <span>Bỏ ẩn</span>
                            </>
                          ) : (
                            <>
                              <EyeOff className="w-3 h-3" />
                              <span>Ẩn video</span>
                            </>
                          )}
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'orders' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-bold text-neutral-200">
                Toàn bộ đơn hàng VietQR ({orders.length})
              </h2>
            </div>

            <div className="space-y-2.5">
              {orders.map((ord) => (
                <div
                  key={ord.id}
                  className="bg-neutral-900 rounded-xl p-3 border border-neutral-800 flex flex-col md:flex-row md:items-center justify-between gap-2 text-xs"
                >
                  <div className="space-y-0.5">
                    <div className="flex items-center space-x-2">
                      <span className="font-mono font-bold text-orange-400">{ord.order_code}</span>
                      <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
                        ord.is_paid ? 'bg-emerald-500/20 text-emerald-400' : 'bg-amber-500/20 text-amber-300'
                      }`}>
                        {ord.is_paid ? 'Đã nhận tiền' : 'Chờ khách quét QR'}
                      </span>
                    </div>
                    <p className="text-neutral-300">
                      Khách: {ord.customer_name} ({ord.customer_phone}) — {ord.shipping_address}
                    </p>
                  </div>

                  <div className="flex items-center space-x-3 self-end md:self-auto">
                    <span className="font-extrabold text-white text-sm">
                      {Number(ord.total_amount).toLocaleString('vi-VN')}₫
                    </span>
                    <a
                      href={ord.vietqr_url}
                      target="_blank"
                      rel="noreferrer"
                      className="px-2.5 py-1 rounded bg-neutral-800 hover:bg-neutral-700 text-neutral-300 text-[11px] font-medium"
                    >
                      Xem VietQR
                    </a>
                  </div>
                </div>
              ))}
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
    </div>
  );
};
