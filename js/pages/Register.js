export default class RegisterPage {
  constructor() {
    this.name = 'register';
  }
  
  async render() {
    return `
      <section class="register-section">
        <h1>用户注册</h1>
        
        <div class="auth-form">
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
            
            <div class="form-group">
              <label for="register-confirm-password">确认密码:</label>
              <input type="password" id="register-confirm-password" required>
            </div>
            
            <button type="submit" class="btn">注册</button>
          </form>
          
          <div id="register-message" class="message"></div>
          
          <p class="auth-switch">
            已有账户? <a href="/login" data-route="/login">立即登录</a>
          </p>
        </div>
      </section>
    `;
  }
  
  async afterRender() {
    // 绑定页面事件
    // 注册表单提交事件等
    this.bindEvents();
  }
  
  cleanup() {
    // 清理资源
    // 移除事件监听器等
  }
  
  bindEvents() {
    const registerForm = document.getElementById('register-form');
    if (registerForm) {
      registerForm.addEventListener('submit', (e) => {
        e.preventDefault();
        this.handleRegister();
      });
    }
  }
  
  async handleRegister() {
    const username = document.getElementById('register-username').value;
    const email = document.getElementById('register-email').value;
    const password = document.getElementById('register-password').value;
    const confirmPassword = document.getElementById('register-confirm-password').value;
    
    const messageDiv = document.getElementById('register-message');
    
    // 简单验证
    if (password !== confirmPassword) {
      messageDiv.innerHTML = '<p class="error">两次输入的密码不一致</p>';
      return;
    }
    
    // 这里应该调用实际的注册API
    messageDiv.innerHTML = '<p>注册功能正在开发中...</p>';
  }
}