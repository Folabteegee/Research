export async function getDailyQuote() {
  try {
    const res = await fetch("/api/quote", { cache: "no-store" });
    if (!res.ok) {
      throw new Error("Failed to fetch daily quote");
    }
    return await res.json();
  } catch (error) {
    console.error("Frontend quote fetch error:", error);
    throw error;
  }
}
