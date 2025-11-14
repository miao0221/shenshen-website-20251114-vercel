# 周深粉丝网站

这是一个展示周深音乐、视频和相关信息的网站。

## 环境变量配置

项目使用环境变量来存储敏感信息，如Supabase配置。在项目根目录创建`.env`文件并配置以下变量：

```
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

参考 [.env.example](file:///g:/code/shenshen-website-20251114-vercel/.env.example) 文件获取完整的环境变量配置示例。

## 安装和运行

1. 安装依赖:
   ```
   npm install
   ```

2. 启动开发服务器:
   ```
   npm run dev
   ```

3. 构建生产版本:
   ```
   npm run build
   ```

4. 预览生产版本:
   ```
   npm run preview
   ```