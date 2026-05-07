const BASE_URL = "http://127.0.0.1:8000";

export const fetchProcedure = async (id: number) => {
  const res = await fetch(`${BASE_URL}/process/${id}/`);
  
  if (!res.ok) {
    throw new Error("Failed to fetch procedure");
  }

  return await res.json();
};