from sqlalchemy import Column, Integer, Date, DateTime, Numeric
from datetime import datetime

from .database import Base


class Venda(Base):
    __tablename__ = "vendas"

    id = Column(Integer, primary_key=True, index=True)

    data_venda = Column(
        Date,
        nullable=False
    )

    hora_registro = Column(
        DateTime,
        default=datetime.now,
        nullable=False
    )

    valor = Column(
        Numeric(10, 2),
        nullable=False
    )