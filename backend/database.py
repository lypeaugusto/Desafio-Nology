import os
from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker

# Usa a variável de ambiente do Render ou fallback para localhost
SQLALCHEMY_DATABASE_URL = os.getenv("DATABASE_URL", "postgresql://admin:password@localhost:5432/cashback_db")

# O SQLAlchemy 1.4+ exige 'postgresql://', mas o Render às vezes injeta 'postgres://'
if SQLALCHEMY_DATABASE_URL.startswith("postgres://"):
    SQLALCHEMY_DATABASE_URL = SQLALCHEMY_DATABASE_URL.replace("postgres://", "postgresql://", 1)

engine = create_engine(SQLALCHEMY_DATABASE_URL)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
