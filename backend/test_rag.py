import requests
import chromadb


# --------------------------------------------------
# 1. Ollama settings
# --------------------------------------------------

OLLAMA_EMBED_URL = "http://localhost:11434/api/embed"
OLLAMA_CHAT_URL = "http://localhost:11434/api/chat"

EMBEDDING_MODEL = "nomic-embed-text"
LLM_MODEL = "gemma3:4b"


# --------------------------------------------------
# 2. Generate an embedding
# --------------------------------------------------

def create_embedding(text):

    response = requests.post(
        OLLAMA_EMBED_URL,
        json={
            "model": EMBEDDING_MODEL,
            "input": text
        }
    )

    response.raise_for_status()

    return response.json()["embeddings"][0]


# --------------------------------------------------
# 3. Ask the LLM
# --------------------------------------------------

def ask_llm(question, context):

    prompt = f"""
You are the CITC Academic Procedure Assistant.

Answer the student's question using ONLY the information
provided in the context below.

Do not invent requirements, procedures, deadlines,
offices, or policies that are not included in the context.

If the context does not contain enough information to
answer the question, say that the available information
does not provide enough details.

Context:
{context}

Student question:
{question}
"""

    response = requests.post(
        OLLAMA_CHAT_URL,
        json={
            "model": LLM_MODEL,
            "messages": [
                {
                    "role": "user",
                    "content": prompt
                }
            ],
            "stream": False
        }
    )

    response.raise_for_status()

    return response.json()["message"]["content"]


# --------------------------------------------------
# 4. Connect to ChromaDB
# --------------------------------------------------

client = chromadb.PersistentClient(
    path="./chroma_citc"
)

collection = client.get_or_create_collection(
    name="citc_knowledge"
)


# --------------------------------------------------
# 5. Student question
# --------------------------------------------------

question = "What should I do if I have an incomplete grade?"


# --------------------------------------------------
# 6. Convert question into an embedding
# --------------------------------------------------

question_embedding = create_embedding(question)


# --------------------------------------------------
# 7. Retrieve relevant information from ChromaDB
# --------------------------------------------------

results = collection.query(
    query_embeddings=[question_embedding],
    n_results=2
)

retrieved_documents = results["documents"][0]


print("Student question:")
print(question)

print("\nRetrieved information:")

for document in retrieved_documents:
    print("-", document)


# --------------------------------------------------
# 8. Combine retrieved documents into context
# --------------------------------------------------

context = "\n\n".join(retrieved_documents)


# --------------------------------------------------
# 9. Send the context to Gemma
# --------------------------------------------------

answer = ask_llm(question, context)


# --------------------------------------------------
# 10. Display the generated answer
# --------------------------------------------------

print("\nAI answer:")
print(answer)