const form = document.getElementById("form-venda");
const dataInput = document.getElementById("data_venda");
const valorInput = document.getElementById("valor");
const mensagem = document.getElementById("mensagem");
const botao = document.getElementById("btn-registrar");
const botaoCancelar = document.getElementById("btn-cancelar");
const listaVendas = document.getElementById("lista-vendas");



// Guarda o ID da venda que está sendo editada
let vendaEditandoId = null;


// =========================
// DATA ATUAL
// =========================

function colocarDataAtual() {

    const hoje = new Date();

    const ano = hoje.getFullYear();
    const mes = String(hoje.getMonth() + 1).padStart(2, "0");
    const dia = String(hoje.getDate()).padStart(2, "0");

    dataInput.value = `${ano}-${mes}-${dia}`;
}


colocarDataAtual();


// =========================
// FORMATAR DATA
// =========================

function formatarData(data) {

    const partes = data.split("-");

    return `${partes[2]}/${partes[1]}/${partes[0]}`;
}


// =========================
// FORMATAR HORA
// =========================

function formatarHora(hora) {

    const data = new Date(hora);

    return data.toLocaleTimeString("pt-BR", {
        hour: "2-digit",
        minute: "2-digit"
    });
}


// =========================
// FORMATAR VALOR
// =========================

function formatarValor(valor) {

    return Number(valor).toLocaleString("pt-BR", {
        style: "currency",
        currency: "BRL"
    });
}


// =========================
// CARREGAR VENDAS
// =========================

async function carregarVendas() {

    try {

        const resposta = await fetch("/vendas/");

        if (!resposta.ok) {
            throw new Error("Erro ao buscar vendas.");
        }

        const vendas = await resposta.json();


        if (vendas.length === 0) {

            listaVendas.innerHTML = `
                <p class="sem-vendas">
                    Nenhuma venda registrada.
                </p>
            `;

            return;
        }


        listaVendas.innerHTML = `
            <div class="tabela-container">

                <table>

                    <thead>

                        <tr>
                            <th>Data</th>
                            <th>Horário</th>
                            <th class="cabecalho-valor">Valor</th>
                            <th></th>
                        </tr>

                    </thead>

                    <tbody>

                        ${vendas.map(venda => `

                            <tr>

                                <td>
                                    ${formatarData(venda.data_venda)}
                                </td>

                                <td>
                                    ${formatarHora(venda.hora_registro)}
                                </td>

                                <td class="valor-tabela">
                                    ${formatarValor(venda.valor)}
                                </td>

                                <td class="acoes">

                                    <button
                                        class="btn-editar"
                                        onclick="editarVenda(${venda.id})"
                                    >
                                        Editar
                                    </button>

                                    <button
                                        class="btn-excluir"
                                        onclick="excluirVenda(${venda.id})"
                                    >
                                        Excluir
                                    </button>

                                </td>

                            </tr>

                        `).join("")}

                    </tbody>

                </table>

            </div>
        `;

    } catch (erro) {

        listaVendas.innerHTML = `
            <p class="erro">
                Não foi possível carregar o histórico.
            </p>
        `;

        console.error(erro);
    }
}


// =========================
// EDITAR VENDA
// =========================

async function editarVenda(id) {

    try {

        const resposta = await fetch("/vendas/");

        if (!resposta.ok) {
            throw new Error("Erro ao buscar vendas.");
        }

        const vendas = await resposta.json();

        const venda = vendas.find(
            venda => venda.id === id
        );


        if (!venda) {

            alert("Venda não encontrada.");

            return;
        }


        // Guarda o ID
        vendaEditandoId = id;


        // Coloca os dados no formulário
        dataInput.value = venda.data_venda;

        valorInput.value = Number(venda.valor).toFixed(2);


       


        botao.textContent =
            "SALVAR ALTERAÇÕES";


        botaoCancelar.hidden = false;


        // Coloca foco no valor
        valorInput.focus();


        // Volta para o topo
        window.scrollTo({
            top: 0,
            behavior: "smooth"
        });

    } catch (erro) {

        console.error(erro);

        alert("Não foi possível editar a venda.");
    }
}


