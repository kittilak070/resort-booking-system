import React, { useState } from 'react';
import { useResort } from '../../context/ResortContext';
import { X, Bell, Mail, Smartphone, CheckCheck, Trash2, Send } from 'lucide-react';

interface NotificationDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

export const NotificationDrawer: React.FC<NotificationDrawerProps> = ({ isOpen, onClose }) => {
  const { notifications, clearNotifications, sendNotification, language } = useResort();
  const [filterType, setFilterType] = useState<'ALL' | 'SMS' | 'EMAIL'>('ALL');
  const [testRecipient, setTestRecipient] = useState('');
  const [testMessage, setTestMessage] = useState('');
  const [showTestForm, setShowTestForm] = useState(false);

  if (!isOpen) return null;

  const filtered = notifications.filter(n => {
    if (filterType === 'ALL') return true;
    return n.type === filterType;
  });

  const handleSendTest = (e: React.FormEvent) => {
    e.preventDefault();
    if (!testRecipient || !testMessage) return;

    sendNotification(
      testRecipient.includes('@') ? 'EMAIL' : 'SMS',
      testRecipient,
      testRecipient.includes('@') ? 'The Haven Resort: Test Notification' : 'The Haven Alert',
      testMessage,
      'TEST-LOG'
    );
    setTestMessage('');
    setShowTestForm(false);
  };

  const isEn = language === 'en';

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-slate-900/50 backdrop-blur-xs flex justify-end animate-in fade-in duration-200">
      <div className="bg-white w-full max-w-md h-full shadow-2xl flex flex-col border-l border-slate-200 animate-in slide-in-from-right duration-300">
        
        {/* Header */}
        <div className="bg-slate-900 text-white px-5 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-teal-500/20 text-teal-400 flex items-center justify-center border border-teal-500/30">
              <Bell className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white">
                {isEn ? 'Dispatched Notifications' : 'ศูนย์แจ้งเตือนลูกค้า (SMS & Email)'}
              </h3>
              <p className="text-[11px] text-teal-300">
                {isEn ? `${notifications.length} logs dispatched` : `ส่งข้อความแล้ว ${notifications.length} รายการ`}
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

        {/* Filter bar & Tools */}
        <div className="p-3 bg-slate-50 border-b border-slate-200 flex items-center justify-between gap-2">
          <div className="flex items-center gap-1 bg-white p-1 rounded-xl border border-slate-200 text-xs">
            <button
              onClick={() => setFilterType('ALL')}
              className={`px-2.5 py-1 rounded-lg font-semibold transition-all ${
                filterType === 'ALL'
                  ? 'bg-slate-900 text-white'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {isEn ? 'All' : 'ทั้งหมด'} ({notifications.length})
            </button>
            <button
              onClick={() => setFilterType('SMS')}
              className={`px-2.5 py-1 rounded-lg font-semibold flex items-center gap-1 transition-all ${
                filterType === 'SMS'
                  ? 'bg-emerald-600 text-white'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Smartphone className="w-3 h-3" />
              <span>SMS</span>
            </button>
            <button
              onClick={() => setFilterType('EMAIL')}
              className={`px-2.5 py-1 rounded-lg font-semibold flex items-center gap-1 transition-all ${
                filterType === 'EMAIL'
                  ? 'bg-blue-600 text-white'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Mail className="w-3 h-3" />
              <span>Email</span>
            </button>
          </div>

          <div className="flex items-center gap-1">
            <button
              onClick={() => setShowTestForm(!showTestForm)}
              className="px-2.5 py-1 bg-teal-50 hover:bg-teal-100 text-teal-800 border border-teal-200 rounded-lg text-xs font-semibold flex items-center gap-1"
            >
              <Send className="w-3 h-3 text-teal-600" />
              <span>{isEn ? 'Test' : 'ทดสอบส่ง'}</span>
            </button>
            {notifications.length > 0 && (
              <button
                onClick={clearNotifications}
                title={isEn ? 'Clear history' : 'ล้างประวัติ'}
                className="p-1.5 text-slate-400 hover:text-red-600 rounded-lg hover:bg-slate-200 transition-colors"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>

        {/* Quick Test Send Form */}
        {showTestForm && (
          <form onSubmit={handleSendTest} className="p-3 bg-teal-50 border-b border-teal-200 text-xs space-y-2">
            <div className="font-bold text-teal-900 flex items-center gap-1">
              <Send className="w-3.5 h-3.5 text-teal-600" />
              <span>{isEn ? 'Simulate Dispatch Notification' : 'จำลองการส่งการแจ้งเตือน'}</span>
            </div>
            <input
              type="text"
              required
              placeholder={isEn ? 'Recipient Phone or Email' : 'เบอร์โทรศัพท์ (SMS) หรือ อีเมล'}
              value={testRecipient}
              onChange={(e) => setTestRecipient(e.target.value)}
              className="w-full px-2.5 py-1.5 bg-white border border-teal-300 rounded-lg text-xs"
            />
            <input
              type="text"
              required
              placeholder={isEn ? 'Message body' : 'ข้อความแจ้งเตือน'}
              value={testMessage}
              onChange={(e) => setTestMessage(e.target.value)}
              className="w-full px-2.5 py-1.5 bg-white border border-teal-300 rounded-lg text-xs"
            />
            <div className="flex justify-end gap-1.5 pt-1">
              <button
                type="button"
                onClick={() => setShowTestForm(false)}
                className="px-2.5 py-1 text-slate-600 hover:bg-slate-200 rounded-lg text-[11px]"
              >
                {isEn ? 'Cancel' : 'ยกเลิก'}
              </button>
              <button
                type="submit"
                className="px-3 py-1 bg-teal-700 text-white rounded-lg font-bold text-[11px]"
              >
                {isEn ? 'Send Message' : 'ส่งข้อความ'}
              </button>
            </div>
          </form>
        )}

        {/* List of Notifications */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {filtered.length === 0 ? (
            <div className="h-64 flex flex-col items-center justify-center text-center p-6 text-slate-400">
              <Bell className="w-10 h-10 mb-2 stroke-1 text-slate-300" />
              <p className="text-xs font-semibold text-slate-600">
                {isEn ? 'No notification logs found' : 'ยังไม่มีประวัติการส่งข้อความ'}
              </p>
              <p className="text-[11px] text-slate-400 mt-1">
                {isEn ? 'Notifications dispatch automatically upon booking, payment, and checkout.' : 'ระบบจะส่งข้อความแจ้งเตือนอัตโนมัติเมื่อมีการจอง ชำระเงิน เช็คอิน หรือเช็คเอาท์'}
              </p>
            </div>
          ) : (
            filtered.map((item) => {
              const isSms = item.type === 'SMS';
              return (
                <div
                  key={item.id}
                  className="bg-slate-50 hover:bg-white p-3.5 rounded-2xl border border-slate-200 shadow-xs hover:shadow-md transition-all text-xs space-y-2"
                >
                  <div className="flex items-center justify-between">
                    <span
                      className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md font-bold text-[10px] ${
                        isSms
                          ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                          : 'bg-blue-100 text-blue-800 border border-blue-200'
                      }`}
                    >
                      {isSms ? <Smartphone className="w-3 h-3" /> : <Mail className="w-3 h-3" />}
                      <span>{item.type}</span>
                    </span>
                    <span className="text-[10px] text-slate-400 font-mono">
                      {item.timestamp}
                    </span>
                  </div>

                  <div className="font-bold text-slate-800 text-xs">
                    {item.title}
                  </div>

                  <p className="text-[11px] text-slate-600 leading-relaxed bg-white p-2.5 rounded-xl border border-slate-100 font-sans">
                    {item.message}
                  </p>

                  <div className="flex items-center justify-between text-[11px] pt-1 text-slate-500">
                    <span className="font-mono text-teal-800 font-semibold truncate max-w-[200px]">
                      To: {item.recipient}
                    </span>
                    <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-600">
                      <CheckCheck className="w-3.5 h-3.5" />
                      <span>{isEn ? 'Delivered' : 'จัดส่งแล้ว'}</span>
                    </span>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer info */}
        <div className="p-3 bg-slate-100 border-t border-slate-200 text-[11px] text-slate-500 text-center">
          ⚡ {isEn ? 'Simulated SMS Gateway & SendGrid/SES Edge Trigger' : 'จำลองระบบส่งข้อความอัตโนมัติ SMS Gateway & Transactional Email'}
        </div>

      </div>
    </div>
  );
};
