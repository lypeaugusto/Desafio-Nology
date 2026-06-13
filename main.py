from fastapi import FastAPI, Depends, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import HTMLResponse
from fastapi.staticfiles import StaticFiles
from sqlalchemy.orm import Session
from pydantic import BaseModel
import os

import database
import cashback as cashback_module

# Cria as tabelas do banco de dados (no SQLite ou Postgres)
database.Base.metadata.create_all(bind=database.engine)

app = FastAPI(title="Cashback API")

# Habilitar CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Dependência do DB
def get_db():
    db = database.SessionLocal()
    try:
        yield db
    finally:
        db.close()

class ConsultaRequest(BaseModel):
    tipo_cliente: str # 'vip' ou 'normal'
    preco_original: float
    desconto_percent: float = 0.0

def calcular_cashback(valor_final: float, is_vip: bool) -> float:
    # Mantemos essa função compatível, delegando ao módulo cashback
    return cashback_module.calcular_cashback(valor_final, is_vip)["cashback_final"]

@app.post("/api/cashback")
def calculate_and_save(request: Request, data: ConsultaRequest, db: Session = Depends(get_db)):
    # Obter o IP do cliente
    ip = request.client.host
    if request.headers.get("X-Forwarded-For"):
        ip = request.headers.get("X-Forwarded-For").split(",")[0]
        
    is_vip = data.tipo_cliente.lower().strip() == 'vip'
    # Calcular a partir do preço original e desconto
    resultado = cashback_module.compute_from_price(data.preco_original, data.desconto_percent, is_vip)
    cashback = resultado["cashback_final"]
    valor_final = resultado["valor_final"]
    
    # Registrar no banco
    nova_consulta = database.Consulta(
        ip_usuario=ip,
        tipo_cliente=data.tipo_cliente,
        valor_compra=data.preco_original,
        desconto_percent=data.desconto_percent,
        valor_final=valor_final,
        cashback_gerado=cashback
    )
    db.add(nova_consulta)
    db.commit()
    db.refresh(nova_consulta)
    
    return {"cashback": cashback}

@app.get("/api/historico")
def get_historico(request: Request, db: Session = Depends(get_db)):
    # Obter o IP do cliente
    ip = request.client.host
    if request.headers.get("X-Forwarded-For"):
        ip = request.headers.get("X-Forwarded-For").split(",")[0]
        
    consultas = db.query(database.Consulta).filter(database.Consulta.ip_usuario == ip).order_by(database.Consulta.data_consulta.desc()).all()

    return [
        {
            "id": c.id,
            "tipo_cliente": c.tipo_cliente,
            "valor_compra": c.valor_compra,
            "desconto_percent": c.desconto_percent,
            "valor_final": c.valor_final,
            "cashback_gerado": c.cashback_gerado,
            "data_consulta": c.data_consulta.strftime("%d/%m/%Y %H:%M:%S")
        }
        for c in consultas
    ]

# Monta os arquivos estáticos (Frontend)
app.mount("/", StaticFiles(directory="static", html=True), name="static")
