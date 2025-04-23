/**
 * Reset Password Form Component
 * 
 * This component provides a form for users to set a new password after
 * requesting a password reset. It validates the reset token and allows
 * users to enter and confirm a new password.
 */
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';
import AuthLayout from '../layout/AuthLayout';

const API_URL = 'http://127.0.0.1:8000';

const ResetPasswordForm: React.FC = () => {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [token, setToken] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [verifying, setVerifying] = useState(true);
  const [tokenVerified, setTokenVerified] = useState(false);
  const [resetSuccess, setResetSuccess] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  
  const navigate = useNavigate();
  const location = useLocation();
  
  useEffect(() => {
    // Extract token from URL query parameters
    const searchParams = new URLSearchParams(location.search);
    const tokenFromUrl = searchParams.get('token');
    
    if (!tokenFromUrl) {
      setError('Invalid or missing reset token');
      setVerifying(false);
      return;
    }
    
    setToken(tokenFromUrl);
    
    // Verify token with the backend
    const verifyToken = async () => {
      try {
        await axios.post(`${API_URL}/auth/verify-reset-token`, {
          token: tokenFromUrl
        });
        
        // Token is valid
        setTokenVerified(true);
      } catch (error: any) {
        console.error('Token verification failed:', error);
        
        if (error.response) {
          setError(error.response.data?.detail || 'Invalid or expired token');
        } else if (error.request) {
          setError('Could not connect to the server. Please check if the backend is running.');
        } else {
          setError('An error occurred. Please try again later.');
        }
      } finally {
        setVerifying(false);
      }
    };
    
    verifyToken();
  }, [location]);
  
  // Form validation function
  const validateForm = () => {
    if (!password) {
      setError('Password is required');
      return false;
    }
    
    if (password.length < 8) {
      setError('Password must be at least 8 characters long');
      return false;
    }
    
    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return false;
    }
    
    return true;
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate form before submission
    if (!validateForm()) {
      return;
    }
    
    setError('');
    setLoading(true);
    
    try {
      // Reset password
      await axios.post(`${API_URL}/auth/reset-password`, {
        token: token,
        new_password: password
      });
      
      // Show success message
      setResetSuccess(true);
      
      // Redirect to login after 3 seconds
      setTimeout(() => {
        navigate('/');
      }, 3000);
      
    } catch (error: any) {
      console.error('Password reset failed:', error);
      
      if (error.response) {
        setError(error.response.data?.detail || 'Failed to reset password. Please try again.');
      } else if (error.request) {
        setError('Could not connect to the server. Please check if the backend is running.');
      } else {
        setError('An error occurred. Please try again later.');
      }
    } finally {
      setLoading(false);
    }
  };
  
  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };
  
  // Loading or error state
  if (verifying) {
    return (
      <AuthLayout>
        <div className="flex justify-center items-center">
          <svg className="animate-spin h-10 w-10 text-primary" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
        </div>
      </AuthLayout>
    );
  }
  
  // Form elements
  const formContent = (
    <motion.div
      className="w-full"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      {/* Logo */}
      <div className="flex justify-center mb-14">
        <img 
          src="/images/Company logo.svg" 
          alt="Company Logo" 
          className="h-28 w-auto"
          onError={(e) => {
            e.currentTarget.style.display = 'none';
            const parent = e.currentTarget.parentElement;
            if (parent) {
              // Fallback to text if image fails to load
              const fallbackEl = document.createElement('div');
              fallbackEl.innerHTML = '<div class="h-28 w-28 bg-primary rounded-lg flex items-center justify-center"><span class="text-white text-3xl font-bold">K</span></div>';
              parent.appendChild(fallbackEl.firstChild as Node);
            }
          }}
        />
      </div>
      
      {/* Header */}
      <div className="mb-6">
        <h2 className="text-2xl font-semibold mb-1 text-dark-gray">Reset Password</h2>
        <p className="text-sm text-gray-500">
          {resetSuccess 
            ? "Your password has been reset successfully" 
            : tokenVerified 
              ? "Enter your new password" 
              : "Invalid or expired token"
          }
        </p>
      </div>
      
      {/* Error message */}
      {error && (
        <motion.div 
          className="mb-6 p-4 bg-red-50 text-error-red rounded-lg border border-red-200"
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          {error}
        </motion.div>
      )}
      
      {/* Success message */}
      {resetSuccess && (
        <motion.div
          className="mb-6 p-4 bg-green-50 text-green-700 rounded-lg border border-green-200"
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          Your password has been reset successfully! You will be redirected to the login page...
        </motion.div>
      )}
      
      {tokenVerified && !resetSuccess ? (
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">New Password</label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="form-input pl-10"
                placeholder="Enter your new password"
                required
              />
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
                </svg>
              </div>
              <button 
                type="button" 
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
                onClick={togglePasswordVisibility}
              >
                {showPassword ? (
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M3.707 2.293a1 1 0 00-1.414 1.414l14 14a1 1 0 001.414-1.414l-1.473-1.473A10.014 10.014 0 0019.542 10C18.268 5.943 14.478 3 10 3a9.958 9.958 0 00-4.512 1.074l-1.78-1.781zm4.261 4.26l1.514 1.515a2.003 2.003 0 012.45 2.45l1.514 1.514a4 4 0 00-5.478-5.478z" clipRule="evenodd" />
                    <path d="M12.454 16.697L9.75 13.992a4 4 0 01-3.742-3.741L2.335 6.578A9.98 9.98 0 00.458 10c1.274 4.057 5.065 7 9.542 7 .847 0 1.669-.105 2.454-.303z" />
                  </svg>
                ) : (
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
                    <path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd" />
                  </svg>
                )}
              </button>
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Confirm Password</label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="form-input pl-10"
                placeholder="Confirm your new password"
                required
              />
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
                </svg>
              </div>
            </div>
          </div>

          <motion.button
            type="submit"
            disabled={loading}
            className="btn-primary flex justify-center items-center w-full"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            {loading ? (
              <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
            ) : 'Reset Password'}
          </motion.button>
        </form>
      ) : !resetSuccess && (
        <div className="text-center">
          <p className="text-error-red mb-6">
            {error || "Your password reset link is invalid or has expired."}
          </p>
          <Link 
            to="/forgot-password" 
            className="btn-primary inline-block mt-4"
          >
            Request New Reset Link
          </Link>
        </div>
      )}
      
      <div className="text-center mt-6">
        <span className="text-gray-600">Remember your password? </span>
        <Link to="/" className="text-primary font-medium hover:underline">Sign In</Link>
      </div>
    </motion.div>
  );

  return <AuthLayout>{formContent}</AuthLayout>;
};

export default ResetPasswordForm; 