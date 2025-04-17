import api from './api';

export const authService = {
  signup: (clientName: string, email: string, password: string) => 
    api.post('/auth/signup', { client_name: clientName, email, password }),
  
  login: (email: string, password: string) => 
    api.post('/auth/login', { email, password }),
  
  logout: (token: string) => 
    api.post('/auth/logout', {}, {
      headers: { 'Authorization': `Bearer ${token}` }
    }),
    
  setToken: (token: string) => {
    localStorage.setItem('token', token);
    api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
  },
  
  getToken: () => localStorage.getItem('token'),
  
  removeToken: () => {
    localStorage.removeItem('token');
    delete api.defaults.headers.common['Authorization'];
  }
}; 