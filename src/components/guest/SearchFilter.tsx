import React from 'react';
import { Calendar, Users, Filter } from 'lucide-react';

interface SearchFilterProps {
  checkInDate: string;
  setCheckInDate: (date: string) => void;
  checkOutDate: string;
  setCheckOutDate: (date: string) => void;
  guestsCount: number;
  setGuestsCount: (count: number) => void;
  selectedCategory: string;
  setSelectedCategory: (cat: string) => void;
}

export const SearchFilter: React.FC<SearchFilterProps> = ({
  checkInDate,
  setCheckInDate,
  checkOutDate,
  setCheckOutDate,
  guestsCount,
  setGuestsCount,
  selectedCategory,
  setSelectedCategory
}) => {
  const categories = [
    { id: 'ALL', label: 'ทั้งหมดทุกประเภท' },
    { id: 'POOL_VILLA', label: '🏡 พูลวิลล่าส่วนตัว' },
    { id: 'BEACHFRONT_SUITE', label: '🏖️ สวีทติดหาด' },
    { id: 'GARDEN_BUNGALOW', label: '🌴 บังกะโลสวน' },
    { id: 'DELUXE_ROOM', label: '✨ ห้องดีลักซ์' }
  ];

  return (
    <div className="bg-white rounded-2xl shadow-md border border-slate-200/80 p-5 mb-8 -mt-6 sm:-mt-10 relative z-20">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
        
        {/* Check-in Date */}
        <div>
          <label className="block text-xs font-semibold text-slate-600 mb-1.5 flex items-center gap-1.5">
            <Calendar className="w-3.5 h-3.5 text-teal-600" />
            วันที่เช็คอิน (Check-in)
          </label>
          <input
            type="date"
            value={checkInDate}
            onChange={(e) => setCheckInDate(e.target.value)}
            className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:bg-white transition-all"
          />
        </div>

        {/* Check-out Date */}
        <div>
          <label className="block text-xs font-semibold text-slate-600 mb-1.5 flex items-center gap-1.5">
            <Calendar className="w-3.5 h-3.5 text-teal-600" />
            วันที่เช็คเอาท์ (Check-out)
          </label>
          <input
            type="date"
            value={checkOutDate}
            onChange={(e) => setCheckOutDate(e.target.value)}
            className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:bg-white transition-all"
          />
        </div>

        {/* Guests Count */}
        <div>
          <label className="block text-xs font-semibold text-slate-600 mb-1.5 flex items-center gap-1.5">
            <Users className="w-3.5 h-3.5 text-teal-600" />
            จำนวนผู้เข้าพัก (Guests)
          </label>
          <select
            value={guestsCount}
            onChange={(e) => setGuestsCount(Number(e.target.value))}
            className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:bg-white transition-all"
          >
            <option value={1}>1 ท่าน</option>
            <option value={2}>2 ท่าน (มาตรฐาน)</option>
            <option value={3}>3 ท่าน (+เสริมเตียง)</option>
            <option value={4}>4 ท่าน (ครอบครัว)</option>
            <option value={6}>6 ท่าน (กลุ่มใหญ่)</option>
          </select>
        </div>

        {/* Search Info Badge */}
        <div className="flex items-center justify-between p-2.5 bg-teal-50/80 border border-teal-200/80 rounded-xl text-teal-900 text-xs">
          <div>
            <span className="font-semibold block">สถานะการค้นหา</span>
            <span className="text-teal-700">อัปเดตห้องว่างอัตโนมัติ</span>
          </div>
          <span className="px-2.5 py-1 bg-teal-600 text-white font-bold rounded-lg shadow-sm text-xs">
            พร้อมจอง
          </span>
        </div>

      </div>

      {/* Categories Filter Tabs */}
      <div className="mt-4 pt-4 border-t border-slate-100 flex items-center gap-2 overflow-x-auto pb-1">
        <span className="text-xs text-slate-400 font-medium flex items-center gap-1 shrink-0">
          <Filter className="w-3 h-3" /> หมวดหมู่:
        </span>
        {categories.map(cat => (
          <button
            key={cat.id}
            onClick={() => setSelectedCategory(cat.id)}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-colors ${
              selectedCategory === cat.id
                ? 'bg-teal-700 text-white shadow-sm'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            {cat.label}
          </button>
        ))}
      </div>
    </div>
  );
};
