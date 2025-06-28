import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { translations } from '../utils/translations';
import { Download, Sun, Moon, Globe, Menu, X } from 'lucide-react';

const Header: React.FC = () => {
  const { language, setLanguage, isDarkMode, setIsDarkMode } = useApp();
  const t = translations[language];
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <header className={`sticky top-0 z-50 backdrop-blur-md border-b transition-colors duration-300 ${
      isDarkMode 
        ? 'bg-slate-900/90 border-slate-700' 
        : 'bg-white/90 border-slate-200'
    }`}>
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <img 
              src="https://cdnl.iconscout.com/lottie/premium/thumb/download-preloader-7357613-6014916.gif" 
              alt="Dim Downloader Logo" 
              className="w-10 h-10 rounded-full"
            />
            <h1 className={`text-2xl font-bold transition-colors duration-300 ${
              isDarkMode ? 'text-white' : 'text-slate-900'
            }`}>
              Dim Downloader
            </h1>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-6">
            <nav className="flex items-center space-x-6">
              <a 
                href="#platforms" 
                className={`transition-colors duration-300 ${
                  isDarkMode 
                    ? 'text-slate-300 hover:text-white' 
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {t.platforms}
              </a>
              <a 
                href="#download" 
                className={`transition-colors duration-300 ${
                  isDarkMode 
                    ? 'text-slate-300 hover:text-white' 
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {t.download}
              </a>
            </nav>

            {/* Controls */}
            <div className="flex items-center space-x-3">
              {/* Language Toggle */}
              <button
                onClick={() => setLanguage(language === 'en' ? 'id' : 'en')}
                className={`flex items-center space-x-1 px-3 py-2 rounded-lg transition-all duration-300 ${
                  isDarkMode 
                    ? 'bg-slate-800 hover:bg-slate-700 text-slate-300' 
                    : 'bg-slate-100 hover:bg-slate-200 text-slate-600'
                }`}
              >
                <Globe className="w-4 h-4" />
                <span className="text-sm font-medium">{language.toUpperCase()}</span>
              </button>

              {/* Theme Toggle */}
              <button
                onClick={() => setIsDarkMode(!isDarkMode)}
                className={`p-2 rounded-lg transition-all duration-300 ${
                  isDarkMode 
                    ? 'bg-slate-800 hover:bg-slate-700 text-yellow-400' 
                    : 'bg-slate-100 hover:bg-slate-200 text-slate-600'
                }`}
              >
                {isDarkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
              </button>
            </div>
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className={`md:hidden p-2 rounded-lg transition-all duration-300 ${
              isDarkMode 
                ? 'bg-slate-800 hover:bg-slate-700 text-white' 
                : 'bg-slate-100 hover:bg-slate-200 text-slate-900'
            }`}
          >
            {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className={`md:hidden mt-4 p-4 rounded-lg transition-all duration-300 ${
            isDarkMode ? 'bg-slate-800' : 'bg-slate-100'
          }`}>
            <nav className="flex flex-col space-y-4 mb-4">
              <a 
                href="#platforms" 
                onClick={() => setIsMenuOpen(false)}
                className={`transition-colors duration-300 ${
                  isDarkMode 
                    ? 'text-slate-300 hover:text-white' 
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {t.platforms}
              </a>
              <a 
                href="#download" 
                onClick={() => setIsMenuOpen(false)}
                className={`transition-colors duration-300 ${
                  isDarkMode 
                    ? 'text-slate-300 hover:text-white' 
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {t.download}
              </a>
            </nav>

            <div className="flex items-center justify-between pt-4 border-t border-slate-600">
              {/* Language Toggle */}
              <button
                onClick={() => setLanguage(language === 'en' ? 'id' : 'en')}
                className={`flex items-center space-x-1 px-3 py-2 rounded-lg transition-all duration-300 ${
                  isDarkMode 
                    ? 'bg-slate-700 hover:bg-slate-600 text-slate-300' 
                    : 'bg-white hover:bg-slate-50 text-slate-600'
                }`}
              >
                <Globe className="w-4 h-4" />
                <span className="text-sm font-medium">{language.toUpperCase()}</span>
              </button>

              {/* Theme Toggle */}
              <button
                onClick={() => setIsDarkMode(!isDarkMode)}
                className={`p-2 rounded-lg transition-all duration-300 ${
                  isDarkMode 
                    ? 'bg-slate-700 hover:bg-slate-600 text-yellow-400' 
                    : 'bg-white hover:bg-slate-50 text-slate-600'
                }`}
              >
                {isDarkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
              </button>
            </div>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;