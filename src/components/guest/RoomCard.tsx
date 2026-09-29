import React from 'react';
import { Room } from '../../types';
import { useResort } from '../../context/ResortContext';
import { Users, Bed, Maximize2, Check, ArrowRight, Star } from 'lucide-react';

interface RoomCardProps {
  room: Room;
  onSelect: (room: Room) => void;
  onViewReviews?: (room: Room) => void;
  checkInDate: string;
}

export const RoomCard: React.FC<RoomCardProps> = ({ room, onSelect, onViewReviews, checkInDate }) => {
  const { language } = useResort();
  const isEn = language === 'en';

  const isWeekend = (() => {
    if (!checkInDate) return false;
    const d = new Date(checkInDate).getDay();
    return d === 5 || d === 6;
  })();

  const currentPrice = isWeekend ? room.weekendPrice : room.basePrice;
  const isAvailable = room.status !== 'MAINTENANCE';

  return (
    <div className="bg-white rounded-3xl overflow-hidden border border-slate-200/80 shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col group">
      
      {/* Room Image */}
      <div className="relative h-64 overflow-hidden bg-slate-100">
        <img
          src={room.images[0]}
          alt={isEn ? room.nameEn || room.name : room.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          loading="lazy"
        />
        
        {/* Type Badge */}
        <div className="absolute top-3 left-3 bg-slate-900/80 backdrop-blur-md text-white text-xs font-semibold px-3 py-1 rounded-full">
          {isEn ? room.typeNameEn || room.typeName : room.typeName}
        </div>

        {/* Status Badge */}
        <div className="absolute top-3 right-3">
          {room.status === 'VACANT_CLEAN' && (
            <span className="bg-emerald-500/90 backdrop-blur-md text-white text-xs font-semibold px-2.5 py-1 rounded-full shadow-sm flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-white animate-pulse"></span>
              {isEn ? 'Available' : 'ว่าง พร้อมจอง'}
            </span>
          )}
          {(room.status === 'VACANT_DIRTY' || room.status === 'CLEANING') && (
            <span className="bg-amber-500/90 backdrop-blur-md text-white text-xs font-semibold px-2.5 py-1 rounded-full shadow-sm">
              {isEn ? 'Instant Booking' : 'จองล่วงหน้าได้'}
            </span>
          )}
          {room.status === 'OCCUPIED' && (
            <span className="bg-blue-600/90 backdrop-blur-md text-white text-xs font-semibold px-2.5 py-1 rounded-full shadow-sm">
              {isEn ? 'Reserved Next Cycle' : 'มีแขกเข้าพัก (จองรอบถัดไป)'}
            </span>
          )}
          {room.status === 'MAINTENANCE' && (
            <span className="bg-slate-600/90 backdrop-blur-md text-white text-xs font-semibold px-2.5 py-1 rounded-full shadow-sm">
              {isEn ? 'Under Renovation' : 'ปรับปรุงชั่วคราว'}
            </span>
          )}
        </div>

        {/* Room Code Badge & Reviews Trigger */}
        <div className="absolute bottom-3 left-3 flex items-center gap-1.5">
          <div className="bg-white/90 backdrop-blur-md text-slate-800 text-xs font-bold px-2.5 py-0.5 rounded-md shadow-xs">
            {room.roomNumber}
          </div>

          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onViewReviews?.(room);
            }}
            className="bg-slate-900/80 hover:bg-slate-900 backdrop-blur-md text-amber-300 text-xs font-bold px-2.5 py-0.5 rounded-md shadow-xs flex items-center gap-1 transition-colors cursor-pointer"
          >
            <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
            <span>{room.rating || 4.8}</span>
            <span className="text-[10px] text-slate-300 font-normal underline">
              ({room.reviewCount || 25})
            </span>
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="p-6 flex-1 flex flex-col justify-between">
        <div>
          <div className="flex items-start justify-between gap-2 mb-1">
            <h3 className="text-lg font-bold text-slate-900 group-hover:text-teal-700 transition-colors">
              {isEn ? room.nameEn || room.name : room.name}
            </h3>
          </div>

          <p className="text-xs text-slate-500 line-clamp-2 mb-4 leading-relaxed">
            {isEn ? room.descriptionEn || room.description : room.description}
          </p>

          {/* Quick Specs */}
          <div className="flex items-center gap-4 text-xs text-slate-600 py-2.5 border-y border-slate-100 mb-3">
            <span className="flex items-center gap-1">
              <Users className="w-3.5 h-3.5 text-teal-600" /> {isEn ? `Up to ${room.capacity}` : `สูงสุด ${room.capacity} ท่าน`}
            </span>
            <span className="flex items-center gap-1">
              <Bed className="w-3.5 h-3.5 text-teal-600" /> {room.bedType}
            </span>
            <span className="flex items-center gap-1">
              <Maximize2 className="w-3.5 h-3.5 text-teal-600" /> {room.sizeSqM} {isEn ? 'sq.m.' : 'ตร.ม.'}
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
                +{room.amenities.length - 4} {isEn ? 'more' : 'อื่นๆ'}
              </span>
            )}
          </div>
        </div>

        {/* Pricing & CTA */}
        <div className="pt-3 border-t border-slate-100 flex items-center justify-between mt-2">
          <div>
            <div className="flex items-baseline gap-1">
              <span className="text-xs text-slate-400">{isEn ? 'From' : 'เริ่มต้น'}</span>
              <span className="text-xl font-extrabold text-teal-800">
                ฿{currentPrice.toLocaleString()}
              </span>
              <span className="text-xs text-slate-500 font-normal">{isEn ? '/night' : '/คืน'}</span>
            </div>
            {isWeekend && (
              <span className="text-[10px] text-amber-700 font-semibold bg-amber-50 px-1.5 py-0.5 rounded border border-amber-200">
                {isEn ? 'Weekend Rate' : 'ราคาช่วงสุดสัปดาห์'}
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
            <span>{isEn ? 'Book Villa' : 'จองห้องนี้'}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>

      </div>

    </div>
  );
};
