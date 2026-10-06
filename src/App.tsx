import React, { useState } from 'react';
import { ResortProvider, useResort } from './context/ResortContext';
import { Navbar } from './components/Navbar';
import { HeroBanner } from './components/guest/HeroBanner';
import { SearchFilter } from './components/guest/SearchFilter';
import { RoomCard } from './components/guest/RoomCard';
import { BookingModal } from './components/guest/BookingModal';
import { MyBookingLookup } from './components/guest/MyBookingLookup';
import { ReviewsModal } from './components/guest/ReviewsModal';
import { NotificationDrawer } from './components/common/NotificationDrawer';
import { GoogleAuthModal } from './components/common/GoogleAuthModal';
import { ChatbotWidget } from './components/common/ChatbotWidget';
import { RoomTimelineGrid } from './components/frontdesk/RoomTimelineGrid';
import { HousekeepingMobileView } from './components/housekeeping/HousekeepingMobileView';
import { PricingManager } from './components/admin/PricingManager';
import { Room } from './types';
import { Palmtree, ShieldCheck, Heart, Sparkles, Phone, Mail, MapPin, Star } from 'lucide-react';

const MainAppContent: React.FC = () => {
  const { rooms, activeRole, setActiveRole, language, currentUser } = useResort();
  const isEn = language === 'en';

  // Search filter states
  const today = new Date().toISOString().split('T')[0];
  const tomorrow = new Date(Date.now() + 86400000).toISOString().split('T')[0];

  const [checkInDate, setCheckInDate] = useState<string>(today);
  const [checkOutDate, setCheckOutDate] = useState<string>(tomorrow);
  const [guestsCount, setGuestsCount] = useState<number>(2);
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');

  // Modals state
  const [selectedRoomForBooking, setSelectedRoomForBooking] = useState<Room | null>(null);
  const [pendingRoomForBooking, setPendingRoomForBooking] = useState<Room | null>(null);
  const [showGoogleAuthForBooking, setShowGoogleAuthForBooking] = useState<boolean>(false);
  const [showMyBookingLookup, setShowMyBookingLookup] = useState<boolean>(false);
  const [showNotificationDrawer, setShowNotificationDrawer] = useState<boolean>(false);
  const [showReviewsModal, setShowReviewsModal] = useState<boolean>(false);
  const [selectedRoomForReviews, setSelectedRoomForReviews] = useState<Room | null>(null);
  const [showChatbot, setShowChatbot] = useState<boolean>(false);

  // Require Google Sign-In before booking
  const handleSelectRoom = (room: Room) => {
    if (!currentUser) {
      setPendingRoomForBooking(room);
      setShowGoogleAuthForBooking(true);
    } else {
      setSelectedRoomForBooking(room);
    }
  };

  // Filter rooms based on category & capacity
  const filteredRooms = rooms.filter(room => {
    if (selectedCategory !== 'ALL' && room.type !== selectedCategory) {
      return false;
    }
    return true;
  });

  const isCurrentUserAdmin = currentUser?.role === 'ADMIN' || currentUser?.role === 'MANAGER';

  // Defensive auto-reset: Enforce role-based access control
  React.useEffect(() => {
    if ((activeRole === 'MANAGER' || (activeRole as string) === 'ADMIN') && !isCurrentUserAdmin) {
      setActiveRole('GUEST');
    } else if (activeRole === 'FRONT_DESK' && currentUser?.role !== 'FRONT_DESK' && !isCurrentUserAdmin) {
      setActiveRole('GUEST');
    } else if (activeRole === 'HOUSEKEEPER' && currentUser?.role !== 'HOUSEKEEPER' && !isCurrentUserAdmin) {
      setActiveRole('GUEST');
    }
  }, [currentUser, activeRole, setActiveRole, isCurrentUserAdmin]);

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-between">
      <div>
        <Navbar 
          onOpenMyBookings={() => setShowMyBookingLookup(true)} 
          onOpenNotifications={() => setShowNotificationDrawer(true)}
          onOpenChatbot={() => setShowChatbot(prev => !prev)}
        />

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
              <div className="mb-12" id="room-cards-section">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                  <div>
                    <h3 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
                      {isEn ? 'Featured Villas & Suites' : 'วิลล่าและห้องพักแนะนำ'}
                      <span className="text-xs font-semibold text-teal-700 bg-teal-50 px-2.5 py-1 rounded-full border border-teal-200">
                        {isEn ? `${filteredRooms.length} available` : `พบ ${filteredRooms.length} ห้องพัก`}
                      </span>
                    </h3>
                    <p className="text-xs sm:text-sm text-slate-500 mt-1">
                      {isEn
                        ? 'Reserve your private sanctuary today with complimentary resort privileges and instant hold lock'
                        : 'เลือกห้องพักที่ท่านต้องการ จองวันนี้พร้อมรับสิทธิ์ฟรีบริการเสริมพิเศษและระบบล็อกห้อง 15 นาที'}
                    </p>
                  </div>

                  <button
                    onClick={() => {
                      setSelectedRoomForReviews(null);
                      setShowReviewsModal(true);
                    }}
                    className="self-start sm:self-auto px-4 py-2 bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 font-bold text-xs rounded-xl shadow-xs inline-flex items-center gap-1.5 transition-colors"
                  >
                    <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                    <span>{isEn ? 'View All Guest Reviews' : 'ดูรีวิวผู้เข้าพักทั้งหมด'}</span>
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {filteredRooms.map(room => (
                    <RoomCard
                      key={room.id}
                      room={room}
                      checkInDate={checkInDate}
                      onSelect={handleSelectRoom}
                      onViewReviews={(r) => {
                        setSelectedRoomForReviews(r);
                        setShowReviewsModal(true);
                      }}
                    />
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* FRONT DESK VIEW (Staff & Manager Only) */}
          {activeRole === 'FRONT_DESK' && (
            (currentUser?.role === 'FRONT_DESK' || isCurrentUserAdmin) ? (
              <RoomTimelineGrid />
            ) : (
              <div className="bg-white p-8 sm:p-12 rounded-3xl border border-red-200 text-center max-w-lg mx-auto shadow-xl my-8">
                <div className="w-16 h-16 rounded-full bg-red-100 text-red-600 flex items-center justify-center mx-auto mb-4">
                  <ShieldCheck className="w-8 h-8" />
                </div>
                <h3 className="text-xl font-bold text-slate-900 mb-2">403 Access Denied</h3>
                <p className="text-sm text-slate-600 mb-6 leading-relaxed">
                  {isEn 
                    ? 'Front Desk operations are restricted to authorized front desk staff and administrators only.' 
                    : 'ส่วนงานต้อนรับส่วนหน้า (Front Desk) สงวนสิทธิ์เฉพาะเจ้าหน้าที่แผนกต้อนรับและแอดมินเท่านั้น ห้ามผู้ใช้ทั่วไปเข้าถึง'}
                </p>
                <button
                  onClick={() => setActiveRole('GUEST')}
                  className="px-6 py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-xl shadow-xs transition-colors"
                >
                  {isEn ? 'Return to Home' : 'กลับสู่หน้าหลัก'}
                </button>
              </div>
            )
          )}

          {/* HOUSEKEEPING VIEW (Housekeeping & Admin Only) */}
          {activeRole === 'HOUSEKEEPER' && (
            (currentUser?.role === 'HOUSEKEEPER' || isCurrentUserAdmin) ? (
              <HousekeepingMobileView />
            ) : (
              <div className="bg-white p-8 sm:p-12 rounded-3xl border border-red-200 text-center max-w-lg mx-auto shadow-xl my-8">
                <div className="w-16 h-16 rounded-full bg-red-100 text-red-600 flex items-center justify-center mx-auto mb-4">
                  <ShieldCheck className="w-8 h-8" />
                </div>
                <h3 className="text-xl font-bold text-slate-900 mb-2">403 Access Denied</h3>
                <p className="text-sm text-slate-600 mb-6 leading-relaxed">
                  {isEn 
                    ? 'Housekeeping operations are restricted to authorized housekeeping staff and administrators only.' 
                    : 'ส่วนงานแม่บ้าน (Housekeeping) สงวนสิทธิ์เฉพาะเจ้าหน้าที่แม่บ้านและแอดมินเท่านั้น ห้ามผู้ใช้ทั่วไปเข้าถึง'}
                </p>
                <button
                  onClick={() => setActiveRole('GUEST')}
                  className="px-6 py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-xl shadow-xs transition-colors"
                >
                  {isEn ? 'Return to Home' : 'กลับสู่หน้าหลัก'}
                </button>
              </div>
            )
          )}

          {/* ADMIN VIEW (Strictly Admin Only) */}
          {(activeRole === 'MANAGER' || (activeRole as string) === 'ADMIN') && (
            isCurrentUserAdmin ? (
              <PricingManager />
            ) : (
              <div className="bg-white p-8 sm:p-12 rounded-3xl border border-red-200 text-center max-w-lg mx-auto shadow-xl my-8">
                <div className="w-16 h-16 rounded-full bg-red-100 text-red-600 flex items-center justify-center mx-auto mb-4">
                  <ShieldCheck className="w-8 h-8" />
                </div>
                <h3 className="text-xl font-bold text-slate-900 mb-2">403 Access Denied</h3>
                <p className="text-sm text-slate-600 mb-6 leading-relaxed">
                  {isEn 
                    ? 'Admin section is restricted to Administrators only.' 
                    : 'ส่วนผู้ดูแลระบบ (Admin) สงวนสิทธิ์เฉพาะแอดมินเท่านั้น ห้ามผู้ใช้ทั่วไปเข้าถึง'}
                </p>
                <button
                  onClick={() => setActiveRole('GUEST')}
                  className="px-6 py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-xl shadow-xs transition-colors"
                >
                  {isEn ? 'Return to Home' : 'กลับสู่หน้าหลัก'}
                </button>
              </div>
            )
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

      {/* Google Authentication Modal required before Booking */}
      {showGoogleAuthForBooking && (
        <GoogleAuthModal
          isOpen={showGoogleAuthForBooking}
          onClose={() => {
            setShowGoogleAuthForBooking(false);
            setPendingRoomForBooking(null);
          }}
          onSuccess={() => {
            setShowGoogleAuthForBooking(false);
            if (pendingRoomForBooking) {
              setSelectedRoomForBooking(pendingRoomForBooking);
              setPendingRoomForBooking(null);
            }
          }}
          requiredRoleName={
            pendingRoomForBooking
              ? (isEn ? `Reservation: ${pendingRoomForBooking.nameEn}` : `การจอง: ${pendingRoomForBooking.name}`)
              : (isEn ? 'Guest Reservation' : 'การจองห้องพัก')
          }
        />
      )}

      {/* My Bookings Lookup & Cancellation Modal */}
      {showMyBookingLookup && (
        <MyBookingLookup onClose={() => setShowMyBookingLookup(false)} />
      )}

      {/* Reviews Modal */}
      {showReviewsModal && (
        <ReviewsModal
          room={selectedRoomForReviews}
          onClose={() => setShowReviewsModal(false)}
        />
      )}

      {/* Notification Drawer */}
      <NotificationDrawer
        isOpen={showNotificationDrawer}
        onClose={() => setShowNotificationDrawer(false)}
      />

      {/* Floating AI Concierge Chatbot Widget */}
      <ChatbotWidget
        isOpen={showChatbot}
        onToggle={() => setShowChatbot(prev => !prev)}
        onOpenMyBookings={() => setShowMyBookingLookup(true)}
      />

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
                {isEn
                  ? 'A 5-star beachfront luxury sanctuary offering unmatched hospitality, tranquility, and timeless elegance.'
                  : 'รีสอร์ทส่วนตัวริมทะเลระดับ 5 ดาว มอบประสบการณ์พักผ่อนเหนือระดับท่ามกลางธรรมชาติอันบริสุทธิ์'}
              </p>
              <div className="flex items-center gap-1.5 text-teal-400 font-semibold">
                <Sparkles className="w-3.5 h-3.5" />
                <span>Powered by Cloudflare Pages & Edge Worker (Phase 3)</span>
              </div>
            </div>

            <div>
              <h4 className="text-white font-bold text-sm mb-3">
                {isEn ? 'Policies & Operations' : 'นโยบายและการจอง'}
              </h4>
              <ul className="space-y-2">
                <li>• {isEn ? '15-min Inventory Hold (BR-01)' : 'ระบบล็อกห้อง 15 นาที ไร้ Overbooking (BR-01)'}</li>
                <li>• {isEn ? 'Check-in 14:00 / Check-out 12:00 (BR-02)' : 'เวลาเช็คอิน 14:00 น. / เช็คเอาท์ 12:00 น. (BR-02)'}</li>
                <li>• {isEn ? 'Tiered Cancellation & Refund Policy (BR-03)' : 'นโยบายการยกเลิกและคืนเงินเป็นลำดับขั้น (BR-03)'}</li>
                <li>• {isEn ? 'Security Deposit ฿1,000 with Minibar Folio (BR-04)' : 'เงินมัดจำความเสียหาย 1,000 บาท & หักมินิบาร์ (BR-04)'}</li>
              </ul>
            </div>

            <div>
              <h4 className="text-white font-bold text-sm mb-3">
                {isEn ? 'Contact & Assistance' : 'ติดต่อและสอบถาม'}
              </h4>
              <ul className="space-y-2">
                <li className="flex items-center gap-1.5"><MapPin className="w-3.5 h-3.5 text-teal-400" /> {isEn ? 'White Sand Beach, Koh Chang, Trat' : 'หาดทรายขาว เกาะสวรรค์ ตราด'}</li>
                <li className="flex items-center gap-1.5"><Phone className="w-3.5 h-3.5 text-teal-400" /> 039-555-888 (24/7 Front Desk)</li>
                <li className="flex items-center gap-1.5"><Mail className="w-3.5 h-3.5 text-teal-400" /> reservation@thehavenresort.com</li>
              </ul>
            </div>

            <div>
              <h4 className="text-white font-bold text-sm mb-3">
                {isEn ? 'Security & Encryption' : 'ความปลอดภัยและการเข้ารหัส'}
              </h4>
              <div className="p-3 bg-slate-800 rounded-xl border border-slate-700/60 space-y-1.5">
                <div className="flex items-center gap-1.5 text-emerald-400 font-semibold text-xs">
                  <ShieldCheck className="w-4 h-4" />
                  <span>Cloudflare SSL & WAF 100%</span>
                </div>
                <p className="text-[11px] text-slate-400">
                  {isEn
                    ? 'Compliance with PDPA & PCI-DSS encryption standards for guest privacy and payment tokens.'
                    : 'คุ้มครองข้อมูลตาม พ.ร.บ. คุ้มครองข้อมูลส่วนบุคคล (PDPA) และมาตรฐานการชำระเงิน PCI-DSS'}
                </p>
              </div>
            </div>

          </div>

          <div className="pt-6 border-t border-slate-800/80 flex flex-col sm:flex-row items-center justify-between text-[11px] text-slate-500 gap-2">
            <span>© 2026 The Haven Serene Resort & Villas. {isEn ? 'All rights reserved.' : 'สงวนลิขสิทธิ์ทั้งหมด'}</span>
            <span className="flex items-center gap-1">
              {isEn ? 'Engineered with' : 'สร้างด้วย'} <Heart className="w-3 h-3 text-red-500 fill-red-500" /> {isEn ? 'on Cloudflare Platform' : 'บน Cloudflare Platform'}
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
