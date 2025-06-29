import React, { useState, useEffect } from 'react';
import Header from './components/Header';
import Hero from './components/Hero';
import PlatformSelector from './components/PlatformSelector';
import DownloadSection from './components/DownloadSection';
import Footer from './components/Footer';
import { AppProvider, useApp } from './context/AppContext';

const Preloader = () => {
  const { isDarkMode } = useApp();
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    // Simulate loading delay (replace with actual loading logic if needed)
    const timer = setTimeout(() => {
      setIsVisible(false);
    }, 3000); // 2 seconds delay for demo

    return () => clearTimeout(timer);
  }, []);

  if (!isVisible) return null;

  return (
    <div className={`
      fixed inset-0 flex items-center justify-center z-50 transition-opacity duration-1000
      ${isDarkMode ? 'bg-slate-900' : 'bg-slate-50'} 
      ${isVisible ? 'opacity-100' : 'opacity-0'}
    `}>
      <div className="flex flex-col items-center">
        <div className={`
          w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin
          ${isDarkMode ? 'border-blue-400' : 'border-blue-500'}
        `}></div>
        <p className={`
          mt-4 text-lg font-semibold animate-pulse
          ${isDarkMode ? 'text-slate-300' : 'text-slate-600'}
        `}>
          Loading App...
        </p>
      </div>
    </div>
  );
};

function App() {
  return (
    <AppProvider>
      <div className="min-h-screen transition-colors duration-300">
        <Preloader />
        <Header />
        <Hero />
        <PlatformSelector />
        <DownloadSection />
        <Footer />
      </div>
    </AppProvider>
  );
}

export default App;