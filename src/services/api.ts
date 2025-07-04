const API_BASE_URL = 'http://188.245.246.153:3001/api';

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

// Auth API
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

// API de Estoque de Afiliados
export const estoqueAPI = {
  updateAffiliateStock: async (data: {
    produto_id: string;
    afiliado_id: string;
    quantidade: number;
  }) => {
    console.log('📡 [estoqueAPI] Enviando atualização de estoque:', data);
    const response = await fetch(`${API_BASE_URL}/estoque/afiliado`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('authToken')}`
      },
      body: JSON.stringify(data)
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ error: 'Erro de rede' }));
      throw new Error(errorData.error || `Erro HTTP: ${response.status}`);
    }

    return response.json();
  },

  getAffiliateStock: async (afiliadoId: string) => {
    console.log('📡 [estoqueAPI] Buscando estoque do afiliado:', afiliadoId);
    const response = await fetch(`${API_BASE_URL}/estoque/afiliado/${afiliadoId}`, {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('authToken')}`
      }
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ error: 'Erro de rede' }));
      throw new Error(errorData.error || `Erro HTTP: ${response.status}`);
    }

    return response.json();
  },

  getAffiliateProducts: async (afiliadoId: string) => {
    console.log('📡 [estoqueAPI] Buscando produtos do afiliado:', afiliadoId);
    const response = await fetch(`${API_BASE_URL}/estoque/afiliado/${afiliadoId}/produtos`, {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('authToken')}`
      }
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ error: 'Erro de rede' }));
      throw new Error(errorData.error || `Erro HTTP: ${response.status}`);
    }

    return response.json();
  }
};

// Debug API
export const debugAPI = {
  healthCheck: async () => {
    try {
      const response = await fetch('http://localhost:3001/health');
      return await response.json();
    } catch (error) {
      console.error('❌ Health check failed:', error);
      throw error;
    }
  },
  apiInfo: () => makeRequest(''),
  testAuth: () => makeRequest('/auth/verify'),
  testProducts: () => makeRequest('/produtos'),
  testSuppliers: () => makeRequest('/fornecedores'),
  testAffiliates: () => makeRequest('/afiliados'),
  testDatabase: () => authAPI.testDatabase(),
  resetAdmin: () => authAPI.resetAdmin(),
  initDatabase: () => authAPI.initDatabase(),
  testLogin: async (email: string, password: string) => {
    console.log('🧪 Debug Login Test:', { email, password: '***' });
    return authAPI.login(email, password);
  }
};

export default {
  auth: authAPI,
  products: productsAPI,
  suppliers: suppliersAPI,
  affiliates: affiliatesAPI,
  sales: salesAPI,
  conjuntos: conjuntosAPI,
  kits: kitsAPI,
  estoque: estoqueAPI,
  debug: debugAPI,
};
