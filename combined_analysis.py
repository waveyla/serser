import json
import matplotlib.pyplot as plt
import matplotlib.font_manager as fm
from datetime import datetime
from collections import Counter
import numpy as np

# Türkçe karakter desteği
plt.rcParams['font.family'] = 'DejaVu Sans'

def load_telegram_data(file_path):
    """Telegram JSON verisini yükle"""
    with open(file_path, 'r', encoding='utf-8') as f:
        data = json.load(f)

    messages = []
    if 'chats' in data and 'list' in data['chats']:
        for chat in data['chats']['list']:
            if 'messages' in chat:
                for msg in chat['messages']:
                    if msg.get('type') == 'message' and msg.get('text'):
                        # Text string veya list olabilir
                        if isinstance(msg['text'], str):
                            text = msg['text']
                        elif isinstance(msg['text'], list):
                            text = ' '.join([t if isinstance(t, str) else t.get('text', '') for t in msg['text']])
                        else:
                            text = str(msg['text'])

                        messages.append({
                            'platform': 'Telegram',
                            'date': msg.get('date', ''),
                            'sender': msg.get('from', 'Unknown'),
                            'text': text
                        })
    return messages

def load_whatsapp_data(file_path):
    """WhatsApp JSON verisini yükle"""
    with open(file_path, 'r', encoding='utf-8') as f:
        data = json.load(f)

    messages = []
    if 'messages' in data:
        for msg in data['messages']:
            messages.append({
                'platform': 'WhatsApp',
                'date': msg.get('date', ''),
                'time': msg.get('time', ''),
                'sender': msg.get('sender', ''),
                'text': msg.get('text', ''),
                'emojis': msg.get('emojis', [])
            })

    return messages, data.get('statistics', {})

# Verileri yükle
print("Veriler yükleniyor...")
telegram_messages = load_telegram_data(r"C:\Users\PC\Desktop\Yeni klasör (2)\result.json")
whatsapp_messages, whatsapp_stats = load_whatsapp_data("whatsapp_messages.json")

print(f"Telegram: {len(telegram_messages)} mesaj")
print(f"WhatsApp: {len(whatsapp_messages)} mesaj")
print(f"TOPLAM: {len(telegram_messages) + len(whatsapp_messages)} mesaj")

# Birleşik analiz
combined_stats = {
    'total_messages': len(telegram_messages) + len(whatsapp_messages),
    'telegram_count': len(telegram_messages),
    'whatsapp_count': len(whatsapp_messages),
    'whatsapp_stats': whatsapp_stats
}

# Grafikleri oluştur
fig, axes = plt.subplots(2, 3, figsize=(15, 10))
fig.suptitle('Dijital Aşk Hikayemiz - 30 Eylül 2025', fontsize=16, fontweight='bold')

# 1. Platform Karşılaştırması (Pasta Grafiği)
ax1 = axes[0, 0]
platforms = ['WhatsApp', 'Telegram']
platform_counts = [len(whatsapp_messages), len(telegram_messages)]
colors = ['#25D366', '#0088cc']
ax1.pie(platform_counts, labels=platforms, colors=colors, autopct='%1.1f%%', startangle=90)
ax1.set_title('Platform Dağılımı')

# 2. WhatsApp Kişi Bazında Mesajlar
ax2 = axes[0, 1]
if whatsapp_stats and 'senders' in whatsapp_stats:
    senders = list(whatsapp_stats['senders'].keys())
    sender_counts = [whatsapp_stats['senders'][s]['count'] for s in senders]
    ax2.bar(range(len(senders)), sender_counts, color=['#FF69B4', '#4169E1'])
    ax2.set_xticks(range(len(senders)))
    ax2.set_xticklabels(senders, rotation=45, ha='right')
    ax2.set_title('WhatsApp - Kişi Bazında Mesajlar')
    ax2.set_ylabel('Mesaj Sayısı')

# 3. En Çok Kullanılan Emojiler
ax3 = axes[0, 2]
if whatsapp_stats and 'top_emojis' in whatsapp_stats:
    emojis = list(whatsapp_stats['top_emojis'].keys())[:8]
    emoji_counts = [whatsapp_stats['top_emojis'][e] for e in emojis[:8]]
    ax3.barh(range(len(emojis)), emoji_counts, color='gold')
    ax3.set_yticks(range(len(emojis)))
    ax3.set_yticklabels(emojis)
    ax3.set_title('En Çok Kullanılan Emojiler')
    ax3.set_xlabel('Kullanım Sayısı')

