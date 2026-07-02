import axios from 'axios';

const axiosClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || '',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to attach Bearer token if it exists in local storage
axiosClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle authentication and authorization errors
axiosClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      // Exclude login and auth endpoints from redirecting to session-expired
      const isAuthRequest = error.config?.url?.includes('/api/auth/');
      
      if (!isAuthRequest) {
        // Clear client-side authentication state
        localStorage.removeItem('token');
        localStorage.removeItem('user');

        // Redirect to the session-expired route
        window.location.href = '/session-expired';
      }
    }
    
    // For 403 status, do not redirect. Allow the error to propagate 
    // so pages/components can handle "forbidden" or "not the owner" errors.
    return Promise.reject(error);
  }
);

export default axiosClient;
