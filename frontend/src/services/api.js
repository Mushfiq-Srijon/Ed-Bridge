const API_BASE_URL = 'http://localhost:5180/api';

const getAuthToken = () => {
  return localStorage.getItem('token');
};

export const apiCall = async (endpoint, method = 'GET', body = null) => {
  const headers = {
    'Content-Type': 'application/json',
  };

  const token = getAuthToken();
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const config = {
    method,
    headers,
  };

  if (body && method !== 'GET') {
    config.body = JSON.stringify(body);
  }

  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, config);

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || `API Error: ${response.status}`);
    }
    return await response.json();
  } catch (error) {
    console.error('API Call Failed:', error);
    throw error;
  }
};

export const authAPI = {
  register: (email, password, name) =>
    apiCall('/auth/register', 'POST', { email, password, name }),
  login: (email, password) =>
    apiCall('/auth/login', 'POST', { email, password }),
};

export const notesAPI = {
  getAll: () => apiCall('/notes'),

  getById: (id) => apiCall(`/notes/${id}`),

  search: (query) => apiCall(`/notes/search?q=${query}`),

  create: (data) => apiCall('/notes', 'POST', data),

  update: (id, data) => apiCall(`/notes/${id}`, 'PUT', data),

  delete: (id) => apiCall(`/notes/${id}`, 'DELETE'),
};