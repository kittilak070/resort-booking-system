import React, { useState } from 'react';
import { useResort } from '../../context/ResortContext';
import { Room } from '../../types';
import { Sparkles, Check, Play, AlertCircle, Camera, CheckSquare } from 'lucide-react';

export const HousekeepingMobileView: React.FC = () => {
  const { rooms, updateRoomStatus, stats } = useResort();

  const [activeTab, setActiveTab] = useState<'PENDING' | 'CLEANED'>('PENDING');

  // Pending tasks: DIRTY or CLEANING
  const pendingRooms = rooms.filter(
    r => r.status === 'VACANT_DIRTY' || r.status === 'CLEANING'
  );

  const cleanedRooms = rooms.filter(r => r.status === 'VACANT_CLEAN');

  const displayedRooms = activeTab === 'PENDING' ? pendingRooms : cleanedRooms;

  const handleStartCleaning = (room: Room) => {
    updateRoomStatus(room.id, 'CLEANING');
  };

  const handleFinishCleaning = (room: Room) => {
    updateRoomStatus(room.id, 'VACANT_CLEAN');
    alert(`ห้อง ${room.roomNumber} ทำความสะอาดเสร็จสมบูรณ์! สถานะบนหน้าจอเคาน์เตอร์ต้อนรับปรับเป็นพร้อมรับแขกทันที`);
  };

  return (
    <div className="max-w-xl mx-auto space-y-5">
      
      {/* Mobile Header Card */}
      <div className="bg-gradient-to-r from-teal-800 to-slate-900 text-white p-5 rounded-3xl shadow-lg">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2.5 bg-teal-500/20 rounded-2xl border border-teal-400/30">
              <Sparkles className="w-6 h-6 text-teal-300" />
            </div>
            <div>
              <h2 className="text-lg font-bold">งานแม่บ้านประจำวัน</h2>
              <p className="text-xs text-teal-200">Housekeeping Mobile Task Tracker</p>
            </div>
          </div>
          <div className="text-right">
            <span className="text-xs text-teal-200 block">ห้องรอทำความสะอาด</span>
            <span className="text-2xl font-black text-white">{stats.dirtyRooms + stats.cleaningRooms}</span>
          </div>
        </div>

        {/* Tab switcher */}
        <div className="grid grid-cols-2 gap-2 mt-5 p-1 bg-white/10 rounded-xl text-xs font-semibold backdrop-blur-sm">
          <button
            onClick={() => setActiveTab('PENDING')}
            className={`py-2 rounded-lg transition-all ${
              activeTab === 'PENDING'
                ? 'bg-white text-slate-900 shadow-sm'
                : 'text-teal-100 hover:text-white'
            }`}
          >
            ต้องทำความสะอาด ({pendingRooms.length})
          </button>
          <button
            onClick={() => setActiveTab('CLEANED')}
            className={`py-2 rounded-lg transition-all ${
              activeTab === 'CLEANED'
                ? 'bg-white text-slate-900 shadow-sm'
                : 'text-teal-100 hover:text-white'
            }`}
          >
            ห้องสะอาดแล้ว ({cleanedRooms.length})
          </button>
        </div>
      </div>

      {/* Room Tasks List */}
      <div className="space-y-4">
        {displayedRooms.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-3xl border border-slate-200 p-6">
            <Check className="w-12 h-12 text-emerald-500 mx-auto mb-2" />
            <h3 className="text-base font-bold text-slate-800">ยอดเยี่ยมมาก!</h3>
            <p className="text-xs text-slate-500 mt-1">
              {activeTab === 'PENDING'
                ? 'ไม่มีห้องค้างทำความสะอาดในขณะนี้ ทุกห้องพร้อมรับแขกครบถ้วน'
                : 'ยังไม่มีห้องที่บันทึกว่าทำความสะอาดเสร็จแล้ว'}
            </p>
          </div>
        ) : (
          displayedRooms.map(room => (
            <div
              key={room.id}
              className={`p-5 rounded-3xl border shadow-sm transition-all ${
                room.status === 'CLEANING'
                  ? 'bg-indigo-50/50 border-indigo-200 ring-2 ring-indigo-400'
                  : room.status === 'VACANT_DIRTY'
                  ? 'bg-amber-50/40 border-amber-200'
                  : 'bg-white border-slate-200'
              }`}
            >
              
              <div className="flex items-start justify-between mb-3">
                <div>
                  <span className="text-lg font-black text-slate-900 tracking-wide block">
                    {room.roomNumber}
                  </span>
                  <span className="text-xs font-semibold text-slate-600">{room.name}</span>
                </div>

                <div>
                  {room.status === 'VACANT_DIRTY' && (
                    <span className="text-xs font-bold text-amber-800 bg-amber-100 px-3 py-1 rounded-full flex items-center gap-1 border border-amber-300">
                      <AlertCircle className="w-3.5 h-3.5 text-amber-600" /> รอทำความสะอาด
                    </span>
                  )}
                  {room.status === 'CLEANING' && (
                    <span className="text-xs font-bold text-indigo-800 bg-indigo-100 px-3 py-1 rounded-full flex items-center gap-1 border border-indigo-300">
                      <Sparkles className="w-3.5 h-3.5 text-indigo-600 animate-spin" /> กำลังทำ
                    </span>
                  )}
                  {room.status === 'VACANT_CLEAN' && (
                    <span className="text-xs font-bold text-emerald-800 bg-emerald-100 px-3 py-1 rounded-full flex items-center gap-1 border border-emerald-300">
                      <Check className="w-3.5 h-3.5 text-emerald-600" /> สะอาดเรียบร้อย
                    </span>
                  )}
                </div>
              </div>

              {/* Cleaning Checklist reminder */}
              <div className="grid grid-cols-2 gap-2 text-[11px] text-slate-600 bg-white p-3 rounded-2xl border border-slate-200/80 mb-4">
                <span className="flex items-center gap-1.5">
                  <CheckSquare className="w-3.5 h-3.5 text-teal-600" /> เปลี่ยนผ้าปู & ปลอกหมอน
                </span>
                <span className="flex items-center gap-1.5">
                  <CheckSquare className="w-3.5 h-3.5 text-teal-600" /> ทำความสะอาดห้องน้ำ
                </span>
                <span className="flex items-center gap-1.5">
                  <CheckSquare className="w-3.5 h-3.5 text-teal-600" /> เติมน้ำดื่ม & มินิบาร์
                </span>
                <span className="flex items-center gap-1.5">
                  <CheckSquare className="w-3.5 h-3.5 text-teal-600" /> ตรวจสอบสระ/จากุซซี่
                </span>
              </div>

              {/* Actions */}
              <div className="flex items-center justify-between gap-3 pt-1">
                <button
                  type="button"
                  onClick={() => alert('เปิดกล้องถ่ายภาพความเสียหายเรียบร้อย')}
                  className="p-2.5 text-slate-500 hover:text-slate-800 bg-white hover:bg-slate-100 border border-slate-200 rounded-xl text-xs flex items-center gap-1.5"
                  title="ถ่ายภาพความเสียหาย"
                >
                  <Camera className="w-4 h-4 text-slate-600" />
                  <span className="hidden sm:inline">แจ้งของเสียหาย</span>
                </button>

                {room.status === 'VACANT_DIRTY' && (
                  <button
                    type="button"
                    onClick={() => handleStartCleaning(room)}
                    className="flex-1 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs sm:text-sm font-bold rounded-xl shadow-md flex items-center justify-center gap-2 transition-all hover:scale-[1.02]"
                  >
                    <Play className="w-4 h-4" />
                    <span>เริ่มทำความสะอาด</span>
                  </button>
                )}

                {room.status === 'CLEANING' && (
                  <button
                    type="button"
                    onClick={() => handleFinishCleaning(room)}
                    className="flex-1 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs sm:text-sm font-bold rounded-xl shadow-md flex items-center justify-center gap-2 transition-all hover:scale-[1.02]"
                  >
                    <Check className="w-4 h-4" />
                    <span>ทำเสร็จแล้ว (ส่งตรวจ / ปล่อยห้อง)</span>
                  </button>
                )}

                {room.status === 'VACANT_CLEAN' && (
                  <button
                    type="button"
                    onClick={() => updateRoomStatus(room.id, 'VACANT_DIRTY')}
                    className="text-xs text-slate-500 hover:text-red-600 underline"
                  >
                    เปลี่ยนกลับเป็นรอทำ
                  </button>
                )}
              </div>

            </div>
          ))
        )}
      </div>

    </div>
  );
};
