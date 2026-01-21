/**
 * DOI Service - Digital Object Identifier Service
 *
 * Provides functionality to:
 * - Fetch metadata from DOI using Crossref API
 * - Search DOI by title and author
 * - Generate DOI links
 * - Validate DOI format
 *
 * API Reference: https://api.crossref.org/
 * Crossref covers ~90% of English academic publications
 */

/**
 * Crossref API base URL
 */
const CROSSREF_API_BASE = 'https://api.crossref.org';

/**
 * DOI regex pattern for validation
 * Matches standard DOI format: 10.xxxx/xxxxx
 */
const DOI_REGEX = /^10\.\d{4,9}\/[-._;()/:A-Z0-9]+$/i;

/**
 * Fetch metadata for a specific DOI
 *
 * @param {string} doi - The DOI to fetch metadata for
 * @returns {Promise<Object>} Metadata object with title, authors, journal, etc.
 * @throws {Error} If DOI is invalid or API request fails
 */
export async function fetchDOIMetadata(doi) {
  // Validate DOI format
  if (!validateDOI(doi)) {
    throw new Error(`Invalid DOI format: ${doi}`);
  }

  try {
    const response = await fetch(`${CROSSREF_API_BASE}/works/${encodeURIComponent(doi)}`, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        'User-Agent': 'ResearchPage/1.0 (mailto:contact@example.com)'
      }
    });

    if (!response.ok) {
      if (response.status === 404) {
        throw new Error(`DOI not found: ${doi}`);
      }
      throw new Error(`Failed to fetch DOI metadata: ${response.statusText}`);
    }

    const data = await response.json();
    return parseCrossrefMetadata(data.message);
  } catch (error) {
    if (error instanceof TypeError && error.message.includes('fetch')) {
      throw new Error('Network error: Unable to connect to Crossref API');
    }
    throw error;
  }
}

/**
 * Search for DOI by title and author
 *
 * @param {Object} searchParams - Search parameters
 * @param {string} searchParams.title - Paper title
 * @param {string} searchParams.author - Author name (optional)
 * @param {number} searchParams.limit - Maximum number of results (default: 5)
 * @returns {Promise<Array>} Array of matching papers with DOI and metadata
 * @throws {Error} If search fails or no parameters provided
 */
export async function searchDOI({ title, author, limit = 5 }) {
  if (!title && !author) {
    throw new Error('At least title or author must be provided for DOI search');
  }

  try {
    // Build query parameters
    const params = new URLSearchParams();
    if (title) params.append('query.title', title);
    if (author) params.append('query.author', author);
    params.append('rows', limit.toString());
    params.append('select', 'DOI,title,author,published-print,journal-issue,container-title,volume,issue,type');

    const response = await fetch(`${CROSSREF_API_BASE}/works?${params.toString()}`, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        'User-Agent': 'ResearchPage/1.0 (mailto:contact@example.com)'
      }
    });

    if (!response.ok) {
      throw new Error(`Failed to search DOI: ${response.statusText}`);
    }

    const data = await response.json();
    return data.message.items.map(item => parseCrossrefMetadata(item));
  } catch (error) {
    if (error instanceof TypeError && error.message.includes('fetch')) {
      throw new Error('Network error: Unable to connect to Crossref API');
    }
    throw error;
  }
}

/**
 * Validate DOI format
 *
 * @param {string} doi - The DOI to validate
 * @returns {boolean} True if DOI format is valid
 */
export function validateDOI(doi) {
  if (!doi || typeof doi !== 'string') {
    return false;
  }
  return DOI_REGEX.test(doi.trim());
}

/**
 * Generate DOI URL
 *
 * @param {string} doi - The DOI
 * @returns {string} Full DOI URL (https://doi.org/xxxx)
 */
export function generateDOIUrl(doi) {
  if (!validateDOI(doi)) {
    throw new Error(`Invalid DOI format: ${doi}`);
  }
  return `https://doi.org/${doi.trim()}`;
}

/**
 * Parse Crossref API response into simplified metadata object
 *
 * @param {Object} crossrefData - Raw Crossref API response
 * @returns {Object} Parsed metadata object
 */
function parseCrossrefMetadata(crossrefData) {
  // Extract authors
  const authors = crossrefData.author?.map(author => {
    if (author.given && author.family) {
      return `${author.given} ${author.family}`;
    }
    return author.family || author.name || 'Unknown';
  }).join(', ') || 'Unknown';

  // Extract journal/container title
  const journal = crossrefData['container-title']?.[0] ||
                  crossrefData['short-container-title']?.[0] ||
                  'Unknown Journal';

  // Extract publication date
  const publishedDate = crossrefData['published-print']?.['date-parts']?.[0]?.[0] ||
                        crossrefData['published-online']?.['date-parts']?.[0]?.[0] ||
                        crossrefData.created?.['date-parts']?.[0]?.[0] ||
                        null;

  // Extract volume and issue
  const volume = crossrefData.volume || null;
  const issue = crossrefData.issue || null;

  // Extract pages
  const pages = crossrefData.page || null;

  // Extract article type
  const type = crossrefData.type || 'article';

  return {
    doi: crossrefData.DOI,
    title: crossrefData.title?.[0] || 'Untitled',
    authors: authors,
    journal: journal,
    year: publishedDate ? publishedDate.toString() : null,
    volume: volume,
    issue: issue,
    pages: pages,
    type: type,
    url: `https://doi.org/${crossrefData.DOI}`,
    raw: crossrefData // Include raw data for advanced use cases
  };
}

/**
 * Batch fetch metadata for multiple DOIs
 *
 * @param {Array<string>} dois - Array of DOIs
 * @returns {Promise<Array<Object>>} Array of metadata objects
 */
export async function batchFetchDOIMetadata(dois) {
  const results = [];
  const errors = [];

  // Process in parallel with concurrency limit
  const batchSize = 10;
  for (let i = 0; i < dois.length; i += batchSize) {
    const batch = dois.slice(i, i + batchSize);
    const promises = batch.map(async (doi) => {
      try {
        const metadata = await fetchDOIMetadata(doi);
        return { success: true, doi, metadata };
      } catch (error) {
        return { success: false, doi, error: error.message };
      }
    });

    const batchResults = await Promise.all(promises);
    batchResults.forEach(result => {
      if (result.success) {
        results.push(result.metadata);
      } else {
        errors.push({ doi: result.doi, error: result.error });
      }
    });
  }

  return { results, errors };
}

/**
 * Get citation formats for a DOI
 *
 * @param {string} doi - The DOI
 * @param {string} format - Citation format (apa, mla, chicago, etc.)
 * @returns {Promise<string>} Formatted citation
 */
export async function getCitation(doi, format = 'apa') {
  if (!validateDOI(doi)) {
    throw new Error(`Invalid DOI format: ${doi}`);
  }

  try {
    const response = await fetch(`${CROSSREF_API_BASE}/works/${encodeURIComponent(doi)}`, {
      method: 'GET',
      headers: {
        'Accept': `text/x-bibliography; style=${format}`,
        'User-Agent': 'ResearchPage/1.0 (mailto:contact@example.com)'
      }
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch citation: ${response.statusText}`);
    }

    return await response.text();
  } catch (error) {
    throw new Error(`Failed to generate citation: ${error.message}`);
  }
}

/**
 * DOI Service default export
 */
export default {
  fetchDOIMetadata,
  searchDOI,
  validateDOI,
  generateDOIUrl,
  batchFetchDOIMetadata,
  getCitation
};
