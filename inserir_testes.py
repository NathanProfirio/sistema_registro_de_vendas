from datetime import date, timedelta
from decimal import Decimal
import random

from app.database import SessionLocal
from app.models import Venda


db = SessionLocal()


try:

    vendas = []

    hoje = date.today()

    for _ in range(50):

        # Escolhe aleatoriamente um dos últimos 30 dias
        dias_atras = random.randint(0, 29)

        data_venda = hoje - timedelta(
            days=dias_atras
        )

        # Gera um valor entre R$ 10 e R$ 200
        valor = Decimal(
            str(
                round(
                    random.uniform(10, 200),
                    2
                )
            )
        )

        venda = Venda(
            data_venda=data_venda,
            valor=valor
        )

        vendas.append(venda)


    db.add_all(vendas)

    db.commit()

    print("50 vendas fictícias inseridas com sucesso!")


except Exception as erro:

    db.rollback()

    print("Erro:", erro)


finally:

    db.close()
