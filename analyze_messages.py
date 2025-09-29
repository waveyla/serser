import json
from datetime import datetime
from collections import defaultdict

def fix_encoding(text):
    try:
        return text.encode('latin1').decode('utf-8')
    except:
        return text

def load_messages(file_path):
    with open(file_path, 'r', encoding='utf-8') as f:
        return json.load(f)

def timestamp_to_date(timestamp_ms):
    return datetime.fromtimestamp(timestamp_ms / 1000)

def extract_timeline_moments(messages_data):
    moments = []

    tanisma_date = datetime(2017, 9, 30)
    evlilik_date = datetime(2023, 6, 25)

    for msg in messages_data.get('messages', []):
        if 'content' not in msg or 'timestamp_ms' not in msg:
            continue

        content = fix_encoding(msg['content'])
        if content in ['You sent an attachment.', 'seren sent an attachment.',
                       'Bir mesajı beğendi', 'You reacted 😂 to a message']:
            continue

        msg_date = timestamp_to_date(msg['timestamp_ms'])
        sender = fix_encoding(msg['sender_name'])

        moments.append({
            'date': msg_date.strftime('%Y-%m-%d %H:%M:%S'),
            'timestamp': msg['timestamp_ms'],
            'sender': sender,
            'content': content,
            'year': msg_date.year,
            'month': msg_date.month,
            'day': msg_date.day
        })

    return sorted(moments, key=lambda x: x['timestamp'])

print("Mesajlar analiz ediliyor...")
messages1 = load_messages('message_1.json')
messages2 = load_messages('message_2.json')
result = load_messages('result.json')

all_moments = []
all_moments.extend(extract_timeline_moments(messages1))
all_moments.extend(extract_timeline_moments(messages2))
all_moments.extend(extract_timeline_moments(result))

all_moments = sorted(all_moments, key=lambda x: x['timestamp'])

with open('timeline_data.json', 'w', encoding='utf-8') as f:
    json.dump(all_moments, f, ensure_ascii=False, indent=2)

print(f"Toplam {len(all_moments)} mesaj bulundu ve timeline_data.json'a kaydedildi")

yearly_count = defaultdict(int)
for m in all_moments:
    yearly_count[m['year']] += 1

print("\nYıllara göre mesaj sayısı:")
for year in sorted(yearly_count.keys()):
    print(f"{year}: {yearly_count[year]} mesaj")