const OPENALEX_BASE = "https://api.openalex.org";

// Simple headers
const openAlexHeaders = {
  Accept: "application/json",
};

// Add timeout functionality
const fetchWithTimeout = async (
  url: string,
  options: RequestInit = {},
  timeout = 15000
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

    const params = new URLSearchParams({
      search: query,
      per_page: "50",
      mailto: "gurusearch@example.com",
    });

    console.log(`Searching OpenAlex for: "${query}"`);

    const res = await fetchWithTimeout(
      `${OPENALEX_BASE}/works?${params}`,
      {
        headers: openAlexHeaders,
      },
      15000
    );

    if (!res.ok) {
      throw new Error(`OpenAlex API error: ${res.status} ${res.statusText}`);
    }

    const data = await res.json();
    console.log(`Found ${data.results?.length || 0} papers for "${query}"`);
    return data;
  } catch (error: any) {
    console.error("Search papers error:", error);
    throw error;
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
      10000
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
    throw error;
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
      mailto: "gurusearch@example.com",
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
    throw error;
  }
}

export interface RecommendationRequest {
  interests: string[];
  recentPapers: string[];
  preferredJournals: string[];
  yearsRange: [number, number];
  maxResults: number;
  searchStrategy?: "strict" | "broad" | "balanced";
}

// SIMPLE search query builder - EXACT interests only
function buildSearchQueryFromInterests(interests: string[]): string {
  if (!interests || interests.length === 0) {
    return "";
  }

  // Clean and format interests
  const cleanInterests = interests
    .filter((interest) => interest?.trim())
    .map((interest) => interest.trim());

  if (cleanInterests.length === 0) return "";

  // Use EXACT phrase matching for each interest
  // This searches for papers that CONTAIN these exact phrases
  return cleanInterests.map((term) => `"${term}"`).join(" OR ");
}

// Generate SIMPLE mock recommendations based ONLY on interests
function getMockRecommendations(request: RecommendationRequest): any[] {
  console.log(
    `🎭 Generating ${
      request.maxResults
    } mock papers for interests: ${request.interests.join(", ")}`
  );

  const mockPapers = [];
  const currentYear = new Date().getFullYear();

  for (let i = 0; i < request.maxResults; i++) {
    // Use the FIRST interest as primary (or cycle through them)
    const primaryInterest =
      request.interests[i % request.interests.length] || "research";
    const secondaryInterest =
      request.interests[(i + 1) % request.interests.length] || primaryInterest;

    // Year within requested range
    const yearRange = request.yearsRange[1] - request.yearsRange[0];
    const year =
      request.yearsRange[0] + Math.floor(Math.random() * (yearRange + 1));

    // Papers DIRECTLY about the interest
    const paperTypes = [
      `A Comprehensive Study of ${primaryInterest}`,
      `Recent Advances in ${primaryInterest}`,
      `${primaryInterest}: New Perspectives and Applications`,
      `Machine Learning Approaches to ${primaryInterest}`,
      `Deep Learning for ${primaryInterest} Analysis`,
      `The Future of ${primaryInterest} Research`,
      `${primaryInterest} and ${secondaryInterest}: An Integrated Approach`,
      `Novel Methods in ${primaryInterest}`,
      `${primaryInterest} in Modern Applications`,
      `Systematic Review of ${primaryInterest} Techniques`,
    ];

    const paperTitle = paperTypes[i % paperTypes.length];

    mockPapers.push({
      id: `mock-${Date.now()}-${i}`,
      display_name: paperTitle,
      publication_year: year,
      cited_by_count: Math.floor(Math.random() * 500) + 50,
      authorships: [
        {
          author: {
            display_name: `Dr. ${primaryInterest} Expert`,
          },
        },
        {
          author: {
            display_name: `Prof. ${secondaryInterest} Researcher`,
          },
        },
      ],
      host_venue: {
        display_name: `Journal of ${primaryInterest} Studies`,
        url: `https://journal.example.com`,
      },
      primary_location: {
        source: {
          url: `https://arxiv.org/abs/${2000 + i}.12345`,
        },
        landing_page_url: `https://arxiv.org/abs/${2000 + i}.12345`,
      },
      open_access: {
        is_oa: true,
        url_for_pdf: `https://arxiv.org/pdf/${2000 + i}.12345.pdf`,
      },
      abstract: `This paper presents groundbreaking research specifically focused on ${primaryInterest}. We explore novel methodologies, applications, and theoretical frameworks related to ${primaryInterest}. Our work demonstrates significant advancements in the field of ${primaryInterest} through rigorous experimentation and comprehensive analysis. Key findings include innovative approaches to ${primaryInterest} that address current limitations and open new research directions. The study contributes to a deeper understanding of ${primaryInterest} and its practical implications in various domains including ${secondaryInterest}.`,
      concepts: [
        {
          display_name:
            primaryInterest.charAt(0).toUpperCase() + primaryInterest.slice(1),
        },
        { display_name: "Computer Science" },
        { display_name: "Artificial Intelligence" },
        {
          display_name:
            secondaryInterest.charAt(0).toUpperCase() +
            secondaryInterest.slice(1),
        },
      ],
      relevance_score: 0.8 + Math.random() * 0.2, // High relevance since it's directly about the interest
      match_type: "exact",
      matching_interests: [primaryInterest, secondaryInterest].filter(Boolean),
    });
  }

  return mockPapers;
}

