import React, { useState } from 'react';
import { useResort } from '../../context/ResortContext';
import { X, CheckCircle, LogOut } from 'lucide-react';

interface CheckOutModalProps {
  onClose: () => void;
  bookingId: string;
}

export const CheckOutModal: React.FC<CheckOutModalProps> = ({ onClose, bookingId }) => {
  const { bookings, checkOutGuest } = useResort();

  const booking = bookings.find(b => b.id === bookingId);

  const [hasDamage, setHasDamage] = useState<boolean>(false);
  const [damageFee, setDamageFee] = useState<number>(0);
  const [damageReason, setDamageReason] = useState<string>('ค่าเครื่องดื่มมินิบาร์');

  if (!booking) return null;

  const depositRefundAmount = Math.max(0, (booking.depositAmount || 1000) - (hasDamage ? damageFee : 0));

  const handleCheckOut = () => {
    const res = checkOutGuest(booking.id, hasDamage ? damageFee : 0);
    if (res.success) {
      alert(`ทำรายการเช็คเอาท์ห้อง ${booking.roomNumber} เรียบร้อย! ระบบได้แจ้งเตือนแม่บ้าน (สถานะห้องเปลี่ยนเป็น Vacant Dirty) แล้ว`);
      onClose();
    } else {
      alert(res.error || 'เกิดข้อผิดพลาดในการเช็คเอาท์');
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4">
      <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 max-w-lg w-full overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="bg-slate-900 text-white px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <LogOut className="w-5 h-5 text-teal-400" />
            <h3 className="text-base font-bold text-white">
              ทำรายการเช็คเอาท์ (Front Desk Check-out)
            </h3>
          </div>
          <button onClick={onClose} className="p-1.5 text-slate-400 hover:text-white rounded-full">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4">
          
          <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 text-xs space-y-2">
            <div className="flex justify-between">
              <span className="text-slate-500">รหัสจอง:</span>
              <span className="font-bold text-teal-800">{booking.bookingCode}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">ผู้เข้าพัก:</span>
              <span className="font-bold text-slate-800">{booking.guestName}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">ห้องพัก:</span>
              <span className="font-bold text-slate-800">{booking.roomName} ({booking.roomNumber})</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">เวลาเช็คอิน:</span>
              <span className="font-semibold text-slate-700">{booking.checkInTime || '-'}</span>
            </div>
          </div>

          {/* Inspection and Deposit Refund */}
          <div className="p-4 bg-teal-50/70 border border-teal-200 rounded-2xl space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-teal-900">
                เงินมัดจำความเสียหายที่ถือไว้ (Security Deposit)
              </span>
              <span className="text-sm font-black text-teal-900">
                ฿{(booking.depositAmount || 1000).toLocaleString()}
              </span>
            </div>

            {/* Damage toggle */}
            <div className="pt-2 border-t border-teal-200/60">
              <label className="flex items-center gap-2 cursor-pointer text-xs font-semibold text-slate-700">
                <input
                  type="checkbox"
                  checked={hasDamage}
                  onChange={(e) => setHasDamage(e.target.checked)}
                  className="rounded text-teal-600 focus:ring-teal-500 w-4 h-4"
                />
                <span>พบความเสียหาย หรือมีการใช้บริการมินิบาร์เพิ่มเติม</span>
              </label>

              {hasDamage && (
                <div className="mt-3 grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-[11px] text-slate-500 mb-1">จำนวนเงินที่หัก (บาท)</label>
                    <input
                      type="number"
                      value={damageFee}
                      onChange={(e) => setDamageFee(Number(e.target.value))}
                      className="w-full px-2.5 py-1.5 bg-white border border-slate-300 rounded-lg text-xs font-bold"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] text-slate-500 mb-1">เหตุผล</label>
                    <input
                      type="text"
                      value={damageReason}
                      onChange={(e) => setDamageReason(e.target.value)}
                      className="w-full px-2.5 py-1.5 bg-white border border-slate-300 rounded-lg text-xs"
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Net Refund Calculation */}
            <div className="pt-2 border-t border-teal-200/60 flex items-center justify-between text-xs">
              <span className="font-bold text-teal-900">ยอดเงินมัดจำคืนลูกค้าสุทธิ:</span>
              <span className="text-base font-extrabold text-emerald-700">
                ฿{depositRefundAmount.toLocaleString()}
              </span>
            </div>
          </div>

          <div className="text-[11px] text-slate-500 bg-slate-100 p-3 rounded-xl">
            💡 <strong>ผลลัพธ์อัตโนมัติ:</strong> เมื่อกดยืนยัน ระบบจะปรับสถานะห้องเป็น 
            <span className="text-amber-700 font-bold ml-1">"Vacant Dirty"</span> 
            เพื่อส่งงานต่อไปยังแผนกแม่บ้านทันที
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
              onClick={handleCheckOut}
              className="px-5 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs sm:text-sm font-bold rounded-xl shadow-md inline-flex items-center gap-1.5"
            >
              <CheckCircle className="w-4 h-4 text-emerald-400" />
              <span>ยืนยันการเช็คเอาท์ & คืนมัดจำ</span>
            </button>
          </div>

        </div>

      </div>
    </div>
  );
};
