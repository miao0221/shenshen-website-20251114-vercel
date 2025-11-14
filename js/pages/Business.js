export async function renderBusinessPage() {
    return `
        <div class="container">
            <section class="page-header">
                <h1>商务合作</h1>
                <p>周深的商务合作信息</p>
            </section>
            
            <section class="business-info">
                <div class="card">
                    <div class="card-content">
                        <h3 class="card-title">商务合作联系</h3>
                        <p class="card-text">如果您有商务合作需求，请通过以下方式联系我们：</p>
                        <ul>
                            <li>邮箱：business@zhoushen.com</li>
                            <li>电话：+86 123 4567 8901</li>
                            <li>地址：北京市朝阳区某某大厦</li>
                        </ul>
                    </div>
                </div>
                
                <div class="card">
                    <div class="card-content">
                        <h3 class="card-title">合作类型</h3>
                        <ul>
                            <li>品牌代言</li>
                            <li>商业演出</li>
                            <li>影视配乐</li>
                            <li>音乐制作</li>
                            <li>公益活动</li>
                        </ul>
                    </div>
                </div>
            </section>
        </div>
    `;
}