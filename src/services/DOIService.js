/**
 * DOI Service - Digital Object Identifier Service
 *
 * Provides functionality to:
 * - Fetch metadata from DOI using Crossref API (primary), INSPIRE HEP API (fallback), and NASA ADS API (final fallback)
 * - Search DOI by title/author
 * - Generate DOI links
 * - Validate DOI format
 *
 * API References:
 * - Primary: https://api.crossref.org/ (Crossref - ~90% of English academic publications)
 * - Fallback 1: https://inspirehep.net/api/ (INSPIRE HEP - High Energy Physics)
 * - Fallback 2: https://ui.adsabs.harvard.edu/ (NASA ADS - Astrophysics Data System)
 *
 * Crossref is more reliable for general academic publications
 * INSPIRE HEP is used for specialized physics papers
 * NASA ADS is used as final fallback for astrophysics papers
 */

import { logger } from '../utils/logger';

/**
 * Crossref API base URL (primary)
 */
const CROSSREF_API_BASE = 'https://api.crossref.org';

/**
 * INSPIRE HEP API base URL (fallback 1)
 */
const INSPIRE_API_BASE = 'https://inspirehep.net/api';

/**
 * NASA ADS API base URL (fallback 2)
 */
const NASA_ADS_API_BASE = 'https://ui.adsabs.harvard.edu';

/**
 * DOI regex pattern for validation
 * Matches standard DOI format: 10.xxxx/xxxxx
 */
const DOI_REGEX = /^10\.\d{4,9}\/[-._;()/:A-Z0-9]+$/i;

/**
 * Fetch metadata from Crossref API (primary method)
 *
 * @param {string} doi - The DOI to fetch metadata for
 * @returns {Promise<Object>} Metadata object with title, authors, journal, etc.
 * @throws {Error} If DOI is invalid or API request fails
 */
export async function fetchDOIMetadata(doi) {
  logger.info('[DOIService] Starting DOI metadata fetch for:', doi);
  
  // Validate DOI format
  if (!validateDOI(doi)) {
    logger.error('[DOIService] Invalid DOI format:', doi);
    throw new Error(`Invalid DOI format: ${doi}`);
  }

  try {
    logger.debug('[DOIService] Step 1: Trying Crossref API...');
    const crossrefMetadata = await fetchFromCrossref(doi);
    
    if (crossrefMetadata) {
      logger.info('[DOIService] Crossref API succeeded for DOI:', doi);
      return crossrefMetadata;
    }

    logger.warn('[DOIService] Crossref API returned null for DOI:', doi);
    logger.debug('[DOIService] Step 2: Trying NASA ADS API...');
    
    const nasaMetadata = await fetchFromNASAADS(doi);
    if (nasaMetadata) {
      logger.info('[DOIService] NASA ADS API succeeded for DOI:', doi);
      return nasaMetadata;
    }

    logger.warn('[DOIService] NASA ADS API returned null for DOI:', doi);
    logger.debug('[DOIService] Step 3: Trying INSPIRE HEP API...');
    
    const inspireMetadata = await fetchFromINSPIRE(doi);
    if (inspireMetadata) {
      logger.info('[DOIService] INSPIRE HEP API succeeded for DOI:', doi);
      return inspireMetadata;
    }

    logger.warn('[DOIService] All APIs returned null for DOI:', doi);
    logger.warn('[DOIService] Unable to fetch DOI metadata from any source');
    return null;
  } catch (error) {
    if (error instanceof TypeError && error.message.includes('fetch')) {
      logger.error('[DOIService] Network error: Unable to connect to DOI API');
      throw new Error('Network error: Unable to connect to DOI API');
    }
    logger.error('[DOIService] Error fetching DOI metadata:', error);
    throw error;
  }
}

/**
 * Fetch metadata from Crossref API (primary method)
 *
 * @param {string} doi - The DOI to fetch
 * @returns {Promise<Object|null>} Metadata object or null if not found
 */
async function fetchFromCrossref(doi) {
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
        logger.warn('[DOIService] Crossref API returned 404 for DOI:', doi);
        return null;
      }
      logger.error('[DOIService] Crossref API error:', response.status, response.statusText);
      return null;
    }

    const data = await response.json();
    return parseCrossrefMetadata(data.message);
  } catch (error) {
    logger.error('[DOIService] Crossref API error:', error);
    return null;
  }
}

