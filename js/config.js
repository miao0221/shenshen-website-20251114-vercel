// 从环境变量获取Supabase配置
const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL || process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL;
const SUPABASE_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY;

// 导入Supabase客户端库
import { createClient } from '@supabase/supabase-js'

// 创建Supabase客户端实例
const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

// 初始化Supabase客户端
function initSupabase() {
    return supabase;
}

// 导出配置和初始化函数以及supabase实例
export { 
    SUPABASE_URL, 
    SUPABASE_KEY, 
    initSupabase,
    supabase
};