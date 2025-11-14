// 用户个人中心模块
import { initSupabase } from '../config.js';
import { authManager } from './auth.js';

class ProfileManager {
    constructor() {
        this.supabase = initSupabase();
        this.currentUser = null;
        this.elements = {};
        this.init();
    }

    init() {
        document.addEventListener('DOMContentLoaded', async () => {
            // 检查用户是否已登录
            const { isLoggedIn, user } = await authManager.checkAuthState();
            if (!isLoggedIn) {
                alert('请先登录');
                window.location.href = '../pages/login.html';
                return;
            }

            this.currentUser = user;
            this.setupElements();
            this.setupEventListeners();
            this.loadProfile();
            this.loadCollections();
            this.loadComments();
        });
    }

    setupElements() {
        this.elements = {
            profileSection: document.querySelector('.profile-section'),
            profileForm: document.getElementById('profile-form'),
            usernameInput: document.getElementById('username'),
            emailDisplay: document.getElementById('email'),
            avatarPreview: document.getElementById('avatar-preview'),
            avatarInput: document.getElementById('avatar'),
            saveProfileBtn: document.getElementById('save-profile'),
            collectionsContainer: document.getElementById('collections-container'),
            commentsContainer: document.getElementById('comments-container'),
            profileMessage: document.getElementById('profile-message')
        };
    }

    setupEventListeners() {
        if (this.elements.profileForm) {
            this.elements.profileForm.addEventListener('submit', (e) => this.handleProfileUpdate(e));
        }

        if (this.elements.avatarInput) {
            this.elements.avatarInput.addEventListener('change', (e) => this.handleAvatarChange(e));
        }
    }

    // 加载用户资料
    async loadProfile() {
        try {
            const profileResult = await authManager.getUserProfile();
            if (profileResult.success) {
                const user = profileResult.user;
                this.elements.usernameInput.value = user.username || '';
                this.elements.emailDisplay.textContent = user.email || '';
                
                if (user.avatar_url) {
                    this.elements.avatarPreview.src = user.avatar_url;
                }
            }
        } catch (error) {
            console.error('加载用户资料失败:', error);
        }
    }

