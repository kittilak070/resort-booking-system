import React, { createContext, useContext, useState, useEffect } from 'react';
import { 
  Room, Booking, AddOn, UserRole, RoomStatus, 
  SelectedAddOn, PromoCode, MaintenanceIssue,
  Language, Review, MinibarItem, DispatchedNotification 
} from '../types';
import { 
  INITIAL_ROOMS, INITIAL_ADDONS, INITIAL_MINIBAR_ITEMS, 
  INITIAL_REVIEWS, INITIAL_NOTIFICATIONS 
} from '../data/mockRooms';

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
  language: Language;
  setLanguage: (lang: Language) => void;
  rooms: Room[];
  bookings: Booking[];
  addOns: AddOn[];
  promoCodes: PromoCode[];
  maintenanceIssues: MaintenanceIssue[];
  reviews: Review[];
  minibarItems: MinibarItem[];
  notifications: DispatchedNotification[];
  activeRole: UserRole;
  setActiveRole: (role: UserRole) => void;
  createBooking: (params: BookingParams) => { success: boolean; booking?: Booking; error?: string };
  createWalkInBooking: (params: WalkInParams) => { success: boolean; booking?: Booking; error?: string };
  confirmPayment: (bookingId: string) => void;
  cancelBooking: (bookingId: string) => void;
  cancelBookingWithRefund: (bookingId: string, reason?: string) => CancellationResult;
  checkInGuest: (bookingId: string, depositAmount: number) => { success: boolean; error?: string };
  checkOutGuest: (bookingId: string, damageFee?: number, minibarCharges?: number) => { success: boolean; error?: string };
  updateRoomStatus: (roomId: string, status: RoomStatus, maintenanceReason?: string) => void;
  validatePromoCode: (code: string, subtotal: number) => { valid: boolean; discountAmount: number; message: string; promo?: PromoCode };
  addPromoCode: (promo: PromoCode) => void;
  togglePromoCode: (code: string) => void;
  reportMaintenance: (roomId: string, description: string, reportedBy: string) => void;
  resolveMaintenance: (issueId: string) => void;
  addReview: (roomId: string, review: Omit<Review, 'id' | 'createdAt'>) => void;
  sendNotification: (type: 'SMS' | 'EMAIL', recipient: string, title: string, message: string, bookingCode: string) => void;
  clearNotifications: () => void;
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
  isStaffAuthenticated: boolean;
  authenticateStaff: (pin: string) => boolean;
  logoutStaff: () => void;
  resetAllData: () => void;
}

const ResortContext = createContext<ResortContextType | undefined>(undefined);

