<script setup>
import { computed, ref } from 'vue';
import CommentService from '../../services/CommentService.js';

const props = defineProps({
  comment: {
    type: Object,
    required: true
  },
  allComments: {
    type: Array,
    required: true
  },
  expandedReplies: {
    type: Set,
    required: true
  },
  repliesLimit: {
    type: Number,
    default: 1
  },
  depth: {
    type: Number,
    default: 0
  },
  replyingTo: {
    type: Number,
    default: null
  },
  newComment: {
    type: Object,
    default: () => ({ author: '', content: '' })
  },
  loading: {
    type: Boolean,
    default: false
  }
});

const emit = defineEmits(['reply', 'delete', 'toggle-replies', 'start-reply', 'cancel-reply', 'submit-comment']);

// 获取回复的回复
function getReplies(parentId) {
  return CommentService.getReplies(props.allComments, parentId);
}

// 获取可见的回复
function getVisibleReplies(commentId) {
  const replies = getReplies(commentId);
  // 获取回复限制，如果没有设置则使用默认值1
  const limit = props.repliesLimit || 1;
  
  if (shouldShowAllReplies(commentId)) {
    return replies;
  }
  return replies.slice(0, limit);
}

// 获取剩余回复数量
function getRemainingRepliesCount(commentId) {
  const replies = getReplies(commentId);
  // 获取回复限制，如果没有设置则使用默认值1
  const limit = props.repliesLimit || 1;
  
  if (replies.length <= limit || shouldShowAllReplies(commentId)) {
    return 0;
  }
  return replies.length - limit;
}

// 检查是否应显示所有回复
function shouldShowAllReplies(commentId) {
  return props.expandedReplies.has(commentId);
}

// 切换回复展开/折叠状态
function toggleReplies(commentId) {
  emit('toggle-replies', commentId);
}

// 直接使用CommentService的方法
const isAuthor = (name) => CommentService.isAuthor(name);
const formatDate = CommentService.formatDate;
const getParentAuthor = (parentId) => CommentService.getParentAuthor(props.allComments, parentId);

// 处理回复点击
function handleReply(comment) {
  emit('start-reply', comment);
}

// 处理删除点击
function handleDelete(commentId) {
  emit('delete', commentId);
}

// 处理取消回复
function cancelReply() {
  emit('cancel-reply');
}

// 处理提交回复
function submitComment() {
  emit('submit-comment');
}
</script>

<template>
  <div class="reply-container">
    <!-- 当前回复项 -->
    <div class="reply-item">
      <img :src="comment.avatar" :alt="comment.author" class="comment-avatar">
      <div class="comment-body">
        <div class="comment-meta">
          <span class="author-name" :class="{ 'is-author': isAuthor(comment.author) }">
            {{ comment.author }}
          </span>
          <span class="comment-date">{{ formatDate(comment.date) }}</span>
          <span v-if="isAuthor(comment.author)" class="author-badge">Author</span>
        </div>
        <div class="comment-content">
          <span class="replying-to">@{{ getParentAuthor(comment.parentId) }}</span>
          {{ comment.content }}
        </div>
        <div class="comment-actions">
          <button @click="handleReply(comment)" class="btn-action">Reply</button>
          <button 
            v-if="isAuthor(comment.author)" 
            @click="handleDelete(comment.id)" 
            class="btn-action btn-delete"
          >
            Delete
          </button>
        </div>
      </div>
    </div>
    
    <!-- 回复表单 -->
    <div v-if="props.replyingTo === comment.id" class="reply-form">
      <div class="form-group">
        <input
          :value="props.newComment.author"
          @input="$emit('update:newComment', { ...props.newComment, author: $event.target.value })"
          type="text"
          placeholder="Your name"
          class="form-input"
          :disabled="props.loading"
        />
      </div>
      <div class="form-group">
        <textarea
          :value="props.newComment.content"
          @input="$emit('update:newComment', { ...props.newComment, content: $event.target.value })"
          placeholder="Write your reply..."
          class="form-textarea"
          rows="2"
          :disabled="props.loading"
        ></textarea>
      </div>
      <div class="form-actions">
        <button @click="cancelReply" class="btn btn-secondary">Cancel</button>
        <button 
          @click="submitComment" 
          class="btn btn-primary"
          :disabled="props.loading || !props.newComment.author.trim() || !props.newComment.content.trim()"
        >
          {{ props.loading ? 'Sending...' : 'Reply' }}
        </button>
      </div>
    </div>
    
    <!-- 递归显示子回复 -->
    <div v-if="getReplies(comment.id).length > 0" class="nested-replies-list">
      <!-- 只显示前1条回复，或者全部显示如果评论被展开 -->
      <div 
        v-for="(reply, index) in getReplies(comment.id)" 
        :key="reply.id"
        v-show="shouldShowAllReplies(comment.id) || index < (props.repliesLimit || 1)"
        class="reply-item-container"
      >
        <!-- 递归调用自身组件显示嵌套回复 -->
        <NestedReply
          :comment="reply"
          :all-comments="allComments"
          :expanded-replies="expandedReplies"
          :replies-limit="repliesLimit"
          :depth="depth + 1"
          :replying-to="props.replyingTo"
          :new-comment="props.newComment"
          :loading="props.loading"
          @start-reply="handleReply"
          @cancel-reply="cancelReply"
          @submit-comment="submitComment"
          @update:newComment="$emit('update:newComment', $event)"
          @delete="handleDelete"
          @toggle-replies="toggleReplies"
        />
      </div>
      
      <!-- 展开/折叠按钮 -->
      <div v-if="getReplies(comment.id).length > (props.repliesLimit || 1)" class="expand-replies">
        <button @click="toggleReplies(comment.id)" class="btn-expand">
          {{ shouldShowAllReplies(comment.id) ? 'Show less' : 'Show more' }}
        </button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.reply-container {
  margin-bottom: var(--spacing-sm);
}

