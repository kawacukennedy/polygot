import React, { useEffect, useState, useRef, useCallback } from 'react';
import { getSnippets, deleteSnippet } from '../services/api';
import { Snippet } from '../types/Snippet';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { useToast } from '../contexts/ToastContext';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Alert, AlertDescription } from './ui/alert';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Label } from './ui/label';
import { Loader2, Edit, Trash2, Play } from 'lucide-react';
import { io } from 'socket.io-client';

const SnippetsList: React.FC = () => {
  const { isAuthenticated } = useAuth();
  const [snippets, setSnippets] = useState<Snippet[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [languageFilter, setLanguageFilter] = useState<string>('');
  const [visibilityFilter, setVisibilityFilter] = useState<string>('');
  const [searchTitleFilter, setSearchTitleFilter] = useState<string>('');
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const navigate = useNavigate();
  const { addToast } = useToast();

  const SNIPPETS_PER_PAGE = 20; // Defined in app_spec

  const socketRef = useRef<any>(null);

  useEffect(() => {
    if (isAuthenticated) {
      socketRef.current = io('http://localhost:3003'); // Assuming execution service WebSocket URL

      socketRef.current.on('connect', () => {
        console.log('Connected to WebSocket for snippets');
      });

       socketRef.current.on('snippet_created', (newSnippet: Snippet) => {
         addToast(`New snippet created: ${newSnippet.title}`, 'info');
         setSnippets((prev) => [newSnippet, ...prev]);
       });

       socketRef.current.on('snippet_updated', (updatedSnippet: Snippet) => {
         addToast(`Snippet updated: ${updatedSnippet.title}`, 'info');
         setSnippets((prev) =>
           prev.map((s) => (s.id === updatedSnippet.id ? updatedSnippet : s))
         );
       });

       socketRef.current.on('snippet_deleted', (deletedSnippetId: string) => {
         addToast(`Snippet deleted: ${deletedSnippetId}`, 'info');
         setSnippets((prev) => prev.filter((s) => s.id !== deletedSnippetId));
       });

      socketRef.current.on('disconnect', () => {
        console.log('Disconnected from WebSocket for snippets');
      });

      return () => {
        socketRef.current?.disconnect();
      };
    }
  }, [isAuthenticated, addToast]);

  const observer = useRef<IntersectionObserver>();
  const lastSnippetElementRef = useCallback((node: HTMLTableRowElement) => {
    if (loading || loadingMore) return;
    if (observer.current) observer.current.disconnect();
    observer.current = new IntersectionObserver((entries) => {
      if (entries[0].isIntersecting && hasMore) {
        setPage((prevPage) => prevPage + 1);
      }
    });
    if (node) observer.current.observe(node);
  }, [loading, loadingMore, hasMore]);

  const fetchSnippets = async (filters: { language?: string; visibility?: string; searchTitle?: string }, pageNum: number, append: boolean = false) => {
    if (pageNum === 1) {
      setLoading(true);
    } else {
      setLoadingMore(true);
    }
    setError(null);
    try {
      const data: any = await getSnippets({
        ...filters,
        page: pageNum,
        pageSize: SNIPPETS_PER_PAGE,
      });
      if (append) {
        setSnippets((prevSnippets) => [...prevSnippets, ...data]);
      } else {
        setSnippets(data);
      }
      setHasMore(data.length === SNIPPETS_PER_PAGE);
    } catch (err: any) {
      setError(err.message || 'Network error while fetching snippets');
      addToast(err.message || 'Network error while fetching snippets', 'error');
    } finally {
      if (pageNum === 1) {
        setLoading(false);
      } else {
        setLoadingMore(false);
      }
    }
  };

  useEffect(() => {
    if (isAuthenticated) {
      setPage(1);
      setSnippets([]); // Clear snippets when filters change
      setHasMore(true);
      fetchSnippets({ language: languageFilter, visibility: visibilityFilter, searchTitle: searchTitleFilter }, 1);
    }
  }, [isAuthenticated, languageFilter, visibilityFilter, searchTitleFilter]);

  useEffect(() => {
    if (page > 1) {
      fetchSnippets({ language: languageFilter, visibility: visibilityFilter, searchTitle: searchTitleFilter }, page, true);
    }
  }, [page]);

  const handleDelete = useCallback(async (id: string) => {
    if (window.confirm('Are you sure you want to delete this snippet?')) {
      try {
        await deleteSnippet(id);
        // No need to refetch, WebSocket will handle update
        addToast('Snippet deleted successfully!', 'success');
      } catch (err: any) {
        setError(err.message || 'Failed to delete snippet');
        addToast(err.message || 'Failed to delete snippet', 'error');
      }
    }
  }, [addToast]);

  const handleEdit = useCallback((id: string) => {
    navigate(`/snippets/edit/${id}`);
  }, [navigate]);

  const handleRun = useCallback((id: string) => {
    console.log(`Running snippet ${id}`);
    addToast(`Running snippet ${id} (placeholder)`, 'info');
    // Implement run functionality later
  }, [addToast]);

  if (!isAuthenticated) {
    return (
      <Alert>
        <AlertDescription>Please log in to view your snippets.</AlertDescription>
      </Alert>
    );
  }

  if (loading && snippets.length === 0) {
    return (
      <div className="flex justify-center mt-4">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    );
  }

  if (snippets.length === 0 && !loading) {
    return (
      <Card className="p-6 mt-4 text-center">
        <p className="text-lg text-muted-foreground mb-4">📄 No snippets yet. Create one!</p>
        <Button onClick={() => navigate('/snippets/new')}>Create New Snippet</Button>
      </Card>
    );
  }

  return (
    <div>
      <Card className="p-4 mb-6">
        <div className="flex gap-4 flex-wrap">
          <div className="space-y-2">
            <Label htmlFor="language-select">Language</Label>
            <Select value={languageFilter} onValueChange={setLanguageFilter}>
              <SelectTrigger className="w-32">
                <SelectValue placeholder="All" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">All</SelectItem>
                <SelectItem value="javascript">JavaScript</SelectItem>
                <SelectItem value="python">Python</SelectItem>
                <SelectItem value="java">Java</SelectItem>
                <SelectItem value="cpp">C++</SelectItem>
                <SelectItem value="go">Go</SelectItem>
                <SelectItem value="rust">Rust</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="visibility-select">Visibility</Label>
            <Select value={visibilityFilter} onValueChange={setVisibilityFilter}>
              <SelectTrigger className="w-32">
                <SelectValue placeholder="All" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">All</SelectItem>
                <SelectItem value="public">Public</SelectItem>
                <SelectItem value="private">Private</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="search-title">Search Title</Label>
            <Input
              id="search-title"
              placeholder="Search Title"
              value={searchTitleFilter}
              onChange={(e) => setSearchTitleFilter(e.target.value)}
              className="w-48"
            />
          </div>
        </div>
      </Card>

      <Card>
        <table className="w-full">
          <thead>
            <tr className="border-b">
              <th className="text-left p-4">Title</th>
              <th className="text-left p-4">Language</th>
              <th className="text-left p-4">Visibility</th>
              <th className="text-left p-4">Created At</th>
              <th className="text-right p-4">Actions</th>
            </tr>
          </thead>
          <tbody>
            {snippets.map((snippet, index) => {
              if (snippets.length === index + 1) {
                return (
                  <tr ref={lastSnippetElementRef} key={snippet.id} className="border-b">
                    <td className="p-4 font-medium">{snippet.title}</td>
                    <td className="p-4">{snippet.language}</td>
                    <td className="p-4">{snippet.visibility}</td>
                    <td className="p-4">{new Date(snippet.created_at).toLocaleDateString()}</td>
                    <td className="p-4 text-right">
                      <Button variant="ghost" size="sm" onClick={() => handleEdit(snippet.id)}>
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="sm" onClick={() => handleDelete(snippet.id)}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="sm" onClick={() => handleRun(snippet.id)}>
                        <Play className="h-4 w-4" />
                      </Button>
                    </td>
                  </tr>
                );
              } else {
                return (
                  <tr key={snippet.id} className="border-b">
                    <td className="p-4 font-medium">{snippet.title}</td>
                    <td className="p-4">{snippet.language}</td>
                    <td className="p-4">{snippet.visibility}</td>
                    <td className="p-4">{new Date(snippet.created_at).toLocaleDateString()}</td>
                    <td className="p-4 text-right">
                      <Button variant="ghost" size="sm" onClick={() => handleEdit(snippet.id)}>
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="sm" onClick={() => handleDelete(snippet.id)}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="sm" onClick={() => handleRun(snippet.id)}>
                        <Play className="h-4 w-4" />
                      </Button>
                    </td>
                  </tr>
                );
              }
            })}
            {loadingMore && (
              <tr>
                <td colSpan={5} className="text-center p-4">
                  <Loader2 className="h-5 w-5 animate-spin mx-auto" />
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </Card>
      {!hasMore && snippets.length > 0 && (
        <div className="mt-6 text-center">
          <p className="text-muted-foreground">No more snippets to load.</p>
        </div>
      )}
    </div>
  );
};

export default SnippetsList;
