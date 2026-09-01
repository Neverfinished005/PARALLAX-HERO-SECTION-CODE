import urllib.request
import re

url = "https://cdn.prod.website-files.com/5cff83ac2044e22cb8cf2f11/js/webflow.41526e95.e32c85395cd6ca97.js"
req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0'})
with urllib.request.urlopen(req) as resp:
    data = resp.read().decode('utf-8', errors='ignore')

idx = data.find('title:"scroll-section-1"')
print(data[idx:idx+4500])
