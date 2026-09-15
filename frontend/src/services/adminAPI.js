const API_BASE = 'http://localhost:5180/api/admin';

// Get token from localStorage
const getAuthHeader = () => {
  const token = localStorage.getItem('token');
  return {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  };
};

export const adminAPI = {
  // DASHBOARD
  getDashboard: async () => {
    const res = await fetch(`${API_BASE}/dashboard`, {
      headers: getAuthHeader()
    });
    if (!res.ok) throw new Error('Failed to fetch dashboard');
    return res.json();
  },

  // REPORTS
  getReports: async (status = null) => {
    let url = `${API_BASE}/reports`;
    if (status) url += `?status=${status}`;
    const res = await fetch(url, { headers: getAuthHeader() });
    if (!res.ok) throw new Error('Failed to fetch reports');
    return res.json();
  },

  getReportDetail: async (reportId) => {
    const res = await fetch(`${API_BASE}/reports/${reportId}`, {
      headers: getAuthHeader()
    });
    if (!res.ok) throw new Error('Failed to fetch report');
    return res.json();
  },

  dismissReport: async (reportId) => {
    const res = await fetch(`${API_BASE}/reports/${reportId}/dismiss`, {
      method: 'PUT',
      headers: getAuthHeader()
    });
    if (!res.ok) throw new Error('Failed to dismiss report');
    return res.json();
  },

  resolveReport: async (reportId, action) => {
    const res = await fetch(`${API_BASE}/reports/${reportId}/resolve`, {
      method: 'PUT',
      headers: getAuthHeader(),
      body: JSON.stringify({ action })
    });
    if (!res.ok) throw new Error('Failed to resolve report');
    return res.json();
  },

  // USERS
  getUsers: async (search = null, status = null) => {
    let url = `${API_BASE}/users`;
    const params = [];
    if (search) params.push(`search=${search}`);
    if (status) params.push(`status=${status}`);
    if (params.length) url += '?' + params.join('&');
    const res = await fetch(url, { headers: getAuthHeader() });
    if (!res.ok) throw new Error('Failed to fetch users');
    return res.json();
  },

  getUserDetail: async (userId) => {
    const res = await fetch(`${API_BASE}/users/${userId}`, {
      headers: getAuthHeader()
    });
    if (!res.ok) throw new Error('Failed to fetch user');
    return res.json();
  },

  suspendUser: async (userId) => {
    const res = await fetch(`${API_BASE}/users/${userId}/suspend`, {
      method: 'PUT',
      headers: getAuthHeader()
    });
    if (!res.ok) throw new Error('Failed to suspend user');
    return res.json();
  },

  reinstateUser: async (userId) => {
    const res = await fetch(`${API_BASE}/users/${userId}/reinstate`, {
      method: 'PUT',
      headers: getAuthHeader()
    });
    if (!res.ok) throw new Error('Failed to reinstate user');
    return res.json();
  },

  // LISTINGS
  getListings: async (search = null, status = null, category = null) => {
    let url = `${API_BASE}/listings`;
    const params = [];
    if (search) params.push(`search=${search}`);
    if (status) params.push(`status=${status}`);
    if (category) params.push(`category=${category}`);
    if (params.length) url += '?' + params.join('&');
    const res = await fetch(url, { headers: getAuthHeader() });
    if (!res.ok) throw new Error('Failed to fetch listings');
    return res.json();
  },

  getListingDetail: async (listingId) => {
    const res = await fetch(`${API_BASE}/listings/${listingId}`, {
      headers: getAuthHeader()
    });
    if (!res.ok) throw new Error('Failed to fetch listing');
    return res.json();
  },

  removeListing: async (listingId) => {
    const res = await fetch(`${API_BASE}/listings/${listingId}/remove`, {
      method: 'PUT',
      headers: getAuthHeader()
    });
    if (!res.ok) throw new Error('Failed to remove listing');
    return res.json();
  },

  // POSTS
  getReportedPosts: async () => {
    const res = await fetch(`${API_BASE}/posts/reported`, {
      headers: getAuthHeader()
    });
    if (!res.ok) throw new Error('Failed to fetch reported posts');
    return res.json();
  },

  removePost: async (postId, action) => {
    const res = await fetch(`${API_BASE}/posts/${postId}/remove`, {
      method: 'PUT',
      headers: getAuthHeader(),
      body: JSON.stringify({ action })
    });
    if (!res.ok) throw new Error('Failed to remove post');
    return res.json();
  },

  // ANALYTICS
  getAnalytics: async () => {
    const res = await fetch(`${API_BASE}/analytics`, {
      headers: getAuthHeader()
    });
    if (!res.ok) throw new Error('Failed to fetch analytics');
    return res.json();
  }
};