# Biblioteca Online

Aplicação de acervo com login, cadastro e consulta de livros. O backend usa Express, JWT e PostgreSQL. O navegador acessa a API pelo mesmo endereço que serve a página. Esta edição parte do [projeto original, branch API-online](https://github.com/Eri41/BibliotecaOnline/tree/e018264293b791cfbf3099ab61ebe1a7481e38c8). A branch main do projeto original contém a versão para SQL Server.

## 1. Rode os testes no Windows

Extraia todo o ZIP. Abra a pasta que contém package.json no Explorador de Arquivos. Clique na barra de endereço, digite powershell e pressione Enter. Com Node.js 22 ou 24 e npm instalados, execute estas linhas, uma de cada vez.

```powershell
npm.cmd ci
npm.cmd test
```

O resultado esperado é 5 testes aprovados. Os testes usam dados simulados e dispensam cadastro no Neon. O npm instala as versões registradas em package-lock.json.

| Arquivo | Verificação |
| --- | --- |
| test/backend.test.js | Chama o controlador usado por GET /livros e substitui pool.query durante cada teste. Verifica lista preenchida, lista vazia e erro do banco. |
| test/frontend.test.js | Carrega o HTML e o JavaScript da aplicação no jsdom. Confere o título e o estoque, clica no botão de atualização e verifica a orientação exibida após uma resposta 401. |
| .github/workflows/ci-cd.yml | Instala dependências, executa testes e acompanha o deploy do commit aprovado. |

## 2. Execute a aplicação com banco

Use um PostgreSQL Neon com as tabelas livro, categoria e usuario do Biblioteca Online. Se estiver começando com um banco vazio, execute docs/banco-inicial.sql no SQL Editor do Neon. Esse script destina-se a uma base nova.

1. Na pasta do projeto, execute `Copy-Item .env.example .env`.
2. Abra .env no editor. Preencha DATABASE_URL com a string de conexão do Neon. Para gerar uma chave JWT, rode `node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"` e copie o resultado para JWT_SECRET.
3. Execute `npm.cmd start` e abra http://localhost:3000 no navegador.
4. Para criar o primeiro usuário, use Postman. Selecione POST, endereço http://localhost:3000/auth/register, Body → raw → JSON e envie, por exemplo, `{"nome":"Leitor","email":"leitor@example.org","senha":"substitua-por-uma-senha"}`. Depois entre pelo navegador e clique em Atualizar Lista. Na base nova, a categoria inicial tem ID 1.

## 3. Publique a edição acadêmica no GitHub

O .env está versionado no histórico do repositório original. Caso seus valores sejam reais, altere a senha da conexão no Neon e o segredo JWT nos serviços que os utilizam. Este pacote contém apenas .env.example. Use um repositório novo para a atividade para começar com histórico limpo.

1. Entre no GitHub Desktop. Em File → New repository, dê o nome BibliotecaOnline-CICD, escolha a pasta pai e clique em Create repository.
2. Em Repository → Show in Explorer, abra o novo repositório. Copie para dentro dele o conteúdo da pasta extraída que contém package.json, inclusive .github e .gitignore. Deixe de fora node_modules e qualquer .env preenchido. Evite criar uma pasta intermediária.
3. Em Changes, confira os arquivos. Em Summary, escreva “Adicionar testes e pipeline da Biblioteca Online”. Clique em Commit to main. Se a branch inicial tiver outro nome, renomeie-a para main antes de publicar.
4. Clique em Publish repository, desmarque Keep this code private e confirme. Em View on GitHub, confira se .github/workflows/ci-cd.yml aparece na raiz correta. Copie o endereço desse novo repositório para o relatório.

## 4. Conecte o Render e o GitHub Actions

1. No Render, em New → Web Service, conecte sua conta GitHub e selecione BibliotecaOnline-CICD, branch main. Escolha Node, deixe Root Directory em branco, use `npm ci --omit=dev` em Build Command e `npm start` em Start Command. Confira o plano antes de criar.
2. Em Environment, adicione DATABASE_URL e JWT_SECRET com os valores do ambiente de demonstração. Use NODE_VERSION com valor 22. Deixe PORT a cargo do Render. Use / como Health Check Path. Crie o serviço.
3. Em Settings do serviço, altere Auto-Deploy para Off. Assim, nas próximas alterações, a publicação dependerá da aprovação dos testes no GitHub. Copie o Service ID do serviço, que começa por srv-. Em Account Settings → API Keys, crie uma chave que permita iniciar e consultar deploys desse serviço.
4. No novo repositório do GitHub, abra Settings → Secrets and variables → Actions → New repository secret. Cadastre RENDER_API_KEY e RENDER_SERVICE_ID, cada nome com seu respectivo valor. O banco e o segredo JWT ficam no Render.
5. O primeiro push pode ter iniciado o fluxo antes de os secrets existirem. Depois de configurá-los, abra Actions → Biblioteca Online → Run workflow, selecione main e confirme. Nos próximos pushes na main, o fluxo inicia automaticamente. Pull requests destinados à main executam somente os testes.
6. Abra a execução e espere Testes e Deploy ficarem verdes. O segundo job solicita ao Render o SHA aprovado e verifica se esse mesmo commit chegou ao estado live. Se falhar, abra o job vermelho e, para falhas de build ou inicialização, consulte os logs do serviço no Render.

## 5. Finalize o relatório

Abra docs/relatorio.html no navegador. Preencha os endereços do repositório e da execução. No GitHub, abra a execução concluída, deixando visíveis o nome do workflow, os dois jobs verdes e o commit. No Windows, use Win + Shift + S e salve o recorte como PNG. Selecione a imagem no relatório e clique em Salvar em PDF. No diálogo, escolha Salvar como PDF. Os campos e a imagem ficam na página até você fechar ou recarregar a aba. Envie o PDF e o link público do novo repositório.

Documentação do provedor: [publicações no Render](https://render.com/docs/deploys) e [API de deploy](https://api-docs.render.com/reference/create-deploy).
