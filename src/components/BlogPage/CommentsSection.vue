<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue';
import NestedReply from './NestedReply.vue';
import CommentService from '../../services/CommentService.js';
import { logger } from '../../utils/logger';

const props = defineProps({
  postId: {
    type: Number,
    required: true
  }
});

const comments = ref([]);
const newComment = ref({
  author: '',
  content: ''
});
const replyingTo = ref(null);
const loading = ref(false);
const showForm = ref(false);
const expandedReplies = ref(new Set());
const REPLIES_LIMIT = 1;

const loadComments = async () => {
  comments.value = await CommentService.loadComments(props.postId);
}

const getReplies = (parentId) => {
  return CommentService.getReplies(comments.value, parentId);
}

const getAllReplies = (parentId) => {
  return CommentService.getAllReplies(comments.value, parentId);
}

const submitComment = async () => {
  if (!newComment.value.author.trim() || !newComment.value.content.trim()) {
    return;
  }
  
  loading.value = true;
  const startTime = Date.now();
  
  try {
    logger.info('[CommentsSection] 开始提交评论...');
    
    // 使用CommentService添加新评论
    const newCommentData = await CommentService.addComment({
      author: newComment.value.author,
      content: newComment.value.content,
      parentId: replyingTo.value,
      postId: props.postId
    });
    
    const duration = Date.now() - startTime;
    logger.info(`[CommentsSection] 评论提交成功 (耗时: ${duration}ms)`);
    
    // 将新评论添加到数组开头
    comments.value = [newCommentData, ...comments.value];
    
    // 自动展开包含新回复的评论
    if (replyingTo.value) {
      expandedReplies.value.add(replyingTo.value);
      let parentId = comments.value.find(c => c.id === replyingTo.value)?.parentId;
      while (parentId) {
        expandedReplies.value.add(parentId);
        parentId = comments.value.find(c => c.id === parentId)?.parentId;
      }
    }
    
    newComment.value = {
      author: '',
      content: ''
    };
    replyingTo.value = null;
    showForm.value = false;
  } catch (error) {
    const duration = Date.now() - startTime;
    logger.error(`[CommentsSection] 评论提交失败 (耗时: ${duration}ms):`, error);
    
    // 提供更详细的错误信息
    let errorMessage = 'Failed to add comment. Please try again.';
    if (error.message) {
      if (error.message.includes('超时')) {
        errorMessage = '提交超时,请检查网络连接后重试。';
      } else if (error.message.includes('超过限制')) {
        errorMessage = '数据库已满,请清理旧评论后重试。';
      } else if (error.message.includes('QuotaExceededError')) {
        errorMessage = '浏览器存储空间不足,请清理后重试。';
      } else {
        errorMessage = `提交失败: ${error.message}`;
      }
    }
    
    alert(errorMessage);
  } finally {
    loading.value = false;
  }
}

const deleteComment = async (commentId) => {
  // 使用CommentService删除评论及其所有回复
  const deletedIds = await CommentService.deleteComment(commentId);
  
  // 从本地数组中移除删除的评论
  comments.value = comments.value.filter(comment => !deletedIds.includes(comment.id));
  
  // 更新展开状态
  deletedIds.forEach(id => {
    expandedReplies.value.delete(id);
  });
}

function startReply(comment) {
  replyingTo.value = comment.id;
  showForm.value = false; // 隐藏主评论表单
  newComment.value = {
    author: '',
    content: ''
  };
}

function cancelReply() {
  replyingTo.value = null;
  showForm.value = false;
  newComment.value = {
    author: '',
    content: ''
  };
}

// 直接使用CommentService的方法
const formatDate = CommentService.formatDate;
const getParentAuthor = (parentId) => CommentService.getParentAuthor(comments.value, parentId);
const isAuthor = (name) => CommentService.isAuthor(name);

function toggleReplies(commentId) {
  if (expandedReplies.value.has(commentId)) {
    expandedReplies.value.delete(commentId);
  } else {
    expandedReplies.value.add(commentId);
  }
}

function shouldShowAllReplies(commentId) {
  return expandedReplies.value.has(commentId);
}

function getVisibleReplies(commentId) {
  const replies = getReplies(commentId);
  if (shouldShowAllReplies(commentId)) {
    return replies;
  }
  return replies.slice(0, REPLIES_LIMIT);
}

function getRemainingRepliesCount(commentId) {
  const replies = getReplies(commentId);
  const remaining = replies.length - REPLIES_LIMIT;
  return remaining > 0 ? remaining : 0;
}

