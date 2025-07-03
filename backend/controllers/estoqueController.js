
const pool = require('../config/database');

// Atualizar estoque de afiliado
const updateEstoqueAfiliado = async (req, res) => {
  const client = await pool.connect();
  
  try {
    await client.query('BEGIN');
    
    const { produto_id, afiliado_id, quantidade } = req.body;
    
    console.log('📦 Atualizando estoque afiliado:', { produto_id, afiliado_id, quantidade });

    if (!produto_id || !afiliado_id || quantidade === undefined) {
      return res.status(400).json({ error: 'produto_id, afiliado_id e quantidade são obrigatórios' });
    }

    // Verificar se produto existe
    const produtoExists = await client.query('SELECT id, estoque_site FROM produtos WHERE id = $1', [produto_id]);
    if (produtoExists.rows.length === 0) {
      return res.status(404).json({ error: 'Produto não encontrado' });
    }

    const produto = produtoExists.rows[0];
    
    // Verificar se há estoque suficiente no site
    if (quantidade > produto.estoque_site) {
      return res.status(400).json({ error: 'Estoque insuficiente no site' });
    }

    // Verificar se afiliado existe
    const afiliadoExists = await client.query('SELECT id FROM afiliados WHERE id = $1', [afiliado_id]);
    if (afiliadoExists.rows.length === 0) {
      return res.status(404).json({ error: 'Afiliado não encontrado' });
    }

    // Verificar se já existe estoque para este produto/afiliado
    const existingStock = await client.query(
      'SELECT * FROM afiliado_estoque WHERE produto_id = $1 AND afiliado_id = $2',
      [produto_id, afiliado_id]
    );

    let result;
    
    if (existingStock.rows.length > 0) {
      // Atualizar estoque existente
      if (quantidade === 0) {
        // Se quantidade for 0, deletar o registro e devolver produtos ao estoque site
        const quantidadeAnterior = existingStock.rows[0].quantidade;
        
        result = await client.query(
          'DELETE FROM afiliado_estoque WHERE produto_id = $1 AND afiliado_id = $2 RETURNING *',
          [produto_id, afiliado_id]
        );
        
        // CORREÇÃO: Devolver produtos ao estoque site e reduzir do físico
        await client.query(
          'UPDATE produtos SET estoque_site = estoque_site + $1, estoque_fisico = estoque_fisico - $1 WHERE id = $2',
          [quantidadeAnterior, produto_id]
        );
        
        console.log('✅ Estoque removido do afiliado e devolvido ao site');
      } else {
        // Calcular diferença para ajustar estoques
        const quantidadeAnterior = existingStock.rows[0].quantidade;
        const diferenca = quantidade - quantidadeAnterior;
        
        // Verificar se há estoque suficiente para a diferença
        if (diferenca > 0 && diferenca > produto.estoque_site) {
          return res.status(400).json({ error: 'Estoque insuficiente no site para esta atualização' });
        }
        
        // Atualizar quantidade
        result = await client.query(
          'UPDATE afiliado_estoque SET quantidade = $1, updated_at = CURRENT_TIMESTAMP WHERE produto_id = $2 AND afiliado_id = $3 RETURNING *',
          [quantidade, produto_id, afiliado_id]
        );
        
        // CORREÇÃO: Ajustar estoques na direção correta
        if (diferenca !== 0) {
          await client.query(
            'UPDATE produtos SET estoque_site = estoque_site - $1, estoque_fisico = estoque_fisico + $1 WHERE id = $2',
            [diferenca, produto_id]
          );
        }
        
        console.log('✅ Estoque atualizado para afiliado');
      }
    } else {
      // Criar novo estoque (apenas se quantidade > 0)
      if (quantidade > 0) {
        result = await client.query(
          'INSERT INTO afiliado_estoque (produto_id, afiliado_id, quantidade) VALUES ($1, $2, $3) RETURNING *',
          [produto_id, afiliado_id, quantidade]
        );
        
        // CORREÇÃO: Transferir produtos do estoque site para físico
        await client.query(
          'UPDATE produtos SET estoque_site = estoque_site - $1, estoque_fisico = estoque_fisico + $1 WHERE id = $2',
          [quantidade, produto_id]
        );
        
        console.log('✅ Novo estoque criado para afiliado');
      } else {
        return res.json({ message: 'Nenhuma ação necessária' });
      }
    }

    await client.query('COMMIT');
    res.json(result.rows[0] || { message: 'Estoque atualizado com sucesso' });
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('❌ Erro ao atualizar estoque afiliado:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  } finally {
    client.release();
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

// Buscar produtos disponíveis para um afiliado
const getProdutosPorAfiliado = async (req, res) => {
  try {
    const { afiliado_id } = req.params;
    
    console.log('📦 Buscando produtos disponíveis para afiliado:', afiliado_id);

    const result = await pool.query(`
      SELECT 
        p.id,
        p.nome,
        p.preco,
        ae.quantidade as estoque_afiliado
      FROM afiliado_estoque ae
      JOIN produtos p ON ae.produto_id = p.id
      WHERE ae.afiliado_id = $1 AND ae.quantidade > 0
      ORDER BY p.nome
    `, [afiliado_id]);

    console.log(`✅ ${result.rows.length} produtos disponíveis para o afiliado`);
    res.json(result.rows);
  } catch (error) {
    console.error('❌ Erro ao buscar produtos do afiliado:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
};

module.exports = {
  updateEstoqueAfiliado,
  getEstoquePorAfiliado,
  getProdutosPorAfiliado
};
