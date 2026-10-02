"""
Módulo de compatibilidad para importar app.
La aplicación principal se encuentra en backend/main.py para permitir el uso directo de:
fastapi dev
fastapi run
"""
from main import app

__all__ = ["app"]
