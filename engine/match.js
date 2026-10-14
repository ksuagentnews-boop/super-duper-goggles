/* Circuit equivalence (Batch 6 item 1): a "build the circuit" step passes when the student's bench IS the figure's circuit —
   the same parts (types and values), connected the same way, the instruments' terminals on the right nets — whatever panel
   nodes he used and however it looks. No check asks for node numbers.
   A figure is given by its reference wiring (def.figs[id].lines, the same line format the steps used:
     {part:[type,a,b], pol}  a two-leg part between reference nodes a and b (polar parts: a = anode / +)
     {ic:type, pins:{pin:node}} a multi-pin part, pins by name or role
     {lead:k, at:node, alt}   an instrument terminal (alt: the same connection on the other unit / meter)
     {wire:[a,b]}             a wire or bridging plug (nodes a and b are one net)
     {stub:node, n}           breadboard: standing jumpers for hooks (not part of the circuit)
   the reference nodes only say which terminals share a net). The bench netlist comes from the live state (parts, wires,
   plugs, leads). The match is a graph isomorphism: an injective map figure net → bench net under which every figure
   part maps onto a bench part of the same type with its legs on the mapped nets (polar parts the same way round), every
   instrument terminal is on its mapped net, and nothing else of the circuit (another part, an ammeter / source terminal)
   touches those nets.
   ENGINE.matcher(api) → {match(fig) → {ok, net(refNode) → bench net, why}, hint(fig) → {msg, at} | null} */
