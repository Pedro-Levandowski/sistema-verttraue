
const pool = require('../config/database');

// Listar todas as vendas - versão simplificada
const getVendas = async (req, res) => {
  console.log('📊 [Controller] === BUSCANDO VENDAS (SIMPLIFICADO) ===');
  
  try {
    // Primeiro, verificar se conseguimos conectar no banco
    console.log('🔍 [Controller] Testando conexão com banco...');
    await pool.query('SELECT 1');
    console.log('✅ [Controller] Conexão com banco OK');

    // Verificar se tabela vendas existe
    console.log('🔍 [Controller] Verificando se tabela vendas existe...');
    const tableCheck = await pool.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_name = 'vendas'
      );
    `);
    
    if (!tableCheck.rows[0].exists) {
      console.log('⚠️ [Controller] Tabela vendas não existe, retornando array vazio');
      return res.json([]);
    }
    console.log('✅ [Controller] Tabela vendas existe');

    // Buscar vendas básicas primeiro
    console.log('🔍 [Controller] Buscando vendas básicas...');
    const basicQuery = `
      SELECT 
        id,
        data_venda,
        valor_total,
        observacoes,
        created_at,
        afiliado_id
      FROM vendas 
      ORDER BY created_at DESC 
      LIMIT 50
    `;
    
    const result = await pool.query(basicQuery);
    console.log(`✅ [Controller] ${result.rows.length} vendas encontradas`);
    
    // Retornar dados simples
    const vendas = result.rows.map(venda => ({
      ...venda,
      afiliado_nome: null, // Simplificado por enquanto
      afiliado_email: null,
      itens: [] // Simplificado por enquanto
    }));
    
    console.log('✅ [Controller] Retornando vendas processadas');
    res.json(vendas);
    
  } catch (error) {
    console.error('❌ [Controller] === ERRO COMPLETO ===');
    console.error('❌ [Controller] Erro:', error);
    console.error('❌ [Controller] Message:', error.message);
    console.error('❌ [Controller] Code:', error.code);
    console.error('❌ [Controller] Stack:', error.stack);
    
    // Resposta de erro mais clara
    res.status(500).json({ 
      error: 'Erro ao buscar vendas',
      details: error.message || 'Erro interno do servidor',
      code: error.code || 'UNKNOWN'
    });
  }
};

// Buscar venda por ID
const getVendaById = async (req, res) => {
  try {
    const { id } = req.params;
    console.log('🔍 [Controller] Buscando venda ID:', id);
    
    const vendaQuery = `
      SELECT * FROM vendas WHERE id = $1
    `;
    
    const vendaResult = await pool.query(vendaQuery, [id]);
    
    if (vendaResult.rows.length === 0) {
      return res.status(404).json({ error: 'Venda não encontrada' });
    }
    
    console.log('✅ [Controller] Venda encontrada');
    res.json(vendaResult.rows[0]);
  } catch (error) {
    console.error('❌ [Controller] Erro ao buscar venda:', error);
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
    console.log('🔍 [Controller] Buscando vendas por período:', { data_inicio, data_fim });
    
    let query = `SELECT * FROM vendas`;
    const params = [];
    const conditions = [];
    
    if (data_inicio) {
      conditions.push(`data_venda >= $${params.length + 1}`);
      params.push(data_inicio);
    }
    
    if (data_fim) {
      conditions.push(`data_venda <= $${params.length + 1}`);
      params.push(data_fim);
    }
    
    if (conditions.length > 0) {
      query += ` WHERE ${conditions.join(' AND ')}`;
    }
    
    query += ` ORDER BY data_venda DESC`;
    
    const result = await pool.query(query, params);
    console.log(`✅ [Controller] Encontradas ${result.rows.length} vendas no período`);
    
    res.json(result.rows);
  } catch (error) {
    console.error('❌ [Controller] Erro ao buscar vendas por período:', error);
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
    console.log('🆕 [Controller] Criando nova venda...');
    
    const { afiliado_id, data_venda, valor_total, observacoes, itens } = req.body;
    
    const vendaQuery = `
      INSERT INTO vendas (afiliado_id, data_venda, valor_total, observacoes)
      VALUES ($1, $2, $3, $4)
      RETURNING *
    `;
    
    const vendaResult = await client.query(vendaQuery, [
      afiliado_id || null,
      data_venda,
      valor_total,
      observacoes || null
    ]);
    
    const venda = vendaResult.rows[0];
    console.log('✅ [Controller] Venda criada:', venda.id);
    
    // Processar itens se existirem
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
      console.log(`✅ [Controller] ${itens.length} itens adicionados à venda`);
    }
    
    await client.query('COMMIT');
    res.status(201).json(venda);
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('❌ [Controller] Erro ao criar venda:', error);
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
    
    console.log('🔄 [Controller] Atualizando venda:', id);
    
    const query = `
      UPDATE vendas 
      SET afiliado_id = $1, data_venda = $2, valor_total = $3, observacoes = $4
      WHERE id = $5
      RETURNING *
    `;
    
    const result = await pool.query(query, [
      afiliado_id || null,
      data_venda,
      valor_total,
      observacoes || null,
      id
    ]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Venda não encontrada' });
    }
    
    console.log('✅ [Controller] Venda atualizada');
    res.json(result.rows[0]);
  } catch (error) {
    console.error('❌ [Controller] Erro ao atualizar venda:', error);
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
    
    console.log('🗑️ [Controller] Deletando venda:', id);
    
    // Deletar itens primeiro
    await client.query('DELETE FROM venda_itens WHERE venda_id = $1', [id]);
    
    // Deletar venda
    const result = await client.query('DELETE FROM vendas WHERE id = $1 RETURNING *', [id]);
    
    if (result.rows.length === 0) {
      await client.query('ROLLBACK');
      return res.status(404).json({ error: 'Venda não encontrada' });
    }
    
    await client.query('COMMIT');
    console.log('✅ [Controller] Venda deletada');
    res.json({ message: 'Venda deletada com sucesso' });
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('❌ [Controller] Erro ao deletar venda:', error);
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
  createVenda,
  updateVenda,
  deleteVenda,
  getVendasPorPeriodo
};
