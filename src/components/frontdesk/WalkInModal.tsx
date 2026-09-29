import React, { useState } from 'react';
import { useResort } from '../../context/ResortContext';
import { SelectedAddOn } from '../../types';
import { 
  UserCheck, X, CheckCircle, ShieldCheck, 
  CreditCard, Banknote, Plus, Minus 
} from 'lucide-react';

interface WalkInModalProps {
  onClose: () => void;
  preselectedRoomId?: string;
}

export const WalkInModal: React.FC<WalkInModalProps> = ({ onClose, preselectedRoomId }) => {
  const { rooms, addOns, createWalkInBooking } = useResort();

  // Find available clean rooms
  const cleanRooms = rooms.filter(r => r.status === 'VACANT_CLEAN');

  const [selectedRoomId, setSelectedRoomId] = useState<string>(
    preselectedRoomId || (cleanRooms.length > 0 ? cleanRooms[0].id : '')
  );

  const todayStr = new Date().toISOString().split('T')[0];
  const tomorrowStr = new Date(Date.now() + 86400000).toISOString().split('T')[0];

  const [checkInDate, setCheckInDate] = useState<string>(todayStr);
  const [checkOutDate, setCheckOutDate] = useState<string>(tomorrowStr);
  const [guestsCount, setGuestsCount] = useState<number>(2);

  // Guest details
  const [guestName, setGuestName] = useState('');
  const [guestPhone, setGuestPhone] = useState('');
  const [guestEmail, setGuestEmail] = useState('');
  const [guestIdCard, setGuestIdCard] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<'PROMPTPAY_QR' | 'CREDIT_CARD' | 'CASH'>('CASH');
  const depositAmount = 1000;
  const specialRequests = 'ลูกค้า Walk-in หน้าเคาน์เตอร์';

  // Add-ons
  const [selectedAddOns, setSelectedAddOns] = useState<Record<string, number>>({});

  const activeRoom = rooms.find(r => r.id === selectedRoomId);

  // Calculate pricing
  const nights = Math.max(1, Math.ceil((new Date(checkOutDate).getTime() - new Date(checkInDate).getTime()) / (1000 * 60 * 60 * 24)));
  const roomPriceTotal = activeRoom ? activeRoom.basePrice * nights : 0;
  const addOnsTotal = Object.entries(selectedAddOns).reduce((sum, [id, qty]) => {
    const item = addOns.find(a => a.id === id);
    return sum + (item ? item.price * qty : 0);
  }, 0);
  const grandTotal = roomPriceTotal + addOnsTotal;

  const handleAddOnQty = (id: string, delta: number) => {
    setSelectedAddOns(prev => {
      const current = prev[id] || 0;
      const next = Math.max(0, current + delta);
      if (next === 0) {
        const copy = { ...prev };
        delete copy[id];
        return copy;
      }
      return { ...prev, [id]: next };
    });
  };

  const handleConfirmWalkIn = () => {
    if (!selectedRoomId) {
      alert('กรุณาเลือกห้องพัก');
      return;
    }
    if (!guestName || !guestPhone) {
      alert('กรุณากรอกชื่อและเบอร์โทรศัพท์ผู้เข้าพัก');
      return;
    }

    const formattedAddons: SelectedAddOn[] = Object.entries(selectedAddOns).map(([id, qty]) => {
      const a = addOns.find(item => item.id === id)!;
      return {
        addOnId: a.id,
        name: a.name,
        price: a.price,
        quantity: qty
      };
    });

    const res = createWalkInBooking({
      roomId: selectedRoomId,
      checkInDate,
      checkOutDate,
      guestsCount,
      guestName,
      guestPhone,
      guestEmail: guestEmail || `${guestPhone}@walkin.local`,
      guestIdCard,
      selectedAddOns: formattedAddons,
      depositAmount,
      paymentMethod,
      specialRequests
    });

    if (res.success && res.booking) {
      alert(`ทำรายการ Walk-in และเช็คอินสำเร็จ!\nหมายเลขการจอง: ${res.booking.bookingCode}\nห้องพัก: ${res.booking.roomNumber}\nเก็บค่าห้องและเงินมัดจำเรียบร้อย`);
      onClose();
    } else {
      alert(res.error || 'ไม่สามารถทำรายการได้');
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4">
      <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 max-w-xl w-full overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="bg-slate-900 text-white px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <UserCheck className="w-5 h-5 text-teal-400" />
            <h3 className="text-base font-bold text-white">
              รับลูกค้า Walk-in (New Walk-in Check-in)
            </h3>
          </div>
          <button onClick={onClose} className="p-1.5 text-slate-400 hover:text-white rounded-full">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 max-h-[75vh] overflow-y-auto space-y-4">
          
          {/* Room Selector */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              เลือกห้องพักว่างพร้อมให้บริการ (Vacant Clean Rooms) *
            </label>
            {cleanRooms.length === 0 ? (
              <div className="p-3 bg-red-50 text-red-700 rounded-xl text-xs font-medium border border-red-200">
                ไม่มีห้องว่างและสะอาดในขณะนี้ (ทุกห้องมีแขกพักอยู่ หรือรอแม่บ้านทำความสะอาด)
              </div>
            ) : (
              <select
                value={selectedRoomId}
                onChange={(e) => setSelectedRoomId(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-bold text-slate-800 focus:ring-2 focus:ring-teal-500"
              >
                {cleanRooms.map(r => (
                  <option key={r.id} value={r.id}>
                    {r.roomNumber} - {r.name} ({r.typeName}) • ฿{r.basePrice.toLocaleString()}/คืน
                  </option>
                ))}
              </select>
            )}
          </div>

          {/* Dates & Guests */}
          <div className="grid grid-cols-3 gap-2">
            <div>
              <label className="block text-[11px] font-semibold text-slate-600 mb-1">เช็คอิน</label>
              <input
                type="date"
                value={checkInDate}
                onChange={(e) => setCheckInDate(e.target.value)}
                className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-300 rounded-lg text-xs"
              />
            </div>
            <div>
              <label className="block text-[11px] font-semibold text-slate-600 mb-1">เช็คเอาท์</label>
              <input
                type="date"
                value={checkOutDate}
                onChange={(e) => setCheckOutDate(e.target.value)}
                className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-300 rounded-lg text-xs"
              />
            </div>
            <div>
              <label className="block text-[11px] font-semibold text-slate-600 mb-1">ผู้เข้าพัก</label>
              <select
                value={guestsCount}
                onChange={(e) => setGuestsCount(Number(e.target.value))}
                className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-300 rounded-lg text-xs"
              >
                <option value={1}>1 ท่าน</option>
                <option value={2}>2 ท่าน</option>
                <option value={3}>3 ท่าน</option>
                <option value={4}>4 ท่าน</option>
              </select>
            </div>
          </div>

          {/* Guest Info */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">ชื่อผู้เข้าพัก *</label>
              <input
                type="text"
                placeholder="คุณลูกค้า..."
                value={guestName}
                onChange={(e) => setGuestName(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">เบอร์โทรศัพท์ *</label>
              <input
                type="tel"
                placeholder="08X-XXX-XXXX"
                value={guestPhone}
                onChange={(e) => setGuestPhone(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">เลขบัตรประชาชน/พาสปอร์ต</label>
              <input
                type="text"
                placeholder="เลข 13 หลัก"
                value={guestIdCard}
                onChange={(e) => setGuestIdCard(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">อีเมล (ถ้ามี)</label>
              <input
                type="email"
                placeholder="guest@email.com"
                value={guestEmail}
                onChange={(e) => setGuestEmail(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs"
              />
            </div>
          </div>

          {/* Optional Add-ons */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              บริการเสริมหน้างาน (Add-ons)
            </label>
            <div className="space-y-1.5">
              {addOns.slice(0, 3).map(addon => {
                const qty = selectedAddOns[addon.id] || 0;
                return (
                  <div key={addon.id} className="flex items-center justify-between p-2 rounded-lg border border-slate-200 text-xs">
                    <span className="font-medium text-slate-800">{addon.name} (+฿{addon.price})</span>
                    <div className="flex items-center gap-1.5">
                      <button
                        type="button"
                        onClick={() => handleAddOnQty(addon.id, -1)}
                        className="w-5 h-5 rounded bg-slate-100 flex items-center justify-center text-slate-600"
                      >
                        <Minus className="w-3 h-3" />
                      </button>
                      <span className="w-4 text-center font-bold">{qty}</span>
                      <button
                        type="button"
                        onClick={() => handleAddOnQty(addon.id, 1)}
                        className="w-5 h-5 rounded bg-teal-50 text-teal-800 flex items-center justify-center"
                      >
                        <Plus className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Payment & Deposit (BR-04) */}
          <div className="p-3 bg-teal-50 border border-teal-200 rounded-xl space-y-2 text-xs">
            <div className="flex justify-between items-center text-teal-900 font-bold">
              <span>ค่าห้องพัก ({nights} คืน) + บริการเสริม:</span>
              <span className="text-sm font-black">฿{grandTotal.toLocaleString()}</span>
            </div>
            <div className="flex justify-between items-center text-teal-900 font-bold pt-1 border-t border-teal-200">
              <span className="flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5 text-teal-600" />
                มัดจำความเสียหาย (BR-04 คืนตอนเช็คเอาท์):
              </span>
              <span className="text-sm font-black">฿{depositAmount.toLocaleString()}</span>
            </div>
            <div className="flex justify-between items-center text-teal-950 font-black text-sm pt-1 border-t border-teal-300">
              <span>ยอดเรียกเก็บทั้งหมดหน้าเคาน์เตอร์:</span>
              <span className="text-base text-teal-800 font-black">
                ฿{(grandTotal + depositAmount).toLocaleString()}
              </span>
            </div>

            {/* Payment method selector */}
            <div className="grid grid-cols-3 gap-1.5 pt-2">
              <button
                type="button"
                onClick={() => setPaymentMethod('CASH')}
                className={`py-1.5 px-2 rounded-lg border text-center font-semibold text-[11px] flex items-center justify-center gap-1 ${
                  paymentMethod === 'CASH' ? 'bg-teal-700 text-white border-teal-700' : 'bg-white text-slate-700'
                }`}
              >
                <Banknote className="w-3.5 h-3.5" /> เงินสด
              </button>
              <button
                type="button"
                onClick={() => setPaymentMethod('PROMPTPAY_QR')}
                className={`py-1.5 px-2 rounded-lg border text-center font-semibold text-[11px] ${
                  paymentMethod === 'PROMPTPAY_QR' ? 'bg-teal-700 text-white border-teal-700' : 'bg-white text-slate-700'
                }`}
              >
                QR โอนเงิน
              </button>
              <button
                type="button"
                onClick={() => setPaymentMethod('CREDIT_CARD')}
                className={`py-1.5 px-2 rounded-lg border text-center font-semibold text-[11px] flex items-center justify-center gap-1 ${
                  paymentMethod === 'CREDIT_CARD' ? 'bg-teal-700 text-white border-teal-700' : 'bg-white text-slate-700'
                }`}
              >
                <CreditCard className="w-3.5 h-3.5" /> บัตรเครดิต
              </button>
            </div>
          </div>

          {/* Action buttons */}
          <div className="pt-2 border-t border-slate-100 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
            >
              ยกเลิก
            </button>
            <button
              type="button"
              disabled={!activeRoom}
              onClick={handleConfirmWalkIn}
              className="px-5 py-2 bg-teal-700 hover:bg-teal-800 disabled:opacity-40 text-white text-xs sm:text-sm font-bold rounded-xl shadow-md inline-flex items-center gap-1.5"
            >
              <CheckCircle className="w-4 h-4" />
              <span>ยืนยันรับเข้าพักทันที</span>
            </button>
          </div>

        </div>

      </div>
    </div>
  );
};
