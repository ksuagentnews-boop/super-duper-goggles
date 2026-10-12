import re, json, sys, os, urllib.request, html
UA={'User-Agent':'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0 Safari/537.36','Accept-Language':'en-US,en;q=0.9','Cookie':'CONSENT=YES+1'}
def get(u):
    return urllib.request.urlopen(urllib.request.Request(u,headers=UA),timeout=60).read()
log=open('out/log.txt','a')
for line in open('videos.txt'):
    if not line.strip(): continue
    name,vid=line.split()
    d=f'out/{name}'; os.makedirs(d,exist_ok=True)
    for t in ['maxresdefault','hq1','hq2','hq3','sddefault']:
        try: open(f'{d}/{t}.jpg','wb').write(get(f'https://i.ytimg.com/vi/{vid}/{t}.jpg'))
        except Exception as e: log.write(f'{name} thumb {t} {e}\n')
    try:
        h=get(f'https://www.youtube.com/watch?v={vid}&hl=en').decode('utf8','ignore')
        m=re.search(r'"playerStoryboardSpecRenderer":\{"spec":"([^"]+)"',h)
        dur=re.search(r'"lengthSeconds":"(\d+)"',h)
        log.write(f'{name} page {len(h)} spec {bool(m)} dur {dur.group(1) if dur else None}\n')
        if dur: open(f'{d}/duration.txt','w').write(dur.group(1))
        if not m: continue
        spec=m.group(1).encode().decode('unicode_escape').replace('\\/','/')
        parts=spec.split('|'); base=parts[0]
        L=len(parts)-2  # highest level index
        w,hh,count,cols,rows,interval,nametpl,sigh=parts[-1].split('#')
        open(f'{d}/storyboard.txt','w').write(f'level {L} {w}x{hh} count {count} grid {cols}x{rows} interval_ms {interval}\n')
        per=int(cols)*int(rows); n=(int(count)+per-1)//per
        for i in range(n):
            u=base.replace('$L',str(L)).replace('$N',nametpl.replace('$M',str(i)))+'&sigh='+sigh
            try: open(f'{d}/sb_{i:02d}.jpg','wb').write(get(u))
            except Exception as e: log.write(f'{name} sb {i} {e}\n')
    except Exception as e:
        log.write(f'{name} page error {e}\n')
