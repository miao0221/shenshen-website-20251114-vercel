import { PLAYER_CONFIG } from '../config.js';

// 创建音频播放器
export function createAudioPlayer(src, containerId) {
    const container = document.getElementById(containerId);
    if (!container) return;
    
    const playerHTML = `
        <div class="audio-player" id="audio-player">
            <audio id="audio-element" src="${src}"></audio>
            <div class="player-controls">
                <button id="play-pause-btn">播放</button>
                <div class="progress-container">
                    <div class="progress-bar">
                        <div class="progress" id="progress"></div>
                    </div>
                </div>
                <div class="volume-container">
                    <input type="range" id="volume-slider" min="0" max="1" step="0.01" value="${PLAYER_CONFIG.VOLUME}">
                </div>
            </div>
        </div>
    `;
    
    container.innerHTML = playerHTML;
    
    // 添加事件监听器
    const audioElement = document.getElementById('audio-element');
    const playPauseBtn = document.getElementById('play-pause-btn');
    const progress = document.getElementById('progress');
    const volumeSlider = document.getElementById('volume-slider');
    
    playPauseBtn.addEventListener('click', () => {
        if (audioElement.paused) {
            audioElement.play();
            playPauseBtn.textContent = '暂停';
        } else {
            audioElement.pause();
            playPauseBtn.textContent = '播放';
        }
    });
    
    audioElement.addEventListener('timeupdate', () => {
        const percent = (audioElement.currentTime / audioElement.duration) * 100;
        progress.style.width = `${percent}%`;
    });
    
    volumeSlider.addEventListener('input', (e) => {
        audioElement.volume = e.target.value;
    });
}

// 创建视频播放器
export function createVideoPlayer(src, containerId) {
    const container = document.getElementById(containerId);
    if (!container) return;
    
    const playerHTML = `
        <div class="video-player">
            <video id="video-element" src="${src}" controls width="100%"></video>
        </div>
    `;
    
    container.innerHTML = playerHTML;
}