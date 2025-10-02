const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:8080/api/v1';

export async function login(email: string, password: string): Promise<any> {
  const response = await fetch(`${API_BASE_URL}/auth/login`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Client-Version': '1.0.0', // Assuming a client version
    },
    body: JSON.stringify({
      email: email.toLowerCase().trim(),
      password: password,
    }),
  });

  const data = await response.json();

  if (!response.ok) {
    // Handle API errors, e.g., 401 for invalid credentials
    // The API spec shows error responses also have a 'status': 'error' field
    return { status: 'error', message: data.message || 'Login failed', error_code: data.error_code };
  }

  return data;
}

export async function refreshToken(refresh_token: string): Promise<any> {
  const response = await fetch(`${API_BASE_URL}/auth/refresh`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      refresh_token: refresh_token,
    }),
  });

  const data = await response.json();

  if (!response.ok) {
    return { status: 'error', message: data.message || 'Token refresh failed' };
  }

  return data;
}

export async function fetchUser(userId: string, token: string): Promise<any> {
  const response = await fetch(`${API_BASE_URL}/users/${userId}`, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  });

  const data = await response.json();

  if (!response.ok) {
    return { status: 'error', message: data.message || 'Failed to fetch user', error_code: data.error_code };
  }

  return data;
}

export async function createSnippet(snippetData: { title: string; language: string; code: string; visibility?: 'public' | 'private' }, token: string): Promise<any> {
  const response = await fetch(`${API_BASE_URL}/snippets`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(snippetData),
  });

  const data = await response.json();

  if (!response.ok) {
    return { status: 'error', message: data.message || 'Failed to create snippet', error_code: data.error_code };
  }

  return data;
}

export async function executeSnippet(snippetId: string, input: string = '', timeout_ms: number = 3000, token: string): Promise<any> {
  const response = await fetch(`${API_BASE_URL}/snippets/${snippetId}/run`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ input, timeout_ms }),
  });

  const data = await response.json();

  if (!response.ok) {
    return { status: 'error', message: data.message || 'Failed to execute snippet', error_code: data.error_code };
  }

  return data;
}

export async function fetchAdminUsers(token: string, page: number = 1, per_page: number = 50): Promise<any> {
  const response = await fetch(`${API_BASE_URL}/admin/users?page=${page}&per_page=${per_page}`, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  });

  const data = await response.json();

  if (!response.ok) {
    return { status: 'error', message: data.message || 'Failed to fetch admin users', error_code: data.error_code };
  }

  return data;
}

export async function fetchTopUsers(token: string, language?: string, period?: 'daily' | 'weekly' | 'monthly'): Promise<any> {
  let url = `${API_BASE_URL}/analytics/top-users`;
  const params = new URLSearchParams();
  if (language) {
    params.append('language', language);
  }
  if (period) {
    params.append('period', period);
  }
  if (params.toString()) {
    url += `?${params.toString()}`;
  }

  const response = await fetch(url, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  });

  const data = await response.json();

  if (!response.ok) {
    return { status: 'error', message: data.message || 'Failed to fetch top users', error_code: data.error_code };
  }

  return data;
}

export async function fetchSnippets(token: string, language?: string, visibility?: string, searchTerm?: string, page: number = 1, pageSize: number = 20): Promise<any> {
  let url = `${API_BASE_URL}/snippets`;
  const params = new URLSearchParams();
  if (language) {
    params.append('language', language);
  }
  if (visibility) {
    params.append('visibility', visibility);
  }
  if (searchTerm) {
    params.append('search', searchTerm);
  }
  params.append('page', page.toString());
  params.append('pageSize', pageSize.toString());

  if (params.toString()) {
    url += `?${params.toString()}`;
  }

  const response = await fetch(url, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  });

  const data = await response.json();

  if (!response.ok) {
    return { status: 'error', message: data.message || 'Failed to fetch snippets', error_code: data.error_code };
  }

  return data;
}

export async function fetchPopularLanguages(token: string): Promise<any> {
  const response = await fetch(`${API_BASE_URL}/analytics/popular-languages`, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  });

  const data = await response.json();

  if (!response.ok) {
    return { status: 'error', message: data.message || 'Failed to fetch popular languages', error_code: data.error_code };
  }

  return data;
}

export async function fetchRecentExecutions(token: string, limit: number = 10): Promise<any> {
  const response = await fetch(`${API_BASE_URL}/executions/recent?limit=${limit}`, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  });

  const data = await response.json();

  if (!response.ok) {
    return { status: 'error', message: data.message || 'Failed to fetch recent executions', error_code: data.error_code };
  }

  return data;
}

export async function fetchUserSnippets(userId: string, token: string): Promise<any> {
  const response = await fetch(`${API_BASE_URL}/users/${userId}/snippets`, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  });

  const data = await response.json();

  if (!response.ok) {
    return { status: 'error', message: data.message || 'Failed to fetch user snippets', error_code: data.error_code };
  }

  return data;
}

export async function register(email: string, password: string, confirm_password: string): Promise<any> {
  const response = await fetch(`${API_BASE_URL}/auth/register`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ email, password, confirm_password }),
  });

  const data = await response.json();

  if (!response.ok) {
    return { status: 'error', message: data.message || 'Registration failed', error_code: data.error_code };
  }

  return data;
}

export async function updateUser(userId: string, userData: { name?: string; bio?: string }, token: string): Promise<any> {
  const response = await fetch(`${API_BASE_URL}/users/${userId}`, {
    method: 'PUT',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(userData),
  });

  const data = await response.json();

  if (!response.ok) {
    return { status: 'error', message: data.message || 'Failed to update user', error_code: data.error_code };
  }

  return data;
}

export async function fetchExecutions(token: string, page: number = 1, perPage: number = 20): Promise<any> {
  const response = await fetch(`${API_BASE_URL}/admin/executions?page=${page}&per_page=${perPage}`, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  });

  const data = await response.json();

  if (!response.ok) {
    return { status: 'error', message: data.message || 'Failed to fetch executions', error_code: data.error_code };
  }

  return data;
}
