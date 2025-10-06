import { apiCall } from './apiClient';

// Authentication API functions
export const loginUser = async (email: string, password: string) => {
  return apiCall('/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  });
};

export const signupUser = async (username: string, email: string, password: string) => {
  return apiCall('/auth/register', {
    method: 'POST',
    body: JSON.stringify({ username, email, password }),
  });
};

// Snippet API functions
export const getSnippets = async (filters?: { language?: string; visibility?: string; searchTitle?: string; page?: number; pageSize?: number; userId?: string }) => {
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

export const createSnippet = async (title: string, language: string, code: string, visibility: 'public' | 'private') => {
  return apiCall('/snippets', {
    method: 'POST',
    body: JSON.stringify({ title, language, code, visibility }),
  });
};

export const getSnippetById = async (id: string) => {
  return apiCall(`/snippets/${id}`, {
    method: 'GET',
  });
};

export const updateSnippet = async (id: string, title: string, language: string, code: string, visibility: 'public' | 'private') => {
  return apiCall(`/snippets/${id}`, {
    method: 'PUT',
    body: JSON.stringify({ title, language, code, visibility }),
  });
};

export const deleteSnippet = async (id: string) => {
  return apiCall(`/snippets/${id}`, {
    method: 'DELETE',
  });
};

// Analytics API functions
export const getTopUsers = async (filters?: { language?: string; timePeriod?: string; sortBy?: string }) => {
  const params = new URLSearchParams();
  if (filters?.language) {
    params.append('language', filters.language);
  }
  if (filters?.timePeriod) {
    params.append('timePeriod', filters.timePeriod);
  }
  if (filters?.sortBy) {
    params.append('sortBy', filters.sortBy);
  }

  const queryString = params.toString();
  const url = `/analytics/top-users${queryString ? `?${queryString}` : ''}`;

  return apiCall(url, {
    method: 'GET',
  });
};

export const getPopularLanguages = async () => {
  return apiCall('/analytics/popular-languages', {
    method: 'GET',
  });
};

export const getRecentExecutions = async (limit: number = 10) => {
  return apiCall(`/execute/recent?limit=${limit}`, {
    method: 'GET',
  });
};


// User Profile API functions
export const updateUserProfile = async (userId: string, name: string, email: string, bio: string) => {
  return apiCall(`/users/${userId}`, {
    method: 'PUT',
    body: JSON.stringify({ name, email, bio }),
  });
};

export const changeUserPassword = async (userId: string, currentPassword: string, newPassword: string) => {
  return apiCall(`/users/${userId}/password`, {
    method: 'PUT',
    body: JSON.stringify({ currentPassword, newPassword }),
  });
};

export const uploadAvatar = async (userId: string, file: File) => {
  const formData = new FormData();
  formData.append('avatar', file);

  return apiCall(`/users/${userId}/avatar`, {
    method: 'POST',
    headers: {
      'Content-Type': 'multipart/form-data', // Set content type for FormData
    },
    body: formData,
  });
};

// Admin API functions (Placeholders)
export const getUsersAdmin = async () => {
  // Placeholder for fetching all users for admin panel
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        ok: true,
        json: () => Promise.resolve([
          { id: 'user1', name: 'Admin User', email: 'admin@example.com', role: 'admin', status: 'active' },
          { id: 'user2', name: 'Regular User', email: 'user@example.com', role: 'user', status: 'active' },
        ]),
      });
    }, 500);
  });
};

export const promoteUserAdmin = async (userId: string) => {
  console.log(`Admin: Promoting user ${userId}`);
  return { ok: true }; // Simulate success
};

export const deactivateUserAdmin = async (userId: string) => {
  console.log(`Admin: Deactivating user ${userId}`);
  return { ok: true }; // Simulate success
};

export const deleteUserAdmin = async (userId: string) => {
  console.log(`Admin: Deleting user ${userId}`);
  return { ok: true }; // Simulate success
};

export const getSnippetsAdmin = async () => {
  // Placeholder for fetching all snippets for admin panel
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        ok: true,
        json: () => Promise.resolve([
          { id: 'snip1', title: 'Admin Snippet 1', language: 'python', visibility: 'public' },
          { id: 'snip2', title: 'Admin Snippet 2', language: 'javascript', visibility: 'private' },
        ]),
      });
    }, 500);
  });
};

export const deleteSnippetAdmin = async (snippetId: string) => {
  console.log(`Admin: Deleting snippet ${snippetId}`);
  return { ok: true }; // Simulate success
};

export const flagSnippetAdmin = async (snippetId: string) => {
  console.log(`Admin: Flagging snippet ${snippetId}`);
  return { ok: true }; // Simulate success
};

export const getExecutionsAdmin = async () => {
  // Placeholder for fetching all executions for admin panel
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        ok: true,
        json: () => Promise.resolve([
          { id: 'exec1', snippet_id: 'snip1', status: 'success', runtime: 'python', duration: 120 },
          { id: 'exec2', snippet_id: 'snip2', status: 'failed', runtime: 'javascript', duration: 200 },
        ]),
      });
    }, 500);
  });
};

export const rerunExecutionAdmin = async (executionId: string) => {
  console.log(`Admin: Re-running execution ${executionId}`);
  return { ok: true }; // Simulate success
};

export const killExecutionAdmin = async (executionId: string) => {
  console.log(`Admin: Killing execution ${executionId}`);
  return { ok: true }; // Simulate success
};

export const getSystemHealthMetrics = async () => {
  // Placeholder for fetching system health metrics
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        ok: true,
        json: () => Promise.resolve({
          queue_depth: 5,
          api_latency: '50ms',
          db_replication_lag: '10s',
        }),
      });
    }, 500);
  });
};

// Execution API functions
export const executeCode = async (language: string, code: string) => {
  return apiCall('/execute', {
    method: 'POST',
    body: JSON.stringify({ language, code }),
  });
};