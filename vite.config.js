import { defineConfig } from 'vite';

export default defineConfig({
  // 配置根目录为当前目录
  root: './',
  
  // 构建配置
  build: {
    // 输出目录
    outDir: 'dist',
    
    // 静态资源目录
    assetsDir: 'assets',
    
    // 清空输出目录
    emptyOutDir: true,
    
    // 启用 sourcemap
    sourcemap: true,
    
    // 构建后是否生成 SSR manifest
    manifest: false,
    
    // 启用/禁用 CSS 代码拆分
    cssCodeSplit: true,
    
    // 构建后是否压缩
    minify: 'esbuild',
    
    // 是否启用 brotli 压缩大小报告
    brotliSize: false,
  },
  
  // 开发服务器配置
  server: {
    // 端口号
    port: 3000,
    
    // 启用 gzip 压缩
    compress: true,
    
    // 启用 host
    host: true,
    
    // 启用 https
    https: false,
    
    // 服务器启动时自动打开浏览器
    open: true,
  },
  
  // 预览配置
  preview: {
    port: 5000,
    host: true,
    open: true,
  },
  
  // 解析配置
  resolve: {
    // 路径别名
    alias: {
      // 可以添加路径别名以简化导入
    }
  }
});