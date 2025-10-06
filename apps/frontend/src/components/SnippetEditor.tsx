import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { createSnippet, getSnippetById, updateSnippet, executeCode } from '../services/api';
import { Snippet } from '../types/Snippet';
import { useAuth } from '../contexts/AuthContext';
import Editor from '@monaco-editor/react';
import { io } from 'socket.io-client';
import { useToast } from '../contexts/ToastContext';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Alert, AlertDescription } from './ui/alert';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from './ui/dialog';
import { Loader2, Play, Share, Save } from 'lucide-react';

interface SnippetEditorProps {
  mode: 'light' | 'dark';
}

const languages = [
  { value: 'PYTHON', label: 'Python' },
  { value: 'JAVASCRIPT', label: 'JavaScript' },
  { value: 'JAVA', label: 'Java' },
  { value: 'CPP', label: 'C++' },
  { value: 'GO', label: 'Go' },
  { value: 'RUST', label: 'Rust' },
  { value: 'RUBY', label: 'Ruby' },
  { value: 'PHP', label: 'PHP' }
];
const visibilities = [
  { value: 'public', label: 'Public' },
  { value: 'private', label: 'Private' }
];

const SnippetEditor = ({ mode }: SnippetEditorProps) => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { isAuthenticated, user } = useAuth();
  const { addToast } = useToast();

  const [title, setTitle] = useState('');
  const [language, setLanguage] = useState(languages[0].value);
  const [code, setCode] = useState('');
  const [visibility, setVisibility] = useState<'public' | 'private'>('public');
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [executionResult, setExecutionResult] = useState<string | null>(null);
  const [executionError, setExecutionError] = useState<string | null>(null);
  const [openExecutionDialog, setOpenExecutionDialog] = useState(false);
  const [executing, setExecuting] = useState(false);
  const [realtimeLog, setRealtimeLog] = useState<string[]>([]);
  const [isDirty, setIsDirty] = useState(false);

  const socketRef = useRef<any>(null);
  const initialSnippetRef = useRef<Snippet | null>(null);

  // Autosave effect
  useEffect(() => {
    if (!isAuthenticated || !isDirty || loading || executing) return;

    const autoSaveTimer = setTimeout(() => {
      console.log('Autosaving snippet...');
      handleSubmit(); // Call save function
    }, 5000); // Autosave every 5 seconds of inactivity

    return () => clearTimeout(autoSaveTimer);
  }, [title, language, code, visibility, isDirty, isAuthenticated, loading, executing]);

  // Mark as dirty on change
  const handleChange = useCallback((setter: React.Dispatch<React.SetStateAction<string | 'public' | 'private'>>) => (value: string | 'public' | 'private') => {
    setter(value);
    setIsDirty(true);
  }, []);

  useEffect(() => {
    if (isAuthenticated && user?.id) {
      socketRef.current = io('http://localhost:3003');

      socketRef.current.on('connect', () => {
        console.log('Connected to execution service WebSocket');
      });

      socketRef.current.on('execution_status', (data: any) => {
        console.log('Real-time execution status:', data);
        if (data.userId === user.id) {
          setRealtimeLog((prev) => [...prev, `[${new Date().toLocaleTimeString()}] Status: ${data.status}, Language: ${data.language}, Message: ${data.error || data.output || ''}`]);
          if (data.status === 'completed' || data.status === 'failed' || data.status === 'killed') {
            setExecuting(false);
            setExecutionResult(data.output || '');
            setExecutionError(data.error || null);
          }
        }
      });

      socketRef.current.on('disconnect', () => {
        console.log('Disconnected from execution service WebSocket');
      });

      return () => {
        socketRef.current?.disconnect();
      };
    }
  }, [isAuthenticated, user?.id]);

  useEffect(() => {
    if (id && isAuthenticated) {
      const fetchSnippet = async () => {
        setLoading(true);
        try {
          const data: any = await getSnippetById(id);
          setTitle(data.title);
          setLanguage(data.language);
          setCode(data.code);
          setVisibility(data.visibility.toLowerCase() as 'public' | 'private');
          initialSnippetRef.current = data;
          setIsDirty(false);
        } catch (err) {
          addToast('Network error while fetching snippet.', 'error');
        } finally {
          setLoading(false);
        }
      };
      fetchSnippet();
    }
  }, [id, isAuthenticated]);

  const validateForm = () => {
    if (title.length < 3 || title.length > 100) {
      addToast('Title must be between 3 and 100 characters.', 'error');
      return false;
    }
    if (code.length < 1 || code.length > 10000) {
      addToast('Code must be between 1 and 10000 characters.', 'error');
      return false;
    }
    return true;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    setLoading(true);
    try {
      if (id) {
        await updateSnippet(id, title, language, code, visibility);
      } else {
        await createSnippet(title, language, code, visibility);
      }

      addToast(`Snippet ${id ? 'updated' : 'created'} successfully!`, 'success');
      setIsDirty(false);
    } catch (err) {
      addToast(`Network error while ${id ? 'updating' : 'creating'} snippet.`, 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleRun = async () => {
    setExecuting(true);
    setExecutionResult(null);
    setExecutionError(null);
    setRealtimeLog([]);
    setOpenExecutionDialog(true);

    try {
      const data: any = await executeCode(language, code);
      setExecutionResult(data.output || 'Execution started...');
    } catch (err) {
      addToast('Network error during code execution.', 'error');
      setExecutionError('Network error during code execution.');
      setExecuting(false);
    }
  };

  const handleShare = () => {
    addToast('Share functionality (placeholder).', 'info');
  };

  const handleCloseExecutionDialog = () => {
    setOpenExecutionDialog(false);
    setExecutionResult(null);
    setExecutionError(null);
    setRealtimeLog([]);
  };

  if (!isAuthenticated) {
    return (
      <Alert>
        <AlertDescription>Please log in to create or edit snippets.</AlertDescription>
      </Alert>
    );
  }

  if (loading && id) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="h-8 w-8 animate-spin" />
        <span className="ml-2">Loading snippet...</span>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 max-w-4xl">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">{id ? 'Edit Snippet' : 'Create New Snippet'}</h1>
      </div>

      {error && (
        <Alert variant="destructive" className="mb-4">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {success && (
        <Alert className="mb-4">
          <AlertDescription>{success}</AlertDescription>
        </Alert>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Snippet Details</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">Title</Label>
            <Input
              id="title"
              placeholder="Enter snippet title"
              value={title}
              onChange={(e) => handleChange(setTitle)(e.target.value)}
              className={title.length > 0 && (title.length < 3 || title.length > 100) ? "border-red-500" : ""}
            />
            {title.length > 0 && (title.length < 3 || title.length > 100) && (
              <p className="text-sm text-red-500">Title must be between 3 and 100 characters</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="language">Language</Label>
            <Select value={language} onValueChange={(value) => handleChange(setLanguage)(value)}>
              <SelectTrigger>
                <SelectValue placeholder="Select language" />
              </SelectTrigger>
              <SelectContent>
                {languages.map((lang) => (
                  <SelectItem key={lang.value} value={lang.value}>
                    {lang.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="visibility">Visibility</Label>
             <Select value={visibility} onValueChange={(value) => setVisibility(value as 'public' | 'private')}>
              <SelectTrigger>
                <SelectValue placeholder="Select visibility" />
              </SelectTrigger>
              <SelectContent>
                {visibilities.map((vis) => (
                  <SelectItem key={vis.value} value={vis.value}>
                    {vis.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Code</Label>
            <div className="border rounded-md h-96">
              <Editor
                height="100%"
                language={language.toLowerCase()}
                value={code}
                onChange={(value) => handleChange(setCode)(value || '')}
                theme={mode === 'dark' ? 'vs-dark' : 'vs-light'}
                options={{
                  minimap: { enabled: false },
                  fontSize: 14,
                  scrollBeyondLastLine: false,
                  lineNumbers: 'on',
                  folding: true,
                  wordWrap: 'on',
                }}
              />
            </div>
          </div>

          <div className="flex justify-end space-x-2">
            <Button variant="outline" onClick={handleRun} disabled={loading || executing}>
              {executing ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Play className="h-4 w-4 mr-2" />}
              Run
            </Button>
            <Button variant="outline" onClick={handleShare} disabled={loading}>
              <Share className="h-4 w-4 mr-2" />
              Share
            </Button>
            <Button onClick={handleSubmit} disabled={loading || !isDirty}>
              <Save className="h-4 w-4 mr-2" />
              {id ? 'Update Snippet' : 'Save Snippet'}
            </Button>
          </div>
        </CardContent>
      </Card>

      <Dialog open={openExecutionDialog} onOpenChange={handleCloseExecutionDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Code Execution Result</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            {executing ? (
              <div className="flex flex-col items-center justify-center h-32">
                <Loader2 className="h-8 w-8 animate-spin" />
                <p className="mt-2">Executing code...</p>
              </div>
            ) : executionError ? (
              <Alert variant="destructive">
                <AlertDescription>{executionError}</AlertDescription>
              </Alert>
            ) : (
              <Textarea
                value={executionResult || 'No output.'}
                readOnly
                className="h-64 font-mono text-sm"
              />
            )}
            {realtimeLog.length > 0 && (
              <div className="border rounded-md p-4 max-h-48 overflow-y-auto">
                <h4 className="font-semibold mb-2">Real-time Log:</h4>
                <div className="space-y-1">
                  {realtimeLog.map((log, index) => (
                    <p key={index} className="text-sm font-mono">{log}</p>
                  ))}
                </div>
              </div>
            )}
          </div>
          <DialogFooter>
            <Button onClick={handleCloseExecutionDialog}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default SnippetEditor;