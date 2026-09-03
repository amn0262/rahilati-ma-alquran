import { Outlet } from 'react-router-dom';
import { BottomNav } from './BottomNav';

export function Layout() {
  return (
    <div className="min-h-screen bg-bg-cream flex justify-center">
      <div className="w-full max-w-md bg-bg-cream min-h-screen relative shadow-sm pb-20">
        <Outlet />
        <BottomNav />
      </div>
    </div>
  );
}
