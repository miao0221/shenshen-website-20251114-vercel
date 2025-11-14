export default class BusinessPage {
  constructor() {
    this.name = 'business';
  }
  
  async render() {
    return `
      <section class="business-section">
        <h1>商务合作</h1>
        <p>了解周深的商务合作信息。</p>
        
        <div id="business-container">
          <p>正在加载商务合作信息...</p>
        </div>
      </section>
    `;
  }
  
  async afterRender() {
    // 绑定页面事件
    await this.initBusinessModule();
  }
  
  cleanup() {
    // 清理资源
  }
  
  async initBusinessModule() {
    // 初始化商务合作模块
    try {
      const businessModule = await import('../modules/business.js');
      if (businessModule && typeof businessModule.init === 'function') {
        await businessModule.init();
      }
    } catch (error) {
      console.error('商务合作模块初始化失败:', error);
      document.getElementById('business-container').innerHTML = 
        '<p>加载商务合作信息失败，请稍后重试。</p>';
    }
  }
}