/**
 * DOIService Tests
 *
 * Tests for DOI service functionality including:
 * - DOI validation
 * - Metadata fetching
 * - DOI search
 * - URL generation
 * - Batch operations
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import {
  fetchDOIMetadata,
  searchDOI,
  validateDOI,
  generateDOIUrl,
  batchFetchDOIMetadata,
  getCitation
} from '../DOIService.js';

// Mock fetch for testing
const mockFetch = vi.fn();
global.fetch = mockFetch;

describe('DOIService', () => {
  beforeEach(() => {
    mockFetch.mockClear();
  });

  describe('validateDOI', () => {
    test('should validate correct DOI format', () => {
      expect(validateDOI('10.1103/PhysRevLett.130.041301')).toBe(true);
      expect(validateDOI('10.1038/s41586-022-04824-5')).toBe(true);
      expect(validateDOI('10.1088/1475-7516/2021/11/035')).toBe(true);
    });

    test('should reject invalid DOI format', () => {
      expect(validateDOI('invalid-doi')).toBe(false);
      expect(validateDOI('')).toBe(false);
      expect(validateDOI(null)).toBe(false);
      expect(validateDOI(undefined)).toBe(false);
      expect(validateDOI('10.123')).toBe(false);
    });

    test('should handle whitespace in DOI', () => {
      expect(validateDOI(' 10.1103/PhysRevLett.130.041301 ')).toBe(true);
    });
  });

  describe('generateDOIUrl', () => {
    test('should generate correct DOI URL', () => {
      expect(generateDOIUrl('10.1103/PhysRevLett.130.041301'))
        .toBe('https://doi.org/10.1103/PhysRevLett.130.041301');
    });

    test('should throw error for invalid DOI', () => {
      expect(() => generateDOIUrl('invalid-doi')).toThrow();
    });
  });

  describe('fetchDOIMetadata', () => {
    test('should fetch metadata successfully', async () => {
      const mockResponse = {
        message: {
          DOI: '10.1103/PhysRevLett.130.041301',
          title: ['Test Paper'],
          author: [{ given: 'John', family: 'Doe' }],
          'container-title': ['Test Journal'],
          'published-print': { 'date-parts': [[2023]] },
          volume: '130',
          issue: '4',
          page: '041301',
          type: 'journal-article'
        }
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse
      });

      const result = await fetchDOIMetadata('10.1103/PhysRevLett.130.041301');

      expect(result).toHaveProperty('doi', '10.1103/PhysRevLett.130.041301');
      expect(result).toHaveProperty('title', 'Test Paper');
      expect(result).toHaveProperty('authors', 'John Doe');
      expect(result).toHaveProperty('journal', 'Test Journal');
      expect(result).toHaveProperty('year', '2023');
    });

    test('should handle 404 error', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 404,
        statusText: 'Not Found'
      });

      await expect(fetchDOIMetadata('10.1103/invalid.doi'))
        .rejects
        .toThrow('DOI not found');
    });

    test('should handle network error', async () => {
      mockFetch.mockRejectedValueOnce(new TypeError('Failed to fetch'));

      await expect(fetchDOIMetadata('10.1103/PhysRevLett.130.041301'))
        .rejects
        .toThrow('Network error');
    });

    test('should validate DOI before fetching', async () => {
      await expect(fetchDOIMetadata('invalid-doi'))
        .rejects
        .toThrow('Invalid DOI format');

      expect(mockFetch).not.toHaveBeenCalled();
    });
  });

  describe('searchDOI', () => {
    test('should search by title', async () => {
      const mockResponse = {
        message: {
          items: [
            {
              DOI: '10.1103/PhysRevLett.130.041301',
              title: ['Test Paper'],
              author: [{ given: 'John', family: 'Doe' }],
              'container-title': ['Test Journal'],
              'published-print': { 'date-parts': [[2023]] }
            }
          ]
        }
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse
      });

      const results = await searchDOI({
        title: 'Test Paper',
        limit: 5
      });

      expect(results).toHaveLength(1);
      expect(results[0]).toHaveProperty('doi', '10.1103/PhysRevLett.130.041301');
    });

    test('should search by author', async () => {
      const mockResponse = {
        message: {
          items: [
            {
              DOI: '10.1103/PhysRevLett.130.041301',
              title: ['Test Paper'],
              author: [{ given: 'John', family: 'Doe' }],
              'container-title': ['Test Journal']
            }
          ]
        }
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse
      });

      const results = await searchDOI({
        author: 'John Doe',
        limit: 5
      });

      expect(results).toHaveLength(1);
    });

    test('should require at least title or author', async () => {
      await expect(searchDOI({}))
        .rejects
        .toThrow('At least title or author must be provided');
    });

    test('should handle search errors', async () => {
      mockFetch.mockRejectedValueOnce(new TypeError('Failed to fetch'));

      await expect(searchDOI({ title: 'Test' }))
        .rejects
        .toThrow('Network error');
    });
  });

  describe('batchFetchDOIMetadata', () => {
    test('should fetch multiple DOIs successfully', async () => {
      const mockResponse1 = {
        message: {
          DOI: '10.1103/PhysRevLett.130.041301',
          title: ['Paper 1'],
          author: [{ given: 'John', family: 'Doe' }],
          'container-title': ['Journal 1'],
          'published-print': { 'date-parts': [[2023]] }
        }
      };

      const mockResponse2 = {
        message: {
          DOI: '10.1038/s41586-022-04824-5',
          title: ['Paper 2'],
          author: [{ given: 'Jane', family: 'Smith' }],
          'container-title': ['Journal 2'],
          'published-print': { 'date-parts': [[2022]] }
        }
      };

      fetch
        .mockResolvedValueOnce({ ok: true, json: async () => mockResponse1 })
        .mockResolvedValueOnce({ ok: true, json: async () => mockResponse2 });

      const { results, errors } = await batchFetchDOIMetadata([
        '10.1103/PhysRevLett.130.041301',
        '10.1038/s41586-022-04824-5'
      ]);

      expect(results).toHaveLength(2);
      expect(errors).toHaveLength(0);
    });

    test('should handle mixed success and failure', async () => {
      const mockResponse = {
        message: {
          DOI: '10.1103/PhysRevLett.130.041301',
          title: ['Paper 1'],
          author: [{ given: 'John', family: 'Doe' }],
          'container-title': ['Journal 1'],
          'published-print': { 'date-parts': [[2023]] }
        }
      };

      fetch
        .mockResolvedValueOnce({ ok: true, json: async () => mockResponse })
        .mockResolvedValueOnce({ ok: false, status: 404, statusText: 'Not Found' });

      const { results, errors } = await batchFetchDOIMetadata([
        '10.1103/PhysRevLett.130.041301',
        '10.1103/invalid.doi'
      ]);

      expect(results).toHaveLength(1);
      expect(errors).toHaveLength(1);
      expect(errors[0]).toHaveProperty('doi', '10.1103/invalid.doi');
    });
  });

  describe('getCitation', () => {
    test('should fetch APA citation', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        text: async () => 'Doe, J. (2023). Test Paper. Test Journal.'
      });

      const citation = await getCitation('10.1103/PhysRevLett.130.041301', 'apa');

      expect(citation).toContain('Doe, J.');
      expect(mockFetch).toHaveBeenCalledWith(
        'https://api.crossref.org/works/10.1103%2FPhysRevLett.130.041301',
        expect.objectContaining({
          headers: expect.objectContaining({
            'Accept': 'text/x-bibliography; style=apa'
          })
        })
      );
    });

    test('should handle citation errors', async () => {
      mockFetch.mockRejectedValueOnce(new TypeError('Failed to fetch'));

      await expect(getCitation('10.1103/PhysRevLett.130.041301'))
        .rejects
        .toThrow('Failed to generate citation');
    });
  });
});
