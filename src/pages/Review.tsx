import { useState } from 'react';
import { useAppStore } from '../store/useAppStore';
import { JUZ_AMMA } from '../lib/constants';
import { Star, CheckCircle, Clock } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import confetti from 'canvas-confetti';

export function Review() {
  const { progress, addReview } = useAppStore();
  const [selectedSurah, setSelectedSurah] = useState<any>(null);
  
  // Get surahs that are fully memorized
  const reviewableSurahs = JUZ_AMMA.filter(surah => {
    const p = progress[surah.id];
    return p && p.savedAyahs === surah.ayahCount;
  }).map(surah => {
    const p = progress[surah.id];
    let daysSinceReview = 0;
    if (p?.lastReview) {
      const diffTime = Math.abs(new Date().getTime() - new Date(p.lastReview).getTime());
      daysSinceReview = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    } else {
      daysSinceReview = 999; // Never reviewed
    }
    return { ...surah, progress: p, daysSinceReview };
  }).sort((a, b) => b.daysSinceReview - a.daysSinceReview); // Needing review most at the top

  const handleReviewSuccess = () => {
    setSelectedSurah(null);
    confetti({ particleCount: 100, spread: 70, origin: { y: 0.6 }, colors: ['#176B5B', '#D4A84F'] });
  };

  return (
    <div className="p-5 pb-24">
      <h1 className="text-2xl font-extrabold text-primary mb-6 flex items-center gap-2">
        <RotateIcon /> المراجعة
      </h1>

      {reviewableSurahs.length === 0 ? (
        <div className="text-center py-20 text-gray-500 font-bold">
          <div className="text-6xl mb-4">📖</div>
          <p>أكمل حفظ سورة كاملة لتبدأ بمراجعتها هنا.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {reviewableSurahs.map(surah => (
            <div 
              key={surah.id}
              className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 flex flex-col gap-3 relative overflow-hidden"
            >
              {surah.daysSinceReview > 7 && (
                <div className="absolute top-0 right-0 bg-red-500 text-white text-[10px] font-bold px-3 py-1 rounded-bl-xl">
                  مراجعة عاجلة
                </div>
              )}
              
              <div className="flex justify-between items-center">
                <h3 className="font-bold text-xl">سورة {surah.name}</h3>
                <span className="bg-primary-light text-primary font-bold px-3 py-1 rounded-lg text-sm">
                  {surah.ayahCount} آيات
                </span>
              </div>
              
              <div className="flex items-center gap-4 text-sm font-bold text-gray-500">
                <div className="flex items-center gap-1">
                  <Clock size={16} /> 
                  {surah.daysSinceReview === 999 ? 'لم تراجع بعد' : `منذ ${surah.daysSinceReview} أيام`}
                </div>
                <div className="flex items-center gap-1">
                  <Star size={16} className={surah.progress?.retentionScore >= 80 ? "text-gold fill-gold" : "text-gray-300"} /> 
                  التثبيت: {surah.progress?.retentionScore || 0}%
                </div>
              </div>

              <button 
                onClick={() => setSelectedSurah(surah)}
                className="w-full mt-2 bg-gray-50 hover:bg-gray-100 text-primary border border-gray-200 font-bold py-3 rounded-xl transition"
              >
                ابدأ المراجعة
              </button>
            </div>
          ))}
        </div>
      )}

      <AnimatePresence>
        {selectedSurah && (
          <ReviewModal 
            surah={selectedSurah} 
            onClose={() => setSelectedSurah(null)} 
            addReview={addReview}
            onSuccess={handleReviewSuccess}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

function ReviewModal({ surah, onClose, addReview, onSuccess }: any) {
  const [score, setScore] = useState(0);

  const handleSave = async () => {
    if (score === 0) return;
    
    await addReview({
      surahId: surah.id,
      date: new Date().toISOString(),
      score,
    });
    
    onSuccess();
  };

  const getScoreDesc = (s: number) => {
    switch(s) {
      case 5: return "ممتاز - بدون أخطاء";
      case 4: return "جيد جداً - أخطاء بسيطة";
      case 3: return "جيد - يحتاج تركيز";
      case 2: return "ضعيف - يحتاج تدريب";
      case 1: return "إعادة حفظ";
      default: return "";
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 50 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 50 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm"
    >
      <div className="bg-white w-full max-w-sm rounded-3xl p-6 shadow-2xl relative text-center">
        <h2 className="text-2xl font-bold mb-2">كيف كان تسميع<br/>سورة {surah.name}؟</h2>
        <p className="text-gray-500 font-bold mb-6 text-sm">قيّم التسميع لولي الأمر أو المعلم</p>
        
        <div className="flex justify-center gap-2 mb-4 flex-row-reverse">
          {[5,4,3,2,1].map(s => (
            <button 
              key={s}
              onClick={() => setScore(s)}
              className="focus:outline-none transition-transform hover:scale-110"
            >
              <Star 
                size={40} 
                className={`${score >= s ? 'text-gold fill-gold' : 'text-gray-200'} transition-colors`} 
              />
            </button>
          ))}
        </div>
        
        <div className="h-6 mb-6 font-bold text-primary">
          {score > 0 ? getScoreDesc(score) : 'اختر التقييم'}
        </div>

        <div className="flex gap-3">
          <button 
            onClick={onClose}
            className="flex-1 bg-gray-100 text-gray-600 font-bold py-3 rounded-xl"
          >
            إلغاء
          </button>
          <button 
            onClick={handleSave}
            disabled={score === 0}
            className={`flex-1 font-bold py-3 rounded-xl text-white transition ${score > 0 ? 'bg-primary shadow-lg shadow-primary/30' : 'bg-gray-300'}`}
          >
            تأكيد التسميع
          </button>
        </div>
      </div>
    </motion.div>
  );
}

function RotateIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-primary">
      <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/>
      <path d="M3 3v5h5"/>
    </svg>
  );
}
