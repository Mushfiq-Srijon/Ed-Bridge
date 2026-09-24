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
    const response = await fetch(
      `${API_BASE_URL}${endpoint}`,
      config
    );

    if (
      response.status === 401 &&
      endpoint !== '/auth/login'
    ) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');

      window.location.assign('/login');

      throw new Error(
        'Your session has expired. Please log in again.'
      );
    }

    if (!response.ok) {
      const responseText = await response.text();

      let errorMessage = `API Error: ${response.status}`;

      if (responseText) {
        try {
          const errorData = JSON.parse(responseText);

          errorMessage =
            errorData.message ||
            errorData.title ||
            errorMessage;
        } catch {
          errorMessage = responseText;
        }
      }

      throw new Error(errorMessage);
    }

    const responseText = await response.text();

    if (!responseText) {
      return {};
    }

    try {
      return JSON.parse(responseText);
    } catch {
      return responseText;
    }
  } catch (error) {
    console.error('API Call Failed:', error);
    throw error;
  }
};


// =========================
// AUTH API
// =========================

export const authAPI = {
  register: (email, password, name) =>
    apiCall('/auth/register', 'POST', {
      email,
      password,
      name,
    }),

  login: (email, password) =>
    apiCall('/auth/login', 'POST', {
      email,
      password,
    }),

  getGoogleConfig: () =>
    apiCall('/auth/google/config'),

  loginWithGoogle: (idToken) =>
    apiCall('/auth/google', 'POST', { idToken }),

  getProfile: () =>
    apiCall('/auth/profile'),

  updateProfile: (data) =>
    apiCall('/auth/profile', 'PUT', data),

  changePassword: (data) =>
    apiCall('/auth/password', 'PUT', data),

  deleteAccount: () =>
    apiCall('/auth/account', 'DELETE'),

  uploadProfilePhoto: async (file) => {
    const formData = new FormData();

    formData.append('file', file);

    const token = getAuthToken();

    const response = await fetch(
      `${API_BASE_URL}/auth/profile/photo`,
      {
        method: 'POST',
        headers: token
          ? {
              Authorization: `Bearer ${token}`,
            }
          : {},
        body: formData,
      }
    );

    if (!response.ok) {
      const responseText = await response.text();

      let errorMessage = `API Error: ${response.status}`;

      if (responseText) {
        try {
          const errorData = JSON.parse(responseText);

          errorMessage =
            errorData.message ||
            errorData.title ||
            errorMessage;
        } catch {
          errorMessage = responseText;
        }
      }

      throw new Error(errorMessage);
    }

    return response.json();
  },

  removeProfilePhoto: () =>
    apiCall('/auth/profile/photo', 'DELETE'),

  verifyEmail: (token) =>
    apiCall(
      `/auth/verify-email?token=${encodeURIComponent(token)}`
    ),
};


// =========================
// NOTES API
// =========================

export const notesAPI = {
  // Get all notes
  getAll: (page = 1, pageSize = 10) =>
    apiCall(
      `/notes?page=${page}&pageSize=${pageSize}`
    ),

  // Get one note
  getById: (id) =>
    apiCall(`/notes/${id}`),

  // Search notes
  search: (query, page = 1) =>
    apiCall(
      `/notes/search?query=${encodeURIComponent(query)}&page=${page}`
    ),

  // Get notes by subject
  getBySubject: (subjectId, page = 1) =>
    apiCall(
      `/notes/subject/${subjectId}?page=${page}`
    ),

  // Create note
  create: (formData) => {
    const token = getAuthToken();

    return fetch(`${API_BASE_URL}/notes`, {
      method: 'POST',
      headers: token
        ? {
            Authorization: `Bearer ${token}`,
          }
        : {},
      body: formData,
    }).then(async (res) => {
      if (!res.ok) {
        const text = await res.text();

        let msg = `API Error: ${res.status}`;

        try {
          const data = JSON.parse(text);

          msg =
            data.message ||
            data.title ||
            msg;
        } catch {
          msg = text || msg;
        }

        throw new Error(msg);
      }

      return res.json();
    });
  },

  // Update note
  update: (id, data) =>
    apiCall(`/notes/${id}`, 'PUT', data),

  // Delete note
  delete: (id) =>
    apiCall(`/notes/${id}`, 'DELETE'),

  // Download note
  download: async (id) => {
    const token = getAuthToken();

    const response = await fetch(
      `${API_BASE_URL}/notes/${id}/download`,
      {
        method: 'GET',
        headers: token
          ? {
              Authorization: `Bearer ${token}`,
            }
          : {},
      }
    );

    if (!response.ok) {
      const text = await response.text();

      let msg = `API Error: ${response.status}`;

      try {
        const data = JSON.parse(text);

        msg =
          data.message ||
          data.title ||
          msg;
      } catch {
        msg = text || msg;
      }

      throw new Error(msg);
    }

    const contentType = response.headers.get('content-type');

    if (
      contentType &&
      contentType.includes('application/pdf')
    ) {
      const blob = await response.blob();

      const url = window.URL.createObjectURL(blob);

      const a = document.createElement('a');

      a.href = url;
      a.download = `note_${id}.pdf`;

      document.body.appendChild(a);

      a.click();

      window.URL.revokeObjectURL(url);

      a.remove();

      return {
        downloaded: true,
      };
    }

    return response.json();
  },

  // Add comment
  addComment: (id, commentText) =>
    apiCall(
      `/notes/${id}/comment`,
      'POST',
      {
        commentText,
      }
    ),

  // Rate note
  rate: (id, rating) =>
    apiCall(
      `/notes/${id}/rate`,
      'POST',
      {
        rating,
      }
    ),

  // Report note
  report: (id, reason) =>
    apiCall(
      `/notes/${id}/report`,
      'POST',
      {
        reason,
      }
    ),

  // Get subjects
  getSubjects: () =>
    apiCall('/posts/subjects'),

  // =========================
  // SAVED NOTES
  // =========================

  save: (id) =>
    apiCall(`/notes/${id}/save`, 'POST'),

  unsave: (id) =>
    apiCall(`/notes/${id}/save`, 'DELETE'),

  getSaved: () =>
    apiCall('/notes/saved'),
};


