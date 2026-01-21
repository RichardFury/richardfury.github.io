<script setup>
import { ref, onMounted } from 'vue';
import { useDOI } from '../../composables/useDOI.js';
import researchFields from '../../data/research-fields.json';
import researchProjects from '../../data/research-projects.json';
import publicationsData from '../../data/research-publications.json';
import { logger } from '../../utils/logger';

// DOI composable
const {
  fetchBatchMetadata,
  validate,
  getUrl,
  isLoading,
  error,
  clearError
} = useDOI();

// Publications state - use ref for reactivity
const publications = ref(publicationsData.map(pub => ({
  ...pub,
  title: null,
  authors: null,
  journal: null,
  year: null,
  volume: null,
  issue: null,
  pages: null,
  citations: null,
  keywords: null,
  doiLoading: true,
  doiError: null
})));

/**
 * Generate DOI URL for a publication
 *
 * @param {Object} publication - The publication object
 * @returns {string} DOI URL
 */
function getPublicationDOIUrl(publication) {
  if (!publication.doi) return null;
  try {
    return getUrl(publication.doi);
  } catch (err) {
    logger.error(`Invalid DOI: ${publication.doi}`, err);
    return null;
  }
}

/**
 * Validate DOI for a publication
 *
 * @param {Object} publication - The publication object
 * @returns {boolean} True if DOI is valid
 */
function validatePublicationDOI(publication) {
  if (!publication.doi) return false;
  return validate(publication.doi);
}

/**
 * Load DOI metadata for all publications on mount
 */
onMounted(async () => {
  try {
    // Extract all DOIs
    const dois = publications.value.map(pub => pub.doi);

    // Batch fetch metadata for all DOIs
    const { results, errors } = await fetchBatchMetadata(dois);

    // Create a map of DOI to metadata for easy lookup
    const metadataMap = new Map();
    results.forEach(metadata => {
      metadataMap.set(metadata.doi, metadata);
    });

    // Update publications with fetched metadata
    publications.value.forEach(publication => {
      const metadata = metadataMap.get(publication.doi);
      if (metadata) {
        // Merge metadata into publication object
        Object.assign(publication, {
          title: metadata.title,
          authors: metadata.authors,
          journal: metadata.journal,
          year: metadata.year,
          volume: metadata.volume,
          issue: metadata.issue,
          pages: metadata.pages,
          citations: null, // Crossref API doesn't provide citation count
          keywords: null, // Crossref API doesn't provide keywords
          doiLoading: false,
          doiError: null
        });
      } else {
        publication.doiLoading = false;
        publication.doiError = 'Failed to fetch metadata';
      }
    });

    // Log any errors
    if (errors.length > 0) {
      logger.warn('Some DOI metadata fetches failed:', errors);
    }
  } catch (err) {
    logger.error('Failed to load publication metadata:', err);
    // Set error state for all publications
    publications.value.forEach(publication => {
      publication.doiLoading = false;
      publication.doiError = err.message;
    });
  }
});
</script>

