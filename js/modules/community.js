// 社区模块
import { initSupabase } from '../config.js';
import { authManager } from './auth.js';

class CommunityManager {
    constructor() {
        this.supabase = initSupabase();
        this.currentUser = null;
        this.posts = [];
        this.init();
    }

    async init() {
        document.addEventListener('DOMContentLoaded', async () => {
            // 检查用户登录状态
            const authState = await authManager.checkAuthState();
            if (!authState.isLoggedIn) {
                // 未登录用户也可以浏览社区，但不能发帖
                this.setupElements();
                this.setupEventListeners();
                this.loadPosts();
                return;
            }

            this.currentUser = authState.user;
            this.setupElements();
            this.setupEventListeners();
            this.loadPosts();
        });
    }

    setupElements() {
        this.elements = {
            postForm: document.getElementById('post-form'),
            postTitle: document.getElementById('post-title'),
            postContent: document.getElementById('post-content'),
            postCategory: document.getElementById('post-category'),
            submitPostBtn: document.getElementById('submit-post'),
            postsContainer: document.getElementById('posts-container'),
            postMessage: document.getElementById('post-message')
        };
    }

    setupEventListeners() {
        // 发帖表单提交事件
        if (this.elements.postForm) {
            this.elements.postForm.addEventListener('submit', (e) => this.handlePostSubmit(e));
        }
    }

    // 处理发帖提交
    async handlePostSubmit(event) {
        event.preventDefault();
        
        if (!this.currentUser) {
            this.showMessage('请先登录后再发帖', 'error');
            setTimeout(() => {
                window.location.href = '../pages/login.html';
            }, 1500);
            return;
        }

        const title = this.elements.postTitle.value.trim();
        const content = this.elements.postContent.value.trim();
        const category = this.elements.postCategory.value;

        if (!title || !content) {
            this.showMessage('标题和内容不能为空', 'error');
            return;
        }

        try {
            this.showMessage('正在发布帖子...', 'info');
            
            const { data, error } = await this.supabase
                .from('posts')
                .insert({
                    title: title,
                    content: content,
                    user_id: this.currentUser.id,
                    category: category,
                    likes_count: 0,
                    comments_count: 0,
                    is_approved: true // 简化处理，实际应用中可能需要审核
                })
                .select()
                .single();

            if (error) throw error;

            this.showMessage('帖子发布成功！', 'success');
            
            // 清空表单
            this.elements.postForm.reset();
            
            // 重新加载帖子
            this.loadPosts();
        } catch (error) {
            console.error('发布帖子失败:', error);
            this.showMessage('发布帖子失败: ' + error.message, 'error');
        }
    }

    // 加载帖子
    async loadPosts() {
        try {
            const { data, error } = await this.supabase
                .from('posts')
                .select(`
                    *,
                    users(username, avatar_url)
                `)
                .eq('is_approved', true)
                .order('created_at', { ascending: false });

            if (error) throw error;

            this.posts = data;
            this.renderPosts(data);
        } catch (error) {
            console.error('加载帖子失败:', error);
            this.showMessage('加载帖子失败: ' + error.message, 'error');
        }
    }

    // 渲染帖子
    renderPosts(posts) {
        if (!this.elements.postsContainer) return;

        if (posts.length === 0) {
            this.elements.postsContainer.innerHTML = '<p class="no-posts">暂无帖子，快来发表第一篇吧！</p>';
            return;
        }

        const postsHTML = posts.map(post => `
            <div class="post-item" data-id="${post.id}">
                <div class="post-header">
                    <div class="post-author">
                        <img src="${post.users?.avatar_url || 'https://placehold.co/40'}" alt="头像" class="author-avatar">
                        <div class="author-info">
                            <h3>${post.users?.username || '匿名用户'}</h3>
                            <p class="post-date">${new Date(post.created_at).toLocaleString()}</p>
                        </div>
                    </div>
                    <span class="post-category category-${post.category}">${this.getCategoryName(post.category)}</span>
                </div>
                
                <div class="post-content">
                    <h2>${post.title}</h2>
                    <p>${post.content}</p>
                </div>
                
                <div class="post-stats">
                    <button class="like-btn" onclick="communityManager.toggleLike('${post.id}')">
                        <span class="heart-icon">♥</span>
                        <span class="likes-count">${post.likes_count || 0}</span>
                    </button>
                    <button class="comment-btn" onclick="communityManager.showComments('${post.id}')">
                        <span class="comment-icon">💬</span>
                        <span class="comments-count">${post.comments_count || 0}</span>
                    </button>
                </div>
                
                <div class="post-comments hidden" id="comments-${post.id}">
                    <div class="comment-form">
                        <textarea placeholder="添加评论..." class="comment-input" id="comment-input-${post.id}"></textarea>
                        <button class="btn submit-comment-btn" onclick="communityManager.submitComment('${post.id}')">评论</button>
                    </div>
                    <div class="comments-list" id="comments-list-${post.id}">
                        <!-- 评论将通过JavaScript动态生成 -->
                    </div>
                </div>
            </div>
        `).join('');

        this.elements.postsContainer.innerHTML = postsHTML;
    }

