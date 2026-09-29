import React, { useState } from 'react';
import { useResort } from '../../context/ResortContext';
import { ChevronLeft, ChevronRight, User, AlertCircle, Wrench, Sparkles, Check, Info } from 'lucide-react';

export const MonthlyCalendarMatrix: React.FC = () => {
  const { rooms, bookings, language } = useResort();
  const isEn = language === 'en';

  const [startDateOffset, setStartDateOffset] = useState<number>(0);
  const [selectedCellInfo, setSelectedCellInfo] = useState<{
    roomNumber: string;
    roomName: string;
    date: string;
    bookingCode?: string;
    guestName?: string;
    status: string;
  } | null>(null);

  // Generate 14 days from (Today + startDateOffset)
  const daysCount = 14;
  const dates: { dateStr: string; dayName: string; formatted: string; isWeekend: boolean; isToday: boolean }[] = [];
  const baseDate = new Date();
  baseDate.setDate(baseDate.getDate() + startDateOffset);
  baseDate.setHours(0, 0, 0, 0);

  const todayStr = new Date().toISOString().split('T')[0];

  for (let i = 0; i < daysCount; i++) {
    const d = new Date(baseDate);
    d.setDate(d.getDate() + i);
    const dateStr = d.toISOString().split('T')[0];
    const dayOfWeek = d.getDay();
    const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;
    const isToday = dateStr === todayStr;

    const dayName = isEn
      ? d.toLocaleDateString('en-US', { weekday: 'short' })
      : ['อา.', 'จ.', 'อ.', 'พ.', 'พฤ.', 'ศ.', 'ส.'][dayOfWeek];

    const formatted = isEn
      ? d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
      : `${d.getDate()} ${['ม.ค.', 'ก.พ.', 'มี.ค.', 'เม.ย.', 'พ.ค.', 'มิ.ย.', 'ก.ค.', 'ส.ค.', 'ก.ย.', 'ต.ค.', 'พ.ย.', 'ธ.ค.'][d.getMonth()]}`;

    dates.push({ dateStr, dayName, formatted, isWeekend, isToday });
  }

  // Find booking for a given room on a given date
  const getRoomBookingForDate = (roomId: string, dateStr: string) => {
    return bookings.find(b => {
      if (b.roomId !== roomId) return false;
      if (b.status === 'CANCELLED') return false;
      // Check whether date is >= checkInDate and < checkOutDate
      return dateStr >= b.checkInDate && dateStr < b.checkOutDate;
    });
  };

  return (
    <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-200 space-y-5">
      
      {/* Header & Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
            <span>📅</span>
            <span>{isEn ? '14-Day Room Occupancy & Availability Matrix' : 'ตารางปฏิทินความพร้อมและการเข้าพัก 14 วัน'}</span>
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">
            {isEn
              ? 'Real-time timeline matrix showing reserved, occupied, and maintenance blocks across all villas'
              : 'มุมมองผังห้องพักแนวนอน แสดงการเข้าพัก การจองล่วงหน้า และสถานะซ่อมบำรุงแบบเรียลไทม์'}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setStartDateOffset(prev => prev - 7)}
            className="p-2 border border-slate-200 rounded-xl hover:bg-slate-100 text-slate-600 transition-colors"
            title={isEn ? 'Previous 7 days' : 'ย้อนหลัง 7 วัน'}
          >
            <ChevronLeft className="w-4 h-4" />
          </button>

          <button
            onClick={() => setStartDateOffset(0)}
            className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl transition-colors"
          >
            {isEn ? 'Today' : 'วันนี้'}
          </button>

          <button
            onClick={() => setStartDateOffset(prev => prev + 7)}
            className="p-2 border border-slate-200 rounded-xl hover:bg-slate-100 text-slate-600 transition-colors"
            title={isEn ? 'Next 7 days' : 'ถัดไป 7 วัน'}
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Legend */}
      <div className="flex flex-wrap items-center gap-3 text-xs bg-slate-50 p-3 rounded-2xl border border-slate-200 text-slate-600">
        <span className="font-bold text-slate-700">{isEn ? 'Legend:' : 'สัญลักษณ์:'}</span>
        <span className="flex items-center gap-1.5">
          <span className="w-3 h-3 rounded-full bg-emerald-500"></span>
          <span>{isEn ? 'Available' : 'ห้องว่าง (Available)'}</span>
        </span>
        <span className="flex items-center gap-1.5">
          <span className="w-3 h-3 rounded-full bg-blue-600"></span>
          <span>{isEn ? 'Occupied' : 'มีแขกพักอยู่ (Occupied)'}</span>
        </span>
        <span className="flex items-center gap-1.5">
          <span className="w-3 h-3 rounded-full bg-teal-600"></span>
          <span>{isEn ? 'Reserved' : 'จองแล้ว (Confirmed)'}</span>
        </span>
        <span className="flex items-center gap-1.5">
          <span className="w-3 h-3 rounded-full bg-amber-500"></span>
          <span>{isEn ? 'Pending Housekeeping' : 'รอทำความสะอาด (Dirty)'}</span>
        </span>
        <span className="flex items-center gap-1.5">
          <span className="w-3 h-3 rounded-full bg-red-500"></span>
          <span>{isEn ? 'Maintenance' : 'ซ่อมบำรุง (Maintenance)'}</span>
        </span>
      </div>

      {/* Calendar Matrix Grid */}
      <div className="overflow-x-auto rounded-2xl border border-slate-200">
        <table className="w-full border-collapse text-left text-xs min-w-[850px]">
          <thead>
            <tr className="bg-slate-900 text-white border-b border-slate-800">
              <th className="py-3 px-4 font-bold sticky left-0 z-20 bg-slate-900 w-44">
                {isEn ? 'Villa / Room' : 'ห้องพัก / วิลล่า'}
              </th>
              {dates.map((d) => (
                <th
                  key={d.dateStr}
                  className={`py-2 px-2 text-center border-l border-slate-800 font-semibold min-w-[70px] ${
                    d.isToday ? 'bg-teal-900 text-teal-200' : d.isWeekend ? 'bg-slate-800/80' : ''
                  }`}
                >
                  <div className="text-[10px] text-slate-400">{d.dayName}</div>
                  <div className={`text-xs font-bold ${d.isToday ? 'text-teal-300 underline' : ''}`}>
                    {d.formatted}
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200 bg-white">
            {rooms.map((room) => (
              <tr key={room.id} className="hover:bg-slate-50/70 transition-colors">
                
                {/* Room Info Sticky Column */}
                <td className="py-3 px-4 font-semibold text-slate-800 sticky left-0 z-10 bg-white border-r border-slate-200 shadow-xs">
                  <div className="font-bold text-teal-900 text-xs">{room.roomNumber}</div>
                  <div className="text-[11px] text-slate-500 truncate max-w-[150px]">
                    {isEn ? room.nameEn || room.name : room.name}
                  </div>
                  <div className="text-[10px] text-slate-400 mt-0.5">
                    ฿{(room.basePrice).toLocaleString()}/คืน
                  </div>
                </td>

                {/* Day Cells */}
                {dates.map((d) => {
                  const activeBooking = getRoomBookingForDate(room.id, d.dateStr);
                  const isRoomToday = d.isToday;

                  let cellBg = 'bg-white hover:bg-emerald-50 cursor-pointer';
                  let cellContent = (
                    <div className="flex flex-col items-center justify-center h-12 text-emerald-600">
                      <Check className="w-3.5 h-3.5 text-emerald-500/70" />
                      <span className="text-[9px] font-bold text-emerald-700 mt-0.5">
                        {isEn ? 'Free' : 'ว่าง'}
                      </span>
                    </div>
                  );

                  if (activeBooking) {
                    const isOccupied = activeBooking.status === 'CHECKED_IN';
                    cellBg = isOccupied
                      ? 'bg-blue-100 hover:bg-blue-200 border-blue-200 cursor-pointer text-blue-900'
                      : 'bg-teal-100 hover:bg-teal-200 border-teal-200 cursor-pointer text-teal-900';

                    cellContent = (
                      <div className="flex flex-col items-center justify-center h-12 px-1 text-center">
                        <User className="w-3 h-3 mb-0.5" />
                        <span className="text-[9px] font-bold truncate max-w-[65px]">
                          {activeBooking.guestName.split(' ')[0]}
                        </span>
                        <span className="text-[8px] font-mono opacity-75">
                          {activeBooking.bookingCode}
                        </span>
                      </div>
                    );
                  } else if (isRoomToday) {
                    if (room.status === 'MAINTENANCE') {
                      cellBg = 'bg-red-100 hover:bg-red-200 text-red-800 cursor-pointer';
                      cellContent = (
                        <div className="flex flex-col items-center justify-center h-12 text-center text-red-700">
                          <Wrench className="w-3.5 h-3.5" />
                          <span className="text-[8px] font-bold mt-0.5">{isEn ? 'Repair' : 'ซ่อมบำรุง'}</span>
                        </div>
                      );
                    } else if (room.status === 'VACANT_DIRTY') {
                      cellBg = 'bg-amber-100 hover:bg-amber-200 text-amber-800 cursor-pointer';
                      cellContent = (
                        <div className="flex flex-col items-center justify-center h-12 text-center text-amber-700">
                          <AlertCircle className="w-3.5 h-3.5" />
                          <span className="text-[8px] font-bold mt-0.5">{isEn ? 'Dirty' : 'รอทำความสะอาด'}</span>
                        </div>
                      );
                    } else if (room.status === 'CLEANING') {
                      cellBg = 'bg-indigo-100 hover:bg-indigo-200 text-indigo-800 cursor-pointer';
                      cellContent = (
                        <div className="flex flex-col items-center justify-center h-12 text-center text-indigo-700">
                          <Sparkles className="w-3.5 h-3.5 animate-spin" />
                          <span className="text-[8px] font-bold mt-0.5">{isEn ? 'Cleaning' : 'แม่บ้านกำลังทำ'}</span>
                        </div>
                      );
                    }
                  }

                  return (
                    <td
                      key={d.dateStr}
                      onClick={() => {
                        setSelectedCellInfo({
                          roomNumber: room.roomNumber,
                          roomName: room.name,
                          date: d.dateStr,
                          bookingCode: activeBooking?.bookingCode,
                          guestName: activeBooking?.guestName,
                          status: activeBooking
                            ? (activeBooking.status === 'CHECKED_IN' ? 'Occupied (เข้าพักแล้ว)' : 'Confirmed (จองแล้ว)')
                            : (isRoomToday ? room.status : 'Vacant Clean (ห้องว่าง)')
                        });
                      }}
                      className={`border-l border-slate-200 p-1 transition-colors ${cellBg}`}
                    >
                      {cellContent}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Selected Cell Quick Info Drawer */}
      {selectedCellInfo && (
        <div className="p-4 bg-teal-50 border border-teal-200 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs animate-in fade-in duration-200">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-teal-700 text-white flex items-center justify-center shrink-0">
              <Info className="w-5 h-5" />
            </div>
            <div>
              <div className="font-bold text-teal-950 text-sm">
                {selectedCellInfo.roomNumber} - {selectedCellInfo.roomName}
              </div>
              <div className="text-teal-800">
                {isEn ? 'Date:' : 'วันที่:'} <strong>{selectedCellInfo.date}</strong> | {isEn ? 'Status:' : 'สถานะ:'} <strong>{selectedCellInfo.status}</strong>
                {selectedCellInfo.guestName && (
                  <span className="ml-2">
                    | {isEn ? 'Guest:' : 'ผู้เข้าพัก:'} <strong>{selectedCellInfo.guestName}</strong> ({selectedCellInfo.bookingCode})
                  </span>
                )}
              </div>
            </div>
          </div>

          <button
            onClick={() => setSelectedCellInfo(null)}
            className="self-end sm:self-auto px-3 py-1 bg-white border border-teal-300 text-teal-800 rounded-lg hover:bg-teal-100 font-semibold"
          >
            {isEn ? 'Close' : 'ปิด'}
          </button>
        </div>
      )}

    </div>
  );
};
