/**
 * Renderer process for NAS Music Player
 * Handles UI interactions and music playback
 */

import './index.css';
import { NASService, NASCredentials, MusicFile } from './nas-service';

interface Song {
  name: string;
  path: string;
  artist?: string;
  duration?: number;
}

class MusicPlayer {
  private audioPlayer: HTMLAudioElement;
  private currentSongIndex: number = -1;
  private playlist: Song[] = [];
  private isPlaying: boolean = false;
  private nasService: NASService;

  constructor() {
    this.audioPlayer = document.getElementById('audioPlayer') as HTMLAudioElement;
    this.nasService = new NASService();
    this.initializeEventListeners();
  }

  private initializeEventListeners() {
    // NAS Connection
    const connectBtn = document.getElementById('connectBtn');
    connectBtn?.addEventListener('click', () => this.connectToNAS());

    // Player controls
    const playBtn = document.getElementById('playBtn');
    const prevBtn = document.getElementById('prevBtn');
    const nextBtn = document.getElementById('nextBtn');
    
    playBtn?.addEventListener('click', () => this.togglePlay());
    prevBtn?.addEventListener('click', () => this.playPrevious());
    nextBtn?.addEventListener('click', () => this.playNext());

    // Volume control
    const volumeSlider = document.getElementById('volumeSlider') as HTMLInputElement;
    volumeSlider?.addEventListener('input', (e) => {
      const volume = parseInt((e.target as HTMLInputElement).value) / 100;
      this.audioPlayer.volume = volume;
    });

    // Progress bar
    const progressSlider = document.getElementById('progressSlider') as HTMLInputElement;
    progressSlider?.addEventListener('input', (e) => {
      const progress = parseInt((e.target as HTMLInputElement).value) / 100;
      this.audioPlayer.currentTime = this.audioPlayer.duration * progress;
    });

    // Audio events
    this.audioPlayer.addEventListener('timeupdate', () => this.updateProgress());
    this.audioPlayer.addEventListener('ended', () => this.playNext());
    this.audioPlayer.addEventListener('loadedmetadata', () => this.updateDuration());

    // Search
    const searchInput = document.getElementById('searchInput') as HTMLInputElement;
    searchInput?.addEventListener('input', (e) => {
      this.filterPlaylist((e.target as HTMLInputElement).value);
    });
  }

  private async connectToNAS() {
    const address = (document.getElementById('nasAddress') as HTMLInputElement).value;
    const username = (document.getElementById('nasUsername') as HTMLInputElement).value;
    const password = (document.getElementById('nasPassword') as HTMLInputElement).value;
    const musicPath = (document.getElementById('musicPath') as HTMLInputElement).value;

    console.log('=== 开始连接NAS ===');
    console.log('NAS地址:', address);
    console.log('用户名:', username);
    console.log('音乐路径:', musicPath);

    if (!address) {
      this.showStatus('请输入NAS地址', 'error');
      console.error('错误: NAS地址为空');
      return;
    }

    const credentials: NASCredentials = { address, username, password, musicPath };
    this.showStatus('正在连接...', '');

    try {
      console.log('正在验证登录...');
      await this.nasService.connect(credentials);
      console.log('登录成功，正在加载音乐文件...');
      await this.loadMusicFromNAS();
      this.showStatus('✓ 连接成功', 'success');
      console.log('=== NAS连接完成 ===');
    } catch (error) {
      const errorMsg = '✗ 连接失败: ' + (error as Error).message;
      this.showStatus(errorMsg, 'error');
      console.error('=== 连接失败 ===');
      console.error('错误详情:', error);
    }
  }

  private async loadMusicFromNAS() {
    try {
      console.log('正在获取音乐文件列表...');
      const files = await this.nasService.listMusicFiles();
      console.log('获取到文件:', files);
      
      this.playlist = files
        .filter((file: MusicFile) => !file.isDirectory)
        .map((file: MusicFile) => ({
          name: file.name,
          path: file.path,
          artist: 'Unknown Artist',
          duration: 0
        }));

      console.log(`已加载 ${this.playlist.length} 首歌曲`);
      this.renderPlaylist();
    } catch (error) {
      console.error('加载音乐文件失败:', error);
      this.showStatus('加载音乐文件失败', 'error');
    }
  }

