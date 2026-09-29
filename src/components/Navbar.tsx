import React, { useState } from 'react';
import { useResort } from '../context/ResortContext';
import { UserRole } from '../types';
import { GoogleAuthModal } from './common/GoogleAuthModal';
import { 
  Palmtree, User, Hotel, Sparkles, BarChart3, 
  RefreshCw, Search, Bell, LogOut 
} from 'lucide-react';

interface NavbarProps {
  onOpenMyBookings: () => void;
  onOpenNotifications: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ onOpenMyBookings, onOpenNotifications }) => {
  const { 
    activeRole, setActiveRole, resetAllData, 
    language, setLanguage, notifications,
    currentUser, logoutUser 
  } = useResort();

  const isEn = language === 'en';

  const [showGoogleModal, setShowGoogleModal] = useState<boolean>(false);
  const [showUserDropdown, setShowUserDropdown] = useState<boolean>(false);
  const [pendingRole, setPendingRole] = useState<UserRole | null>(null);

  const userRole = currentUser?.role || 'GUEST';
  const isUserAdmin = userRole === 'ADMIN' || userRole === 'MANAGER';

  const getRoleBadgeLabel = (role: UserRole | string) => {
    if (role === 'ADMIN' || role === 'MANAGER') return 'ADMIN';
    if (role === 'FRONT_DESK') return 'FRONT DESK';
    if (role === 'HOUSEKEEPER') return 'HOUSEKEEPER';
    return isEn ? 'USER' : 'ทั่วไป';
  };

  const allRoleOptions: { 
    role: UserRole; 
    shortLabel: string; 
    fullLabel: string; 
    icon: React.ReactNode 
  }[] = [
    { 
      role: 'GUEST', 
      shortLabel: isEn ? 'User' : 'ทั่วไป', 
      fullLabel: isEn ? 'General User View' : 'ผู้ใช้ทั่วไป', 
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
      shortLabel: isEn ? 'Admin' : 'แอดมิน', 
      fullLabel: isEn ? 'Admin Dashboard' : 'แอดมิน (Admin)', 
      icon: <BarChart3 className="w-3.5 h-3.5" /> 
    }
  ];

  // Restrict visible roles strictly based on user's verified role (Guests cannot see Staff/Admin)
  const visibleRoles = allRoleOptions.filter(item => {
    if (item.role === 'GUEST') return true;
    if (isUserAdmin) return true;
    if (userRole === 'FRONT_DESK' && item.role === 'FRONT_DESK') return true;
    if (userRole === 'HOUSEKEEPER' && item.role === 'HOUSEKEEPER') return true;
    return false;
  });

  const handleRoleSelect = (role: UserRole) => {
    if (role === 'GUEST') {
      setActiveRole('GUEST');
      return;
    }

    // Only allow if user possesses the authorized role
    if (isUserAdmin || userRole === role) {
      setActiveRole(role);
      return;
    }

    // Otherwise prompt for staff/admin Google login
    setPendingRole(role);
    setShowGoogleModal(true);
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

              {/* Google OAuth Profile or Sign-in Button */}
              {currentUser ? (
                <div className="relative shrink-0">
                  <button
                    onClick={() => setShowUserDropdown(!showUserDropdown)}
                    className="flex items-center gap-2 px-2 py-1 bg-white hover:bg-slate-50 border border-slate-200/90 rounded-xl shadow-xs transition-colors"
                    title={currentUser.email}
                  >
                    <img
                      src={currentUser.picture || `https://ui-avatars.com/api/?name=${encodeURIComponent(currentUser.name)}&background=0d9488&color=fff`}
                      alt={currentUser.name}
                      className="w-6 h-6 rounded-full object-cover border border-slate-200 shrink-0"
                    />
                    <div className="hidden sm:flex flex-col text-left">
                      <span className="text-[11px] font-bold text-slate-800 leading-tight max-w-[90px] truncate">
                        {currentUser.name}
                      </span>
                      <span className="text-[9px] font-semibold text-teal-700 leading-tight">
                        {getRoleBadgeLabel(currentUser.role)}
                      </span>
                    </div>
                  </button>

                  {/* Dropdown Menu */}
                  {showUserDropdown && (
                    <div className="absolute right-0 mt-2 w-64 bg-white rounded-2xl shadow-xl border border-slate-100 p-2.5 z-50 animate-in fade-in zoom-in-95 duration-150">
                      <div className="p-2 border-b border-slate-100 flex items-center gap-3">
                        <img
                          src={currentUser.picture || `https://ui-avatars.com/api/?name=${encodeURIComponent(currentUser.name)}&background=0d9488&color=fff`}
                          alt={currentUser.name}
                          className="w-9 h-9 rounded-full object-cover border border-slate-200 shrink-0"
                        />
                        <div className="min-w-0">
                          <p className="text-xs font-bold text-slate-900 truncate">{currentUser.name}</p>
                          <p className="text-[10px] text-slate-400 truncate font-mono">{currentUser.email}</p>
                          <span className={`inline-block mt-1 text-[9px] font-bold px-2 py-0.5 rounded-full border ${
                            isUserAdmin
                              ? 'bg-purple-50 text-purple-700 border-purple-200'
                              : currentUser.role === 'FRONT_DESK'
                              ? 'bg-teal-50 text-teal-700 border-teal-200'
                              : currentUser.role === 'HOUSEKEEPER'
                              ? 'bg-amber-50 text-amber-700 border-amber-200'
                              : 'bg-slate-50 text-slate-700 border-slate-200'
                          }`}>
                            Role: {getRoleBadgeLabel(currentUser.role)}
                          </span>
                        </div>
                      </div>

                      <div className="pt-2">
                        <button
                          onClick={() => {
                            logoutUser();
                            setShowUserDropdown(false);
                          }}
                          className="w-full text-left px-3 py-2 text-xs font-semibold text-red-600 hover:bg-red-50 rounded-xl flex items-center gap-2 transition-colors"
                        >
                          <LogOut className="w-3.5 h-3.5" />
                          <span>{isEn ? 'Sign Out' : 'ออกจากระบบ'}</span>
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <button
                  onClick={() => setShowGoogleModal(true)}
                  className="px-2.5 sm:px-3 py-1.5 bg-white hover:bg-slate-50 text-slate-700 border border-slate-200/90 rounded-xl text-xs font-semibold flex items-center gap-1.5 shadow-xs transition-colors whitespace-nowrap shrink-0 group"
                  title={isEn ? 'Sign in with Google' : 'เข้าสู่ระบบด้วย Google'}
                >
                  <svg className="w-3.5 h-3.5 shrink-0" viewBox="0 0 24 24">
                    <path
                      fill="#4285F4"
                      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                    />
                    <path
                      fill="#34A853"
                      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    />
                    <path
                      fill="#FBBC05"
                      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                    />
                    <path
                      fill="#EA4335"
                      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                    />
                  </svg>
                  <span className="hidden sm:inline whitespace-nowrap group-hover:text-slate-900">
                    {isEn ? 'Google Sign-In' : 'เข้าสู่ระบบ'}
                  </span>
                </button>
              )}

              {/* Role Options - Only visible to authorized Staff & Manager */}
              {visibleRoles.length > 1 && (
                <nav className="flex items-center p-1 bg-slate-100 rounded-xl border border-slate-200/80 shrink-0">
                  {visibleRoles.map(item => {
                    const isActive = activeRole === item.role;
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
                      </button>
                    );
                  })}
                </nav>
              )}

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

      {/* Google Authentication Modal (Exclusive Login Method) */}
      {showGoogleModal && (
        <GoogleAuthModal
          isOpen={showGoogleModal}
          onClose={() => {
            setShowGoogleModal(false);
            setPendingRole(null);
          }}
          onSuccess={() => {
            if (pendingRole) {
              setActiveRole(pendingRole);
              setPendingRole(null);
            }
          }}
          requiredRoleName={
            pendingRole
              ? allRoleOptions.find(r => r.role === pendingRole)?.fullLabel
              : undefined
          }
        />
      )}
    </>
  );
};