.reply-item-container {
  opacity: 1;
  transform: translateY(0);
  transition: opacity 0.3s ease-out, transform 0.3s ease-out, max-height 0.3s ease-out;
  max-height: 1000px;
  overflow: visible;
}

.reply-item {
  display: flex;
  gap: var(--spacing-sm);
}

.comment-avatar {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  object-fit: cover;
  flex-shrink: 0;
}

.comment-body {
  flex: 1;
  min-width: 0;
}

.comment-meta {
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
  margin-bottom: 4px;
  flex-wrap: wrap;
}

.author-name {
  font-size: 0.9rem;
  font-weight: 500;
  color: var(--text-primary);
}

.author-name.is-author {
  color: var(--accent-color);
}

.comment-date {
  font-size: 0.8rem;
  color: var(--text-tertiary);
}

.author-badge {
  font-size: 0.7rem;
  padding: 2px 6px;
  background-color: var(--accent-color);
  color: white;
  border-radius: 4px;
  font-weight: 500;
}

.comment-content {
  font-size: 0.9rem;
  line-height: 1.5;
  color: var(--text-primary);
  margin-bottom: var(--spacing-xs);
}

.replying-to {
  color: var(--accent-color);
  margin-right: var(--spacing-xs);
}

.comment-actions {
  display: flex;
  gap: var(--spacing-md);
}

.btn-action {
  font-size: 0.8rem;
  color: var(--text-tertiary);
  background: none;
  border: none;
  padding: 0;
  cursor: pointer;
  transition: color var(--transition-normal);
}

.btn-action:hover {
  color: var(--accent-color);
}

.btn-delete:hover {
  color: var(--error-color);
}

.nested-replies-list {
  margin-left: calc(32px + var(--spacing-sm));
  padding-left: var(--spacing-sm);
  padding-top: var(--spacing-sm);
  padding-bottom: var(--spacing-xs);
  border-left: 2px solid var(--glass-border);
  display: flex;
  flex-direction: column;
  gap: var(--spacing-xs);
  max-height: 10000px;
  overflow: visible;
  transition: max-height 0.3s ease-out, opacity 0.3s ease-out;
  opacity: 1;
}

.expand-replies {
  margin-top: var(--spacing-xs);
  padding-left: calc(32px + var(--spacing-sm));
  margin-bottom: 0;
}

.btn-expand {
  font-size: 0.75rem;
  color: var(--text-tertiary);
  background: none;
  border: none;
  padding: 0;
  cursor: pointer;
  transition: color var(--transition-normal);
}

.btn-expand:hover {
  color: var(--accent-color);
  text-decoration: underline;
}

/* 回复表单 */
.reply-form {
  margin-left: calc(32px + var(--spacing-sm));
  padding: var(--spacing-sm);
  background: var(--glass-bg);
  border-radius: 8px;
  margin-bottom: var(--spacing-sm);
  z-index: 10;
  position: relative;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.reply-form .form-group {
  margin-bottom: var(--spacing-xs);
}

.reply-form .form-textarea {
  resize: vertical;
  min-height: 60px;
}

.reply-form .form-actions {
  display: flex;
  gap: var(--spacing-sm);
  justify-content: flex-end;
  margin-top: var(--spacing-xs);
}

.reply-form .btn {
  font-size: 0.85rem;
  padding: var(--spacing-xs) var(--spacing-md);
}
</style>