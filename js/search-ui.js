// 搜索UI控制功能

// 打开搜索框
function openSearch() {
    const overlay = document.querySelector('.search-overlay');
    if (overlay) {
        overlay.style.display = 'block';
    }
}

// 关闭搜索框  
function closeSearch() {
    const overlay = document.querySelector('.search-overlay');
    if (overlay) {
        overlay.style.display = 'none';
    }
}

// 确保DOM加载完成后添加事件监听器
document.addEventListener('DOMContentLoaded', function() {
    const overlay = document.querySelector('.search-overlay');
    
    if (overlay) {
        // 点击搜索框外部关闭
        overlay.addEventListener('click', function(e) {
            if (e.target === this) {
                closeSearch();
            }
        });
    }
    
    // ESC键关闭
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape') {
            closeSearch();
        }
    });
});