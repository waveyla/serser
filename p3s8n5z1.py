import json
from datetime import datetime
from collections import defaultdict
import re
import os

def fix_encoding(text):
    try:
        return text.encode('latin1').decode('utf-8')
    except:
        return text

def load_json_file(file_path):
    with open(file_path, 'r', encoding='utf-8') as f:
        return json.load(f)

def timestamp_to_date(timestamp_ms):
    return datetime.fromtimestamp(timestamp_ms / 1000)

def categorize_message(content, msg_date):
    content_lower = content.lower()

    romantic_keywords = ['seviyorum', 'aşkım', 'canım', 'hayatım', 'bebeğim', 'güzelim',
                        'tatlım', 'kalbim', 'özledim', 'öpüyorum', 'sarılmak', 'mutluyum',
                        'seninle', 'birlikteyken', 'gözlerin', 'gülüşün']

    funny_keywords = ['haha', 'jsjsjs', 'kahkaha', 'gülüyorum', 'komik', 'delirdim',
                     'ölüyorum', 'çok iyi', '😂', '🤣', 'sjsjsj']

    goodmorning_keywords = ['günaydın', 'iyi sabahlar', 'uyandın mı', 'sabah', 'kalktın mı']
    goodnight_keywords = ['iyi geceler', 'uyu', 'uyuyorum', 'yorgunum', 'gece']

    special_keywords = ['doğum günü', 'yıldönüm', 'evlilik', 'kutlu olsun', 'mutlu yıllar',
                       'özel gün', 'sürpriz']

    categories = []

    if any(keyword in content_lower for keyword in romantic_keywords):
        categories.append('romantic')

    if any(keyword in content_lower for keyword in funny_keywords):
        categories.append('funny')

    if any(keyword in content_lower for keyword in goodmorning_keywords):
        categories.append('goodmorning')

    if any(keyword in content_lower for keyword in goodnight_keywords):
        categories.append('goodnight')

    if any(keyword in content_lower for keyword in special_keywords):
        categories.append('special')

    if msg_date.hour >= 0 and msg_date.hour < 6:
        categories.append('midnight')

    if len(content) > 200:
        categories.append('long')

    emoji_count = len(re.findall(r'[\U0001F600-\U0001F64F\U0001F300-\U0001F5FF\U0001F680-\U0001F6FF\U0001F1E0-\U0001F1FF\u2600-\u26FF\u2700-\u27BF]', content))
    if emoji_count >= 3:
        categories.append('emoji_rich')

    if not categories:
        categories.append('general')

    return categories

def parse_instagram_messages(data):
    messages = []
    for msg in data.get('messages', []):
        if 'content' not in msg or 'timestamp_ms' not in msg:
            continue

        content = fix_encoding(msg['content'])
        if content in ['You sent an attachment.', 'seren sent an attachment.',
                      'Bir mesajı beğendi', 'You reacted 😂 to a message']:
            continue

        msg_date = timestamp_to_date(msg['timestamp_ms'])
        sender = fix_encoding(msg['sender_name'])

        messages.append({
            'date': msg_date.strftime('%Y-%m-%d %H:%M:%S'),
            'timestamp': msg['timestamp_ms'],
            'sender': sender,
            'content': content,
            'platform': 'Instagram',
            'year': msg_date.year,
            'month': msg_date.month,
            'day': msg_date.day,
            'hour': msg_date.hour
        })

    return messages

def parse_telegram_messages(data):
    messages = []

    for chat in data.get('chats', {}).get('list', []):
        if chat.get('type') != 'personal_chat':
            continue

        for msg in chat.get('messages', []):
            if msg.get('type') != 'message':
                continue

            text = msg.get('text', '')
            if isinstance(text, list):
                text = ' '.join([item.get('text', '') if isinstance(item, dict) else str(item) for item in text])
            elif isinstance(text, dict):
                text = text.get('text', '')

            if not text or text.strip() == '':
                continue

            msg_date = datetime.strptime(msg['date'], '%Y-%m-%dT%H:%M:%S')
            sender = msg.get('from', 'Unknown')

            messages.append({
                'date': msg_date.strftime('%Y-%m-%d %H:%M:%S'),
                'timestamp': int(msg.get('date_unixtime', 0)) * 1000,
                'sender': sender,
                'content': text,
                'platform': 'Telegram',
                'year': msg_date.year,
                'month': msg_date.month,
                'day': msg_date.day,
                'hour': msg_date.hour
            })

    return messages

def parse_whatsapp_messages(file_path):
    messages = []

    with open(file_path, 'r', encoding='utf-8') as f:
        for line in f:
            line = line.strip()
            if not line:
                continue

            pattern = r'\[(\d{1,2}\.\d{1,2}\.\d{4})\s+(\d{1,2}:\d{2}:\d{2})\]\s+([^:]+):\s+(.+)'
            match = re.match(pattern, line)

            if match:
                date_str = match.group(1)
                time_str = match.group(2)
                sender = match.group(3).strip()
                content = match.group(4).strip()

                if 'Mesajlar ve aramalar uçtan uca' in content or 'Çıkartma dahil edilmedi' in content:
                    continue

                try:
                    msg_date = datetime.strptime(f"{date_str} {time_str}", '%d.%m.%Y %H:%M:%S')

                    messages.append({
                        'date': msg_date.strftime('%Y-%m-%d %H:%M:%S'),
                        'timestamp': int(msg_date.timestamp() * 1000),
                        'sender': sender,
                        'content': content,
                        'platform': 'WhatsApp',
                        'year': msg_date.year,
                        'month': msg_date.month,
                        'day': msg_date.day,
                        'hour': msg_date.hour
                    })
                except:
                    pass

    return messages

