import React, { createContext, useContext, useState, useEffect } from 'react';
import { Room, Booking, AddOn, UserRole, RoomStatus, SelectedAddOn } from '../types';
import { INITIAL_ROOMS, INITIAL_ADDONS } from '../data/mockRooms';

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
  paymentMethod: 'PROMPTPAY_QR' | 'CREDIT_CARD';
}

interface ResortContextType {
  rooms: Room[];
  bookings: Booking[];
  addOns: AddOn[];
  activeRole: UserRole;
  setActiveRole: (role: UserRole) => void;
  createBooking: (params: BookingParams) => { success: boolean; booking?: Booking; error?: string };
  confirmPayment: (bookingId: string) => void;
  cancelBooking: (bookingId: string) => void;
  checkInGuest: (bookingId: string, depositAmount: number) => { success: boolean; error?: string };
  checkOutGuest: (bookingId: string, damageFee?: number) => { success: boolean; error?: string };
  updateRoomStatus: (roomId: string, status: RoomStatus) => void;
  stats: {
    totalRooms: number;
    occupiedRooms: number;
    cleanRooms: number;
    dirtyRooms: number;
    cleaningRooms: number;
    occupancyRate: number;
    totalRevenue: number;
  };
  resetAllData: () => void;
}

const ResortContext = createContext<ResortContextType | undefined>(undefined);

export const ResortProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [activeRole, setActiveRole] = useState<UserRole>('GUEST');

  // Load from localStorage or initial
  const [rooms, setRooms] = useState<Room[]>(() => {
    const saved = localStorage.getItem('resort_rooms_v1');
    return saved ? JSON.parse(saved) : INITIAL_ROOMS;
  });

  const [bookings, setBookings] = useState<Booking[]>(() => {
    const saved = localStorage.getItem('resort_bookings_v1');
    if (saved) return JSON.parse(saved);
    // Initial dummy confirmed booking for demo
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

  const [addOns] = useState<AddOn[]>(INITIAL_ADDONS);

  // Sync to LocalStorage
  useEffect(() => {
    localStorage.setItem('resort_rooms_v1', JSON.stringify(rooms));
  }, [rooms]);

  useEffect(() => {
    localStorage.setItem('resort_bookings_v1', JSON.stringify(bookings));
  }, [bookings]);

  // BR-01: Auto check & expire unconfirmed bookings after 15 minutes hold
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
    }, 10000); // Check every 10s

    return () => clearInterval(interval);
  }, []);

  // Create booking
  const createBooking = (params: BookingParams) => {
    const room = rooms.find(r => r.id === params.roomId);
    if (!room) {
      return { success: false, error: 'ไม่พบห้องพักที่เลือก' };
    }

    // Check if room is available
    if (room.status === 'MAINTENANCE') {
      return { success: false, error: 'ห้องพักนี้ปิดปรับปรุงชั่วคราว' };
    }

    const checkIn = new Date(params.checkInDate);
    const checkOut = new Date(params.checkOutDate);
    const diffTime = checkOut.getTime() - checkIn.getTime();
    const nights = Math.max(1, Math.ceil(diffTime / (1000 * 60 * 60 * 24)));

    // Calculate room price (simple weekend check)
    const isWeekend = checkIn.getDay() === 5 || checkIn.getDay() === 6;
    const nightlyPrice = isWeekend ? room.weekendPrice : room.basePrice;
    const roomPrice = nightlyPrice * nights;

    const addOnTotal = params.selectedAddOns.reduce((sum, item) => sum + item.price * item.quantity, 0);
    const totalAmount = roomPrice + addOnTotal;

    const codeSuffix = Math.floor(10000 + Math.random() * 90000);
    const bookingCode = `HVR-${codeSuffix}`;
    const now = new Date();
    const expiresAt = new Date(now.getTime() + 15 * 60 * 1000).toISOString(); // 15 minutes hold

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
      discountAmount: 0,
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

  // Confirm payment
  const confirmPayment = (bookingId: string) => {
    setBookings(prev =>
      prev.map(bkg => {
        if (bkg.id === bookingId) {
          return {
            ...bkg,
            status: 'CONFIRMED'
          };
        }
        return bkg;
      })
    );
  };

  // Cancel booking
  const cancelBooking = (bookingId: string) => {
    setBookings(prev =>
      prev.map(bkg => (bkg.id === bookingId ? { ...bkg, status: 'CANCELLED' } : bkg))
    );
  };

  // Check-in guest
  const checkInGuest = (bookingId: string, depositAmount: number) => {
    const booking = bookings.find(b => b.id === bookingId);
    if (!booking) return { success: false, error: 'ไม่พบข้อมูลการจอง' };

    const room = rooms.find(r => r.id === booking.roomId);
    if (!room) return { success: false, error: 'ไม่พบห้องพัก' };

    if (room.status === 'OCCUPIED') {
      return { success: false, error: 'ห้องนี้มีผู้เข้าพักอยู่แล้ว' };
    }

    if (room.status === 'VACANT_DIRTY' || room.status === 'CLEANING') {
      return { success: false, error: 'ห้องพักยังทำความสะอาดไม่เสร็จ' };
    }

    const nowFormatted = new Date().toLocaleString('th-TH');

    // Update Booking
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

    // Update Room to OCCUPIED
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

    // Update booking
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

    // Automatically set room to VACANT_DIRTY for Housekeeping
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
  const updateRoomStatus = (roomId: string, status: RoomStatus) => {
    setRooms(prev =>
      prev.map(r => (r.id === roomId ? { ...r, status } : r))
    );
  };

  // Reset to initial
  const resetAllData = () => {
    localStorage.removeItem('resort_rooms_v1');
    localStorage.removeItem('resort_bookings_v1');
    setRooms(INITIAL_ROOMS);
    setBookings([]);
  };

  // Compute stats
  const totalRooms = rooms.length;
  const occupiedRooms = rooms.filter(r => r.status === 'OCCUPIED').length;
  const cleanRooms = rooms.filter(r => r.status === 'VACANT_CLEAN').length;
  const dirtyRooms = rooms.filter(r => r.status === 'VACANT_DIRTY').length;
  const cleaningRooms = rooms.filter(r => r.status === 'CLEANING').length;
  const occupancyRate = totalRooms > 0 ? Math.round((occupiedRooms / totalRooms) * 100) : 0;
  
  const totalRevenue = bookings
    .filter(b => b.status === 'CONFIRMED' || b.status === 'CHECKED_IN' || b.status === 'CHECKED_OUT')
    .reduce((sum, b) => sum + b.totalAmount, 0);

  return (
    <ResortContext.Provider
      value={{
        rooms,
        bookings,
        addOns,
        activeRole,
        setActiveRole,
        createBooking,
        confirmPayment,
        cancelBooking,
        checkInGuest,
        checkOutGuest,
        updateRoomStatus,
        stats: {
          totalRooms,
          occupiedRooms,
          cleanRooms,
          dirtyRooms,
          cleaningRooms,
          occupancyRate,
          totalRevenue
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
