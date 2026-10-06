import React, { useState, useEffect } from 'react';
import { Room } from '../../types';
import { Bed, X, Check } from 'lucide-react';

interface RoomCrudModalProps {
  isOpen: boolean;
  room: Room | null; // null for Create, Room object for Edit
  onClose: () => void;
  onSave: (roomData: Room) => Promise<void>;
}

export const RoomCrudModal: React.FC<RoomCrudModalProps> = ({
  isOpen,
  room,
  onClose,
  onSave
}) => {
  const isEditing = Boolean(room);

  const [roomNumber, setRoomNumber] = useState('');
  const [name, setName] = useState('');
  const [nameEn, setNameEn] = useState('');
  const [type, setType] = useState<Room['type']>('POOL_VILLA');
  const [capacity, setCapacity] = useState(2);
  const [bedType, setBedType] = useState('1 King Bed');
  const [sizeSqM, setSizeSqM] = useState(50);
  const [basePrice, setBasePrice] = useState(3000);
  const [weekendPrice, setWeekendPrice] = useState(3500);
  const [status, setStatus] = useState<Room['status']>('VACANT_CLEAN');
  const [description, setDescription] = useState('');
  const [descriptionEn, setDescriptionEn] = useState('');
  const [imagesText, setImagesText] = useState('');
  const [amenitiesText, setAmenitiesText] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (room) {
      setRoomNumber(room.roomNumber);
      setName(room.name);
      setNameEn(room.nameEn || room.name);
      setType(room.type);
      setCapacity(room.capacity);
      setBedType(room.bedType);
      setSizeSqM(room.sizeSqM);
      setBasePrice(room.basePrice);
      setWeekendPrice(room.weekendPrice);
      setStatus(room.status);
      setDescription(room.description);
      setDescriptionEn(room.descriptionEn || room.description);
      setImagesText((room.images || []).join('\n'));
      setAmenitiesText((room.amenities || []).join(', '));
    } else {
      setRoomNumber(`VILLA ${Math.floor(100 + Math.random() * 900)}`);
      setName('');
      setNameEn('');
      setType('POOL_VILLA');
      setCapacity(2);
      setBedType('1 King Bed');
      setSizeSqM(60);
      setBasePrice(3500);
      setWeekendPrice(4200);
      setStatus('VACANT_CLEAN');
      setDescription('');
      setDescriptionEn('');
      setImagesText('https://images.unsplash.com/photo-1580587771525-78b9dba3b914?auto=format&fit=crop&w=1200&q=80');
      setAmenitiesText('Private Pool, Free Wi-Fi High Speed, Smart TV, Mini Bar');
    }
  }, [room, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!roomNumber.trim() || !name.trim()) {
      alert('กรุณาระบุหมายเลขห้องพักและชื่อห้อง');
      return;
    }

    const typeLabels: Record<Room['type'], { th: string; en: string }> = {
      POOL_VILLA: { th: 'พูลวิลล่าริมทะเลส่วนตัว', en: 'Private Oceanfront Pool Villa' },
      BEACHFRONT_SUITE: { th: 'สวีทติดชายหาดส่วนตัว', en: 'Beachfront Panorama Suite' },
      GARDEN_BUNGALOW: { th: 'บังกะโลสวนธรรมชาติ', en: 'Tropical Garden Bungalow' },
      DELUXE_ROOM: { th: 'ห้องดีลักซ์วิวทะเล & ขุนเขา', en: 'Deluxe Ocean & Hill View' }
    };

    const imgs = imagesText
      .split('\n')
      .map(s => s.trim())
      .filter(Boolean);

    const amns = amenitiesText
      .split(',')
      .map(s => s.trim())
      .filter(Boolean);

    const roomPayload: Room = {
      id: room ? room.id : `room-${Date.now().toString(36)}`,
      roomNumber: roomNumber.trim().toUpperCase(),
      name: name.trim(),
      nameEn: nameEn.trim() || name.trim(),
      type,
      typeName: typeLabels[type]?.th || name.trim(),
      typeNameEn: typeLabels[type]?.en || nameEn.trim() || name.trim(),
      capacity: Number(capacity) || 2,
      bedType: bedType.trim(),
      sizeSqM: Number(sizeSqM) || 40,
      basePrice: Number(basePrice) || 2000,
      weekendPrice: Number(weekendPrice) || Math.round((Number(basePrice) || 2000) * 1.15),
      description: description.trim(),
      descriptionEn: descriptionEn.trim() || description.trim(),
      status,
      images: imgs.length > 0 ? imgs : ['https://images.unsplash.com/photo-1580587771525-78b9dba3b914?auto=format&fit=crop&w=1200&q=80'],
      amenities: amns.length > 0 ? amns : ['Free Wi-Fi', 'Smart TV'],
      rating: room ? room.rating : 5.0,
      reviewCount: room ? room.reviewCount : 0
    };

    setIsSubmitting(true);
    try {
      await onSave(roomPayload);
      onClose();
    } catch (err: any) {
      alert(err.message || 'เกิดข้อผิดพลาดในการบันทึกห้องพัก');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto animate-in fade-in duration-150">
      <div className="bg-white rounded-3xl p-6 sm:p-7 max-w-2xl w-full shadow-2xl border border-slate-200 my-8 space-y-5">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-teal-100 text-teal-700 flex items-center justify-center shadow-xs">
              <Bed className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-base text-slate-900">
                {isEditing ? `แก้ไขข้อมูลห้อง ${room?.roomNumber}` : 'เพิ่มห้องพักใหม่ (Create Room)'}
              </h3>
              <p className="text-xs text-slate-400">
                จัดการข้อมูลห้องพัก ราคาปกติ ราคาสุดสัปดาห์ และสิ่งอำนวยความสะดวก
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
        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                หมายเลขห้อง (Room Number) *
              </label>
              <input
                type="text"
                required
                value={roomNumber}
                onChange={(e) => setRoomNumber(e.target.value)}
                placeholder="เช่น VILLA 103 หรือ SUITE 203"
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:ring-2 focus:ring-teal-500 font-bold uppercase"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                ประเภทห้อง (Room Type) *
              </label>
              <select
                value={type}
                onChange={(e) => setType(e.target.value as Room['type'])}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:ring-2 focus:ring-teal-500 font-semibold"
              >
                <option value="POOL_VILLA">🏡 Pool Villa (พูลวิลล่า)</option>
                <option value="BEACHFRONT_SUITE">🌊 Beachfront Suite (สวีทริมหาด)</option>
                <option value="GARDEN_BUNGALOW">🌿 Garden Bungalow (บังกะโลสวน)</option>
                <option value="DELUXE_ROOM">🛏️ Deluxe Room (ดีลักซ์)</option>
              </select>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                สถานะห้องพัก (Status) *
              </label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as Room['status'])}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:ring-2 focus:ring-teal-500 font-semibold"
              >
                <option value="VACANT_CLEAN">🟢 ว่าง สะอาด (พร้อมปล่อยขาย)</option>
                <option value="VACANT_DIRTY">🟡 ว่าง แต่ต้องทำความสะอาด</option>
                <option value="CLEANING">🔵 แม่บ้านกำลังทำความสะอาด</option>
                <option value="OCCUPIED">🟣 มีแขกพักอยู่ (Checked In)</option>
                <option value="MAINTENANCE">🔴 ปิดซ่อมบำรุง (Maintenance)</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                ชื่อห้องภาษาไทย (Thai Name) *
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="เช่น แกรนด์ โอเชียนฟรอนต์ พูลวิลล่า"
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:ring-2 focus:ring-teal-500"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                ชื่อห้องภาษาอังกฤษ (English Name)
              </label>
              <input
                type="text"
                value={nameEn}
                onChange={(e) => setNameEn(e.target.value)}
                placeholder="e.g. Grand Oceanfront Pool Villa"
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:ring-2 focus:ring-teal-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                ราคาปกติ / คืน (฿) *
              </label>
              <input
                type="number"
                required
                min="500"
                value={basePrice}
                onChange={(e) => setBasePrice(Number(e.target.value))}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:ring-2 focus:ring-teal-500 font-bold text-teal-800"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                ราคาสุดสัปดาห์ / คืน (฿) *
              </label>
              <input
                type="number"
                required
                min="500"
                value={weekendPrice}
                onChange={(e) => setWeekendPrice(Number(e.target.value))}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:ring-2 focus:ring-teal-500 font-bold text-indigo-800"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                ความจุผู้เข้าพัก (คน)
              </label>
              <input
                type="number"
                min="1"
                max="10"
                value={capacity}
                onChange={(e) => setCapacity(Number(e.target.value))}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:ring-2 focus:ring-teal-500"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                ขนาดห้อง (ตร.ม.)
              </label>
              <input
                type="number"
                min="10"
                value={sizeSqM}
                onChange={(e) => setSizeSqM(Number(e.target.value))}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:ring-2 focus:ring-teal-500"
              />
            </div>
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">
              ประเภทเตียง (Bed Type)
            </label>
            <input
              type="text"
              value={bedType}
              onChange={(e) => setBedType(e.target.value)}
              placeholder="เช่น 1 King Bed หรือ 2 Twin Beds"
              className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:ring-2 focus:ring-teal-500"
            />
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">
              คำอธิบายห้องพัก (Description)
            </label>
            <textarea
              rows={2}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="ระบุจุดเด่น เช่น วิวทะเล สระว่ายน้ำส่วนตัว หรืออ่างอาบน้ำกลางแจ้ง..."
              className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:ring-2 focus:ring-teal-500 resize-none"
            />
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">
              สิ่งอำนวยความสะดวก (คั่นด้วยเครื่องหมายจุลภาค ,)
            </label>
            <input
              type="text"
              value={amenitiesText}
              onChange={(e) => setAmenitiesText(e.target.value)}
              placeholder="Private Pool, Free Wi-Fi, Bathtub, Smart TV"
              className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:ring-2 focus:ring-teal-500"
            />
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">
              ลิงก์รูปภาพ (Image URLs คั่นบรรทัดละ 1 รูป)
            </label>
            <textarea
              rows={2}
              value={imagesText}
              onChange={(e) => setImagesText(e.target.value)}
              placeholder="https://images.unsplash.com/photo-..."
              className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:ring-2 focus:ring-teal-500 resize-none font-mono text-[11px]"
            />
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
              <span>{isSubmitting ? 'กำลังบันทึก...' : isEditing ? 'บันทึกการแก้ไข' : 'สร้างห้องพักใหม่'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
