import re

with open(r'C:\Users\ADMIN\.gemini\antigravity-ide\brain\9757e623-f2ef-4a40-8024-9d01dba40988\.system_generated\steps\4\content.md', 'r', encoding='utf-8', errors='ignore') as f:
    text = f.read()

matches = re.findall(r'https?://[^\s\"\'<>]+\.js', text)
for m in set(matches):
    print("JS:", m)

# Also let's inspect the CSS classes for scroll-container, bg-scroll, hero-parent, intro-parent
css_links = re.findall(r'https?://[^\s\"\'<>]+\.css', text)
for c in set(css_links):
    print("CSS:", c)
