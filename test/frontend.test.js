const { test } = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const { JSDOM } = require("jsdom");
const pasta = path.join(__dirname, "../public");

function abrirPagina(t, respostas) {
    const dom = new JSDOM(fs.readFileSync(path.join(pasta, "index.html"), "utf8"), {
        runScripts: "dangerously", url: "https://biblioteca.example/"
    });
    t.after(() => dom.window.close());
    const pagina = dom.window;
    pagina.fetch = t.mock.fn(async () => respostas.shift());
    pagina.eval(fs.readFileSync(path.join(pasta, "script.js"), "utf8"));
    return pagina;
}

const ok = (dados) => ({ ok: true, json: async () => dados });

test("mostra os dados do livro e atualiza o acervo ao clicar no botão", async (t) => {
    const livro = { id_livro: 8, titulo: "O Quinze", ano: 1930, quantidade_estoque: 2, id_categoria: 1 };
    const pagina = abrirPagina(t, [ok([livro]), ok([])]);
    await pagina.listarLivros();
    const lista = pagina.document.querySelector("#livros");
    assert.equal(lista.querySelector("strong").textContent, "O Quinze");
    assert.match(lista.textContent, /Estoque: 2/);

    let atualizacao;
    const listar = pagina.listarLivros;
    pagina.listarLivros = () => (atualizacao = listar());
    const botao = [...pagina.document.querySelectorAll("button")]
        .find((item) => item.textContent.trim() === "Atualizar Lista");
    botao.click();
    await atualizacao;
    assert.equal(pagina.fetch.mock.callCount(), 2);
    assert.equal(pagina.fetch.mock.calls[1].arguments[0], "/livros");
    assert.equal(lista.textContent, "Nenhum livro cadastrado.");
});

test("orienta a entrar na conta quando a API responde 401", async (t) => {
    const pagina = abrirPagina(t, [{ ok: false, status: 401 }]);
    await pagina.listarLivros();
    assert.match(pagina.document.querySelector("#livros").textContent, /Entre na sua conta/);
});
