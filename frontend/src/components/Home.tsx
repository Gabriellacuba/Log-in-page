import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { authService } from '../services/auth';

const Home: React.FC = () => {
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await authService.logout();
      
      // Dispatch storage event to notify other tabs
      window.dispatchEvent(new Event('storage'));
      
      // Navigate to the root path where the login page is
      navigate('/');
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  return (
    <div className="min-h-screen bg-light-gray">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <div className="flex items-center">
            <div className="h-10 w-10 bg-primary rounded-lg flex items-center justify-center mr-3">
              <span className="text-white text-lg font-bold">K</span>
            </div>
            <h1 className="text-xl font-semibold text-primary">Kingstons</h1>
          </div>
          
          <motion.button
            onClick={handleLogout}
            className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            Logout
          </motion.button>
        </div>
      </header>
      
      {/* Main content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <motion.div
          className="bg-white shadow-md rounded-lg p-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <h2 className="text-2xl font-bold mb-4 text-dark-gray">Welcome to the Dashboard</h2>
          <p className="text-gray-700 mb-8">
            You are logged in successfully. This is a protected route.
          </p>
          
          <div>
            <h3 className="text-xl font-semibold mb-4 text-dark-gray">Quick Actions</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <motion.div 
                className="bg-blue-50 p-4 rounded-lg border border-blue-100"
                whileHover={{ 
                  scale: 1.03, 
                  filter: "drop-shadow(0 4px 6px rgba(0, 0, 0, 0.1))" 
                }}
                transition={{ duration: 0.2 }}
              >
                <h4 className="font-medium text-blue-800">Profile</h4>
                <p className="text-sm text-blue-600 mt-1">Manage your account settings</p>
              </motion.div>
              
              <motion.div 
                className="bg-green-50 p-4 rounded-lg border border-green-100"
                whileHover={{ 
                  scale: 1.03, 
                  filter: "drop-shadow(0 4px 6px rgba(0, 0, 0, 0.1))" 
                }}
                transition={{ duration: 0.2 }}
              >
                <h4 className="font-medium text-green-800">Analytics</h4>
                <p className="text-sm text-green-600 mt-1">View your usage statistics</p>
              </motion.div>
              
              <motion.div 
                className="bg-purple-50 p-4 rounded-lg border border-purple-100"
                whileHover={{ 
                  scale: 1.03, 
                  filter: "drop-shadow(0 4px 6px rgba(0, 0, 0, 0.1))" 
                }}
                transition={{ duration: 0.2 }}
              >
                <h4 className="font-medium text-purple-800">Settings</h4>
                <p className="text-sm text-purple-600 mt-1">Configure your preferences</p>
              </motion.div>
            </div>
          </div>
        </motion.div>
      </main>
    </div>
  );
};

export default Home; 