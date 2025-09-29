// Web uyumlu renderer.js - Mobil için optimize edildi

let categorizedData = {};
let currentCategory = '';
let currentStoryIndex = 0;
let currentCategoryMessages = [];
let firstDayMessages = [];

const categoryNames = {
    romantic: '❤️ Romantik Mesajlar',
    funny: '😂 Komik Anlar',
    midnight: '🌃 Gece Sohbetleri',
    emoji_rich: '😍 Emoji Yüklü Mesajlar',
    goodmorning: '☀️ Günaydın Mesajları',
    goodnight: '🌙 İyi Geceler Mesajları',
    special: '🎉 Özel Günler',
    long: '📝 Uzun Mesajlar'
};

// Web için veri yükleme
async function loadData() {
    try {
        // Önce first_day_messages.json'ı yükle
        const firstDayResponse = await fetch('first_day_messages.json');
        if (firstDayResponse.ok) {
            firstDayMessages = await firstDayResponse.json();
            console.log('✅ İlk gün mesajları yüklendi!');
        }
    } catch (error) {
        console.error('❌ İlk gün mesajları yüklenemedi:', error);
    }

    try {
        // Ana veriyi yükle (eğer varsa)
        const response = await fetch('categorized_data.json');
        if (response.ok) {
            // Mobil veri yükleme desteği kullan
            if (window.mobileDataLoader) {
                categorizedData = await window.mobileDataLoader.loadWithTimeout('categorized_data.json');
            } else {
                categorizedData = await response.json();
            }
            console.log('✅ Kategorize veriler yüklendi!', Object.keys(categorizedData));
            enableCategoryCards();
        } else {
            throw new Error('categorized_data.json bulunamadı');
        }
    } catch (error) {
        console.error('❌ Ana veriler yüklenemedi:', error);
        showError('Veriler yüklenemedi. Lütfen sayfayı yenileyin.');
        disableCategoryCards();
    }
}

function enableCategoryCards() {
    document.querySelectorAll('.category-card').forEach(card => {
        card.style.opacity = '1';
        card.style.pointerEvents = 'auto';
        const loadingDiv = card.querySelector('.loading-indicator');
        if (loadingDiv) loadingDiv.remove();
    });
}

function disableCategoryCards() {
    document.querySelectorAll('.category-card').forEach(card => {
        card.style.opacity = '0.5';
        card.style.pointerEvents = 'none';
        if (!card.querySelector('.loading-indicator')) {
            card.innerHTML += '<div class="loading-indicator" style="font-size: 0.7rem; color: #ff6b9d; margin-top: 5px;">Yükleniyor...</div>';
        }
    });
}

function viewCategory(category) {
    currentCategory = category;
    const messages = categorizedData[category] || [];

    if (messages.length === 0) {
        showError(`${categoryNames[category]} kategorisi henüz yüklenmedi.`);
        return;
    }

    currentCategoryMessages = messages;

    // Category viewer'ı göster
    const viewer = document.getElementById('categoryViewer');
    const title = document.getElementById('categoryViewerTitle');
    const messagesContainer = document.getElementById('categoryMessages');

    title.textContent = categoryNames[category] || category;

    // Search inputu temizle
    const searchInput = document.getElementById('categorySearchInput');
    if (searchInput) {
        searchInput.value = '';
    }

    displayMessages(currentCategoryMessages.slice(0, 50)); // İlk 50 mesaj

    viewer.style.display = 'flex';

    // Scroll ile daha fazla mesaj yükle
    messagesContainer.onscroll = () => {
        if (messagesContainer.scrollTop + messagesContainer.clientHeight >= messagesContainer.scrollHeight - 100) {
            loadMoreMessages();
        }
    };
}

function loadMoreMessages() {
    const container = document.getElementById('categoryMessages');
    const currentCount = container.children.length;

    if (currentCount < currentCategoryMessages.length) {
        const moreMessages = currentCategoryMessages.slice(currentCount, currentCount + 50);
        moreMessages.forEach(msg => {
            container.appendChild(createMessageElement(msg));
        });
    }
}

function displayMessages(messages) {
    const container = document.getElementById('categoryMessages');
    container.innerHTML = '';

    if (messages.length === 0) {
        container.innerHTML = '<div style="text-align: center; padding: 20px; opacity: 0.7;">Mesaj bulunamadı</div>';
        return;
    }

    messages.forEach(msg => {
        container.appendChild(createMessageElement(msg));
    });
}

function createMessageElement(msg) {
    const messageDiv = document.createElement('div');
    messageDiv.className = 'message-item';
    messageDiv.innerHTML = `
        <div class="message-header">
            <span style="font-weight: 600;">${msg.sender}</span>
            <span style="opacity: 0.7;">${msg.platform} • ${msg.date}</span>
        </div>
        <div class="message-content">${msg.text}</div>
    `;
    return messageDiv;
}

function showPage(pageName) {
    // Tüm sayfaları gizle
    document.querySelectorAll('.page-content').forEach(page => {
        page.classList.remove('active');
    });

    // Seçilen sayfayı göster
    const page = document.getElementById(pageName + 'Page');
    if (page) {
        page.classList.add('active');
    }

    // Navigation butonlarını güncelle
    document.querySelectorAll('.nav-btn').forEach(btn => {
        btn.classList.remove('active');
    });

    const activeBtn = document.querySelector(`[data-page="${pageName}"]`);
    if (activeBtn) {
        activeBtn.classList.add('active');
    }

    // Sayfa özel işlemleri
    if (pageName === 'stats') {
        loadStats();
    } else if (pageName === 'stories') {
        showRandomStory();
    }
}

