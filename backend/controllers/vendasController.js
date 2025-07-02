
const pool = require('../config/database');

// Listar todas as vendas
const getAllVendas = async (req, res) => {
  try {
    console.log('💰 Buscando todas as vendas...');
    
    const result = await pool.query(`
      SELECT 
        v.*,
        a.nome_completo as afiliado_nome
      FROM vendas v
      LEFT JOIN afiliados a ON v.afiliado_id = a.id
      ORDER BY v.data_venda DESC
    `);

    console.log(`✅ ${result.rows.length} vendas encontradas`);
    res.json(result.rows);
  } catch (error) {
    console.error('❌ Erro ao buscar vendas:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
};

// Buscar venda por ID
const getVendaById = async (req, res) => {
  try {
    const { id } = req.params;
    console.log('💰 Buscando venda:', id);

    // Buscar dados da venda
    const vendaResult = await pool.query(`
      SELECT 
        v.*,
        a.nome_completo as afiliado_nome,
        a.email as afiliado_email
      FROM vendas v
      LEFT JOIN afiliados a ON v.afiliado_id = a.id
      WHERE v.id = $1
    `, [id]);

    if (vendaResult.rows.length === 0) {
      console.log('❌ Venda não encontrada:', id);
      return res.status(404).json({ error: 'Venda não encontrada' });
    }

    // Buscar produtos da venda usando a tabela correta
    const produtosResult = await pool.query(`
      SELECT 
        vi.*,
        COALESCE(p.nome, k.nome, c.nome) as item_nome,
        CASE 
          WHEN vi.produto_id IS NOT NULL THEN 'produto'
          WHEN vi.kit_id IS NOT NULL THEN 'kit'
          WHEN vi.conjunto_id IS NOT NULL THEN 'conjunto'
        END as item_tipo
      FROM venda_itens vi
      LEFT JOIN produtos p ON vi.produto_id = p.id
      LEFT JOIN kits k ON vi.kit_id = k.id
      LEFT JOIN conjuntos c ON vi.conjunto_id = c.id
      WHERE vi.venda_id = $1
      ORDER BY vi.id
    `, [id]);

    const venda = {
      ...vendaResult.rows[0],
      produtos: produtosResult.rows
    };

    console.log('✅ Venda encontrada:', venda.id);
    res.json(venda);
  } catch (error) {
    console.error('❌ Erro ao buscar venda:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
};

// Criar nova venda
const createVenda = async (req, res) => {
  const client = await pool.connect();
  
  try {
    await client.query('BEGIN');
    
    const { id, data_venda, afiliado_id, produtos, observacoes, tipo } = req.body;

    console.log('💰 Criando venda:', { id, afiliado_id, produtos: produtos?.length });

    if (!id || !produtos || produtos.length === 0) {
      return res.status(400).json({ error: 'ID e produtos são obrigatórios' });
    }

    // Calcular total
    let total = 0;
    for (const item of produtos) {
      total += item.preco_unitario * item.quantidade;
    }

    // Inserir venda
    const vendaResult = await client.query(`
      INSERT INTO vendas (id, data_venda, total, afiliado_id, observacoes, tipo)
      VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING *
    `, [id, data_venda || new Date(), total, afiliado_id, observacoes || '', tipo || 'online']);

    // Inserir itens da venda
    for (const item of produtos) {
      const { produto_id, kit_id, conjunto_id, quantidade, preco_unitario } = item;
      
      if (!quantidade || quantidade <= 0) {
        throw new Error('Quantidade deve ser maior que zero');
      }

      const subtotal = preco_unitario * quantidade;

      await client.query(`
        INSERT INTO venda_itens (venda_id, produto_id, kit_id, conjunto_id, quantidade, preco_unitario, subtotal)
        VALUES ($1, $2, $3, $4, $5, $6, $7)
      `, [id, produto_id, kit_id, conjunto_id, quantidade, preco_unitario, subtotal]);
    }

    await client.query('COMMIT');
    
    console.log('✅ Venda criada:', vendaResult.rows[0].id);
    res.status(201).json(vendaResult.rows[0]);
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('❌ Erro ao criar venda:', error);
    if (error.code === '23505') {
      return res.status(400).json({ error: 'Venda com este ID já existe' });
    }
    res.status(500).json({ error: error.message || 'Erro interno do servidor' });
  } finally {
    client.release();
  }
};

// Atualizar venda
const updateVenda = async (req, res) => {
  const client = await pool.connect();
  
  try {
    await client.query('BEGIN');
    
    const { id } = req.params;
    const { data_venda, afiliado_id, produtos, observacoes, status, tipo } = req.body;

    console.log('💰 Atualizando venda:', id);

    // Calcular novo total se produtos foram fornecidos
    let total = 0;
    if (produtos) {
      for (const item of produtos) {
        total += item.preco_unitario * item.quantidade;
      }
    }

    // Atualizar venda
    const vendaResult = await client.query(`
      UPDATE vendas 
      SET data_venda = $1, afiliado_id = $2, observacoes = $3, status = $4, total = $5, tipo = $6, updated_at = CURRENT_TIMESTAMP
      WHERE id = $7
      RETURNING *
    `, [data_venda, afiliado_id, observacoes, status, total, tipo, id]);

    if (vendaResult.rows.length === 0) {
      console.log('❌ Venda não encontrada para atualização:', id);
      return res.status(404).json({ error: 'Venda não encontrada' });
    }

    // Se produtos foram fornecidos, atualizar
    if (produtos) {
      // Deletar itens existentes
      await client.query('DELETE FROM venda_itens WHERE venda_id = $1', [id]);

      // Inserir novos itens
      for (const item of produtos) {
        const { produto_id, kit_id, conjunto_id, quantidade, preco_unitario } = item;
        
        if (!quantidade || quantidade <= 0) {
          throw new Error('Quantidade deve ser maior que zero');
        }

        const subtotal = preco_unitario * quantidade;

        await client.query(`
          INSERT INTO venda_itens (venda_id, produto_id, kit_id, conjunto_id, quantidade, preco_unitario, subtotal)
          VALUES ($1, $2, $3, $4, $5, $6, $7)
        `, [id, produto_id, kit_id, conjunto_id, quantidade, preco_unitario, subtotal]);
      }
    }

    await client.query('COMMIT');
    
    console.log('✅ Venda atualizada:', vendaResult.rows[0].id);
    res.json(vendaResult.rows[0]);
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('❌ Erro ao atualizar venda:', error);
    res.status(500).json({ error: error.message || 'Erro interno do servidor' });
  } finally {
    client.release();
  }
};

// Deletar venda
const deleteVenda = async (req, res) => {
  const client = await pool.connect();
  
  try {
    await client.query('BEGIN');
    
    const { id } = req.params;
    console.log('💰 Deletando venda:', id);

    // Deletar itens da venda
    await client.query('DELETE FROM venda_itens WHERE venda_id = $1', [id]);

    // Deletar venda
    const result = await client.query('DELETE FROM vendas WHERE id = $1 RETURNING *', [id]);

    if (result.rows.length === 0) {
      console.log('❌ Venda não encontrada para deleção:', id);
      return res.status(404).json({ error: 'Venda não encontrada' });
    }

    await client.query('COMMIT');
    
    console.log('✅ Venda deletada:', result.rows[0].id);
    res.json({ message: 'Venda deletada com sucesso' });
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('❌ Erro ao deletar venda:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  } finally {
    client.release();
  }
};

// Buscar vendas por período
const getVendasPorPeriodo = async (req, res) => {
  try {
    const { data_inicio, data_fim } = req.query;
    console.log('💰 Buscando vendas por período:', { data_inicio, data_fim });

    let query = `
      SELECT 
        v.*,
        a.nome_completo as afiliado_nome
      FROM vendas v
      LEFT JOIN afiliados a ON v.afiliado_id = a.id
    `;
    
    const params = [];
    const conditions = [];

    if (data_inicio) {
      conditions.push(`v.data_venda >= $${params.length + 1}`);
      params.push(data_inicio);
    }

    if (data_fim) {
      conditions.push(`v.data_venda <= $${params.length + 1}`);
      params.push(data_fim);
    }

    if (conditions.length > 0) {
      query += ` WHERE ${conditions.join(' AND ')}`;
    }

    query += ` ORDER BY v.data_venda DESC`;

    const result = await pool.query(query, params);

    console.log(`✅ ${result.rows.length} vendas encontradas no período`);
    res.json(result.rows);
  } catch (error) {
    console.error('❌ Erro ao buscar vendas por período:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
};

module.exports = {
  getAllVendas,
  getVendaById,
  createVenda,
  updateVenda,
  deleteVenda,
  getVendasPorPeriodo
};
