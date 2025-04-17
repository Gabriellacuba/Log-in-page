import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { authService } from '../services/auth';

const ProtectedRoute: React.FC = () => {
  const isAuthenticated = authService.isLoggedIn();
  
  return isAuthenticated ? <Outlet /> : <Navigate to="/login" replace />;
};

export default ProtectedRoute; 