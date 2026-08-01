"use strict";

const NUMERO_WHATSAPP = "5585988882733";

const formulario = document.getElementById("formPermuta");
const botaoLimpar = document.getElementById("botaoLimpar");
const observacao = document.getElementById("observacao");

const quantidadeCaracteres = document.getElementById(
    "quantidadeCaracteres"
);

const mensagemErro = document.getElementById("mensagemErro");
const resultado = document.getElementById("resultado");
const protocoloGerado = document.getElementById("protocoloGerado");

const datasSolicitante = document.getElementById(
    "datasSolicitante"
);

const datasPermutante = document.getElementById(
    "datasPermutante"
);

const adicionarDataSolicitante = document.getElementById(
    "adicionarDataSolicitante"
);

const adicionarDataPermutante = document.getElementById(
    "adicionarDataPermutante"
);

function limparTexto(texto) {
    return texto
        .trim()
        .replace(/\s+/g, " ");
}

function formatarNome(nome) {
    const palavrasMinusculas = [
        "da",
        "de",
        "do",
        "das",
        "dos",
        "e"
    ];

    return limparTexto(nome)
        .toLowerCase()
        .split(" ")
        .map((palavra, indice) => {
            if (
                indice !== 0 &&
                palavrasMinusculas.includes(palavra)
            ) {
                return palavra;
            }

            return (
                palavra.charAt(0).toUpperCase() +
                palavra.slice(1)
            );
        })
        .join(" ");
}

function formatarData(dataISO) {
    if (!dataISO) {
        return "";
    }

    const partes = dataISO.split("-");

    if (partes.length !== 3) {
        return dataISO;
    }

    const [ano, mes, dia] = partes;

    return `${dia}/${mes}/${ano}`;
}

function gerarProtocolo() {
    const agora = new Date();

    const ano = agora.getFullYear();

    const mes = String(
        agora.getMonth() + 1
    ).padStart(2, "0");

    const dia = String(
        agora.getDate()
    ).padStart(2, "0");

    const hora = String(
        agora.getHours()
    ).padStart(2, "0");

    const minuto = String(
        agora.getMinutes()
    ).padStart(2, "0");

    const segundo = String(
        agora.getSeconds()
    ).padStart(2, "0");

    return `PER-${ano}${mes}${dia}-${hora}${minuto}${segundo}`;
}

function mostrarErro(texto) {
    mensagemErro.textContent = texto;
    mensagemErro.hidden = false;

    mensagemErro.scrollIntoView({
        behavior: "smooth",
        block: "center"
    });
}

function esconderErro() {
    mensagemErro.textContent = "";
    mensagemErro.hidden = true;
}

function criarCampoData(classeData) {
    const linha = document.createElement("div");

    linha.className = "linha-data";

    linha.innerHTML = `
        <input
            type="date"
            class="${classeData}"
            required
        >

        <button
            type="button"
            class="botao-remover-data"
            aria-label="Remover data"
        >
            ×
        </button>
    `;

    return linha;
}

function atualizarBotoesRemover(container) {
    const linhas = container.querySelectorAll(
        ".linha-data"
    );

    linhas.forEach((linha) => {
        const botao = linha.querySelector(
            ".botao-remover-data"
        );

        botao.disabled = linhas.length === 1;
    });
}

function adicionarCampoData(container, classeData) {
    const linha = criarCampoData(classeData);

    container.appendChild(linha);

    atualizarBotoesRemover(container);

    const novoCampo = linha.querySelector("input");

    novoCampo.focus();
}

function configurarRemocaoDatas(container) {
    container.addEventListener("click", (evento) => {
        const botao = evento.target.closest(
            ".botao-remover-data"
        );

        if (!botao || botao.disabled) {
            return;
        }

        const linha = botao.closest(".linha-data");

        linha.remove();

        atualizarBotoesRemover(container);
    });
}

function obterDatas(classeData) {
    return Array.from(
        document.querySelectorAll(`.${classeData}`)
    )
        .map((campo) => campo.value)
        .filter(Boolean);
}

function ordenarDatas(datas) {
    return [...datas].sort((dataA, dataB) => {
        return dataA.localeCompare(dataB);
    });
}

function formatarListaDatas(datas) {
    return datas
        .map((data) => `• ${formatarData(data)}`)
        .join("\n");
}

function validarDatas(
    listaDatasSolicitante,
    listaDatasPermutante
) {
    if (
        listaDatasSolicitante.length === 0 ||
        listaDatasPermutante.length === 0
    ) {
        return {
            valido: false,
            mensagem:
                "Informe pelo menos uma data para cada militar."
        };
    }

    const datasUnicasSolicitante = new Set(
        listaDatasSolicitante
    );

    if (
        datasUnicasSolicitante.size !==
        listaDatasSolicitante.length
    ) {
        return {
            valido: false,
            mensagem:
                "Existem datas repetidas nos serviços do solicitante."
        };
    }

    const datasUnicasPermutante = new Set(
        listaDatasPermutante
    );

    if (
        datasUnicasPermutante.size !==
        listaDatasPermutante.length
    ) {
        return {
            valido: false,
            mensagem:
                "Existem datas repetidas nos serviços do militar solicitado."
        };
    }

    const datasEmComum = listaDatasSolicitante.filter(
        (data) => listaDatasPermutante.includes(data)
    );

    if (datasEmComum.length > 0) {
        return {
            valido: false,
            mensagem:
                "Uma mesma data não pode constar nos serviços dos dois militares."
        };
    }

    return {
        valido: true,
        mensagem: ""
    };
}

