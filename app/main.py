from fastapi import FastAPI, Request
from fastapi.staticfiles import StaticFiles
from fastapi.templating import Jinja2Templates

from .database import Base, engine
from . import models
from .routers import vendas
from .routers import dashboard


# Cria as tabelas do banco
Base.metadata.create_all(bind=engine)


app = FastAPI(
    title="Sistema de Vendas",
    description="Sistema simplificado para registro e análise de vendas.",
    version="1.0.0"
)


# Arquivos CSS e JavaScript
app.mount(
    "/static",
    StaticFiles(directory="app/static"),
    name="static"
)


# Templates HTML
templates = Jinja2Templates(
    directory="app/templates"
)


# Rotas da API
app.include_router(vendas.router)
app.include_router(dashboard.router)


# Página inicial
@app.get("/")
def inicio(request: Request):

    return templates.TemplateResponse(
        request=request,
        name="vendas.html"
    )


# Dashboard
@app.get("/dashboard")
def pagina_dashboard(request: Request):

    return templates.TemplateResponse(
        request=request,
        name="dashboard.html"
    )