# 4. Mesaj Saatleri Dağılımı
ax4 = axes[1, 0]
if whatsapp_stats and 'messages_by_hour' in whatsapp_stats:
    hours = sorted(whatsapp_stats['messages_by_hour'].keys())
    hour_counts = [whatsapp_stats['messages_by_hour'][h] for h in hours]
    ax4.plot(hours, hour_counts, marker='o', color='purple', linewidth=2)
    ax4.set_title('Günün Saatlerine Göre Mesajlar')
    ax4.set_xlabel('Saat')
    ax4.set_ylabel('Mesaj Sayısı')
    ax4.grid(True, alpha=0.3)

# 5. Aşk Kelimeleri
ax5 = axes[1, 1]
if whatsapp_stats and 'love_words' in whatsapp_stats:
    love_words = list(whatsapp_stats['love_words'].keys())
    love_counts = [whatsapp_stats['love_words'][w] for w in love_words]
    ax5.bar(range(len(love_words)), love_counts, color='red')
    ax5.set_xticks(range(len(love_words)))
    ax5.set_xticklabels(love_words, rotation=45, ha='right')
    ax5.set_title('Aşk Kelimeleri Kullanımı')
    ax5.set_ylabel('Kullanım Sayısı')

# 6. Özet İstatistikler (Metin)
ax6 = axes[1, 2]
ax6.axis('off')
stats_text = f"""
📊 GENEL İSTATİSTİKLER

📱 Toplam Mesaj: {combined_stats['total_messages']:,}
💬 WhatsApp: {combined_stats['whatsapp_count']:,}
✈️ Telegram: {combined_stats['telegram_count']:,}

💕 En Çok Kullanılan:
{whatsapp_stats.get('top_emojis', {}).get('😘', 0)} kez 😘
{whatsapp_stats.get('top_emojis', {}).get('😂', 0)} kez 😂
{whatsapp_stats.get('top_emojis', {}).get('🥰', 0)} kez 🥰

🌟 30 Eylül 2025
   Doğum Günün Kutlu Olsun!
"""
ax6.text(0.5, 0.5, stats_text, fontsize=11, ha='center', va='center',
         bbox=dict(boxstyle='round', facecolor='pink', alpha=0.3))

plt.tight_layout()
plt.savefig('ask_hikayemiz.png', dpi=300, bbox_inches='tight')
plt.show()

print("\n✨ 'ask_hikayemiz.png' dosyası oluşturuldu!")
print("📊 Analiz tamamlandı!")

# HTML rapor oluştur
html_content = f"""
<!DOCTYPE html>
<html>
<head>
    <title>Dijital Aşk Hikayemiz</title>
    <meta charset="utf-8">
    <style>
        body {{
            font-family: 'Segoe UI', Arial;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            padding: 50px;
        }}
        .container {{
            max-width: 800px;
            margin: auto;
            background: rgba(255,255,255,0.1);
            padding: 40px;
            border-radius: 20px;
        }}
        h1 {{
            text-align: center;
            font-size: 48px;
            margin-bottom: 30px;
        }}
        .stat-box {{
            background: rgba(255,255,255,0.2);
            padding: 20px;
            margin: 20px 0;
            border-radius: 10px;
        }}
        .emoji-stat {{
            font-size: 24px;
            margin: 10px;
        }}
    </style>
</head>
<body>
    <div class="container">
        <h1>💕 Dijital Aşk Hikayemiz 💕</h1>
        <h2 style="text-align:center">30 Eylül 2025 - Doğum Günün Kutlu Olsun! 🎂</h2>

        <div class="stat-box">
            <h3>📊 Genel İstatistikler</h3>
            <p>Toplam Mesaj: <strong>{combined_stats['total_messages']:,}</strong></p>
            <p>WhatsApp: <strong>{combined_stats['whatsapp_count']:,}</strong></p>
            <p>Telegram: <strong>{combined_stats['telegram_count']:,}</strong></p>
        </div>

        <div class="stat-box">
            <h3>😘 En Sevdiğimiz Emojiler</h3>
            <div class="emoji-stat">
                {'<br>'.join([f"{emoji}: {count} kez" for emoji, count in list(whatsapp_stats.get('top_emojis', {}).items())[:5]])}
            </div>
        </div>

        <div class="stat-box">
            <h3>💕 Aşk Kelimeleri</h3>
            <p>{', '.join([f"{word} ({count} kez)" for word, count in whatsapp_stats.get('love_words', {}).items()])}</p>
        </div>

        <div class="stat-box" style="text-align:center">
            <h3>🎁 Bu Özel Gün İçin</h3>
            <p>Seninle paylaştığımız her mesaj, her emoji, her kelime...</p>
            <p>Hepsi bizim hikayemizin bir parçası.</p>
            <p><strong>Seni Seviyorum! ❤️</strong></p>
        </div>
    </div>
</body>
</html>
"""

with open('dijital_ask_hikayemiz.html', 'w', encoding='utf-8') as f:
    f.write(html_content)

print("📄 'dijital_ask_hikayemiz.html' dosyası da oluşturuldu!")