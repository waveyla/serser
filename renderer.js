const fs = require('fs');
const path = require('path');

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

function loadData() {
    try {
        const data = fs.readFileSync(path.join(__dirname, 'categorized_data.json'), 'utf8');
        categorizedData = JSON.parse(data);
        console.log('Veriler yüklendi!');
    } catch (error) {
        console.error('Veriler yüklenemedi:', error);
    }

    try {
        const firstDayData = fs.readFileSync(path.join(__dirname, 'first_day_messages.json'), 'utf8');
        firstDayMessages = JSON.parse(firstDayData);
        console.log('İlk gün mesajları yüklendi!');
    } catch (error) {
        console.error('İlk gün mesajları yüklenemedi:', error);
    }
}

function formatDate(dateString) {
    const date = new Date(dateString);
    const options = {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    };
    return date.toLocaleDateString('tr-TR', options);
}

function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

function switchPage(pageName) {
    document.querySelectorAll('.page-content').forEach(page => {
        page.classList.remove('active');
    });

    document.querySelectorAll('.nav-btn').forEach(btn => {
        btn.classList.remove('active');
    });

    document.getElementById(pageName + 'Page').classList.add('active');
    document.querySelector(`[data-page="${pageName}"]`).classList.add('active');
}

function showCategory(category) {
    currentCategory = category;
    currentCategoryMessages = categorizedData[category] || [];

    document.getElementById('categoryViewerTitle').textContent = categoryNames[category] || category;
    document.getElementById('categoryViewer').style.display = 'block';

    renderCategoryMessages(currentCategoryMessages);

    document.getElementById('categoryViewer').scrollIntoView({ behavior: 'smooth' });
}

function renderCategoryMessages(messages) {
    const container = document.getElementById('categoryMessages');

    if (!messages || messages.length === 0) {
        container.innerHTML = '<div class="no-results">Bu kategoride mesaj bulunamadı!</div>';
        return;
    }

    let html = '';
    messages.forEach(msg => {
        if (!msg.sender) return;

        const senderClass = msg.sender.toLowerCase().includes('seren') ? 'seren' : 'serkan';
        const senderName = msg.sender.toLowerCase().includes('seren') ? 'Seren' : 'Serkan';
        const platformIcon = msg.platform === 'Instagram' ? '📷' : msg.platform === 'Telegram' ? '✈️' : '💬';

        html += `
            <div class="message-bubble ${senderClass}">
                <div class="message-header">
                    <span class="sender">${senderName} ${platformIcon}</span>
                    <span class="message-date">${formatDate(msg.date)}</span>
                </div>
                <div class="message-content">${escapeHtml(msg.content)}</div>
            </div>
        `;
    });

    container.innerHTML = html;
}

function showStory(index) {
    const allMessages = [
        ...categorizedData.romantic || [],
        ...categorizedData.funny || [],
        ...categorizedData.long || []
    ];

    if (allMessages.length === 0) {
        document.getElementById('storyContent').innerHTML = '<div class="no-results">Hikaye bulunamadı!</div>';
        return;
    }

    currentStoryIndex = Math.max(0, Math.min(index, allMessages.length - 1));

    const msg = allMessages[currentStoryIndex];
    const senderClass = msg.sender.toLowerCase().includes('seren') ? 'seren' : 'serkan';
    const senderName = msg.sender.toLowerCase().includes('seren') ? 'Seren' : 'Serkan';

    const html = `
        <div class="story-message ${senderClass}">
            <div class="sender" style="font-size: 1.5em; margin-bottom: 20px;">${senderName}</div>
            <div class="message-content">${escapeHtml(msg.content)}</div>
            <div class="message-date" style="margin-top: 20px;">${formatDate(msg.date)}</div>
        </div>
    `;

    document.getElementById('storyContent').innerHTML = html;
    document.getElementById('storyCounter').textContent = `${currentStoryIndex + 1} / ${allMessages.length}`;
}

function showRandomStory() {
    const allMessages = [
        ...categorizedData.romantic || [],
        ...categorizedData.funny || [],
        ...categorizedData.long || []
    ];

    if (allMessages.length > 0) {
        const randomIndex = Math.floor(Math.random() * allMessages.length);
        showStory(randomIndex);
    }
}

