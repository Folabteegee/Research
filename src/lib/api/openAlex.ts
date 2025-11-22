const OPENALEX_BASE = "https://api.openalex.org";

// Simple headers - OpenAlex doesn't require User-Agent for basic usage
const openAlexHeaders = {
  Accept: "application/json",
};

// Add timeout and retry functionality
const fetchWithTimeout = async (
  url: string,
  options: RequestInit = {},
  timeout = 10000
) => {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeout);

  try {
    const response = await fetch(url, {
      ...options,
      signal: controller.signal,
    });
    clearTimeout(timeoutId);
    return response;
  } catch (error) {
    clearTimeout(timeoutId);
    throw error;
  }
};

export async function searchPapers(query: string) {
  try {
    if (!query?.trim()) {
      throw new Error("Search query cannot be empty");
    }

    // Simple parameter format
    const params = new URLSearchParams({
      search: query,
      per_page: "200",
    });

    console.log(`Searching OpenAlex for: "${query}"`);

    const res = await fetchWithTimeout(
      `${OPENALEX_BASE}/works?${params}`,
      {
        headers: openAlexHeaders,
      },
      15000 // 15 second timeout for search
    );

    if (!res.ok) {
      throw new Error(`OpenAlex API error: ${res.status} ${res.statusText}`);
    }

    const data = await res.json();
    console.log(`Found ${data.results?.length || 0} papers for "${query}"`);
    return data;
  } catch (error: any) {
    console.error("Search papers error:", error);

    if (error.name === "AbortError") {
      throw new Error(
        "Request timeout: Please check your internet connection and try again."
      );
    } else if (error.message?.includes("Failed to fetch")) {
      throw new Error(
        "Network error: Please check your internet connection and try again."
      );
    } else {
      throw error;
    }
  }
}

export async function getPaperDetails(id: string) {
  try {
    if (!id) {
      throw new Error("Paper ID cannot be empty");
    }

    console.log(`Fetching paper details for: ${id}`);

    const res = await fetchWithTimeout(
      `${OPENALEX_BASE}/works/${id}`,
      {
        headers: openAlexHeaders,
      },
      10000 // 10 second timeout
    );

    if (!res.ok) {
      if (res.status === 404) {
        throw new Error(`Paper not found: ${id}`);
      }
      throw new Error(`Failed to fetch paper details: ${res.status}`);
    }

    return res.json();
  } catch (error: any) {
    console.error("Get paper details error:", error);

    if (error.name === "AbortError") {
      throw new Error(
        "Request timeout: Please check your internet connection and try again."
      );
    } else if (error.message?.includes("Failed to fetch")) {
      throw new Error(
        "Network error: Please check your internet connection and try again."
      );
    } else {
      throw error;
    }
  }
}

