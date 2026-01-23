/**
 * Markdown Renderer
 * 完整的Markdown渲染器，支持语法高亮
 */

import MarkdownIt from 'markdown-it';
import hljs from 'markdown-it-highlight';

const md = new MarkdownIt({
  html: true,
  breaks: true,
  linkify: true,
  typographer: true
});

// 语法高亮
md.use(hljs, {
  highlight: (str, lang) => {
    if (hljs.getLanguage(lang)) {
      try {
        return hljs.highlight(str, { language: lang }).value;
      } catch (e) {
        return str;
      }
    }
    return '';
  }
});

export function renderMarkdown(markdown) {
  return md.render(markdown);
}

export default { renderMarkdown };