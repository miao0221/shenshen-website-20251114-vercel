export default class ProfilePage {
  constructor() {
    this.name = 'profile';
  }
  
  async render() {
    return `
      <div class="container">
        <section class="page-header">
          <h1>个人中心</h1>
          <p>管理您的个人信息和收藏</p>
        </section>
        
        <section class="profile-section">
          <div class="card">
            <div class="card-content">
              <h3 class="card-title">个人信息</h3>
              <div class="profile-info">
                <p><strong>用户名：</strong>深粉一号</p>
                <p><strong>注册时间：</strong>2023-01-15</p>
                <p><strong>邮箱：</strong>user@example.com</p>
                <button class="btn btn-secondary">编辑资料</button>
              </div>
            </div>
          </div>
          
          <div class="card">
            <div class="card-content">
              <h3 class="card-title">我的收藏</h3>
              <div class="profile-favorites">
                <p>您收藏了 <strong>12</strong> 首歌曲</p>
                <p>您收藏了 <strong>8</strong> 个视频</p>
                <button class="btn btn-primary">查看收藏</button>
              </div>
            </div>
          </div>
        </section>
      </div>
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