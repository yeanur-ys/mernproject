import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import Signup from './pages/Signup';
import BookCatalog from './pages/BookCatalog';
import BookDetails from './pages/BookDetails';
import AdminPanel from './pages/AdminPanel';
import Home from './pages/Home'; 
import Logout from './components/Logout';
import { jwtDecode } from 'jwt-decode';

function App() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      try {
        const decoded = jwtDecode(token);
        setUser(decoded);
      } catch (error) {
        console.error('Invalid token', error);
      }
    }
  }, []);

  return (
    <Router>
      <div className="relative">
        {user && <Logout />}
        <Routes>
          <Route path="/" element={user ? <BookCatalog /> : <Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/catalog" element={user ? <BookCatalog /> : <Navigate to="/login" />} />
          <Route path="/book/:id" element={user ? <BookDetails /> : <Navigate to="/login" />} />
          <Route path="/admin" element={user?.role === 'admin' ? <AdminPanel /> : <Navigate to="/" />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
