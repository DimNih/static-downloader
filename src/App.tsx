import React, { useEffect, useState } from 'react';
import Header from './components/Header';
import Hero from './components/Hero';
import PlatformSelector from './components/PlatformSelector';
import DownloadSection from './components/DownloadSection';
import Footer from './components/Footer';
import { AppProvider } from './context/AppContext';
import { X, Youtube } from 'lucide-react';

function App() {
  const [showPopup, setShowPopup] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setShowPopup(false);
    }, 10000); // popup hilang otomatis setelah 10 detik (opsional)

    return () => clearTimeout(timer);
  }, []);

  return (
    <AppProvider>
      <div className="min-h-screen transition-colors duration-300">
        {showPopup && (
          <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center">
            <div className="bg-white p-6 rounded-2xl shadow-lg max-w-sm w-full relative">
              <button
                className="absolute top-3 right-3 text-gray-500 hover:text-black"
                onClick={() => setShowPopup(false)}
              >
                <X className="w-5 h-5" />
              </button>
              <div className="flex flex-col items-center">
                <Youtube className="w-12 h-12 text-red-600 mb-4" />
                <h2 className="text-xl font-semibold mb-2 text-center">
                  Downloader YouTube Masih Error
                </h2>
                <p className="text-center text-sm text-gray-600">
                  Kurang Tahu Scrapingnya
                </p>
              </div>
            </div>
          </div>
        )}

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
