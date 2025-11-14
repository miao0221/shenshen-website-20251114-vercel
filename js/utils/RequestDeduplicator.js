// 请求去重管理器
class RequestDeduplicator {
  constructor() {
    this.pendingRequests = new Map();
  }

  // 添加请求
  add(key, requestPromise) {
    this.pendingRequests.set(key, requestPromise);
  }

  // 获取正在进行的请求
  get(key) {
    return this.pendingRequests.get(key);
  }

  // 检查请求是否存在
  has(key) {
    return this.pendingRequests.has(key);
  }

  // 移除请求
  remove(key) {
    this.pendingRequests.delete(key);
  }

  // 清空所有请求
  clear() {
    this.pendingRequests.clear();
  }
}

// 创建并导出默认请求去重管理器实例
const requestDeduplicator = new RequestDeduplicator();

export { requestDeduplicator };
export default RequestDeduplicator;