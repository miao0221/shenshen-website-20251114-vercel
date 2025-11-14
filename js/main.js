// 主要JavaScript文件
import { initSupabase } from './config.js';
import { authManager } from './modules/auth.js';
import { searchManager } from './modules/search.js';

document.addEventListener('DOMContentLoaded', async function() {
    console.log('周深粉丝网站已加载');
    
    // 初始化Supabase
    await initSupabase();
    
    // 检查用户登录状态
    checkAuthStatus();
    
    // 可以在这里添加交互功能
    
    // 示例：导航栏高亮当前页面
    const currentPage = window.location.pathname.split('/').pop() || 'index.html';
    const navLinks = document.querySelectorAll('.nav-link');
    
    navLinks.forEach(link => {
        if (link.getAttribute('href') === currentPage) {
            link.classList.add('active');
        }
    });
});

// 检查认证状态并更新UI
async function checkAuthStatus() {
    const authStatusDiv = document.getElementById('auth-status');
    if (!authStatusDiv) return;
    
    try {
        const authResult = await authManager.checkAuthState();
        
        if (authResult.isLoggedIn) {
            authStatusDiv.innerHTML = `
                <p>欢迎您，${authResult.user.email}! 
                <button id="logout-btn">登出</button></p>
            `;
            
            const logoutBtn = document.getElementById('logout-btn');
            if (logoutBtn) {
                logoutBtn.addEventListener('click', async () => {
                    try {
                        await authManager.signOut();
                        checkAuthStatus(); // 重新检查状态
                    } catch (error) {
                        console.error('登出过程中发生错误:', error);
                    }
                });
            }
        } else {
            authStatusDiv.innerHTML = '<p>您尚未登录 <a href="./pages/login.html">点击登录</a></p>';
        }
    } catch (error) {
        console.error('检查认证状态时发生错误:', error);
        authStatusDiv.innerHTML = '<p>检查登录状态时发生错误</p>';
    }
}