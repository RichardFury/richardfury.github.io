import { GalleryImage } from '../models/GalleryImage.js';
import galleryData from '../data/galleryData.json';
import { getCameraParamsFromImage } from '../utils/exifParser';

/**
 * 获取本地相册数据
 * 从src/data/gallery目录加载图片，数据配置在galleryData.json中
 * @param {boolean} autoExtractExif - 是否自动从图片中提取EXIF数据
 */
async function getLocalGalleryImages(autoExtractExif = true) {
  // 从JSON数据中创建GalleryImage对象
  let images = galleryData.map(item => {
    // 确保图片路径指向src/data/gallery目录
    let imagePath = item.url;
    
    // 如果路径不是以/src/data/gallery/开头，自动添加正确的路径前缀
    if (!imagePath.startsWith('/src/data/gallery/')) {
      // 如果是相对路径，转换为绝对路径
      if (!imagePath.startsWith('/')) {
        imagePath = `/src/data/gallery/${imagePath}`;
      } else {
        // 如果已有其他绝对路径，替换为正确的路径
        const filename = imagePath.substring(imagePath.lastIndexOf('/') + 1);
        imagePath = `/src/data/gallery/${filename}`;
      }
    }
    
    return {
      id: item.id,
      url: imagePath,
      title: item.title,
      tags: item.tags,
      cameraParams: item.cameraParams
    };
  });
  
  // 如果启用自动提取EXIF数据
  if (autoExtractExif) {
    images = await Promise.all(images.map(async (item) => {
      try {
        // 尝试从图片URL获取EXIF数据，同时传递原始相机参数以保留相机型号
        const imageUrl = new URL(item.url, window.location.origin).href;
        const cameraParams = await getCameraParamsFromImage(imageUrl, item.cameraParams);
        
        // 仅当EXIF数据有效时更新cameraParams（相机型号会被保留）
        const hasValidParams = Object.values(cameraParams).some(value => value !== '未知');
        return {
          ...item,
          cameraParams: hasValidParams ? cameraParams : item.cameraParams
        };
      } catch (error) {
        console.warn(`为图片 ${item.url} 提取EXIF数据失败:`, error);
        // 如果提取失败，保留原始数据
        return item;
      }
    }));
  }
  
  // 转换为GalleryImage对象
  return images.map(item => new GalleryImage(
    item.id,
    item.url,
    item.title,
    item.tags,
    item.cameraParams
  ));
}

/**
 * 主函数：获取相册图片
 * 直接从本地src/data/gallery目录加载图片
 * @param {Object} options - 配置选项
 * @param {boolean} options.autoExtractExif - 是否自动从图片中提取相机参数
 */
export const getGalleryImages = async (options = { autoExtractExif: true }) => {
  try {
    console.log('正在从本地src/data/gallery目录加载图片...');
    const images = await getLocalGalleryImages(options.autoExtractExif);
    console.log(`成功加载了${images.length}张图片`);
    return images;
  } catch (error) {
    console.error('加载本地图片时出错:', error);
    return []; // 出错时返回空数组
  }
};

/**
 * 手动更新指定图片的相机参数（从图片中提取）
 * @param {string} imageUrl - 图片URL
 * @param {Object} originalParams - 原始的相机参数（用于保留相机型号）
 * @returns {Promise<Object|null>} 提取的相机参数，如果失败则返回null
 */
export async function updateCameraParamsFromImage(imageUrl, originalParams = null) {
  try {
    const fullUrl = new URL(imageUrl, window.location.origin).href;
    const cameraParams = await getCameraParamsFromImage(fullUrl, originalParams);
    return cameraParams;
  } catch (error) {
    console.error(`更新图片 ${imageUrl} 的相机参数失败:`, error);
    return null;
  }
}