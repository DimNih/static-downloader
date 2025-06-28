import React from 'react';
import Header from './components/Header';
import Hero from './components/Hero';
import PlatformSelector from './components/PlatformSelector';
import DownloadSection from './components/DownloadSection';
import Footer from './components/Footer';
import { AppProvider } from './context/AppContext';

function App() {
  return (
    <AppProvider>
      <div className="min-h-screen transition-colors duration-300">
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