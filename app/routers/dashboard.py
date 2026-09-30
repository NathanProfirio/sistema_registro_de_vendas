from datetime import date
from decimal import Decimal

from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session

from ..database import get_db
from ..models import Venda


router = APIRouter(
    prefix="/dashboard",
    tags=["Dashboard"]
)


@router.get("/resumo")
def resumo_dashboard(
    data_inicio: date | None = Query(None),
    data_fim: date | None = Query(None),
    db: Session = Depends(get_db)
):

    query = db.query(Venda)

    if data_inicio:
        query = query.filter(
            Venda.data_venda >= data_inicio
        )

    if data_fim:
        query = query.filter(
            Venda.data_venda <= data_fim
        )

    vendas = query.all()


    # ======================================
    # RESUMO
    # ======================================

    quantidade_vendas = len(vendas)

    faturamento = sum(
        (venda.valor for venda in vendas),
        Decimal("0.00")
    )


    if quantidade_vendas > 0:

        ticket_medio = (
            faturamento / quantidade_vendas
        )

    else:

        ticket_medio = Decimal("0.00")


    # ======================================
    # DADOS DOS GRÁFICOS
    # ======================================

    vendas_por_dia = {}

    quantidade_por_dia = {}


    for venda in vendas:

        data = venda.data_venda.isoformat()


        # Faturamento

        if data not in vendas_por_dia:

            vendas_por_dia[data] = Decimal("0.00")

        vendas_por_dia[data] += venda.valor


        # Quantidade de vendas

        if data not in quantidade_por_dia:

            quantidade_por_dia[data] = 0

        quantidade_por_dia[data] += 1


    # ======================================
    # GRÁFICO DE FATURAMENTO
    # ======================================

    grafico = [

        {
            "data": data,
            "valor": float(valor)
        }

        for data, valor in sorted(
            vendas_por_dia.items()
        )

    ]


    # ======================================
    # GRÁFICO DE QUANTIDADE
    # ======================================

    grafico_quantidade = [

        {
            "data": data,
            "quantidade": quantidade
        }

        for data, quantidade in sorted(
            quantidade_por_dia.items()
        )

    ]


    return {

        "quantidade_vendas":
            quantidade_vendas,

        "faturamento":
            float(faturamento),

        "ticket_medio":
            float(ticket_medio),

        "grafico":
            grafico,

        "grafico_quantidade":
            grafico_quantidade

    }