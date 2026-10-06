import React, { useState, useEffect } from 'react';
import { MinibarItem } from '../../types';
import { Wine, X, Check } from 'lucide-react';

interface MinibarCrudModalProps {
  isOpen: boolean;
  item: MinibarItem | null;
  onClose: () => void;
  onSave: (item: MinibarItem) => Promise<void>;
}

export const MinibarCrudModal: React.FC<MinibarCrudModalProps> = ({
  isOpen,
  item,
  onClose,
  onSave
}) => {
  const isEditing = Boolean(item);

  const [name, setName] = useState('');
  const [nameEn, setNameEn] = useState('');
  const [category, setCategory] = useState<MinibarItem['category']>('BEVERAGE');
  const [price, setPrice] = useState(80);
  const [unit, setUnit] = useState('ขวด');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (item) {
      setName(item.name);
      setNameEn(item.nameEn || item.name);
      setCategory(item.category);
      setPrice(item.price);
      setUnit(item.unit);
    } else {
      setName('');
      setNameEn('');
      setCategory('BEVERAGE');
      setPrice(80);
      setUnit('ขวด');
    }
  }, [item, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      alert('กรุณากรอกชื่อสินค้ามินิบาร์');
      return;
    }

    const payload: MinibarItem = {
      id: item ? item.id : `mb-${Date.now().toString(36)}`,
      name: name.trim(),
      nameEn: nameEn.trim() || name.trim(),
      category,
      price: Number(price),
      unit: unit.trim() || 'ชิ้น'
    };

    setIsSubmitting(true);
    try {
      await onSave(payload);
      onClose();
    } catch (err: any) {
      alert(err.message || 'เกิดข้อผิดพลาดในการบันทึกสินค้ามินิบาร์');
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
            <div className="w-10 h-10 rounded-2xl bg-indigo-100 text-indigo-700 flex items-center justify-center shadow-xs">
              <Wine className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-base text-slate-900">
                {isEditing ? `แก้ไขสินค้า: ${item?.name}` : 'เพิ่มสินค้ามินิบาร์ใหม่'}
              </h3>
              <p className="text-xs text-slate-400">
                รายการของกิน เครื่องดื่ม และของใช้ในห้องพัก
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
              ชื่อสินค้าภาษาไทย (Thai Name) *
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="เช่น น้ำมะพร้าวสด หรือ เบียร์สิงห์"
              className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:ring-2 focus:ring-teal-500 font-semibold"
            />
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">
              ชื่อสินค้าภาษาอังกฤษ (English Name)
            </label>
            <input
              type="text"
              value={nameEn}
              onChange={(e) => setNameEn(e.target.value)}
              placeholder="e.g. Fresh Coconut Water"
              className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:ring-2 focus:ring-teal-500"
            />
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                หมวดหมู่
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as MinibarItem['category'])}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:ring-2 focus:ring-teal-500 font-semibold"
              >
                <option value="BEVERAGE">🥤 เครื่องดื่ม</option>
                <option value="SNACK">🍪 ของว่าง</option>
                <option value="AMENITY">🧴 ของใช้</option>
              </select>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                ราคา (บาท) *
              </label>
              <input
                type="number"
                required
                min="0"
                value={price}
                onChange={(e) => setPrice(Number(e.target.value))}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:ring-2 focus:ring-teal-500 font-bold text-teal-800"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                หน่วยนับ
              </label>
              <input
                type="text"
                required
                value={unit}
                onChange={(e) => setUnit(e.target.value)}
                placeholder="ขวด / กระป๋อง"
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:ring-2 focus:ring-teal-500 font-semibold"
              />
            </div>
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
              <span>{isSubmitting ? 'กำลังบันทึก...' : isEditing ? 'บันทึกการแก้ไข' : 'เพิ่มสินค้า'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
