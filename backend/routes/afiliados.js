
const express = require('express');
const router = express.Router();
const pool = require('../config/database');
const { authenticateToken } = require('../middleware/auth');

// Aplicar autenticação a todas as rotas
router.use(authenticateToken);

// Listar todos os afiliados
router.get('/', async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT a.*, COUNT(ae.produto_id) as total_produtos_estoque
      FROM afiliados a
      LEFT JOIN afiliado_estoque ae ON a.id = ae.afiliado_id
      GROUP BY a.id, a.nome_completo, a.email, a.telefone, a.comissao, a.chave_pix, a.tipo_chave_pix, a.ativo, a.created_at, a.updated_at
      ORDER BY a.created_at DESC
    `);

    res.json(result.rows);
  } catch (error) {
    console.error('Erro ao buscar afiliados:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// Buscar afiliado por ID
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query('SELECT * FROM afiliados WHERE id = $1', [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Afiliado não encontrado' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Erro ao buscar afiliado:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// Criar novo afiliado
router.post('/', async (req, res) => {
  try {
    const { id, nome_completo, email, telefone, comissao, chave_pix, tipo_chave_pix, ativo } = req.body;

    if (!id || !nome_completo || !email) {
      return res.status(400).json({ error: 'ID, nome completo e email são obrigatórios' });
    }

    const result = await pool.query(`
      INSERT INTO afiliados (id, nome_completo, email, telefone, comissao, chave_pix, tipo_chave_pix, ativo)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      RETURNING *
    `, [id, nome_completo, email, telefone, comissao || 0, chave_pix, tipo_chave_pix, ativo !== false]);

    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Erro ao criar afiliado:', error);
    if (error.code === '23505') {
      return res.status(400).json({ error: 'Afiliado com este ID ou email já existe' });
    }
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// Atualizar afiliado
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { nome_completo, email, telefone, comissao, chave_pix, tipo_chave_pix, ativo } = req.body;

    if (!nome_completo || !email) {
      return res.status(400).json({ error: 'Nome completo e email são obrigatórios' });
    }

    const result = await pool.query(`
      UPDATE afiliados 
      SET nome_completo = $1, email = $2, telefone = $3, comissao = $4, 
          chave_pix = $5, tipo_chave_pix = $6, ativo = $7, updated_at = CURRENT_TIMESTAMP
      WHERE id = $8
      RETURNING *
    `, [nome_completo, email, telefone, comissao, chave_pix, tipo_chave_pix, ativo, id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Afiliado não encontrado' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Erro ao atualizar afiliado:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// Deletar afiliado
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    // Verificar se há vendas vinculadas
    const vendasResult = await pool.query('SELECT COUNT(*) FROM vendas WHERE afiliado_id = $1', [id]);
    const totalVendas = parseInt(vendasResult.rows[0].count);

    if (totalVendas > 0) {
      return res.status(400).json({ 
        error: `Não é possível deletar o afiliado. Existem ${totalVendas} venda(s) vinculada(s) a ele.` 
      });
    }

    const result = await pool.query('DELETE FROM afiliados WHERE id = $1 RETURNING *', [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Afiliado não encontrado' });
    }

    res.json({ message: 'Afiliado deletado com sucesso' });
  } catch (error) {
    console.error('Erro ao deletar afiliado:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

module.exports = router;
