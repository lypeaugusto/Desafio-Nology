from sqlalchemy import Column, Integer, Float, String, Boolean, DateTime
from database import Base
import datetime

class ConsultaCashback(Base):
    __tablename__ = "consultas"

    id = Column(Integer, primary_key=True, index=True)
    ip_usuario = Column(String, index=True)
    tipo_cliente = Column(String)  # 'VIP' ou 'Comum'
    valor_compra = Column(Float)
    desconto_percentual = Column(Float, default=0.0)
    cashback_gerado = Column(Float)
    data_consulta = Column(DateTime, default=datetime.datetime.utcnow)
