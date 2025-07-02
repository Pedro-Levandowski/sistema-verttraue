const pool = require('../config/database');

// Listar todas as vendas - versão robusta
const getVendas = async (req, res) => {
  console.log('📊 [VendasController] === BUSCANDO VENDAS ===');
  
  try {
    // Teste de conexão
    console.log('🔍 [VendasController] Testando conexão com banco...');
    await pool.query('SELECT 1 as test');
    console.log('✅ [VendasController] Conexão com banco OK');

    // Verificar se tabela vendas existe
    console.log('🔍 [VendasController] Verificando se tabela vendas existe...');
    const tableExistsQuery = `
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'vendas'
      ) as exists;
    `;
    
    const tableResult = await pool.query(tableExistsQuery);
    console.log('🔍 [VendasController] Resultado verificação tabela:', tableResult.rows[0]);
    
    if (!tableResult.rows[0].exists) {
      console.log('⚠️ [VendasController] Tabela vendas não existe, retornando array vazio');
      return res.json([]);
    }

    // Contar registros primeiro
    console.log('🔍 [VendasController] Contando vendas...');
    const countResult = await pool.query('SELECT COUNT(*) as total FROM vendas');
    const total = parseInt(countResult.rows[0].total);
    console.log(`📊 [VendasController] Total de vendas no banco: ${total}`);

    // Buscar vendas básicas
    console.log('🔍 [VendasController] Buscando vendas...');
    const vendasQuery = `
      SELECT 
        v.id,
        v.data_venda,
        v.valor_total,
        v.observacoes,
        v.created_at,
        v.afiliado_id,
        a.nome as afiliado_nome,
        a.email as afiliado_email
      FROM vendas v
      LEFT JOIN afiliados a ON v.afiliado_id = a.id
      ORDER BY v.created_at DESC 
      LIMIT 100
    `;
    
    const vendasResult = await pool.query(vendasQuery);
    console.log(`✅ [VendasController] ${vendasResult.rows.length} vendas encontradas`);
    
    // Processar dados
    const vendas = vendasResult.rows.map(venda => ({
      id: venda.id,
      data_venda: venda.data_venda,
      valor_total: parseFloat(venda.valor_total) || 0,
      observacoes: venda.observacoes,
      created_at: venda.created_at,
      afiliado_id: venda.afiliado_id,
      afiliado_nome: venda.afiliado_nome,
      afiliado_email: venda.afiliado_email,
      itens: [] // Por enquanto vazio para simplicidade
    }));
    
    console.log('✅ [VendasController] Retornando vendas processadas');
    console.log('📤 [VendasController] Amostra de dados:', vendas.slice(0, 2));
    
    res.json(vendas);
    
  } catch (error) {
    console.error('❌ [VendasController] === ERRO COMPLETO ===');
    console.error('❌ [VendasController] Tipo do erro:', typeof error);
    console.error('❌ [VendasController] Erro:', error);
    console.error('❌ [VendasController] Message:', error.message);
    console.error('❌ [VendasController] Code:', error.code);
    console.error('❌ [VendasController] Stack:', error.stack);
    
    // Resposta de erro detalhada
    const errorResponse = {
      error: 'Erro ao buscar vendas',
      details: error.message || 'Erro interno do servidor',
      code: error.code || 'UNKNOWN',
      timestamp: new Date().toISOString()
    };
    
    console.error('📤 [VendasController] Enviando erro:', errorResponse);
    res.status(500).json(errorResponse);
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
