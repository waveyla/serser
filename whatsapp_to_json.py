import json
import re
from datetime import datetime
from collections import Counter
import emoji

def parse_whatsapp_chat(file_path):
    messages = []

    with open(file_path, 'r', encoding='utf-8') as file:
        lines = file.readlines()

    pattern = r'\[(\d{1,2}\.\d{2}\.\d{4}) (\d{2}:\d{2}:\d{2})\] ([^:]+): (.+)'

    for line in lines:
        match = re.match(pattern, line.strip())
        if match:
            date_str, time_str, sender, text = match.groups()

            # Parse date
            date_obj = datetime.strptime(date_str, '%d.%m.%Y')

            # Extract emojis
            emojis_in_text = [char for char in text if char in emoji.EMOJI_DATA]

            message = {
                'date': date_obj.strftime('%Y-%m-%d'),
                'time': time_str,
                'sender': sender.strip(),
                'text': text.strip(),
                'emojis': emojis_in_text,
                'word_count': len(text.split()),
                'char_count': len(text)
            }
            messages.append(message)

    return messages

def analyze_messages(messages):
    stats = {
        'total_messages': len(messages),
        'senders': {},
        'emojis': {},
        'words': {},
        'messages_by_date': {},
        'messages_by_hour': {}
    }

    all_words = []
    all_emojis = []

    for msg in messages:
        # Count by sender
        sender = msg['sender']
        if sender not in stats['senders']:
            stats['senders'][sender] = {
                'count': 0,
                'emojis_used': [],
                'total_words': 0
            }
        stats['senders'][sender]['count'] += 1
        stats['senders'][sender]['emojis_used'].extend(msg['emojis'])
        stats['senders'][sender]['total_words'] += msg['word_count']

        # Count by date
        date = msg['date']
        stats['messages_by_date'][date] = stats['messages_by_date'].get(date, 0) + 1

        # Count by hour
        hour = msg['time'].split(':')[0]
        stats['messages_by_hour'][hour] = stats['messages_by_hour'].get(hour, 0) + 1

        # Collect words and emojis
        words = msg['text'].lower().split()
        # Filter out common words
        filtered_words = [w for w in words if len(w) > 3 and not w.startswith('http')]
        all_words.extend(filtered_words)
        all_emojis.extend(msg['emojis'])

    # Top words
    word_counter = Counter(all_words)
    stats['top_words'] = dict(word_counter.most_common(20))

    # Top emojis
    emoji_counter = Counter(all_emojis)
    stats['top_emojis'] = dict(emoji_counter.most_common(10))

    # Special words (aşkım, sevgilim, canım, etc)
    love_words = ['aşkım', 'sevgilim', 'canım', 'birtanem', 'bebeğim', 'güzelim']
    stats['love_words'] = {}
    for word in love_words:
        count = sum(1 for w in all_words if word in w)
        if count > 0:
            stats['love_words'][word] = count

    return stats

# Ana işlem
def process_whatsapp_export(input_file, output_file):
    print("WhatsApp mesajları okunuyor...")
    messages = parse_whatsapp_chat(input_file)

    print(f"Toplam {len(messages)} mesaj bulundu!")

    print("Analiz yapılıyor...")
    stats = analyze_messages(messages)

    # JSON olarak kaydet
    output = {
        'messages': messages,
        'statistics': stats
    }

    with open(output_file, 'w', encoding='utf-8') as f:
        json.dump(output, f, ensure_ascii=False, indent=2)

    print(f"JSON dosyası oluşturuldu: {output_file}")

    # Özet bilgileri göster
    print("\n=== ÖZET İSTATİSTİKLER ===")
    print(f"Toplam mesaj: {stats['total_messages']}")
    print("\nKişi bazında mesajlar:")
    for sender, data in stats['senders'].items():
        print(f"  {sender}: {data['count']} mesaj, {data['total_words']} kelime")

    print("\nEn çok kullanılan emojiler:")
    for emoji, count in list(stats['top_emojis'].items())[:5]:
        print(f"  {emoji}: {count} kez")

    print("\nAşk kelimeleri:")
    for word, count in stats['love_words'].items():
        print(f"  {word}: {count} kez")

    return output

# Kullanım
if __name__ == "__main__":
    # WhatsApp export dosyanızın yolunu buraya girin
    input_file = input("WhatsApp export dosyasının yolunu girin: ")
    output_file = "whatsapp_messages.json"

    try:
        result = process_whatsapp_export(input_file, output_file)
        print("\nİşlem başarıyla tamamlandı!")
    except Exception as e:
        print(f"Hata: {e}")