
const pool = require('../config/database');

// Verificar se tabela existe
const checkTableExists = async (tableName) => {
  try {
    const result = await pool.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = $1
      );
    `, [tableName]);
    return result.rows[0].exists;
  } catch (error) {
    console.error(`❌ Erro ao verificar tabela ${tableName}:`, error);
    return false;
  }
};

// Listar todas as vendas
const getAllVendas = async (req, res) => {
  try {
    console.log('🛒 Buscando todas as vendas...');
    
    // Verificar se tabelas existem
    const vendasExists = await checkTableExists('vendas');
    const vendaProdutosExists = await checkTableExists('venda_produtos');
    
    if (!vendasExists) {
      console.log('⚠️ Tabela vendas não existe, retornando array vazio');
      return res.json([]);
    }

    const result = await pool.query(`
      SELECT 
        v.*,
        a.nome_completo as afiliado_nome,
        a.email as afiliado_email
      FROM vendas v
      LEFT JOIN afiliados a ON v.afiliado_id = a.id
      ORDER BY v.created_at DESC
    `);

    const vendas = [];
    
    for (const row of result.rows) {
      let produtos = [];
      
      if (vendaProdutosExists) {
        try {
          const produtosResult = await pool.query(`
            SELECT 
              vp.*,
              p.nome as produto_nome,
              p.preco as produto_preco
            FROM venda_produtos vp
            LEFT JOIN produtos p ON vp.produto_id = p.id
            WHERE vp.venda_id = $1
          `, [row.id]);
          
          produtos = produtosResult.rows;
        } catch (error) {
          console.error('❌ Erro ao buscar produtos da venda:', error);
        }
      }

      vendas.push({
        id: row.id,
        data_venda: row.data_venda,
        valor_total: parseFloat(row.valor_total) || 0,
        status: row.status || 'pendente',
        afiliado: row.afiliado_id ? {
          id: row.afiliado_id,
          nome: row.afiliado_nome || '',
          email: row.afiliado_email || ''
        } : null,
        produtos: produtos.map(p => ({
          id: p.produto_id,
          nome: p.produto_nome || '',
          quantidade: parseInt(p.quantidade) || 0,
          preco_unitario: parseFloat(p.preco_unitario) || 0,
          subtotal: parseFloat(p.subtotal) || 0
        })),
        created_at: row.created_at,
        updated_at: row.updated_at
      });
    }

    console.log(`✅ ${vendas.length} vendas encontradas`);
    res.json(vendas);
  } catch (error) {
    console.error('❌ Erro ao buscar vendas:', error);
    res.status(500).json({ error: 'Erro interno do servidor ao buscar vendas' });
  }
};

// Buscar venda por ID
const getVendaById = async (req, res) => {
  try {
    const { id } = req.params;
    console.log('🛒 Buscando venda:', id);

    const vendasExists = await checkTableExists('vendas');
    if (!vendasExists) {
      return res.status(404).json({ error: 'Tabela de vendas não encontrada' });
    }

    const result = await pool.query(`
      SELECT 
        v.*,
        a.nome_completo as afiliado_nome,
        a.email as afiliado_email
      FROM vendas v
      LEFT JOIN afiliados a ON v.afiliado_id = a.id
      WHERE v.id = $1
    `, [id]);

    if (result.rows.length === 0) {
      console.log('❌ Venda não encontrada:', id);
      return res.status(404).json({ error: 'Venda não encontrada' });
    }

    const venda = result.rows[0];
    
    // Buscar produtos da venda
    let produtos = [];
    const vendaProdutosExists = await checkTableExists('venda_produtos');
    
    if (vendaProdutosExists) {
      try {
        const produtosResult = await pool.query(`
          SELECT 
            vp.*,
            p.nome as produto_nome,
            p.preco as produto_preco
          FROM venda_produtos vp
          LEFT JOIN produtos p ON vp.produto_id = p.id
          WHERE vp.venda_id = $1
        `, [id]);
        
        produtos = produtosResult.rows;
      } catch (error) {
        console.error('❌ Erro ao buscar produtos da venda:', error);
      }
    }

    const vendaCompleta = {
      id: venda.id,
      data_venda: venda.data_venda,
      valor_total: parseFloat(venda.valor_total) || 0,
      status: venda.status || 'pendente',
      afiliado: venda.afiliado_id ? {
        id: venda.afiliado_id,
        nome: venda.afiliado_nome || '',
        email: venda.afiliado_email || ''
      } : null,
      produtos: produtos.map(p => ({
        id: p.produto_id,
        nome: p.produto_nome || '',
        quantidade: parseInt(p.quantidade) || 0,
        preco_unitario: parseFloat(p.preco_unitario) || 0,
        subtotal: parseFloat(p.subtotal) || 0
      })),
      created_at: venda.created_at,
      updated_at: venda.updated_at
    };

    console.log('✅ Venda encontrada:', vendaCompleta.id);
    res.json(vendaCompleta);
  } catch (error) {
    console.error('❌ Erro ao buscar venda:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
};

// Criar nova venda
const createVenda = async (req, res) => {
  try {
    const { afiliado_id, produtos, valor_total, status = 'pendente' } = req.body;
    
    console.log('🛒 Criando venda:', { afiliado_id, produtos: produtos?.length, valor_total });

    // Verificações básicas
    if (!produtos || !Array.isArray(produtos) || produtos.length === 0) {
      return res.status(400).json({ error: 'Produtos são obrigatórios' });
    }

    if (!valor_total || valor_total <= 0) {
      return res.status(400).json({ error: 'Valor total deve ser maior que zero' });
    }

    const vendasExists = await checkTableExists('vendas');
    if (!vendasExists) {
      return res.status(500).json({ error: 'Tabela de vendas não configurada' });
    }

    // Iniciar transação
    await pool.query('BEGIN');

    try {
      // Criar venda
      const vendaResult = await pool.query(`
        INSERT INTO vendas (afiliado_id, valor_total, status, data_venda)
        VALUES ($1, $2, $3, CURRENT_TIMESTAMP)
        RETURNING *
      `, [afiliado_id, valor_total, status]);

      const venda = vendaResult.rows[0];

      // Adicionar produtos (se tabela existir)
      const vendaProdutosExists = await checkTableExists('venda_produtos');
      if (vendaProdutosExists) {
        for (const produto of produtos) {
          await pool.query(`
            INSERT INTO venda_produtos (venda_id, produto_id, quantidade, preco_unitario, subtotal)
            VALUES ($1, $2, $3, $4, $5)
          `, [
            venda.id,
            produto.id,
            produto.quantidade,
            produto.preco_unitario,
            produto.quantidade * produto.preco_unitario
          ]);
        }
      }

      await pool.query('COMMIT');
      
      console.log('✅ Venda criada:', venda.id);
      res.status(201).json(venda);
    } catch (error) {
      await pool.query('ROLLBACK');
      throw error;
    }
  } catch (error) {
    console.error('❌ Erro ao criar venda:', error);
    res.status(500).json({ error: 'Erro interno do servidor ao criar venda' });
  }
};

// Atualizar venda
const updateVenda = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, valor_total } = req.body;
    
    console.log('🛒 Atualizando venda:', id);

    const vendasExists = await checkTableExists('vendas');
    if (!vendasExists) {
      return res.status(404).json({ error: 'Tabela de vendas não encontrada' });
    }

    const result = await pool.query(`
      UPDATE vendas 
      SET status = $1, valor_total = $2, updated_at = CURRENT_TIMESTAMP
      WHERE id = $3
      RETURNING *
    `, [status, valor_total, id]);

    if (result.rows.length === 0) {
      console.log('❌ Venda não encontrada para atualização:', id);
      return res.status(404).json({ error: 'Venda não encontrada' });
    }

    console.log('✅ Venda atualizada:', result.rows[0].id);
    res.json(result.rows[0]);
  } catch (error) {
    console.error('❌ Erro ao atualizar venda:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
};

// Deletar venda
const deleteVenda = async (req, res) => {
  try {
    const { id } = req.params;
    console.log('🛒 Deletando venda:', id);

    const vendasExists = await checkTableExists('vendas');
    if (!vendasExists) {
      return res.status(404).json({ error: 'Tabela de vendas não encontrada' });
    }

    // Iniciar transação
    await pool.query('BEGIN');

    try {
      // Deletar produtos da venda primeiro (se tabela existir)
      const vendaProdutosExists = await checkTableExists('venda_produtos');
      if (vendaProdutosExists) {
        await pool.query('DELETE FROM venda_produtos WHERE venda_id = $1', [id]);
      }

      // Deletar venda
      const result = await pool.query('DELETE FROM vendas WHERE id = $1 RETURNING *', [id]);

      if (result.rows.length === 0) {
        await pool.query('ROLLBACK');
        console.log('❌ Venda não encontrada para deleção:', id);
        return res.status(404).json({ error: 'Venda não encontrada' });
      }

      await pool.query('COMMIT');
      
      console.log('✅ Venda deletada:', result.rows[0].id);
      res.json({ message: 'Venda deletada com sucesso' });
    } catch (error) {
      await pool.query('ROLLBACK');
      throw error;
    }
  } catch (error) {
    console.error('❌ Erro ao deletar venda:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
};

module.exports = {
  getAllVendas,
  getVendaById,
  createVenda,
  updateVenda,
  deleteVenda
};
