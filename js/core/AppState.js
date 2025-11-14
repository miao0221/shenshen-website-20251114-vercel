// 应用状态管理
class AppState {
    constructor() {
        this.state = {
            user: null,
            isLoggedIn: false,
            currentPage: '/',
            globalData: {}
        };
        
        this.listeners = {};
    }

    // 获取状态
    getState() {
        return { ...this.state };
    }

    // 更新用户状态
    setUser(user) {
        this.state.user = user;
        this.state.isLoggedIn = !!user;
        this.notify('user');
    }

    // 获取用户信息
    getUser() {
        return this.state.user;
    }

    // 检查是否已登录
    isLoggedIn() {
        return this.state.isLoggedIn;
    }

    // 更新当前页面
    setCurrentPage(page) {
        this.state.currentPage = page;
        this.notify('page');
    }

    // 获取当前页面
    getCurrentPage() {
        return this.state.currentPage;
    }

    // 更新全局数据
    setGlobalData(key, data) {
        this.state.globalData[key] = data;
        this.notify('globalData', key);
    }

    // 获取全局数据
    getGlobalData(key) {
        return this.state.globalData[key];
    }

    // 订阅状态变化
    subscribe(key, callback) {
        if (!this.listeners[key]) {
            this.listeners[key] = [];
        }
        this.listeners[key].push(callback);
    }

    // 取消订阅
    unsubscribe(key, callback) {
        if (this.listeners[key]) {
            this.listeners[key] = this.listeners[key].filter(cb => cb !== callback);
        }
    }

    // 通知监听器
    notify(key, subKey = null) {
        if (this.listeners[key]) {
            this.listeners[key].forEach(callback => {
                callback(this.state[key], subKey);
            });
        }
    }

    // 清除状态
    clear() {
        this.state = {
            user: null,
            isLoggedIn: false,
            currentPage: '/',
            globalData: {}
        };
        this.notify('all');
    }
}

// 创建并导出应用状态实例
const appState = new AppState();

export { appState };
export default AppState;