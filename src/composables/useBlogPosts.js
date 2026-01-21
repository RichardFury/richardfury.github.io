import { ref } from 'vue';
import { logger } from '../utils/logger';

export function useBlogPosts() {
  const blogPosts = ref([]);
  const loading = ref(false);
  const error = ref(null);

  async function fetchBlogPosts() {
    loading.value = true;
    error.value = null;
    try {
      const response = await fetch(`${import.meta.env.BASE_URL}data/blog-posts.json`);
      if (!response.ok) {
        throw new Error('Failed to fetch blog posts');
      }
      const data = await response.json();
      blogPosts.value = data;
    } catch (err) {
      error.value = err.message;
      logger.error('Error fetching blog posts:', err);
    } finally {
      loading.value = false;
    }
  }

  async function getBlogPostById(id) {
    if (blogPosts.value.length === 0) {
      await fetchBlogPosts();
    }
    const post = blogPosts.value.find(post => post.id === parseInt(id));
    if (!post) {
      return null;
    }
    
    try {
      const fileName = post.file;
      const encodedFileName = encodeURIComponent(fileName);
      const response = await fetch(`${import.meta.env.BASE_URL}blog/${encodedFileName}`);
      if (!response.ok) {
        throw new Error('Failed to fetch blog post content');
      }
      const markdownContent = await response.text();
      return {
        ...post,
        content: markdownContent
      };
    } catch (err) {
      logger.error('Error fetching blog post content:', err);
      return post;
    }
  }

  return {
    blogPosts,
    loading,
    error,
    fetchBlogPosts,
    getBlogPostById
  };
}
