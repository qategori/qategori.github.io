(function(){
'use strict';
function lsGet(k){try{return localStorage.getItem(k)}catch(e){return null}}
function lsSet(k,v){try{localStorage.setItem(k,v)}catch(e){}}
function esc(s){return String(s==null?'':s).replace(/[&<>"']/g,function(c){return{'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]})}
var nB=document.querySelector('.nB');
/* ---- mode gelap ---- */
function applyTheme(){var m=lsGet('q_theme');nB.setAttribute('data-theme',m==='dark'||m==='light'?m:'default')}
applyTheme();
var db=document.querySelector('.qDark');
if(db)db.addEventListener('click',function(){
  var cur=nB.getAttribute('data-theme'),dark=cur==='dark'||(cur==='default'&&matchMedia('(prefers-color-scheme: dark)').matches);
  lsSet('q_theme',dark?'light':'dark');applyTheme();document.documentElement.setAttribute('data-q',dark?'light':'dark');
  window.dispatchEvent(new Event('qtheme'));
});
/* ---- pencarian ---- */
var res=document.getElementById('qRes');
if(res){
  var q=(new URLSearchParams(location.search).get('q')||'').trim();
  var inp=document.querySelector('.qSearch input');if(inp)inp.value=q;
  fetch('/search.json').then(function(r){return r.json()}).then(function(D){
    var ws=q.toLowerCase().split(/\s+/).filter(Boolean);
    var out=D.map(function(d){var sc=0,t=d.t.toLowerCase();
      ws.forEach(function(w){if(t.indexOf(w)>=0)sc+=5;if(d.l.join(' ').toLowerCase().indexOf(w)>=0)sc+=2;if(d.tx.indexOf(w)>=0)sc+=1;else sc-=100});
      return[sc,d]}).filter(function(x){return ws.length&&x[0]>0}).sort(function(a,b){return b[0]-a[0]}).slice(0,60);
    res.innerHTML=!ws.length?'<p>Ketik kata kunci di kolom cari.</p>':!out.length?'<p>Tidak ada hasil untuk &ldquo;'+esc(q)+'&rdquo;.</p>':
      out.map(function(x){var d=x[1];return'<article class="qCard"><div><h3><a href="'+d.p+'">'+esc(d.t)+'</a></h3><p>'+esc(d.d)+'</p><small>'+esc(d.dt)+'</small></div></article>'}).join('');
  }).catch(function(){res.innerHTML='<p>Pencarian belum bisa dimuat.</p>'});
}
/* ---- beranda bertab ---- */
var root=document.getElementById('qHome');
var P='/p/';
if(!root){
  /* halaman lain: tautan materi dibawa ke beranda tidak perlu; semua halaman berdiri sendiri */
  return;
}
var BEL=['jlpt','tg2','jawa','sunda','bali','kana','rambu'];
var PANES=['bushu','jlpt','tg2','jawa','sunda','bali','kana','rambu','podcast','game','berita'];
var URL_OF={jlpt:P+'level-materi-jlpt.html',rambu:P+'rambu-jepang.html',podcast:P+'podcast.html',bushu:P+'materi-dan-kuis-kanji-metode-bushu.html',game:P+'permainan.html',
 jawa:P+'jawa.html','jawa-l5':P+'jawa-level5.html','jawa-l4':P+'jawa-level4.html','jawa-l3':P+'jawa-level3.html','jawa-l2':P+'jawa-level2.html','jawa-l1':P+'jawa-level1.html',
 sunda:P+'sunda.html','sunda-l5':P+'sunda-level5.html','sunda-l4':P+'sunda-level4.html','sunda-l3':P+'sunda-level3.html','sunda-l2':P+'sunda-level2.html','sunda-l1':P+'sunda-level1.html',
 bali:P+'bali.html','bali-l5':P+'bali-level5.html','bali-l4':P+'bali-level4.html','bali-l3':P+'bali-level3.html','bali-l2':P+'bali-level2.html','bali-l1':P+'bali-level1.html',
 'jlpt-n5':P+'materi-jlpt-n5.html','jlpt-n4':P+'materi-jlpt-n4.html','jlpt-n3':P+'materi-jlpt-n3.html','jlpt-n2':P+'materi-jlpt-n2.html','jlpt-n1':P+'materi-jlpt-n1.html',
 'tg2-semua':P+'materi-dan-soal-tg2-jlpt.html','tg2-kontruksi':P+'kontruksi.html','tg2-makanan':P+'pelayanan-dan-pabrik-makanan.html','tg2-manufaktur':P+'manufaktur.html',
 'tg2-pertanian':P+'pertanian.html','tg2-perhotelan':P+'perhotelan.html','tg2-perikanan':P+'perikanan.html','tg2-mobil':P+'jidosha-seibi.html','tg2-cleaning':P+'building-cleaning.html','tg2-karir':P+'bisnis-karir.html'};
var PATH_TO_ROUTE={};Object.keys(URL_OF).forEach(function(k){PATH_TO_ROUTE[URL_OF[k]]=k});
var GAME_BASE='https://bshantoz.github.io/nihongo/game/';
var GAMES=[
    {id: 'tts', f: 'tts.html', t: 'Teka-Teki Silang', j: '\u30af\u30ed\u30b9\u30ef\u30fc\u30c9', r: 'kurosuwado', d: 'Isi kotak kana dari petunjuk, level N5 sampai N1.',
     ic: '<rect x="3" y="3" width="18" height="18" rx="2"/><path d="M9 3V21M15 3V21M3 9H21M3 15H21"/>'},
    {id: 'trivia', f: 'trivia.html', t: 'Trivia Budaya', j: '\u65e5\u672c\u6587\u5316\u30af\u30a4\u30ba', r: 'nihon bunka kuizu', d: 'Festival, makanan, tradisi, dan sejarah Jepang.',
     ic: '<circle cx="12" cy="12" r="9.5"/><path d="M9.6 9.4C9.6 8.1 10.7 7.3 12 7.3C13.3 7.3 14.4 8.2 14.4 9.4C14.4 11.2 12 11.3 12 13.2"/><path d="M12 16.6H12.01"/>'},
    {id: 'kanji', f: 'pasangan-kanji.html', t: 'Pasangan Kanji', j: '\u6f22\u5b57\u30da\u30a2', r: 'kanji pea', d: 'Balik kartu, cocokkan kanji dengan bacaan atau arti.',
     ic: '<path d="M4 8.5C4 6.6 5.1 6 7 6H17C18.9 6 20 6.6 20 8.5V16.5C20 18.4 18.9 19 17 19H7C5.1 19 4 18.4 4 16.5Z"/><path d="M8 3H16"/><path d="M9 12.5H15"/>'},
    {id: 'gambar', f: 'tebak-gambar.html', t: 'Tebak Gambar', j: '\u7d75\u5f53\u3066\u30af\u30a4\u30ba', r: 'e ate kuizu', d: 'Tebak nama benda dalam bahasa Jepang.',
     ic: '<rect x="3" y="4" width="18" height="16" rx="2"/><circle cx="9" cy="10" r="1.8"/><path d="M3 17L9 12L13 15.5L16 13L21 17.5"/>'},
    {id: 'drama', f: 'drama.html', t: 'Mini Drama', j: '\u30c9\u30e9\u30de', r: 'dorama', d: 'Mochi di konbini dan tempat lain: simak dialog berfurigana, lalu kuis.',
     ic: '<path d="M4 5H20V13C20 17.4 16.4 21 12 21C7.6 21 4 17.4 4 13Z"/><path d="M8.5 10H8.51M15.5 10H15.51"/><path d="M9 14.5C10.2 16 13.8 16 15 14.5"/>'},
    {id: 'hari', f: 'hari.html', t: 'Satu Hari Mochi', j: '\u30e2\u30c1\u306e\u4e00\u65e5', r: 'mochi no ichinichi', d: 'Cerita panjang sekitar 10 menit dengan latar yang berganti: sehari berkeliling kota, atau Mochi demam dan pergi ke klinik.',
     ic: '<circle cx="12" cy="12" r="4"/><path d="M12 2.5V5M12 19V21.5M2.5 12H5M19 12H21.5M5.3 5.3L7 7M17 17L18.7 18.7M5.3 18.7L7 17M17 7L18.7 5.3"/>'},
    {id: 'kana', f: 'kana.html', t: 'Hapalan Kana', j: '\u304b\u306a', r: 'kana', d: 'Tabel, kartu hapalan, dan kuis Hiragana serta Katakana: huruf dasar, dakuten, dan yoon. Progres hafal tersinkron dengan widget di aplikasi.',
     ic: '<rect x="4" y="4" width="7" height="7" rx="1.5"/><rect x="13" y="4" width="7" height="7" rx="1.5"/><rect x="4" y="13" width="7" height="7" rx="1.5"/><rect x="13" y="13" width="7" height="7" rx="1.5"/>'}
  ];
var SEGS=[['jlpt','JLPT'],['tg2','TG2'],['jawa','Jawa'],['sunda','Sunda'],['bali','Bali'],['kana','Kana'],['rambu','Rambu']];
var panes={};
PANES.forEach(function(id){
  var p=root.querySelector('.qhPane[data-pane="'+id+'"]');
  if(!p){p=document.createElement('div');p.className='qhPane';p.setAttribute('data-pane',id);p.hidden=true;
    var seg=BEL.indexOf(id)>=0?'<div class="qhSeg" role="group" aria-label="Pilih materi">'+SEGS.map(function(s){return'<button type="button" data-go="'+s[0]+'" aria-pressed="false">'+s[1]+'</button>'}).join('')+'</div>':'';
    p.innerHTML=seg+'<div class="qhBody pE postBody"></div>';root.appendChild(p)}
  panes[id]=p;
});
function parse(){
  var h=(location.hash||'').replace(/^#/,''),qs='',i=h.indexOf('?');if(i>=0){qs=h.slice(i+1);h=h.slice(0,i)}
  var parts=h.split('-'),tab=parts[0],sub=parts.slice(1).join('-');
  if(tab==='belajar'){var qb=lsGet('qh_bel');tab=BEL.indexOf(qb)>=0?qb:'jlpt';sub=tab==='tg2'?'semua':''}
  if(!panes[tab]){tab='bushu';sub=''}
  if(tab==='game'&&!GAMES.some(function(g){return g.id===sub}))sub='';
  ['jlpt','tg2','jawa','sunda','bali'].forEach(function(k){if(tab===k&&!URL_OF[k+'-'+sub])sub=k==='tg2'?'semua':''});
  return{tab:tab,sub:sub,qs:qs};
}
function go(r){if(location.hash==='#'+r)show();else location.hash=r}
var cache={},mounted={},token={};
function runScripts(host,list){
  var c=Promise.resolve();
  list.forEach(function(old){c=c.then(function(){return new Promise(function(res){
    var s=document.createElement('script');for(var i=0;i<old.attributes.length;i++)s.setAttribute(old.attributes[i].name,old.attributes[i].value);
    if(old.src){s.async=false;s.onload=s.onerror=function(){res()};s.src=old.src;host.appendChild(s)}else{s.textContent=old.textContent;host.appendChild(s);res()}})})});
  return c;
}
function fetchHtml(u){if(cache[u])return Promise.resolve(cache[u]);return fetch(u).then(function(r){if(!r.ok)throw new Error('HTTP '+r.status);return r.text()}).then(function(t){cache[u]=t;return t})}
function mount(paneId,key){
  var host=panes[paneId].querySelector('.qhBody');if(mounted[paneId]===key)return;
  var my=(token[paneId]=(token[paneId]||0)+1);mounted[paneId]=key;
  host.innerHTML='<p class="qhLoad">Memuat materi...</p>';
  return fetchHtml(URL_OF[key]).then(function(html){
    if(my!==token[paneId])return;
    var d=new DOMParser().parseFromString(html,'text/html'),pb=d.querySelector('.postBody');
    if(!pb)throw new Error('isi halaman tidak ditemukan');
    host.innerHTML='';var scripts=[];
    Array.prototype.slice.call(pb.childNodes).forEach(function(n){
      if(n.nodeType===1&&n.tagName==='SCRIPT'){scripts.push(n);return}
      var c=document.importNode(n,true);host.appendChild(c);
      if(c.nodeType===1)Array.prototype.slice.call(c.querySelectorAll('script')).forEach(function(sc){scripts.push(sc);sc.parentNode.removeChild(sc)});
    });
    return runScripts(host,scripts);
  }).catch(function(err){
    if(my!==token[paneId])return;mounted[paneId]=null;
    host.innerHTML='<div class="qhErr"><p>Materi belum bisa dimuat ('+esc(err&&err.message)+').</p><button type="button" class="qhBtn" data-retry="'+key+'">Coba lagi</button> <a class="qhBtn alt" href="'+URL_OF[key]+'">Buka halaman</a></div>';
  });
}
/* game */
var gameFrame=null,gameTimer=0;
function isDark(){var t=nB.getAttribute('data-theme');return t==='dark'||(t!=='light'&&matchMedia('(prefers-color-scheme: dark)').matches)}
function tune(fr){try{var d=fr.contentDocument;if(!d||!d.documentElement)return;var w=isDark()?'dark':'light';if(d.documentElement.getAttribute('data-theme')!==w)d.documentElement.setAttribute('data-theme',w);
  var h=d.body?Math.ceil(d.body.getBoundingClientRect().height):0;if(!h)h=d.documentElement.scrollHeight;if(h>120&&Math.abs(fr.offsetHeight-h)>2)fr.style.height=h+'px'}catch(e){}}
function stopT(){if(gameTimer){clearInterval(gameTimer);gameTimer=0}}
function startT(){stopT();if(gameFrame)gameTimer=setInterval(function(){tune(gameFrame)},400)}
function frame(host,file,title,bar){
  host.innerHTML=(bar||'')+'<p class="qhLoad">Memuat...</p>';
  fetch(GAME_BASE+file).then(function(r){if(!r.ok)throw new Error('HTTP '+r.status);return r.text()}).then(function(html){
    host.innerHTML=bar||'';var fr=document.createElement('iframe');fr.className='qhGame';fr.title=title;fr.setAttribute('scrolling','no');
    fr.addEventListener('load',function(){tune(fr)});fr.srcdoc=html;host.appendChild(fr);gameFrame=fr;startT();
  }).catch(function(err){host.innerHTML=(bar||'')+'<div class="qhErr"><p>Belum bisa dimuat ('+esc(err&&err.message)+').</p><a class="qhBtn alt" target="_blank" rel="noopener" href="'+GAME_BASE+file+'">Buka di tab baru</a></div>'});
}
var gkey='';
function showGame(sub){
  var host=panes.game.querySelector('.qhBody'),g=GAMES.filter(function(x){return x.id===sub})[0];
  if(!g){stopT();gkey='';gameFrame=null;host.innerHTML='<div class="qhGameGrid">'+GAMES.map(function(g){return'<button type="button" class="qhGameCard" data-go="game-'+g.id+'"><svg viewBox="0 0 24 24" aria-hidden="true">'+g.ic+'</svg><b>'+esc(g.t)+'</b><i>'+g.j+' &middot; '+esc(g.r)+'</i><small>'+esc(g.d)+'</small></button>'}).join('')+'</div>';return}
  if(gkey===g.id&&gameFrame&&host.contains(gameFrame)){startT();return}
  gkey=g.id;gameFrame=null;frame(host,g.f,g.t,'<div class="qhBar"><button type="button" class="qhBtn alt" data-go="game">&larr; Semua game</button></div>');
}
function showKana(){var host=panes.kana.querySelector('.qhBody');if(gkey==='kana'&&gameFrame&&host.contains(gameFrame)){startT();return}gkey='kana';gameFrame=null;frame(host,'kana.html','Hapalan Kana','')}
/* berita */
var posts=null,lab='',shown=20,qs0=root.querySelector('#qList');
function renderList(){
  if(!posts)return;
  var rows=posts.filter(function(d){return d.ty==='POST'&&(!lab||d.l.indexOf(lab)>=0)});
  qs0.innerHTML=rows.slice(0,shown).map(function(d){var th=d.th?'<img src="'+esc(d.th)+'" alt="" loading="lazy">':'<span class="qNoImg"></span>';
    return'<article class="qCard"><a class="qThumb" href="'+d.p+'">'+th+'</a><div><h3><a href="'+d.p+'">'+esc(d.t)+'</a></h3><p>'+esc(d.d)+'</p><small>'+esc(d.dt)+(d.l[0]?' &middot; '+esc(d.l[0]):'')+'</small></div></article>'}).join('');
  var m=document.getElementById('qMore');m.hidden=rows.length<=shown;
}
function loadPosts(cb){if(posts)return cb();fetch('/search.json').then(function(r){return r.json()}).then(function(j){posts=j;cb()}).catch(function(){})}
root.addEventListener('click',function(e){
  var c=e.target.closest&&e.target.closest('.qChip');
  if(c){lab=c.getAttribute('data-lab');shown=20;root.querySelectorAll('.qChip').forEach(function(x){x.classList.toggle('on',x===c)});loadPosts(renderList);return}
  if(e.target.id==='qMore'){shown+=20;loadPosts(renderList);return}
  var g=e.target.closest&&e.target.closest('[data-go]');if(g){e.preventDefault();go(g.getAttribute('data-go'));window.scrollTo(0,0);return}
  var r=e.target.closest&&e.target.closest('[data-retry]');if(r){mounted[PANES.filter(function(p){return panes[p].contains(r)})[0]]=null;show();}
});
var first=true;
function show(){
  var r=parse();
  PANES.forEach(function(id){panes[id].hidden=id!==r.tab});
  var act=BEL.indexOf(r.tab)>=0?'belajar':r.tab;
  document.querySelectorAll('.qTop a,.qBottom a').forEach(function(a){a.classList.toggle('on',a.getAttribute('data-tab')===act)});
  if(BEL.indexOf(r.tab)>=0){lsSet('qh_bel',r.tab);panes[r.tab].querySelectorAll('.qhSeg button').forEach(function(b){b.setAttribute('aria-pressed',b.getAttribute('data-go').split('-')[0]===r.tab?'true':'false')})}
  if(r.tab!=='game'&&r.tab!=='kana')stopT();
  var T={bushu:'Bushu',jlpt:'Materi JLPT',tg2:'Materi TG2',jawa:'Bahasa Jawa',sunda:'Bahasa Sunda',bali:'Bahasa Bali',kana:'Hapalan Kana',rambu:'Rambu-rambu Jepang',podcast:'Podcast',game:'Game',berita:'Berita'};
  document.title=(T[r.tab]||'')+' | Qategori';
  if(r.tab==='game')showGame(r.sub);
  else if(r.tab==='kana')showKana();
  else if(r.tab==='berita'){loadPosts(renderList)}
  else mount(r.tab,r.sub?r.tab+'-'+r.sub:r.tab);
  first=false;
}
/* navigasi atas/bawah */
document.addEventListener('click',function(e){
  var a=e.target.closest&&e.target.closest('.qTop a,.qBottom a,.qLogo');
  if(a&&!e.defaultPrevented&&!e.button&&!e.metaKey&&!e.ctrlKey){e.preventDefault();go(a.classList.contains('qLogo')?'bushu':a.getAttribute('data-tab'));window.scrollTo(0,0);return}
  var l=e.target.closest&&e.target.closest('#qHome a[href]');if(!l||e.defaultPrevented||e.button||e.metaKey||e.ctrlKey||l.target==='_blank')return;
  var u;try{u=new URL(l.getAttribute('href'),location.href)}catch(x){return}
  if(u.origin!==location.origin)return;
  var rt=PATH_TO_ROUTE[u.pathname];
  if(rt){e.preventDefault();go(rt+(u.search?'?'+u.search.slice(1):''));window.scrollTo(0,0)}
});
window.addEventListener('hashchange',show);

show();
})();
