
export interface Product {
  id: string;
  nome: string;
  descricao: string;
  estoque_fisico: number;
  estoque_site: number;
  preco: number;
  fornecedor: Supplier;
  afiliado_id?: string; // Produto pode estar com afiliado
}

export interface Supplier {
  id: string;
  nome: string;
  cidade: string;
  contato?: string;
}

export interface Conjunto {
  id: string;
  nome: string;
  descricao: string;
  preco: number;
  produtos: ConjuntoProduct[];
  estoque_disponivel: number;
}

export interface ConjuntoProduct {
  produto_id: string;
  quantidade: number;
}

export interface Affiliate {
  id: string;
  nome_completo: string;
  email: string;
  telefone: string;
  comissao: number;
  chave_pix: string;
  ativo: boolean;
}

export interface Sale {
  id: string;
  data: Date;
  produtos: SaleProduct[];
  afiliado?: Affiliate;
  total: number;
  tipo: 'online' | 'fisica';
}

export interface SaleProduct {
  produto_id?: string;
  conjunto_id?: string;
  quantidade: number;
  preco_unitario: number;
}
