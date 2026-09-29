import React, { useState } from 'react';
import { useResort } from '../context/ResortContext';
import { UserRole } from '../types';
import { StaffAuthModal } from './common/StaffAuthModal';
import { 
  Palmtree, User, Hotel, Sparkles, BarChart3, 
  RefreshCw, Search, Bell, Lock, Unlock 
} from 'lucide-react';

interface NavbarProps {
  onOpenMyBookings: () => void;
  onOpenNotifications: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ onOpenMyBookings, onOpenNotifications }) => {
  const { 
    activeRole, setActiveRole, resetAllData, 
    language, setLanguage, notifications,
    isStaffAuthenticated, logoutStaff 
  } = useResort();

  const isEn = language === 'en';

  const [showStaffAuthModal, setShowStaffAuthModal] = useState<boolean>(false);
  const [pendingRole, setPendingRole] = useState<UserRole | null>(null);

  const roleOptions: { 
    role: UserRole; 
    shortLabel: string; 
    fullLabel: string; 
    icon: React.ReactNode 
  }[] = [
    { 
      role: 'GUEST', 
      shortLabel: isEn ? 'Guest' : 'ลูกค้า', 
      fullLabel: isEn ? 'Guest View' : 'ลูกค้า (Guest)', 
      icon: <User className="w-3.5 h-3.5" /> 
    },
    { 
      role: 'FRONT_DESK', 
      shortLabel: isEn ? 'Front Desk' : 'ฟร้อนท์', 
      fullLabel: isEn ? 'Front Desk' : 'ฟร้อนท์ (Front Desk)', 
      icon: <Hotel className="w-3.5 h-3.5" /> 
    },
    { 
      role: 'HOUSEKEEPER', 
      shortLabel: isEn ? 'Housekeeping' : 'แม่บ้าน', 
      fullLabel: isEn ? 'Housekeeping' : 'งานแม่บ้าน', 
      icon: <Sparkles className="w-3.5 h-3.5" /> 
    },
    { 
      role: 'MANAGER', 
      shortLabel: isEn ? 'Admin' : 'ผู้จัดการ', 
      fullLabel: isEn ? 'Admin & Reports' : 'ผู้จัดการ (Admin)', 
      icon: <BarChart3 className="w-3.5 h-3.5" /> 
    }
  ];

  const handleRoleSelect = (role: UserRole) => {
    if (role === 'GUEST') {
      setActiveRole('GUEST');
      return;
    }

    if (isStaffAuthenticated) {
      setActiveRole(role);
    } else {
      setPendingRole(role);
      setShowStaffAuthModal(true);
    }
  };

  return (
    <>
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200 shadow-xs">
        <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 sm:h-20 gap-2">
            
            {/* Logo & Resort Name */}
            <div 
              className="flex items-center gap-2.5 sm:gap-3 cursor-pointer shrink-0" 
              onClick={() => setActiveRole('GUEST')}
            >
              <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-2xl bg-gradient-to-tr from-teal-700 via-teal-600 to-teal-500 flex items-center justify-center text-white shadow-md shadow-teal-500/20 shrink-0">
                <Palmtree className="w-6 h-6" />
              </div>
              <div className="min-w-0">
                <h1 className="text-base sm:text-lg font-bold tracking-tight text-slate-900 flex items-center gap-1.5 whitespace-nowrap">
                  <span>THE HAVEN</span>
                  <span className="text-teal-700 text-[10px] sm:text-xs font-semibold uppercase tracking-wider bg-teal-50 px-2 py-0.5 rounded-full border border-teal-200">
                    Resort & Villas
                  </span>
                </h1>
                <p className="text-[11px] text-slate-400 font-normal hidden lg:block truncate max-w-xs">
                  {isEn ? 'Edge Resort Management & Booking System' : 'ระบบบริหารจัดการและจองห้องพักบน Cloudflare Edge'}
                </p>
              </div>
            </div>

            {/* Navigation & Controls on Single Neat Line */}
            <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
              
              {/* My Bookings Lookup Button */}
              <button
                onClick={onOpenMyBookings}
                className="px-2.5 sm:px-3 py-1.5 bg-teal-50 hover:bg-teal-100 text-teal-800 border border-teal-200 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors whitespace-nowrap shrink-0"
                title={isEn ? 'Lookup My Bookings' : 'ค้นหาการจองของฉัน'}
              >
                <Search className="w-3.5 h-3.5 text-teal-600 shrink-0" />
                <span className="hidden md:inline whitespace-nowrap">
                  {isEn ? 'My Bookings' : 'การจองของฉัน'}
                </span>
              </button>

              {/* Notification Center Trigger */}
              <button
                onClick={onOpenNotifications}
                className="relative p-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl transition-colors shrink-0"
                title={isEn ? 'Dispatched Notifications Log' : 'ประวัติการส่ง SMS & Email'}
              >
                <Bell className="w-4 h-4 text-slate-700 shrink-0" />
                {notifications.length > 0 && (
                  <span className="absolute -top-1 -right-1 bg-teal-600 text-white font-bold text-[9px] w-4 h-4 rounded-full flex items-center justify-center shadow-xs">
                    {notifications.length > 9 ? '9+' : notifications.length}
                  </span>
                )}
              </button>

              {/* Language Switcher */}
              <div className="flex items-center bg-slate-100 p-0.5 rounded-xl border border-slate-200/80 shrink-0">
                <button
                  onClick={() => setLanguage('th')}
                  className={`px-1.5 sm:px-2 py-1 rounded-lg text-xs font-bold transition-all flex items-center gap-1 whitespace-nowrap ${
                    language === 'th'
                      ? 'bg-white text-slate-900 shadow-xs'
                      : 'text-slate-500 hover:text-slate-900'
                  }`}
                  title="ภาษาไทย"
                >
                  <span>🇹🇭</span>
                  <span className="text-[11px]">TH</span>
                </button>
                <button
                  onClick={() => setLanguage('en')}
                  className={`px-1.5 sm:px-2 py-1 rounded-lg text-xs font-bold transition-all flex items-center gap-1 whitespace-nowrap ${
                    language === 'en'
                      ? 'bg-white text-slate-900 shadow-xs'
                      : 'text-slate-500 hover:text-slate-900'
                  }`}
                  title="English"
                >
                  <span>🇬🇧</span>
                  <span className="text-[11px]">EN</span>
                </button>
              </div>

              {/* Staff Authentication Status & Lock Button */}
              {isStaffAuthenticated && (
                <button
                  onClick={logoutStaff}
                  className="px-2 sm:px-2.5 py-1.5 bg-red-50 hover:bg-red-100 text-red-700 border border-red-200 rounded-xl text-xs font-bold flex items-center gap-1 transition-colors whitespace-nowrap shrink-0"
                  title={isEn ? 'Lock staff session & return to guest view' : 'ล็อกเซสชันเจ้าหน้าที่ และกลับสู่มุมมองลูกค้า'}
                >
                  <Lock className="w-3.5 h-3.5 text-red-600 shrink-0" />
                  <span className="whitespace-nowrap hidden sm:inline">
                    {isEn ? 'Lock' : 'ล็อกพนักงาน'}
                  </span>
                </button>
              )}

              {/* Role Options */}
              <nav className="flex items-center p-1 bg-slate-100 rounded-xl border border-slate-200/80 shrink-0">
                {roleOptions.map(item => {
                  const isActive = activeRole === item.role;
                  const isStaffRole = item.role !== 'GUEST';
                  return (
                    <button
                      key={item.role}
                      onClick={() => handleRoleSelect(item.role)}
                      title={item.fullLabel}
                      className={`flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 text-xs font-medium rounded-lg transition-all duration-200 whitespace-nowrap shrink-0 ${
                        isActive
                          ? 'bg-white text-teal-800 shadow-xs font-bold border border-slate-200/60'
                          : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
                      }`}
                    >
                      <span className={isActive ? 'text-teal-600' : 'text-slate-400'}>{item.icon}</span>
                      <span className="whitespace-nowrap">{item.shortLabel}</span>
                      {isStaffRole && !isStaffAuthenticated && (
                        <Lock className="w-2.5 h-2.5 text-slate-400 ml-0.5 shrink-0" />
                      )}
                      {isStaffRole && isStaffAuthenticated && (
                        <Unlock className="w-2.5 h-2.5 text-teal-600 ml-0.5 shrink-0" />
                      )}
                    </button>
                  );
                })}
              </nav>

              {/* Reset Button */}
              <button
                onClick={() => {
                  if (confirm(isEn ? 'Reset all demo data to default initial state?' : 'คุณต้องการรีเซ็ตข้อมูลตัวอย่างทั้งหมดกลับเป็นค่าเริ่มต้นหรือไม่?')) {
                    resetAllData();
                  }
                }}
                title={isEn ? 'Reset sample data' : 'รีเซ็ตข้อมูลตัวอย่าง'}
                className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors shrink-0"
              >
                <RefreshCw className="w-3.5 h-3.5" />
              </button>
            </div>

          </div>
        </div>
      </header>

      {/* Staff Authentication PIN Modal */}
      {showStaffAuthModal && pendingRole && (
        <StaffAuthModal
          targetRole={pendingRole}
          isOpen={showStaffAuthModal}
          onClose={() => {
            setShowStaffAuthModal(false);
            setPendingRole(null);
          }}
          onSuccess={() => {
            setActiveRole(pendingRole);
            setShowStaffAuthModal(false);
            setPendingRole(null);
          }}
        />
      )}
    </>
  );
};
