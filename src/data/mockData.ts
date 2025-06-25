
import { Product, Conjunto, Kit, Affiliate, Sale, Supplier } from '../types';

export const mockSuppliers: Supplier[] = [
  {
    id: 'SUPP001',
    nome: 'Distribuidora ABC Ltda',
    cidade: 'São Paulo',
    contato: '(11) 99999-9999'
  },
  {
    id: 'SUPP002',
    nome: 'Fornecedora XYZ S.A.',
    cidade: 'Rio de Janeiro',
    contato: '(21) 88888-8888'
  },
  {
    id: 'SUPP003',
    nome: 'Suprimentos Delta',
    cidade: 'Belo Horizonte',
    contato: '(31) 77777-7777'
  }
];

export const mockAffiliates: Affiliate[] = [
  {
    id: 'AFF001',
    nome_completo: 'João Silva Santos',
    email: 'joao@email.com',
    telefone: '(11) 99999-0001',
    comissao: 10,
    chave_pix: 'joao@email.com',
    tipo_chave_pix: 'cpf',
    ativo: true
  },
  {
    id: 'AFF002',
    nome_completo: 'Maria Santos Oliveira',
    email: 'maria@email.com',
    telefone: '(11) 99999-0002',
    comissao: 8,
    chave_pix: '11999990002',
    tipo_chave_pix: 'telefone',
    ativo: true
  }
];

export const mockProducts: Product[] = [
  {
    id: 'PROD001',
    nome: 'Produto Exemplo 1',
    descricao: 'Descrição do produto exemplo',
    estoque_fisico: 60,
    estoque_site: 40,
    preco: 29.99,
    preco_compra: 15.50,
    fornecedor: mockSuppliers[0],
    afiliado_id: '',
    afiliado_estoque: [],
    fotos: []
  },
  {
    id: 'PROD002',
    nome: 'Produto Exemplo 2',
    descricao: 'Outro produto de exemplo',
    estoque_fisico: 30,
    estoque_site: 20,
    preco: 49.99,
    preco_compra: 25.00,
    fornecedor: mockSuppliers[1],
    afiliado_id: '',
    afiliado_estoque: [],
    fotos: []
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
    estoque_disponivel: 20
  }
];

export const mockKits: Kit[] = [
  {
    id: 'KIT001',
    nome: 'Kit Premium',
    descricao: 'Kit premium com produtos selecionados',
    preco: 89.99,
    produtos: [
      { produto_id: 'PROD001', quantidade: 1 },
      { produto_id: 'PROD002', quantidade: 2 }
    ],
    estoque_disponivel: 15
  },
  {
    id: 'KIT002',
    nome: 'Kit Completo',
    descricao: 'Kit completo com todos os produtos',
    preco: 120.00,
    produtos: [
      { produto_id: 'PROD001', quantidade: 3 },
      { produto_id: 'PROD002', quantidade: 2 }
    ],
    estoque_disponivel: 10
  }
];

export const mockSales: Sale[] = [
  {
    id: 'VENDA001',
    data: new Date('2024-06-20'),
    produtos: [
      { produto_id: 'PROD001', quantidade: 2, preco_unitario: 29.99 }
    ],
    afiliado: mockAffiliates[0],
    total: 59.98,
    tipo: 'online'
  }
];
