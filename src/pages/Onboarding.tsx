import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppStore } from '../store/useAppStore';
import { motion } from 'motion/react';
import { ChevronRight } from 'lucide-react';

export function Onboarding() {
  const navigate = useNavigate();
  const updateChild = useAppStore(s => s.updateChild);
  const [step, setStep] = useState(0); // 0: Welcome, 1: Details
  
  const [name, setName] = useState('');
  const [age, setAge] = useState('');
  const [dailyGoal, setDailyGoal] = useState(5);

  const handleStart = () => setStep(1);

  const handleFinish = async () => {
    await updateChild({
      name: name.trim() || 'صديق القرآن',
      age: age ? parseInt(age) : undefined,
      dailyGoal,
      completedOnboarding: true,
    });
    navigate('/tour');
  };

  if (step === 0) {
    return (
      <div className="min-h-screen flex flex-col bg-primary text-white p-6 justify-center items-center text-center">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-6"
        >
          <div className="text-7xl">🌿</div>
          <h1 className="text-4xl font-bold">رحلتي مع القرآن</h1>
          <p className="text-xl text-primary-light opacity-90">«خطوة صغيرة اليوم... إنجاز عظيم غدًا.»</p>
        </motion.div>
        
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="mt-16 w-full max-w-xs"
        >
          <button 
            onClick={handleStart}
            className="w-full bg-white text-primary font-bold text-lg py-4 rounded-2xl shadow-lg hover:scale-105 transition-transform"
          >
            ابدأ رحلتي
          </button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-bg-cream p-6 flex flex-col text-text-dark">
      <motion.div 
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        className="flex-1 max-w-sm mx-auto w-full pt-12 space-y-8"
      >
        <div className="text-center space-y-2">
          <div className="text-5xl mb-4">👧👦</div>
          <h2 className="text-2xl font-bold">لنبدأ ببياناتك</h2>
          <p className="text-gray-500">لنجعل الرحلة مخصصة لك!</p>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block font-bold mb-2">ما اسمك؟</label>
            <input 
              type="text" 
              value={name}
              onChange={e => setName(e.target.value)}
              placeholder="اسم البطل..." 
              className="w-full border-2 border-gray-200 rounded-xl p-4 focus:border-primary focus:ring-0 outline-none transition"
            />
          </div>
          
          <div>
            <label className="block font-bold mb-2">كم عمرك؟ <span className="text-gray-400 font-normal text-sm">(اختياري)</span></label>
            <input 
              type="number" 
              value={age}
              onChange={e => setAge(e.target.value)}
              placeholder="مثال: 8" 
              className="w-full border-2 border-gray-200 rounded-xl p-4 focus:border-primary focus:ring-0 outline-none transition"
            />
          </div>
        </div>

        <div className="pt-4 space-y-4">
          <h3 className="font-bold text-lg">هدفي اليومي</h3>
          <p className="text-sm text-gray-500">كم آية تريد أن تحفظ كل يوم؟</p>
          <div className="flex flex-wrap gap-3">
            {[3, 5, 10, 15].map(val => (
              <button 
                key={val}
                onClick={() => setDailyGoal(val)}
                className={`flex-1 min-w-[70px] py-3 rounded-xl font-bold border-2 transition ${
                  dailyGoal === val 
                    ? 'bg-primary border-primary text-white' 
                    : 'bg-white border-gray-200 text-gray-600'
                }`}
              >
                {val} آيات
              </button>
            ))}
          </div>
        </div>
      </motion.div>

      <div className="max-w-sm mx-auto w-full pb-8 pt-4">
        <button 
          onClick={handleFinish}
          className="w-full bg-primary text-white font-bold text-lg py-4 rounded-2xl flex items-center justify-center gap-2 shadow-lg shadow-primary/30"
        >
          التالي
          <ChevronRight size={20} />
        </button>
      </div>
    </div>
  );
}
