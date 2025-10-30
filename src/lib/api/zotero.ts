const ZOTERO_BASE = "https://api.zotero.org";

export async function getZoteroCollection(userId: string, apiKey?: string) {
  const headers: HeadersInit = apiKey
    ? { Authorization: `Bearer ${apiKey}` }
    : {};
  const res = await fetch(`${ZOTERO_BASE}/users/${userId}/items`, { headers });
  if (!res.ok) throw new Error("Failed to fetch Zotero items");
  return res.json();
}
