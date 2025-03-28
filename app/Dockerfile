FROM python:3.11-slim

WORKDIR /app

# Copy the requirements file first for better layer caching
COPY requirements.txt .

# Install dependencies
RUN pip install --no-cache-dir -r requirements.txt

# Install Supervisor (and its dependency: apt-get update)
RUN apt-get update && apt-get install -y supervisor

# Copy the rest of the application code
COPY . .

# Copy the Supervisor configuration file
COPY supervisord.conf /etc/supervisor/conf.d/supervisord.conf

# Expose the port that Flask runs on
EXPOSE 5000

# Set environment variables
ENV FLASK_APP=app.py
ENV PYTHONPATH=/app

# Use Supervisor to run both the Flask app and Celery worker
CMD ["supervisord", "-n"]
