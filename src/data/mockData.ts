
import { Product, Conjunto, Affiliate, Sale } from '../types';

export const mockProducts: Product[] = [
  {
    id: 'PROD001',
    nome: 'Produto Exemplo 1',
    descricao: 'Descrição do produto exemplo',
    estoque_total: 100,
    estoque_fisico: 60,
    estoque_site: 40,
    preco: 29.99,
    fornecedor: { nome: 'Distribuidora ABC Ltda', cidade: 'São Paulo' }
  },
  {
    id: 'PROD002',
    nome: 'Produto Exemplo 2',
    descricao: 'Outro produto de exemplo',
    estoque_total: 50,
    estoque_fisico: 30,
    estoque_site: 20,
    preco: 49.99,
    fornecedor: { nome: 'Fornecedora XYZ S.A.', cidade: 'Rio de Janeiro' }
  }
];

export const mockConjuntos: Conjunto[] = [
  {
    id: 'CONJ001',
    nome: 'Kit Básico',
    descricao: 'Conjunto de produtos essenciais',
    preco: 69.99,
    produtos: [
      { produto_id: 'PROD001', quantidade: 2 },
      { produto_id: 'PROD002', quantidade: 1 }
    ],
    estoque_disponivel: 25
  }
];

export const mockAffiliates: Affiliate[] = [
  {
    id: 'AFF001',
    nome: 'João Silva',
    contato: 'joao@email.com',
    comissao: 10,
    ativo: true
  },
  {
    id: 'AFF002',
    nome: 'Maria Santos',
    contato: 'maria@email.com',
    comissao: 8,
    ativo: true
  }
];

export const mockSales: Sale[] = [
  {
    id: 'SALE001',
    data: new Date('2024-06-20'),
    produtos: [
      { produto_id: 'PROD001', quantidade: 2, preco_unitario: 29.99 }
    ],
    afiliado: mockAffiliates[0],
    total: 59.98,
    tipo: 'online'
  }
];
