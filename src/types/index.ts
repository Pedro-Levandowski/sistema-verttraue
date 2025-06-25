
export interface Product {
  id: string;
  nome: string;
  descricao: string;
  estoque_fisico: number;
  estoque_site: number;
  preco: number;
  preco_compra: number;
  fornecedor: Supplier;
  afiliado_id?: string;
  afiliado_estoque?: { afiliado_id: string; quantidade: number }[];
  fotos?: string[];
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

export interface Kit {
  id: string;
  nome: string;
  descricao: string;
  preco: number;
  produtos: KitProduct[];
  estoque_disponivel: number;
}

export interface ConjuntoProduct {
  produto_id: string;
  quantidade: number;
}

export interface KitProduct {
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
  tipo_chave_pix: 'aleatoria' | 'cpf' | 'telefone';
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
  kit_id?: string;
  quantidade: number;
  preco_unitario: number;
}

export interface DashboardStats {
  vendas_mensais: number;
  dias_mais_vendem: { dia: number; vendas: number }[];
  produtos_mais_vendidos: { produto_id: string; quantidade: number }[];
  meio_mais_vende: { online: number; fisica: number };
  afiliados_stats: { afiliado_id: string; vendas: number; comissao_total: number }[];
}
