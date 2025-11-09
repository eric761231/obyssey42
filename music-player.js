// 全站背景音樂播放器
(function() {
    'use strict';

    // 音樂播放狀態管理（使用 localStorage 保持跨頁面狀態）
    const MusicPlayer = {
        audio: null,
        isPlaying: false,
        volume: 0.5, // 預設音量 50%
        currentTime: 0,
        musicSrc: '', // 音樂檔案路徑，需要設置

        // 初始化
        init: function(musicSrc) {
            this.musicSrc = musicSrc;
            
            // 從 localStorage 讀取播放狀態
            const savedState = localStorage.getItem('musicPlayerState');
            if (savedState) {
                try {
                    const state = JSON.parse(savedState);
                    this.isPlaying = state.isPlaying || false;
                    this.volume = state.volume !== undefined ? state.volume : 0.5;
                    this.currentTime = state.currentTime || 0;
                } catch (e) {
                    console.error('讀取音樂播放狀態失敗:', e);
                }
            }

            // 創建音頻元素
            this.createAudioElement();
            
            // 創建播放器 UI
            this.createPlayerUI();
            
            // 綁定事件
            this.bindEvents();
            
            // 如果之前是播放狀態，嘗試恢復播放
            if (this.isPlaying) {
                // 需要用戶交互後才能自動播放
                this.audio.currentTime = this.currentTime;
                this.audio.volume = this.volume;
            }
        },

        // 創建音頻元素
        createAudioElement: function() {
            this.audio = document.createElement('audio');
            this.audio.src = this.musicSrc;
            this.audio.loop = true;
            this.audio.volume = this.volume;
            this.audio.preload = 'auto';
            
            // 音頻事件監聽
            this.audio.addEventListener('loadedmetadata', () => {
                if (this.currentTime > 0) {
                    this.audio.currentTime = this.currentTime;
                }
            });

            this.audio.addEventListener('timeupdate', () => {
                this.currentTime = this.audio.currentTime;
                this.saveState();
            });

            this.audio.addEventListener('ended', () => {
                // 循環播放，不會觸發 ended
            });

            document.body.appendChild(this.audio);
        },

        // 創建播放器 UI
        createPlayerUI: function() {
            const playerContainer = document.createElement('div');
            playerContainer.id = 'musicPlayerContainer';
            playerContainer.innerHTML = `
                <div class="music-player">
                    <button id="musicToggleBtn" class="music-toggle-btn" aria-label="播放/暫停音樂">
                        <span class="music-icon play-icon">▶</span>
                        <span class="music-icon pause-icon" style="display: none;">⏸</span>
                    </button>
                    <div class="music-controls">
                        <input type="range" id="musicVolumeSlider" class="music-volume-slider" 
                               min="0" max="100" value="${this.volume * 100}" 
                               aria-label="音量控制">
                        <span class="music-volume-icon">🔊</span>
                    </div>
                </div>
            `;
            document.body.appendChild(playerContainer);
            
            // 更新播放按鈕狀態
            this.updatePlayButton();
        },

        // 綁定事件
        bindEvents: function() {
            const toggleBtn = document.getElementById('musicToggleBtn');
            const volumeSlider = document.getElementById('musicVolumeSlider');

            // 播放/暫停按鈕
            if (toggleBtn) {
                toggleBtn.addEventListener('click', () => {
                    this.toggle();
                });
            }

            // 音量控制
            if (volumeSlider) {
                volumeSlider.addEventListener('input', (e) => {
                    this.setVolume(e.target.value / 100);
                });
            }

            // 頁面可見性變化時暫停/恢復
            document.addEventListener('visibilitychange', () => {
                if (document.hidden) {
                    // 頁面隱藏時保存狀態
                    this.saveState();
                } else {
                    // 頁面顯示時恢復播放（如果之前是播放狀態）
                    if (this.isPlaying && this.audio.paused) {
                        this.play().catch(() => {
                            // 自動播放失敗，需要用戶點擊
                        });
                    }
                }
            });

            // 頁面卸載前保存狀態
            window.addEventListener('beforeunload', () => {
                this.saveState();
            });
        },

        // 播放
        play: function() {
            if (!this.audio) return Promise.reject();
            
            return this.audio.play().then(() => {
                this.isPlaying = true;
                this.updatePlayButton();
                this.saveState();
            }).catch((error) => {
                console.log('播放失敗，可能需要用戶交互:', error);
                this.isPlaying = false;
                this.updatePlayButton();
            });
        },

        // 暫停
        pause: function() {
            if (!this.audio) return;
            this.audio.pause();
            this.isPlaying = false;
            this.updatePlayButton();
            this.saveState();
        },

        // 切換播放/暫停
        toggle: function() {
            if (this.isPlaying) {
                this.pause();
            } else {
                this.play();
            }
        },

        // 設置音量
        setVolume: function(volume) {
            this.volume = Math.max(0, Math.min(1, volume));
            if (this.audio) {
                this.audio.volume = this.volume;
            }
            this.saveState();
        },

        // 更新播放按鈕狀態
        updatePlayButton: function() {
            const playIcon = document.querySelector('.play-icon');
            const pauseIcon = document.querySelector('.pause-icon');
            
            if (this.isPlaying) {
                if (playIcon) playIcon.style.display = 'none';
                if (pauseIcon) pauseIcon.style.display = 'inline';
            } else {
                if (playIcon) playIcon.style.display = 'inline';
                if (pauseIcon) pauseIcon.style.display = 'none';
            }
        },

        // 保存狀態到 localStorage
        saveState: function() {
            try {
                const state = {
                    isPlaying: this.isPlaying,
                    volume: this.volume,
                    currentTime: this.currentTime
                };
                localStorage.setItem('musicPlayerState', JSON.stringify(state));
            } catch (e) {
                console.error('保存音樂播放狀態失敗:', e);
            }
        }
    };

    // 導出到全局
    window.MusicPlayer = MusicPlayer;

    // 當 DOM 載入完成後初始化
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => {
            // 音樂檔案路徑，請替換為實際的音樂檔案
            const musicSrc = 'music/background-music.mp3'; // 預設路徑，可以修改
            MusicPlayer.init(musicSrc);
        });
    } else {
        const musicSrc = 'music/background-music.mp3';
        MusicPlayer.init(musicSrc);
    }
})();

