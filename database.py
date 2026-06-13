from sqlalchemy import create_engine, Column, Integer, String, Float, DateTime
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
import os
import datetime

# Usando SQLite localmente por padrão se o DATABASE_URL não estiver definido, 
# mas suporta Postgres através do docker-compose
SQLALCHEMY_DATABASE_URL = os.getenv("DATABASE_URL", "sqlite:///./sql_app.db")

# Ajuste para SQLite funcionar perfeitamente com FastAPI
connect_args = {"check_same_thread": False} if SQLALCHEMY_DATABASE_URL.startswith("sqlite") else {}

engine = create_engine(SQLALCHEMY_DATABASE_URL, connect_args=connect_args)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

class Consulta(Base):
    __tablename__ = "consultas"

    id = Column(Integer, primary_key=True, index=True)
    ip_usuario = Column(String, index=True)
    tipo_cliente = Column(String)
    valor_compra = Column(Float)
    desconto_percent = Column(Float, default=0.0)
    valor_final = Column(Float)
    cashback_gerado = Column(Float)
    data_consulta = Column(DateTime, default=datetime.datetime.utcnow)
