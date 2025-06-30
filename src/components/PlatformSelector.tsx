import React from 'react';
import { useApp } from '../context/AppContext';
import { translations } from '../utils/translations';
import { Play, Users, Camera, Music } from 'lucide-react';

const platforms = [
  {
    id: 'youtube',
    name: 'YouTube',
    icon: Play,
    color: 'from-red-500 to-red-600',
    bgColor: 'bg-red-500',
    descKey: 'youtubeDesc'
  },
  {
    id: 'facebook',
    name: 'Facebook',
    icon: Users,
    color: 'from-blue-600 to-blue-700',
    bgColor: 'bg-blue-600',
    descKey: 'facebookDesc'
  },
  {
    id: 'instagram',
    name: 'Instagram',
    icon: Camera,
    color: 'from-pink-500 to-purple-500',
    bgColor: 'bg-gradient-to-r from-pink-500 to-purple-500',
    descKey: 'instagramDesc'
  },
  {
    id: 'tiktok',
    name: 'TikTok',
    icon: Music,
    color: 'from-gray-800 to-pink-600',
    bgColor: 'bg-gradient-to-r from-gray-800 to-pink-600',
    descKey: 'tiktokDesc'
  }
];

const PlatformSelector: React.FC = () => {
  const { selectedPlatform, setSelectedPlatform, language, isDarkMode } = useApp();
  const t = translations[language];

  const handlePlatformClick = (platformId: string) => {
    setSelectedPlatform(platformId);
  };

  return (
    <section id="platforms" className={`py-16 px-4 transition-colors duration-300 ${
      isDarkMode ? 'bg-slate-900' : 'bg-slate-50'
    }`}>
      <div className="container mx-auto">
        <div className="text-center mb-12">
          <h2 className={`text-3xl md:text-4xl font-bold mb-4 transition-colors duration-300 ${
            isDarkMode ? 'text-white' : 'text-slate-900'
          }`}>
            {t.choosePlatform}
          </h2>
          <p className={`text-lg max-w-2xl mx-auto transition-colors duration-300 ${
            isDarkMode ? 'text-slate-300' : 'text-slate-600'
          }`}>
            {t.choosePlatformDesc}
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
          {platforms.map((platform) => {
            const Icon = platform.icon;
            const isSelected = selectedPlatform === platform.id;

            return (
              <div
                key={platform.id}
                onClick={() => handlePlatformClick(platform.id)}
                className={`cursor-pointer transform transition-all duration-300 hover:scale-105 ${
                  isSelected ? 'scale-105' : ''
                }`}
              >
                <div className={`
                  backdrop-blur-md rounded-2xl p-4 md:p-6 border-2 transition-all duration-300
                  ${isSelected 
                    ? isDarkMode 
                      ? 'border-blue-400 bg-slate-800/70' 
                      : 'border-blue-500 bg-white/90 shadow-lg'
                    : isDarkMode
                      ? 'border-slate-700 bg-slate-800/50 hover:border-slate-600 hover:bg-slate-800/70'
                      : 'border-slate-200 bg-white/70 hover:border-slate-300 hover:bg-white/90 shadow-md hover:shadow-lg'
                  }
                `}>
                  <div className={`
                    w-12 h-12 md:w-16 md:h-16 rounded-2xl bg-gradient-to-r ${platform.color} 
                    flex items-center justify-center mx-auto mb-4 shadow-lg
                  `}>
                    <Icon className="w-6 h-6 md:w-8 md:h-8 text-white" />
                  </div>

                  <h3 className={`font-semibold text-lg md:text-xl text-center mb-2 transition-colors duration-300 ${
                    isDarkMode ? 'text-white' : 'text-slate-900'
                  }`}>
                    {platform.name}
                  </h3>

                  <p className={`text-sm text-center leading-relaxed transition-colors duration-300 ${
                    isDarkMode ? 'text-slate-300' : 'text-slate-600'
                  }`}>
                    {t[platform.descKey as keyof typeof t]}
                  </p>

                  {isSelected && (
                    <div className="mt-4 text-center">
                      <span className="inline-block bg-blue-500 text-white text-xs px-3 py-1 rounded-full animate-pulse">
                        {t.selected}
                      </span>
                    </div>
                  )}
                </div>
              </div> 
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default PlatformSelector;