"""
Configuración de Gunicorn para producción
"""
import multiprocessing
import os

# Directorios
BASE_DIR = os.path.dirname(os.path.abspath(__file__))

# Bind
bind = "127.0.0.1:8000"

# Workers
workers = multiprocessing.cpu_count() * 2 + 1
worker_class = "sync"
worker_connections = 1000
timeout = 120
keepalive = 5

# Logging
accesslog = os.path.join(BASE_DIR, "logs", "gunicorn_access.log")
errorlog = os.path.join(BASE_DIR, "logs", "gunicorn_error.log")
loglevel = "info"
access_log_format = '%(h)s %(l)s %(u)s %(t)s "%(r)s" %(s)s %(b)s "%(f)s" "%(a)s"'

# Process naming
proc_name = "insssep_app"

# Server mechanics
daemon = False
pidfile = os.path.join(BASE_DIR, "logs", "gunicorn.pid")
umask = 0
user = None
group = None
tmp_upload_dir = None

# Reload on code changes (solo para desarrollo, desactivar en producción)
reload = False
reload_extra_files = []

# Maximum requests antes de reiniciar worker (previene memory leaks)
max_requests = 1000
max_requests_jitter = 50

# Graceful timeout
graceful_timeout = 30

# Preload application
preload_app = True
