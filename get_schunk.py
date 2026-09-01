import urllib.request
import re

url = "https://cdn.prod.website-files.com/5cff83ac2044e22cb8cf2f11/js/webflow.schunk.4a394eb5af8156f2.js"
req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0'})
try:
    with urllib.request.urlopen(req) as resp:
        data = resp.read().decode('utf-8', errors='ignore')
        print(f"Downloaded {len(data)} chars")
        # search for e8bad840
        matches = [m.start() for m in re.finditer(r'e8bad840', data)]
        for idx in matches:
            print("--- CHUNK MATCH ---")
            print(data[max(0, idx-200):min(len(data), idx+600)])
except Exception as e:
    print("Error:", e)
