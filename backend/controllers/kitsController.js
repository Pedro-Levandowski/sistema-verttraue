
const pool = require('../config/database');

// Listar todos os kits
const getAllKits = async (req, res) => {
  try {
    console.log('🎁 Buscando todos os kits...');
    
    const result = await pool.query(`
      SELECT 
        k.*,
        COUNT(kp.produto_id) as total_produtos
      FROM kits k
      LEFT JOIN kit_produtos kp ON k.id = kp.kit_id
      GROUP BY k.id, k.nome, k.descricao, k.preco, k.created_at, k.updated_at
      ORDER BY k.created_at DESC
    `);

    // Buscar produtos de cada kit
    const kits = [];
    for (const kit of result.rows) {
      const produtosResult = await pool.query(`
        SELECT 
          kp.*,
          p.nome as produto_nome,
          p.preco as produto_preco,
          p.estoque_site as produto_estoque
        FROM kit_produtos kp
        JOIN produtos p ON kp.produto_id = p.id
        WHERE kp.kit_id = $1
        ORDER BY kp.id
      `, [kit.id]);

      kits.push({
        ...kit,
        produtos: produtosResult.rows
      });
    }

    console.log(`✅ ${kits.length} kits encontrados`);
    res.json(kits);
  } catch (error) {
    console.error('❌ Erro ao buscar kits:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
};

// Buscar kit por ID
const getKitById = async (req, res) => {
  try {
    const { id } = req.params;
    console.log('🎁 Buscando kit:', id);

    // Buscar dados do kit
    const kitResult = await pool.query('SELECT * FROM kits WHERE id = $1', [id]);

    if (kitResult.rows.length === 0) {
      console.log('❌ Kit não encontrado:', id);
      return res.status(404).json({ error: 'Kit não encontrado' });
    }

    // Buscar produtos do kit
    const produtosResult = await pool.query(`
      SELECT 
        kp.*,
        p.nome as produto_nome,
        p.preco as produto_preco,
        p.estoque_site as produto_estoque
      FROM kit_produtos kp
      JOIN produtos p ON kp.produto_id = p.id
      WHERE kp.kit_id = $1
      ORDER BY kp.id
    `, [id]);

    const kit = {
      ...kitResult.rows[0],
      produtos: produtosResult.rows
    };

    console.log('✅ Kit encontrado:', kit.nome);
    res.json(kit);
  } catch (error) {
    console.error('❌ Erro ao buscar kit:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
};

// Criar novo kit
const createKit = async (req, res) => {
  const client = await pool.connect();
  
  try {
    await client.query('BEGIN');
    
    const { id, nome, descricao, preco, produtos } = req.body;

    console.log('🎁 Criando kit:', { id, nome, produtos: produtos?.length });
    console.log('🎁 Produtos recebidos:', produtos);

    if (!id || !nome) {
      return res.status(400).json({ error: 'ID e nome são obrigatórios' });
    }

    // Inserir kit
    const kitResult = await client.query(`
      INSERT INTO kits (id, nome, descricao, preco)
      VALUES ($1, $2, $3, $4)
      RETURNING *
    `, [id, nome, descricao || '', preco || 0]);

    // Inserir produtos do kit se fornecidos
    if (produtos && Array.isArray(produtos) && produtos.length > 0) {
      console.log('🎁 Processando', produtos.length, 'produtos para o kit');
      
      for (const produto of produtos) {
        const { produto_id, quantidade } = produto;
        
        console.log('🎁 Processando produto:', { produto_id, quantidade });
        
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

        // Inserir produto no kit
        await client.query(`
          INSERT INTO kit_produtos (kit_id, produto_id, quantidade)
          VALUES ($1, $2, $3)
        `, [id, produto_id, quantidade]);
        
        console.log('✅ Produto adicionado ao kit:', { kit_id: id, produto_id, quantidade });
      }
    } else {
      console.log('⚠️ Nenhum produto fornecido para o kit');
    }

    await client.query('COMMIT');
    
    console.log('✅ Kit criado:', kitResult.rows[0].nome);
    res.status(201).json(kitResult.rows[0]);
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('❌ Erro ao criar kit:', error);
    if (error.code === '23505') {
      return res.status(400).json({ error: 'Kit com este ID já existe' });
    }
    res.status(500).json({ error: error.message || 'Erro interno do servidor' });
  } finally {
    client.release();
  }
};

// Atualizar kit
const updateKit = async (req, res) => {
  const client = await pool.connect();
  
  try {
    await client.query('BEGIN');
    
    const { id } = req.params;
    const { nome, descricao, preco, produtos } = req.body;

    console.log('🎁 Atualizando kit:', id);
    console.log('🎁 Produtos para atualizar:', produtos);

    if (!nome) {
      return res.status(400).json({ error: 'Nome é obrigatório' });
    }

    // Atualizar kit
    const kitResult = await client.query(`
      UPDATE kits 
      SET nome = $1, descricao = $2, preco = $3, updated_at = CURRENT_TIMESTAMP
      WHERE id = $4
      RETURNING *
    `, [nome, descricao || '', preco || 0, id]);

    if (kitResult.rows.length === 0) {
      console.log('❌ Kit não encontrado para atualização:', id);
      return res.status(404).json({ error: 'Kit não encontrado' });
    }

    // Se produtos foram fornecidos, atualizar
    if (produtos && Array.isArray(produtos)) {
      // Deletar produtos existentes
      await client.query('DELETE FROM kit_produtos WHERE kit_id = $1', [id]);

      // Inserir novos produtos
      for (const produto of produtos) {
        const { produto_id, quantidade } = produto;
        
        console.log('🎁 Adicionando produto atualizado ao kit:', { produto_id, quantidade });
        
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
          INSERT INTO kit_produtos (kit_id, produto_id, quantidade)
          VALUES ($1, $2, $3)
        `, [id, produto_id, quantidade]);
      }
    }

    await client.query('COMMIT');
    
    console.log('✅ Kit atualizado:', kitResult.rows[0].nome);
    res.json(kitResult.rows[0]);
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('❌ Erro ao atualizar kit:', error);
    res.status(500).json({ error: error.message || 'Erro interno do servidor' });
  } finally {
    client.release();
  }
};

// Deletar kit
const deleteKit = async (req, res) => {
  const client = await pool.connect();
  
  try {
    await client.query('BEGIN');
    
    const { id } = req.params;
    console.log('🎁 Deletando kit:', id);

    // Verificar se kit está em vendas (usando nome correto da tabela)
    const vendasCheck = await client.query(
      'SELECT COUNT(*) FROM venda_itens WHERE kit_id = $1',
      [id]
    );

    if (parseInt(vendasCheck.rows[0].count) > 0) {
      return res.status(400).json({ 
        error: 'Não é possível deletar kit com vendas vinculadas' 
      });
    }

    // Deletar produtos do kit
    await client.query('DELETE FROM kit_produtos WHERE kit_id = $1', [id]);

    // Deletar kit
    const result = await client.query('DELETE FROM kits WHERE id = $1 RETURNING *', [id]);

    if (result.rows.length === 0) {
      console.log('❌ Kit não encontrado para deleção:', id);
      return res.status(404).json({ error: 'Kit não encontrado' });
    }

    await client.query('COMMIT');
    
    console.log('✅ Kit deletado:', result.rows[0].nome);
    res.json({ message: 'Kit deletado com sucesso' });
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('❌ Erro ao deletar kit:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  } finally {
    client.release();
  }
};

module.exports = {
  getAllKits,
  getKitById,
  createKit,
  updateKit,
  deleteKit
};
