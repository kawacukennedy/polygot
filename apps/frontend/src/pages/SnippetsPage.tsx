import React from 'react';
import { Button } from '../components/ui/button';
import { Plus } from 'lucide-react';
import { Link } from 'react-router-dom';
import SnippetsList from '../components/SnippetsList';

const SnippetsPage: React.FC = () => {
  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">My Snippets</h1>
        <Button asChild>
          <Link to="/snippets/new">
            <Plus className="h-4 w-4 mr-2" />
            Create New Snippet
          </Link>
        </Button>
      </div>
      <SnippetsList />
    </div>
  );
};

export default SnippetsPage;