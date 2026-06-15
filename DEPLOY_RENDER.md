# 🚀 Guia de Deploy - Nology Cashback

## Pré-requisitos
- Conta no [Render](https://render.com/)
- GitHub com o repositório do projeto
- PostgreSQL (será criado no Render)

---

## 📋 Passo a Passo para Deploy

### 1. **Preparar o repositório Git**

```bash
# Na raiz do projeto
git add .
git commit -m "Prepare for Render deployment"
git push origin main
```

### 2. **Criar Serviço PostgreSQL no Render**

1. Acesse [render.com](https://render.com/) e faça login
2. Clique em **New +** → **PostgreSQL**
3. Configure:
   - **Name**: `cashback-db`
   - **Database**: `cashback_db`
   - **User**: `admin`
   - Render gerará uma senha automaticamente
4. Clique em **Create Database**
5. Copie a **Internal Database URL** gerada

### 3. **Criar Web Service para o Backend (API)**

1. Clique em **New +** → **Web Service**
2. Selecione seu repositório GitHub
3. Configure:
   - **Name**: `cashback-api`
   - **Runtime**: `Python 3`
   - **Build Command**: `pip install -r backend/requirements.txt && cd frontend && npm install && npm run build && cd ..`
   - **Start Command**: `cd backend && uvicorn main:app --host 0.0.0.0 --port $PORT`
4. **Environment Variables**:
   - `DATABASE_URL`: Cole a URL do PostgreSQL gerada no passo anterior
5. Clique em **Create Web Service**

### 4. **Fazer Deploy**

O Render fará deploy automaticamente. Espere o build completar (pode levar alguns minutos).

---

## 🔗 Acessar a Aplicação

Após o deploy bem-sucedido:
- **API**: `https://cashback-api.onrender.com`
- **Frontend**: `https://cashback-api.onrender.com` (servido pela API)

---

## 📝 Observações Importantes

- O frontend é servido pelo backend (FastAPI monta os arquivos estáticos)
- O banco de dados PostgreSQL no Render já vem com as tabelas criadas automaticamente (SQLAlchemy cria ao iniciar)
- CORS está habilitado para aceitar requisições de qualquer origem

---

## ❌ Troubleshooting

### Erro: "ModuleNotFoundError: No module named 'psycopg2'"
- Descomente a linha em `backend/requirements.txt`:
  ```
  psycopg2-binary==2.9.9
  ```

### Erro: "Database connection refused"
- Verifique se a `DATABASE_URL` está correta no Render
- Aguarde a inicialização do PostgreSQL (pode levar alguns minutos)

### Frontend não carrega
- Certifique-se de que o build do frontend passou (verifique nos logs do Render)
- A pasta `static/` deve estar sendo servida pelo FastAPI

---

## 🔄 Configurar Deploy Automático

Render faz deploy automático a cada push no GitHub. Para desabilitar:
1. Vá para a configuração do Web Service
2. Em **Auto-Deploy**, selecione **Off**

