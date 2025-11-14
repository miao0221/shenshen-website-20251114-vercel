import { eventBus } from '../utils/EventBus.js';

// 音乐播放状态管理器
class MusicPlayer {
  constructor() {
    this.currentTrack = null;
    this.isPlaying = false;
    this.volume = 1.0;
    this.progress = 0;
    this.duration = 0;
    this.playlist = [];
    this.currentIndex = 0;
  }

  // 设置当前播放曲目
  setCurrentTrack(track) {
    this.currentTrack = track;
    eventBus.emit('musicTrackChange', track);
  }

  // 开始播放
  play() {
    this.isPlaying = true;
    eventBus.emit('musicPlay');
  }

  // 暂停播放
  pause() {
    this.isPlaying = false;
    eventBus.emit('musicPause');
  }

  // 停止播放
  stop() {
    this.isPlaying = false;
    this.progress = 0;
    eventBus.emit('musicStop');
  }

  // 设置音量
  setVolume(volume) {
    this.volume = Math.max(0, Math.min(1, volume));
    eventBus.emit('musicVolumeChange', this.volume);
  }

  // 设置播放进度
  setProgress(progress) {
    this.progress = progress;
    eventBus.emit('musicProgressChange', progress);
  }

  // 设置总时长
  setDuration(duration) {
    this.duration = duration;
    eventBus.emit('musicDurationChange', duration);
  }

  // 设置播放列表
  setPlaylist(playlist) {
    this.playlist = playlist;
    eventBus.emit('musicPlaylistChange', playlist);
  }

  // 播放下一首
  next() {
    if (this.playlist.length > 0) {
      this.currentIndex = (this.currentIndex + 1) % this.playlist.length;
      this.setCurrentTrack(this.playlist[this.currentIndex]);
      this.play();
    }
    eventBus.emit('musicNext');
  }

  // 播放上一首
  previous() {
    if (this.playlist.length > 0) {
      this.currentIndex = (this.currentIndex - 1 + this.playlist.length) % this.playlist.length;
      this.setCurrentTrack(this.playlist[this.currentIndex]);
      this.play();
    }
    eventBus.emit('musicPrevious');
  }

  // 获取播放状态
  getStatus() {
    return {
      currentTrack: this.currentTrack,
      isPlaying: this.isPlaying,
      volume: this.volume,
      progress: this.progress,
      duration: this.duration,
      playlist: this.playlist,
      currentIndex: this.currentIndex
    };
  }
}

// 创建并导出音乐播放器实例
const musicPlayer = new MusicPlayer();

export { musicPlayer };
export default MusicPlayer;