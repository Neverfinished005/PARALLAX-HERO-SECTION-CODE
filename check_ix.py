import urllib.request
import json
import re

# Fetch webflow js or check HTML for ixData
with open(r'C:\Users\ADMIN\.gemini\antigravity-ide\brain\9757e623-f2ef-4a40-8024-9d01dba40988\.system_generated\steps\4\content.md', 'r', encoding='utf-8', errors='ignore') as f:
    html = f.read()

# Webflow embeds IX2 data either in a script tag or JSON
ix2_match = re.search(r'data-automation-id="ix2-data">([^<]+)<', html)
if ix2_match:
    print("Found ix2-data in HTML!")
else:
    # search for e8bad840-8fd1-63af-7b85-b9eb171d9a31 anywhere in HTML
    for m in re.finditer(r'e8bad840-8fd1-63af-7b85-b9eb171d9a31', html):
        idx = m.start()
        print("Match at", idx, ":", html[idx-100:idx+200])

# Let's also check CSS rules for .scroll-container, .sticky-container, .bg-scroll, .bg-main, .hero-parent, .intro-parent
with open(r'C:\Users\ADMIN\.gemini\antigravity-ide\brain\9757e623-f2ef-4a40-8024-9d01dba40988\.system_generated\steps\13\content.md', 'r', encoding='utf-8', errors='ignore') as f:
    css = f.read()

classes = ['scroll-container', 'sticky-container', 'bg-scroll', 'bg-main', 'hero-parent', 'intro-parent', 'head', 'logo-lg']
for cl in classes:
    m = re.search(r'\.' + cl + r'\b[^{]*\{[^}]+\}', css)
    if m:
        print(f"CSS Rule for .{cl}:")
        print(m.group(0))
    else:
        print(f"No rule for .{cl}")
