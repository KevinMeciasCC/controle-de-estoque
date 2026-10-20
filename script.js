
 // Seleciona os elementos do HTML que serão utilizados
const formulario = document.getElementById("form-produto");
const campoNome = document.getElementById("nome");
const campoPreco = document.getElementById("preco");
const campoQuantidade = document.getElementById("quantidade");
const listaProdutos = document.getElementById("lista-produtos");
const resumoEstoque = document.getElementById("resumo-estoque");
const campoBusca = document.getElementById("busca-produto");
const resumo = document.getElementById("resumo");

// Busca no HTML o elemento que mostrará o valor total do estoque
const valorTotal = document.getElementById("valor-total");

// Recupera os produtos salvos no navegador
const produtosSalvos = localStorage.getItem("produtos");

// Usa os produtos salvos ou cria a lista inicial
const produtos = produtosSalvos
    ? JSON.parse(produtosSalvos)
    : [
        {
            nome: "Água sem gás",
            preco: 3.0,
            quantidade: 24,
            estoqueMinimo: 12
        },
        {
            nome: "Coca-Cola",
            preco: 3.5,
            quantidade: 16,
            estoqueMinimo: 16
        },
        {
            nome: "Guaraná",
            preco: 4.5,
            quantidade: 12,
            estoqueMinimo: 8
        }
    ];

// Adiciona o estoque mínimo aos produtos antigos
produtos.forEach(function(produto) {
    if (produto.estoqueMinimo === undefined) {
        produto.estoqueMinimo = 12;
    }
});

// Salva os produtos atualizados no navegador
localStorage.setItem("produtos", JSON.stringify(produtos));

// Salva a lista inicial caso ainda não existam produtos armazenados
if (produtosSalvos === null) {
    localStorage.setItem("produtos", JSON.stringify(produtos));
}

