import React, { useState, useEffect } from 'react';
import { useResort } from '../../context/ResortContext';
import { Room, PromoCode, MinibarItem, MaintenanceIssue } from '../../types';
import { RoomCrudModal } from './RoomCrudModal';
import { PromoCrudModal } from './PromoCrudModal';
import { MinibarCrudModal } from './MinibarCrudModal';
import { MaintenanceCrudModal } from './MaintenanceCrudModal';
import { UserCrudModal } from './UserCrudModal';
import { DeleteConfirmModal } from './DeleteConfirmModal';
import { ChatbotApiManager } from './ChatbotApiManager';
import { 
  BarChart3, TrendingUp, DollarSign, Bed, 
  Users, Download, Tag, Plus, Wrench, Check,
  RefreshCw, ShieldCheck, UserCheck, Bot,
  Trash2, Edit2, Wine, AlertTriangle
} from 'lucide-react';

export const PricingManager: React.FC = () => {
  const { 
    stats, rooms, bookings, promoCodes, minibarItems,
    addRoom, updateRoom, deleteRoom, updateRoomStatus,
    addPromoCode, updatePromoCode, deletePromoCode, togglePromoCode,
    addMinibarItem, updateMinibarItem, deleteMinibarItem,
    maintenanceIssues, reportMaintenance, updateMaintenance, resolveMaintenance, deleteMaintenance,
    currentUser, setActiveRole 
  } = useResort();

  const [activeTab, setActiveTab] = useState<'OVERVIEW' | 'ROOMS' | 'PROMOS' | 'MINIBAR' | 'MAINTENANCE' | 'USERS' | 'FINANCIAL' | 'CHATBOT_API'>('OVERVIEW');
  const [d1Users, setD1Users] = useState<any[]>([]);
  const [loadingUsers, setLoadingUsers] = useState(false);
  const [updatingUserId, setUpdatingUserId] = useState<string | null>(null);
  const [roleMessage, setRoleMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  // Modals state: Rooms
  const [showRoomModal, setShowRoomModal] = useState(false);
  const [selectedRoomForEdit, setSelectedRoomForEdit] = useState<Room | null>(null);
  const [selectedRoomForDelete, setSelectedRoomForDelete] = useState<Room | null>(null);

  // Modals state: Promo Codes
  const [showPromoModal, setShowPromoModal] = useState(false);
  const [selectedPromoForEdit, setSelectedPromoForEdit] = useState<PromoCode | null>(null);
  const [selectedPromoForDelete, setSelectedPromoForDelete] = useState<PromoCode | null>(null);

  // Modals state: Minibar
  const [showMinibarModal, setShowMinibarModal] = useState(false);
  const [selectedMinibarForEdit, setSelectedMinibarForEdit] = useState<MinibarItem | null>(null);
  const [selectedMinibarForDelete, setSelectedMinibarForDelete] = useState<MinibarItem | null>(null);
  const [minibarFilter, setMinibarFilter] = useState<'ALL' | 'BEVERAGE' | 'SNACK' | 'AMENITY'>('ALL');

  // Modals state: Maintenance
  const [showMaintenanceModal, setShowMaintenanceModal] = useState(false);
  const [selectedMaintenanceForEdit, setSelectedMaintenanceForEdit] = useState<MaintenanceIssue | null>(null);
  const [selectedMaintenanceForDelete, setSelectedMaintenanceForDelete] = useState<MaintenanceIssue | null>(null);
  const [maintenanceStatusFilter, setMaintenanceStatusFilter] = useState<'ALL' | 'PENDING' | 'RESOLVED'>('ALL');

  // Modals state: Users
  const [showUserModal, setShowUserModal] = useState(false);
  const [selectedUserForDelete, setSelectedUserForDelete] = useState<any | null>(null);

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

  const handleUpdateUserRole = async (userId: string, newRole: string) => {
    setUpdatingUserId(userId);
    setRoleMessage(null);
    try {
      const res = await fetch('/api/users/role', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Admin-Email': currentUser?.email || ''
        },
        body: JSON.stringify({ userId, role: newRole })
      });
      if (res.ok) {
        setD1Users(prev => prev.map(u => u.id === userId ? { ...u, role: newRole } : u));
        setRoleMessage({
          text: `เปลี่ยนบทบาทผู้ใช้เป็น "${newRole}" เรียบร้อยแล้ว (บันทึกลง Cloudflare D1 สำเร็จ)`,
          type: 'success'
        });
        setTimeout(() => setRoleMessage(null), 5000);
      } else {
        const data = await res.json();
        setRoleMessage({
          text: data.error || 'ไม่สามารถเปลี่ยนสิทธิ์ได้',
          type: 'error'
        });
      }
    } catch (err: any) {
      setRoleMessage({
        text: err.message || 'เกิดข้อผิดพลาดในการเชื่อมต่อ',
        type: 'error'
      });
    } finally {
      setUpdatingUserId(null);
    }
  };

  // Defense-in-depth: Block unauthorized users immediately
  const isUserAdmin = currentUser?.role === 'ADMIN' || currentUser?.role === 'MANAGER';
  if (!isUserAdmin) {
    return (
      <div className="bg-white p-8 sm:p-12 rounded-3xl border border-red-200 text-center max-w-lg mx-auto shadow-xl my-8">
        <div className="w-16 h-16 rounded-full bg-red-100 text-red-600 flex items-center justify-center mx-auto mb-4 shadow-xs">
          <ShieldCheck className="w-8 h-8" />
        </div>
        <h3 className="text-xl font-bold text-slate-900 mb-2">403 Access Denied</h3>
        <p className="text-sm text-slate-600 mb-6 leading-relaxed">
          ส่วนนี้สงวนสิทธิ์เฉพาะแอดมิน (Admin) เท่านั้น ห้ามผู้ใช้ทั่วไปเข้าถึง
        </p>
        <button
          onClick={() => setActiveRole('GUEST')}
          className="px-6 py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-xl shadow-xs transition-colors cursor-pointer"
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

  // Filtered Minibar items
  const filteredMinibar = minibarItems.filter(item => {
    if (minibarFilter === 'ALL') return true;
    return item.category === minibarFilter;
  });

  // Filtered Maintenance issues
  const filteredMaintenance = maintenanceIssues.filter(issue => {
    if (maintenanceStatusFilter === 'ALL') return true;
    if (maintenanceStatusFilter === 'PENDING') return issue.status === 'PENDING_REPAIR';
    if (maintenanceStatusFilter === 'RESOLVED') return issue.status === 'RESOLVED';
    return true;
  });

  return (
    <div className="space-y-6">
      
      {/* Header & Sub-Navigation */}
      <div className="bg-white p-5 rounded-2xl shadow-xs border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <BarChart3 className="w-6 h-6 text-teal-600" />
            ภาพรวมผลการดำเนินงาน & การจัดการข้อมูลระบบ (Admin CRUD Hub)
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            ระบบบริหารจัดการแบบครบวงจร: ห้องพัก, โค้ดส่วนลด, มินิบาร์, งานซ่อมบำรุง, บัญชีผู้ใช้งาน และกระทบยอดการเงิน
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleExportCSV}
            className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-xl shadow-xs flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <Download className="w-3.5 h-3.5 text-teal-400" />
            <span>Export CSV</span>
          </button>
        </div>
      </div>

      {/* Admin Tabs */}
      <div className="flex items-center gap-1.5 border-b border-slate-200 pb-2 overflow-x-auto text-xs font-semibold">
        <button
          onClick={() => setActiveTab('OVERVIEW')}
          className={`px-3.5 py-2 rounded-xl transition-all whitespace-nowrap cursor-pointer ${
            activeTab === 'OVERVIEW'
              ? 'bg-teal-700 text-white shadow-xs'
              : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
          }`}
        >
          📊 ภาพรวม KPI & การจอง
        </button>

        <button
          onClick={() => setActiveTab('ROOMS')}
          className={`px-3.5 py-2 rounded-xl transition-all whitespace-nowrap flex items-center gap-1.5 cursor-pointer ${
            activeTab === 'ROOMS'
              ? 'bg-teal-700 text-white shadow-xs'
              : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
          }`}
        >
          <Bed className="w-3.5 h-3.5" />
          <span>จัดการห้องพัก ({rooms.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('PROMOS')}
          className={`px-3.5 py-2 rounded-xl transition-all whitespace-nowrap flex items-center gap-1.5 cursor-pointer ${
            activeTab === 'PROMOS'
              ? 'bg-teal-700 text-white shadow-xs'
              : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
          }`}
        >
          <Tag className="w-3.5 h-3.5" />
          <span>โค้ดส่วนลด ({promoCodes.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('MINIBAR')}
          className={`px-3.5 py-2 rounded-xl transition-all whitespace-nowrap flex items-center gap-1.5 cursor-pointer ${
            activeTab === 'MINIBAR'
              ? 'bg-teal-700 text-white shadow-xs'
              : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
          }`}
        >
          <Wine className="w-3.5 h-3.5" />
          <span>สินค้ามินิบาร์ ({minibarItems.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('MAINTENANCE')}
          className={`px-3.5 py-2 rounded-xl transition-all whitespace-nowrap flex items-center gap-1.5 cursor-pointer ${
            activeTab === 'MAINTENANCE'
              ? 'bg-teal-700 text-white shadow-xs'
              : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
          }`}
        >
          <Wrench className="w-3.5 h-3.5" />
          <span>แจ้งซ่อมบำรุง ({maintenanceIssues.filter(m => m.status === 'PENDING_REPAIR').length})</span>
        </button>

        <button
          onClick={() => setActiveTab('USERS')}
          className={`px-3.5 py-2 rounded-xl transition-all whitespace-nowrap flex items-center gap-1.5 cursor-pointer ${
            activeTab === 'USERS'
              ? 'bg-teal-700 text-white shadow-xs'
              : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
          }`}
        >
          <UserCheck className="w-3.5 h-3.5" />
          <span>บัญชีผู้ใช้ Google (D1)</span>
        </button>

        <button
          onClick={() => setActiveTab('FINANCIAL')}
          className={`px-3.5 py-2 rounded-xl transition-all whitespace-nowrap cursor-pointer ${
            activeTab === 'FINANCIAL'
              ? 'bg-teal-700 text-white shadow-xs'
              : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
          }`}
        >
          💰 กระทบยอดการเงิน
        </button>

        <button
          onClick={() => setActiveTab('CHATBOT_API')}
          className={`px-3.5 py-2 rounded-xl transition-all whitespace-nowrap flex items-center gap-1.5 cursor-pointer ${
            activeTab === 'CHATBOT_API'
              ? 'bg-teal-700 text-white shadow-xs'
              : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
          }`}
        >
          <Bot className="w-3.5 h-3.5" />
          <span>แชทบอท & AI API Hub</span>
        </button>
      </div>

      {/* ==================================================================== */}
      {/* TAB 1: OVERVIEW */}
      {/* ==================================================================== */}
      {activeTab === 'OVERVIEW' && (
        <div className="space-y-6">
          {/* KPI Cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex items-center gap-4">
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

            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex items-center gap-4">
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

            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex items-center gap-4">
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

            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex items-center gap-4">
              <div className="p-3 bg-purple-50 rounded-2xl text-purple-700 shrink-0">
                <Users className="w-6 h-6" />
              </div>
              <div>
                <span className="text-xs text-slate-500 block">จำนวนการจองทั้งหมด</span>
                <span className="text-2xl font-black text-slate-900">{bookings.length}</span>
                <span className="text-[11px] text-purple-700 font-semibold block mt-0.5">
                  เช็คอินอยู่: {bookings.filter(b => b.status === 'CHECKED_IN').length} รายการ
                </span>
              </div>
            </div>
          </div>

          {/* Recent Bookings Table */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
            <div className="p-4 border-b border-slate-100 flex items-center justify-between">
              <h3 className="font-bold text-sm text-slate-900">รายการจองล่าสุด (Live Reservations)</h3>
              <span className="text-xs text-slate-500">{bookings.length} รายการ</span>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-600">
                <thead className="bg-slate-50 text-[11px] font-bold text-slate-500 uppercase tracking-wider border-b border-slate-100">
                  <tr>
                    <th className="px-4 py-3">รหัสการจอง</th>
                    <th className="px-4 py-3">ชื่อผู้เข้าพัก</th>
                    <th className="px-4 py-3">ห้องพัก</th>
                    <th className="px-4 py-3">วันที่เข้าพัก - ออก</th>
                    <th className="px-4 py-3">ยอดรวม</th>
                    <th className="px-4 py-3">สถานะ</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {bookings.slice(0, 8).map(b => (
                    <tr key={b.id} className="hover:bg-slate-50/60">
                      <td className="px-4 py-3 font-mono font-bold text-slate-900">{b.bookingCode}</td>
                      <td className="px-4 py-3 font-medium text-slate-800">{b.guestName}</td>
                      <td className="px-4 py-3 font-semibold text-teal-800">{b.roomNumber}</td>
                      <td className="px-4 py-3 text-slate-500">{b.checkInDate} ถึง {b.checkOutDate}</td>
                      <td className="px-4 py-3 font-bold text-slate-900">฿{b.totalAmount.toLocaleString()}</td>
                      <td className="px-4 py-3">
                        <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                          b.status === 'CHECKED_IN' ? 'bg-purple-100 text-purple-800' :
                          b.status === 'CONFIRMED' ? 'bg-emerald-100 text-emerald-800' :
                          b.status === 'CHECKED_OUT' ? 'bg-slate-100 text-slate-700' :
                          b.status === 'CANCELLED' ? 'bg-red-100 text-red-700' :
                          'bg-amber-100 text-amber-800'
                        }`}>
                          {b.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ==================================================================== */}
      {/* TAB 2: ROOMS CRUD */}
      {/* ==================================================================== */}
      {activeTab === 'ROOMS' && (
        <div className="space-y-4">
          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <Bed className="w-5 h-5 text-teal-600" />
                <span>จัดการข้อมูลห้องพัก (Rooms CRUD)</span>
                <span className="text-xs bg-teal-50 text-teal-700 font-semibold px-2 py-0.5 rounded-full border border-teal-200">
                  {rooms.length} ห้อง
                </span>
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                เพิ่ม แก้ไข ปรับราคา และลบห้องพัก พร้อมเชื่อมต่อ Cloudflare D1
              </p>
            </div>

            <button
              onClick={() => {
                setSelectedRoomForEdit(null);
                setShowRoomModal(true);
              }}
              className="px-4 py-2 bg-teal-700 hover:bg-teal-800 text-white text-xs font-bold rounded-xl shadow-xs flex items-center gap-1.5 transition-colors cursor-pointer self-start sm:self-auto"
            >
              <Plus className="w-4 h-4" />
              <span>เพิ่มห้องพักใหม่ (Create Room)</span>
            </button>
          </div>

          {/* Rooms Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {rooms.map(room => (
              <div 
                key={room.id}
                className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs hover:shadow-md transition-all flex flex-col justify-between"
              >
                <div>
                  {/* Image & Badges */}
                  <div className="relative h-44 overflow-hidden bg-slate-100">
                    <img
                      src={room.images[0] || 'https://images.unsplash.com/photo-1580587771525-78b9dba3b914?auto=format&fit=crop&w=1200&q=80'}
                      alt={room.name}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute top-2.5 left-2.5 flex items-center gap-1.5">
                      <span className="px-2.5 py-1 bg-slate-900/80 backdrop-blur-xs text-white font-mono font-bold text-xs rounded-lg shadow-xs">
                        {room.roomNumber}
                      </span>
                      <span className={`px-2 py-0.5 text-[10px] font-bold rounded-full ${
                        room.type === 'POOL_VILLA' ? 'bg-teal-600 text-white' :
                        room.type === 'BEACHFRONT_SUITE' ? 'bg-blue-600 text-white' :
                        room.type === 'GARDEN_BUNGALOW' ? 'bg-emerald-600 text-white' :
                        'bg-slate-700 text-white'
                      }`}>
                        {room.type}
                      </span>
                    </div>

                    <div className="absolute top-2.5 right-2.5">
                      <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold shadow-xs ${
                        room.status === 'VACANT_CLEAN' ? 'bg-emerald-500 text-white' :
                        room.status === 'OCCUPIED' ? 'bg-purple-600 text-white' :
                        room.status === 'VACANT_DIRTY' ? 'bg-amber-500 text-white' :
                        room.status === 'CLEANING' ? 'bg-blue-500 text-white' :
                        'bg-red-500 text-white'
                      }`}>
                        {room.status === 'VACANT_CLEAN' ? '🟢 พร้อมขาย' :
                         room.status === 'OCCUPIED' ? '🟣 มีแขกพัก' :
                         room.status === 'VACANT_DIRTY' ? '🟡 รอทำความสะอาด' :
                         room.status === 'CLEANING' ? '🔵 กำลังทำความสะอาด' : '🔴 ปิดซ่อม'}
                      </span>
                    </div>
                  </div>

                  {/* Room Details */}
                  <div className="p-4 space-y-2">
                    <h4 className="font-bold text-sm text-slate-900 leading-tight">
                      {room.name}
                    </h4>
                    <p className="text-[11px] text-slate-400 font-normal">
                      {room.nameEn}
                    </p>

                    <div className="grid grid-cols-2 gap-2 text-xs text-slate-600 pt-2 border-t border-slate-100">
                      <div>
                        <span className="text-[10px] text-slate-400 block">ราคาปกติ:</span>
                        <span className="font-bold text-teal-800 text-sm">฿{room.basePrice.toLocaleString()}</span>
                        <span className="text-[10px] text-slate-400">/คืน</span>
                      </div>
                      <div>
                        <span className="text-[10px] text-slate-400 block">ราคาสุดสัปดาห์:</span>
                        <span className="font-bold text-indigo-800 text-sm">฿{room.weekendPrice.toLocaleString()}</span>
                        <span className="text-[10px] text-slate-400">/คืน</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 text-[11px] text-slate-500 pt-1">
                      <span>👥 พักได้ {room.capacity} ท่าน</span>
                      <span>📏 {room.sizeSqM} ตร.ม.</span>
                      <span>🛏️ {room.bedType}</span>
                    </div>
                  </div>
                </div>

                {/* Card Actions */}
                <div className="p-3 bg-slate-50 border-t border-slate-100 flex items-center justify-between gap-2">
                  <select
                    value={room.status}
                    onChange={(e) => updateRoomStatus(room.id, e.target.value as Room['status'])}
                    className="text-[11px] font-semibold px-2 py-1 bg-white border border-slate-300 rounded-lg cursor-pointer"
                  >
                    <option value="VACANT_CLEAN">🟢 ว่าง สะอาด</option>
                    <option value="VACANT_DIRTY">🟡 รอทำความสะอาด</option>
                    <option value="CLEANING">🔵 กำลังทำความสะอาด</option>
                    <option value="OCCUPIED">🟣 มีแขกเข้าพัก</option>
                    <option value="MAINTENANCE">🔴 ปิดซ่อมบำรุง</option>
                  </select>

                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => {
                        setSelectedRoomForEdit(room);
                        setShowRoomModal(true);
                      }}
                      className="p-1.5 text-teal-700 hover:bg-teal-100 rounded-lg transition-colors cursor-pointer"
                      title="แก้ไขข้อมูลห้องพัก"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => setSelectedRoomForDelete(room)}
                      className="p-1.5 text-red-600 hover:bg-red-100 rounded-lg transition-colors cursor-pointer"
                      title="ลบห้องพักนี้"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ==================================================================== */}
      {/* TAB 3: PROMO CODE CRUD */}
      {/* ==================================================================== */}
      {activeTab === 'PROMOS' && (
        <div className="space-y-4">
          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <Tag className="w-5 h-5 text-teal-600" />
                <span>จัดการโค้ดโปรโมชัน & ส่วนลด (Promo Codes CRUD)</span>
                <span className="text-xs bg-amber-50 text-amber-700 font-semibold px-2 py-0.5 rounded-full border border-amber-200">
                  {promoCodes.length} โค้ด
                </span>
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                สร้าง แก้ไข และลบโค้ดโปรโมชัน พร้อมปุ่มสลับสถานะเปิด/ปิดการใช้งานทันที
              </p>
            </div>

            <button
              onClick={() => {
                setSelectedPromoForEdit(null);
                setShowPromoModal(true);
              }}
              className="px-4 py-2 bg-teal-700 hover:bg-teal-800 text-white text-xs font-bold rounded-xl shadow-xs flex items-center gap-1.5 transition-colors cursor-pointer self-start sm:self-auto"
            >
              <Plus className="w-4 h-4" />
              <span>สร้างโค้ดโปรโมชันใหม่</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {promoCodes.map(promo => (
              <div 
                key={promo.code} 
                className="p-5 bg-white rounded-2xl border border-slate-200 shadow-xs flex flex-col justify-between hover:shadow-md transition-shadow"
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-lg font-black tracking-wider text-teal-800 bg-teal-50 px-2.5 py-0.5 rounded-lg border border-teal-200">
                      {promo.code}
                    </span>
                    <button
                      onClick={() => togglePromoCode(promo.code)}
                      className={`text-xs px-2.5 py-0.5 rounded-full font-bold transition-colors cursor-pointer ${
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

                <div className="pt-3 border-t border-slate-100 text-xs text-slate-500 space-y-2">
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

                  {/* Actions */}
                  <div className="pt-2 border-t border-slate-100 flex items-center justify-end gap-1.5">
                    <button
                      onClick={() => {
                        setSelectedPromoForEdit(promo);
                        setShowPromoModal(true);
                      }}
                      className="px-2.5 py-1 text-teal-700 hover:bg-teal-50 rounded-lg text-xs font-semibold flex items-center gap-1 transition-colors cursor-pointer"
                    >
                      <Edit2 className="w-3 h-3" />
                      <span>แก้ไข</span>
                    </button>
                    <button
                      onClick={() => setSelectedPromoForDelete(promo)}
                      className="px-2.5 py-1 text-red-600 hover:bg-red-50 rounded-lg text-xs font-semibold flex items-center gap-1 transition-colors cursor-pointer"
                    >
                      <Trash2 className="w-3 h-3" />
                      <span>ลบ</span>
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ==================================================================== */}
      {/* TAB 4: MINIBAR CRUD */}
      {/* ==================================================================== */}
      {activeTab === 'MINIBAR' && (
        <div className="space-y-4">
          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <Wine className="w-5 h-5 text-indigo-600" />
                <span>จัดการสินค้ามินิบาร์ (Minibar Items CRUD)</span>
                <span className="text-xs bg-indigo-50 text-indigo-700 font-semibold px-2 py-0.5 rounded-full border border-indigo-200">
                  {minibarItems.length} รายการ
                </span>
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                รายการเครื่องดื่ม ขนม และสิ่งอำนวยความสะดวกที่คิดค่าบริการในห้องพัก
              </p>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => {
                  setSelectedMinibarForEdit(null);
                  setShowMinibarModal(true);
                }}
                className="px-4 py-2 bg-teal-700 hover:bg-teal-800 text-white text-xs font-bold rounded-xl shadow-xs flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>เพิ่มสินค้ามินิบาร์</span>
              </button>
            </div>
          </div>

          {/* Category Filter Pills */}
          <div className="flex items-center gap-2">
            {[
              { id: 'ALL', label: 'ทั้งหมด' },
              { id: 'BEVERAGE', label: '🥤 เครื่องดื่ม' },
              { id: 'SNACK', label: '🍪 ของว่าง' },
              { id: 'AMENITY', label: '🧴 ของใช้ & สปา' }
            ].map(cat => (
              <button
                key={cat.id}
                onClick={() => setMinibarFilter(cat.id as any)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  minibarFilter === cat.id
                    ? 'bg-slate-900 text-white shadow-xs'
                    : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>

          {/* Minibar Table */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-600">
                <thead className="bg-slate-50 text-[11px] font-bold text-slate-500 uppercase tracking-wider border-b border-slate-100">
                  <tr>
                    <th className="px-5 py-3.5">ชื่อสินค้า</th>
                    <th className="px-5 py-3.5">ชื่อภาษาอังกฤษ</th>
                    <th className="px-5 py-3.5">หมวดหมู่</th>
                    <th className="px-5 py-3.5">ราคา (บาท)</th>
                    <th className="px-5 py-3.5">หน่วยนับ</th>
                    <th className="px-5 py-3.5 text-right">การจัดการ</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-medium">
                  {filteredMinibar.map(item => (
                    <tr key={item.id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="px-5 py-3.5 font-bold text-slate-900">
                        {item.name}
                      </td>
                      <td className="px-5 py-3.5 text-slate-500">
                        {item.nameEn}
                      </td>
                      <td className="px-5 py-3.5">
                        <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                          item.category === 'BEVERAGE' ? 'bg-blue-100 text-blue-800' :
                          item.category === 'SNACK' ? 'bg-amber-100 text-amber-800' :
                          'bg-purple-100 text-purple-800'
                        }`}>
                          {item.category === 'BEVERAGE' ? 'เครื่องดื่ม' : item.category === 'SNACK' ? 'ของว่าง' : 'ของใช้'}
                        </span>
                      </td>
                      <td className="px-5 py-3.5 font-bold text-teal-800 text-sm">
                        ฿{item.price.toLocaleString()}
                      </td>
                      <td className="px-5 py-3.5 text-slate-500">
                        {item.unit}
                      </td>
                      <td className="px-5 py-3.5 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => {
                              setSelectedMinibarForEdit(item);
                              setShowMinibarModal(true);
                            }}
                            className="p-1.5 text-teal-700 hover:bg-teal-50 rounded-lg transition-colors cursor-pointer"
                            title="แก้ไขสินค้า"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => setSelectedMinibarForDelete(item)}
                            className="p-1.5 text-red-600 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
                            title="ลบสินค้านี้"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ==================================================================== */}
      {/* TAB 5: MAINTENANCE CRUD */}
      {/* ==================================================================== */}
      {activeTab === 'MAINTENANCE' && (
        <div className="space-y-4">
          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <Wrench className="w-5 h-5 text-red-600" />
                <span>รายการแจ้งซ่อมบำรุงห้องพัก (Maintenance Tickets CRUD)</span>
                <span className="text-xs bg-red-50 text-red-700 font-semibold px-2 py-0.5 rounded-full border border-red-200">
                  {maintenanceIssues.length} รายการ
                </span>
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                บันทึกการแจ้งซ่อม มอบหมายงานช่าง และปรับสถานะห้องพักอัตโนมัติ
              </p>
            </div>

            <button
              onClick={() => {
                setSelectedMaintenanceForEdit(null);
                setShowMaintenanceModal(true);
              }}
              className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white text-xs font-bold rounded-xl shadow-xs flex items-center gap-1.5 transition-colors cursor-pointer self-start sm:self-auto"
            >
              <Plus className="w-4 h-4" />
              <span>สร้างรายการแจ้งซ่อมใหม่</span>
            </button>
          </div>

          {/* Status Filter Pills */}
          <div className="flex items-center gap-2">
            {[
              { id: 'ALL', label: 'ทั้งหมด' },
              { id: 'PENDING', label: '🔴 รอช่างซ่อม' },
              { id: 'RESOLVED', label: '🟢 ซ่อมเสร็จแล้ว' }
            ].map(f => (
              <button
                key={f.id}
                onClick={() => setMaintenanceStatusFilter(f.id as any)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  maintenanceStatusFilter === f.id
                    ? 'bg-slate-900 text-white shadow-xs'
                    : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>

          {filteredMaintenance.length === 0 ? (
            <div className="text-center py-10 bg-white rounded-2xl border border-slate-200 p-6 text-slate-400 text-xs">
              ยังไม่มีประวัติการแจ้งซ่อมบำรุงตามเงื่อนไขที่เลือก
            </div>
          ) : (
            <div className="space-y-3">
              {filteredMaintenance.map(issue => (
                <div key={issue.id} className="p-4 bg-white rounded-2xl border border-slate-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-slate-900 text-sm">
                        ห้อง {issue.roomNumber}
                      </span>
                      {issue.status === 'PENDING_REPAIR' ? (
                        <span className="px-2.5 py-0.5 bg-red-100 text-red-700 rounded-full font-bold text-[10px]">
                          รอช่างเข้าซ่อม
                        </span>
                      ) : (
                        <span className="px-2.5 py-0.5 bg-emerald-100 text-emerald-700 rounded-full font-bold text-[10px]">
                          ✓ ซ่อมเสร็จแล้ว
                        </span>
                      )}
                    </div>
                    <p className="text-slate-700 mt-1 font-medium">{issue.issueDescription}</p>
                    <span className="text-[11px] text-slate-400 block mt-1">
                      แจ้งโดย: {issue.reportedBy} เมื่อ {issue.reportedAt} {issue.resolvedAt && `| เสร็จสิ้น: ${issue.resolvedAt}`}
                    </span>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    {issue.status === 'PENDING_REPAIR' && (
                      <button
                        onClick={() => {
                          resolveMaintenance(issue.id);
                          alert(`บันทึกการซ่อมห้อง ${issue.roomNumber} เสร็จสิ้น! ปรับสถานะห้องเป็นรอทำความสะอาด (Vacant Dirty) แล้ว`);
                        }}
                        className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl shadow-xs text-xs flex items-center gap-1.5 cursor-pointer"
                      >
                        <Check className="w-3.5 h-3.5" />
                        <span>ช่างซ่อมเสร็จแล้ว</span>
                      </button>
                    )}

                    <button
                      onClick={() => {
                        setSelectedMaintenanceForEdit(issue);
                        setShowMaintenanceModal(true);
                      }}
                      className="p-1.5 text-teal-700 hover:bg-teal-50 rounded-lg transition-colors cursor-pointer"
                      title="แก้ไขรายการแจ้งซ่อม"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>

                    <button
                      onClick={() => setSelectedMaintenanceForDelete(issue)}
                      className="p-1.5 text-red-600 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
                      title="ลบรายการแจ้งซ่อมนี้"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ==================================================================== */}
      {/* TAB 6: USERS CRUD */}
      {/* ==================================================================== */}
      {activeTab === 'USERS' && (
        <div className="space-y-4">
          <div className="bg-white p-4 rounded-2xl shadow-xs border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-purple-100 text-purple-700 flex items-center justify-center shrink-0">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-slate-900 text-base flex items-center gap-2">
                  <span>ผู้ใช้งานและสิทธิ์ในระบบ (Users & Roles CRUD)</span>
                  <span className="text-xs bg-emerald-50 text-emerald-700 font-semibold px-2 py-0.5 rounded-full border border-emerald-200">
                    Live Cloudflare D1
                  </span>
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  ตาราง users ในฐานข้อมูล D1 (resort-db) พร้อมสิทธิ์การใช้งาน Role-Based Access Control
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={fetchUsers}
                disabled={loadingUsers}
                className="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl transition-colors flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${loadingUsers ? 'animate-spin' : ''}`} />
                <span>รีเฟรช</span>
              </button>

              <button
                onClick={() => setShowUserModal(true)}
                className="px-4 py-2 bg-purple-700 hover:bg-purple-800 text-white text-xs font-bold rounded-xl shadow-xs flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>เพิ่ม/เชิญผู้ใช้งานใหม่</span>
              </button>
            </div>
          </div>

          {roleMessage && (
            <div className={`p-3 rounded-xl text-xs font-semibold flex items-center gap-2 ${
              roleMessage.type === 'success' ? 'bg-emerald-50 text-emerald-800 border border-emerald-200' : 'bg-red-50 text-red-800 border border-red-200'
            }`}>
              {roleMessage.type === 'success' ? <Check className="w-4 h-4 text-emerald-600" /> : <AlertTriangle className="w-4 h-4 text-red-600" />}
              <span>{roleMessage.text}</span>
            </div>
          )}

          <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-600">
                <thead className="bg-slate-50 text-[11px] font-bold text-slate-500 uppercase tracking-wider border-b border-slate-100">
                  <tr>
                    <th className="px-5 py-3.5">ผู้ใช้งาน (User)</th>
                    <th className="px-5 py-3.5">อีเมล (Email)</th>
                    <th className="px-5 py-3.5">สิทธิ์การใช้งาน (Role)</th>
                    <th className="px-5 py-3.5">จัดการสิทธิ์ (Change Role)</th>
                    <th className="px-5 py-3.5">เข้าสู่ระบบล่าสุด (Last Login)</th>
                    <th className="px-5 py-3.5 text-right">การจัดการ</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-medium">
                  {d1Users.map(user => {
                    const isSuperAdmin = user.email === '674295027@parichat.skru.ac.th' || user.email === 'seree9999@gmail.com';
                    return (
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
                              user.role === 'ADMIN' || user.role === 'MANAGER'
                                ? 'bg-purple-100 text-purple-800 border-purple-200'
                                : user.role === 'FRONT_DESK'
                                ? 'bg-teal-100 text-teal-800 border-teal-200'
                                : user.role === 'HOUSEKEEPER'
                                ? 'bg-amber-100 text-amber-800 border-amber-200'
                                : 'bg-slate-100 text-slate-700 border-slate-200'
                            }`}
                          >
                            {user.role === 'ADMIN' || user.role === 'MANAGER'
                              ? 'ADMIN'
                              : user.role === 'FRONT_DESK'
                              ? 'FRONT_DESK'
                              : user.role === 'HOUSEKEEPER'
                              ? 'HOUSEKEEPER'
                              : 'ทั่วไป'}
                          </span>
                        </td>
                        <td className="px-5 py-3.5">
                          <div className="flex items-center gap-2">
                            <select
                              value={user.role === 'MANAGER' ? 'ADMIN' : user.role}
                              disabled={isSuperAdmin || updatingUserId === user.id}
                              onChange={(e) => handleUpdateUserRole(user.id, e.target.value)}
                              className="text-[11px] font-bold px-2 py-1 rounded-lg border bg-slate-50 border-slate-300 disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer"
                            >
                              <option value="ADMIN">👑 แอดมิน (ADMIN)</option>
                              <option value="FRONT_DESK">🛎️ แผนกต้อนรับ (FRONT_DESK)</option>
                              <option value="HOUSEKEEPER">🧹 แม่บ้าน (HOUSEKEEPER)</option>
                              <option value="GUEST">👤 ทั่วไป (GUEST/USER)</option>
                            </select>
                            {updatingUserId === user.id && (
                              <RefreshCw className="w-3.5 h-3.5 animate-spin text-teal-600 shrink-0" />
                            )}
                          </div>
                        </td>
                        <td className="px-5 py-3.5 text-slate-500 text-[11px]">
                          {user.last_login_at ? new Date(user.last_login_at).toLocaleString('th-TH') : '-'}
                        </td>
                        <td className="px-5 py-3.5 text-right">
                          <button
                            onClick={() => setSelectedUserForDelete(user)}
                            disabled={isSuperAdmin}
                            className="p-1.5 text-red-600 hover:bg-red-50 rounded-lg transition-colors cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed"
                            title={isSuperAdmin ? 'ไม่อนุญาตให้ลบ Super Admin' : 'ลบผู้ใช้นี้'}
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ==================================================================== */}
      {/* TAB 7: FINANCIAL RECONCILIATION */}
      {/* ==================================================================== */}
      {activeTab === 'FINANCIAL' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-5 bg-white rounded-2xl border border-slate-200 shadow-xs space-y-3">
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

            <div className="p-5 bg-white rounded-2xl border border-slate-200 shadow-xs space-y-3">
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

            <div className="p-5 bg-white rounded-2xl border border-slate-200 shadow-xs space-y-3">
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

      {/* ==================================================================== */}
      {/* TAB 8: CHATBOT API & AI HUB */}
      {/* ==================================================================== */}
      {activeTab === 'CHATBOT_API' && (
        <ChatbotApiManager />
      )}

      {/* ==================================================================== */}
      {/* MODALS */}
      {/* ==================================================================== */}
      
      {/* Room CRUD Modal */}
      <RoomCrudModal
        isOpen={showRoomModal}
        room={selectedRoomForEdit}
        onClose={() => {
          setShowRoomModal(false);
          setSelectedRoomForEdit(null);
        }}
        onSave={async (roomData) => {
          if (selectedRoomForEdit) {
            await updateRoom(roomData);
          } else {
            await addRoom(roomData);
          }
        }}
      />

      {/* Room Delete Confirm Modal */}
      <DeleteConfirmModal
        isOpen={Boolean(selectedRoomForDelete)}
        title="ยืนยันการลบห้องพัก"
        message={`คุณแน่ใจหรือไม่ว่าต้องการลบห้อง "${selectedRoomForDelete?.roomNumber} - ${selectedRoomForDelete?.name}"? การลบนี้จะมีผลกับฐานข้อมูล Cloudflare D1 ทันที`}
        onConfirm={async () => {
          if (selectedRoomForDelete) {
            await deleteRoom(selectedRoomForDelete.id);
            setSelectedRoomForDelete(null);
          }
        }}
        onCancel={() => setSelectedRoomForDelete(null)}
      />

      {/* Promo CRUD Modal */}
      <PromoCrudModal
        isOpen={showPromoModal}
        promo={selectedPromoForEdit}
        onClose={() => {
          setShowPromoModal(false);
          setSelectedPromoForEdit(null);
        }}
        onSave={async (promoData) => {
          if (selectedPromoForEdit) {
            await updatePromoCode(promoData);
          } else {
            await addPromoCode(promoData);
          }
        }}
      />

      {/* Promo Delete Confirm Modal */}
      <DeleteConfirmModal
        isOpen={Boolean(selectedPromoForDelete)}
        title="ยืนยันการลบโค้ดโปรโมชัน"
        message={`คุณแน่ใจหรือไม่ว่าต้องการลบโค้ดส่วนลด "${selectedPromoForDelete?.code}"? การลบจะมีผลกับฐานข้อมูลทันที`}
        onConfirm={async () => {
          if (selectedPromoForDelete) {
            await deletePromoCode(selectedPromoForDelete.code);
            setSelectedPromoForDelete(null);
          }
        }}
        onCancel={() => setSelectedPromoForDelete(null)}
      />

      {/* Minibar CRUD Modal */}
      <MinibarCrudModal
        isOpen={showMinibarModal}
        item={selectedMinibarForEdit}
        onClose={() => {
          setShowMinibarModal(false);
          setSelectedMinibarForEdit(null);
        }}
        onSave={async (itemData) => {
          if (selectedMinibarForEdit) {
            await updateMinibarItem(itemData);
          } else {
            await addMinibarItem(itemData);
          }
        }}
      />

      {/* Minibar Delete Confirm Modal */}
      <DeleteConfirmModal
        isOpen={Boolean(selectedMinibarForDelete)}
        title="ยืนยันการลบสินค้ามินิบาร์"
        message={`คุณแน่ใจหรือไม่ว่าต้องการลบสินค้า "${selectedMinibarForDelete?.name}"? การลบจะมีผลกับฐานข้อมูลทันที`}
        onConfirm={async () => {
          if (selectedMinibarForDelete) {
            await deleteMinibarItem(selectedMinibarForDelete.id);
            setSelectedMinibarForDelete(null);
          }
        }}
        onCancel={() => setSelectedMinibarForDelete(null)}
      />

      {/* Maintenance CRUD Modal */}
      <MaintenanceCrudModal
        isOpen={showMaintenanceModal}
        issue={selectedMaintenanceForEdit}
        rooms={rooms}
        onClose={() => {
          setShowMaintenanceModal(false);
          setSelectedMaintenanceForEdit(null);
        }}
        onSave={async (issueData) => {
          if (issueData.id) {
            await updateMaintenance(issueData.id, issueData.issueDescription, issueData.status);
          } else {
            reportMaintenance(issueData.roomId, issueData.issueDescription, issueData.reportedBy);
          }
        }}
      />

      {/* Maintenance Delete Confirm Modal */}
      <DeleteConfirmModal
        isOpen={Boolean(selectedMaintenanceForDelete)}
        title="ยืนยันการลบรายการแจ้งซ่อม"
        message={`คุณแน่ใจหรือไม่ว่าต้องการลบรายการแจ้งซ่อมห้อง "${selectedMaintenanceForDelete?.roomNumber}" (${selectedMaintenanceForDelete?.issueDescription})?`}
        onConfirm={async () => {
          if (selectedMaintenanceForDelete) {
            await deleteMaintenance(selectedMaintenanceForDelete.id);
            setSelectedMaintenanceForDelete(null);
          }
        }}
        onCancel={() => setSelectedMaintenanceForDelete(null)}
      />

      {/* User Create Modal */}
      <UserCrudModal
        isOpen={showUserModal}
        onClose={() => setShowUserModal(false)}
        onSave={async (userData) => {
          const res = await fetch('/api/users', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'X-Admin-Email': currentUser?.email || ''
            },
            body: JSON.stringify(userData)
          });
          if (res.ok) {
            alert(`เพิ่ม/กำหนดสิทธิ์ผู้ใช้งาน ${userData.email} สำเร็จ!`);
            fetchUsers();
          } else {
            const data = await res.json().catch(() => ({}));
            throw new Error(data.error || 'เกิดข้อผิดพลาดในการเพิ่มผู้ใช้');
          }
        }}
      />

      {/* User Delete Confirm Modal */}
      <DeleteConfirmModal
        isOpen={Boolean(selectedUserForDelete)}
        title="ยืนยันการลบบัญชีผู้ใช้งาน"
        message={`คุณแน่ใจหรือไม่ว่าต้องการลบผู้ใช้งาน "${selectedUserForDelete?.name}" (${selectedUserForDelete?.email}) ออกจากระบบ?`}
        onConfirm={async () => {
          if (selectedUserForDelete) {
            try {
              const res = await fetch(`/api/users?id=${encodeURIComponent(selectedUserForDelete.id)}`, {
                method: 'DELETE',
                headers: {
                  'X-Admin-Email': currentUser?.email || ''
                }
              });
              if (res.ok) {
                alert(`ลบผู้ใช้ ${selectedUserForDelete.email} สำเร็จ`);
                fetchUsers();
              } else {
                const data = await res.json().catch(() => ({}));
                alert(data.error || 'ไม่สามารถลบผู้ใช้ได้');
              }
            } catch (err: any) {
              alert(err.message || 'เกิดข้อผิดพลาดในการลบ');
            }
            setSelectedUserForDelete(null);
          }
        }}
        onCancel={() => setSelectedUserForDelete(null)}
      />

    </div>
  );
};

export default PricingManager;
