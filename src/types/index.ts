export type RoomStatus = 
  | 'VACANT_CLEAN'    // ห้องว่าง สะอาด พร้อมปล่อยแขก
  | 'VACANT_DIRTY'    // ห้องว่าง แต่ยังไม่ได้ทำความสะอาด (เพิ่งเช็คเอาท์)
  | 'CLEANING'        // แม่บ้านกำลังทำความสะอาด
  | 'OCCUPIED'        // มีแขกพักอยู่ (Checked In)
  | 'MAINTENANCE';    // ซ่อมบำรุง งดให้บริการชั่วคราว

export type BookingStatus = 
  | 'PENDING_PAYMENT' // กำลังรอชำระเงิน (Hold 15 นาที)
  | 'CONFIRMED'       // ชำระเงินแล้ว ยืนยันการจองเรียบร้อย
  | 'CHECKED_IN'      // เช็คอินเข้าพักแล้ว
  | 'CHECKED_OUT'     // เช็คเอาท์เรียบร้อย
  | 'CANCELLED';      // ยกเลิกคำสั่งจอง / สต็อกถูกปล่อยคืน

export type Language = 'th' | 'en';

export interface Room {
  id: string;
  roomNumber: string;
  name: string;
  nameEn: string;
  type: 'POOL_VILLA' | 'BEACHFRONT_SUITE' | 'GARDEN_BUNGALOW' | 'DELUXE_ROOM';
  typeName: string;
  typeNameEn: string;
  capacity: number;
  bedType: string;
  sizeSqM: number;
  basePrice: number;
  weekendPrice: number;
  description: string;
  descriptionEn: string;
  images: string[];
  amenities: string[];
  status: RoomStatus;
  currentBookingId?: string;
  maintenanceReason?: string;
  rating: number;
  reviewCount: number;
}

export interface AddOn {
  id: string;
  name: string;
  nameEn: string;
  price: number;
  unit: string;
  description: string;
  icon: string;
}

export interface SelectedAddOn {
  addOnId: string;
  name: string;
  price: number;
  quantity: number;
}

export interface PromoCode {
  code: string;
  description: string;
  discountType: 'PERCENT' | 'FIXED';
  discountValue: number;
  minSpend: number;
  isActive: boolean;
}

export interface MaintenanceIssue {
  id: string;
  roomId: string;
  roomNumber: string;
  issueDescription: string;
  reportedBy: string;
  reportedAt: string;
  status: 'PENDING_REPAIR' | 'RESOLVED';
  resolvedAt?: string;
}

export interface Review {
  id: string;
  roomId: string;
  guestName: string;
  rating: number; // 1 - 5
  cleanlinessRating: number; // 1 - 5
  comment: string;
  stayDate: string;
  createdAt: string;
}

export interface MinibarItem {
  id: string;
  name: string;
  nameEn: string;
  category: 'BEVERAGE' | 'SNACK' | 'AMENITY';
  price: number;
  unit: string;
}

export interface DispatchedNotification {
  id: string;
  type: 'SMS' | 'EMAIL';
  recipient: string;
  title: string;
  message: string;
  bookingCode: string;
  timestamp: string;
}

export interface Booking {
  id: string;
  bookingCode: string; // e.g. HVR-89241
  roomId: string;
  roomName: string;
  roomNumber: string;
  guestName: string;
  guestPhone: string;
  guestEmail: string;
  guestIdCard: string;
  checkInDate: string; // YYYY-MM-DD
  checkOutDate: string; // YYYY-MM-DD
  nights: number;
  guestsCount: number;
  selectedAddOns: SelectedAddOn[];
  roomPrice: number;
  addOnTotal: number;
  appliedPromoCode?: string;
  discountAmount: number;
  totalAmount: number;
  status: BookingStatus;
  paymentMethod: 'PROMPTPAY_QR' | 'CREDIT_CARD' | 'CASH';
  createdAt: string;
  expiresAt: string; // 15-minute lock ISO
  depositAmount: number; // e.g. 1000
  depositStatus?: 'PENDING' | 'HELD' | 'REFUNDED' | 'DEDUCTED';
  checkInTime?: string;
  checkOutTime?: string;
  specialRequests?: string;
  isWalkIn?: boolean;
  refundAmount?: number;
  cancellationReason?: string;
  minibarCharges?: number;
  reviewed?: boolean;
}

export type UserRole = 'GUEST' | 'FRONT_DESK' | 'HOUSEKEEPER' | 'MANAGER';

export interface UserProfile {
  id: string;
  email: string;
  name: string;
  picture?: string;
  role: UserRole;
  googleId?: string;
  createdAt?: string;
  lastLoginAt?: string;
}
