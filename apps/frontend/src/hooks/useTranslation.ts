
import { useState } from 'react';
import translations from '../translations';

interface UseTranslationResult {
  t: (key: string) => string;
  changeLanguage: (lang: string) => void;
  language: string;
}

const useTranslation = (initialLanguage: string = 'en'): UseTranslationResult => {
  const [language, setLanguage] = useState(initialLanguage);

  const t = (key: string): string => {
    const currentTranslations = (translations as any)[language] || (translations as any)['en'];
    return currentTranslations[key] || key;
  };

  const changeLanguage = (lang: string) => {
    setLanguage(lang);
  };

  return {
    t,
    changeLanguage,
    language,
  };
};

export default useTranslation;