  private renderPlaylist() {
    const musicList = document.getElementById('musicList');
    if (!musicList) return;

    musicList.innerHTML = '';
    
    this.playlist.forEach((song, index) => {
      const item = document.createElement('div');
      item.className = 'music-item';
      if (index === this.currentSongIndex) {
        item.classList.add('active');
      }

      const duration = song.duration ? this.formatTime(song.duration) : '--:--';
      
      item.innerHTML = `
        <div class="music-item-info">
          <div class="music-item-title">${song.name}</div>
          <div class="music-item-artist">${song.artist || 'Unknown Artist'}</div>
        </div>
        <div class="music-item-duration">${duration}</div>
      `;

      item.addEventListener('click', () => this.playSong(index));
      musicList.appendChild(item);
    });
  }

  private filterPlaylist(query: string) {
    const items = document.querySelectorAll('.music-item');
    const searchTerm = query.toLowerCase();

    items.forEach((item, index) => {
      const song = this.playlist[index];
      const matchesSearch = 
        song.name.toLowerCase().includes(searchTerm) ||
        (song.artist?.toLowerCase().includes(searchTerm) || false);
      
      (item as HTMLElement).style.display = matchesSearch ? 'flex' : 'none';
    });
  }

  private playSong(index: number) {
    if (index < 0 || index >= this.playlist.length) return;

    this.currentSongIndex = index;
    const song = this.playlist[index];

    console.log('准备播放歌曲:', song.name);

    // Update UI
    const songTitle = document.getElementById('songTitle');
    const songArtist = document.getElementById('songArtist');
    
    if (songTitle) songTitle.textContent = song.name;
    if (songArtist) songArtist.textContent = song.artist || 'Unknown Artist';

    // Get the streaming URL from NAS service
    try {
      const streamUrl = this.nasService.getMusicStreamUrl(song.path);
      console.log('音频流URL:', streamUrl);
      this.audioPlayer.src = streamUrl;
      this.audioPlayer.play();
      this.isPlaying = true;
      console.log('开始播放');
    } catch (error) {
      console.error('播放歌曲失败:', error);
      this.showStatus('播放歌曲失败', 'error');
      this.isPlaying = false;
    }

    this.updatePlayButton();
    this.renderPlaylist();
  }

  private togglePlay() {
    if (this.currentSongIndex === -1 && this.playlist.length > 0) {
      this.playSong(0);
      return;
    }

    if (this.isPlaying) {
      this.audioPlayer.pause();
      this.isPlaying = false;
    } else {
      this.audioPlayer.play();
      this.isPlaying = true;
    }

    this.updatePlayButton();
  }

  private playNext() {
    if (this.playlist.length === 0) return;
    const nextIndex = (this.currentSongIndex + 1) % this.playlist.length;
    this.playSong(nextIndex);
  }

  private playPrevious() {
    if (this.playlist.length === 0) return;
    const prevIndex = this.currentSongIndex - 1 < 0 
      ? this.playlist.length - 1 
      : this.currentSongIndex - 1;
    this.playSong(prevIndex);
  }

  private updatePlayButton() {
    const playBtn = document.getElementById('playBtn');
    if (playBtn) {
      playBtn.textContent = this.isPlaying ? '⏸' : '▶';
    }
  }

  private updateProgress() {
    const progressSlider = document.getElementById('progressSlider') as HTMLInputElement;
    const currentTimeEl = document.getElementById('currentTime');
    
    if (this.audioPlayer.duration) {
      const progress = (this.audioPlayer.currentTime / this.audioPlayer.duration) * 100;
      if (progressSlider) progressSlider.value = progress.toString();
      if (currentTimeEl) currentTimeEl.textContent = this.formatTime(this.audioPlayer.currentTime);
    }
  }

  private updateDuration() {
    const durationEl = document.getElementById('duration');
    if (durationEl) {
      durationEl.textContent = this.formatTime(this.audioPlayer.duration);
    }
  }

  private formatTime(seconds: number): string {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  }

  private showStatus(message: string, type: string) {
    const status = document.getElementById('connectionStatus');
    if (status) {
      status.textContent = message;
      status.className = `status ${type}`;
    }
  }
}

// Initialize the music player when DOM is loaded
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    new MusicPlayer();
  });
} else {
  new MusicPlayer();
}

console.log('🎵 NAS Music Player loaded');

