export default class AdminPage {
  constructor() {
    this.name = 'admin';
  }
  
  async render() {
    return `
      <div class="container">
        <section class="page-header">
            <h1>后台管理</h1>
            <p>管理网站内容和用户</p>
        </section>
        
        <section class="admin-dashboard">
            <div class="cards-grid">
                <div class="card">
                    <div class="card-content">
                        <h3 class="card-title">音乐管理</h3>
                        <p class="card-text">管理音乐作品信息</p>
                        <button class="btn btn-primary">进入</button>
                    </div>
                </div>
                
                <div class="card">
                    <div class="card-content">
                        <h3 class="card-title">视频管理</h3>
                        <p class="card-text">管理视频内容信息</p>
                        <button class="btn btn-primary">进入</button>
                    </div>
                </div>
                
                <div class="card">
                    <div class="card-content">
                        <h3 class="card-title">用户管理</h3>
                        <p class="card-text">管理系统用户</p>
                        <button class="btn btn-primary">进入</button>
                    </div>
                </div>
                
                <div class="card">
                    <div class="card-content">
                        <h3 class="card-title">数据统计</h3>
                        <p class="card-text">查看网站统计数据</p>
                        <button class="btn btn-primary">进入</button>
                    </div>
                </div>
            </div>
        </section>
      </div>
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