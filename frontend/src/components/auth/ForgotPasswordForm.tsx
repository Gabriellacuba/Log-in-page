/**
 * Forgot Password Form Component
 * 
 * This component provides a form for users to request a password reset.
 * It collects the user's email address and sends a reset request to the backend.
 */
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import axios from 'axios';
import AuthLayout from '../layout/AuthLayout';

const API_URL = 'http://127.0.0.1:8000';

const ForgotPasswordForm: React.FC = () => {
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [emailSent, setEmailSent] = useState(false);

  // Form validation function
  const validateForm = () => {
    if (!email) {
      setError('Email is required');
      return false;
    }
    if (!email.includes('@') || !email.includes('.')) {
      setError('Please enter a valid email address');
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
      // Send password reset request
      await axios.post(`${API_URL}/auth/forgot-password`, {
        email: email
      });
      
      // Show success message
      setEmailSent(true);
      
    } catch (error: any) {
      console.error('Password reset request failed:', error);
      
      if (error.response) {
        setError(error.response.data?.detail || 'Failed to request password reset. Please try again.');
      } else if (error.request) {
        setError('Could not connect to the server. Please check if the backend is running.');
      } else {
        setError('An error occurred. Please try again later.');
      }
    } finally {
      setLoading(false);
    }
  };

  // Form elements or success message
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
        <h2 className="text-2xl font-semibold mb-1 text-dark-gray">Forgot Password</h2>
        <p className="text-sm text-gray-500">
          {emailSent 
            ? "Check your email for reset instructions" 
            : "Enter your email and we'll send you instructions to reset your password"}
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
      {emailSent ? (
        <motion.div
          className="mb-6 p-4 bg-green-50 text-green-700 rounded-lg border border-green-200"
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          We've sent instructions to reset your password to <strong>{email}</strong>. 
          Please check your email inbox and follow the instructions.
        </motion.div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
            <div className="relative">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="form-input pl-10"
                placeholder="Enter your email"
                required
              />
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400" viewBox="0 0 20 20" fill="currentColor">
                  <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
                  <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
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
            ) : 'Send Reset Instructions'}
          </motion.button>
        </form>
      )}
      
      <div className="text-center mt-6">
        <span className="text-gray-600">Remember your password? </span>
        <Link to="/" className="text-primary font-medium hover:underline">Sign In</Link>
      </div>
    </motion.div>
  );

  return <AuthLayout>{formContent}</AuthLayout>;
};

export default ForgotPasswordForm; 