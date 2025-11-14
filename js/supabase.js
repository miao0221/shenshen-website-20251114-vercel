import { createClient } from '@supabase/supabase-js';

// Supabase配置
const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL || process.env.VITE_SUPABASE_URL || '';
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_ANON_KEY || '';

// 创建Supabase客户端实例
let supabase = null;

export function initializeSupabase() {
    if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
        console.warn('Supabase配置缺失，请检查环境变量设置');
        return null;
    }
    
    supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
    console.log('Supabase客户端初始化成功');
    return supabase;
}

// 获取Supabase客户端实例
export function getSupabase() {
    return supabase;
}