export const ResortProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [activeRole, setActiveRole] = useState<UserRole>('GUEST');

  // Multi-Language
  const [language, setLanguage] = useState<Language>(() => {
    const saved = localStorage.getItem('resort_lang_v3');
    return (saved as Language) || 'th';
  });

  // OWASP SEC-01: Staff Authentication State
  const [isStaffAuthenticated, setIsStaffAuthenticated] = useState<boolean>(() => {
    return sessionStorage.getItem('resort_staff_auth') === 'true';
  });

  const authenticateStaff = (pin: string): boolean => {
    if (pin.trim() === '8888') {
      setIsStaffAuthenticated(true);
      sessionStorage.setItem('resort_staff_auth', 'true');
      return true;
    }
    return false;
  };

  const logoutStaff = () => {
    setIsStaffAuthenticated(false);
    sessionStorage.removeItem('resort_staff_auth');
    setActiveRole('GUEST');
  };

  useEffect(() => {
    localStorage.setItem('resort_lang_v3', language);
  }, [language]);

  // Rooms
  const [rooms, setRooms] = useState<Room[]>(() => {
    const saved = localStorage.getItem('resort_rooms_v3');
    return saved ? JSON.parse(saved) : INITIAL_ROOMS;
  });

  // Bookings
  const [bookings, setBookings] = useState<Booking[]>(() => {
    const saved = localStorage.getItem('resort_bookings_v3');
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
        checkInDate: new Date().toISOString().split('T')[0],
        checkOutDate: new Date(Date.now() + 2 * 86400000).toISOString().split('T')[0],
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
        checkInTime: `${new Date().toISOString().split('T')[0]} 14:15`,
        specialRequests: 'ขอห้องชั้นบน ไม่สูบบุหรี่'
      }
    ];
  });

  // Promo Codes
  const [promoCodes, setPromoCodes] = useState<PromoCode[]>(() => {
    const saved = localStorage.getItem('resort_promos_v3');
    return saved ? JSON.parse(saved) : INITIAL_PROMO_CODES;
  });

  // Maintenance Issues
  const [maintenanceIssues, setMaintenanceIssues] = useState<MaintenanceIssue[]>(() => {
    const saved = localStorage.getItem('resort_maintenance_v3');
    return saved ? JSON.parse(saved) : [];
  });

  // Reviews
  const [reviews, setReviews] = useState<Review[]>(() => {
    const saved = localStorage.getItem('resort_reviews_v3');
    return saved ? JSON.parse(saved) : INITIAL_REVIEWS;
  });

  // Minibar Items
  const [minibarItems] = useState<MinibarItem[]>(INITIAL_MINIBAR_ITEMS);

  // Dispatched Notifications
  const [notifications, setNotifications] = useState<DispatchedNotification[]>(() => {
    const saved = localStorage.getItem('resort_notifications_v3');
    return saved ? JSON.parse(saved) : INITIAL_NOTIFICATIONS;
  });

  const [addOns] = useState<AddOn[]>(INITIAL_ADDONS);

  // Sync to LocalStorage
  useEffect(() => {
    localStorage.setItem('resort_rooms_v3', JSON.stringify(rooms));
  }, [rooms]);

  useEffect(() => {
    localStorage.setItem('resort_bookings_v3', JSON.stringify(bookings));
  }, [bookings]);

  useEffect(() => {
    localStorage.setItem('resort_promos_v3', JSON.stringify(promoCodes));
  }, [promoCodes]);

  useEffect(() => {
    localStorage.setItem('resort_maintenance_v3', JSON.stringify(maintenanceIssues));
  }, [maintenanceIssues]);

  useEffect(() => {
    localStorage.setItem('resort_reviews_v3', JSON.stringify(reviews));
  }, [reviews]);

  useEffect(() => {
    localStorage.setItem('resort_notifications_v3', JSON.stringify(notifications));
  }, [notifications]);

  // Send Notification Helper
  const sendNotification = (
    type: 'SMS' | 'EMAIL',
    recipient: string,
    title: string,
    message: string,
    bookingCode: string
  ) => {
    const now = new Date();
    const timestamp = `${now.toISOString().split('T')[0]} ${now.toTimeString().split(' ')[0]}`;
    const newNotif: DispatchedNotification = {
      id: `notif-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      type,
      recipient,
      title,
      message,
      bookingCode,
      timestamp
    };
    setNotifications(prev => [newNotif, ...prev]);
  };

  const clearNotifications = () => {
    setNotifications([]);
  };

  // Add Review & update room rating
  const addReview = (roomId: string, reviewInput: Omit<Review, 'id' | 'createdAt'>) => {
    const newReview: Review = {
      ...reviewInput,
      id: `rev-${Date.now()}`,
      createdAt: new Date().toISOString()
    };

    setReviews(prev => [newReview, ...prev]);

    // Recalculate room average rating
    setRooms(prevRooms =>
      prevRooms.map(rm => {
        if (rm.id === roomId) {
          const roomReviews = [...reviews.filter(r => r.roomId === roomId), newReview];
          const avg = roomReviews.reduce((sum, r) => sum + r.rating, 0) / roomReviews.length;
          return {
            ...rm,
            rating: Math.round(avg * 10) / 10,
            reviewCount: roomReviews.length
          };
        }
        return rm;
      })
    );
  };

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
        setRooms(prev => {
          return prev.map(rm => {
            return rm;
          });
        });
      }
    }, 10000);

    return () => clearInterval(interval);
  }, []);

  // Validate Promo Code
  const validatePromoCode = (code: string, subtotal: number) => {
    const cleanCode = code.trim().toUpperCase();
    const found = promoCodes.find(p => p.code.toUpperCase() === cleanCode);

    if (!found) {
      return { valid: false, discountAmount: 0, message: 'ไม่พบโค้ดส่วนลดนี้ หรือหมดอายุแล้ว' };
    }

    if (!found.isActive) {
      return { valid: false, discountAmount: 0, message: 'โค้ดส่วนลดนี้ถูกปิดใช้งานแล้ว' };
    }

    if (subtotal < found.minSpend) {
      return {
        valid: false,
        discountAmount: 0,
        message: `ยอดสั่งจองไม่ถึงเกณฑ์ขั้นต่ำ ฿${found.minSpend.toLocaleString()}`
      };
    }

    let discountAmount = 0;
    if (found.discountType === 'PERCENT') {
      discountAmount = Math.round((subtotal * found.discountValue) / 100);
    } else {
      discountAmount = found.discountValue;
    }

    discountAmount = Math.min(discountAmount, subtotal);

    return {
      valid: true,
      discountAmount,
      message: `ใช้โค้ด ${found.code} สำเร็จ! ${found.description}`,
      promo: found
    };
  };

  const addPromoCode = (promo: PromoCode) => {
    setPromoCodes(prev => [...prev.filter(p => p.code !== promo.code), promo]);
  };

  const togglePromoCode = (code: string) => {
    setPromoCodes(prev =>
      prev.map(p => (p.code === code ? { ...p, isActive: !p.isActive } : p))
    );
  };

  // Maintenance
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
    updateRoomStatus(roomId, 'MAINTENANCE', description);
  };

  const resolveMaintenance = (issueId: string) => {
    const issue = maintenanceIssues.find(i => i.id === issueId);
    if (!issue) return;

    setMaintenanceIssues(prev =>
      prev.map(i =>
        i.id === issueId
          ? { ...i, status: 'RESOLVED', resolvedAt: new Date().toLocaleString('th-TH') }
          : i
      )
    );

    updateRoomStatus(issue.roomId, 'VACANT_DIRTY', undefined);
  };

  // Create standard booking
  const createBooking = (params: BookingParams) => {
    const room = rooms.find(r => r.id === params.roomId);
    if (!room) {
      return { success: false, error: 'ไม่พบห้องพักที่เลือก' };
    }

    const checkIn = new Date(params.checkInDate);
    const checkOut = new Date(params.checkOutDate);
    const diffTime = checkOut.getTime() - checkIn.getTime();
    const nights = Math.max(1, Math.ceil(diffTime / (1000 * 60 * 60 * 24)));

    let isWeekendStay = false;
    for (let d = new Date(checkIn); d < checkOut; d.setDate(d.getDate() + 1)) {
      const day = d.getDay();
      if (day === 5 || day === 6) {
        isWeekendStay = true;
        break;
      }
    }

    const nightlyRate = isWeekendStay ? room.weekendPrice : room.basePrice;
    const roomPrice = nightlyRate * nights;

    const addOnTotal = params.selectedAddOns.reduce((sum, item) => {
      return sum + item.price * item.quantity;
    }, 0);

    const subtotal = roomPrice + addOnTotal;

    let discountAmount = 0;
    if (params.promoCode) {
      const promoResult = validatePromoCode(params.promoCode, subtotal);
      if (promoResult.valid) {
        discountAmount = promoResult.discountAmount;
      }
    }

    const totalAmount = Math.max(0, subtotal - discountAmount);

    const bookingCode = `HVR-${Math.floor(10000 + Math.random() * 90000)}`;
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
      appliedPromoCode: params.promoCode,
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

    // Dispatch automated confirmation notifications
    sendNotification(
      'SMS',
      params.guestPhone,
      'คำขอจองห้องพักใหม่ (รหัส: ' + bookingCode + ')',
      `The Haven: ได้รับคำขอจองห้อง ${room.roomNumber} กรุณาชำระเงิน ฿${totalAmount.toLocaleString()} ภายใน 15 นาที เพื่อยืนยันห้อง`,
      bookingCode
    );

    sendNotification(
      'EMAIL',
      params.guestEmail,
      `คำขอจองห้องพัก ${bookingCode} - The Haven Serene Resort`,
      `เรียน คุณ${params.guestName} เราได้รับคำขอจอง ${room.name} (${room.roomNumber}) วันที่ ${params.checkInDate} ถึง ${params.checkOutDate} เรียบร้อยแล้ว`,
      bookingCode
    );

    return { success: true, booking: newBooking };
  };

  // Walk-In Reservation
  const createWalkInBooking = (params: WalkInParams) => {
    const room = rooms.find(r => r.id === params.roomId);
    if (!room) {
      return { success: false, error: 'ไม่พบห้องพักที่เลือก' };
    }

    if (room.status !== 'VACANT_CLEAN') {
      return { success: false, error: 'ห้องพักไม่อยู่ในสถานะว่างสะอาด ไม่สามารถรับ Walk-in ได้ทันที' };
    }

    const checkIn = new Date(params.checkInDate);
    const checkOut = new Date(params.checkOutDate);
    const diffTime = checkOut.getTime() - checkIn.getTime();
    const nights = Math.max(1, Math.ceil(diffTime / (1000 * 60 * 60 * 24)));

    const nightlyRate = room.basePrice;
    const roomPrice = nightlyRate * nights;

    const addOnTotal = params.selectedAddOns.reduce((sum, item) => {
      return sum + item.price * item.quantity;
    }, 0);

    const totalAmount = roomPrice + addOnTotal;
    const bookingCode = `HVR-W${Math.floor(1000 + Math.random() * 9000)}`;
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
      depositAmount: params.depositAmount || 1000,
      depositStatus: 'HELD',
      checkInTime: nowFormatted,
      specialRequests: params.specialRequests,
      isWalkIn: true
    };

    setBookings(prev => [newBooking, ...prev]);

    setRooms(prev =>
      prev.map(r =>
        r.id === room.id
          ? { ...r, status: 'OCCUPIED', currentBookingId: newBooking.id }
          : r
      )
    );

    sendNotification(
      'SMS',
      params.guestPhone,
      `เช็คอินสำเร็จ (Walk-In: ${bookingCode})`,
      `The Haven: ยินดีต้อนรับเข้าพักห้อง ${room.roomNumber} ได้รับเงินมัดจำ ฿${params.depositAmount || 1000} เรียบร้อยแล้ว`,
      bookingCode
    );

    return { success: true, booking: newBooking };
  };

  // Confirm payment
  const confirmPayment = (bookingId: string) => {
    let targetBooking: Booking | undefined;
    setBookings(prev =>
      prev.map(bkg => {
        if (bkg.id === bookingId) {
          targetBooking = { ...bkg, status: 'CONFIRMED' };
          return targetBooking;
        }
        return bkg;
      })
    );

    if (targetBooking) {
      sendNotification(
        'SMS',
        targetBooking.guestPhone,
        `ยืนยันการชำระเงินสำเร็จ (${targetBooking.bookingCode})`,
        `The Haven: ชำระเงินเรียบร้อย ฿${targetBooking.totalAmount.toLocaleString()} ห้อง ${targetBooking.roomNumber} นำรหัสจองมาเช็คอินได้เลยครับ`,
        targetBooking.bookingCode
      );

      sendNotification(
        'EMAIL',
        targetBooking.guestEmail,
        `Payment Receipt & Check-in Voucher (${targetBooking.bookingCode})`,
        `เรียน คุณ${targetBooking.guestName} การชำระเงินจำนวน ฿${targetBooking.totalAmount.toLocaleString()} เสร็จสมบูรณ์ ขอบคุณที่เลือกพักผ่อนกับเรา`,
        targetBooking.bookingCode
      );
    }
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

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const checkIn = new Date(booking.checkInDate);
    checkIn.setHours(0, 0, 0, 0);

    const diffDays = Math.ceil((checkIn.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));

    let refundPercentage = 0;
    let policyNote = '';

    if (diffDays >= 7) {
      refundPercentage = 97;
      policyNote = 'ยกเลิกล่วงหน้า 7 วันขึ้นไป: ได้รับเงินคืน 97% (หักค่าธรรมเนียมธุรกรรม 3%)';
    } else if (diffDays >= 3 && diffDays <= 6) {
      refundPercentage = 50;
      policyNote = 'ยกเลิกล่วงหน้า 3 - 6 วัน: ได้รับเงินคืน 50% ของยอดชำระ';
    } else {
      refundPercentage = 0;
      policyNote = 'ยกเลิกล่วงหน้าน้อยกว่า 3 วัน: ไม่สามารถขอคืนเงินได้ตามนโยบายรีสอร์ท (Non-refundable)';
    }

    const refundAmount = Math.round((booking.totalAmount * refundPercentage) / 100);
    const cancellationFee = booking.totalAmount - refundAmount;

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

    // Release room if it was held
    setRooms(prev =>
      prev.map(r =>
        r.currentBookingId === bookingId
          ? { ...r, status: 'VACANT_CLEAN', currentBookingId: undefined }
          : r
      )
    );

    // Send refund notification
    sendNotification(
      'SMS',
      booking.guestPhone,
      `แจ้งผลการยกเลิก & คืนเงิน (${booking.bookingCode})`,
      `The Haven: ยกเลิกการจองสำเร็จ ได้รับเงินคืน ฿${refundAmount.toLocaleString()} (${refundPercentage}%) บัญชีเดิมภายใน 3-5 วันทำการ`,
      booking.bookingCode
    );

    sendNotification(
      'EMAIL',
      booking.guestEmail,
      `Cancellation & Refund Confirmation (${booking.bookingCode})`,
      `เรียน คุณ${booking.guestName} รีสอร์ทได้ดำเนินการยกเลิกและคืนเงินจำนวน ฿${refundAmount.toLocaleString()} ตามเงื่อนไขนโยบาย BR-03 เรียบร้อยแล้ว`,
      booking.bookingCode
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

    sendNotification(
      'SMS',
      booking.guestPhone,
      `ยินดีต้อนรับสู่ The Haven Resort (${booking.bookingCode})`,
      `ยินดีต้อนรับคุณ ${booking.guestName} เข้าพักห้อง ${booking.roomNumber} หากต้องการบริการเพิ่มเติมกด 0 ติดต่อฟร้อนท์ได้ตลอด 24 ชม.`,
      booking.bookingCode
    );

    return { success: true };
  };

  // Check-out guest with minibar charges & deposit deduction
  const checkOutGuest = (bookingId: string, damageFee: number = 0, minibarCharges: number = 0) => {
    const booking = bookings.find(b => b.id === bookingId);
    if (!booking) return { success: false, error: 'ไม่พบข้อมูลการจอง' };

    const nowFormatted = new Date().toLocaleString('th-TH');
    const totalDeductions = damageFee + minibarCharges;
    const initialDeposit = booking.depositAmount || 1000;
    const netDepositRefund = Math.max(0, initialDeposit - totalDeductions);

    setBookings(prev =>
      prev.map(b =>
        b.id === bookingId
          ? {
              ...b,
              status: 'CHECKED_OUT',
              minibarCharges,
              depositStatus: totalDeductions > 0 ? 'DEDUCTED' : 'REFUNDED',
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

    sendNotification(
      'SMS',
      booking.guestPhone,
      `เช็คเอาท์และคืนเงินมัดจำสำเร็จ (${booking.bookingCode})`,
      `The Haven: เช็คเอาท์ห้อง ${booking.roomNumber} เรียบร้อย คืนมัดจำสุทธิ ฿${netDepositRefund.toLocaleString()} ขอบคุณที่ใช้บริการครับ`,
      booking.bookingCode
    );

    sendNotification(
      'EMAIL',
      booking.guestEmail,
      `Folio Invoice & Check-out Statement (${booking.bookingCode})`,
      `เรียน คุณ${booking.guestName} ใบเสร็จสรุปค่าใช้จ่าย: มินิบาร์ ฿${minibarCharges.toLocaleString()} ความเสียหาย ฿${damageFee.toLocaleString()} คืนมัดจำสุทธิ ฿${netDepositRefund.toLocaleString()}`,
      booking.bookingCode
    );

    return { success: true };
  };

  // Update room status
  const updateRoomStatus = (roomId: string, status: RoomStatus, maintenanceReason?: string) => {
    setRooms(prev =>
      prev.map(r => {
        if (r.id === roomId) {
          return {
            ...r,
            status,
            maintenanceReason: status === 'MAINTENANCE' ? maintenanceReason : undefined,
            currentBookingId: status === 'VACANT_CLEAN' || status === 'MAINTENANCE' ? undefined : r.currentBookingId
          };
        }
        return r;
      })
    );
  };

  // Reset all data
  const resetAllData = () => {
    localStorage.removeItem('resort_rooms_v3');
    localStorage.removeItem('resort_bookings_v3');
    localStorage.removeItem('resort_promos_v3');
    localStorage.removeItem('resort_maintenance_v3');
    localStorage.removeItem('resort_reviews_v3');
    localStorage.removeItem('resort_notifications_v3');
    setRooms(INITIAL_ROOMS);
    setBookings([]);
    setPromoCodes(INITIAL_PROMO_CODES);
    setMaintenanceIssues([]);
    setReviews(INITIAL_REVIEWS);
    setNotifications(INITIAL_NOTIFICATIONS);
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
    .reduce((sum, b) => sum + b.totalAmount + (b.minibarCharges || 0), 0);

  const totalRefunded = bookings
    .filter(b => b.status === 'CANCELLED' && b.refundAmount)
    .reduce((sum, b) => sum + (b.refundAmount || 0), 0);

  return (
    <ResortContext.Provider
      value={{
        language,
        setLanguage,
        rooms,
        bookings,
        addOns,
        promoCodes,
        maintenanceIssues,
        reviews,
        minibarItems,
        notifications,
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
        addReview,
        sendNotification,
        clearNotifications,
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
        isStaffAuthenticated,
        authenticateStaff,
        logoutStaff,
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
