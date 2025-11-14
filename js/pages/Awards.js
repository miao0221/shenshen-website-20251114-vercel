/**
 * 奖项页面渲染函数
 */
export async function renderAwardsPage() {
    return `
        <div class="container">
            <section class="page-header">
                <h1>获奖记录</h1>
                <p>周深获得的各项荣誉和奖项</p>
            </section>
            
            <section class="filters-section">
                <div class="filter-group">
                    <label>年份:</label>
                    <select id="award-year-filter" onchange="filterAwards()">
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
            
            <section class="awards-list" id="awards-list">
                <div class="card">
                    <div class="card-content">
                        <h3 class="card-title">2023年度最佳男歌手奖</h3>
                        <p class="card-text">华语音乐传媒大奖</p>
                        <p class="card-text">获奖时间：2023年10月</p>
                    </div>
                </div>
                
                <div class="card">
                    <div class="card-content">
                        <h3 class="card-title">最受欢迎影视歌曲奖</h3>
                        <p class="card-text">《大鱼》获东方风云榜</p>
                        <p class="card-text">获奖时间：2017年</p>
                    </div>
                </div>
                
                <div class="card">
                    <div class="card-content">
                        <h3 class="card-title">年度最佳新人奖</h3>
                        <p class="card-text">全球华人歌曲排行榜</p>
                        <p class="card-text">获奖时间：2016年</p>
                    </div>
                </div>
            </section>
        </div>
    `;
}