export default class CommunityPage {
  constructor() {
    this.name = 'community';
  }
  
  async render() {
    return `
      <section class="community-section">
        <h1>粉丝社区</h1>
        <p>与其它粉丝一起交流讨论。</p>
        
        <div id="community-container">
          <p>正在加载社区内容...</p>
        </div>
      </section>
    `;
  }
  
  async afterRender() {
    // 绑定页面事件
    await this.initCommunityModule();
  }
  
  cleanup() {
    // 清理资源
  }
  
  async initCommunityModule() {
    // 初始化社区模块
    try {
      const communityModule = await import('../modules/community.js');
      if (communityModule && typeof communityModule.init === 'function') {
        await communityModule.init();
      }
    } catch (error) {
      console.error('社区模块初始化失败:', error);
      document.getElementById('community-container').innerHTML = 
        '<p>加载社区内容失败，请稍后重试。</p>';
    }
  }
}