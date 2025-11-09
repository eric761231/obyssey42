// 秋天落葉飄落效果
(function() {
    'use strict';

    // 落葉配置
    const LEAF_CONFIG = {
        count: 15, // 落葉數量
        images: [
            'images/leaves/leaf01.png',
            'images/leaves/leaf02.png',
            'images/leaves/leaf03.png',
            'images/leaves/leaf04.png',
            'images/leaves/leaf05.png',
            'images/leaves/leaf06.png'
        ], // 落葉圖片路徑
        sizes: [30, 35, 40, 45, 50, 55, 60], // 落葉大小（px）
        fallDuration: [25, 30, 35, 40, 45], // 飄落時間（秒）- 慢速
        swayAmount: [20, 30, 40, 50, 60] // 左右飄動幅度（px）
    };

    // ========== 計算落葉消失位置 ==========
    // 計算頁尾位置（用於確定落葉消失的位置）
    function getFooterPosition() {
        const footer = document.querySelector('.footer');
        if (!footer) {
            // 預設：視窗高度的 92%（留出頁尾和堆積落葉空間）
            return window.innerHeight * 0.92;
        }
        
        const footerRect = footer.getBoundingClientRect();
        const footerTop = footerRect.top; // 頁尾頂部位置（px）
        const marginTop = 80; // 頁尾的 margin-top: 80px（堆積落葉區域高度）
        // 落葉消失位置：在 margin-top: 80px 區域的中間位置（40px）
        // 計算方式：頁尾頂部位置 + (marginTop * 0.5) = 頁尾上方 40px 的位置
        return footerTop + (marginTop * 2.5); // 在 80px 區域的中間（40px）位置
    }
    // ======================================

    // 創建單個落葉
    function createLeaf() {
        const leaf = document.createElement('div');
        leaf.className = 'falling-leaf';
        
        // 隨機選擇圖片、大小、動畫時間
        const leafImage = LEAF_CONFIG.images[Math.floor(Math.random() * LEAF_CONFIG.images.length)];
        const size = LEAF_CONFIG.sizes[Math.floor(Math.random() * LEAF_CONFIG.sizes.length)];
        const fallDuration = LEAF_CONFIG.fallDuration[Math.floor(Math.random() * LEAF_CONFIG.fallDuration.length)];
        const swayAmount = LEAF_CONFIG.swayAmount[Math.floor(Math.random() * LEAF_CONFIG.swayAmount.length)];
        const startX = Math.random() * 100; // 起始位置（百分比）
        const delay = Math.random() * 5; // 延遲時間（秒）
        const rotationSpeed = 8 + Math.random() * 6; // 旋轉速度（秒）- 慢速旋轉
        
        // 設置樣式
        leaf.style.width = size + 'px';
        leaf.style.height = size + 'px';
        leaf.style.left = startX + '%';
        // 懶載入：先不設置背景圖片，使用 data-src 屬性
        leaf.setAttribute('data-src', leafImage);
        leaf.style.backgroundSize = 'contain';
        leaf.style.backgroundRepeat = 'no-repeat';
        leaf.style.backgroundPosition = 'center';
        leaf.style.animationDuration = fallDuration + 's';
        leaf.style.animationDelay = delay + 's';
        leaf.style.opacity = 0.7 + Math.random() * 0.3; // 透明度 0.7-1.0
        leaf.style.display = 'block'; // 確保顯示
        
        // ========== 計算落葉消失位置 ==========
        // 計算落葉在頁尾下方消失的位置
        const footerTop = getFooterPosition(); // 取得消失位置的像素值（px）
        const windowHeight = window.innerHeight; // 視窗高度（px）
        // 將像素位置轉換為視窗高度的百分比（vh）
        // 公式：消失位置 / 視窗高度 * 100 = 消失位置的 vh 值
        const disappearPosition = (footerTop / windowHeight) * 100;
        // 限制消失位置在合理範圍內（不超過 100vh）
        const disappearVh = Math.max(50, Math.min(100, disappearPosition));
        // ======================================
        
        // 設置自定義屬性用於動畫
        leaf.style.setProperty('--sway-amount', swayAmount + 'px');
        leaf.style.setProperty('--fall-duration', fallDuration + 's');
        leaf.style.setProperty('--rotate-duration', rotationSpeed + 's');
        leaf.style.setProperty('--disappear-position', disappearVh + 'vh'); // 落葉消失位置（vh單位），用於 CSS 動畫
        
        return leaf;
    }

        // 創建堆積的落葉
    function createPileLeaf() {
        const leaf = document.createElement('div');
        leaf.className = 'piled-leaf';
        
        // 隨機選擇圖片、大小、位置
        const leafImage = LEAF_CONFIG.images[Math.floor(Math.random() * LEAF_CONFIG.images.length)];
        const size = 25 + Math.random() * 40; // 25-65px（稍微增大）
        const bottom = Math.random() * 80; // 底部 0-80px（覆蓋整個堆積區域）
        const left = Math.random() * 100; // 左側 0-100%
        const rotation = -60 + Math.random() * 120; // 旋轉 -60 到 60 度（更隨機）
        const zIndex = Math.floor(Math.random() * 20); // 層次（增加層次感）
        
        // 設置樣式
        leaf.style.width = size + 'px';
        leaf.style.height = size + 'px';
        leaf.style.left = left + '%';
        leaf.style.bottom = bottom + 'px';
        // 懶載入：先不設置背景圖片，使用 data-src 屬性
        leaf.setAttribute('data-src', leafImage);
        leaf.style.backgroundSize = 'contain';
        leaf.style.backgroundRepeat = 'no-repeat';
        leaf.style.backgroundPosition = 'center';
        leaf.style.transform = `rotate(${rotation}deg)`;
        leaf.style.opacity = 0.5 + Math.random() * 0.5; // 透明度 0.5-1.0（增加層次感）
        leaf.style.zIndex = zIndex;
        leaf.style.display = 'block';
        leaf.style.filter = 'drop-shadow(0 1px 3px rgba(0, 0, 0, 0.3))';
        
        return leaf;
    }

    // 懶載入落葉圖片
    function loadLeafImage(leaf) {
        const src = leaf.getAttribute('data-src');
        if (!src) return;
        
        const img = new Image();
        img.onload = () => {
            leaf.style.backgroundImage = `url("${src}")`;
            leaf.removeAttribute('data-src');
        };
        img.onerror = () => {
            console.error('落葉圖片載入失敗:', src);
        };
        img.src = src;
    }

    // 初始化落葉效果
    function initFallingLeaves() {
        const container = document.getElementById('falling-leaves-container');
        if (!container) {
            console.error('找不到落葉容器 #falling-leaves-container');
            return;
        }

        console.log('開始創建落葉，數量:', LEAF_CONFIG.count);

        // 創建飄落的落葉
        for (let i = 0; i < LEAF_CONFIG.count; i++) {
            const leaf = createLeaf();
            container.appendChild(leaf);
            
            // 使用 IntersectionObserver 實現懶載入
            const observer = new IntersectionObserver((entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        loadLeafImage(entry.target);
                        observer.unobserve(entry.target);
                    }
                });
            }, {
                root: null,
                rootMargin: '50px', // 提前 50px 開始載入
                threshold: 0.01
            });
            
            observer.observe(leaf);
            
            // 當落葉飄到底部後，重新開始（持續循環）
            leaf.addEventListener('animationiteration', () => {
                // 重新設置位置和動畫
                leaf.style.left = Math.random() * 100 + '%';
                leaf.style.animationDelay = Math.random() * 2 + 's';
            });
        }
        
        console.log('落葉創建完成，共', container.children.length, '片');
    }

    // 初始化堆積落葉效果（創建厚厚的落葉堆）
    function initPiledLeaves() {
        const container = document.getElementById('piled-leaves-container');
        if (!container) {
            console.error('找不到堆積落葉容器 #piled-leaves-container');
            return;
        }

        // 創建厚厚的落葉堆（多層堆疊）
        const pileCount = 7500; // 增加15倍數量（500 * 15 = 7500）以形成厚厚一層
        console.log('開始創建堆積落葉，數量:', pileCount);

        // 使用 IntersectionObserver 實現懶載入
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    loadLeafImage(entry.target);
                    observer.unobserve(entry.target);
                }
            });
        }, {
            root: null,
            rootMargin: '100px', // 提前 100px 開始載入
            threshold: 0.01
        });

        for (let i = 0; i < pileCount; i++) {
            const leaf = createPileLeaf();
            container.appendChild(leaf);
            observer.observe(leaf);
        }
        
        console.log('堆積落葉創建完成，共', container.children.length, '片');
    }

    // 當 DOM 載入完成後初始化
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => {
            initFallingLeaves();
            initPiledLeaves();
        });
    } else {
        initFallingLeaves();
        initPiledLeaves();
    }
})();

