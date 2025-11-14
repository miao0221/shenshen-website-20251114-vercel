// 路由配置
export const routes = [
  {
    path: '/',
    component: 'Home',
    title: '首页 - 周深粉丝网站',
    public: true
  },
  {
    path: '/music',
    component: 'Music', 
    title: '音乐作品 - 周深'
  },
  {
    path: '/video',
    component: 'Video',
    title: '视频 - 周深'
  },
  {
    path: '/timeline',
    component: 'Timeline',
    title: '时间轴 - 周深活动'
  },
  {
    path: '/awards',
    component: 'Awards',
    title: '奖项 - 周深'
  },
  {
    path: '/business',
    component: 'Business',
    title: '商务合作 - 周深'
  },
  {
    path: '/interviews',
    component: 'Interviews',
    title: '访谈 - 周深'
  },
  {
    path: '/fans',
    component: 'Fans',
    title: '粉丝广场 - 周深'
  },
  {
    path: '/community',
    component: 'Community',
    title: '社区 - 周深'
  },
  {
    path: '/profile',
    component: 'Profile',
    title: '个人资料 - 周深粉丝网站'
  },
  {
    path: '/admin',
    component: 'Admin',
    title: '管理后台 - 周深粉丝网站'
  },
  {
    path: '/login',
    component: 'Login',
    title: '登录',
    public: true
  },
  {
    path: '/register', 
    component: 'Register',
    title: '注册',
    public: true
  }
];

// 动态路由加载
export const loadPageComponent = async (componentName) => {
  try {
    const module = await import(`../pages/${componentName}.js`);
    return module.default;
  } catch (error) {
    console.error(`加载页面组件失败: ${componentName}`, error);
    // 返回一个默认的错误组件
    return class ErrorComponent {
      constructor() {
        this.name = 'error';
      }
      
      async render() {
        return `
          <div class="error-page">
            <h1>页面加载失败</h1>
            <p>无法加载页面组件: ${componentName}</p>
            <button onclick="window.location.reload()">重新加载</button>
          </div>
        `;
      }
      
      async afterRender() {}
      
      cleanup() {}
    };
  }
};

export default {
  routes,
  loadPageComponent
};