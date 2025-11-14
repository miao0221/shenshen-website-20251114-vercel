// 后台管理模块
import { initSupabase } from '../config.js';
import { checkAuthStatus, getCurrentUser } from './auth.js';
import { supabase } from '../api/supabaseClient.js';

// 初始化管理模块
export async function init() {
    console.log('初始化管理模块...');
    
    // 检查用户是否已登录
    const isLoggedIn = checkAuthStatus();
    if (!isLoggedIn) {
        alert('请先登录');
        // 在SPA中，这里应该使用路由导航而不是页面跳转
        // window.location.href = '../pages/login.html';
        return;
    }
    
    // 检查用户是否为管理员
    const user = getCurrentUser();
    if (!user) {
        console.error('无法获取用户信息');
        return;
    }
    
    // 在实际应用中，这里应该检查用户的角色权限
    // 例如通过查询用户资料中的admin字段或角色表
    const isAdmin = await checkAdminRole(user.id);
    if (!isAdmin) {
        alert('您没有管理员权限');
        // 在SPA中，这里应该使用路由导航而不是页面跳转
        // window.location.href = '../index.html';
        return;
    }
    
    // 加载管理界面
    loadAdminInterface();
    
    // 绑定事件
    bindEvents();
}

// 检查用户是否为管理员
async function checkAdminRole(userId) {
    try {
        // 在实际应用中，这里应该查询用户的角色信息
        // 这里简化处理，假设用户ID为特定值时为管理员
        // 或者查询用户资料中的admin字段
        const { data, error } = await supabase
            .from('profiles')
            .select('is_admin')
            .eq('id', userId)
            .single();
        
        if (error) throw error;
        
        return data?.is_admin || false;
    } catch (error) {
        console.error('检查管理员权限失败:', error);
        return false;
    }
}

// 加载管理界面
function loadAdminInterface() {
    const container = document.getElementById('admin-container');
    if (!container) return;
    
    container.innerHTML = `
        <div class="admin-header">
            <h1>管理后台</h1>
        </div>
        
        <div class="admin-content">
            <div class="admin-menu">
                <ul>
                    <li><a href="#" data-tab="music">音乐管理</a></li>
                    <li><a href="#" data-tab="video">视频管理</a></li>
                    <li><a href="#" data-tab="users">用户管理</a></li>
                    <li><a href="#" data-tab="posts">社区管理</a></li>
                </ul>
            </div>
            
            <div class="admin-main">
                <div id="admin-tab-content">
                    <p>请选择管理功能</p>
                </div>
            </div>
        </div>
    `;
}

// 绑定事件
function bindEvents() {
    // 管理菜单点击事件
    document.querySelectorAll('.admin-menu a').forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const tab = e.target.getAttribute('data-tab');
            loadAdminTab(tab);
        });
    });
}

// 加载管理标签页
function loadAdminTab(tab) {
    const content = document.getElementById('admin-tab-content');
    if (!content) return;
    
    switch (tab) {
        case 'music':
            content.innerHTML = `
                <h2>音乐管理</h2>
                <p>音乐管理功能正在开发中...</p>
                <button id="add-music-btn" class="btn">添加音乐</button>
            `;
            break;
        case 'video':
            content.innerHTML = `
                <h2>视频管理</h2>
                <p>视频管理功能正在开发中...</p>
                <button id="add-video-btn" class="btn">添加视频</button>
            `;
            break;
        case 'users':
            content.innerHTML = `
                <h2>用户管理</h2>
                <p>用户管理功能正在开发中...</p>
            `;
            break;
        case 'posts':
            content.innerHTML = `
                <h2>社区管理</h2>
                <p>社区管理功能正在开发中...</p>
            `;
            break;
        default:
            content.innerHTML = '<p>未知的管理功能</p>';
    }
}

export default { init };

// 后台管理模块
import { initSupabase } from '../config.js';
import { authManager } from './auth.js';