const topLevelComments = computed(() => {
  return comments.value.filter(c => c.parent_id === null);
});

// ESC键处理函数
const handleEscKey = (event) => {
  if (event.key === 'Escape') {
    // 如果正在回复，隐藏回复表单
    if (replyingTo.value !== null) {
      cancelReply();
    }
    // 如果显示了主评论表单，隐藏主评论表单
    else if (showForm.value) {
      showForm.value = false;
    }
  }
};

// 在setup顶层注册生命周期钩子
onMounted(async () => {
  // 初始化CommentService
  await CommentService.init();
  
  // 加载当前评论
  await loadComments();
  
  // 添加ESC键监听
  window.addEventListener('keydown', handleEscKey);
});

// 组件卸载时移除事件监听
onUnmounted(() => {
  window.removeEventListener('keydown', handleEscKey);
});
</script>

<template>
  <div class="comments-section">
    <div class="comments-header">
      <h2 class="comments-title">Comments ({{ comments.length }})</h2>
      <button 
        @click="() => { showForm = !showForm; replyingTo = null; }" 
        class="btn btn-primary"
      >
        {{ showForm ? 'Cancel' : 'Add Comment' }}
      </button>
    </div>
    
    <!-- 评论表单 -->
    <div v-if="showForm" class="comment-form">
      <div class="form-group">
        <input
          v-model="newComment.author"
          type="text"
          placeholder="Your name"
          class="form-input"
          :disabled="loading"
        />
      </div>
      <div class="form-group">
        <textarea
          v-model="newComment.content"
          placeholder="Share your thoughts..."
          class="form-textarea"
          rows="3"
          :disabled="loading"
        ></textarea>
      </div>
      <button 
        @click="submitComment" 
        class="btn btn-primary"
        :disabled="loading || !newComment.author.trim() || !newComment.content.trim()"
      >
        {{ loading ? 'Sending...' : 'Submit' }}
      </button>
    </div>
    
    <!-- 顶级评论列表 -->
    <div v-if="comments.length > 0" class="comments-list">
      <div 
        v-for="comment in topLevelComments" 
        :key="comment.id"
        class="comment-item"
      >
        <!-- 顶级评论 -->
        <div class="comment-main">
          <img :src="comment.avatar" :alt="comment.author" class="comment-avatar">
          <div class="comment-body">
            <div class="comment-meta">
              <span class="author-name" :class="{ 'is-author': isAuthor(comment.author) }">
                {{ comment.author }}
              </span>
              <span class="comment-date">{{ formatDate(comment.date) }}</span>
              <span v-if="isAuthor(comment.author)" class="author-badge">Author</span>
            </div>
            <div class="comment-content">{{ comment.content }}</div>
            <div class="comment-actions">
              <button @click="startReply(comment)" class="btn-action">Reply</button>
              <button 
                v-if="isAuthor(comment.author)" 
                @click="deleteComment(comment.id)" 
                class="btn-action btn-delete"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
        
        <!-- 回复表单 -->
        <div v-if="replyingTo === comment.id" class="reply-form">
          <div class="form-group">
            <input
              v-model="newComment.author"
              type="text"
              placeholder="Your name"
              class="form-input"
              :disabled="loading"
            />
          </div>
          <div class="form-group">
            <textarea
              v-model="newComment.content"
              placeholder="Write your reply..."
              class="form-textarea"
              rows="2"
              :disabled="loading"
            ></textarea>
          </div>
          <div class="form-actions">
            <button @click="cancelReply" class="btn btn-secondary">Cancel</button>
            <button 
              @click="submitComment" 
              class="btn btn-primary"
              :disabled="loading || !newComment.author.trim() || !newComment.content.trim()"
            >
              {{ loading ? 'Sending...' : 'Reply' }}
            </button>
          </div>
        </div>
        
        <!-- 回复列表 -->
        <div v-if="getReplies(comment.id).length > 0" class="replies-list">
          <!-- 只显示前3条回复，或者全部显示如果评论被展开 -->
          <div 
            v-for="(reply, index) in getReplies(comment.id)" 
            :key="reply.id"
            v-show="shouldShowAllReplies(comment.id) || index < REPLIES_LIMIT"
            class="reply-item-container"
          >
            <NestedReply
              :comment="reply"
              :all-comments="comments"
              :expanded-replies="expandedReplies"
              :replies-limit="REPLIES_LIMIT"
              :depth="0"
              :replying-to="replyingTo"
              :new-comment="newComment"
              :loading="loading"
              @start-reply="startReply"
              @cancel-reply="cancelReply"
              @submit-comment="submitComment"
              @update:newComment="newComment = $event"
              @delete="deleteComment"
              @toggle-replies="toggleReplies"
            />
          </div>
          
          <!-- 展开/折叠按钮 -->
          <div v-if="getReplies(comment.id).length > REPLIES_LIMIT" class="expand-replies">
            <button 
              @click="toggleReplies(comment.id)" 
              class="btn-expand"
            >
              {{ shouldShowAllReplies(comment.id) ? 'Show less' : 'Show more' }}
            </button>
          </div>
        </div>
      </div>
    </div>
    
    <!-- 空评论状态 -->
    <div v-else-if="!showForm" class="no-comments">
      <p>No comments yet. Be the first to share your thoughts!</p>
    </div>
  </div>
