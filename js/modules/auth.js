// 认证模块
import { initSupabase } from '../config.js';

class AuthManager {
    constructor() {
        this.supabase = null;
        this.currentUser = null;
    }

    async init() {
        this.supabase = await initSupabase();
        
        // 检查supabase客户端是否已正确初始化
        if (!this.supabase) {
            console.error('Supabase客户端初始化失败');
            return;
        }
        
        // 监听认证状态变化
        this.supabase.auth.onAuthStateChange((event, session) => {
            try {
                if (event === 'SIGNED_IN') {
                    this.currentUser = session.user;
                    // 保存用户信息到本地存储
                    localStorage.setItem('user_session', JSON.stringify(session));
                } else if (event === 'SIGNED_OUT') {
                    this.currentUser = null;
                    // 清除本地存储的用户信息
                    localStorage.removeItem('user_session');
                }
            } catch (error) {
                console.error('处理认证状态变化时出错:', error);
            }
        });
    }

    // 用户注册表单验证
    validateSignUpForm(email, password, username) {
        const errors = [];

        // 验证邮箱
        if (!email) {
            errors.push('邮箱不能为空');
        } else if (!/\S+@\S+\.\S+/.test(email)) {
            errors.push('邮箱格式不正确');
        }

        // 验证密码
        if (!password) {
            errors.push('密码不能为空');
        } else if (password.length < 6) {
            errors.push('密码长度不能少于6位');
        }

        // 验证用户名
        if (!username) {
            errors.push('用户名不能为空');
        } else if (username.length < 2) {
            errors.push('用户名长度不能少于2位');
        } else if (username.length > 20) {
            errors.push('用户名长度不能超过20位');
        }

        return {
            isValid: errors.length === 0,
            errors
        };
    }

    // 用户登录表单验证
    validateSignInForm(email, password) {
        const errors = [];

        // 验证邮箱
        if (!email) {
            errors.push('邮箱不能为空');
        } else if (!/\S+@\S+\.\S+/.test(email)) {
            errors.push('邮箱格式不正确');
        }

        // 验证密码
        if (!password) {
            errors.push('密码不能为空');
        }

        return {
            isValid: errors.length === 0,
            errors
        };
    }

    // 用户资料更新表单验证
    validateProfileUpdateForm(username) {
        const errors = [];

        // 验证用户名
        if (!username) {
            errors.push('用户名不能为空');
        } else if (username.length < 2) {
            errors.push('用户名长度不能少于2位');
        } else if (username.length > 20) {
            errors.push('用户名长度不能超过20位');
        }

        return {
            isValid: errors.length === 0,
            errors
        };
    }

    // 用户注册
    async signUp(email, password, username) {
        try {
            // 表单验证
            const validation = this.validateSignUpForm(email, password, username);
            if (!validation.isValid) {
                return { success: false, error: validation.errors.join(', ') };
            }
            
            if (!this.supabase) await this.init();
            
            // 检查supabase客户端是否已正确初始化
            if (!this.supabase) {
                console.error('Supabase客户端未初始化');
                return { success: false, error: 'Supabase客户端未初始化' };
            }

            const { data, error } = await this.supabase.auth.signUp({
                email: email,
                password: password,
                options: {
                    data: {
                        username: username
                    }
                }
            });

            if (error) throw error;

            // 注册成功，保存用户信息
            this.currentUser = data.user;
            
            return { 
                success: true, 
                message: '注册成功，请检查邮箱确认账户',
                user: data.user 
            };
        } catch (error) {
            console.error('注册失败:', error.message);
            return { success: false, error: error.message };
        }
    }

    // 用户登录
    async signIn(email, password) {
        try {
            // 表单验证
            const validation = this.validateSignInForm(email, password);
            if (!validation.isValid) {
                return { success: false, error: validation.errors.join(', ') };
            }
            
            if (!this.supabase) await this.init();
            
            // 检查supabase客户端是否已正确初始化
            if (!this.supabase) {
                console.error('Supabase客户端未初始化');
                return { success: false, error: 'Supabase客户端未初始化' };
            }

            const { data, error } = await this.supabase.auth.signInWithPassword({
                email: email,
                password: password
            });

            if (error) throw error;

            // 登录成功，保存用户信息
            this.currentUser = data.user;
            
            // 保存会话到本地存储
            localStorage.setItem('user_session', JSON.stringify(data.session));
            
            return { 
                success: true, 
                message: '登录成功',
                user: data.user 
            };
        } catch (error) {
            console.error('登录失败:', error.message);
            return { success: false, error: error.message };
        }
    }

