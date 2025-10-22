# EXIF元数据解析工具使用指南

本文档介绍了如何使用项目中的EXIF解析工具自动从照片中提取相机参数，并将其应用到Gallery页面。

## 功能概述

我们提供了一个强大的EXIF元数据解析工具，可以：

- **保留galleryData.json中的相机型号**，不从EXIF中解析
- 自动从照片中提取光圈、快门速度、ISO和焦距等参数
- 格式化提取的数据以符合galleryData.json的要求格式
- 批量处理多张图片
- 提供灵活的API，可以根据需要启用或禁用自动提取功能

## 安装依赖

该工具使用了`exifr`库来解析EXIF数据。如果你还没有安装，请运行：

```bash
npm install exifr
```

## 使用方法

### 1. 自动从图片中提取相机参数

Gallery服务已经集成了自动提取功能，默认情况下会在加载图片时自动尝试提取EXIF数据。

在Gallery页面中，当加载图片时，系统会：
1. 首先从galleryData.json中读取基础数据
2. 然后尝试从图片文件中提取EXIF元数据
3. **保留galleryData.json中的相机型号**，仅用EXIF数据更新光圈、快门速度、ISO和焦距
4. 如果提取失败或没有有效数据，则保留galleryData.json中的所有原始数据

### 2. 手动控制EXIF提取

如果你想禁用自动提取功能，可以在调用`getGalleryImages`时设置参数：

```javascript
import { getGalleryImages } from '../services/galleryService';

// 禁用自动EXIF提取
const images = await getGalleryImages({ autoExtractExif: false });

// 启用自动EXIF提取（默认行为）
const imagesWithExif = await getGalleryImages({ autoExtractExif: true });
```

### 3. 手动更新单张图片的相机参数

你可以使用`updateCameraParamsFromImage`函数来手动更新特定图片的相机参数：

```javascript
import { updateCameraParamsFromImage } from '../services/galleryService';

const imageUrl = '/src/data/gallery/photo-light.JPG';
const cameraParams = await updateCameraParamsFromImage(imageUrl);

if (cameraParams) {
  console.log('提取的相机参数:', cameraParams);
  // 这里可以更新galleryData.json或使用这些参数
}
```

### 4. 使用低级API进行自定义处理

如果你需要更精细的控制，可以直接使用`exifParser.js`中提供的低级API：

```javascript
import { 
  extractExifData, 
  formatCameraParams, 
  getCameraParamsFromImage,
  generateGalleryData,
  hasExifData,
  processImageFile
} from '../utils/exifParser';

// 示例：检查图片是否包含EXIF数据
const hasExif = await hasExifData('/path/to/image.jpg');
console.log('图片是否包含EXIF数据:', hasExif);

// 示例：批量生成galleryData
const imagesData = [
  { file: imageFile1, title: '风景照片1', tags: ['风景', '自然'], cameraParams: { camera: 'Canon EOS R5' } },
  { file: imageFile2, title: '人像照片', tags: ['人像', '生活'], cameraParams: { camera: 'Sony A7R IV' } }
];
const galleryData = await generateGalleryData(imagesData);
// 注意：生成的galleryData中，camera字段将保留上面指定的值，其他参数会从EXIF中提取
```

## 浏览器兼容性注意事项

- 该功能依赖于浏览器的Fetch API和FileReader API
- 在跨域情况下，可能会受到CORS策略限制
- 某些处理过的图片（如通过社交媒体分享或编辑软件保存的图片）可能已被移除EXIF数据

## 故障排除

### 无法提取EXIF数据

如果无法从图片中提取EXIF数据，请检查：

1. 图片是否保留了EXIF元数据（许多图片编辑软件默认会删除EXIF数据）
2. 是否存在跨域限制（如果图片来自不同域）
3. 控制台中是否有相关错误信息

### 提取的数据不完整

如果提取的数据不完整，可能是因为：

1. 原始图片中只包含部分EXIF信息
2. 某些相机型号的EXIF数据格式可能不标准

### 更新galleryData.json

如果你想将提取的相机参数永久保存到galleryData.json文件中，可以使用以下步骤：

1. 使用`getCameraParamsFromImage`提取参数
2. 手动编辑`src/data/galleryData.json`文件，更新相应图片的cameraParams字段

## 示例代码

### 从文件上传提取EXIF数据

```javascript
import { processImageFile } from '../utils/exifParser';

// 文件上传处理
async function handleFileUpload(event) {
  const file = event.target.files[0];
  if (file) {
    try {
      const result = await processImageFile(file);
      console.log('处理结果:', result);
      
      // 显示提取的相机参数
      if (result.hasExif) {
        alert(`相机: ${result.cameraParams.camera}\n光圈: ${result.cameraParams.aperture}\n快门: ${result.cameraParams.shutterSpeed}\nISO: ${result.cameraParams.iso}\n焦距: ${result.cameraParams.focalLength}`);
      }
    } catch (error) {
      console.error('处理文件失败:', error);
    }
  }
}
```

### 批量更新galleryData

```javascript
import galleryData from '../data/galleryData.json';
import { getCameraParamsFromImage } from '../utils/exifParser';

async function updateAllCameraParams() {
  const updatedData = [];
  
  for (const item of galleryData) {
    try {
      const imageUrl = `/src/data/gallery/${item.url}`;
      const cameraParams = await getCameraParamsFromImage(imageUrl);
      
      updatedData.push({
        ...item,
        cameraParams: cameraParams
      });
    } catch (error) {
      console.warn(`无法更新图片 ${item.url} 的参数，保留原值`, error);
      updatedData.push(item);
    }
  }
  
  // 这里可以将updatedData保存回galleryData.json文件
  console.log('更新后的galleryData:', JSON.stringify(updatedData, null, 2));
}
```

## 性能优化建议

- 对于大量图片，考虑使用懒加载结合EXIF提取
- 可以将提取的EXIF数据缓存起来，避免重复提取
- 对于静态网站，可以在构建时预先提取EXIF数据并存入galleryData.json

## 注意事项

- 尊重用户隐私，EXIF数据可能包含位置信息等敏感数据（本工具已排除GPS数据的提取）
- 大尺寸图片的EXIF提取可能会有一定延迟
- 确保在服务器端配置正确的CORS策略，以允许浏览器加载图片文件

## 相关文件

- `src/utils/exifParser.js` - EXIF解析工具的主要实现
- `src/services/galleryService.js` - 集成了EXIF提取功能的画廊服务
- `src/data/galleryData.json` - 存储图片信息和相机参数的配置文件