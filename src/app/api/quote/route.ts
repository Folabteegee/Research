import { NextResponse } from "next/server";

export async function GET() {
  try {
    const response = await fetch("https://zenquotes.io/api/today", {
      method: "GET",
      headers: {
        Accept: "application/json",
      },
      cache: "no-store",
      next: { revalidate: 0 },
    });

    if (!response.ok) {
      console.error("ZenQuotes error:", response.statusText);
      return NextResponse.json(
        { error: "Failed to fetch from ZenQuotes" },
        { status: response.status }
      );
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error: any) {
    console.error("Quote API error:", error.message);
    return NextResponse.json(
      { error: "Unable to fetch quote" },
      { status: 500 }
    );
  }
}
