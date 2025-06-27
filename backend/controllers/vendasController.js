
const pool = require('../config/database');

// Listar todas as vendas
const getAllVendas = async (req, res) => {
  try {
    console.log('💰 Buscando todas as vendas...');
    
    const result = await pool.query(`
      SELECT 
        v.*,
        a.nome_completo as afiliado_nome,
        a.email as afiliado_email,
        COUNT(vp.id) as total_itens
      FROM vendas v
      LEFT JOIN afiliados a ON v.afiliado_id = a.id
      LEFT JOIN venda_produtos vp ON v.id = vp.venda_id
      GROUP BY v.id, a.nome_completo, a.email
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
        a.email as afiliado_email,
        a.comissao as afiliado_comissao
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
        p.nome as produto_nome,
        p.descricao as produto_descricao
      FROM venda_produtos vp
      LEFT JOIN produtos p ON vp.produto_id = p.id
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
    
    const {
      id,
      afiliado_id,
      tipo_venda,
      valor_total,
      observacoes,
      produtos
    } = req.body;

    console.log('💰 Criando venda:', { id, afiliado_id, valor_total, produtos: produtos?.length });

    if (!id || !produtos || produtos.length === 0) {
      return res.status(400).json({ error: 'ID e produtos são obrigatórios' });
    }

    // Validar afiliado se fornecido
    if (afiliado_id) {
      const afiliadoExists = await client.query(
        'SELECT id FROM afiliados WHERE id = $1 AND ativo = true',
        [afiliado_id]
      );
      
      if (afiliadoExists.rows.length === 0) {
        return res.status(400).json({ error: 'Afiliado não encontrado ou inativo' });
      }
    }

    // Inserir venda
    const vendaResult = await client.query(`
      INSERT INTO vendas (
        id, afiliado_id, tipo_venda, valor_total, observacoes, data_venda
      )
      VALUES ($1, $2, $3, $4, $5, CURRENT_TIMESTAMP)
      RETURNING *
    `, [id, afiliado_id, tipo_venda || 'online', valor_total || 0, observacoes || '']);

    // Inserir produtos da venda
    for (const produto of produtos) {
      const { produto_id, conjunto_id, kit_id, quantidade, preco_unitario } = produto;
      
      if (!quantidade || quantidade <= 0) {
        throw new Error('Quantidade deve ser maior que zero');
      }

      await client.query(`
        INSERT INTO venda_produtos (
          venda_id, produto_id, conjunto_id, kit_id, quantidade, preco_unitario
        )
        VALUES ($1, $2, $3, $4, $5, $6)
      `, [id, produto_id, conjunto_id, kit_id, quantidade, preco_unitario || 0]);

      // Atualizar estoque se for produto individual
      if (produto_id) {
        await client.query(`
          UPDATE produtos 
          SET estoque_site = GREATEST(0, estoque_site - $1)
          WHERE id = $2
        `, [quantidade, produto_id]);
      }
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
  try {
    const { id } = req.params;
    const { afiliado_id, tipo_venda, valor_total, observacoes } = req.body;

    console.log('💰 Atualizando venda:', id);

    // Validar afiliado se fornecido
    if (afiliado_id) {
      const afiliadoExists = await pool.query(
        'SELECT id FROM afiliados WHERE id = $1 AND ativo = true',
        [afiliado_id]
      );
      
      if (afiliadoExists.rows.length === 0) {
        return res.status(400).json({ error: 'Afiliado não encontrado ou inativo' });
      }
    }

    const result = await pool.query(`
      UPDATE vendas 
      SET 
        afiliado_id = $1, 
        tipo_venda = $2, 
        valor_total = $3, 
        observacoes = $4,
        updated_at = CURRENT_TIMESTAMP
      WHERE id = $5
      RETURNING *
    `, [afiliado_id, tipo_venda, valor_total, observacoes, id]);

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
  const client = await pool.connect();
  
  try {
    await client.query('BEGIN');
    
    const { id } = req.params;
    console.log('💰 Deletando venda:', id);

    // Buscar produtos da venda para reverter estoque
    const produtosResult = await client.query(
      'SELECT produto_id, quantidade FROM venda_produtos WHERE venda_id = $1 AND produto_id IS NOT NULL',
      [id]
    );

    // Reverter estoque
    for (const item of produtosResult.rows) {
      await client.query(`
        UPDATE produtos 
        SET estoque_site = estoque_site + $1
        WHERE id = $2
      `, [item.quantidade, item.produto_id]);
    }

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

    query += ` GROUP BY v.id, a.nome_completo ORDER BY v.data_venda DESC`;

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