class AdminManager {
    constructor() {
        this.supabase = initSupabase();
        this.currentUser = null;
        this.activeTab = 'content';
        this.tags = [];
        this.init();
    }

    async init() {
        document.addEventListener('DOMContentLoaded', async () => {
            // 检查用户是否已登录且具有管理员权限
            const { isLoggedIn } = await authManager.checkAuthState();
            if (!isLoggedIn) {
                alert('请先登录');
                window.location.href = '../pages/login.html';
                return;
            }

            this.currentUser = authState.user;
            // 这里应该检查用户是否具有管理员权限
            // 为简化起见，我们假设登录用户就是管理员

            this.setupElements();
            this.setupEventListeners();
            this.loadTags();
            this.loadContent('songs');
            this.loadUsers();
            this.loadPendingComments();
        });
    }

    setupElements() {
        // 主要容器元素
        this.elements = {
            // 选项卡按钮
            contentTab: document.getElementById('content-tab'),
            usersTab: document.getElementById('users-tab'),
            tagsTab: document.getElementById('tags-tab'),
            
            // 选项卡内容
            contentPanel: document.getElementById('content-panel'),
            usersPanel: document.getElementById('users-panel'),
            tagsPanel: document.getElementById('tags-panel'),
            
            // 内容管理子选项卡
            songsTab: document.getElementById('songs-tab'),
            videosTab: document.getElementById('videos-tab'),
            interviewsTab: document.getElementById('interviews-tab'),
            
            // 内容列表容器
            contentList: document.getElementById('content-list'),
            usersList: document.getElementById('users-list'),
            tagsList: document.getElementById('tags-list'),
            pendingCommentsList: document.getElementById('pending-comments-list'),
            
            // 表单元素
            contentForm: document.getElementById('content-form'),
            tagForm: document.getElementById('tag-form'),
            bulkTagForm: document.getElementById('bulk-tag-form'),
            
            // 消息显示
            adminMessage: document.getElementById('admin-message')
        };
    }

    setupEventListeners() {
        // 选项卡切换
        if (this.elements.contentTab) {
            this.elements.contentTab.addEventListener('click', () => this.switchTab('content'));
        }
        
        if (this.elements.usersTab) {
            this.elements.usersTab.addEventListener('click', () => this.switchTab('users'));
        }
        
        if (this.elements.tagsTab) {
            this.elements.tagsTab.addEventListener('click', () => this.switchTab('tags'));
        }
        
        // 内容管理子选项卡
        if (this.elements.songsTab) {
            this.elements.songsTab.addEventListener('click', () => this.loadContent('songs'));
        }
        
        if (this.elements.videosTab) {
            this.elements.videosTab.addEventListener('click', () => this.loadContent('videos'));
        }
        
        if (this.elements.interviewsTab) {
            this.elements.interviewsTab.addEventListener('click', () => this.loadContent('interviews'));
        }
        
        // 表单提交事件
        if (this.elements.contentForm) {
            this.elements.contentForm.addEventListener('submit', (e) => this.handleContentSubmit(e));
        }
        
        if (this.elements.tagForm) {
            this.elements.tagForm.addEventListener('submit', (e) => this.handleTagSubmit(e));
        }
        
        if (this.elements.bulkTagForm) {
            this.elements.bulkTagForm.addEventListener('submit', (e) => this.handleBulkTagSubmit(e));
        }
    }

    // 切换选项卡
    switchTab(tabName) {
        this.activeTab = tabName;
        
        // 更新选项卡按钮状态
        if (this.elements.contentTab) {
            this.elements.contentTab.classList.toggle('active', tabName === 'content');
        }
        
        if (this.elements.usersTab) {
            this.elements.usersTab.classList.toggle('active', tabName === 'users');
        }
        
        if (this.elements.tagsTab) {
            this.elements.tagsTab.classList.toggle('active', tabName === 'tags');
        }
        
        // 显示对应的面板
        if (this.elements.contentPanel) {
            this.elements.contentPanel.classList.toggle('hidden', tabName !== 'content');
        }
        
        if (this.elements.usersPanel) {
            this.elements.usersPanel.classList.toggle('hidden', tabName !== 'users');
        }
        
        if (this.elements.tagsPanel) {
            this.elements.tagsPanel.classList.toggle('hidden', tabName !== 'tags');
        }
    }

