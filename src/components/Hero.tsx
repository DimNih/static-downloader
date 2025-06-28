import React from 'react';
import { useApp } from '../context/AppContext';
import { translations } from '../utils/translations';
import { Zap, Shield, Smartphone } from 'lucide-react';

const Hero: React.FC = () => {
  const { language, isDarkMode } = useApp();
  const t = translations[language];

  return (
    <section className={`py-20 px-4 transition-colors duration-300 ${
      isDarkMode 
        ? 'bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900' 
        : 'bg-gradient-to-br from-blue-50 via-white to-blue-50'
    }`}>
      <div className="container mx-auto text-center">
        <div className="mb-8 animate-fade-in">
          <h1 className={`text-4xl md:text-6xl lg:text-7xl font-bold mb-6 leading-tight transition-colors duration-300 ${
            isDarkMode ? 'text-white' : 'text-slate-900'
          }`}>
            {t.heroTitle}
            <span className="block bg-gradient-to-r from-blue-400 via-blue-500 to-blue-600 bg-clip-text text-transparent">
              {t.heroSubtitle}
            </span>
          </h1>
          <p className={`text-lg md:text-xl max-w-2xl mx-auto leading-relaxed transition-colors duration-300 ${
            isDarkMode ? 'text-slate-300' : 'text-slate-600'
          }`}>
            {t.heroDescription}
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto mb-12">
          <div className={`backdrop-blur-md rounded-2xl p-6 border transition-all duration-300 hover:scale-105 ${
            isDarkMode 
              ? 'bg-slate-800/50 border-slate-700 hover:bg-slate-800/70' 
              : 'bg-white/70 border-slate-200 hover:bg-white/90 shadow-lg'
          }`}>
            <Zap className="w-12 h-12 text-yellow-500 mx-auto mb-4" />
            <h3 className={`font-semibold text-lg mb-2 transition-colors duration-300 ${
              isDarkMode ? 'text-white' : 'text-slate-900'
            }`}>
              {t.lightningFast}
            </h3>
            <p className={`transition-colors duration-300 ${
              isDarkMode ? 'text-slate-300' : 'text-slate-600'
            }`}>
              {t.lightningFastDesc}
            </p>
          </div>
          
          <div className={`backdrop-blur-md rounded-2xl p-6 border transition-all duration-300 hover:scale-105 ${
            isDarkMode 
              ? 'bg-slate-800/50 border-slate-700 hover:bg-slate-800/70' 
              : 'bg-white/70 border-slate-200 hover:bg-white/90 shadow-lg'
          }`}>
            <Shield className="w-12 h-12 text-green-500 mx-auto mb-4" />
            <h3 className={`font-semibold text-lg mb-2 transition-colors duration-300 ${
              isDarkMode ? 'text-white' : 'text-slate-900'
            }`}>
              {t.secure}
            </h3>
            <p className={`transition-colors duration-300 ${
              isDarkMode ? 'text-slate-300' : 'text-slate-600'
            }`}>
              {t.secureDesc}
            </p>
          </div>
          
          <div className={`backdrop-blur-md rounded-2xl p-6 border transition-all duration-300 hover:scale-105 ${
            isDarkMode 
              ? 'bg-slate-800/50 border-slate-700 hover:bg-slate-800/70' 
              : 'bg-white/70 border-slate-200 hover:bg-white/90 shadow-lg'
          }`}>
            <Smartphone className="w-12 h-12 text-blue-500 mx-auto mb-4" />
            <h3 className={`font-semibold text-lg mb-2 transition-colors duration-300 ${
              isDarkMode ? 'text-white' : 'text-slate-900'
            }`}>
              {t.mobileFriendly}
            </h3>
            <p className={`transition-colors duration-300 ${
              isDarkMode ? 'text-slate-300' : 'text-slate-600'
            }`}>
              {t.mobileFriendlyDesc}
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;