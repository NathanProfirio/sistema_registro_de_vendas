from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from ..database import get_db
from ..models import Venda
from ..schemas import VendaCreate, VendaResponse


router = APIRouter(
    prefix="/vendas",
    tags=["Vendas"]
)


# =========================
# CRIAR VENDA
# =========================

@router.post("/", response_model=VendaResponse)
def criar_venda(
    venda: VendaCreate,
    db: Session = Depends(get_db)
):
    nova_venda = Venda(
        data_venda=venda.data_venda,
        valor=venda.valor
    )

    db.add(nova_venda)
    db.commit()
    db.refresh(nova_venda)

    return nova_venda


# =========================
# LISTAR VENDAS
# =========================

@router.get("/", response_model=list[VendaResponse])
def listar_vendas(
    db: Session = Depends(get_db)
):
    vendas = (
        db.query(Venda)
        .order_by(
            Venda.data_venda.desc(),
            Venda.hora_registro.desc()
        )
        .all()
    )

    return vendas


# =========================
# EDITAR VENDA
# =========================

@router.put("/{venda_id}", response_model=VendaResponse)
def editar_venda(
    venda_id: int,
    venda: VendaCreate,
    db: Session = Depends(get_db)
):
    venda_existente = (
        db.query(Venda)
        .filter(Venda.id == venda_id)
        .first()
    )

    if not venda_existente:
        raise HTTPException(
            status_code=404,
            detail="Venda não encontrada."
        )

    venda_existente.data_venda = venda.data_venda
    venda_existente.valor = venda.valor

    db.commit()
    db.refresh(venda_existente)

    return venda_existente


# =========================
# EXCLUIR VENDA
# =========================

@router.delete("/{venda_id}")
def excluir_venda(
    venda_id: int,
    db: Session = Depends(get_db)
):
    venda = (
        db.query(Venda)
        .filter(Venda.id == venda_id)
        .first()
    )

    if not venda:
        raise HTTPException(
            status_code=404,
            detail="Venda não encontrada."
        )

    db.delete(venda)
    db.commit()

    return {
        "mensagem": "Venda excluída com sucesso."
    }