<template>
  <section class="research-page">
    <div class="container">
      <!-- Page Header -->
      <div class="page-header glass-effect">
        <h1 class="page-title">Research</h1>
        <p class="page-subtitle">Exploring the mysteries of the universe</p>
      </div>
      
      <!-- Research Fields -->
      <div class="research-section">
        <h2 class="section-title">Research Fields</h2>
        <div class="research-fields grid grid-3">
          <div 
            v-for="field in researchFields" 
            :key="field.id"
            class="research-field card"
          >
            <img :src="field.icon" :alt="field.title" class="field-image" />
            <h3 class="field-title">{{ field.title }}</h3>
            <p class="field-description">{{ field.description }}</p>
          </div>
        </div>
      </div>
      
      <!-- Research Projects -->
      <div class="research-section">
        <h2 class="section-title">Research Projects</h2>
        <div class="research-projects">
          <div 
            v-for="project in researchProjects" 
            :key="project.id"
            class="research-project card"
          >
            <div class="project-header">
              <h3 class="project-title">{{ project.title }}</h3>
              <div class="project-meta">
                <span class="project-year">{{ project.year }}</span>
                <span class="project-institution">{{ project.institution }}</span>
              </div>
            </div>
            <p class="project-description">{{ project.description }}</p>
            <div class="project-outcomes">
              <h4 class="outcomes-title">Key Outcomes:</h4>
              <ul class="outcomes-list">
                <li v-for="(outcome, index) in project.outcomes" :key="index" class="outcome-item">
                  {{ outcome }}
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
      
      <!-- Publications -->
      <div class="research-section">
        <h2 class="section-title">Publications</h2>
        <div class="publications">
          <div 
            v-for="publication in publications" 
            :key="publication.id"
            class="publication-item card"
          >
            <!-- Loading State -->
            <div v-if="publication.doiLoading" class="publication-loading">
              <span class="loading-spinner"></span>
              Loading publication metadata...
            </div>

            <!-- Error State -->
            <div v-else-if="publication.doiError" class="publication-error">
              <span class="error-icon">⚠️</span>
              Failed to load publication: {{ publication.doiError }}
              <div class="doi-info">
                DOI: {{ publication.doi }}
              </div>
            </div>

            <!-- Publication Content -->
            <template v-else>
              <h3 class="publication-title">{{ publication.title }}</h3>
              <p class="publication-authors">{{ publication.authors }}</p>
              <div class="publication-meta">
                <div class="publication-journal-info">
                  <span class="publication-journal">{{ publication.journal }}</span>
                  <span v-if="publication.volume" class="publication-volume-issue">
                    {{ publication.volume }}<span v-if="publication.issue">({{ publication.issue }})</span>
                  </span>
                  <span v-if="publication.pages" class="publication-pages">{{ publication.pages }}</span>
                  <span v-if="publication.year" class="publication-year">{{ publication.year }}</span>
                </div>
              </div>

              <!-- DOI Link -->
              <div class="publication-doi-section">
                <a 
                  v-if="publication.doi && getPublicationDOIUrl(publication)"
                  :href="getPublicationDOIUrl(publication)" 
                  class="publication-doi" 
                  target="_blank" 
                  rel="noopener noreferrer"
                >
                  <span class="doi-icon">🔗</span>
                  DOI: {{ publication.doi }}
                </a>
              </div>
            </template>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<style scoped>
.research-page {
  padding: var(--spacing-2xl) 0;
}

/* Page Header */
.page-header {
  padding: var(--spacing-3xl) var(--spacing-lg);
  margin-bottom: var(--spacing-3xl);
  text-align: center;
  animation: fadeIn var(--transition-slow) ease;
}

.page-title {
  font-size: 3rem;
  margin-bottom: var(--spacing-sm);
  font-weight: 200;
}

@media (max-width: 768px) {
  .page-title {
    font-size: 2.5rem;
  }
}

.page-subtitle {
  font-size: 1.25rem;
  color: var(--text-secondary);
  margin: 0;
  font-weight: 300;
}

/* Research Section Common */
.research-section {
  margin-bottom: var(--spacing-3xl);
}

/* Research Fields */
.research-fields {
  gap: var(--spacing-lg);
}

.research-field {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  padding: var(--spacing-lg);
  transition: all var(--transition-normal);
  animation: fadeIn var(--transition-slow) ease forwards;
  position: relative;
}

.research-field:hover {
  transform: translateY(-5px);
  border-color: var(--accent-tertiary);
}

.field-image {
  width: 100%;
  height: 200px;
  object-fit: cover;
  border-radius: var(--border-radius-md);
  margin-bottom: var(--spacing-lg);
}

.field-title {
  font-size: 1.25rem;
  margin-bottom: var(--spacing-sm);
  font-weight: 400;
}

.field-description {
  color: var(--text-secondary);
  line-height: 1.6;
  margin: 0;
}

/* Research Projects */
.research-projects {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-lg);
}

.research-project {
  transition: all var(--transition-normal);
  animation: fadeIn var(--transition-slow) ease forwards;
  padding: var(--spacing-lg);
}

.research-project:hover {
  transform: translateX(10px);
  border-color: var(--accent-tertiary);
}

.project-header {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-xs);
  margin-bottom: var(--spacing-md);
}

.project-title {
  font-size: 1.4rem;
  margin: 0;
  font-weight: 400;
  line-height: 1.4;
}

.project-meta {
  display: flex;
  gap: var(--spacing-lg);
  align-items: center;
  flex-wrap: wrap;
}

