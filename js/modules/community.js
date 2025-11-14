// 社区模块
import { checkAuthStatus, getCurrentUser } from './auth.js';
import { supabase } from '../api/supabaseClient.js';

let posts = [];

// 初始化社区模块
export async function init() {
    console.log('初始化社区模块...');
    
    // 检查用户是否已登录
    const isLoggedIn = checkAuthStatus();
    if (!isLoggedIn) {
        alert('请先登录');
        // 在SPA中，这里应该使用路由导航而不是页面跳转
        // window.location.href = '../pages/login.html';
        return;
    }
    
    // 加载社区帖子
    await loadPosts();
    
    // 绑定事件
    bindEvents();
}

// 加载社区帖子
async function loadPosts() {
    try {
        const { data, error } = await supabase
            .from('community_posts')
            .select(`
                *,
                profiles(username)
            `)
            .order('created_at', { ascending: false });
        
        if (error) throw error;
        
        posts = data || [];
        displayPosts(posts);
    } catch (error) {
        console.error('加载社区帖子失败:', error);
        document.getElementById('community-container').innerHTML = 
            '<p>加载社区帖子失败，请稍后重试。</p>';
    }
}

// 显示社区帖子
function displayPosts(posts) {
    const container = document.getElementById('community-container');
    if (!container) return;
    
    if (posts.length === 0) {
        container.innerHTML = '<p>暂无帖子，快来发表第一个帖子吧！</p>';
        return;
    }
    
    let html = `
        <div class="community-header">
            <h2>社区讨论</h2>
            <button id="create-post-btn" class="btn">发表帖子</button>
        </div>
        
        <div class="posts-list">
    `;
    
    posts.forEach(post => {
        html += `
            <div class="post-item" data-id="${post.id}">
                <div class="post-header">
                    <h3>${post.title}</h3>
                    <div class="post-meta">
                        <span class="post-author">作者: ${post.profiles?.username || '匿名用户'}</span>
                        <span class="post-date">${new Date(post.created_at).toLocaleString()}</span>
                    </div>
                </div>
                <div class="post-content">
                    <p>${post.content}</p>
                </div>
                <div class="post-actions">
                    <button class="like-btn" data-id="${post.id}">👍 赞 (${post.likes || 0})</button>
                    <button class="comment-btn" data-id="${post.id}">💬 评论</button>
                </div>
            </div>
        `;
    });
    
    html += '</div>';
    
    container.innerHTML = html;
}

// 绑定事件
function bindEvents() {
    // 发表帖子按钮
    const createPostBtn = document.getElementById('create-post-btn');
    if (createPostBtn) {
        createPostBtn.addEventListener('click', () => {
            showCreatePostForm();
        });
    }
    
    // 点赞按钮
    document.querySelectorAll('.like-btn').forEach(btn => {
        btn.addEventListener('click', async (e) => {
            const postId = e.target.getAttribute('data-id');
            await likePost(postId);
        });
    });
    
    // 评论按钮
    document.querySelectorAll('.comment-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const postId = e.target.getAttribute('data-id');
            showComments(postId);
        });
    });
}

// 显示发表帖子表单
function showCreatePostForm() {
    const container = document.getElementById('community-container');
    if (!container) return;
    
    container.innerHTML = `
        <div class="create-post-form">
            <h2>发表新帖子</h2>
            <form id="post-form">
                <div class="form-group">
                    <label for="post-title">标题:</label>
                    <input type="text" id="post-title" required>
                </div>
                
                <div class="form-group">
                    <label for="post-content">内容:</label>
                    <textarea id="post-content" rows="5" required></textarea>
                </div>
                
                <div class="form-actions">
                    <button type="submit" class="btn">发表</button>
                    <button type="button" id="cancel-post-btn" class="btn btn-secondary">取消</button>
                </div>
            </form>
        </div>
    `;
    
    // 绑定表单事件
    const form = document.getElementById('post-form');
    if (form) {
        form.addEventListener('submit', async (e) => {
            e.preventDefault();
            await createPost();
        });
    }
    
    const cancelBtn = document.getElementById('cancel-post-btn');
    if (cancelBtn) {
        cancelBtn.addEventListener('click', () => {
            loadPosts();
        });
    }
}

// 创建新帖子
async function createPost() {
    const title = document.getElementById('post-title').value;
    const content = document.getElementById('post-content').value;
    
    try {
        const user = getCurrentUser();
        if (!user) throw new Error('用户未登录');
        
        const { data, error } = await supabase
            .from('community_posts')
            .insert([
                {
                    title,
                    content,
                    user_id: user.id
                }
            ])
            .select();
        
        if (error) throw error;
        
        alert('帖子发表成功');
        await loadPosts();
    } catch (error) {
        console.error('发表帖子失败:', error);
        alert('发表帖子失败: ' + error.message);
    }
}

// 点赞帖子
async function likePost(postId) {
    try {
        // 获取当前点赞数
        const { data: postData, error: fetchError } = await supabase
            .from('community_posts')
            .select('likes')
            .eq('id', postId)
            .single();
        
        if (fetchError) throw fetchError;
        
        // 更新点赞数
        const { error: updateError } = await supabase
            .from('community_posts')
            .update({ likes: (postData.likes || 0) + 1 })
            .eq('id', postId);
        
        if (updateError) throw updateError;
        
        // 重新加载帖子
        await loadPosts();
    } catch (error) {
        console.error('点赞失败:', error);
        alert('点赞失败: ' + error.message);
    }
}

// 显示评论
function showComments(postId) {
    alert('评论功能正在开发中...');
}

export default { init };