export async function searchAuthors(query: string) {
  try {
    if (!query?.trim()) {
      throw new Error("Author search query cannot be empty");
    }

    const params = new URLSearchParams({
      search: query,
      per_page: "25",
    });

    console.log(`Searching authors for: "${query}"`);

    const res = await fetchWithTimeout(
      `${OPENALEX_BASE}/authors?${params}`,
      {
        headers: openAlexHeaders,
      },
      10000
    );

    if (!res.ok) {
      throw new Error(`Failed to fetch authors: ${res.status}`);
    }

    return res.json();
  } catch (error: any) {
    console.error("Search authors error:", error);

    if (error.name === "AbortError") {
      throw new Error(
        "Request timeout: Please check your internet connection and try again."
      );
    } else if (error.message?.includes("Failed to fetch")) {
      throw new Error(
        "Network error: Please check your internet connection and try again."
      );
    } else {
      throw error;
    }
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

    if (!searchQuery.trim()) {
      console.warn("No search query provided for recommendations");
      return [];
    }

    // Get more results than needed so we can filter by year
    const params = new URLSearchParams({
      search: searchQuery,
      per_page: "50", // Get more to filter by year client-side
      sort: "cited_by_count:desc",
    });

    console.log(
      "Fetching recommendations for years:",
      request.yearsRange,
      "query:",
      searchQuery
    );

    const response = await fetchWithTimeout(
      `${OPENALEX_BASE}/works?${params}`,
      {
        headers: openAlexHeaders,
      },
      15000
    );

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

    console.log(`Received ${results.length} papers from OpenAlex`);

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

    const finalResults = sortedResults.slice(0, request.maxResults);
    console.log(`Returning ${finalResults.length} recommendations`);

    return finalResults;
  } catch (error: any) {
    console.error("Error in getRecommendations:", error);

    // Provide more specific error messages
    if (error.name === "AbortError") {
      throw new Error(
        "Request timeout: Please check your internet connection and try again."
      );
    } else if (error.message?.includes("Failed to fetch")) {
      throw new Error(
        "Network error: Please check your internet connection and try again."
      );
    } else if (error.message?.includes("Too many requests")) {
      throw error; // Preserve rate limit message
    } else {
      // Final fallback - return empty array instead of throwing for non-critical errors
      console.warn("Returning empty results due to API error");
      return [];
    }
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

// Utility function to test OpenAlex connection
export async function testOpenAlexConnection(): Promise<boolean> {
  try {
    console.log("Testing OpenAlex connection...");

    const response = await fetchWithTimeout(
      `${OPENALEX_BASE}/works?search=test&per_page=1`,
      {
        headers: openAlexHeaders,
      },
      5000 // 5 second timeout for connection test
    );

    const isConnected = response.ok;
    console.log(
      `OpenAlex connection test: ${isConnected ? "SUCCESS" : "FAILED"}`
    );

    return isConnected;
  } catch (error) {
    console.error("OpenAlex connection test failed:", error);
    return false;
  }
}

// Fallback mock data for development when API is unavailable
export function getMockPapers(query: string, count = 25) {
  console.log(`Generating ${count} mock papers for: "${query}"`);

  const mockPapers = Array.from({ length: count }, (_, i) => ({
    id: `https://openalex.org/W${3000000000 + i}`,
    display_name: `${query} Research Paper ${
      i + 1
    }: Recent Advances and Applications`,
    publication_year: 2020 + (i % 4),
    cited_by_count: Math.floor(Math.random() * 1000),
    authorships: [
      {
        author: {
          display_name: `Dr. Researcher ${i + 1}`,
        },
      },
      ...(i % 3 === 0
        ? [
            {
              author: {
                display_name: `Prof. Coauthor ${i + 1}`,
              },
            },
          ]
        : []),
    ],
    host_venue: {
      display_name: `Journal of ${query} Studies`,
      url: `https://example.com/journal`,
    },
    primary_location: {
      source: {
        url: `https://example.com/paper/${i + 1}`,
      },
      landing_page_url: `https://example.com/paper/${i + 1}`,
    },
    open_access: {
      is_oa: Math.random() > 0.5,
      url_for_pdf:
        Math.random() > 0.7 ? `https://example.com/paper/${i + 1}.pdf` : null,
    },
    abstract: `This is a comprehensive study about ${query}. The research presents novel findings that contribute significantly to the field. Key results demonstrate important implications for future work in this area. The methodology employed ensures robust and reproducible outcomes.`,
    relevance_score: 0.7 + Math.random() * 0.3, // Random relevance between 0.7-1.0
  }));

  return {
    results: mockPapers,
    meta: {
      count: 1000,
      page: 1,
    },
  };
}

// Enhanced search with fallback to mock data
export async function searchPapersWithFallback(query: string) {
  try {
    // First try the real API
    return await searchPapers(query);
  } catch (error) {
    console.warn("OpenAlex API unavailable, using mock data as fallback");
    // Fallback to mock data for development
    return getMockPapers(query, 50);
  }
}
