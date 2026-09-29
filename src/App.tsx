import React, { useState } from 'react';
import { ResortProvider, useResort } from './context/ResortContext';
import { Navbar } from './components/Navbar';
import { HeroBanner } from './components/guest/HeroBanner';
import { SearchFilter } from './components/guest/SearchFilter';
import { RoomCard } from './components/guest/RoomCard';
import { BookingModal } from './components/guest/BookingModal';
import { MyBookingLookup } from './components/guest/MyBookingLookup';
import { RoomTimelineGrid } from './components/frontdesk/RoomTimelineGrid';
import { HousekeepingMobileView } from './components/housekeeping/HousekeepingMobileView';
import { PricingManager } from './components/admin/PricingManager';
import { Room } from './types';
import { Palmtree, ShieldCheck, Heart, Sparkles, Phone, Mail, MapPin } from 'lucide-react';

const MainAppContent: React.FC = () => {
  const { rooms, activeRole } = useResort();

  // Search filter states
  const today = new Date().toISOString().split('T')[0];
  const tomorrow = new Date(Date.now() + 86400000).toISOString().split('T')[0];

  const [checkInDate, setCheckInDate] = useState<string>(today);
  const [checkOutDate, setCheckOutDate] = useState<string>(tomorrow);
  const [guestsCount, setGuestsCount] = useState<number>(2);
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');

  // Selected room for booking
  const [selectedRoomForBooking, setSelectedRoomForBooking] = useState<Room | null>(null);
  const [showMyBookingLookup, setShowMyBookingLookup] = useState<boolean>(false);

  // Filter rooms based on category & capacity
  const filteredRooms = rooms.filter(room => {
    if (selectedCategory !== 'ALL' && room.type !== selectedCategory) {
      return false;
    }
    return true;
  });

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-between">
      <div>
        <Navbar onOpenMyBookings={() => setShowMyBookingLookup(true)} />

        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          
          {/* GUEST VIEW */}
          {activeRole === 'GUEST' && (
            <div>
              <HeroBanner />
              
              <SearchFilter
                checkInDate={checkInDate}
                setCheckInDate={setCheckInDate}
                checkOutDate={checkOutDate}
                setCheckOutDate={setCheckOutDate}
                guestsCount={guestsCount}
                setGuestsCount={setGuestsCount}
                selectedCategory={selectedCategory}
                setSelectedCategory={setSelectedCategory}
              />

              {/* Room Cards Grid */}
              <div className="mb-12">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h3 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
                      วิลล่าและห้องพักแนะนำ
                      <span className="text-xs font-semibold text-teal-700 bg-teal-50 px-2.5 py-1 rounded-full border border-teal-200">
                        พบ {filteredRooms.length} ห้องพัก
                      </span>
                    </h3>
                    <p className="text-xs sm:text-sm text-slate-500 mt-1">
                      เลือกห้องพักที่ท่านต้องการ จองวันนี้พร้อมรับสิทธิ์ฟรีบริการเสริมพิเศษ
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {filteredRooms.map(room => (
                    <RoomCard
                      key={room.id}
                      room={room}
                      checkInDate={checkInDate}
                      onSelect={(r) => setSelectedRoomForBooking(r)}
                    />
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* FRONT DESK VIEW */}
          {activeRole === 'FRONT_DESK' && (
            <RoomTimelineGrid />
          )}

          {/* HOUSEKEEPING VIEW */}
          {activeRole === 'HOUSEKEEPER' && (
            <HousekeepingMobileView />
          )}

          {/* ADMIN / MANAGER VIEW */}
          {activeRole === 'MANAGER' && (
            <PricingManager />
          )}

        </main>
      </div>

      {/* Booking Checkout Modal */}
      {selectedRoomForBooking && (
        <BookingModal
          room={selectedRoomForBooking}
          onClose={() => setSelectedRoomForBooking(null)}
          initialCheckIn={checkInDate}
          initialCheckOut={checkOutDate}
          initialGuests={guestsCount}
        />
      )}

      {/* My Bookings Lookup & Cancellation Modal */}
      {showMyBookingLookup && (
        <MyBookingLookup onClose={() => setShowMyBookingLookup(false)} />
      )}

      {/* Footer */}
      <footer className="bg-slate-900 text-white border-t border-slate-800 mt-16 pt-12 pb-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-10 text-xs text-slate-400">
            
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-white font-bold text-base">
                <Palmtree className="w-5 h-5 text-teal-400" />
                <span>The Haven Serene Resort</span>
              </div>
              <p className="leading-relaxed">
                รีสอร์ทส่วนตัวริมทะเลระดับ 5 ดาว มอบประสบการณ์พักผ่อนเหนือระดับท่ามกลางธรรมชาติอันบริสุทธิ์
              </p>
              <div className="flex items-center gap-1.5 text-teal-400 font-semibold">
                <Sparkles className="w-3.5 h-3.5" />
                <span>Powered by Cloudflare Pages & Edge Worker</span>
              </div>
            </div>

            <div>
              <h4 className="text-white font-bold text-sm mb-3">นโยบายและการจอง</h4>
              <ul className="space-y-2">
                <li>• ระบบล็อกห้อง 15 นาที ไร้ Overbooking (BR-01)</li>
                <li>• เวลาเช็คอิน 14:00 น. / เช็คเอาท์ 12:00 น. (BR-02)</li>
                <li>• นโยบายการยกเลิกและคืนเงิน (BR-03)</li>
                <li>• เงินมัดจำความเสียหาย 1,000 บาท (BR-04)</li>
              </ul>
            </div>

            <div>
              <h4 className="text-white font-bold text-sm mb-3">ติดต่อและสอบถาม</h4>
              <ul className="space-y-2">
                <li className="flex items-center gap-1.5"><MapPin className="w-3.5 h-3.5 text-teal-400" /> หาดทรายขาว เกาะสวรรค์ ตราด</li>
                <li className="flex items-center gap-1.5"><Phone className="w-3.5 h-3.5 text-teal-400" /> 039-555-888 (24 ชั่วโมง)</li>
                <li className="flex items-center gap-1.5"><Mail className="w-3.5 h-3.5 text-teal-400" /> reservation@thehavenresort.com</li>
              </ul>
            </div>

            <div>
              <h4 className="text-white font-bold text-sm mb-3">ความปลอดภัยและการเข้ารหัส</h4>
              <div className="p-3 bg-slate-800 rounded-xl border border-slate-700/60 space-y-1.5">
                <div className="flex items-center gap-1.5 text-emerald-400 font-semibold text-xs">
                  <ShieldCheck className="w-4 h-4" />
                  <span>Cloudflare SSL & WAF 100%</span>
                </div>
                <p className="text-[11px] text-slate-400">
                  คุ้มครองข้อมูลตาม พ.ร.บ. คุ้มครองข้อมูลส่วนบุคคล (PDPA) และมาตรฐานการชำระเงิน PCI-DSS
                </p>
              </div>
            </div>

          </div>

          <div className="pt-6 border-t border-slate-800/80 flex flex-col sm:flex-row items-center justify-between text-[11px] text-slate-500 gap-2">
            <span>© 2026 The Haven Serene Resort & Villas. สงวนลิขสิทธิ์ทั้งหมด</span>
            <span className="flex items-center gap-1">
              สร้างด้วย <Heart className="w-3 h-3 text-red-500 fill-red-500" /> บน Cloudflare Platform
            </span>
          </div>
        </div>
      </footer>
    </div>
  );
};

export const App: React.FC = () => {
  return (
    <ResortProvider>
      <MainAppContent />
    </ResortProvider>
  );
};

export default App;