// =========================
// CANCELAR EDIÇÃO
// =========================

function cancelarEdicao() {

    vendaEditandoId = null;

    form.reset();

    colocarDataAtual();



    botao.textContent =
        "REGISTRAR VENDA";


    botaoCancelar.hidden = true;

    mensagem.textContent = "";

    valorInput.focus();
}


botaoCancelar.addEventListener(
    "click",
    cancelarEdicao
);


// =========================
// EXCLUIR VENDA
// =========================

async function excluirVenda(id) {

    const confirmar = confirm(
        "Tem certeza que deseja excluir esta venda?"
    );


    if (!confirmar) {
        return;
    }


    try {

        const resposta = await fetch(
            `/vendas/${id}`,
            {
                method: "DELETE"
            }
        );


        if (!resposta.ok) {

            throw new Error(
                "Não foi possível excluir a venda."
            );
        }


        // Se estava editando essa venda
        if (vendaEditandoId === id) {
            cancelarEdicao();
        }


        mensagem.textContent =
            "✓ Venda excluída com sucesso.";


        // Atualiza histórico
        carregarVendas();

    } catch (erro) {

        console.error(erro);

        mensagem.textContent =
            "Erro ao excluir a venda.";
    }
}


// =========================
// ENVIAR FORMULÁRIO
// =========================

form.addEventListener(
    "submit",
    async function(event) {

        event.preventDefault();


        const dataVenda = dataInput.value;
        const valor = parseFloat(valorInput.value);


        if (!dataVenda) {

            mensagem.textContent =
                "Escolha uma data.";

            return;
        }


        if (!valor || valor <= 0) {

            mensagem.textContent =
                "Digite um valor maior que zero.";

            valorInput.focus();

            return;
        }


        botao.disabled = true;


        try {

            let resposta;


            // =========================
            // EDITANDO
            // =========================

            if (vendaEditandoId !== null) {

                botao.textContent =
                    "SALVANDO...";


                resposta = await fetch(
                    `/vendas/${vendaEditandoId}`,
                    {
                        method: "PUT",

                        headers: {
                            "Content-Type":
                                "application/json"
                        },

                        body: JSON.stringify({
                            data_venda: dataVenda,
                            valor: valor
                        })
                    }
                );

            }

            // =========================
            // NOVA VENDA
            // =========================

            else {

                botao.textContent =
                    "REGISTRANDO...";


                resposta = await fetch(
                    "/vendas/",
                    {
                        method: "POST",

                        headers: {
                            "Content-Type":
                                "application/json"
                        },

                        body: JSON.stringify({
                            data_venda: dataVenda,
                            valor: valor
                        })
                    }
                );
            }


            const venda = await resposta.json();


            if (!resposta.ok) {

                throw new Error(
                    "Não foi possível salvar."
                );
            }


            // =========================
            // EDITADO
            // =========================

            if (vendaEditandoId !== null) {

                mensagem.textContent =
                    `✓ Venda alterada para ${formatarValor(venda.valor)}.`;

                cancelarEdicao();

            }

            // =========================
            // NOVO
            // =========================

            else {

                mensagem.textContent =
                    `✓ Venda registrada! ${formatarValor(venda.valor)}`;

                valorInput.value = "";

                valorInput.focus();
            }


            // Atualiza histórico
            carregarVendas();

        } catch (erro) {

            mensagem.textContent =
                "Erro ao salvar a venda.";

            console.error(erro);

        } finally {

            botao.disabled = false;


            if (vendaEditandoId === null) {

                botao.textContent =
                    "REGISTRAR VENDA";

            }

        }

    }
);


// =========================
// INICIAR
// =========================

carregarVendas();