import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const blogDir = path.join(__dirname, '../public/blog');
const outputFile = path.join(__dirname, '../public/data/blog-posts.json');

function parseFrontMatter(content) {
  const frontMatterRegex = /^---\s*([\s\S]*?)\s*---/;
  const match = content.match(frontMatterRegex);
  
  if (!match) {
    return null;
  }
  
  const frontMatterText = match[1];
  const frontMatter = {};
  
  frontMatterText.split('\n').forEach(line => {
    const colonIndex = line.indexOf(':');
    if (colonIndex > -1) {
      const key = line.slice(0, colonIndex).trim();
      const value = line.slice(colonIndex + 1).trim();
      frontMatter[key] = value;
    }
  });
  
  return frontMatter;
}

function generateBlogPosts() {
  const files = fs.readdirSync(blogDir);
  const markdownFiles = files.filter(file => file.endsWith('.md')).sort((a, b) => {
    const idA = parseInt(a.replace('.md', ''));
    const idB = parseInt(b.replace('.md', ''));
    return idA - idB;
  });
  
  const blogPosts = markdownFiles.map(file => {
    const filePath = path.join(blogDir, file);
    const content = fs.readFileSync(filePath, 'utf-8');
    const frontMatter = parseFrontMatter(content);
    
    return {
      id: parseInt(file.replace('.md', '')),
      title: frontMatter?.title || 'Untitled',
      excerpt: frontMatter?.excerpt || '',
      author: frontMatter?.author || 'Richard Fury',
      date: frontMatter?.date || '',
      category: frontMatter?.category || 'General',
      readTime: frontMatter?.readTime || '5 min',
      image: frontMatter?.image || '',
      keywords: frontMatter?.keywords || ''
    };
  });
  
  fs.writeFileSync(outputFile, JSON.stringify(blogPosts, null, 2), 'utf-8');
  console.log(`Generated ${outputFile} with ${blogPosts.length} blog posts`);
}

generateBlogPosts();