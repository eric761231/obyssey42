// 前導頁面 - 加速計時器動畫（模擬100倍速，從0快速遞增到當前時間）
(function() {
    // 課程開始時間：2025年4月17日 00:00:00 (使用本地時區)
    const startDate = new Date(2025, 3, 17, 0, 0, 0, 0); // 月份從0開始，所以3代表4月
    
    // 初始化數字位結構（用於拉霸動畫）
    function initSlotDigit(digitElement) {
        if (!digitElement || digitElement.querySelector('.digit-wrapper')) return;
        
        const wrapper = document.createElement('div');
        wrapper.className = 'digit-wrapper';
        
        // 確保wrapper可見
        wrapper.style.opacity = '1';
        wrapper.style.visibility = 'visible';
        wrapper.style.display = 'flex';
        
        // 創建0-9的數字列表，重複多次以創造滾動效果
        for (let i = 0; i < 30; i++) {
            const digitItem = document.createElement('div');
            digitItem.className = 'digit-item';
            digitItem.textContent = i % 10;
            wrapper.appendChild(digitItem);
        }
        
        digitElement.appendChild(wrapper);
    }
    
    // 滾動單個數字位到目標數字（平滑滾動）
    function rollDigitToPosition(digitElement, targetDigit, immediate = false) {
        if (!digitElement) return;
        
        const wrapper = digitElement.querySelector('.digit-wrapper');
        if (!wrapper) {
            initSlotDigit(digitElement);
            return rollDigitToPosition(digitElement, targetDigit, immediate);
        }
        
        const digitHeight = 3; // rem
        // 確保 targetDigit 在 0-9 範圍內
        const safeTargetDigit = Math.max(0, Math.min(9, targetDigit));
        const basePosition = safeTargetDigit * digitHeight;
        const targetY = -basePosition;
        
        if (immediate) {
            // 立即設置位置，無動畫
            wrapper.style.transition = 'none';
            wrapper.style.transform = `translateY(${targetY}rem)`;
            void wrapper.offsetHeight; // 強制重排
        } else {
            // 平滑滾動
            wrapper.style.transition = 'transform 0.1s ease-out';
            wrapper.style.transform = `translateY(${targetY}rem)`;
        }
    }
    
    // 計算並顯示時間
    function calculateTime() {
        const now = new Date();
        let diff = now - startDate;
        
        if (diff < 0) diff = 0;
        
        const oneDay = 1000 * 60 * 60 * 24;
        const oneHour = 1000 * 60 * 60;
        const oneMinute = 1000 * 60;
        
        const totalDays = Math.floor(diff / oneDay);
        const remainingAfterDays = diff % oneDay;
        const hours = Math.floor(remainingAfterDays / oneHour);
        const remainingAfterHours = remainingAfterDays % oneHour;
        const minutes = Math.floor(remainingAfterHours / oneMinute);
        const seconds = Math.floor((remainingAfterHours % oneMinute) / 1000);
        
        // 天數格式化：支持3位數（最多999天）
        const daysStr = totalDays >= 0 ? totalDays.toString().padStart(3, '0') : '000';
        
        return {
            days: totalDays >= 0 ? totalDays : 0,
            hours: hours,
            minutes: minutes,
            seconds: seconds,
            daysStr: daysStr,
            hoursStr: hours.toString().padStart(2, '0'),
            minutesStr: minutes.toString().padStart(2, '0'),
            secondsStr: seconds.toString().padStart(2, '0')
        };
    }
    
    // 更新所有數字位到指定時間值
    function updateDigitsToTime(time, immediate = false) {
        const daysSlot = document.getElementById('days-slot');
        const hoursSlot = document.getElementById('hours-slot');
        const minutesSlot = document.getElementById('minutes-slot');
        const secondsSlot = document.getElementById('seconds-slot');
        
        // 更新天數（3位數）
        if (daysSlot) {
            const dayDigits = daysSlot.querySelectorAll('.slot-digit');
            if (dayDigits.length >= 3) {
                const daysDisplayStr = time.daysStr;
                rollDigitToPosition(dayDigits[0], parseInt(daysDisplayStr[0] || '0'), immediate);
                rollDigitToPosition(dayDigits[1], parseInt(daysDisplayStr[1] || '0'), immediate);
                rollDigitToPosition(dayDigits[2], parseInt(daysDisplayStr[2] || '0'), immediate);
            }
        }
        
        // 更新小時
        if (hoursSlot) {
            const hourDigits = hoursSlot.querySelectorAll('.slot-digit');
            if (hourDigits.length >= 2) {
                rollDigitToPosition(hourDigits[0], parseInt(time.hoursStr[0]), immediate);
                rollDigitToPosition(hourDigits[1], parseInt(time.hoursStr[1]), immediate);
            }
        }
        
        // 更新分鐘
        if (minutesSlot) {
            const minuteDigits = minutesSlot.querySelectorAll('.slot-digit');
            if (minuteDigits.length >= 2) {
                rollDigitToPosition(minuteDigits[0], parseInt(time.minutesStr[0]), immediate);
                rollDigitToPosition(minuteDigits[1], parseInt(time.minutesStr[1]), immediate);
            }
        }
        
        // 更新秒數
        if (secondsSlot) {
            const secondDigits = secondsSlot.querySelectorAll('.slot-digit');
            if (secondDigits.length >= 2) {
                rollDigitToPosition(secondDigits[0], parseInt(time.secondsStr[0]), immediate);
                rollDigitToPosition(secondDigits[1], parseInt(time.secondsStr[1]), immediate);
            }
        }
    }
    
    // 初始化所有數字位（從0開始）
    function initAllDigits() {
        const daysSlot = document.getElementById('days-slot');
        const hoursSlot = document.getElementById('hours-slot');
        const minutesSlot = document.getElementById('minutes-slot');
        const secondsSlot = document.getElementById('seconds-slot');
        
        // 初始化所有數字位為0
        [daysSlot, hoursSlot, minutesSlot, secondsSlot].forEach(slot => {
            if (slot) {
                const digits = slot.querySelectorAll('.slot-digit');
                digits.forEach(digit => {
                    initSlotDigit(digit);
                    const wrapper = digit.querySelector('.digit-wrapper');
                    if (wrapper) {
                        // 確保從0開始
                        wrapper.style.transition = 'none';
                        wrapper.style.transform = 'translateY(0rem)';
                    }
                });
            }
        });
    }
    
    // 執行加速計時器動畫（配合圖片切換速度）
    function startAcceleratedTimer() {
        const targetTime = calculateTime(); // 目標時間（當前實際時間）
        // 使用圖片翻頁的總時間作為動畫持續時間，確保同步完成
        const animationDuration = window.imageFlipTotalTime || 3000; // 動畫持續時間與圖片翻頁同步
        
        // 計算總時間差（毫秒）
        const totalDiff = targetTime.days * 24 * 60 * 60 * 1000 +
                         targetTime.hours * 60 * 60 * 1000 +
                         targetTime.minutes * 60 * 1000 +
                         targetTime.seconds * 1000;
        
        const startTime = Date.now();
        const endTime = startTime + animationDuration;
        
        // 加速倍數：讓3秒內完成實際時間的遞增
        // 使用更強的緩動函數，開始快，結束非常慢
        function easeOutQuint(t) {
            return 1 - Math.pow(1 - t, 5);
        }
        
        // 或者使用自定義緩動，讓結束時更慢
        function easeOutSlow(t) {
            // 使用更強的指數，讓結束時減速更明顯
            return 1 - Math.pow(1 - t, 6);
        }
        
        function updateAnimation() {
            const now = Date.now();
            const elapsed = now - startTime;
            const progress = Math.min(elapsed / animationDuration, 1);
            
            // 使用更強的緩動函數，讓開始時快速，結束時非常慢
            const easedProgress = easeOutSlow(progress);
            
            // 計算當前應該顯示的時間（從0開始，快速遞增到目標時間）
            const currentDiff = totalDiff * easedProgress;
            
            // 將當前時間差轉換為時間單位
            const oneDay = 1000 * 60 * 60 * 24;
            const oneHour = 1000 * 60 * 60;
            const oneMinute = 1000 * 60;
            
            const currentDays = Math.floor(currentDiff / oneDay);
            const remainingAfterDays = currentDiff % oneDay;
            const currentHours = Math.floor(remainingAfterDays / oneHour);
            const remainingAfterHours = remainingAfterDays % oneHour;
            const currentMinutes = Math.floor(remainingAfterHours / oneMinute);
            const currentSeconds = Math.floor((remainingAfterHours % oneMinute) / 1000);
            
            // 格式化當前時間
            const currentDaysStr = currentDays.toString().padStart(3, '0');
            const currentHoursStr = currentHours.toString().padStart(2, '0');
            const currentMinutesStr = currentMinutes.toString().padStart(2, '0');
            const currentSecondsStr = currentSeconds.toString().padStart(2, '0');
            
            // 更新顯示
            const currentTime = {
                daysStr: currentDaysStr,
                hoursStr: currentHoursStr,
                minutesStr: currentMinutesStr,
                secondsStr: currentSecondsStr
            };
            
            updateDigitsToTime(currentTime, false);
            
            if (progress < 1) {
                requestAnimationFrame(updateAnimation);
            } else {
                // 動畫結束，確保停在當前實際時間（避免閃爍）
                const finalTime = calculateTime();
                updateDigitsToTime(finalTime, true);
            }
        }
        
        // 開始動畫
        requestAnimationFrame(updateAnimation);
    }
    
    // 跳轉到主頁面
    function redirectToIndex() {
        const container = document.getElementById('introContainer');
        if (container) {
            container.classList.add('fade-out');
        }
        
        setTimeout(() => {
            window.location.href = 'index.html';
        }, 1000);
    }
    
    // 圖片快速翻頁動畫（類似漫威開場，從快到慢，配合計時器）
    function startImageFlipAnimation() {
        const backgroundEl = document.getElementById('introBackground');
        if (!backgroundEl) return;
        
        // 圖片總數
        const totalImages = 27;
        
        // 預載入所有圖片
        const images = [];
        for (let i = 1; i <= totalImages; i++) {
            const img = new Image();
            img.src = `intro_png/shadow${String(i).padStart(3, '0')}.jpg`;
            images.push(img);
        }
        
        // 預載入第一張圖片
        backgroundEl.style.backgroundImage = `url('intro_png/shadow001.jpg')`;
        
        // 計算每張圖片的間隔時間（從短到長，配合計時器從快到慢）
        // 使用指數函數，讓間隔從非常短逐漸增加到很長
        const minInterval = 100; // 最短間隔（毫秒）- 前面的圖片切換很快
        const maxInterval = 1000; // 最長間隔（毫秒）- 後面的圖片切換很慢
        
        // 計算每張圖片的間隔時間（從短到長）
        const intervals = [];
        for (let i = 0; i < totalImages; i++) {
            const progress = i / (totalImages - 1); // 0 到 1
            // 使用指數函數，讓前面的間隔短，後面的間隔長
            // 使用 easeInQuint 的逆函數效果
            const easedProgress = Math.pow(progress, 3); // 使用立方，讓變化更明顯
            const interval = minInterval + (maxInterval - minInterval) * easedProgress;
            intervals.push(interval);
        }
        
        // 計算總翻頁時間
        const totalFlipTime = intervals.reduce((sum, interval) => sum + interval, 0);
        console.log('總翻頁時間:', totalFlipTime, 'ms');
        
        // 將總時間存儲在全局變量中，供計時器使用
        window.imageFlipTotalTime = totalFlipTime;
        
        // 使用 setTimeout 遞迴調用，實現從快到慢的切換（無過場效果）
        function flipNextImage(index) {
            if (index > totalImages) {
                // 翻頁完成後，切換到 index.html 的背景圖
                setTimeout(() => {
                    const finalBackgroundEl = document.getElementById('introBackgroundFinal');
                    if (finalBackgroundEl) {
                        // 淡出翻頁背景
                        backgroundEl.style.transition = 'opacity 1s ease-in-out';
                        backgroundEl.style.opacity = '0';
                        // 淡入最終背景
                        finalBackgroundEl.classList.add('show');
                    }
                }, 500);
                return;
            }
            
            const imagePath = `intro_png/shadow${String(index).padStart(3, '0')}.jpg`;
            // 直接切換，無過渡效果（類似翻書）
            backgroundEl.style.transition = 'none';
            backgroundEl.style.backgroundImage = `url('${imagePath}')`;
            
            // 計算下一張圖片的延遲時間（從短到長）
            const nextInterval = intervals[index - 1] || minInterval;
            
            setTimeout(() => {
                flipNextImage(index + 1);
            }, nextInterval);
        }
        
        // 開始翻頁（第一張已經顯示，從第二張開始）
        // 同時啟動計時器動畫，確保兩者同步
        setTimeout(() => {
            flipNextImage(2);
            // 同時啟動計時器動畫
            startAcceleratedTimer();
        }, intervals[0] || minInterval);
        
        // 返回總時間，供外部使用
        return totalFlipTime;
    }
    
    // 更新文字背景（讓文字顯示背景圖片）
    function updateTitleBackground() {
        const titleEl = document.getElementById('introTitle');
        const backgroundEl = document.getElementById('introBackground');
        if (titleEl && backgroundEl) {
            // 獲取當前背景圖片
            const bgImage = window.getComputedStyle(backgroundEl).backgroundImage;
            if (bgImage && bgImage !== 'none') {
                titleEl.style.backgroundImage = bgImage;
                titleEl.style.backgroundSize = 'cover';
                titleEl.style.backgroundPosition = 'center';
            }
        }
    }
    
    // 初始化
    document.addEventListener('DOMContentLoaded', function() {
        // 先初始化所有數字位（從0開始）
        initAllDigits();
        
        // 立即開始圖片翻頁動畫（計時器會在圖片翻頁開始時同步啟動）
        const totalFlipTime = startImageFlipAnimation();
        
        // 定期更新文字背景（讓文字顯示背景圖片）
        const updateInterval = setInterval(() => {
            updateTitleBackground();
        }, 50); // 每50ms更新一次，確保背景圖片同步
        
        // 計算總動畫時間（圖片翻頁時間 + 額外緩衝時間）
        const totalAnimationTime = totalFlipTime + 1000; // 圖片翻頁時間 + 1秒緩衝
        
        // 動畫完成後停止更新並跳轉
        setTimeout(() => {
            clearInterval(updateInterval);
            // 動畫完成後跳轉到主頁面
            redirectToIndex();
        }, totalAnimationTime);
    });
})();