    // 加载内容列表
    async loadContent(contentType) {
        try {
            let data, error;
            
            switch (contentType) {
                case 'songs':
                    ({ data, error } = await this.supabase
                        .from('songs')
                        .select('*')
                        .order('created_at', { ascending: false }));
                    break;
                    
                case 'videos':
                    ({ data, error } = await this.supabase
                        .from('videos')
                        .select('*')
                        .order('created_at', { ascending: false }));
                    break;
                    
                case 'interviews':
                    // interviews 表可能不存在，这里仅为示例
                    ({ data, error } = await this.supabase
                        .from('interviews')
                        .select('*')
                        .order('created_at', { ascending: false }));
                    break;
                    
                default:
                    return;
            }
            
            if (error) throw error;
            
            this.renderContentList(data, contentType);
        } catch (error) {
            console.error('加载内容失败:', error);
            this.showMessage('加载内容失败: ' + error.message, 'error');
        }
    }

    // 渲染内容列表
    renderContentList(contentData, contentType) {
        if (!this.elements.contentList) return;
        
        if (contentData.length === 0) {
            this.elements.contentList.innerHTML = '<p>暂无内容</p>';
            return;
        }
        
        const contentHTML = contentData.map(item => `
            <div class="content-item" data-id="${item.id}" data-type="${contentType}">
                <div class="content-info">
                    <h3>${item.title}</h3>
                    <p>${contentType === 'songs' ? `专辑: ${item.album || '未知'}` : `描述: ${item.description || '无描述'}`}</p>
                    <p>创建时间: ${new Date(item.created_at).toLocaleString()}</p>
                </div>
                <div class="content-actions">
                    <button class="btn edit-btn" onclick="adminManager.editContent('${item.id}', '${contentType}')">编辑</button>
                    <button class="btn delete-btn" onclick="adminManager.deleteContent('${item.id}', '${contentType}')">删除</button>
                </div>
            </div>
        `).join('');
        
        this.elements.contentList.innerHTML = contentHTML;
    }

    // 编辑内容
    editContent(id, contentType) {
        // 这里应该打开编辑表单并填充内容
        this.showMessage(`编辑功能: ${contentType} ID ${id}`, 'info');
    }

    // 删除内容
    async deleteContent(id, contentType) {
        if (!confirm('确定要删除这个内容吗？')) return;
        
        try {
            const { error } = await this.supabase
                .from(contentType)
                .delete()
                .eq('id', id);
                
            if (error) throw error;
            
            this.showMessage('删除成功', 'success');
            this.loadContent(contentType);
        } catch (error) {
            console.error('删除失败:', error);
            this.showMessage('删除失败: ' + error.message, 'error');
        }
    }

    // 处理内容提交
    async handleContentSubmit(event) {
        event.preventDefault();
        // 这里应该处理内容的创建或更新
        this.showMessage('内容提交功能待实现', 'info');
    }

    // 加载用户列表
    async loadUsers() {
        try {
            const { data, error } = await this.supabase
                .from('users')
                .select('*')
                .order('created_at', { ascending: false });
                
            if (error) throw error;
            
            this.renderUsersList(data);
        } catch (error) {
            console.error('加载用户失败:', error);
            this.showMessage('加载用户失败: ' + error.message, 'error');
        }
    }

