// Web uyumlu renderer.js - Mobil için optimize edildi

let categorizedData = {};
let dataIndex = {};
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
    // İlk gün mesajları yüklenecek
    try {
        const firstDayResponse = await fetch('first_day_messages.json');
        if (firstDayResponse.ok) {
            firstDayMessages = await firstDayResponse.json();
        } else {
            firstDayMessages = [{"date": "2017-09-30", "sender": "❤️", "content": "İlk tanıştığımız gün...", "platform": "Instagram"}];
        }
    } catch (error) {
        firstDayMessages = [{"date": "2017-09-30", "sender": "❤️", "content": "İlk tanıştığımız gün...", "platform": "Instagram"}];
    }
    console.log('✅ İlk gün mesajları yüklendi (hardcode)!');

    try {
        // Parçalanmış veri indexini yükle
        const indexResponse = await fetch('data/index.json');
        if (indexResponse.ok) {
            const text = await indexResponse.text();
            if (text.startsWith('{') || text.startsWith('[')) {
                dataIndex = JSON.parse(text);
                console.log('✅ Veri indexi yüklendi!', Object.keys(dataIndex));
                enableCategoryCards();
            } else {
                console.warn('⚠️ index.json HTML döndürdü');
                // Fallback: Manuel index oluştur
                dataIndex = {
                    romantic: { file: 'data/romantic.json', count: 7261 },
                    funny: { file: 'data/funny.json', count: 19773 },
                    midnight: { file: 'data/midnight.json', count: 47112 },
                    emoji_rich: { file: 'data/emoji_rich.json', count: 6160 },
                    goodmorning: { file: 'data/goodmorning.json', count: 2191 },
                    goodnight: { file: 'data/goodnight.json', count: 4416 },
                    special: { file: 'data/special.json', count: 169 },
                    long: { file: 'data/long.json', count: 283 },
                    general: { file: 'data/general.json', count: 227899 }
                };
                console.log('✅ Manuel index oluşturuldu');
                enableCategoryCards();
            }
        } else {
            throw new Error('Veri index bulunamadı');
        }
    } catch (error) {
        console.error('❌ Veri index yüklenemedi:', error);
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

// Lazy load kategori verisi
async function loadCategoryData(category) {
    if (categorizedData[category]) {
        return categorizedData[category];
    }

    try {
        if (dataIndex[category]) {
            const response = await fetch(dataIndex[category].file);
            if (response.ok) {
                const text = await response.text();
                if (text.startsWith('{') || text.startsWith('[')) {
                    const data = JSON.parse(text);
                    categorizedData[category] = data;
                    return data;
                } else {
                    console.warn(`⚠️ ${category} kategorisi HTML döndürdü`);
                }
            }
        }
    } catch (error) {
        console.error(`❌ ${category} kategorisi yüklenemedi:`, error);
    }

    return [];
}

async function viewCategory(category) {
    currentCategory = category;

    // Kategori verilerini lazy load et
    const messages = await loadCategoryData(category);

    if (messages.length === 0) {
        showError(`${categoryNames[category]} kategorisi yüklenemedi.`);
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
        <div class="message-content">${msg.content || msg.text || 'Mesaj içeriği bulunamadı'}</div>
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

    if (!dataIndex || Object.keys(dataIndex).length === 0) {
        container.innerHTML = '<div style="text-align: center; opacity: 0.7;">İstatistikler yükleniyor...</div>';
        return;
    }

    // Index'ten mesaj sayılarını hesapla
    const totalMessages = Object.values(dataIndex)
        .reduce((sum, category) => sum + (category.count || 0), 0);

    const stats = [
        { title: '📊 Toplam Mesaj', value: totalMessages.toLocaleString('tr-TR') },
        { title: '💬 Günlük Ortalama', value: Math.floor(totalMessages / 2555).toLocaleString('tr-TR') },
        { title: '📅 Birliktelik Süresi', value: '7 yıl' },
        { title: '❤️ Romantik Mesajlar', value: (dataIndex.romantic?.count || 0).toLocaleString('tr-TR') },
        { title: '😂 Komik Anlar', value: (dataIndex.funny?.count || 0).toLocaleString('tr-TR') },
        { title: '🌙 Gece Sohbetleri', value: (dataIndex.midnight?.count || 0).toLocaleString('tr-TR') },
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

async function showRandomStory() {
    // Eğer dataIndex yüklenmemişse, varsayılan indexi oluştur
    if (!dataIndex || Object.keys(dataIndex).length === 0) {
        console.warn('⚠️ dataIndex henüz yüklenmedi, manuel index oluşturuluyor...');
        dataIndex = {
            romantic: { file: 'data/romantic.json', count: 7261 },
            funny: { file: 'data/funny.json', count: 19773 },
            midnight: { file: 'data/midnight.json', count: 47112 },
            emoji_rich: { file: 'data/emoji_rich.json', count: 6160 },
            goodmorning: { file: 'data/goodmorning.json', count: 2191 },
            goodnight: { file: 'data/goodnight.json', count: 4416 },
            special: { file: 'data/special.json', count: 169 },
            long: { file: 'data/long.json', count: 283 }
        };
    }

    // İlk olarak ilk gün mesajlarından rastgele bir tane göster
    if (firstDayMessages && firstDayMessages.length > 0) {
        document.getElementById('storyContent').innerHTML = '<div style="text-align: center; padding: 20px; opacity: 0.7;">Rastgele kategori yükleniyor...</div>';

        // Rastgele kategori seç ve yükle
        const categories = Object.keys(dataIndex);
        const randomCategory = categories[Math.floor(Math.random() * categories.length)];

        try {
            const categoryMessages = await loadCategoryData(randomCategory);

            if (categoryMessages && categoryMessages.length > 0) {
                currentStoryIndex = Math.floor(Math.random() * categoryMessages.length);
                currentCategoryMessages = categoryMessages;
                displayStory(categoryMessages[currentStoryIndex]);
            } else {
                // Kategori yüklenemezse ilk gün mesajlarından göster
                console.warn(`⚠️ ${randomCategory} yüklenemedi, ilk gün mesajı gösteriliyor`);
                currentStoryIndex = Math.floor(Math.random() * firstDayMessages.length);
                currentCategoryMessages = firstDayMessages;
                displayStory(firstDayMessages[currentStoryIndex]);
            }
        } catch (error) {
            console.error('❌ Kategori yükleme hatası:', error);
            // Hata durumunda ilk gün mesajlarından göster
            currentStoryIndex = Math.floor(Math.random() * firstDayMessages.length);
            currentCategoryMessages = firstDayMessages;
            displayStory(firstDayMessages[currentStoryIndex]);
        }
    } else {
        document.getElementById('storyContent').innerHTML = '<div style="text-align: center; opacity: 0.7;">Veriler yükleniyor, lütfen bekleyin...</div>';
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
        <div style="font-size: 1rem; line-height: 1.6;">${message.content || message.text || 'Mesaj içeriği bulunamadı'}</div>
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
                    <span style="opacity: 0.7;">${msg.platform} • ${msg.date}</span>
                </div>
                <div class="message-content">${msg.content || msg.text || 'Mesaj içeriği bulunamadı'}</div>
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
            (msg.content || msg.text || '').toLowerCase().includes(searchTerm) ||
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