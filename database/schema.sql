
-- Sistema de Gestão vertttraue - Schema do Banco de Dados PostgreSQL
-- Execute este script para criar todas as tabelas necessárias

-- Extensões necessárias
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Tabela de usuários administrativos
CREATE TABLE IF NOT EXISTS usuarios_admin (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    username VARCHAR(50) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabela de fornecedores
CREATE TABLE IF NOT EXISTS fornecedores (
    id VARCHAR(20) PRIMARY KEY,
    nome VARCHAR(255) NOT NULL,
    cidade VARCHAR(100),
    contato VARCHAR(50),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabela de afiliados
CREATE TABLE IF NOT EXISTS afiliados (
    id VARCHAR(20) PRIMARY KEY,
    nome_completo VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    telefone VARCHAR(20),
    comissao DECIMAL(5,2) DEFAULT 0,
    chave_pix VARCHAR(255),
    tipo_chave_pix VARCHAR(20),
    ativo BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabela de produtos
CREATE TABLE IF NOT EXISTS produtos (
    id VARCHAR(20) PRIMARY KEY,
    nome VARCHAR(255) NOT NULL,
    descricao TEXT,
    estoque_fisico INTEGER DEFAULT 0,
    estoque_site INTEGER DEFAULT 0,
    preco DECIMAL(10,2) NOT NULL,
    preco_compra DECIMAL(10,2) NOT NULL,
    fornecedor_id VARCHAR(20) REFERENCES fornecedores(id),
    afiliado_id VARCHAR(20) REFERENCES afiliados(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabela de fotos dos produtos
CREATE TABLE IF NOT EXISTS produto_fotos (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    produto_id VARCHAR(20) REFERENCES produtos(id) ON DELETE CASCADE,
    url_foto VARCHAR(500) NOT NULL,
    ordem INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabela de estoque de afiliados
CREATE TABLE IF NOT EXISTS afiliado_estoque (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    produto_id VARCHAR(20) REFERENCES produtos(id) ON DELETE CASCADE,
    afiliado_id VARCHAR(20) REFERENCES afiliados(id) ON DELETE CASCADE,
    quantidade INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(produto_id, afiliado_id)
);

-- Tabela de conjuntos
CREATE TABLE IF NOT EXISTS conjuntos (
    id VARCHAR(20) PRIMARY KEY,
    nome VARCHAR(255) NOT NULL,
    descricao TEXT,
    preco DECIMAL(10,2) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabela de produtos dos conjuntos
CREATE TABLE IF NOT EXISTS conjunto_produtos (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    conjunto_id VARCHAR(20) REFERENCES conjuntos(id) ON DELETE CASCADE,
    produto_id VARCHAR(20) REFERENCES produtos(id) ON DELETE CASCADE,
    quantidade INTEGER NOT NULL DEFAULT 1,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabela de kits
CREATE TABLE IF NOT EXISTS kits (
    id VARCHAR(20) PRIMARY KEY,
    nome VARCHAR(255) NOT NULL,
    descricao TEXT,
    preco DECIMAL(10,2) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabela de produtos dos kits
CREATE TABLE IF NOT EXISTS kit_produtos (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    kit_id VARCHAR(20) REFERENCES kits(id) ON DELETE CASCADE,
    produto_id VARCHAR(20) REFERENCES produtos(id) ON DELETE CASCADE,
    quantidade INTEGER NOT NULL DEFAULT 1,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabela de vendas
CREATE TABLE IF NOT EXISTS vendas (
    id VARCHAR(20) PRIMARY KEY,
    data_venda TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    afiliado_id VARCHAR(20) REFERENCES afiliados(id),
    total DECIMAL(10,2) NOT NULL,
    tipo VARCHAR(20) DEFAULT 'online', -- 'online' ou 'fisica'
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabela de itens da venda
CREATE TABLE IF NOT EXISTS venda_itens (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    venda_id VARCHAR(20) REFERENCES vendas(id) ON DELETE CASCADE,
    produto_id VARCHAR(20) REFERENCES produtos(id),
    conjunto_id VARCHAR(20) REFERENCES conjuntos(id),
    kit_id VARCHAR(20) REFERENCES kits(id),
    quantidade INTEGER NOT NULL DEFAULT 1,
    preco_unitario DECIMAL(10,2) NOT NULL,
    subtotal DECIMAL(10,2) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CHECK ((produto_id IS NOT NULL AND conjunto_id IS NULL AND kit_id IS NULL) OR
           (produto_id IS NULL AND conjunto_id IS NOT NULL AND kit_id IS NULL) OR
           (produto_id IS NULL AND conjunto_id IS NULL AND kit_id IS NOT NULL))
);

-- Índices para melhor performance
CREATE INDEX IF NOT EXISTS idx_produtos_fornecedor ON produtos(fornecedor_id);
CREATE INDEX IF NOT EXISTS idx_produtos_afiliado ON produtos(afiliado_id);
CREATE INDEX IF NOT EXISTS idx_vendas_data ON vendas(data_venda);
CREATE INDEX IF NOT EXISTS idx_vendas_afiliado ON vendas(afiliado_id);
CREATE INDEX IF NOT EXISTS idx_venda_itens_venda ON venda_itens(venda_id);
CREATE INDEX IF NOT EXISTS idx_afiliado_estoque_produto ON afiliado_estoque(produto_id);
CREATE INDEX IF NOT EXISTS idx_afiliado_estoque_afiliado ON afiliado_estoque(afiliado_id);

-- Função para atualizar updated_at automaticamente
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Criar triggers apenas se não existirem
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_usuarios_admin_updated_at') THEN
        CREATE TRIGGER update_usuarios_admin_updated_at BEFORE UPDATE ON usuarios_admin FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_fornecedores_updated_at') THEN
        CREATE TRIGGER update_fornecedores_updated_at BEFORE UPDATE ON fornecedores FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_afiliados_updated_at') THEN
        CREATE TRIGGER update_afiliados_updated_at BEFORE UPDATE ON afiliados FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_produtos_updated_at') THEN
        CREATE TRIGGER update_produtos_updated_at BEFORE UPDATE ON produtos FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_afiliado_estoque_updated_at') THEN
        CREATE TRIGGER update_afiliado_estoque_updated_at BEFORE UPDATE ON afiliado_estoque FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_conjuntos_updated_at') THEN
        CREATE TRIGGER update_conjuntos_updated_at BEFORE UPDATE ON conjuntos FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_kits_updated_at') THEN
        CREATE TRIGGER update_kits_updated_at BEFORE UPDATE ON kits FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_vendas_updated_at') THEN
        CREATE TRIGGER update_vendas_updated_at BEFORE UPDATE ON vendas FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
    END IF;
END$$;

-- Inserir usuário admin padrão apenas se não existir (senha: admin123)
INSERT INTO usuarios_admin (username, password_hash) 
SELECT 'admin', '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi'
WHERE NOT EXISTS (SELECT 1 FROM usuarios_admin WHERE username = 'admin');

COMMENT ON DATABASE CURRENT_DATABASE() IS 'Sistema de Gestão vertttraue - Database v1.0';
