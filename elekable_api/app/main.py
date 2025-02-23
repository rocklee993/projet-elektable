from fastapi import FastAPI
from .database import init_db
from app.routes import user_routes

app = FastAPI(title="FastAPI + SQLModel Example")


# Initialisation de la BDD au démarrage
@app.on_event("startup")
def on_startup():
    init_db()


# Inclusion des routes
app.include_router(user_routes.router)

# Démarrer l'API avec: uvicorn app.main:app --reload
