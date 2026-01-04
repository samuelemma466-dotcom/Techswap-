
import { Product, Transaction, Notification } from './types';

export const MOCK_PRODUCTS: Product[] = [
  // ==========================================
  // PHONES (The "UK Used" & Transsion Market)
  // ==========================================
  {
    id: 'iphone-xr-128',
    name: 'iPhone XR (UK Used)',
    description: '128GB, Coral. The "National ID Card". Battery health 88%. True Tone active. Clean body, no scratches.',
    price: 245000,
    image: 'https://images.unsplash.com/photo-1574670267714-e0e64951eb64?auto=format&fit=crop&q=80&w=800',
    category: 'Phone',
    condition: 'Good',
    location: 'Computer Village, Ikeja',
    sellerId: 'u_emeka',
    sellerName: 'Emeka Gadgets',
    sellerReputation: 4.8,
    stock: 12,
    status: 'active'
  },
  {
    id: 'iphone-11-pro-max',
    name: 'iPhone 11 Pro Max',
    description: '256GB, Midnight Green. Factory Unlocked. FaceID working perfectly. Comes with charger.',
    price: 480000,
    image: 'https://images.unsplash.com/photo-1573148195900-7845dcb9b127?auto=format&fit=crop&q=80&w=800',
    category: 'Phone',
    condition: 'Good',
    location: 'Banex Plaza, Abuja',
    sellerId: 'u_abj_tech',
    sellerName: 'Capital Phones',
    sellerReputation: 4.6,
    stock: 4,
    status: 'active'
  },
  {
    id: 'iphone-13-pro-max',
    name: 'iPhone 13 Pro Max',
    description: '256GB, Sierra Blue. Chips-locked (needs GV Sim). Screen is mint. 120Hz display is smooth.',
    price: 850000,
    image: 'https://images.unsplash.com/photo-1633053689531-9f20c4c45427?auto=format&fit=crop&q=80&w=800',
    category: 'Phone',
    condition: 'Mint',
    location: 'Lekki Phase 1',
    sellerId: 'u_lekki_big_boy',
    sellerName: 'Gadget Padi',
    sellerReputation: 4.9,
    stock: 2,
    status: 'active'
  },
  {
    id: 'tecno-camon-20',
    name: 'Tecno Camon 20 Premier 5G',
    description: '512GB, Dark Welkin. Bought new 2 months ago. Box and receipt available. Amazing portrait camera.',
    price: 320000,
    image: 'https://images.unsplash.com/photo-1598327105666-5b89351aff97?auto=format&fit=crop&q=80&w=800', // Generic smartphone look
    category: 'Phone',
    condition: 'Mint',
    location: 'Yaba, Lagos',
    sellerId: 'u_student_unilag',
    sellerName: 'Campus Trader',
    sellerReputation: 4.5,
    stock: 1,
    status: 'active'
  },
  {
    id: 'infinix-note-30',
    name: 'Infinix Note 30 Pro',
    description: '256GB, Gold. Wireless charging works. Good gaming phone for PUBGM. Small crack on screen protector only.',
    price: 210000,
    image: 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?auto=format&fit=crop&q=80&w=800',
    category: 'Phone',
    condition: 'Fair',
    location: 'Alaba Int\'l',
    sellerId: 'u_alaba',
    sellerName: 'Prince Comm',
    sellerReputation: 4.2,
    stock: 5,
    status: 'active'
  },
  {
    id: 'samsung-s21-ultra',
    name: 'Samsung S21 Ultra (Korean Spec)',
    description: '256GB, Phantom Black. Snapdragon version. Single SIM. 100x Zoom is clear. Slight burn-in on nav bar.',
    price: 420000,
    image: 'https://images.unsplash.com/photo-1610945415295-d9bbf067e59c?auto=format&fit=crop&q=80&w=800',
    category: 'Phone',
    condition: 'Good',
    location: 'Garrison, Port Harcourt',
    sellerId: 'u_ph_city',
    sellerName: 'Oil City Tech',
    sellerReputation: 4.7,
    stock: 3,
    status: 'active'
  },
  {
    id: 'samsung-a54',
    name: 'Samsung Galaxy A54',
    description: '128GB, Lime. Nigeria used for 6 months. Water resistant. Great battery life.',
    price: 280000,
    image: 'https://images.unsplash.com/photo-1678911820864-e2c567c655d7?auto=format&fit=crop&q=80&w=800',
    category: 'Phone',
    condition: 'Good',
    location: 'Dugbe, Ibadan',
    sellerId: 'u_ib_mums',
    sellerName: 'Madam Sarah',
    sellerReputation: 5.0,
    stock: 2,
    status: 'active'
  },

  // ==========================================
  // LAPTOPS (The Business/Student Standard)
  // ==========================================
  {
    id: 'hp-elitebook-840-g5',
    name: 'HP EliteBook 840 G5',
    description: 'Core i5 8th Gen, 16GB RAM, 512GB SSD. Backlit keyboard. Touchscreen. Perfect for coding/work.',
    price: 350000,
    image: 'https://images.unsplash.com/photo-1544731612-de7f96afe55f?auto=format&fit=crop&q=80&w=800',
    category: 'Laptop',
    condition: 'Good',
    location: 'Computer Village, Ikeja',
    sellerId: 'u_cv_laptops',
    sellerName: 'Global Laptops',
    sellerReputation: 4.8,
    stock: 8,
    status: 'active'
  },
  {
    id: 'macbook-pro-m1',
    name: 'MacBook Pro M1 (2020)',
    description: '8GB RAM, 256GB SSD. Space Grey. Cycle count 45. Keyboard light working. No MDM, No iCloud.',
    price: 950000,
    image: 'https://images.unsplash.com/photo-1611186871348-b1ce696e52c9?auto=format&fit=crop&q=80&w=800',
    category: 'Laptop',
    condition: 'Mint',
    location: 'Wuse II, Abuja',
    sellerId: 'u_abj_mac',
    sellerName: 'iStore Abuja',
    sellerReputation: 4.9,
    stock: 3,
    status: 'active'
  },
  {
    id: 'dell-xps-13',
    name: 'Dell XPS 13 9360',
    description: 'Core i7 8th Gen. InfinityEdge display. 4k Screen. Battery lasts 4 hours. Good for designers.',
    price: 400000,
    image: 'https://images.unsplash.com/photo-1593642632823-8f78536788c6?auto=format&fit=crop&q=80&w=800',
    category: 'Laptop',
    condition: 'Good',
    location: 'Sabo, Yaba',
    sellerId: 'u_tech_hub',
    sellerName: 'Dev Sales',
    sellerReputation: 4.6,
    stock: 5,
    status: 'active'
  },

  // ==========================================
  // GAMING (FIFA & PES Centers)
  // ==========================================
  {
    id: 'ps4-slim',
    name: 'PlayStation 4 Slim (Chipped)',
    description: '500GB. Comes with 20 games installed (FIFA 24, PES, GTA V, MK11). 2 controllers (1 camo, 1 black).',
    price: 220000,
    image: 'https://images.unsplash.com/photo-1606144042614-b2417e99c4e3?auto=format&fit=crop&q=80&w=800',
    category: 'Gaming',
    condition: 'Good',
    location: 'Surulere',
    sellerId: 'u_game_center',
    sellerName: 'FIFA Lord',
    sellerReputation: 4.7,
    stock: 10,
    status: 'active'
  },
  {
    id: 'ps5-disc',
    name: 'PlayStation 5 (Standard Edition)',
    description: '825GB. UK Used. White. Comes with 1 DualSense controller. HDMI 2.1 cable included.',
    price: 680000,
    image: 'https://images.unsplash.com/photo-1606144042614-b2417e99c4e3?auto=format&fit=crop&q=80&w=800',
    category: 'Gaming',
    condition: 'Mint',
    location: 'V.I., Lagos',
    sellerId: 'u_vi_gamer',
    sellerName: 'Luxe Gaming',
    sellerReputation: 5.0,
    stock: 4,
    status: 'active'
  },

  // ==========================================
  // AUDIO & ACCESSORIES (Oraimo is King)
  // ==========================================
  {
    id: 'oraimo-freepods-4',
    name: 'Oraimo FreePods 4',
    description: 'Active Noise Cancellation. App control. Heavy bass. Used for 2 weeks. Box available.',
    price: 28000,
    image: 'https://images.unsplash.com/photo-1590658268037-6bf12165a8df?auto=format&fit=crop&q=80&w=800', // Generic earbuds
    category: 'Audio',
    condition: 'Mint',
    location: 'Ojo, Lagos',
    sellerId: 'u_student_2',
    sellerName: 'Music Lover',
    sellerReputation: 4.5,
    stock: 1,
    status: 'active'
  },
  {
    id: 'jbl-flip-5',
    name: 'JBL Flip 5',
    description: 'Camo color. Original. Very loud bass. Battery still strong. Rubber slightly peeled at the bottom.',
    price: 45000,
    image: 'https://images.unsplash.com/photo-1612207425881-1250395e1e12?auto=format&fit=crop&q=80&w=800',
    category: 'Audio',
    condition: 'Fair',
    location: 'Unilag, Lagos',
    sellerId: 'u_party_boy',
    sellerName: 'Campus Plug',
    sellerReputation: 4.4,
    stock: 2,
    status: 'active'
  },
  {
    id: 'starlink-kit',
    name: 'Starlink Standard Kit',
    description: 'Standard Actuated. High speed internet. Subscription active. Transferable account.',
    price: 450000,
    image: 'https://images.unsplash.com/photo-1697551066708-620256886c57?auto=format&fit=crop&q=80&w=800',
    category: 'Smart Home',
    condition: 'Mint',
    location: 'Remote Area, Ogun',
    sellerId: 'u_remote_worker',
    sellerName: 'Tech Nomad',
    sellerReputation: 5.0,
    stock: 1,
    status: 'active'
  },
  {
    id: 'new-age-powerbank',
    name: 'New Age 30000mAh Power Bank',
    description: 'Rugged. Charges phone 5 times. Fast charging port working. Essential for light issues.',
    price: 25000,
    image: 'https://images.unsplash.com/photo-1621259181234-e68efc7e4e02?auto=format&fit=crop&q=80&w=800', // Generic powerbank
    category: 'Smart Home',
    condition: 'Good',
    location: 'Market Sq, Enugu',
    sellerId: 'u_ng_power',
    sellerName: 'Power Solutions',
    sellerReputation: 4.8,
    stock: 50,
    status: 'active'
  }
];

