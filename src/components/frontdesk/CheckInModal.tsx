import React, { useState } from 'react';
import { useResort } from '../../context/ResortContext';
import { maskPhone, maskIdCard } from '../../utils/security';
import { X, CheckCircle, ShieldCheck, CreditCard, Key } from 'lucide-react';

interface CheckInModalProps {
  onClose: () => void;
  preselectedBookingId?: string;
}

export const CheckInModal: React.FC<CheckInModalProps> = ({ onClose, preselectedBookingId }) => {
  const { bookings, checkInGuest } = useResort();

  // Find eligible bookings (CONFIRMED)
  const eligibleBookings = bookings.filter(b => b.status === 'CONFIRMED');

  const [selectedBookingId, setSelectedBookingId] = useState<string>(
    preselectedBookingId || (eligibleBookings.length > 0 ? eligibleBookings[0].id : '')
  );

  const [depositAmount] = useState<number>(1000);
  const [depositMethod, setDepositMethod] = useState<'CASH' | 'CARD_HOLD'>('CASH');
  const [keycardNumber, setKeycardNumber] = useState<string>('KC-08');

  const activeBooking = bookings.find(b => b.id === selectedBookingId);

  const handleCheckIn = () => {
    if (!selectedBookingId) {
      alert('กรุณาเลือกรายการจองที่ต้องการเช็คอิน');
      return;
    }

    const res = checkInGuest(selectedBookingId, depositAmount);
    if (res.success) {
      alert(`เช็คอินสำเร็จ! มอบกุญแจ/คีย์การ์ดหมายเลข ${keycardNumber} ให้แก่ผู้เข้าพักเรียบร้อย`);
      onClose();
    } else {
      alert(res.error || 'ไม่สามารถทำรายการเช็คอินได้');
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4">
      <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 max-w-lg w-full overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="bg-slate-900 text-white px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Key className="w-5 h-5 text-teal-400" />
            <h3 className="text-base font-bold text-white">
              ทำรายการเช็คอิน (Front Desk Check-in)
            </h3>
          </div>
          <button onClick={onClose} className="p-1.5 text-slate-400 hover:text-white rounded-full">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4">
          
          {/* Select Booking */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              เลือกรายการจองที่ได้รับการยืนยัน (Confirmed Bookings)
            </label>
            {eligibleBookings.length === 0 ? (
              <div className="p-4 bg-amber-50 border border-amber-200 text-amber-800 rounded-xl text-xs">
                ยังไม่มีรายการจองที่พร้อมเช็คอินในขณะนี้ (คุณสามารถลองจองห้องพักในมุมมองลูกค้าก่อนได้ครับ)
              </div>
            ) : (
              <select
                value={selectedBookingId}
                onChange={(e) => setSelectedBookingId(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm font-medium focus:ring-2 focus:ring-teal-500 focus:bg-white"
              >
                {eligibleBookings.map(b => (
                  <option key={b.id} value={b.id}>
                    [{b.bookingCode}] {b.guestName} - {b.roomNumber} ({b.checkInDate})
                  </option>
                ))}
              </select>
            )}
          </div>

          {activeBooking && (
            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 text-xs space-y-2">
              <div className="flex justify-between">
                <span className="text-slate-500">รหัสจอง:</span>
                <span className="font-bold text-teal-800">{activeBooking.bookingCode}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">ผู้เข้าพัก:</span>
                <span className="font-bold text-slate-800">{activeBooking.guestName}</span>
              </div>
              <div className="flex justify-between font-mono text-[11px]">
                <span className="text-slate-500 font-sans">เบอร์ติดต่อ / บัตร ปชช.:</span>
                <span className="text-slate-700">{maskPhone(activeBooking.guestPhone)} | {maskIdCard(activeBooking.guestIdCard)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">ห้องพัก:</span>
                <span className="font-bold text-slate-800">{activeBooking.roomName} ({activeBooking.roomNumber})</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">กำหนดการเข้าพัก:</span>
                <span className="font-semibold text-slate-700">{activeBooking.checkInDate} - {activeBooking.checkOutDate}</span>
              </div>
              {activeBooking.specialRequests && (
                <div className="pt-2 border-t border-slate-200 text-[11px] text-slate-600">
                  <span className="font-bold">คำขอพิเศษ:</span> {activeBooking.specialRequests}
                </div>
              )}
            </div>
          )}

          {/* Security Deposit Section (BR-04) */}
          <div className="p-4 bg-teal-50/70 border border-teal-200 rounded-2xl space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-teal-900 flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-teal-600" />
                เก็บเงินมัดจำความเสียหาย (Security Deposit - BR-04)
              </span>
              <span className="text-sm font-black text-teal-900">
                ฿{depositAmount.toLocaleString()}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-2 text-xs">
              <button
                type="button"
                onClick={() => setDepositMethod('CASH')}
                className={`p-2 rounded-lg border text-center font-medium ${
                  depositMethod === 'CASH'
                    ? 'border-teal-500 bg-white shadow-sm text-teal-900 font-bold'
                    : 'border-slate-200 text-slate-600'
                }`}
              >
                💵 เงินสด (Cash)
              </button>
              <button
                type="button"
                onClick={() => setDepositMethod('CARD_HOLD')}
                className={`p-2 rounded-lg border text-center font-medium flex items-center justify-center gap-1 ${
                  depositMethod === 'CARD_HOLD'
                    ? 'border-teal-500 bg-white shadow-sm text-teal-900 font-bold'
                    : 'border-slate-200 text-slate-600'
                }`}
              >
                <CreditCard className="w-3.5 h-3.5" />
                <span>การันตีบัตร</span>
              </button>
            </div>
          </div>

          {/* Keycard assignment */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              หมายเลขคีย์การ์ด / กุญแจห้อง
            </label>
            <input
              type="text"
              value={keycardNumber}
              onChange={(e) => setKeycardNumber(e.target.value)}
              className="w-full px-3.5 py-2 bg-slate-50 border border-slate-300 rounded-xl text-sm font-semibold text-slate-800"
            />
          </div>

          {/* Action */}
          <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
            >
              ยกเลิก
            </button>
            <button
              type="button"
              disabled={!activeBooking}
              onClick={handleCheckIn}
              className="px-5 py-2 bg-teal-700 hover:bg-teal-800 disabled:opacity-40 disabled:cursor-not-allowed text-white text-xs sm:text-sm font-bold rounded-xl shadow-md inline-flex items-center gap-1.5"
            >
              <CheckCircle className="w-4 h-4" />
              <span>ยืนยันการเช็คอิน</span>
            </button>
          </div>

        </div>

      </div>
    </div>
  );
};
