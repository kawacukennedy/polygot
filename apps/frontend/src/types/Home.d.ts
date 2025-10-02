export interface PopularLanguage {
  language: string;
  count: number;
}

export interface RecentExecution {
  id: string;
  snippet_id: string;
  user_id: string;
  language: string;
  status: 'success' | 'failed' | 'running';
  duration_ms: number;
  executed_at: string;
}
