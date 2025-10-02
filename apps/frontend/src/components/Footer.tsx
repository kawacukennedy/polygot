
import React from 'react';

const Footer = () => {
  return (
    <footer className="bg-[var(--color-background)] p-4 text-center shadow-inner mt-auto">
      <div className="flex flex-col md:flex-row justify-center space-y-2 md:space-y-0 md:space-x-4">
        <a href="#" className="hover:text-[var(--color-accent)]">Privacy</a>
        <a href="#" className="hover:text-[var(--color-accent)]">Terms</a>
        <a href="#" className="hover:text-[var(--color-accent)]">Contact</a>
        <a href="#" className="hover:text-[var(--color-accent)]">GitHub</a>
      </div>
      <p className="text-sm text-[var(--color-text-secondary)] mt-2">
        © 2025 PolyglotCodeHub. All rights reserved.
      </p>
    </footer>
  );
};

export default Footer;
