import type { VideoItem, Product, Order, Report, AdminStats, Comment, Conversation, Message, CRMResponse, Voucher, ApplyVoucherResponse } from '../types';

const getApiBase = () => {
  const envUrl = (import.meta.env.VITE_API_BASE_URL || '').trim();
  // Chỉ sử dụng envUrl nếu là URL hợp lệ bắt đầu bằng http:// hoặc https://
  if (envUrl.startsWith('http://') || envUrl.startsWith('https://')) {
    return `${envUrl.replace(/\/$/, '')}/api`;
  }
  // Nếu đang chạy trên máy local dev
  if (typeof window !== 'undefined' && (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1')) {
    return '/api';
  }
  // Mặc định kết nối thẳng tới Render production backend
  return 'https://loopshop.onrender.com/api';
};

const API_BASE = getApiBase();

/**
 * Phân giải đường dẫn video an toàn:
 * - Link nội bộ /videos/... giữ nguyên
 * - Link /media/... tự động gắn domain Render nếu chạy ở production
 * - Link http://loopshop.onrender.com tự động nâng cấp https://
 * - Link blob: hoặc data: xem trước tức thì giữ nguyên
 */
export const resolveMediaUrl = (url?: string): string => {
  if (!url) return '';
  const trimmed = url.trim();
  if (trimmed.startsWith('blob:') || trimmed.startsWith('data:')) return trimmed;
  if (trimmed.includes('mixkit.co')) {
    return '/videos/v1.mp4';
  }
  if (trimmed.startsWith('/media/')) {
    if (typeof window !== 'undefined' && (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1')) {
      return trimmed;
    }
    return `https://loopshop.onrender.com${trimmed}`;
  }
  if (trimmed.startsWith('http://loopshop.onrender.com')) {
    return trimmed.replace('http://', 'https://');
  }
  return trimmed;
};

export const api = {
  // Video endpoints
  async getVideos(params?: { isAdmin?: boolean; category?: string; search?: string } | boolean): Promise<VideoItem[]> {
    let url = `${API_BASE}/videos/?`;
    if (typeof params === 'boolean') {
      if (params) url += 'admin=true&';
    } else if (params) {
      if (params.isAdmin) url += 'admin=true&';
      if (params.category && params.category !== 'all') url += `category=${encodeURIComponent(params.category)}&`;
      if (params.search) url += `search=${encodeURIComponent(params.search)}&`;
    }
    const res = await fetch(url.replace(/[?&]$/, ''));
    if (!res.ok) throw new Error('Không thể tải danh sách video');
    return res.json();
  },

  async likeVideo(id: number): Promise<{ likes_count: number }> {
    const res = await fetch(`${API_BASE}/videos/${id}/like/`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
    });
    if (!res.ok) throw new Error('Không thể thích video');
    return res.json();
  },

  async shareVideo(id: number): Promise<{ shares_count: number }> {
    const res = await fetch(`${API_BASE}/videos/${id}/share/`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
    });
    if (!res.ok) throw new Error('Không thể ghi nhận lượt chia sẻ');
    return res.json();
  },

  async toggleVideoHidden(id: number): Promise<{ is_hidden: boolean; message: string }> {
    const res = await fetch(`${API_BASE}/videos/${id}/toggle_hidden/?admin=true`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
    });
    if (!res.ok) throw new Error('Không thể thay đổi trạng thái ẩn video');
    return res.json();
  },

  async createVideo(data: {
    title: string;
    description: string;
    video_url: string;
    uploader_name: string;
    thumbnail_url?: string;
    category?: string;
    product_id?: number;
  }): Promise<VideoItem> {
    const res = await fetch(`${API_BASE}/videos/?admin=true`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error('Không thể tạo video');
    return res.json();
  },

  async updateVideo(id: number, data: Partial<VideoItem> & { product_id?: number }): Promise<VideoItem> {
    const res = await fetch(`${API_BASE}/videos/${id}/?admin=true`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error('Không thể cập nhật video');
    return res.json();
  },

  async deleteVideo(id: number): Promise<{ success: boolean; message: string }> {
    const res = await fetch(`${API_BASE}/videos/${id}/?admin=true`, {
      method: 'DELETE',
    });
    if (!res.ok) throw new Error('Không thể xóa video');
    return { success: true, message: 'Đã xóa video thành công' };
  },

  async attachProductToVideo(videoId: number, productId: number): Promise<VideoItem> {
    const res = await fetch(`${API_BASE}/videos/${videoId}/attach_product/`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ product_id: productId }),
    });
    if (!res.ok) throw new Error('Không thể gắn sản phẩm vào video');
    return res.json();
  },

  async uploadVideoFile(file: File): Promise<{ video_url: string; relative_url: string; full_url?: string; message: string; filename?: string; size?: number }> {
    const formData = new FormData();
    formData.append('video', file);
    const res = await fetch(`${API_BASE}/videos/upload_file/`, {
      method: 'POST',
      body: formData,
    });
    if (!res.ok) {
      let errMsg = 'Không thể tải lên file video';
      try {
        const errJson = await res.json();
        errMsg = errJson.error || errJson.message || errMsg;
      } catch {
        if (res.status === 413) {
          errMsg = 'File video vượt quá giới hạn dung lượng!';
        }
      }
      throw new Error(errMsg);
    }
    const data = await res.json();
    const finalUrl = data.full_url || resolveMediaUrl(data.video_url || data.relative_url);
    return {
      ...data,
      video_url: finalUrl,
    };
  },

  // Comment endpoints
  async getComments(videoId: number): Promise<Comment[]> {
    const res = await fetch(`${API_BASE}/comments/?video=${videoId}`);
    if (!res.ok) throw new Error('Không thể tải bình luận');
    return res.json();
  },

  async postComment(data: { video: number; content: string; user_name?: string }): Promise<Comment> {
    const res = await fetch(`${API_BASE}/comments/`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error('Không thể gửi bình luận');
    return res.json();
  },

  async likeComment(commentId: number): Promise<{ likes_count: number }> {
    const res = await fetch(`${API_BASE}/comments/${commentId}/like/`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
    });
    if (!res.ok) throw new Error('Không thể thích bình luận');
    return res.json();
  },

  // Product endpoints
  async getProducts(category?: string, search?: string): Promise<Product[]> {
    let url = `${API_BASE}/products/?`;
    if (category && category !== 'all') url += `category=${encodeURIComponent(category)}&`;
    if (search) url += `search=${encodeURIComponent(search)}&`;
    const res = await fetch(url.replace(/[?&]$/, ''));
    if (!res.ok) throw new Error('Không thể tải danh sách sản phẩm');
    return res.json();
  },

  async createProduct(data: Partial<Product>): Promise<Product> {
    const res = await fetch(`${API_BASE}/products/`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error('Không thể tạo sản phẩm mới');
    return res.json();
  },

  async updateProduct(id: number, data: Partial<Product>): Promise<Product> {
    const res = await fetch(`${API_BASE}/products/${id}/`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error('Không thể cập nhật sản phẩm');
    return res.json();
  },

  async deleteProduct(id: number): Promise<{ success: boolean; message: string }> {
    const res = await fetch(`${API_BASE}/products/${id}/`, {
      method: 'DELETE',
    });
    if (!res.ok) throw new Error('Không thể xóa sản phẩm');
    return { success: true, message: 'Đã xóa sản phẩm thành công' };
  },

  async seedMoreProducts(): Promise<{ success: boolean; count: number; products: Product[]; message: string }> {
    const res = await fetch(`${API_BASE}/products/seed_more/`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
    });
    if (!res.ok) throw new Error('Không thể nạp thêm sản phẩm mẫu');
    return res.json();
  },

  // Voucher endpoints
  async getVouchers(): Promise<Voucher[]> {
    const res = await fetch(`${API_BASE}/vouchers/?active=true`);
    if (!res.ok) throw new Error('Không thể tải danh sách voucher');
    return res.json();
  },

  async applyVoucher(code: string, orderAmount: number): Promise<ApplyVoucherResponse> {
    const res = await fetch(`${API_BASE}/vouchers/apply/`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ code, order_amount: orderAmount }),
    });
    if (!res.ok) throw new Error('Không thể áp dụng mã giảm giá');
    return res.json();
  },

  // Order endpoints
  async createOrder(data: {
    customer_name: string;
    customer_phone: string;
    shipping_address: string;
    total_amount: number;
    original_amount?: number;
    discount_amount?: number;
    voucher_code?: string;
    items: { product_id: number; product_title: string; price: number; quantity: number }[];
    note?: string;
  }): Promise<Order> {
    const res = await fetch(`${API_BASE}/orders/`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error('Không thể tạo đơn hàng');
    return res.json();
  },

  async getOrders(): Promise<Order[]> {
    const res = await fetch(`${API_BASE}/orders/`);
    if (!res.ok) throw new Error('Không thể tải danh sách đơn hàng');
    return res.json();
  },

  async trackOrdersByPhone(phone: string): Promise<Order[]> {
    const res = await fetch(`${API_BASE}/orders/track/?phone=${encodeURIComponent(phone)}`);
    if (!res.ok) throw new Error('Không thể tra cứu đơn hàng');
    return res.json();
  },

  async confirmOrderPayment(id: number): Promise<{ status: string; message: string }> {
    const res = await fetch(`${API_BASE}/orders/${id}/confirm_payment/`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
    });
    if (!res.ok) throw new Error('Không thể xác nhận đơn hàng');
    return res.json();
  },

  async updateOrderStatus(id: number, status: string): Promise<{ status: string; message: string }> {
    const res = await fetch(`${API_BASE}/orders/${id}/update_status/`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status }),
    });
    if (!res.ok) throw new Error('Không thể cập nhật trạng thái đơn hàng');
    return res.json();
  },

  // Report & Safety endpoints
  async submitReport(data: { video: number; reason: string; details?: string }): Promise<Report> {
    const res = await fetch(`${API_BASE}/reports/`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error('Không thể gửi báo cáo');
    return res.json();
  },

  async getReports(): Promise<Report[]> {
    const res = await fetch(`${API_BASE}/reports/`);
    if (!res.ok) throw new Error('Không thể tải danh sách báo cáo');
    return res.json();
  },

  async resolveReport(id: number): Promise<{ message: string }> {
    const res = await fetch(`${API_BASE}/reports/${id}/resolve_and_hide/`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
    });
    if (!res.ok) throw new Error('Không thể xử lý báo cáo');
    return res.json();
  },

  async unhideReportVideo(id: number): Promise<{ message: string }> {
    const res = await fetch(`${API_BASE}/reports/${id}/unhide_video/`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
    });
    if (!res.ok) throw new Error('Không thể bỏ ẩn video từ báo cáo');
    return res.json();
  },

  async dismissReport(id: number): Promise<{ message: string }> {
    const res = await fetch(`${API_BASE}/reports/${id}/dismiss/`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
    });
    if (!res.ok) throw new Error('Không thể bỏ qua báo cáo');
    return res.json();
  },

  // Admin stats
  async getAdminStats(): Promise<AdminStats> {
    const res = await fetch(`${API_BASE}/admin/stats/`);
    if (!res.ok) throw new Error('Không thể tải thống kê admin');
    return res.json();
  },

  // Customer CRM endpoints
  async getAdminCustomers(params?: { search?: string; tier?: string }): Promise<CRMResponse> {
    let url = `${API_BASE}/admin/customers/?`;
    if (params?.search) url += `search=${encodeURIComponent(params.search)}&`;
    if (params?.tier && params.tier !== 'all') url += `tier=${encodeURIComponent(params.tier)}&`;
    const res = await fetch(url.replace(/[?&]$/, ''));
    if (!res.ok) throw new Error('Không thể tải danh sách khách hàng');
    return res.json();
  },

  // Chat & Messaging endpoints
  async getCommunityMessages(): Promise<Message[]> {
    const res = await fetch(`${API_BASE}/messages/?community=true`);
    if (!res.ok) throw new Error('Không thể tải tin nhắn cộng đồng');
    return res.json();
  },

  async getConversations(username: string): Promise<Conversation[]> {
    const res = await fetch(`${API_BASE}/conversations/?user=${encodeURIComponent(username)}`);
    if (!res.ok) throw new Error('Không thể tải danh sách trò chuyện');
    return res.json();
  },

  async getConversationMessages(conversationId: number): Promise<Message[]> {
    const res = await fetch(`${API_BASE}/messages/?conversation=${conversationId}`);
    if (!res.ok) throw new Error('Không thể tải tin nhắn cuộc trò chuyện');
    return res.json();
  },

  async startOrGetConversation(data: {
    user1: string;
    user2: string;
    p1_avatar?: string;
    p2_avatar?: string;
  }): Promise<Conversation> {
    const res = await fetch(`${API_BASE}/conversations/start_or_get/`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error('Không thể mở cuộc trò chuyện');
    return res.json();
  },

  async sendMessage(data: {
    conversation?: number | null;
    is_community_room?: boolean;
    sender_name: string;
    sender_avatar?: string;
    recipient_name?: string;
    content: string;
    attached_product_id?: number | null;
  }): Promise<Message> {
    const res = await fetch(`${API_BASE}/messages/`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error('Không thể gửi tin nhắn');
    return res.json();
  },

  // Telegram endpoints
  async getTelegramConfig(): Promise<{ is_configured: boolean; bot_token_masked: string; chat_id: string }> {
    const res = await fetch(`${API_BASE}/telegram/config/`);
    if (!res.ok) throw new Error('Không thể tải cấu hình Telegram');
    return res.json();
  },

  async saveTelegramConfig(data: { bot_token: string; chat_id: string }): Promise<{ success: boolean; title?: string; message: string; hint?: string; is_configured?: boolean; chat_id?: string; error?: string }> {
    const res = await fetch(`${API_BASE}/telegram/config/`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    const json = await res.json().catch(() => ({}));
    if (!res.ok) {
      return {
        success: false,
        title: json.title || 'Lỗi lưu cấu hình',
        message: json.message || `Lỗi máy chủ (${res.status})`,
        hint: json.hint,
        error: json.error || json.message,
      };
    }
    return json;
  },

  async testTelegramNotification(data: { bot_token?: string; chat_id?: string; message?: string }): Promise<{
    success: boolean;
    title?: string;
    message: string;
    hint?: string;
    error?: string;
  }> {
    const res = await fetch(`${API_BASE}/telegram/test/`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    const json = await res.json().catch(() => ({}));
    if (!res.ok) {
      return {
        success: false,
        title: json.title || 'Lỗi gửi tin',
        message: json.message || `Lỗi máy chủ (${res.status})`,
        hint: json.hint,
        error: json.error || json.message,
      };
    }
    return json;
  },
};
