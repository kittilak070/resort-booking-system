import React from 'react';
import { useResort } from '../../context/ResortContext';
import { 
  BarChart3, TrendingUp, DollarSign, Bed, 
  Users, CheckCircle2, Clock, Cloud
} from 'lucide-react';

export const PricingManager: React.FC = () => {
  const { stats, bookings, rooms } = useResort();

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-200 flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <BarChart3 className="w-6 h-6 text-teal-600" />
            ภาพรวมผลการดำเนินงาน & การจัดการ (Executive Summary)
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            สถิติการเข้าพัก รายรับ การจอง และสถานะการ Deploy บน Cloudflare Edge
          </p>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-4">
          <div className="p-3 bg-teal-50 rounded-2xl text-teal-700 shrink-0">
            <TrendingUp className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xs text-slate-500 block">อัตราการเข้าพัก (Occupancy)</span>
            <span className="text-2xl font-black text-slate-900">{stats.occupancyRate}%</span>
            <span className="text-[11px] text-teal-700 font-semibold block mt-0.5">
              {stats.occupiedRooms} จาก {stats.totalRooms} ห้อง
            </span>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-4">
          <div className="p-3 bg-emerald-50 rounded-2xl text-emerald-700 shrink-0">
            <DollarSign className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xs text-slate-500 block">รายได้สะสม (Revenue)</span>
            <span className="text-2xl font-black text-slate-900">฿{stats.totalRevenue.toLocaleString()}</span>
            <span className="text-[11px] text-emerald-700 font-semibold block mt-0.5">
              จากการจองที่ยืนยันแล้ว
            </span>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-4">
          <div className="p-3 bg-blue-50 rounded-2xl text-blue-700 shrink-0">
            <Bed className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xs text-slate-500 block">ห้องสะอาดพร้อมขาย</span>
            <span className="text-2xl font-black text-slate-900">{stats.cleanRooms}</span>
            <span className="text-[11px] text-blue-700 font-semibold block mt-0.5">
              รอทำความสะอาด: {stats.dirtyRooms} ห้อง
            </span>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-4">
          <div className="p-3 bg-amber-50 rounded-2xl text-amber-700 shrink-0">
            <Users className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xs text-slate-500 block">คำสั่งจองทั้งหมด</span>
            <span className="text-2xl font-black text-slate-900">{bookings.length}</span>
            <span className="text-[11px] text-amber-700 font-semibold block mt-0.5">
              รวมทุกสถานะ
            </span>
          </div>
        </div>

      </div>

      {/* Cloudflare Edge Status Card */}
      <div className="bg-gradient-to-r from-slate-900 to-teal-950 text-white p-5 rounded-2xl border border-teal-800 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-teal-500/20 rounded-2xl border border-teal-400/30">
            <Cloud className="w-6 h-6 text-teal-400" />
          </div>
          <div>
            <span className="text-xs uppercase font-bold text-teal-400 tracking-wider block">
              Cloudflare Deployment Pipeline
            </span>
            <h3 className="text-base font-bold text-white">
              Cloudflare Pages Ready & Auto-Deploy Enabled
            </h3>
            <p className="text-xs text-slate-300 mt-0.5">
              ระบบเชื่อมต่อ GitHub Actions CI/CD (.github/workflows/deploy.yml) ดีพลอยอัตโนมัติเมื่อ Push โค้ด
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2 self-start sm:self-auto">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-500/20 text-emerald-300 border border-emerald-400/40 rounded-full text-xs font-semibold">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            CI/CD Ready
          </span>
        </div>
      </div>

      {/* Recent Bookings Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-5 border-b border-slate-100 flex items-center justify-between">
          <h3 className="text-base font-bold text-slate-900">
            รายการคำสั่งจองล่าสุด (Bookings Log)
          </h3>
          <span className="text-xs text-slate-500">
            เรียงตามเวลาล่าสุด
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200">
              <tr>
                <th className="px-5 py-3">รหัสการจอง</th>
                <th className="px-5 py-3">ผู้เข้าพัก</th>
                <th className="px-5 py-3">ห้องพัก</th>
                <th className="px-5 py-3">ช่วงวันที่เข้าพัก</th>
                <th className="px-5 py-3">ยอดชำระ</th>
                <th className="px-5 py-3">สถานะคำสั่งจอง</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-normal text-slate-700">
              {bookings.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-5 py-8 text-center text-slate-400">
                    ยังไม่มีข้อมูลการจองในขณะนี้
                  </td>
                </tr>
              ) : (
                bookings.map(b => (
                  <tr key={b.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="px-5 py-3.5 font-bold text-teal-800">
                      {b.bookingCode}
                    </td>
                    <td className="px-5 py-3.5">
                      <div className="font-semibold text-slate-900">{b.guestName}</div>
                      <div className="text-[11px] text-slate-400">{b.guestPhone}</div>
                    </td>
                    <td className="px-5 py-3.5">
                      <span className="font-semibold text-slate-800">{b.roomNumber}</span>
                      <div className="text-[11px] text-slate-400">{b.roomName}</div>
                    </td>
                    <td className="px-5 py-3.5 whitespace-nowrap">
                      {b.checkInDate} ถึง {b.checkOutDate}
                      <span className="text-[11px] text-slate-400 ml-1">({b.nights} คืน)</span>
                    </td>
                    <td className="px-5 py-3.5 font-bold text-slate-900">
                      ฿{b.totalAmount.toLocaleString()}
                    </td>
                    <td className="px-5 py-3.5">
                      {b.status === 'CONFIRMED' && (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-emerald-50 text-emerald-700 rounded-full font-bold border border-emerald-200">
                          <CheckCircle2 className="w-3 h-3" /> ชำระเงินแล้ว
                        </span>
                      )}
                      {b.status === 'CHECKED_IN' && (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-blue-50 text-blue-700 rounded-full font-bold border border-blue-200">
                          <Users className="w-3 h-3" /> กำลังเข้าพัก
                        </span>
                      )}
                      {b.status === 'CHECKED_OUT' && (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-slate-100 text-slate-700 rounded-full font-semibold border border-slate-200">
                          เช็คเอาท์แล้ว
                        </span>
                      )}
                      {b.status === 'PENDING_PAYMENT' && (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-amber-50 text-amber-700 rounded-full font-bold border border-amber-200">
                          <Clock className="w-3 h-3" /> รอชำระเงิน (Hold)
                        </span>
                      )}
                      {b.status === 'CANCELLED' && (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-red-50 text-red-700 rounded-full font-semibold border border-red-200">
                          ยกเลิกแล้ว
                        </span>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Room Pricing & Inventory Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5">
        <h3 className="text-base font-bold text-slate-900 mb-4">
          ตารางอัตราค่าห้องพักปัจจุบัน (Dynamic Pricing Table)
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {rooms.map(r => (
            <div key={r.id} className="p-4 bg-slate-50 rounded-xl border border-slate-200 flex justify-between items-center text-xs">
              <div>
                <span className="font-bold text-slate-900 block">{r.roomNumber} - {r.name}</span>
                <span className="text-slate-500">{r.typeName}</span>
              </div>
              <div className="text-right">
                <span className="font-bold text-teal-800 block">ธรรมดา: ฿{r.basePrice.toLocaleString()}</span>
                <span className="text-amber-700 font-semibold">สุดสัปดาห์: ฿{r.weekendPrice.toLocaleString()}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
};
