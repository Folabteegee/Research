export async function summarizeText(text: string) {
  const res = await fetch(
    "https://api.smmry.com?SM_API_KEY=YOUR_SMMRY_API_KEY",
    {
      method: "POST",
      body: JSON.stringify({ sm_api_input: text }),
      headers: { "Content-Type": "application/json" },
    }
  );

  if (!res.ok) throw new Error("Failed to summarize text");
  return res.json();
}
