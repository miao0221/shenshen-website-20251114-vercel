// 搜索UI处理模块
import { searchManager } from './modules/search.js';

class SearchUIManager {
    constructor() {
        this.searchToggle = null;
        this.navSearch = null;
        this.globalSearch = null;
        this.searchSuggestions = null;
        this.searchModal = null;
        this.searchResultsContainer = null;
        this.closeButton = null;
        this.init();
    }

    init() {
        document.addEventListener('DOMContentLoaded', () => {
            this.bindElements();
            this.bindEvents();
        });
    }

    bindElements() {
        this.searchToggle = document.getElementById('search-toggle');
        this.navSearch = document.getElementById('nav-search');
        this.globalSearch = document.getElementById('global-search');
        this.searchSuggestions = document.getElementById('search-suggestions');
        this.searchModal = document.getElementById('search-modal');
        this.searchResultsContainer = document.getElementById('search-results-container');
        this.closeButton = this.searchModal?.querySelector('.close');
    }

    bindEvents() {
        // 搜索切换按钮
        if (this.searchToggle) {
            this.searchToggle.addEventListener('click', (e) => {
                e.stopPropagation();
                this.toggleSearch();
            });
        }

        // 全局搜索输入框
        if (this.globalSearch) {
            this.globalSearch.addEventListener('input', (e) => {
                this.handleSearchInput(e.target.value);
            });

            this.globalSearch.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') {
                    this.performSearch(e.target.value);
                }
            });
        }

        // 点击其他地方关闭搜索
        document.addEventListener('click', (e) => {
            if (this.navSearch && !this.navSearch.contains(e.target) && 
                this.searchToggle !== e.target) {
                this.navSearch.classList.add('hidden');
            }
        });

        // 模态框关闭按钮
        if (this.closeButton) {
            this.closeButton.addEventListener('click', () => {
                this.closeSearchModal();
            });
        }

        // 点击模态框背景关闭
        if (this.searchModal) {
            this.searchModal.addEventListener('click', (e) => {
                if (e.target === this.searchModal) {
                    this.closeSearchModal();
                }
            });
        }

        // ESC键关闭模态框
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                this.closeSearchModal();
            }
        });
    }

    toggleSearch() {
        if (this.navSearch) {
            this.navSearch.classList.toggle('hidden');
            if (!this.navSearch.classList.contains('hidden')) {
                this.globalSearch?.focus();
            }
        }
    }

    async handleSearchInput(query) {
        if (query.length < 2) {
            this.searchSuggestions?.classList.add('hidden');
            return;
        }

        try {
            const results = await searchManager.searchAll(query);
            this.showSuggestions(results);
        } catch (error) {
            console.error('搜索建议获取失败:', error);
        }
    }

    showSuggestions(results) {
        if (!this.searchSuggestions || !results || results.length === 0) {
            this.searchSuggestions?.classList.add('hidden');
            return;
        }

        let html = '<div class="suggestions-list">';
        results.forEach(item => {
            html += `<div class="suggestion-item" data-id="${item.id}" data-type="${item.type}">
                <span class="suggestion-title">${item.title}</span>
                <span class="suggestion-type">${item.type}</span>
            </div>`;
        });
        html += '</div>';

        this.searchSuggestions.innerHTML = html;
        this.searchSuggestions.classList.remove('hidden');

        // 绑定建议项点击事件
        this.searchSuggestions.querySelectorAll('.suggestion-item').forEach(item => {
            item.addEventListener('click', (e) => {
                const id = item.getAttribute('data-id');
                const type = item.getAttribute('data-type');
                this.navigateToResult(id, type);
            });
        });
    }

    async performSearch(query) {
        if (!query.trim()) return;

        try {
            const results = await searchManager.searchAll(query);
            this.showSearchResults(results);
            this.navSearch?.classList.add('hidden');
        } catch (error) {
            console.error('搜索执行失败:', error);
        }
    }

    showSearchResults(results) {
        if (!this.searchResultsContainer) return;

        if (!results || results.length === 0) {
            this.searchResultsContainer.innerHTML = '<p>未找到相关结果</p>';
        } else {
            let html = '<div class="search-results-list">';
            results.forEach(item => {
                html += `
                    <div class="search-result-item" data-id="${item.id}" data-type="${item.type}">
                        <h3>${item.title}</h3>
                        <p>${item.description || ''}</p>
                        <span class="result-type">${item.type}</span>
                    </div>
                `;
            });
            html += '</div>';

            this.searchResultsContainer.innerHTML = html;

            // 绑定结果项点击事件
            this.searchResultsContainer.querySelectorAll('.search-result-item').forEach(item => {
                item.addEventListener('click', (e) => {
                    const id = item.getAttribute('data-id');
                    const type = item.getAttribute('data-type');
                    this.navigateToResult(id, type);
                });
            });
        }

        // 显示模态框
        this.searchModal?.classList.remove('hidden');
    }

    navigateToResult(id, type) {
        // 在SPA中，这里应该使用路由导航而不是页面跳转
        console.log(`导航到 ${type} ID: ${id}`);
        this.closeSearchModal();
    }

    closeSearchModal() {
        this.searchModal?.classList.add('hidden');
        this.searchSuggestions?.classList.add('hidden');
    }
}

// 创建并导出搜索UI管理器实例
const searchUIManager = new SearchUIManager();

export { searchUIManager };
export default SearchUIManager;