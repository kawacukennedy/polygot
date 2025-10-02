
import React from 'react';
import { Link } from 'react-router-dom';
import BenchmarkChart from '../components/BenchmarkChart';
import RecentExecutions from '../components/RecentExecutions';

const HomePage = () => {
  return (
    <div className="flex flex-col items-center justify-center text-center h-full">
      <div className="animate-fade-slide-in">
        <h1 className="text-5xl font-bold text-light-text_primary dark:text-dark-text_primary">
          Write, Run, Share Code in Any Language
        </h1>
        <p className="mt-4 text-xl text-light-text_secondary dark:text-dark-text_secondary">
          The ultimate platform for developers to collaborate and compete.
        </p>
        <div className="mt-8 flex justify-center space-x-4">
          <Link
            to="/snippets/new"
            className="px-8 py-3 text-lg font-semibold rounded-md text-white bg-light-button_primary hover:bg-opacity-90 dark:bg-dark-button_primary dark:hover:bg-opacity-90"
          >
            Get Started
          </Link>
          <Link
            to="/snippets"
            className="px-8 py-3 text-lg font-semibold rounded-md border border-light-accent dark:border-dark-accent text-light-accent dark:text-dark-accent hover:bg-light-accent hover:text-white dark:hover:bg-dark-accent dark:hover:text-dark-background"
          >
            Browse Snippets
          </Link>
        </div>
      </div>
      <div className="mt-16 w-full max-w-4xl">
        <h2 className="text-3xl font-bold text-light-text_primary dark:text-dark-text_primary">Popular Languages</h2>
        <BenchmarkChart />
      </div>
      <div className="mt-16 w-full max-w-4xl">
        <h2 className="text-3xl font-bold text-light-text_primary dark:text-dark-text_primary">Recent Executions</h2>
        <RecentExecutions />
      </div>
    </div>
  );
};

export default HomePage;
