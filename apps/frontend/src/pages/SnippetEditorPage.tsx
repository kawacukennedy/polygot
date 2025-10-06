import React, { useState, useEffect, useRef } from 'react';
import Editor from '@monaco-editor/react';
import { useParams } from 'react-router-dom';
import Modal from '../components/Modal';
import { LOCAL_STORAGE_KEYS } from '../utils/constants';

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
  const [showOutputModal, setShowOutputModal] = useState(false);
  const editorRef = useRef<any>(null);

  // Autosave
  useEffect(() => {
    const interval = setInterval(() => {
      const key = LOCAL_STORAGE_KEYS.unsaved_snippet(id || 'new');
      localStorage.setItem(key, JSON.stringify({ title, language, visibility, tags, code }));
    }, 5000);
    return () => clearInterval(interval);
  }, [title, language, visibility, tags, code, id]);

  // Load from localStorage
  useEffect(() => {
    const key = LOCAL_STORAGE_KEYS.unsaved_snippet(id || 'new');
    const saved = localStorage.getItem(key);
    if (saved) {
      const data = JSON.parse(saved);
      setTitle(data.title || '');
      setLanguage(data.language || 'python');
      setVisibility(data.visibility || 'private');
      setTags(data.tags || '');
      setCode(data.code || '# Write your code here');
    }
  }, [id]);

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
        body: JSON.stringify({ code, language, input: '', timeout_ms: 30000 }),
      });
      if (response.status === 202) {
        // Polling
        const executionId = (await response.json()).executionId;
        pollExecution(executionId);
      } else if (response.status === 200) {
        const data = await response.json();
        setOutput(data.stdout || data.stderr);
        setShowOutputModal(true);
      } else {
        setOutput('Error running snippet');
        setShowOutputModal(true);
      }
    } catch (error) {
      setOutput('An error occurred while running the snippet.');
      setShowOutputModal(true);
    } finally {
      setIsRunning(false);
    }
  };

  const pollExecution = async (executionId: string) => {
    let attempts = 0;
    const maxAttempts = 40;
    const interval = 800;
    const poll = async () => {
      try {
        const response = await fetch(`/api/executions/${executionId}`);
        const data = await response.json();
        if (data.status === 'completed') {
          setOutput(data.stdout || data.stderr);
          setShowOutputModal(true);
          setIsRunning(false);
        } else if (data.status === 'failed') {
          setOutput('Execution failed');
          setShowOutputModal(true);
          setIsRunning(false);
        } else if (attempts < maxAttempts) {
          attempts++;
          setTimeout(poll, interval);
        } else {
          setOutput('Execution timed out');
          setShowOutputModal(true);
          setIsRunning(false);
        }
      } catch (error) {
        setOutput('Polling error');
        setShowOutputModal(true);
        setIsRunning(false);
      }
    };
    poll();
  };

  return (
    <div className="flex">
      <div className="flex-1">
        <div className="bg-surface rounded-lg flex-1" style={{ height: '560px', padding: '16px', borderRadius: '8px' }}>
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
              folding: true,
              autoClosingBrackets: 'always',
              renderWhitespace: 'boundary',
            }}
            onMount={(editor) => {
              editorRef.current = editor;
              // Keybindings
              const model = editor.getModel();
              if (model) {
                editor.addCommand(model.getLanguageId() === 'javascript' ? 2048 : 2048, () => handleRun()); // Ctrl+Enter
              }
              editor.addCommand(2089, () => handleSave()); // Ctrl+S
              const commentAction = editor.getAction('editor.action.commentLine');
              if (commentAction) {
                editor.addCommand(2063, () => commentAction.run()); // Ctrl+/
              }
            }}
          />
        </div>
      </div>
      <div style={{ width: '360px', padding: '16px', position: 'sticky', top: '80px' }}>
        <div className="bg-surface rounded-lg p-6">
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
              required
              tabIndex={1}
              className="w-full px-3 bg-white border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-focus-ring"
              style={{ height: '44px' }}
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
              required
              tabIndex={2}
              className="w-full px-3 bg-white border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-focus-ring"
              style={{ height: '44px' }}
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
                  tabIndex={3}
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
                  tabIndex={4}
                  className="mr-2"
                />
                Public
              </label>
            </div>
          </div>
          <div className="mb-4">
            <label htmlFor="tags" className="block text-sm font-medium text-muted mb-1">
              Tags
            </label>
            <input
              type="text"
              id="tags"
              value={tags}
              onChange={(e) => setTags(e.target.value)}
              tabIndex={5}
              className="w-full px-3 bg-white border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-focus-ring"
              style={{ height: '44px' }}
            />
          </div>
          <div className="mt-6" style={{ position: 'sticky', bottom: '16px', right: '16px' }}>
            <button
              onClick={handleRun}
              disabled={isRunning}
              tabIndex={6}
              className="w-full bg-primary text-white font-bold rounded-md hover:bg-primary-hover disabled:bg-gray-400"
              style={{ height: '44px' }}
            >
              {isRunning ? 'Running...' : 'Run'}
            </button>
          </div>
          <div className="mt-4">
            <button
              onClick={handleSave}
              disabled={isSaving || !title || !language}
              tabIndex={7}
              className="w-full bg-success text-white font-bold rounded-md hover:bg-green-700 disabled:bg-gray-400"
              style={{ height: '44px' }}
            >
              {isSaving ? 'Saving...' : 'Save'}
            </button>
          </div>
        </div>
      </div>

      <Modal isOpen={showOutputModal} onClose={() => setShowOutputModal(false)}>
        <h2>Output</h2>
        <pre className="text-white bg-black p-4 rounded-md">{output}</pre>
      </Modal>
    </div>
  );
};

export default SnippetEditorPage;