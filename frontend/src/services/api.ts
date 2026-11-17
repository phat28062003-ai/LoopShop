import type { VideoItem, Product, Order, Report, AdminStats, Comment, Conversation, Message } from '../types';

const BASE_URL = (import.meta.env.VITE_API_BASE_URL || '').replace(/\/$/, '');
const API_BASE = `${BASE_URL}/api`;

export const api = {
  // Video endpoints
  async getVideos(isAdmin: boolean = false): Promise<VideoItem[]> {
    const res = await fetch(`${API_BASE}/videos/${isAdmin ? '?admin=true' : ''}`);
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

  async toggleVideoHidden(id: number): Promise<{ is_hidden: boolean; message: string }> {
    const res = await fetch(`${API_BASE}/videos/${id}/toggle_hidden/`, {
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
  }): Promise<VideoItem> {
    const res = await fetch(`${API_BASE}/videos/`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error('Không thể tạo video');
    return res.json();
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

  async uploadVideoFile(file: File): Promise<{ video_url: string; relative_url: string; message: string }> {
    const formData = new FormData();
    formData.append('video', file);
    const res = await fetch(`${API_BASE}/videos/upload_file/`, {
      method: 'POST',
      body: formData,
    });
    if (!res.ok) throw new Error('Không thể tải lên video');
    return res.json();
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
  async getProducts(): Promise<Product[]> {
    const res = await fetch(`${API_BASE}/products/`);
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

  // Order endpoints
  async createOrder(data: {
    customer_name: string;
    customer_phone: string;
    shipping_address: string;
    total_amount: number;
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
};
