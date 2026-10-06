import React, { useState, useEffect } from 'react';
import { UserCheck, X, Check } from 'lucide-react';

interface UserCrudModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (userData: { email: string; name: string; role: string }) => Promise<void>;
}

export const UserCrudModal: React.FC<UserCrudModalProps> = ({
  isOpen,
  onClose,
  onSave
}) => {
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [role, setRole] = useState('GUEST');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setEmail('');
      setName('');
      setRole('GUEST');
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !email.includes('@')) {
      alert('กรุณากรอกอีเมลที่ถูกต้อง');
      return;
    }

    setIsSubmitting(true);
    try {
      await onSave({
        email: email.trim().toLowerCase(),
        name: name.trim() || email.split('@')[0],
        role
      });
      onClose();
    } catch (err: any) {
      alert(err.message || 'เกิดข้อผิดพลาดในการเพิ่มผู้ใช้');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-150">
      <div className="bg-white rounded-3xl p-6 sm:p-7 max-w-md w-full shadow-2xl border border-slate-200 space-y-4">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-purple-100 text-purple-700 flex items-center justify-center shadow-xs">
              <UserCheck className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-base text-slate-900">
                เพิ่ม / กำหนดสิทธิ์ผู้ใช้งานใหม่
              </h3>
              <p className="text-xs text-slate-400">
                บันทึกลงฐานข้อมูล Cloudflare D1 (users)
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 rounded-xl transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-3.5 text-xs">
          <div>
            <label className="block font-semibold text-slate-700 mb-1">
              ที่อยู่อีเมล (Google Email) *
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="example@gmail.com หรือ @parichat.skru.ac.th"
              className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:ring-2 focus:ring-teal-500 font-mono"
            />
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">
              ชื่อผู้ใช้งาน (Display Name)
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="เช่น Somchai Jaidee"
              className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:ring-2 focus:ring-teal-500"
            />
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">
              บทบาท / สิทธิ์การใช้งาน (Role) *
            </label>
            <select
              value={role}
              onChange={(e) => setRole(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:ring-2 focus:ring-teal-500 font-bold"
            >
              <option value="GUEST">👤 ทั่วไป (GUEST/USER)</option>
              <option value="FRONT_DESK">🛎️ แผนกต้อนรับ (FRONT_DESK)</option>
              <option value="HOUSEKEEPER">🧹 แม่บ้าน (HOUSEKEEPER)</option>
              <option value="ADMIN">👑 แอดมิน (ADMIN)</option>
            </select>
            <p className="text-[11px] text-slate-400 mt-1">
              เมื่อผู้ใช้ล็อกอินผ่าน Google ด้วยอีเมลนี้ จะได้รับสิทธิ์ตามที่กำหนดทันที
            </p>
          </div>

          <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="px-4 py-2 text-slate-600 hover:bg-slate-100 font-semibold rounded-xl transition-colors cursor-pointer"
            >
              ยกเลิก
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-5 py-2 bg-purple-700 hover:bg-purple-800 text-white font-bold rounded-xl shadow-xs transition-colors flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
            >
              <Check className="w-3.5 h-3.5" />
              <span>{isSubmitting ? 'กำลังบันทึก...' : 'เพิ่มผู้ใช้งาน'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
