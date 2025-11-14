import { renderHomePage } from './pages/Home.js';
import MusicPage from './pages/Music.js';
import { renderVideosPage } from './pages/videos.js';
import { renderTimelinePage } from './pages/Timeline.js';
import { renderAwardsPage } from './pages/Awards.js';
import CommunityPage from './pages/Community.js';
import { renderBusinessPage } from './pages/Business.js';
import InterviewsPage from './pages/Interviews.js';
import ProfilePage from './pages/Profile.js';
import AdminPage from './pages/Admin.js';

// 路由配置
const routes = {
    '/': renderHomePage,
    '/music': MusicPage,
    '/videos': renderVideosPage,
    '/timeline': renderTimelinePage,
    '/awards': renderAwardsPage,
    '/community': CommunityPage,
    '/business': renderBusinessPage,
    '/interviews': InterviewsPage,
    '/profile': ProfilePage,
    '/admin': AdminPage
};

let currentPath = '/';

// 路由导航函数
export function navigateTo(path) {
    currentPath = path;
    history.pushState({}, '', path);
    renderPage();
}

// 渲染当前页面
async function renderPage() {
    const app = document.getElementById('app');
    const route = routes[currentPath] || routes['/'];
    
    // 添加过渡效果
    app.innerHTML = '<div class="page-transition">页面加载中...</div>';
    
    try {
        const pageContent = await route();
        app.innerHTML = `<div class="page-transition">${pageContent}</div>`;
        
        // 触发过渡动画
        setTimeout(() => {
            const transitionElement = document.querySelector('.page-transition');
            if (transitionElement) {
                transitionElement.classList.add('active');
            }
        }, 10);
        
        // 更新活动导航链接
        updateActiveNavLink();
    } catch (error) {
        console.error('页面渲染错误:', error);
        app.innerHTML = `
            <div class="container">
                <h1>页面加载失败</h1>
                <p>抱歉，加载页面时出现错误，请稍后重试。</p>
            </div>
        `;
    }
}

// 更新活动导航链接
function updateActiveNavLink() {
    // 移除所有活动类
    document.querySelectorAll('.nav-link').forEach(link => {
        link.classList.remove('active');
    });
    
    // 添加当前路径的活动类
    const activeLink = document.querySelector(`.nav-link[href="${currentPath}"]`);
    if (activeLink) {
        activeLink.classList.add('active');
    }
}

// 初始化路由系统
export function initRouter() {
    // 处理浏览器前进后退按钮
    window.addEventListener('popstate', () => {
        currentPath = location.pathname;
        renderPage();
    });
    
    // 处理导航链接点击事件
    document.addEventListener('click', (e) => {
        const navLink = e.target.closest('.nav-link');
        if (navLink) {
            e.preventDefault();
            const path = navLink.getAttribute('href');
            navigateTo(path);
        }
    });
    
    // 初始渲染
    currentPath = location.pathname;
    renderPage();
}