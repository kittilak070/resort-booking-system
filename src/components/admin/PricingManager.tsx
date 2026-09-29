import React, { useState, useEffect } from 'react';
import { useResort } from '../../context/ResortContext';
import { PromoCode } from '../../types';
import { 
  BarChart3, TrendingUp, DollarSign, Bed, 
  Users, Cloud, Download, Tag, Plus, Wrench, Check,
  RefreshCw, ShieldCheck, UserCheck
} from 'lucide-react';

export const PricingManager: React.FC = () => {
  const { 
    stats, bookings, promoCodes, addPromoCode, 
    togglePromoCode, maintenanceIssues, resolveMaintenance,
    currentUser, setActiveRole 
  } = useResort();

  const [activeTab, setActiveTab] = useState<'OVERVIEW' | 'PROMOS' | 'MAINTENANCE' | 'FINANCIAL' | 'USERS'>('OVERVIEW');
  const [d1Users, setD1Users] = useState<any[]>([]);
  const [loadingUsers, setLoadingUsers] = useState(false);

  const fetchUsers = async () => {
    setLoadingUsers(true);
    try {
      const res = await fetch('/api/users', {
        headers: {
          'X-Admin-Email': currentUser?.email || ''
        }
      });
      if (res.ok) {
        const data = await res.json();
        setD1Users(Array.isArray(data) ? data : (data.users || []));
      }
    } catch (err) {
      console.error('Error fetching users:', err);
    } finally {
      setLoadingUsers(false);
    }
  };

  // Defense-in-depth: Block unauthorized users immediately
  if (currentUser?.role !== 'MANAGER') {
    return (
      <div className="bg-white p-8 sm:p-12 rounded-3xl border border-red-200 text-center max-w-lg mx-auto shadow-xl my-8">
        <div className="w-16 h-16 rounded-full bg-red-100 text-red-600 flex items-center justify-center mx-auto mb-4">
          <ShieldCheck className="w-8 h-8" />
        </div>
        <h3 className="text-xl font-bold text-slate-900 mb-2">403 Access Denied</h3>
        <p className="text-sm text-slate-600 mb-6 leading-relaxed">
          ส่วนนี้สงวนสิทธิ์เฉพาะผู้จัดการรีสอร์ท (Admin/Manager) เท่านั้น ห้ามผู้ใช้ทั่วไปหรือลูกค้าเข้าถึง
        </p>
        <button
          onClick={() => setActiveRole('GUEST')}
          className="px-6 py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-xl shadow-xs transition-colors"
        >
          กลับสู่หน้าหลัก
        </button>
      </div>
    );
  }

  useEffect(() => {
    if (activeTab === 'USERS') {
      fetchUsers();
    }
  }, [activeTab]);

  // New promo code form
  const [newCode, setNewCode] = useState('');
  const [newDescription, setNewDescription] = useState('');
  const [newType, setNewType] = useState<'PERCENT' | 'FIXED'>('PERCENT');
  const [newValue, setNewValue] = useState<number>(10);
  const [newMinSpend, setNewMinSpend] = useState<number>(2000);
  const [showAddPromo, setShowAddPromo] = useState(false);

  // CSV Export
  const handleExportCSV = () => {
    if (bookings.length === 0) {
      alert('ไม่มีข้อมูลการจองสำหรับ Export');
      return;
    }

    const headers = ['BookingCode,GuestName,Phone,Email,RoomNumber,CheckIn,CheckOut,Nights,TotalAmount,Discount,Status,PaymentMethod,IsWalkIn'];
    const rows = bookings.map(b => 
      `"${b.bookingCode}","${b.guestName}","${b.guestPhone}","${b.guestEmail}","${b.roomNumber}","${b.checkInDate}","${b.checkOutDate}",${b.nights},${b.totalAmount},${b.discountAmount || 0},"${b.status}","${b.paymentMethod}",${b.isWalkIn ? 'Yes' : 'No'}`
    );

    const csvContent = '\uFEFF' + [headers, ...rows].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `resort-bookings-${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleCreatePromo = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCode.trim()) return;

    const promo: PromoCode = {
      code: newCode.trim().toUpperCase(),
      description: newDescription || `ส่วนลด ${newValue}${newType === 'PERCENT' ? '%' : ' บาท'}`,
      discountType: newType,
      discountValue: newValue,
      minSpend: newMinSpend,
      isActive: true
    };

    addPromoCode(promo);
    setNewCode('');
    setNewDescription('');
    setShowAddPromo(false);
    alert(`สร้างโค้ด ${promo.code} สำเร็จ!`);
  };

  // Financial reconciliation calculations
  const grossRoomSales = bookings
    .filter(b => b.status !== 'CANCELLED')
    .reduce((sum, b) => sum + b.roomPrice, 0);

  const grossAddonSales = bookings
    .filter(b => b.status !== 'CANCELLED')
    .reduce((sum, b) => sum + b.addOnTotal, 0);

  const totalDiscounts = bookings
    .filter(b => b.status !== 'CANCELLED')
    .reduce((sum, b) => sum + (b.discountAmount || 0), 0);

  const depositsHeld = bookings
    .filter(b => b.depositStatus === 'HELD')
    .reduce((sum, b) => sum + (b.depositAmount || 0), 0);

  const netRealizedRevenue = stats.totalRevenue - stats.totalRefunded;

  return (
    <div className="space-y-6">
      
      {/* Header & Sub-Navigation */}
      <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <BarChart3 className="w-6 h-6 text-teal-600" />
            ภาพรวมผลการดำเนินงาน & การจัดการ (Phase 2 Executive Panel)
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            สถิติการเข้าพัก, รายงานการเงิน, จัดการโค้ดส่วนลด และระบบซ่อมบำรุง
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleExportCSV}
            className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-xl shadow-sm flex items-center gap-1.5 transition-colors"
          >
            <Download className="w-3.5 h-3.5 text-teal-400" />
            <span>Export CSV</span>
          </button>
        </div>
      </div>

      {/* Admin Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-2 overflow-x-auto text-xs font-semibold">
        <button
          onClick={() => setActiveTab('OVERVIEW')}
          className={`px-4 py-2 rounded-xl transition-all ${
            activeTab === 'OVERVIEW'
              ? 'bg-teal-700 text-white shadow-sm'
              : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
          }`}
        >
          ภาพรวม KPI & การจอง
        </button>
        <button
          onClick={() => setActiveTab('FINANCIAL')}
          className={`px-4 py-2 rounded-xl transition-all ${
            activeTab === 'FINANCIAL'
              ? 'bg-teal-700 text-white shadow-sm'
              : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
          }`}
        >
          กระทบยอดการเงิน (Reconciliation)
        </button>
        <button
          onClick={() => setActiveTab('PROMOS')}
          className={`px-4 py-2 rounded-xl transition-all ${
            activeTab === 'PROMOS'
              ? 'bg-teal-700 text-white shadow-sm'
              : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
          }`}
        >
          จัดการโค้ดโปรโมชัน ({promoCodes.length})
        </button>
        <button
          onClick={() => setActiveTab('MAINTENANCE')}
          className={`px-4 py-2 rounded-xl transition-all ${
            activeTab === 'MAINTENANCE'
              ? 'bg-teal-700 text-white shadow-sm'
              : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
          }`}
        >
          รายการแจ้งซ่อมบำรุง ({maintenanceIssues.filter(m => m.status === 'PENDING_REPAIR').length})
        </button>
        <button
          onClick={() => setActiveTab('USERS')}
          className={`px-4 py-2 rounded-xl transition-all flex items-center gap-1.5 ${
            activeTab === 'USERS'
              ? 'bg-teal-700 text-white shadow-sm'
              : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
          }`}
        >
          <UserCheck className="w-3.5 h-3.5" />
          <span>บัญชีผู้ใช้ Google (D1)</span>
        </button>
      </div>

      {/* TAB 1: OVERVIEW */}
      {activeTab === 'OVERVIEW' && (
        <div className="space-y-6">
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
                <span className="text-xs text-slate-500 block">รายได้สุทธิ (Net Revenue)</span>
                <span className="text-2xl font-black text-slate-900">฿{netRealizedRevenue.toLocaleString()}</span>
                <span className="text-[11px] text-emerald-700 font-semibold block mt-0.5">
                  หลังหักเงินคืน ฿{stats.totalRefunded.toLocaleString()}
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
                  รอทำความสะอาด: {stats.dirtyRooms} | ซ่อม: {stats.maintenanceRooms}
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
                  Walk-in: {bookings.filter(b => b.isWalkIn).length} รายการ
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
                  Cloudflare Edge Deployment (Phase 2 Active)
                </span>
                <h3 className="text-base font-bold text-white">
                  Cloudflare Worker with Static Assets Engine
                </h3>
                <p className="text-xs text-slate-300 mt-0.5">
                  รองรับระบบ Promo Code, Walk-in Check-in, BR-03 Cancellation และ Housekeeping Maintenance แบบ Edge-native
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-500/20 text-emerald-300 border border-emerald-400/40 rounded-full text-xs font-semibold">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                Active on Edge
              </span>
            </div>
          </div>

          {/* Bookings Table */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="p-5 border-b border-slate-100 flex items-center justify-between">
              <h3 className="text-base font-bold text-slate-900">
                รายการคำสั่งจองทั้งหมด (Bookings Registry)
              </h3>
              <span className="text-xs text-slate-400">พบ {bookings.length} รายการ</span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200">
                  <tr>
                    <th className="px-5 py-3">รหัสการจอง</th>
                    <th className="px-5 py-3">ผู้เข้าพัก</th>
                    <th className="px-5 py-3">ห้องพัก</th>
                    <th className="px-5 py-3">ช่วงวันที่</th>
                    <th className="px-5 py-3">ยอดชำระสุทธิ</th>
                    <th className="px-5 py-3">โปรโมชัน</th>
                    <th className="px-5 py-3">สถานะ</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-normal text-slate-700">
                  {bookings.map(b => (
                    <tr key={b.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="px-5 py-3.5 font-bold text-teal-800">
                        {b.bookingCode}
                        {b.isWalkIn && (
                          <span className="ml-1 text-[10px] bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded">
                            Walk-in
                          </span>
                        )}
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
                        {b.appliedPromoCode ? (
                          <span className="text-emerald-700 font-semibold bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200 text-[11px]">
                            {b.appliedPromoCode} (-฿{b.discountAmount})
                          </span>
                        ) : (
                          <span className="text-slate-400">-</span>
                        )}
                      </td>
                      <td className="px-5 py-3.5">
                        {b.status === 'CONFIRMED' && (
                          <span className="px-2 py-0.5 bg-emerald-50 text-emerald-700 rounded-full font-bold border border-emerald-200">
                            ชำระแล้ว
                          </span>
                        )}
                        {b.status === 'CHECKED_IN' && (
                          <span className="px-2 py-0.5 bg-blue-50 text-blue-700 rounded-full font-bold border border-blue-200">
                            เข้าพักอยู่
                          </span>
                        )}
                        {b.status === 'CHECKED_OUT' && (
                          <span className="px-2 py-0.5 bg-slate-100 text-slate-700 rounded-full font-semibold border border-slate-200">
                            เช็คเอาท์แล้ว
                          </span>
                        )}
                        {b.status === 'PENDING_PAYMENT' && (
                          <span className="px-2 py-0.5 bg-amber-50 text-amber-700 rounded-full font-bold border border-amber-200">
                            รอชำระ (Hold)
                          </span>
                        )}
                        {b.status === 'CANCELLED' && (
                          <span className="px-2 py-0.5 bg-red-50 text-red-700 rounded-full font-semibold border border-red-200">
                            ยกเลิก
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: FINANCIAL RECONCILIATION */}
      {activeTab === 'FINANCIAL' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            
            <div className="p-5 bg-white rounded-2xl border border-slate-200 shadow-sm space-y-3">
              <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                ยอดขายรวม (Gross Revenues)
              </h4>
              <div className="space-y-2 text-xs">
                <div className="flex justify-between">
                  <span className="text-slate-600">ค่าห้องพักทั้งหมด:</span>
                  <span className="font-bold text-slate-800">฿{grossRoomSales.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-600">ยอดขายบริการเสริม (Add-ons):</span>
                  <span className="font-bold text-slate-800">฿{grossAddonSales.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-emerald-700 pt-2 border-t border-slate-100">
                  <span>ส่วนลดโปรโมชันที่ให้ลูกค้า:</span>
                  <span className="font-bold">-฿{totalDiscounts.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-sm font-black text-slate-900 pt-2 border-t border-slate-200">
                  <span>ยอดรับเงินรวม:</span>
                  <span>฿{stats.totalRevenue.toLocaleString()}</span>
                </div>
              </div>
            </div>

            <div className="p-5 bg-white rounded-2xl border border-slate-200 shadow-sm space-y-3">
              <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                การคืนเงินและการยกเลิก (Refunds & BR-03)
              </h4>
              <div className="space-y-2 text-xs">
                <div className="flex justify-between">
                  <span className="text-slate-600">การจองที่ขอยกเลิก:</span>
                  <span className="font-bold text-slate-800">
                    {bookings.filter(b => b.status === 'CANCELLED').length} รายการ
                  </span>
                </div>
                <div className="flex justify-between text-red-600 font-semibold">
                  <span>เงินคืนเข้าบัญชีลูกค้าแล้ว:</span>
                  <span className="font-bold">฿{stats.totalRefunded.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-slate-600 pt-2 border-t border-slate-100">
                  <span>ค่าธรรมเนียมยกเลิกที่รีสอร์ทเก็บได้:</span>
                  <span className="font-bold text-slate-800">
                    ฿{bookings.filter(b => b.status === 'CANCELLED').reduce((sum, b) => sum + (b.totalAmount - (b.refundAmount || 0)), 0).toLocaleString()}
                  </span>
                </div>
              </div>
            </div>

            <div className="p-5 bg-white rounded-2xl border border-slate-200 shadow-sm space-y-3">
              <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                เงินมัดจำความเสียหาย (Security Deposits)
              </h4>
              <div className="space-y-2 text-xs">
                <div className="flex justify-between">
                  <span className="text-slate-600">เงินมัดจำที่เคาน์เตอร์ถือไว้:</span>
                  <span className="font-bold text-teal-800 text-sm">฿{depositsHeld.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-slate-500">
                  <span>จำนวนห้องที่ถือมัดจำอยู่:</span>
                  <span className="font-semibold text-slate-800">
                    {bookings.filter(b => b.depositStatus === 'HELD').length} ห้อง
                  </span>
                </div>
                <div className="p-2.5 bg-teal-50 rounded-xl text-[11px] text-teal-800 mt-2">
                  🛡️ เงินมัดจำแยกออกจากรายได้จริง จะถูกคืนให้ลูกค้าในขั้นตอนเช็คเอาท์หากไม่มีความเสียหาย
                </div>
              </div>
            </div>

          </div>
        </div>
      )}

      {/* TAB 3: PROMO CODE MANAGER */}
      {activeTab === 'PROMOS' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <Tag className="w-5 h-5 text-teal-600" />
              ระบบโค้ดส่วนลดและแคมเปญ (Promo Code Engine)
            </h3>
            <button
              onClick={() => setShowAddPromo(true)}
              className="px-4 py-2 bg-teal-700 hover:bg-teal-800 text-white text-xs font-bold rounded-xl shadow-sm flex items-center gap-1.5"
            >
              <Plus className="w-4 h-4" />
              <span>สร้างโค้ดส่วนลดใหม่</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {promoCodes.map(promo => (
              <div key={promo.code} className="p-5 bg-white rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-lg font-black tracking-wider text-teal-800 bg-teal-50 px-2.5 py-0.5 rounded-lg border border-teal-200">
                      {promo.code}
                    </span>
                    <button
                      onClick={() => togglePromoCode(promo.code)}
                      className={`text-xs px-2.5 py-0.5 rounded-full font-bold ${
                        promo.isActive
                          ? 'bg-emerald-100 text-emerald-800'
                          : 'bg-slate-200 text-slate-600'
                      }`}
                    >
                      {promo.isActive ? 'เปิดใช้งาน' : 'ปิดใช้งาน'}
                    </button>
                  </div>
                  <p className="text-xs text-slate-600 mb-3">{promo.description}</p>
                </div>

                <div className="pt-3 border-t border-slate-100 text-xs text-slate-500 space-y-1">
                  <div className="flex justify-between">
                    <span>มูลค่าส่วนลด:</span>
                    <span className="font-bold text-slate-800">
                      {promo.discountType === 'PERCENT' ? `${promo.discountValue}%` : `฿${promo.discountValue}`}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>ยอดจองขั้นต่ำ:</span>
                    <span className="font-semibold text-slate-700">฿{promo.minSpend.toLocaleString()}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Add Promo Modal */}
          {showAddPromo && (
            <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
              <form onSubmit={handleCreatePromo} className="bg-white rounded-3xl p-6 max-w-md w-full space-y-4 shadow-2xl">
                <h3 className="font-bold text-base text-slate-900">สร้างโค้ดส่วนลดใหม่</h3>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">รหัสโค้ด (เช่น AUTUMN15)</label>
                  <input
                    type="text"
                    value={newCode}
                    onChange={(e) => setNewCode(e.target.value.toUpperCase())}
                    required
                    placeholder="PROMOCODE"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-bold uppercase"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">ประเภทส่วนลด</label>
                    <select
                      value={newType}
                      onChange={(e) => setNewType(e.target.value as 'PERCENT' | 'FIXED')}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs"
                    >
                      <option value="PERCENT">เปอร์เซ็นต์ (%)</option>
                      <option value="FIXED">จำนวนเงินคงที่ (บาท)</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">มูลค่า</label>
                    <input
                      type="number"
                      value={newValue}
                      onChange={(e) => setNewValue(Number(e.target.value))}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-bold"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">ยอดสั่งจองขั้นต่ำ (บาท)</label>
                  <input
                    type="number"
                    value={newMinSpend}
                    onChange={(e) => setNewMinSpend(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">คำอธิบาย</label>
                  <input
                    type="text"
                    value={newDescription}
                    onChange={(e) => setNewDescription(e.target.value)}
                    placeholder="เช่น ลด 15% ฉลองเปิดโซนใหม่"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs"
                  />
                </div>

                <div className="flex justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowAddPromo(false)}
                    className="px-4 py-2 text-xs font-semibold text-slate-600"
                  >
                    ยกเลิก
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 bg-teal-700 hover:bg-teal-800 text-white text-xs font-bold rounded-xl shadow-md"
                  >
                    บันทึกโค้ด
                  </button>
                </div>
              </form>
            </div>
          )}
        </div>
      )}

      {/* TAB 4: MAINTENANCE MANAGEMENT */}
      {activeTab === 'MAINTENANCE' && (
        <div className="space-y-4">
          <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
            <Wrench className="w-5 h-5 text-red-600" />
            รายการแจ้งซ่อมบำรุงและสภาพห้องพัก (Maintenance Logs)
          </h3>

          {maintenanceIssues.length === 0 ? (
            <div className="text-center py-10 bg-white rounded-2xl border border-slate-200 p-6 text-slate-400 text-xs">
              ยังไม่มีประวัติการแจ้งซ่อมบำรุงในขณะนี้ ทุกห้องอยู่ในสภาพสมบูรณ์
            </div>
          ) : (
            <div className="space-y-3">
              {maintenanceIssues.map(issue => (
                <div key={issue.id} className="p-4 bg-white rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between text-xs">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-slate-900 text-sm">
                        ห้อง {issue.roomNumber}
                      </span>
                      {issue.status === 'PENDING_REPAIR' ? (
                        <span className="px-2 py-0.5 bg-red-100 text-red-700 rounded-full font-bold text-[10px]">
                          รอช่างเข้าซ่อม
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 bg-emerald-100 text-emerald-700 rounded-full font-bold text-[10px]">
                          ✓ ซ่อมเสร็จแล้ว
                        </span>
                      )}
                    </div>
                    <p className="text-slate-600 mt-1">{issue.issueDescription}</p>
                    <span className="text-[11px] text-slate-400 block mt-1">
                      แจ้งโดย: {issue.reportedBy} เมื่อ {issue.reportedAt}
                    </span>
                  </div>

                  <div>
                    {issue.status === 'PENDING_REPAIR' && (
                      <button
                        onClick={() => {
                          resolveMaintenance(issue.id);
                          alert(`บันทึกการซ่อมห้อง ${issue.roomNumber} เสร็จสิ้น! ปรับสถานะห้องเป็นรอทำความสะอาด (Vacant Dirty) ให้แม่บ้านเข้าตรวจแล้ว`);
                        }}
                        className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl shadow-xs text-xs flex items-center gap-1.5"
                      >
                        <Check className="w-3.5 h-3.5" />
                        <span>ช่างซ่อมเสร็จแล้ว</span>
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* TAB 5: USERS (Cloudflare D1 Google OAuth) */}
      {activeTab === 'USERS' && (
        <div className="space-y-6">
          <div className="bg-white p-5 rounded-2xl shadow-xs border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-purple-100 text-purple-700 flex items-center justify-center">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-slate-900 text-base flex items-center gap-2">
                  <span>ผู้ใช้งานที่ลงทะเบียนผ่าน Google OAuth</span>
                  <span className="text-xs bg-emerald-50 text-emerald-700 font-semibold px-2 py-0.5 rounded-full border border-emerald-200">
                    Live Cloudflare D1
                  </span>
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  ตาราง users ในฐานข้อมูล D1 (resort-db) พร้อมสิทธิ์การใช้งาน Role-Based Access Control
                </p>
              </div>
            </div>

            <button
              onClick={fetchUsers}
              disabled={loadingUsers}
              className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl flex items-center gap-1.5 transition-colors self-start sm:self-auto"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loadingUsers ? 'animate-spin text-teal-600' : ''}`} />
              <span>รีเฟรชข้อมูล</span>
            </button>
          </div>

          {loadingUsers ? (
            <div className="bg-white p-12 text-center rounded-2xl border border-slate-200">
              <RefreshCw className="w-6 h-6 animate-spin text-teal-600 mx-auto mb-2" />
              <p className="text-xs text-slate-500">กำลังดึงข้อมูลบัญชีผู้ใช้จาก Cloudflare D1...</p>
            </div>
          ) : d1Users.length === 0 ? (
            <div className="bg-white p-12 text-center rounded-2xl border border-slate-200">
              <UserCheck className="w-10 h-10 text-slate-300 mx-auto mb-3" />
              <p className="text-sm font-bold text-slate-700">ยังไม่มีผู้ใช้งานเข้าสู่ระบบผ่าน Google</p>
              <p className="text-xs text-slate-400 mt-1">
                คลิกปุ่ม "เข้าสู่ระบบด้วย Google" บนแถบเมนูด้านบนเพื่อเริ่มต้นลงทะเบียนและทดสอบ
              </p>
            </div>
          ) : (
            <div className="bg-white rounded-2xl shadow-xs border border-slate-200 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold uppercase tracking-wider">
                    <tr>
                      <th className="px-5 py-3.5">ผู้ใช้งาน (User)</th>
                      <th className="px-5 py-3.5">อีเมล (Email)</th>
                      <th className="px-5 py-3.5">สิทธิ์การใช้งาน (Role)</th>
                      <th className="px-5 py-3.5">Google ID</th>
                      <th className="px-5 py-3.5">เข้าสู่ระบบล่าสุด (Last Login)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 font-medium">
                    {d1Users.map((user) => (
                      <tr key={user.id} className="hover:bg-slate-50/70 transition-colors">
                        <td className="px-5 py-3.5 flex items-center gap-3">
                          <img
                            src={user.picture || `https://ui-avatars.com/api/?name=${encodeURIComponent(user.name)}&background=0d9488&color=fff`}
                            alt={user.name}
                            className="w-8 h-8 rounded-full object-cover border border-slate-200 shrink-0"
                          />
                          <div>
                            <span className="font-bold text-slate-900 block">{user.name}</span>
                            <span className="text-[10px] text-slate-400 font-mono">{user.id}</span>
                          </div>
                        </td>
                        <td className="px-5 py-3.5 font-mono text-slate-700">
                          {user.email}
                        </td>
                        <td className="px-5 py-3.5">
                          <span
                            className={`px-2.5 py-1 rounded-full text-[10px] font-bold border ${
                              user.role === 'MANAGER'
                                ? 'bg-purple-100 text-purple-800 border-purple-200'
                                : user.role === 'FRONT_DESK'
                                ? 'bg-teal-100 text-teal-800 border-teal-200'
                                : user.role === 'HOUSEKEEPER'
                                ? 'bg-amber-100 text-amber-800 border-amber-200'
                                : 'bg-blue-100 text-blue-800 border-blue-200'
                            }`}
                          >
                            {user.role}
                          </span>
                        </td>
                        <td className="px-5 py-3.5 font-mono text-slate-500 text-[11px]">
                          {user.google_id || '-'}
                        </td>
                        <td className="px-5 py-3.5 text-slate-500 text-[11px]">
                          {user.last_login_at ? new Date(user.last_login_at).toLocaleString('th-TH') : '-'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}

    </div>
  );
};
