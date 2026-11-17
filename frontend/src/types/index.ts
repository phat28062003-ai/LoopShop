export interface Product {
  id: number;
  seller_name: string;
  title: string;
  description: string;
  category?: string;
  price: number;
  original_price: number | null;
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
  status: 'pending' | 'confirmed' | 'shipping' | 'completed' | 'cancelled';
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
  messages_count: number;
}
