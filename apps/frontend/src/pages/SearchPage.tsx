import React, { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '../components/ui/avatar';
import LoadingSkeleton from '../components/LoadingSkeleton';
import { useToast } from '../contexts/ToastContext';
import { searchSnippets, getPopularTags } from '../services/api';

interface SearchResult {
  id: string;
  title: string;
  code: string;
  language: string;
  visibility: string;
  owner: {
    id: string;
    username: string;
    avatarUrl?: string;
  };
  tags: string[];
  commentsCount: number;
  executionsCount: number;
  createdAt: string;
}

interface PopularTag {
  tag: string;
  count: number;
}

const SearchPage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const { addToast } = useToast();

  const [query, setQuery] = useState(searchParams.get('q') || '');
  const [language, setLanguage] = useState(searchParams.get('language') || '');
  const [visibility, setVisibility] = useState(searchParams.get('visibility') || '');
  const [author, setAuthor] = useState(searchParams.get('author') || '');
  const [sortBy, setSortBy] = useState(searchParams.get('sortBy') || 'createdAt');
  const [sortOrder, setSortOrder] = useState(searchParams.get('sortOrder') || 'desc');

  const [results, setResults] = useState<SearchResult[]>([]);
  const [popularTags, setPopularTags] = useState<PopularTag[]>([]);
  const [loading, setLoading] = useState(false);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 20,
    total: 0,
    pages: 0
  });

  const languages = [
    'PYTHON', 'JAVASCRIPT', 'JAVA', 'CPP', 'GO', 'RUST', 'RUBY', 'PHP'
  ];

  const sortOptions = [
    { value: 'createdAt', label: 'Date Created' },
    { value: 'updatedAt', label: 'Date Updated' },
    { value: 'runsCount', label: 'Runs Count' },
    { value: 'likesCount', label: 'Likes Count' }
  ];

  useEffect(() => {
    loadPopularTags();
  }, []);

  useEffect(() => {
    if (query || language || visibility || author) {
      performSearch();
    }
  }, [searchParams]);

  const loadPopularTags = async () => {
    try {
      const response = await getPopularTags(10);
      setPopularTags(response.tags);
    } catch (error) {
      // Silently fail for popular tags
    }
  };

  const performSearch = async (page = 1) => {
    setLoading(true);
    try {
      const params = {
        q: query,
        language: language || undefined,
        visibility: visibility || undefined,
        author: author || undefined,
        sortBy,
        sortOrder,
        page,
        limit: pagination.limit
      };

      const response = await searchSnippets(params);
      setResults(response.snippets);
      setPagination(response.pagination);

      // Update URL params
      const newParams = new URLSearchParams();
      Object.entries(params).forEach(([key, value]) => {
        if (value && value !== '') {
          newParams.set(key, value.toString());
        }
      });
      setSearchParams(newParams);
    } catch (error) {
      addToast('Search failed', 'error');
      setResults([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    performSearch();
  };

  const handleTagClick = (tag: string) => {
    setQuery(tag);
    performSearch();
  };

  const handlePageChange = (newPage: number) => {
    performSearch(newPage);
  };

  const highlightSearchTerm = (text: string, searchTerm: string) => {
    if (!searchTerm) return text;

    const regex = new RegExp(`(${searchTerm})`, 'gi');
    const parts = text.split(regex);

    return parts.map((part, index) =>
      regex.test(part) ? (
        <mark key={index} className="bg-yellow-200">{part}</mark>
      ) : (
        part
      )
    );
  };

  return (
    <div className="container mx-auto p-6 max-w-7xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-6">Search Snippets</h1>

        {/* Search Form */}
        <Card className="mb-6">
          <CardContent className="pt-6">
            <form onSubmit={handleSearch} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="query">Search Query</Label>
                  <Input
                    id="query"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder="Search in title, code, tags..."
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="language">Language</Label>
                  <Select value={language} onValueChange={setLanguage}>
                    <SelectTrigger>
                      <SelectValue placeholder="All languages" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">All languages</SelectItem>
                      {languages.map(lang => (
                        <SelectItem key={lang} value={lang}>{lang}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="visibility">Visibility</Label>
                  <Select value={visibility} onValueChange={setVisibility}>
                    <SelectTrigger>
                      <SelectValue placeholder="All snippets" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">All snippets</SelectItem>
                      <SelectItem value="public">Public only</SelectItem>
                      <SelectItem value="private">Private only</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="author">Author</Label>
                  <Input
                    id="author"
                    value={author}
                    onChange={(e) => setAuthor(e.target.value)}
                    placeholder="Search by author"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="sortBy">Sort By</Label>
                  <Select value={sortBy} onValueChange={setSortBy}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {sortOptions.map(option => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="sortOrder">Sort Order</Label>
                  <Select value={sortOrder} onValueChange={setSortOrder}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="desc">Descending</SelectItem>
                      <SelectItem value="asc">Ascending</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex items-end">
                  <Button type="submit" className="w-full" disabled={loading}>
                    {loading ? 'Searching...' : 'Search'}
                  </Button>
                </div>
              </div>
            </form>
          </CardContent>
        </Card>

        {/* Popular Tags */}
        {popularTags.length > 0 && (
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Popular Tags</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {popularTags.map(({ tag, count }) => (
                  <Badge
                    key={tag}
                    variant="secondary"
                    className="cursor-pointer hover:bg-primary hover:text-white"
                    onClick={() => handleTagClick(tag)}
                  >
                    {tag} ({count})
                  </Badge>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Search Results */}
      <div className="space-y-4">
        {loading ? (
          <div className="space-y-4">
            {[...Array(5)].map((_, i) => (
              <Card key={i}>
                <CardContent className="pt-6">
                  <LoadingSkeleton height="120px" />
                </CardContent>
              </Card>
            ))}
          </div>
        ) : results.length === 0 && (query || language || visibility || author) ? (
          <Card>
            <CardContent className="pt-6 text-center py-12">
              <p className="text-gray-500">No snippets found matching your search criteria.</p>
            </CardContent>
          </Card>
        ) : results.length === 0 ? (
          <Card>
            <CardContent className="pt-6 text-center py-12">
              <p className="text-gray-500">Start searching for code snippets...</p>
            </CardContent>
          </Card>
        ) : (
          <>
            <div className="flex justify-between items-center">
              <p className="text-sm text-gray-600">
                Found {pagination.total} snippet{pagination.total !== 1 ? 's' : ''}
              </p>
            </div>

            <div className="space-y-4">
              {results.map((snippet) => (
                <Card key={snippet.id} className="hover:shadow-md transition-shadow">
                  <CardContent className="pt-6">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <Link
                          to={`/snippets/${snippet.id}`}
                          className="text-xl font-semibold text-primary hover:underline"
                        >
                          {highlightSearchTerm(snippet.title, query)}
                        </Link>
                        <div className="flex items-center space-x-4 mt-2 text-sm text-gray-600">
                          <div className="flex items-center space-x-2">
                            <Avatar className="w-6 h-6">
                              <AvatarImage src={snippet.owner.avatarUrl} alt={snippet.owner.username} />
                              <AvatarFallback>{snippet.owner.username.charAt(0).toUpperCase()}</AvatarFallback>
                            </Avatar>
                            <Link
                              to={`/users/${snippet.owner.id}`}
                              className="hover:underline"
                            >
                              {snippet.owner.username}
                            </Link>
                          </div>
                          <span>{snippet.language}</span>
                          <span>{new Date(snippet.createdAt).toLocaleDateString()}</span>
                          <span>{snippet.commentsCount} comments</span>
                          <span>{snippet.executionsCount} runs</span>
                        </div>
                      </div>
                      <Badge variant={snippet.visibility === 'PUBLIC' ? 'default' : 'secondary'}>
                        {snippet.visibility}
                      </Badge>
                    </div>

                    <div className="mb-4">
                      <pre className="bg-gray-100 p-3 rounded text-sm overflow-x-auto max-h-32">
                        <code>{highlightSearchTerm(snippet.code.slice(0, 200), query)}{snippet.code.length > 200 ? '...' : ''}</code>
                      </pre>
                    </div>

                    {snippet.tags.length > 0 && (
                      <div className="flex flex-wrap gap-1">
                        {snippet.tags.map(tag => (
                          <Badge
                            key={tag}
                            variant="outline"
                            className="cursor-pointer hover:bg-primary hover:text-white"
                            onClick={() => handleTagClick(tag)}
                          >
                            {tag}
                          </Badge>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Pagination */}
            {pagination.pages > 1 && (
              <div className="flex justify-center space-x-2 mt-8">
                <Button
                  variant="outline"
                  size="sm"
                  disabled={pagination.page <= 1}
                  onClick={() => handlePageChange(pagination.page - 1)}
                >
                  Previous
                </Button>
                <span className="px-3 py-2 text-sm flex items-center">
                  Page {pagination.page} of {pagination.pages}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={pagination.page >= pagination.pages}
                  onClick={() => handlePageChange(pagination.page + 1)}
                >
                  Next
                </Button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default SearchPage;