ENGINE.matcher=function(api){
/* api: {parts() → [{id,type,t,polar,ends:[net…] | pins:{name:net}}], leadNet(k), leadDef(k), PARTS, label(k)} */
function figNets(fig){const par={};const f=x=>{x=String(x);if(par[x]==null)par[x]=x;while(par[x]!==x){par[x]=par[par[x]];x=par[x]}return x};const u=(a,b)=>{par[f(a)]=f(b)};
  const parts=[],ics=[],leads=[];let earth=false;
  (fig.lines||[]).forEach(L=>{
    if(L.wire)u(L.wire[0],L.wire[1]);
    else if(L.part){const [t,a,b]=L.part;if((api.PARTS[t]||{}).t==='BR')u(a,b);else parts.push({type:t,a,b,polar:!!api.PARTS[t]&&api.polar(t)})}
    else if(L.ic)ics.push({type:L.ic,pins:L.pins});
    else if(L.lead){const keys=[L.lead,L.alt].filter(Boolean);leads.push({keys,at:L.at});if(api.leadDef(L.lead)&&api.leadDef(L.lead).earth){u(L.at,'E');earth=true}}});
  const N=x=>f(x);
  return {parts:parts.map(p=>({...p,a:N(p.a),b:N(p.b)})),ics:ics.map(c=>({type:c.type,pins:Object.fromEntries(Object.entries(c.pins).map(([k,v])=>[k,N(v)]))})),
    leads:leads.map(l=>({...l,net:N(l.at)})),earth,E:earth?N('E'):null,find:N}}
/* the search: leads first (they anchor the map), then ICs, then the two-leg parts, most constrained first */
function solve(F,B,opt={}){const map=new Map(),inv=new Map();const used=new Set();
  const bind=(fn,sn,undo)=>{if(sn==null)return false;if(map.has(fn))return map.get(fn)===sn;if(inv.has(sn))return false;map.set(fn,sn);inv.set(sn,fn);undo.push(fn);return true};
  const unbind=undo=>undo.forEach(fn=>{inv.delete(map.get(fn));map.delete(fn)});
  if(F.earth&&!opt.noEarth){const u=[];if(!bind(F.E,-1,u))return null}
  const leads=F.leads.filter((_,i)=>!(opt.skipLead===i)),parts=F.parts.filter((_,i)=>!(opt.skipPart===i));
  function L(i){if(i===leads.length)return C(0);const l=leads[i];for(const k of l.keys){const sn=B.leadNet(k);if(sn==null)continue;const u=[];if(bind(l.net,sn,u)&&L(i+1))return true;unbind(u)}return false}
  function C(i){if(i===F.ics.length)return P(new Set());const c=F.ics[i];for(const q of B.parts){if(used.has(q.id)||q.type!==c.type||!q.pins)continue;const u=[];
      if(Object.entries(c.pins).every(([pin,fn])=>bind(fn,q.pins[pin],u))){used.add(q.id);if(C(i+1))return true;used.delete(q.id)}unbind(u)}return false}
  function P(done){if(done.size===parts.length)return true;
    /* the unplaced part with the most legs already on mapped nets */
    let best=-1,bs=-1;parts.forEach((p,i)=>{if(done.has(i))return;const s=(map.has(p.a)?1:0)+(map.has(p.b)?1:0);if(s>bs){bs=s;best=i}});
    const p=parts[best];done.add(best);
    for(const q of B.parts){if(used.has(q.id)||q.type!==p.type||!q.ends)continue;const ways=p.polar&&!opt.noPol?[[0,1]]:[[0,1],[1,0]];
      for(const [x,y] of ways){const u=[];if(bind(p.a,q.ends[x],u)&&bind(p.b,q.ends[y],u)){used.add(q.id);if(P(done))return true;used.delete(q.id)}unbind(u)}}
    done.delete(best);return false}
  if(!L(0))return null;return {map,inv,used}}
/* nothing else of the circuit on the mapped nets: no other part, no other current path of an instrument */
function extras(F,B,R){const nets=new Set(R.inv.keys());const out=[];
  B.parts.forEach(q=>{if(R.used.has(q.id))return;const on=(q.ends||Object.values(q.pins||{})).some(n=>n!=null&&nets.has(n));if(on)out.push({part:q})});
  const figKeys=new Set(F.leads.flatMap(l=>l.keys));
  B.circuitLeads().forEach(k=>{if(figKeys.has(k))return;const n=B.leadNet(k);if(n!=null&&nets.has(n))out.push({lead:k})});
  return out}
function match(fig,opt){const F=figNets(fig),B=api.bench();const R=solve(F,B,opt);if(!R)return {ok:false,F,B};const ex=extras(F,B,R);
  return {ok:!ex.length,extra:ex,F,B,R,net:node=>{const fn=F.find(node);return R.map.has(fn)?R.map.get(fn):null}}}
/* what is wrong, in one or two sentences, and where (for «تلميح») */
function hint(fig){const F=figNets(fig),B=api.bench();const lab=t=>api.label(t);
  const cnt=a=>a.reduce((m,t)=>(m[t]=(m[t]||0)+1,m),{});const need=cnt(F.parts.map(p=>p.type).concat(F.ics.map(c=>c.type))),have=cnt(B.parts.map(q=>q.type));
  for(const t in need)if((have[t]||0)<need[t])return {msg:`ناقص ${lab(t)}${need[t]>1?` (لازم ${need[t]})`:''}: خذه من «العلبة» وركّبه مثل الشكل.`,at:null};
  for(const l of F.leads)if(l.keys.every(k=>B.leadNet(k)==null)){const k=l.keys[0],sib=B.siblingAt&&B.siblingAt(k);
    if(sib)return {msg:`${api.leadName(sib)} في jack غلط: لازم يكون في ${api.leadName(k)}.`,at:{lead:sib}};
    return {msg:`${api.leadName(k)} مو موصول في مكانه من الدائرة.`,at:{lead:k}}}
  const R=solve(F,B);
  if(R){const ex=extras(F,B,R);if(!ex.length)return null;const e=ex[0];
    return e.part?{msg:`فيه ${lab(e.part.type)} زيادة موصول في الدائرة: مو في الشكل، شيله أو افصله.`,at:{part:e.part.id}}:{msg:`${api.leadName(e.lead)} موصول في الدائرة وهو مو في الشكل: افصله.`,at:{lead:e.lead}}}
  /* reversed part: the circuit fits when polarity is ignored */
  if(solve(F,B,{noPol:true})){for(const t of new Set(F.parts.filter(p=>p.polar).map(p=>p.type))){const F2={...F,parts:F.parts.map(p=>p.type===t?{...p,polar:false}:p)};if(solve(F2,B))return {msg:`${lab(t)} مقلوب: اعكس اتجاهه (الشريط = الكاثود).`,at:{type:t}}}}
  /* one terminal on the wrong net (an ammeter across a part instead of in series, a ground on the wrong net …) */
  for(let i=0;i<F.leads.length;i++)if(solve(F,B,{skipLead:i})){const l=F.leads[i],k=l.keys.find(k=>B.leadNet(k)!=null)||l.keys[0];
    const ld=api.leadDef(k)||{};const amm=/ma$|a$/.test(k)&&ld.circuit;
    return {msg:amm?`${api.leadName(k)} مكانه غلط: الأميتر لازم يكون على التوالي في الفرع، مو على طرفي القطعة.`:ld.earth?`${api.leadName(k)} (الأرضي) مو على أرضي الدائرة.`:`${api.leadName(k)} على نقطة غلط من الدائرة.`,at:{lead:k}}}
  for(let i=0;i<F.parts.length;i++)if(solve(F,B,{skipPart:i}))return {msg:`${lab(F.parts[i].type)} مكانه غلط: راجع بين أي نقطتين لازم يكون في الشكل.`,at:{type:F.parts[i].type}};
  if(F.earth&&solve(F,B,{noEarth:true}))return {msg:'أرضي الأجهزة (الأسود) مو على نفس نقطة الأرضي في الشكل.',at:null};
  return {msg:'التوصيل مختلف عن الشكل: قارن كل قطعة وكل طرف مع الشكل، أو اضغط «وصّل لي».',at:null}}
return {figNets,match,hint}};
