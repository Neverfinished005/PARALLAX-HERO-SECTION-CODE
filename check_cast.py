import re

with open(r'C:\Users\ADMIN\.gemini\antigravity-ide\brain\9757e623-f2ef-4a40-8024-9d01dba40988\.system_generated\steps\4\content.md', 'r', encoding='utf-8', errors='ignore') as f:
    html = f.read()

# find scroll-container-1
idx = html.find('scroll-container-1')
print("--- SCROLL CONTAINER 1 ---")
print(html[idx-100:idx+800])
