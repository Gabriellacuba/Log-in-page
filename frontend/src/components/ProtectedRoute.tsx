/**
 * ProtectedRoute Component
 * 
 * This component provides route protection for authenticated routes.
 * It uses React Router v6's Outlet pattern to render child routes only if the user is authenticated.
 * Otherwise, it redirects to the login page.
 * 
 * The component checks authentication status using the authService.isLoggedIn() method,
 * which verifies if a valid token exists in localStorage.
 * 
 * INTEGRATION NOTES:
 * - When integrating into a larger application, this component can be enhanced to:
 *   1. Support different user roles/permissions to control access to specific routes
 *   2. Use a centralized auth context instead of directly calling authService
 *   3. Customize the redirect path for unauthenticated users (e.g., to a custom login page)
 *   4. Add a loading state while verifying token validity with the backend
 * - Example extension with role-based access:
 *   ```
 *   interface ProtectedRouteProps {
 *     requiredRole?: string;
 *     redirectPath?: string;
 *   }
 *   
 *   const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ 
 *     requiredRole, 
 *     redirectPath = '/' 
 *   }) => {
 *     const { isAuthenticated, userRole } = useAuth();
 *     const hasAccess = isAuthenticated && (!requiredRole || userRole === requiredRole);
 *     
 *     return hasAccess ? <Outlet /> : <Navigate to={redirectPath} replace />;
 *   };
 *   ```
 */
import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { authService } from '../services/auth';

const ProtectedRoute: React.FC = () => {
  // Check if user is authenticated
  const isAuthenticated = authService.isLoggedIn();
  
  // If authenticated, render child routes via Outlet
  // If not authenticated, redirect to the login page (root route)
  return isAuthenticated ? <Outlet /> : <Navigate to="/" replace />;
};

export default ProtectedRoute; 