function renderStats() {
    const stats = categorizedData.statistics;
    const container = document.getElementById('statsContainer');

    let html = `
        <div class="stat-card">
            <h3>📊 Genel İstatistikler</h3>
            <div class="stat-value">${stats.total_messages.toLocaleString('tr-TR')}</div>
            <div class="stat-label">Toplam Mesaj</div>
        </div>
    `;

    html += `
        <div class="stat-card">
            <h3>📅 Yıllara Göre</h3>
            <ul class="stat-list">
    `;
    Object.entries(stats.by_year).sort((a, b) => b[0] - a[0]).forEach(([year, count]) => {
        html += `<li><span>${year}</span><span>${count.toLocaleString('tr-TR')}</span></li>`;
    });
    html += `</ul></div>`;

    html += `
        <div class="stat-card">
            <h3>👥 Kişilere Göre</h3>
            <ul class="stat-list">
    `;

    const senderStats = {};
    Object.entries(stats.by_sender).forEach(([sender, count]) => {
        const name = sender.toLowerCase().includes('seren') ? 'Seren' : 'Serkan';
        senderStats[name] = (senderStats[name] || 0) + count;
    });

    Object.entries(senderStats).forEach(([name, count]) => {
        html += `<li><span>${name}</span><span>${count.toLocaleString('tr-TR')}</span></li>`;
    });
    html += `</ul></div>`;

    html += `
        <div class="stat-card">
            <h3>🏷️ Kategorilere Göre</h3>
            <ul class="stat-list">
    `;
    Object.entries(stats.by_category).sort((a, b) => b[1] - a[1]).forEach(([cat, count]) => {
        const icon = categoryNames[cat] ? categoryNames[cat].split(' ')[0] : '📁';
        html += `<li><span>${icon} ${cat}</span><span>${count.toLocaleString('tr-TR')}</span></li>`;
    });
    html += `</ul></div>`;

    html += `
        <div class="stat-card">
            <h3>💬 En Çok Kullanılan Kelimeler</h3>
            <ul class="stat-list">
    `;
    Object.entries(stats.top_words).slice(0, 10).forEach(([word, count]) => {
        html += `<li><span>${word}</span><span>${count}</span></li>`;
    });
    html += `</ul></div>`;

    container.innerHTML = html;
}

document.addEventListener('DOMContentLoaded', () => {
    loadData();

    document.querySelectorAll('.nav-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const page = e.target.dataset.page;
            switchPage(page);

            if (page === 'stories') {
                showStory(0);
            } else if (page === 'stats') {
                renderStats();
            }
        });
    });

    document.querySelectorAll('.category-card').forEach(card => {
        card.addEventListener('click', (e) => {
            const category = e.currentTarget.dataset.category;
            showCategory(category);
        });
    });

    document.querySelector('.close-category-btn').addEventListener('click', () => {
        document.getElementById('categoryViewer').style.display = 'none';
    });

    document.querySelector('.view-first-day-btn').addEventListener('click', () => {
        const container = document.getElementById('firstDayMessages');
        let html = '';

        firstDayMessages.forEach(msg => {
            if (!msg.sender) return;

            const senderClass = msg.sender.toLowerCase().includes('seren') ? 'seren' : 'serkan';
            const senderName = msg.sender.toLowerCase().includes('seren') ? 'Seren' : 'Serkan';
            const platformIcon = msg.platform === 'Instagram' ? '📷' : msg.platform === 'Telegram' ? '✈️' : '💬';

            html += `
                <div class="message-bubble ${senderClass}">
                    <div class="message-header">
                        <span class="sender">${senderName} ${platformIcon}</span>
                        <span class="message-date">${formatDate(msg.date)}</span>
                    </div>
                    <div class="message-content">${escapeHtml(msg.content)}</div>
                </div>
            `;
        });

        container.innerHTML = html;
        document.getElementById('firstDayViewer').style.display = 'block';
        document.getElementById('firstDayViewer').scrollIntoView({ behavior: 'smooth' });
    });

    document.querySelector('.close-first-day-btn').addEventListener('click', () => {
        document.getElementById('firstDayViewer').style.display = 'none';
    });

    document.getElementById('categorySearchInput').addEventListener('input', (e) => {
        const searchTerm = e.target.value.toLowerCase();
        const filtered = currentCategoryMessages.filter(msg =>
            msg.content.toLowerCase().includes(searchTerm)
        );
        renderCategoryMessages(filtered);
    });

    document.getElementById('prevStory').addEventListener('click', () => {
        showStory(currentStoryIndex - 1);
    });

    document.getElementById('nextStory').addEventListener('click', () => {
        showStory(currentStoryIndex + 1);
    });

    document.querySelector('.random-btn').addEventListener('click', () => {
        showRandomStory();
    });
});