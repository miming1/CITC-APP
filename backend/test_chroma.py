import chromadb

# Create a local ChromaDB database
client = chromadb.PersistentClient(path="./chroma_test")

# Create a collection
collection = client.get_or_create_collection(name="citc_test")

# Sample CITC information
documents = [
    "Students must submit the required documents to the appropriate CITC office for processing.",
    "An incomplete grade may require the student to coordinate with the concerned instructor and submit the required documents.",
    "Students can check the status of their submitted academic requests through the system."
]

# Simple sample embeddings
embeddings = [
    [0.1, 0.2, 0.3],
    [0.2, 0.3, 0.4],
    [0.3, 0.4, 0.5]
]

# Store the documents and their embeddings
collection.add(
    ids=["doc1", "doc2", "doc3"],
    documents=documents,
    embeddings=embeddings
)

print("Documents successfully stored in ChromaDB.")

# Search using a sample embedding
results = collection.query(
    query_embeddings=[[0.2, 0.3, 0.4]],
    n_results=2
)

print("\nRetrieved documents:")
for document in results["documents"][0]:
    print("-", document)