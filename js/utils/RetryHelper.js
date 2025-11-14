// 错误重试机制工具
class RetryHelper {
  // 带重试机制的异步函数执行
  static async retry(fn, retries = 3, delay = 1000, backoff = 2) {
    let lastError;
    
    for (let i = 0; i <= retries; i++) {
      try {
        return await fn();
      } catch (error) {
        lastError = error;
        
        // 如果是最后一次重试，抛出错误
        if (i === retries) {
          throw lastError;
        }
        
        // 等待一段时间后重试
        await new Promise(resolve => setTimeout(resolve, delay));
        
        // 指数退避
        delay *= backoff;
      }
    }
  }
  
  // 带条件的重试机制
  static async retryIf(fn, condition, retries = 3, delay = 1000, backoff = 2) {
    let lastError;
    
    for (let i = 0; i <= retries; i++) {
      try {
        const result = await fn();
        
        // 检查是否满足重试条件
        if (!condition(result)) {
          return result;
        }
        
        lastError = new Error('Condition not met');
      } catch (error) {
        lastError = error;
      }
      
      // 如果是最后一次重试，抛出错误
      if (i === retries) {
        throw lastError;
      }
      
      // 等待一段时间后重试
      await new Promise(resolve => setTimeout(resolve, delay));
      
      // 指数退避
      delay *= backoff;
    }
  }
}

export { RetryHelper };
export default RetryHelper;