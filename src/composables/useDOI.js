/**
 * useDOI - Composable for DOI functionality
 *
 * Provides reactive state and methods for:
 * - Fetching DOI metadata
 * - Searching DOI by title/author
 * - Managing loading states and errors
 * - Caching DOI metadata
 */

import { ref, computed } from 'vue';
import {
  fetchDOIMetadata,
  searchDOI,
  validateDOI,
  generateDOIUrl,
  batchFetchDOIMetadata,
  getCitation
} from '../services/DOIService.js';
import { logger } from '../utils/logger';

/**
 * Composable for DOI operations
 *
 * @returns {Object} DOI reactive state and methods
 */
export function useDOI() {
  // State
  const metadata = ref(null);
  const searchResults = ref([]);
  const isLoading = ref(false);
  const error = ref(null);
  const citations = ref({});

  // Cache for DOI metadata to avoid repeated API calls
  const metadataCache = new Map();

  // Computed
  const hasMetadata = computed(() => metadata.value !== null);
  const hasError = computed(() => error.value !== null);
  const hasSearchResults = computed(() => searchResults.value.length > 0);

  /**
   * Fetch metadata for a specific DOI
   * Uses cache to avoid repeated API calls
   *
   * @param {string} doi - The DOI to fetch
   * @returns {Promise<Object>} Metadata object
   */
  async function fetchMetadata(doi) {
    // Check cache first
    if (metadataCache.has(doi)) {
      metadata.value = metadataCache.get(doi);
      return metadata.value;
    }

    isLoading.value = true;
    error.value = null;

    try {
      const data = await fetchDOIMetadata(doi);
      metadataCache.set(doi, data);
      metadata.value = data;
      return data;
    } catch (err) {
      error.value = err.message;
      logger.error('Failed to fetch DOI metadata:', err);
      throw err;
    } finally {
      isLoading.value = false;
    }
  }

  /**
   * Search for DOI by title and author
   *
   * @param {Object} params - Search parameters
   * @returns {Promise<Array>} Array of search results
   */
  async function searchByTitleAndAuthor(params) {
    isLoading.value = true;
    error.value = null;

    try {
      const results = await searchDOI(params);
      searchResults.value = results;
      return results;
    } catch (err) {
      error.value = err.message;
      logger.error('Failed to search DOI:', err);
      throw err;
    } finally {
      isLoading.value = false;
    }
  }

  /**
   * Validate DOI format
   *
   * @param {string} doi - The DOI to validate
   * @returns {boolean} True if valid
   */
  function validate(doi) {
    return validateDOI(doi);
  }

  /**
   * Generate DOI URL
   *
   * @param {string} doi - The DOI
   * @returns {string} Full DOI URL
   */
  function getUrl(doi) {
    return generateDOIUrl(doi);
  }

  /**
   * Batch fetch metadata for multiple DOIs
   *
   * @param {Array<string>} dois - Array of DOIs
   * @returns {Promise<Object>} Results and errors
   */
  async function fetchBatchMetadata(dois) {
    isLoading.value = true;
    error.value = null;

    try {
      const { results, errors } = await batchFetchDOIMetadata(dois);

      // Cache successful results
      results.forEach(data => {
        metadataCache.set(data.doi, data);
      });

      // Log errors
      if (errors.length > 0) {
        logger.warn('Some DOI fetches failed:', errors);
      }

      return { results, errors };
    } catch (err) {
      error.value = err.message;
      logger.error('Failed to batch fetch DOI metadata:', err);
      throw err;
    } finally {
      isLoading.value = false;
    }
  }

  /**
   * Get citation for a DOI
   *
   * @param {string} doi - The DOI
   * @param {string} format - Citation format (apa, mla, chicago, etc.)
   * @returns {Promise<string>} Formatted citation
   */
  async function fetchCitation(doi, format = 'apa') {
    isLoading.value = true;
    error.value = null;

    try {
      const citation = await getCitation(doi, format);
      citations.value[`${doi}-${format}`] = citation;
      return citation;
    } catch (err) {
      error.value = err.message;
      logger.error('Failed to fetch citation:', err);
      throw err;
    } finally {
      isLoading.value = false;
    }
  }

  /**
   * Clear error state
   */
  function clearError() {
    error.value = null;
  }

  /**
   * Clear all state
   */
  function clearAll() {
    metadata.value = null;
    searchResults.value = [];
    error.value = null;
    citations.value = {};
  }

  /**
   * Clear cache
   */
  function clearCache() {
    metadataCache.clear();
  }

  return {
    // State
    metadata,
    searchResults,
    isLoading,
    error,
    citations,

    // Computed
    hasMetadata,
    hasError,
    hasSearchResults,

    // Methods
    fetchMetadata,
    searchByTitleAndAuthor,
    validate,
    getUrl,
    fetchBatchMetadata,
    fetchCitation,
    clearError,
    clearAll,
    clearCache
  };
}

export default useDOI;
