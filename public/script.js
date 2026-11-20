const API = "";

let token = "";

async function login() {

    const email = document.getElementById("email").value;
    const senha = document.getElementById("senha").value;

    const resposta = await fetch(`${API}/auth/login`, {

        method: "POST",

        headers: {
            "Content-Type": "application/json"
        },

        body: JSON.stringify({
            email,
            senha
        })

    });

    const dados = await resposta.json();

    if (!resposta.ok) {
        alert(dados.erro || "Falha no login.");
        return;
    }
    token = dados.token;

    alert("Login realizado!");

    listarLivros();
}

async function listarLivros() {

    const resposta = await fetch(`${API}/livros`, {

        headers: {
            Authorization: `Bearer ${token}`
        }

    });

    const lista = document.getElementById("livros");
    if (!resposta.ok) {
        lista.textContent = resposta.status === 401 || resposta.status === 403
            ? "Entre na sua conta para consultar os livros."
            : "Não foi possível carregar os livros.";
        return;
    }

    const livros = await resposta.json();
    lista.replaceChildren();
    if (!livros.length) {
        lista.textContent = "Nenhum livro cadastrado.";
    }
    for (const livro of livros) {
        const card = document.createElement("div");
        card.className = "livro";
        const titulo = document.createElement("strong");
        titulo.textContent = livro.titulo;
        card.append(titulo);
        for (const detalhe of [`Ano: ${livro.ano}`, `Estoque: ${livro.quantidade_estoque}`, `Categoria: ${livro.id_categoria}`]) {
            card.append(document.createElement("br"), detalhe);
        }
        const excluir = document.createElement("button");
        excluir.textContent = "Excluir";
        excluir.onclick = () => excluirLivro(livro.id_livro);
        card.append(document.createElement("br"), excluir);
        lista.append(card);
    }
}

async function cadastrarLivro() {

    const titulo = document.getElementById("titulo").value;
    const ano = document.getElementById("ano").value;
    const quantidade_estoque =
        document.getElementById("estoque").value;
    const id_categoria =
        document.getElementById("categoria").value;

    await fetch(`${API}/livros`, {

        method: "POST",

        headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`
        },

        body: JSON.stringify({
            titulo,
            ano,
            quantidade_estoque,
            id_categoria
        })

    });

    alert("Livro cadastrado!");

    listarLivros();
}

async function excluirLivro(id) {

    await fetch(`${API}/livros/${id}`, {

        method: "DELETE",

        headers: {
            Authorization: `Bearer ${token}`
        }

    });

    listarLivros();
}