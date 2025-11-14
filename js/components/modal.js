// 显示模态框
export function showModal(title, content) {
    const modalHTML = `
        <div class="modal" id="generic-modal">
            <div class="modal-content">
                <div class="modal-header">
                    <h2 class="modal-title">${title}</h2>
                    <button class="close-btn" id="close-modal">&times;</button>
                </div>
                <div class="modal-body">
                    ${content}
                </div>
            </div>
        </div>
    `;
    
    // 添加到页面
    document.body.insertAdjacentHTML('beforeend', modalHTML);
    
    // 添加关闭事件
    document.getElementById('close-modal').addEventListener('click', closeModal);
    document.querySelector('#generic-modal').addEventListener('click', (e) => {
        if (e.target.id === 'generic-modal') {
            closeModal();
        }
    });
    
    // ESC键关闭
    document.addEventListener('keydown', handleEscKey);
}

// 关闭模态框
export function closeModal() {
    const modal = document.getElementById('generic-modal');
    if (modal) {
        modal.remove();
    }
    document.removeEventListener('keydown', handleEscKey);
}

// 处理ESC键关闭
function handleEscKey(e) {
    if (e.key === 'Escape') {
        closeModal();
    }
}