// 紧急关闭搜索框函数
function emergencyCloseSearch() {
  // 尝试所有可能的搜索框选择器
  const searchSelectors = [
    '.search-overlay',
    '.search-modal', 
    '.search-popup',
    '.search-container',
    '[class*="search"]',
    '.modal',
    '.popup',
    '.overlay',
    '[class*="modal"]',
    '[class*="overlay"]',
    '[class*="popup"]',
    '.fixed-overlay'
  ];
  
  searchSelectors.forEach(selector => {
    const elements = document.querySelectorAll(selector);
    elements.forEach(el => {
      el.style.display = 'none';
      el.style.visibility = 'hidden';
      el.style.opacity = '0';
    });
  });
  
  // 特别处理body的overflow属性，确保页面可以滚动
  document.body.style.overflow = 'auto';
}

// 立即执行
document.addEventListener('DOMContentLoaded', emergencyCloseSearch);
window.addEventListener('load', emergencyCloseSearch);

// 也添加到全局窗口对象，方便手动调用
window.closeAllSearch = emergencyCloseSearch;

// 定期检查并关闭可能意外出现的遮挡层
setInterval(emergencyCloseSearch, 1000);