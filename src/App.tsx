/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Layout } from './components/Layout';
import { SplashScreen } from './pages/SplashScreen';
import { Onboarding } from './pages/Onboarding';
import { Tour } from './pages/Tour';
import { Home } from './pages/Home';
import { Memorize } from './pages/Memorize';
import { Review } from './pages/Review';
import { Achievements } from './pages/Achievements';
import { Profile } from './pages/Profile';
import { useAppStore } from './store/useAppStore';
import { useEffect } from 'react';

function AppContent() {
  const { child, isLoading, loadData } = useAppStore();

  useEffect(() => {
    loadData();
  }, [loadData]);

  if (isLoading) return <SplashScreen />;

  if (!child || !child.completedOnboarding) {
    return (
      <Routes>
        <Route path="*" element={<Onboarding />} />
      </Routes>
    );
  }

  if (!child.completedTour) {
    return (
      <Routes>
        <Route path="*" element={<Tour />} />
      </Routes>
    );
  }

  return (
    <Routes>
      <Route element={<Layout />}>
        <Route path="/" element={<Home />} />
        <Route path="/memorize" element={<Memorize />} />
        <Route path="/review" element={<Review />} />
        <Route path="/achievements" element={<Achievements />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="*" element={<Navigate to="/" />} />
      </Route>
      <Route path="/tour" element={<Tour />} />
    </Routes>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AppContent />
    </BrowserRouter>
  );
}
