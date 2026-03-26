from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.config import settings
from app.routers import auth

app = FastAPI(
    title="Quantum Shield API",
    description="PQC Intelligence Platform — APT HEX",
    version="1.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:3000", "http://localhost:80"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ── Routers ───────────────────────────────────────────────────────────────────
app.include_router(auth.router)

# Day 3: from app.routers import dashboard; app.include_router(dashboard.router)
# Day 4: from app.routers import assets;   app.include_router(assets.router)
# Day 5: from app.routers import scanner;  app.include_router(scanner.router)

@app.get("/health", tags=["System"])
def health():
    return {"status": "ok", "project": "Quantum Shield", "team": "APT HEX", "version": "1.0.0"}
