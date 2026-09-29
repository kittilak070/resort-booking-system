import React, { createContext, useContext, useState, useEffect } from 'react';
import { 
  Room, Booking, AddOn, UserRole, RoomStatus, 
  SelectedAddOn, PromoCode, MaintenanceIssue 
} from '../types';
import { INITIAL_ROOMS, INITIAL_ADDONS } from '../data/mockRooms';

const INITIAL_PROMO_CODES: PromoCode[] = [
  {
    code: 'HAVEN10',
    description: 'ส่วนลด 10% สำหรับการจองครั้งแรก',
    discountType: 'PERCENT',
    discountValue: 10,
    minSpend: 2000,
    isActive: true
  },
  {
    code: 'SUMMER500',
    description: 'ลดทันที 500 บาท เมื่อจองครบ 3,000 บาท',
    discountType: 'FIXED',
    discountValue: 500,
    minSpend: 3000,
    isActive: true
  },
  {
    code: 'VIP20',
    description: 'โปรโมชันพิเศษสมาชิก VIP ลด 20%',
    discountType: 'PERCENT',
    discountValue: 20,
    minSpend: 5000,
    isActive: true
  }
];

interface BookingParams {
  roomId: string;
  checkInDate: string;
  checkOutDate: string;
  guestsCount: number;
  guestName: string;
  guestPhone: string;
  guestEmail: string;
  guestIdCard: string;
  selectedAddOns: SelectedAddOn[];
  specialRequests?: string;
  paymentMethod: 'PROMPTPAY_QR' | 'CREDIT_CARD' | 'CASH';
  promoCode?: string;
}

interface WalkInParams {
  roomId: string;
  checkInDate: string;
  checkOutDate: string;
  guestsCount: number;
  guestName: string;
  guestPhone: string;
  guestEmail: string;
  guestIdCard: string;
  selectedAddOns: SelectedAddOn[];
  depositAmount: number;
  paymentMethod: 'PROMPTPAY_QR' | 'CREDIT_CARD' | 'CASH';
  specialRequests?: string;
}

interface CancellationResult {
  success: boolean;
  refundAmount: number;
  cancellationFee: number;
  refundPercentage: number;
  policyNote: string;
  error?: string;
}

interface ResortContextType {
  rooms: Room[];
  bookings: Booking[];
  addOns: AddOn[];
  promoCodes: PromoCode[];
  maintenanceIssues: MaintenanceIssue[];
  activeRole: UserRole;
  setActiveRole: (role: UserRole) => void;
  createBooking: (params: BookingParams) => { success: boolean; booking?: Booking; error?: string };
  createWalkInBooking: (params: WalkInParams) => { success: boolean; booking?: Booking; error?: string };
  confirmPayment: (bookingId: string) => void;
  cancelBooking: (bookingId: string) => void;
  cancelBookingWithRefund: (bookingId: string, reason?: string) => CancellationResult;
  checkInGuest: (bookingId: string, depositAmount: number) => { success: boolean; error?: string };
  checkOutGuest: (bookingId: string, damageFee?: number) => { success: boolean; error?: string };
  updateRoomStatus: (roomId: string, status: RoomStatus, maintenanceReason?: string) => void;
  validatePromoCode: (code: string, subtotal: number) => { valid: boolean; discountAmount: number; message: string; promo?: PromoCode };
  addPromoCode: (promo: PromoCode) => void;
  togglePromoCode: (code: string) => void;
  reportMaintenance: (roomId: string, description: string, reportedBy: string) => void;
  resolveMaintenance: (issueId: string) => void;
  stats: {
    totalRooms: number;
    occupiedRooms: number;
    cleanRooms: number;
    dirtyRooms: number;
    cleaningRooms: number;
    maintenanceRooms: number;
    occupancyRate: number;
    totalRevenue: number;
    totalRefunded: number;
  };
  resetAllData: () => void;
}

const ResortContext = createContext<ResortContextType | undefined>(undefined);

