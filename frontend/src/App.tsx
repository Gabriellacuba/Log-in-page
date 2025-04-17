import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import LoginForm from './components/auth/LoginForm';
import SignupForm from './components/auth/SignupForm';
import Home from './components/Home';
import { authService } from './services/auth';

// Protected route component
const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const token = authService.getToken();
  
  if (!token) {
    // Redirect to login if no token is found
    return <Navigate to="/" replace />;
  }
  
  return <>{children}</>;
};

// AnimatedRoutes component to handle route transitions
const AnimatedRoutes = () => {
  const location = useLocation();
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(!!authService.getToken());
  
  // Check token on mount and setup event listener
  useEffect(() => {
    // Check login status initially
    setIsLoggedIn(!!authService.getToken());
    
    // Listen for storage events (for when token is added/removed in another tab)
    const handleStorageChange = () => {
      setIsLoggedIn(!!authService.getToken());
    };
    
    window.addEventListener('storage', handleStorageChange);
    
    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
  }, []);
  
  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        {/* Public routes */}
        <Route 
          path="/" 
          element={isLoggedIn ? <Navigate to="/home" replace /> : <LoginForm />} 
        />
        
        <Route 
          path="/signup" 
          element={isLoggedIn ? <Navigate to="/home" replace /> : <SignupForm />} 
        />
        
        {/* Protected routes */}
        <Route 
          path="/home"
          element={
            <ProtectedRoute>
              <Home />
            </ProtectedRoute>
          }
        />
      </Routes>
    </AnimatePresence>
  );
};

function App() {
  return (
    <Router>
      <AnimatedRoutes />
    </Router>
  );
}

export default App; 