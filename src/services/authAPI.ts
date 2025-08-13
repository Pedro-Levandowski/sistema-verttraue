
import { makeRequest } from './apiConfig';

export const authAPI = {
  initDatabase: async () => {
    return makeRequest('/auth/init-database', { method: 'POST' });
  },

  login: async (email: string, password: string) => {
    console.log('🔐 Tentando login com:', { email, password: '***' });
    
    return makeRequest('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ 
        username: email, // Backend espera 'username'
        password: password 
      }),
    });
  },
  
  register: async (email: string, password: string, nome?: string) => {
    return makeRequest('/auth/register', {
      method: 'POST',
      body: JSON.stringify({ 
        username: email, 
        password, 
        nome 
      }),
    });
  },

  verify: async () => {
    return makeRequest('/auth/verify');
  },

  testDatabase: async () => {
    return makeRequest('/auth/test-database');
  },

  resetAdmin: async () => {
    return makeRequest('/auth/reset-admin', { method: 'POST' });
  },

  createUser: async (username: string, password: string, nome?: string) => {
    return makeRequest('/auth/create-user', {
      method: 'POST',
      body: JSON.stringify({ 
        username, 
        password, 
        nome 
      }),
    });
  }
};
