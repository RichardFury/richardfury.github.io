import { GalleryImage } from '../models/GalleryImage.js';

export const getGalleryImages = async () => {
  try {
    const response = await fetch('/api/gallery');
    if (!response.ok) {
      throw new Error('Failed to fetch gallery images');
    }
    const data = await response.json();
    return data.map(img => new GalleryImage(img.id, img.path, img.description, img.tags));
  } catch (error) {
    console.error('Error fetching gallery images:', error);
    return [];
  }
};