import json
from datetime import datetime

data = json.load(open('categorized_data.json', 'r', encoding='utf-8'))

all_msgs = []
for category in ['romantic', 'funny', 'special', 'goodmorning', 'goodnight', 'midnight', 'long', 'emoji_rich', 'general']:
    all_msgs.extend(data.get(category, []))

all_msgs.sort(key=lambda x: x['timestamp'])

first_day_msgs = []
for msg in all_msgs:
    msg_date = datetime.strptime(msg['date'], '%Y-%m-%d %H:%M:%S')
    if msg_date.year == 2017 and msg_date.month == 9 and msg_date.day == 30:
        first_day_msgs.append(msg)

with open('first_day_messages.json', 'w', encoding='utf-8') as f:
    json.dump(first_day_msgs, f, ensure_ascii=False, indent=2)

print(f'{len(first_day_msgs)} mesaj kaydedildi!')