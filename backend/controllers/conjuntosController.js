
const pool = require('../config/database');

// Listar todos os conjuntos
const getAllConjuntos = async (req, res) => {
  try {
    console.log('🎯 Buscando todos os conjuntos...');
    
    const result = await pool.query(`
      SELECT 
        c.*,
        COUNT(cp.produto_id) as total_produtos
      FROM conjuntos c
      LEFT JOIN conjunto_produtos cp ON c.id = cp.conjunto_id
      GROUP BY c.id, c.nome, c.descricao, c.preco, c.created_at, c.updated_at
      ORDER BY c.created_at DESC
    `);

    // Buscar produtos de cada conjunto
    const conjuntos = [];
    for (const conjunto of result.rows) {
      const produtosResult = await pool.query(`
        SELECT 
          cp.*,
          p.nome as produto_nome,
          p.preco as produto_preco,
          p.estoque_site as produto_estoque
        FROM conjunto_produtos cp
        JOIN produtos p ON cp.produto_id = p.id
        WHERE cp.conjunto_id = $1
        ORDER BY cp.id
      `, [conjunto.id]);

      conjuntos.push({
        ...conjunto,
        produtos: produtosResult.rows
      });
    }

    console.log(`✅ ${conjuntos.length} conjuntos encontrados`);
    res.json(conjuntos);
  } catch (error) {
    console.error('❌ Erro ao buscar conjuntos:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
};

// Buscar conjunto por ID
const getConjuntoById = async (req, res) => {
  try {
    const { id } = req.params;
    console.log('🎯 Buscando conjunto:', id);

    // Buscar dados do conjunto
    const conjuntoResult = await pool.query('SELECT * FROM conjuntos WHERE id = $1', [id]);

    if (conjuntoResult.rows.length === 0) {
      console.log('❌ Conjunto não encontrado:', id);
      return res.status(404).json({ error: 'Conjunto não encontrado' });
    }

    // Buscar produtos do conjunto
    const produtosResult = await pool.query(`
      SELECT 
        cp.*,
        p.nome as produto_nome,
        p.preco as produto_preco,
        p.estoque_site as produto_estoque
      FROM conjunto_produtos cp
      JOIN produtos p ON cp.produto_id = p.id
      WHERE cp.conjunto_id = $1
      ORDER BY cp.id
    `, [id]);

    const conjunto = {
      ...conjuntoResult.rows[0],
      produtos: produtosResult.rows
    };

    console.log('✅ Conjunto encontrado:', conjunto.nome);
    res.json(conjunto);
  } catch (error) {
    console.error('❌ Erro ao buscar conjunto:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
};

// Criar novo conjunto
const createConjunto = async (req, res) => {
  const client = await pool.connect();
  
  try {
    await client.query('BEGIN');
    
    const { id, nome, descricao, preco, produtos } = req.body;

    console.log('🎯 Criando conjunto:', { id, nome, produtos: produtos?.length });
    console.log('🎯 Produtos recebidos:', produtos);

    if (!id || !nome) {
      return res.status(400).json({ error: 'ID e nome são obrigatórios' });
    }

    // Inserir conjunto
    const conjuntoResult = await client.query(`
      INSERT INTO conjuntos (id, nome, descricao, preco)
      VALUES ($1, $2, $3, $4)
      RETURNING *
    `, [id, nome, descricao || '', preco || 0]);

    // Inserir produtos do conjunto se fornecidos
    if (produtos && Array.isArray(produtos) && produtos.length > 0) {
      console.log('🎯 Processando', produtos.length, 'produtos para o conjunto');
      
      for (const produto of produtos) {
        const { produto_id, quantidade } = produto;
        
        console.log('🎯 Processando produto:', { produto_id, quantidade });
        
        if (!produto_id || !quantidade || quantidade <= 0) {
          console.warn('⚠️ Produto inválido ignorado:', produto);
          continue;
        }

        // Validar se produto existe
        const produtoExists = await client.query(
          'SELECT id FROM produtos WHERE id = $1',
          [produto_id]
        );
        
        if (produtoExists.rows.length === 0) {
          console.warn('⚠️ Produto não encontrado:', produto_id);
          continue;
        }

        // Inserir produto no conjunto
        await client.query(`
          INSERT INTO conjunto_produtos (conjunto_id, produto_id, quantidade)
          VALUES ($1, $2, $3)
        `, [id, produto_id, quantidade]);
        
        console.log('✅ Produto adicionado ao conjunto:', { conjunto_id: id, produto_id, quantidade });
      }
    } else {
      console.log('⚠️ Nenhum produto fornecido para o conjunto');
    }

    await client.query('COMMIT');
    
    console.log('✅ Conjunto criado:', conjuntoResult.rows[0].nome);
    res.status(201).json(conjuntoResult.rows[0]);
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('❌ Erro ao criar conjunto:', error);
    if (error.code === '23505') {
      return res.status(400).json({ error: 'Conjunto com este ID já existe' });
    }
    res.status(500).json({ error: error.message || 'Erro interno do servidor' });
  } finally {
    client.release();
  }
};

// Atualizar conjunto
const updateConjunto = async (req, res) => {
  const client = await pool.connect();
  
  try {
    await client.query('BEGIN');
    
    const { id } = req.params;
    const { nome, descricao, preco, produtos } = req.body;

    console.log('🎯 Atualizando conjunto:', id);
    console.log('🎯 Produtos para atualizar:', produtos);

    if (!nome) {
      return res.status(400).json({ error: 'Nome é obrigatório' });
    }

    // Atualizar conjunto
    const conjuntoResult = await client.query(`
      UPDATE conjuntos 
      SET nome = $1, descricao = $2, preco = $3, updated_at = CURRENT_TIMESTAMP
      WHERE id = $4
      RETURNING *
    `, [nome, descricao || '', preco || 0, id]);

    if (conjuntoResult.rows.length === 0) {
      console.log('❌ Conjunto não encontrado para atualização:', id);
      return res.status(404).json({ error: 'Conjunto não encontrado' });
    }

    // Se produtos foram fornecidos, atualizar
    if (produtos && Array.isArray(produtos)) {
      // Deletar produtos existentes
      await client.query('DELETE FROM conjunto_produtos WHERE conjunto_id = $1', [id]);

      // Inserir novos produtos
      for (const produto of produtos) {
        const { produto_id, quantidade } = produto;
        
        console.log('🎯 Adicionando produto atualizado ao conjunto:', { produto_id, quantidade });
        
        if (!produto_id || !quantidade || quantidade <= 0) {
          console.warn('⚠️ Produto inválido ignorado na atualização:', produto);
          continue;
        }

        // Validar se produto existe
        const produtoExists = await client.query(
          'SELECT id FROM produtos WHERE id = $1',
          [produto_id]
        );
        
        if (produtoExists.rows.length === 0) {
          console.warn('⚠️ Produto não encontrado na atualização:', produto_id);
          continue;
        }

        await client.query(`
          INSERT INTO conjunto_produtos (conjunto_id, produto_id, quantidade)
          VALUES ($1, $2, $3)
        `, [id, produto_id, quantidade]);
      }
    }

    await client.query('COMMIT');
    
    console.log('✅ Conjunto atualizado:', conjuntoResult.rows[0].nome);
    res.json(conjuntoResult.rows[0]);
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('❌ Erro ao atualizar conjunto:', error);
    res.status(500).json({ error: error.message || 'Erro interno do servidor' });
  } finally {
    client.release();
  }
};

// Deletar conjunto
const deleteConjunto = async (req, res) => {
  const client = await pool.connect();
  
  try {
    await client.query('BEGIN');
    
    const { id } = req.params;
    console.log('🎯 Deletando conjunto:', id);

    // Verificar se conjunto está em vendas (usando nome correto da tabela)
    const vendasCheck = await client.query(
      'SELECT COUNT(*) FROM venda_itens WHERE conjunto_id = $1',
      [id]
    );

    if (parseInt(vendasCheck.rows[0].count) > 0) {
      return res.status(400).json({ 
        error: 'Não é possível deletar conjunto com vendas vinculadas' 
      });
    }

    // Deletar produtos do conjunto
    await client.query('DELETE FROM conjunto_produtos WHERE conjunto_id = $1', [id]);

    // Deletar conjunto
    const result = await client.query('DELETE FROM conjuntos WHERE id = $1 RETURNING *', [id]);

    if (result.rows.length === 0) {
      console.log('❌ Conjunto não encontrado para deleção:', id);
      return res.status(404).json({ error: 'Conjunto não encontrado' });
    }

    await client.query('COMMIT');
    
    console.log('✅ Conjunto deletado:', result.rows[0].nome);
    res.json({ message: 'Conjunto deletado com sucesso' });
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('❌ Erro ao deletar conjunto:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  } finally {
    client.release();
  }
};

module.exports = {
  getAllConjuntos,
  getConjuntoById,
  createConjunto,
  updateConjunto,
  deleteConjunto
};
