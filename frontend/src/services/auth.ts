/**
 * Authentication Service
 * 
 * This module provides comprehensive authentication functionality, including:
 * - User login and token storage
 * - User registration
 * - Logout functionality
 * - Token management
 * - Authentication state checking
 * - Creating authenticated API requests
 * 
 * The service communicates with the backend API and manages the authentication token
 * in the browser's localStorage.
 * 
 * INTEGRATION NOTES:
 * - API_URL should be updated to your production environment or loaded from environment variables
 * - For integration with existing auth systems, consider these modifications:
 *   1. Replace localStorage with your preferred state management (Redux, Context API, etc.)
 *   2. Update the token format and authentication headers to match your backend requirements
 *   3. Add support for refresh tokens and token expiration
 *   4. Extend user information to include roles, permissions, or other profile data
 *   5. Add methods for additional auth flows (social login, multi-factor authentication)
 * - Example custom environment configuration:
 *   ```
 *   const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000';
 *   const TOKEN_KEY = process.env.REACT_APP_TOKEN_KEY || 'auth_token';
 *   ```
 */
import axios from 'axios';

// Constants
const TOKEN_KEY = 'auth_token';
const API_URL = 'http://127.0.0.1:8000';

// Response type definitions
export interface LoginResponse {
  access_token: string;
  token_type: string;
}

export interface AuthError {
  detail: string;
}

export const authService = {
  /**
   * Authenticates a user and stores the received token
   * 
   * @param username User's email address
   * @param password User's password
   * @returns Promise with login response containing the access token
   * @throws Error if authentication fails
   */
  async login(username: string, password: string): Promise<LoginResponse> {
    try {
      const response = await axios.post<LoginResponse>(
        `${API_URL}/auth/login`,
        {
          email: username,
          password: password
        },
        {
          headers: {
            'Content-Type': 'application/json'
          }
        }
      );
      
      if (response.data && response.data.access_token) {
        localStorage.setItem(TOKEN_KEY, response.data.access_token);
      }
      
      return response.data;
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  },
  
  /**
   * Registers a new user
   * 
   * @param username User's email address
   * @param password User's password
   * @param clientName Optional client name (defaults to username part before @)
   * @returns Promise with signup response data
   * @throws Error if registration fails
   */
  async signup(username: string, password: string, clientName?: string): Promise<any> {
    try {
      const response = await axios.post(`${API_URL}/auth/signup`, {
        client_name: clientName || username.split('@')[0],
        email: username,
        password: password
      });
      return response.data;
    } catch (error) {
      console.error('Signup error:', error);
      throw error;
    }
  },
  
  /**
   * Logs out the current user by removing the token
   * 
   * Makes an API call to invalidate the token on the server,
   * then removes the token from localStorage and dispatches
   * a storage event to notify other components of the change.
   * 
   * @returns Promise that resolves when logout is complete
   * @throws Error if logout API call fails (but still removes token)
   */
  async logout(): Promise<void> {
    try {
      // Call the logout endpoint with the token
      await axios.post(
        `${API_URL}/auth/logout`,
        {},
        {
          headers: {
            Authorization: `Bearer ${this.getToken()}`
          }
        }
      );
      
      // Remove token regardless of API response
      localStorage.removeItem(TOKEN_KEY);
      console.log('Token removed from localStorage');
      
      // Dispatch a storage event to notify other components
      window.dispatchEvent(new Event('storage'));
    } catch (error) {
      console.error('Logout error:', error);
      // Still remove the token even if API call fails
      localStorage.removeItem(TOKEN_KEY);
      console.log('Token removed from localStorage (after error)');
      
      // Dispatch a storage event to notify other components
      window.dispatchEvent(new Event('storage'));
      throw error;
    }
  },
  
  /**
   * Retrieves the authentication token from localStorage
   * 
   * @returns The stored token or null if not found
   */
  getToken(): string | null {
    return localStorage.getItem(TOKEN_KEY);
  },
  
  /**
   * Checks if a user is currently logged in
   * 
   * @returns True if a token exists, false otherwise
   */
  isLoggedIn(): boolean {
    return !!this.getToken();
  },
  
  /**
   * Creates an authenticated axios instance with the token in headers
   * 
   * @returns Axios instance with Authorization header set
   */
  getAuthenticatedAxios() {
    const token = this.getToken();
    
    return axios.create({
      baseURL: API_URL,
      headers: {
        Authorization: token ? `Bearer ${token}` : '',
      },
    });
  }
}; 