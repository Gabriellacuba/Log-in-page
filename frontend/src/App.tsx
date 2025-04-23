/**
 * Main Application Component - Authentication Module
 * 
 * This file handles the authentication module's routing configuration, authentication state,
 * and provides route protection via the ProtectedRoute component.
 * 
 * INTEGRATION NOTES:
 * - When integrating into a larger application, this module can be imported 
 *   as a sub-router within your main application router
 * - Authentication state is managed through localStorage tokens via the authService
 * - The authService (in services/auth.ts) can be extended to include additional 
 *   authentication methods or integrated with an existing auth system
 * - The API_URL in services/auth.ts should be updated to match your production environment
 * - Route paths can be prefixed (e.g., '/auth/login' instead of '/login') when integrating
 * 
 * The app uses React Router v6 for routing and Framer Motion for page transitions.
 */
import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import LoginForm from './components/auth/LoginForm';
import SignupForm from './components/auth/SignupForm';
import ForgotPasswordForm from './components/auth/ForgotPasswordForm';
import ResetPasswordForm from './components/auth/ResetPasswordForm';
import Home from './components/Home';
import { authService } from './services/auth';
import ProtectedRoute from './components/ProtectedRoute';

/**
 * AnimatedRoutes component
 * 
 * Handles route transitions with animations and manages the authentication state.
 * It determines which routes are accessible based on the user's authentication status.
 * 
 * INTEGRATION NOTES:
 * - For integration with existing routers, this component can be converted to use
 *   useRoutes() instead of <Routes> to create a routeElement that can be composed
 * - The isLoggedIn state could be replaced with an existing auth context from a parent app
 * - Page transition animations can be customized or disabled based on the parent app's design
 */
const AnimatedRoutes = () => {
  const location = useLocation();
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(!!authService.getToken());
  
  useEffect(() => {
    // Initialize login state from token
    setIsLoggedIn(!!authService.getToken());
    
    // Handle authentication changes across browser tabs
    const handleStorageChange = () => {
      setIsLoggedIn(!!authService.getToken());
    };
    
    // Listen for localStorage events
    window.addEventListener('storage', handleStorageChange);
    
    // Cleanup event listener on component unmount
    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
  }, []);
  
  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        {/* Public routes - accessible when logged out, redirect to home when logged in */}
        <Route 
          path="/" 
          element={isLoggedIn ? <Navigate to="/home" replace /> : <LoginForm />} 
        />
        
        <Route 
          path="/signup" 
          element={isLoggedIn ? <Navigate to="/home" replace /> : <SignupForm />} 
        />
        
        {/* Password reset routes - always accessible */}
        <Route 
          path="/forgot-password" 
          element={<ForgotPasswordForm />} 
        />
        
        <Route 
          path="/reset-password" 
          element={<ResetPasswordForm />} 
        />
        
        {/* Protected routes - require authentication */}
        <Route element={<ProtectedRoute />}>
          <Route path="/home" element={<Home />} />
          {/* Add other protected routes here */}
        </Route>
      </Routes>
    </AnimatePresence>
  );
};

/**
 * App Component
 * 
 * Root component that wraps the application with the Router provider
 * and renders the AnimatedRoutes component.
 * 
 * INTEGRATION NOTES:
 * - For integration as a module in a larger app, you can:
 *   1. Export AnimatedRoutes instead of App to use with an existing Router
 *   2. Use a basename prop on the Router to mount the auth system at a sub-path
 *   3. Replace BrowserRouter with MemoryRouter for a fully embedded experience
 *   4. Add a custom AuthProvider context to share auth state with the parent app
 */
function App() {
  return (
    <Router>
      <AnimatedRoutes />
    </Router>
  );
}

export default App; 