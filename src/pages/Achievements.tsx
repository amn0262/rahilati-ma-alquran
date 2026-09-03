import { useState } from 'react';
import { useAppStore } from '../store/useAppStore';
import { Trophy, Star, Award, Lock, FileText, Printer, X } from 'lucide-react';
import { TOTAL_JUZ_AMMA_AYAHS, TOTAL_JUZ_AMMA_SURAHS } from '../lib/constants';
import { motion, AnimatePresence } from 'motion/react';

const BADGES = [
  { id: 'first_step', title: 'أول خطوة', icon: '🌱' },
  { id: 'first_surah', title: 'أول سورة', icon: '📖' },
  { id: 'ayahs_50', title: '50 آية', icon: '⭐' },
  { id: 'ayahs_100', title: '100 آية', icon: '🌟' },
  { id: 'streak_7', title: 'أسبوع كامل', icon: '🔥' },
  { id: 'streak_30', title: 'شهر من الحفظ', icon: '📅' },
  { id: 'surahs_10', title: '10 سور', icon: '📚' },
  { id: 'juz_half', title: 'نصف جزء', icon: '🏅' },
  { id: 'juz_amma', title: 'جزء عمّ', icon: '🏆' },
];

export function Achievements() {
  const { child, achievements, progress, sessions } = useAppStore();
  const [showCert, setShowCert] = useState(false);
  
  const savedAyahs = Object.values(progress).reduce((acc, p) => acc + p.savedAyahs, 0);
  const percentage = Math.round((savedAyahs / TOTAL_JUZ_AMMA_AYAHS) * 100) || 0;

  if (!child) return null;

  return (
    <div className="p-5 pb-24">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-extrabold text-primary flex items-center gap-2">
          <TrophyIcon /> الإنجازات
        </h1>
        <div className="bg-yellow-50 text-gold font-bold px-4 py-2 rounded-xl flex items-center gap-1">
          <Star fill="currentColor" size={18} /> {child.stars}
        </div>
      </div>

      {/* Progress Timeline */}
      <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100 mb-6">
        <h2 className="font-bold text-lg mb-6">رحلة جزء عمّ</h2>
        <div className="relative pt-2 pb-8 px-2">
          <div className="absolute top-4 bottom-10 right-[15px] w-1 bg-gray-100 rounded-full" />
          <div 
            className="absolute top-4 right-[15px] w-1 bg-primary rounded-full transition-all" 
            style={{ height: `${percentage}%` }}
          />
          
          <TimelineNode label="البداية" icon="🌱" active={true} />
          <TimelineNode label="25%" icon="⭐" active={percentage >= 25} />
          <TimelineNode label="50%" icon="🏅" active={percentage >= 50} />
          <TimelineNode label="75%" icon="🌟" active={percentage >= 75} />
          <TimelineNode label="100%" icon="🏆" active={percentage >= 100} isLast />
        </div>

        {percentage >= 100 ? (
          <button onClick={() => setShowCert(true)} className="w-full mt-4 bg-primary text-white font-bold py-4 rounded-xl flex items-center justify-center gap-2 shadow-lg shadow-primary/30">
            <FileText size={20} /> عرض شهادة جزء عمّ
          </button>
        ) : (
          <div className="text-center text-sm font-bold text-gray-400 mt-4">
            أكمل الجزء لتحصل على الشهادة الكبرى
          </div>
        )}
      </div>

      {/* Badges Grid */}
      <h2 className="font-bold text-lg mb-4">الشارات</h2>
      <div className="grid grid-cols-3 gap-3">
        {BADGES.map(badge => {
          const isUnlocked = !!achievements[badge.id];
          return (
            <div 
              key={badge.id}
              className={`rounded-2xl p-3 flex flex-col items-center justify-center text-center gap-2 border transition ${
                isUnlocked 
                  ? 'bg-white border-primary/20 shadow-sm' 
                  : 'bg-gray-50 border-gray-100 opacity-50 grayscale'
              }`}
            >
              <div className="text-3xl relative">
                {badge.icon}
                {!isUnlocked && (
                  <div className="absolute -bottom-1 -right-1 bg-gray-200 rounded-full p-0.5 text-gray-500">
                    <Lock size={12} />
                  </div>
                )}
              </div>
              <span className="font-bold text-[11px] leading-tight text-gray-700">{badge.title}</span>
            </div>
          );
        })}
      </div>

      <AnimatePresence>
        {showCert && (
          <CertificateModal 
            child={child} 
            sessions={sessions}
            onClose={() => setShowCert(false)} 
          />
        )}
      </AnimatePresence>
    </div>
  );
}