    // 渲染用户列表
    renderUsersList(users) {
        if (!this.elements.usersList) return;
        
        if (users.length === 0) {
            this.elements.usersList.innerHTML = '<p>暂无用户</p>';
            return;
        }
        
        const usersHTML = users.map(user => `
            <div class="user-item" data-id="${user.id}">
                <div class="user-info">
                    <h3>${user.username || '匿名用户'}</h3>
                    <p>邮箱: ${user.email}</p>
                    <p>注册时间: ${new Date(user.created_at).toLocaleString()}</p>
                    <p>状态: ${user.is_active ? '活跃' : '禁用'}</p>
                </div>
                <div class="user-actions">
                    ${user.is_active ? 
                        `<button class="btn ban-btn" onclick="adminManager.banUser('${user.id}')">封禁</button>` : 
                        `<button class="btn unban-btn" onclick="adminManager.unbanUser('${user.id}')">解封</button>`}
                </div>
            </div>
        `).join('');
        
        this.elements.usersList.innerHTML = usersHTML;
    }

    // 封禁用户
    async banUser(userId) {
        try {
            const { error } = await this.supabase
                .from('users')
                .update({ is_active: false })
                .eq('id', userId);
                
            if (error) throw error;
            
            this.showMessage('用户已封禁', 'success');
            this.loadUsers();
        } catch (error) {
            console.error('封禁用户失败:', error);
            this.showMessage('封禁用户失败: ' + error.message, 'error');
        }
    }

    // 解封用户
    async unbanUser(userId) {
        try {
            const { error } = await this.supabase
                .from('users')
                .update({ is_active: true })
                .eq('id', userId);
                
            if (error) throw error;
            
            this.showMessage('用户已解封', 'success');
            this.loadUsers();
        } catch (error) {
            console.error('解封用户失败:', error);
            this.showMessage('解封用户失败: ' + error.message, 'error');
        }
    }

    // 加载标签
    async loadTags() {
        try {
            const { data, error } = await this.supabase
                .from('tags')
                .select('*')
                .order('created_at', { ascending: false });
                
            if (error) throw error;
            
            this.tags = data;
            this.renderTagsList(data);
        } catch (error) {
            console.error('加载标签失败:', error);
            this.showMessage('加载标签失败: ' + error.message, 'error');
        }
    }

    // 渲染标签列表
    renderTagsList(tags) {
        if (!this.elements.tagsList) return;
        
        if (tags.length === 0) {
            this.elements.tagsList.innerHTML = '<p>暂无标签</p>';
            return;
        }
        
        const tagsHTML = tags.map(tag => `
            <div class="tag-item" data-id="${tag.id}">
                <div class="tag-info">
                    <span class="tag-badge" style="background-color: ${tag.color || '#4ecdc4'}">${tag.name}</span>
                </div>
                <div class="tag-actions">
                    <button class="btn delete-btn" onclick="adminManager.deleteTag('${tag.id}')">删除</button>
                </div>
            </div>
        `).join('');
        
        this.elements.tagsList.innerHTML = tagsHTML;
    }

    // 删除标签
    async deleteTag(tagId) {
        if (!confirm('确定要删除这个标签吗？这将从所有相关内容中移除该标签。')) return;
        
        try {
            // 先删除关联表中的记录
            await this.supabase
                .from('song_tags')
                .delete()
                .eq('tag_id', tagId);
                
            await this.supabase
                .from('video_tags')
                .delete()
                .eq('tag_id', tagId);
            
            // 再删除标签本身
            const { error } = await this.supabase
                .from('tags')
                .delete()
                .eq('id', tagId);
                
            if (error) throw error;
            
            this.showMessage('标签已删除', 'success');
            this.loadTags();
        } catch (error) {
            console.error('删除标签失败:', error);
            this.showMessage('删除标签失败: ' + error.message, 'error');
        }
    }

    // 处理标签提交
    async handleTagSubmit(event) {
        event.preventDefault();
        
        const tagName = document.getElementById('tag-name').value.trim();
        const tagColor = document.getElementById('tag-color').value;
        
        if (!tagName) {
            this.showMessage('标签名称不能为空', 'error');
            return;
        }
        
        try {
            const { data, error } = await this.supabase
                .from('tags')
                .insert({
                    name: tagName,
                    color: tagColor
                })
                .select()
                .single();
                
            if (error) throw error;
            
            this.showMessage('标签创建成功', 'success');
            document.getElementById('tag-name').value = '';
            this.loadTags();
        } catch (error) {
            console.error('创建标签失败:', error);
            this.showMessage('创建标签失败: ' + error.message, 'error');
        }
    }