</template>

<style scoped>
.comments-section {
  margin-top: var(--spacing-2xl);
}

.comments-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: var(--spacing-lg);
}



.comments-title {
  font-size: 1.25rem;
  font-weight: 400;
  margin: 0;
}

/* 评论表单 */
.comment-form {
  padding: var(--spacing-md);
  background: var(--glass-bg);
  border-radius: 8px;
  margin-bottom: var(--spacing-md);
}

.replying-indicator {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: var(--spacing-sm);
  font-size: 0.85rem;
  color: var(--text-secondary);
}

.btn-cancel-reply {
  width: 20px;
  height: 20px;
  border-radius: 50%;
  border: none;
  background: var(--bg-tertiary);
  color: var(--text-secondary);
  font-size: 1rem;
  line-height: 1;
  cursor: pointer;
}

.form-group {
  margin-bottom: var(--spacing-sm);
}

.form-input,
.form-textarea {
  width: 100%;
  padding: var(--spacing-sm) var(--spacing-md);
  border: 1px solid var(--glass-border);
  border-radius: 6px;
  background-color: var(--bg-primary);
  color: var(--text-primary);
  font-size: 0.9rem;
  font-family: inherit;
  transition: all var(--transition-normal);
}

.form-input:focus,
.form-textarea:focus {
  outline: none;
  border-color: var(--accent-primary);
}

.form-textarea {
  resize: vertical;
  min-height: 80px;
}

/* 评论列表 */
.comments-list {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-xs);
}

.comment-item {
  padding-bottom: var(--spacing-sm);
}

.comment-main {
  display: flex;
  gap: var(--spacing-sm);
}

.replies-list {
  margin-left: calc(32px + var(--spacing-sm));
  padding-left: var(--spacing-sm);
  padding-top: var(--spacing-sm);
  padding-bottom: var(--spacing-xs);
  border-left: 2px solid var(--glass-border);
  display: flex;
  flex-direction: column;
  gap: var(--spacing-xs);
  max-height: 1000px;
  overflow: hidden;
  transition: max-height 0.3s ease-out, opacity 0.3s ease-out;
  opacity: 1;
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
  max-height: 1000px;
  overflow: hidden;
  transition: max-height 0.3s ease-out, opacity 0.3s ease-out;
  opacity: 1;
}

.reply-item-container {
  opacity: 1;
  transform: translateY(0);
  transition: opacity 0.3s ease-out, transform 0.3s ease-out, max-height 0.3s ease-out;
  max-height: 1000px;
  overflow: visible;
}

/* 使用动画来实现平滑的显示和隐藏效果 */
@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(10px);
    max-height: 0;
  }
  to {
    opacity: 1;
    transform: translateY(0);
    max-height: 200px;
  }
}

@keyframes fadeOutDown {
  from {
    opacity: 1;
    transform: translateY(0);
    max-height: 200px;
  }
  to {
    opacity: 0;
    transform: translateY(10px);
    max-height: 0;
  }
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

/* 展开/折叠按钮 */
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

.btn-expand {
  font-size: 0.75rem;
  color: var(--text-tertiary);
  background: none;
  border: none;
  padding: 0;
  cursor: pointer;
  transition: all var(--transition-normal);
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

/* 空评论状态 */
.no-comments {
  text-align: center;
  padding: var(--spacing-lg);
  color: var(--text-secondary);
  font-size: 0.9rem;
}

@media (max-width: 768px) {
  .comments-header {
    flex-direction: column;
    align-items: flex-start;
    gap: var(--spacing-sm);
  }
  
  .replies-list,
  .nested-replies-list {
    margin-left: calc(24px + var(--spacing-sm));
  }
}
</style>