const { test } = require("node:test");
const assert = require("node:assert/strict");
const pool = require("../src/config/database");
const listarLivros = require("../src/controllers/listarLivros");

function resposta() {
    return {
        status(codigo) { this.codigo = codigo; return this; },
        json(valor) { this.corpo = valor; }
    };
}

for (const [nome, linhas] of [
    ["lista o acervo com os dados da categoria", [{ id_livro: 1, titulo: "O Quinze", categoria: "Romance" }]],
    ["aceita um acervo vazio", []]
]) {
    test(nome, async (t) => {
        const consulta = t.mock.method(pool, "query", async () => ({ rows: linhas }));
        const res = resposta();
        await listarLivros({}, res);
        assert.equal(consulta.mock.callCount(), 1);
        assert.equal(res.codigo, 200);
        assert.deepEqual(res.corpo, linhas);
    });
}

test("retorna 500 quando a consulta falha", async (t) => {
    t.mock.method(pool, "query", async () => { throw new Error("Consulta indisponível"); });
    t.mock.method(console, "error", () => {});
    const res = resposta();
    await listarLivros({}, res);
    assert.equal(res.codigo, 500);
    assert.deepEqual(res.corpo, { erro: "Consulta indisponível" });
});
