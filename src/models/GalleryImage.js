export class GalleryImage {
  constructor(id, path, description, tags, cameraParams = {}) {
    this.id = id;
    this.path = path;
    this.description = description;
    this.tags = tags;
    // 相机参数
    this.camera = cameraParams.camera || null;
    this.aperture = cameraParams.aperture || null;
    this.shutterSpeed = cameraParams.shutterSpeed || null;
    this.iso = cameraParams.iso || null;
    this.focalLength = cameraParams.focalLength || null;
  }
}