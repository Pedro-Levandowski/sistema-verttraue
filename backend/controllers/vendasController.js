
const pool = require('../config/database');

// Listar todas as vendas
const getAllVendas = async (req, res) => {
  try {
    console.log('💰 Buscando todas as vendas...');
    
    const result = await pool.query(`
      SELECT 
        v.*,
        a.nome_completo as afiliado_nome,
        COUNT(vp.id) as total_itens
      FROM vendas v
      LEFT JOIN afiliados a ON v.afiliado_id = a.id
      LEFT JOIN venda_produtos vp ON v.id = vp.venda_id
      GROUP BY v.id, v.data_venda, v.total, v.status, v.afiliado_id, v.observacoes, v.created_at, v.updated_at, a.nome_completo
      ORDER BY v.created_at DESC
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

    // Buscar produtos da venda
    const produtosResult = await pool.query(`
      SELECT 
        vp.*,
        CASE 
          WHEN vp.produto_id IS NOT NULL THEN p.nome
          WHEN vp.kit_id IS NOT NULL THEN k.nome
          WHEN vp.conjunto_id IS NOT NULL THEN c.nome
        END as item_nome,
        CASE 
          WHEN vp.produto_id IS NOT NULL THEN 'produto'
          WHEN vp.kit_id IS NOT NULL THEN 'kit'
          WHEN vp.conjunto_id IS NOT NULL THEN 'conjunto'
        END as item_tipo
      FROM venda_produtos vp
      LEFT JOIN produtos p ON vp.produto_id = p.id
      LEFT JOIN kits k ON vp.kit_id = k.id
      LEFT JOIN conjuntos c ON vp.conjunto_id = c.id
      WHERE vp.venda_id = $1
      ORDER BY vp.id
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
    
    const { id, data_venda, afiliado_id, produtos, observacoes } = req.body;

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
      INSERT INTO vendas (id, data_venda, total, afiliado_id, observacoes, status)
      VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING *
    `, [id, data_venda || new Date(), total, afiliado_id, observacoes || '', 'pendente']);

    // Inserir produtos da venda
    for (const item of produtos) {
      const { produto_id, kit_id, conjunto_id, quantidade, preco_unitario } = item;
      
      if (!quantidade || quantidade <= 0) {
        throw new Error('Quantidade deve ser maior que zero');
      }

      await client.query(`
        INSERT INTO venda_produtos (venda_id, produto_id, kit_id, conjunto_id, quantidade, preco_unitario)
        VALUES ($1, $2, $3, $4, $5, $6)
      `, [id, produto_id, kit_id, conjunto_id, quantidade, preco_unitario]);
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
    const { data_venda, afiliado_id, produtos, observacoes, status } = req.body;

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
      SET data_venda = $1, afiliado_id = $2, observacoes = $3, status = $4, total = $5, updated_at = CURRENT_TIMESTAMP
      WHERE id = $6
      RETURNING *
    `, [data_venda, afiliado_id, observacoes, status, total, id]);

    if (vendaResult.rows.length === 0) {
      console.log('❌ Venda não encontrada para atualização:', id);
      return res.status(404).json({ error: 'Venda não encontrada' });
    }

    // Se produtos foram fornecidos, atualizar
    if (produtos) {
      // Deletar produtos existentes
      await client.query('DELETE FROM venda_produtos WHERE venda_id = $1', [id]);

      // Inserir novos produtos
      for (const item of produtos) {
        const { produto_id, kit_id, conjunto_id, quantidade, preco_unitario } = item;
        
        if (!quantidade || quantidade <= 0) {
          throw new Error('Quantidade deve ser maior que zero');
        }

        await client.query(`
          INSERT INTO venda_produtos (venda_id, produto_id, kit_id, conjunto_id, quantidade, preco_unitario)
          VALUES ($1, $2, $3, $4, $5, $6)
        `, [id, produto_id, kit_id, conjunto_id, quantidade, preco_unitario]);
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

    // Deletar produtos da venda
    await client.query('DELETE FROM venda_produtos WHERE venda_id = $1', [id]);

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
        a.nome_completo as afiliado_nome,
        COUNT(vp.id) as total_itens
      FROM vendas v
      LEFT JOIN afiliados a ON v.afiliado_id = a.id
      LEFT JOIN venda_produtos vp ON v.id = vp.venda_id
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

    query += `
      GROUP BY v.id, v.data_venda, v.total, v.status, v.afiliado_id, v.observacoes, v.created_at, v.updated_at, a.nome_completo
      ORDER BY v.data_venda DESC
    `;

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
