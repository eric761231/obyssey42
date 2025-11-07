// 創建21個相框
function createPhotoFrames() {
    const photoGrid = document.getElementById('photoGrid');
    const totalFrames = 21;

    for (let i = 1; i <= totalFrames; i++) {
        const frame = document.createElement('div');
        frame.className = 'photo-frame';
        frame.setAttribute('data-index', i);

        // 創建圖片元素
        const img = document.createElement('img');
        // 使用 intro_png 資料夾中的圖片
        img.src = `intro_png/shadow${String(i).padStart(3, '0')}.jpg`;
        img.alt = `畢業同學 ${i}`;
        img.onerror = function() {
            // 如果圖片不存在，顯示佔位符
            this.style.display = 'none';
            const placeholder = document.createElement('div');
            placeholder.className = 'photo-placeholder';
            placeholder.textContent = i;
            frame.appendChild(placeholder);
        };

        // 創建標籤
        const label = document.createElement('div');
        label.className = 'photo-label';
        label.textContent = `畢業同學 ${i}`;

        frame.appendChild(img);
        frame.appendChild(label);

        // 點擊事件 - 打開模態框
        frame.addEventListener('click', function() {
            openModal(img.src, label.textContent);
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
});

// 圖片懶加載（可選優化）
function initLazyLoading() {
    const images = document.querySelectorAll('.photo-frame img');
    
    const imageObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const img = entry.target;
                if (img.dataset.src) {
                    img.src = img.dataset.src;
                    img.removeAttribute('data-src');
                }
                observer.unobserve(img);
            }
        });
    });

    images.forEach(img => {
        imageObserver.observe(img);
    });
}

