# ---------------------------
# 1️⃣ FRONTEND BUILD (React)
# ---------------------------
FROM node:18-alpine AS frontend-build
WORKDIR /app/frontend
COPY frontend/package*.json ./
RUN npm install
COPY frontend/ .
RUN npm run build


# ---------------------------
# 2️⃣ BACKEND BUILD (Django)
# ---------------------------
FROM python:3.11-slim AS backend-build
ENV PYTHONDONTWRITEBYTECODE 1
ENV PYTHONUNBUFFERED 1

WORKDIR /app

# Install dependencies
COPY requirements.txt .
RUN pip install --upgrade pip
RUN pip install -r requirements.txt

# Copy Django project
COPY backend/ ./backend
COPY backend/manage.py .

# Copy frontend build into Django static folder
COPY --from=frontend-build /app/frontend/dist ./backend/static/

# Collect static
RUN python manage.py collectstatic --noinput


# ---------------------------
# 3️⃣ PRODUCTION IMAGE
# ---------------------------
FROM nginx:1.25-alpine

# Copy nginx config
COPY nginx.conf /etc/nginx/nginx.conf

# Copy static files served by nginx
COPY --from=backend-build /app/backend/static /var/www/static/

# Gunicorn + Django
COPY --from=backend-build /usr/local/lib/python3.11 /usr/local/lib/python3.11
COPY --from=backend-build /usr/local/bin /usr/local/bin
COPY --from=backend-build /app /app

WORKDIR /app

EXPOSE 80

CMD ["sh", "-c", "gunicorn backend.wsgi:application --bind 0.0.0.0:8000 & nginx -g 'daemon off;'"]
