import React, { useState } from 'react';

const SignUpPage: React.FC = () => {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Handle form submission
    console.log({ username, email, password });
  };

  return (
    <div className="max-w-2xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">Create an account</h1>
      <form onSubmit={handleSubmit}>
        <div className="mb-4">
          <label
            htmlFor="username"
            className="block text-sm font-medium text-muted mb-1"
          >
            Username
          </label>
          <input
            type="text"
            id="username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="choose-a-username"
            className="w-full h-11 px-3 bg-surface border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-focus-ring"
            required
          />
        </div>
        <div className="mb-4">
          <label
            htmlFor="email"
            className="block text-sm font-medium text-muted mb-1"
          >
            Email
          </label>
          <input
            type="email"
            id="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
            className="w-full h-11 px-3 bg-surface border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-focus-ring"
            required
          />
        </div>
        <div className="mb-4">
          <label
            htmlFor="password"
            className="block text-sm font-medium text-muted mb-1"
          >
            Password
          </label>
          <input
            type="password"
            id="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
            className="w-full h-11 px-3 bg-surface border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-focus-ring"
            required
          />
        </div>
        <button
          type="submit"
          className="w-full h-11 bg-primary text-white font-bold rounded-md hover:bg-primary-hover focus:outline-none focus:ring-2 focus:ring-focus-ring"
        >
          Create account
        </button>
      </form>
      <p className="text-xs text-muted mt-3">
        By creating an account you agree to our Terms and Privacy Policy
      </p>
    </div>
  );
};

export default SignUpPage;
