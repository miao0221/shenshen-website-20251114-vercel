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
            
            // 添加表单
            addContentForm: document.getElementById('add-content-form'),
            addTagForm: document.getElementById('add-tag-form'),
            
            // 模态框
            editModal: document.getElementById('edit-modal'),
            modalTitle: document.getElementById('modal-title'),
            modalForm: document.getElementById('modal-form'),
            closeModal: document.querySelector('.close')
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

        // 表单提交
        if (this.elements.addContentForm) {
            this.elements.addContentForm.addEventListener('submit', (e) => this.addContent(e));
        }
        if (this.elements.addTagForm) {
            this.elements.addTagForm.addEventListener('submit', (e) => this.addTag(e));
        }

        // 模态框关闭
        if (this.elements.closeModal) {
            this.elements.closeModal.addEventListener('click', () => this.closeModal());
        }

        // 点击模态框背景关闭
        if (this.elements.editModal) {
            this.elements.editModal.addEventListener('click', (e) => {
                if (e.target === this.elements.editModal) {
                    this.closeModal();
                }
            });
        }
    }

    switchTab(tabName) {
        this.activeTab = tabName;
        
        // 隐藏所有面板
        if (this.elements.contentPanel) this.elements.contentPanel.style.display = 'none';
        if (this.elements.usersPanel) this.elements.usersPanel.style.display = 'none';
        if (this.elements.tagsPanel) this.elements.tagsPanel.style.display = 'none';

        // 显示选中面板
        switch(tabName) {
            case 'content':
                if (this.elements.contentPanel) this.elements.contentPanel.style.display = 'block';
                break;
            case 'users':
                if (this.elements.usersPanel) this.elements.usersPanel.style.display = 'block';
                break;
            case 'tags':
                if (this.elements.tagsPanel) this.elements.tagsPanel.style.display = 'block';
                break;
        }
    }

    async loadContent(type) {
        try {
            const { data, error } = await this.supabase
                .from(type)
                .select('*')
                .order('created_at', { ascending: false });

            if (error) throw error;

            this.displayContent(data, type);
        } catch (error) {
            console.error('加载内容失败:', error);
            alert('加载内容失败: ' + error.message);
        }
    }

    displayContent(content, type) {
        if (!this.elements.contentList) return;

        let html = '<table class="content-table">';
        html += '<thead><tr><th>ID</th><th>标题</th><th>创建时间</th><th>操作</th></tr></thead>';
        html += '<tbody>';

        content.forEach(item => {
            html += `
                <tr>
                    <td>${item.id}</td>
                    <td>${item.title || item.name}</td>
                    <td>${new Date(item.created_at).toLocaleDateString()}</td>
                    <td>
                        <button onclick="adminManager.editContent('${type}', ${item.id})">编辑</button>
                        <button onclick="adminManager.deleteContent('${type}', ${item.id})">删除</button>
                    </td>
                </tr>
            `;
        });

        html += '</tbody></table>';
        this.elements.contentList.innerHTML = html;
    }

    async loadUsers() {
        try {
            const { data, error } = await this.supabase
                .from('profiles')
                .select('*')
                .order('created_at', { ascending: false });

            if (error) throw error;

            this.displayUsers(data);
        } catch (error) {
            console.error('加载用户失败:', error);
            alert('加载用户失败: ' + error.message);
        }
    }

    displayUsers(users) {
        if (!this.elements.usersList) return;

        let html = '<table class="users-table">';
        html += '<thead><tr><th>ID</th><th>用户名</th><th>邮箱</th><th>注册时间</th><th>操作</th></tr></thead>';
        html += '<tbody>';

        users.forEach(user => {
            html += `
                <tr>
                    <td>${user.id}</td>
                    <td>${user.username || 'N/A'}</td>
                    <td>${user.email}</td>
                    <td>${new Date(user.created_at).toLocaleDateString()}</td>
                    <td>
                        <button onclick="adminManager.editUser(${user.id})">编辑</button>
                        <button onclick="adminManager.deleteUser(${user.id})">删除</button>
                    </td>
                </tr>
            `;
        });

        html += '</tbody></table>';
        this.elements.usersList.innerHTML = html;
    }

    async loadTags() {
        try {
            const { data, error } = await this.supabase
                .from('tags')
                .select('*')
                .order('name');

            if (error) throw error;

            this.tags = data;
            this.displayTags(data);
        } catch (error) {
            console.error('加载标签失败:', error);
            alert('加载标签失败: ' + error.message);
        }
    }

    displayTags(tags) {
        if (!this.elements.tagsList) return;

        let html = '<table class="tags-table">';
        html += '<thead><tr><th>ID</th><th>名称</th><th>颜色</th><th>操作</th></tr></thead>';
        html += '<tbody>';

        tags.forEach(tag => {
            html += `
                <tr>
                    <td>${tag.id}</td>
                    <td>${tag.name}</td>
                    <td><span class="tag-color" style="background-color: ${tag.color}">${tag.color}</span></td>
                    <td>
                        <button onclick="adminManager.editTag(${tag.id})">编辑</button>
                        <button onclick="adminManager.deleteTag(${tag.id})">删除</button>
                    </td>
                </tr>
            `;
        });

        html += '</tbody></table>';
        this.elements.tagsList.innerHTML = html;
    }

    async loadPendingComments() {
        try {
            const { data, error } = await this.supabase
                .from('comments')
                .select('*')
                .eq('approved', false)
                .order('created_at', { ascending: false });

            if (error) throw error;

            this.displayPendingComments(data);
        } catch (error) {
            console.error('加载待审核评论失败:', error);
            alert('加载待审核评论失败: ' + error.message);
        }
    }

    displayPendingComments(comments) {
        const container = document.getElementById('pending-comments');
        if (!container) return;

        if (comments.length === 0) {
            container.innerHTML = '<p>暂无待审核评论</p>';
            return;
        }

        let html = '<table class="comments-table">';
        html += '<thead><tr><th>内容</th><th>作者</th><th>时间</th><th>操作</th></tr></thead>';
        html += '<tbody>';

        comments.forEach(comment => {
            html += `
                <tr>
                    <td>${comment.content.substring(0, 50)}...</td>
                    <td>${comment.author}</td>
                    <td>${new Date(comment.created_at).toLocaleDateString()}</td>
                    <td>
                        <button onclick="adminManager.approveComment(${comment.id})">通过</button>
                        <button onclick="adminManager.deleteComment(${comment.id})">删除</button>
                    </td>
                </tr>
            `;
        });

        html += '</tbody></table>';
        container.innerHTML = html;
    }

    async addContent(e) {
        e.preventDefault();
        
        const form = e.target;
        const formData = new FormData(form);
        const type = formData.get('type');
        const data = {
            title: formData.get('title'),
            description: formData.get('description')
        };

        try {
            const { error } = await this.supabase
                .from(type)
                .insert(data);

            if (error) throw error;

            alert('内容添加成功');
            form.reset();
            this.loadContent(type);
        } catch (error) {
            console.error('添加内容失败:', error);
            alert('添加内容失败: ' + error.message);
        }
    }

    async addTag(e) {
        e.preventDefault();
        
        const form = e.target;
        const formData = new FormData(form);
        const data = {
            name: formData.get('name'),
            color: formData.get('color')
        };

        try {
            const { error } = await this.supabase
                .from('tags')
                .insert(data);

            if (error) throw error;

            alert('标签添加成功');
            form.reset();
            this.loadTags();
        } catch (error) {
            console.error('添加标签失败:', error);
            alert('添加标签失败: ' + error.message);
        }
    }

    editContent(type, id) {
        // 实现编辑内容功能
        alert(`编辑${type} ID: ${id}`);
    }

    async deleteContent(type, id) {
        if (!confirm('确定要删除这个内容吗？')) return;

        try {
            const { error } = await this.supabase
                .from(type)
                .delete()
                .eq('id', id);

            if (error) throw error;

            alert('内容删除成功');
            this.loadContent(type);
        } catch (error) {
            console.error('删除内容失败:', error);
            alert('删除内容失败: ' + error.message);
        }
    }

    editUser(id) {
        // 实现编辑用户功能
        alert(`编辑用户 ID: ${id}`);
    }

    async deleteUser(id) {
        if (!confirm('确定要删除这个用户吗？')) return;

        try {
            const { error } = await this.supabase
                .from('profiles')
                .delete()
                .eq('id', id);

            if (error) throw error;

            alert('用户删除成功');
            this.loadUsers();
        } catch (error) {
            console.error('删除用户失败:', error);
            alert('删除用户失败: ' + error.message);
        }
    }

    editTag(id) {
        // 实现编辑标签功能
        alert(`编辑标签 ID: ${id}`);
    }

    async deleteTag(id) {
        if (!confirm('确定要删除这个标签吗？')) return;

        try {
            const { error } = await this.supabase
                .from('tags')
                .delete()
                .eq('id', id);

            if (error) throw error;

            alert('标签删除成功');
            this.loadTags();
        } catch (error) {
            console.error('删除标签失败:', error);
            alert('删除标签失败: ' + error.message);
        }
    }

    async approveComment(id) {
        try {
            const { error } = await this.supabase
                .from('comments')
                .update({ approved: true })
                .eq('id', id);

            if (error) throw error;

            alert('评论审核通过');
            this.loadPendingComments();
        } catch (error) {
            console.error('审核评论失败:', error);
            alert('审核评论失败: ' + error.message);
        }
    }

    async deleteComment(id) {
        if (!confirm('确定要删除这个评论吗？')) return;

        try {
            const { error } = await this.supabase
                .from('comments')
                .delete()
                .eq('id', id);

            if (error) throw error;

            alert('评论删除成功');
            this.loadPendingComments();
        } catch (error) {
            console.error('删除评论失败:', error);
            alert('删除评论失败: ' + error.message);
        }
    }

    openModal(title, content) {
        if (this.elements.modalTitle) this.elements.modalTitle.textContent = title;
        if (this.elements.modalForm) this.elements.modalForm.innerHTML = content;
        if (this.elements.editModal) this.elements.editModal.style.display = 'block';
    }

    closeModal() {
        if (this.elements.editModal) this.elements.editModal.style.display = 'none';
    }
}

// 创建并导出管理员实例
const adminManager = new AdminManager();

export { adminManager };