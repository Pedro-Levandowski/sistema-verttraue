
const pool = require('../config/database');

// Atualizar estoque de afiliado
const updateEstoqueAfiliado = async (req, res) => {
  try {
    const { produto_id, afiliado_id, quantidade } = req.body;
    
    console.log('📦 Atualizando estoque afiliado:', { produto_id, afiliado_id, quantidade });

    if (!produto_id || !afiliado_id || quantidade === undefined) {
      return res.status(400).json({ error: 'produto_id, afiliado_id e quantidade são obrigatórios' });
    }

    // Verificar se produto existe
    const produtoExists = await pool.query('SELECT id FROM produtos WHERE id = $1', [produto_id]);
    if (produtoExists.rows.length === 0) {
      return res.status(404).json({ error: 'Produto não encontrado' });
    }

    // Verificar se afiliado existe
    const afiliadoExists = await pool.query('SELECT id FROM afiliados WHERE id = $1', [afiliado_id]);
    if (afiliadoExists.rows.length === 0) {
      return res.status(404).json({ error: 'Afiliado não encontrado' });
    }

    // Verificar se já existe estoque para este produto/afiliado
    const existingStock = await pool.query(
      'SELECT * FROM afiliado_estoque WHERE produto_id = $1 AND afiliado_id = $2',
      [produto_id, afiliado_id]
    );

    let result;
    
    if (existingStock.rows.length > 0) {
      // Atualizar estoque existente
      if (quantidade === 0) {
        // Se quantidade for 0, deletar o registro
        result = await pool.query(
          'DELETE FROM afiliado_estoque WHERE produto_id = $1 AND afiliado_id = $2 RETURNING *',
          [produto_id, afiliado_id]
        );
        console.log('✅ Estoque removido do afiliado');
      } else {
        // Atualizar quantidade
        result = await pool.query(
          'UPDATE afiliado_estoque SET quantidade = $1, updated_at = CURRENT_TIMESTAMP WHERE produto_id = $2 AND afiliado_id = $3 RETURNING *',
          [quantidade, produto_id, afiliado_id]
        );
        console.log('✅ Estoque atualizado para afiliado');
      }
    } else {
      // Criar novo estoque (apenas se quantidade > 0)
      if (quantidade > 0) {
        result = await pool.query(
          'INSERT INTO afiliado_estoque (produto_id, afiliado_id, quantidade) VALUES ($1, $2, $3) RETURNING *',
          [produto_id, afiliado_id, quantidade]
        );
        console.log('✅ Novo estoque criado para afiliado');
      } else {
        return res.json({ message: 'Nenhuma ação necessária' });
      }
    }

    res.json(result.rows[0] || { message: 'Estoque atualizado com sucesso' });
  } catch (error) {
    console.error('❌ Erro ao atualizar estoque afiliado:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
};

// Buscar estoque por afiliado
const getEstoquePorAfiliado = async (req, res) => {
  try {
    const { afiliado_id } = req.params;
    
    console.log('📦 Buscando estoque do afiliado:', afiliado_id);

    const result = await pool.query(`
      SELECT 
        ae.*,
        p.nome as produto_nome,
        p.preco as produto_preco,
        p.preco_compra as produto_preco_compra
      FROM afiliado_estoque ae
      JOIN produtos p ON ae.produto_id = p.id
      WHERE ae.afiliado_id = $1
      ORDER BY p.nome
    `, [afiliado_id]);

    console.log(`✅ ${result.rows.length} produtos encontrados no estoque do afiliado`);
    res.json(result.rows);
  } catch (error) {
    console.error('❌ Erro ao buscar estoque do afiliado:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
};

module.exports = {
  updateEstoqueAfiliado,
  getEstoquePorAfiliado
};