// SIMPLE relevance scoring - ONLY based on interest matches
function calculateRelevanceScore(paper: any, interests: string[]): number {
  let score = 0;

  const title = paper.display_name?.toLowerCase() || "";
  const abstract = paper.abstract?.toLowerCase() || "";

  // Check for EXACT interest matches in title and abstract
  interests.forEach((interest) => {
    const interestLower = interest.toLowerCase();

    // Title contains the exact interest term
    if (title.includes(interestLower)) {
      score += 0.6; // Major boost for title match
    }

    // Abstract contains the exact interest term
    if (abstract.includes(interestLower)) {
      score += 0.4; // Good boost for abstract match
    }
  });

  // Recent papers get small bonus
  if (paper.publication_year) {
    const currentYear = new Date().getFullYear();
    if (paper.publication_year >= currentYear - 2) {
      score += 0.1;
    }
  }

  // Highly cited papers get small bonus
  if (paper.cited_by_count > 100) {
    score += 0.1;
  }

  return Math.min(score, 1.0);
}

// Find EXACT matching interests
function findMatchingInterests(paper: any, interests: string[]): string[] {
  const matching: string[] = [];

  const title = paper.display_name?.toLowerCase() || "";
  const abstract = paper.abstract?.toLowerCase() || "";

  interests.forEach((interest) => {
    const interestLower = interest.toLowerCase();

    // Only count if the interest appears in title or abstract
    if (title.includes(interestLower) || abstract.includes(interestLower)) {
      matching.push(interest);
    }
  });

  return matching;
}

