
import React from 'react';
import { Link } from 'react-router-dom';
import BenchmarkChart from '../components/BenchmarkChart';
import RecentExecutions from '../components/RecentExecutions';

const HomePage = () => {
  return (
    <div className="flex flex-col items-center justify-center text-center h-full">
      <div className="animate-fade-slide-in">
        <h1 className="text-5xl font-bold text-[var(--color-text-primary)]">
          Write, Run, Share Code in Any Language
        </h1>
        <p className="mt-4 text-xl text-[var(--color-text-secondary)]">
          The ultimate platform for developers to collaborate and compete.
        </p>
        <div className="mt-8 flex justify-center space-x-4">
          <Link
            to="/snippets/new"
            className="px-8 py-3 text-lg font-semibold rounded-md text-white bg-[var(--color-button-primary)] hover:opacity-90"
          >
            Get Started
          </Link>
          <Link
            to="/snippets"
            className="px-8 py-3 text-lg font-semibold rounded-md border border-[var(--color-accent)] text-[var(--color-accent)] hover:bg-[var(--color-accent)] hover:text-white"
          >
            Browse Snippets
          </Link>
        </div>
      </div>
      <div className="mt-16 w-full max-w-4xl">
        <h2 className="text-3xl font-bold text-[var(--color-text-primary)]">Popular Languages</h2>
        <BenchmarkChart />
      </div>
      <div className="mt-16 w-full max-w-4xl">
        <h2 className="text-3xl font-bold text-[var(--color-text-primary)]">Recent Executions</h2>
        <RecentExecutions />
      </div>
    </div>
  );
};

export default HomePage;
