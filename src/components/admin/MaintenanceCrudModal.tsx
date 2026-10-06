import React, { useState, useEffect } from 'react';
import { MaintenanceIssue, Room } from '../../types';
import { Wrench, X, Check } from 'lucide-react';

interface MaintenanceCrudModalProps {
  isOpen: boolean;
  issue: MaintenanceIssue | null;
  rooms: Room[];
  onClose: () => void;
  onSave: (data: { id?: string; roomId: string; roomNumber: string; issueDescription: string; reportedBy: string; status?: string }) => Promise<void>;
}

export const MaintenanceCrudModal: React.FC<MaintenanceCrudModalProps> = ({
  isOpen,
  issue,
  rooms,
  onClose,
  onSave
}) => {
  const isEditing = Boolean(issue);

  const [roomId, setRoomId] = useState('');
  const [issueDescription, setIssueDescription] = useState('');
  const [reportedBy, setReportedBy] = useState('Admin');
  const [status, setStatus] = useState<'PENDING_REPAIR' | 'RESOLVED'>('PENDING_REPAIR');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (issue) {
      setRoomId(issue.roomId);
      setIssueDescription(issue.issueDescription);
      setReportedBy(issue.reportedBy);
      setStatus(issue.status);
    } else {
      setRoomId(rooms[0]?.id || '');
      setIssueDescription('');
      setReportedBy('Admin');
      setStatus('PENDING_REPAIR');
    }
  }, [issue, rooms, isOpen]);

  if (!isOpen) return null;

  const selectedRoom = rooms.find(r => r.id === roomId);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!roomId || !issueDescription.trim()) {
      alert('กรุณาเลือกห้องพักและระบุอาการ/ปัญหา');
      return;
    }

    setIsSubmitting(true);
    try {
      await onSave({
        id: issue?.id,
        roomId,
        roomNumber: selectedRoom?.roomNumber || issue?.roomNumber || 'Unknown',
        issueDescription: issueDescription.trim(),
        reportedBy: reportedBy.trim() || 'Admin',
        status
      });
      onClose();
    } catch (err: any) {
      alert(err.message || 'เกิดข้อผิดพลาดในการบันทึกแจ้งซ่อม');
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
            <div className="w-10 h-10 rounded-2xl bg-red-100 text-red-600 flex items-center justify-center shadow-xs">
              <Wrench className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-base text-slate-900">
                {isEditing ? `แก้ไขรายการแจ้งซ่อม: ห้อง ${issue?.roomNumber}` : 'สร้างรายการแจ้งซ่อมบำรุงใหม่'}
              </h3>
              <p className="text-xs text-slate-400">
                แจ้งปัญหาห้องพักเพื่อส่งต่อฝ่ายช่างและปรับสถานะห้อง
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
              เลือกห้องพัก (Select Room) *
            </label>
            <select
              value={roomId}
              disabled={isEditing}
              onChange={(e) => setRoomId(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:ring-2 focus:ring-teal-500 font-semibold"
            >
              {rooms.map(r => (
                <option key={r.id} value={r.id}>
                  {r.roomNumber} - {r.name} ({r.status})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">
              รายละเอียดปัญหา / สิ่งที่ต้องซ่อม *
            </label>
            <textarea
              rows={3}
              required
              value={issueDescription}
              onChange={(e) => setIssueDescription(e.target.value)}
              placeholder="เช่น แอร์ไม่เย็น, เครื่องทำน้ำอุ่นไม่ทำงาน, หลอดไฟห้องน้ำขาด..."
              className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:ring-2 focus:ring-teal-500 resize-none font-medium"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                ผู้แจ้งปัญหา (Reported By)
              </label>
              <input
                type="text"
                value={reportedBy}
                onChange={(e) => setReportedBy(e.target.value)}
                placeholder="ชื่อช่าง / ผู้รายงาน"
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:ring-2 focus:ring-teal-500 font-medium"
              />
            </div>

            {isEditing && (
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  สถานะการซ่อม
                </label>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value as 'PENDING_REPAIR' | 'RESOLVED')}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:ring-2 focus:ring-teal-500 font-semibold"
                >
                  <option value="PENDING_REPAIR">🔴 รอช่างซ่อม</option>
                  <option value="RESOLVED">🟢 ซ่อมเสร็จแล้ว</option>
                </select>
              </div>
            )}
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
              className="px-5 py-2 bg-red-600 hover:bg-red-700 text-white font-bold rounded-xl shadow-xs transition-colors flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
            >
              <Check className="w-3.5 h-3.5" />
              <span>{isSubmitting ? 'กำลังบันทึก...' : isEditing ? 'บันทึกการแก้ไข' : 'แจ้งซ่อมทันที'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
