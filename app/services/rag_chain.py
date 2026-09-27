import os
import time

from dotenv import load_dotenv
from langchain_google_genai import ChatGoogleGenerativeAI
from langchain_core.messages import AIMessage, HumanMessage
from langchain_core.prompts import ChatPromptTemplate, MessagesPlaceholder

from app.services.retriever import retrieve_documents


load_dotenv()


MAX_RETRIES = 3
MAX_HISTORY_ITEMS = 5


def get_llm(model, api_key):
    return ChatGoogleGenerativeAI(
        model=model,
        google_api_key=api_key,
    )


def get_gemini_keys():
    keys = []
    index = 1

    while True:
        key = os.getenv(f"GEMINI_API_KEY_{index}")

        if not key:
            break

        keys.append(key)
        index += 1

    return keys


def get_gemini_models():
    models = []

    primary_model = os.getenv("GEMINI_MODEL_PRIMARY")

    if primary_model:
        models.append(primary_model)

    index = 1

    while True:
        model = os.getenv(
            f"GEMINI_MODEL_FALLBACK_{index}"
        )

        if not model:
            break

        models.append(model)
        index += 1

    return models


def format_chat_history_to_messages(chat_history):
    if not chat_history:
        return []

    recent_history = chat_history[-MAX_HISTORY_ITEMS:]
    messages = []
    
    for item in recent_history:
        messages.append(HumanMessage(content=item['question']))
        messages.append(AIMessage(content=item['answer']))
        
    return messages


def expand_query_if_arabic(query: str, llm=None) -> str:
    is_arabic = any('\u0600' <= c <= '\u06FF' for c in query)
    
    if not is_arabic or not llm:
        return query

    translation_prompt = f"""
Translate and adapt the following Arabic software engineering question into a precise, concise English code-search query optimized for a code retriever (include file names, SQL queries, or backend endpoints if implied):
Arabic Question: {query}
English Search Query only:
"""
    try:
        response = llm.invoke(translation_prompt)
        translated_query = response.content.strip()
        return translated_query
    except Exception:
        return query


def should_try_next_key(error):
    error_text = str(error).lower()

    return any(
        value in error_text
        for value in [
            "401",
            "403",
            "429",
            "resource_exhausted",
            "quota",
            "rate limit",
        ]
    )


def should_try_next_model(error):
    error_text = str(error).lower()

    return any(
        value in error_text
        for value in [
            "404",
            "model_not_found",
            "not found",
            "unsupported model",
        ]
    )


