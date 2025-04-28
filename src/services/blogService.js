import { Blog } from '../models/Blog.js';

export const getBlogPosts = async () => {
  try {
    const response = await fetch('/api/blogs');
    if (!response.ok) {
      throw new Error('Failed to fetch blog posts');
    }
    return await response.json();
  } catch (error) {
    console.error('Error fetching blog posts:', error);
    return [];
  }
};

export const createBlogPost = async (post) => {
  try {
    const response = await fetch('/api/blogs', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(post),
    });
    return await response.json();
  } catch (error) {
    console.error('Error creating blog post:', error);
    return null;
  }
};