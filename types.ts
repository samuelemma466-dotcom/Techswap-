
export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  image: string;
  category: 'Phone' | 'Laptop' | 'Tablet' | 'Watch' | 'Audio' | 'Gaming' | 'Camera' | 'Drone' | 'Smart Home';
  condition: 'Mint' | 'Good' | 'Fair' | 'Poor';
  location: string;
  sellerId: string;
  sellerName: string;
  sellerReputation: number;
  marketBadge?: string;
  // New Fields for Professional Sellers
  stock: number;
  sku?: string;
  status: 'active' | 'draft' | 'archived';
}

export interface SwapAssessment {
  estimatedCondition: string;
  marketValue: number;
  tradeInValue: number;
  topUpAmount: number;
  reasoning: string;
  sellerProfitMargin: number;
}

export interface Message {
  id: string;
  sender: 'buyer' | 'seller';
  text: string;
  timestamp: number;
  isOffer?: boolean;
  offerAmount?: number;
}

export interface Negotiation {
  id: string;
  productId: string;
  messages: Message[];
  status: 'active' | 'accepted' | 'rejected';
}

export type UserRole = 'guest' | 'buyer' | 'seller';

// Updated ViewState to handle specific dashboard views
export type ViewState = 
  | 'landing' 
  | 'market' 
  | 'sell' 
  | 'cart' 
  | 'profile' 
  | 'dashboard-overview' 
  | 'dashboard-inventory' 
  | 'dashboard-orders';

// --- SELLER DASHBOARD TYPES ---
export interface DashboardMetrics {
    totalRevenue: number;
    activeListings: number;
    pendingOrders: number;
    sellerRating: number;
    monthlyGrowth: number; // Percentage
}

export interface Promotion {
    id: string;
    code: string;
    discountType: 'percentage' | 'fixed';
    value: number;
    usageCount: number;
    status: 'active' | 'expired';
}

export interface StoreProfile {
    storeName: string;
    description: string;
    logoUrl: string;
    bannerUrl: string;
    contactEmail: string;
    pickupAddress: string;
}

// --- LOGISTICS TYPES ---

export type OrderStatus = 'processing' | 'pickup_scheduled' | 'in_transit_to_hub' | 'at_hub_verification' | 'verified' | 'out_for_delivery' | 'delivered';

export interface TrackingStep {
  status: OrderStatus;
  label: string;
  timestamp?: string;
  location?: string;
  icon?: string;
  completed: boolean;
}

export interface Order {
  id: string;
  items: { product: Product, isSwap: boolean }[];
  totalAmount: number;
  date: string;
  status: OrderStatus;
  estimatedArrival: string;
  trackingSteps: TrackingStep[];
  verificationReport?: string;
}

// --- AI SERVICE TYPES ---
export interface AiMarketAnalysis {
    trend: 'up' | 'down' | 'stable';
    insight: string;
    specs: { label: string, value: string }[];
}

export interface AiDeliveryQuote {
    carrier: string;
    service: string;
    cost: number;
    estimatedDays: string;
    reasoning: string;
}

export interface AiSellerInsight {
    headline: string;
    content: string;
    actionableTip: string;
}

export interface ComparisonResult {
    winnerId: string;
    summary: string;
    specs: {
        label: string;
        item1Value: string;
        item2Value: string;
    }[];
}

export interface ToastNotification {
    id: string;
    type: 'success' | 'error' | 'info';
    message: string;
}
