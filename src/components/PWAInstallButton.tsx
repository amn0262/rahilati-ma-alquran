import { useState } from 'react';
import { usePWAInstall } from '../hooks/usePWAInstall';
import { Download, X } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export function PWAInstallButton() {
  const { isInstallable, isInstalled, isIOS, install } = usePWAInstall();
  const [showIOSGuide, setShowIOSGuide] = useState(false);

  if (isInstalled) return null;

  if (isInstallable) {
    return (
      <button
        onClick={install}
        className="w-full bg-primary text-white font-bold py-4 px-5 rounded-2xl flex items-center gap-3 shadow-lg hover:shadow-xl transition text-right"
      >
        <div className="bg-white/20 p-2 rounded-lg"><Download size={20} /></div>
        <div className="flex-1">
          <div className="text-base">تثبيت التطبيق</div>
          <div className="text-xs opacity-90 font-normal">للوصول السريع والعمل بدون إنترنت</div>
        </div>
      </button>
    );
  }

  if (isIOS) {
    return (
      <>
        <button
          onClick={() => setShowIOSGuide(true)}
          className="w-full bg-primary text-white font-bold py-4 px-5 rounded-2xl flex items-center gap-3 shadow-lg hover:shadow-xl transition text-right"
        >
          <div className="bg-white/20 p-2 rounded-lg"><Download size={20} /></div>
          <div className="flex-1">
            <div className="text-base">تثبيت التطبيق</div>
            <div className="text-xs opacity-90 font-normal">للوصول السريع والعمل بدون إنترنت</div>
          </div>
        </button>

        <AnimatePresence>
          {showIOSGuide && (
            <motion.div 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 p-4"
            >
              <div className="w-full max-w-sm rounded-3xl bg-white p-6 shadow-xl relative text-center">
                <button onClick={() => setShowIOSGuide(false)} className="absolute top-4 right-4 text-gray-400">
                  <X size={24} />
                </button>
                <div className="text-5xl mb-4">📱</div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">تثبيت التطبيق على iPhone / iPad</h3>
                <p className="mt-2 text-sm text-gray-600 font-bold mb-6">
                  1. اضغط على زر <strong>المشاركة</strong> (Share) في شريط Safari بالأسفل.<br/><br/>
                  2. انزل للأسفل واضغط على <strong>إضافة للشاشة الرئيسية</strong> (Add to Home Screen).
                </p>
                <button
                  onClick={() => setShowIOSGuide(false)}
                  className="w-full rounded-xl bg-gray-100 py-3 text-sm font-bold text-gray-800 hover:bg-gray-200"
                >
                  حسناً
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </>
    );
  }

  return null;
}
