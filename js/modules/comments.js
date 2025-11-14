import { getSupabase } from '../supabase.js';

// 获取评论
export async function getComments(itemId, itemType) {
    try {
        const supabase = getSupabase();
        if (!supabase) {
            throw new Error('Supabase客户端未初始化');
        }
        
        const { data, error } = await supabase
            .from('comments')
            .select('*')
            .eq('item_id', itemId)
            .eq('item_type', itemType)
            .order('created_at', { ascending: false });
        
        if (error) {
            throw error;
        }
        
        return { success: true, data };
    } catch (error) {
        console.error('获取评论失败:', error.message);
        return { success: false, error: error.message };
    }
}

// 添加评论
export async function addComment(itemId, itemType, content, userId) {
    try {
        const supabase = getSupabase();
        if (!supabase) {
            throw new Error('Supabase客户端未初始化');
        }
        
        const { data, error } = await supabase
            .from('comments')
            .insert([
                {
                    item_id: itemId,
                    item_type: itemType,
                    content: content,
                    user_id: userId
                }
            ])
            .select();
        
        if (error) {
            throw error;
        }
        
        return { success: true, data };
    } catch (error) {
        console.error('添加评论失败:', error.message);
        return { success: false, error: error.message };
    }
}

// 删除评论
export async function deleteComment(commentId, userId) {
    try {
        const supabase = getSupabase();
        if (!supabase) {
            throw new Error('Supabase客户端未初始化');
        }
        
        const { error } = await supabase
            .from('comments')
            .delete()
            .eq('id', commentId)
            .eq('user_id', userId);
        
        if (error) {
            throw error;
        }
        
        return { success: true };
    } catch (error) {
        console.error('删除评论失败:', error.message);
        return { success: false, error: error.message };
    }
}