function montarMensagem(dados) {
    const observacaoTexto = dados.observacao
        ? dados.observacao
        : "Nenhuma observação informada.";

    return (
`*SOLICITAÇÃO DE PERMUTA DE SERVIÇO*
*CBMCE — ITAPIPOCA*

*Protocolo:* ${dados.protocolo}

*SOLICITANTE*
Nome: ${dados.nomeSolicitante}
Matrícula: ${dados.matriculaSolicitante}

*MILITAR DA PERMUTA*
Nome: ${dados.nomePermutante}
Matrícula: ${dados.matriculaPermutante}

*SOLICITAÇÃO*

Eu, ${dados.nomeSolicitante}, matrícula ${dados.matriculaSolicitante}, estou escalado para os serviços dos seguintes dias:

${formatarListaDatas(dados.datasSolicitante)}

Solicito autorização para permutar esses serviços com ${dados.nomePermutante}, matrícula ${dados.matriculaPermutante}, que está escalado para os seguintes dias:

${formatarListaDatas(dados.datasPermutante)}

*Observação:*
${observacaoTexto}

Declaro que os dados informados estão corretos e que ambos os militares estão de acordo com esta solicitação.

*Status:* Aguardando análise e aprovação.`
    );
}

function abrirWhatsApp(mensagem) {
    const mensagemCodificada =
        encodeURIComponent(mensagem);

    const enderecoWhatsApp =
        `https://wa.me/${NUMERO_WHATSAPP}` +
        `?text=${mensagemCodificada}`;

    const novaJanela = window.open(
        enderecoWhatsApp,
        "_blank",
        "noopener,noreferrer"
    );

    if (!novaJanela) {
        window.location.href = enderecoWhatsApp;
    }
}

function resetarCamposDeData() {
    datasSolicitante.innerHTML = `
        <div class="linha-data">
            <input
                type="date"
                class="data-solicitante"
                required
            >

            <button
                type="button"
                class="botao-remover-data"
                aria-label="Remover data"
                disabled
            >
                ×
            </button>
        </div>
    `;

    datasPermutante.innerHTML = `
        <div class="linha-data">
            <input
                type="date"
                class="data-permutante"
                required
            >

            <button
                type="button"
                class="botao-remover-data"
                aria-label="Remover data"
                disabled
            >
                ×
            </button>
        </div>
    `;
}

adicionarDataSolicitante.addEventListener(
    "click",
    () => {
        adicionarCampoData(
            datasSolicitante,
            "data-solicitante"
        );
    }
);

adicionarDataPermutante.addEventListener(
    "click",
    () => {
        adicionarCampoData(
            datasPermutante,
            "data-permutante"
        );
    }
);

configurarRemocaoDatas(datasSolicitante);
configurarRemocaoDatas(datasPermutante);

observacao.addEventListener("input", () => {
    quantidadeCaracteres.textContent =
        observacao.value.length;
});

formulario.addEventListener("submit", (evento) => {
    evento.preventDefault();

    esconderErro();
    resultado.hidden = true;

    if (!formulario.checkValidity()) {
        formulario.reportValidity();

        mostrarErro(
            "Preencha todos os campos obrigatórios antes de continuar."
        );

        return;
    }

    const nomeSolicitante = formatarNome(
        document.getElementById(
            "nomeSolicitante"
        ).value
    );

    const matriculaSolicitante = limparTexto(
        document.getElementById(
            "matriculaSolicitante"
        ).value
    );

    const nomePermutante = formatarNome(
        document.getElementById(
            "nomePermutante"
        ).value
    );

    const matriculaPermutante = limparTexto(
        document.getElementById(
            "matriculaPermutante"
        ).value
    );

    const textoObservacao = limparTexto(
        observacao.value
    );

    const concordancia = document.getElementById(
        "concordancia"
    ).checked;

    const listaDatasSolicitante = ordenarDatas(
        obterDatas("data-solicitante")
    );

    const listaDatasPermutante = ordenarDatas(
        obterDatas("data-permutante")
    );

    if (
        matriculaSolicitante ===
        matriculaPermutante
    ) {
        mostrarErro(
            "A matrícula do solicitante não pode ser igual à matrícula do militar solicitado."
        );

        return;
    }

    const validacaoDatas = validarDatas(
        listaDatasSolicitante,
        listaDatasPermutante
    );

    if (!validacaoDatas.valido) {
        mostrarErro(validacaoDatas.mensagem);
        return;
    }

    if (!concordancia) {
        mostrarErro(
            "É necessário confirmar que ambos os militares estão de acordo."
        );

        return;
    }

    const protocolo = gerarProtocolo();

    const dados = {
        protocolo,
        nomeSolicitante,
        matriculaSolicitante,
        datasSolicitante:
            listaDatasSolicitante,
        nomePermutante,
        matriculaPermutante,
        datasPermutante:
            listaDatasPermutante,
        observacao: textoObservacao
    };

    const mensagem = montarMensagem(dados);

    protocoloGerado.textContent = protocolo;
    resultado.hidden = false;

    resultado.scrollIntoView({
        behavior: "smooth",
        block: "center"
    });

    abrirWhatsApp(mensagem);
});

botaoLimpar.addEventListener("click", () => {
    const confirmarLimpeza = window.confirm(
        "Deseja apagar todos os dados preenchidos?"
    );

    if (!confirmarLimpeza) {
        return;
    }

    formulario.reset();

    resetarCamposDeData();

    quantidadeCaracteres.textContent = "0";

    esconderErro();

    resultado.hidden = true;

    document.getElementById(
        "nomeSolicitante"
    ).focus();
});
