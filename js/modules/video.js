// 视频模块
import { initSupabase } from '../../config.js';

(function () {
    'use strict';

    // 初始化Supabase客户端
    const supabase = initSupabase();

    // 当前视频数据
    let allVideos = [];
    let filteredVideos = [];
    let currentVideo = null;
    let userFavorites = [];

    // DOM元素
    const elements = {
        categoryFilter: document.getElementById('category-filter'),
        searchInput: document.getElementById('search-input'),
        resetFiltersBtn: document.getElementById('reset-filters'),
        videoContainer: document.getElementById('video-container'),
        loadingIndicator: document.getElementById('loading'),
        noResults: document.getElementById('no-results'),
        modal: document.getElementById('video-modal'),
        closeModal: document.querySelector('.close'),
        videoPlayer: document.getElementById('video-player'),
        modalTitle: document.getElementById('modal-title'),
        modalPublishDate: document.getElementById('modal-publish-date'),
        modalDuration: document.getElementById('modal-duration'),
        modalViews: document.getElementById('modal-views'),
        videoTags: document.getElementById('video-tags'),
        modalDescription: document.getElementById('modal-description'),
        favoriteButton: document.getElementById('favorite-button'),
        commentText: document.getElementById('comment-text'),
        submitCommentBtn: document.getElementById('submit-comment'),
        commentsContainer: document.getElementById('comments-container')
    };

    // 页面加载完成后初始化
    document.addEventListener('DOMContentLoaded', async function () {
        if (!document.querySelector('.video-section')) return;

        initializeEventListeners();
        await loadVideos();
    });

    // 初始化事件监听器
    function initializeEventListeners() {
        // 筛选器事件
        elements.categoryFilter.addEventListener('change', filterVideos);
        elements.searchInput.addEventListener('input', filterVideos);
        elements.resetFiltersBtn.addEventListener('click', resetFilters);

        // 模态框事件
        elements.closeModal.addEventListener('click', closeVideoModal);
        window.addEventListener('click', function (event) {
            if (event.target === elements.modal) {
                closeVideoModal();
            }
        });

        // 收藏和评论事件
        elements.favoriteButton.addEventListener('click', toggleFavorite);
        elements.submitCommentBtn.addEventListener('click', submitComment);
    }

    // 从Supabase加载视频数据
    async function loadVideos() {
        showLoading(true);

        try {
            // 获取视频数据
            const { data: videosData, error: videosError } = await supabase
                .from('videos')
                .select('*')
                .order('publish_date', { ascending: false });

            if (videosError) throw videosError;

            // 获取视频标签数据
            const { data: videoTagsData, error: tagsError } = await supabase
                .from('video_tags')
                .select(`
                    video_id,
                    tags(name)
                `);

            if (tagsError) throw tagsError;

            // 获取标签数据
            const { data: tagsData, error: allTagsError } = await supabase
                .from('tags')
                .select('*');

            if (allTagsError) throw allTagsError;

            // 整理视频数据
            allVideos = videosData.map(video => {
                // 查找该视频的标签
                const videoTagRelations = videoTagsData.filter(vt => vt.video_id === video.id);
                const videoTags = videoTagRelations.map(vt => {
                    const tag = tagsData.find(t => t.id === vt.tags.id);
                    return tag ? tag.name : null;
                }).filter(tag => tag !== null);

                return {
                    ...video,
                    formattedDuration: formatDuration(video.duration),
                    formattedPublishDate: formatDate(video.publish_date),
                    tags: videoTags
                };
            });

            filteredVideos = [...allVideos];
            renderVideos(filteredVideos);
        } catch (error) {
            console.error('加载视频数据失败:', error);
            elements.videoContainer.innerHTML = '<p class="error">加载视频数据失败，请稍后重试。</p>';
        } finally {
            showLoading(false);
        }
    }

    // 渲染视频列表
    function renderVideos(videos) {
        if (videos.length === 0) {
            elements.noResults.classList.remove('hidden');
            elements.videoContainer.innerHTML = '';
            return;
        }

        elements.noResults.classList.add('hidden');
        elements.videoContainer.innerHTML = videos.map(video => `
            <div class="video-card" data-id="${video.id}">
                <div class="video-thumbnail">
                    <img src="${video.thumbnail_url || 'https://placehold.co/300x200'}" alt="${video.title}" class="thumbnail-img">
                    <div class="video-duration">${video.formattedDuration}</div>
                </div>
                <div class="video-info">
                    <h3 class="video-title">${video.title}</h3>
                    <p class="video-meta">${video.formattedPublishDate} | ${video.views_count || 0} 次观看</p>
                    <div class="video-tags-small">
                        ${video.tags.slice(0, 2).map(tag => `<span class="tag-small">${tag}</span>`).join('')}
                        ${video.tags.length > 2 ? `<span class="tag-small">+${video.tags.length - 2}</span>` : ''}
                    </div>
                    <button class="btn play-video" data-id="${video.id}">播放</button>
                </div>
            </div>
        `).join('');

        // 为每个视频卡片添加点击事件
        document.querySelectorAll('.play-video').forEach(button => {
            button.addEventListener('click', function () {
                const videoId = this.getAttribute('data-id');
                openVideoDetail(videoId);
            });
        });
    }

    // 打开视频详情模态框
    async function openVideoDetail(videoId) {
        const video = allVideos.find(v => v.id === videoId);
        if (!video) return;

        currentVideo = video;

        // 更新模态框内容
        elements.videoPlayer.src = video.video_url || '';
        elements.modalTitle.textContent = video.title;
        elements.modalPublishDate.textContent = video.formattedPublishDate;
        elements.modalDuration.textContent = video.formattedDuration;
        elements.modalViews.textContent = `${video.views_count || 0} 次观看`;
        elements.modalDescription.textContent = video.description || '暂无描述';

        // 渲染标签
        if (video.tags.length > 0) {
            elements.videoTags.innerHTML = video.tags.map(tag => `<span class="tag">${tag}</span>`).join('');
        } else {
            elements.videoTags.innerHTML = '<span class="tag">无标签</span>';
        }

        // 更新收藏按钮状态
        updateFavoriteButton();

        // 加载评论
        await loadComments(videoId);

        // 显示模态框
        elements.modal.classList.remove('hidden');
        document.body.style.overflow = 'hidden'; // 防止背景滚动

        // 自动播放视频
        setTimeout(() => {
            elements.videoPlayer.play().catch(e => console.log("自动播放被阻止:", e));
        }, 500);
    }

    // 关闭视频模态框
    function closeVideoModal() {
        elements.modal.classList.add('hidden');
        document.body.style.overflow = ''; // 恢复背景滚动
        
        // 暂停视频播放
        elements.videoPlayer.pause();
        elements.videoPlayer.currentTime = 0;
        
        currentVideo = null;
    }

    // 更新收藏按钮状态
    function updateFavoriteButton() {
        // 这里应该检查用户是否已经收藏了这个视频
        // 由于没有实际的用户认证，我们暂时只做一个简单的切换效果
        const isFavorite = userFavorites.includes(currentVideo.id);
        elements.favoriteButton.textContent = isFavorite ? '已收藏' : '收藏';
        elements.favoriteButton.classList.toggle('favorited', isFavorite);
    }

    // 切换收藏状态
    async function toggleFavorite() {
        if (!currentVideo) return;

        try {
            // 检查是否已收藏
            const { data: existingFavorites, error: fetchError } = await supabase
                .from('collections')
                .select('id')
                .eq('user_id', 'current_user_id') // 实际应用中应该是真实的用户ID
                .eq('item_type', 'video')
                .eq('item_id', currentVideo.id);

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
                        item_type: 'video',
                        item_id: currentVideo.id
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
    async function loadComments(videoId) {
        try {
            const { data: comments, error } = await supabase
                .from('comments')
                .select(`
                    *,
                    users(username, avatar_url)
                `)
                .eq('target_type', 'video')
                .eq('target_id', videoId)
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
        if (!content || !currentVideo) return;

        try {
            const { data, error } = await supabase
                .from('comments')
                .insert({
                    content: content,
                    user_id: 'current_user_id', // 实际应用中应该是真实的用户ID
                    target_type: 'video',
                    target_id: currentVideo.id
                })
                .select()
                .single();

            if (error) throw error;

            // 清空输入框
            elements.commentText.value = '';

            // 重新加载评论
            await loadComments(currentVideo.id);
        } catch (error) {
            console.error('提交评论失败:', error);
            alert('提交评论失败，请稍后重试');
        }
    }

    // 筛选视频
    function filterVideos() {
        const category = elements.categoryFilter.value;
        const searchTerm = elements.searchInput.value.toLowerCase().trim();

        filteredVideos = allVideos.filter(video => {
            // 分类筛选
            if (category && !video.tags.includes(category)) {
                return false;
            }

            // 搜索关键词筛选
            if (searchTerm && !video.title.toLowerCase().includes(searchTerm)) {
                return false;
            }

            return true;
        });

        renderVideos(filteredVideos);
    }

    // 重置筛选器
    function resetFilters() {
        elements.categoryFilter.value = '';
        elements.searchInput.value = '';
        filteredVideos = [...allVideos];
        renderVideos(filteredVideos);
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

    console.log('视频模块已加载');

})();