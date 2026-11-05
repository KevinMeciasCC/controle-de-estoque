
// Elementos principais da página
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

// Verifica se os dados de um produto estão corretos
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

// Padroniza os textos para permitir pesquisas sem acentos
function normalizarTexto(texto) {
    return texto
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .toLowerCase()
        .trim();
}

// Produtos utilizados na primeira execução
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

    if (erro !== null) {
        console.error(mensagem, erro);
    } else {
        console.error(mensagem);
    }
}

// Recupera os produtos salvos no navegador
let produtos = produtosIniciais;
let armazenamento = null;
let dadosValidos = false;

try {
    armazenamento = localStorage.getItem("produtos");

    if (armazenamento !== null) {
        const dadosSalvos = JSON.parse(armazenamento);

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

// Adiciona um estoque mínimo aos produtos de versões anteriores
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

// Salva os dados e informa se a operação funcionou
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

// Salva os produtos iniciais ou registra a migração
if (
    !erroArmazenamento
    && (
        armazenamento === null
        || (dadosValidos && precisaAtualizar)
    )
) {
    salvarProdutos(produtos);
}

// Cria um bloco de informação para os cartões
function criarInformacao(rotulo, valor, destaque = false) {
    const informacao = document.createElement("div");
    informacao.classList.add("informacao-produto");

    const textoRotulo = document.createElement("span");
    textoRotulo.classList.add("rotulo-informacao");
    textoRotulo.textContent = rotulo;

    const textoValor = document.createElement("span");
    textoValor.classList.add("valor-informacao");
    textoValor.textContent = valor;

    if (destaque) {
        textoValor.classList.add("valor-destaque");
    }

    informacao.appendChild(textoRotulo);
    informacao.appendChild(textoValor);

    return informacao;
}

// Exibe os produtos e atualiza os indicadores
function mostrarProdutos() {
    listaProdutos.textContent = "";

    // A pesquisa ignora diferenças entre letras maiúsculas e acentos
    const textoBusca = normalizarTexto(campoBusca.value);

    let totalEstoqueBaixo = 0;
    let totalEncontrados = 0;
    let valorTotalEstoque = 0;

    for (let i = 0; i < produtos.length; i++) {
        const produtoAtual = produtos[i];

        const valorTotalProduto =
            produtoAtual.preco * produtoAtual.quantidade;

        valorTotalEstoque += valorTotalProduto;

        const estoqueBaixo =
            produtoAtual.quantidade <= produtoAtual.estoqueMinimo;

        // Os indicadores consideram todos os produtos cadastrados
        if (estoqueBaixo) {
            totalEstoqueBaixo++;
        }

        // Compara os nomes já normalizados
        const nomeNormalizado = normalizarTexto(produtoAtual.nome);

        if (!nomeNormalizado.includes(textoBusca)) {
            continue;
        }

        totalEncontrados++;

        // Cartão principal do produto
        const item = document.createElement("div");
        item.classList.add("cartao-produto");

        // Nome e situação do estoque
        const cabecalhoProduto = document.createElement("div");
        cabecalhoProduto.classList.add("cabecalho-produto");

        const nomeProduto = document.createElement("h3");
        nomeProduto.classList.add("nome-produto");
        nomeProduto.textContent = produtoAtual.nome;

        const statusEstoque = document.createElement("span");
        statusEstoque.classList.add("status-estoque");

        if (estoqueBaixo) {
            statusEstoque.classList.add("estoque-baixo");
            statusEstoque.textContent = "Estoque baixo";
        } else {
            statusEstoque.classList.add("estoque-normal");
            statusEstoque.textContent = "Estoque normal";
        }

        cabecalhoProduto.appendChild(nomeProduto);
        cabecalhoProduto.appendChild(statusEstoque);

        // Formatação dos valores monetários
        const precoFormatado = produtoAtual.preco.toLocaleString(
            "pt-BR",
            {
                style: "currency",
                currency: "BRL"
            }
        );

        const totalProdutoFormatado = valorTotalProduto.toLocaleString(
            "pt-BR",
            {
                style: "currency",
                currency: "BRL"
            }
        );

        // Informações organizadas em blocos separados
        const detalhesProduto = document.createElement("div");
        detalhesProduto.classList.add("detalhes-produto");

        detalhesProduto.appendChild(
            criarInformacao("Preço unitário", precoFormatado)
        );

        detalhesProduto.appendChild(
            criarInformacao("Quantidade", produtoAtual.quantidade)
        );

        detalhesProduto.appendChild(
            criarInformacao("Estoque mínimo", produtoAtual.estoqueMinimo)
        );

        detalhesProduto.appendChild(
            criarInformacao(
                "Valor em estoque",
                totalProdutoFormatado,
                true
            )
        );

        // Botão para excluir o produto
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
                + produtoAtual.nome + "?"
            );

            if (!confirmou) {
                return;
            }

            const novaLista = [...produtos];
            novaLista.splice(i, 1);

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

        // Botão para editar o produto
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

        // Organização dos botões do cartão
        const areaBotoes = document.createElement("div");
        areaBotoes.classList.add("area-botoes");

        areaBotoes.appendChild(botaoEditar);
        areaBotoes.appendChild(botaoExcluir);

        // Montagem final do cartão
        item.appendChild(cabecalhoProduto);
        item.appendChild(detalhesProduto);
        item.appendChild(areaBotoes);

        listaProdutos.appendChild(item);
    }

    // Atualiza os indicadores sem repetir os rótulos do HTML
    resumoEstoque.textContent = totalEstoqueBaixo;

    valorTotal.textContent = valorTotalEstoque.toLocaleString(
        "pt-BR",
        {
            style: "currency",
            currency: "BRL"
        }
    );

    // Mensagens exibidas conforme o resultado da pesquisa
    if (produtos.length === 0) {
        resumo.textContent = "Nenhum produto cadastrado.";
    } else if (totalEncontrados === 0) {
        resumo.textContent = "Nenhum produto encontrado.";
    } else {
        resumo.textContent = "";
    }
}

// Atualiza a listagem enquanto o usuário pesquisa
campoBusca.addEventListener("input", function() {
    mostrarProdutos();
});

// Exibe os produtos ao abrir a página
mostrarProdutos();

// Cadastro de novos produtos
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
