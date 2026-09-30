const dataInicio =
    document.getElementById("data-inicio");

const dataFim =
    document.getElementById("data-fim");

const btnFiltrar =
    document.getElementById("btn-filtrar");

const btnLimpar =
    document.getElementById("btn-limpar");

const botoesRapidos =
    document.querySelectorAll(".btn-rapido");

const faturamento =
    document.getElementById("faturamento");

const quantidadeVendas =
    document.getElementById("quantidade-vendas");

const ticketMedio =
    document.getElementById("ticket-medio");

const canvas =
    document.getElementById("grafico-vendas");

const canvasQuantidade =
    document.getElementById("grafico-quantidade");

const semDados =
    document.getElementById("sem-dados");

const semDadosQuantidade =
    document.getElementById("sem-dados-quantidade");

let grafico = null;

let graficoQuantidade = null;


// ======================================
// FORMATAR VALOR
// ======================================

function formatarValor(valor) {

    return Number(valor).toLocaleString(
        "pt-BR",
        {
            style: "currency",
            currency: "BRL"
        }
    );

}


// ======================================
// FORMATAR DATA
// ======================================

function formatarData(data) {

    const partes = data.split("-");

    return `${partes[2]}/${partes[1]}`;

}


// ======================================
// DATA NO FORMATO YYYY-MM-DD
// ======================================

function formatarDataInput(data) {

    const ano = data.getFullYear();

    const mes = String(
        data.getMonth() + 1
    ).padStart(2, "0");

    const dia = String(
        data.getDate()
    ).padStart(2, "0");

    return `${ano}-${mes}-${dia}`;

}


// ======================================
// CARREGAR DASHBOARD
// ======================================

async function carregarDashboard() {

    try {

        let url = "/dashboard/resumo";

        const parametros = [];


        if (dataInicio.value) {

            parametros.push(
                `data_inicio=${dataInicio.value}`
            );

        }


        if (dataFim.value) {

            parametros.push(
                `data_fim=${dataFim.value}`
            );

        }


        if (parametros.length > 0) {

            url += "?" + parametros.join("&");

        }


        const resposta = await fetch(url);


        if (!resposta.ok) {

            throw new Error(
                "Erro ao carregar dashboard."
            );

        }


        const dados = await resposta.json();


        // RESUMO

        faturamento.textContent =
            formatarValor(
                dados.faturamento
            );


        quantidadeVendas.textContent =
            dados.quantidade_vendas;


        ticketMedio.textContent =
            formatarValor(
                dados.ticket_medio
            );


        // GRÁFICO DE FATURAMENTO

        atualizarGrafico(
            dados.grafico
        );


        // GRÁFICO DE QUANTIDADE

        atualizarGraficoQuantidade(
            dados.grafico_quantidade
        );


    } catch (erro) {

        console.error(erro);

    }

}


// ======================================
// GRÁFICO DE FATURAMENTO
// ======================================

function atualizarGrafico(dados) {

    if (grafico) {

        grafico.destroy();

    }


    if (dados.length === 0) {

        canvas.hidden = true;

        semDados.hidden = false;

        return;

    }


    canvas.hidden = false;

    semDados.hidden = true;


    const labels = dados.map(
        item => formatarData(item.data)
    );


    const valores = dados.map(
        item => item.valor
    );


    grafico = new Chart(

        canvas,

        {

            type: "line",

            data: {

                labels: labels,

                datasets: [

                    {

                        label: "Faturamento",

                        data: valores,

                        tension: 0.3,

                        fill: false

                    }

                ]

            },


            options: {

                responsive: true,

                maintainAspectRatio: false,


                plugins: {

                    tooltip: {

                        callbacks: {

                            label: function(context) {

                                return formatarValor(
                                    context.raw
                                );

                            }

                        }

                    }

                },


                scales: {

                    y: {

                        beginAtZero: true,

                        ticks: {

                            callback: function(value) {

                                return formatarValor(
                                    value
                                );

                            }

                        }

                    }

                }

            }

        }

    );

}


// ======================================
// GRÁFICO DE QUANTIDADE
// ======================================

function atualizarGraficoQuantidade(dados) {

    if (graficoQuantidade) {

        graficoQuantidade.destroy();

    }


    if (dados.length === 0) {

        canvasQuantidade.hidden = true;

        semDadosQuantidade.hidden = false;

        return;

    }


    canvasQuantidade.hidden = false;

    semDadosQuantidade.hidden = true;


    const labels = dados.map(
        item => formatarData(item.data)
    );


    const valores = dados.map(
        item => item.quantidade
    );


    graficoQuantidade = new Chart(

        canvasQuantidade,

        {

            type: "bar",

            data: {

                labels: labels,

                datasets: [

                    {

                        label: "Quantidade de vendas",

                        data: valores

                    }

                ]

            },


            options: {

                responsive: true,

                maintainAspectRatio: false,


                scales: {

                    y: {

                        beginAtZero: true,

                        ticks: {

                            precision: 0

                        }

                    }

                }

            }

        }

    );

}


// ======================================
// FILTRO: HOJE
// ======================================

function filtroHoje() {

    const hoje = new Date();

    const data =
        formatarDataInput(hoje);

    dataInicio.value = data;

    dataFim.value = data;

    carregarDashboard();

}


// ======================================
// FILTRO: ONTEM
// ======================================

function filtroOntem() {

    const ontem = new Date();

    ontem.setDate(
        ontem.getDate() - 1
    );

    const data =
        formatarDataInput(ontem);

    dataInicio.value = data;

    dataFim.value = data;

    carregarDashboard();

}


// ======================================
// FILTRO: ÚLTIMOS 7 DIAS
// ======================================

function filtro7Dias() {

    const hoje = new Date();

    const seteDiasAtras =
        new Date();

    seteDiasAtras.setDate(
        hoje.getDate() - 6
    );


    dataInicio.value =
        formatarDataInput(
            seteDiasAtras
        );


    dataFim.value =
        formatarDataInput(
            hoje
        );


    carregarDashboard();

}


// ======================================
// FILTRO: ESTE MÊS
// ======================================

function filtroEsteMes() {

    const hoje = new Date();


    const primeiroDia =
        new Date(
            hoje.getFullYear(),
            hoje.getMonth(),
            1
        );


    dataInicio.value =
        formatarDataInput(
            primeiroDia
        );


    dataFim.value =
        formatarDataInput(
            hoje
        );


    carregarDashboard();

}


// ======================================
// EVENTOS DOS FILTROS RÁPIDOS
// ======================================

botoesRapidos.forEach(
    botao => {

        botao.addEventListener(
            "click",
            function() {

                const filtro =
                    botao.dataset.filtro;


                if (filtro === "hoje") {

                    filtroHoje();

                }


                if (filtro === "ontem") {

                    filtroOntem();

                }


                if (filtro === "7dias") {

                    filtro7Dias();

                }


                if (filtro === "mes") {

                    filtroEsteMes();

                }

            }
        );

    }
);


// ======================================
// FILTRAR POR DATA
// ======================================

btnFiltrar.addEventListener(
    "click",
    function() {

        if (
            dataInicio.value &&
            dataFim.value &&
            dataInicio.value > dataFim.value
        ) {

            alert(
                "A data inicial não pode ser maior que a data final."
            );

            return;

        }


        carregarDashboard();

    }
);


// ======================================
// LIMPAR FILTROS
// ======================================

btnLimpar.addEventListener(
    "click",
    function() {

        dataInicio.value = "";

        dataFim.value = "";

        carregarDashboard();

    }
);


// ======================================
// CARREGAR AO ABRIR
// ======================================

carregarDashboard();