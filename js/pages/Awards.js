export default class AwardsPage {
  constructor() {
    this.name = 'awards';
  }
  
  async render() {
    return `
      <section class="awards-section">
        <h1>周深获奖记录</h1>
        <p>这里收录了周深获得的主要奖项和荣誉。</p>
        
        <div id="awards-container">
          <p>正在加载获奖记录...</p>
        </div>
      </section>
    `;
  }
  
  async afterRender() {
    // 绑定页面事件
    await this.initAwardsModule();
  }
  
  cleanup() {
    // 清理资源
  }
  
  async initAwardsModule() {
    // 初始化奖项模块
    try {
      const awardsModule = await import('../modules/awards.js');
      if (awardsModule && typeof awardsModule.init === 'function') {
        await awardsModule.init();
      }
    } catch (error) {
      console.error('奖项模块初始化失败:', error);
      document.getElementById('awards-container').innerHTML = 
        '<p>加载获奖记录失败，请稍后重试。</p>';
    }
  }
}