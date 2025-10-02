export interface Snippet {
  id: string;
  user_id: string;
  title: string;
  language: string;
  code: string;
  visibility: 'public' | 'private';
  created_at: string;
}
