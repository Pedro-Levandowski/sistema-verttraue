
const express = require('express');
const router = express.Router();
const pool = require('../config/database');
const { authenticateToken } = require('../middleware/auth');

// Aplicar autenticação a todas as rotas
router.use(authenticateToken);

// Listar todos os produtos
router.get('/', async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT p.*, f.nome as fornecedor_nome, f.cidade as fornecedor_cidade, f.contato as fornecedor_contato,
             COALESCE(ae.quantidade, 0) as quantidade_afiliado
      FROM produtos p
      LEFT JOIN fornecedores f ON p.fornecedor_id = f.id
      LEFT JOIN afiliado_estoque ae ON p.id = ae.produto_id
      ORDER BY p.created_at DESC
    `);

    const produtos = result.rows.map(row => ({
      id: row.id,
      nome: row.nome,
      descricao: row.descricao,
      estoque_fisico: row.estoque_fisico,
      estoque_site: row.estoque_site,
      preco: parseFloat(row.preco),
      preco_compra: parseFloat(row.preco_compra),
      fornecedor: {
        id: row.fornecedor_id,
        nome: row.fornecedor_nome,
        cidade: row.fornecedor_cidade,
        contato: row.fornecedor_contato
      },
      afiliado_id: row.afiliado_id,
      afiliado_estoque: [],
      fotos: []
    }));

    res.json(produtos);
  } catch (error) {
    console.error('Erro ao buscar produtos:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// Buscar produto por ID
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query(`
      SELECT p.*, f.nome as fornecedor_nome, f.cidade as fornecedor_cidade, f.contato as fornecedor_contato
      FROM produtos p
      LEFT JOIN fornecedores f ON p.fornecedor_id = f.id
      WHERE p.id = $1
    `, [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Produto não encontrado' });
    }

    const produto = result.rows[0];
    
    // Buscar fotos do produto
    const fotosResult = await pool.query(
      'SELECT url_foto FROM produto_fotos WHERE produto_id = $1 ORDER BY ordem',
      [id]
    );

    res.json({
      id: produto.id,
      nome: produto.nome,
      descricao: produto.descricao,
      estoque_fisico: produto.estoque_fisico,
      estoque_site: produto.estoque_site,
      preco: parseFloat(produto.preco),
      preco_compra: parseFloat(produto.preco_compra),
      fornecedor: {
        id: produto.fornecedor_id,
        nome: produto.fornecedor_nome,
        cidade: produto.fornecedor_cidade,
        contato: produto.fornecedor_contato
      },
      fotos: fotosResult.rows.map(row => row.url_foto)
    });
  } catch (error) {
    console.error('Erro ao buscar produto:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// Criar novo produto
router.post('/', async (req, res) => {
  try {
    const {
      id,
      nome,
      descricao,
      estoque_fisico,
      estoque_site,
      preco,
      preco_compra,
      fornecedor_id
    } = req.body;

    const result = await pool.query(`
      INSERT INTO produtos (id, nome, descricao, estoque_fisico, estoque_site, preco, preco_compra, fornecedor_id)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      RETURNING *
    `, [id, nome, descricao, estoque_fisico, estoque_site, preco, preco_compra, fornecedor_id]);

    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Erro ao criar produto:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// Atualizar produto
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const {
      nome,
      descricao,
      estoque_fisico,
      estoque_site,
      preco,
      preco_compra,
      fornecedor_id
    } = req.body;

    const result = await pool.query(`
      UPDATE produtos 
      SET nome = $1, descricao = $2, estoque_fisico = $3, estoque_site = $4, 
          preco = $5, preco_compra = $6, fornecedor_id = $7, updated_at = CURRENT_TIMESTAMP
      WHERE id = $8
      RETURNING *
    `, [nome, descricao, estoque_fisico, estoque_site, preco, preco_compra, fornecedor_id, id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Produto não encontrado' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Erro ao atualizar produto:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// Deletar produto
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query('DELETE FROM produtos WHERE id = $1 RETURNING *', [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Produto não encontrado' });
    }

    res.json({ message: 'Produto deletado com sucesso' });
  } catch (error) {
    console.error('Erro ao deletar produto:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

module.exports = router;
