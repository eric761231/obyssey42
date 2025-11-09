// 全站背景音樂播放器 - 自動播放版本
(function() {
    'use strict';

    // 音樂播放狀態管理（使用 localStorage 保持跨頁面狀態）
    const MusicPlayer = {
        audio: null,
        isPlaying: false,
        volume: 0.5, // 預設音量 50%
        currentTime: 0,
        musicSrc: '',
        hasUserInteracted: false, // 標記用戶是否已交互
        isLoaded: false, // 標記音頻是否已載入

        // 初始化
        init: function(musicSrc) {
            this.musicSrc = musicSrc;
            
            // 從 localStorage 讀取播放狀態
            const savedState = localStorage.getItem('musicPlayerState');
            if (savedState) {
                try {
                    const state = JSON.parse(savedState);
                    this.isPlaying = state.isPlaying !== undefined ? state.isPlaying : true;
                    this.volume = state.volume !== undefined ? state.volume : 0.5;
                    this.currentTime = state.currentTime || 0;
                } catch (e) {
                    console.error('讀取音樂播放狀態失敗:', e);
                    this.isPlaying = true;
                }
            } else {
                this.isPlaying = true; // 首次訪問，預設自動播放
            }

            // 創建音頻元素
            this.createAudioElement();
            
            // 綁定事件
            this.bindEvents();
        },

        // 創建音頻元素
        createAudioElement: function() {
            this.audio = document.createElement('audio');
            this.audio.src = this.musicSrc;
            this.audio.loop = true;
            this.audio.volume = this.volume;
            this.audio.preload = 'auto';
            
            // 音頻載入成功
            this.audio.addEventListener('canplaythrough', () => {
                this.isLoaded = true;
                console.log('音樂檔案載入成功');
                // 如果用戶已交互，立即播放
                if (this.hasUserInteracted && this.isPlaying) {
                    this.play().catch(err => {
                        console.log('播放失敗:', err);
                    });
                }
            });

            // 音頻載入錯誤
            this.audio.addEventListener('error', (e) => {
                console.error('音樂檔案載入失敗:', e);
                console.error('音樂檔案路徑:', this.musicSrc);
            });

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

            this.audio.addEventListener('play', () => {
                this.isPlaying = true;
                console.log('音樂開始播放');
                this.saveState();
            });

            this.audio.addEventListener('pause', () => {
                this.isPlaying = false;
                console.log('音樂已暫停');
                this.saveState();
            });

            document.body.appendChild(this.audio);
        },

        // 綁定事件
        bindEvents: function() {
            // 頁面可見性變化時暫停/恢復
            document.addEventListener('visibilitychange', () => {
                if (document.hidden) {
                    // 頁面隱藏時保存狀態
                    this.saveState();
                } else {
                    // 頁面顯示時恢復播放（如果之前是播放狀態）
                    if (this.isPlaying && this.audio && this.audio.paused) {
                        this.play().catch(() => {
                            // 自動播放失敗
                        });
                    }
                }
            });

            // 頁面卸載前保存狀態
            window.addEventListener('beforeunload', () => {
                this.saveState();
            });

            // 處理用戶交互以觸發自動播放
            const userInteractionEvents = ['click', 'touchstart', 'keydown', 'mousedown'];
            const handleUserInteraction = () => {
                if (!this.hasUserInteracted) {
                    this.hasUserInteracted = true;
                    console.log('檢測到用戶交互，嘗試播放音樂');
                    console.log('音頻狀態 - isLoaded:', this.isLoaded, 'isPlaying:', this.isPlaying, 'paused:', this.audio ? this.audio.paused : 'N/A');
                    
                    // 確保要播放
                    this.isPlaying = true;
                    
                    // 確保音頻已載入
                    if (this.isLoaded) {
                        // 立即嘗試播放
                        if (this.audio && this.audio.paused) {
                            this.play().catch(err => {
                                console.error('用戶交互後播放失敗:', err);
                            });
                        } else if (this.audio && !this.audio.paused) {
                            console.log('音樂已經在播放中');
                        }
                    } else {
                        // 如果還沒載入，等待載入完成
                        console.log('等待音樂檔案載入完成...');
                        this.audio.addEventListener('canplaythrough', () => {
                            console.log('音樂載入完成，開始播放');
                            if (this.audio && this.audio.paused) {
                                this.play().catch(err => {
                                    console.error('載入完成後播放失敗:', err);
                                });
                            }
                        }, { once: true });
                    }
                }
            };

            // 監聽所有用戶交互事件
            userInteractionEvents.forEach(event => {
                document.addEventListener(event, handleUserInteraction, { once: false, passive: true });
            });

            // 也嘗試自動播放（可能被瀏覽器阻止）
            setTimeout(() => {
                if (this.isPlaying && this.audio && !this.audio.paused) {
                    // 已經在播放
                    return;
                }
                if (this.isLoaded && this.isPlaying) {
                    this.play().catch(err => {
                        console.log('自動播放被阻止（這是正常的）:', err.message);
                    });
                }
            }, 500);
        },

        // 播放
        play: function() {
            if (!this.audio) {
                console.error('音頻元素不存在');
                return Promise.reject(new Error('音頻元素不存在'));
            }
            
            // 確保音量設置正確
            this.audio.volume = this.volume;
            
            return this.audio.play().then(() => {
                this.isPlaying = true;
                this.saveState();
                console.log('音樂播放成功，音量:', this.volume);
            }).catch((error) => {
                console.error('播放失敗:', error);
                this.isPlaying = false;
                throw error;
            });
        },

        // 暫停
        pause: function() {
            if (!this.audio) return;
            this.audio.pause();
            this.isPlaying = false;
            this.saveState();
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

    // 導出到全局（如果需要外部控制）
    window.MusicPlayer = MusicPlayer;

    // 當 DOM 載入完成後初始化
    // 使用相對於根目錄的路徑
    function getMusicPath() {
        // 嘗試多種路徑格式
        const basePath = window.location.pathname.replace(/\/[^/]*$/, '/');
        const paths = [
            'music/background-music.mp3',
            './music/background-music.mp3',
            basePath + 'music/background-music.mp3',
            '/music/background-music.mp3'
        ];
        return paths[0]; // 預設使用相對路徑
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => {
            const musicSrc = getMusicPath();
            console.log('初始化音樂播放器，音樂檔案:', musicSrc);
            console.log('當前頁面路徑:', window.location.pathname);
            MusicPlayer.init(musicSrc);
        });
    } else {
        const musicSrc = getMusicPath();
        console.log('初始化音樂播放器，音樂檔案:', musicSrc);
        console.log('當前頁面路徑:', window.location.pathname);
        MusicPlayer.init(musicSrc);
    }
})();
