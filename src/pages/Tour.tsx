import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppStore } from '../store/useAppStore';
import { motion, AnimatePresence } from 'motion/react';
import { BookOpen, RotateCcw, Trophy, BarChart3, Award, ChevronRight } from 'lucide-react';

const TOUR_STEPS = [
  {
    icon: BookOpen,
    title: 'الحفظ',
    desc: 'سجّل الآيات التي حفظتها وشاهد تقدمك في كل سورة.',
    color: 'bg-green-50 text-primary'
  },
  {
    icon: RotateCcw,
    title: 'المراجعة',
    desc: 'راجع ما حفظته وحافظ على ثباته.',
    color: 'bg-blue-50 text-blue-600'
  },
  {
    icon: Trophy,
    title: 'الإنجازات',
    desc: 'اجمع النجوم وافتح الشارات مع كل خطوة.',
    color: 'bg-yellow-50 text-yellow-600'
  },
  {
    icon: BarChart3,
    title: 'تقدمي',
    desc: 'تابع عدد الآيات والسور والأيام ونسبة التقدم.',
    color: 'bg-purple-50 text-purple-600'
  },
  {
    icon: Award,
    title: 'الشهادات',
    desc: 'احتفل بإنجازاتك بشهادات قابلة للطباعة.',
    color: 'bg-rose-50 text-rose-600'
  }
];

export function Tour() {
  const navigate = useNavigate();
  const updateChild = useAppStore(s => s.updateChild);
  const [step, setStep] = useState(0);

  const handleNext = async () => {
    if (step < TOUR_STEPS.length - 1) {
      setStep(s => s + 1);
    } else {
      await updateChild({ completedTour: true });
      navigate('/');
    }
  };

  const handleSkip = async () => {
    await updateChild({ completedTour: true });
    navigate('/');
  };

  const current = TOUR_STEPS[step];
  const Icon = current.icon;

  return (
    <div className="min-h-screen bg-bg-cream flex flex-col">
      <div className="flex justify-end p-4">
        <button onClick={handleSkip} className="text-gray-500 font-bold px-4 py-2">تخطي</button>
      </div>

      <div className="flex-1 flex flex-col items-center justify-center p-8 text-center">
        <AnimatePresence mode="wait">
          <motion.div
            key={step}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="flex flex-col items-center w-full max-w-sm"
          >
            <div className={`w-32 h-32 rounded-full flex items-center justify-center mb-8 ${current.color} shadow-sm`}>
              <Icon size={64} />
            </div>
            
            <h2 className="text-3xl font-extrabold mb-4">{current.title}</h2>
            <p className="text-lg text-gray-600 leading-relaxed">{current.desc}</p>
          </motion.div>
        </AnimatePresence>
      </div>

      <div className="p-8 pb-12 flex flex-col items-center gap-8">
        <div className="flex gap-2">
          {TOUR_STEPS.map((_, i) => (
            <div 
              key={i} 
              className={`h-2 rounded-full transition-all ${i === step ? 'w-8 bg-primary' : 'w-2 bg-gray-300'}`} 
            />
          ))}
        </div>

        <button 
          onClick={handleNext}
          className="w-full max-w-sm bg-primary text-white font-bold text-lg py-4 rounded-2xl flex items-center justify-center gap-2 shadow-lg shadow-primary/30"
        >
          {step === TOUR_STEPS.length - 1 ? 'ابدأ الآن' : 'التالي'}
          <ChevronRight size={20} />
        </button>
      </div>
    </div>
  );
}
