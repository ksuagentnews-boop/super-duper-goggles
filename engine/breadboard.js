/* The Digilent breadboard of EE312 Exp 5 (lab slides 14–33, docs/ee312/slides/exp5-slides-481.pdf), as a panel geometry for
   board.js (def.board = 'breadboard'): green base, four binding posts on the left — from the top ⏚ (black), Vc (red),
   Vb (teal-blue), Va (yellow), the lab board's colours (slide 14 is a stock photo with Vb / Va swapped) — two long vertical
   rails beside them (each one connected along its whole length; in the lab both carry ground), then three breadboards
   stacked: a pair of horizontal rail rows (− blue, + red; each row connected along its length) above, between and
   below the blocks, and in each block columns of 5 holes connected internally (rows J…F above the centre channel,
   E…A below it). A DIP-8 straddles the channel: pins 8…5 in row F, pins 1…4 in row E.
   Nodes (one per connected group): 0–3 posts · 4–5 vertical rails · 6… rail rows (top to bottom) · then the 5-hole strips:
   strip(block, half, col) = S0 + (block·2 + half)·C + col, half 0 = upper (J…F, hole 0 = J … 4 = F), 1 = lower (E…A,
   hole 0 = E … 4 = A). The drawing is larger than the real board (hole pitch Q units) so a finger can reach each hole. */
