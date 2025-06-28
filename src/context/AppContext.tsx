import React, { createContext, useContext, useState, ReactNode } from 'react';

interface AppContextType {
  selectedPlatform: string | null;
  setSelectedPlatform: (platform: string) => void;
  language: 'en' | 'id';
  setLanguage: (lang: 'en' | 'id') => void;
  isDarkMode: boolean;
  setIsDarkMode: (dark: boolean) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};

interface AppProviderProps {
  children: ReactNode;
}

export const AppProvider: React.FC<AppProviderProps> = ({ children }) => {
  const [selectedPlatform, setSelectedPlatform] = useState<string | null>(null);
  const [language, setLanguage] = useState<'en' | 'id'>('en');
  const [isDarkMode, setIsDarkMode] = useState(true);

  return (
    <AppContext.Provider value={{ 
      selectedPlatform, 
      setSelectedPlatform, 
      language, 
      setLanguage,
      isDarkMode,
      setIsDarkMode
    }}>
      {children}
    </AppContext.Provider>
  );
};