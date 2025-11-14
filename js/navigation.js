// 导航处理模块
import { searchManager } from './modules/search.js';

class NavigationManager {
    constructor() {
        this.currentPath = window.location.pathname.split('/').pop() || 'index.html';
        this.init();
    }

    init() {
        document.addEventListener('DOMContentLoaded', () => {
            this.highlightActiveLink();
            this.setupMobileMenu();
        });
    }

    // 高亮当前页面链接
    highlightActiveLink() {
        const navLinks = document.querySelectorAll('.nav-link');
        
        navLinks.forEach(link => {
            // 获取链接的文件名部分
            const linkPath = link.getAttribute('href').split('/').pop();
            
            // 如果链接匹配当前页面，则添加active类
            if (linkPath === this.currentPath) {
                link.classList.add('active');
            }
        });
    }

    // 移动端菜单处理
    setupMobileMenu() {
        // 这里可以添加移动端菜单的处理逻辑
        // 例如汉堡菜单的展开和收起
    }

    // 页面跳转函数
    navigateTo(page) {
        window.location.href = page;
    }
}

// 创建并导出导航管理器实例
const navigationManager = new NavigationManager();

export { navigationManager };
export default NavigationManager;