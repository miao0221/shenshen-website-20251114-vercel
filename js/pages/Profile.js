export default class ProfilePage {
  constructor() {
    this.name = 'profile';
  }
  
  async render() {
    return `
      <section class="profile-section">
        <h1>个人资料</h1>
        <p>管理您的个人资料和设置。</p>
        
        <div id="profile-container">
          <p>正在加载个人资料...</p>
        </div>
      </section>
    `;
  }
  
  async afterRender() {
    // 绑定页面事件
    await this.initProfileModule();
  }
  
  cleanup() {
    // 清理资源
  }
  
  async initProfileModule() {
    // 初始化个人资料模块
    try {
      const profileModule = await import('../modules/profile.js');
      if (profileModule && typeof profileModule.init === 'function') {
        await profileModule.init();
      }
    } catch (error) {
      console.error('个人资料模块初始化失败:', error);
      document.getElementById('profile-container').innerHTML = 
        '<p>加载个人资料失败，请稍后重试。</p>';
    }
  }
}