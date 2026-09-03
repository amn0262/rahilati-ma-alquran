import { useAppStore } from '../store/useAppStore';
import { TOTAL_JUZ_AMMA_AYAHS, TOTAL_JUZ_AMMA_SURAHS, JUZ_AMMA } from '../lib/constants';
import { CircularProgressbar, buildStyles } from 'react-circular-progressbar';
import 'react-circular-progressbar/dist/styles.css';
import { Book, Hash, Calendar, Star, Trophy, ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useEffect, useState } from 'react';

export function Home() {
  const { child, progress, sessions } = useAppStore();
  const [progressData, setProgressData] = useState({ ayahs: 0, surahs: 0, days: 0 });

  useEffect(() => {
    let savedAyahs = 0;
    let completedSurahs = 0;
    
    Object.values(progress).forEach(p => {
      savedAyahs += p.savedAyahs;
      const surahInfo = JUZ_AMMA.find(s => s.id === p.surahId);
      if (surahInfo && p.savedAyahs === surahInfo.ayahCount) {
        completedSurahs++;
      }
    });

    const uniqueDates = new Set(sessions.map(s => s.date.split('T')[0]));
    
    setProgressData({
      ayahs: savedAyahs,
      surahs: completedSurahs,
      days: uniqueDates.size
    });
  }, [progress, sessions]);

  if (!child) return null;

  const percentage = Math.round((progressData.ayahs / TOTAL_JUZ_AMMA_AYAHS) * 100) || 0;
  
  // Daily Goal Logic
  const todayStr = new Date().toISOString().split('T')[0];
  const todaySessions = sessions.filter(s => s.date.startsWith(todayStr));
  const todayAyahs = todaySessions.reduce((acc, s) => acc + s.count, 0);
  const goalRemaining = Math.max(0, child.dailyGoal - todayAyahs);
  const goalProgress = Math.min(100, Math.round((todayAyahs / child.dailyGoal) * 100));

  // Next Achievement Logic
  const nextTarget = Math.ceil((progressData.ayahs + 1) / 50) * 50; 
  const nextRemaining = Math.max(0, nextTarget - progressData.ayahs);

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center pt-2">
        <div className="text-right">
          <p className="text-sm font-bold text-gray-800">السلام عليكم يا {child.name} 👋</p>
          <p className="text-xs text-gray-500 mt-1">مستوى: مجتهد 🌟</p>
        </div>
        <div className="w-12 h-12 rounded-full border-2 border-gold overflow-hidden bg-primary-light flex items-center justify-center shadow-sm">
          <span className="text-2xl">👦</span>
        </div>
      </div>

      {/* Main Journey Card */}
      <div className="bg-white rounded-[32px] p-8 shadow-sm border border-[#E7F3EF] flex flex-col items-center justify-center text-center relative overflow-hidden">
        <div className="absolute top-0 right-0 p-4 opacity-10">
          <svg width="120" height="120" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M50 0L61.2 38.8H100L68.8 61.2L80 100L50 77.5L20 100L31.2 61.2L0 38.8H38.8L50 0Z" fill="var(--color-primary)"/>
          </svg>
        </div>
        
        <h2 className="text-primary text-lg font-bold mb-4 z-10">تقدم جزء عمّ</h2>
        <div className="relative w-48 h-48 flex items-center justify-center mb-4 z-10">
          <div className="absolute inset-0">
            <CircularProgressbar 
              value={percentage} 
              strokeWidth={12}
              styles={buildStyles({
                pathColor: 'var(--color-gold)',
                trailColor: '#E7F3EF',
                strokeLinecap: 'round',
                pathTransitionDuration: 0.5,
              })}
            />
          </div>
          <div className="absolute flex flex-col items-center">
            <span className="text-5xl font-black text-primary">{percentage}%</span>
            <span className="text-sm text-gray-500 mt-1 font-bold">مكتمل</span>
          </div>
        </div>
        <p className="text-sm font-bold text-gray-700">{progressData.ayahs} / {TOTAL_JUZ_AMMA_AYAHS} آية</p>
        <p className="text-xs text-gray-400 font-bold mt-1">{progressData.surahs} / {TOTAL_JUZ_AMMA_SURAHS} سورة</p>
        <Link to="/memorize" className="mt-6 w-full py-3 bg-primary text-white rounded-2xl font-bold shadow-lg shadow-primary/20 hover:scale-[1.02] active:scale-95 transition-transform flex justify-center items-center relative z-10">
          ابدأ الحفظ الآن
        </Link>
      </div>

      {/* Quick Stats Grid */}
      <div className="grid grid-cols-2 gap-4">
        <StatCard icon="📖" label="آية محفوظة" value={progressData.ayahs} bg="bg-[#E7F3EF]" textColor="text-primary" />
        <StatCard icon="📚" label="سور مكتملة" value={progressData.surahs} bg="bg-[#E7F3EF]" textColor="text-primary" />
        <StatCard icon="📅" label="أيام الحفظ" value={progressData.days} bg="bg-[#E7F3EF]" textColor="text-primary" />
        <StatCard icon="⭐" label="النجوم" value={child.stars} bg="bg-[#FFF9E6]" textColor="text-gold" />
      </div>

      {/* Daily Goal */}
      <div className="bg-primary text-white p-6 rounded-[32px] flex items-center justify-between shadow-xl relative overflow-hidden">
        <div className="relative z-10 flex-1">
          <h3 className="text-lg font-bold flex items-center gap-2">🎯 هدف اليوم <span className="text-xs font-normal opacity-80">({child.dailyGoal} آيات)</span></h3>
          <div className="mt-4 w-full h-3 bg-white/20 rounded-full overflow-hidden">
            <div className="h-full bg-gold transition-all duration-1000" style={{ width: `${goalProgress}%` }} />
          </div>
          {goalRemaining > 0 ? (
            <p className="mt-3 text-sm">ما شاء الله! بقيت <span className="font-bold text-gold">{goalRemaining} آيات</span> فقط لتكمل هدفك اليوم.</p>
          ) : (
            <p className="mt-3 text-sm font-bold text-gold">ما شاء الله! أنجزت هدفك اليوم 🎉</p>
          )}
        </div>
        <div className="relative z-10 bg-white/10 p-4 rounded-2xl backdrop-blur-md border border-white/20 mr-4 shrink-0">
          <div className="text-center">
            <p className="text-2xl font-black">{todayAyahs} / {child.dailyGoal}</p>
            <p className="text-[10px] uppercase font-bold mt-1 text-white/80">التقدم الحالي</p>
          </div>
        </div>
        {/* Abstract Shape Decoration */}
        <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-white/5 rounded-full blur-2xl"></div>
      </div>

      {/* Upcoming Achievement & Retention */}
      <div className="grid grid-cols-2 gap-4">
        {/* Achievement */}
        <div className="bg-white rounded-[32px] p-5 border border-[#E7F3EF] flex flex-col items-center justify-center text-center shadow-sm">
          <div className="w-16 h-16 mb-4 bg-gray-50 rounded-full flex items-center justify-center border-2 border-dashed border-gray-200 grayscale opacity-40">
            <span className="text-3xl">🏅</span>
          </div>
          <h4 className="font-bold text-primary text-sm leading-tight">الإنجاز القادم:<br/>الوصول إلى {nextTarget} آية</h4>
          <div className="mt-3 w-full bg-gray-100 h-2 rounded-full overflow-hidden">
            <div className="h-full bg-primary transition-all duration-1000" style={{ width: `${(progressData.ayahs / nextTarget) * 100}%` }}></div>
          </div>
          <p className="mt-2 text-[10px] text-gray-500 font-bold">بقي {nextRemaining} آية فقط!</p>
        </div>
        
        {/* Retention Score */}
        <div className="bg-white rounded-[32px] p-5 border border-[#E7F3EF] flex flex-col items-center justify-center text-center shadow-sm">
          <div className="w-14 h-14 rounded-2xl bg-[#E7F3EF] flex items-center justify-center mb-3">
            <span className="text-2xl">🔥</span>
          </div>
          <h4 className="font-bold text-primary text-sm">سلسلة الاستمرارية</h4>
          <p className="text-2xl font-black mt-2 text-gray-900">{progressData.days} أيام</p>
          <div className="flex justify-center gap-1 mt-4 w-full">
            {[1,2,3,4,5,6,7].map(i => {
               // Simple active logic for UI
               const isActive = i <= (progressData.days % 7 === 0 && progressData.days > 0 ? 7 : progressData.days % 7);
               return <div key={i} className={`w-2 h-2 rounded-full ${isActive ? 'bg-primary' : 'bg-gray-200'}`}></div>
            })}
          </div>
        </div>
      </div>
      
      <div className="h-10"></div>
    </div>
  );
}

function StatCard({ icon, label, value, bg, textColor }: { icon: string, label: string, value: number, bg: string, textColor: string }) {
  return (
    <div className="bg-white p-5 rounded-3xl border border-[#E7F3EF] shadow-sm flex flex-col items-center">
      <div className={`w-10 h-10 ${bg} ${textColor} rounded-xl flex items-center justify-center mb-2 text-xl`}>
        {icon}
      </div>
      <span className={`text-2xl font-black ${textColor === 'text-gold' ? 'text-gold' : 'text-gray-900'}`}>{value}</span>
      <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider mt-1 text-center">{label}</span>
    </div>
  );
}
