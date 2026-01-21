/**
 * 实现瀑布流布局 - 优化版
 * @param {string} containerSelector - 容器选择器
 * @param {string} itemSelector - 项目选择器
 * @param {number} gutter - 项目间距
 */
export function initWaterfall(containerSelector, itemSelector, gutter = 20) {
  const container = document.querySelector(containerSelector);
  if (!container) return;

  const items = container.querySelectorAll(itemSelector);
  if (items.length === 0) return;

  // 获取容器宽度和项目宽度
  const containerWidth = container.clientWidth;
  const itemWidth = items[0].clientWidth;
  
  // 计算列数
  const columns = Math.floor(containerWidth / (itemWidth + gutter));
  
  // 如果只有一列，直接返回
  if (columns <= 1) {
    items.forEach(item => {
      item.style.position = 'static';
      item.style.top = 'auto';
      item.style.left = 'auto';
    });
    return;
  }

  // 初始化每列的高度和位置
  const columnInfo = new Array(columns).fill(0).map((_, index) => ({
    height: 0,
    left: index * (itemWidth + gutter)
  }));
  
  // 批量缓存所有项目的高度，减少DOM访问
  const itemsWithHeight = Array.from(items).map(item => {
    // 获取计算后的高度（包括padding等）
    const computedStyle = window.getComputedStyle(item);
    const height = item.clientHeight;
    return { element: item, height };
  });
  
  // 设置项目样式和位置
  itemsWithHeight.forEach(({ element, height }) => {
    // 快速找到最短列 - 优化点：避免每次都调用Math.min和indexOf
    let minColumn = columnInfo[0];
    for (let i = 1; i < columns; i++) {
      if (columnInfo[i].height < minColumn.height) {
        minColumn = columnInfo[i];
      }
    }
    
    // 设置项目位置
    element.style.position = 'absolute';
    element.style.top = `${minColumn.height}px`;
    element.style.left = `${minColumn.left}px`;
    element.style.zIndex = '10'; // 确保项目在正确的z-index层次，以便点击事件能够触发
    
    // 更新该列的高度
    minColumn.height += height + gutter;
  });
  
  // 计算容器高度
  const containerHeight = Math.max(...columnInfo.map(col => col.height));
  container.style.height = `${containerHeight}px`;
}

/**
 * 更新瀑布流布局 - 优化版
 * @param {string} containerSelector - 容器选择器
 * @param {string} itemSelector - 项目选择器
 * @param {number} gutter - 项目间距
 */
export function updateWaterfall(containerSelector, itemSelector, gutter = 20) {
  const container = document.querySelector(containerSelector);
  if (!container) return;
  
  // 直接调用优化后的initWaterfall函数，避免不必要的重置操作
  // 优化点：initWaterfall内部已经处理了所有逻辑，包括列数计算和位置设置
  // 不需要先重置样式再重新计算，减少DOM操作次数
  initWaterfall(containerSelector, itemSelector, gutter);
}

/**
 * 添加窗口大小变化监听，自动更新瀑布流
 * @param {string} containerSelector - 容器选择器
 * @param {string} itemSelector - 项目选择器
 * @param {number} gutter - 项目间距
 */
export function addWaterfallResizeListener(containerSelector, itemSelector, gutter = 20) {
  let resizeTimeout;
  window.addEventListener('resize', () => {
    clearTimeout(resizeTimeout);
    resizeTimeout = setTimeout(() => {
      updateWaterfall(containerSelector, itemSelector, gutter);
    }, 250);
  });
}
