import React, { useState } from 'react';
import Editor from '@monaco-editor/react';

const SnippetEditorPage: React.FC = () => {
  const [title, setTitle] = useState('');
  const [language, setLanguage] = useState('python');
  const [visibility, setVisibility] = useState('private');
  const [tags, setTags] = useState('');
  const [code, setCode] = useState('# Write your code here');

  return (
    <div className="flex gap-6">
      <div className="flex-1">
        <div className="bg-surface rounded-lg p-4 h-[560px]">
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
            <button className="flex-1 h-11 bg-primary text-white font-bold rounded-md hover:bg-primary-hover">
              Run
            </button>
            <button className="flex-1 h-11 bg-success text-white font-bold rounded-md hover:bg-green-700">
              Save
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SnippetEditorPage;