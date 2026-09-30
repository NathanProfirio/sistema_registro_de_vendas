from datetime import date, datetime
from decimal import Decimal

from pydantic import BaseModel, ConfigDict


class VendaCreate(BaseModel):
    data_venda: date
    valor: Decimal


class VendaResponse(BaseModel):
    id: int
    data_venda: date
    hora_registro: datetime
    valor: Decimal

    model_config = ConfigDict(from_attributes=True)