const pool = require("../config/database");

async function listarLivros(req, res) {

    try {

        const resultado = await pool.query(`
            SELECT
                l.id_livro,
                l.titulo,
                l.ano,
                l.quantidade_estoque,
                l.id_categoria,
                c.nome AS categoria
            FROM livro l
            LEFT JOIN categoria c
                ON l.id_categoria = c.id_categoria
            ORDER BY l.id_livro
        `);

        res.status(200).json(resultado.rows);

    } catch (erro) {

        console.error("Falha ao listar livros", erro.message);

        res.status(500).json({
            erro: erro.message
        });

    }

}

module.exports = listarLivros;
