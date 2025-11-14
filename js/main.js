import { router } from './core/Router.js';
import { appState } from './core/AppState.js';
import { initializeAuth } from './modules/auth.js';
import { searchManager } from './modules/search.js';
import { eventBus } from './utils/EventBus.js';

// 初始化应用
document.addEventListener('DOMContentLoaded', async () => {
    console.log('初始化应用...');
    
    // 初始化认证模块
    await initializeAuth();
    
    // 初始化搜索管理器
    searchManager.init();
    
    // 检查认证状态
    checkAuthStatus();
});


// 加载页面内容
async function loadPage(pageName) {
    const app = document.getElementById('app');
    if (!app) return;
    
    // 更新应用状态
    appState.setCurrentPage(pageName);
    
    try {
        // 动态导入页面模块
        let pageModule;
        switch (pageName) {
            case 'home':
                const { default: HomePage } = await import('./pages/Home.js');
                pageModule = new HomePage();
                break;
            case 'music':
                const { default: MusicPage } = await import('./pages/Music.js');
                pageModule = new MusicPage();
                break;
            case 'video':
                const { default: VideoPage } = await import('./pages/Video.js');
                pageModule = new VideoPage();
                break;
            case 'timeline':
                const { default: TimelinePage } = await import('./pages/Timeline.js');
                pageModule = new TimelinePage();
                break;
            case 'login':
                const { default: LoginPage } = await import('./pages/Login.js');
                pageModule = new LoginPage();
                break;
            case 'register':
                const { default: RegisterPage } = await import('./pages/Register.js');
                pageModule = new RegisterPage();
                break;
            default:
                app.innerHTML = `
                    <section class="not-found">
                        <h1>页面建设中</h1>
                        <p>该页面正在建设中，敬请期待。</p>
                        <a href="/" class="btn" data-route="/">返回首页</a>
                    </section>
                `;
                return;
        }
        
        // 渲染页面
        app.innerHTML = await pageModule.render();
        
        // 执行页面渲染后操作
        await pageModule.afterRender();
        
        // 发布页面加载完成事件
        eventBus.emit('pageLoaded', pageName);
    } catch (error) {
        console.error('加载页面失败:', error);
        app.innerHTML = `
            <section class="error">
                <h1>加载失败</h1>
                <p>页面加载过程中出现错误，请稍后重试。</p>
                <button onclick="location.reload()" class="btn">重新加载</button>
            </section>
        `;
    }
}

// 检查认证状态
async function checkAuthStatus() {
    const authStatusDiv = document.getElementById('auth-status');
    if (!authStatusDiv) return;
    
    try {
        // 这里应该检查真实的认证状态
        const isLoggedIn = appState.isLoggedIn();
        if (isLoggedIn) {
            const user = appState.getUser();
            authStatusDiv.innerHTML = `<p>欢迎, ${user?.email}! <button id="logout-btn">退出</button></p>`;
            
            // 绑定退出按钮事件
            document.getElementById('logout-btn')?.addEventListener('click', async () => {
                // 执行退出逻辑
                eventBus.emit('userLogout');
            });
        } else {
            authStatusDiv.innerHTML = '<p>您尚未登录 <a href="/login" data-route="/login">点击登录</a></p>';
        }
    } catch (error) {
        console.error('检查认证状态失败:', error);
        authStatusDiv.innerHTML = '<p>认证状态检查失败</p>';
    }
}

// 监听用户登录事件
eventBus.on('userLogin', (user) => {
    appState.setUser(user);
    checkAuthStatus();
    
    // 如果用户在登录页登录成功，跳转到首页
    if (appState.getCurrentPage() === 'login') {
        router.navigate('/');
    }
});

// 监听用户退出事件
eventBus.on('userLogout', () => {
    appState.setUser(null);
    checkAuthStatus();
    router.navigate('/');
});

export { router, appState, eventBus };