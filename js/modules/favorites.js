import { getSupabase } from '../supabase.js';

// 添加收藏
export async function addToFavorites(itemId, itemType, userId) {
    try {
        const supabase = getSupabase();
        if (!supabase) {
            throw new Error('Supabase客户端未初始化');
        }
        
        const { data, error } = await supabase
            .from('favorites')
            .insert([
                {
                    item_id: itemId,
                    item_type: itemType,
                    user_id: userId
                }
            ])
            .select();
        
        if (error) {
            throw error;
        }
        
        return { success: true, data };
    } catch (error) {
        console.error('添加收藏失败:', error.message);
        return { success: false, error: error.message };
    }
}

// 移除收藏
export async function removeFromFavorites(itemId, itemType, userId) {
    try {
        const supabase = getSupabase();
        if (!supabase) {
            throw new Error('Supabase客户端未初始化');
        }
        
        const { error } = await supabase
            .from('favorites')
            .delete()
            .eq('item_id', itemId)
            .eq('item_type', itemType)
            .eq('user_id', userId);
        
        if (error) {
            throw error;
        }
        
        return { success: true };
    } catch (error) {
        console.error('移除收藏失败:', error.message);
        return { success: false, error: error.message };
    }
}

// 获取用户收藏
export async function getUserFavorites(userId) {
    try {
        const supabase = getSupabase();
        if (!supabase) {
            throw new Error('Supabase客户端未初始化');
        }
        
        const { data, error } = await supabase
            .from('favorites')
            .select('*')
            .eq('user_id', userId);
        
        if (error) {
            throw error;
        }
        
        return { success: true, data };
    } catch (error) {
        console.error('获取收藏失败:', error.message);
        return { success: false, error: error.message };
    }
}

// 检查是否已收藏
export async function isFavorite(itemId, itemType, userId) {
    try {
        const supabase = getSupabase();
        if (!supabase) {
            throw new Error('Supabase客户端未初始化');
        }
        
        const { data, error } = await supabase
            .from('favorites')
            .select('id')
            .eq('item_id', itemId)
            .eq('item_type', itemType)
            .eq('user_id', userId)
            .limit(1);
        
        if (error) {
            throw error;
        }
        
        return { success: true, isFavorite: data.length > 0 };
    } catch (error) {
        console.error('检查收藏状态失败:', error.message);
        return { success: false, error: error.message };
    }
}