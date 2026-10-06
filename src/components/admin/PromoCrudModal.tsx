import React, { useState, useEffect } from 'react';
import { PromoCode } from '../../types';
import { Tag, X, Check } from 'lucide-react';

interface PromoCrudModalProps {
  isOpen: boolean;
  promo: PromoCode | null; // null for Create, PromoCode for Edit
  onClose: () => void;
  onSave: (promo: PromoCode) => Promise<void>;
}

export const PromoCrudModal: React.FC<PromoCrudModalProps> = ({
  isOpen,
  promo,
  onClose,
  onSave
}) => {
  const isEditing = Boolean(promo);

  const [code, setCode] = useState('');
  const [description, setDescription] = useState('');
  const [discountType, setDiscountType] = useState<'PERCENT' | 'FIXED'>('PERCENT');
  const [discountValue, setDiscountValue] = useState(10);
  const [minSpend, setMinSpend] = useState(2000);
  const [isActive, setIsActive] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (promo) {
      setCode(promo.code);
      setDescription(promo.description);
      setDiscountType(promo.discountType);
      setDiscountValue(promo.discountValue);
      setMinSpend(promo.minSpend);
      setIsActive(promo.isActive);
    } else {
      setCode('');
      setDescription('');
      setDiscountType('PERCENT');
      setDiscountValue(10);
      setMinSpend(2000);
      setIsActive(true);
    }
  }, [promo, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!code.trim()) {
      alert('กรุณากรอกรหัสโค้ดโปรโมชัน');
      return;
    }

    const payload: PromoCode = {
      code: code.trim().toUpperCase(),
      description: description.trim() || `ส่วนลด ${discountValue}${discountType === 'PERCENT' ? '%' : ' บาท'}`,
      discountType,
      discountValue: Number(discountValue),
      minSpend: Number(minSpend),
      isActive
    };

    setIsSubmitting(true);
    try {
      await onSave(payload);
      onClose();
    } catch (err: any) {
      alert(err.message || 'เกิดข้อผิดพลาดในการบันทึกโค้ดโปรโมชัน');
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
            <div className="w-10 h-10 rounded-2xl bg-amber-100 text-amber-700 flex items-center justify-center shadow-xs">
              <Tag className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-base text-slate-900">
                {isEditing ? `แก้ไขโค้ด ${promo?.code}` : 'สร้างโค้ดโปรโมชันใหม่'}
              </h3>
              <p className="text-xs text-slate-400">
                กำหนดส่วนลดและเกณฑ์ยอดจองขั้นต่ำ
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
              รหัสโค้ด (Promo Code) *
            </label>
            <input
              type="text"
              required
              disabled={isEditing} // code is primary key
              value={code}
              onChange={(e) => setCode(e.target.value.toUpperCase())}
              placeholder="เช่น SUMMER15 หรือ VIP30"
              className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:ring-2 focus:ring-teal-500 font-bold uppercase tracking-wider disabled:opacity-60"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                ประเภทส่วนลด
              </label>
              <select
                value={discountType}
                onChange={(e) => setDiscountType(e.target.value as 'PERCENT' | 'FIXED')}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:ring-2 focus:ring-teal-500 font-semibold"
              >
                <option value="PERCENT">เปอร์เซ็นต์ (%)</option>
                <option value="FIXED">จำนวนเงินคงที่ (฿)</option>
              </select>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                มูลค่าส่วนลด ({discountType === 'PERCENT' ? '%' : 'บาท'}) *
              </label>
              <input
                type="number"
                required
                min="1"
                value={discountValue}
                onChange={(e) => setDiscountValue(Number(e.target.value))}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:ring-2 focus:ring-teal-500 font-bold text-teal-800"
              />
            </div>
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">
              ยอดสั่งจองขั้นต่ำ (บาท)
            </label>
            <input
              type="number"
              min="0"
              value={minSpend}
              onChange={(e) => setMinSpend(Number(e.target.value))}
              placeholder="0 ถ้าไม่มีขั้นต่ำ"
              className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:ring-2 focus:ring-teal-500 font-semibold"
            />
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">
              คำอธิบายโปรโมชัน
            </label>
            <input
              type="text"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="เช่น ส่วนลด 15% ต้อนรับฤดูร้อน"
              className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:ring-2 focus:ring-teal-500"
            />
          </div>

          <div className="flex items-center gap-2 pt-1">
            <input
              type="checkbox"
              id="promoIsActive"
              checked={isActive}
              onChange={(e) => setIsActive(e.target.checked)}
              className="w-4 h-4 text-teal-600 rounded border-slate-300 focus:ring-teal-500 cursor-pointer"
            />
            <label htmlFor="promoIsActive" className="font-semibold text-slate-700 cursor-pointer select-none">
              เปิดใช้งานโค้ดนี้ทันที (Active)
            </label>
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
              className="px-5 py-2 bg-teal-700 hover:bg-teal-800 text-white font-bold rounded-xl shadow-xs transition-colors flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
            >
              <Check className="w-3.5 h-3.5" />
              <span>{isSubmitting ? 'กำลังบันทึก...' : isEditing ? 'บันทึกการแก้ไข' : 'สร้างโค้ด'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