/**
 * Fetch metadata from INSPIRE HEP API (fallback method)
 *
 * @param {string} doi - The DOI to fetch
 * @returns {Promise<Object|null>} Metadata object or null if not found
 */
async function fetchFromINSPIRE(doi) {
  try {
    const response = await fetch(`${INSPIRE_API_BASE}/literature?q=${encodeURIComponent(doi)}`, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        'User-Agent': 'ResearchPage/1.0 (mailto:contact@example.com)'
      }
    });

    if (!response.ok) {
      if (response.status === 404) {
        logger.warn('[DOIService] INSPIRE HEP API returned 404 for DOI:', doi);
        return null;
      }
      logger.error('[DOIService] INSPIRE HEP API error:', response.status, response.statusText);
      return null;
    }

    const data = await response.json();
    
    logger.debug('[DOIService] INSPIRE HEP API response:', JSON.stringify(data, null, 2));
    
    // Check if we have results
    if (!data.hits || data.hits.total === 0) {
      logger.warn('[DOIService] INSPIRE HEP API: No results found for DOI:', doi);
      return null;
    }

    // Get the first result
    const record = data.hits.hits[0];
    
    // Extract metadata from record (INSPIRE API nests data in metadata property)
    const metadata = record.metadata || record;
    
    logger.debug('[DOIService] INSPIRE record:', JSON.stringify(record, null, 2));
    logger.debug('[DOIService] INSPIRE metadata:', JSON.stringify(metadata, null, 2));
    
    return parseINSPIREMetadata(metadata, doi);
  } catch (error) {
    logger.error('[DOIService] INSPIRE HEP API error:', error);
    return null;
  }
}

/**
 * Fetch metadata from NASA ADS API (final fallback)
 *
 * @param {string} doi - The DOI to fetch
 * @returns {Promise<Object|null>} Metadata object or null if not found
 */
async function fetchFromNASAADS(doi) {
  try {
    const response = await fetch(`${NASA_ADS_API_BASE}/solr/nr bib/html?q=${encodeURIComponent(doi)}&fl=ent&format=json`, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        'User-Agent': 'ResearchPage/1.0 (mailto:contact@example.com)'
      }
    });

    if (!response.ok) {
      if (response.status === 404) {
        logger.warn('[DOIService] NASA ADS API returned 404 for DOI:', doi);
        return null;
      }
      logger.error('[DOIService] NASA ADS API error:', response.status, response.statusText);
      return null;
    }

    const data = await response.json();
    
    logger.debug('[DOIService] NASA ADS API response:', JSON.stringify(data, null, 2));
    
    // Check if we have results
    if (!data.response || data.response.numFound === 0) {
      logger.warn('[DOIService] NASA ADS API: No results found for DOI:', doi);
      return null;
    }

    // Get the first record
    const record = data.response.docs?.[0];
    
    return parseNASADSMetadata(record, doi);
  } catch (error) {
    logger.error('[DOIService] NASA ADS API error:', error);
    return null;
  }
}

/**
 * Parse NASA ADS API response into simplified metadata object
 *
 * @param {Object} record - Raw NASA ADS API record
 * @param {string} doi - The DOI
 * @returns {Object} Parsed metadata object
 */
function parseNASADSMetadata(record, doi) {
  logger.debug('[DOIService] Parsing NASA ADS record:', JSON.stringify(record, null, 2));
  
  // Extract authors
  const authors = record.author?.map(author => {
    if (author) {
      return author;
    }
    return 'Unknown';
  }).join(', ') || 'Unknown';

  // Extract journal/container title
  const journal = record.pub || 
                  record.pub_raw ||
                  'Unknown Journal';

  // Extract publication date
  const publishedDate = record.year || null;

  // Extract volume and issue
  const volume = record.volume || null;
  const issue = null;

  // Extract pages
  const pages = record.page?.[0] || null;

  // Extract article type
  const type = 'article';

  // Extract title
  const title = record.title?.[0] || 
                 record.bibstem ||
                 'Untitled';

  const parsedMetadata = {
    doi: doi,
    title: title,
    authors: authors,
    journal: journal,
    year: publishedDate ? publishedDate.toString() : null,
    volume: volume,
    issue: issue,
    pages: pages,
    type: type,
    url: `https://doi.org/${doi}`,
    raw: record
  };

  logger.debug('[DOIService] Parsed NASA ADS metadata:', JSON.stringify(parsedMetadata, null, 2));

  return parsedMetadata;
}

