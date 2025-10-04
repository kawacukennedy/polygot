import React, { useState } from 'react';
import Editor from '@monaco-editor/react';
import { useParams } from 'react-router-dom';

const SnippetEditorPage: React.FC = () => {
  const { id } = useParams();
  const [title, setTitle] = useState('');
  const [language, setLanguage] = useState('python');
  const [visibility, setVisibility] = useState('private');
  const [tags, setTags] = useState('');
  const [code, setCode] = useState('# Write your code here');
  const [output, setOutput] = useState('');
  const [isRunning, setIsRunning] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const response = await fetch(id ? `/api/snippets/${id}` : '/api/snippets', {
        method: id ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title, language, visibility, tags: tags.split(','), code }),
      });
      if (response.ok) {
        alert('Snippet saved successfully!');
      } else {
        alert('Failed to save snippet.');
      }
    } catch (error) {
      alert('An error occurred while saving the snippet.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleRun = async () => {
    setIsRunning(true);
    setOutput('');
    try {
      const response = await fetch(`/api/snippets/${id}/run`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code, language }),
      });
      const data = await response.json();
      setOutput(data.stdout || data.stderr);
    } catch (error) {
      setOutput('An error occurred while running the snippet.');
    } finally {
      setIsRunning(false);
    }
  };

  return (
    <div className="flex gap-6">
      <div className="flex-1 flex flex-col gap-4">
        <div className="bg-surface rounded-lg p-4 flex-1">
          <Editor
            height="100%"
            language={language}
            value={code}
            onChange={(value) => setCode(value || '')}
            theme="vs-dark"
            options={{
              fontSize: 14,
              tabSize: 2,
              minimap: { enabled: false },
              formatOnSave: true,
              folding: true,
              autoClosingBrackets: 'always',
              renderWhitespace: 'boundary',
            }}
          />
        </div>
        {output && (
          <div className="bg-surface rounded-lg p-4">
            <h2 className="text-xl font-bold mb-2">Output</h2>
            <pre className="text-white bg-black p-4 rounded-md">{output}</pre>
          </div>
        )}
      </div>
      <div className="w-96">
        <div className="bg-surface rounded-lg p-6 sticky top-20">
          <h2 className="text-xl font-bold mb-4">Snippet Metadata</h2>
          <div className="mb-4">
            <label htmlFor="title" className="block text-sm font-medium text-muted mb-1">
              Title
            </label>
            <input
              type="text"
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full h-11 px-3 bg-white border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-focus-ring"
            />
          </div>
          <div className="mb-4">
            <label htmlFor="language" className="block text-sm font-medium text-muted mb-1">
              Language
            </label>
            <select
              id="language"
              value={language}
              onChange={(e) => setLanguage(e.target.value)}
              className="w-full h-11 px-3 bg-white border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-focus-ring"
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
          </div>
          <div className="mb-4">
            <label className="block text-sm font-medium text-muted mb-1">Visibility</label>
            <div className="flex gap-4">
              <label className="flex items-center">
                <input
                  type="radio"
                  value="private"
                  checked={visibility === 'private'}
                  onChange={(e) => setVisibility(e.target.value)}
                  className="mr-2"
                />
                Private
              </label>
              <label className="flex items-center">
                <input
                  type="radio"
                  value="public"
                  checked={visibility === 'public'}
                  onChange={(e) => setVisibility(e.target.value)}
                  className="mr-2"
                />
                Public
              </label>
            </div>
          </div>
          <div className="mb-4">
            <label htmlFor="tags" className="block text-sm font-medium text-muted mb-1">
              Tags (comma-separated)
            </label>
            <input
              type="text"
              id="tags"
              value={tags}
              onChange={(e) => setTags(e.target.value)}
              className="w-full h-11 px-3 bg-white border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-focus-ring"
            />
          </div>
          <div className="flex gap-4 mt-6">
            <button
              onClick={handleRun}
              disabled={isRunning}
              className="flex-1 h-11 bg-primary text-white font-bold rounded-md hover:bg-primary-hover disabled:bg-gray-400"
            >
              {isRunning ? 'Running...' : 'Run'}
            </button>
            <button
              onClick={handleSave}
              disabled={isSaving}
              className="flex-1 h-11 bg-success text-white font-bold rounded-md hover:bg-green-700 disabled:bg-gray-400"
            >
              {isSaving ? 'Saving...' : 'Save'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SnippetEditorPage;