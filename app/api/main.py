from fastapi import FastAPI

from app.api.routes.repositories import router as repositories_router
from app.api.routes.questions import router as questions_router


app = FastAPI(
    title="CodeScope API",
    version="1.0.0",
)


@app.get("/")
def health_check():
    return {
        "message": "CodeScope API is running"
    }


app.include_router(repositories_router)
app.include_router(questions_router)