export const ResortProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [activeRole, setActiveRole] = useState<UserRole>('GUEST');

  // Rooms
  const [rooms, setRooms] = useState<Room[]>(() => {
    const saved = localStorage.getItem('resort_rooms_v2');
    return saved ? JSON.parse(saved) : INITIAL_ROOMS;
  });

  // Bookings
  const [bookings, setBookings] = useState<Booking[]>(() => {
    const saved = localStorage.getItem('resort_bookings_v2');
    if (saved) return JSON.parse(saved);
    return [
      {
        id: 'bkg-demo-1',
        bookingCode: 'HVR-78219',
        roomId: 'room-bf-201',
        roomName: 'Beachfront Panorama Suite',
        roomNumber: 'SUITE 201',
        guestName: 'คุณสมชาย ใจดี',
        guestPhone: '081-234-5678',
        guestEmail: 'somchai@example.com',
        guestIdCard: '1100200300401',
        checkInDate: '2026-09-29',
        checkOutDate: '2026-10-01',
        nights: 2,
        guestsCount: 2,
        selectedAddOns: [
          { addOnId: 'addon-floating-bf', name: 'เซ็ต Floating Breakfast ถ่ายรูปลอยน้ำ', price: 650, quantity: 1 }
        ],
        roomPrice: 7600,
        addOnTotal: 650,
        discountAmount: 0,
        totalAmount: 8250,
        status: 'CHECKED_IN',
        paymentMethod: 'PROMPTPAY_QR',
        createdAt: new Date().toISOString(),
        expiresAt: new Date(Date.now() + 86400000).toISOString(),
        depositAmount: 1000,
        depositStatus: 'HELD',
        checkInTime: '2026-09-29 14:15',
        specialRequests: 'ขอห้องชั้นบน ไม่สูบบุหรี่'
      }
    ];
  });

  // Promo Codes
  const [promoCodes, setPromoCodes] = useState<PromoCode[]>(() => {
    const saved = localStorage.getItem('resort_promos_v2');
    return saved ? JSON.parse(saved) : INITIAL_PROMO_CODES;
  });

  // Maintenance Issues
  const [maintenanceIssues, setMaintenanceIssues] = useState<MaintenanceIssue[]>(() => {
    const saved = localStorage.getItem('resort_maintenance_v2');
    return saved ? JSON.parse(saved) : [];
  });

  const [addOns] = useState<AddOn[]>(INITIAL_ADDONS);

  // Sync to LocalStorage
  useEffect(() => {
    localStorage.setItem('resort_rooms_v2', JSON.stringify(rooms));
  }, [rooms]);

  useEffect(() => {
    localStorage.setItem('resort_bookings_v2', JSON.stringify(bookings));
  }, [bookings]);

  useEffect(() => {
    localStorage.setItem('resort_promos_v2', JSON.stringify(promoCodes));
  }, [promoCodes]);

  useEffect(() => {
    localStorage.setItem('resort_maintenance_v2', JSON.stringify(maintenanceIssues));
  }, [maintenanceIssues]);

  // BR-01: Auto expire unconfirmed hold bookings (15 minutes)
  useEffect(() => {
    const interval = setInterval(() => {
      const now = new Date().getTime();
      let hasExpired = false;

      setBookings(prev => {
        return prev.map(bkg => {
          if (bkg.status === 'PENDING_PAYMENT') {
            const expireTime = new Date(bkg.expiresAt).getTime();
            if (now > expireTime) {
              hasExpired = true;
              return { ...bkg, status: 'CANCELLED' };
            }
          }
          return bkg;
        });
      });

      if (hasExpired) {
        console.log('Expired hold bookings released.');
      }
    }, 10000);

    return () => clearInterval(interval);
  }, []);

  // Promo code validator
  const validatePromoCode = (code: string, subtotal: number) => {
    const cleanCode = code.trim().toUpperCase();
    const promo = promoCodes.find(p => p.code.toUpperCase() === cleanCode);

    if (!promo) {
      return { valid: false, discountAmount: 0, message: 'ไม่พบโค้ดส่วนลดนี้' };
    }

    if (!promo.isActive) {
      return { valid: false, discountAmount: 0, message: 'โค้ดส่วนลดนี้หมดอายุหรือไม่สามารถใช้งานได้แล้ว' };
    }

    if (subtotal < promo.minSpend) {
      return { 
        valid: false, 
        discountAmount: 0, 
        message: `ยอดสั่งจองขั้นต่ำสำหรับโค้ดนี้คือ ฿${promo.minSpend.toLocaleString()}` 
      };
    }

    let discount = 0;
    if (promo.discountType === 'PERCENT') {
      discount = Math.round((subtotal * promo.discountValue) / 100);
    } else {
      discount = promo.discountValue;
    }

    discount = Math.min(discount, subtotal); // Do not exceed total

    return {
      valid: true,
      discountAmount: discount,
      message: `ใช้โค้ด ${promo.code} สำเร็จ! ลดทันที ฿${discount.toLocaleString()}`,
      promo
    };
  };

  // Create booking with optional promo code
  const createBooking = (params: BookingParams) => {
    const room = rooms.find(r => r.id === params.roomId);
    if (!room) return { success: false, error: 'ไม่พบห้องพักที่เลือก' };
    if (room.status === 'MAINTENANCE') return { success: false, error: 'ห้องพักนี้ปิดซ่อมบำรุงชั่วคราว' };

    const checkIn = new Date(params.checkInDate);
    const checkOut = new Date(params.checkOutDate);
    const diffTime = checkOut.getTime() - checkIn.getTime();
    const nights = Math.max(1, Math.ceil(diffTime / (1000 * 60 * 60 * 24)));

    const isWeekend = checkIn.getDay() === 5 || checkIn.getDay() === 6;
    const nightlyPrice = isWeekend ? room.weekendPrice : room.basePrice;
    const roomPrice = nightlyPrice * nights;
    const addOnTotal = params.selectedAddOns.reduce((sum, item) => sum + item.price * item.quantity, 0);
    const subtotal = roomPrice + addOnTotal;

    let discountAmount = 0;
    let appliedPromoCode: string | undefined = undefined;

    if (params.promoCode) {
      const promoCheck = validatePromoCode(params.promoCode, subtotal);
      if (promoCheck.valid) {
        discountAmount = promoCheck.discountAmount;
        appliedPromoCode = promoCheck.promo?.code;
      }
    }

    const totalAmount = Math.max(0, subtotal - discountAmount);

    const codeSuffix = Math.floor(10000 + Math.random() * 90000);
    const bookingCode = `HVR-${codeSuffix}`;
    const now = new Date();
    const expiresAt = new Date(now.getTime() + 15 * 60 * 1000).toISOString();

    const newBooking: Booking = {
      id: `bkg-${Date.now()}`,
      bookingCode,
      roomId: room.id,
      roomName: room.name,
      roomNumber: room.roomNumber,
      guestName: params.guestName,
      guestPhone: params.guestPhone,
      guestEmail: params.guestEmail,
      guestIdCard: params.guestIdCard,
      checkInDate: params.checkInDate,
      checkOutDate: params.checkOutDate,
      nights,
      guestsCount: params.guestsCount,
      selectedAddOns: params.selectedAddOns,
      roomPrice,
      addOnTotal,
      appliedPromoCode,
      discountAmount,
      totalAmount,
      status: 'PENDING_PAYMENT',
      paymentMethod: params.paymentMethod,
      createdAt: now.toISOString(),
      expiresAt,
      depositAmount: 1000,
      depositStatus: 'PENDING',
      specialRequests: params.specialRequests
    };

    setBookings(prev => [newBooking, ...prev]);
    return { success: true, booking: newBooking };
  };

  // Create Walk-In Booking (Instant Check-in)
  const createWalkInBooking = (params: WalkInParams) => {
    const room = rooms.find(r => r.id === params.roomId);
    if (!room) return { success: false, error: 'ไม่พบห้องพักที่เลือก' };
    if (room.status !== 'VACANT_CLEAN') {
      return { success: false, error: 'ห้องพักต้องอยู่ในสถานะว่างและสะอาด (Vacant Clean) เท่านั้น' };
    }

    const checkIn = new Date(params.checkInDate);
    const checkOut = new Date(params.checkOutDate);
    const diffTime = checkOut.getTime() - checkIn.getTime();
    const nights = Math.max(1, Math.ceil(diffTime / (1000 * 60 * 60 * 24)));

    const isWeekend = checkIn.getDay() === 5 || checkIn.getDay() === 6;
    const nightlyPrice = isWeekend ? room.weekendPrice : room.basePrice;
    const roomPrice = nightlyPrice * nights;
    const addOnTotal = params.selectedAddOns.reduce((sum, item) => sum + item.price * item.quantity, 0);
    const totalAmount = roomPrice + addOnTotal;

    const codeSuffix = Math.floor(10000 + Math.random() * 90000);
    const bookingCode = `HVR-WK${codeSuffix}`;
    const now = new Date();
    const nowFormatted = now.toLocaleString('th-TH');

    const newBooking: Booking = {
      id: `bkg-walkin-${Date.now()}`,
      bookingCode,
      roomId: room.id,
      roomName: room.name,
      roomNumber: room.roomNumber,
      guestName: params.guestName,
      guestPhone: params.guestPhone,
      guestEmail: params.guestEmail,
      guestIdCard: params.guestIdCard,
      checkInDate: params.checkInDate,
      checkOutDate: params.checkOutDate,
      nights,
      guestsCount: params.guestsCount,
      selectedAddOns: params.selectedAddOns,
      roomPrice,
      addOnTotal,
      discountAmount: 0,
      totalAmount,
      status: 'CHECKED_IN',
      paymentMethod: params.paymentMethod,
      createdAt: now.toISOString(),
      expiresAt: new Date(now.getTime() + 86400000).toISOString(),
      depositAmount: params.depositAmount,
      depositStatus: 'HELD',
      checkInTime: nowFormatted,
      specialRequests: params.specialRequests,
      isWalkIn: true
    };

    // Update Bookings & Mark Room as OCCUPIED
    setBookings(prev => [newBooking, ...prev]);
    setRooms(prev =>
      prev.map(r => (r.id === room.id ? { ...r, status: 'OCCUPIED', currentBookingId: newBooking.id } : r))
    );

    return { success: true, booking: newBooking };
  };

  // Confirm payment
  const confirmPayment = (bookingId: string) => {
    setBookings(prev =>
      prev.map(bkg => (bkg.id === bookingId ? { ...bkg, status: 'CONFIRMED' } : bkg))
    );
  };

  // Simple cancel
  const cancelBooking = (bookingId: string) => {
    setBookings(prev =>
      prev.map(bkg => (bkg.id === bookingId ? { ...bkg, status: 'CANCELLED' } : bkg))
    );
  };

  // BR-03: Cancellation & Refund Engine
  const cancelBookingWithRefund = (bookingId: string, reason?: string): CancellationResult => {
    const booking = bookings.find(b => b.id === bookingId);
    if (!booking) {
      return { success: false, refundAmount: 0, cancellationFee: 0, refundPercentage: 0, policyNote: 'ไม่พบข้อมูลการจอง', error: 'ไม่พบข้อมูล' };
    }

    if (booking.status === 'CANCELLED' || booking.status === 'CHECKED_OUT') {
      return { success: false, refundAmount: 0, cancellationFee: 0, refundPercentage: 0, policyNote: 'รายการจองนี้ถูกยกเลิกหรือเสร็จสิ้นไปแล้ว', error: 'สถานะไม่ถูกต้อง' };
    }

    // Days difference between today and check-in date
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const checkIn = new Date(booking.checkInDate);
    checkIn.setHours(0, 0, 0, 0);

    const diffDays = Math.ceil((checkIn.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));

    let refundPercentage = 0;
    let policyNote = '';

    if (diffDays >= 7) {
      // ≥ 7 days: 100% refund (minus 3% transaction fee)
      refundPercentage = 97;
      policyNote = 'ยกเลิกล่วงหน้า 7 วันขึ้นไป: ได้รับเงินคืน 97% (หักค่าธรรมเนียมธุรกรรม 3%)';
    } else if (diffDays >= 3 && diffDays <= 6) {
      // 3 - 6 days: 50% refund
      refundPercentage = 50;
      policyNote = 'ยกเลิกล่วงหน้า 3 - 6 วัน: ได้รับเงินคืน 50% ของยอดชำระ';
    } else {
      // < 3 days or No-show: 0% refund
      refundPercentage = 0;
      policyNote = 'ยกเลิกล่วงหน้าน้อยกว่า 3 วัน: ไม่สามารถขอคืนเงินได้ตามนโยบายรีสอร์ท (Non-refundable)';
    }

    const refundAmount = Math.round((booking.totalAmount * refundPercentage) / 100);
    const cancellationFee = booking.totalAmount - refundAmount;

    // Update booking state
    setBookings(prev =>
      prev.map(b =>
        b.id === bookingId
          ? {
              ...b,
              status: 'CANCELLED',
              refundAmount,
              cancellationReason: reason || policyNote
            }
          : b
      )
    );

    // If room was currently locked to this booking, release it
    setRooms(prev =>
      prev.map(r =>
        r.currentBookingId === bookingId
          ? { ...r, status: 'VACANT_CLEAN', currentBookingId: undefined }
          : r
      )
    );

    return {
      success: true,
      refundAmount,
      cancellationFee,
      refundPercentage,
      policyNote
    };
  };

  // Check-in guest
  const checkInGuest = (bookingId: string, depositAmount: number) => {
    const booking = bookings.find(b => b.id === bookingId);
    if (!booking) return { success: false, error: 'ไม่พบข้อมูลการจอง' };

    const room = rooms.find(r => r.id === booking.roomId);
    if (!room) return { success: false, error: 'ไม่พบห้องพัก' };

    if (room.status === 'OCCUPIED') return { success: false, error: 'ห้องนี้มีผู้เข้าพักอยู่แล้ว' };
    if (room.status === 'VACANT_DIRTY' || room.status === 'CLEANING') {
      return { success: false, error: 'ห้องพักยังทำความสะอาดไม่เสร็จ' };
    }

    const nowFormatted = new Date().toLocaleString('th-TH');

    setBookings(prev =>
      prev.map(b =>
        b.id === bookingId
          ? {
              ...b,
              status: 'CHECKED_IN',
              depositAmount,
              depositStatus: 'HELD',
              checkInTime: nowFormatted
            }
          : b
      )
    );

    setRooms(prev =>
      prev.map(r => (r.id === room.id ? { ...r, status: 'OCCUPIED', currentBookingId: booking.id } : r))
    );

    return { success: true };
  };

  // Check-out guest
  const checkOutGuest = (bookingId: string, damageFee: number = 0) => {
    const booking = bookings.find(b => b.id === bookingId);
    if (!booking) return { success: false, error: 'ไม่พบข้อมูลการจอง' };

    const nowFormatted = new Date().toLocaleString('th-TH');

    setBookings(prev =>
      prev.map(b =>
        b.id === bookingId
          ? {
              ...b,
              status: 'CHECKED_OUT',
              depositStatus: damageFee > 0 ? 'DEDUCTED' : 'REFUNDED',
              checkOutTime: nowFormatted
            }
          : b
      )
    );

    // Auto set room to VACANT_DIRTY
    setRooms(prev =>
      prev.map(r =>
        r.id === booking.roomId
          ? { ...r, status: 'VACANT_DIRTY', currentBookingId: undefined }
          : r
      )
    );

    return { success: true };
  };

  // Update room status
  const updateRoomStatus = (roomId: string, status: RoomStatus, maintenanceReason?: string) => {
    setRooms(prev =>
      prev.map(r => (r.id === roomId ? { ...r, status, maintenanceReason } : r))
    );
  };

  // Housekeeping Maintenance Reporting
  const reportMaintenance = (roomId: string, description: string, reportedBy: string) => {
    const room = rooms.find(r => r.id === roomId);
    if (!room) return;

    const newIssue: MaintenanceIssue = {
      id: `maint-${Date.now()}`,
      roomId,
      roomNumber: room.roomNumber,
      issueDescription: description,
      reportedBy,
      reportedAt: new Date().toLocaleString('th-TH'),
      status: 'PENDING_REPAIR'
    };

    setMaintenanceIssues(prev => [newIssue, ...prev]);

    // Automatically set room status to MAINTENANCE
    updateRoomStatus(roomId, 'MAINTENANCE', description);
  };

  // Resolve Maintenance
  const resolveMaintenance = (issueId: string) => {
    const issue = maintenanceIssues.find(m => m.id === issueId);
    if (!issue) return;

    setMaintenanceIssues(prev =>
      prev.map(m =>
        m.id === issueId
          ? { ...m, status: 'RESOLVED', resolvedAt: new Date().toLocaleString('th-TH') }
          : m
      )
    );

    // Set room to VACANT_DIRTY so housekeeping cleans it before releasing
    updateRoomStatus(issue.roomId, 'VACANT_DIRTY');
  };

  // Promo code management
  const addPromoCode = (promo: PromoCode) => {
    setPromoCodes(prev => [promo, ...prev]);
  };

  const togglePromoCode = (code: string) => {
    setPromoCodes(prev =>
      prev.map(p => (p.code === code ? { ...p, isActive: !p.isActive } : p))
    );
  };

  // Reset
  const resetAllData = () => {
    localStorage.removeItem('resort_rooms_v2');
    localStorage.removeItem('resort_bookings_v2');
    localStorage.removeItem('resort_promos_v2');
    localStorage.removeItem('resort_maintenance_v2');
    setRooms(INITIAL_ROOMS);
    setBookings([]);
    setPromoCodes(INITIAL_PROMO_CODES);
    setMaintenanceIssues([]);
  };

  // Compute stats
  const totalRooms = rooms.length;
  const occupiedRooms = rooms.filter(r => r.status === 'OCCUPIED').length;
  const cleanRooms = rooms.filter(r => r.status === 'VACANT_CLEAN').length;
  const dirtyRooms = rooms.filter(r => r.status === 'VACANT_DIRTY').length;
  const cleaningRooms = rooms.filter(r => r.status === 'CLEANING').length;
  const maintenanceRooms = rooms.filter(r => r.status === 'MAINTENANCE').length;
  const occupancyRate = totalRooms > 0 ? Math.round((occupiedRooms / totalRooms) * 100) : 0;

  const totalRevenue = bookings
    .filter(b => b.status === 'CONFIRMED' || b.status === 'CHECKED_IN' || b.status === 'CHECKED_OUT')
    .reduce((sum, b) => sum + b.totalAmount, 0);

  const totalRefunded = bookings
    .filter(b => b.status === 'CANCELLED' && b.refundAmount)
    .reduce((sum, b) => sum + (b.refundAmount || 0), 0);

  return (
    <ResortContext.Provider
      value={{
        rooms,
        bookings,
        addOns,
        promoCodes,
        maintenanceIssues,
        activeRole,
        setActiveRole,
        createBooking,
        createWalkInBooking,
        confirmPayment,
        cancelBooking,
        cancelBookingWithRefund,
        checkInGuest,
        checkOutGuest,
        updateRoomStatus,
        validatePromoCode,
        addPromoCode,
        togglePromoCode,
        reportMaintenance,
        resolveMaintenance,
        stats: {
          totalRooms,
          occupiedRooms,
          cleanRooms,
          dirtyRooms,
          cleaningRooms,
          maintenanceRooms,
          occupancyRate,
          totalRevenue,
          totalRefunded
        },
        resetAllData
      }}
    >
      {children}
    </ResortContext.Provider>
  );
};

export const useResort = () => {
  const context = useContext(ResortContext);
  if (!context) {
    throw new Error('useResort must be used within a ResortProvider');
  }
  return context;
};
