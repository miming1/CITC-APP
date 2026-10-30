import requests

text = "What documents are required to process an incomplete grade?"

response = requests.post(
    "http://localhost:11434/api/embed",
    json={
        "model": "nomic-embed-text",
        "input": text
    }
)

data = response.json()

print("Embedding generated successfully.")
print("Vector length:", len(data["embeddings"][0]))
print("First 5 values:", data["embeddings"][0][:5])