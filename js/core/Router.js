import { routes, loadPageComponent } from '../config/routes.js';
import { appState } from './AppState.js';

// 核心路由系统
class Router {
    constructor() {
        this.routes = {};
        this.routeConfig = routes;
        this.currentRoute = null;
        this.init();
    }

    init() {
        // 注册所有路由
        this.registerRoutes();
        
        // 监听浏览器前进后退按钮
        window.addEventListener('popstate', (e) => {
            this.navigate(e.state?.route || '/', false);
        });

        // 监听点击导航链接事件
        document.addEventListener('click', (e) => {
            const navLink = e.target.closest('[data-route]');
            if (navLink) {
                e.preventDefault();
                const route = navLink.getAttribute('data-route');
                this.navigate(route);
            }
        });

        // 初始路由
        const initialRoute = window.location.pathname;
        this.navigate(initialRoute, false);
    }

    // 注册所有路由
    registerRoutes() {
        this.routeConfig.forEach(route => {
            this.routes[route.path] = route;
        });
    }

    // 导航到指定路由
    async navigate(path, pushState = true) {
        // 查找匹配的路由
        const route = this.routes[path] || this.routes['/404'] || this.routes['/'];
        
        // 路由守卫
        if (!await this.canAccessRoute(route)) {
            // 如果无法访问且不是公共路由，并且当前路径不是登录页，则重定向到登录页
            if (!route.public && path !== '/login') {
                this.navigate('/login', pushState);
                return;
            }
        }

        if (route) {
            // 更新页面标题
            document.title = route.title || '周深粉丝网站';
            
            // 更新当前路由
            this.currentRoute = path;
            
            // 加载并渲染页面组件
            await this.loadAndRenderComponent(route.component);
            
            // 更新浏览器历史记录
            if (pushState) {
                history.pushState({ route: path }, route.title, path);
            }
            
            // 更新导航链接的激活状态
            this.updateActiveLinks(path);
        }
    }

    // 加载并渲染组件
    async loadAndRenderComponent(componentName) {
        const app = document.getElementById('app');
        if (!app) return;

        try {
            // 动态加载组件
            const ComponentClass = await loadPageComponent(componentName);
            const componentInstance = new ComponentClass();
            
            // 清理前一个组件
            if (this.currentComponent && typeof this.currentComponent.cleanup === 'function') {
                this.currentComponent.cleanup();
            }
            
            // 保存当前组件实例
            this.currentComponent = componentInstance;
            
            // 渲染组件
            app.innerHTML = await componentInstance.render();
            
            // 执行渲染后操作
            await componentInstance.afterRender();
            
        } catch (error) {
            console.error('组件加载和渲染失败:', error);
            app.innerHTML = `
                <div class="error-page">
                    <h1>页面加载失败</h1>
                    <p>加载页面时发生错误，请稍后重试。</p>
                    <button onclick="window.location.reload()">重新加载</button>
                </div>
            `;
        }
    }

    // 路由守卫 - 检查是否可以访问路由
    async canAccessRoute(route) {
        // 如果是公共路由，直接允许访问
        if (route.public) {
            return true;
        }
        
        // 检查用户是否已登录
        const isLoggedIn = appState.isLoggedIn();
        return isLoggedIn;
    }

    // 更新导航链接的激活状态
    updateActiveLinks(activePath) {
        const links = document.querySelectorAll('[data-route]');
        links.forEach(link => {
            const route = link.getAttribute('data-route');
            if (route === activePath) {
                link.classList.add('active');
            } else {
                link.classList.remove('active');
            }
        });
    }

    // 获取当前路由
    getCurrentRoute() {
        return this.currentRoute;
    }
    
    // 获取当前路由配置
    getCurrentRouteConfig() {
        return this.routes[this.currentRoute];
    }
}

// 创建并导出路由实例
export const router = new Router();

export default Router;