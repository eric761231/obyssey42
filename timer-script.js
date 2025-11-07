// 正常計時器功能（無拉霸動畫）
function initTimer() {
    // 課程開始時間：2025年4月17日 00:00:00 (使用本地時區)
    const startDate = new Date(2025, 3, 17, 0, 0, 0, 0); // 月份從0開始，所以3代表4月
    
    function updateTimer() {
        const now = new Date();
        let diff = now - startDate;
        
        // 確保時間差為正數
        if (diff < 0) {
            diff = 0;
        }
        
        // 計算各個時間單位
        const oneDay = 1000 * 60 * 60 * 24;
        const oneHour = 1000 * 60 * 60;
        const oneMinute = 1000 * 60;
        
        const totalDays = Math.floor(diff / oneDay);
        const remainingAfterDays = diff % oneDay;
        const hours = Math.floor(remainingAfterDays / oneHour);
        const remainingAfterHours = remainingAfterDays % oneHour;
        const minutes = Math.floor(remainingAfterHours / oneMinute);
        const seconds = Math.floor((remainingAfterHours % oneMinute) / 1000);
        
        // 格式化天數：支持3位數（最多999天）
        const daysStr = totalDays >= 0 ? totalDays.toString().padStart(3, '0') : '000';
        const hoursStr = hours.toString().padStart(2, '0');
        const minutesStr = minutes.toString().padStart(2, '0');
        const secondsStr = seconds.toString().padStart(2, '0');
        
        // 更新顯示
        const daysEl = document.getElementById('days');
        const hoursEl = document.getElementById('hours');
        const minutesEl = document.getElementById('minutes');
        const secondsEl = document.getElementById('seconds');
        
        if (daysEl) daysEl.textContent = daysStr;
        if (hoursEl) hoursEl.textContent = hoursStr;
        if (minutesEl) minutesEl.textContent = minutesStr;
        if (secondsEl) secondsEl.textContent = secondsStr;
    }
    
    // 立即更新一次
    updateTimer();
    
    // 每秒更新一次
    setInterval(updateTimer, 1000);
}

// 初始化
document.addEventListener('DOMContentLoaded', function() {
    initTimer();
});

