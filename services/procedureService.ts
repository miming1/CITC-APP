const BASE_URL = "https://citc-app.onrender.com";

export const fetchProcedure = async (id: number) => {
  const res = await fetch(`${BASE_URL}/process/${id}/`);
  
  if (!res.ok) {
    throw new Error("Failed to fetch procedure");
  }

  return await res.json();
};