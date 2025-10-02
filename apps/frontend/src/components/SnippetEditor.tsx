
import React, { useState } from 'react';
import Editor from '@monaco-editor/react';
import { createSnippet } from '../services/api';
import { useNavigate } from 'react-router-dom';

interface SnippetEditorProps {
  showNotification: (message: string, type: 'success' | 'error' | 'info') => void;
}

const SnippetEditor: React.FC<SnippetEditorProps> = ({ showNotification }) => {
  const [title, setTitle] = useState('');
  const [language, setLanguage] = useState('python');
  const [visibility, setVisibility] = useState('public');
  const [code, setCode] = useState('# Write your code here');
  const navigate = useNavigate();

  const handleSave = async () => {
    if (!title) {
      showNotification('Title is required', 'error');
      return;
    }
    if (!code) {
      showNotification('Code is required', 'error');
      return;
    }

    const token = localStorage.getItem('session_token');
    if (!token) {
      showNotification('Authentication token not found. Please log in.', 'error');
      return;
    }

    try {
      const snippetData = { title, language, code, visibility: visibility as 'public' | 'private' };
      const data = await createSnippet(snippetData, token);

      if (data.status === 'error') {
        showNotification(data.message, 'error');
      } else {
        showNotification('Snippet saved successfully!', 'success');
        navigate(`/snippets/run/${data.id}`);
      }
    } catch (err: any) {
      showNotification(err.message || 'An unexpected error occurred.', 'error');
    }
  };

  const handleShare = () => {
    // Mock sharing logic
    navigator.clipboard.writeText(window.location.href);
    showNotification('Snippet URL copied to clipboard!', 'info');
  };

  return (
    <div className="bg-light-background dark:bg-dark-background shadow-md rounded-lg p-4">
      <div className="flex justify-between items-center mb-4">
        <input 
          type="text" 
          placeholder="Snippet Title" 
          className="p-2 border rounded-md w-1/3 bg-gray-50 dark:bg-gray-800"
          value={title}
          onChange={e => setTitle(e.target.value)}
        />
        <select 
          value={language}
          onChange={(e) => setLanguage(e.target.value)}
          className="p-2 border rounded-md bg-gray-50 dark:bg-gray-800"
        >
          <option value="python">Python</option>
          <option value="javascript">JavaScript</option>
          <option value="cpp">C++</option>
          <option value="java">Java</option>
          <option value="go">Go</option>
          <option value="php">PHP</option>
          <option value="rust">Rust</option>
          <option value="ruby">Ruby</option>
        </select>
        <select 
          className="p-2 border rounded-md bg-gray-50 dark:bg-gray-800"
          value={visibility}
          onChange={e => setVisibility(e.target.value)}
        >
          <option value="public">Public</option>
          <option value="private">Private</option>
        </select>
      </div>
      <Editor
        height="60vh"
        language={language}
        value={code}
        onChange={(value) => setCode(value || '')}
        theme={localStorage.getItem('theme') === 'dark' ? 'vs-dark' : 'light'}
        options={{
          minimap: { enabled: false },
          fontSize: 14,
          wordWrap: 'on',
          lineNumbers: 'on',
        }}
      />
      <div className="mt-4 flex justify-end space-x-4">
        <button onClick={handleSave} className="px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600">Run</button>
        <button onClick={handleSave} className="px-4 py-2 bg-light-button_primary text-white rounded-md hover:bg-opacity-90">Save</button>
        <button onClick={handleShare} className="px-4 py-2 bg-gray-500 text-white rounded-md hover:bg-gray-600">Share</button>
      </div>
    </div>
  );
};

export default SnippetEditor;
