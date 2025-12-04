# ---------------------------
# 1️⃣ FRONTEND BUILD (React)
# ---------------------------
FROM node:18-alpine AS frontend-build
WORKDIR /app/frontend

# Install node deps
COPY frontend/package*.json ./
RUN npm install

# Build Vite app
COPY frontend/ .
RUN npm run build


# ---------------------------
# 2️⃣ BACKEND BUILD (Django)
# ---------------------------
FROM python:3.11-slim AS backend-build
ENV PYTHONDONTWRITEBYTECODE=1
ENV PYTHONUNBUFFERED=1
ENV IS_DOCKER_BUILD=1

WORKDIR /app

# ✅ System packages for mysqlclient, Pillow, psycopg2, etc.
RUN apt-get update && apt-get install -y \
    default-libmysqlclient-dev \
    build-essential \
    pkg-config \
    libjpeg-dev \
    zlib1g-dev \
    libpq-dev \
    && rm -rf /var/lib/apt/lists/*

# ✅ Python deps
COPY requirements.txt .
RUN pip install --upgrade pip setuptools wheel
RUN pip install -r requirements.txt

# ✅ Copy Django project
COPY backend/ ./backend
COPY backend/manage.py ./manage.py

# ✅ Copy frontend build into Django static folder
#  (frontend_dist ကိုသုံးနေတဲ့အတွက် ဒီ path ထားရမယ်)
COPY --from=frontend-build /app/frontend/frontend_dist ./backend/static/

# RUN python manage.py collectstatic --noinput || true
# RUN echo "=== Collectstatic debug output ==="
# RUN python -X dev manage.py collectstatic --noinput



# ---------------------------
# 3️⃣ PRODUCTION IMAGE
# ---------------------------
FROM nginx:1.25-alpine

# Nginx config
COPY nginx.conf /etc/nginx/nginx.conf

# Static files for nginx
COPY --from=backend-build /app/backend/static /var/www/static/

# Gunicorn + Django app code
COPY --from=backend-build /usr/local/lib/python3.11 /usr/local/lib/python3.11
COPY --from=backend-build /usr/local/bin /usr/local/bin
COPY --from=backend-build /app /app

WORKDIR /app

EXPOSE 80

CMD ["sh", "-c", \"gunicorn backend.wsgi:application --bind 0.0.0.0:8000 & nginx -g 'daemon off;'\"]
