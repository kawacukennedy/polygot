import React from 'react';
import { Button } from './ui/button';

const Footer: React.FC = () => {
  return (
    <div className="bg-primary text-primary-foreground fixed bottom-0 left-0 right-0">
      <div className="flex flex-col sm:flex-row items-center justify-between px-4 py-2 sm:py-0">
        <p className="text-sm flex-grow mb-2 sm:mb-0">
          © {new Date().getFullYear()} PolyglotCodeHub
        </p>
        <div className="flex gap-2">
          <Button variant="ghost" size="sm">Privacy</Button>
          <Button variant="ghost" size="sm">Terms</Button>
          <Button variant="ghost" size="sm">Contact</Button>
          <Button variant="ghost" size="sm" asChild>
            <a href="https://github.com/your-repo" target="_blank" rel="noopener noreferrer">GitHub</a>
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Footer;