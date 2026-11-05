
// Seleção dos elementos HTML
const formulario = document.getElementById("form-produto");
const campoNome = document.getElementById("nome");
const campoPreco = document.getElementById("preco");
const campoQuantidade = document.getElementById("quantidade");
const listaProdutos = document.getElementById("lista-produtos");
const resumoEstoque = document.getElementById("resumo-estoque");
const campoBusca = document.getElementById("busca-produto");
const resumo = document.getElementById("resumo");
const avisoArmazenamento = document.getElementById("erro-armazenamento");
const valorTotal = document.getElementById("valor-total");

// Validação dos produtos
function produtoValido(produto) {
    return produto !== null
        && typeof produto === "object"
        && typeof produto.nome === "string"
        && produto.nome.trim() !== ""
        && typeof produto.preco === "number"
        && Number.isFinite(produto.preco)
        && produto.preco > 0
        && Number.isInteger(produto.quantidade)
        && produto.quantidade >= 0
        && (
            produto.estoqueMinimo === undefined
            || (
                Number.isInteger(produto.estoqueMinimo)
                && produto.estoqueMinimo >= 0
            )
        );
}

// Produtos iniciais
const produtosIniciais = [
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

// Controle de erros do armazenamento
let erroArmazenamento = false;

function registrarErroArmazenamento(mensagem, erro = null) {
    erroArmazenamento = true;

    avisoArmazenamento.textContent =
        "Ocorreu um problema ao acessar ou salvar os produtos. "
        + "Os dados podem não estar atualizados. "
        + "Evite fazer alterações até resolver o problema.";

    avisoArmazenamento.hidden = false;

    // Mantém os detalhes técnicos disponíveis para diagnóstico
    if (erro !== null) {
        console.error(mensagem, erro);
    } else {
        console.error(mensagem);
    }
}

// Recuperação dos dados
let produtos = produtosIniciais;
let armazenamento = null;
let dadosValidos = false;

try {
    armazenamento = localStorage.getItem("produtos");

    if (armazenamento !== null) {
        const dadosSalvos = JSON.parse(armazenamento);

        // Só utiliza os dados salvos quando toda a lista é válida
        if (
            Array.isArray(dadosSalvos)
            && dadosSalvos.every(produtoValido)
        ) {
            produtos = dadosSalvos;
            dadosValidos = true;
        } else {
            registrarErroArmazenamento(
                "Os dados recuperados não possuem um formato válido."
            );
        }
    }
} catch (erro) {
    registrarErroArmazenamento(
        "Não foi possível recuperar os produtos salvos:",
        erro
    );
}

// Migração do estoque mínimo
const precisaAtualizar = produtos.some(function(produto) {
    return produto.estoqueMinimo === undefined;
});

if (precisaAtualizar) {
    produtos.forEach(function(produto) {
        if (produto.estoqueMinimo === undefined) {
            produto.estoqueMinimo = 5;
        }
    });
}

// Salvamento seguro
function salvarProdutos(lista) {
    try {
        localStorage.setItem("produtos", JSON.stringify(lista));
        return true;
    } catch (erro) {
        registrarErroArmazenamento(
            "Não foi possível salvar os produtos:",
            erro
        );

        return false;
    }
}

// Salva os produtos iniciais ou persiste a migração
if (
    !erroArmazenamento
    && (
        armazenamento === null
        || (dadosValidos && precisaAtualizar)
    )
) {
    salvarProdutos(produtos);
}

// Exibição dos produtos
function mostrarProdutos() {
    listaProdutos.textContent = "";

    const textoBusca = campoBusca.value.toLowerCase().trim();

    let totalEstoqueBaixo = 0;
    let totalEncontrados = 0;
    let valorTotalEstoque = 0;

    for (let i = 0; i < produtos.length; i++) {
        const produtoAtual = produtos[i];

        valorTotalEstoque +=
            produtoAtual.preco * produtoAtual.quantidade;

        // Os indicadores consideram todos os produtos, não apenas os pesquisados
        if (produtoAtual.quantidade <= produtoAtual.estoqueMinimo) {
            totalEstoqueBaixo++;
        }

        if (!produtoAtual.nome.toLowerCase().includes(textoBusca)) {
            continue;
        }

        totalEncontrados++;

        const item = document.createElement("div");
        item.classList.add("cartao-produto");

        const nomeProduto = document.createElement("h3");
        nomeProduto.textContent = produtoAtual.nome;
        nomeProduto.classList.add("nome-produto");

        const informacoes = document.createElement("p");

        const precoFormatado = produtoAtual.preco.toLocaleString(
            "pt-BR",
            {
                style: "currency",
                currency: "BRL"
            }
        );

        const valorTotalProduto =
            produtoAtual.preco * produtoAtual.quantidade;

        const totalProdutoFormatado = valorTotalProduto.toLocaleString(
            "pt-BR",
            {
                style: "currency",
                currency: "BRL"
            }
        );

        informacoes.textContent =
            "Preço unitário: " + precoFormatado
            + " - Quantidade: " + produtoAtual.quantidade
            + " - Estoque mínimo: " + produtoAtual.estoqueMinimo
            + " - Valor em estoque: " + totalProdutoFormatado;

        item.appendChild(nomeProduto);
        item.appendChild(informacoes);

        if (produtoAtual.quantidade <= produtoAtual.estoqueMinimo) {
            const avisoEstoque = document.createElement("p");

            avisoEstoque.textContent = "ESTOQUE BAIXO!";
            avisoEstoque.classList.add("estoque-baixo");

            item.appendChild(avisoEstoque);
        }

        // Exclusão de produtos
        const botaoExcluir = document.createElement("button");

        botaoExcluir.textContent = "Excluir";
        botaoExcluir.classList.add("botao-excluir");

        botaoExcluir.addEventListener("click", function() {
            if (erroArmazenamento) {
                alert(
                    "Não é possível excluir produtos "
                    + "enquanto houver um erro no armazenamento."
                );
                return;
            }

            const confirmou = confirm(
                "Tem certeza que deseja excluir o produto "
                + produtos[i].nome + "?"
            );

            if (!confirmou) {
                return;
            }

            const novaLista = [...produtos];
            novaLista.splice(i, 1);

            // Só atualiza a lista após confirmar que o salvamento funcionou
            const salvou = salvarProdutos(novaLista);

            if (!salvou) {
                alert(
                    "Não foi possível excluir o produto. "
                    + "Tente novamente!"
                );
                return;
            }

            produtos = novaLista;
            mostrarProdutos();
        });

        // Edição de produtos
        const botaoEditar = document.createElement("button");

        botaoEditar.textContent = "Editar";
        botaoEditar.classList.add("botao-editar");

        botaoEditar.addEventListener("click", function() {
            if (erroArmazenamento) {
                alert(
                    "Não é possível editar produtos "
                    + "enquanto houver um erro no armazenamento."
                );
                return;
            }

            const novoPreco = prompt("Digite o novo preço:");

            if (novoPreco === null) {
                return;
            }

            const precoConvertido = Number(
                novoPreco.replace(",", ".")
            );

            if (
                novoPreco.trim() === ""
                || precoConvertido <= 0
                || !Number.isFinite(precoConvertido)
            ) {
                alert("Digite um preço válido!");
                return;
            }

            const novaQuantidade = prompt(
                "Digite a nova quantidade:"
            );

            if (novaQuantidade === null) {
                return;
            }

            const quantidadeConvertida = Number(novaQuantidade);

            if (
                novaQuantidade.trim() === ""
                || !Number.isInteger(quantidadeConvertida)
                || quantidadeConvertida < 0
            ) {
                alert(
                    "Digite uma quantidade inteira "
                    + "igual ou maior que zero!"
                );
                return;
            }

            const novaLista = [...produtos];

            novaLista[i] = {
                ...produtos[i],
                preco: precoConvertido,
                quantidade: quantidadeConvertida
            };

            const salvou = salvarProdutos(novaLista);

            if (!salvou) {
                alert(
                    "Não foi possível editar o produto. "
                    + "Tente novamente!"
                );
                return;
            }

            produtos = novaLista;
            mostrarProdutos();
        });

        // Organização dos botões
        const areaBotoes = document.createElement("div");

        areaBotoes.classList.add("area-botoes");

        areaBotoes.appendChild(botaoExcluir);
        areaBotoes.appendChild(botaoEditar);

        item.appendChild(areaBotoes);
        listaProdutos.appendChild(item);
    }

    // Atualização dos indicadores
    resumoEstoque.textContent =
        "Produtos com estoque baixo: " + totalEstoqueBaixo;

    valorTotal.textContent =
        "Valor total do estoque: "
        + valorTotalEstoque.toLocaleString(
            "pt-BR",
            {
                style: "currency",
                currency: "BRL"
            }
        );

    if (produtos.length === 0) {
        resumo.textContent = "Nenhum produto cadastrado.";
    } else if (totalEncontrados === 0) {
        resumo.textContent = "Nenhum produto encontrado.";
    } else {
        resumo.textContent = "";
    }
}

// Pesquisa de produtos
campoBusca.addEventListener("input", function() {
    mostrarProdutos();
});

// Carregamento inicial
mostrarProdutos();

// Cadastro de produtos
formulario.addEventListener("submit", function(event) {
    event.preventDefault();

    if (erroArmazenamento) {
        alert(
            "Não é possível cadastrar produtos "
            + "enquanto houver um erro no armazenamento."
        );
        return;
    }

    const nome = campoNome.value;
    const preco = Number(campoPreco.value);
    const quantidade = Number(campoQuantidade.value);

    if (
        nome.trim() === ""
        || !Number.isFinite(preco)
        || preco <= 0
        || !Number.isInteger(quantidade)
        || quantidade < 0
    ) {
        alert("Preencha os dados corretamente!");
        return;
    }

    const produto = {
        nome: nome.trim(),
        preco: preco,
        quantidade: quantidade,
        estoqueMinimo: 12
    };

    const novaLista = [...produtos, produto];

    const salvou = salvarProdutos(novaLista);

    if (!salvou) {
        alert(
            "Não foi possível salvar o produto. "
            + "Tente novamente!"
        );
        return;
    }

    produtos = novaLista;
    mostrarProdutos();

    formulario.reset();
});
