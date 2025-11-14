// 数据缓存管理器
class CacheManager {
  constructor(defaultTimeout = 5 * 60 * 1000) {
    this.cache = new Map();
    this.defaultTimeout = defaultTimeout;
  }

  // 设置缓存
  set(key, data, timeout = this.defaultTimeout) {
    const item = {
      data,
      timestamp: Date.now(),
      timeout
    };
    this.cache.set(key, item);
  }

  // 获取缓存
  get(key) {
    if (!this.cache.has(key)) {
      return null;
    }

    const item = this.cache.get(key);
    const age = Date.now() - item.timestamp;

    // 检查是否过期
    if (age > item.timeout) {
      this.cache.delete(key);
      return null;
    }

    return item.data;
  }

  // 检查缓存是否存在且未过期
  has(key) {
    if (!this.cache.has(key)) {
      return false;
    }

    const item = this.cache.get(key);
    const age = Date.now() - item.timestamp;

    if (age > item.timeout) {
      this.cache.delete(key);
      return false;
    }

    return true;
  }

  // 删除缓存
  delete(key) {
    this.cache.delete(key);
  }

  // 清空缓存
  clear() {
    this.cache.clear();
  }

  // 获取缓存项数量
  size() {
    return this.cache.size;
  }
}

// 创建并导出默认缓存管理器实例
const cacheManager = new CacheManager();

export { cacheManager };
export default CacheManager;