function mostrarProdutos() {
    // Limpa a lista antes de exibir os produtos novamente
    listaProdutos.textContent = "";

    // Obtém o texto digitado no campo de busca
    const textoBusca = campoBusca.value.toLowerCase().trim();

    // Inicia os contadores
    let totalEstoqueBaixo = 0;
    let totalEncontrados = 0;

    // Inicia o valor total do estoque
    let valorTotalEstoque = 0;

    for (let i = 0; i < produtos.length; i++) {
        // Soma o valor de todos os produtos do estoque
        valorTotalEstoque += produtos[i].preco * produtos[i].quantidade;

        // Conta todos os produtos com estoque baixo,
        // mesmo quando a pesquisa estiver ativa
        if (produtos[i].quantidade <= produtos[i].estoqueMinimo) {
            totalEstoqueBaixo++;
        }

        // Ignora os produtos que não correspondem à pesquisa
        if (!produtos[i].nome.toLowerCase().includes(textoBusca)) {
            continue;
        }

        totalEncontrados++;

        // Cria um cartão para organizar as informações do produto
        const item = document.createElement("div");

        // Adiciona uma classe para estilizar o cartão no CSS
        item.classList.add("cartao-produto");

        // Cria um elemento exclusivo para o nome do produto
        const nomeProduto = document.createElement("h3");

        // Define o nome que será exibido
        nomeProduto.textContent = produtos[i].nome;

        // Adiciona uma classe para estilizar o nome no CSS
        nomeProduto.classList.add("nome-produto");

        // Cria um elemento para as demais informações
        const informacoes = document.createElement("p");

        // Formata o preço unitário em reais
        const precoFormatado = produtos[i].preco.toLocaleString("pt-BR", {
            style: "currency",
            currency: "BRL"
        });

        // Calcula o valor total deste produto no estoque
        const valorTotalProduto =
            produtos[i].preco * produtos[i].quantidade;

        // Formata o valor total deste produto em reais
        const totalProdutoFormatado = valorTotalProduto.toLocaleString(
            "pt-BR",
            {
                style: "currency",
                currency: "BRL"
            }
        );

        // Monta o texto com preço, quantidade e valor total
        informacoes.textContent =
            "Preço unitário: " + precoFormatado
            + " - Quantidade: " + produtos[i].quantidade
            + " - Valor em estoque: " + totalProdutoFormatado;

        // Adiciona o nome e as informações ao cartão
        item.appendChild(nomeProduto);
        item.appendChild(informacoes);

        // Verifica se o estoque está baixo
        if (produtos[i].quantidade <= produtos[i].estoqueMinimo) {
            // Cria um elemento separado para o aviso
            const avisoEstoque = document.createElement("p");

            // Define o texto do aviso
            avisoEstoque.textContent = "ESTOQUE BAIXO!";

            // Destaca o aviso com a classe CSS
            avisoEstoque.classList.add("estoque-baixo");

            // Adiciona o aviso dentro do cartão
            item.appendChild(avisoEstoque);
        }

        // Cria o botão de exclusão
        const botaoExcluir = document.createElement("button");
        botaoExcluir.textContent = "Excluir";

        // Define a classe visual do botão de exclusão
        botaoExcluir.classList.add("botao-excluir");

        // Define a ação do botão de exclusão
        botaoExcluir.addEventListener("click", function() {
            // Remove o produto selecionado
            produtos.splice(i, 1);

            // Salva a lista atualizada no navegador
            localStorage.setItem("produtos", JSON.stringify(produtos));

            // Atualiza a página
            mostrarProdutos();
        });

        // Cria o botão de edição
        const botaoEditar = document.createElement("button");
        botaoEditar.textContent = "Editar";

        // Define a classe visual do botão de edição
        botaoEditar.classList.add("botao-editar");

        // Define a ação do botão de edição
        botaoEditar.addEventListener("click", function() {
            // Solicita o novo preço
            const novoPreco = prompt("Digite o novo preço:");

            // Encerra se o usuário cancelar
            if (novoPreco === null) {
                return;
            }

            // Converte o preço para número
            const precoConvertido = Number(novoPreco);

            // Verifica se o preço é válido
            if (
                novoPreco.trim() === ""
                || precoConvertido <= 0
                || !Number.isFinite(precoConvertido)
            ) {
                alert("Digite um preço válido!");
                return;
            }

            // Solicita a nova quantidade
            const novaQuantidade = prompt("Digite a nova quantidade:");

            // Encerra se o usuário cancelar
            if (novaQuantidade === null) {
                return;
            }

            // Converte a quantidade para número
            const quantidadeConvertida = Number(novaQuantidade);

            // Verifica se a quantidade é um inteiro igual ou maior que zero
            if (
                novaQuantidade.trim() === ""
                || !Number.isInteger(quantidadeConvertida)
                || quantidadeConvertida < 0
            ) {
                alert("Digite uma quantidade inteira igual ou maior que zero!");
                return;
            }

            // Atualiza o preço do produto
            produtos[i].preco = precoConvertido;

            // Atualiza a quantidade do produto
            produtos[i].quantidade = quantidadeConvertida;

            // Salva as alterações no navegador
            localStorage.setItem("produtos", JSON.stringify(produtos));

            // Atualiza a lista
            mostrarProdutos();
        });

        // Cria uma área exclusiva para os botões
        const areaBotoes = document.createElement("div");

        // Adiciona uma classe para estilizar os botões
        areaBotoes.classList.add("area-botoes");

        // Coloca o botão de exclusão dentro da área de botões
        areaBotoes.appendChild(botaoExcluir);

        // Coloca o botão de edição dentro da área de botões
        areaBotoes.appendChild(botaoEditar);

        // Adiciona a área de botões dentro do cartão do produto
        item.appendChild(areaBotoes);

        // Adiciona o cartão completo à lista de produtos
        listaProdutos.appendChild(item);
    }

    // Atualiza o contador de estoque baixo
    resumoEstoque.textContent =
        "Produtos com estoque baixo: " + totalEstoqueBaixo;

    // Exibe o valor total do estoque formatado em reais
    valorTotal.textContent =
        "Valor total do estoque: "
        + valorTotalEstoque.toLocaleString("pt-BR", {
            style: "currency",
            currency: "BRL"
        });

    // Mostra uma mensagem conforme o resultado da busca
    if (produtos.length === 0) {
        resumo.textContent = "Nenhum produto cadastrado.";
    } else if (totalEncontrados === 0) {
        resumo.textContent = "Nenhum produto encontrado.";
    } else {
        resumo.textContent = "";
    }
}

// Detecta quando o usuário digita ou apaga algo no campo de busca
campoBusca.addEventListener("input", function() {
    // Atualiza a lista conforme a pesquisa
    mostrarProdutos();
});

// Exibe os produtos ao carregar a página
mostrarProdutos();

// Captura o envio do formulário para cadastrar um produto
formulario.addEventListener("submit", function(event) {
    // Impede que a página seja recarregada ao enviar o formulário
    event.preventDefault();

    // Obtém os valores digitados pelo usuário
    const nome = campoNome.value;
    const preco = Number(campoPreco.value);
    const quantidade = Number(campoQuantidade.value);

    // Verifica se os dados do produto são válidos
    if (nome.trim() === "" || preco <= 0 || quantidade < 0) {
        alert("Preencha os dados corretamente!");
        return;
    }

    // Cria um objeto com os dados do novo produto
    const produto = {
        nome: nome,
        preco: preco,
        quantidade: quantidade,
        estoqueMinimo: 12 // Define o limite de estoque baixo
    };

    // Adiciona o novo produto ao array do estoque
    produtos.push(produto);

    // Atualiza a lista exibida na página
    mostrarProdutos();

    // Limpa os campos para um novo cadastro
    formulario.reset();

    // Salva os produtos atualizados no navegador
    localStorage.setItem("produtos", JSON.stringify(produtos));

    // Exibe o array atualizado no console para testes
    console.log(produtos);
});
