import { checkAuthStatus, getCurrentUser } from './auth.js';
import { supabase } from '../api/supabaseClient.js';

let userProfile = null;

// 初始化个人资料模块
export async function init() {
    console.log('初始化个人资料模块...');
    
    // 检查用户是否已登录
    const isLoggedIn = checkAuthStatus();
    if (!isLoggedIn) {
        alert('请先登录');
        // 在SPA中，这里应该使用路由导航而不是页面跳转
        // window.location.href = '../pages/login.html';
        return;
    }
    
    // 获取当前用户
    const user = getCurrentUser();
    if (!user) {
        console.error('无法获取用户信息');
        return;
    }
    
    // 加载用户资料
    await loadUserProfile(user.id);
    
    // 绑定事件
    bindEvents();
}

// 加载用户资料
async function loadUserProfile(userId) {
    try {
        // 获取用户资料
        const { data, error } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', userId)
            .single();
        
        if (error) throw error;
        
        userProfile = data;
        
        // 显示用户资料
        displayUserProfile(data);
    } catch (error) {
        console.error('加载用户资料失败:', error);
        document.getElementById('profile-container').innerHTML = 
            '<p>加载用户资料失败，请稍后重试。</p>';
    }
}

// 显示用户资料
function displayUserProfile(profile) {
    const container = document.getElementById('profile-container');
    if (!container) return;
    
    container.innerHTML = `
        <div class="profile-header">
            <h2>个人资料</h2>
        </div>
        
        <div class="profile-content">
            <div class="profile-field">
                <label>用户名:</label>
                <span id="profile-username">${profile.username || '未设置'}</span>
            </div>
            
            <div class="profile-field">
                <label>邮箱:</label>
                <span id="profile-email">${profile.email || '未设置'}</span>
            </div>
            
            <div class="profile-field">
                <label>注册时间:</label>
                <span id="profile-created-at">${new Date(profile.created_at).toLocaleString()}</span>
            </div>
            
            <div class="profile-actions">
                <button id="edit-profile-btn" class="btn">编辑资料</button>
                <button id="change-password-btn" class="btn">修改密码</button>
            </div>
        </div>
        
        <!-- 编辑资料表单 -->
        <div id="edit-profile-form" class="profile-form hidden">
            <h3>编辑资料</h3>
            <form id="profile-edit-form">
                <div class="form-group">
                    <label for="edit-username">用户名:</label>
                    <input type="text" id="edit-username" value="${profile.username || ''}">
                </div>
                
                <div class="form-group">
                    <label for="edit-email">邮箱:</label>
                    <input type="email" id="edit-email" value="${profile.email || ''}">
                </div>
                
                <div class="form-actions">
                    <button type="submit" class="btn">保存</button>
                    <button type="button" id="cancel-edit-btn" class="btn btn-secondary">取消</button>
                </div>
            </form>
        </div>
        
        <!-- 修改密码表单 -->
        <div id="change-password-form" class="profile-form hidden">
            <h3>修改密码</h3>
            <form id="password-change-form">
                <div class="form-group">
                    <label for="current-password">当前密码:</label>
                    <input type="password" id="current-password" required>
                </div>
                
                <div class="form-group">
                    <label for="new-password">新密码:</label>
                    <input type="password" id="new-password" required>
                </div>
                
                <div class="form-group">
                    <label for="confirm-password">确认新密码:</label>
                    <input type="password" id="confirm-password" required>
                </div>
                
                <div class="form-actions">
                    <button type="submit" class="btn">修改密码</button>
                    <button type="button" id="cancel-password-btn" class="btn btn-secondary">取消</button>
                </div>
            </form>
        </div>
    `;
}

// 绑定事件
function bindEvents() {
    // 编辑资料按钮
    const editBtn = document.getElementById('edit-profile-btn');
    if (editBtn) {
        editBtn.addEventListener('click', () => {
            document.getElementById('edit-profile-form').classList.remove('hidden');
        });
    }
    
    // 取消编辑按钮
    const cancelEditBtn = document.getElementById('cancel-edit-btn');
    if (cancelEditBtn) {
        cancelEditBtn.addEventListener('click', () => {
            document.getElementById('edit-profile-form').classList.add('hidden');
        });
    }
    
    // 修改密码按钮
    const changePasswordBtn = document.getElementById('change-password-btn');
    if (changePasswordBtn) {
        changePasswordBtn.addEventListener('click', () => {
            document.getElementById('change-password-form').classList.remove('hidden');
        });
    }
    
    // 取消修改密码按钮
    const cancelPasswordBtn = document.getElementById('cancel-password-btn');
    if (cancelPasswordBtn) {
        cancelPasswordBtn.addEventListener('click', () => {
            document.getElementById('change-password-form').classList.add('hidden');
        });
    }
    
    // 编辑资料表单提交
    const editForm = document.getElementById('profile-edit-form');
    if (editForm) {
        editForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            await updateProfile();
        });
    }
    
    // 修改密码表单提交
    const passwordForm = document.getElementById('password-change-form');
    if (passwordForm) {
        passwordForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            await changePassword();
        });
    }
}

// 更新用户资料
async function updateProfile() {
    const username = document.getElementById('edit-username').value;
    const email = document.getElementById('edit-email').value;
    
    try {
        const user = getCurrentUser();
        if (!user) throw new Error('用户未登录');
        
        // 更新用户资料
        const { error } = await supabase
            .from('profiles')
            .update({ username, email })
            .eq('id', user.id);
        
        if (error) throw error;
        
        // 隐藏表单
        document.getElementById('edit-profile-form').classList.add('hidden');
        
        // 重新加载用户资料
        await loadUserProfile(user.id);
        
        alert('资料更新成功');
    } catch (error) {
        console.error('更新资料失败:', error);
        alert('更新资料失败: ' + error.message);
    }
}

// 修改密码
async function changePassword() {
    const currentPassword = document.getElementById('current-password').value;
    const newPassword = document.getElementById('new-password').value;
    const confirmPassword = document.getElementById('confirm-password').value;
    
    // 简单验证
    if (newPassword !== confirmPassword) {
        alert('新密码和确认密码不一致');
        return;
    }
    
    try {
        const user = getCurrentUser();
        if (!user) throw new Error('用户未登录');
        
        // 更新密码
        const { error } = await supabase.auth.updateUser({
            password: newPassword
        });
        
        if (error) throw error;
        
        // 隐藏表单
        document.getElementById('change-password-form').classList.add('hidden');
        
        alert('密码修改成功');
    } catch (error) {
        console.error('修改密码失败:', error);
        alert('修改密码失败: ' + error.message);
    }
}

export default { init };