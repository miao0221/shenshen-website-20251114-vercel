export default class LoginPage {
  constructor() {
    this.name = 'login';
  }
  
  async render() {
    return `
      <section class="login-section">
        <h1>登录/注册</h1>
        
        <div class="auth-container">
          <!-- 登录表单 -->
          <div class="auth-form">
            <h2>登录</h2>
            <form id="login-form">
              <div class="form-group">
                <label for="login-email">邮箱:</label>
                <input type="email" id="login-email" required>
              </div>
              
              <div class="form-group">
                <label for="login-password">密码:</label>
                <input type="password" id="login-password" required>
              </div>
              
              <button type="submit" class="btn">登录</button>
            </form>
            
            <div id="login-message" class="message"></div>
          </div>
          
          <!-- 注册表单 -->
          <div class="auth-form">
            <h2>注册</h2>
            <form id="register-form">
              <div class="form-group">
                <label for="register-username">用户名:</label>
                <input type="text" id="register-username" required>
              </div>
              
              <div class="form-group">
                <label for="register-email">邮箱:</label>
                <input type="email" id="register-email" required>
              </div>
              
              <div class="form-group">
                <label for="register-password">密码:</label>
                <input type="password" id="register-password" required>
              </div>
              
              <button type="submit" class="btn">注册</button>
            </form>
            
            <div id="register-message" class="message"></div>
          </div>
        </div>
      </section>
    `;
  }
  
  async afterRender() {
    // 绑定页面事件
    // 这里将初始化登录模块的功能
    await this.initLoginModule();
  }
  
  cleanup() {
    // 清理资源
    // 移除事件监听器等
  }
  
  async initLoginModule() {
    // 初始化登录模块
    // 这里会导入并初始化原有的登录功能
    try {
      const loginModule = await import('../modules/login.js');
      if (loginModule && typeof loginModule.init === 'function') {
        await loginModule.init();
      }
    } catch (error) {
      console.error('登录模块初始化失败:', error);
    }
  }
}