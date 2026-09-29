FROM python:3.12-slim

WORKDIR /app

RUN apt-get update && apt-get install -y git \
    && rm -rf /var/lib/apt/lists/*

# torch CPU-only
RUN pip install --no-cache-dir torch==2.13.0 --index-url https://download.pytorch.org/whl/cpu

# pip أحدث
RUN pip install --no-cache-dir --upgrade pip

# scipy لوحده، 3 محاولات، وcache للتحميلات
RUN --mount=type=cache,target=/root/.cache/pip \
    pip install --default-timeout=120 --retries 10 scipy==1.18.1 \
    || pip install --default-timeout=120 --retries 10 scipy==1.18.1 \
    || pip install --default-timeout=120 --retries 10 scipy==1.18.1

COPY requirements.txt .
RUN --mount=type=cache,target=/root/.cache/pip \
    pip install --default-timeout=120 --retries 10 -r requirements.txt

COPY app ./app

RUN mkdir -p \
    data/chroma_db \
    data/repositories \
    data/repositories_data \
    data/uploads

ENV PYTHONUNBUFFERED=1
ENV PYTHONDONTWRITEBYTECODE=1

EXPOSE 8000

CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]