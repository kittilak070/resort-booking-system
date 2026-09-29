import React, { useState } from 'react';
import { useResort } from '../../context/ResortContext';
import { X, CheckCircle, LogOut, Wine, Plus, Minus, AlertTriangle } from 'lucide-react';

interface CheckOutModalProps {
  onClose: () => void;
  bookingId: string;
}

export const CheckOutModal: React.FC<CheckOutModalProps> = ({ onClose, bookingId }) => {
  const { bookings, checkOutGuest, minibarItems, language } = useResort();
  const isEn = language === 'en';

  const booking = bookings.find(b => b.id === bookingId);

  // Damage state
  const [hasDamage, setHasDamage] = useState<boolean>(false);
  const [damageFee, setDamageFee] = useState<number>(0);
  const [damageReason, setDamageReason] = useState<string>('ผ้าเช็ดตัวเปื้อนหมึก / ชำรุด');

  // Minibar consumption tracking: { [itemId: string]: quantity }
  const [minibarQuantities, setMinibarQuantities] = useState<Record<string, number>>({});

  if (!booking) return null;

  const updateItemQty = (id: string, delta: number) => {
    setMinibarQuantities(prev => {
      const current = prev[id] || 0;
      const next = Math.max(0, current + delta);
      return { ...prev, [id]: next };
    });
  };

  // Calculate minibar total
  const minibarTotal = minibarItems.reduce((sum, item) => {
    const qty = minibarQuantities[item.id] || 0;
    return sum + item.price * qty;
  }, 0);

  const totalDeductions = (hasDamage ? damageFee : 0) + minibarTotal;
  const initialDeposit = booking.depositAmount || 1000;
  const depositRefundAmount = Math.max(0, initialDeposit - totalDeductions);
  const extraCharge = totalDeductions > initialDeposit ? totalDeductions - initialDeposit : 0;

  const handleCheckOut = () => {
    const res = checkOutGuest(booking.id, hasDamage ? damageFee : 0, minibarTotal);
    if (res.success) {
      alert(
        isEn
          ? `Check-out completed for ${booking.roomNumber}! Room status set to Vacant Dirty for Housekeeping.`
          : `ทำรายการเช็คเอาท์ห้อง ${booking.roomNumber} เรียบร้อย! ระบบได้แจ้งเตือนแม่บ้าน (สถานะห้องเปลี่ยนเป็น Vacant Dirty) และส่งสรุปใบเสร็จทาง SMS/Email แล้ว`
      );
      onClose();
    } else {
      alert(res.error || (isEn ? 'Failed to check out' : 'เกิดข้อผิดพลาดในการเช็คเอาท์'));
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4">
      <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 max-w-lg w-full overflow-hidden animate-in fade-in zoom-in-95 duration-200 flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="bg-slate-900 text-white px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <LogOut className="w-5 h-5 text-teal-400" />
            <h3 className="text-base font-bold text-white">
              {isEn ? 'Front Desk Check-out & Folio Settlement' : 'ทำรายการเช็คเอาท์ & สรุปบิลมินิบาร์ (Check-out)'}
            </h3>
          </div>
          <button onClick={onClose} className="p-1.5 text-slate-400 hover:text-white rounded-full">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto space-y-4 flex-1">
          
          {/* Booking Summary */}
          <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 text-xs space-y-2">
            <div className="flex justify-between">
              <span className="text-slate-500">{isEn ? 'Booking Code:' : 'รหัสจอง:'}</span>
              <span className="font-bold text-teal-800">{booking.bookingCode}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">{isEn ? 'Guest Name:' : 'ผู้เข้าพัก:'}</span>
              <span className="font-bold text-slate-800">{booking.guestName}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">{isEn ? 'Room:' : 'ห้องพัก:'}</span>
              <span className="font-bold text-slate-800">{booking.roomName} ({booking.roomNumber})</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">{isEn ? 'Check-in Time:' : 'เวลาเช็คอิน:'}</span>
              <span className="font-semibold text-slate-700">{booking.checkInTime || '-'}</span>
            </div>
          </div>

          {/* Itemized Minibar Billing Checklist */}
          <div className="p-4 bg-amber-50/60 border border-amber-200 rounded-2xl space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Wine className="w-4 h-4 text-amber-700" />
                <span className="text-xs font-bold text-amber-950">
                  {isEn ? 'Itemized Minibar Checklist' : 'รายการตรวจสอบมินิบาร์ & ขนมเครื่องดื่ม'}
                </span>
              </div>
              <span className="text-xs font-black text-amber-800">
                ฿{minibarTotal.toLocaleString()}
              </span>
            </div>

            <div className="space-y-1.5 pt-1 divide-y divide-amber-200/50">
              {minibarItems.map((item) => {
                const qty = minibarQuantities[item.id] || 0;
                return (
                  <div key={item.id} className="pt-1.5 flex items-center justify-between text-xs">
                    <div className="pr-2">
                      <div className="font-semibold text-slate-800">
                        {isEn ? item.nameEn : item.name}
                      </div>
                      <div className="text-[10px] text-slate-500">
                        ฿{item.price} / {item.unit}
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <button
                        type="button"
                        onClick={() => updateItemQty(item.id, -1)}
                        disabled={qty <= 0}
                        className={`w-6 h-6 rounded-md flex items-center justify-center font-bold text-xs ${
                          qty > 0
                            ? 'bg-amber-200 text-amber-900 hover:bg-amber-300'
                            : 'bg-slate-100 text-slate-300 cursor-not-allowed'
                        }`}
                      >
                        <Minus className="w-3 h-3" />
                      </button>

                      <span className={`w-5 text-center font-bold ${qty > 0 ? 'text-amber-900' : 'text-slate-400'}`}>
                        {qty}
                      </span>

                      <button
                        type="button"
                        onClick={() => updateItemQty(item.id, 1)}
                        className="w-6 h-6 bg-amber-200 hover:bg-amber-300 text-amber-900 rounded-md flex items-center justify-center font-bold text-xs"
                      >
                        <Plus className="w-3 h-3" />
                      </button>

                      <span className="text-[11px] font-bold text-slate-700 w-14 text-right">
                        ฿{(qty * item.price).toLocaleString()}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Property Damage Assessment */}
          <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl space-y-2">
            <label className="flex items-center gap-2 cursor-pointer text-xs font-semibold text-slate-700">
              <input
                type="checkbox"
                checked={hasDamage}
                onChange={(e) => setHasDamage(e.target.checked)}
                className="rounded text-teal-600 focus:ring-teal-500 w-4 h-4"
              />
              <span>{isEn ? 'Report room property damage or broken items' : 'พบความเสียหายของทรัพย์สินในห้องพัก'}</span>
            </label>

            {hasDamage && (
              <div className="mt-2 grid grid-cols-2 gap-2 pt-2 border-t border-slate-200">
                <div>
                  <label className="block text-[11px] text-slate-500 mb-1">
                    {isEn ? 'Damage Fee (THB)' : 'ค่าเสียหาย (บาท)'}
                  </label>
                  <input
                    type="number"
                    value={damageFee}
                    onChange={(e) => setDamageFee(Number(e.target.value))}
                    className="w-full px-2.5 py-1.5 bg-white border border-slate-300 rounded-lg text-xs font-bold"
                  />
                </div>
                <div>
                  <label className="block text-[11px] text-slate-500 mb-1">
                    {isEn ? 'Reason' : 'สาเหตุ/รายละเอียด'}
                  </label>
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

          {/* Security Deposit Settlement & Folio Summary */}
          <div className="p-4 bg-teal-50/80 border border-teal-200 rounded-2xl space-y-2.5 text-xs">
            <div className="flex justify-between text-teal-900 font-semibold">
              <span>{isEn ? 'Security Deposit Held:' : 'เงินมัดจำความเสียหายที่ถือไว้:'}</span>
              <span className="font-bold">฿{initialDeposit.toLocaleString()}</span>
            </div>

            {minibarTotal > 0 && (
              <div className="flex justify-between text-amber-800">
                <span>{isEn ? 'Less: Minibar Charges' : 'หัก: ค่ามินิบาร์'}</span>
                <span>-฿{minibarTotal.toLocaleString()}</span>
              </div>
            )}

            {hasDamage && damageFee > 0 && (
              <div className="flex justify-between text-red-700">
                <span>{isEn ? 'Less: Property Damage' : 'หัก: ค่าเสียหายทรัพย์สิน'}</span>
                <span>-฿{damageFee.toLocaleString()}</span>
              </div>
            )}

            <div className="pt-2 border-t border-teal-200 flex items-center justify-between">
              <span className="font-bold text-teal-950">
                {isEn ? 'Net Deposit to Refund Guest:' : 'ยอดเงินมัดจำคืนลูกค้าสุทธิ:'}
              </span>
              <span className="text-base font-black text-emerald-700">
                ฿{depositRefundAmount.toLocaleString()}
              </span>
            </div>

            {extraCharge > 0 && (
              <div className="p-2 bg-red-100 border border-red-300 rounded-xl text-red-800 flex items-center gap-1.5 font-bold">
                <AlertTriangle className="w-4 h-4 shrink-0 text-red-600" />
                <span>
                  {isEn
                    ? `Extra payment required from guest: ฿${extraCharge.toLocaleString()}`
                    : `ยอดหักเกินมัดจำ! ต้องเรียกเก็บเงินเพิ่มจากลูกค้า: ฿${extraCharge.toLocaleString()}`}
                </span>
              </div>
            )}
          </div>

          <div className="text-[11px] text-slate-500 bg-slate-100 p-3 rounded-xl leading-relaxed">
            💡 <strong>{isEn ? 'Automated Outcome:' : 'ผลลัพธ์อัตโนมัติ:'}</strong>{' '}
            {isEn
              ? 'Clicking confirm will set the room to "Vacant Dirty" for Housekeeping and dispatch an itemized receipt via SMS & Email.'
              : 'เมื่อกดยืนยัน ระบบจะปรับสถานะห้องเป็น "Vacant Dirty" ส่งต่องานทำความสะอาดให้แม่บ้าน พร้อมส่งใบเสร็จและสรุปเงินมัดจำทาง SMS และ Email ให้ลูกค้าทันที'}
          </div>

        </div>

        {/* Footer Actions */}
        <div className="p-4 bg-slate-50 border-t border-slate-100 flex items-center justify-end gap-2">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-200 rounded-xl"
          >
            {isEn ? 'Cancel' : 'ยกเลิก'}
          </button>
          <button
            type="button"
            onClick={handleCheckOut}
            className="px-5 py-2.5 bg-slate-900 hover:bg-slate-800 text-white text-xs sm:text-sm font-bold rounded-xl shadow-md inline-flex items-center gap-1.5"
          >
            <CheckCircle className="w-4 h-4 text-emerald-400" />
            <span>{isEn ? 'Confirm Check-out & Refund' : 'ยืนยันการเช็คเอาท์ & คืนมัดจำ'}</span>
          </button>
        </div>

      </div>
    </div>
  );
};
