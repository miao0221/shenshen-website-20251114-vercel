// 视频模块
import { initSupabase } from '../../config.js';
import { videoApi } from '../api/videoApi.js';
import { searchManager } from './search.js';

// 初始化视频模块
export async function init() {
    console.log('初始化视频模块...');
    
    // 加载视频数据
    await loadVideos();
    
    // 绑定事件
    bindEvents();
}

// 加载视频数据
async function loadVideos() {
    try {
        // 显示加载指示器
        showLoading(true);
        
        // 获取所有视频数据
        const videoData = await videoApi.getAllVideos();
        
        // 显示视频列表
        displayVideos(videoData);
        
        // 隐藏加载指示器
        showLoading(false);
    } catch (error) {
        console.error('加载视频数据失败:', error);
        showError('加载视频数据失败，请稍后重试。');
        showLoading(false);
    }
}

// 显示加载指示器
function showLoading(show) {
    const loadingElement = document.getElementById('loading');
    if (loadingElement) {
        loadingElement.classList.toggle('hidden', !show);
    }
}

// 显示错误信息
function showError(message) {
    const container = document.getElementById('video-container');
    if (container) {
        container.innerHTML = `<p class="error">${message}</p>`;
    }
}

// 显示视频列表
function displayVideos(videoData) {
    const container = document.getElementById('video-container');
    if (!container) return;
    
    if (!videoData || videoData.length === 0) {
        container.innerHTML = '<p>暂无视频内容</p>';
        return;
    }
    
    let html = '<div class="video-grid">';
    
    videoData.forEach(video => {
        html += `
            <div class="video-card" data-id="${video.id}">
                <div class="video-thumbnail">
                    ${video.thumbnail_url ? 
                        `<img src="${video.thumbnail_url}" alt="${video.title}" onerror="this.src='data:image/svg+xml;utf8,<svg xmlns=\"http://www.w3.org/2000/svg\" width=\"200\" height=\"150\" viewBox=\"0 0 200 150\"><rect width=\"200\" height=\"150\" fill=\"%23333\"/><text x=\"50%\" y=\"50%\" font-family=\"Arial\" font-size=\"16\" fill=\"white\" text-anchor=\"middle\" dy=\".3em\">视频缩略图</text></svg>'">` :
                        `<div class="video-placeholder">▶️</div>`
                    }
                    <div class="video-duration">${formatDuration(video.duration)}</div>
                </div>
                <div class="video-info">
                    <h3 class="video-title">${video.title}</h3>
                    <p class="video-description">${video.description || ''}</p>
                    <p class="video-meta">
                        <span class="video-date">${formatDate(video.publish_date)}</span>
                        <span class="video-category">${video.category}</span>
                    </p>
                </div>
            </div>
        `;
    });
    
    html += '</div>';
    
    container.innerHTML = html;
}

// 格式化时长
function formatDuration(seconds) {
    if (!seconds) return '';
    
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    
    if (hours > 0) {
        return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    } else {
        return `${minutes}:${secs.toString().padStart(2, '0')}`;
    }
}

// 格式化日期
function formatDate(dateString) {
    if (!dateString) return '';
    
    const date = new Date(dateString);
    return date.toLocaleDateString('zh-CN');
}

// 绑定事件
function bindEvents() {
    // 分类筛选
    const categoryFilter = document.getElementById('category-filter');
    if (categoryFilter) {
        categoryFilter.addEventListener('change', filterVideos);
    }
    
    // 搜索输入
    const searchInput = document.getElementById('search-input');
    if (searchInput) {
        let searchTimeout;
        searchInput.addEventListener('input', (e) => {
            clearTimeout(searchTimeout);
            searchTimeout = setTimeout(filterVideos, 300);
        });
    }
    
    // 重置筛选
    const resetButton = document.getElementById('reset-filters');
    if (resetButton) {
        resetButton.addEventListener('click', resetFilters);
    }
    
    // 视频卡片点击
    const container = document.getElementById('video-container');
    if (container) {
        container.addEventListener('click', (e) => {
            const card = e.target.closest('.video-card');
            if (card) {
                const videoId = card.getAttribute('data-id');
                showVideoDetails(videoId);
            }
        });
    }
    
    // 模态框关闭按钮
    const closeButtons = document.querySelectorAll('#video-modal .close');
    closeButtons.forEach(button => {
        button.addEventListener('click', closeVideoModal);
    });
    
    // 点击模态框背景关闭
    const modal = document.getElementById('video-modal');
    if (modal) {
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                closeVideoModal();
            }
        });
    }
}

// 筛选视频
async function filterVideos() {
    try {
        // 显示加载指示器
        showLoading(true);
        
        // 获取筛选条件
        const category = document.getElementById('category-filter')?.value;
        const search = document.getElementById('search-input')?.value;
        
        // 构造筛选参数
        const filters = {};
        if (category) filters.category = category;
        if (search) filters.search = search;
        
        // 搜索视频
        const videoData = await videoApi.searchVideos(filters);
        
        // 显示结果
        displayVideos(videoData);
        
        // 隐藏加载指示器
        showLoading(false);
        
        // 显示/隐藏无结果提示
        const noResults = document.getElementById('no-results');
        if (noResults) {
            noResults.classList.toggle('hidden', videoData.length > 0);
        }
    } catch (error) {
        console.error('筛选视频失败:', error);
        showError('筛选视频失败，请稍后重试。');
        showLoading(false);
    }
}

// 重置筛选
function resetFilters() {
    // 重置筛选表单
    const categoryFilter = document.getElementById('category-filter');
    const searchInput = document.getElementById('search-input');
    
    if (categoryFilter) categoryFilter.value = '';
    if (searchInput) searchInput.value = '';
    
    // 重新加载视频
    loadVideos();
}

// 显示视频详情
async function showVideoDetails(videoId) {
    try {
        // 获取视频详情
        const video = await searchManager.getVideoById(videoId);
        if (!video) {
            alert('获取视频详情失败');
            return;
        }
        
        // 填充模态框内容
        const modalBody = document.querySelector('#video-modal .modal-body');
        if (modalBody) {
            modalBody.innerHTML = `
                <div class="video-player-area">
                    ${video.video_url ? 
                        `<video id="video-player" controls>
                            <source src="${video.video_url}" type="video/mp4">
                            您的浏览器不支持视频播放。
                        </video>` :
                        `<div class="video-unavailable">
                            <p>视频暂不可用</p>
                            ${video.external_url ? 
                                `<a href="${video.external_url}" target="_blank" class="btn">前往观看</a>` : 
                                ''
                            }
                        </div>`
                    }
                </div>
                
                <div class="video-info">
                    <h3 id="video-title">${video.title}</h3>
                    <p id="video-description">${video.description || ''}</p>
                    <div class="video-meta">
                        <span id="video-date">发布日期: ${formatDate(video.publish_date)}</span>
                        <span id="video-category">分类: ${video.category}</span>
                        <span id="video-duration">时长: ${formatDuration(video.duration)}</span>
                    </div>
                </div>
            `;
        }
        
        // 显示模态框
        const modal = document.getElementById('video-modal');
        if (modal) {
            modal.classList.remove('hidden');
        }
    } catch (error) {
        console.error('显示视频详情失败:', error);
        alert('获取视频详情失败，请稍后重试。');
    }
}

// 关闭视频模态框
function closeVideoModal() {
    const modal = document.getElementById('video-modal');
    if (modal) {
        modal.classList.add('hidden');
    }
    
    // 暂停视频播放
    const videoPlayer = document.getElementById('video-player');
    if (videoPlayer) {
        videoPlayer.pause();
    }
}

export default { init };
