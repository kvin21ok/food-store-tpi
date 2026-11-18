from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.core.config import settings
from app.core.database import create_all_tables
import app.db.base

API_PREFIX = "/api/v1"


@asynccontextmanager
async def lifespan(app: FastAPI):
    create_all_tables()
    yield


app = FastAPI(title="Food Store API", version="1.0.0", lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[settings.FRONTEND_ORIGIN],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get(f"{API_PREFIX}/health", tags=["Health"])
def health():
    return {"status": "ok"}