// 认证模块
import { supabase } from '../api/supabaseClient.js';
import { userManager } from '../core/UserManager.js';

// 认证状态变量
let currentUser = null;
let isLoggedIn = false;

// 初始化认证模块
export async function initializeAuth() {
    console.log('初始化认证模块...');
    
    try {
        // 获取当前会话
        const { data: { session } } = await supabase.auth.getSession();
        
        if (session) {
            currentUser = session.user;
            isLoggedIn = true;
            console.log('用户已登录:', currentUser);
        } else {
            console.log('用户未登录');
        }
        
        // 设置认证状态变更监听器
        supabase.auth.onAuthStateChange((event, session) => {
            console.log('认证状态变更:', event);
            
            switch (event) {
                case 'SIGNED_IN':
                    currentUser = session.user;
                    isLoggedIn = true;
                    handleAuthStateChange(true, currentUser);
                    break;
                case 'SIGNED_OUT':
                    currentUser = null;
                    isLoggedIn = false;
                    handleAuthStateChange(false, null);
                    break;
                case 'TOKEN_REFRESHED':
                    currentUser = session.user;
                    handleAuthStateChange(true, currentUser);
                    break;
                case 'USER_UPDATED':
                    currentUser = session.user;
                    handleAuthStateChange(true, currentUser);
                    break;
            }
        });
        
    } catch (error) {
        console.error('初始化认证模块失败:', error);
    }
}

// 处理认证状态变更
function handleAuthStateChange(loggedIn, user) {
    console.log('处理认证状态变更:', { loggedIn, user });
    
    // 在这里可以添加更多状态变更处理逻辑
    // 例如更新UI、同步数据等
}

// 检查用户是否已登录
export function checkAuthStatus() {
    return isLoggedIn;
}

// 获取当前用户信息
export function getCurrentUser() {
    return currentUser;
}

// 用户登录
export async function login(email, password) {
    try {
        const { data, error } = await supabase.auth.signInWithPassword({
            email,
            password
        });
        
        if (error) throw error;
        
        currentUser = data.user;
        isLoggedIn = true;
        
        return { success: true, user: data.user };
    } catch (error) {
        console.error('登录失败:', error);
        return { success: false, error: error.message };
    }
}

// 用户注册
export async function register(email, password, username) {
    try {
        const { data, error } = await supabase.auth.signUp({
            email,
            password,
            options: {
                data: {
                    username
                }
            }
        });
        
        if (error) throw error;
        
        return { success: true, user: data.user };
    } catch (error) {
        console.error('注册失败:', error);
        return { success: false, error: error.message };
    }
}

// 用户登出
export async function logout() {
    try {
        const { error } = await supabase.auth.signOut();
        
        if (error) throw error;
        
        currentUser = null;
        isLoggedIn = false;
        
        return { success: true };
    } catch (error) {
        console.error('登出失败:', error);
        return { success: false, error: error.message };
    }
}

export default {
    initializeAuth,
    checkAuthStatus,
    getCurrentUser,
    login,
    register,
    logout
};
