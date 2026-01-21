import MarkdownIt from 'markdown-it';

// 创建Markdown实例
const md = new MarkdownIt({
  html: true,
  breaks: true,
  linkify: true,
  typographer: true
});

/**
 * 处理Markdown内容，将其转换为HTML
 * @param {string} markdown - Markdown格式的字符串
 * @returns {string} 转换后的HTML字符串
 */
export function processMarkdown(markdown) {
  if (!markdown) return '';
  
  let content = markdown;
  
  const frontmatterRegex = /^---\s*\n([\s\S]*?)\n---\s*\n/;
  const match = content.match(frontmatterRegex);
  
  if (match) {
    content = content.substring(match[0].length);
  }
  
  return md.render(content);
}

/**
 * 提取Markdown中的纯文本摘要
 * @param {string} markdown - Markdown格式的字符串
 * @param {number} length - 摘要长度
 * @returns {string} 纯文本摘要
 */
export function extractExcerpt(markdown, length = 150) {
  if (!markdown) return '';
  // 先移除Markdown标签
  const html = md.render(markdown);
  const text = html.replace(/<[^>]*>/g, '');
  // 截取指定长度并添加省略号
  return text.length > length ? text.substring(0, length) + '...' : text;
}

/**
 * 提取Markdown中的标题
 * @param {string} markdown - Markdown格式的字符串
 * @returns {string} 标题文本
 */
export function extractTitle(markdown) {
  if (!markdown) return '';
  const match = markdown.match(/^#\s+(.+)$/m);
  return match ? match[1] : '';
}