def ask_repository(repository_id, question, chat_history=None):
    chat_history = chat_history or []

    if chat_history:
        last_question = chat_history[-1]["question"]

        retrieval_query = f"""
Previous user question:
{last_question}

Current user question:
{question}
"""
    else:
        retrieval_query = question

    models = get_gemini_models()
    keys = get_gemini_keys()

    primary_model = models[0] if models else None
    primary_key = keys[0] if keys else None

    translation_llm = (
        get_llm(primary_model, primary_key)
        if primary_model and primary_key
        else None
    )

    expanded_retrieval_query = expand_query_if_arabic(
        retrieval_query,
        translation_llm,
    )

    documents = retrieve_documents(
        repository_id,
        expanded_retrieval_query,
    )

    if not documents:
        return {
            "answer": (
                "I could not find enough relevant information "
                "in the repository to answer this question."
            ),
            "sources": [],
        }

    context = "\n\n".join(
        f"File Path: {document.metadata.get('relative_path', 'Unknown')}\n"
        f"Source Type: {document.metadata.get('source_type', 'code')}\n"
        f"Content:\n{document.page_content}"
        for document in documents
    )

    history_messages = format_chat_history_to_messages(
        chat_history
    )

    prompt_template = ChatPromptTemplate.from_messages([
        (
            "system",
            """You are CodeScope, an AI assistant specialized in understanding software repositories and architectural documentation.

Answer the user's question using the provided repository context and conversation history when it helps interpret a follow-up question.

Important rules:
- The repository context is the source of truth for facts about the repository.
- If the context contains architectural documentation (source_type: document), use it to explain system design, high-level architecture, or requirements.
- If the context contains source code (source_type: code), use it to explain implementation details, functions, and logic.
- Do not invent repository details that are not supported by the repository context.
- Use conversation history only to understand follow-up questions such as "clarify more", "explain that", or "what do you mean?".
- If the current question is a follow-up asking for clarification, you may explain previously established information in simpler terms.
- Prefer giving specific technical details such as file names, functions, classes, endpoints, or variables when they are present in the repository context.
- If the answer cannot be determined from the repository context or previous supported conversation, clearly say that you could not find it.
- **CRITICAL LANGUAGE RULE:** You MUST answer the user in the EXACT SAME LANGUAGE as the "Current User Question" below (if the user asks in Arabic, reply entirely in Arabic. If in English, reply in English).

Repository Context:
{context}
""",
        ),
        MessagesPlaceholder(variable_name="chat_history"),
        ("human", "{question}")
    ])

    response = None
    last_error = None

    for model_index, model in enumerate(models):

        for key_index, api_key in enumerate(keys):

            if not api_key:
                continue

            print(
                f"Trying model: {model} with key: {key_index + 1}"
            )

            llm = get_llm(model, api_key)

            chain = prompt_template | llm

            move_to_next_key = False
            move_to_next_model = False

            for attempt in range(MAX_RETRIES):
                try:
                    response = chain.invoke({
                        "context": context,
                        "chat_history": history_messages,
                        "question": question,
                    })

                    break

                except Exception as error:
                    last_error = error

                    print(
                        f"Request error: {error}"
                    )

                    if should_try_next_model(error):
                        move_to_next_model = True
                        break

                    if should_try_next_key(error):
                        move_to_next_key = True
                        break

                    if attempt < MAX_RETRIES - 1:
                        wait_time = 2 ** attempt

                        print(
                            f"Request failed. Retrying in "
                            f"{wait_time} seconds..."
                        )

                        time.sleep(wait_time)

            if response:
                break

            if move_to_next_model:
                break

            if move_to_next_key:
                print(
                    f"Key {key_index + 1} failed. "
                    f"Trying next key..."
                )
                continue

        if response:
            break

        print(
            f"Model {model} failed. "
            f"Trying fallback model..."
        )

    if not response:
        return {
            "answer": (
                "The AI service is temporarily unavailable. "
                "Please try again later."
            ),
            "sources": [],
            "error": str(last_error),
        }

    final_answer = response.text

    is_question_arabic = any(
        '\u0600' <= c <= '\u06FF'
        for c in question
    )

    is_answer_arabic = any(
        '\u0600' <= c <= '\u06FF'
        for c in final_answer
    )

    if (
        is_question_arabic
        and not is_answer_arabic
        and translation_llm
    ):
        translation_back_prompt = f"""
Translate the following technical answer into clear, professional Arabic, keeping all file names, code terms, and technical names (like FastAPI, Streamlit, Python) intact:
Answer to translate:
{final_answer}
Arabic translation only:
"""

        try:
            trans_response = translation_llm.invoke(
                translation_back_prompt
            )

            final_answer = (
                trans_response.content.strip()
            )

        except Exception:
            pass

    sources = []
    seen_sources = set()

    for document in documents:
        source = document.metadata.get(
            "source",
            "",
        )

        if source in seen_sources:
            continue

        seen_sources.add(source)

        raw_content = document.page_content.strip()

        if "---" in raw_content:
            parts = raw_content.split(
                "---",
                1,
            )

            evidence = (
                parts[1].strip()
                if len(parts) > 1
                else raw_content
            )
        else:
            evidence = raw_content

        if len(evidence) > 1000:
            evidence = evidence[:1000] + "..."

        sources.append(
            {
                "file_name": document.metadata.get(
                    "file_name",
                    "",
                ),
                "relative_path": document.metadata.get(
                    "relative_path",
                    "",
                ),
                "source_type": document.metadata.get(
                    "source_type",
                    "code",
                ),
                "evidence": evidence,
            }
        )

    return {
        "answer": final_answer,
        "sources": sources,
    }