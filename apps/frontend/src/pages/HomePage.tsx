import React from 'react';
import { Link } from 'react-router-dom';
import LanguageChip from '../components/LanguageChip';
import useTranslation from '../hooks/useTranslation';

interface HomePageProps {
  showNotification: (message: string, type: 'success' | 'error' | 'info') => void;
  gainXp: (amount: number) => void;
}

const HomePage: React.FC<HomePageProps> = ({ showNotification, gainXp }) => {
  const { t } = useTranslation();

  const languages = [
    { name: 'Node.js', status: 'ready' },
    { name: 'Python', status: 'ready' },
    { name: 'Go', status: 'ready' },
    { name: 'Rust', status: 'building' },
    { name: 'Elixir', status: 'ready' },
    { name: 'Java', status: 'failed' },
  ];

  const handleCompleteTutorial = () => {
    gainXp(20); // Award 20 XP for completing tutorial
    showNotification(t('tutorial_completed') + `! ` + t('gained_xp') + ` 20 XP.`, 'success');
  };

  return (
    <div className="bg-gray-50 text-gray-800">
      {/* Hero Section */}
      <header className="bg-white shadow-md">
        <div className="container mx-auto px-6 py-20 text-center">
          <h1 className="text-5xl font-bold text-gray-900">{t('welcome_message')}</h1>
          <p className="mt-4 text-xl text-gray-600">{t('hero_subtitle')}</p>
          <div className="mt-8 flex justify-center space-x-4">
            <Link to="/playground" className="px-8 py-3 text-lg font-semibold rounded-md text-white bg-indigo-600 hover:bg-indigo-700">
              {t('playground')}
            </Link>
            <Link to="/dashboard" className="px-8 py-3 text-lg font-semibold rounded-md text-indigo-600 bg-white border border-indigo-600 hover:bg-indigo-50">
              {t('dashboard')}
            </Link>
          </div>
          <button
            onClick={handleCompleteTutorial}
            className="mt-4 px-6 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700"
          >
            {t('simulate_complete_tutorial')}
          </button>
        </div>
      </header>

      {/* Seasonal Event Banner */}
      <section className="bg-yellow-400 text-yellow-900 py-4 text-center font-semibold">
        {t('seasonal_event_banner')}
      </section>

      {/* Language Grid */}
      <main className="container mx-auto px-6 py-16">
        <h2 className="text-3xl font-bold text-center text-gray-900">{t('supported_languages')}</h2>
        <div className="mt-12 grid gap-8 md:grid-cols-3 lg:grid-cols-4">
          {languages.map((lang) => (
            <div key={lang.name} className="bg-white p-6 rounded-lg shadow-lg hover:shadow-xl transform hover:-translate-y-1 transition-all duration-300">
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-bold">{lang.name}</h3>
                <LanguageChip language={lang.name} status={lang.status as any} />
              </div>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
};

export default HomePage;
