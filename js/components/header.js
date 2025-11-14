export function loadComponent() {
    const headerHTML = `
        <header class="header">
            <div class="container navbar">
                <div class="logo">周深粉丝网</div>
                <div class="search-container">
                    <input type="text" class="search-input" placeholder="搜索音乐、视频、采访..." id="global-search">
                </div>
                <nav>
                    <ul class="nav-links">
                        <li><a href="/" class="nav-link">首页</a></li>
                        <li><a href="/music" class="nav-link">音乐</a></li>
                        <li><a href="/videos" class="nav-link">视频</a></li>
                        <li><a href="/timeline" class="nav-link">时间轴</a></li>
                        <li><a href="/awards" class="nav-link">奖项</a></li>
                        <li><a href="/community" class="nav-link">粉丝广场</a></li>
                        <li><a href="/business" class="nav-link">商务</a></li>
                        <li><a href="/interviews" class="nav-link">采访</a></li>
                        <li><a href="/profile" class="nav-link">我的</a></li>
                    </ul>
                </nav>
            </div>
        </header>
    `;
    
    // 将头部插入到应用容器之前
    const app = document.getElementById('app');
    app.insertAdjacentHTML('beforebegin', headerHTML);
    
    // 添加搜索功能
    const searchInput = document.getElementById('global-search');
    if (searchInput) {
        searchInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                const query = e.target.value.trim();
                if (query) {
                    // 这里应该触发搜索功能
                    console.log('搜索:', query);
                }
            }
        });
    }
    
    return Promise.resolve();
}