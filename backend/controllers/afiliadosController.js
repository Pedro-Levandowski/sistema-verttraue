
const pool = require('../config/database');

// Listar todos os afiliados
const getAllAfiliados = async (req, res) => {
  try {
    console.log('👥 Buscando todos os afiliados...');
    
    const result = await pool.query(`
      SELECT 
        a.*,
        COUNT(ae.produto_id) as total_produtos_estoque
      FROM afiliados a
      LEFT JOIN afiliado_estoque ae ON a.id = ae.afiliado_id
      GROUP BY a.id, a.nome_completo, a.email, a.telefone, a.comissao, 
               a.chave_pix, a.tipo_chave_pix, a.ativo, a.created_at, a.updated_at
      ORDER BY a.created_at DESC
    `);

    console.log(`✅ ${result.rows.length} afiliados encontrados`);
    res.json(result.rows);
  } catch (error) {
    console.error('❌ Erro ao buscar afiliados:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
};

// Buscar afiliado por ID
const getAfiliadoById = async (req, res) => {
  try {
    const { id } = req.params;
    console.log('👥 Buscando afiliado:', id);

    const result = await pool.query('SELECT * FROM afiliados WHERE id = $1', [id]);

    if (result.rows.length === 0) {
      console.log('❌ Afiliado não encontrado:', id);
      return res.status(404).json({ error: 'Afiliado não encontrado' });
    }

    console.log('✅ Afiliado encontrado:', result.rows[0].nome_completo);
    res.json(result.rows[0]);
  } catch (error) {
    console.error('❌ Erro ao buscar afiliado:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
};

// Criar novo afiliado
const createAfiliado = async (req, res) => {
  try {
    const { 
      id, 
      nome_completo, 
      email, 
      telefone, 
      comissao, 
      chave_pix, 
      tipo_chave_pix, 
      ativo 
    } = req.body;

    console.log('👥 Criando afiliado:', { id, nome_completo, email });

    if (!id || !nome_completo || !email) {
      return res.status(400).json({ error: 'ID, nome completo e email são obrigatórios' });
    }

    // Validar tipo de chave PIX
    const tiposValidos = ['aleatoria', 'cpf', 'telefone', 'email'];
    if (tipo_chave_pix && !tiposValidos.includes(tipo_chave_pix)) {
      return res.status(400).json({ error: 'Tipo de chave PIX inválido' });
    }

    const result = await pool.query(`
      INSERT INTO afiliados (
        id, nome_completo, email, telefone, comissao, 
        chave_pix, tipo_chave_pix, ativo
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      RETURNING *
    `, [
      id, 
      nome_completo, 
      email, 
      telefone || '', 
      comissao || 0, 
      chave_pix || '', 
      tipo_chave_pix || 'aleatoria', 
      ativo !== false
    ]);

    console.log('✅ Afiliado criado:', result.rows[0].nome_completo);
    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('❌ Erro ao criar afiliado:', error);
    if (error.code === '23505') {
      return res.status(400).json({ error: 'Afiliado com este ID ou email já existe' });
    }
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
};

// Atualizar afiliado
const updateAfiliado = async (req, res) => {
  try {
    const { id } = req.params;
    const { 
      nome_completo, 
      email, 
      telefone, 
      comissao, 
      chave_pix, 
      tipo_chave_pix, 
      ativo 
    } = req.body;

    console.log('👥 Atualizando afiliado:', id);

    if (!nome_completo || !email) {
      return res.status(400).json({ error: 'Nome completo e email são obrigatórios' });
    }

    // Validar tipo de chave PIX
    const tiposValidos = ['aleatoria', 'cpf', 'telefone', 'email'];
    if (tipo_chave_pix && !tiposValidos.includes(tipo_chave_pix)) {
      return res.status(400).json({ error: 'Tipo de chave PIX inválido' });
    }

    const result = await pool.query(`
      UPDATE afiliados 
      SET 
        nome_completo = $1, 
        email = $2, 
        telefone = $3, 
        comissao = $4,
        chave_pix = $5, 
        tipo_chave_pix = $6, 
        ativo = $7, 
        updated_at = CURRENT_TIMESTAMP
      WHERE id = $8
      RETURNING *
    `, [
      nome_completo, 
      email, 
      telefone || '', 
      comissao || 0, 
      chave_pix || '', 
      tipo_chave_pix || 'aleatoria', 
      ativo !== false, 
      id
    ]);

    if (result.rows.length === 0) {
      console.log('❌ Afiliado não encontrado para atualização:', id);
      return res.status(404).json({ error: 'Afiliado não encontrado' });
    }

    console.log('✅ Afiliado atualizado:', result.rows[0].nome_completo);
    res.json(result.rows[0]);
  } catch (error) {
    console.error('❌ Erro ao atualizar afiliado:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
};

// Deletar afiliado
const deleteAfiliado = async (req, res) => {
  try {
    const { id } = req.params;
    console.log('👥 Deletando afiliado:', id);
    
    // Verificar se há vendas vinculadas
    const vendasResult = await pool.query(
      'SELECT COUNT(*) FROM vendas WHERE afiliado_id = $1', 
      [id]
    );
    const totalVendas = parseInt(vendasResult.rows[0].count);

    if (totalVendas > 0) {
      console.log(`❌ Afiliado tem ${totalVendas} vendas vinculadas`);
      return res.status(400).json({ 
        error: `Não é possível deletar o afiliado. Existem ${totalVendas} venda(s) vinculada(s) a ele.` 
      });
    }

    // Deletar estoque do afiliado primeiro
    await pool.query('DELETE FROM afiliado_estoque WHERE afiliado_id = $1', [id]);

    const result = await pool.query('DELETE FROM afiliados WHERE id = $1 RETURNING *', [id]);

    if (result.rows.length === 0) {
      console.log('❌ Afiliado não encontrado para deleção:', id);
      return res.status(404).json({ error: 'Afiliado não encontrado' });
    }

    console.log('✅ Afiliado deletado:', result.rows[0].nome_completo);
    res.json({ message: 'Afiliado deletado com sucesso' });
  } catch (error) {
    console.error('❌ Erro ao deletar afiliado:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
};

// Buscar estoque de um afiliado
const getEstoqueAfiliado = async (req, res) => {
  try {
    const { id } = req.params;
    console.log('👥 Buscando estoque do afiliado:', id);

    const result = await pool.query(`
      SELECT 
        ae.*,
        p.nome as produto_nome,
        p.preco as produto_preco
      FROM afiliado_estoque ae
      JOIN produtos p ON ae.produto_id = p.id
      WHERE ae.afiliado_id = $1
      ORDER BY p.nome
    `, [id]);

    console.log(`✅ ${result.rows.length} produtos no estoque do afiliado ${id}`);
    res.json(result.rows);
  } catch (error) {
    console.error('❌ Erro ao buscar estoque do afiliado:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
};

module.exports = {
  getAllAfiliados,
  getAfiliadoById,
  createAfiliado,
  updateAfiliado,
  deleteAfiliado,
  getEstoqueAfiliado
};