.project-year {
  font-size: 0.9rem;
  color: var(--accent-primary);
  font-weight: 500;
  background-color: var(--bg-tertiary);
  padding: var(--spacing-xs) var(--spacing-sm);
  border-radius: 4px;
}

.project-institution {
  font-size: 0.9rem;
  color: var(--text-secondary);
  font-style: italic;
}

.project-description {
  margin-bottom: var(--spacing-lg);
  color: var(--text-secondary);
  line-height: 1.6;
}

.outcomes-title {
  font-size: 1.1rem;
  margin-bottom: var(--spacing-sm);
  font-weight: 400;
}

.outcomes-list {
  list-style-type: disc;
  padding-left: var(--spacing-xl);
  margin: 0;
}

.outcome-item {
  margin-bottom: var(--spacing-xs);
  color: var(--text-secondary);
  line-height: 1.5;
}

/* Publications */
.publications {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-md);
}

.publication-item {
  transition: all var(--transition-normal);
  animation: fadeIn var(--transition-slow) ease forwards;
  padding: var(--spacing-lg);
}

.publication-item:hover {
  border-color: var(--accent-tertiary);
}

/* Publication Loading State */
.publication-loading {
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
  color: var(--text-secondary);
  font-size: 0.95rem;
  padding: var(--spacing-lg);
  justify-content: center;
}

/* Publication Error State */
.publication-error {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-sm);
  color: var(--error-color, #e74c3c);
  font-size: 0.95rem;
  padding: var(--spacing-lg);
  background-color: rgba(231, 76, 60, 0.1);
  border-radius: 4px;
  border: 1px solid rgba(231, 76, 60, 0.3);
}

.publication-error .doi-info {
  font-size: 0.85rem;
  color: var(--text-secondary);
  font-family: monospace;
  background-color: var(--bg-tertiary);
  padding: var(--spacing-xs) var(--spacing-sm);
  border-radius: 4px;
  align-self: flex-start;
}

.publication-title {
  font-size: 1.3rem;
  margin-bottom: var(--spacing-sm);
  font-weight: 400;
  transition: color var(--transition-normal);
  line-height: 1.4;
}

.publication-item:hover .publication-title {
  color: var(--accent-primary);
}

.publication-authors {
  margin-bottom: var(--spacing-xs);
  color: var(--text-secondary);
  font-style: italic;
  font-size: 0.95rem;
}

.publication-meta {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-xs);
  margin-bottom: var(--spacing-sm);
  font-size: 0.9rem;
}

.publication-journal-info {
  display: flex;
  flex-wrap: wrap;
  gap: var(--spacing-md);
  color: var(--text-secondary);
}

.publication-journal {
  font-weight: 500;
  color: var(--text-primary);
}

.publication-volume-issue, .publication-pages {
  color: var(--text-secondary);
}

.publication-year {
  color: var(--accent-primary);
  font-weight: 500;
}

.publication-doi {
  color: var(--text-primary);
  text-decoration: none;
  font-size: 0.9rem;
  transition: color var(--transition-normal);
  display: inline-flex;
  align-items: center;
  gap: var(--spacing-xs);
  margin-top: var(--spacing-xs);
  padding: var(--spacing-xs) var(--spacing-sm);
  background-color: var(--bg-tertiary);
  border-radius: 4px;
  border: 1px solid var(--border-color);
}

.publication-doi:hover {
  color: var(--accent-primary);
  background-color: var(--bg-secondary);
  border-color: var(--accent-primary);
}

.doi-icon {
  font-size: 1rem;
}

/* DOI Section */
.publication-doi-section {
  border-top: 1px solid var(--border-color);
}

/* Loading Spinner */
.loading-spinner {
  width: 16px;
  height: 16px;
  border: 2px solid var(--border-color);
  border-top-color: var(--accent-primary);
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

/* Animation Delays */
.research-field:nth-child(1),
.research-project:nth-child(1),
.publication-item:nth-child(1) {
  animation-delay: 0.1s;
}

.research-field:nth-child(2),
.research-project:nth-child(2),
.publication-item:nth-child(2) {
  animation-delay: 0.2s;
}

.research-field:nth-child(3),
.publication-item:nth-child(3) {
  animation-delay: 0.3s;
}
</style>
