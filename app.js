(()=>{
const CFG=window.LUXYNE||{},$=s=>document.querySelector(s),$$=s=>[...document.querySelectorAll(s)],E=encodeURIComponent;
const h=(t,p={},...k)=>{const e=Object.assign(document.createElement(t),p);e.append(...k);return e};
const S={items:[],i:-1,rot:0,flip:false};
const FX={none:'',gray:'grayscale(1)',sepia:'sepia(1)',blur:'blur(4px)',vintage:'sepia(.5) contrast(1.1) brightness(.9) saturate(1.3)',gold:'sepia(1) saturate(4) hue-rotate(-12deg) brightness(1.1) contrast(1.2)',bg:'grayscale(1) sepia(.7) saturate(3) hue-rotate(-8deg) contrast(1.3)'};
const kb=n=>n>1e6?(n/1e6).toFixed(2)+' MB':Math.max(1,Math.round(n/1e3))+' KB';
const toast=m=>{const t=$('#toast');t.textContent=m;t.classList.add('on');clearTimeout(toast.t);toast.t=setTimeout(()=>t.classList.remove('on'),2800)};
const go=t=>{$$('main>section').forEach(s=>s.hidden=s.id!==t);$$('[data-tab]').forEach(b=>b.setAttribute('aria-current',b.dataset.tab===t))};
$$('[data-tab]').forEach(b=>b.onclick=()=>go(b.dataset.tab));
document.fonts&&document.fonts.load('600 20px Cinzel');

/* ---------- muat gambar ---------- */
async function add(blob,name,url){
  const bm=await createImageBitmap(blob);
  if(S.items.length>=10)S.items.shift();
  S.items.push({name,bmp:bm,size:blob.size,url});
  pick(S.items.length-1);
}
async function fromUrl(u){
  try{
    let b;
    try{const r=await fetch(u);if(!r.ok)throw 0;b=await r.blob()}
    catch{const r=await fetch('https://wsrv.nl/?url='+E(u));if(!r.ok)throw 0;b=await r.blob()}
    await add(b,u.split('?')[0].split('/').pop()||'gambar',u);
  }catch{toast('Gambar tidak bisa dimuat. Cek lagi link-nya.')}
}
function pick(i){
  S.i=i;S.rot=0;S.flip=false;$('#empty').hidden=true;$('#stage').hidden=false;
  const s=$('#strip');
  s.replaceChildren(...S.items.map((it,k)=>h('button',{type:'button',textContent:it.name,title:it.name,onclick:()=>pick(k)})));
  [...s.children].forEach((b,k)=>b.setAttribute('aria-pressed',k===i));
  render();
}
$('#uf').onsubmit=e=>{e.preventDefault();const u=$('#u').value.trim();if(/^https?:\/\//.test(u))fromUrl(u);else toast('Tempel link yang diawali https://')};
$('#f').onchange=async e=>{for(const f of [...e.target.files].slice(0,10)){try{await add(f,f.name,null)}catch{toast(f.name+' tidak bisa dibaca')}}e.target.value=''};

/* ---------- gambar jadi ---------- */
function draw(c,fx){
  const it=S.items[S.i],sw=it.bmp.width,sh=it.bmp.height,sp=S.rot%180!==0,W=sp?sh:sw,H=sp?sw:sh;
  const t=h('canvas',{width:W,height:H}),x=t.getContext('2d');
  x.translate(W/2,H/2);x.rotate(S.rot*Math.PI/180);if(S.flip)x.scale(-1,1);x.drawImage(it.bmp,-sw/2,-sh/2);
  let tw=+$('#w').value,th=+$('#h').value;
  if(!tw&&!th){tw=W;th=H}else if(!th)th=Math.round(tw*H/W);else if(!tw)tw=Math.round(th*W/H);
  tw=Math.min(tw,4096);th=Math.min(th,4096);
  const k=Math.max(tw/W,th/H),cw=tw/k,ch=th/k;
  c.width=tw;c.height=th;
  const g=c.getContext('2d'),rad=fx?$('#rad').value/100*Math.min(tw,th)/2:0;
  g.beginPath();g.roundRect(0,0,tw,th,rad);g.clip();
  if($('#fmt').value==='jpg'){g.fillStyle='#fff';g.fillRect(0,0,tw,th)}
  if(fx)g.filter=`${FX[$('#fx').value]} brightness(${$('#br').value}%) contrast(${$('#co').value}%) saturate(${$('#sa').value}%) hue-rotate(${$('#hu').value}deg)`;
  g.drawImage(t,(W-cw)/2,(H-ch)/2,cw,ch,0,0,tw,th);g.filter='none';
  if(!fx)return;
  if($('#bd').checked){g.strokeStyle='#C9A227';g.lineWidth=Math.max(4,tw/100);g.beginPath();g.roundRect(0,0,tw,th,rad);g.stroke()}
  g.textBaseline='bottom';g.textAlign='right';
  if($('#wm').checked){const f=Math.max(16,tw/26);g.font=`600 ${f}px Cinzel,serif`;g.fillStyle='#C9A227';g.shadowColor='#000';g.shadowBlur=f/4;g.fillText('LUXYNE',tw-f*.8,th-f*.7)}
  const tx=$('#tx').value;
  if(tx){const f=Math.max(20,tw/14);g.font=`600 ${f}px Inter,sans-serif`;g.fillStyle='#fff';g.textAlign='center';g.textBaseline='middle';g.shadowColor='#000';g.shadowBlur=f/3;g.fillText(tx,tw/2,th/2,tw*.9)}
}
const toBmp=c=>{const w=c.width,ht=c.height,d=c.getContext('2d').getImageData(0,0,w,ht).data,s=w*ht*4,b=new Uint8Array(54+s),v=new DataView(b.buffer);
  b[0]=66;b[1]=77;v.setUint32(2,54+s,true);v.setUint32(10,54,true);v.setUint32(14,40,true);v.setInt32(18,w,true);v.setInt32(22,-ht,true);v.setUint16(26,1,true);v.setUint16(28,32,true);v.setUint32(34,s,true);
  for(let i=0;i<w*ht;i++){b[54+i*4]=d[i*4+2];b[55+i*4]=d[i*4+1];b[56+i*4]=d[i*4];b[57+i*4]=d[i*4+3]}
  return new Blob([b],{type:'image/bmp'})};
const toIco=async c=>{const k=Math.min(1,256/Math.max(c.width,c.height)),t=h('canvas',{width:Math.round(c.width*k),height:Math.round(c.height*k)});
  t.getContext('2d').drawImage(c,0,0,t.width,t.height);
  const p=new Uint8Array(await(await new Promise(r=>t.toBlob(r,'image/png'))).arrayBuffer()),b=new Uint8Array(22+p.length),v=new DataView(b.buffer);
  v.setUint16(2,1,true);v.setUint16(4,1,true);b[6]=t.width>255?0:t.width;b[7]=t.height>255?0:t.height;v.setUint16(12,32,true);v.setUint32(14,p.length,true);v.setUint32(18,22,true);b.set(p,22);
  return new Blob([b],{type:'image/x-icon'})};
async function encode(c,net=true){
  const f=$('#fmt').value;
  if(f==='bmp')return toBmp(c);if(f==='ico')return toIco(c);
  const m={jpg:'image/jpeg',png:'image/png',webp:'image/webp',avif:'image/avif',gif:'image/gif'}[f];
  const b=await new Promise(r=>c.toBlob(r,m,$('#q').value/100));
  if(b&&b.type===m)return b;
  if(net&&S.items[S.i].url){const r=await fetch(link());if(r.ok)return r.blob()}
  throw new Error(f.toUpperCase()+' hanya bisa untuk gambar dari link');
}
function link(){
  const it=S.items[S.i];if(!it||!it.url)return'';
  const f=$('#fmt').value,p=new URLSearchParams({url:it.url,output:f==='bmp'||f==='ico'?'png':f,q:$('#q').value,fit:'cover'}),fx=$('#fx').value;
  if($('#w').value)p.set('w',$('#w').value);if($('#h').value)p.set('h',$('#h').value);
  if(S.rot)p.set('ro',S.rot);if(S.flip)p.set('flop','');
  if(fx==='gray'||fx==='bg')p.set('filt','greyscale');if(['sepia','vintage','gold'].includes(fx))p.set('filt','sepia');if(fx==='blur')p.set('blur','6');
  const b=$('#br').value-100,c=$('#co').value-100,hu=$('#hu').value;
  if(b)p.set('bri',b);if(c)p.set('con',c);if(+hu)p.set('hue',hu);if($('#sa').value!=='100')p.set('sat',$('#sa').value/100);
  return'https://wsrv.nl/?'+p;
}
let tm;
function render(){
  clearTimeout(tm);
  tm=setTimeout(async()=>{
    if(S.i<0)return;
    draw($('#b'),0);draw($('#a'),1);
    const it=S.items[S.i],a=$('#a'),dim=`${a.width} x ${a.height} px`;
    try{const b=await encode(a,false),d=Math.round((1-b.size/it.size)*100);$('#sz').textContent=`${kb(it.size)} menjadi ${kb(b.size)} (${d>=0?'-':'+'}${Math.abs(d)}%) | ${dim}`}
    catch{$('#sz').textContent=`${kb(it.size)} sebelum | ukuran akhir dihitung saat unduh | ${dim}`}
  },100);
}
$$('.panel input,.panel select').forEach(e=>e.addEventListener('input',()=>{$$('output').forEach(o=>o.textContent=$('#'+o.dataset.f).value);render()}));
$('#pre').addEventListener('input',e=>{const[a,b]=e.target.value.split(',');$('#w').value=a||'';$('#h').value=b||''});
$('#rot').onclick=()=>{S.rot=(S.rot+90)%360;render()};
$('#flip').onclick=()=>{S.flip=!S.flip;render()};
$('#sl').oninput=e=>$('#cmp').style.setProperty('--p',e.target.value+'%');

/* ---------- unduh & salin ---------- */
const dl=(b,n)=>{const a=h('a',{href:URL.createObjectURL(b),download:n});document.body.append(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(a.href),1e4)};
const nm=it=>it.name.replace(/\.[^.]+$/,'')+'-luxyne.'+$('#fmt').value;
$('#dl').onclick=async()=>{if(S.i<0)return toast('Muat gambar dulu');try{dl(await encode($('#a')),nm(S.items[S.i]))}catch(e){toast(e.message)}};
$('#dlall').onclick=async()=>{const keep=S.i;for(let k=0;k<S.items.length;k++){S.i=k;const c=h('canvas');draw(c,1);try{dl(await encode(c),nm(S.items[k]))}catch(e){toast(e.message)}await new Promise(r=>setTimeout(r,350))}S.i=keep};
const copy=async t=>{if(!t)return toast('Copy link hanya untuk gambar dari link');try{await navigator.clipboard.writeText(t);toast('Tersalin')}catch{toast('Browser menolak menyalin. Buka lewat https.')}};
$('#cl').onclick=()=>copy(link());
$('#cc').onclick=()=>copy(link()&&`<img src="${link()}" alt="" loading="lazy">`);

/* ---------- cari foto & video: pool key + fallback sumber ---------- */
const J=async u=>{const r=await fetch(u);if(!r.ok)throw 0;return r.json()};
const bad=new Map();
async function pool(keys,fn){for(const k of keys||[]){if((bad.get(k)||0)>Date.now())continue;try{return await fn(k)}catch{bad.set(k,Date.now()+6e4)}}throw 0}
const P=[
['Pixabay',q=>pool(CFG.pixabay,async k=>(await J(`https://pixabay.com/api/?key=${k}&q=${E(q)}&per_page=24&safesearch=true`)).hits.map(x=>({t:x.webformatURL,f:x.largeImageURL,n:x.tags,p:x.pageURL})))],
['Unsplash',q=>pool(CFG.unsplash,async k=>(await J(`https://api.unsplash.com/search/photos?query=${E(q)}&per_page=24&client_id=${k}`)).results.map(x=>({t:x.urls.small,f:x.urls.regular,n:x.alt_description||q,p:x.links.html})))],
['Openverse',async q=>(await J(`https://api.openverse.org/v1/images/?q=${E(q)}&page_size=24`)).results.map(x=>({t:x.thumbnail,f:x.url,n:x.title,p:x.foreign_landing_url}))],
['Wikimedia',async q=>Object.values((await J(`https://commons.wikimedia.org/w/api.php?action=query&generator=search&gsrnamespace=6&gsrsearch=${E(q)}&gsrlimit=24&prop=imageinfo&iiprop=url&iiurlwidth=400&format=json&origin=*`)).query.pages).map(x=>({t:x.imageinfo[0].thumburl,f:x.imageinfo[0].url,n:x.title,p:x.imageinfo[0].descriptionurl}))],
['Picsum',async q=>Array.from({length:12},(_,i)=>({t:`https://picsum.photos/seed/${E(q)}${i}/400/300`,f:`https://picsum.photos/seed/${E(q)}${i}/1600/1200`,n:q,p:`https://picsum.photos/seed/${E(q)}${i}/1600/1200`}))]];
const safe=u=>/^https?:/.test(u||'')?u:'#';
$('#sf').onsubmit=async e=>{
  e.preventDefault();const q=$('#sq').value.trim();if(!q)return;
  const log=[];let res=[];
  for(const[n,fn]of P){try{res=(await fn(q)).filter(x=>x.t);if(res.length){log.push(n+' aktif');break}}catch{}log.push(n+' dilewati')}
  $('#ss').textContent=log.join(', ');
  $('#pg').replaceChildren(...res.map(x=>h('figure',{},h('img',{src:x.t,alt:x.n||q,loading:'lazy'}),
    h('figcaption',{},h('button',{type:'button',textContent:'Convert',onclick:()=>{go('convert');fromUrl(x.f)}}),h('a',{href:safe(x.p),target:'_blank',rel:'noopener',textContent:'Sumber'})))));
};
$('#vf').onsubmit=async e=>{
  e.preventDefault();const q=$('#vq').value.trim();if(!q)return;
  try{
    const r=await pool(CFG.pixabay,k=>J(`https://pixabay.com/api/videos/?key=${k}&q=${E(q)}&per_page=12`));
    $('#vs').textContent=r.hits.length+' video dari Pixabay';
    $('#vg').replaceChildren(...r.hits.map(x=>h('figure',{},h('video',{controls:true,preload:'none',poster:`https://i.vimeocdn.com/video/${x.picture_id}_640x360.jpg`,src:x.videos.medium.url||x.videos.small.url}),
      h('figcaption',{},h('span',{className:'mono',textContent:x.duration+' dtk'}),h('a',{href:safe(x.videos.large.url||x.videos.medium.url),target:'_blank',rel:'noopener',textContent:'Unduh'})))));
  }catch{$('#vs').textContent='Gagal. Pastikan key Pixabay sudah diisi di js/config.js'}
};
go('convert');
})();
