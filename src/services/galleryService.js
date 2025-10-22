import { GalleryImage } from '../models/GalleryImage.js';
import galleryData from '../data/galleryData.json';

/**
 * 获取本地相册数据
 * 从src/data/gallery目录加载图片，数据配置在galleryData.json中
 */
function getLocalGalleryImages() {
  // 从JSON数据中创建GalleryImage对象
  return galleryData.map(item => {
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
    
    return new GalleryImage(
      item.id,
      imagePath, // 使用修正后的图片路径
      item.title, // JSON中的title对应GalleryImage中的description
      item.tags,
      item.cameraParams
    );
  });
}

/**
 * 主函数：获取相册图片
 * 直接从本地src/data/gallery目录加载图片
 */
export const getGalleryImages = async () => {
  try {
    console.log('正在从本地src/data/gallery目录加载图片...');
    const images = getLocalGalleryImages();
    console.log(`成功加载了${images.length}张图片`);
    return images;
  } catch (error) {
    console.error('加载本地图片时出错:', error);
    return []; // 出错时返回空数组
  }
};