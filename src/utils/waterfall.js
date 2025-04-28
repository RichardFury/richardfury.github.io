export function initWaterfall(containerSelector, itemSelector) {
  const container = document.querySelector(containerSelector);
  const items = container.querySelectorAll(itemSelector);
  
  let columns = 0;
  let columnWidth = 0;
  const gaps = 16; // 列间距

  function calculateLayout() {
    container.style.position = 'relative';
    container.style.width = '100%';
    
    const containerWidth = container.offsetWidth;
    columns = Math.floor((containerWidth + gaps) / (300 + gaps));
    columnWidth = (containerWidth - (columns - 1) * gaps) / columns;

    const positions = Array(columns).fill(0);

    items.forEach(item => {
      item.style.position = 'absolute';
      item.style.width = columnWidth + 'px';
      item.style.transition = 'all 0.3s ease';
      
      const minHeight = Math.min(...positions);
      const columnIndex = positions.indexOf(minHeight);
      
      item.style.left = columnIndex * (columnWidth + gaps) + 'px';
      item.style.top = minHeight + 'px';
      
      positions[columnIndex] += item.offsetHeight + gaps;
    });

    container.style.height = Math.max(...positions) + 'px';
  }

  function debounce(fn, delay) {
    let timer;
    return () => {
      clearTimeout(timer);
      timer = setTimeout(fn, delay);
    };
  }

  calculateLayout();
  window.addEventListener('resize', debounce(calculateLayout, 200));

  const ro = new ResizeObserver(debounce(calculateLayout, 200));
  ro.observe(container);

  return {
    destroy: () => {
      ro.disconnect();
      window.removeEventListener('resize', debounce(calculateLayout, 200));
    }
  };
}