    // 获取分类名称
    getCategoryName(category) {
        const categories = {
            'share': '分享',
            'discussion': '讨论',
            'question': '提问',
            'other': '其他'
        };
        return categories[category] || '其他';
    }

    // 切换点赞状态
    async toggleLike(postId) {
        if (!this.currentUser) {
            this.showMessage('请先登录后再点赞', 'error');
            setTimeout(() => {
                window.location.href = '../pages/login.html';
            }, 1500);
            return;
        }

        try {
            // 检查是否已点赞
            const { data: existingLikes, error: fetchError } = await this.supabase
                .from('post_likes')
                .select('id')
                .eq('post_id', postId)
                .eq('user_id', this.currentUser.id);

            if (fetchError) throw fetchError;

            let likesCountChange = 0;

            if (existingLikes.length > 0) {
                // 取消点赞
                const { error: deleteError } = await this.supabase
                    .from('post_likes')
                    .delete()
                    .eq('id', existingLikes[0].id);

                if (deleteError) throw deleteError;
                likesCountChange = -1;
            } else {
                // 添加点赞
                const { error: insertError } = await this.supabase
                    .from('post_likes')
                    .insert({
                        post_id: postId,
                        user_id: this.currentUser.id
                    });

                if (insertError) throw insertError;
                likesCountChange = 1;
            }

            // 更新帖子点赞数
            const { data: post, error: postError } = await this.supabase
                .from('posts')
                .select('likes_count')
                .eq('id', postId)
                .single();

            if (postError) throw postError;

            const newLikesCount = (post.likes_count || 0) + likesCountChange;

            const { error: updateError } = await this.supabase
                .from('posts')
                .update({ likes_count: newLikesCount })
                .eq('id', postId);

            if (updateError) throw updateError;

            // 重新加载帖子以更新界面
            this.loadPosts();
        } catch (error) {
            console.error('点赞操作失败:', error);
            this.showMessage('点赞操作失败: ' + error.message, 'error');
        }
    }

    // 显示评论区域
    showComments(postId) {
        const commentsSection = document.getElementById(`comments-${postId}`);
        if (commentsSection) {
            commentsSection.classList.toggle('hidden');
            // 如果是展开评论，加载评论内容
            if (!commentsSection.classList.contains('hidden')) {
                this.loadComments(postId);
            }
        }
    }

    // 加载评论
    async loadComments(postId) {
        try {
            // 注意：这里需要一个评论表，为了简化，我们假设与posts表关联
            // 实际应用中应该有专门的评论表
            const commentsHTML = `
                <div class="no-comments">暂无评论</div>
            `;
            
            const commentsList = document.getElementById(`comments-list-${postId}`);
            if (commentsList) {
                commentsList.innerHTML = commentsHTML;
            }
        } catch (error) {
            console.error('加载评论失败:', error);
        }
    }

    // 提交评论
    async submitComment(postId) {
        if (!this.currentUser) {
            this.showMessage('请先登录后再评论', 'error');
            setTimeout(() => {
                window.location.href = '../pages/login.html';
            }, 1500);
            return;
        }

        const commentInput = document.getElementById(`comment-input-${postId}`);
        if (!commentInput) return;

        const content = commentInput.value.trim();
        if (!content) {
            this.showMessage('评论内容不能为空', 'error');
            return;
        }

        try {
            this.showMessage('正在提交评论...', 'info');
            
            // 更新帖子的评论数
            const { data: post, error: postError } = await this.supabase
                .from('posts')
                .select('comments_count')
                .eq('id', postId)
                .single();

            if (postError) throw postError;

            const newCommentsCount = (post.comments_count || 0) + 1;

            const { error: updateError } = await this.supabase
                .from('posts')
                .update({ comments_count: newCommentsCount })
                .eq('id', postId);

            if (updateError) throw updateError;

            // 清空评论输入框
            commentInput.value = '';
            
            // 重新加载帖子以更新评论数
            this.loadPosts();
            
            this.showMessage('评论提交成功！', 'success');
        } catch (error) {
            console.error('提交评论失败:', error);
            this.showMessage('提交评论失败: ' + error.message, 'error');
        }
    }

    // 显示消息
    showMessage(message, type) {
        if (!this.elements.postMessage) return;
        
        this.elements.postMessage.textContent = message;
        this.elements.postMessage.className = `message ${type}`;
        
        // 3秒后自动清除消息
        setTimeout(() => {
            this.elements.postMessage.textContent = '';
            this.elements.postMessage.className = 'message';
        }, 3000);
    }
}

// 创建并导出社区管理器实例
const communityManager = new CommunityManager();

// 将实例添加到全局作用域，以便在HTML中调用
window.communityManager = communityManager;

export { communityManager };
export default CommunityManager;