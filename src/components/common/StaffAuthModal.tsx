import React, { useState } from 'react';
import { useResort } from '../../context/ResortContext';
import { UserRole } from '../../types';
import { ShieldCheck, Lock, X, KeyRound, AlertCircle } from 'lucide-react';

interface StaffAuthModalProps {
  targetRole: UserRole;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export const StaffAuthModal: React.FC<StaffAuthModalProps> = ({
  targetRole,
  isOpen,
  onClose,
  onSuccess
}) => {
  const { authenticateStaff, language } = useResort();
  const isEn = language === 'en';

  const [pin, setPin] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  if (!isOpen) return null;

  const roleNames: Record<UserRole, { th: string; en: string }> = {
    GUEST: { th: 'ลูกค้า', en: 'Guest' },
    FRONT_DESK: { th: 'แผนกต้อนรับ (Front Desk)', en: 'Front Desk' },
    HOUSEKEEPER: { th: 'งานแม่บ้าน (Housekeeping)', en: 'Housekeeping' },
    MANAGER: { th: 'ผู้ดูแลระบบ (Admin)', en: 'Admin' },
    ADMIN: { th: 'ผู้ดูแลระบบ (Admin)', en: 'Admin' }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (authenticateStaff(pin)) {
      setErrorMsg('');
      setPin('');
      onSuccess();
    } else {
      setErrorMsg(isEn ? 'Invalid Staff Security PIN. Please try again.' : 'รหัส PIN พนักงานไม่ถูกต้อง โปรดลองอีกครั้ง');
      setPin('');
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/70 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4">
      <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 max-w-md w-full overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="bg-slate-900 text-white px-6 py-5 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-teal-500/20 text-teal-400 flex items-center justify-center border border-teal-500/30">
              <Lock className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">
                {isEn ? 'Staff Security Authentication' : 'ยืนยันตัวตนเจ้าหน้าที่ (Staff Access)'}
              </h3>
              <p className="text-xs text-teal-300">
                {isEn ? `Authorizing access to: ${roleNames[targetRole].en}` : `กำลังเข้าสู่: ${roleNames[targetRole].th}`}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          
          <div className="flex items-start gap-2.5 text-xs text-slate-600 bg-slate-50 p-3.5 rounded-2xl border border-slate-200">
            <ShieldCheck className="w-4 h-4 text-teal-600 shrink-0 mt-0.5" />
            <div className="leading-relaxed">
              <strong className="text-slate-800">
                {isEn ? 'OWASP Access Control Policy:' : 'นโยบายความปลอดภัย OWASP A01:'}
              </strong>{' '}
              {isEn
                ? 'Internal operations (Front Desk, Housekeeping, Revenue Reports) are restricted to authorized resort personnel only.'
                : 'สงวนสิทธิ์การเข้าถึงข้อมูลภายในและระบบการเงินเฉพาะพนักงานรีสอร์ทที่ได้รับอนุญาตเท่านั้น'}
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-800 mb-1.5">
              {isEn ? 'Staff Security PIN' : 'รหัส PIN ความปลอดภัยพนักงาน (4 หลัก)'}
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                <KeyRound className="w-4 h-4" />
              </div>
              <input
                type="password"
                maxLength={8}
                autoFocus
                required
                placeholder="••••"
                value={pin}
                onChange={(e) => setPin(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-300 rounded-xl text-center text-lg font-mono tracking-widest font-bold text-slate-900 focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
              />
            </div>
          </div>

          {/* Demo Hint Badge */}
          <div className="bg-amber-50 border border-amber-200 text-amber-900 text-[11px] p-2.5 rounded-xl flex items-center justify-between font-semibold">
            <span>🔑 {isEn ? 'Demo Staff PIN:' : 'รหัส PIN สำหรับทดสอบระบบ:'}</span>
            <span className="font-mono bg-white px-2 py-0.5 rounded border border-amber-300 font-bold text-amber-800 text-xs">
              8888
            </span>
          </div>

          {errorMsg && (
            <div className="flex items-center gap-1.5 text-xs text-red-600 font-bold bg-red-50 p-2.5 rounded-xl border border-red-200">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          <div className="pt-2 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
            >
              {isEn ? 'Cancel' : 'ยกเลิก'}
            </button>
            <button
              type="submit"
              className="px-5 py-2.5 bg-slate-900 hover:bg-slate-800 text-white text-xs sm:text-sm font-bold rounded-xl shadow-md inline-flex items-center gap-1.5 transition-all hover:scale-105"
            >
              <Lock className="w-4 h-4 text-teal-400" />
              <span>{isEn ? 'Authenticate & Enter' : 'ยืนยันรหัส & เข้าใช้งาน'}</span>
            </button>
          </div>

        </form>

      </div>
    </div>
  );
};
