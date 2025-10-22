/**
 * EXIF元数据解析器
 * 用于从照片中提取相机参数等EXIF信息
 */
import exifr from 'exifr';

/**
 * 从图片文件或URL中提取EXIF数据
 * @param {File|string} source - 图片文件对象或URL
 * @returns {Promise<Object|null>} 提取的EXIF数据，如果解析失败则返回null
 */
export async function extractExifData(source) {
  try {
    // 使用exifr提取EXIF数据
    const data = await exifr.parse(source, {
      gps: false, // 不提取GPS数据
      xmp: false, // 不提取XMP数据
      iptc: false, // 不提取IPTC数据
      icc: false, // 不提取ICC配置文件
      mergeOutput: true, // 合并输出
      translateKeys: true // 转换键名到标准格式
    });
    
    return data;
  } catch (error) {
    console.error('提取EXIF数据失败:', error);
    return null;
  }
}

/**
 * 从EXIF数据中提取相机参数，格式化为galleryData.json所需的格式
 * @param {Object} exifData - 原始EXIF数据
 * @param {Object} originalParams - 原始的相机参数（用于保留相机型号）
 * @returns {Object} 格式化后的相机参数
 */
export function formatCameraParams(exifData, originalParams = null) {
  if (!exifData) {
    return {
      camera: originalParams?.camera || '未知',
      aperture: '未知',
      shutterSpeed: '未知',
      iso: '未知',
      focalLength: '未知'
    };
  }

  return {
    // 保留原始的相机型号，不从EXIF中解析
    camera: originalParams?.camera || '未知',
    aperture: formatAperture(exifData.FNumber),
    shutterSpeed: formatShutterSpeed(exifData.ExposureTime),
    iso: formatISO(exifData.ISO),
    focalLength: formatFocalLength(exifData.FocalLength)
  };
}

/**
 * 格式化相机名称
 * @param {string} make - 相机制造商
 * @param {string} model - 相机型号
 * @returns {string} 格式化的相机名称
 */
function formatCameraName(make, model) {
  if (!model && !make) return '未知';
  
  let result = '';
  if (make) result += make.trim();
  if (model) {
    // 移除型号中的制造商名称，避免重复
    let modelTrimmed = model.trim();
    if (make && modelTrimmed.startsWith(make.trim())) {
      modelTrimmed = modelTrimmed.substring(make.trim().length).trim();
    }
    result += result ? ` ${modelTrimmed}` : modelTrimmed;
  }
  
  return result || '未知';
}

/**
 * 格式化光圈值
 * @param {number} fNumber - F值
 * @returns {string} 格式化的光圈值，如 "f/2.8"
 */
function formatAperture(fNumber) {
  if (!fNumber || fNumber <= 0) return '未知';
  return `f/${fNumber.toFixed(1)}`;
}

/**
 * 格式化快门速度
 * @param {number} exposureTime - 曝光时间（秒）
 * @returns {string} 格式化的快门速度，如 "1/125s" 或 "10s"
 */
function formatShutterSpeed(exposureTime) {
  if (!exposureTime || exposureTime <= 0) return '未知';
  
  // 如果曝光时间小于1秒，使用分数形式
  if (exposureTime < 1) {
    // 计算分母，四舍五入到最近的整数值
    const denominator = Math.round(1 / exposureTime);
    return `1/${denominator}s`;
  } else {
    // 如果曝光时间大于等于1秒，直接显示秒数
    return `${exposureTime}s`;
  }
}

/**
 * 格式化ISO值
 * @param {number} iso - ISO值
 * @returns {string} 格式化的ISO值
 */
function formatISO(iso) {
  if (!iso || iso <= 0) return '未知';
  return `ISO ${Math.round(iso)}`;
}

/**
 * 格式化焦距
 * @param {number} focalLength - 焦距（毫米）
 * @returns {string} 格式化的焦距，如 "24mm"
 */
function formatFocalLength(focalLength) {
  if (!focalLength || focalLength <= 0) return '未知';
  return `${Math.round(focalLength)}mm`;
}

/**
 * 从图片文件或URL中直接获取格式化的相机参数
 * @param {File|string} source - 图片文件对象或URL
 * @param {Object} originalParams - 原始的相机参数（用于保留相机型号）
 * @returns {Promise<Object>} 格式化后的相机参数
 */
export async function getCameraParamsFromImage(source, originalParams = null) {
  const exifData = await extractExifData(source);
  return formatCameraParams(exifData, originalParams);
}

/**
 * 批量处理图片并生成galleryData格式的数据
 * @param {Array<{file: File, title: string, tags: Array<string>, cameraParams?: Object}>} imagesData - 图片数据数组
 * @returns {Promise<Array>} 格式化后的galleryData数组
 */
export async function generateGalleryData(imagesData) {
  const galleryItems = [];
  
  for (let i = 0; i < imagesData.length; i++) {
    const { file, title, tags, cameraParams: originalCameraParams } = imagesData[i];
    // 传递原始相机参数以保留相机型号
    const cameraParams = await getCameraParamsFromImage(file, originalCameraParams);
    
    galleryItems.push({
      id: `${i + 1}`,
      url: file.name,
      title: title || '未命名',
      tags: tags || [],
      cameraParams: cameraParams
    });
  }
  
  return galleryItems;
}

/**
 * 检查图片是否包含EXIF数据
 * @param {File|string} source - 图片文件对象或URL
 * @returns {Promise<boolean>} 是否包含EXIF数据
 */
export async function hasExifData(source) {
  try {
    const exifData = await extractExifData(source);
    return exifData !== null && Object.keys(exifData).length > 0;
  } catch (error) {
    console.error('检查EXIF数据失败:', error);
    return false;
  }
}

/**
 * 从本地文件系统读取图片并提取EXIF数据（浏览器环境）
 * @param {File} file - 图片文件
 * @returns {Promise<Object>} 包含图片信息和EXIF数据的对象
 */
export async function processImageFile(file) {
  if (!file || !file.type.startsWith('image/')) {
    throw new Error('无效的图片文件');
  }
  
  try {
    const exifData = await extractExifData(file);
    const cameraParams = formatCameraParams(exifData);
    
    return {
      filename: file.name,
      size: file.size,
      type: file.type,
      exifData: exifData,
      cameraParams: cameraParams,
      hasExif: exifData !== null && Object.keys(exifData).length > 0
    };
  } catch (error) {
    console.error('处理图片文件失败:', error);
    throw error;
  }
}

export default {
  extractExifData,
  formatCameraParams,
  getCameraParamsFromImage,
  generateGalleryData,
  hasExifData,
  processImageFile
};