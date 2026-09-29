import React, { useState } from 'react';
import { useResort } from '../../context/ResortContext';
import { Room } from '../../types';
import { X, Star, MessageSquarePlus, Sparkles, CheckCircle2 } from 'lucide-react';

interface ReviewsModalProps {
  room?: Room | null;
  onClose: () => void;
}

export const ReviewsModal: React.FC<ReviewsModalProps> = ({ room, onClose }) => {
  const { reviews, addReview, language } = useResort();
  const isEn = language === 'en';

  const [showAddForm, setShowAddForm] = useState(false);
  const [guestName, setGuestName] = useState('');
  const [rating, setRating] = useState<number>(5);
  const [cleanlinessRating, setCleanlinessRating] = useState<number>(5);
  const [comment, setComment] = useState('');
  const [stayDate, setStayDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [submittedSuccess, setSubmittedSuccess] = useState(false);

  // Filter reviews for this room or show all if room not specified
  const filteredReviews = room
    ? reviews.filter(r => r.roomId === room.id)
    : reviews;

  const avgRating = filteredReviews.length > 0
    ? (filteredReviews.reduce((sum, r) => sum + r.rating, 0) / filteredReviews.length).toFixed(1)
    : '5.0';

  const avgCleanliness = filteredReviews.length > 0
    ? (filteredReviews.reduce((sum, r) => sum + r.cleanlinessRating, 0) / filteredReviews.length).toFixed(1)
    : '5.0';

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!guestName || !comment) return;

    const targetRoomId = room ? room.id : 'room-pv-101';
    addReview(targetRoomId, {
      roomId: targetRoomId,
      guestName,
      rating,
      cleanlinessRating,
      comment,
      stayDate
    });

    setSubmittedSuccess(true);
    setTimeout(() => {
      setSubmittedSuccess(false);
      setShowAddForm(false);
      setComment('');
      setGuestName('');
    }, 1500);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4">
      <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 max-w-2xl w-full overflow-hidden animate-in fade-in zoom-in-95 duration-200 flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="bg-slate-900 text-white px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center border border-amber-500/30">
              <Star className="w-4 h-4 fill-amber-400" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">
                {isEn ? 'Guest Reviews & Ratings' : 'รีวิวและคะแนนความประทับใจจากผู้เข้าพัก'}
              </h3>
              <p className="text-xs text-slate-400">
                {room ? (isEn ? room.nameEn || room.name : room.name) : (isEn ? 'All Villas & Suites' : 'รวมทุกวิลล่าและห้องพัก')}
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

        {/* Aggregate Stats Summary */}
        <div className="p-6 bg-slate-50 border-b border-slate-200 grid grid-cols-1 sm:grid-cols-3 gap-4 text-center sm:text-left">
          <div className="flex items-center gap-3">
            <div className="text-4xl font-black text-amber-500 flex items-center">
              {avgRating}
              <Star className="w-6 h-6 fill-amber-400 inline-block ml-1" />
            </div>
            <div>
              <div className="text-xs font-bold text-slate-800">
                {isEn ? 'Overall Score' : 'คะแนนภาพรวม'}
              </div>
              <div className="text-[11px] text-slate-500">
                {isEn ? `Based on ${filteredReviews.length} reviews` : `จาก ${filteredReviews.length} ความคิดเห็น`}
              </div>
            </div>
          </div>

          <div className="border-t sm:border-t-0 sm:border-l border-slate-200 sm:pl-4 flex flex-col justify-center">
            <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-700">
              <Sparkles className="w-3.5 h-3.5 text-teal-600" />
              <span>{isEn ? 'Cleanliness Rating' : 'ความสะอาดระดับห้าดาว'}</span>
            </div>
            <div className="text-sm font-bold text-teal-800 mt-0.5">
              {avgCleanliness} / 5.0
            </div>
          </div>

          <div className="flex items-center justify-center sm:justify-end">
            <button
              onClick={() => setShowAddForm(!showAddForm)}
              className="px-4 py-2 bg-teal-700 hover:bg-teal-800 text-white rounded-xl text-xs font-bold shadow-md inline-flex items-center gap-1.5 transition-transform hover:scale-105"
            >
              <MessageSquarePlus className="w-4 h-4" />
              <span>{isEn ? 'Write a Review' : 'เขียนรีวิวห้องนี้'}</span>
            </button>
          </div>
        </div>

        {/* Write Review Form */}
        {showAddForm && (
          <form onSubmit={handleSubmit} className="p-5 bg-teal-50/70 border-b border-teal-200 text-xs space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="font-bold text-teal-900 text-sm flex items-center gap-1.5">
                <Star className="w-4 h-4 text-amber-500 fill-amber-500" />
                {isEn ? 'Share Your Experience' : 'บอกเล่าความประทับใจของคุณ'}
              </h4>
              <button
                type="button"
                onClick={() => setShowAddForm(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {submittedSuccess ? (
              <div className="p-4 bg-emerald-100 border border-emerald-300 rounded-xl text-emerald-800 font-bold flex items-center gap-2 justify-center">
                <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                <span>{isEn ? 'Thank you! Your review was successfully submitted.' : 'ขอบพระคุณสำหรับความคิดเห็น ระบบได้บันทึกรีวิวแล้ว!'}</span>
              </div>
            ) : (
              <>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                      {isEn ? 'Your Name' : 'ชื่อของคุณ'}
                    </label>
                    <input
                      type="text"
                      required
                      placeholder={isEn ? 'e.g. John Doe' : 'เช่น คุณสมชาย มุ่งมั่น'}
                      value={guestName}
                      onChange={(e) => setGuestName(e.target.value)}
                      className="w-full px-3 py-1.5 bg-white border border-teal-300 rounded-lg text-xs"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                      {isEn ? 'Date of Stay' : 'วันที่เข้าพัก'}
                    </label>
                    <input
                      type="date"
                      required
                      value={stayDate}
                      onChange={(e) => setStayDate(e.target.value)}
                      className="w-full px-3 py-1.5 bg-white border border-teal-300 rounded-lg text-xs"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                      {isEn ? 'Overall Rating' : 'คะแนนความพึงพอใจโดยรวม'}
                    </label>
                    <div className="flex items-center gap-1">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <button
                          key={star}
                          type="button"
                          onClick={() => setRating(star)}
                          className="p-1 hover:scale-110 transition-transform"
                        >
                          <Star
                            className={`w-5 h-5 ${
                              star <= rating
                                ? 'text-amber-400 fill-amber-400'
                                : 'text-slate-300'
                            }`}
                          />
                        </button>
                      ))}
                      <span className="ml-2 font-bold text-slate-700">{rating} / 5</span>
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                      {isEn ? 'Cleanliness Rating' : 'คะแนนความสะอาดของห้อง'}
                    </label>
                    <div className="flex items-center gap-1">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <button
                          key={star}
                          type="button"
                          onClick={() => setCleanlinessRating(star)}
                          className="p-1 hover:scale-110 transition-transform"
                        >
                          <Star
                            className={`w-5 h-5 ${
                              star <= cleanlinessRating
                                ? 'text-teal-500 fill-teal-500'
                                : 'text-slate-300'
                            }`}
                          />
                        </button>
                      ))}
                      <span className="ml-2 font-bold text-slate-700">{cleanlinessRating} / 5</span>
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                    {isEn ? 'Your Review / Comments' : 'รายละเอียดความประทับใจ / ข้อเสนอแนะ'}
                  </label>
                  <textarea
                    rows={3}
                    required
                    placeholder={isEn ? 'Tell other travelers about your stay...' : 'เล่าประสบการณ์การเข้าพัก วิวทิวทัศน์ ความสะดวกสบาย และการบริการ...'}
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    className="w-full px-3 py-2 bg-white border border-teal-300 rounded-lg text-xs"
                  />
                </div>

                <div className="flex justify-end gap-2 pt-1">
                  <button
                    type="button"
                    onClick={() => setShowAddForm(false)}
                    className="px-3 py-1.5 text-slate-600 hover:bg-slate-200 rounded-lg text-xs"
                  >
                    {isEn ? 'Cancel' : 'ยกเลิก'}
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-1.5 bg-teal-800 text-white rounded-lg font-bold text-xs shadow-sm hover:bg-teal-900"
                  >
                    {isEn ? 'Post Review' : 'ส่งรีวิว'}
                  </button>
                </div>
              </>
            )}
          </form>
        )}

        {/* Reviews List */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {filteredReviews.length === 0 ? (
            <div className="text-center py-10 text-slate-400">
              <Star className="w-10 h-10 mx-auto mb-2 text-slate-300 stroke-1" />
              <p className="text-sm font-semibold text-slate-600">
                {isEn ? 'No reviews yet for this villa.' : 'ยังไม่มีรีวิวสำหรับห้องพักนี้'}
              </p>
              <p className="text-xs text-slate-400 mt-1">
                {isEn ? 'Be the first to share your experience!' : 'เป็นคนแรกที่มาร่วมแบ่งปันประสบการณ์การพักผ่อน'}
              </p>
            </div>
          ) : (
            filteredReviews.map((item) => (
              <div
                key={item.id}
                className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs space-y-2 hover:border-slate-300 transition-colors"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-teal-100 text-teal-800 font-bold flex items-center justify-center text-xs">
                      {item.guestName.charAt(0)}
                    </div>
                    <div>
                      <div className="font-bold text-slate-800 text-xs flex items-center gap-1.5">
                        <span>{item.guestName}</span>
                        <span className="text-[10px] text-teal-700 bg-teal-50 px-1.5 py-0.2 rounded border border-teal-200">
                          {isEn ? 'Verified Stay' : 'ยืนยันการเข้าพักจริง'}
                        </span>
                      </div>
                      <div className="text-[10px] text-slate-400">
                        {isEn ? `Stayed on: ${item.stayDate}` : `เข้าพักเมื่อ: ${item.stayDate}`}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-1">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Star
                        key={star}
                        className={`w-3.5 h-3.5 ${
                          star <= item.rating
                            ? 'text-amber-400 fill-amber-400'
                            : 'text-slate-200'
                        }`}
                      />
                    ))}
                  </div>
                </div>

                <p className="text-xs text-slate-700 leading-relaxed bg-slate-50 p-3 rounded-xl border border-slate-100">
                  "{item.comment}"
                </p>

                <div className="flex items-center justify-between text-[10px] text-slate-400 pt-1">
                  <span>
                    {isEn ? 'Cleanliness score:' : 'ความสะอาด:'}{' '}
                    <strong className="text-teal-700">{item.cleanlinessRating}/5</strong>
                  </span>
                  <span>{new Date(item.createdAt).toLocaleDateString()}</span>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 bg-slate-900 text-white rounded-xl text-xs font-bold hover:bg-slate-800"
          >
            {isEn ? 'Close' : 'ปิด'}
          </button>
        </div>

      </div>
    </div>
  );
};
