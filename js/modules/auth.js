// 认证模块
import { getSupabase } from '../supabase.js';

// 认证状态变量
let currentUser = null;
let isLoggedIn = false;

// 初始化认证模块
export async function initializeAuth() {
    console.log('初始化认证模块...');
    
    try {
        const supabase = getSupabase();
        if (!supabase) {
            throw new Error('Supabase客户端未初始化');
        }
        
        // 获取当前会话
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (error) {
            console.error('获取会话失败:', error);
            return;
        }
        
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
                    if (session) {
                        currentUser = session.user;
                        isLoggedIn = true;
                        handleAuthStateChange(true, currentUser);
                    }
                    break;
                case 'SIGNED_OUT':
                    currentUser = null;
                    isLoggedIn = false;
                    handleAuthStateChange(false, null);
                    break;
                case 'TOKEN_REFRESHED':
                    if (session) {
                        currentUser = session.user;
                        handleAuthStateChange(true, currentUser);
                    }
                    break;
                case 'USER_UPDATED':
                    if (session) {
                        currentUser = session.user;
                        handleAuthStateChange(true, currentUser);
                    }
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

// 导出常量
export const AuthEvents = {
    SIGNED_IN: 'SIGNED_IN',
    SIGNED_OUT: 'SIGNED_OUT',
    TOKEN_REFRESHED: 'TOKEN_REFRESHED',
    USER_UPDATED: 'USER_UPDATED'
};

// 获取当前用户
export async function getCurrentUser() {
    try {
        const supabase = getSupabase();
        if (!supabase) {
            throw new Error('Supabase客户端未初始化');
        }
        
        const { data: { user }, error } = await supabase.auth.getUser();
        
        if (error) {
            throw error;
        }
        
        return { success: true, user };
    } catch (error) {
        console.error('获取用户信息失败:', error.message);
        return { success: false, error: error.message };
    }
}

// 用户登录
export async function loginUser(email, password) {
    try {
        const supabase = getSupabase();
        if (!supabase) {
            throw new Error('Supabase客户端未初始化');
        }
        
        const { data, error } = await supabase.auth.signInWithPassword({
            email,
            password
        });
        
        if (error) {
            throw error;
        }
        
        currentUser = data.user;
        isLoggedIn = true;
        
        return { success: true, data };
    } catch (error) {
        console.error('登录失败:', error.message);
        return { success: false, error: error.message };
    }
}

// 用户注册
export async function registerUser(email, password) {
    try {
        const supabase = getSupabase();
        if (!supabase) {
            throw new Error('Supabase客户端未初始化');
        }
        
        const { data, error } = await supabase.auth.signUp({
            email,
            password
        });
        
        if (error) {
            throw error;
        }
        
        return { success: true, data };
    } catch (error) {
        console.error('注册失败:', error.message);
        return { success: false, error: error.message };
    }
}

// 用户登出
export async function logoutUser() {
    try {
        const supabase = getSupabase();
        if (!supabase) {
            throw new Error('Supabase客户端未初始化');
        }
        
        const { error } = await supabase.auth.signOut();
        
        if (error) {
            throw error;
        }
        
        currentUser = null;
        isLoggedIn = false;
        
        return { success: true };
    } catch (error) {
        console.error('登出失败:', error.message);
        return { success: false, error: error.message };
    }
}