// MAIN FIXED FUNCTION - Searches EXACTLY for interests
export async function getRecommendations(
  request: RecommendationRequest
): Promise<any[]> {
  try {
    // Build SIMPLE search query - just the interests
    const query = buildSearchQueryFromInterests(request.interests);

    if (!query.trim()) {
      console.warn("No search query provided for recommendations");
      return getMockRecommendations(request);
    }

    console.log(`🔍 EXACT search for interests: "${query}"`);
    console.log(`🎯 Interests: ${request.interests.join(", ")}`);

    // Build parameters with mailto (required by OpenAlex)
    const params = new URLSearchParams({
      search: query,
      per_page: Math.max(request.maxResults * 2, 50).toString(), // Get more to filter
      page: "1",
      sort: "cited_by_count:desc", // Most cited first
      mailto: "gurusearch@example.com",
    });

    // Add year filter if specified
    if (request.yearsRange[0] > 0 && request.yearsRange[1] > 0) {
      params.append(
        "filter",
        `publication_year:${request.yearsRange[0]}-${request.yearsRange[1]}`
      );
    }

    const url = `${OPENALEX_BASE}/works?${params.toString()}`;
    console.log(`🌐 Fetching from: ${url}`);

    const response = await fetchWithTimeout(
      url,
      {
        headers: openAlexHeaders,
      },
      20000
    );

    console.log(`📡 Response status: ${response.status}`);

    let results: any[] = [];

    if (response.ok) {
      const data = await response.json();
      results = data.results || [];
      console.log(`📥 Received ${results.length} real papers from OpenAlex`);

      // Filter to ensure papers are RELEVANT to interests
      const relevantResults = results.filter((paper: any) => {
        const title = paper.display_name?.toLowerCase() || "";
        const abstract = paper.abstract?.toLowerCase() || "";

        // Check if paper contains ANY of the interests
        return request.interests.some((interest) => {
          const interestLower = interest.toLowerCase();
          return (
            title.includes(interestLower) || abstract.includes(interestLower)
          );
        });
      });

      console.log(
        `🎯 ${relevantResults.length} papers are actually about the interests`
      );
      results = relevantResults;
    } else {
      console.log(`⚠️ OpenAlex returned ${response.status}, using mock data`);
    }

    // If no real results, use mock data
    if (results.length === 0) {
      console.log("🔄 No real results found, generating mock data");
      return getMockRecommendations(request);
    }

    // Enhance results with SIMPLE relevance scoring
    const enhancedResults = results.map((paper: any) => {
      const relevanceScore = calculateRelevanceScore(paper, request.interests);
      const matchingInterests = findMatchingInterests(paper, request.interests);

      return {
        ...paper,
        relevance_score: relevanceScore,
        match_type: relevanceScore >= 0.5 ? "exact" : "good",
        matching_interests: matchingInterests,
      };
    });

    // Sort by relevance (most relevant first)
    const sortedResults = enhancedResults.sort(
      (a: any, b: any) => b.relevance_score - a.relevance_score
    );

    // Take requested number
    const topResults = sortedResults.slice(0, request.maxResults);

    console.log(
      `✅ Returning ${topResults.length} EXACT recommendations for interests`
    );

    // Log what we found
    topResults.forEach((paper, index) => {
      console.log(
        `${index + 1}. "${
          paper.display_name
        }" - Score: ${paper.relevance_score.toFixed(
          2
        )} - Matches: ${paper.matching_interests.join(", ")}`
      );
    });

    return topResults;
  } catch (error: any) {
    console.error("❌ Error in getRecommendations:", error);
    // Always return mock data as fallback
    return getMockRecommendations(request);
  }
}

// Utility function to test OpenAlex connection
export async function testOpenAlexConnection(): Promise<boolean> {
  try {
    console.log("Testing OpenAlex connection...");

    const response = await fetchWithTimeout(
      `${OPENALEX_BASE}/works?search=machine%20learning&per_page=1&mailto=gurusearch@example.com`,
      {
        headers: openAlexHeaders,
      },
      5000
    );

    const isConnected = response.ok;
    console.log(
      `OpenAlex connection test: ${isConnected ? "✅ SUCCESS" : "❌ FAILED"}`
    );
    return isConnected;
  } catch (error) {
    console.error("OpenAlex connection test failed:", error);
    return false;
  }
}

// Enhanced mock data for other functions
export function getMockPapers(query: string, count = 25) {
  console.log(`Generating ${count} mock papers for: "${query}"`);

  const mockPapers = Array.from({ length: count }, (_, i) => {
    const year = 2020 + (i % 5);

    return {
      id: `https://openalex.org/W${3000000000 + i}`,
      display_name: `${query} Research: Paper ${i + 1}`,
      publication_year: year,
      cited_by_count: Math.floor(Math.random() * 1000),
      authorships: [
        {
          author: {
            display_name: `Dr. ${query} Researcher ${i + 1}`,
          },
        },
      ],
      host_venue: {
        display_name: `Journal of ${query} Studies`,
      },
      primary_location: {
        source: {
          url: `https://example.com/paper/${i + 1}`,
        },
        landing_page_url: `https://example.com/paper/${i + 1}`,
      },
      open_access: {
        is_oa: Math.random() > 0.3,
        url_for_pdf:
          Math.random() > 0.5 ? `https://example.com/paper/${i + 1}.pdf` : null,
      },
      abstract: `This paper presents research on ${query}. Key findings demonstrate important implications for the field.`,
      relevance_score: 0.7 + Math.random() * 0.3,
    };
  });

  return {
    results: mockPapers,
    meta: {
      count: 1000,
      page: 1,
    },
  };
}

// Enhanced search with fallback
export async function searchPapersWithFallback(query: string) {
  try {
    return await searchPapers(query);
  } catch (error) {
    console.warn("OpenAlex API unavailable, using mock data");
    return getMockPapers(query, 50);
  }
}
