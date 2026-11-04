export interface Category {
  id: number;
  name: string;
  slug: string;
  description: string;
}

export interface Product {
  id: number;
  name: string;
  slug: string;
  sku: string;
  price: string;
  category: Category;
  stock_quantity: number;
  in_stock: boolean;
  is_low_stock: boolean;
  primary_image: string | null;
  description?: string;
  images?: { id: number; image: string; alt_text: string; is_primary: boolean }[];
}

export interface Paginated<T> {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
}

export interface User {
  id: number;
  email: string;
  first_name: string;
  last_name: string;
  phone: string;
  is_staff: boolean;
}

export interface TokenPair {
  access: string;
  refresh: string;
}

export interface CartItem {
  id: number;
  product: Product;
  quantity: number;
  line_total: string;
}

export interface ServerCart {
  id: number;
  items: CartItem[];
  subtotal: string;
  item_count: number;
}

export interface OrderItem {
  id: number;
  product: number;
  product_name: string;
  unit_price: string;
  quantity: number;
  line_total: string;
}

export type OrderStatus = "pending" | "paid" | "fulfilled" | "cancelled";

export interface Order {
  id: number;
  number: string;
  status: OrderStatus;
  subtotal: string;
  total: string;
  items: OrderItem[];
  shipping_name: string;
  shipping_address1: string;
  shipping_address2: string;
  shipping_city: string;
  shipping_postal_code: string;
  shipping_country: string;
  shipping_phone: string;
  notes: string;
  paid_at: string | null;
  payment_reference: string;
  created_at: string;
}

export interface ShippingInput {
  shipping_name: string;
  shipping_address1: string;
  shipping_address2?: string;
  shipping_city: string;
  shipping_postal_code: string;
  shipping_country: string;
  shipping_phone?: string;
  notes?: string;
}

export interface InsufficientStockError {
  detail: string;
  insufficient: { product_id: number; name: string; requested: number; available: number }[];
}
