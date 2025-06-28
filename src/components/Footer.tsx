import React from 'react';
import { useApp } from '../context/AppContext';
import { translations } from '../utils/translations';
import { Heart, Github, Instagram, MessageCircle } from 'lucide-react';

const Footer: React.FC = () => {
  const { language, isDarkMode } = useApp();
  const t = translations[language];

  return (
    <footer className={`py-12 px-4 border-t transition-colors duration-300 ${
      isDarkMode 
        ? 'bg-slate-900 border-slate-700' 
        : 'bg-slate-50 border-slate-200'
    }`}>
      <div className="container mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Brand */}
          <div className="text-center md:text-left">
            <div className="flex items-center justify-center md:justify-start space-x-3 mb-4">
              <img 
                src="https://cdnl.iconscout.com/lottie/premium/thumb/download-preloader-7357613-6014916.gif" 
                alt="Dim Downloader" 
                className="w-8 h-8 rounded-full"
              />
              <h3 className={`text-xl font-bold transition-colors duration-300 ${
                isDarkMode ? 'text-white' : 'text-slate-900'
              }`}>
                Dim Downloader
              </h3>
            </div>
            <p className={`max-w-xs mx-auto md:mx-0 transition-colors duration-300 ${
              isDarkMode ? 'text-slate-300' : 'text-slate-600'
            }`}>
              {t.footerDesc}
            </p>
          </div>

          {/* Links */}
          <div className="text-center">
            <h4 className={`font-semibold mb-4 transition-colors duration-300 ${
              isDarkMode ? 'text-white' : 'text-slate-900'
            }`}>
              {t.quickLinks}
            </h4>
            <div className="space-y-2">
              <a 
                href="#platforms" 
                className={`block transition-colors duration-300 ${
                  isDarkMode 
                    ? 'text-slate-300 hover:text-white' 
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {t.supportedPlatforms}
              </a>
              <a 
                href="#download" 
                className={`block transition-colors duration-300 ${
                  isDarkMode 
                    ? 'text-slate-300 hover:text-white' 
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {t.download}
              </a>
            </div>
          </div>

          {/* Contact */}
          <div className="text-center md:text-right">
            <h4 className={`font-semibold mb-4 transition-colors duration-300 ${
              isDarkMode ? 'text-white' : 'text-slate-900'
            }`}>
              {t.connect}
            </h4>
            <div className="flex justify-center md:justify-end space-x-4 mb-4">
              <a 
                href="https://github.com/DimNih" 
                className={`p-2 rounded-xl transition-all duration-300 ${
                  isDarkMode 
                    ? 'bg-slate-800 hover:bg-slate-700 text-slate-300' 
                    : 'bg-white hover:bg-slate-100 text-slate-600 shadow-md hover:shadow-lg'
                }`}
              >
                <Github className="w-5 h-5" />
              </a>
              <a 
                href="https://www.instagram.com/dimsnih__?igsh=MmdjbHg1cWl2NHF2" 
                className={`p-2 rounded-xl transition-all duration-300 ${
                  isDarkMode 
                    ? 'bg-slate-800 hover:bg-slate-700 text-slate-300' 
                    : 'bg-white hover:bg-slate-100 text-slate-600 shadow-md hover:shadow-lg'
                }`}
              >
                <Instagram className="w-5 h-5" />
              </a>
              <a 
                href="https://wa.me/6281585261728" 
                className={`p-2 rounded-xl transition-all duration-300 ${
                  isDarkMode 
                    ? 'bg-slate-800 hover:bg-slate-700 text-slate-300' 
                    : 'bg-white hover:bg-slate-100 text-slate-600 shadow-md hover:shadow-lg'
                }`}
              >
                <MessageCircle className="w-5 h-5" />
              </a>
            </div>
          </div>
        </div>

        <div className={`border-t mt-8 pt-8 transition-colors duration-300 ${
          isDarkMode ? 'border-slate-700' : 'border-slate-200'
        }`}>
          <div className="flex flex-col md:flex-row items-center justify-between">
            <p className={`text-sm mb-4 md:mb-0 transition-colors duration-300 ${
              isDarkMode ? 'text-slate-400' : 'text-slate-500'
            }`}>
              © 2024 Dim Downloader. {t.allRightsReserved}
            </p>
            <div className={`flex items-center space-x-2 text-sm transition-colors duration-300 ${
              isDarkMode ? 'text-slate-400' : 'text-slate-500'
            }`}>
              <span>{t.madeWith}</span>
              <Heart className="w-4 h-4 text-red-500 animate-pulse" />
              <span>{t.by}</span>
              <span className={`font-semibold transition-colors duration-300 ${
                isDarkMode ? 'text-white' : 'text-slate-900'
              }`}>
                DimasNih
              </span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;