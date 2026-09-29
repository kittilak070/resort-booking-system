import React from 'react';
import { Sparkles, ShieldCheck, HeartHandshake, Award } from 'lucide-react';

export const HeroBanner: React.FC = () => {
  return (
    <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-teal-900 via-teal-800 to-slate-900 text-white shadow-xl mb-8">
      {/* Background Image Overlay */}
      <div 
        className="absolute inset-0 bg-cover bg-center opacity-30 mix-blend-overlay"
        style={{ backgroundImage: `url('https://images.unsplash.com/photo-1540555700478-4be289fbecef?auto=format&fit=crop&w=1800&q=80')` }}
      />

      <div className="relative max-w-5xl mx-auto px-6 py-14 sm:py-16 text-center">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-teal-500/20 border border-teal-400/30 text-teal-200 text-xs font-medium mb-4 backdrop-blur-sm">
          <Sparkles className="w-3.5 h-3.5 text-teal-300" />
          <span>สัมผัสการพักผ่อนริมทะเลระดับลักชัวรี | พร้อมสระว่ายน้ำส่วนตัว</span>
        </div>

        <h2 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-white mb-4 leading-tight">
          พักผ่อนอย่างเงียบสงบ <br className="hidden sm:inline" />
          ท่ามกลางธรรมชาติและผืนทรายขาว
        </h2>
        
        <p className="max-w-2xl mx-auto text-base sm:text-lg text-teal-100/90 font-light mb-8">
          จองตรงกับเรารับประกันราคาดีที่สุด การันตีห้องพักว่างเรียลไทม์ 100% พร้อมระบบชำระเงินปลอดภัยมาตรฐานสากล
        </p>

        {/* Value Highlights */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 max-w-3xl mx-auto pt-4 border-t border-teal-700/50">
          <div className="flex items-center justify-center gap-2 text-xs sm:text-sm text-teal-200">
            <ShieldCheck className="w-4 h-4 text-teal-400 shrink-0" />
            <span>ระบบล็อกสต็อก 15 นาที ไร้ปัญหาจองชน</span>
          </div>
          <div className="flex items-center justify-center gap-2 text-xs sm:text-sm text-teal-200">
            <HeartHandshake className="w-4 h-4 text-teal-400 shrink-0" />
            <span>ยกเลิกฟรีตามเงื่อนไข คืนเงินเต็มจำนวน</span>
          </div>
          <div className="flex items-center justify-center gap-2 text-xs sm:text-sm text-teal-200">
            <Award className="w-4 h-4 text-teal-400 shrink-0" />
            <span>บริการอาหารเช้า & Floating Breakfast</span>
          </div>
        </div>
      </div>
    </div>
  );
};
