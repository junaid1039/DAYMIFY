// src/App.js
import React from 'react';
import './App.css';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import UserLayout from './components/userLayout/UserLayout';
import Admin from './Dashboard/admin/Admin';
import PrivateRoute from './context API/PrivateRoute'; // Import your PrivateRoute
import Unauthorized from './components/unauthorized/Unauthorized.jsx';
import ContextProvider from './context API/Contextapi.jsx';

export const App = () => {
  return (
    <ContextProvider>
    <BrowserRouter>
      <Routes> 
        {/* User layout for all user-related routes */}
        <Route path="/*" element={<UserLayout />} />

        {/* Protected Admin layout for admin-related routes */}
        <Route 
          path="/admin/*" 
          element={<PrivateRoute element={Admin} requiredRole="admin" />} 
        />

        {/* Route for unauthorized access */}
        <Route path="/unauthorized" element={<Unauthorized />} />
      </Routes>
    </BrowserRouter>
    </ContextProvider>
  );
};

export default App;