// =========================
// FORUM API
// =========================

export const forumAPI = {
  // Get all posts
  getPosts: (page = 1, pageSize = 10) =>
    apiCall(
      `/posts?page=${page}&pageSize=${pageSize}`
    ),

  // Get a single post with replies
  getPost: (id) =>
    apiCall(`/posts/${id}`),

  // Search posts
  searchPosts: (query, page = 1) =>
    apiCall(
      `/posts/search?query=${encodeURIComponent(query)}&page=${page}`
    ),

  // Get posts by subject ID
  getPostsBySubject: (subjectId, page = 1) =>
    apiCall(
      `/posts/subject/${subjectId}?page=${page}`
    ),

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
    apiCall(
      `/posts/${postId}/replies`,
      'POST',
      data
    ),

  // Upvote
  upvotePost: (postId) =>
    apiCall(
      `/posts/${postId}/upvote`,
      'POST'
    ),

  // Remove upvote
  removeUpvote: (postId) =>
    apiCall(
      `/posts/${postId}/upvote`,
      'DELETE'
    ),

  // Downvote
  downvotePost: (postId) =>
    apiCall(
      `/posts/${postId}/downvote`,
      'POST'
    ),

  // Remove downvote
  removeDownvote: (postId) =>
    apiCall(
      `/posts/${postId}/downvote`,
      'DELETE'
    ),

  // Follow
  followPost: (postId) =>
    apiCall(
      `/posts/${postId}/follow`,
      'POST'
    ),

  // Unfollow
  unfollowPost: (postId) =>
    apiCall(
      `/posts/${postId}/follow`,
      'DELETE'
    ),

  // Upvote reply
  upvoteReply: async (postId, replyId) => {
    return apiCall(
      `/posts/${postId}/replies/${replyId}/upvote`,
      'POST'
    );
  },

  // Remove reply upvote
  removeReplyUpvote: async (postId, replyId) => {
    return apiCall(
      `/posts/${postId}/replies/${replyId}/upvote`,
      'DELETE'
    );
  },

  // Downvote reply
  downvoteReply: async (postId, replyId) => {
    return apiCall(
      `/posts/${postId}/replies/${replyId}/downvote`,
      'POST'
    );
  },

  // Remove reply downvote
  removeReplyDownvote: async (postId, replyId) => {
    return apiCall(
      `/posts/${postId}/replies/${replyId}/downvote`,
      'DELETE'
    );
  },

  // Report post
  reportPost: async (postId, reason) => {
    return apiCall(
      `/posts/${postId}/report`,
      'POST',
      {
        reason,
      }
    );
  },

  // Report reply
  reportReply: async (postId, replyId, reason) => {
    return apiCall(
      `/posts/${postId}/replies/${replyId}/report`,
      'POST',
      {
        reason,
      }
    );
  },

  // Get subjects
  getSubjects: () =>
    apiCall('/posts/subjects'),

  save: (id) =>
    apiCall(`/posts/${id}/save`, 'POST'),

  unsave: (id) =>
    apiCall(`/posts/${id}/save`, 'DELETE'),

  getSaved: () =>
    apiCall('/posts/saved'),
};


