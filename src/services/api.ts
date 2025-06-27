
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

  console.log(`🌐 API Request: ${options.method || 'GET'} ${endpoint}`);
  
  const response = await fetch(`${API_BASE_URL}${endpoint}`, config);
  
  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: 'Erro desconhecido' }));
    console.error(`❌ API Error (${response.status}):`, error);
    throw new Error(error.error || `HTTP ${response.status}`);
  }
  
  const data = await response.json();
  console.log(`✅ API Success: ${endpoint}`, data);
  return data;
};

// Auth API
export const authAPI = {
  login: async (email: string, password: string) => {
    return makeRequest('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ username: email, password }),
    });
  },
  
  register: async (email: string, password: string, nome: string) => {
    return makeRequest('/auth/register', {
      method: 'POST',
      body: JSON.stringify({ username: email, password, nome }),
    });
  },

  verify: async () => {
    return makeRequest('/auth/verify');
  }
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
  getProducts: (id: string) => makeRequest(`/fornecedores/${id}/produtos`),
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
  getStock: (id: string) => makeRequest(`/afiliados/${id}/estoque`),
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

// Sales API
export const salesAPI = {
  getAll: () => makeRequest('/vendas'),
  getById: (id: string) => makeRequest(`/vendas/${id}`),
  getByPeriod: (dataInicio?: string, dataFim?: string) => {
    const params = new URLSearchParams();
    if (dataInicio) params.append('data_inicio', dataInicio);
    if (dataFim) params.append('data_fim', dataFim);
    return makeRequest(`/vendas/periodo?${params.toString()}`);
  },
  create: (sale: any) => makeRequest('/vendas', {
    method: 'POST',
    body: JSON.stringify(sale),
  }),
  update: (id: string, sale: any) => makeRequest(`/vendas/${id}`, {
    method: 'PUT',
    body: JSON.stringify(sale),
  }),
  delete: (id: string) => makeRequest(`/vendas/${id}`, {
    method: 'DELETE',
  }),
};

// Conjuntos API
export const conjuntosAPI = {
  getAll: () => makeRequest('/conjuntos'),
  getById: (id: string) => makeRequest(`/conjuntos/${id}`),
  create: (conjunto: any) => makeRequest('/conjuntos', {
    method: 'POST',
    body: JSON.stringify(conjunto),
  }),
  update: (id: string, conjunto: any) => makeRequest(`/conjuntos/${id}`, {
    method: 'PUT',
    body: JSON.stringify(conjunto),
  }),
  delete: (id: string) => makeRequest(`/conjuntos/${id}`, {
    method: 'DELETE',
  }),
};

// Kits API
export const kitsAPI = {
  getAll: () => makeRequest('/kits'),
  getById: (id: string) => makeRequest(`/kits/${id}`),
  create: (kit: any) => makeRequest('/kits', {
    method: 'POST',
    body: JSON.stringify(kit),
  }),
  update: (id: string, kit: any) => makeRequest(`/kits/${id}`, {
    method: 'PUT',
    body: JSON.stringify(kit),
  }),
  delete: (id: string) => makeRequest(`/kits/${id}`, {
    method: 'DELETE',
  }),
};

// Debug API
export const debugAPI = {
  healthCheck: () => fetch('http://localhost:3001/health').then(res => res.json()),
  apiInfo: () => makeRequest(''),
  testAuth: () => makeRequest('/auth/verify'),
  testProducts: () => makeRequest('/produtos'),
  testSuppliers: () => makeRequest('/fornecedores'),
  testAffiliates: () => makeRequest('/afiliados'),
};

export default {
  auth: authAPI,
  products: productsAPI,
  suppliers: suppliersAPI,
  affiliates: affiliatesAPI,
  sales: salesAPI,
  conjuntos: conjuntosAPI,
  kits: kitsAPI,
  debug: debugAPI,
};
