
import React from 'react';

const Footer = () => {
  return (
    <footer className="bg-light-background dark:bg-dark-background p-4 text-center shadow-inner mt-auto">
      <div className="flex flex-col md:flex-row justify-center space-y-2 md:space-y-0 md:space-x-4">
        <a href="#" className="hover:text-light-accent dark:hover:text-dark-accent">Privacy</a>
        <a href="#" className="hover:text-light-accent dark:hover:text-dark-accent">Terms</a>
        <a href="#" className="hover:text-light-accent dark:hover:text-dark-accent">Contact</a>
        <a href="#" className="hover:text-light-accent dark:hover:text-dark-accent">GitHub</a>
      </div>
      <p className="text-sm text-light-text_secondary dark:text-dark-text_secondary mt-2">
        © 2025 PolyglotCodeHub. All rights reserved.
      </p>
    </footer>
  );
};

export default Footer;
