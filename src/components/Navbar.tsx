import React from 'react';
import { useResort } from '../context/ResortContext';
import { UserRole } from '../types';
import { Palmtree, User, Hotel, Sparkles, BarChart3, RefreshCw } from 'lucide-react';

export const Navbar: React.FC = () => {
  const { activeRole, setActiveRole, resetAllData } = useResort();

  const roleOptions: { role: UserRole; label: string; icon: React.ReactNode }[] = [
    { role: 'GUEST', label: 'มุมมองลูกค้า (Guest)', icon: <User className="w-4 h-4" /> },
    { role: 'FRONT_DESK', label: 'แผนกต้อนรับ (Front Desk)', icon: <Hotel className="w-4 h-4" /> },
    { role: 'HOUSEKEEPER', label: 'งานแม่บ้าน (Housekeeping)', icon: <Sparkles className="w-4 h-4" /> },
    { role: 'MANAGER', label: 'ภาพรวม & รายงาน (Admin)', icon: <BarChart3 className="w-4 h-4" /> }
  ];

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          
          {/* Logo & Resort Name */}
          <div className="flex items-center gap-3 cursor-pointer" onClick={() => setActiveRole('GUEST')}>
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-teal-700 via-teal-600 to-teal-500 flex items-center justify-center text-white shadow-md shadow-teal-500/20">
              <Palmtree className="w-7 h-7" />
            </div>
            <div>
              <h1 className="text-xl font-bold tracking-tight text-slate-900 flex items-center gap-2">
                THE HAVEN <span className="text-teal-600 text-sm font-semibold uppercase tracking-wider bg-teal-50 px-2 py-0.5 rounded-full border border-teal-200">Resort & Villas</span>
              </h1>
              <p className="text-xs text-slate-500 font-normal">ระบบบริหารจัดการและจองห้องพักบน Cloudflare Edge</p>
            </div>
          </div>

          {/* Role Navigation Switcher */}
          <div className="flex items-center gap-2">
            <nav className="flex items-center p-1.5 bg-slate-100 rounded-xl border border-slate-200/80">
              {roleOptions.map(item => {
                const isActive = activeRole === item.role;
                return (
                  <button
                    key={item.role}
                    onClick={() => setActiveRole(item.role)}
                    className={`flex items-center gap-2 px-3.5 py-2 text-xs sm:text-sm font-medium rounded-lg transition-all duration-200 ${
                      isActive
                        ? 'bg-white text-teal-800 shadow-sm font-semibold border border-slate-200/60'
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
                if (confirm('คุณต้องการรีเซ็ตข้อมูลตัวอย่างทั้งหมดกลับเป็นค่าเริ่มต้นหรือไม่?')) {
                  resetAllData();
                }
              }}
              title="รีเซ็ตข้อมูลตัวอย่าง"
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
