FROM python:3.11-slim

WORKDIR /app

COPY backend/ backend/
COPY requirements.txt .

RUN pip install --no-cache-dir -r requirements.txt

WORKDIR /app/backend

CMD ["uvicorn", "dashboard:app", "--host", "0.0.0.0", "--port", "8001"]
