
const pool = require('../config/database');

// Listar todas as vendas
const getVendas = async (req, res) => {
  try {
    console.log('🔍 === BUSCANDO VENDAS ===');
    
    const query = `
      SELECT 
        v.id,
        v.data_venda,
        v.valor_total,
        v.observacoes,
        v.created_at,
        a.nome as afiliado_nome,
        a.email as afiliado_email
      FROM vendas v
      LEFT JOIN afiliados a ON v.afiliado_id = a.id
      ORDER BY v.data_venda DESC, v.created_at DESC
    `;
    
    const result = await pool.query(query);
    console.log(`✅ Encontradas ${result.rows.length} vendas`);
    
    res.json(result.rows);
  } catch (error) {
    console.error('❌ Erro ao buscar vendas:', error);
    res.status(500).json({ 
      error: 'Erro ao buscar vendas',
      details: error.message 
    });
  }
};

// Buscar venda por ID
const getVendaById = async (req, res) => {
  try {
    const { id } = req.params;
    console.log('🔍 Buscando venda ID:', id);
    
    const vendaQuery = `
      SELECT 
        v.*,
        a.nome as afiliado_nome,
        a.email as afiliado_email
      FROM vendas v
      LEFT JOIN afiliados a ON v.afiliado_id = a.id
      WHERE v.id = $1
    `;
    
    const vendaResult = await pool.query(vendaQuery, [id]);
    
    if (vendaResult.rows.length === 0) {
      return res.status(404).json({ error: 'Venda não encontrada' });
    }
    
    const venda = vendaResult.rows[0];
    
    // Buscar itens da venda
    const itensQuery = `
      SELECT 
        vi.*,
        p.nome as produto_nome,
        p.codigo as produto_codigo
      FROM venda_itens vi
      LEFT JOIN produtos p ON vi.produto_id = p.id
      WHERE vi.venda_id = $1
    `;
    
    const itensResult = await pool.query(itensQuery, [id]);
    venda.itens = itensResult.rows;
    
    console.log('✅ Venda encontrada');
    res.json(venda);
  } catch (error) {
    console.error('❌ Erro ao buscar venda:', error);
    res.status(500).json({
      error: 'Erro ao buscar venda',
      details: error.message
    });
  }
};

// Buscar vendas por período
const getVendasPorPeriodo = async (req, res) => {
  try {
    const { data_inicio, data_fim } = req.query;
    console.log('🔍 Buscando vendas por período:', { data_inicio, data_fim });
    
    let query = `
      SELECT 
        v.id,
        v.data_venda,
        v.valor_total,
        v.observacoes,
        v.created_at,
        a.nome as afiliado_nome,
        a.email as afiliado_email
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
    
    query += ` ORDER BY v.data_venda DESC, v.created_at DESC`;
    
    const result = await pool.query(query, params);
    console.log(`✅ Encontradas ${result.rows.length} vendas no período`);
    
    res.json(result.rows);
  } catch (error) {
    console.error('❌ Erro ao buscar vendas por período:', error);
    res.status(500).json({
      error: 'Erro ao buscar vendas por período',
      details: error.message
    });
  }
};

// Criar nova venda
const createVenda = async (req, res) => {
  const client = await pool.connect();
  
  try {
    await client.query('BEGIN');
    console.log('🆕 Criando nova venda...');
    
    const { afiliado_id, data_venda, valor_total, observacoes, itens } = req.body;
    
    // Inserir venda
    const vendaQuery = `
      INSERT INTO vendas (afiliado_id, data_venda, valor_total, observacoes)
      VALUES ($1, $2, $3, $4)
      RETURNING *
    `;
    
    const vendaResult = await client.query(vendaQuery, [
      afiliado_id,
      data_venda,
      valor_total,
      observacoes
    ]);
    
    const venda = vendaResult.rows[0];
    console.log('✅ Venda criada:', venda.id);
    
    // Inserir itens da venda
    if (itens && itens.length > 0) {
      for (const item of itens) {
        const itemQuery = `
          INSERT INTO venda_itens (venda_id, produto_id, quantidade, preco_unitario, subtotal)
          VALUES ($1, $2, $3, $4, $5)
        `;
        
        await client.query(itemQuery, [
          venda.id,
          item.produto_id,
          item.quantidade,
          item.preco_unitario,
          item.subtotal
        ]);
      }
      console.log(`✅ ${itens.length} itens adicionados à venda`);
    }
    
    await client.query('COMMIT');
    res.status(201).json(venda);
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('❌ Erro ao criar venda:', error);
    res.status(500).json({
      error: 'Erro ao criar venda',
      details: error.message
    });
  } finally {
    client.release();
  }
};

// Atualizar venda
const updateVenda = async (req, res) => {
  try {
    const { id } = req.params;
    const { afiliado_id, data_venda, valor_total, observacoes } = req.body;
    
    console.log('🔄 Atualizando venda:', id);
    
    const query = `
      UPDATE vendas 
      SET afiliado_id = $1, data_venda = $2, valor_total = $3, observacoes = $4
      WHERE id = $5
      RETURNING *
    `;
    
    const result = await pool.query(query, [
      afiliado_id,
      data_venda,
      valor_total,
      observacoes,
      id
    ]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Venda não encontrada' });
    }
    
    console.log('✅ Venda atualizada');
    res.json(result.rows[0]);
  } catch (error) {
    console.error('❌ Erro ao atualizar venda:', error);
    res.status(500).json({
      error: 'Erro ao atualizar venda',
      details: error.message
    });
  }
};

// Deletar venda
const deleteVenda = async (req, res) => {
  const client = await pool.connect();
  
  try {
    await client.query('BEGIN');
    const { id } = req.params;
    
    console.log('🗑️ Deletando venda:', id);
    
    // Deletar itens da venda primeiro
    await client.query('DELETE FROM venda_itens WHERE venda_id = $1', [id]);
    
    // Deletar venda
    const result = await client.query('DELETE FROM vendas WHERE id = $1 RETURNING *', [id]);
    
    if (result.rows.length === 0) {
      await client.query('ROLLBACK');
      return res.status(404).json({ error: 'Venda não encontrada' });
    }
    
    await client.query('COMMIT');
    console.log('✅ Venda deletada');
    res.json({ message: 'Venda deletada com sucesso' });
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('❌ Erro ao deletar venda:', error);
    res.status(500).json({
      error: 'Erro ao deletar venda',
      details: error.message
    });
  } finally {
    client.release();
  }
};

module.exports = {
  getVendas,
  getVendaById,
  getVendasPorPeriodo,
  createVenda,
  updateVenda,
  deleteVenda
};
