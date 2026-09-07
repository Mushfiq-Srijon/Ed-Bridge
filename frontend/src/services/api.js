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
  getAll: (page = 1, pageSize = 10) =>
    apiCall(`/notes?page=${page}&pageSize=${pageSize}`),

  getById: (id) => apiCall(`/notes/${id}`),

  search: (query, page = 1) =>
    apiCall(`/notes/search?query=${encodeURIComponent(query)}&page=${page}`),

  getBySubject: (subjectId, page = 1) =>
    apiCall(`/notes/subject/${subjectId}?page=${page}`),

  create: (data) => apiCall('/notes', 'POST', data),

  update: (id, data) => apiCall(`/notes/${id}`, 'PUT', data),

  delete: (id) => apiCall(`/notes/${id}`, 'DELETE'),

  download: (id) => apiCall(`/notes/${id}/download`, 'POST'),

  getSubjects: () => apiCall('/posts/subjects'),
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
  // Downvote
  downvotePost: (postId) =>
    apiCall(`/posts/${postId}/downvote`, 'POST'),

  // Remove downvote
  removeDownvote: (postId) =>
    apiCall(`/posts/${postId}/downvote`, 'DELETE'),

  // Follow
  followPost: (postId) =>
    apiCall(`/posts/${postId}/follow`, 'POST'),

  // Unfollow
  unfollowPost: (postId) =>
    apiCall(`/posts/${postId}/follow`, 'DELETE'),

  upvoteReply: async (postId, replyId) => {
    return apiCall(`/posts/${postId}/replies/${replyId}/upvote`, 'POST');
  },

  removeReplyUpvote: async (postId, replyId) => {
    return apiCall(`/posts/${postId}/replies/${replyId}/upvote`, 'DELETE');
  },

  downvoteReply: async (postId, replyId) => {
    return apiCall(`/posts/${postId}/replies/${replyId}/downvote`, 'POST');
  },

  removeReplyDownvote: async (postId, replyId) => {
    return apiCall(`/posts/${postId}/replies/${replyId}/downvote`, 'DELETE');
  },

  reportPost: async (postId, reason) => {
    return apiCall(`/posts/${postId}/report`, 'POST', { reason });
  },

  reportReply: async (postId, replyId, reason) => {
    return apiCall(`/posts/${postId}/replies/${replyId}/report`, 'POST', { reason });
  },

  getSubjects: () =>
    apiCall('/posts/subjects'),
};
export const listingsAPI = {
  getAll: (filters = {}, page = 1, pageSize = 12) => {
    const params = new URLSearchParams();
    if (filters.category && filters.category !== "All") params.append("category", filters.category);
    if (filters.condition && filters.condition !== "All") params.append("condition", filters.condition);
    if (filters.area && filters.area !== "All") params.append("area", filters.area);
    if (filters.minPrice) params.append("minPrice", filters.minPrice);
    if (filters.maxPrice) params.append("maxPrice", filters.maxPrice);
    if (filters.search) params.append("search", filters.search);
    if (filters.sort) params.append("sort", filters.sort);
    params.append("page", page);
    params.append("pageSize", pageSize);

    return apiCall(`/listings?${params.toString()}`);
  },

  getById: (id) => apiCall(`/listings/${id}`),

  getCategories: () => apiCall("/listings/categories"),

  getAreas: () => apiCall("/listings/areas"),

  create: (data) => apiCall("/listings", "POST", data),

  update: (id, data) => apiCall(`/listings/${id}`, "PUT", data),

  delete: (id) => apiCall(`/listings/${id}`, "DELETE"),
};