    // 处理批量标签提交
    async handleBulkTagSubmit(event) {
        event.preventDefault();
        this.showMessage('批量标签功能待实现', 'info');
    }

    // 加载待审核评论
    async loadPendingComments() {
        try {
            // 这里应该加载待审核的评论
            // 由于数据库中没有评论状态字段，我们暂时加载所有评论
            const { data: songsComments, error: songsError } = await this.supabase
                .from('comments')
                .select('*, songs(title)')
                .eq('target_type', 'song')
                .order('created_at', { ascending: false });
                
            if (songsError) throw songsError;
            
            const { data: videosComments, error: videosError } = await this.supabase
                .from('comments')
                .select('*, videos(title)')
                .eq('target_type', 'video')
                .order('created_at', { ascending: false });
                
            if (videosError) throw videosError;
            
            // 合并评论数据
            const allComments = [
                ...songsComments.map(c => ({ ...c, targetType: '歌曲' })),
                ...videosComments.map(c => ({ ...c, targetType: '视频' }))
            ];
            
            this.renderPendingComments(allComments);
        } catch (error) {
            console.error('加载评论失败:', error);
            this.showMessage('加载评论失败: ' + error.message, 'error');
        }
    }

    // 渲染待审核评论
    renderPendingComments(comments) {
        if (!this.elements.pendingCommentsList) return;
        
        if (comments.length === 0) {
            this.elements.pendingCommentsList.innerHTML = '<p>暂无评论</p>';
            return;
        }
        
        const commentsHTML = comments.map(comment => `
            <div class="comment-item" data-id="${comment.id}">
                <div class="comment-info">
                    <h3>${comment.targetType}: ${comment.songs?.title || comment.videos?.title || '未知内容'}</h3>
                    <p>评论内容: ${comment.content}</p>
                    <p>评论时间: ${new Date(comment.created_at).toLocaleString()}</p>
                </div>
                <div class="comment-actions">
                    <button class="btn approve-btn" onclick="adminManager.approveComment('${comment.id}')">通过</button>
                    <button class="btn reject-btn" onclick="adminManager.rejectComment('${comment.id}')">拒绝</button>
                </div>
            </div>
        `).join('');
        
        this.elements.pendingCommentsList.innerHTML = commentsHTML;
    }

    // 通过评论
    async approveComment(commentId) {
        // 由于数据库中没有评论状态字段，这里只是示例
        this.showMessage('评论审核功能待实现', 'info');
    }

    // 拒绝评论
    async rejectComment(commentId) {
        if (!confirm('确定要拒绝这条评论吗？')) return;
        
        try {
            const { error } = await this.supabase
                .from('comments')
                .delete()
                .eq('id', commentId);
                
            if (error) throw error;
            
            this.showMessage('评论已拒绝', 'success');
            this.loadPendingComments();
        } catch (error) {
            console.error('拒绝评论失败:', error);
            this.showMessage('拒绝评论失败: ' + error.message, 'error');
        }
    }

    // 显示消息
    showMessage(message, type) {
        if (!this.elements.adminMessage) return;
        
        this.elements.adminMessage.textContent = message;
        this.elements.adminMessage.className = `message ${type}`;
        
        // 3秒后自动清除消息
        setTimeout(() => {
            this.elements.adminMessage.textContent = '';
            this.elements.adminMessage.className = 'message';
        }, 3000);
    }
}

// 创建并导出管理器实例
const adminManager = new AdminManager();

// 将实例添加到全局作用域，以便在HTML中调用
window.adminManager = adminManager;

export { adminManager };
export default AdminManager;