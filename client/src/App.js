import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';

// Page components
import Home from './pages/Home';
import Login from './pages/Login';
import Signup from './pages/Signup';
import BookCatalog from './pages/BookCatalog';
import BookDetails from './pages/BookDetails';
import AdminPanel from './pages/AdminPanel';

// Utility components
import { jwtDecode } from 'jwt-decode';

// Custom route guard component for protected routes
const ProtectedRoute = ({ children, redirectPath = '/login', isAllowed }) => {
  return isAllowed ? children : <Navigate to={redirectPath} replace />;
};

function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check for authentication on app load
    const validateAuth = () => {
      const token = localStorage.getItem('token');
      if (!token) {
        setLoading(false);
        return;
      }

      try {
        const decoded = jwtDecode(token);
        
        // Optional: Check if token is expired
        const currentTime = Date.now() / 1000;
        if (decoded.exp && decoded.exp < currentTime) {
          console.log('Token expired');
          localStorage.removeItem('token');
          setUser(null);
        } else {
          setUser(decoded);
        }
      } catch (error) {
        console.error('Token validation failed:', error);
        localStorage.removeItem('token');
      } finally {
        setLoading(false);
      }
    };

    validateAuth();
  }, []);

  // Display loading state while checking authentication
  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen bg-gray-100">
        <div className="animate-pulse text-xl font-semibold">Loading...</div>
      </div>
    );
  }

  return (
    <Router>
      <div className="flex flex-col min-h-screen">
        <Routes>
          {/* Public routes */}
          <Route 
            path="/" 
            element={<Home />} 
          />
          <Route 
            path="/login" 
            element={user ? <Navigate to="/" replace /> : <Login />} 
          />
          <Route 
            path="/signup" 
            element={user ? <Navigate to="/" replace /> : <Signup />} 
          />
          
          {/* Protected routes - require authentication */}
          <Route 
            path="/catalog" 
            element={
              <ProtectedRoute isAllowed={!!user}>
                <BookCatalog />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/book/:id" 
            element={
              <ProtectedRoute isAllowed={!!user}>
                <BookDetails />
              </ProtectedRoute>
            } 
          />
          
          {/* Admin-only routes */}
          <Route 
            path="/admin" 
            element={
              <ProtectedRoute isAllowed={user?.role === 'admin'} redirectPath="/">
                <AdminPanel />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/admin/edit/:id" 
            element={
              <ProtectedRoute isAllowed={user?.role === 'admin'} redirectPath="/">
                <AdminPanel />
              </ProtectedRoute>
            } 
          />
          
          {/* 404 route - catch all unmatched routes */}
          <Route 
            path="*" 
            element={
              <div className="flex justify-center items-center h-screen">
                <div className="text-center">
                  <h2 className="text-2xl font-bold mb-4">Page Not Found</h2>
                  <p className="mb-4">The page you are looking for doesn't exist.</p>
                  <button 
                    onClick={() => window.history.back()}
                    className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                  >
                    Go Back
                  </button>
                </div>
              </div>
            } 
          />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
