import { supabase } from '../api/supabaseClient.js';
import { appState } from './AppState.js';
import { eventBus } from '../utils/EventBus.js';

// 用户状态管理器
class UserManager {
  constructor() {
    this.currentUser = null;
    this.isLoggedIn = false;
    this.init();
  }

  // 初始化用户管理器
  async init() {
    // 监听认证状态变化
    supabase.auth.onAuthStateChange((event, session) => {
      switch (event) {
        case 'SIGNED_IN':
          this.handleSignIn(session.user);
          break;
        case 'SIGNED_OUT':
          this.handleSignOut();
          break;
        case 'TOKEN_REFRESHED':
          this.handleTokenRefresh(session.user);
          break;
        case 'USER_UPDATED':
          this.handleUserUpdate(session.user);
          break;
      }
    });

    // 检查当前会话
    await this.checkSession();
  }

  // 检查当前会话
  async checkSession() {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        this.handleSignIn(session.user);
      } else {
        this.handleSignOut();
      }
    } catch (error) {
      console.error('检查会话失败:', error);
      this.handleSignOut();
    }
  }

  // 处理用户登录
  handleSignIn(user) {
    this.currentUser = user;
    this.isLoggedIn = true;
    
    // 更新应用状态
    appState.setUser(user);
    
    // 发布用户登录事件
    eventBus.emit('userLogin', user);
  }

  // 处理用户登出
  handleSignOut() {
    this.currentUser = null;
    this.isLoggedIn = false;
    
    // 更新应用状态
    appState.setUser(null);
    
    // 发布用户登出事件
    eventBus.emit('userLogout');
  }

  // 处理令牌刷新
  handleTokenRefresh(user) {
    this.currentUser = user;
    
    // 更新应用状态
    appState.setUser(user);
    
    // 发布令牌刷新事件
    eventBus.emit('tokenRefresh', user);
  }

  // 处理用户信息更新
  handleUserUpdate(user) {
    this.currentUser = user;
    
    // 更新应用状态
    appState.setUser(user);
    
    // 发布用户更新事件
    eventBus.emit('userUpdate', user);
  }

  // 用户登录
  async login(email, password) {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      });

      if (error) {
        throw new Error(error.message);
      }

      return { success: true, user: data.user };
    } catch (error) {
      console.error('登录失败:', error);
      return { success: false, error: error.message };
    }
  }

  // 用户注册
  async register(email, password, username) {
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

      if (error) {
        throw new Error(error.message);
      }

      return { success: true, user: data.user };
    } catch (error) {
      console.error('注册失败:', error);
      return { success: false, error: error.message };
    }
  }

  // 用户登出
  async logout() {
    try {
      const { error } = await supabase.auth.signOut();

      if (error) {
        throw new Error(error.message);
      }

      return { success: true };
    } catch (error) {
      console.error('登出失败:', error);
      return { success: false, error: error.message };
    }
  }

  // 获取当前用户
  getCurrentUser() {
    return this.currentUser;
  }

  // 检查是否已登录
  getIsLoggedIn() {
    return this.isLoggedIn;
  }
}

// 创建并导出用户管理器实例
const userManager = new UserManager();

export { userManager };
export default UserManager;