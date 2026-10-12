import re, json, os, urllib.request
UA='Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0 Safari/537.36'
def get(u, data=None, hdr=None):
    h={'User-Agent':UA,'Accept-Language':'en-US,en;q=0.9','Cookie':'CONSENT=YES+1; SOCS=CAI'}
    if hdr: h.update(hdr)
    return urllib.request.urlopen(urllib.request.Request(u,data=data,headers=h),timeout=60).read()
log=open('out/log.txt','a')
CLIENTS=[('WEB_EMBEDDED_PLAYER','1.20240723.01.00',None),('TVHTML5_SIMPLY_EMBEDDED_PLAYER','2.0',None),('WEB','2.20240726.00.00',None),('MWEB','2.20240726.01.00',None),('TVHTML5','7.20240724.13.00',None)]
def spec_for(vid):
    for src in ('embed','watch'):
        try:
            u=f'https://www.youtube.com/embed/{vid}' if src=='embed' else f'https://www.youtube.com/watch?v={vid}&bpctr=9999999999&has_verified=1'
            h=get(u).decode('utf8','ignore')
            m=re.search(r'"spec":"(https:[^"]+storyboard[^"]+)"',h)
            if m: return m.group(1), src
        except Exception as e: log.write(f'{vid} {src} {e}\n')
    for name,ver,_ in CLIENTS:
        body=json.dumps({'context':{'client':{'clientName':name,'clientVersion':ver,'hl':'en'},'thirdParty':{'embedUrl':'https://www.youtube.com/'}},'videoId':vid}).encode()
        try:
            r=json.loads(get('https://www.youtube.com/youtubei/v1/player?prettyPrint=false',body,{'Content-Type':'application/json'}))
            sb=r.get('storyboards',{})
            s=json.dumps(sb)
            m=re.search(r'"spec": "(https:[^"]+)"',s)
            log.write(f'{vid} client {name} status {r.get("playabilityStatus",{}).get("status")} sb {bool(m)}\n')
            if m: return m.group(1), name
        except Exception as e: log.write(f'{vid} client {name} {e}\n')
    return None, None
for line in open('videos.txt'):
    if not line.strip(): continue
    name,vid=line.split(); d=f'out/{name}'; os.makedirs(d,exist_ok=True)
    spec,src=spec_for(vid)
    log.write(f'== {name} spec via {src}\n')
    if not spec: continue
    spec=spec.encode().decode('unicode_escape').replace('\\/','/')
    parts=spec.split('|'); base=parts[0]; L=len(parts)-2
    w,hh,count,cols,rows,interval,nametpl,sigh=parts[-1].split('#')
    open(f'{d}/storyboard.txt','w').write(f'L{L} {w}x{hh} count {count} grid {cols}x{rows} interval {interval}\n')
    per=int(cols)*int(rows); n=(int(count)+per-1)//per
    for i in range(n):
        u=base.replace('$L',str(L)).replace('$N',nametpl.replace('$M',str(i)))+'&sigh='+sigh
        try: open(f'{d}/sb_{i:02d}.jpg','wb').write(get(u))
        except Exception as e: log.write(f'{name} sb{i} {e}\n')
