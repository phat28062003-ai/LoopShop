import React, { useState, useEffect } from 'react';
import { ShieldAlert, TrendingUp, DollarSign, Package, Eye, EyeOff, CheckCircle2, RefreshCw } from 'lucide-react';
import type { AdminStats, VideoItem, Report, Order } from '../types';
import { api } from '../services/api';

export const AdminDashboard: React.FC = () => {
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [videos, setVideos] = useState<VideoItem[]>([]);
  const [reports, setReports] = useState<Report[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [activeTab, setActiveTab] = useState<'overview' | 'moderation' | 'videos' | 'orders'>('overview');
  const [isLoading, setIsLoading] = useState(false);

  const loadAdminData = async () => {
    try {
      setIsLoading(true);
      const [statsData, videosData, reportsData, ordersData] = await Promise.all([
        api.getAdminStats(),
        api.getVideos(true), // get all videos including hidden
        api.getReports(),
        api.getOrders(),
      ]);
      setStats(statsData);
      setVideos(videosData);
      setReports(reportsData);
      setOrders(ordersData);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
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

  const pendingReports = reports.filter(r => r.status === 'pending');

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

        <button
          onClick={loadAdminData}
          disabled={isLoading}
          className="p-2 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-neutral-300 transition-colors flex items-center space-x-1.5 text-xs self-start md:self-auto"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
          <span>Làm mới dữ liệu</span>
        </button>
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
      </div>

      {/* Main Content Area */}
      <div className="max-w-5xl mx-auto mt-6">
        {activeTab === 'overview' && (
          <div className="space-y-6">
            {/* 4 Stat Cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3.5">
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
                  <span className="text-xs font-medium">Video trên hệ thống</span>
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
      </div>
    </div>
  );
};