    // 用户登出
    async signOut() {
        try {
            if (!this.supabase) await this.init();
            
            // 检查supabase客户端是否已正确初始化
            if (!this.supabase) {
                console.error('Supabase客户端未初始化');
                return { success: false, error: 'Supabase客户端未初始化' };
            }

            const { error } = await this.supabase.auth.signOut();

            if (error) throw error;

            // 登出成功，清除用户信息
            this.currentUser = null;
            
            // 清除本地存储的会话
            localStorage.removeItem('user_session');
            
            return { success: true, message: '登出成功' };
        } catch (error) {
            console.error('登出失败:', error.message);
            return { success: false, error: error.message };
        }
    }

    // 检查登录状态函数
    async checkAuthState() {
        try {
            if (!this.supabase) await this.init();
            
            // 检查supabase客户端是否已正确初始化
            if (!this.supabase) {
                console.error('Supabase客户端未初始化');
                return { isLoggedIn: false, error: 'Supabase客户端未初始化' };
            }

            // 首先检查本地存储中的会话
            const storedSession = localStorage.getItem('user_session');
            if (storedSession) {
                const session = JSON.parse(storedSession);
                // 检查会话是否过期
                const now = Math.floor(Date.now() / 1000);
                if (session.expires_at > now) {
                    // 检查服务器上的会话是否仍然有效
                    try {
                        const { data: { session: serverSession }, error: serverError } = await this.supabase.auth.getSession();
                        if (serverError) throw serverError;
                        if (serverSession) {
                            this.currentUser = serverSession.user;
                            return { isLoggedIn: true, user: serverSession.user };
                        }
                    } catch (serverError) {
                        console.error('检查服务器会话失败:', serverError.message);
                        // 继续执行下面的逻辑，从服务器获取新会话
                    }
                }
            }

            // 如果本地存储中没有有效会话，则从服务器获取
            const { data: { session }, error: sessionError } = await this.supabase.auth.getSession();
            
            if (sessionError) throw sessionError;
            
            if (session) {
                this.currentUser = session.user;
                // 保存用户信息到本地存储
                localStorage.setItem('user_session', JSON.stringify(session));
                return { isLoggedIn: true, user: session.user };
            } else {
                this.currentUser = null;
                // 清除本地存储的用户信息
                localStorage.removeItem('user_session');
                return { isLoggedIn: false, user: null };
            }
        } catch (error) {
            console.error('检查登录状态失败:', error.message);
            return { isLoggedIn: false, error: error.message };
        }
    }

    // 更新用户资料
    async updateProfile(username, avatarUrl = null) {
        try {
            if (!this.supabase) await this.init();
            
            // 检查supabase客户端是否已正确初始化
            if (!this.supabase) {
                console.error('Supabase客户端未初始化');
                return { success: false, error: 'Supabase客户端未初始化' };
            }
            
            // 验证表单
            const validation = this.validateProfileForm(username);
            if (!validation.isValid) {
                return { success: false, error: validation.errors.join(', ') };
            }

            const updates = {
                data: {
                    username: username
                }
            };

            if (avatarUrl) {
                updates.data.avatar_url = avatarUrl;
            }

            const { data, error } = await this.supabase.auth.updateUser(updates);

            if (error) throw error;

            // 更新成功，更新当前用户信息
            if (data.user) {
                this.currentUser = data.user;
            }
            
            return { 
                success: true, 
                message: '资料更新成功',
                user: data.user 
            };
        } catch (error) {
            console.error('更新资料失败:', error.message);
            return { success: false, error: error.message };
        }
    }

    // 获取当前用户
    getCurrentUser() {
        return this.currentUser;
    }
    
    // 获取用户资料（包括自定义字段）
    async getUserProfile() {
        try {
            if (!this.supabase) await this.init();
            
            // 检查supabase客户端是否已正确初始化
            if (!this.supabase) {
                console.error('Supabase客户端未初始化');
                return { success: false, error: 'Supabase客户端未初始化' };
            }
            
            const { data: { user }, error } = await this.supabase.auth.getUser();
            
            if (error) throw error;
            if (!user) {
                console.error('未找到用户信息');
                return { success: false, error: '未找到用户信息' };
            }
            
            return {
                success: true,
                user: {
                    id: user.id,
                    email: user.email,
                    username: user.user_metadata?.username || '',
                    avatar_url: user.user_metadata?.avatar_url || '',
                    created_at: user.created_at
                }
            };
        } catch (error) {
            console.error('获取用户资料失败:', error.message);
            return { success: false, error: error.message };
        }
    }
}

// 创建并导出认证管理器实例
const authManager = new AuthManager();

// 页面加载完成后自动初始化
document.addEventListener('DOMContentLoaded', () => {
    authManager.init();
});

export { authManager };
export default AuthManager;