import re

with open("webflow_main.js", "w", encoding="utf-8") as f:
    # let's save data first if needed, but we can re-read
    pass

import urllib.request
url = "https://cdn.prod.website-files.com/5cff83ac2044e22cb8cf2f11/js/webflow.41526e95.e32c85395cd6ca97.js"
req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0'})
with urllib.request.urlopen(req) as resp:
    data = resp.read().decode('utf-8', errors='ignore')

# Search for "a-9-p" or "a-9"
m = re.search(r'"a-9-p":\{.*?\}\}', data)
if m:
    print("Found a-9-p:", m.group(0)[:1000])

m2 = re.search(r'"a-9":\{.*?\}\}', data)
if m2:
    print("Found a-9:", m2.group(0)[:1500])

# Let's search for action lists around a-9
idx = data.find('"a-9"')
if idx != -1:
    print("Slice around a-9:")
    print(data[idx:idx+2500])
