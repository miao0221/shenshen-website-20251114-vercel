import { router } from './core/Router.js';
import { appState } from './core/AppState.js';
import { initializeAuth } from './modules/auth.js';
import { searchManager } from './modules/search.js';
import { eventBus } from './utils/EventBus.js';

// 初始化应用
document.addEventListener('DOMContentLoaded', async () => {
    console.log('初始化应用...');
    
    // 初始化认证模块
    await initializeAuth();
    
    // 初始化搜索管理器
    searchManager.init();
    
    // 检查认证状态
    checkAuthStatus();
});

// 检查认证状态
async function checkAuthStatus() {
    const authStatusDiv = document.getElementById('auth-status');
    if (!authStatusDiv) return;
    
    try {
        // 这里应该检查真实的认证状态
        const isLoggedIn = appState.isLoggedIn();
        if (isLoggedIn) {
            const user = appState.getUser();
            authStatusDiv.innerHTML = `<p>欢迎, ${user?.email}! <button id="logout-btn">退出</button></p>`;
            
            // 绑定退出按钮事件
            document.getElementById('logout-btn')?.addEventListener('click', async () => {
                // 执行退出逻辑
                eventBus.emit('userLogout');
            });
        } else {
            authStatusDiv.innerHTML = '<p>您尚未登录 <a href="/login" data-route="/login">点击登录</a></p>';
        }
    } catch (error) {
        console.error('检查认证状态失败:', error);
        authStatusDiv.innerHTML = '<p>认证状态检查失败</p>';
    }
}

// 监听用户登录事件
eventBus.on('userLogin', (user) => {
    appState.setUser(user);
    checkAuthStatus();
});

// 监听用户登出事件
eventBus.on('userLogout', () => {
    appState.setUser(null);
    checkAuthStatus();
    // 重定向到首页
    router.navigate('/');
});