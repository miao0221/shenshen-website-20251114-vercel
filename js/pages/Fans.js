export default class FansPage {
  constructor() {
    this.name = 'fans';
  }
  
  async render() {
    return `
      <section class="fans-section">
        <h1>粉丝广场</h1>
        <p>周深粉丝的聚集地。</p>
        
        <div id="fans-container">
          <p>正在加载粉丝广场内容...</p>
        </div>
      </section>
    `;
  }
  
  async afterRender() {
    // 绑定页面事件
    await this.initFansModule();
  }
  
  cleanup() {
    // 清理资源
  }
  
  async initFansModule() {
    // 初始化粉丝模块
    try {
      const fansModule = await import('../modules/fans.js');
      if (fansModule && typeof fansModule.init === 'function') {
        await fansModule.init();
      }
    } catch (error) {
      console.error('粉丝模块初始化失败:', error);
      document.getElementById('fans-container').innerHTML = 
        '<p>加载粉丝广场内容失败，请稍后重试。</p>';
    }
  }
}