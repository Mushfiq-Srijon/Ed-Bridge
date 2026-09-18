const API_BASE = 'http://localhost:5180/api/admin';

// Get token from localStorage
const getAuthHeader = () => {
  const token = localStorage.getItem('token');
  if (!token) {
    throw new Error('Your session has expired. Please log in again.');
  }

  return {
    Authorization: `Bearer ${token}`,
    'Content-Type': 'application/json',
  };
};

const handleResponse = async (res, message) => {
  if (res.status === 401) {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.location.assign('/login');
    throw new Error('Your session has expired. Please log in again.');
  }

  if (!res.ok) {
    throw new Error(message);
  }

  return res.json();
};

export const adminAPI = {
  // DASHBOARD
  getDashboard: async () => {
    const res = await fetch(`${API_BASE}/dashboard`, {
      headers: getAuthHeader()
    });
    return handleResponse(res, 'Failed to fetch dashboard');
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

  // ANALYTICS
  getAnalytics: async () => {
    const headers = getAuthHeader();
    const [analyticsRes, dashboardRes, reportsRes] = await Promise.all([
      fetch(`${API_BASE}/analytics`, { headers }),
      fetch(`${API_BASE}/dashboard`, { headers }),
      fetch(`${API_BASE}/reports`, { headers }),
    ]);

    const analytics = await handleResponse(analyticsRes, 'Failed to fetch analytics');
    const dashboard = await handleResponse(dashboardRes, 'Failed to fetch dashboard');
    const reports = await handleResponse(reportsRes, 'Failed to fetch reports');

    return {
      ...analytics,
      totalUsers: dashboard.totalUsers,
      suspendedUsers: dashboard.suspendedUsers,
      totalReports: dashboard.totalReports,
      pendingReports: dashboard.pendingReports,
      totalNotes: dashboard.totalNotes,
      reportedNotes: dashboard.reportedNotes,
      totalPosts: dashboard.totalPosts,
      reportedPosts: dashboard.reportedPosts,
      resolvedReports: reports.filter(report => report.status === 'Resolved').length,
      dismissedReports: reports.filter(report => report.status === 'Dismissed').length,
    };
  },

  // Notes Management
  getNotes: async (search = null) => {
    const url = search
      ? `${API_BASE}/notes?search=${encodeURIComponent(search)}`
      : `${API_BASE}/notes`;
    const res = await fetch(url, { headers: getAuthHeader() });
    if (!res.ok) throw new Error('Failed to fetch notes');
    return res.json();
  },

  getNoteDetail: async (noteId) => {
    const res = await fetch(`${API_BASE}/notes/${noteId}`, {
      headers: getAuthHeader(),
    });
    if (!res.ok) throw new Error('Failed to fetch note detail');
    return res.json();
  },

  removeNote: async (noteId) => {
    const res = await fetch(`${API_BASE}/notes/${noteId}/remove`, {
      method: 'PUT',
      headers: getAuthHeader(),
    });
    if (!res.ok) throw new Error('Failed to remove note');
    return res.json();
  },

  // Forums/Posts Management
  getPosts: async (search = null) => {
    const url = search
      ? `${API_BASE}/posts?search=${encodeURIComponent(search)}`
      : `${API_BASE}/posts`;
    const res = await fetch(url, { headers: getAuthHeader() });
    if (!res.ok) throw new Error('Failed to fetch posts');
    return res.json();
  },

  removePost: async (postId, action) => {
    const res = await fetch(`${API_BASE}/posts/${postId}/remove`, {
      method: 'PUT',
      headers: getAuthHeader(),
      body: JSON.stringify({ action }),
    });
    if (!res.ok) throw new Error('Failed to remove post');
    return res.json();
  },
};