// =========================
// MARKETPLACE API
// =========================

export const listingsAPI = {
  // Get all listings
  getAll: (
    filters = {},
    page = 1,
    pageSize = 12
  ) => {
    const params = new URLSearchParams();

    if (
      filters.category &&
      filters.category !== 'All'
    ) {
      params.append(
        'category',
        filters.category
      );
    }

    if (
      filters.condition &&
      filters.condition !== 'All'
    ) {
      params.append(
        'condition',
        filters.condition
      );
    }

    if (
      filters.area &&
      filters.area !== 'All'
    ) {
      params.append(
        'area',
        filters.area
      );
    }

    if (filters.minPrice) {
      params.append(
        'minPrice',
        filters.minPrice
      );
    }

    if (filters.maxPrice) {
      params.append(
        'maxPrice',
        filters.maxPrice
      );
    }

    if (filters.search) {
      params.append(
        'search',
        filters.search
      );
    }

    if (filters.sort) {
      params.append(
        'sort',
        filters.sort
      );
    }

    params.append('page', page);
    params.append('pageSize', pageSize);

    return apiCall(
      `/listings?${params.toString()}`
    );
  },

  // Get one listing
  getById: (id) =>
    apiCall(`/listings/${id}`),

  // Get categories
  getCategories: () =>
    apiCall('/listings/categories'),

  // Get areas
  getAreas: () =>
    apiCall('/listings/areas'),

  save: (id) =>
    apiCall(`/listings/${id}/save`, 'POST'),

  unsave: (id) =>
    apiCall(`/listings/${id}/save`, 'DELETE'),

  getSaved: () =>
    apiCall('/listings/saved'),

  // Create listing
  create: (data) =>
    apiCall(
      '/listings',
      'POST',
      data
    ),

  // Update listing
  update: (id, data) =>
    apiCall(
      `/listings/${id}`,
      'PUT',
      data
    ),

  // Delete listing
  delete: (id) =>
    apiCall(
      `/listings/${id}`,
      'DELETE'
    ),

  // Get listing messages
  getMessages: (
    listingId,
    page = 1
  ) =>
    apiCall(
      `/messages/listing/${listingId}?page=${page}`
    ),

  // Send message
  sendMessage: (
    listingId,
    data
  ) =>
    apiCall(
      `/messages/listing/${listingId}`,
      'POST',
      data
    ),

  // Get conversations
  getConversations: () =>
    apiCall(
      '/messages/conversations'
    ),

  getUnreadConversationCount: () =>
    apiCall('/messages/unread-count'),

  markConversationRead: (listingId) =>
    apiCall(
      `/messages/listing/${listingId}/read`,
      'PUT'
    ),

  // Update listing status
  updateStatus: (
    id,
    status
  ) =>
    apiCall(
      `/listings/${id}/status`,
      'PUT',
      {
        status,
      }
    ),
};


// =========================
// REVIEWS API
// =========================

export const reviewsAPI = {
  // Get reviews for a seller
  getSellerReviews: (
    sellerId,
    page = 1,
    pageSize = 10
  ) =>
    apiCall(
      `/reviews/seller/${sellerId}?page=${page}&pageSize=${pageSize}`
    ),

  // Get seller average rating
  getSellerRating: (sellerId) =>
    apiCall(
      `/reviews/seller/${sellerId}/rating`
    ),

  // Create review
  createReview: (data) =>
    apiCall(
      '/reviews',
      'POST',
      data
    ),

  // Get user's reviews
  getUserReviews: (
    userId,
    page = 1
  ) =>
    apiCall(
      `/reviews/user/${userId}?page=${page}`
    ),
};


// =========================
// REPORT API
// =========================

export const reportAPI = {
  // Report a listing
  reportListing: (
    listingId,
    reason
  ) =>
    apiCall(
      `/listings/${listingId}/report`,
      'POST',
      {
        reason,
      }
    ),

  // Report a post
  reportPost: (
    postId,
    reason
  ) =>
    apiCall(
      `/posts/${postId}/report`,
      'POST',
      {
        reason,
      }
    ),

  // Report a reply
  reportReply: (
    postId,
    replyId,
    reason
  ) =>
    apiCall(
      `/posts/${postId}/replies/${replyId}/report`,
      'POST',
      {
        reason,
      }
    ),
};


export const userAPI = {
  getDashboard: () =>
    apiCall('/user/dashboard'),
};
