export default class InterviewsPage {
  constructor() {
    this.name = 'interviews';
  }
  
  async render() {
    return `
        <div class="container">
            <section class="page-header">
                <h1>采访合集</h1>
                <p>周深接受的各类媒体采访</p>
            </section>
            
            <section class="filters-section">
                <div class="filter-group">
                    <label>年份:</label>
                    <select id="interview-year-filter">
                        <option value="">全部年份</option>
                        <option value="2023">2023年</option>
                        <option value="2022">2022年</option>
                        <option value="2021">2021年</option>
                        <option value="2020">2020年</option>
                        <option value="2019">2019年</option>
                        <option value="2018">2018年</option>
                        <option value="2017">2017年</option>
                        <option value="2016">2016年</option>
                        <option value="2015">2015年</option>
                        <option value="2014">2014年</option>
                    </select>
                </div>
            </section>
            
            <section class="interviews-list">
                <div class="card">
                    <div class="card-content">
                        <h3 class="card-title">《音乐周刊》专访</h3>
                        <p class="card-text">周深谈新专辑创作背后的故事</p>
                        <p class="card-text">发布时间：2023-09-20</p>
                        <button class="btn btn-primary">查看详情</button>
                    </div>
                </div>
                
                <div class="card">
                    <div class="card-content">
                        <h3 class="card-title">某综艺节目访谈</h3>
                        <p class="card-text">周深分享音乐道路上的心路历程</p>
                        <p class="card-text">发布时间：2023-08-15</p>
                        <button class="btn btn-primary">查看详情</button>
                    </div>
                </div>
                
                <div class="card">
                    <div class="card-content">
                        <h3 class="card-title">《时尚先生》杂志专访</h3>
                        <p class="card-text">周深谈时尚与音乐的结合</p>
                        <p class="card-text">发布时间：2023-07-10</p>
                        <button class="btn btn-primary">查看详情</button>
                    </div>
                </div>
            </section>
        </div>
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
    }
  }
}