// 全局搜索模块
import { initSupabase } from '../config.js';

class SearchManager {
    constructor() {
        this.supabase = initSupabase();
        this.searchTimeout = null;
        this.init();
    }

    init() {
        document.addEventListener('DOMContentLoaded', () => {
            this.setupSearchElements();
            this.setupEventListeners();
        });
    }

    setupSearchElements() {
        this.searchInput = document.getElementById('global-search');
        this.searchSuggestions = document.getElementById('search-suggestions');
        this.searchModal = document.getElementById('search-modal');
        this.searchResultsContainer = document.getElementById('search-results-container');
        this.closeModal = this.searchModal ? this.searchModal.querySelector('.close') : null;
        this.searchToggle = document.getElementById('search-toggle');
        this.navSearch = document.getElementById('nav-search');
    }

    setupEventListeners() {
        if (this.searchInput) {
            this.searchInput.addEventListener('input', (e) => this.handleSearchInput(e));
            this.searchInput.addEventListener('focus', (e) => this.handleSearchFocus(e));
            this.searchInput.addEventListener('blur', (e) => this.handleSearchBlur(e));
            this.searchInput.addEventListener('keydown', (e) => this.handleSearchKeydown(e));
        }

        if (this.closeModal) {
            this.closeModal.addEventListener('click', () => this.closeSearchModal());
        }

        // 点击模态框外部关闭模态框
        if (this.searchModal) {
            this.searchModal.addEventListener('click', (e) => {
                if (e.target === this.searchModal) {
                    this.closeSearchModal();
                }
            });
        }

        // 点击 Escape 键关闭模态框
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && this.searchModal && !this.searchModal.classList.contains('hidden')) {
                this.closeSearchModal();
            }
            
