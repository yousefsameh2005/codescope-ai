from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api.routes.repositories import (
    router as repositories_router,
)
from app.api.routes.questions import (
    router as questions_router,
)


app = FastAPI(
    title="CodeScope API",
    version="1.0.0",
)


app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://127.0.0.1:5173",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/")
def health_check():
    return {
        "message": "CodeScope API is running"
    }


app.include_router(repositories_router)
app.include_router(questions_router)