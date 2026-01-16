
export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  image: string;
  category: 'Phone' | 'Laptop' | 'Tablet' | 'Watch' | 'Audio' | 'Gaming';
  condition: 'Grade A' | 'Grade B' | 'Grade C' | 'Refurbished';
  location: string;
  sellerId: string;
  sellerName: string;
  sellerTrustScore: number; // 0-100
  isVerified: boolean;
  stock: number;
  sku?: string;
  status: 'active' | 'draft' | 'archived';
  views?: number;
  verificationId?: string;
  aiPricingSuggestion?: {
      price: number;
      confidence: number;
  };
}

export interface TrustScanResult {
  deviceModel: string;
  conditionGrade: 'A' | 'B' | 'C' | 'D';
  confidenceScore: number; // 0-100
  marketValue: number;
  verificationNotes: string;
  visualAnalysis: {
    screen: 'Clean' | 'Scratched' | 'Cracked';
    body: 'Mint' | 'Dented' | 'Worn';
    camera: 'Clear' | 'Obstructed';
  };
  isEligibleForListing: boolean;
}

export interface Message {
  id: string;
  sender: 'buyer' | 'seller';
  text: string;
  timestamp: number;
  isOffer?: boolean;
  offerAmount?: number;
}

export type UserRole = 'guest' | 'buyer' | 'seller';

export type ViewState = 
  | 'landing' 
  | 'market' 
  | 'trust-scan' 
  | 'cart' 
  | 'profile' 
  | 'wallet'
  | 'notifications'
  | 'dashboard-overview' 
  | 'dashboard-inventory' 
  | 'dashboard-orders';

export type OrderStatus = 'escrow_locked' | 'processing' | 'shipped' | 'delivered' | 'funds_released' | 'pickup_scheduled' | 'in_transit_to_hub' | 'at_hub_verification' | 'verified' | 'out_for_delivery';

export interface Order {
  id: string;
  items: { product: Product, price: number, isSwap?: boolean }[];
  totalAmount: number;
  date: string;
  status: OrderStatus;
  trackingSteps: TrackingStep[];
  trustVerificationId?: string;
  estimatedArrival?: string;
  verificationReport?: string;
}

export interface TrackingStep {
  status: string;
  label: string;
  timestamp?: string;
  completed: boolean;
  location?: string;
}

// --- AI SERVICE TYPES ---
export interface MarketPulseData {
    valueScore: number; // 0-100 (Is this a good deal?)
    fairPriceRange: { min: number, max: number };
    priceTrend: 'rising' | 'falling' | 'stable';
    demandLevel: 'high' | 'medium' | 'low';
    insight: string;
}

export interface DealSenseReply {
    text: string;
    accepted: boolean;
    counterOffer?: number;
    toneUsed: string;
}

export interface AiDeliveryQuote {
    carrier: string;
    service: string;
    cost: number;
    estimatedDays: string;
    trustRating: string; // "High Trust"
    reasoning?: string;
}

export interface SecurityLog {
    id: string;
    event: string;
    timestamp: string;
    status: 'success' | 'warning' | 'failed';
    ip?: string;
    device?: string;
}

export interface ToastNotification {
    id: string;
    type: 'success' | 'error' | 'info';
    message: string;
    read?: boolean;
    title?: string;
    time?: string;
}

export interface Transaction {
    id: string;
    type: 'credit' | 'debit' | 'escrow_lock' | 'escrow_release';
    amount: number;
    description: string;
    date: string;
    status: 'success' | 'pending' | 'failed';
    reference?: string;
}

export interface SwapAssessment {
    marketValue: number;
    tradeInValue: number;
    topUpAmount: number;
    breakdown: {
        screen: string;
        body: string;
        battery: string;
    };
    verificationStatus: 'verified' | 'adjusted' | 'pending';
    reasoning: string;
}

export interface AiSellerInsight {
    headline: string;
    content: string;
    actionableTip: string;
}

export interface Promotion {
    id: string;
    code: string;
    discountType: 'percentage' | 'fixed';
    value: number;
    usageCount: number;
    status: 'active' | 'expired' | 'scheduled';
}

export interface StoreProfile {
    storeName: string;
    description: string;
    logoUrl: string;
    bannerUrl: string;
    contactEmail: string;
    pickupAddress: string;
    sellerTrustGrade: 'A' | 'B' | 'C';
}

export interface AiPricingAdvice {
    recommendedPrice: number;
    priceRange: { min: number, max: number };
    confidence: number;
}