function CertificateModal({ child, sessions, onClose }: any) {
  const uniqueDays = new Set(sessions.map((s:any) => s.date.split('T')[0])).size;

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[100] flex flex-col bg-white overflow-hidden"
    >
      <div className="flex justify-between items-center p-4 border-b border-gray-100 print:hidden bg-white">
        <button onClick={onClose} className="p-2 bg-gray-100 rounded-full text-gray-500 hover:bg-gray-200">
          <X size={20} />
        </button>
        <button onClick={() => window.print()} className="bg-primary text-white font-bold px-4 py-2 rounded-xl flex items-center gap-2">
          <Printer size={18} /> طباعة
        </button>
      </div>

      <div className="flex-1 overflow-auto bg-gray-100 p-4 sm:p-8 flex items-center justify-center print:p-0 print:bg-white">
        <div id="printable-certificate" className="bg-bg-cream w-full max-w-[794px] aspect-[1/1.414] shadow-2xl relative p-8 sm:p-12 border-8 border-double border-gold/40 flex flex-col items-center justify-center text-center print:shadow-none print:w-full print:h-screen print:border-8 print:border-double print:border-gold/40">
          
          <div className="text-primary/10 absolute top-10 right-10 text-9xl">🌿</div>
          <div className="text-primary/10 absolute bottom-10 left-10 text-9xl">🌿</div>
          
          <div className="z-10 flex flex-col items-center">
            <h2 className="text-3xl sm:text-4xl font-extrabold text-primary mb-2">بسم الله الرحمن الرحيم</h2>
            <div className="w-24 h-1 bg-gold rounded-full mb-8"></div>
            
            <h1 className="text-5xl sm:text-6xl font-black text-gold mb-10">شهادة إنجاز</h1>
            
            <p className="text-xl sm:text-2xl text-gray-600 mb-6 font-bold">تشهد هذه الشهادة بأن البطل</p>
            <h2 className="text-4xl sm:text-5xl font-extrabold text-primary mb-8">{child.name}</h2>
            
            <p className="text-xl sm:text-2xl text-gray-600 mb-6 font-bold">قد أتم بحمد الله وتوفيقه حفظ</p>
            <h3 className="text-5xl sm:text-6xl font-black text-primary mb-6">جزء عمّ</h3>
            
            <p className="text-xl font-bold text-gray-500 mb-12">
              {TOTAL_JUZ_AMMA_SURAHS} سورة | {TOTAL_JUZ_AMMA_AYAHS} آية
            </p>

            <div className="grid grid-cols-2 gap-8 w-full max-w-md text-right text-gray-700 font-bold border-t border-b border-gold/30 py-6 mb-12">
              <div>
                <p className="text-sm text-gray-500">تاريخ الإنجاز</p>
                <p className="text-lg text-primary">{new Date().toLocaleDateString('ar-SA')}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">عدد أيام الحفظ</p>
                <p className="text-lg text-primary">{uniqueDays} يوماً</p>
              </div>
            </div>

            <div className="flex justify-between w-full px-8 text-gray-600 font-bold">
              <div className="text-center">
                <p className="mb-2">توقيع ولي الأمر</p>
                <div className="w-32 border-b-2 border-gray-400"></div>
              </div>
              <div className="text-center flex flex-col items-center">
                <span className="text-3xl mb-1">🌿</span>
                <p className="text-sm text-primary">تطبيق رحلتي مع القرآن</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

function TimelineNode({ label, icon, active, isLast = false }: any) {
  return (
    <div className={`flex items-center gap-4 ${!isLast ? 'mb-8' : ''} relative z-10`}>
      <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm border-2 ${
        active ? 'bg-primary border-primary text-white' : 'bg-white border-gray-200 grayscale opacity-50'
      }`}>
        {icon}
      </div>
      <span className={`font-bold ${active ? 'text-primary' : 'text-gray-400'}`}>
        {label}
      </span>
    </div>
  );
}

function TrophyIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-primary">
      <path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6"/>
      <path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18"/>
      <path d="M4 22h16"/>
      <path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22"/>
      <path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22"/>
      <path d="M18 2H6v7a6 6 0 0 0 12 0V2Z"/>
    </svg>
  );
}
