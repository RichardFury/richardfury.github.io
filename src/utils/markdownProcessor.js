import MarkdownIt from 'markdown-it';

/**
 * Markdown处理器类
 * 负责markdown的解析、渲染和格式适配
 */
class MarkdownProcessor {
  constructor() {
    // 初始化markdown-it实例，配置支持的功能
    this.md = new MarkdownIt({
      html: true,           // 允许HTML标签
      linkify: true,        // 自动识别URL
      typographer: true,    // 启用一些语言中立的替换和引号美化
      breaks: true,         // 将\n转换为<br>
      highlight: this.highlightCode
    });
    
    // 注册自定义插件和规则
    this.registerCustomPlugins();
  }

  /**
   * 代码高亮处理
   * @param {string} str - 代码内容
   * @param {string} lang - 语言标识
   * @returns {string} - 处理后的HTML
   */
  highlightCode(str, lang) {
    if (lang && lang.toLowerCase() === 'vue') {
      // 为Vue代码添加特殊处理
      return `<pre class="language-vue"><code>${str}</code></pre>`;
    }
    
    // 基本的代码块处理
    return `<pre class="language-${lang || 'text'}"><code>${str}</code></pre>`;
  }

  /**
   * 注册自定义插件
   */
  registerCustomPlugins() {
    // 注册自定义的table渲染规则，添加响应式样式
    this.md.renderer.rules.table_open = () => '<table class="markdown-table">';
    
    // 注册自定义的blockquote渲染规则
    this.md.renderer.rules.blockquote_open = () => '<blockquote class="markdown-quote">';
    
    // 注册自定义的img渲染规则，添加响应式图片类
    const defaultImageRender = this.md.renderer.rules.image || function(tokens, idx, options, env, self) {
      return self.renderToken(tokens, idx, options);
    };
    
    this.md.renderer.rules.image = (tokens, idx, options, env, self) => {
      const token = tokens[idx];
      const srcIndex = token.attrIndex('src');
      const altIndex = token.attrIndex('alt');
      
      // 添加响应式图片类
      token.attrPush(['class', 'markdown-image']);
      
      return defaultImageRender(tokens, idx, options, env, self);
    };
  }

  /**
   * 解析markdown内容
   * @param {string} markdown - markdown文本
   * @returns {string} - 渲染后的HTML
   */
  render(markdown) {
    if (!markdown || typeof markdown !== 'string') {
      return '';
    }
    
    try {
      // 进行自定义预处理
      const processedMarkdown = this.preprocess(markdown);
      
      // 使用markdown-it渲染
      return this.md.render(processedMarkdown);
    } catch (error) {
      console.error('Markdown rendering error:', error);
      return `<div class="markdown-error">解析Markdown失败: ${error.message}</div>`;
    }
  }

  /**
   * 预处理markdown内容
   * @param {string} markdown - 原始markdown文本
   * @returns {string} - 预处理后的markdown文本
   */
  preprocess(markdown) {
    let processed = markdown;
    
    // 处理特殊的自定义语法
    // 1. 处理数学公式（简单示例）
    processed = processed.replace(/\$\$(.*?)\$\$/gs, '<div class="math-formula">$1</div>');
    processed = processed.replace(/\$(.*?)\$/gs, '<span class="math-formula-inline">$1</span>');
    
    // 2. 处理自定义脚注
    processed = processed.replace(/\[\^(.*?)\]:\s*(.*?)$/gm, '<div class="footnote" id="footnote-$1"><sup>$1</sup>: $2</div>');
    processed = processed.replace(/\[\^(.*?)\]/g, '<sup class="footnote-ref"><a href="#footnote-$1">$1</a></sup>');
    
    // 3. 处理任务列表
    processed = processed.replace(/^- \[ \] (.*)$/gm, '- <input type="checkbox" disabled class="task-checkbox"> $1');
    processed = processed.replace(/^- \[x\] (.*)$/gm, '- <input type="checkbox" disabled checked class="task-checkbox"> $1');
    
    return processed;
  }

  /**
   * 提取markdown中的纯文本摘要
   * @param {string} markdown - markdown文本
   * @param {number} maxLength - 最大长度
   * @returns {string} - 提取的摘要
   */
  extractSummary(markdown, maxLength = 150) {
    if (!markdown) return '';
    
    // 移除front matter
    let text = markdown.replace(/---[\s\S]*?---/, '');
    
    // 移除代码块
    text = text.replace(/```[\s\S]*?```/g, '');
    
    // 移除行内代码
    text = text.replace(/`([^`]+)`/g, '$1');
    
    // 移除标题标记
    text = text.replace(/^#+\s/gm, '');
    
    // 移除链接标记但保留文本
    text = text.replace(/\[(.*?)\]\([^)]*\)/g, '$1');
    
    // 移除其他markdown标记
    text = text.replace(/[*_\[\]()~>#+\-=|{}.!]/g, '');
    
    // 去除多余的空白字符
    text = text.replace(/\s+/g, ' ').trim();
    
    // 截取摘要
    return text.length > maxLength ? text.substring(0, maxLength) + '...' : text;
  }

  /**
   * 检查markdown内容是否有效
   * @param {string} markdown - markdown文本
   * @returns {boolean} - 是否有效
   */
  isValid(markdown) {
    if (!markdown || typeof markdown !== 'string' || markdown.trim() === '') {
      return false;
    }
    
    try {
      // 尝试渲染，如果能成功则认为有效
      this.render(markdown);
      return true;
    } catch {
      return false;
    }
  }

  /**
   * 获取markdown内容中的字数统计
   * @param {string} markdown - markdown文本
   * @returns {object} - 包含各种统计信息
   */
  getStats(markdown) {
    if (!markdown) {
      return { words: 0, characters: 0, lines: 0 };
    }
    
    // 移除front matter
    let text = markdown.replace(/---[\s\S]*?---/, '');
    
    // 移除markdown标记，获取纯文本
    const plainText = text
      .replace(/[*_\[\]()~>#+\-=|{}.!`]/g, '')
      .replace(/```[\s\S]*?```/g, '')
      .replace(/\[(.*?)\]\([^)]*\)/g, '$1');
    
    return {
      words: plainText.split(/\s+/).filter(word => word.trim()).length,
      characters: plainText.length,
      lines: markdown.split('\n').length
    };
  }
}

// 创建并导出单例实例
export const markdownProcessor = new MarkdownProcessor();

// 导出便捷方法
export const renderMarkdown = (markdown) => markdownProcessor.render(markdown);
export const extractSummary = (markdown, maxLength) => markdownProcessor.extractSummary(markdown, maxLength);
export const isValidMarkdown = (markdown) => markdownProcessor.isValid(markdown);
export const getMarkdownStats = (markdown) => markdownProcessor.getStats(markdown);