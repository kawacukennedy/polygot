import { apiCall } from './apiClient';

// API Response types
interface ApiResponse {
  status?: 'ok' | 'error';
  message?: string;
  error_code?: string;
  field?: string;
  data?: any;
  [key: string]: any;
}

// Authentication API functions
export const loginUser = async (email: string, password: string): Promise<any> => {
  return apiCall('/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  });
};

export const signupUser = async (username: string, email: string, password: string): Promise<any> => {
  return apiCall('/auth/register', {
    method: 'POST',
    body: JSON.stringify({ username, email, password }),
  });
};

// Snippet API functions
export const getSnippets = async (filters?: { language?: string; visibility?: string; searchTitle?: string; page?: number; pageSize?: number; userId?: string }): Promise<any> => {
  const params = new URLSearchParams();
  if (filters?.language) {
    params.append('language', filters.language);
  }
  if (filters?.visibility) {
    params.append('visibility', filters.visibility);
  }
  if (filters?.searchTitle) {
    params.append('searchTitle', filters.searchTitle);
  }
  if (filters?.page) {
    params.append('page', filters.page.toString());
  }
  if (filters?.pageSize) {
    params.append('pageSize', filters.pageSize.toString());
  }

  let url = '/snippets';
  if (filters?.userId) {
    url = `/users/${filters.userId}/snippets`;
  }

  const queryString = params.toString();
  url = `${url}${queryString ? `?${queryString}` : ''}`;

  return apiCall(url, {
    method: 'GET',
  });
};

export const createSnippet = async (title: string, language: string, code: string, visibility: 'public' | 'private', tags?: string[]): Promise<any> => {
  return apiCall('/snippets', {
    method: 'POST',
    body: JSON.stringify({ title, language, code, visibility, tags }),
  });
};

export const getSnippetById = async (id: string): Promise<any> => {
  return apiCall(`/snippets/${id}`, {
    method: 'GET',
  });
};

export const updateSnippet = async (id: string, title: string, language: string, code: string, visibility: 'public' | 'private', tags?: string[]): Promise<any> => {
  return apiCall(`/snippets/${id}`, {
    method: 'PUT',
    body: JSON.stringify({ title, language, code, visibility, tags }),
  });
};

export const deleteSnippet = async (id: string): Promise<any> => {
  return apiCall(`/snippets/${id}`, {
    method: 'DELETE',
  });
};

// Analytics API functions
export const getTopUsers = async (): Promise<any> => {
  return apiCall('/analytics/top-users', {
    method: 'GET',
  });
};

export const getPopularLanguages = async (): Promise<any> => {
  return apiCall('/analytics/popular-languages', {
    method: 'GET',
  });
};

export const getRecentExecutions = async (limit: number = 10): Promise<any> => {
  return apiCall(`/execute/recent?limit=${limit}`, {
    method: 'GET',
  });
};


// User Profile API functions
export const updateUserProfile = async (userId: string, displayName: string, bio: string): Promise<any> => {
  return apiCall(`/users/${userId}`, {
    method: 'PATCH',
    body: JSON.stringify({ display_name: displayName, bio }),
  });
};

export const changeUserPassword = async (currentPassword: string, newPassword: string): Promise<any> => {
  return apiCall('/auth/change-password', {
    method: 'POST',
    body: JSON.stringify({ currentPassword, newPassword }),
  });
};

export const uploadAvatar = async (userId: string, file: File): Promise<any> => {
  const formData = new FormData();
  formData.append('avatar', file);

  return apiCall(`/users/${userId}/avatar`, {
    method: 'POST',
    body: formData,
  });
};

export const getUser = async (id: string): Promise<any> => {
  return apiCall(`/users/${id}`, {
    method: 'GET',
  });
};

// Admin API functions (Placeholders)
export const getUsersAdmin = async (): Promise<any[]> => {
  // Placeholder for fetching all users for admin panel
  return [
    { id: 'user1', name: 'Admin User', email: 'admin@example.com', role: 'admin', status: 'active' },
    { id: 'user2', name: 'Regular User', email: 'user@example.com', role: 'user', status: 'active' },
  ];
};

export const promoteUserAdmin = async (userId: string): Promise<any> => {
  console.log(`Admin: Promoting user ${userId}`);
  return { ok: true }; // Simulate success
};

export const deactivateUserAdmin = async (userId: string): Promise<any> => {
  console.log(`Admin: Deactivating user ${userId}`);
  return { ok: true }; // Simulate success
};

export const deleteUserAdmin = async (userId: string): Promise<any> => {
  console.log(`Admin: Deleting user ${userId}`);
  return { ok: true }; // Simulate success
};

export const getSnippetsAdmin = async (): Promise<any[]> => {
  return apiCall('/admin/snippets');
};

export const deleteSnippetAdmin = async (snippetId: string): Promise<any> => {
  return apiCall(`/admin/snippets/${snippetId}`, {
    method: 'DELETE'
  });
};

export const flagSnippetAdmin = async (snippetId: string): Promise<any> => {
  // For now, flagging could be implemented as a PATCH to update a flagged status
  // Since the backend doesn't have this endpoint yet, we'll leave it as a placeholder
  console.log(`Admin: Flagging snippet ${snippetId}`);
  return { ok: true }; // Placeholder
};

export const getExecutionsAdmin = async (): Promise<any[]> => {
  return apiCall('/admin/executions');
};

export const rerunExecutionAdmin = async (executionId: string): Promise<any> => {
  return apiCall(`/admin/executions/${executionId}/rerun`, {
    method: 'POST'
  });
};

export const killExecutionAdmin = async (executionId: string): Promise<any> => {
  return apiCall(`/admin/executions/${executionId}/kill`, {
    method: 'POST'
  });
};

export const getSystemHealthMetrics = async (): Promise<any> => {
  // Placeholder for fetching system health metrics
  return {
    queue_depth: 5,
    api_latency: '50ms',
    db_replication_lag: '10s',
  };
};

// Execution API functions
export const executeCode = async (language: string, code: string): Promise<any> => {
  return apiCall('/execute', {
    method: 'POST',
    body: JSON.stringify({ language, code }),
  });
};