            // ESC键关闭搜索框
            if (e.key === 'Escape') {
                this.hideSearch();
            }
        });
        
        // 搜索切换按钮
        if (this.searchToggle) {
            this.searchToggle.addEventListener('click', () => this.toggleSearch());
        }
        
        // 点击搜索框外部关闭
        if (this.navSearch) {
            document.addEventListener('click', (e) => {
                if (!this.navSearch.contains(e.target) && e.target !== this.searchToggle) {
                    this.hideSearch();
                }
            });
        }
    }
    
    // 切换搜索框显示/隐藏
    toggleSearch() {
        if (this.navSearch.classList.contains('hidden')) {
            this.showSearch();
        } else {
            this.hideSearch();
        }
    }
    
    // 显示搜索框
    showSearch() {
        if (this.navSearch) {
            this.navSearch.classList.remove('hidden');
            this.searchInput.focus();
        }
    }
    
    // 隐藏搜索框
    hideSearch() {
        if (this.navSearch) {
            this.navSearch.classList.add('hidden');
        }
        this.hideSuggestions();
    }

    handleSearchInput(e) {
        const query = e.target.value.trim();

        // 清除之前的定时器
        if (this.searchTimeout) {
            clearTimeout(this.searchTimeout);
        }

        // 如果查询为空，隐藏建议框
        if (!query) {
            this.hideSuggestions();
            return;
        }

        // 设置新的定时器，延迟执行搜索建议
        this.searchTimeout = setTimeout(() => {
            this.fetchSearchSuggestions(query);
        }, 300);
    }

    handleSearchFocus() {
        const query = this.searchInput.value.trim();
        if (query) {
            this.fetchSearchSuggestions(query);
        }
    }

    handleSearchBlur() {
        // 延迟隐藏建议框，确保点击建议项时不会立即隐藏
        setTimeout(() => {
            this.hideSuggestions();
        }, 200);
    }

    handleSearchKeydown(e) {
        if (e.key === 'Enter') {
            const query = this.searchInput.value.trim();
            if (query) {
                this.performSearch(query);
                this.hideSuggestions();
            }
        }
    }

    async fetchSearchSuggestions(query) {
        try {
            // 获取音乐标题建议
            const { data: songsData, error: songsError } = await this.supabase
                .from('songs')
                .select('id, title')
                .ilike('title', `%${query}%`)
                .limit(3);

            if (songsError) throw songsError;

            // 获取视频标题建议
            const { data: videosData, error: videosError } = await this.supabase
                .from('videos')
                .select('id, title')
                .ilike('title', `%${query}%`)
                .limit(3);

            if (videosError) throw videosError;

            // 合并建议并渲染
            const suggestions = [
                ...songsData.map(item => ({ id: item.id, title: item.title, type: '音乐' })),
                ...videosData.map(item => ({ id: item.id, title: item.title, type: '视频' }))
            ].slice(0, 5);

            this.renderSuggestions(suggestions, query);
        } catch (error) {
            console.error('获取搜索建议失败:', error);
        }
    }

    renderSuggestions(suggestions, query) {
        if (!this.searchSuggestions) return;

        if (suggestions.length === 0) {
            this.hideSuggestions();
            return;
        }

        const suggestionsHTML = suggestions.map(item => {
            // 高亮匹配的文本
            const highlightedTitle = item.title.replace(
                new RegExp(`(${query})`, 'gi'),
                '<mark>$1</mark>'
            );
            
            return `
                <div class="suggestion-item" data-id="${item.id}" data-type="${item.type}">
                    ${highlightedTitle} <span class="suggestion-type">${item.type}</span>
                </div>
            `;
        }).join('');

        this.searchSuggestions.innerHTML = suggestionsHTML;
        this.searchSuggestions.classList.remove('hidden');

        // 为每个建议项添加点击事件
        this.searchSuggestions.querySelectorAll('.suggestion-item').forEach(item => {
            item.addEventListener('click', () => {
                const id = item.dataset.id;
                const type = item.dataset.type;
                this.navigateToItem(id, type);
            });
        });
    }

    hideSuggestions() {
        this.searchSuggestions.classList.add('hidden');
    }

    async performSearch(query) {
        try {
            // 显示搜索模态框
            if (this.searchModal) {
                this.searchModal.classList.remove('hidden');
                document.body.style.overflow = 'hidden'; // 防止背景滚动
            }

            // 搜索音乐
            const { data: songs, error: songsError } = await this.supabase
                .from('songs')
                .select('*')
                .or(`title.ilike.%${query}%,album.ilike.%${query}%,lyrics.ilike.%${query}%`);

            if (songsError) throw songsError;

            // 搜索视频
            const { data: videos, error: videosError } = await this.supabase
                .from('videos')
                .select('*')
                .or(`title.ilike.%${query}%,description.ilike.%${query}%`);

            if (videosError) throw videosError;

            // 搜索标签
            const { data: tags, error: tagsError } = await this.supabase
                .from('tags')
                .select('*')
                .ilike('name', `%${query}%`);

            if (tagsError) throw tagsError;

            // 渲染搜索结果
            this.renderSearchResults({ songs, videos, tags }, query);
        } catch (error) {
            console.error('搜索失败:', error);
        }
    }

    async searchSongs(query) {
        try {
            const { data, error } = await this.supabase
                .from('songs')
                .select('*')
                .or(`title.ilike.%${query}%,album.ilike.%${query}%,lyrics.ilike.%${query}%`)
                .order('release_date', { ascending: false });

            if (error) throw error;
            return data;
        } catch (error) {
            console.error('搜索音乐失败:', error);
            return [];
        }
    }

    async searchVideos(query) {
        try {
            const { data, error } = await this.supabase
                .from('videos')
                .select('*')
                .or(`title.ilike.%${query}%,description.ilike.%${query}%`)
                .order('publish_date', { ascending: false });

            if (error) throw error;
            return data;
        } catch (error) {
            console.error('搜索视频失败:', error);
            return [];
        }
    }

    async searchInterviews(query) {
        // 由于数据库模式中没有采访表，暂时返回空数组
        // 如果将来添加了采访表，可以在这里实现相关搜索逻辑
        return [];
    }

    async searchAwards(query) {
        // 由于数据库模式中没有奖项表，暂时返回空数组
        // 如果将来添加了奖项表，可以在这里实现相关搜索逻辑
        return [];
    }

    renderSearchResults(results, query) {
        if (!this.searchResultsContainer) return;

        const { songs, videos, tags } = results;

        let resultsHTML = '';

        // 渲染音乐结果
        if (songs.length > 0) {
            resultsHTML += `
                <div class="search-result-category">
                    <h3>音乐 (${songs.length})</h3>
                    <div class="search-result-items">
                        ${songs.map(song => {
                            const highlightedTitle = song.title.replace(
                                new RegExp(`(${query})`, 'gi'),
                                '<mark>$1</mark>'
                            );
                            return `
                                <div class="search-result-item" data-id="${song.id}" data-type="song">
                                    <img src="${song.cover_url || 'https://placehold.co/50'}" alt="${song.title}" class="result-image">
                                    <div class="result-content">
                                        <h4>${highlightedTitle}</h4>
                                        <p>专辑: ${song.album || '未知'}</p>
                                        <p class="result-meta">发行日期: ${song.release_date || '未知'}</p>
                                    </div>
                                </div>
                            `;
                        }).join('')}
                    </div>
                </div>
            `;
        }

        // 渲染视频结果
        if (videos.length > 0) {
            resultsHTML += `
                <div class="search-result-category">
                    <h3>视频 (${videos.length})</h3>
                    <div class="search-result-items">
                        ${videos.map(video => {
                            const highlightedTitle = video.title.replace(
                                new RegExp(`(${query})`, 'gi'),
                                '<mark>$1</mark>'
                            );
                            return `
                                <div class="search-result-item" data-id="${video.id}" data-type="video">
                                    <img src="${video.thumbnail_url || 'https://placehold.co/50'}" alt="${video.title}" class="result-image">
                                    <div class="result-content">
                                        <h4>${highlightedTitle}</h4>
                                        <p>${video.description ? video.description.substring(0, 100) + '...' : '无描述'}</p>
                                        <p class="result-meta">发布日期: ${video.publish_date || '未知'}</p>
                                    </div>
                                </div>
                            `;
                        }).join('')}
                    </div>
                </div>
            `;
        }

        // 渲染标签结果
        if (tags.length > 0) {
            resultsHTML += `
                <div class="search-result-category">
                    <h3>标签 (${tags.length})</h3>
                    <div class="search-result-items">
                        ${tags.map(tag => {
                            const highlightedName = tag.name.replace(
                                new RegExp(`(${query})`, 'gi'),
                                '<mark>$1</mark>'
                            );
                            return `
                                <div class="search-result-item" data-id="${tag.id}" data-type="tag">
                                    <div class="result-content">
                                        <h4>${highlightedName}</h4>
                                    </div>
                                </div>
                            `;
                        }).join('')}
                    </div>
                </div>
            `;
        }

        // 如果没有结果
        if (songs.length === 0 && videos.length === 0 && tags.length === 0) {
            resultsHTML = '<p>未找到相关结果</p>';
        }

        this.searchResultsContainer.innerHTML = resultsHTML;

        // 为搜索结果项添加点击事件
        this.searchResultsContainer.querySelectorAll('.search-result-item').forEach(item => {
            item.addEventListener('click', () => {
                const id = item.dataset.id;
                const type = item.dataset.type;
                this.navigateToItem(id, type);
            });
        });
    }

    navigateToItem(id, type) {
        // 隐藏搜索建议
        this.hideSuggestions();
        
        // 隐藏搜索模态框
        this.closeSearchModal();
        
        // 根据类型导航到相应页面
        switch (type) {
            case '音乐':
            case 'song':
                window.location.href = `music.html?song=${id}`;
                break;
            case '视频':
            case 'video':
                window.location.href = `video.html?video=${id}`;
                break;
            case 'tag':
                // 标签导航逻辑可以根据需要实现
                break;
            default:
                console.log('未知类型:', type);
        }
    }

    showSearchModal() {
        if (this.searchModal) {
            this.searchModal.classList.remove('hidden');
            document.body.style.overflow = 'hidden';
        }
    }

    closeSearchModal() {
        if (this.searchModal) {
            this.searchModal.classList.add('hidden');
            document.body.style.overflow = '';
        }
    }

    // 删除旧的 highlightMatch 方法，已在其他地方直接使用

    formatDuration(seconds) {
        if (!seconds) return '';
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    }
}

// 创建并导出搜索管理器实例
const searchManager = new SearchManager();

export { searchManager };
export default SearchManager;