// 音乐模块
import { initSupabase } from '../../config.js';

(function () {
    'use strict';

    // 初始化Supabase客户端
    const supabase = initSupabase();

    // 当前音乐数据
    let allSongs = [];
    let filteredSongs = [];
    let currentSong = null;
    let userFavorites = [];

    // DOM元素
    const elements = {
        yearFilter: document.getElementById('year-filter'),
        languageFilter: document.getElementById('language-filter'),
        searchInput: document.getElementById('search-input'),
        resetFiltersBtn: document.getElementById('reset-filters'),
        musicContainer: document.getElementById('music-container'),
        loadingIndicator: document.getElementById('loading'),
        noResults: document.getElementById('no-results'),
        modal: document.getElementById('music-modal'),
        closeModal: document.querySelector('.close'),
        modalCover: document.getElementById('modal-cover'),
        modalTitle: document.getElementById('modal-title'),
        modalAlbum: document.getElementById('modal-album'),
        modalReleaseDate: document.getElementById('modal-release-date'),
        modalDuration: document.getElementById('modal-duration'),
        modalLanguage: document.getElementById('modal-language'),
        playButton: document.getElementById('play-button'),
        favoriteButton: document.getElementById('favorite-button'),
        modalLyrics: document.getElementById('modal-lyrics'),
        commentText: document.getElementById('comment-text'),
        submitCommentBtn: document.getElementById('submit-comment'),
        commentsContainer: document.getElementById('comments-container')
    };

    // 页面加载完成后初始化
    document.addEventListener('DOMContentLoaded', async function () {
        if (!document.querySelector('.music-section')) return;

        initializeEventListeners();
        await loadSongs();
        populateYearFilter();
    });

    // 初始化事件监听器
    function initializeEventListeners() {
        // 筛选器事件
        elements.yearFilter.addEventListener('change', filterSongs);
        elements.languageFilter.addEventListener('change', filterSongs);
        elements.searchInput.addEventListener('input', filterSongs);
        elements.resetFiltersBtn.addEventListener('click', resetFilters);

        // 模态框事件
        elements.closeModal.addEventListener('click', closeModal);
        window.addEventListener('click', function (event) {
            if (event.target === elements.modal) {
                closeModal();
            }
        });

        // 收藏和评论事件
        elements.favoriteButton.addEventListener('click', toggleFavorite);
        elements.submitCommentBtn.addEventListener('click', submitComment);
    }

    // 从Supabase加载音乐数据
    async function loadSongs() {
        showLoading(true);

        try {
            const { data, error } = await supabase
                .from('songs')
                .select('*')
                .order('release_date', { ascending: false });

            if (error) throw error;

            allSongs = data.map(song => ({
                ...song,
                // 添加一些额外字段，比如格式化的时长和发布日期
                formattedDuration: formatDuration(song.duration),
                formattedReleaseDate: formatDate(song.release_date)
            }));

            filteredSongs = [...allSongs];
            renderSongs(filteredSongs);
        } catch (error) {
            console.error('加载音乐数据失败:', error);
            elements.musicContainer.innerHTML = '<p class="error">加载音乐数据失败，请稍后重试。</p>';
        } finally {
            showLoading(false);
        }
    }

    // 渲染音乐列表
    function renderSongs(songs) {
        if (songs.length === 0) {
            elements.noResults.classList.remove('hidden');
            elements.musicContainer.innerHTML = '';
            return;
        }

        elements.noResults.classList.add('hidden');
        elements.musicContainer.innerHTML = songs.map(song => `
            <div class="music-card" data-id="${song.id}">
                <img src="${song.cover_url || 'https://placehold.co/200'}" alt="${song.title}" class="music-cover">
                <div class="music-info">
                    <h3 class="music-title">${song.title}</h3>
                    <p class="music-album">${song.album}</p>
                    <p class="music-meta">${song.formattedReleaseDate} | ${song.formattedDuration}</p>
                    <button class="btn play-preview" data-id="${song.id}">查看详情</button>
                </div>
            </div>
        `).join('');

        // 为每个音乐卡片添加点击事件
        document.querySelectorAll('.play-preview').forEach(button => {
            button.addEventListener('click', function () {
                const songId = this.getAttribute('data-id');
                openMusicDetail(songId);
            });
        });
    }

    // 打开音乐详情模态框
    async function openMusicDetail(songId) {
        const song = allSongs.find(s => s.id === songId);
        if (!song) return;

        currentSong = song;

        // 更新模态框内容
        elements.modalCover.src = song.cover_url || 'https://placehold.co/200';
        elements.modalTitle.textContent = song.title;
        elements.modalAlbum.textContent = song.album;
        elements.modalReleaseDate.textContent = song.formattedReleaseDate;
        elements.modalDuration.textContent = song.formattedDuration;
        elements.modalLanguage.textContent = song.language || '未知';
        elements.modalLyrics.textContent = song.lyrics || '暂无歌词';
        elements.playButton.href = song.audio_url || '#';

        // 更新收藏按钮状态
        updateFavoriteButton();

        // 加载评论
        await loadComments(songId);

        // 显示模态框
        elements.modal.classList.remove('hidden');
        document.body.style.overflow = 'hidden'; // 阘止背景滚动
    }

    // 关闭模态框
    function closeModal() {
        elements.modal.classList.add('hidden');
        document.body.style.overflow = ''; // 恢复背景滚动
        currentSong = null;
    }

    // 更新收藏按钮状态
    function updateFavoriteButton() {
        // 这里应该检查用户是否已经收藏了这首歌
        // 由于没有实际的用户认证，我们暂时只做一个简单的切换效果
        const isFavorite = userFavorites.includes(currentSong.id);
        elements.favoriteButton.textContent = isFavorite ? '已收藏' : '收藏';
        elements.favoriteButton.classList.toggle('favorited', isFavorite);
    }

    // 切换收藏状态
    async function toggleFavorite() {
        if (!currentSong) return;

        try {
            // 检查是否已收藏
            const { data: existingFavorites, error: fetchError } = await supabase
                .from('collections')
                .select('id')
                .eq('user_id', 'current_user_id') // 实际应用中应该是真实的用户ID
                .eq('item_type', 'song')
                .eq('item_id', currentSong.id);

            if (fetchError) throw fetchError;

            if (existingFavorites.length > 0) {
                // 取消收藏
                const { error } = await supabase
                    .from('collections')
                    .delete()
                    .eq('id', existingFavorites[0].id);

                if (error) throw error;

                elements.favoriteButton.textContent = '收藏';
                elements.favoriteButton.classList.remove('favorited');
            } else {
                // 添加收藏
                const { error } = await supabase
                    .from('collections')
                    .insert({
                        user_id: 'current_user_id', // 实际应用中应该是真实的用户ID
                        item_type: 'song',
                        item_id: currentSong.id
                    });

                if (error) throw error;

                elements.favoriteButton.textContent = '已收藏';
                elements.favoriteButton.classList.add('favorited');
            }
        } catch (error) {
            console.error('收藏操作失败:', error);
            alert('收藏操作失败，请稍后重试');
        }
    }

    // 加载评论
    async function loadComments(songId) {
        try {
            const { data: comments, error } = await supabase
                .from('comments')
                .select(`
                    *,
                    users(username, avatar_url)
                `)
                .eq('target_type', 'song')
                .eq('target_id', songId)
                .order('created_at', { ascending: false });

            if (error) throw error;

            renderComments(comments);
        } catch (error) {
            console.error('加载评论失败:', error);
            elements.commentsContainer.innerHTML = '<p>加载评论失败</p>';
        }
    }

    // 渲染评论
    function renderComments(comments) {
        if (comments.length === 0) {
            elements.commentsContainer.innerHTML = '<p class="no-comments">暂无评论，快来抢沙发吧！</p>';
            return;
        }

        elements.commentsContainer.innerHTML = comments.map(comment => `
            <div class="comment">
                <div class="comment-avatar">
                    <img src="${comment.users?.avatar_url || 'https://placehold.co/40'}" alt="头像">
                </div>
                <div class="comment-content">
                    <div class="comment-author">${comment.users?.username || '匿名用户'}</div>
                    <div class="comment-text">${comment.content}</div>
                    <div class="comment-date">${formatDateTime(comment.created_at)}</div>
                </div>
            </div>
        `).join('');
    }

    // 提交评论
    async function submitComment() {
        const content = elements.commentText.value.trim();
        if (!content || !currentSong) return;

        try {
            const { data, error } = await supabase
                .from('comments')
                .insert({
                    content: content,
                    user_id: 'current_user_id', // 实际应用中应该是真实的用户ID
                    target_type: 'song',
                    target_id: currentSong.id
                })
                .select()
                .single();

            if (error) throw error;

            // 清空输入框
            elements.commentText.value = '';

            // 重新加载评论
            await loadComments(currentSong.id);
        } catch (error) {
            console.error('提交评论失败:', error);
            alert('提交评论失败，请稍后重试');
        }
    }

    // 筛选音乐
    function filterSongs() {
        const year = elements.yearFilter.value;
        const language = elements.languageFilter.value;
        const searchTerm = elements.searchInput.value.toLowerCase().trim();

        filteredSongs = allSongs.filter(song => {
            // 年份筛选
            if (year && !song.release_date.startsWith(year)) {
                return false;
            }

            // 语言筛选
            if (language && song.language !== language) {
                return false;
            }

            // 搜索关键词筛选
            if (searchTerm && !song.title.toLowerCase().includes(searchTerm)) {
                return false;
            }

            return true;
        });

        renderSongs(filteredSongs);
    }

    // 重置筛选器
    function resetFilters() {
        elements.yearFilter.value = '';
        elements.languageFilter.value = '';
        elements.searchInput.value = '';
        filteredSongs = [...allSongs];
        renderSongs(filteredSongs);
    }

    // 填充年份筛选器选项
    function populateYearFilter() {
        const years = [...new Set(allSongs.map(song => song.release_date.substring(0, 4)))];
        years.sort((a, b) => b - a); // 降序排列

        years.forEach(year => {
            const option = document.createElement('option');
            option.value = year;
            option.textContent = year;
            elements.yearFilter.appendChild(option);
        });
    }

    // 工具函数：格式化时长（秒 -> mm:ss）
    function formatDuration(seconds) {
        if (!seconds) return '0:00';
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    }

    // 工具函数：格式化日期 (YYYY-MM-DD -> YYYY年MM月DD日)
    function formatDate(dateString) {
        if (!dateString) return '未知日期';
        const date = new Date(dateString);
        return `${date.getFullYear()}年${(date.getMonth() + 1).toString().padStart(2, '0')}月${date.getDate().toString().padStart(2, '0')}日`;
    }

    // 工具函数：格式化日期时间
    function formatDateTime(dateTimeString) {
        if (!dateTimeString) return '';
        const date = new Date(dateTimeString);
        return `${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, '0')}-${date.getDate().toString().padStart(2, '0')} ${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}`;
    }

    // 显示/隐藏加载指示器
    function showLoading(show) {
        if (show) {
            elements.loadingIndicator.classList.remove('hidden');
        } else {
            elements.loadingIndicator.classList.add('hidden');
        }
    }

    console.log('音乐模块已加载');

})();