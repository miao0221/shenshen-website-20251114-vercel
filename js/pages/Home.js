export async function renderHomePage() {
    return `
        <div class="container">
            <section class="hero-section">
                <h1>欢迎来到周深粉丝网站</h1>
                <p>这里是周深粉丝的聚集地，收录了周深的音乐作品、视频、获奖记录等全方位信息</p>
                <div class="hero-buttons">
                    <button class="btn btn-primary" onclick="location.hash = '#/music'">浏览音乐</button>
                    <button class="btn btn-secondary" onclick="location.hash = '#/videos'">观看视频</button>
                </div>
            </section>
            
            <section class="featured-section">
                <h2>热门推荐</h2>
                <div class="cards-grid">
                    <div class="card">
                        <div class="card-content">
                            <h3 class="card-title">最新音乐</h3>
                            <p class="card-text">探索周深最新发布的音乐作品</p>
                            <button class="btn btn-primary" onclick="location.hash = '#/music'">查看更多</button>
                        </div>
                    </div>
                    
                    <div class="card">
                        <div class="card-content">
                            <h3 class="card-title">精彩视频</h3>
                            <p class="card-text">欣赏周深的各类视频内容</p>
                            <button class="btn btn-primary" onclick="location.hash = '#/videos'">查看更多</button>
                        </div>
                    </div>
                    
                    <div class="card">
                        <div class="card-content">
                            <h3 class="card-title">近期活动</h3>
                            <p class="card-text">了解周深最新的行程安排</p>
                            <button class="btn btn-primary" onclick="location.hash = '#/timeline'">查看更多</button>
                        </div>
                    </div>
                </div>
            </section>
            
            <section class="stats-section">
                <h2>数据统计</h2>
                <div class="stats-grid">
                    <div class="stat-card">
                        <h3>100+</h3>
                        <p>首歌曲</p>
                    </div>
                    <div class="stat-card">
                        <h3>200+</h3>
                        <p>部视频</p>
                    </div>
                    <div class="stat-card">
                        <h3>50+</h3>
                        <p>项奖项</p>
                    </div>
                    <div class="stat-card">
                        <h3>10+</h3>
                        <p>年演艺经历</p>
                    </div>
                </div>
            </section>
        </div>
    `;
}