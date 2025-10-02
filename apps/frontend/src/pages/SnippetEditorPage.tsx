
import React from 'react';
import SnippetEditor from '../components/SnippetEditor';

interface SnippetEditorPageProps {
  showNotification: (message: string, type: 'success' | 'error' | 'info') => void;
}

const SnippetEditorPage: React.FC<SnippetEditorPageProps> = ({ showNotification }) => {
  return (
    <div>
      <h1 className="text-3xl font-bold mb-4 text-[var(--color-text-primary)]">Create Snippet</h1>
      <SnippetEditor showNotification={showNotification} />
    </div>
  );
};

export default SnippetEditorPage;
