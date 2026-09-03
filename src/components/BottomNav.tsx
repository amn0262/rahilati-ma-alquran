import { Link, useLocation } from 'react-router-dom';
import { Home, BookOpen, RotateCcw, Trophy, User } from 'lucide-react';
import { motion } from 'motion/react';

export function BottomNav() {
  const location = useLocation();
  const path = location.pathname;

  const navItems = [
    { path: '/', icon: Home, label: 'الرئيسية' },
    { path: '/memorize', icon: BookOpen, label: 'الحفظ' },
    { path: '/review', icon: RotateCcw, label: 'المراجعة' },
    { path: '/achievements', icon: Trophy, label: 'الإنجازات' },
    { path: '/profile', icon: User, label: 'حسابي' },
  ];

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-[#E7F3EF] shadow-[0_-4px_20px_rgba(0,0,0,0.02)] pb-safe z-50">
      <div className="flex justify-around items-center h-20 max-w-md mx-auto px-4">
        {navItems.map((item) => {
          const isActive = path === item.path || (item.path !== '/' && path.startsWith(item.path));
          const Icon = item.icon;
          
          return (
            <Link 
              key={item.path} 
              to={item.path}
              className="relative flex flex-col items-center justify-center w-full h-full"
            >
              <div className={`flex flex-col items-center justify-center gap-1 ${isActive ? 'text-primary font-bold' : 'text-gray-400'}`}>
                <div className="w-8 h-8 flex items-center justify-center">
                  <Icon size={24} className={isActive ? 'fill-primary/10' : ''} />
                </div>
                <span className="text-[10px]">{item.label}</span>
                {isActive && (
                  <motion.div 
                    layoutId="navIndicator" 
                    className="w-1 h-1 bg-primary rounded-full mt-[2px]"
                  />
                )}
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
