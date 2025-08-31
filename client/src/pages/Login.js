import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from '../axios';
import '../styles/LoginPage.css';

const Login = () => {
  const [credentials, setCredentials] = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  // Check if user is already logged in
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      navigate('/');
    }
  }, [navigate]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setCredentials(prev => ({ ...prev, [name]: value }));
    if (error) setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Simple validation
    if (!credentials.email || !credentials.password) {
      setError('Please provide both email and password');
      return;
    }
    
    setLoading(true);
    
    try {
      console.log('Attempting login with:', credentials.email);
      const response = await axios.post('/auth/login', credentials);
      console.log('Login successful:', response.data);
      localStorage.setItem('token', response.data.token);
      navigate('/');  // Always navigate to home page after login
    } catch (err) {
      console.error('Login error:', err);
      setError(err.response?.data?.message || 'Login failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container">
      <form onSubmit={handleSubmit}>
        <h2>Sign in to your account</h2>
        
        {error && <div className="error-message">{error}</div>}
        
        <input
          type="email"
          name="email"
          placeholder="Email Address"
          value={credentials.email}
          onChange={handleChange}
          required
        />
        
        <input
          type="password"
          name="password"
          placeholder="Password"
          value={credentials.password}
          onChange={handleChange}
          required
        />
        
        <button type="submit" disabled={loading}>
          {loading ? 'Signing in...' : 'Sign in'}
        </button>
        
        <a href="#" className="forgot-password-link">Forgot password?</a>
        
        <div style={{ marginTop: '20px', textAlign: 'center' }}>
          Don't have an account?{' '}
          <Link to="/signup" style={{ color: '#007BFF' }}>
            Sign up
          </Link>
          <br />
          <Link to="/" style={{ color: '#666', fontSize: '14px', marginTop: '10px', display: 'inline-block' }}>
            ← Back to home
          </Link>
        </div>
      </form>
    </div>
  );
};

export default Login;
