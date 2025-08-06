import React from 'react';
import { Link } from 'react-router-dom';

const Home = () => {
  return (
    <div className="flex justify-center items-center h-screen flex-col text-center bg-gray-100">
      <h1 className="text-4xl font-bold mb-6">Welcome to the Library</h1>
      <div className="space-x-4">
        <Link to="/login">
          <button className="px-6 py-3 bg-blue-500 text-white rounded-md">Login</button>
        </Link>
        <Link to="/signup">
          <button className="px-6 py-3 bg-green-500 text-white rounded-md">Sign Up</button>
        </Link>
      </div>
    </div>
  );
};

export default Home;
