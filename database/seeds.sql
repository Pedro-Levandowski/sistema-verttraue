
-- Dados de exemplo para testes do sistema vertttraue
-- Execute após o schema.sql para popular o banco com dados de teste

-- Inserir fornecedores
INSERT INTO fornecedores (id, nome, cidade, contato) VALUES
('SUPP001', 'Distribuidora ABC Ltda', 'São Paulo', '(11) 99999-9999'),
('SUPP002', 'Fornecedora XYZ S.A.', 'Rio de Janeiro', '(21) 88888-8888'),
('SUPP003', 'Suprimentos Delta', 'Belo Horizonte', '(31) 77777-7777');

-- Inserir afiliados
INSERT INTO afiliados (id, nome_completo, email, telefone, comissao, chave_pix, tipo_chave_pix, ativo) VALUES
('AFF001', 'João Silva Santos', 'joao@email.com', '(11) 99999-0001', 10.00, 'joao@email.com', 'email', true),
('AFF002', 'Maria Santos Oliveira', 'maria@email.com', '(11) 99999-0002', 8.00, '11999990002', 'telefone', true),
('AFF003', 'Carlos Pereira', 'carlos@email.com', '(11) 99999-0003', 12.00, '123.456.789-00', 'cpf', true);

-- Inserir produtos
INSERT INTO produtos (id, nome, descricao, estoque_fisico, estoque_site, preco, preco_compra, fornecedor_id) VALUES
('PROD001', 'Produto Exemplo 1', 'Descrição detalhada do produto exemplo 1', 60, 40, 29.99, 15.50, 'SUPP001'),
('PROD002', 'Produto Exemplo 2', 'Outro produto de exemplo com descrição', 30, 20, 49.99, 25.00, 'SUPP002'),
('PROD003', 'Produto Premium', 'Produto de alta qualidade premium', 15, 10, 89.99, 45.00, 'SUPP001'),
('PROD004', 'Kit Básico Individual', 'Kit básico para uso individual', 25, 15, 35.99, 18.00, 'SUPP003');

-- Inserir conjuntos
INSERT INTO conjuntos (id, nome, descricao, preco) VALUES
('CONJ001', 'Kit Básico', 'Conjunto de produtos essenciais', 69.99),
('CONJ002', 'Kit Família', 'Conjunto ideal para toda família', 129.99);

-- Inserir produtos dos conjuntos
INSERT INTO conjunto_produtos (conjunto_id, produto_id, quantidade) VALUES
('CONJ001', 'PROD001', 2),
('CONJ001', 'PROD002', 1),
('CONJ002', 'PROD001', 3),
('CONJ002', 'PROD003', 1),
('CONJ002', 'PROD004', 2);

-- Inserir kits
INSERT INTO kits (id, nome, descricao, preco) VALUES
('KIT001', 'Kit Premium', 'Kit premium com produtos selecionados', 89.99),
('KIT002', 'Kit Completo', 'Kit completo com todos os produtos', 159.99);

-- Inserir produtos dos kits
INSERT INTO kit_produtos (kit_id, produto_id, quantidade) VALUES
('KIT001', 'PROD001', 1),
('KIT001', 'PROD003', 1),
('KIT002', 'PROD001', 2),
('KIT002', 'PROD002', 1),
('KIT002', 'PROD003', 1),
('KIT002', 'PROD004', 1);

-- Inserir vendas de exemplo
INSERT INTO vendas (id, data_venda, afiliado_id, total, tipo) VALUES
('VENDA001', '2024-06-20 14:30:00', 'AFF001', 59.98, 'online'),
('VENDA002', '2024-06-21 16:45:00', 'AFF002', 89.99, 'online'),
('VENDA003', '2024-06-22 10:15:00', NULL, 129.99, 'fisica');

-- Inserir itens das vendas
INSERT INTO venda_itens (venda_id, produto_id, quantidade, preco_unitario, subtotal) VALUES
('VENDA001', 'PROD001', 2, 29.99, 59.98),
('VENDA002', 'PROD003', 1, 89.99, 89.99),
('VENDA003', 'PROD002', 1, 49.99, 49.99);

INSERT INTO venda_itens (venda_id, conjunto_id, quantidade, preco_unitario, subtotal) VALUES
('VENDA003', 'CONJ001', 1, 69.99, 69.99);

-- Inserir estoque de afiliados
INSERT INTO afiliado_estoque (produto_id, afiliado_id, quantidade) VALUES
('PROD001', 'AFF001', 5),
('PROD002', 'AFF001', 3),
('PROD001', 'AFF002', 8),
('PROD003', 'AFF003', 2);

COMMENT ON TABLE fornecedores IS 'Dados de exemplo inseridos';
