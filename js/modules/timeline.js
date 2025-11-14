// 时间轴模块
import { initSupabase } from '../config.js';
import { searchManager } from './search.js';

// 初始化时间轴模块

(function () {
    'use strict';

    // 初始化Supabase客户端
    const supabase = initSupabase();

    // 数据存储
    let allEvents = [];
    let filteredEvents = [];
    let currentView = 'timeline'; // 'timeline' 或 'calendar'
    let currentMonth = new Date().getMonth();
    let currentYear = new Date().getFullYear();

    // DOM元素
    const elements = {
        timelineViewBtn: document.getElementById('timeline-view'),
        calendarViewBtn: document.getElementById('calendar-view'),
        eventTypeFilter: document.getElementById('event-type-filter'),
        resetFiltersBtn: document.getElementById('reset-filters'),
        timelineContainer: document.getElementById('timeline-container'),
        calendarContainer: document.getElementById('calendar-container'),
        timelineContent: document.getElementById('timeline-content'),
        calendarDays: document.getElementById('calendar-days'),
        currentMonthYear: document.getElementById('current-month-year'),
        prevMonthBtn: document.getElementById('prev-month'),
        nextMonthBtn: document.getElementById('next-month'),
        loadingIndicator: document.getElementById('loading'),
        noResults: document.getElementById('no-results'),
        modal: document.getElementById('event-modal'),
        closeModal: document.querySelector('.close'),
        modalEventTitle: document.getElementById('modal-event-title'),
        modalEventDate: document.getElementById('modal-event-date'),
        modalEventType: document.getElementById('modal-event-type'),
        modalEventDescription: document.getElementById('modal-event-description'),
        modalEventMedia: document.getElementById('modal-event-media')
    };

    // 页面加载完成后初始化
    document.addEventListener('DOMContentLoaded', async function () {
        if (!document.querySelector('.timeline-section')) return;

        initializeEventListeners();
        await loadEvents();
        renderTimeline();
    });

    // 初始化事件监听器
    function initializeEventListeners() {
        // 视图切换
        elements.timelineViewBtn.addEventListener('click', () => switchView('timeline'));
        elements.calendarViewBtn.addEventListener('click', () => switchView('calendar'));

        // 筛选器事件
        elements.eventTypeFilter.addEventListener('change', filterEvents);
        elements.resetFiltersBtn.addEventListener('click', resetFilters);

        // 日历导航
        elements.prevMonthBtn.addEventListener('click', showPrevMonth);
        elements.nextMonthBtn.addEventListener('click', showNextMonth);

        // 模态框事件
        elements.closeModal.addEventListener('click', closeEventModal);
        window.addEventListener('click', function (event) {
            if (event.target === elements.modal) {
                closeEventModal();
            }
        });
    }

    // 从Supabase加载事件数据
    async function loadEvents() {
        showLoading(true);

        try {
            // 获取音乐作品数据
            const { data: songsData, error: songsError } = await supabase
                .from('songs')
                .select('id, title, release_date, cover_url, album, duration');

            if (songsError) throw songsError;

            // 获取视频数据
            const { data: videosData, error: videosError } = await supabase
                .from('videos')
                .select('id, title, publish_date, thumbnail_url, description, duration');

            if (videosError) throw videosError;

            // 整理音乐事件
            const musicEvents = songsData.map(song => ({
                id: song.id,
                title: song.title,
                date: song.release_date,
                type: 'music',
                typeName: '音乐作品',
                cover_url: song.cover_url,
                album: song.album,
                duration: song.duration,
                formattedDuration: formatDuration(song.duration),
                formattedDate: formatDate(song.release_date)
            }));

            // 整理视频事件
            const videoEvents = videosData.map(video => ({
                id: video.id,
                title: video.title,
                date: video.publish_date,
                type: 'video',
                typeName: '视频发布',
                cover_url: video.thumbnail_url,
                description: video.description,
                duration: video.duration,
                formattedDuration: formatDuration(video.duration),
                formattedDate: formatDate(video.publish_date)
            }));

            // 合并所有事件
            allEvents = [...musicEvents, ...videoEvents]
                .sort((a, b) => new Date(b.date) - new Date(a.date));

            filteredEvents = [...allEvents];
        } catch (error) {
            console.error('加载时间轴数据失败:', error);
            elements.timelineContent.innerHTML = '<p class="error">加载时间轴数据失败，请稍后重试。</p>';
        } finally {
            showLoading(false);
        }
    }

    // 渲染时间轴视图
    function renderTimeline() {
        if (filteredEvents.length === 0) {
            elements.noResults.classList.remove('hidden');
            elements.timelineContent.innerHTML = '';
            return;
        }

        elements.noResults.classList.add('hidden');

        // 按年份分组事件
        const eventsByYear = {};
        filteredEvents.forEach(event => {
            const year = new Date(event.date).getFullYear();
            if (!eventsByYear[year]) {
                eventsByYear[year] = [];
            }
            eventsByYear[year].push(event);
        });

        // 生成时间轴HTML
        let timelineHTML = '';
        Object.keys(eventsByYear)
            .sort((a, b) => b - a) // 按年份降序排列
            .forEach(year => {
                timelineHTML += `<div class="timeline-year"><h2>${year}年</h2>`;
                eventsByYear[year]
                    .sort((a, b) => new Date(b.date) - new Date(a.date)) // 按日期降序排列
                    .forEach(event => {
                        timelineHTML += `
                            <div class="timeline-item" data-id="${event.id}" data-type="${event.type}">
                                <div class="timeline-date">${formatMonthDay(event.date)}</div>
                                <div class="timeline-content">
                                    <div class="timeline-image">
                                        <img src="${event.cover_url || 'https://placehold.co/100'}" alt="${event.title}">
                                    </div>
                                    <div class="timeline-text">
                                        <h3>${event.title}</h3>
                                        <p class="event-type-tag">${event.typeName}</p>
                                        <p class="event-meta">${event.formattedDate} | ${event.formattedDuration || ''}</p>
                                        ${event.album ? `<p class="event-album">专辑: ${event.album}</p>` : ''}
                                    </div>
                                </div>
                            </div>
                        `;
                    });
                timelineHTML += '</div>';
            });

        elements.timelineContent.innerHTML = timelineHTML;

        // 为每个时间轴项添加点击事件
        document.querySelectorAll('.timeline-item').forEach(item => {
            item.addEventListener('click', function () {
                const eventId = this.getAttribute('data-id');
                const eventType = this.getAttribute('data-type');
                openEventDetail(eventId, eventType);
            });
        });
    }

    // 渲染日历视图
    function renderCalendar() {
        // 更新月份年份显示
        const monthNames = ['一月', '二月', '三月', '四月', '五月', '六月',
            '七月', '八月', '九月', '十月', '十一月', '十二月'];
        elements.currentMonthYear.textContent = `${currentYear}年 ${monthNames[currentMonth]}`;

        // 获取当月的第一天和最后一天
        const firstDay = new Date(currentYear, currentMonth, 1);
        const lastDay = new Date(currentYear, currentMonth + 1, 0);
        const daysInMonth = lastDay.getDate();

        // 获取第一天是星期几 (0=Sunday, 1=Monday, ..., 6=Saturday)
        const firstDayOfWeek = firstDay.getDay();

        // 清空日历
        elements.calendarDays.innerHTML = '';

        // 添加空白日期格子（上个月）
        for (let i = 0; i < firstDayOfWeek; i++) {
            const emptyDay = document.createElement('div');
            emptyDay.classList.add('calendar-day', 'empty');
            elements.calendarDays.appendChild(emptyDay);
        }

        // 获取当月事件
        const monthEvents = filteredEvents.filter(event => {
            const eventDate = new Date(event.date);
            return eventDate.getFullYear() === currentYear && eventDate.getMonth() === currentMonth;
        });

        // 添加日期格子
        for (let day = 1; day <= daysInMonth; day++) {
            const dayElement = document.createElement('div');
            dayElement.classList.add('calendar-day');
            dayElement.innerHTML = `<div class="day-number">${day}</div>`;

            // 查找当天的事件
            const dayEvents = monthEvents.filter(event => {
                const eventDate = new Date(event.date);
                return eventDate.getDate() === day;
            });

            // 添加事件指示器
            if (dayEvents.length > 0) {
                const eventsContainer = document.createElement('div');
                eventsContainer.classList.add('day-events');

                // 最多显示3个事件
                dayEvents.slice(0, 3).forEach(event => {
                    const eventIndicator = document.createElement('div');
                    eventIndicator.classList.add('event-indicator', `event-${event.type}`);
                    eventIndicator.title = event.title;
                    eventIndicator.dataset.id = event.id;
                    eventIndicator.dataset.type = event.type;
                    eventsContainer.appendChild(eventIndicator);
                });

                // 如果事件超过3个，显示更多指示器
                if (dayEvents.length > 3) {
                    const moreIndicator = document.createElement('div');
                    moreIndicator.classList.add('event-more');
                    moreIndicator.textContent = `+${dayEvents.length - 3}`;
                    eventsContainer.appendChild(moreIndicator);
                }

                dayElement.appendChild(eventsContainer);

                // 为事件指示器添加点击事件
                eventsContainer.querySelectorAll('.event-indicator').forEach(indicator => {
                    indicator.addEventListener('click', function (e) {
                        e.stopPropagation();
                        const eventId = this.dataset.id;
                        const eventType = this.dataset.type;
                        openEventDetail(eventId, eventType);
                    });
                });
            }

            // 为日期格子添加点击事件
            dayElement.addEventListener('click', function () {
                // 如果当天有事件，打开事件详情
                if (dayEvents.length > 0) {
                    const firstEvent = dayEvents[0];
                    openEventDetail(firstEvent.id, firstEvent.type);
                }
            });

            elements.calendarDays.appendChild(dayElement);
        }
    }

    // 切换视图
    function switchView(view) {
        currentView = view;

        // 更新按钮状态
        elements.timelineViewBtn.classList.toggle('active', view === 'timeline');
        elements.calendarViewBtn.classList.toggle('active', view === 'calendar');

        // 显示相应视图
        if (view === 'timeline') {
            elements.timelineContainer.classList.remove('hidden');
            elements.calendarContainer.classList.add('hidden');
        } else {
            elements.timelineContainer.classList.add('hidden');
            elements.calendarContainer.classList.remove('hidden');
            renderCalendar();
        }
    }

    // 显示上个月
    function showPrevMonth() {
        currentMonth--;
        if (currentMonth < 0) {
            currentMonth = 11;
            currentYear--;
        }
        renderCalendar();
    }

    // 显示下个月
    function showNextMonth() {
        currentMonth++;
        if (currentMonth > 11) {
            currentMonth = 0;
            currentYear++;
        }
        renderCalendar();
    }

    // 筛选事件
    function filterEvents() {
        const eventType = elements.eventTypeFilter.value;

        filteredEvents = eventType 
            ? allEvents.filter(event => event.type === eventType)
            : [...allEvents];

        // 重新渲染当前视图
        if (currentView === 'timeline') {
            renderTimeline();
        } else {
            renderCalendar();
        }
    }

    // 重置筛选器
    function resetFilters() {
        elements.eventTypeFilter.value = '';
        filteredEvents = [...allEvents];

        // 重新渲染当前视图
        if (currentView === 'timeline') {
            renderTimeline();
        } else {
            renderCalendar();
        }
    }

    // 打开事件详情模态框
    function openEventDetail(eventId, eventType) {
        const event = allEvents.find(e => e.id === eventId);
        if (!event) return;

        // 更新模态框内容
        elements.modalEventTitle.textContent = event.title;
        elements.modalEventDate.textContent = event.formattedDate;
        elements.modalEventType.textContent = event.typeName;
        elements.modalEventType.className = 'event-type ' + event.type;
        
        if (event.type === 'music') {
            elements.modalEventDescription.innerHTML = `
                <p><strong>专辑:</strong> ${event.album || '未知'}</p>
                <p><strong>时长:</strong> ${event.formattedDuration || '未知'}</p>
            `;
        } else if (event.type === 'video') {
            elements.modalEventDescription.innerHTML = `
                <p>${event.description || '暂无描述'}</p>
                <p><strong>时长:</strong> ${event.formattedDuration || '未知'}</p>
            `;
        }

        // 添加媒体内容（图片或链接）
        if (event.cover_url) {
            elements.modalEventMedia.innerHTML = `
                <img src="${event.cover_url}" alt="${event.title}" class="event-media-img">
            `;
        } else {
            elements.modalEventMedia.innerHTML = '';
        }

        // 显示模态框
        elements.modal.classList.remove('hidden');
        document.body.style.overflow = 'hidden'; // 防止背景滚动
    }

    // 关闭事件详情模态框
    function closeEventModal() {
        elements.modal.classList.add('hidden');
        document.body.style.overflow = ''; // 恢复背景滚动
    }

    // 工具函数：格式化时长（秒 -> mm:ss）
    function formatDuration(seconds) {
        if (!seconds) return '';
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

    // 工具函数：格式化月日 (MM-DD)
    function formatMonthDay(dateString) {
        if (!dateString) return '';
        const date = new Date(dateString);
        return `${(date.getMonth() + 1).toString().padStart(2, '0')}/${date.getDate().toString().padStart(2, '0')}`;
    }

    // 显示/隐藏加载指示器
    function showLoading(show) {
        if (show) {
            elements.loadingIndicator.classList.remove('hidden');
        } else {
            elements.loadingIndicator.classList.add('hidden');
        }
    }

    console.log('时间轴模块已加载');

})();