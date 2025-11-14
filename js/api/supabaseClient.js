import { createClient } from '@supabase/supabase-js';

// 从环境变量获取配置
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY;

// 检查配置是否存在
if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Supabase配置缺失，请检查环境变量设置');
}

// 创建Supabase客户端实例
export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export default supabase;