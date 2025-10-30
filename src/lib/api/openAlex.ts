const OPENALEX_BASE = "https://api.openalex.org";

export async function searchPapers(query: string) {
  const res = await fetch(`${OPENALEX_BASE}/works?search=${query}`);
  if (!res.ok) throw new Error("Failed to fetch papers from OpenAlex");
  return res.json();
}

export async function getPaperDetails(id: string) {
  const res = await fetch(`${OPENALEX_BASE}/works/${id}`);
  if (!res.ok) throw new Error("Failed to fetch paper details");
  return res.json();
}

export async function searchAuthors(query: string) {
  const res = await fetch(`${OPENALEX_BASE}/authors?search=${query}`);
  if (!res.ok) throw new Error("Failed to fetch authors");
  return res.json();
}