export const MOCK_USER_HISTORY: {
  id: string;
  date: string;
  type: 'buy' | 'sell' | 'swap' | 'negotiation' | 'viewed';
  item: string;
  amount: number;
  status: 'Completed' | 'Active' | 'Pending' | 'Cancelled';
}[] = [
  { id: 'tx_1', date: '2023-10-15', type: 'buy', item: 'iPhone 11 (64GB)', amount: 280000, status: 'Completed' },
  { id: 'tx_2', date: '2023-11-02', type: 'sell', item: 'Infinix Hot 10', amount: 65000, status: 'Completed' },
  { id: 'tx_3', date: '2023-11-20', type: 'swap', item: 'Tecno Spark 7', amount: 40000, status: 'Completed' },
  { id: 'tx_4', date: '2023-12-05', type: 'negotiation', item: 'PS4 Controller', amount: 0, status: 'Active' },
  { id: 'tx_5', date: '2023-12-10', type: 'viewed', item: 'MacBook Air M1', amount: 0, status: 'Pending' }
];

export const MOCK_TRANSACTIONS: Transaction[] = [
    { id: 'TRX-8923', type: 'credit', amount: 50000, description: 'Wallet Top-up', date: 'Today, 10:23 AM', status: 'success', reference: 'PYM-99283' },
    { id: 'TRX-8922', type: 'debit', amount: 245000, description: 'Purchase: iPhone XR', date: 'Yesterday, 4:15 PM', status: 'success', reference: 'ORD-12345' },
    { id: 'TRX-8921', type: 'credit', amount: 40000, description: 'Swap Credit: Tecno Spark', date: '20 Nov 2023', status: 'success', reference: 'SWP-7721' },
    { id: 'TRX-8920', type: 'debit', amount: 2000, description: 'Delivery Fee', date: '20 Nov 2023', status: 'success', reference: 'DEL-882' }
];

export const MOCK_NOTIFICATIONS: Notification[] = [
    { id: '1', title: 'Order Shipped', message: 'Your iPhone 11 Pro Max is on the way to the hub.', time: '2 mins ago', read: false, type: 'order' },
    { id: '2', title: 'Price Drop Alert', message: 'The MacBook Pro M1 in your wishlist just dropped by 5%.', time: '1 hour ago', read: false, type: 'alert' },
    { id: '3', title: 'Welcome Gift', message: 'Here is a ₦2,000 coupon for your first trade.', time: '1 day ago', read: true, type: 'promo' },
    { id: '4', title: 'Swap Valuation Ready', message: 'Your Tecno device has been valued at ₦45,000.', time: '2 days ago', read: true, type: 'system' }
];
