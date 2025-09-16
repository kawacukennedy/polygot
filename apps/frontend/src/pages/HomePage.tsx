import React from 'react';
import { Link } from 'react-router-dom';
import LanguageChip from '../components/LanguageChip';

interface HomePageProps {
  showNotification: (message: string, type: 'success' | 'error' | 'info') => void;
}

const HomePage: React.FC<HomePageProps> = ({ showNotification }) => {
  const languages = [
    { name: 'Node.js', status: 'ready' },
    { name: 'Python', status: 'ready' },
    { name: 'Go', status: 'ready' },
    { name: 'Rust', status: 'building' },
    { name: 'Elixir', status: 'ready' },
    { name: 'Java', status: 'failed' },
  ];

  // Example of using showNotification (can be removed later)
  // useEffect(() => {
  //   showNotification('Welcome to the Home Page!', 'info');
  // }, []);

  return (
    <div className="bg-gray-50 text-gray-800">
      {/* Hero Section */}
      <header className="bg-white shadow-md">
        <div className="container mx-auto px-6 py-20 text-center">
          <h1 className="text-5xl font-bold text-gray-900">Polyglot Playground</h1>
          <p className="mt-4 text-xl text-gray-600">Same app. Many languages. Live comparisons.</p>
          <div className="mt-8 flex justify-center space-x-4">
            <Link to="/playground" className="px-8 py-3 text-lg font-semibold rounded-md text-white bg-indigo-600 hover:bg-indigo-700">
              Try Playground
            </Link>
            <Link to="/dashboard" className="px-8 py-3 text-lg font-semibold rounded-md text-indigo-600 bg-white border border-indigo-600 hover:bg-indigo-50">
              View Benchmarks
            </Link>
          </div>
        </div>
      </header>

      {/* Language Grid */}
      <main className="container mx-auto px-6 py-16">
        <h2 className="text-3xl font-bold text-center text-gray-900">Supported Languages</h2>
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