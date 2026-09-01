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

export const forumAPI = {
  // Get all posts
  getPosts: (page = 1, pageSize = 10) =>
    apiCall(`/posts?page=${page}&pageSize=${pageSize}`),

  // Get a single post with replies
  getPost: (id) =>
    apiCall(`/posts/${id}`),

  // Search posts
  searchPosts: (query, page = 1) =>
    apiCall(`/posts/search?query=${encodeURIComponent(query)}&page=${page}`),

  // Get posts by subject ID
  getPostsBySubject: (subjectId, page = 1) =>
    apiCall(`/posts/subject/${subjectId}?page=${page}`),

  // Create post
  createPost: (data) =>
    apiCall('/posts', 'POST', data),

  // Update post
  updatePost: (id, data) =>
    apiCall(`/posts/${id}`, 'PUT', data),

  // Delete post
  deletePost: (id) =>
    apiCall(`/posts/${id}`, 'DELETE'),

  // Add reply
  addReply: (postId, data) =>
    apiCall(`/posts/${postId}/replies`, 'POST', data),

  // Upvote
  upvotePost: (postId) =>
    apiCall(`/posts/${postId}/upvote`, 'POST'),

  // Remove upvote
  removeUpvote: (postId) =>
    apiCall(`/posts/${postId}/upvote`, 'DELETE'),

  // Follow
  followPost: (postId) =>
    apiCall(`/posts/${postId}/follow`, 'POST'),

  // Unfollow
  unfollowPost: (postId) =>
    apiCall(`/posts/${postId}/follow`, 'DELETE'),
};