/**
 * Search for DOI by title and author using Crossref API (primary method)
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
    logger.error('[DOIService] Failed to search DOI:', error);
    throw error;
  }
}

/**
 * Validate DOI format
 *
 * @param {string} doi - The DOI to validate
 * @returns {boolean} True if valid
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
 * Parse INSPIRE HEP API response into simplified metadata object
 *
 * @param {Object} record - Raw INSPIRE HEP API record
 * @param {string} doi - The DOI
 * @returns {Object} Parsed metadata object
 */
function parseINSPIREMetadata(record, doi) {
  logger.debug('[DOIService] Parsing INSPIRE metadata:', JSON.stringify(record, null, 2));
  
  // Extract authors - INSPIRE HEP API uses different field names
  logger.debug('[DOIService] Extracting authors from record:', record);
  const authors = record.authors?.map(author => {
    if (author.full_name) {
      logger.debug('[DOIService] Author full_name:', author.full_name);
      return author.full_name;
    }
    const name = `${author.first_name || ''} ${author.last_name || ''}`.trim();
    logger.debug('[DOIService] Author constructed from first/last name:', name);
    return name;
  }).join(', ') || 'Unknown';
  logger.debug('[DOIService] Final authors:', authors);

  // Extract journal/container title - INSPIRE HEP API uses different field names
  logger.debug('[DOIService] Extracting journal from record:', record);
  const journal = record.publication_info?.[0]?.journal_title || 
                  record.publication_info?.[0]?.journal_record?.title ||
                  'Unknown Journal';
  logger.debug('[DOIService] Final journal:', journal);

  // Extract publication date - INSPIRE HEP API uses different field names
  logger.debug('[DOIService] Extracting date from record:', {
    created: record.created,
    earliest_date: record.earliest_date,
    imprints: record.imprints
  });
  const publishedDate = record.created || 
                        record.earliest_date || 
                        record.imprints?.[0]?.date ||
                        null;
  logger.debug('[DOIService] Final publishedDate:', publishedDate);

  // Extract volume and issue - INSPIRE HEP API uses different field names
  logger.debug('[DOIService] Extracting volume/issue from record:', record);
  const volume = record.publication_info?.[0]?.journal_volume || null;
  const issue = record.publication_info?.[0]?.journal_issue || null;
  logger.debug('[DOIService] Final volume:', volume, 'issue:', issue);

  // Extract pages - INSPIRE HEP API uses different field names
  logger.debug('[DOIService] Extracting pages from record:', record);
  const pages = record.publication_info?.[0]?.page_start ? 
             `${record.publication_info[0].page_start}${record.publication_info[0].page_end ? '-' + record.publication_info[0].page_end : ''}` : 
             null;
  logger.debug('[DOIService] Final pages:', pages);

  // Extract article type - INSPIRE HEP API uses different field names
  const type = record.document_type || 'article';
  logger.debug('[DOIService] Final type:', type);

  // Extract title - INSPIRE HEP API uses different field names
  logger.debug('[DOIService] Extracting title from record:', {
    titles: record.titles,
    title: record.title
  });
  const title = record.titles?.[0]?.title || 
                 'Untitled';
  logger.debug('[DOIService] Final title:', title);

  const parsedMetadata = {
    doi: doi,
    title: title,
    authors: authors,
    journal: journal,
    year: publishedDate ? publishedDate.substring(0, 4) : null,
    volume: volume,
    issue: issue,
    pages: pages,
    type: type,
    url: `https://doi.org/${doi}`,
    raw: record
  };

  logger.debug('[DOIService] Parsed INSPIRE metadata:', JSON.stringify(parsedMetadata, null, 2));

  return parsedMetadata;
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
 * Get citation formats for a DOI (using Crossref API)
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
  getCitation,
  fetchFromNASAADS,
  parseNASADSMetadata
};