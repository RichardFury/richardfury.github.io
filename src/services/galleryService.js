import { GalleryImage } from '../models/GalleryImage.js';
import galleryData from '../data/galleryData.json';

// Google Drive API 配置
const GOOGLE_API_KEY = 'YOUR_GOOGLE_API_KEY'; // 请替换为实际的API密钥
const FOLDER_ID = 'YOUR_GOOGLE_DRIVE_FOLDER_ID'; // 请替换为实际的文件夹ID

/**
 * 初始化Google API客户端
 */
async function initGoogleApi() {
  // 动态加载Google API客户端库
  if (!window.gapi) {
    await new Promise((resolve, reject) => {
      const script = document.createElement('script');
      script.src = 'https://apis.google.com/js/api.js';
      script.onload = resolve;
      script.onerror = reject;
      document.head.appendChild(script);
    });
  }

  // 初始化API客户端
  return new Promise((resolve, reject) => {
    window.gapi.load('client', async () => {
      try {
        await window.gapi.client.init({
          apiKey: GOOGLE_API_KEY,
          discoveryDocs: ['https://www.googleapis.com/discovery/v1/apis/drive/v3/rest'],
        });
        resolve();
      } catch (error) {
        reject(error);
      }
    });
  });
}

/**
 * 从Google Drive获取文件夹中的图片
 */
async function getImagesFromGoogleDrive() {
  try {
    await initGoogleApi();
    
    // 调用Google Drive API获取文件夹中的文件
    const response = await window.gapi.client.drive.files.list({
      q: `'${FOLDER_ID}' in parents and mimeType contains 'image/' and trashed = false`,
      fields: 'files(id, name, description, mimeType, modifiedTime)',
      orderBy: 'modifiedTime desc',
      pageSize: 100
    });

    const files = response.result.files;
    
    // 创建图片URL并构建GalleryImage对象
    return await Promise.all(files.map(async (file) => {
      // 生成可访问的图片URL
      const imageUrl = `https://drive.google.com/uc?id=${file.id}&export=view`;
      
      // 提取图片名称作为描述（可选）
      const description = file.description || file.name.replace(/\.[^/.]+$/, "");
      
      // 从文件名或描述中提取标签（这里简单实现，实际可能需要更复杂的逻辑）
      const tags = extractTagsFromName(file.name);
      
      return new GalleryImage(file.id, imageUrl, description, tags);
    }));
  } catch (error) {
    console.error('Error fetching images from Google Drive:', error);
    
    // 提供模拟数据作为后备方案
    return getMockGalleryImages();
  }
}

/**
 * 从文件名中提取标签
 */
function extractTagsFromName(filename) {
  // 这里是一个简单的实现，实际可能需要根据命名规则调整
  // 假设文件名格式为 "名称_标签1_标签2.jpg"
  const parts = filename.split('_');
  if (parts.length > 1) {
    // 移除文件扩展名
    const lastPart = parts[parts.length - 1];
    const extensionIndex = lastPart.lastIndexOf('.');
    if (extensionIndex > 0) {
      parts[parts.length - 1] = lastPart.substring(0, extensionIndex);
    }
    return parts.slice(1); // 跳过第一个元素（名称）
  }
  return [];
}

/**
 * 获取模拟的相册数据（用于开发或API不可用时的后备方案）
 */
function getMockGalleryImages() {
  // 从JSON数据中创建GalleryImage对象，注意将url映射到path
  return galleryData.map(item => {
    return new GalleryImage(
      item.id,
      item.url, // JSON中的url对应GalleryImage中的path
      item.title, // JSON中的title对应GalleryImage中的description
      item.tags,
      item.cameraParams
    );
  });
}

/**
 * 主函数：获取相册图片
 * 优先从Google Drive获取，失败时返回模拟数据
 */
export const getGalleryImages = async () => {
  try {
    // 尝试从Google Drive获取图片
    const driveImages = await getImagesFromGoogleDrive();
    
    // 如果成功获取到图片，返回它们
    if (driveImages && driveImages.length > 0) {
      return driveImages;
    }
    
    // 否则返回模拟数据
    return getMockGalleryImages();
  } catch (error) {
    console.error('Error in getGalleryImages:', error);
    // 出错时返回模拟数据
    return getMockGalleryImages();
  }
};