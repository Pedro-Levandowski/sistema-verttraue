
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

    // Buscar produtos de cada venda (usando nome correto da tabela)
    const vendas =[];
    for (const venda of result.rows) {
      const produtosResult = await pool.query(`
        SELECT 
          vi.*,
          p.nome as produto_nome,
          c.nome as conjunto_nome,
          k.nome as kit_nome
        FROM venda_itens vi
        LEFT JOIN produtos p ON vi.produto_id = p.id
        LEFT JOIN conjuntos c ON vi.conjunto_id = c.id
        LEFT JOIN kits k ON vi.kit_id = k.id
        WHERE vi.venda_id = $1
      `, [venda.id]);

      vendas.push({
        id: venda.id,
        data_venda: venda.data_venda,
        afiliado_id: venda.afiliado_id,
        afiliado_nome: venda.afiliado_nome,
        valor_total: parseFloat(venda.total) || 0,
        tipo_venda: venda.tipo || 'online',
        observacoes: venda.observacoes || '',
        produtos: produtosResult.rows
      });
    }

    console.log(`✅ ${vendas.length} vendas encontradas`);
    res.json(vendas);
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

    const result = await pool.query(`
      SELECT 
        v.*,
        a.nome_completo as afiliado_nome
      FROM vendas v
      LEFT JOIN afiliados a ON v.afiliado_id = a.id
      WHERE v.id = $1
    `, [id]);

    if (result.rows.length === 0) {
      console.log('❌ Venda não encontrada:', id);
      return res.status(404).json({ error: 'Venda não encontrada' });
    }

    // Buscar produtos da venda (usando nome correto da tabela)
    const produtosResult = await pool.query(`
      SELECT 
        vi.*,
        p.nome as produto_nome,
        c.nome as conjunto_nome,
        k.nome as kit_nome
      FROM venda_itens vi
      LEFT JOIN produtos p ON vi.produto_id = p.id
      LEFT JOIN conjuntos c ON vi.conjunto_id = c.id
      LEFT JOIN kits k ON vi.kit_id = k.id
      WHERE vi.venda_id = $1
    `, [id]);

    const venda = {
      id: result.rows[0].id,
      data_venda: result.rows[0].data_venda,
      afiliado_id: result.rows[0].afiliado_id,
      afiliado_nome: result.rows[0].afiliado_nome,
      valor_total: parseFloat(result.rows[0].total) || 0,
      tipo_venda: result.rows[0].tipo || 'online',
      observacoes: result.rows[0].observacoes || '',
      produtos: produtosResult.rows
    };

    console.log('✅ Venda encontrada');
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
      data_venda,
      produtos
    } = req.body;

    console.log('💰 Criando venda:', { id, tipo_venda, valor_total, produtos_count: produtos?.length });

    // Usar ID fornecido ou gerar um novo
    const vendaId = id || `VENDA-${Date.now()}`;

    if (!produtos || produtos.length === 0) {
      return res.status(400).json({ error: 'Produtos são obrigatórios' });
    }

    // Inserir venda (usando campos corretos do schema)
    const vendaResult = await client.query(`
      INSERT INTO vendas (
        id, afiliado_id, tipo, total, data_venda
      )
      VALUES ($1, $2, $3, $4, $5)
      RETURNING *
    `, [
      vendaId,
      afiliado_id,
      tipo_venda || 'online',
      valor_total || 0,
      data_venda || new Date().toISOString().split('T')[0]
    ]);

    // Inserir produtos da venda (usando nome correto da tabela)
    for (const produto of produtos) {
      const {
        produto_id,
        conjunto_id,
        kit_id,
        quantidade,
        preco_unitario,
        subtotal
      } = produto;

      await client.query(`
        INSERT INTO venda_itens (
          venda_id, produto_id, conjunto_id, kit_id,
          quantidade, preco_unitario, subtotal
        )
        VALUES ($1, $2, $3, $4, $5, $6, $7)
      `, [
        vendaId,
        produto_id || null,
        conjunto_id || null,
        kit_id || null,
        quantidade || 1,
        preco_unitario || 0,
        subtotal || 0
      ]);

      // Atualizar estoque se for produto individual
      if (produto_id) {
        await client.query(`
          UPDATE produtos 
          SET estoque_site = GREATEST(0, estoque_site - $1)
          WHERE id = $2
        `, [quantidade || 1, produto_id]);
      }
    }

    await client.query('COMMIT');
    
    console.log('✅ Venda criada:', vendaResult.rows[0].id);
    res.status(201).json(vendaResult.rows[0]);
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('❌ Erro ao criar venda:', error);
    res.status(500).json({ error: error.message || 'Erro interno do servidor' });
  } finally {
    client.release();
  }
};

// Atualizar venda
const updateVenda = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      afiliado_id,
      tipo_venda,
      valor_total,
      observacoes,
      data_venda
    } = req.body;

    console.log('💰 Atualizando venda:', id);

    const result = await pool.query(`
      UPDATE vendas 
      SET 
        afiliado_id = $1,
        tipo_venda = $2,
        valor_total = $3,
        observacoes = $4,
        data_venda = $5,
        updated_at = CURRENT_TIMESTAMP
      WHERE id = $6
      RETURNING *
    `, [
      afiliado_id,
      tipo_venda || 'online',
      valor_total || 0,
      observacoes || '',
      data_venda || new Date().toISOString().split('T')[0],
      id
    ]);

    if (result.rows.length === 0) {
      console.log('❌ Venda não encontrada para atualização:', id);
      return res.status(404).json({ error: 'Venda não encontrada' });
    }

    console.log('✅ Venda atualizada');
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

    // Deletar produtos da venda primeiro (usando nome correto da tabela)
    await client.query('DELETE FROM venda_itens WHERE venda_id = $1', [id]);

    // Deletar venda
    const result = await client.query('DELETE FROM vendas WHERE id = $1 RETURNING *', [id]);

    if (result.rows.length === 0) {
      console.log('❌ Venda não encontrada para deleção:', id);
      return res.status(404).json({ error: 'Venda não encontrada' });
    }

    await client.query('COMMIT');
    
    console.log('✅ Venda deletada');
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
