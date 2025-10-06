import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const GlobalShortcuts = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      // Global shortcuts
      if (event.key === '?' && !event.ctrlKey && !event.metaKey) {
        event.preventDefault();
        // Open shortcuts modal - for now, just alert
        alert('Keyboard shortcuts:\n? - Open shortcuts\nCtrl+K/Cmd+K - Focus search\nCtrl+Enter/Cmd+Enter - Run snippet (in editor)');
      }

      // Search focus
      if ((event.ctrlKey || event.metaKey) && event.key === 'k') {
        event.preventDefault();
        const searchInput = document.querySelector('input[placeholder*="Search"]') as HTMLInputElement;
        if (searchInput) {
          searchInput.focus();
        }
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, []);

  return null;
};

export default GlobalShortcuts;