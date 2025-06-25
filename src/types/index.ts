
export interface Product {
  id: string;
  nome: string;
  descricao: string;
  estoque_total: number;
  estoque_fisico: number;
  estoque_site: number;
  preco: number;
  fornecedor: Supplier;
}

export interface Supplier {
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
  nome: string;
  contato: string;
  comissao: number;
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
