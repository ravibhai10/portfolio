import urllib.request, re
t = urllib.request.urlopen('http://localhost:5173/', timeout=15).read().decode('utf-8', 'replace')
print('title:', re.search(r'<title>.*?</title>', t).group(0))
print('preload-sprite:', 'spritesheet' in t)
print('has-root:', 'id="root"' in t)
print('len:', len(t))
