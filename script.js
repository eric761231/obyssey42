// 21位同學的名稱列表（可根據實際情況修改）
const studentNames = [
    '同學1', '同學2', '同學3', '同學4', '同學5',
    '同學6', '同學7', '同學8', '同學9', '同學10',
    '同學11', '同學12', '同學13', '同學14', '同學15',
    '同學16', '同學17', '同學18', '同學19', '同學20',
    '同學21'
];

// 21位同學對應的圖片編號（可根據實際情況修改）
// 例如：[1, 2, 3, 4, 5, ...] 表示使用 shadow001.jpg, shadow002.jpg 等
const studentImageIndices = [
    1, 2, 3, 4, 5, 6, 7, 8, 9, 10,
    11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21
];

// 創建21個相框（使用懶加載）
function createPhotoFrames() {
    const photoGrid = document.getElementById('photoGrid');
    const totalFrames = 21;

    for (let i = 0; i < totalFrames; i++) {
        const frame = document.createElement('div');
        frame.className = 'photo-frame';
        frame.setAttribute('data-index', i + 1);

        // 創建圖片元素（使用懶加載）
        const img = document.createElement('img');
        // 使用 data-src 進行懶加載，提升頁面載入性能
        const imageIndex = studentImageIndices[i];
        img.dataset.src = `intro_png/shadow${String(imageIndex).padStart(3, '0')}.jpg`;
        img.alt = studentNames[i] || `畢業同學 ${i + 1}`;
        img.onerror = function() {
            // 如果圖片不存在，顯示佔位符
            this.style.display = 'none';
            const placeholder = document.createElement('div');
            placeholder.className = 'photo-placeholder';
            placeholder.textContent = i + 1;
            frame.appendChild(placeholder);
        };

        // 創建標籤
        const label = document.createElement('div');
        label.className = 'photo-label';
        label.textContent = studentNames[i] || `畢業同學 ${i + 1}`;

        frame.appendChild(img);
        frame.appendChild(label);

        // 點擊事件 - 打開模態框
        frame.addEventListener('click', function() {
            const imageSrc = img.src || img.dataset.src;
            openModal(imageSrc, label.textContent);
        });

        photoGrid.appendChild(frame);
    }
}

// 打開圖片模態框
function openModal(imageSrc, caption) {
    const modal = document.getElementById('imageModal');
    const modalImg = document.getElementById('modalImage');
    const captionText = document.getElementById('caption');

    modal.style.display = 'block';
    modalImg.src = imageSrc;
    captionText.textContent = caption;
}

// 關閉模態框
function closeModal() {
    const modal = document.getElementById('imageModal');
    modal.style.display = 'none';
}

// 平滑滾動
function initSmoothScroll() {
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                target.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });
}

// 導航欄滾動效果
function initNavbarScroll() {
    const navbar = document.querySelector('.navbar');
    let lastScroll = 0;

    window.addEventListener('scroll', function() {
        const currentScroll = window.pageYOffset;

        if (currentScroll > 100) {
            navbar.style.boxShadow = '0 2px 20px rgba(0, 0, 0, 0.15)';
        } else {
            navbar.style.boxShadow = '0 2px 10px rgba(0, 0, 0, 0.1)';
        }

        lastScroll = currentScroll;
    });
}

// 模態框關閉事件
document.addEventListener('DOMContentLoaded', function() {
    const modal = document.getElementById('imageModal');
    const closeBtn = document.querySelector('.close');

    // 點擊關閉按鈕
    if (closeBtn) {
        closeBtn.addEventListener('click', closeModal);
    }

    // 點擊模態框外部關閉
    window.addEventListener('click', function(event) {
        if (event.target === modal) {
            closeModal();
        }
    });

    // ESC 鍵關閉
    document.addEventListener('keydown', function(event) {
        if (event.key === 'Escape' && modal.style.display === 'block') {
            closeModal();
        }
    });
});

// 初始化
document.addEventListener('DOMContentLoaded', function() {
    createPhotoFrames();
    initSmoothScroll();
    initNavbarScroll();
    // 啟用圖片懶加載
    initLazyLoading();
});

// 圖片懶加載（優化性能，只載入可見區域的圖片）
function initLazyLoading() {
    const images = document.querySelectorAll('.photo-frame img');
    
    // 如果瀏覽器支持 IntersectionObserver，使用它進行懶加載
    if ('IntersectionObserver' in window) {
        const imageObserver = new IntersectionObserver((entries, observer) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const img = entry.target;
                    if (img.dataset.src) {
                        // 載入圖片
                        img.src = img.dataset.src;
                        img.removeAttribute('data-src');
                    }
                    observer.unobserve(img);
                }
            });
        }, {
            // 提前開始載入（當圖片距離視窗 100px 時）
            rootMargin: '100px'
        });

        images.forEach(img => {
            if (img.dataset.src) {
                imageObserver.observe(img);
            }
        });
    } else {
        // 不支持的瀏覽器，直接載入所有圖片
        images.forEach(img => {
            if (img.dataset.src) {
                img.src = img.dataset.src;
                img.removeAttribute('data-src');
            }
        });
    }
}

