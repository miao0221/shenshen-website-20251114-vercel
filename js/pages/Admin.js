export default class AdminPage {
  constructor() {
    this.name = 'admin';
  }
  
  async render() {
    return `
      <section class="admin-section">
        <h1>管理后台</h1>
        <p>网站管理功能。</p>
        
        <div id="admin-container">
          <p>正在加载管理界面...</p>
        </div>
      </section>
    `;
  }
  
  async afterRender() {
    // 绑定页面事件
    await this.initAdminModule();
  }
  
  cleanup() {
    // 清理资源
  }
  
  async initAdminModule() {
    // 初始化管理模块
    try {
      const adminModule = await import('../modules/admin.js');
      if (adminModule && typeof adminModule.init === 'function') {
        await adminModule.init();
      }
    } catch (error) {
      console.error('管理模块初始化失败:', error);
      document.getElementById('admin-container').innerHTML = 
        '<p>加载管理界面失败，请稍后重试。</p>';
    }
  }
}