import urllib.request, json, os
from dotenv import load_dotenv

load_dotenv()
api_key = os.getenv("PREDICTHQ_API_KEY")

url = 'https://api.predicthq.com/v1/events/?country=IN&location_around.origin=12.9716,77.5946&location_around.scale=20km&limit=5&sort=-rank&state=active'
req = urllib.request.Request(url, headers={
    'Authorization': f'Bearer {api_key}', 
    'Accept': 'application/json'
})

data = json.loads(urllib.request.urlopen(req).read().decode('utf-8'))
for e in data.get('results', []):
    print(f"* {e['title']} ({e['category']}, Rank: {e['rank']})")
