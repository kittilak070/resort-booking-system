import React, { useState } from 'react';
import { useResort } from '../../context/ResortContext';
import { Booking } from '../../types';
import { 
  Search, X, AlertTriangle, Printer, 
  Calendar, User, Phone, Mail
} from 'lucide-react';

interface MyBookingLookupProps {
  onClose: () => void;
}

export const MyBookingLookup: React.FC<MyBookingLookupProps> = ({ onClose }) => {
  const { bookings, cancelBookingWithRefund } = useResort();

  const [bookingCode, setBookingCode] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [foundBooking, setFoundBooking] = useState<Booking | null>(null);
  const [hasSearched, setHasSearched] = useState(false);
  const [cancelReason, setCancelReason] = useState('ติดภารกิจด่วน');
  const [showCancelConfirm, setShowCancelConfirm] = useState(false);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setHasSearched(true);
    const code = bookingCode.trim().toUpperCase();
    const phone = phoneNumber.trim().replace(/-/g, '');

    const b = bookings.find(item => {
      const matchCode = item.bookingCode.toUpperCase() === code;
      const matchPhone = item.guestPhone.replace(/-/g, '').includes(phone);
      return matchCode && matchPhone;
    });

    setFoundBooking(b || null);
    setShowCancelConfirm(false);
  };

  const handleCancel = () => {
    if (!foundBooking) return;
    const res = cancelBookingWithRefund(foundBooking.id, cancelReason);
    if (res.success) {
      alert(`ยกเลิกคำสั่งจองเรียบร้อย!\n\n${res.policyNote}\nยอดเงินคืนสุทธิ: ฿${res.refundAmount.toLocaleString()}`);
      // Refresh current view
      const updated = bookings.find(b => b.id === foundBooking.id);
      setFoundBooking(updated || null);
      setShowCancelConfirm(false);
    } else {
      alert(res.error || 'ไม่สามารถยกเลิกคำสั่งจองได้');
    }
  };

  // Preview cancellation policy for this booking
  const getPolicyPreview = (b: Booking) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const checkIn = new Date(b.checkInDate);
    checkIn.setHours(0, 0, 0, 0);
    const diffDays = Math.ceil((checkIn.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));

    if (diffDays >= 7) {
      return { pct: 97, text: 'คืนเงิน 97% (หักค่าธรรมเนียมธุรกรรม 3%)', eligible: true };
    } else if (diffDays >= 3) {
      return { pct: 50, text: 'คืนเงิน 50% ของยอดรวมทั้งหมด', eligible: true };
    } else {
      return { pct: 0, text: 'ไม่สามารถขอคืนเงินได้ (น้อยกว่า 3 วันก่อนเข้าพัก)', eligible: false };
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4">
      <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 max-w-xl w-full overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="bg-slate-900 text-white px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Search className="w-5 h-5 text-teal-400" />
            <h3 className="text-base font-bold text-white">
              ค้นหาและจัดการการจอง (My Bookings)
            </h3>
          </div>
          <button onClick={onClose} className="p-1.5 text-slate-400 hover:text-white rounded-full">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Search Bar Form */}
        <div className="p-6">
          <form onSubmit={handleSearch} className="space-y-3 bg-slate-50 p-4 rounded-2xl border border-slate-200">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  หมายเลขการจอง (เช่น HVR-78219)
                </label>
                <input
                  type="text"
                  value={bookingCode}
                  onChange={(e) => setBookingCode(e.target.value)}
                  placeholder="HVR-XXXXX"
                  required
                  className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs uppercase font-bold text-slate-800 focus:ring-2 focus:ring-teal-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  เบอร์โทรศัพท์ที่ใช้จอง
                </label>
                <input
                  type="text"
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  placeholder="08X-XXX-XXXX"
                  required
                  className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs font-medium text-slate-800 focus:ring-2 focus:ring-teal-500"
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-2.5 bg-teal-700 hover:bg-teal-800 text-white text-xs font-bold rounded-xl shadow-sm flex items-center justify-center gap-1.5 transition-colors"
            >
              <Search className="w-4 h-4" />
              <span>ค้นหาข้อมูลการจอง</span>
            </button>
          </form>

          {/* Results Area */}
          {hasSearched && !foundBooking && (
            <div className="text-center py-8 text-slate-500 text-xs">
              ไม่พบข้อมูลการจองที่ตรงกับรหัสและเบอร์โทรที่ระบุ โปรดตรวจสอบความถูกต้องอีกครั้ง
            </div>
          )}

          {foundBooking && (
            <div className="mt-5 space-y-4 animate-in fade-in duration-200">
              {/* Booking Card */}
              <div className="p-5 rounded-2xl border border-slate-200 bg-white shadow-sm space-y-3">
                <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                  <div>
                    <span className="text-[11px] text-slate-400 block">หมายเลขการจอง</span>
                    <span className="text-base font-black text-teal-800 tracking-wider">
                      {foundBooking.bookingCode}
                    </span>
                  </div>
                  <div>
                    {foundBooking.status === 'CONFIRMED' && (
                      <span className="px-2.5 py-1 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-full font-bold text-xs">
                        ✓ ยืนยันแล้ว (รอเช็คอิน)
                      </span>
                    )}
                    {foundBooking.status === 'CHECKED_IN' && (
                      <span className="px-2.5 py-1 bg-blue-50 text-blue-700 border border-blue-200 rounded-full font-bold text-xs">
                        ● กำลังเข้าพัก
                      </span>
                    )}
                    {foundBooking.status === 'CANCELLED' && (
                      <span className="px-2.5 py-1 bg-red-50 text-red-700 border border-red-200 rounded-full font-bold text-xs">
                        ✕ ยกเลิกแล้ว
                      </span>
                    )}
                    {foundBooking.status === 'CHECKED_OUT' && (
                      <span className="px-2.5 py-1 bg-slate-100 text-slate-700 border border-slate-200 rounded-full font-bold text-xs">
                        เช็คเอาท์แล้ว
                      </span>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2 text-xs text-slate-600">
                  <div className="flex items-center gap-1.5">
                    <User className="w-3.5 h-3.5 text-teal-600" />
                    <span>{foundBooking.guestName}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Phone className="w-3.5 h-3.5 text-teal-600" />
                    <span>{foundBooking.guestPhone}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5 text-teal-600" />
                    <span>{foundBooking.checkInDate} ถึง {foundBooking.checkOutDate}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Mail className="w-3.5 h-3.5 text-teal-600" />
                    <span className="truncate">{foundBooking.guestEmail}</span>
                  </div>
                </div>

                <div className="p-3 bg-slate-50 rounded-xl text-xs space-y-1">
                  <div className="flex justify-between font-bold text-slate-800">
                    <span>ห้องพัก:</span>
                    <span>{foundBooking.roomNumber} - {foundBooking.roomName}</span>
                  </div>
                  <div className="flex justify-between text-slate-500">
                    <span>ยอดชำระสุทธิ:</span>
                    <span className="font-bold text-teal-800">฿{foundBooking.totalAmount.toLocaleString()}</span>
                  </div>
                  {foundBooking.appliedPromoCode && (
                    <div className="flex justify-between text-emerald-700">
                      <span>โค้ดส่วนลดที่ใช้:</span>
                      <span className="font-semibold">{foundBooking.appliedPromoCode} (-฿{foundBooking.discountAmount.toLocaleString()})</span>
                    </div>
                  )}
                  {foundBooking.refundAmount !== undefined && (
                    <div className="flex justify-between text-red-600 pt-1 border-t border-slate-200 font-bold">
                      <span>ยอดเงินคืน:</span>
                      <span>฿{foundBooking.refundAmount.toLocaleString()}</span>
                    </div>
                  )}
                </div>

                {/* Action buttons */}
                <div className="flex items-center gap-2 pt-2">
                  <button
                    onClick={() => window.print()}
                    className="flex-1 py-2 border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-semibold rounded-xl flex items-center justify-center gap-1.5"
                  >
                    <Printer className="w-3.5 h-3.5" />
                    <span>พิมพ์ใบยืนยัน</span>
                  </button>

                  {foundBooking.status === 'CONFIRMED' && !showCancelConfirm && (
                    <button
                      onClick={() => setShowCancelConfirm(true)}
                      className="px-4 py-2 border border-red-200 text-red-700 hover:bg-red-50 text-xs font-semibold rounded-xl"
                    >
                      ขอยกเลิกการจอง
                    </button>
                  )}
                </div>

                {/* Cancel Confirmation Sub-panel */}
                {showCancelConfirm && foundBooking.status === 'CONFIRMED' && (
                  <div className="p-4 bg-red-50/70 border border-red-200 rounded-2xl space-y-3 mt-3 animate-in fade-in">
                    <div className="flex items-start gap-2 text-xs text-red-800 font-semibold">
                      <AlertTriangle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
                      <div>
                        <span>เงื่อนไขการคืนเงินตามนโยบายรีสอร์ท (BR-03):</span>
                        <p className="text-[11px] font-normal text-red-700 mt-0.5">
                          {getPolicyPreview(foundBooking).text}
                        </p>
                      </div>
                    </div>

                    <div>
                      <label className="block text-[11px] font-medium text-slate-700 mb-1">
                        เหตุผลในการขอยกเลิก
                      </label>
                      <input
                        type="text"
                        value={cancelReason}
                        onChange={(e) => setCancelReason(e.target.value)}
                        className="w-full px-2.5 py-1.5 bg-white border border-red-200 rounded-lg text-xs"
                      />
                    </div>

                    <div className="flex items-center justify-end gap-2 pt-1">
                      <button
                        type="button"
                        onClick={() => setShowCancelConfirm(false)}
                        className="px-3 py-1.5 bg-white border border-slate-200 text-xs text-slate-600 rounded-lg"
                      >
                        ปิด
                      </button>
                      <button
                        type="button"
                        onClick={handleCancel}
                        className="px-4 py-1.5 bg-red-600 hover:bg-red-700 text-white text-xs font-bold rounded-lg shadow-sm"
                      >
                        ยืนยันขอยกเลิกและรับเงินคืน
                      </button>
                    </div>
                  </div>
                )}

              </div>
            </div>
          )}

        </div>

      </div>
    </div>
  );
};
