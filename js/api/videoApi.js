import { supabase } from './supabaseClient.js';

// 数据缓存
const videoCache = new Map();
const cacheTimeout = 5 * 60 * 1000; // 5分钟缓存

// 请求去重
const pendingRequests = new Map();

class VideoApi {
  // 获取所有视频数据
  async getAllVideos() {
    const cacheKey = 'all_videos';
    
    // 检查缓存
    if (videoCache.has(cacheKey)) {
      const cached = videoCache.get(cacheKey);
      if (Date.now() - cached.timestamp < cacheTimeout) {
        return cached.data;
      }
    }
    
    // 检查是否有正在进行的相同请求
    if (pendingRequests.has(cacheKey)) {
      return pendingRequests.get(cacheKey);
    }
    
    // 执行请求
    const request = this._fetchVideoData()
      .then(data => {
        // 缓存数据
        videoCache.set(cacheKey, {
          data,
          timestamp: Date.now()
        });
        return data;
      })
      .finally(() => {
        // 清除请求记录
        pendingRequests.delete(cacheKey);
      });
    
    // 记录正在进行的请求
    pendingRequests.set(cacheKey, request);
    
    return request;
  }
  
  // 获取视频数据（内部方法）
  async _fetchVideoData() {
    try {
      const { data, error } = await supabase
        .from('videos')
        .select('*')
        .order('publish_date', { ascending: false });
      
      if (error) {
        throw new Error(`获取视频数据失败: ${error.message}`);
      }
      
      return data || [];
    } catch (error) {
      console.error('视频数据获取错误:', error);
      // 返回空数组作为降级处理
      return [];
    }
  }
  
  // 根据ID获取特定视频
  async getVideoById(id) {
    const cacheKey = `video_${id}`;
    
    // 检查缓存
    if (videoCache.has(cacheKey)) {
      const cached = videoCache.get(cacheKey);
      if (Date.now() - cached.timestamp < cacheTimeout) {
        return cached.data;
      }
    }
    
    // 检查是否有正在进行的相同请求
    if (pendingRequests.has(cacheKey)) {
      return pendingRequests.get(cacheKey);
    }
    
    // 执行请求
    const request = this._fetchVideoById(id)
      .then(data => {
        // 缓存数据
        videoCache.set(cacheKey, {
          data,
          timestamp: Date.now()
        });
        return data;
      })
      .finally(() => {
        // 清除请求记录
        pendingRequests.delete(cacheKey);
      });
    
    // 记录正在进行的请求
    pendingRequests.set(cacheKey, request);
    
    return request;
  }
  
  // 根据ID获取视频（内部方法）
  async _fetchVideoById(id) {
    try {
      const { data, error } = await supabase
        .from('videos')
        .select('*')
        .eq('id', id)
        .single();
      
      if (error) {
        throw new Error(`获取视频详情失败: ${error.message}`);
      }
      
      return data;
    } catch (error) {
      console.error('视频详情获取错误:', error);
      return null;
    }
  }
  
  // 根据条件搜索视频
  async searchVideos(filters = {}) {
    const cacheKey = `video_search_${JSON.stringify(filters)}`;
    
    // 检查缓存
    if (videoCache.has(cacheKey)) {
      const cached = videoCache.get(cacheKey);
      if (Date.now() - cached.timestamp < cacheTimeout) {
        return cached.data;
      }
    }
    
    // 检查是否有正在进行的相同请求
    if (pendingRequests.has(cacheKey)) {
      return pendingRequests.get(cacheKey);
    }
    
    // 执行请求
    const request = this._searchVideoData(filters)
      .then(data => {
        // 缓存数据
        videoCache.set(cacheKey, {
          data,
          timestamp: Date.now()
        });
        return data;
      })
      .finally(() => {
        // 清除请求记录
        pendingRequests.delete(cacheKey);
      });
    
    // 记录正在进行的请求
    pendingRequests.set(cacheKey, request);
    
    return request;
  }
  
  // 搜索视频数据（内部方法）
  async _searchVideoData(filters) {
    try {
      let query = supabase
        .from('videos')
        .select('*');
      
      // 应用筛选条件
      if (filters.category) {
        query = query.eq('category', filters.category);
      }
      
      if (filters.search) {
        query = query.ilike('title', `%${filters.search}%`);
      }
      
      query = query.order('publish_date', { ascending: false });
      
      const { data, error } = await query;
      
      if (error) {
        throw new Error(`搜索视频失败: ${error.message}`);
      }
      
      return data || [];
    } catch (error) {
      console.error('视频搜索错误:', error);
      return [];
    }
  }
  
  // 清除缓存
  clearCache() {
    videoCache.clear();
  }
}

// 创建并导出视频API实例
const videoApi = new VideoApi();

export { videoApi };
export default VideoApi;