// 音乐模块
import { initSupabase } from '../config.js';
import { musicApi } from '../api/musicApi.js';
import { searchManager } from './search.js';

// 初始化音乐模块
export async function init() {
    console.log('初始化音乐模块...');
    
    // 检查是否存在音乐模块容器
    if (!document.querySelector('.music-section')) return;

    try {
        // 加载音乐数据
        await loadMusic();
        
        // 绑定事件
        bindEvents();
    } catch (error) {
        console.error('初始化音乐模块失败:', error);
    }
}

// 加载音乐数据
async function loadMusic() {
    try {
        // 显示加载指示器
        showLoading(true);
        
        // 获取所有音乐数据
        const musicData = await musicApi.getAllMusic();
        
        // 获取年份筛选选项
        const years = await musicApi.getYears();
        
        // 填充年份筛选下拉框
        populateYearFilter(years);
        
        // 显示音乐列表
        displayMusic(musicData);
        
        // 隐藏加载指示器
        showLoading(false);
    } catch (error) {
        console.error('加载音乐数据失败:', error);
        showError('加载音乐数据失败，请稍后重试。');
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
    const container = document.getElementById('music-container');
    if (container) {
        container.innerHTML = `<p class="error">${message}</p>`;
    }
}

// 填充年份筛选下拉框
function populateYearFilter(years) {
    const yearFilter = document.getElementById('year-filter');
    if (!yearFilter) return;
    
    // 清空现有选项
    yearFilter.innerHTML = '<option value="">全部</option>';
    
    // 添加年份选项
    years.forEach(year => {
        const option = document.createElement('option');
        option.value = year;
        option.textContent = year;
        yearFilter.appendChild(option);
    });
}

// 显示音乐列表
function displayMusic(musicData) {
    const container = document.getElementById('music-container');
    if (!container) return;
    
    if (!musicData || musicData.length === 0) {
        container.innerHTML = '<p>暂无音乐作品</p>';
        return;
    }
    
    let html = '<div class="music-grid">';
    
    musicData.forEach(music => {
        html += `
            <div class="music-card" data-id="${music.id}">
                <div class="music-cover">
                    ${music.cover_url ? 
                        `<img src="${music.cover_url}" alt="${music.title}" onerror="this.src='data:image/svg+xml;utf8,<svg xmlns=\"http://www.w3.org/2000/svg\" width=\"200\" height=\"200\" viewBox=\"0 0 200 200\"><rect width=\"200\" height=\"200\" fill=\"%23f0f0f0\"/><text x=\"50%\" y=\"50%\" font-family=\"Arial\" font-size=\"16\" fill=\"%23999\" text-anchor=\"middle\" dy=\".3em\">封面</text></svg>'">` :
                        `<div class="music-placeholder">🎵</div>`
                    }
                </div>
                <div class="music-info">
                    <h3 class="music-title">${music.title}</h3>
                    <p class="music-album">${music.album || '单曲'}</p>
                    <p class="music-meta">
                        <span class="music-year">${music.year}</span>
                        <span class="music-language">${music.language}</span>
                    </p>
                </div>
            </div>
        `;
    });
    
    html += '</div>';
    
    container.innerHTML = html;
}

// 绑定事件
function bindEvents() {
    // 年份筛选
    const yearFilter = document.getElementById('year-filter');
    if (yearFilter) {
        yearFilter.addEventListener('change', filterMusic);
    }
    
    // 语言筛选
    const languageFilter = document.getElementById('language-filter');
    if (languageFilter) {
        languageFilter.addEventListener('change', filterMusic);
    }
    
    // 搜索输入
    const searchInput = document.getElementById('search-input');
    if (searchInput) {
        let searchTimeout;
        searchInput.addEventListener('input', (e) => {
            clearTimeout(searchTimeout);
            searchTimeout = setTimeout(filterMusic, 300);
        });
    }
    
    // 重置筛选
    const resetButton = document.getElementById('reset-filters');
    if (resetButton) {
        resetButton.addEventListener('click', resetFilters);
    }
    
    // 音乐卡片点击
    const container = document.getElementById('music-container');
    if (container) {
        container.addEventListener('click', (e) => {
            const card = e.target.closest('.music-card');
            if (card) {
                const musicId = card.getAttribute('data-id');
                showMusicDetails(musicId);
            }
        });
    }
}

// 筛选音乐
async function filterMusic() {
    try {
        // 显示加载指示器
        showLoading(true);
        
        // 获取筛选条件
        const year = document.getElementById('year-filter')?.value;
        const language = document.getElementById('language-filter')?.value;
        const search = document.getElementById('search-input')?.value;
        
        // 构造筛选参数
        const filters = {};
        if (year) filters.year = year;
        if (language) filters.language = language;
        if (search) filters.search = search;
        
        // 搜索音乐
        const musicData = await musicApi.searchMusic(filters);
        
        // 显示结果
        displayMusic(musicData);
        
        // 隐藏加载指示器
        showLoading(false);
        
        // 显示/隐藏无结果提示
        const noResults = document.getElementById('no-results');
        if (noResults) {
            noResults.classList.toggle('hidden', musicData.length > 0);
        }
    } catch (error) {
        console.error('筛选音乐失败:', error);
        showError('筛选音乐失败，请稍后重试。');
        showLoading(false);
    }
}

// 重置筛选
function resetFilters() {
    // 重置筛选表单
    const yearFilter = document.getElementById('year-filter');
    const languageFilter = document.getElementById('language-filter');
    const searchInput = document.getElementById('search-input');
    
    if (yearFilter) yearFilter.value = '';
    if (languageFilter) languageFilter.value = '';
    if (searchInput) searchInput.value = '';
    
    // 重新加载音乐
    loadMusic();
}

// 显示音乐详情
async function showMusicDetails(musicId) {
    try {
        // 获取音乐详情
        const music = await searchManager.getMusicById(musicId);
        if (!music) {
            alert('获取音乐详情失败');
            return;
        }
        
        // 填充模态框内容
        const modalBody = document.querySelector('#music-modal .modal-body');
        if (modalBody) {
            modalBody.innerHTML = `
                <div class="music-detail">
                    <div class="music-detail-cover">
                        ${music.cover_url ? 
                            `<img src="${music.cover_url}" alt="${music.title}" onerror="this.src='data:image/svg+xml;utf8,<svg xmlns=\"http://www.w3.org/2000/svg\" width=\"300\" height=\"300\" viewBox=\"0 0 300 300\"><rect width=\"300\" height=\"300\" fill=\"%23f0f0f0\"/><text x=\"50%\" y=\"50%\" font-family=\"Arial\" font-size=\"24\" fill=\"%23999\" text-anchor=\"middle\" dy=\".3em\">封面</text></svg>'">` :
                            `<div class="music-detail-placeholder">🎵</div>`
                        }
                    </div>
                    <div class="music-detail-info">
                        <h2>${music.title}</h2>
                        <p><strong>专辑:</strong> ${music.album || '单曲'}</p>
                        <p><strong>年份:</strong> ${music.year}</p>
                        <p><strong>语言:</strong> ${music.language}</p>
                        <p><strong>时长:</strong> ${music.duration || '未知'}</p>
                        ${music.description ? `<p><strong>介绍:</strong> ${music.description}</p>` : ''}
                        <div class="music-detail-actions">
                            <button id="play-music-btn" class="btn">播放</button>
                            ${music.external_url ? `<a href="${music.external_url}" target="_blank" class="btn">在线收听</a>` : ''}
                        </div>
                    </div>
                </div>
            `;
            
            // 绑定播放按钮事件
            const playButton = document.getElementById('play-music-btn');
            if (playButton) {
                playButton.addEventListener('click', () => {
                    playMusic(music);
                });
            }
        }
        
        // 显示模态框
        const modal = document.getElementById('music-modal');
        if (modal) {
            modal.classList.remove('hidden');
        }
    } catch (error) {
        console.error('显示音乐详情失败:', error);
        alert('获取音乐详情失败，请稍后重试。');
    }
}

// 播放音乐
function playMusic(music) {
    alert(`播放音乐: ${music.title}\n注意：实际项目中这里会集成音乐播放器`);
    
    // 在实际项目中，这里会集成音乐播放器
    // 例如使用HTML5 Audio API或第三方播放器库
}

export default { init };