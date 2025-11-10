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
            // 手機優化：使用 'auto' 預載入，確保音頻盡快載入
            this.audio.preload = 'auto';
            // 手機優化：添加 playsinline 屬性（iOS Safari 需要）
            this.audio.setAttribute('playsinline', '');
            this.audio.setAttribute('webkit-playsinline', '');
            // 安卓優化：確保音頻元素可見（某些安卓瀏覽器需要）
            this.audio.style.display = 'block';
            this.audio.style.width = '1px';
            this.audio.style.height = '1px';
            this.audio.style.opacity = '0';
            this.audio.style.position = 'absolute';
            this.audio.style.pointerEvents = 'none';
            
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
                if (this.audio.error) {
                    console.error('錯誤代碼:', this.audio.error.code);
                    console.error('錯誤訊息:', this.audio.error.message);
                    
                    // 錯誤代碼說明
                    const errorMessages = {
                        1: 'MEDIA_ERR_ABORTED - 用戶中止載入',
                        2: 'MEDIA_ERR_NETWORK - 網路錯誤',
                        3: 'MEDIA_ERR_DECODE - 解碼錯誤',
                        4: 'MEDIA_ERR_SRC_NOT_SUPPORTED - 不支援的格式或來源'
                    };
                    console.error('錯誤說明:', errorMessages[this.audio.error.code] || '未知錯誤');
                    
                    // Google Drive 特殊處理
                    if (this.musicSrc.includes('drive.google.com')) {
                        console.error('');
                        console.error('⚠️ Google Drive 載入失敗的可能原因：');
                        console.error('1. 檔案太大（>100MB），Google Drive 會顯示病毒掃描警告頁面');
                        console.error('2. 檔案權限未設為公開（需要「知道連結的使用者」可檢視）');
                        console.error('3. CORS 跨域限制');
                        console.error('');
                        console.error('💡 解決方案：');
                        console.error('1. 使用 Dropbox（推薦）- 更適合大檔案');
                        console.error('2. 使用其他 CDN 服務（Cloudinary、AWS S3 等）');
                        console.error('3. 將檔案壓縮後再上傳到 Google Drive');
                        console.error('4. 或將檔案上傳到 Netlify 的 public 資料夾');
                    }
                }
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

            // 處理用戶交互以觸發自動播放（手機優化版）
            // 手機瀏覽器需要更積極的交互檢測
            const userInteractionEvents = [
                'click', 
                'touchstart', 
                'touchend',  // 添加 touchend
                'touchmove',  // 添加 touchmove
                'keydown', 
                'mousedown',
                'pointerdown', // 添加指針事件（現代瀏覽器）
                'gesturestart', // 手勢開始
                'gesturechange' // 手勢變化
            ];
            
            // 安卓特別優化：單獨監聽滾動事件（更積極）
            let scrollInteractionCount = 0;
            const handleScrollInteraction = () => {
                scrollInteractionCount++;
                // 滾動超過一定距離才觸發（避免誤觸發）
                if (scrollInteractionCount >= 3) {
                    if (!this.hasUserInteracted) {
                        console.log('檢測到滾動交互，觸發音樂播放');
                        this.hasUserInteracted = true;
                        this.isPlaying = true;
                        this.tryPlayMusic();
                    }
                    // 移除滾動監聽（避免重複觸發）
                    window.removeEventListener('scroll', handleScrollInteraction, { passive: true });
                }
            };
            
            // 監聽滾動事件（安卓手機常見的交互方式）
            window.addEventListener('scroll', handleScrollInteraction, { passive: true });
            
            // 統一的播放嘗試函數
            this.tryPlayMusic = () => {
                if (!this.audio) {
                    console.error('音頻元素不存在');
                    return;
                }
                
                console.log('嘗試播放音樂...');
                console.log('音頻狀態 - isLoaded:', this.isLoaded, 'isPlaying:', this.isPlaying, 'paused:', this.audio ? this.audio.paused : 'N/A');
                console.log('音頻 readyState:', this.audio ? this.audio.readyState : 'N/A');
                
                // 確保要播放
                this.isPlaying = true;
                
                // 安卓瀏覽器可能需要音頻元素在 DOM 中才能播放
                if (!document.body.contains(this.audio)) {
                    console.log('音頻元素不在 DOM 中，添加到 DOM');
                    document.body.appendChild(this.audio);
                }
                
                // 確保音量設置正確
                this.audio.volume = this.volume;
                
                // 如果音頻還沒開始載入，觸發載入
                if (this.audio.readyState === 0) {
                    console.log('音頻尚未載入，觸發載入...');
                    this.audio.load();
                }
                
                // 立即嘗試播放（即使 readyState 較低）
                const playPromise = this.audio.play();
                
                if (playPromise !== undefined) {
                    playPromise.then(() => {
                        console.log('✅ 音樂播放成功！');
                        this.isPlaying = true;
                        this.saveState();
                    }).catch(err => {
                        console.log('❌ 播放嘗試失敗:', err.message);
                        console.log('音頻 readyState:', this.audio.readyState);
                        
                        // 如果失敗，等待載入完成後再試
                        if (this.audio.readyState < 2) {
                            console.log('等待音頻載入...');
                            const onCanPlay = () => {
                                console.log('音頻載入完成，再次嘗試播放');
                                this.audio.volume = this.volume;
                                this.audio.play().then(() => {
                                    console.log('✅ 音樂播放成功！');
                                    this.isPlaying = true;
                                    this.saveState();
                                }).catch(e => {
                                    console.error('❌ 載入完成後播放失敗:', e);
                                    // 再試一次
                                    setTimeout(() => {
                                        this.audio.play().catch(e2 => {
                                            console.error('❌ 最終播放失敗:', e2);
                                        });
                                    }, 200);
                                });
                            };
                            
                            // 監聽多個載入事件
                            this.audio.addEventListener('canplay', onCanPlay, { once: true });
                            this.audio.addEventListener('canplaythrough', onCanPlay, { once: true });
                            this.audio.addEventListener('loadeddata', onCanPlay, { once: true });
                            this.audio.addEventListener('loadedmetadata', onCanPlay, { once: true });
                        } else {
                            // readyState >= 2，但播放失敗，可能是瀏覽器限制
                            console.log('音頻已載入但播放失敗，延遲後再試...');
                            // 延遲後再試幾次
                            setTimeout(() => {
                                this.audio.play().catch(e => {
                                    console.error('延遲播放失敗:', e);
                                    // 再試一次
                                    setTimeout(() => {
                                        this.audio.play().catch(e2 => {
                                            console.error('最終播放失敗:', e2);
                                        });
                                    }, 300);
                                });
                            }, 100);
                        }
                    });
                }
            };
            
            const handleUserInteraction = (event) => {
                if (!this.hasUserInteracted) {
                    this.hasUserInteracted = true;
                    console.log('檢測到用戶交互，嘗試播放音樂', event.type);
                    this.tryPlayMusic();
                } else {
                    // 如果已經交互過，但音樂還沒播放，再次嘗試
                    if (this.isPlaying && this.audio && this.audio.paused) {
                        console.log('用戶已交互，但音樂未播放，再次嘗試...');
                        this.tryPlayMusic();
                    }
                }
            };

            // 監聽所有用戶交互事件（使用 capture 階段以更早捕獲）
            userInteractionEvents.forEach(event => {
                document.addEventListener(event, handleUserInteraction, { 
                    once: false, 
                    passive: true,
                    capture: true  // 在捕獲階段監聽，更早觸發
                });
            });
            
            // 特別針對手機：監聽整個文檔的觸摸事件
            document.body.addEventListener('touchstart', handleUserInteraction, { 
                once: false, 
                passive: true,
                capture: true 
            });

            // 也嘗試自動播放（可能被瀏覽器阻止）
            // 手機上可能需要更長的等待時間
            setTimeout(() => {
                if (this.isPlaying && this.audio && !this.audio.paused) {
                    // 已經在播放
                    return;
                }
                if (this.isLoaded && this.isPlaying) {
                    this.play().catch(err => {
                        console.log('自動播放被阻止（這是正常的，需要用戶交互）:', err.message);
                    });
                }
            }, 500);
            
            // 手機優化：在頁面完全載入後再次嘗試
            window.addEventListener('load', () => {
                setTimeout(() => {
                    if (this.isPlaying && this.audio && this.audio.paused && this.isLoaded) {
                        // 如果用戶已經交互過，再次嘗試播放
                        if (this.hasUserInteracted) {
                            this.play().catch(err => {
                                console.log('頁面載入後播放嘗試失敗:', err.message);
                            });
                        }
                    }
                }, 1000);
            });
        },

        // 播放
        play: function() {
            if (!this.audio) {
                console.error('音頻元素不存在');
                return Promise.reject(new Error('音頻元素不存在'));
            }
            
            // 安卓優化：確保音頻元素在 DOM 中
            if (!document.body.contains(this.audio)) {
                document.body.appendChild(this.audio);
            }
            
            // 確保音量設置正確
            this.audio.volume = this.volume;
            
            // 安卓優化：確保音頻已載入
            if (this.audio.readyState === 0) {
                // 如果音頻還沒開始載入，觸發載入
                this.audio.load();
            }
            
            return this.audio.play().then(() => {
                this.isPlaying = true;
                this.saveState();
                console.log('音樂播放成功，音量:', this.volume, 'readyState:', this.audio.readyState);
            }).catch((error) => {
                console.error('播放失敗:', error);
                console.error('音頻 readyState:', this.audio.readyState);
                console.error('音頻 paused:', this.audio.paused);
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
    // 音樂檔案 URL - 使用 Dropbox 直接下載連結
    const MUSIC_URL = 'https://dl.dropboxusercontent.com/scl/fi/30dtk8vbul5rosz8gmc5e/background-music.mp3?rlkey=tn0f0pjo8pllustvomh5eljj5&st=pccig5v3&dl=1';

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => {
            console.log('初始化音樂播放器，音樂檔案:', MUSIC_URL);
            MusicPlayer.init(MUSIC_URL);
        });
    } else {
        console.log('初始化音樂播放器，音樂檔案:', MUSIC_URL);
        MusicPlayer.init(MUSIC_URL);
    }
})();
