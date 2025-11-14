import { getSupabase } from '../supabase.js';

// 统一API调用处理
class ApiClient {
    constructor() {
        this.supabase = getSupabase();
    }
    
    // 获取音乐列表
    async getMusicList(filters = {}) {
        try {
            let query = this.supabase
                .from('music')
                .select('*');
            
            // 应用过滤器
            if (filters.type) {
                query = query.eq('type', filters.type);
            }
            
            if (filters.language) {
                query = query.eq('language', filters.language);
            }
            
            if (filters.year) {
                query = query.eq('year', filters.year);
            }
            
            const { data, error } = await query.order('release_date', { ascending: false });
            
            if (error) throw error;
            
            return { success: true, data };
        } catch (error) {
            console.error('获取音乐列表失败:', error.message);
            return { success: false, error: error.message };
        }
    }
    
    // 获取视频列表
    async getVideosList(filters = {}) {
        try {
            let query = this.supabase
                .from('videos')
                .select('*');
            
            // 应用过滤器
            if (filters.type) {
                query = query.eq('type', filters.type);
            }
            
            if (filters.year) {
                query = query.eq('year', filters.year);
            }
            
            const { data, error } = await query.order('release_date', { ascending: false });
            
            if (error) throw error;
            
            return { success: true, data };
        } catch (error) {
            console.error('获取视频列表失败:', error.message);
            return { success: false, error: error.message };
        }
    }
    
    // 获取时间轴数据
    async getTimelineData(filters = {}) {
        try {
            let query = this.supabase
                .from('timeline')
                .select('*');
            
            if (filters.year) {
                query = query.eq('year', filters.year);
            }
            
            const { data, error } = await query.order('date', { ascending: true });
            
            if (error) throw error;
            
            return { success: true, data };
        } catch (error) {
            console.error('获取时间轴数据失败:', error.message);
            return { success: false, error: error.message };
        }
    }
    
    // 获取奖项数据
    async getAwardsData(filters = {}) {
        try {
            let query = this.supabase
                .from('awards')
                .select('*');
            
            if (filters.year) {
                query = query.eq('year', filters.year);
            }
            
            const { data, error } = await query.order('date', { ascending: false });
            
            if (error) throw error;
            
            return { success: true, data };
        } catch (error) {
            console.error('获取奖项数据失败:', error.message);
            return { success: false, error: error.message };
        }
    }
}

// 创建API客户端实例
const apiClient = new ApiClient();

// 导出API方法
export const api = {
    getMusicList: apiClient.getMusicList.bind(apiClient),
    getVideosList: apiClient.getVideosList.bind(apiClient),
    getTimelineData: apiClient.getTimelineData.bind(apiClient),
    getAwardsData: apiClient.getAwardsData.bind(apiClient)
};