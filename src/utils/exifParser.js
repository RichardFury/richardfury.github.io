import ExifReader from 'exifreader';
import { logger } from './logger';

/**
 * 解析图片的EXIF数据
 * @param {string} imageUrl - 图片URL
 * @returns {Promise<Object>} EXIF数据对象
 */
export async function parseExif(imageUrl) {
  try {
    logger.debug('Starting EXIF parsing for:', imageUrl);
    
    // 使用fetch获取图片数据
    const response = await fetch(imageUrl);
    if (!response.ok) {
      throw new Error(`Failed to fetch image: ${response.status}`);
    }
    
    const arrayBuffer = await response.arrayBuffer();
    logger.debug('Image data loaded, size:', arrayBuffer.byteLength, 'bytes');
    
    // 使用ExifReader解析EXIF数据
    const tags = ExifReader.load(arrayBuffer);
    logger.debug('EXIF tags loaded:', Object.keys(tags).length, 'tags');
    
    // 提取常用的EXIF信息
    const processedData = {};
    
    // 相机型号（可能不存在）
    if (tags['Model']?.description) {
      processedData.cameraModel = tags['Model'].description;
    }
    
    // 镜头型号（可能不存在）
    if (tags['LensModel']?.description) {
      processedData.lensModel = tags['LensModel'].description;
    }
    
    // 光圈
    if (tags['FNumber']?.description) {
      processedData.aperture = tags['FNumber'].description;
    }
    
    // 快门速度
    if (tags['ExposureTime']?.description) {
      processedData.shutterSpeed = tags['ExposureTime'].description;
    }
    
    // ISO
    if (tags['ISOSpeedRatings']?.description) {
      processedData.iso = `ISO ${tags['ISOSpeedRatings'].description}`;
    }
    
    // 焦距
    if (tags['FocalLength']?.description) {
      processedData.focalLength = tags['FocalLength'].description;
    }
    
    // 拍摄日期
    if (tags['DateTimeOriginal']?.description) {
      processedData.dateTaken = tags['DateTimeOriginal'].description;
    }
    
    // 方向
    if (tags['Orientation']?.value) {
      processedData.orientation = tags['Orientation'].value;
    }
    
    logger.debug('Processed EXIF data:', processedData);
    
    // 如果没有任何EXIF数据，返回null
    if (Object.keys(processedData).length === 0) {
      logger.debug('No EXIF data found');
      return null;
    }
    
    return processedData;
  } catch (error) {
    logger.error('Failed to parse EXIF data:', error);
    return null;
  }
}

/**
 * 获取图片方向
 * @param {number} orientation - EXIF方向值
 * @returns {string} 方向描述
 */
export function getOrientationDescription(orientation) {
  const orientations = {
    1: 'Normal',
    2: 'Flipped Horizontal',
    3: 'Rotated 180°',
    4: 'Flipped Vertical',
    5: 'Rotated 90° CCW and Flipped Horizontal',
    6: 'Rotated 90° CW',
    7: 'Rotated 90° CW and Flipped Horizontal',
    8: 'Rotated 90° CCW'
  };
  
  return orientations[orientation] || 'Unknown';
}
