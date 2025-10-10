const API_BASE_URL = 'http://localhost:3001/api/v1';

interface ApiErrorResponse {
  message: string;
  statusCode: number;
  // Add other error fields if your API returns them
}

export async function apiCall<T>(url: string, options?: RequestInit, retries = 2): Promise<T> {
  const token = localStorage.getItem('accessToken');

  // Don't set Content-Type for FormData - let the browser set it with boundary
  const isFormData = options?.body instanceof FormData;
  const headers = {
    ...(!isFormData && { 'Content-Type': 'application/json' }),
    ...(token && { 'Authorization': `Bearer ${token}` }),
    ...options?.headers,
  };

  let lastError: Error;

  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      const response = await fetch(`${API_BASE_URL}${url}`, {
        ...options,
        headers,
      });

      if (!response.ok) {
        let errorData: ApiErrorResponse | null = null;
        try {
          errorData = await response.json();
        } catch (e) {
          // If response is not JSON, use status text
        }
        throw new Error(errorData?.message || response.statusText || 'Something went wrong');
      }

      // Handle cases where the response might be empty (e.g., DELETE requests)
      if (response.status === 204 || response.headers.get('Content-Length') === '0') {
        return {} as T;
      }

      return response.json();
    } catch (error: any) {
      lastError = error;
      if (attempt < retries) {
        const delay = attempt === 0 ? 500 : 1500; // Exponential backoff
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
  }

  throw lastError!;
}
