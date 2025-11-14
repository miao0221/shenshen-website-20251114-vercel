// 登录页面专用JavaScript模块
import { authManager } from '../auth.js';

document.addEventListener('DOMContentLoaded', function() {
    console.log('登录页面已加载');
    
    // 获取表单元素
    const loginForm = document.getElementById('login-form');
    const signupForm = document.getElementById('signup-form');
    const messageDiv = document.getElementById('auth-message');
    
    // 登录表单提交处理
    if (loginForm) {
        loginForm.addEventListener('submit', async function(e) {
            e.preventDefault();
            
            const email = document.getElementById('login-email').value;
            const password = document.getElementById('login-password').value;
            
            showMessage('正在登录...', 'info');
            
            const result = await authManager.signIn(email, password);
            
            if (result.success) {
                showMessage('登录成功！正在跳转...', 'success');
                setTimeout(() => {
                    window.location.href = '../index.html';
                }, 1000);
            } else {
                showMessage('登录失败: ' + result.error, 'error');
            }
        });
    }
    
    // 注册表单提交处理
    if (signupForm) {
        signupForm.addEventListener('submit', async function(e) {
            e.preventDefault();
            
            const username = document.getElementById('signup-username').value;
            const email = document.getElementById('signup-email').value;
            const password = document.getElementById('signup-password').value;
            
            showMessage('正在注册...', 'info');
            
            const result = await authManager.signUp(email, password, username);
            
            if (result.success) {
                showMessage('注册成功！请检查您的邮箱进行确认。', 'success');
            } else {
                showMessage('注册失败: ' + result.error, 'error');
            }
        });
    }
    
    // 显示消息函数
    function showMessage(message, type) {
        if (messageDiv) {
            messageDiv.textContent = message;
            messageDiv.className = 'message ' + type;
        }
    }
});