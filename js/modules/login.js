// 登录页面专用JavaScript模块
import { login, register } from './auth.js';
import { eventBus } from '../utils/EventBus.js';

// 初始化登录模块
export async function init() {
    console.log('初始化登录模块...');
    
    // 绑定事件
    bindEvents();
}

// 绑定事件
function bindEvents() {
    // 登录表单提交
    const loginForm = document.getElementById('login-form');
    if (loginForm) {
        loginForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            await handleLogin();
        });
    }
    
    // 注册表单提交
    const registerForm = document.getElementById('signup-form');
    if (registerForm) {
        registerForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            await handleRegister();
        });
    }
}

// 处理登录
async function handleLogin() {
    const email = document.getElementById('login-email').value;
    const password = document.getElementById('login-password').value;
    const messageDiv = document.getElementById('auth-message');
    
    try {
        // 显示加载状态
        messageDiv.innerHTML = '<p>正在登录...</p>';
        
        // 执行登录
        const result = await login(email, password);
        
        if (result.success) {
            messageDiv.innerHTML = '<p class="success">登录成功，正在跳转...</p>';
            // 在SPA中，路由会自动处理跳转
            // 发布登录事件
            eventBus.emit('userLogin', result.user);
        } else {
            messageDiv.innerHTML = `<p class="error">登录失败: ${result.error}</p>`;
        }
    } catch (error) {
        console.error('登录过程出错:', error);
        messageDiv.innerHTML = '<p class="error">登录过程出错，请稍后重试</p>';
    }
}

// 处理注册
async function handleRegister() {
    const username = document.getElementById('signup-username').value;
    const email = document.getElementById('signup-email').value;
    const password = document.getElementById('signup-password').value;
    const messageDiv = document.getElementById('auth-message');
    
    try {
        // 显示加载状态
        messageDiv.innerHTML = '<p>正在注册...</p>';
        
        // 执行注册
        const result = await register(email, password, username);
        
        if (result.success) {
            messageDiv.innerHTML = '<p class="success">注册成功，请检查您的邮箱进行确认。</p>';
            // 清空注册表单
            document.getElementById('signup-form').reset();
        } else {
            messageDiv.innerHTML = `<p class="error">注册失败: ${result.error}</p>`;
        }
    } catch (error) {
        console.error('注册过程出错:', error);
        messageDiv.innerHTML = '<p class="error">注册过程出错，请稍后重试</p>';
    }
}

export default { init };