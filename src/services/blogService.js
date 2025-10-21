// 解析markdown文件的front matter和内容
function parseMarkdown(content) {
  const frontMatterRegex = /---([\s\S]*?)---/;
  const match = content.match(frontMatterRegex);
  
  if (!match) {
    return null;
  }
  
  // 解析front matter
  const frontMatter = match[1];
  const frontMatterObj = {};
  
  frontMatter.split('\n').forEach(line => {
    const [key, ...values] = line.split(':').map(s => s.trim());
    if (key && values.length > 0) {
      const value = values.join(':');
      // 处理数组类型的标签
      if (value.startsWith('[') && value.endsWith(']')) {
        try {
          frontMatterObj[key] = JSON.parse(value);
        } catch {
          frontMatterObj[key] = value;
        }
      } else {
        // 移除字符串两端的引号
        frontMatterObj[key] = value.replace(/^['"]|['"]$/g, '');
      }
    }
  });
  
  // 获取正文内容
  const body = content.replace(frontMatterRegex, '').trim();
  
  return {
    ...frontMatterObj,
    content: body,
    id: frontMatterObj.title ? frontMatterObj.title.toLowerCase().replace(/\s+/g, '-') : 'unknown'
  };
}

// 获取所有博客文章
export const getBlogPosts = async () => {
  try {
    // 使用Vite的glob导入功能获取所有markdown文件
    const blogFiles = import.meta.glob('/src/data/blog/*.md', { query: '?raw', import: 'default' });
    
    const posts = await Promise.all(
      Object.entries(blogFiles).map(async ([path, file]) => {
        const content = await file();
        const parsed = parseMarkdown(content);
        return parsed;
      })
    );
    
    // 过滤掉解析失败的文章，并按置顶状态和日期排序
    // 置顶文章排在前面，再按日期倒序
    return posts
      .filter(post => post !== null)
      .sort((a, b) => {
        // 先比较置顶状态（置顶值为true或1的文章排在前面）
        const isPinnedA = a.pinned === true || a.pinned === 1;
        const isPinnedB = b.pinned === true || b.pinned === 1;
        
        if (isPinnedA && !isPinnedB) return -1;
        if (!isPinnedA && isPinnedB) return 1;
        
        // 置顶状态相同时，按日期倒序排序
        return new Date(b.date) - new Date(a.date);
      });
  } catch (error) {
    console.error('Error loading blog posts:', error);
    return [];
  }
};

// 获取单篇博客文章
export const getBlogPost = async (id) => {
  try {
    const posts = await getBlogPosts();
    return posts.find(post => post.id === id) || null;
  } catch (error) {
    console.error('Error loading blog post:', error);
    return null;
  }
};

// 导入数据库服务
import { getComments as dbGetComments, addComment as dbAddComment } from './dbService';

// 获取评论（从数据库）
export const getComments = async (postId) => {
  try {
    return await Promise.resolve(dbGetComments(postId));
  } catch (error) {
    console.error('获取评论失败:', error);
    return [];
  }
};

// 添加评论（保存到数据库）
export const addComment = async (postId, comment) => {
  try {
    return await Promise.resolve(dbAddComment(postId, comment));
  } catch (error) {
    console.error('添加评论失败:', error);
    throw error;
  }
};