function loadStats() {
    const container = document.getElementById('statsContainer');

    // Mesaj sayılarını hesapla
    const totalMessages = Object.values(categorizedData)
        .reduce((sum, messages) => sum + messages.length, 0);

    const stats = [
        { title: '📊 Toplam Mesaj', value: totalMessages.toLocaleString('tr-TR') },
        { title: '💬 Günlük Ortalama', value: Math.floor(totalMessages / 2555).toLocaleString('tr-TR') },
        { title: '📅 Birliktelik Süresi', value: '7 yıl' },
        { title: '❤️ Romantik Mesajlar', value: (categorizedData.romantic?.length || 0).toLocaleString('tr-TR') },
        { title: '😂 Komik Anlar', value: (categorizedData.funny?.length || 0).toLocaleString('tr-TR') },
        { title: '🌙 Gece Sohbetleri', value: (categorizedData.midnight?.length || 0).toLocaleString('tr-TR') },
        { title: '📷 Instagram', value: '14,287' },
        { title: '✈️ Telegram', value: '281,619' },
        { title: '💚 WhatsApp', value: '8,672' }
    ];

    container.innerHTML = stats.map(stat => `
        <div class="stat-card">
            <div class="stat-title">${stat.title}</div>
            <div class="stat-value">${stat.value}</div>
        </div>
    `).join('');
}

function showRandomStory() {
    const categories = Object.keys(categorizedData);
    if (categories.length === 0) return;

    const randomCategory = categories[Math.floor(Math.random() * categories.length)];
    const categoryMessages = categorizedData[randomCategory];

    if (categoryMessages && categoryMessages.length > 0) {
        currentStoryIndex = Math.floor(Math.random() * categoryMessages.length);
        currentCategoryMessages = categoryMessages;
        displayStory(categoryMessages[currentStoryIndex]);
    }
}

function displayStory(message) {
    const content = document.getElementById('storyContent');
    const counter = document.getElementById('storyCounter');

    if (!message) return;

    content.innerHTML = `
        <div style="margin-bottom: 15px; padding-bottom: 10px; border-bottom: 1px solid rgba(255,255,255,0.1);">
            <span style="font-weight: 600;">${message.sender}</span> •
            <span style="opacity: 0.8;">${message.platform}</span> •
            <span style="opacity: 0.8;">${message.date}</span>
        </div>
        <div style="font-size: 1rem; line-height: 1.6;">${message.text}</div>
    `;

    counter.textContent = `${currentStoryIndex + 1} / ${currentCategoryMessages.length}`;
}

function showError(message) {
    // Error toast göster
    const toast = document.createElement('div');
    toast.style.cssText = `
        position: fixed; top: 20px; left: 50%; transform: translateX(-50%);
        background: rgba(255,0,0,0.9); color: white; padding: 10px 20px;
        border-radius: 5px; z-index: 10000; font-size: 0.9rem;
    `;
    toast.textContent = message;
    document.body.appendChild(toast);

    setTimeout(() => {
        if (toast.parentNode) {
            toast.parentNode.removeChild(toast);
        }
    }, 3000);
}

// Event listeners
document.addEventListener('DOMContentLoaded', async function() {
    console.log('🚀 Web uygulaması başlatılıyor...');

    // İlk veri yükleme
    await loadData();

    // Navigation butonları
    document.querySelectorAll('.nav-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            showPage(btn.dataset.page);
        });
    });

    // Category kartları
    document.querySelectorAll('.category-card').forEach(card => {
        card.addEventListener('click', () => {
            viewCategory(card.dataset.category);
        });
    });

    // Close butonları
    document.querySelector('.close-category-btn')?.addEventListener('click', () => {
        document.getElementById('categoryViewer').style.display = 'none';
    });

    document.querySelector('.close-first-day-btn')?.addEventListener('click', () => {
        document.getElementById('firstDayViewer').style.display = 'none';
    });

    // İlk gün butonu
    document.querySelector('.view-first-day-btn')?.addEventListener('click', () => {
        const viewer = document.getElementById('firstDayViewer');
        const container = document.getElementById('firstDayMessages');

        container.innerHTML = firstDayMessages.map(msg => `
            <div class="message-item">
                <div class="message-header">
                    <span style="font-weight: 600;">${msg.sender}</span>
                    <span style="opacity: 0.7;">${msg.time}</span>
                </div>
                <div class="message-content">${msg.text}</div>
            </div>
        `).join('');

        viewer.style.display = 'flex';
    });

    // Search
    document.getElementById('categorySearchInput')?.addEventListener('input', (e) => {
        const searchTerm = e.target.value.toLowerCase();

        if (!searchTerm) {
            displayMessages(currentCategoryMessages.slice(0, 50));
            return;
        }

        const filtered = currentCategoryMessages.filter(msg =>
            msg.text.toLowerCase().includes(searchTerm) ||
            msg.sender.toLowerCase().includes(searchTerm)
        );

        displayMessages(filtered.slice(0, 50));
    });

    // Story navigation
    document.getElementById('prevStory')?.addEventListener('click', () => {
        if (currentStoryIndex > 0) {
            currentStoryIndex--;
            displayStory(currentCategoryMessages[currentStoryIndex]);
        }
    });

    document.getElementById('nextStory')?.addEventListener('click', () => {
        if (currentStoryIndex < currentCategoryMessages.length - 1) {
            currentStoryIndex++;
            displayStory(currentCategoryMessages[currentStoryIndex]);
        }
    });

    document.querySelector('.random-btn')?.addEventListener('click', () => {
        showRandomStory();
    });

    console.log('✅ Web uygulaması hazır!');
});

// Global fonksiyonlar
window.viewCategory = viewCategory;
window.showPage = showPage;