import axios from 'axios';

const TOKEN_KEY = 'auth_token';
const API_URL = 'http://127.0.0.1:8000';

export interface LoginResponse {
  access_token: string;
  token_type: string;
}

export interface AuthError {
  detail: string;
}

export const authService = {
  // Login and store token
  async login(username: string, password: string): Promise<LoginResponse> {
    try {
      // Send JSON with email and password directly
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
  
  // Signup user
  async signup(username: string, password: string, clientName?: string): Promise<any> {
    try {
      const response = await axios.post(`${API_URL}/auth/signup`, {
        client_name: clientName || username.split('@')[0], // Use provided clientName or part before @ as name
        email: username,
        password: password
      });
      return response.data;
    } catch (error) {
      console.error('Signup error:', error);
      throw error;
    }
  },
  
  // Logout and remove token
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
  
  // Get token from localStorage
  getToken(): string | null {
    return localStorage.getItem(TOKEN_KEY);
  },
  
  // Check if user is logged in
  isLoggedIn(): boolean {
    return !!this.getToken();
  },
  
  // Get authenticated axios instance
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