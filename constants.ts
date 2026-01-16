
import { Product, Transaction, ToastNotification } from './types';

export const MOCK_PRODUCTS: Product[] = [
  {
    id: 'iphone-13-pro',
    name: 'iPhone 13 Pro (Sierra Blue)',
    description: '128GB. Factory Unlocked. Battery Health 92%. No scratches on screen. Includes original box.',
    price: 650000,
    image: 'https://images.unsplash.com/photo-1632661674596-df8be070a5c5?auto=format&fit=crop&q=80&w=800',
    category: 'Phone',
    condition: 'Grade A',
    location: 'Lekki Phase 1, Lagos',
    sellerId: 's1',
    sellerName: 'GadgetKing NG',
    sellerTrustScore: 98,
    isVerified: true,
    stock: 3,
    status: 'active',
    views: 1240
  },
  {
    id: 'macbook-air-m1',
    name: 'MacBook Air M1 (2020)',
    description: 'Space Grey, 8GB RAM, 256GB SSD. Cycle Count 45. Keyboard perfect. Small dent on bottom corner.',
    price: 820000,
    image: 'https://images.unsplash.com/photo-1611186871348-b1ce696e52c9?auto=format&fit=crop&q=80&w=800',
    category: 'Laptop',
    condition: 'Grade B',
    location: 'Wuse II, Abuja',
    sellerId: 's2',
    sellerName: 'Capital Tech',
    sellerTrustScore: 92,
    isVerified: true,
    stock: 1,
    status: 'active',
    views: 890
  },
  {
    id: 'ps5-console',
    name: 'Sony PlayStation 5 (Disc)',
    description: 'UK Used. Comes with 1 controller and FIFA 24 installed. Clean unit, runs quiet.',
    price: 680000,
    image: 'https://images.unsplash.com/photo-1606144042614-b2417e99c4e3?auto=format&fit=crop&q=80&w=800',
    category: 'Gaming',
    condition: 'Grade A',
    location: 'Computer Village, Ikeja',
    sellerId: 's3',
    sellerName: 'GamingHub',
    sellerTrustScore: 95,
    isVerified: true,
    stock: 5,
    status: 'active',
    views: 2100
  },
  {
    id: 'samsung-s23',
    name: 'Samsung S23 Ultra',
    description: 'Phantom Black. 512GB. Screen replaced (High quality OLED). Works perfectly.',
    price: 950000,
    image: 'https://images.unsplash.com/photo-1610945415295-d9bbf067e59c?auto=format&fit=crop&q=80&w=800',
    category: 'Phone',
    condition: 'Grade B',
    location: 'Port Harcourt',
    sellerId: 's4',
    sellerName: 'Rivers Tech',
    sellerTrustScore: 88,
    isVerified: false, // Pending verification
    stock: 1,
    status: 'active',
    views: 450
  }
];

export const MOCK_TRANSACTIONS: Transaction[] = [
    { id: 'TX-101', type: 'credit', amount: 50000, description: 'Wallet Deposit', date: 'Today, 10:23 AM', status: 'success', reference: 'REF-83292' },
    { id: 'TX-102', type: 'escrow_lock', amount: 650000, description: 'Escrow Lock: iPhone 13 Pro', date: 'Yesterday', status: 'pending', reference: 'REF-99211' },
    { id: 'TX-103', type: 'debit', amount: 2500, description: 'Verification Fee', date: '20 Nov', status: 'success', reference: 'REF-11029' }
];

export const MOCK_NOTIFICATIONS: ToastNotification[] = [
    { id: 'n1', type: 'info', title: 'System Update', message: 'TrustScan AI 2.0 is now live with better detection.', time: '2h ago', read: false },
    { id: 'n2', type: 'success', title: 'Order Delivered', message: 'Your MacBook Air M1 has been delivered.', time: '1d ago', read: true }
];
