export interface Product {
  id: number;
  seller_name: string;
  title: string;
  description: string;
  category?: string;
  price: number;
  original_price: number | null;
  cost_price?: number | null;
  commission_rate?: number;
  affiliate_url?: string;
  is_dropship?: boolean;
  image_url: string;
  stock: number;
  rating: number;
  sold_count: number;
  is_active: boolean;
  created_at?: string;
}

export interface VideoProductTag {
  id: number;
  product: Product;
  timestamp: number;
}

export interface VideoItem {
  id: number;
  uploader_name: string;
  uploader_avatar: string;
  title: string;
  description: string;
  category?: string;
  video_url: string;
  thumbnail_url: string;
  likes_count: number;
  comments_count: number;
  shares_count: number;
  is_approved: boolean;
  is_hidden: boolean;
  created_at: string;
  tags: VideoProductTag[];
  products: Product[];
}

export interface CartItem {
  product: Product;
  quantity: number;
}

export interface OrderItem {
  id?: number;
  product?: Product;
  product_id?: number;
  product_title: string;
  price: number;
  quantity: number;
}

export interface Order {
  id: number;
  order_code: string;
  customer_name: string;
  customer_phone: string;
  shipping_address: string;
  total_amount: number;
  original_amount?: number;
  discount_amount?: number;
  voucher_code?: string;
  status: 'pending' | 'confirmed' | 'preparing' | 'shipping' | 'completed' | 'cancelled';
  payment_method: string;
  payment_code: string;
  is_paid: boolean;
  bank_id: string;
  account_no: string;
  account_name: string;
  vietqr_url: string;
  note: string;
  created_at: string;
  updated_at: string;
  items: OrderItem[];
}

export interface Voucher {
  id: number;
  code: string;
  title: string;
  description: string;
  discount_type: 'fixed' | 'percent';
  discount_value: number;
  min_order_value: number;
  max_discount_value?: number;
  is_active: boolean;
  used_count: number;
}

export interface ApplyVoucherResponse {
  valid: boolean;
  code?: string;
  title?: string;
  description?: string;
  discount_type?: 'fixed' | 'percent';
  discount_value?: number;
  discount_amount: number;
  formatted_discount?: string;
  final_amount: number;
  formatted_final?: string;
  message: string;
}

export interface Report {
  id: number;
  video: number;
  video_title: string;
  video_url: string;
  reason: 'copyright' | 'scam' | 'inappropriate' | 'other';
  details: string;
  status: 'pending' | 'resolved' | 'dismissed';
  created_at: string;
}

export interface AdminStats {
  revenue: {
    total: number;
    formatted: string;
  };
  orders: {
    total: number;
    pending: number;
    confirmed: number;
  };
  videos: {
    total: number;
    hidden: number;
  };
  reports: {
    pending: number;
  };
  recent_orders: Order[];
  recent_reports: Report[];
}


export interface Comment {
  id: number;
  video: number;
  user_name: string;
  user_avatar: string;
  content: string;
  likes_count: number;
  created_at: string;
}


export interface Message {
  id: number;
  conversation?: number | null;
  is_community_room: boolean;
  sender_name: string;
  sender_avatar: string;
  recipient_name: string;
  content: string;
  attached_product?: Product | null;
  attached_product_id?: number | null;
  created_at: string;
}

export interface Conversation {
  id: number;
  participant_1: string;
  participant_2: string;
  p1_avatar: string;
  p2_avatar: string;
  last_message: string;
  updated_at: string;
  created_at: string;
  messages_count?: number;
}

export interface CustomerOrderItem {
  id: number;
  order_code: string;
  status: string;
  status_display: string;
  total_amount: number;
  is_paid: boolean;
  created_at: string;
  vietqr_url?: string;
  items: {
    title: string;
    quantity: number;
    price: number;
  }[];
}

export interface CustomerCRMItem {
  phone: string;
  name: string;
  shipping_address: string;
  total_orders: number;
  total_spent: number;
  formatted_spent: string;
  first_order_date: string;
  last_order_date: string;
  tier: 'vip' | 'regular' | 'lead';
  tier_display: string;
  orders: CustomerOrderItem[];
}

export interface CRMSummary {
  total_customers: number;
  vip_customers: number;
  total_spent: number;
  formatted_total_spent: string;
  avg_spent: number;
  formatted_avg_spent: string;
}

export interface CRMResponse {
  summary: CRMSummary;
  customers: CustomerCRMItem[];
}
