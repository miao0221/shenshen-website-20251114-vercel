// API模块索引文件
export { default as supabase } from './supabaseClient.js';
export { musicApi } from './musicApi.js';
export { videoApi } from './videoApi.js';

export default {
  supabase,
  musicApi,
  videoApi
};