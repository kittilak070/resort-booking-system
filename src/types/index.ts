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

export interface Room {
  id: string;
  roomNumber: string;
  name: string;
  type: 'POOL_VILLA' | 'BEACHFRONT_SUITE' | 'GARDEN_BUNGALOW' | 'DELUXE_ROOM';
  typeName: string;
  capacity: number;
  bedType: string;
  sizeSqM: number;
  basePrice: number;
  weekendPrice: number;
  description: string;
  images: string[];
  amenities: string[];
  status: RoomStatus;
  currentBookingId?: string;
}

export interface AddOn {
  id: string;
  name: string;
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
  discountAmount: number;
  totalAmount: number;
  status: BookingStatus;
  paymentMethod: 'PROMPTPAY_QR' | 'CREDIT_CARD';
  createdAt: string;
  expiresAt: string; // 15-minute lock ISO
  depositAmount: number; // e.g. 1000
  depositStatus?: 'PENDING' | 'HELD' | 'REFUNDED' | 'DEDUCTED';
  checkInTime?: string;
  checkOutTime?: string;
  specialRequests?: string;
}

export type UserRole = 'GUEST' | 'FRONT_DESK' | 'HOUSEKEEPER' | 'MANAGER';
