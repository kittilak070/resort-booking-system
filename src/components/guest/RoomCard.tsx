import React from 'react';
import { Room } from '../../types';
import { Users, Bed, Maximize2, Check, ArrowRight } from 'lucide-react';

interface RoomCardProps {
  room: Room;
  onSelect: (room: Room) => void;
  checkInDate: string;
}

export const RoomCard: React.FC<RoomCardProps> = ({ room, onSelect, checkInDate }) => {
  const isWeekend = (() => {
    if (!checkInDate) return false;
    const d = new Date(checkInDate).getDay();
    return d === 5 || d === 6;
  })();

  const currentPrice = isWeekend ? room.weekendPrice : room.basePrice;

  const isAvailable = room.status !== 'MAINTENANCE';

  return (
    <div className="bg-white rounded-2xl overflow-hidden border border-slate-200/80 shadow-sm hover:shadow-lg transition-all duration-300 flex flex-col group">
      
      {/* Room Image */}
      <div className="relative h-60 overflow-hidden bg-slate-100">
        <img
          src={room.images[0]}
          alt={room.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          loading="lazy"
        />
        
        {/* Type Badge */}
        <div className="absolute top-3 left-3 bg-slate-900/80 backdrop-blur-md text-white text-xs font-semibold px-3 py-1 rounded-full">
          {room.typeName}
        </div>

        {/* Status Badge */}
        <div className="absolute top-3 right-3">
          {room.status === 'VACANT_CLEAN' && (
            <span className="bg-emerald-500/90 backdrop-blur-md text-white text-xs font-semibold px-2.5 py-1 rounded-full shadow-sm flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-white animate-pulse"></span>
              ว่าง พร้อมจอง
            </span>
          )}
          {(room.status === 'VACANT_DIRTY' || room.status === 'CLEANING') && (
            <span className="bg-amber-500/90 backdrop-blur-md text-white text-xs font-semibold px-2.5 py-1 rounded-full shadow-sm">
              จองล่วงหน้าได้
            </span>
          )}
          {room.status === 'OCCUPIED' && (
            <span className="bg-blue-600/90 backdrop-blur-md text-white text-xs font-semibold px-2.5 py-1 rounded-full shadow-sm">
              มีแขกเข้าพัก (จองรอบถัดไป)
            </span>
          )}
          {room.status === 'MAINTENANCE' && (
            <span className="bg-slate-600/90 backdrop-blur-md text-white text-xs font-semibold px-2.5 py-1 rounded-full shadow-sm">
              ปรับปรุงชั่วคราว
            </span>
          )}
        </div>

        {/* Room Code Badge */}
        <div className="absolute bottom-3 left-3 bg-white/90 backdrop-blur-md text-slate-800 text-xs font-bold px-2.5 py-0.5 rounded-md">
          {room.roomNumber}
        </div>
      </div>

      {/* Content */}
      <div className="p-5 flex-1 flex flex-col justify-between">
        <div>
          <h3 className="text-lg font-bold text-slate-900 mb-1 group-hover:text-teal-700 transition-colors">
            {room.name}
          </h3>
          <p className="text-xs text-slate-500 line-clamp-2 mb-4">
            {room.description}
          </p>

          {/* Quick Specs */}
          <div className="flex items-center gap-4 text-xs text-slate-600 py-2.5 border-y border-slate-100 mb-3">
            <span className="flex items-center gap-1">
              <Users className="w-3.5 h-3.5 text-teal-600" /> สูงสุด {room.capacity} ท่าน
            </span>
            <span className="flex items-center gap-1">
              <Bed className="w-3.5 h-3.5 text-teal-600" /> {room.bedType}
            </span>
            <span className="flex items-center gap-1">
              <Maximize2 className="w-3.5 h-3.5 text-teal-600" /> {room.sizeSqM} ตร.ม.
            </span>
          </div>

          {/* Amenities Pills */}
          <div className="flex flex-wrap gap-1.5 mb-4">
            {room.amenities.slice(0, 4).map((amenity, idx) => (
              <span
                key={idx}
                className="inline-flex items-center gap-1 text-[11px] font-medium text-slate-600 bg-slate-100 px-2 py-0.5 rounded-md"
              >
                <Check className="w-3 h-3 text-teal-600" /> {amenity}
              </span>
            ))}
            {room.amenities.length > 4 && (
              <span className="text-[11px] font-medium text-slate-400 self-center">
                +{room.amenities.length - 4} อื่นๆ
              </span>
            )}
          </div>
        </div>

        {/* Pricing & CTA */}
        <div className="pt-3 border-t border-slate-100 flex items-center justify-between mt-2">
          <div>
            <div className="flex items-baseline gap-1">
              <span className="text-xs text-slate-400">เริ่มต้น</span>
              <span className="text-xl font-extrabold text-teal-800">
                ฿{currentPrice.toLocaleString()}
              </span>
              <span className="text-xs text-slate-500 font-normal">/คืน</span>
            </div>
            {isWeekend && (
              <span className="text-[10px] text-amber-700 font-semibold bg-amber-50 px-1.5 py-0.5 rounded border border-amber-200">
                ราคาช่วงสุดสัปดาห์
              </span>
            )}
          </div>

          <button
            onClick={() => onSelect(room)}
            disabled={!isAvailable}
            className={`inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all shadow-sm ${
              isAvailable
                ? 'bg-teal-700 hover:bg-teal-800 text-white shadow-teal-700/20 hover:scale-[1.02]'
                : 'bg-slate-200 text-slate-400 cursor-not-allowed'
            }`}
          >
            <span>จองห้องนี้</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>

      </div>

    </div>
  );
};
