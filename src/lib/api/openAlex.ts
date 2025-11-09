const OPENALEX_BASE = "https://api.openalex.org";

// Simple headers - OpenAlex doesn't require User-Agent for basic usage
const openAlexHeaders = {
  Accept: "application/json",
};

export async function searchPapers(query: string) {
  try {
    // Simple parameter format
    const params = new URLSearchParams({
      search: query,
      per_page: "25",
    });

    const res = await fetch(`${OPENALEX_BASE}/works?${params}`, {
      headers: openAlexHeaders,
    });

    if (!res.ok) {
      throw new Error(`Failed to fetch papers: ${res.status}`);
    }

    const data = await res.json();
    return data;
  } catch (error) {
    console.error("Search papers error:", error);
    throw error;
  }
}

export async function getPaperDetails(id: string) {
  try {
    const res = await fetch(`${OPENALEX_BASE}/works/${id}`, {
      headers: openAlexHeaders,
    });

    if (!res.ok) {
      throw new Error(`Failed to fetch paper details: ${res.status}`);
    }

    return res.json();
  } catch (error) {
    console.error("Get paper details error:", error);
    throw error;
  }
}

export async function searchAuthors(query: string) {
  try {
    const params = new URLSearchParams({
      search: query,
      per_page: "25",
    });

    const res = await fetch(`${OPENALEX_BASE}/authors?${params}`, {
      headers: openAlexHeaders,
    });

    if (!res.ok) {
      throw new Error(`Failed to fetch authors: ${res.status}`);
    }

    return res.json();
  } catch (error) {
    console.error("Search authors error:", error);
    throw error;
  }
}

export interface RecommendationRequest {
  interests: string[];
  recentPapers: string[];
  preferredJournals: string[];
  yearsRange: [number, number];
  maxResults: number;
}

export async function getRecommendations(
  request: RecommendationRequest
): Promise<any[]> {
  try {
    // Use the first interest for a simple search
    const searchQuery = request.interests[0] || "machine learning";

    // Get more results than needed so we can filter by year
    const params = new URLSearchParams({
      search: searchQuery,
      per_page: "50", // Get more to filter by year client-side
      sort: "cited_by_count:desc",
    });

    console.log("Fetching recommendations for years:", request.yearsRange);

    const response = await fetch(`${OPENALEX_BASE}/works?${params}`, {
      headers: openAlexHeaders,
    });

    if (!response.ok) {
      console.error("OpenAlex API response status:", response.status);

      if (response.status === 403) {
        throw new Error(
          "Unable to access OpenAlex API. Please try again later."
        );
      } else if (response.status === 429) {
        throw new Error(
          "Too many requests. Please wait a moment and try again."
        );
      } else {
        throw new Error(`API error: ${response.status}`);
      }
    }

    const data = await response.json();
    let results = data.results || [];

    // Filter by publication year on the client side
    results = results.filter((paper: any) => {
      if (!paper.publication_year) return false;
      return (
        paper.publication_year >= request.yearsRange[0] &&
        paper.publication_year <= request.yearsRange[1]
      );
    });

    console.log(
      `Found ${results.length} papers within year range ${request.yearsRange[0]}-${request.yearsRange[1]}`
    );

    // If we don't have enough results after year filtering, try without year filter but with relevance scoring
    if (results.length < request.maxResults) {
      console.log(
        "Not enough results with year filter, using all results with relevance scoring"
      );
      results = data.results || [];
    }

    // Apply relevance scoring
    const scoredResults = results.map((paper: any) => {
      const relevanceScore = calculateRelevanceScore(paper, request);
      return { ...paper, relevance_score: relevanceScore };
    });

    // Sort by relevance and return requested number
    const sortedResults = scoredResults.sort(
      (a: any, b: any) => b.relevance_score - a.relevance_score
    );
    return sortedResults.slice(0, request.maxResults);
  } catch (error) {
    console.error("Error in getRecommendations:", error);

    // Final fallback - return empty array instead of throwing
    return [];
  }
}

function calculateRelevanceScore(
  paper: any,
  request: RecommendationRequest
): number {
  let score = 0;
  const title = paper.display_name?.toLowerCase() || "";
  const abstract = paper.abstract || "";
  const journal = paper.host_venue?.display_name?.toLowerCase() || "";

  // Year relevance - papers within the desired range get highest score
  if (paper.publication_year) {
    if (
      paper.publication_year >= request.yearsRange[0] &&
      paper.publication_year <= request.yearsRange[1]
    ) {
      score += 0.4; // Big boost for papers in the desired year range
    } else if (
      paper.publication_year >= request.yearsRange[0] - 2 &&
      paper.publication_year <= request.yearsRange[1] + 2
    ) {
      score += 0.2; // Moderate boost for papers near the desired range
    }
  }

  // Check title matches with interests
  request.interests.forEach((interest) => {
    const interestLower = interest.toLowerCase();
    if (title.includes(interestLower)) score += 0.3;
    if (abstract.includes(interestLower)) score += 0.2;
    if (journal.includes(interestLower)) score += 0.1;
  });

  // Boost for highly cited papers
  if (paper.cited_by_count > 50) {
    score += 0.1;
  }

  // Ensure score is between 0 and 1
  return Math.min(Math.max(score, 0), 1.0);
}
