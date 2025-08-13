
const API_BASE_URL = import.meta.env.VITE_API_URL || '/api';

export const makeRequest = async (endpoint: string, options: RequestInit = {}) => {
  const token = localStorage.getItem('authToken');
  
  const config: RequestInit = {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` }),
      ...options.headers,
    },
  };

  console.log(`🌐 API Request: ${options.method || 'GET'} ${API_BASE_URL}${endpoint}`);
  console.log('📤 Request config:', config);
  
  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, config);
    console.log(`📥 Response status: ${response.status}`);
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error(`❌ API Error (${response.status}):`, errorText);
      
      let error;
      try {
        error = JSON.parse(errorText);
      } catch {
        error = { error: errorText || `HTTP ${response.status}` };
      }
      
      throw new Error(error.error || error.message || `HTTP ${response.status}`);
    }
    
    const data = await response.json();
    console.log(`✅ API Success: ${endpoint}`, data);
    return data;
  } catch (fetchError) {
    console.error(`🚨 Fetch Error:`, fetchError);
    throw fetchError;
  }
};

export { API_BASE_URL };
