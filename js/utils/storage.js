// 设置本地存储
export function setStorage(key, value) {
    try {
        localStorage.setItem(key, JSON.stringify(value));
        return { success: true };
    } catch (error) {
        console.error('设置本地存储失败:', error);
        return { success: false, error: error.message };
    }
}

// 获取本地存储
export function getStorage(key, defaultValue = null) {
    try {
        const item = localStorage.getItem(key);
        return item ? JSON.parse(item) : defaultValue;
    } catch (error) {
        console.error('获取本地存储失败:', error);
        return defaultValue;
    }
}

// 移除本地存储
export function removeStorage(key) {
    try {
        localStorage.removeItem(key);
        return { success: true };
    } catch (error) {
        console.error('移除本地存储失败:', error);
        return { success: false, error: error.message };
    }
}

// 清空本地存储
export function clearStorage() {
    try {
        localStorage.clear();
        return { success: true };
    } catch (error) {
        console.error('清空本地存储失败:', error);
        return { success: false, error: error.message };
    }
}

// 设置会话存储
export function setSession(key, value) {
    try {
        sessionStorage.setItem(key, JSON.stringify(value));
        return { success: true };
    } catch (error) {
        console.error('设置会话存储失败:', error);
        return { success: false, error: error.message };
    }
}

// 获取会话存储
export function getSession(key, defaultValue = null) {
    try {
        const item = sessionStorage.getItem(key);
        return item ? JSON.parse(item) : defaultValue;
    } catch (error) {
        console.error('获取会话存储失败:', error);
        return defaultValue;
    }
}

// 移除会话存储
export function removeSession(key) {
    try {
        sessionStorage.removeItem(key);
        return { success: true };
    } catch (error) {
        console.error('移除会话存储失败:', error);
        return { success: false, error: error.message };
    }
}