const configuredApiUrl = process.env.REACT_APP_API_URL || 'http://localhost:5180';

export const API_ORIGIN = configuredApiUrl.replace(/\/$/, '');
export const API_BASE_URL = `${API_ORIGIN}/api`;
