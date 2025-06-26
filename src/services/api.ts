
const API_BASE_URL = 'http://localhost:3001/api';

// Função para fazer requisições autenticadas
const makeRequest = async (endpoint: string, options: RequestInit = {}) => {
  const token = localStorage.getItem('authToken');
  
  const config: RequestInit = {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` }),
      ...options.headers,
    },
  };

  const response = await fetch(`${API_BASE_URL}${endpoint}`, config);
  
  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: 'Erro desconhecido' }));
    throw new Error(error.error || `HTTP ${response.status}`);
  }
  
  return response.json();
};

// Auth API
export const authAPI = {
  login: async (email: string, password: string) => {
    return makeRequest('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
  },
  
  register: async (email: string, password: string, nome: string) => {
    return makeRequest('/auth/register', {
      method: 'POST',
      body: JSON.stringify({ email, password, nome }),
    });
  },
};

// Products API
export const productsAPI = {
  getAll: () => makeRequest('/produtos'),
  getById: (id: string) => makeRequest(`/produtos/${id}`),
  create: (product: any) => makeRequest('/produtos', {
    method: 'POST',
    body: JSON.stringify(product),
  }),
  update: (id: string, product: any) => makeRequest(`/produtos/${id}`, {
    method: 'PUT',
    body: JSON.stringify(product),
  }),
  delete: (id: string) => makeRequest(`/produtos/${id}`, {
    method: 'DELETE',
  }),
};

// Suppliers API
export const suppliersAPI = {
  getAll: () => makeRequest('/fornecedores'),
  getById: (id: string) => makeRequest(`/fornecedores/${id}`),
  create: (supplier: any) => makeRequest('/fornecedores', {
    method: 'POST',
    body: JSON.stringify(supplier),
  }),
  update: (id: string, supplier: any) => makeRequest(`/fornecedores/${id}`, {
    method: 'PUT',
    body: JSON.stringify(supplier),
  }),
  delete: (id: string) => makeRequest(`/fornecedores/${id}`, {
    method: 'DELETE',
  }),
};

// Affiliates API
export const affiliatesAPI = {
  getAll: () => makeRequest('/afiliados'),
  getById: (id: string) => makeRequest(`/afiliados/${id}`),
  create: (affiliate: any) => makeRequest('/afiliados', {
    method: 'POST',
    body: JSON.stringify(affiliate),
  }),
  update: (id: string, affiliate: any) => makeRequest(`/afiliados/${id}`, {
    method: 'PUT',
    body: JSON.stringify(affiliate),
  }),
  delete: (id: string) => makeRequest(`/afiliados/${id}`, {
    method: 'DELETE',
  }),
};

export default {
  auth: authAPI,
  products: productsAPI,
  suppliers: suppliersAPI,
  affiliates: affiliatesAPI,
};
