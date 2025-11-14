export function loadComponent() {
    const footerHTML = `
        <footer class="footer">
            <div class="container">
                <p>&copy; ${new Date().getFullYear()} 周深粉丝网站. 版权所有.</p>
                <p>本网站为粉丝自发建立，非官方站点</p>
            </div>
        </footer>
    `;
    
    // 将页脚添加到应用容器之后
    const app = document.getElementById('app');
    app.insertAdjacentHTML('afterend', footerHTML);
    
    return Promise.resolve();
}