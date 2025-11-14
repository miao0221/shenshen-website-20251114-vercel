export async function renderVideosPage() {
    return `
        <div class="container">
            <section class="page-header">
                <h1>视频作品</h1>
                <p>周深参与的所有视频内容</p>
            </section>
            
            <section class="filters-section">
                <div class="filter-group">
                    <label>类型:</label>
                    <select id="video-type-filter">
                        <option value="">全部类型</option>
                        <option value="official-mv">官方MV</option>
                        <option value="live">现场演出</option>
                        <option value="variety">综艺节目</option>
                        <option value="live-stream">直播内容</option>
                        <option value="behind-scenes">幕后花絮</option>
                    </select>
                </div>
                
                <div class="filter-group">
                    <label>年份:</label>
                    <select id="video-year-filter">
                        <option value="">全部年份</option>
                        <option value="2023">2023年</option>
                        <option value="2022">2022年</option>
                        <option value="2021">2021年</option>
                        <option value="2020">2020年</option>
                        <option value="2019">2019年</option>
                        <option value="2018">2018年</option>
                        <option value="2017">2017年</option>
                        <option value="2016">2016年</option>
                        <option value="2015">2015年</option>
                        <option value="2014">2014年</option>
                    </select>
                </div>
            </section>
            
            <section class="video-grid">
                <div class="card">
                    <img src="https://placehold.co/400x225" alt="视频封面" class="card-img">
                    <div class="card-content">
                        <h3 class="card-title">《大鱼》官方MV</h3>
                        <p class="card-text">周深代表作《大鱼》官方音乐视频</p>
                        <button class="btn btn-primary">观看</button>
                    </div>
                </div>
                
                <div class="card">
                    <img src="https://placehold.co/400x225" alt="视频封面" class="card-img">
                    <div class="card-content">
                        <h3 class="card-title">《光亮》现场版</h3>
                        <p class="card-text">周深在现场演唱的《光亮》</p>
                        <button class="btn btn-primary">观看</button>
                    </div>
                </div>
                
                <div class="card">
                    <img src="https://placehold.co/400x225" alt="视频封面" class="card-img">
                    <div class="card-content">
                        <h3 class="card-title">《起风了》演唱会</h3>
                        <p class="card-text">周深在演唱会中演唱的《起风了》</p>
                        <button class="btn btn-primary">观看</button>
                    </div>
                </div>
            </section>
            
            <div class="pagination">
                <button class="pagination-btn active">1</button>
                <button class="pagination-btn">2</button>
                <button class="pagination-btn">3</button>
                <button class="pagination-btn">下一页</button>
            </div>
        </div>
    `;
}