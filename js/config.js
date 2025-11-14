// Supabase配置
const SUPABASE_URL = 'https://hyvuqcxvqhzeoovqmekm.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imh5dnVxY3h2cWh6ZW9vdnFtZWttIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjMwNzEyNjAsImV4cCI6MjA3ODY0NzI2MH0.Mqd6KzhJCrf2anN79YseoQLjlRlRPOUHBpaLQRGrCEk';

// 创建Supabase客户端实例
let supabase = null;

// 初始化Supabase客户端
function initSupabase() {
    if (!supabase && typeof window !== 'undefined') {
        // 动态导入Supabase客户端库
        import('https://cdn.skypack.dev/@supabase/supabase-js')
            .then(({ createClient }) => {
                supabase = createClient(SUPABASE_URL, SUPABASE_KEY);
                window.supabase = supabase;
                console.log('Supabase客户端初始化成功');
            })
            .catch(error => {
                console.error('Supabase客户端初始化失败:', error);
            });
    }
    return supabase;
}

// 导出配置和初始化函数
export { 
    SUPABASE_URL, 
    SUPABASE_KEY, 
    initSupabase 
};