ENGINE.breadboard=function(opt={}){
const Q=opt.q||12,C=opt.cols||30,BLOCKS=opt.blocks||3;
const X0=126;                                         // x of column 1
const POSTS=[['⏚','#1d1d1d','#000'],['Vc','#d42a20','#6d140d'],['Vb','#1f8fa6','#0d4a57'],['Va','#e9c21c','#7a6510']];
const nodes=[];const add=(kind,name,holes,extra)=>{nodes.push(Object.assign({kind,name,holes},extra||{}));return nodes.length-1};
/* rows, top to bottom */
let y=22;const railRows=[],blockY=[];
const railPair=()=>{railRows.push({y,pol:'-'});railRows.push({y:y+Q,pol:'+'});y+=2*Q+Q};
for(let b=0;b<BLOCKS;b++){railPair();const up=[0,1,2,3,4].map(r=>y+r*Q);y+=5*Q+Q*0.6;const lo=[0,1,2,3,4].map(r=>y+r*Q);y+=5*Q+Q*0.4;blockY.push({up,lo})}
railPair();const H=y+4,W=X0+(C-1)*Q+28;
/* posts: four binding posts down the left edge; a banana plug goes on top, wires under the nut (4 attach points round it) */
const postY=[0,1,2,3].map(i=>Math.round(H*0.16+i*H*0.18));
POSTS.forEach(([n,c],i)=>{const cx=34,cy=postY[i];add('post',n,[[-13,-11],[13,-11],[-13,11],[13,11]].map(([dx,dy])=>({x:cx+dx,y:cy+dy})),{c:{x:cx,y:cy},col:c})});
/* the two long vertical rails beside the posts, holes in groups of five */
const vy=[];for(let r=0,yy=24;yy<H-14;r++,yy+=Q)if(r%6!==5)vy.push(yy);
[80,94].forEach((x,i)=>add('vrail',i?'right rail':'left rail',vy.map(yy=>({x,y:yy})),{pol:i?'-':'+'}));
/* horizontal rail rows: groups of five across the width */
const rx=[];for(let c=0;c<C;c++)if(c%6!==5)rx.push(X0+c*Q);
railRows.forEach((r,i)=>add('rail',`rail ${Math.floor(i/2)+1} ${r.pol}`,rx.map(x=>({x,y:r.y})),{pol:r.pol}));
const S0=nodes.length;
blockY.forEach((B,b)=>[B.up,B.lo].forEach((rows,half)=>{for(let c=0;c<C;c++)add('strip',(half?'EDCBA':'JIHGF')[0]+'–'+(half?'A':'F')+' '+(c+1)+(BLOCKS>1?` (block ${b+1})`:''),rows.map(yy=>({x:X0+c*Q,y:yy})),{b,half,col:c})}));
const NN=nodes.length;
const strip=(b,half,c)=>S0+(b*2+half)*C+c;
const ROWL=['J','I','H','G','F','E','D','C','B','A'];
/* a hole's name as printed on the board: column + row letter (strips), post name, rail */
function holeName(n,h){const d=nodes[n];if(!d)return '';if(d.kind!=='strip')return d.name;return ROWL[d.half*5+h]+(d.col+1)+(BLOCKS>1?`·${d.b+1}`:'')}
function nodeName(n){const d=nodes[n];if(!d)return '';if(d.kind==='strip')return `col ${d.col+1} ${d.half?'E–A':'J–F'}`+(BLOCKS>1?` · block ${d.b+1}`:'');if(d.kind==='post')return d.name+' post';return d.name}
function nodeC(n){const d=nodes[n];if(d.c)return d.c;const hs=d.holes;let x=0,yy=0;hs.forEach(p=>{x+=p.x;yy+=p.y});return {x:x/hs.length,y:yy/hs.length}}
function rect(n){const d=nodes[n];if(d.kind==='post'){const c=d.c;return [c.x-22,c.y-22,44,44]}let x0=1e9,y0=1e9,x1=-1e9,y1=-1e9;d.holes.forEach(p=>{x0=Math.min(x0,p.x);y0=Math.min(y0,p.y);x1=Math.max(x1,p.x);y1=Math.max(y1,p.y)});return [x0-6,y0-6,x1-x0+12,y1-y0+12]}
/* nearest hole to (x, y) within r (optional filter on nodes) */
function nearestHole(x,yy,r=Q*0.9,ok){let best=null,bd=r;nodes.forEach((d,n)=>{if(ok&&!ok(n))return;d.holes.forEach((p,h)=>{const dd=Math.hypot(p.x-x,p.y-yy);if(dd<bd){bd=dd;best={n,h}}})});return best}
function svg(){let s=`<rect x="0" y="0" width="${W}" height="${H}" rx="10" fill="#1f6b45" stroke="#124a2f" stroke-width="2"/>`;
  /* the white plastic of the breadboard (vertical rails strip + the blocks) */
  s+=`<rect x="70" y="10" width="34" height="${H-20}" rx="3" fill="#f4f3ee" stroke="#c9c6bb"/><line x1="73" y1="16" x2="73" y2="${H-16}" stroke="#c9302a" stroke-width="1.6"/><line x1="101" y1="16" x2="101" y2="${H-16}" stroke="#2a62c9" stroke-width="1.6"/>`;
  s+=`<rect x="${X0-14}" y="10" width="${W-X0+4}" height="${H-20}" rx="3" fill="#f4f3ee" stroke="#c9c6bb"/>`;
  /* rail rows: coloured lines with − / + marks; the channel of each block */
  railRows.forEach(r=>{const col=r.pol==='+'?'#c9302a':'#2a62c9',yl=r.pol==='+'?r.y+Q*0.55:r.y-Q*0.55;s+=`<line x1="${X0-6}" y1="${yl}" x2="${W-18}" y2="${yl}" stroke="${col}" stroke-width="1.4"/>`+T(X0-9,r.y+3,r.pol==='+'?'+':'−',{size:9,fill:col,a:'end',w:700})});
  blockY.forEach(B=>{const yc=(B.up[4]+B.lo[0])/2;s+=`<rect x="${X0-10}" y="${yc-Q*0.25}" width="${W-X0-4}" height="${Q*0.5}" fill="#dedcd3"/>`;
    ROWL.slice(0,5).forEach((L,r)=>s+=T(X0-9,B.up[r]+3,L,{size:6,fill:'#8a877c',a:'end'}));ROWL.slice(5).forEach((L,r)=>s+=T(X0-9,B.lo[r]+3,L,{size:6,fill:'#8a877c',a:'end'}));
    for(let c=0;c<C;c++)if(c===0||(c+1)%5===0){s+=T(X0+c*Q,B.up[0]-Q*0.6,String(c+1),{size:6,fill:'#8a877c',a:'middle'})}});
  /* posts with their labels, DIGILENT down the left edge */
  nodes.forEach((d,n)=>{if(d.kind!=='post')return;const c=d.c;const [nm,col,dk]=POSTS[n];
    s+=`<circle cx="${c.x}" cy="${c.y}" r="15" fill="${col}" stroke="${dk}" stroke-width="2"/><circle cx="${c.x}" cy="${c.y}" r="9" fill="${col}" stroke="${dk}" stroke-width="1.2" opacity=".85"/><circle cx="${c.x}" cy="${c.y}" r="3.6" fill="#222"/>`+
      T(c.x+24,c.y+4,nm,{size:nm==='⏚'?13:10,fill:'#f2f0e6',w:700})});
  s+=`<g transform="translate(18 ${H-20}) rotate(-90)">`+T(0,0,'▲ DIGILENT',{size:12,fill:'#f2f0e6',w:800})+T(0,10,'A National Instruments Company',{size:5,fill:'#cfe3d6'})+`</g>`;
  /* every connected group: a transparent target (tap = that node) and its holes */
  nodes.forEach((d,n)=>{const r=rect(n);s+=`<rect x="${r[0]}" y="${r[1]}" width="${r[2]}" height="${r[3]}" rx="3" fill="transparent" data-k="node:${n}"/>`;
    if(d.kind!=='post')d.holes.forEach(p=>s+=`<rect x="${p.x-2.6}" y="${p.y-2.6}" width="5.2" height="5.2" rx="1" fill="#3b3d3c" pointer-events="none"/>`)});
  return s}
return {W,H,NN,C,Q,S0,nodes,holeP:(n,h)=>nodes[n].holes[h],nodeC,rect,svg,nearestHole,strip,holeName,nodeName,nHoles:n=>nodes[n].holes.length,
  post:name=>nodes.findIndex(d=>d.kind==='post'&&d.name===name),vrail:i=>4+i,rail:i=>6+i,isStrip:n=>nodes[n]&&nodes[n].kind==='strip',kind:n=>nodes[n]&&nodes[n].kind,
  /* a DIP-8 anchored on upper strip n (its pin 8, row F) straddles the channel to row E */
  dipFits:n=>{const d=nodes[n];return !!d&&d.kind==='strip'&&d.half===0&&d.col+3<C},blocks:BLOCKS};
};
