import { LucideIcon } from 'lucide-react';

export interface Product {
  id: number;
  name: string;
  description: string;
  price: number;
  condition: 'New' | 'Used';
  stock_status: 'In Stock' | 'Out of Stock' | 'On Order';
  category_id: number;
  category_name?: string;
  brand: string;
  compatible_models: string;
  images: string[];
  is_featured: boolean;
  quantity: number;
  created_at: string;
}

export interface Category {
  id: number;
  name: string;
  slug: string;
  image_url: string;
}

export interface Reservation {
  id: number;
  product_id: number;
  product_name?: string;
  customer_name: string;
  phone: string;
  city: string;
  quantity: number;
  message: string;
  status: 'pending' | 'confirmed' | 'cancelled';
  created_at: string;
}

export interface Message {
  id: number;
  name: string;
  email: string;
  phone: string;
  message: string;
  read: boolean;
  created_at: string;
}

export interface User {
  id: number;
  username: string;
  role: string;
}

export interface AuthResponse {
  token: string;
  user: User;
}

export interface Settings {
  phone: string;
  whatsapp: string;
  email: string;
  address: string;
  facebook_url: string;
  instagram_url: string;
}
