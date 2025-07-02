
export interface Product {
  id: string;
  nome: string;
  descricao: string;
  estoque_fisico: number;
  estoque_site: number;
  preco: number;
  preco_compra: number;
  fornecedor: Supplier;
  afiliado_estoque?: AfiliadoEstoque[];
  fotos?: string[];
  created_at?: string;
  updated_at?: string;
}

export interface Supplier {
  id: string;
  nome: string;
  contato: string;
  email: string;
  telefone: string;
  endereco: string;
  cidade: string;
  uf: string;
  cep: string;
  ativo: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface Affiliate {
  id: string;
  nome_completo: string;
  email: string;
  telefone: string;
  endereco: string;
  cidade: string;
  uf: string;
  cep: string;
  comissao: number;
  ativo: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface Sale {
  id: string;
  data_venda: string;
  total: number;
  status: string;
  afiliado_id?: string;
  afiliado_nome?: string;
  observacoes?: string;
  produtos?: SaleProduct[];
  created_at?: string;
  updated_at?: string;
}

export interface SaleProduct {
  id?: string;
  venda_id: string;
  produto_id?: string;
  kit_id?: string;
  conjunto_id?: string;
  quantidade: number;
  preco_unitario: number;
  item_nome?: string;
  item_tipo?: 'produto' | 'kit' | 'conjunto';
}

export interface Kit {
  id: string;
  nome: string;
  descricao: string;
  preco: number;
  produtos: KitProduct[];
  total_produtos?: number;
  estoque_disponivel?: number;
  created_at?: string;
  updated_at?: string;
}

export interface KitProduct {
  id?: string;
  kit_id: string;
  produto_id: string;
  quantidade: number;
  produto_nome?: string;
  produto_preco?: number;
  produto_estoque?: number;
}

export interface Conjunto {
  id: string;
  nome: string;
  descricao: string;
  preco: number;
  produtos: ConjuntoProduct[];
  total_produtos?: number;
  estoque_disponivel?: number;
  created_at?: string;
  updated_at?: string;
}

export interface ConjuntoProduct {
  id?: string;
  conjunto_id: string;
  produto_id: string;
  quantidade: number;
  produto_nome?: string;
  produto_preco?: number;
  produto_estoque?: number;
}

export interface AfiliadoEstoque {
  afiliado_id: string;
  afiliado_nome?: string;
  quantidade: number;
}

export interface User {
  id: string;
  username: string;
  nome: string;
}

export interface AuthContextType {
  isAuthenticated: boolean;
  userName: string | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
}
