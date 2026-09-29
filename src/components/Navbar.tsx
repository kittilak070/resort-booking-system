import React from 'react';
import { useResort } from '../context/ResortContext';
import { UserRole } from '../types';
import { 
  Palmtree, User, Hotel, Sparkles, BarChart3, 
  RefreshCw, Search, Bell 
} from 'lucide-react';

interface NavbarProps {
  onOpenMyBookings: () => void;
  onOpenNotifications: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ onOpenMyBookings, onOpenNotifications }) => {
  const { activeRole, setActiveRole, resetAllData, language, setLanguage, notifications } = useResort();
  const isEn = language === 'en';

  const roleOptions: { role: UserRole; label: string; icon: React.ReactNode }[] = [
    { role: 'GUEST', label: isEn ? 'Guest View' : 'มุมมองลูกค้า (Guest)', icon: <User className="w-4 h-4" /> },
    { role: 'FRONT_DESK', label: isEn ? 'Front Desk' : 'แผนกต้อนรับ (Front Desk)', icon: <Hotel className="w-4 h-4" /> },
    { role: 'HOUSEKEEPER', label: isEn ? 'Housekeeping' : 'งานแม่บ้าน (Housekeeping)', icon: <Sparkles className="w-4 h-4" /> },
    { role: 'MANAGER', label: isEn ? 'Admin & Reports' : 'ภาพรวม & รายงาน (Admin)', icon: <BarChart3 className="w-4 h-4" /> }
  ];

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          
          {/* Logo & Resort Name */}
          <div className="flex items-center gap-3 cursor-pointer" onClick={() => setActiveRole('GUEST')}>
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-teal-700 via-teal-600 to-teal-500 flex items-center justify-center text-white shadow-md shadow-teal-500/20">
              <Palmtree className="w-7 h-7" />
            </div>
            <div>
              <h1 className="text-xl font-bold tracking-tight text-slate-900 flex items-center gap-2">
                THE HAVEN <span className="text-teal-600 text-xs font-semibold uppercase tracking-wider bg-teal-50 px-2 py-0.5 rounded-full border border-teal-200">Resort & Villas</span>
              </h1>
              <p className="text-xs text-slate-500 font-normal">
                {isEn ? 'Edge Resort Management & Booking System (Phase 3)' : 'ระบบบริหารจัดการและจองห้องพักบน Cloudflare Edge (Phase 3)'}
              </p>
            </div>
          </div>

          {/* Navigation & Controls */}
          <div className="flex items-center gap-2">
            
            {/* My Bookings Lookup Button */}
            <button
              onClick={onOpenMyBookings}
              className="px-3.5 py-2 bg-teal-50 hover:bg-teal-100 text-teal-800 border border-teal-200 rounded-xl text-xs sm:text-sm font-semibold flex items-center gap-1.5 transition-colors"
            >
              <Search className="w-3.5 h-3.5 text-teal-600" />
              <span className="hidden sm:inline">{isEn ? 'My Bookings' : 'ค้นหาการจองของฉัน'}</span>
              <span className="sm:hidden">{isEn ? 'Booking' : 'การจอง'}</span>
            </button>

            {/* Notification Center Trigger */}
            <button
              onClick={onOpenNotifications}
              className="relative p-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl transition-colors"
              title={isEn ? 'Dispatched Notifications Log' : 'ประวัติการส่ง SMS & Email'}
            >
              <Bell className="w-4 h-4 text-slate-700" />
              {notifications.length > 0 && (
                <span className="absolute -top-1 -right-1 bg-teal-600 text-white font-bold text-[10px] w-4 h-4 rounded-full flex items-center justify-center shadow-xs animate-pulse">
                  {notifications.length > 9 ? '9+' : notifications.length}
                </span>
              )}
            </button>

            {/* Language Switcher */}
            <div className="flex items-center bg-slate-100 p-1 rounded-xl border border-slate-200/80">
              <button
                onClick={() => setLanguage('th')}
                className={`px-2 py-1 rounded-lg text-xs font-bold transition-all flex items-center gap-1 ${
                  language === 'th'
                    ? 'bg-white text-slate-900 shadow-xs'
                    : 'text-slate-500 hover:text-slate-900'
                }`}
                title="ภาษาไทย"
              >
                <span>🇹🇭</span>
                <span className="hidden md:inline">TH</span>
              </button>
              <button
                onClick={() => setLanguage('en')}
                className={`px-2 py-1 rounded-lg text-xs font-bold transition-all flex items-center gap-1 ${
                  language === 'en'
                    ? 'bg-white text-slate-900 shadow-xs'
                    : 'text-slate-500 hover:text-slate-900'
                }`}
                title="English"
              >
                <span>🇬🇧</span>
                <span className="hidden md:inline">EN</span>
              </button>
            </div>

            {/* Role Options */}
            <nav className="flex items-center p-1.5 bg-slate-100 rounded-xl border border-slate-200/80">
              {roleOptions.map(item => {
                const isActive = activeRole === item.role;
                return (
                  <button
                    key={item.role}
                    onClick={() => setActiveRole(item.role)}
                    className={`flex items-center gap-2 px-3 py-2 text-xs sm:text-sm font-medium rounded-lg transition-all duration-200 ${
                      isActive
                        ? 'bg-white text-teal-800 shadow-xs font-semibold border border-slate-200/60'
                        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
                    }`}
                  >
                    <span className={isActive ? 'text-teal-600' : 'text-slate-400'}>{item.icon}</span>
                    <span className="hidden md:inline">{item.label}</span>
                    <span className="md:hidden">{item.label.split(' ')[0]}</span>
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
              className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors ml-1"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
          </div>

        </div>
      </div>
    </header>
  );
};
