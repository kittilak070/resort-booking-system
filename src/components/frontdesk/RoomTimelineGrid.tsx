import React, { useState } from 'react';
import { useResort } from '../../context/ResortContext';
import { RoomStatus } from '../../types';
import { CheckInModal } from './CheckInModal';
import { CheckOutModal } from './CheckOutModal';
import { WalkInModal } from './WalkInModal';
import { MonthlyCalendarMatrix } from './MonthlyCalendarMatrix';
import { 
  Hotel, Plus, User, Bed, Check, Sparkles, 
  AlertCircle, Wrench, ArrowRightLeft, ShieldAlert, UserCheck,
  LayoutGrid, CalendarDays
} from 'lucide-react';

export const RoomTimelineGrid: React.FC = () => {
  const { rooms, bookings, updateRoomStatus, stats, language } = useResort();
  const isEn = language === 'en';

  const [viewMode, setViewMode] = useState<'CARDS' | 'CALENDAR'>('CARDS');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [showCheckInModal, setShowCheckInModal] = useState<boolean>(false);
  const [showWalkInModal, setShowWalkInModal] = useState<boolean>(false);
  const [selectedBookingForCheckOut, setSelectedBookingForCheckOut] = useState<string | null>(null);

  // Filtered rooms
  const filteredRooms = rooms.filter(room => {
    if (statusFilter === 'ALL') return true;
    return room.status === statusFilter;
  });

  const getStatusBadge = (status: RoomStatus) => {
    switch (status) {
      case 'VACANT_CLEAN':
        return (
          <span className="inline-flex items-center gap-1 text-xs font-bold text-emerald-800 bg-emerald-100/80 px-2.5 py-1 rounded-full border border-emerald-300">
            <Check className="w-3.5 h-3.5 text-emerald-600" /> {isEn ? 'Clean & Ready' : 'ห้องสะอาด (พร้อมรับแขก)'}
          </span>
        );
      case 'VACANT_DIRTY':
        return (
          <span className="inline-flex items-center gap-1 text-xs font-bold text-amber-800 bg-amber-100/80 px-2.5 py-1 rounded-full border border-amber-300 animate-pulse">
            <AlertCircle className="w-3.5 h-3.5 text-amber-600" /> {isEn ? 'Pending Clean' : 'รอทำความสะอาด'}
          </span>
        );
      case 'CLEANING':
        return (
          <span className="inline-flex items-center gap-1 text-xs font-bold text-indigo-800 bg-indigo-100/80 px-2.5 py-1 rounded-full border border-indigo-300">
            <Sparkles className="w-3.5 h-3.5 text-indigo-600 animate-spin" style={{ animationDuration: '3s' }} /> {isEn ? 'In Progress' : 'แม่บ้านกำลังทำ'}
          </span>
        );
      case 'OCCUPIED':
        return (
          <span className="inline-flex items-center gap-1 text-xs font-bold text-blue-800 bg-blue-100/80 px-2.5 py-1 rounded-full border border-blue-300">
            <User className="w-3.5 h-3.5 text-blue-600" /> {isEn ? 'Occupied' : 'มีแขกเข้าพัก (Occupied)'}
          </span>
        );
      case 'MAINTENANCE':
        return (
          <span className="inline-flex items-center gap-1 text-xs font-bold text-red-700 bg-red-100 px-2.5 py-1 rounded-full border border-red-300">
            <Wrench className="w-3.5 h-3.5 text-red-600" /> {isEn ? 'Maintenance' : 'ปิดซ่อมบำรุง'}
          </span>
        );
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Top Action & Stat summary */}
      <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <Hotel className="w-6 h-6 text-teal-600" />
            {isEn ? 'Front Desk Management' : 'แผงควบคุมหน้าฟร้อนท์ (Front Desk Dashboard)'}
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            {isEn
              ? 'Real-time room status tracking, 14-day availability calendar, Walk-in, Check-in & Folio settlement'
              : 'ติดตามสถานะห้องพักแบบเรียลไทม์ ปฏิทินความพร้อม 14 วัน และบริหารจัดการ Check-in / Check-out'}
          </p>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          {/* View mode toggle */}
          <div className="flex items-center bg-slate-100 p-1 rounded-xl border border-slate-200 mr-2">
            <button
              onClick={() => setViewMode('CARDS')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                viewMode === 'CARDS'
                  ? 'bg-white text-teal-800 shadow-xs'
                  : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              <LayoutGrid className="w-3.5 h-3.5" />
              <span>{isEn ? 'Grid' : 'การ์ดห้อง'}</span>
            </button>
            <button
              onClick={() => setViewMode('CALENDAR')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                viewMode === 'CALENDAR'
                  ? 'bg-white text-teal-800 shadow-xs'
                  : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              <CalendarDays className="w-3.5 h-3.5 text-teal-600" />
              <span>{isEn ? '14-Day Calendar' : 'ปฏิทิน 14 วัน'}</span>
            </button>
          </div>

          <button
            onClick={() => setShowWalkInModal(true)}
            className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs sm:text-sm font-bold rounded-xl shadow-md inline-flex items-center gap-2 transition-transform hover:scale-105"
          >
            <UserCheck className="w-4 h-4 text-teal-400" />
            <span>{isEn ? 'Walk-in' : 'รับลูกค้า Walk-in'}</span>
          </button>

          <button
            onClick={() => setShowCheckInModal(true)}
            className="px-4 py-2 bg-teal-700 hover:bg-teal-800 text-white text-xs sm:text-sm font-bold rounded-xl shadow-md inline-flex items-center gap-2 transition-transform hover:scale-105"
          >
            <Plus className="w-4 h-4" />
            <span>{isEn ? 'Check-in' : 'เช็คอินตามจอง'}</span>
          </button>
        </div>
      </div>

      {/* Conditionally Render 14-Day Matrix OR Cards View */}
      {viewMode === 'CALENDAR' ? (
        <MonthlyCalendarMatrix />
      ) : (
        <>
          {/* Filter Tabs */}
          <div className="flex items-center gap-2 overflow-x-auto pb-2 text-xs font-semibold">
            <button
              onClick={() => setStatusFilter('ALL')}
              className={`px-3.5 py-2 rounded-xl border transition-all ${
                statusFilter === 'ALL'
                  ? 'bg-slate-900 text-white border-slate-900 shadow-sm'
                  : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
              }`}
            >
              {isEn ? 'All Rooms' : 'ห้องทั้งหมด'} ({stats.totalRooms})
            </button>
            <button
              onClick={() => setStatusFilter('VACANT_CLEAN')}
              className={`px-3.5 py-2 rounded-xl border transition-all ${
                statusFilter === 'VACANT_CLEAN'
                  ? 'bg-emerald-700 text-white border-emerald-700 shadow-sm'
                  : 'bg-white text-emerald-800 border-slate-200 hover:bg-emerald-50'
              }`}
            >
              {isEn ? 'Clean & Ready' : 'ว่าง พร้อมรับแขก'} ({stats.cleanRooms})
            </button>
            <button
              onClick={() => setStatusFilter('OCCUPIED')}
              className={`px-3.5 py-2 rounded-xl border transition-all ${
                statusFilter === 'OCCUPIED'
                  ? 'bg-blue-700 text-white border-blue-700 shadow-sm'
                  : 'bg-white text-blue-800 border-slate-200 hover:bg-blue-50'
              }`}
            >
              {isEn ? 'Occupied' : 'มีผู้เข้าพัก'} ({stats.occupiedRooms})
            </button>
            <button
              onClick={() => setStatusFilter('VACANT_DIRTY')}
              className={`px-3.5 py-2 rounded-xl border transition-all ${
                statusFilter === 'VACANT_DIRTY'
                  ? 'bg-amber-600 text-white border-amber-600 shadow-sm'
                  : 'bg-white text-amber-800 border-slate-200 hover:bg-amber-50'
              }`}
            >
              {isEn ? 'Pending Clean' : 'รอแม่บ้านทำความสะอาด'} ({stats.dirtyRooms})
            </button>
            <button
              onClick={() => setStatusFilter('CLEANING')}
              className={`px-3.5 py-2 rounded-xl border transition-all ${
                statusFilter === 'CLEANING'
                  ? 'bg-indigo-600 text-white border-indigo-600 shadow-sm'
                  : 'bg-white text-indigo-800 border-slate-200 hover:bg-indigo-50'
              }`}
            >
              {isEn ? 'Cleaning' : 'กำลังทำความสะอาด'} ({stats.cleaningRooms})
            </button>
            <button
              onClick={() => setStatusFilter('MAINTENANCE')}
              className={`px-3.5 py-2 rounded-xl border transition-all ${
                statusFilter === 'MAINTENANCE'
                  ? 'bg-red-600 text-white border-red-600 shadow-sm'
                  : 'bg-white text-red-800 border-slate-200 hover:bg-red-50'
              }`}
            >
              {isEn ? 'Maintenance' : 'ปิดซ่อมบำรุง'} ({stats.maintenanceRooms})
            </button>
          </div>

          {/* Rooms Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredRooms.map(room => {
              const activeBooking = bookings.find(
                b => b.roomId === room.id && (b.status === 'CHECKED_IN' || b.id === room.currentBookingId)
              );

              return (
                <div
                  key={room.id}
                  className="bg-white rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-all overflow-hidden flex flex-col justify-between"
                >
                  <div className="p-5 space-y-4">
                    {/* Header: Room Number & Type */}
                    <div className="flex items-start justify-between">
                      <div>
                        <span className="text-xs font-mono font-bold text-teal-700 bg-teal-50 px-2 py-0.5 rounded-md">
                          {room.roomNumber}
                        </span>
                        <h3 className="text-base font-bold text-slate-900 mt-1">
                          {isEn ? room.nameEn || room.name : room.name}
                        </h3>
                        <p className="text-xs text-slate-400">
                          {isEn ? room.typeNameEn || room.typeName : room.typeName}
                        </p>
                      </div>

                      <div>{getStatusBadge(room.status)}</div>
                    </div>

                    {/* Guest info if Occupied */}
                    {room.status === 'OCCUPIED' && activeBooking && (
                      <div className="bg-blue-50/70 p-3.5 rounded-xl border border-blue-200/80 text-xs space-y-1.5">
                        <div className="flex items-center justify-between font-bold text-blue-900">
                          <span className="flex items-center gap-1.5">
                            <User className="w-3.5 h-3.5 text-blue-600" />
                            {activeBooking.guestName}
                          </span>
                          <span className="font-mono text-[11px] bg-white px-1.5 py-0.5 rounded border border-blue-200">
                            {activeBooking.bookingCode}
                          </span>
                        </div>
                        <div className="text-slate-600 flex justify-between text-[11px]">
                          <span>{isEn ? 'Tel:' : 'เบอร์โทร:'} {activeBooking.guestPhone}</span>
                          <span>{isEn ? 'Nights:' : 'พัก:'} {activeBooking.nights} คืน</span>
                        </div>
                        <div className="text-[11px] text-teal-800 font-semibold flex items-center justify-between pt-1 border-t border-blue-200/60">
                          <span>{isEn ? 'Deposit:' : 'เงินมัดจำ (BR-04):'}</span>
                          <span className="font-bold text-emerald-700">฿{(activeBooking.depositAmount || 1000).toLocaleString()} (ถือไว้)</span>
                        </div>
                      </div>
                    )}

                    {/* Room Specs when Vacant */}
                    {room.status !== 'OCCUPIED' && (
                      <div className="flex items-center gap-2 text-xs text-slate-500 py-1">
                        <Bed className="w-3.5 h-3.5 text-teal-600" />
                        <span>{room.bedType} • {isEn ? `Max ${room.capacity} Guests` : `รองรับ ${room.capacity} ท่าน`}</span>
                      </div>
                    )}

                    {/* Fast Status Override Dropdown */}
                    <div className="flex items-center justify-between text-xs text-slate-500 pt-2 border-t border-slate-100">
                      <span className="flex items-center gap-1 text-[11px]">
                        <ArrowRightLeft className="w-3 h-3 text-slate-400" /> {isEn ? 'Status:' : 'เปลี่ยนสถานะ:'}
                      </span>
                      <select
                        value={room.status}
                        onChange={(e) => updateRoomStatus(room.id, e.target.value as RoomStatus)}
                        className="text-xs bg-slate-50 border border-slate-200 rounded-lg px-2 py-1 font-medium focus:ring-1 focus:ring-teal-500"
                      >
                        <option value="VACANT_CLEAN">{isEn ? 'Clean & Ready' : 'ห้องสะอาด (Clean)'}</option>
                        <option value="VACANT_DIRTY">{isEn ? 'Dirty (Pending Clean)' : 'รอทำความสะอาด (Dirty)'}</option>
                        <option value="CLEANING">{isEn ? 'Cleaning in Progress' : 'กำลังทำความสะอาด'}</option>
                        <option value="OCCUPIED">{isEn ? 'Occupied' : 'มีผู้เข้าพัก (Occupied)'}</option>
                        <option value="MAINTENANCE">{isEn ? 'Maintenance' : 'ปิดปรับปรุง (Maintenance)'}</option>
                      </select>
                    </div>

                  </div>

                  {/* Action Buttons */}
                  <div className="px-5 py-3 bg-slate-50 border-t border-slate-100 flex items-center justify-end gap-2">
                    {room.status === 'OCCUPIED' && activeBooking && (
                      <button
                        onClick={() => setSelectedBookingForCheckOut(activeBooking.id)}
                        className="w-full py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-xl shadow-xs inline-flex items-center justify-center gap-1.5 transition-colors"
                      >
                        <span>{isEn ? 'Check-out & Minibar Folio' : 'ทำรายการเช็คเอาท์ & สรุปบิลมินิบาร์'}</span>
                      </button>
                    )}

                    {room.status === 'VACANT_CLEAN' && (
                      <button
                        onClick={() => setShowCheckInModal(true)}
                        className="w-full py-2 bg-teal-700 hover:bg-teal-800 text-white text-xs font-bold rounded-xl shadow-xs inline-flex items-center justify-center gap-1.5 transition-colors"
                      >
                        <span>{isEn ? 'Check-in Guest to this room' : 'รับแขกเช็คอินห้องนี้'}</span>
                      </button>
                    )}

                    {room.status === 'VACANT_DIRTY' && (
                      <div className="w-full text-center py-1.5 text-xs text-amber-700 font-semibold flex items-center justify-center gap-1">
                        <ShieldAlert className="w-3.5 h-3.5" />
                        <span>{isEn ? 'Awaiting Housekeeper' : 'รอแม่บ้านเข้ามาทำความสะอาด'}</span>
                      </div>
                    )}

                    {room.status === 'CLEANING' && (
                      <div className="w-full text-center py-1.5 text-xs text-indigo-700 font-semibold flex items-center justify-center gap-1">
                        <Sparkles className="w-3.5 h-3.5 animate-spin" />
                        <span>{isEn ? 'Housekeeping in Progress' : 'แม่บ้านกำลังเตรียมห้อง'}</span>
                      </div>
                    )}

                    {room.status === 'MAINTENANCE' && (
                      <div className="w-full text-center py-1.5 text-xs text-red-700 font-medium flex items-center justify-center gap-1 bg-red-50 rounded-lg">
                        <Wrench className="w-3.5 h-3.5 text-red-600" />
                        <span className="truncate">{room.maintenanceReason || (isEn ? 'Under repair' : 'ปิดซ่อมบำรุงชั่วคราว')}</span>
                      </div>
                    )}
                  </div>

                </div>
              );
            })}
          </div>
        </>
      )}

      {/* Modals */}
      {showCheckInModal && (
        <CheckInModal onClose={() => setShowCheckInModal(false)} />
      )}

      {showWalkInModal && (
        <WalkInModal onClose={() => setShowWalkInModal(false)} />
      )}

      {selectedBookingForCheckOut && (
        <CheckOutModal
          bookingId={selectedBookingForCheckOut}
          onClose={() => setSelectedBookingForCheckOut(null)}
        />
      )}

    </div>
  );
};