def analyze_messages():
    print("Mesajlar yükleniyor...")

    instagram_1 = load_json_file('message_1.json')
    instagram_2 = load_json_file('message_2.json')
    telegram_data = load_json_file('result.json')

    print("Instagram mesajları işleniyor...")
    instagram_messages = []
    instagram_messages.extend(parse_instagram_messages(instagram_1))
    instagram_messages.extend(parse_instagram_messages(instagram_2))

    print("Telegram mesajları işleniyor...")
    telegram_messages = parse_telegram_messages(telegram_data)

    print("WhatsApp mesajları işleniyor...")
    whatsapp_file = os.path.join('whatsapp_extracted', '_chat.txt')
    whatsapp_messages = []
    if os.path.exists(whatsapp_file):
        whatsapp_messages = parse_whatsapp_messages(whatsapp_file)

    all_data = {
        'romantic': [],
        'funny': [],
        'special': [],
        'goodmorning': [],
        'goodnight': [],
        'midnight': [],
        'long': [],
        'emoji_rich': [],
        'general': [],
        'statistics': {
            'total_messages': 0,
            'by_year': {},
            'by_sender': {},
            'by_hour': {},
            'by_category': {},
            'top_words': {},
            'first_messages': [],
            'special_dates': []
        }
    }

    all_messages = instagram_messages + telegram_messages + whatsapp_messages
    all_messages.sort(key=lambda x: x['timestamp'])

    print(f"Toplam {len(all_messages)} mesaj kategorilere ayrılıyor...")

    for msg in all_messages:
        categories = categorize_message(msg['content'], datetime.strptime(msg['date'], '%Y-%m-%d %H:%M:%S'))

        for cat in categories:
            all_data[cat].append(msg)

        year = str(msg['year'])
        all_data['statistics']['by_year'][year] = all_data['statistics']['by_year'].get(year, 0) + 1

        sender = msg['sender']
        all_data['statistics']['by_sender'][sender] = all_data['statistics']['by_sender'].get(sender, 0) + 1

        hour = str(msg['hour'])
        all_data['statistics']['by_hour'][hour] = all_data['statistics']['by_hour'].get(hour, 0) + 1

        for word in msg['content'].lower().split():
            if len(word) > 3:
                all_data['statistics']['top_words'][word] = all_data['statistics']['top_words'].get(word, 0) + 1

    all_data['statistics']['total_messages'] = len(all_messages)

    for cat in ['romantic', 'funny', 'special', 'goodmorning', 'goodnight', 'midnight', 'long', 'emoji_rich']:
        all_data['statistics']['by_category'][cat] = len(all_data[cat])

    top_words = sorted(all_data['statistics']['top_words'].items(), key=lambda x: x[1], reverse=True)[:20]
    all_data['statistics']['top_words'] = dict(top_words)

    if len(all_messages) > 0:
        all_data['statistics']['first_messages'] = all_messages[:10]

    with open('categorized_data.json', 'w', encoding='utf-8') as f:
        json.dump(all_data, f, ensure_ascii=False, indent=2)

    instagram_count = len([m for m in all_messages if m.get('platform') == 'Instagram'])
    telegram_count = len([m for m in all_messages if m.get('platform') == 'Telegram'])
    whatsapp_count = len([m for m in all_messages if m.get('platform') == 'WhatsApp'])

    all_data['statistics']['by_platform'] = {
        'Instagram': instagram_count,
        'Telegram': telegram_count,
        'WhatsApp': whatsapp_count
    }

    print(f"\n📱 Platform dağılımı:")
    print(f"Instagram: {instagram_count} mesaj")
    print(f"Telegram: {telegram_count} mesaj")
    print(f"WhatsApp: {whatsapp_count} mesaj")
    print(f"\nKategorilere göre mesaj sayıları:")
    print(f"❤️  Romantik: {len(all_data['romantic'])}")
    print(f"😂 Komik: {len(all_data['funny'])}")
    print(f"🎉 Özel: {len(all_data['special'])}")
    print(f"☀️  Günaydın: {len(all_data['goodmorning'])}")
    print(f"🌙 İyi geceler: {len(all_data['goodnight'])}")
    print(f"🌃 Gece sohbetleri: {len(all_data['midnight'])}")
    print(f"📝 Uzun mesajlar: {len(all_data['long'])}")
    print(f"😍 Emoji yüklü: {len(all_data['emoji_rich'])}")
    print(f"\nVeriler 'categorized_data.json' dosyasına kaydedildi!")

analyze_messages()