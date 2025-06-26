
const express = require('express');
const router = express.Router();
const pool = require('../config/database');
const { authenticateToken } = require('../middleware/auth');

// Aplicar autenticação a todas as rotas
router.use(authenticateToken);

// Listar todos os fornecedores
router.get('/', async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT f.*, COUNT(p.id) as total_produtos
      FROM fornecedores f
      LEFT JOIN produtos p ON f.id = p.fornecedor_id
      GROUP BY f.id, f.nome, f.cidade, f.contato, f.created_at, f.updated_at
      ORDER BY f.created_at DESC
    `);

    res.json(result.rows);
  } catch (error) {
    console.error('Erro ao buscar fornecedores:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// Buscar fornecedor por ID
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query('SELECT * FROM fornecedores WHERE id = $1', [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Fornecedor não encontrado' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Erro ao buscar fornecedor:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// Criar novo fornecedor
router.post('/', async (req, res) => {
  try {
    const { id, nome, cidade, contato } = req.body;

    if (!id || !nome) {
      return res.status(400).json({ error: 'ID e nome são obrigatórios' });
    }

    const result = await pool.query(`
      INSERT INTO fornecedores (id, nome, cidade, contato)
      VALUES ($1, $2, $3, $4)
      RETURNING *
    `, [id, nome, cidade, contato]);

    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Erro ao criar fornecedor:', error);
    if (error.code === '23505') {
      return res.status(400).json({ error: 'Fornecedor com este ID já existe' });
    }
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// Atualizar fornecedor
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { nome, cidade, contato } = req.body;

    if (!nome) {
      return res.status(400).json({ error: 'Nome é obrigatório' });
    }

    const result = await pool.query(`
      UPDATE fornecedores 
      SET nome = $1, cidade = $2, contato = $3, updated_at = CURRENT_TIMESTAMP
      WHERE id = $4
      RETURNING *
    `, [nome, cidade, contato, id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Fornecedor não encontrado' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Erro ao atualizar fornecedor:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// Deletar fornecedor
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    // Verificar se há produtos vinculados
    const produtosResult = await pool.query('SELECT COUNT(*) FROM produtos WHERE fornecedor_id = $1', [id]);
    const totalProdutos = parseInt(produtosResult.rows[0].count);

    if (totalProdutos > 0) {
      return res.status(400).json({ 
        error: `Não é possível deletar o fornecedor. Existem ${totalProdutos} produto(s) vinculado(s) a ele.` 
      });
    }

    const result = await pool.query('DELETE FROM fornecedores WHERE id = $1 RETURNING *', [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Fornecedor não encontrado' });
    }

    res.json({ message: 'Fornecedor deletado com sucesso' });
  } catch (error) {
    console.error('Erro ao deletar fornecedor:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

module.exports = router;
