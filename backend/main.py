from fastapi import FastAPI, Depends, Request
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from typing import List
from pydantic import BaseModel
import models, database

# Criar as tabelas no banco de dados
models.Base.metadata.create_all(bind=database.engine)

app = FastAPI(title="Cashback API")

# Configurar CORS para permitir que o frontend acesse a API
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Permitir todos (apenas para ambiente de desenvolvimento)
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Schemas Pydantic para validação de dados
class ConsultaRequest(BaseModel):
    valor_compra: float
    desconto_percentual: float
    tipo_cliente: str  # 'VIP' ou 'Comum'

from datetime import datetime

class ConsultaResponse(BaseModel):
    id: int
    ip_usuario: str
    tipo_cliente: str
    valor_compra: float
    desconto_percentual: float
    cashback_gerado: float
    data_consulta: datetime

    model_config = {"from_attributes": True}

# Função principal de cálculo do cashback
def calcular_cashback(valor_compra: float, desconto_percentual: float, is_vip: bool) -> float:
    valor_final = valor_compra * (1 - desconto_percentual / 100)
    cashback_base = valor_final * 0.05
    cashback_bonus = cashback_base * 0.10 if is_vip else 0.0
    cashback_total = cashback_base + cashback_bonus
    
    if valor_final > 500:
        cashback_total *= 2
        
    return round(cashback_total, 2)

@app.post("/calcular", response_model=ConsultaResponse)
def realizar_consulta(consulta: ConsultaRequest, request: Request, db: Session = Depends(database.get_db)):
    ip = request.client.host
    is_vip = consulta.tipo_cliente.upper() == "VIP"
    
    cashback = calcular_cashback(
        valor_compra=consulta.valor_compra,
        desconto_percentual=consulta.desconto_percentual,
        is_vip=is_vip
    )
    
    nova_consulta = models.ConsultaCashback(
        ip_usuario=ip,
        tipo_cliente=consulta.tipo_cliente,
        valor_compra=consulta.valor_compra,
        desconto_percentual=consulta.desconto_percentual,
        cashback_gerado=cashback
    )
    
    db.add(nova_consulta)
    db.commit()
    db.refresh(nova_consulta)
    
    return nova_consulta

@app.get("/historico", response_model=List[ConsultaResponse])
def obter_historico(request: Request, db: Session = Depends(database.get_db)):
    ip = request.client.host
    consultas = db.query(models.ConsultaCashback).filter(models.ConsultaCashback.ip_usuario == ip).order_by(models.ConsultaCashback.data_consulta.desc()).all()
    return consultas
