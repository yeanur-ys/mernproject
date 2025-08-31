import axios from 'axios';

/**
 * Custom axios instance configured for API communication
 * - Uses the proxy defined in package.json for local development
 * - Attaches authentication token to all requests
 * - Provides error handling for common API issues
 */
const instance = axios.create({
  baseURL: '/api',
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000, // 10 second timeout
});

// Request interceptor - adds auth token to requests
instance.interceptors.request.use(
  (config) => {
    // Get token from localStorage
    const token = localStorage.getItem('token');
    
    // If token exists, add to Authorization header
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    
    // Log outgoing requests in development
    if (process.env.NODE_ENV === 'development') {
      console.log(`🚀 API Request: ${config.method?.toUpperCase()} ${config.baseURL}${config.url}`);
    }
    
    return config;
  },
  (error) => {
    // Log request errors
    console.error('❌ Request Error:', error);
    return Promise.reject(error);
  }
);

// Response interceptor - handles response formatting and errors
instance.interceptors.response.use(
  (response) => {
    // Log successful responses in development
    if (process.env.NODE_ENV === 'development') {
      console.log(`✅ API Response: ${response.config.url}`, response.status);
    }
    return response;
  },
  (error) => {
    // Handle authentication errors
    if (error.response?.status === 401) {
      console.warn('🔒 Authentication failed. Redirecting to login...');
      localStorage.removeItem('token');
      
      // Optional: Redirect to login
      if (window.location.pathname !== '/login') {
        window.location.href = '/login';
      }
    }
    
    // Handle server errors
    if (error.response?.status >= 500) {
      console.error('🔥 Server Error:', error.response?.data?.message || 'Unknown server error');
    }
    
    // Log all response errors in development
    if (process.env.NODE_ENV === 'development') {
      console.error(
        `❌ API Error: ${error.config?.method?.toUpperCase()} ${error.config?.url}`,
        error.response?.status,
        error.response?.data
      );
    }
    
    return Promise.reject(error);
  }
);

export default instance;
