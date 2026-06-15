# Build stage for frontend
FROM node:18-alpine AS frontend-builder

WORKDIR /frontend
COPY frontend/package*.json ./
RUN npm install
COPY frontend/src ./src
COPY frontend/*.js ./
COPY frontend/index.html ./
RUN npm run build

# Backend stage
FROM python:3.10-slim

WORKDIR /app

COPY backend/requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY backend/ .

# Create static directory and copy frontend build
RUN mkdir -p static
COPY --from=frontend-builder /frontend/dist/* static/

CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]
