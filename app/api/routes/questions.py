from fastapi import APIRouter, HTTPException
from pydantic import BaseModel


from app.services.rag_chain import ask_repository


router = APIRouter(
    prefix="/repositories",
    tags=["Questions"],
)


class QuestionRequest(BaseModel):
    question: str
    chat_history: list[dict] = []


@router.post("/{repository_id}/ask")
def ask_question(
    repository_id: str,
    request: QuestionRequest,
):

    try:
        result = ask_repository(
            repository_id=repository_id,
            question=request.question,
            chat_history=request.chat_history,
        )

        return result

    except Exception as error:
        raise HTTPException(
            status_code=500,
            detail=str(error),
        )