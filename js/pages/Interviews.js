export default class InterviewsPage {
  constructor() {
    this.name = 'interviews';
  }
  
  async render() {
    return `
      <section class="interviews-section">
        <h1>周深访谈</h1>
        <p>收录周深参与的各类访谈内容。</p>
        
        <div id="interviews-container">
          <p>正在加载访谈内容...</p>
        </div>
      </section>
    `;
  }
  
  async afterRender() {
    // 绑定页面事件
    await this.initInterviewsModule();
  }
  
  cleanup() {
    // 清理资源
  }
  
  async initInterviewsModule() {
    // 初始化访谈模块
    try {
      const interviewsModule = await import('../modules/interviews.js');
      if (interviewsModule && typeof interviewsModule.init === 'function') {
        await interviewsModule.init();
      }
    } catch (error) {
      console.error('访谈模块初始化失败:', error);
      document.getElementById('interviews-container').innerHTML = 
        '<p>加载访谈内容失败，请稍后重试。</p>';
    }
  }
}