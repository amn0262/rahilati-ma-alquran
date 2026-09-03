import { useState } from 'react';
import { useAppStore } from '../store/useAppStore';
import { JUZ_AMMA } from '../lib/constants';
import { ChevronLeft, CheckCircle2, PlayCircle, Star, RotateCcw, X } from 'lucide-react';
import confetti from 'canvas-confetti';
import { motion, AnimatePresence } from 'motion/react';

export function Memorize() {
  const { progress, addSession, loadData } = useAppStore();
  const [selectedSurah, setSelectedSurah] = useState<any>(null);
  const [showCelebration, setShowCelebration] = useState(false);

  const handleOpenSurah = (surah: any) => setSelectedSurah(surah);

  const getStatus = (surah: any) => {
    const p = progress[surah.id];
    if (!p || p.savedAyahs === 0) return { label: 'لم تبدأ', color: 'bg-gray-100 text-gray-500', icon: PlayCircle };
    if (p.savedAyahs < surah.ayahCount) return { label: 'قيد الحفظ', color: 'bg-yellow-100 text-yellow-600', icon: PlayCircle };
    if (!p.confirmed) return { label: 'مكتملة', color: 'bg-green-100 text-green-600', icon: CheckCircle2 };
    if (p.retentionScore < 50) return { label: 'تحتاج مراجعة', color: 'bg-red-100 text-red-600', icon: RotateCcw };
    return { label: 'ثابتة', color: 'bg-gold/20 text-gold', icon: Star };
  };

  return (
    <div className="p-5 pb-24">
      <h1 className="text-2xl font-extrabold text-primary mb-6 flex items-center gap-2">
        <BookIcon /> الحفظ
      </h1>

      <div className="space-y-3">
        {JUZ_AMMA.map(surah => {
          const p = progress[surah.id];
          const saved = p ? p.savedAyahs : 0;
          const status = getStatus(surah);
          const StatusIcon = status.icon;
          const percentage = Math.round((saved / surah.ayahCount) * 100);

          return (
            <div 
              key={surah.id}
              onClick={() => handleOpenSurah(surah)}
              className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 flex items-center gap-4 cursor-pointer hover:bg-gray-50 transition"
            >
              <div className="w-12 h-12 bg-primary-light rounded-xl flex items-center justify-center font-bold text-primary shrink-0">
                {surah.order}
              </div>
              
              <div className="flex-1">
                <div className="flex justify-between items-center mb-1">
                  <h3 className="font-bold text-lg">سورة {surah.name}</h3>
                  <span className="text-sm font-bold text-gray-400">{surah.ayahCount} آيات</span>
                </div>
                
                <div className="flex items-center gap-3">
                  <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
                    <div className="h-full bg-primary rounded-full transition-all" style={{ width: `${percentage}%` }} />
                  </div>
                  <span className="text-xs font-bold text-primary w-8">{percentage}%</span>
                </div>
              </div>
              
              <div className="flex flex-col items-center gap-1 shrink-0 w-20">
                <div className={`px-2 py-1 rounded-md text-[10px] font-bold w-full text-center flex items-center justify-center gap-1 ${status.color}`}>
                  <StatusIcon size={12} /> {status.label}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <AnimatePresence>
        {selectedSurah && (
          <SessionModal 
            surah={selectedSurah} 
            progress={progress[selectedSurah.id]} 
            onClose={() => setSelectedSurah(null)} 
            onSuccess={() => {
              setSelectedSurah(null);
              setShowCelebration(true);
              confetti({ particleCount: 100, spread: 70, origin: { y: 0.6 }, colors: ['#176B5B', '#D4A84F'] });
              setTimeout(() => setShowCelebration(false), 3000);
            }}
            addSession={addSession}
          />
        )}
      </AnimatePresence>
      
      <AnimatePresence>
        {showCelebration && (
           <motion.div 
             initial={{ opacity: 0, scale: 0.8 }}
             animate={{ opacity: 1, scale: 1 }}
             exit={{ opacity: 0, scale: 0.8 }}
             className="fixed inset-0 z-[60] flex items-center justify-center p-6 bg-black/40 backdrop-blur-sm"
           >
             <div className="bg-white rounded-3xl p-8 text-center shadow-2xl w-full max-w-sm">
                <div className="text-6xl mb-4">🎉</div>
                <h2 className="text-2xl font-bold text-primary mb-2">ما شاء الله!</h2>
                <p className="text-gray-600 font-bold mb-4">لقد أنجزت عملاً رائعاً</p>
                <div className="inline-flex items-center gap-2 bg-yellow-50 text-gold font-bold px-4 py-2 rounded-xl mb-6">
                  <Star fill="currentColor" size={20} /> + نجوم
                </div>
             </div>
           </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function SessionModal({ surah, progress, onClose, onSuccess, addSession }: any) {
  const [fromAyah, setFromAyah] = useState(1);
  const [toAyah, setToAyah] = useState(1);
  const [duration, setDuration] = useState(10);
  const [error, setError] = useState('');

  const handleSave = async () => {
    if (fromAyah < 1 || toAyah > surah.ayahCount || fromAyah > toAyah) {
      setError(`الرجاء إدخال أرقام صحيحة بين 1 و ${surah.ayahCount}`);
      return;
    }
    setError('');
    
    await addSession({
      surahId: surah.id,
      fromAyah,
      toAyah,
      count: (toAyah - fromAyah) + 1,
      date: new Date().toISOString(),
      duration
    });
    
    onSuccess();
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: '100%' }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: '100%' }}
      transition={{ type: 'spring', damping: 25, stiffness: 200 }}
      className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 backdrop-blur-sm sm:items-center sm:p-4"
    >
      <div className="bg-white w-full max-w-md rounded-t-3xl sm:rounded-3xl p-6 shadow-2xl">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold">تسجيل حفظ: سورة {surah.name}</h2>
          <button onClick={onClose} className="p-2 bg-gray-100 rounded-full text-gray-500 hover:bg-gray-200 transition">
            <X size={20} />
          </button>
        </div>

        <div className="space-y-4">
          <div className="flex gap-4">
            <div className="flex-1">
              <label className="block font-bold text-sm mb-1 text-gray-600">من الآية</label>
              <input 
                type="number" min="1" max={surah.ayahCount}
                value={fromAyah} onChange={e => setFromAyah(parseInt(e.target.value) || 1)}
                className="w-full border-2 border-gray-200 rounded-xl p-3 text-center font-bold focus:border-primary outline-none transition"
              />
            </div>
            <div className="flex-1">
              <label className="block font-bold text-sm mb-1 text-gray-600">إلى الآية</label>
              <input 
                type="number" min="1" max={surah.ayahCount}
                value={toAyah} onChange={e => setToAyah(parseInt(e.target.value) || 1)}
                className="w-full border-2 border-gray-200 rounded-xl p-3 text-center font-bold focus:border-primary outline-none transition"
              />
            </div>
          </div>
          
          <div>
            <label className="block font-bold text-sm mb-1 text-gray-600">المدة (بالدقائق)</label>
            <input 
              type="number" min="1"
              value={duration} onChange={e => setDuration(parseInt(e.target.value) || 1)}
              className="w-full border-2 border-gray-200 rounded-xl p-3 text-center font-bold focus:border-primary outline-none transition"
            />
          </div>

          {error && <p className="text-red-500 font-bold text-sm text-center">{error}</p>}
          
          <div className="bg-primary-light p-3 rounded-xl flex justify-between items-center text-primary font-bold">
            <span>الآيات المختارة:</span>
            <span>{Math.max(0, toAyah - fromAyah + 1)} آية</span>
          </div>

          <button 
            onClick={handleSave}
            className="w-full bg-primary text-white font-bold text-lg py-4 rounded-xl shadow-lg shadow-primary/30 mt-4"
          >
            حفظ الجلسة
          </button>
        </div>
      </div>
    </motion.div>
  );
}

function BookIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-primary">
      <path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1 0-5H20"/>
    </svg>
  );
}
