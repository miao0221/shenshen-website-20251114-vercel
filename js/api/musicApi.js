import { supabase } from './supabaseClient.js';

// 数据缓存
const musicCache = new Map();
const cacheTimeout = 5 * 60 * 1000; // 5分钟缓存

// 请求去重
const pendingRequests = new Map();

class MusicApi {
  // 获取所有音乐数据
  async getAllMusic() {
    const cacheKey = 'all_music';
    
    // 检查缓存
    if (musicCache.has(cacheKey)) {
      const cached = musicCache.get(cacheKey);
      if (Date.now() - cached.timestamp < cacheTimeout) {
        return cached.data;
      }
    }
    
    // 检查是否有正在进行的相同请求
    if (pendingRequests.has(cacheKey)) {
      return pendingRequests.get(cacheKey);
    }
    
    // 执行请求
    const request = this._fetchMusicData()
      .then(data => {
        // 缓存数据
        musicCache.set(cacheKey, {
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
  
  // 获取音乐数据（内部方法）
  async _fetchMusicData() {
    try {
      const { data, error } = await supabase
        .from('music')
        .select('*')
        .order('release_date', { ascending: false });
      
      if (error) {
        throw new Error(`获取音乐数据失败: ${error.message}`);
      }
      
      return data || [];
    } catch (error) {
      console.error('音乐数据获取错误:', error);
      // 返回空数组作为降级处理
      return [];
    }
  }
  
  // 根据ID获取特定音乐
  async getMusicById(id) {
    const cacheKey = `music_${id}`;
    
    // 检查缓存
    if (musicCache.has(cacheKey)) {
      const cached = musicCache.get(cacheKey);
      if (Date.now() - cached.timestamp < cacheTimeout) {
        return cached.data;
      }
    }
    
    // 检查是否有正在进行的相同请求
    if (pendingRequests.has(cacheKey)) {
      return pendingRequests.get(cacheKey);
    }
    
    // 执行请求
    const request = this._fetchMusicById(id)
      .then(data => {
        // 缓存数据
        musicCache.set(cacheKey, {
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
  
  // 根据ID获取音乐（内部方法）
  async _fetchMusicById(id) {
    try {
      const { data, error } = await supabase
        .from('music')
        .select('*')
        .eq('id', id)
        .single();
      
      if (error) {
        throw new Error(`获取音乐详情失败: ${error.message}`);
      }
      
      return data;
    } catch (error) {
      console.error('音乐详情获取错误:', error);
      return null;
    }
  }
  
  // 根据条件搜索音乐
  async searchMusic(filters = {}) {
    const cacheKey = `search_${JSON.stringify(filters)}`;
    
    // 检查缓存
    if (musicCache.has(cacheKey)) {
      const cached = musicCache.get(cacheKey);
      if (Date.now() - cached.timestamp < cacheTimeout) {
        return cached.data;
      }
    }
    
    // 检查是否有正在进行的相同请求
    if (pendingRequests.has(cacheKey)) {
      return pendingRequests.get(cacheKey);
    }
    
    // 执行请求
    const request = this._searchMusicData(filters)
      .then(data => {
        // 缓存数据
        musicCache.set(cacheKey, {
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
  
  // 搜索音乐数据（内部方法）
  async _searchMusicData(filters) {
    try {
      let query = supabase
        .from('music')
        .select('*');
      
      // 应用筛选条件
      if (filters.year) {
        query = query.eq('year', filters.year);
      }
      
      if (filters.language) {
        query = query.eq('language', filters.language);
      }
      
      if (filters.search) {
        query = query.ilike('title', `%${filters.search}%`);
      }
      
      query = query.order('release_date', { ascending: false });
      
      const { data, error } = await query;
      
      if (error) {
        throw new Error(`搜索音乐失败: ${error.message}`);
      }
      
      return data || [];
    } catch (error) {
      console.error('音乐搜索错误:', error);
      return [];
    }
  }
  
  // 获取年份筛选选项
  async getYears() {
    const cacheKey = 'music_years';
    
    // 检查缓存
    if (musicCache.has(cacheKey)) {
      const cached = musicCache.get(cacheKey);
      if (Date.now() - cached.timestamp < cacheTimeout) {
        return cached.data;
      }
    }
    
    // 检查是否有正在进行的相同请求
    if (pendingRequests.has(cacheKey)) {
      return pendingRequests.get(cacheKey);
    }
    
    // 执行请求
    const request = this._fetchYears()
      .then(data => {
        // 缓存数据
        musicCache.set(cacheKey, {
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
  
  // 获取年份数据（内部方法）
  async _fetchYears() {
    try {
      const { data, error } = await supabase
        .from('music')
        .select('year')
        .order('year', { ascending: false });
      
      if (error) {
        throw new Error(`获取年份数据失败: ${error.message}`);
      }
      
      // 提取唯一年份并排序
      const years = [...new Set(data.map(item => item.year))].filter(Boolean);
      return years;
    } catch (error) {
      console.error('年份数据获取错误:', error);
      return [];
    }
  }
  
  // 清除缓存
  clearCache() {
    musicCache.clear();
  }
}

// 创建并导出音乐API实例
const musicApi = new MusicApi();

export { musicApi };
export default MusicApi;