    // 处理头像更改
    handleAvatarChange(event) {
        const file = event.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (e) => {
                this.elements.avatarPreview.src = e.target.result;
            };
            reader.readAsDataURL(file);
        }
    }

    // 处理资料更新
    async handleProfileUpdate(event) {
        event.preventDefault();
        
        const username = this.elements.usernameInput.value.trim();
        // 注意：在实际应用中，应该上传头像文件到服务器并获取URL
        // 这里我们只处理用户名更新
        const avatarUrl = this.elements.avatarPreview.src;

        try {
            this.showMessage('正在更新资料...', 'info');
            
            const result = await authManager.updateProfile(username, avatarUrl);
            
            if (result.success) {
                this.showMessage('资料更新成功！', 'success');
            } else {
                this.showMessage(`更新失败: ${result.error}`, 'error');
            }
        } catch (error) {
            console.error('更新资料失败:', error);
            this.showMessage(`更新失败: ${error.message}`, 'error');
        }
    }

    // 加载用户收藏
    async loadCollections() {
        try {
            const { data: collections, error } = await this.supabase
                .from('collections')
                .select(`
                    *,
                    songs(title, cover_url, album),
                    videos(title, thumbnail_url)
                `)
                .eq('user_id', this.currentUser.id)
                .order('created_at', { ascending: false });

            if (error) throw error;

            this.renderCollections(collections);
        } catch (error) {
            console.error('加载收藏失败:', error);
            this.elements.collectionsContainer.innerHTML = '<p>加载收藏失败</p>';
        }
    }

    // 渲染用户收藏
    renderCollections(collections) {
        if (collections.length === 0) {
            this.elements.collectionsContainer.innerHTML = '<p class="no-collections">暂无收藏内容</p>';
            return;
        }

        const collectionsHTML = collections.map(collection => {
            if (collection.item_type === 'song' && collection.songs) {
                return `
                    <div class="collection-item" data-type="song" data-id="${collection.item_id}">
                        <img src="${collection.songs.cover_url || 'https://placehold.co/50'}" alt="${collection.songs.title}" class="collection-image">
                        <div class="collection-content">
                            <h4>${collection.songs.title}</h4>
                            <p>专辑: ${collection.songs.album || '未知'}</p>
                            <p class="collection-meta">收藏于: ${new Date(collection.created_at).toLocaleDateString()}</p>
                        </div>
                        <button class="btn remove-collection-btn" data-type="song" data-id="${collection.item_id}">取消收藏</button>
                    </div>
                `;
            } else if (collection.item_type === 'video' && collection.videos) {
                return `
                    <div class="collection-item" data-type="video" data-id="${collection.item_id}">
                        <img src="${collection.videos.thumbnail_url || 'https://placehold.co/50'}" alt="${collection.videos.title}" class="collection-image">
                        <div class="collection-content">
                            <h4>${collection.videos.title}</h4>
                            <p class="collection-meta">收藏于: ${new Date(collection.created_at).toLocaleDateString()}</p>
                        </div>
                        <button class="btn remove-collection-btn" data-type="video" data-id="${collection.item_id}">取消收藏</button>
                    </div>
                `;
            }
            return '';
        }).join('');

        this.elements.collectionsContainer.innerHTML = collectionsHTML;

        // 为取消收藏按钮添加事件监听器
        this.elements.collectionsContainer.querySelectorAll('.remove-collection-btn').forEach(button => {
            button.addEventListener('click', (e) => {
                const type = e.target.dataset.type;
                const id = e.target.dataset.id;
                this.removeCollection(type, id);
            });
        });
    }

    // 取消收藏
    async removeCollection(itemType, itemId) {
        try {
            const { error } = await this.supabase
                .from('collections')
                .delete()
                .eq('user_id', this.currentUser.id)
                .eq('item_type', itemType)
                .eq('item_id', itemId);

            if (error) throw error;

            // 重新加载收藏列表
            this.loadCollections();
        } catch (error) {
            console.error('取消收藏失败:', error);
            this.showMessage('取消收藏失败，请稍后重试', 'error');
        }
    }

    // 加载用户评论
    async loadComments() {
        try {
            const { data: comments, error } = await this.supabase
                .from('comments')
                .select(`
                    *,
                    songs(title),
                    videos(title)
                `)
                .eq('user_id', this.currentUser.id)
                .order('created_at', { ascending: false });

            if (error) throw error;

            this.renderComments(comments);
        } catch (error) {
            console.error('加载评论失败:', error);
            this.elements.commentsContainer.innerHTML = '<p>加载评论失败</p>';
        }
    }

    // 渲染用户评论
    renderComments(comments) {
        if (comments.length === 0) {
            this.elements.commentsContainer.innerHTML = '<p class="no-comments">暂无评论记录</p>';
            return;
        }

        const commentsHTML = comments.map(comment => {
            let targetTitle = '未知内容';
            if (comment.target_type === 'song' && comment.songs) {
                targetTitle = comment.songs.title;
            } else if (comment.target_type === 'video' && comment.videos) {
                targetTitle = comment.videos.title;
            }

            return `
                <div class="comment-item">
                    <div class="comment-content">
                        <h4>评论内容: ${targetTitle}</h4>
                        <p>${comment.content}</p>
                        <p class="comment-meta">评论于: ${new Date(comment.created_at).toLocaleString()}</p>
                    </div>
                </div>
            `;
        }).join('');

        this.elements.commentsContainer.innerHTML = commentsHTML;
    }

    // 显示消息
    showMessage(message, type) {
        this.elements.profileMessage.textContent = message;
        this.elements.profileMessage.className = `message ${type}`;
        
        // 3秒后自动清除消息
        setTimeout(() => {
            this.elements.profileMessage.textContent = '';
            this.elements.profileMessage.className = 'message';
        }, 3000);
    }
}

// 创建并导出个人中心管理器实例
const profileManager = new ProfileManager();

export { profileManager };
export default ProfileManager;