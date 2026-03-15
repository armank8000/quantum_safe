from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.config import settings

app = FastAPI(
    title="Quantum Shield API",
    description="PQC Intelligence Platform — APT HEX",
    version="1.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://localhost:3000",
        "http://localhost:80",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/health", tags=["System"])
def health_check():
    return {
        "status": "ok",
        "project": "Quantum Shield",
        "team": "APT HEX",
        "version": "1.0.0"
    }

@app.get("/", tags=["System"])
def root():
    return {"message": "Quantum Shield API running. Visit /docs"}

# Day 2: from app.routers import auth; app.include_router(auth.router)
# Day 3: from app.routers import dashboard; app.include_router(dashboard.router)
# Day 4: from app.routers import scanner; app.include_router(scanner.router)
