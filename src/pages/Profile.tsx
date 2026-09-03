import { useState } from 'react';
import { useAppStore } from '../store/useAppStore';
import { dbApi } from '../lib/db';
import { User, Download, Upload, Info, RotateCcw, Save } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { PWAInstallButton } from '../components/PWAInstallButton';

export function Profile() {
  const { child, updateChild, loadData } = useAppStore();
  const navigate = useNavigate();
  const [isEditing, setIsEditing] = useState(false);
  const [name, setName] = useState(child?.name || '');
  const [dailyGoal, setDailyGoal] = useState(child?.dailyGoal || 5);
  const [message, setMessage] = useState('');

  if (!child) return null;

  const handleSave = async () => {
    await updateChild({ name, dailyGoal });
    setIsEditing(false);
    setMessage('تم حفظ التغييرات بنجاح');
    setTimeout(() => setMessage(''), 3000);
  };

  const handleExport = async () => {
    try {
      const data = await dbApi.exportData();
      const blob = new Blob([data], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `quran_journey_backup_${new Date().toISOString().split('T')[0]}.json`;
      a.click();
      URL.revokeObjectURL(url);
      setMessage('تم تصدير البيانات بنجاح');
      setTimeout(() => setMessage(''), 3000);
    } catch (e) {
      setMessage('حدث خطأ أثناء التصدير');
    }
  };

  const handleImport = async (e: any) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const text = await file.text();
      await dbApi.importData(text);
      await loadData();
      setMessage('تم استعادة البيانات بنجاح');
      setTimeout(() => setMessage(''), 3000);
    } catch (err) {
      setMessage('الملف غير صالح أو حدث خطأ');
      setTimeout(() => setMessage(''), 3000);
    }
  };

  return (
    <div className="p-5 pb-24 space-y-6">
      <h1 className="text-2xl font-extrabold text-primary flex items-center gap-2">
        <UserIcon /> حسابي
      </h1>

      {message && (
        <div className="bg-green-100 text-green-800 font-bold p-4 rounded-xl text-center">
          {message}
        </div>
      )}

      {/* Profile Card */}
      <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100">
        <div className="flex items-center gap-4 mb-6">
          <div className="w-16 h-16 bg-primary-light rounded-full flex items-center justify-center text-3xl">👦</div>
          <div className="flex-1">
            {isEditing ? (
              <input 
                type="text" value={name} onChange={e => setName(e.target.value)}
                className="w-full border-b-2 border-primary outline-none font-bold text-xl pb-1 mb-2 bg-transparent"
              />
            ) : (
              <h2 className="text-2xl font-bold text-gray-800">{child.name}</h2>
            )}
            <p className="text-gray-500 font-bold text-sm">بدأت الرحلة: {new Date(child.startDate).toLocaleDateString('ar-SA')}</p>
          </div>
        </div>

        <div className="space-y-4">
          <div className="bg-gray-50 p-4 rounded-xl">
            <label className="block text-sm font-bold text-gray-500 mb-1">الهدف اليومي (آيات)</label>
            {isEditing ? (
              <input 
                type="number" value={dailyGoal} onChange={e => setDailyGoal(parseInt(e.target.value) || 1)}
                className="w-full border-2 border-gray-200 rounded-lg p-2 font-bold outline-none focus:border-primary"
              />
            ) : (
              <p className="font-bold text-lg">{child.dailyGoal}</p>
            )}
          </div>

          {isEditing ? (
            <button onClick={handleSave} className="w-full bg-primary text-white font-bold py-3 rounded-xl flex justify-center items-center gap-2">
              <Save size={18} /> حفظ التغييرات
            </button>
          ) : (
            <button onClick={() => setIsEditing(true)} className="w-full bg-gray-100 text-gray-700 font-bold py-3 rounded-xl">
              تعديل البيانات
            </button>
          )}
        </div>
      </div>

      {/* Settings / Actions */}
      <div className="space-y-3">
        <h3 className="font-bold text-lg text-gray-700">الإعدادات والنسخ الاحتياطي</h3>
        
        <PWAInstallButton />
        
        <button onClick={handleExport} className="w-full bg-white border border-gray-200 text-gray-700 font-bold py-4 px-5 rounded-2xl flex items-center gap-3 hover:bg-gray-50 transition text-right">
          <div className="bg-blue-50 text-blue-600 p-2 rounded-lg"><Download size={20} /></div>
          <div className="flex-1">
            <div className="text-base">تصدير البيانات</div>
            <div className="text-xs text-gray-400 font-normal">احفظ نسخة من تقدمك (JSON)</div>
          </div>
        </button>
        
        <label className="w-full bg-white border border-gray-200 text-gray-700 font-bold py-4 px-5 rounded-2xl flex items-center gap-3 hover:bg-gray-50 transition text-right cursor-pointer">
          <div className="bg-green-50 text-green-600 p-2 rounded-lg"><Upload size={20} /></div>
          <div className="flex-1">
            <div className="text-base">استعادة البيانات</div>
            <div className="text-xs text-gray-400 font-normal">استرجع تقدمك من ملف سابق</div>
          </div>
          <input type="file" accept=".json" onChange={handleImport} className="hidden" />
        </label>

        <button onClick={() => navigate('/tour')} className="w-full bg-white border border-gray-200 text-gray-700 font-bold py-4 px-5 rounded-2xl flex items-center gap-3 hover:bg-gray-50 transition text-right">
          <div className="bg-purple-50 text-purple-600 p-2 rounded-lg"><RotateCcw size={20} /></div>
          <div className="flex-1">
            <div className="text-base">إعادة الجولة التعريفية</div>
          </div>
        </button>
      </div>
      
      {/* About */}
      <div className="bg-primary/5 rounded-3xl p-6 text-center mt-8">
        <div className="text-primary flex justify-center mb-2"><Info size={32} /></div>
        <h3 className="font-bold text-primary text-lg mb-2">رحلتي مع القرآن</h3>
        <p className="text-sm text-gray-600 leading-relaxed mb-4">
          تطبيق صُمم ليكون رفيقاً للأطفال في رحلة حفظ كتاب الله، يساعدهم على متابعة الحفظ والمراجعة وتوثيق الإنجازات بطريقة بسيطة ومشجعة.
        </p>
        <div className="text-xs text-gray-500 border-t border-primary/10 pt-4 mt-4">
          <p className="font-bold mb-1">المطور: أيمن بكور</p>
          <p>إن وجدتَ في هذا التطبيق فائدة، فلا تنسَ مطوّره من دعوة صادقة بظهر الغيب.</p>
        </div>
      </div>
    </div>
  );
}

function UserIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-primary">
      <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/>
      <circle cx="12" cy="7" r="4"/>
    </svg>
  );
}
