(function(){
'use strict';
function lsGet(k){try{return localStorage.getItem(k)}catch(e){return null}}
function lsSet(k,v){try{localStorage.setItem(k,v)}catch(e){}}
function esc(s){return String(s==null?'':s).replace(/[&<>"']/g,function(c){return{'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]})}
var nB=document.querySelector('.nB');
/* ---- mode gelap ---- */
function applyTheme(){var m=lsGet('q_theme');nB.setAttribute('data-theme',m==='dark'||m==='light'?m:'default')}
applyTheme();
function chk(id,v){var c=document.getElementById(id);if(c)c.checked=v}
function closeAll(){['forJepang','forNav'].forEach(function(i){chk(i,false)})}
window.addEventListener('pageshow',closeAll);
document.addEventListener('click',function(e){
  var m=e.target.closest&&e.target.closest('[data-menu]');if(m){e.preventDefault();chk('forNav',!document.getElementById('forNav').checked);return}
  var b=e.target.closest&&e.target.closest('a[data-tab]');
  if(b&&b.getAttribute('data-tab')==='belajar'&&document.getElementById('forJepang')){e.preventDefault();e.stopPropagation();chk('forJepang',true);return}
},true);
document.querySelectorAll('.qDarkM').forEach(function(db){db.addEventListener('click',function(ev){ev.preventDefault();
  var cur=nB.getAttribute('data-theme'),dark=cur==='dark'||(cur==='default'&&matchMedia('(prefers-color-scheme: dark)').matches);
  lsSet('q_theme',dark?'light':'dark');applyTheme();document.documentElement.setAttribute('data-q',dark?'light':'dark');
  window.dispatchEvent(new Event('qtheme'));
})});
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
      out.map(function(x){var d=x[1];return'<article class="qCard"><div><h3><a href="'+d.p+'">'+esc(d.t)+'</a></h3><p>'+esc(d.d)+'</p><small>'+esc(d.dt)+'</small></div>'+(window.qBmBtn?window.qBmBtn(d.p,d.t,d.th):'')+'</article>'}).join('');
  }).catch(function(){res.innerHTML='<p>Pencarian belum bisa dimuat.</p>'});
}
/* ---- beranda bertab ---- */
var root=document.getElementById('qHome');
var P='/p/';
var isHome=!!root;
var DATA_BASE='https://bshantoz.github.io/nihongo/';
function loadScript(src){return new Promise(function(res){var x=document.createElement('script');x.src=src;x.onload=x.onerror=function(){res()};document.head.appendChild(x)})}
var BEL=['jlpt','tg2','jawa','sunda','bali','kana','rambu'];
var PANES=['beranda','bushu','jlpt','tg2','jawa','sunda','bali','kana','rambu','podcast','game','berita','terjemah'];
var URL_OF={jlpt:P+'level-materi-jlpt.html',rambu:P+'rambu-jepang.html',podcast:P+'podcast.html',bushu:P+'materi-dan-kuis-kanji-metode-bushu.html',game:P+'permainan.html',
 jawa:P+'jawa.html','jawa-l5':P+'jawa-level5.html','jawa-l4':P+'jawa-level4.html','jawa-l3':P+'jawa-level3.html','jawa-l2':P+'jawa-level2.html','jawa-l1':P+'jawa-level1.html',
 sunda:P+'sunda.html','sunda-l5':P+'sunda-level5.html','sunda-l4':P+'sunda-level4.html','sunda-l3':P+'sunda-level3.html','sunda-l2':P+'sunda-level2.html','sunda-l1':P+'sunda-level1.html',
 bali:P+'bali.html','bali-l5':P+'bali-level5.html','bali-l4':P+'bali-level4.html','bali-l3':P+'bali-level3.html','bali-l2':P+'bali-level2.html','bali-l1':P+'bali-level1.html',
 'jlpt-n5':P+'materi-jlpt-n5.html','jlpt-n4':P+'materi-jlpt-n4.html','jlpt-n3':P+'materi-jlpt-n3.html','jlpt-n2':P+'materi-jlpt-n2.html','jlpt-n1':P+'materi-jlpt-n1.html',
 'tg2-semua':P+'materi-dan-soal-tg2-jlpt.html','tg2-kontruksi':P+'kontruksi.html','tg2-makanan':P+'pelayanan-dan-pabrik-makanan.html','tg2-manufaktur':P+'manufaktur.html',
 'tg2-pertanian':P+'pertanian.html','tg2-perhotelan':P+'perhotelan.html','tg2-perikanan':P+'perikanan.html','tg2-mobil':P+'jidosha-seibi.html','tg2-cleaning':P+'building-cleaning.html','tg2-karir':P+'bisnis-karir.html'};
var PATH_TO_ROUTE={};Object.keys(URL_OF).forEach(function(k){PATH_TO_ROUTE[URL_OF[k]]=k});
var ART_RE=/^\/(\d{4}\/\d{2}|p)\/[^\/]+\.html$/;
function sameSite(u){return u.hostname.replace(/^www\./,'')===location.hostname.replace(/^www\./,'')}
/* semua tautan internal -> rute # di beranda (agar aman di browser bawaan TikTok) */
function routeFor(u){var p=u.pathname;
  if(PATH_TO_ROUTE[p])return PATH_TO_ROUTE[p]+(u.search?'?'+u.search.slice(1):'');
  if(/^\/search\/label\//.test(p))return 'berita?l='+encodeURIComponent(p);
  if(/^\/search\/?$/.test(p)){var sq=u.searchParams.get('q');return sq?'berita?l='+encodeURIComponent('/search?q='+sq):'berita'}
  if(ART_RE.test(p))return 'berita?u='+encodeURIComponent(p);
  if(p==='/'||p==='/index.html')return u.hash&&u.hash.length>1?u.hash.slice(1):'';
  return''}
function searchTo(q){var r='berita?l='+encodeURIComponent('/search?q='+q);closeAll();chk('forSearch',false);document.body.classList.remove('qSrh');if(isHome){go(r);window.scrollTo(0,0)}else location.href='/#'+r}
document.addEventListener('submit',function(e){var f=e.target;if(!f||!f.matches||!f.matches('form.srh'))return;
  var i=f.querySelector('input[name="q"],input[type="search"]'),q=i?i.value.trim():'';if(!q)return;e.preventDefault();searchTo(q)},true);
document.addEventListener('click',function(e){
  var s=e.target.closest&&e.target.closest('.headB a.sc');
  if(s){e.preventDefault();var on=document.body.classList.toggle('qSrh');if(on){var h=document.querySelector('.headS .shI');if(h)setTimeout(function(){h.focus()},50)}return}
  if(e.defaultPrevented||e.button||e.metaKey||e.ctrlKey||e.shiftKey||e.altKey)return;
  var l=e.target.closest&&e.target.closest('a[href]');if(!l||l.target==='_blank'||l.hasAttribute('download'))return;
  if(l.hasAttribute('data-tab')||l.classList.contains('qLogo'))return;
  var u;try{u=new URL(l.getAttribute('href'),location.href)}catch(x){return}
  if(!sameSite(u))return;
  if(u.hash&&u.pathname===location.pathname&&u.search===location.search)return;
  var rt=routeFor(u);if(!rt&&isHome&&(u.pathname==='/'||u.pathname==='/index.html')&&!u.hash)rt='beranda';if(!rt)return;
  e.preventDefault();closeAll();document.body.classList.remove('qSrh');
  if(isHome){go(rt);window.scrollTo(0,0)}else location.href='/#'+rt;
},true);
if(!isHome)return;
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
    {id: 'labirin', f: 'labirin.html', t: 'Labirin Mochi', j: 'めいろ', r: 'meiro', d: 'Bantu Mochi sampai ke stasiun. Hindari serigala, api, dan jurang!',
     ic: '<rect x="3.5" y="3.5" width="17" height="17" rx="1.5"/><path d="M3.5 9.5H14V15H9"/>'},
    {id: 'shiritori', f: 'shiritori.html', t: 'Shiritori', j: 'しりとり', r: 'shiritori', d: 'Sambung kata Jepang melawan Mochi. Kata berakhiran ん kalah!',
     ic: '<path d="M9 15l6-6"/><path d="M10.5 5.5H18a3.5 3.5 0 0 1 0 7h-2.5M13.5 18.5H6a3.5 3.5 0 0 1 0-7H8.5"/>'},
    {id: 'balap', f: 'balap.html', t: 'Balap Romaji', j: 'カナレース', r: 'kana reesu', d: 'Ketik romaji dari kana yang muncul. 60 detik, secepatnya!',
     ic: '<circle cx="12" cy="13" r="7.5"/><path d="M12 9.5V13l3 2M9.5 2.8h5"/>'},
    {id: 'susun', f: 'susun.html', t: 'Susun Kalimat', j: '並べ替え', r: 'narabekae', d: 'Susun kata acak menjadi kalimat Jepang yang benar.',
     ic: '<path d="M4 7h12M13 4l3 3-3 3M20 17H8M11 14l-3 3 3 3"/>'},
    {id: 'bunyi', f: 'bunyi.html', t: 'Tebak Bunyi', j: '聞き取りクイズ', r: 'kikitori kuizu', d: 'Dengarkan kata yang diucapkan, lalu tebak katanya.',
     ic: '<path d="M4 10v4h3.5L12 18V6l-4.5 4H4z"/><path d="M15 9.5a3.5 3.5 0 0 1 0 5M17.5 7a7.5 7.5 0 0 1 0 10"/>'},
    {id: 'drama', f: 'drama.html', t: 'Mini Drama', j: '\u30c9\u30e9\u30de', r: 'dorama', d: 'Mochi di konbini dan tempat lain: simak dialog berfurigana, lalu kuis.',
     ic: '<path d="M4 5H20V13C20 17.4 16.4 21 12 21C7.6 21 4 17.4 4 13Z"/><path d="M8.5 10H8.51M15.5 10H15.51"/><path d="M9 14.5C10.2 16 13.8 16 15 14.5"/>'},
    {id: 'hari', f: 'hari.html', t: 'Satu Hari Mochi', j: '\u30e2\u30c1\u306e\u4e00\u65e5', r: 'mochi no ichinichi', d: 'Cerita panjang sekitar 10 menit dengan latar yang berganti: sehari berkeliling kota, atau Mochi demam dan pergi ke klinik.',
     ic: '<circle cx="12" cy="12" r="4"/><path d="M12 2.5V5M12 19V21.5M2.5 12H5M19 12H21.5M5.3 5.3L7 7M17 17L18.7 18.7M5.3 18.7L7 17M17 7L18.7 5.3"/>'},
    {id: 'kana', f: 'kana.html', t: 'Hapalan Kana', j: '\u304b\u306a', r: 'kana', d: 'Tabel, kartu hapalan, dan kuis Hiragana serta Katakana: huruf dasar, dakuten, dan yoon. Progres hafal tersinkron dengan widget di aplikasi.',
     ic: '<rect x="4" y="4" width="7" height="7" rx="1.5"/><rect x="13" y="4" width="7" height="7" rx="1.5"/><rect x="4" y="13" width="7" height="7" rx="1.5"/><rect x="13" y="13" width="7" height="7" rx="1.5"/>'}
  ];;
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
  if(!h)tab='beranda';
  if(!panes[tab]){tab='beranda';sub=''}
  if(tab==='game'&&!GAMES.some(function(g){return g.id===sub}))sub='';
  if(tab==='kana'&&sub!=='hiragana'&&sub!=='katakana')sub='hiragana';
  ['jlpt','tg2','jawa','sunda','bali'].forEach(function(k){if(tab===k&&!URL_OF[k+'-'+sub])sub=k==='tg2'?'semua':''});
  return{tab:tab,sub:sub,qs:qs};
}
function go(r){if(location.hash==='#'+r)show();else location.hash=r}
  var SI = {
    kartu: '<path d="M4 8.5C4 6.6 5.1 6 7 6H17C18.9 6 20 6.6 20 8.5V16.5C20 18.4 18.9 19 17 19H7C5.1 19 4 18.4 4 16.5Z"/><path d="M8 3H16"/><path d="M9 12.5H15"/>',
    daftar: '<path d="M8 6H21M8 12H21M8 18H21"/><path d="M3 6H3.01M3 12H3.01M3 18H3.01"/>',
    bacaan: '<path d="M6 3H15L19 7V20C19 20.6 18.6 21 18 21H6C5.4 21 5 20.6 5 20V4C5 3.4 5.4 3 6 3Z"/><path d="M14.5 3V7.5H19"/><path d="M8.5 12H15.5M8.5 15.5H15.5"/>',
    obrolan: '<path d="M4 5.5C4 4.7 4.7 4 5.5 4H15.5C16.3 4 17 4.7 17 5.5V11.5C17 12.3 16.3 13 15.5 13H9L5.5 16V13C4.7 13 4 12.3 4 11.5Z"/><path d="M20 9V16.5C20 17.3 19.3 18 18.5 18H18V20.5L15 18H10"/>',
    buku: '<path d="M22 16.74V4.67C22 3.47 21.02 2.58 19.83 2.68H19.77C17.67 2.86 14.48 3.93 12.7 5.05L12.53 5.16C12.24 5.34 11.76 5.34 11.47 5.16L11.22 5.01C9.44 3.9 6.26 2.84 4.16 2.67C2.97 2.57 2 3.47 2 4.66V16.74C2 17.7 2.78 18.6 3.74 18.72L4.03 18.76C6.2 19.05 9.55 20.15 11.47 21.2L11.51 21.22C11.78 21.37 12.21 21.37 12.47 21.22C14.39 20.16 17.75 19.05 19.93 18.76L20.26 18.72C21.22 18.6 22 17.7 22 16.74Z"/><path d="M12 5.49V20.49"/>',
    rambu: '<path d="M4 5.5H20L12 20Z"/><path d="M9 9H15"/>',
    kuis: '<circle cx="12" cy="12" r="9.5"/><path d="M9.6 9.4C9.6 8.1 10.7 7.3 12 7.3C13.3 7.3 14.4 8.2 14.4 9.4C14.4 11.2 12 11.3 12 13.2"/><path d="M12 16.6H12.01"/>',
    kelola: '<path d="M3 7H11M17 7H21M3 17H7M13 17H21"/><circle cx="14" cy="7" r="2.5"/><circle cx="10" cy="17" r="2.5"/>',
    audio: '<path d="M3 14V12C3 7 7 3 12 3C17 3 21 7 21 12V14"/><path d="M3 15.5C3 14.4 3.9 13.5 5 13.5H6C6.6 13.5 7 13.9 7 14.5V19C7 19.6 6.6 20 6 20H5C3.9 20 3 19.1 3 18Z"/><path d="M21 15.5C21 14.4 20.1 13.5 19 13.5H18C17.4 13.5 17 13.9 17 14.5V19C17 19.6 17.4 20 18 20H19C20.1 20 21 19.1 21 18Z"/>',
    sipil: '<path d="M3 21H21"/><path d="M5 21V10L12 4L19 10V21"/><path d="M10 21V15H14V21"/>',
    gedung: '<path d="M3 21H21"/><path d="M6 21V4H15V21"/><path d="M15 9H18V21"/><path d="M9 8H12M9 12H12M9 16H12"/>',
    petir: '<path d="M13 2L4 14H12L11 22L20 10H12Z"/>',
    titik: '<circle cx="12" cy="12" r="3"/>',
    makan: '<path d="M6 3V9C6 10.7 7.3 12 9 12C10.7 12 12 10.7 12 9V3"/><path d="M9 3V21"/><path d="M18 21V3C15.8 4.5 15 7.5 15 11H18"/>',
    pabrik: '<path d="M3 21H21"/><path d="M4 21V10L10 14V10L16 14V6H20V21"/>',
    gir: '<circle cx="12" cy="12" r="3"/><path d="M12 2.5V5M12 19V21.5M2.5 12H5M19 12H21.5M5.3 5.3L7.1 7.1M16.9 16.9L18.7 18.7M18.7 5.3L16.9 7.1M7.1 16.9L5.3 18.7"/>',
    chip: '<rect x="7" y="7" width="10" height="10" rx="2"/><path d="M10 3V7M14 3V7M10 17V21M14 17V21M3 10H7M3 14H7M17 10H21M17 14H21"/>',
    tetes: '<path d="M12 3C12 3 5.5 10 5.5 14.5C5.5 18.1 8.4 21 12 21C15.6 21 18.5 18.1 18.5 14.5C18.5 10 12 3 12 3Z"/>',
    tunas: '<path d="M12 21V11"/><path d="M12 11C12 7 9 4.5 4.5 4.5C4.5 9 7 11 12 11Z"/><path d="M12 14C12 10.5 14.5 8 19.5 8C19.5 12.5 17 14.5 12 14Z"/>',
    kaki: '<circle cx="7" cy="10" r="1.8"/><circle cx="12" cy="7" r="1.8"/><circle cx="17" cy="10" r="1.8"/><path d="M8 17.5C8 14.8 10 13 12 13C14 13 16 14.8 16 17.5C16 19.4 14.5 20 12 20C9.5 20 8 19.4 8 17.5Z"/>',
    ikan: '<path d="M3 12C6 7.5 10.5 6 14.5 7.5C17 8.4 19 10 20.5 12C19 14 17 15.6 14.5 16.5C10.5 18 6 16.5 3 12Z"/><path d="M20.5 12L23 9.5M20.5 12L23 14.5"/><path d="M7.5 11.2H7.51"/><path d="M12 8V16"/>',
    kolam: '<path d="M3 9C5 7.3 7 7.3 9 9C11 10.7 13 10.7 15 9C17 7.3 19 7.3 21 9"/><path d="M3 14C5 12.3 7 12.3 9 14C11 15.7 13 15.7 15 14C17 12.3 19 12.3 21 14"/><path d="M8 18.5C9.5 17 12 17 13.5 18.5C12 20 9.5 20 8 18.5Z"/><path d="M13.5 18.5L15.5 17.2V19.8Z"/>',
    kalender: '<rect x="4" y="5" width="16" height="15" rx="2"/><path d="M4 10H20M8 3V7M16 3V7"/>',
    main: '<circle cx="12" cy="12" r="9.5"/><path d="M10 8.5L15.5 12L10 15.5Z"/>',
    ujian: '<rect x="5" y="4" width="14" height="17" rx="2"/><path d="M9 3H15V6H9Z"/><path d="M8.5 13L10.5 15L15.5 10"/>'
  };
  /* Sub-tab bidang TG2: ikon + nama pendek (kunci = data-bidang) */
  var BIDANG = {
    doboku: ['sipil', 'Doboku'], kenchiku: ['gedung', 'Kenchiku'], infra: ['petir', 'Infrastruktur'],
    restoran: ['makan', 'Layanan Makan'], pabrik: ['pabrik', 'Pabrik Makan'],
    kikai: ['gir', 'Mesin & Logam'], denki: ['chip', 'Elektronik'], hyoumen: ['tetes', 'Permukaan'],
    koushu: ['tunas', 'Budidaya'], chikusan: ['kaki', 'Peternakan'],
    planning: ['kalender', 'Planning'], operations: ['main', 'Operations']
  };
  function subIcon(txt){
    var t = txt.toLowerCase();
    if (/hafalan|kartu/.test(t)) return 'kartu';
    if (/daftar|kosakata/.test(t)) return 'daftar';
    if (/bacaan|asal/.test(t)) return 'bacaan';
    if (/percakapan/.test(t)) return 'obrolan';
    if (/kuis/.test(t)) return 'kuis';
    if (/kelola/.test(t)) return 'kelola';
    if (/simak|choukai/.test(t)) return 'audio';
    if (/gramatika|asal|bunpou|materi/.test(t)) return 'buku';
    if (/ujian/.test(t)) return 'ujian';
    if (/ciri|simbol/.test(t)) return 'rambu';
    if (/tangkap|gyogyou|\u6f01\u696d/.test(t)) return 'ikan';
    if (/budidaya perikanan|youshoku|\u990a\u6b96/.test(t)) return 'kolam';
    if (/doboku/.test(t)) return 'sipil';
    if (/kenchiku/.test(t)) return 'gedung';
    if (/infra/.test(t)) return 'petir';
    return 'titik';
  }
  var SUBSEL = '#kbq-tabs, [class^="n"][class$="-tabs"][role="tablist"], .bidang-tabs';
  function decorate(){
    Array.prototype.slice.call(root.querySelectorAll(SUBSEL)).forEach(function(row){
      row.classList.add('qhRow');
      Array.prototype.slice.call(row.children).forEach(function(b){
        if (b.tagName !== 'BUTTON' || b.getAttribute('data-qhd')) return;
        b.setAttribute('data-qhd', '1');
        var raw = (b.textContent || '').trim(), lab = raw, ic = null;
        var bd = BIDANG[b.getAttribute('data-bidang')];
        if (bd) { ic = bd[0]; lab = bd[1]; }
        else if (b.classList.contains('bidang-tab')) lab = raw.replace(/\([^)]*\)/g, '').replace(/[^\x00-\x7F]+/g, ' ').replace(/\s+/g, ' ').trim() || raw;
        b.setAttribute('title', raw);
        b.innerHTML = '<svg class="line" viewBox="0 0 24 24" aria-hidden="true">' + SI[ic || subIcon(raw)] + '</svg><span>' + esc(lab) + '</span>';
      });
    });
  }
  var decRaf = 0;
  new MutationObserver(function(){ if (decRaf) return; decRaf = requestAnimationFrame(function(){ decRaf = 0; decorate(); }); })
    .observe(root, {childList: true, subtree: true});
var cache={},mounted={},token={};
function runScripts(host,list){
  var c=Promise.resolve();
  list.forEach(function(old){c=c.then(function(){return new Promise(function(res){
    var s=document.createElement('script');for(var i=0;i<old.attributes.length;i++)s.setAttribute(old.attributes[i].name,old.attributes[i].value);
    if(old.src){s.async=false;s.onload=s.onerror=function(){res()};s.src=old.src;host.appendChild(s)}else{s.textContent=old.textContent;host.appendChild(s);res()}})})});
  return c;
}
function fetchHtml(u){if(cache[u])return Promise.resolve(cache[u]);var go=function(){return fetch(u,{cache:'no-cache'}).then(function(r){if(!r.ok)throw new Error('HTTP '+r.status);return r.text()})};return go().catch(function(){return new Promise(function(r){setTimeout(r,700)}).then(go)}).then(function(t){cache[u]=t;return t})}
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
    return runScripts(host,scripts).then(function(){var f=panes[paneId].__after;if(f){panes[paneId].__after=null;setTimeout(f,60)}});
  }).catch(function(err){
    if(my!==token[paneId])return;mounted[paneId]=null;
    host.innerHTML='<div class="qhErr"><p>Materi belum bisa dimuat ('+esc(err&&err.message)+').</p><p style="font-size:.75rem;opacity:.7;word-break:break-all">'+esc(location.origin+(URL_OF[key]||''))+' · '+(navigator.onLine?'online':'offline')+'</p><button type="button" class="qhBtn" data-retry="'+key+'">Coba lagi</button> <a class="qhBtn alt" href="'+URL_OF[key]+'">Buka halaman</a></div>';
  });
}
/* game */
var gameFrame=null,gameTimer=0;
function isDark(){var t=nB.getAttribute('data-theme');return t==='dark'||(t!=='light'&&matchMedia('(prefers-color-scheme: dark)').matches)}
function tune(fr){try{var d=fr.contentDocument;if(!d||!d.documentElement)return;if(fr.__kana)kanaTheme(fr);if(fr.__gx)gxSync(fr);var w=isDark()?'dark':'light';if(d.documentElement.getAttribute('data-theme')!==w)d.documentElement.setAttribute('data-theme',w);
  if(!fr.__full){var h=d.body?Math.ceil(d.body.getBoundingClientRect().height):0;if(!h)h=d.documentElement.scrollHeight;if(h>120&&Math.abs(fr.offsetHeight-h)>2)fr.style.height=h+'px'}}catch(e){}}
function stopT(){if(gameTimer){clearInterval(gameTimer);gameTimer=0}}
function startT(){stopT();if(gameFrame)gameTimer=setInterval(function(){tune(gameFrame)},400)}
function frame(host,file,title,bar,onload){
  host.innerHTML=(bar||'')+'<p class="qhLoad">Memuat...</p>';
  fetch(GAME_BASE+file).then(function(r){if(!r.ok)throw new Error('HTTP '+r.status);return r.text()}).then(function(html){
    host.innerHTML=bar||'';var fr=document.createElement('iframe');fr.className='qhGame';fr.title=title;fr.setAttribute('scrolling','no');
    fr.addEventListener('load',function(){tune(fr);if(onload)onload(fr)});fr.srcdoc=html;host.appendChild(fr);gameFrame=fr;startT();
  }).catch(function(err){host.innerHTML=(bar||'')+'<div class="qhErr"><p>Belum bisa dimuat ('+esc(err&&err.message)+').</p><a class="qhBtn alt" target="_blank" rel="noopener" href="'+GAME_BASE+file+'">Buka di tab baru</a></div>'});
}
/* player layar penuh ala Poki: laman dikunci, usap jadi milik game, ada tombol kembali */
var playEl=null,playHost=null,playTitle=null,playId='';
function playBuild(){
  playEl=document.createElement('div');playEl.className='qhPlay';playEl.id='qhPlay';playEl.hidden=true;
  playEl.innerHTML='<div class="qhPlayBar"><button type="button" class="qhPlayBack" aria-label="Kembali ke daftar game">&larr; Kembali</button><b class="qhPlayT"></b><button type="button" class="qhPlayFs" aria-label="Layar penuh">&#9974;</button></div><div class="qhPlayHost"></div>';
  document.body.appendChild(playEl);
  playHost=playEl.querySelector('.qhPlayHost');playTitle=playEl.querySelector('.qhPlayT');
  playEl.querySelector('.qhPlayBack').addEventListener('click',function(){go('game')});
  var fsb=playEl.querySelector('.qhPlayFs');
  if(!playEl.requestFullscreen&&!playEl.webkitRequestFullscreen)fsb.style.display='none';
  fsb.addEventListener('click',function(){try{
    if(document.fullscreenElement){document.exitFullscreen()}
    else if(playEl.requestFullscreen){playEl.requestFullscreen()}
    else if(playEl.webkitRequestFullscreen){playEl.webkitRequestFullscreen()}
  }catch(e){}});
  playEl.addEventListener('touchmove',function(e){e.preventDefault()},{passive:false});
}
function openPlay(g){
  if(!playEl)playBuild();
  playEl.hidden=false;playEl.classList.add('open');
  document.documentElement.classList.add('qLock');
  playTitle.textContent=g.t;
  if(playId===g.id&&gameFrame&&playHost.contains(gameFrame)){startT();return}
  playId=g.id;gameFrame=null;
  frame(playHost,g.f,g.t,'',function(fr){fr.__full=1;fr.setAttribute('scrolling','auto');gameInit(fr,g.id)});
}
function closePlay(){
  if(!playEl||playEl.hidden)return;
  playEl.hidden=true;playEl.classList.remove('open');
  document.documentElement.classList.remove('qLock');
  if(document.fullscreenElement){try{document.exitFullscreen()}catch(e){}}
}
var gkey='';
function showGame(sub){
  var host=panes.game.querySelector('.qhBody'),g=GAMES.filter(function(x){return x.id===sub})[0];
  if(!g){closePlay();stopT();gkey='';gameFrame=null;host.innerHTML='<div class="qhGameGrid">'+GAMES.filter(function(x){return x.id!=='kana'}).map(function(g){return'<button type="button" class="qhGameCard" data-go="game-'+g.id+'"><svg viewBox="0 0 24 24" aria-hidden="true">'+g.ic+'</svg><b>'+esc(g.t)+'</b><i>'+g.j+' &middot; '+esc(g.r)+'</i><small>'+esc(g.d)+'</small></button>'}).join('')+'</div>';return}
  gkey=g.id;openPlay(g);
}
/* ===== Terjemah Video (putar YouTube + subtitle JP/ID sinkron) ===== */
var QTW='https://qategori-terjemah.bshantoz.workers.dev';
var qtBuilt=false,qtPlayer=null,qtReady=false,qtCues=[],qtVid='',qtTimer=0,qtActive=-1,qtLastTouch=0,qtMode='both',qtWordOn=true,qtBank=null,qtBankBusy=false;
function qtEl(id){return document.getElementById(id)}
function qtMsg(t,cls){var m=qtEl('qtMsg');if(m){m.textContent=t||'';m.className='qtMsg'+(cls?' '+cls:'')}}
function qtFmt(t){t=Math.max(0,Math.floor(t||0));var m=Math.floor(t/60),s=t%60;return m+':'+(s<10?'0':'')+s}
function qtVideoId(u){if(!u)return'';u=(''+u).trim();var m=u.match(/(?:youtube\.com\/(?:watch\?[^#]*v=|shorts\/|embed\/|live\/|v\/)|youtu\.be\/)([A-Za-z0-9_-]{11})/);if(m)return m[1];if(/^[A-Za-z0-9_-]{11}$/.test(u))return u;return''}
function qtParseTime(s){var p=(''+s).replace(',','.').split(':');var n=p.length;var sec=parseFloat(p[n-1])||0;var min=parseInt(p[n-2]||'0',10)||0;var hr=n>=3?(parseInt(p[n-3]||'0',10)||0):0;return hr*3600+min*60+sec}
function qtParse(text){
  text=(''+(text||'')).replace(/\r/g,'').trim();if(!text)return[];
  var cues=[];
  if(text.indexOf('-->')>=0){
    text.split(/\n\s*\n/).forEach(function(block){
      var lines=block.split('\n').filter(function(x){return x.trim()});
      var ti=-1;lines.forEach(function(x,i){if(ti<0&&x.indexOf('-->')>=0)ti=i});
      if(ti<0)return;
      var body=lines.slice(ti+1).join(' ').replace(/<[^>]+>/g,'').replace(/&amp;/g,'&').trim();
      if(body)cues.push({t:qtParseTime(lines[ti].split('-->')[0].trim()),jp:body});
    });
  }else{
    var cur=null;
    text.split('\n').forEach(function(raw){
      var line=raw.trim();if(!line)return;
      var m=line.match(/^(\d{1,2}:\d{2}(?::\d{2})?)\s*(.*)$/);
      if(m){cur={t:qtParseTime(m[1]),jp:(m[2]||'').trim()};cues.push(cur)}
      else if(cur){cur.jp=(cur.jp+' '+line).trim()}
      else{cur={t:0,jp:line};cues.push(cur)}
    });
    cues=cues.filter(function(c){return c.jp});
  }
  cues.sort(function(a,b){return a.t-b.t});
  return cues;
}
function qtRender(){
  var box=qtEl('qtCaps');if(!box)return;
  box.className='qtCaps qt-'+qtMode;
  box.innerHTML=qtCues.map(function(c,i){return '<div class="qtCap" data-i="'+i+'"><span class="qtTime">'+qtFmt(c.t)+'</span><span class="qtTxt"><span class="qtJp">'+qtJpHtml(c.jp)+'</span>'+(c.id?'<span class="qtId">'+esc(c.id)+'</span>':'')+'</span></div>'}).join('');
  qtEl('qtCtl').hidden=!qtCues.length;
  var tr=qtEl('qtTr');tr.hidden=!qtCues.length||qtCues.every(function(c){return !!c.id});
  qtActive=-1;
}
/* ===== Ketuk kata -> arti (tango/kotoba) ===== */
function qtJpHtml(jp){
  if(!qtWordOn)return esc(jp);
  return qtSeg(jp).map(function(s){return s.w?'<span class="qtW" data-w="'+esc(s.s)+'">'+esc(s.s)+'</span>':esc(s.s)}).join('');
}
function qtSeg(text){
  text=''+(text||'');
  var out=[];
  if(typeof Intl!=='undefined'&&Intl.Segmenter){
    try{
      var sg=new Intl.Segmenter('ja',{granularity:'word'});
      var iter=sg.segment(text)[Symbol.iterator](),nx;
      while(!(nx=iter.next()).done)out.push({w:!!nx.value.isWordLike,s:nx.value.segment});
      return out;
    }catch(e){}
  }
  var parts=text.match(/[一-鿿]+|[ぁ-ゟ]+|[゠-ヿ]+|[^一-鿿ぁ-ゟ゠-ヿ]+/g)||[];
  parts.forEach(function(p){
    if(/^[ぁ-ゟ]+$/.test(p)&&p.length>1){
      var buf='';
      for(var i=0;i<p.length;i++){
        var ch=p.charAt(i);
        if('はがをにへとのもでやかねよわ'.indexOf(ch)>=0){if(buf){out.push({w:true,s:buf});buf=''}out.push({w:true,s:ch})}
        else buf+=ch;
      }
      if(buf)out.push({w:true,s:buf});
    }
    else if(/^[^一-鿿ぁ-ゟ゠-ヿ]+$/.test(p))out.push({w:false,s:p});
    else out.push({w:true,s:p});
  });
  return out;
}
var QT_GODAN={'き':'く','ぎ':'ぐ','し':'す','ち':'つ','に':'ぬ','び':'ぶ','み':'む','り':'る','い':'う'};
var QT_POT={'え':'う','け':'く','げ':'ぐ','せ':'す','て':'つ','ね':'ぬ','べ':'ぶ','め':'む','れ':'る'};
function qtCands(w){
  var seen={},out=[];
  function add(x){if(x&&x.length&&!seen[x]){seen[x]=1;out.push(x)}}
  add(w);
  var ENDS=['ませんでした','ません','ました','ましょう','なかった','なくて','ないで','なければ','すぎた','すぎる','すぎ','ている','ていた','ない','たい','たく','たかった','かった','くない','くて','て','で','た','だ','ます','く'];
  var stems=[w];
  ENDS.forEach(function(e){if(w.length>e.length&&w.slice(w.length-e.length)===e)stems.push(w.slice(0,w.length-e.length))});
  stems.forEach(function(st){
    add(st);add(st+'る');add(st+'する');add(st+'い');
    var last=st.charAt(st.length-1);
    if(QT_GODAN[last])add(st.slice(0,-1)+QT_GODAN[last]);
    if(QT_POT[last])add(st.slice(0,-1)+QT_POT[last]);
    if(last==='っ'){add(st.slice(0,-1)+'う');add(st.slice(0,-1)+'つ');add(st.slice(0,-1)+'る');if(st==='行っ')add('行く')}
    if(last==='ん'){add(st.slice(0,-1)+'む');add(st.slice(0,-1)+'ぶ');add(st.slice(0,-1)+'ぬ')}
    if(last==='い'){add(st.slice(0,-1)+'く');add(st.slice(0,-1)+'ぐ')}
    if(last==='て'||last==='で'){
      var st2=st.slice(0,-1),l2=st2.charAt(st2.length-1);
      add(st2);add(st2+'る');add(st2+'する');
      if(QT_GODAN[l2])add(st2.slice(0,-1)+QT_GODAN[l2]);
      if(QT_POT[l2])add(st2.slice(0,-1)+QT_POT[l2]);
    }
  });
  return out;
}
function qtEnsureBank(){
  if(qtBank||qtBankBusy)return;
  qtBankBusy=true;
  var lv=['n5','n4','n3','n2','n1'];
  Promise.all(lv.map(function(n){return window[n.toUpperCase()+'_KOTOBA']?Promise.resolve():loadScript(DATA_BASE+n+'/'+n+'-kotoba.js')})).then(function(){
    var map={};
    lv.forEach(function(n){
      (window[n.toUpperCase()+'_KOTOBA']||[]).forEach(function(e){
        if(!e||!(e.kanji||e.kana))return;
        var rec={jisho:e.kanji||e.kana,reading:e.kana||'',romaji:e.romaji||'',arti:e.arti||'',contoh:e.contohJp||'',contohId:e.contohId||'',src:'Bank kata JLPT '+n.toUpperCase()};
        if(e.kanji&&!map[e.kanji])map[e.kanji]=rec;
        if(e.kana&&!map[e.kana])map[e.kana]=rec;
      });
    });
    qtBank=map;qtBankBusy=false;
  });
}
function qtBankFind(w){
  if(!qtBank)return null;
  var cs=qtCands(w);
  for(var i=0;i<cs.length;i++){if(qtBank[cs[i]])return qtBank[cs[i]]}
  return null;
}
function qtPopShow(html){var p=qtEl('qtPop');if(!p)return;p.innerHTML=html;p.hidden=false}
function qtPopHide(){var p=qtEl('qtPop');if(p)p.hidden=true}
function qtSpeak(t){try{var u=new SpeechSynthesisUtterance(t);u.lang='ja-JP';u.rate=.9;window.speechSynthesis.cancel();window.speechSynthesis.speak(u)}catch(e){}}
function qtPopWire(word){
  var x=qtEl('qtPopX');if(x)x.addEventListener('click',qtPopHide);
  var s=qtEl('qtPopSay');if(s)s.addEventListener('click',function(){qtSpeak(word)});
}
function qtPopHtml(d,word){
  var h='<div class="qtPopTop"><div><div class="qtPopWord">'+esc(d.jisho||word)+'</div>'
    +((d.reading||d.romaji)?'<div class="qtPopRead">'+esc(d.reading||'')+(d.romaji?' ・ '+esc(d.romaji):'')+'</div>':'')
    +'</div><button type="button" class="qtPopSay" id="qtPopSay" aria-label="Dengarkan pelafalan">🔊</button><button type="button" class="qtPopX" id="qtPopX" aria-label="Tutup">✕</button></div>'
    +'<div class="qtPopArti">'+esc(d.arti||'')+'</div>'
    +(d.contoh?'<div class="qtPopEx">'+esc(d.contoh)+(d.contohId?'<i>'+esc(d.contohId)+'</i>':'')+'</div>':'')
    +((d.jisho&&d.jisho!==word)?'<div class="qtPopSrc">Kamu mengetuk: '+esc(word)+'</div>':'')
    +'<div class="qtPopSrc">'+esc(d.src||'')+'</div>';
  return h;
}
function qtWordOpen(word,sentence){
  if(!word)return;
  qtPopShow('<div class="qtPopTop"><div class="qtPopWord">'+esc(word)+'</div><button type="button" class="qtPopX" id="qtPopX" aria-label="Tutup">✕</button></div><div class="qtPopArti">Mencari arti…</div>');
  qtPopWire(word);
  var ck='qtWord:'+word,cached=null;
  try{cached=JSON.parse(lsGet(ck)||'null')}catch(e){}
  if(cached&&cached.arti){qtPopShow(qtPopHtml(cached,word));qtPopWire(word);return}
  var rec=qtBankFind(word);
  if(rec){try{lsSet(ck,JSON.stringify(rec))}catch(e){}qtPopShow(qtPopHtml(rec,word));qtPopWire(word);return}
  qtEnsureBank();
  fetch(QTW+'/word',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({word:word,sentence:sentence||''})})
    .then(function(r){return r.json()})
    .then(function(d){
      if(!d||!d.ok||!d.arti)throw new Error('x');
      d.src='Penjelasan AI';
      try{lsSet(ck,JSON.stringify(d))}catch(e){}
      qtPopShow(qtPopHtml(d,word));qtPopWire(word);
    })
    .catch(function(){
      qtPopShow('<div class="qtPopTop"><div class="qtPopWord">'+esc(word)+'</div><button type="button" class="qtPopX" id="qtPopX" aria-label="Tutup">✕</button></div><div class="qtPopArti">Arti belum ketemu. Periksa koneksi internet, lalu ketuk lagi kata ini.</div>');
      qtPopWire(word);
    });
}
function qtSetCues(cues,src){
  qtCues=cues||[];qtRender();
  if(!qtCues.length){qtMsg('Tidak ada subtitle yang terbaca. Coba tempel transkrip secara manual lewat kotak teks.','bad');return}
  qtMsg('Subtitle dimuat: '+qtCues.length+' baris ('+src+'). Menerjemahkan…');
  qtTranslate();
}
function qtCacheKey(){return 'qtCache:'+qtVid+':'+qtCues.length+':'+(qtCues[0]?qtCues[0].jp.slice(0,24):'')}
function qtTranslate(){
  if(!qtCues.length)return;
  var ck=qtCacheKey(),cached=null;
  try{cached=JSON.parse(lsGet(ck)||'null')}catch(e){}
  if(cached&&cached.length===qtCues.length){qtCues.forEach(function(c,i){c.id=cached[i]});qtRender();qtMsg('Terjemahan dimuat dari simpanan perangkat ini. Selamat belajar!');return}
  var idx=0,B=40,btn=qtEl('qtTr');btn.hidden=false;btn.disabled=true;
  function step(){
    if(idx>=qtCues.length){btn.disabled=false;qtRender();try{lsSet(ck,JSON.stringify(qtCues.map(function(c){return c.id||''})))}catch(e){}qtMsg('Selesai diterjemahkan. Ketuk baris subtitle untuk melompat ke detik itu.');return}
    var part=qtCues.slice(idx,idx+B);
    qtMsg('Menerjemahkan baris '+(idx+1)+'–'+Math.min(idx+B,qtCues.length)+' dari '+qtCues.length+'…');
    fetch(QTW+'/translate',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({lines:part.map(function(c){return c.jp})})})
      .then(function(r){return r.json()})
      .then(function(d){
        if(d&&d.error)throw new Error(d.detail||d.error);
        if(!d||!d.lines||d.lines.length!==part.length)throw new Error('mismatch');
        part.forEach(function(c,i){c.id=d.lines[i]});
        idx+=B;qtRender();step();
      })
      .catch(function(err){btn.disabled=false;qtRender();qtMsg('Terjemahan terhenti di baris '+(idx+1)+'. Tekan tombol “Terjemahkan ke Indonesia” untuk melanjutkan.'+((err&&err.message&&err.message!=='mismatch')?' (Info server: '+err.message+')':''),'bad')});
  }
  step();
}
function qtAutoFetch(){
  if(!qtVid){qtMsg('Putar dulu videonya: tempel tautan YouTube lalu tekan Putar.','bad');return}
  qtMsg('Mengambil subtitle dari YouTube…');
  var hdr={},sdk='';try{sdk=lsGet('qtSdKey')||''}catch(e){}
  if(sdk)hdr['x-sd-key']=sdk;
  fetch(QTW+'/captions?v='+qtVid,{headers:hdr}).then(function(r){return r.json()}).then(function(d){
    if(d&&d.ok&&d.segments&&d.segments.length){qtSetCues(d.segments.map(function(s){return{t:s.t,jp:s.text}}),'otomatis'+(d.via==='supadata'?' via Supadata':' dari YouTube'))}
    else if(d&&d.error==='need_key'){qtMsg('Subtitle otomatis butuh kunci Supadata karena YouTube menolak diambil langsung dari server. Buka bagian “🔑 Kunci Supadata saya” di bawah untuk memasang kunci gratis milikmu — atau pakai tempel transkrip manual.','bad')}
    else if(d&&d.error==='quota_shared'){qtMsg('Jatah subtitle otomatis bersama hari ini sudah habis. Pasang kunci Supadatamu sendiri (gratis) lewat bagian 🔑 di bawah, atau pakai tempel transkrip manual.','bad')}
    else{qtMsg('Subtitle otomatis tidak tersedia untuk video ini. Pakai cara tempel transkrip: buka video di YouTube → “Buka transkrip” → salin → tempel di kotak teks → Proses transkrip.','bad')}
  }).catch(function(){qtMsg('Gagal menghubungi server subtitle. Coba lagi, atau pakai tempel transkrip manual.','bad')});
}
function qtLoadApi(cb){
  if(window.YT&&YT.Player){cb();return}
  var old=window.onYouTubeIframeAPIReady;
  window.onYouTubeIframeAPIReady=function(){if(old)old();cb()};
  if(!document.querySelector('script[src*="iframe_api"]')){var s=document.createElement('script');s.src='https://www.youtube.com/iframe_api';document.head.appendChild(s)}
}
function qtSyncStart(){
  if(qtTimer)return;
  qtTimer=setInterval(function(){
    if(!qtPlayer||!qtReady||!qtCues.length)return;
    var t;try{t=qtPlayer.getCurrentTime()}catch(e){return}
    var i=-1;for(var k=0;k<qtCues.length;k++){if(qtCues[k].t<=t+0.05)i=k;else break}
    if(i===qtActive)return;
    qtActive=i;
    var box=qtEl('qtCaps');if(!box)return;
    [].slice.call(box.children).forEach(function(el,j){el.classList.toggle('on',j===i)});
    if(i>=0&&Date.now()-qtLastTouch>4000){var el=box.children[i];if(el){var tg=el.offsetTop-box.clientHeight/2+el.offsetHeight/2;try{box.scrollTo({top:tg,behavior:'smooth'})}catch(e){box.scrollTop=tg}}}
  },300);
}
function qtPlay(id){
  qtEl('qtPlayerWrap').hidden=false;
  qtLoadApi(function(){
    try{
      if(qtPlayer&&qtPlayer.loadVideoById){qtPlayer.loadVideoById(id)}
      else{qtPlayer=new YT.Player('qtYt',{videoId:id,playerVars:{rel:0,playsinline:1,modestbranding:1},events:{onReady:function(){qtReady=true;qtSyncStart()}}})}
      qtSyncStart();
    }catch(e){qtMsg('Pemutar YouTube gagal dimuat. Periksa koneksi lalu coba lagi.','bad')}
  });
}
function qtStart(){
  var u=qtEl('qtUrl').value,id=qtVideoId(u);
  if(!id){
    if(u&&/tiktok\.com|facebook\.com|instagram\.com/.test(u)){qtMsg('Itu tautan TikTok/Facebook/Instagram. Platform tersebut tidak menyediakan transkrip dan pemutarnya tidak bisa disinkronkan, jadi fitur ini khusus YouTube dulu ya.','bad')}
    else{qtMsg('Tautan tidak dikenali. Tempel tautan video YouTube (youtube.com/watch…, youtu.be/…, atau Shorts).','bad')}
    return;
  }
  qtVid=id;qtCues=[];qtRender();qtPlay(id);
  qtMsg('Video dimuat. Mengambil subtitle…');
  setTimeout(qtAutoFetch,600);
}
function showTerjemah(r){
  var host=panes.terjemah.querySelector('.qhBody');
  if(!qtBuilt){
    qtBuilt=true;
    host.innerHTML='<div class="qtWrap">'
      +'<div class="qtHead"><h2 class="qtH">🎬 Terjemah Video</h2><button type="button" class="qtBtn sm" id="qtHelpBtn" aria-expanded="false">❓ Petunjuk</button></div>'
      +'<p class="qtSub" id="qtHelp" hidden>Tempel tautan video YouTube, lalu putar sambil membaca subtitle bahasa Jepangnya beserta terjemahan Indonesianya — seperti aplikasi belajar dari podcast, tapi untuk video. Ketuk satu baris subtitle untuk melompat ke detik tersebut. Ketuk satu kata pada baris Jepang untuk melihat arti tango/kotobanya. Bila subtitle otomatis tidak bisa diambil, gunakan tombol “Tempel transkrip”. Khusus YouTube dulu: TikTok/Facebook/Instagram tidak menyediakan transkrip dan pemutar tanamnya tidak bisa disinkronkan. Subtitle otomatis diambil dari subtitle resmi/otomatis milik video; bila server tidak mendapatkannya, gunakan tempel transkrip. Terjemahan disimpan di perangkat ini, jadi video yang sama tidak diterjemahkan dua kali.</p>'
      +'<div class="qtRow"><input type="url" id="qtUrl" placeholder="Tempel tautan YouTube di sini…" aria-label="Tautan video YouTube"><button type="button" class="qtBtn pri" id="qtGo">Putar</button></div>'
      +'<div class="qtRow qtGap qtBtnRow"><button type="button" class="qtBtn sm" id="qtAuto">Ambil otomatis</button><label class="qtBtn sm qtFile">Upload<input type="file" id="qtFile" accept=".srt,.vtt,.txt" style="display:none"></label><button type="button" class="qtBtn sm" id="qtPasteBtn" aria-expanded="false" aria-controls="qtPasteBox">Tempel transkrip</button></div>'
      +'<div class="qtKey" id="qtPasteBox" hidden><div class="qtKeyBody"><p>Untuk video yang subtitle otomatisnya tidak berhasil diambil. Caranya: buka video di aplikasi YouTube → ketuk judul/deskripsi → “Buka transkrip” → salin semua teksnya → tempel di sini.</p><textarea id="qtPaste" rows="4" placeholder="Tempel transkrip di sini…"></textarea><div class="qtRow"><button type="button" class="qtBtn pri sm" id="qtProc">Proses transkrip</button></div></div></div>'
      +'<div class="qtRow qtGap"><button type="button" class="qtBtn sm qtKeyBtn" id="qtKeyBtn" aria-expanded="false" aria-controls="qtKeyBox">🔑 Kunci Supadata saya — agar subtitle otomatis selalu berhasil (opsional)</button></div>'
      +'<div class="qtKey" id="qtKeyBox" hidden><div class="qtKeyBody"><p>Pengambilan subtitle otomatis memakai layanan Supadata. Jatah bersama dari Qategori terbatas; dengan kunci sendiri kamu tidak berbagi jatah (gratis 100 video/bulan, tanpa kartu kredit):</p><ol><li>Buka <a href="https://supadata.ai" target="_blank" rel="noopener">supadata.ai</a> → <b>Sign up / Get started</b> → <b>Continue with Google</b>.</li><li>Di Dashboard, cari bagian <b>API Key</b> lalu salin kuncinya.</li><li>Tempel di sini lalu tekan Simpan. Kunci hanya tersimpan di perangkat ini.</li></ol><div class="qtRow"><input type="text" id="qtSdKey" placeholder="Tempel kunci API Supadata di sini" aria-label="Kunci API Supadata"><button type="button" class="qtBtn" id="qtSdSave">Simpan</button></div><p class="qtKeyStat" id="qtSdStat"></p></div></div>'
      +'<div class="qtStick">'
      +'<div class="qtPlayer" id="qtPlayerWrap" hidden><div class="qtFrame"><div id="qtYt"></div></div></div>'
      +'<p class="qtMsg" id="qtMsg" aria-live="polite"></p>'
      +'<div class="qtCtl" id="qtCtl" hidden><button type="button" class="qtBtn pri sm" id="qtTr" hidden>Terjemahkan ke Indonesia</button><select id="qtModeSel" aria-label="Tampilan subtitle"><option value="both" selected>Semua</option><option value="jp">Jepang</option><option value="id">Indonesia</option></select><select id="qtSpeed" aria-label="Kecepatan putar"><option value="0.5">0.5×</option><option value="0.75">0.75×</option><option value="1" selected>1×</option><option value="1.25">1.25×</option><option value="1.5">1.5×</option></select></div>'
      +'</div>'
      +'<div class="qtCaps qt-both" id="qtCaps"></div>'
      +'<div class="qtPop" id="qtPop" hidden></div>'
      +'</div>';
    qtEl('qtHelpBtn').addEventListener('click',function(){
      var h=qtEl('qtHelp');var open=h.hidden;h.hidden=!open;
      this.setAttribute('aria-expanded',open?'true':'false');
    });
    qtEl('qtGo').addEventListener('click',qtStart);
    qtEl('qtUrl').addEventListener('keydown',function(e){if(e.key==='Enter')qtStart()});
    qtEl('qtAuto').addEventListener('click',qtAutoFetch);
    qtEl('qtPasteBtn').addEventListener('click',function(){
      var b=qtEl('qtPasteBox');var open=b.hidden;b.hidden=!open;
      this.setAttribute('aria-expanded',open?'true':'false');
    });
    qtEl('qtKeyBtn').addEventListener('click',function(){
      var b=qtEl('qtKeyBox');var open=b.hidden;b.hidden=!open;
      this.setAttribute('aria-expanded',open?'true':'false');
    });
    qtEl('qtTr').addEventListener('click',qtTranslate);
    qtEl('qtProc').addEventListener('click',function(){
      var cues=qtParse(qtEl('qtPaste').value);
      if(!cues.length){qtMsg('Transkrip tidak terbaca. Pastikan ada baris waktu seperti “0:05 …” atau format .srt/.vtt.','bad');return}
      qtEl('qtPasteBox').hidden=true;qtEl('qtPasteBtn').setAttribute('aria-expanded','false');
      qtSetCues(cues,'tempel manual');
    });
    qtEl('qtFile').addEventListener('change',function(){
      var f=this.files&&this.files[0];if(!f)return;
      var rd=new FileReader();
      rd.onload=function(){qtEl('qtPaste').value=String(rd.result||'');var cues=qtParse(rd.result);if(cues.length)qtSetCues(cues,'file '+f.name);else qtMsg('Isi file tidak terbaca sebagai subtitle.','bad')};
      rd.readAsText(f);
    });
    qtEl('qtCaps').addEventListener('click',function(e){
      var wEl=e.target.closest&&e.target.closest('.qtW');
      if(qtWordOn&&wEl){
        qtLastTouch=Date.now();
        var cap0=e.target.closest('.qtCap');var c0=cap0?qtCues[+cap0.getAttribute('data-i')]:null;
        qtWordOpen(wEl.getAttribute('data-w'),c0?c0.jp:'');
        return;
      }
      var cap=e.target.closest&&e.target.closest('.qtCap');if(!cap)return;
      var c=qtCues[+cap.getAttribute('data-i')];if(!c)return;
      qtLastTouch=Date.now();
      if(qtPlayer&&qtReady){try{qtPlayer.seekTo(c.t,true);qtPlayer.playVideo()}catch(err){}}
    });
    ['scroll','touchstart','wheel'].forEach(function(ev){qtEl('qtCaps').addEventListener(ev,function(){qtLastTouch=Date.now()},{passive:true})});
    qtEl('qtModeSel').addEventListener('change',function(){
      qtMode=this.value;
      qtEl('qtCaps').className='qtCaps qt-'+qtMode;
    });
    qtEnsureBank();
    qtEl('qtSpeed').addEventListener('change',function(){if(qtPlayer&&qtReady){try{qtPlayer.setPlaybackRate(parseFloat(this.value))}catch(e){}}});
    var sdInp=qtEl('qtSdKey'),savedSd='';try{savedSd=lsGet('qtSdKey')||''}catch(e){}
    if(sdInp&&savedSd){sdInp.value=savedSd;qtEl('qtSdStat').textContent='Kunci tersimpan di perangkat ini — subtitle otomatis memakai kuncimu.'}
    qtEl('qtSdSave').addEventListener('click',function(){
      var val=sdInp.value.trim();try{lsSet('qtSdKey',val)}catch(e){}
      qtEl('qtSdStat').textContent=val?'Kunci tersimpan di perangkat ini.':'Kunci dihapus dari perangkat ini.';
      qtMsg(val?'Kunci Supadata disimpan. Subtitle otomatis berikutnya memakai kuncimu.':'Kunci Supadata dihapus.');
    });
  }
  var q=new URLSearchParams((r&&r.qs)||''),u=q.get('url');
  if(u){var inp=qtEl('qtUrl');if(inp&&inp.value!==u){inp.value=u;qtStart()}}
}

function kanaPick(fr,mode){var n=0;
  (function t(){try{var d=fr.contentDocument,b=d&&d.querySelector('[data-sc="'+(mode==='katakana'?'k':'h')+'"]');if(b){if(b.getAttribute('aria-pressed')!=='true')b.click();return}}catch(x){}
    if(++n<20)setTimeout(t,200)})()}
var KANA_CSS='header,.grp[aria-label="Pilih aksara"]{display:none!important}.ctl{gap:0}'+
'select.qkSel{width:100%;height:44px;padding:0 38px 0 14px;border:1px solid var(--line);border-radius:12px;background:var(--surface) url("data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' viewBox=\'0 0 24 24\' fill=\'none\' stroke=\'%23888\' stroke-width=\'2\' stroke-linecap=\'round\'%3E%3Cpath d=\'M6 9l6 6 6-6\'/%3E%3C/svg%3E") no-repeat right 12px center/16px;color:var(--ink);font:inherit;font-size:.95rem;font-weight:700;-webkit-appearance:none;appearance:none}'+
'.grp[aria-label="Pilih set huruf"]{flex-wrap:nowrap;align-items:center;gap:10px}.grp[aria-label="Pilih set huruf"]>.chip{display:none}.grp[aria-label="Pilih set huruf"] select{flex:1;min-width:0}';
function kanaInit(fr,sub){
  try{var d=fr.contentDocument,st=d.createElement('style');st.textContent=KANA_CSS;d.head.appendChild(st);fr.__kana=1;
    var g=d.querySelector('.grp[aria-label="Pilih set huruf"]');
    if(g&&!g.querySelector('select')){var chips=[].slice.call(g.querySelectorAll('[data-set]'));
      var sel=d.createElement('select');sel.className='qkSel';sel.setAttribute('aria-label','Pilih set huruf');
      var opts=chips.map(function(c){return[c.getAttribute('data-set'),c.textContent]});opts.push(['semua','Semua set']);
      sel.innerHTML=opts.map(function(o){return'<option value="'+o[0]+'">'+o[1]+'</option>'}).join('');
      var cur=function(){var on=chips.filter(function(c){return c.getAttribute('aria-pressed')==='true'}).map(function(c){return c.getAttribute('data-set')});
        sel.value=on.length===1?on[0]:'semua'};
      sel.addEventListener('change',function(){[true,false].forEach(function(on){chips.forEach(function(c){var want=sel.value==='semua'||c.getAttribute('data-set')===sel.value;if(want===on&&(c.getAttribute('aria-pressed')==='true')!==want)c.click()})});setTimeout(cur,50)});
      g.appendChild(sel);cur()}
    kanaTheme(fr)}catch(e){}
  kanaPick(fr,sub)}
function kanaTheme(fr){try{var d=fr.contentDocument.documentElement,cs=getComputedStyle(nB),g=function(k){return cs.getPropertyValue(k).trim()},s=d.style;
  var link=g('--themeLink'),c=g('--themeC');if(!link||!c)return;
  s.setProperty('--bg',g('--themeBg-alt')||g('--themeBg'));s.setProperty('--surface',g('--themeBg'));s.setProperty('--ink',c);
  s.setProperty('--muted','color-mix(in srgb,'+c+' 62%,transparent)');s.setProperty('--line',g('--themeBd-color'));
  s.setProperty('--accent',link);s.setProperty('--accent-ink',g('--buttonC')||'#fff');s.setProperty('--tint','color-mix(in srgb,'+link+' 14%,transparent)');
  var b=fr.contentDocument.body;if(b&&!b.__t){b.__t=1;b.style.background='transparent'}}catch(e){}}
function kanaRow(sub){var T=[['hiragana','Hiragana','あ'],['katakana','Katakana','ア']];
  return'<div class="qhRow" role="tablist" id="qkRow">'+T.map(function(t){return'<button type="button" role="tab" data-qhd="1" data-go="kana-'+t[0]+'" aria-selected="'+(sub===t[0])+'"><svg viewBox="0 0 24 24" aria-hidden="true"><text x="12" y="18" text-anchor="middle" font-size="17" font-weight="700" fill="currentColor" stroke="none">'+t[2]+'</text></svg><span>'+t[1]+'</span></button>'}).join('')+'</div>'}
function showKana(sub){var host=panes.kana.querySelector('.qhBody');
  if(sub!=='hiragana'&&sub!=='katakana')sub='hiragana';
  if(gkey==='kana'&&gameFrame&&host.contains(gameFrame)){
    Array.prototype.forEach.call(host.querySelectorAll('#qkRow button'),function(b){b.setAttribute('aria-selected',String(b.getAttribute('data-go')==='kana-'+sub))});
    kanaPick(gameFrame,sub);startT();return}
  gkey='kana';gameFrame=null;
  frame(host,'kana.html','Hapalan Kana',kanaRow(sub),function(fr){kanaInit(fr,sub)})}
/* game lain: padatkan tampilan + grup chip pilihan jadi dropdown (mengikuti pola kana & rambu) */
var GX_CSS='.wrap{padding:10px 10px 16px!important}'+
'.wrap h1{font-size:1.5rem!important;margin:2px 0 4px!important}.wrap h2{font-size:1.12rem!important}'+
'.grp{gap:6px!important;margin:6px 0!important}.chip{padding:6px 11px!important;font-size:.86rem!important}'+
'.foot{font-size:.78rem!important;line-height:1.45!important}'+
'.grp.gxSel>.chip,.levels.gxSel>.lv{display:none!important}.grp.gxSel,.levels.gxSel{display:flex!important;align-items:center;gap:8px}'+
'select.qkSel{width:100%;height:44px;padding:0 12px;border:1px solid var(--line);border-radius:12px;background:var(--surface);color:var(--ink);font:inherit;font-size:.95rem;font-weight:700}'+
'.gxSel select.qkSel{flex:1;min-width:0;width:auto}';
var GX_EXTRA={
 gambar:'.big svg{max-height:170px!important}.ask{font-size:1rem!important}.opts{gap:8px!important}',
 kanji:'.ctl{gap:6px!important}.stats{margin:6px 0!important;font-size:.88rem!important}',
 trivia:'.q{font-size:1.08rem!important}.opts{gap:8px!important}',
 tts:'.pad{gap:3px!important;padding:6px!important}.pad .k{padding:7px 0!important;font-size:.95rem!important;min-height:0!important}.stats{margin:4px 0!important;font-size:.88rem!important}'};
var GX_LABELS=['Mode','Level','Jumlah pasangan','Pilih kategori','Pilih level JLPT'];
function gxConvert(fr,box,itemSel){
  var d=fr.contentDocument;if(!d||box.querySelector('select.qkSel'))return;
  var items=[].slice.call(box.querySelectorAll(itemSel));if(items.length<2)return;
  var sel=d.createElement('select');sel.className='qkSel';sel.setAttribute('aria-label',box.getAttribute('aria-label')||'Pilihan');
  sel.innerHTML=items.map(function(c,i){return'<option value="'+i+'">'+c.textContent.trim()+'</option>'}).join('');
  sel.addEventListener('change',function(){var c=items[+sel.value];if(c)c.click();setTimeout(function(){gxSync(fr)},80)});
  box.appendChild(sel);box.classList.add('gxSel');(fr.__gxBoxes=fr.__gxBoxes||[]).push([items,sel]);
}
function gxApply(fr){
  var d=fr.contentDocument;if(!d)return;
  [].slice.call(d.querySelectorAll('.grp')).forEach(function(g){if(GX_LABELS.indexOf(g.getAttribute('aria-label'))>=0)gxConvert(fr,g,'.chip')});
  [].slice.call(d.querySelectorAll('.levels')).forEach(function(g){gxConvert(fr,g,'.lv')});
  if(fr.__gxId==='tts')gxRomaji(fr);
}
function gxSync(fr){
  if(fr.__gxBoxes)fr.__gxBoxes=fr.__gxBoxes.filter(function(t){return t[1].isConnected});
  (fr.__gxBoxes||[]).forEach(function(t){var items=t[0],sel=t[1],on=0;items.forEach(function(c,i){if(c.getAttribute('aria-pressed')==='true'||c.classList.contains('on')||c.classList.contains('act'))on=i});if(sel.selectedIndex!==on)sel.selectedIndex=on});
  gxApply(fr);
}
function gameInit(fr,id){try{var d=fr.contentDocument;if(!d||fr.__gxDone)return;fr.__gxDone=1;fr.__gxId=id;
  var st=d.createElement('style');st.textContent=GX_CSS+(GX_EXTRA[id]||'');(d.head||d.documentElement).appendChild(st);
  fr.__gx=1;gxApply(fr);gxSync(fr)}catch(e){}}
var GX_ROMA={a:'あ',i:'い',u:'う',e:'え',o:'お',ka:'か',ki:'き',ku:'く',ke:'け',ko:'こ',sa:'さ',shi:'し',si:'し',su:'す',se:'せ',so:'そ',ta:'た',chi:'ち',ti:'ち',tsu:'つ',tu:'つ',te:'て',to:'と',na:'な',ni:'に',nu:'ぬ',ne:'ね',no:'の',ha:'は',hi:'ひ',fu:'ふ',hu:'ふ',he:'へ',ho:'ほ',ma:'ま',mi:'み',mu:'む',me:'め',mo:'も',ya:'や',yu:'ゆ',yo:'よ',ra:'ら',ri:'り',ru:'る',re:'れ',ro:'ろ',wa:'わ',wo:'を',ga:'が',gi:'ぎ',gu:'ぐ',ge:'げ',go:'ご',za:'ざ',ji:'じ',zi:'じ',zu:'ず',ze:'ぜ',zo:'ぞ',da:'だ',di:'ぢ',du:'づ',de:'で',do:'ど',ba:'ば',bi:'び',bu:'ぶ',be:'べ',bo:'ぼ',pa:'ぱ',pi:'ぴ',pu:'ぷ',pe:'ぺ',po:'ぽ',kya:'きゃ',kyu:'きゅ',kyo:'きょ',sha:'しゃ',shu:'しゅ',sho:'しょ',sya:'しゃ',syu:'しゅ',syo:'しょ',cha:'ちゃ',chu:'ちゅ',cho:'ちょ',tya:'ちゃ',tyu:'ちゅ',tyo:'ちょ',ja:'じゃ',ju:'じゅ',jo:'じょ',jya:'じゃ',jyu:'じゅ',jyo:'じょ',nya:'にゃ',nyu:'にゅ',nyo:'にょ',hya:'ひゃ',hyu:'ひゅ',hyo:'ひょ',mya:'みゃ',myu:'みゅ',myo:'みょ',rya:'りゃ',ryu:'りゅ',ryo:'りょ',gya:'ぎゃ',gyu:'ぎゅ',gyo:'ぎょ',bya:'びゃ',byu:'びゅ',byo:'びょ',pya:'ぴゃ',pyu:'ぴゅ',pyo:'ぴょ'};
function gxKana(s){s=(s||'').toLowerCase();var out='',i=0;while(i<s.length){var ch=s[i];
  if(ch==='-'){out+='ー';i++;continue}
  if(ch==='n'&&(i+1>=s.length||'aeiouy'.indexOf(s[i+1])<0)){out+='ん';i++;continue}
  if(i+1<s.length&&ch===s[i+1]&&'bcdfghjkmprstvwz'.indexOf(ch)>=0){out+='っ';i++;continue}
  var hit='';for(var L=3;L>=1;L--){var sub=s.substr(i,L);if(GX_ROMA[sub]){hit=sub;break}}
  if(hit){out+=GX_ROMA[hit];i+=hit.length}else i++}
  return out}
function gxRomaji(fr){var d=fr.contentDocument,pad=d.querySelector('.pad');if(!pad||d.getElementById('gxRom'))return;
  var inp=d.createElement('input');inp.id='gxRom';inp.type='text';inp.setAttribute('aria-label','Ketik romaji');
  inp.placeholder='Ketik romaji lalu Enter — mis. sakura, neko, yama';
  inp.style.cssText='width:100%;box-sizing:border-box;margin:0 0 8px;padding:11px 13px;border:1px solid var(--line);border-radius:12px;background:var(--surface);color:var(--ink);font:inherit;font-size:.95rem';
  pad.parentNode.insertBefore(inp,pad);
  inp.addEventListener('keydown',function(e){if(e.key!=='Enter')return;e.preventDefault();var kana=gxKana(inp.value);inp.value='';
    kana.split('').forEach(function(ch){var b=pad.querySelector('[data-ch="'+ch+'"]');if(b)b.click()})})}
/* berita */
var posts=null,lab='',shown=20,qs0=root.querySelector('#qList');
var listEl=qs0;
  var CITIES = [['Tokyo',35.69,139.69],['Yokohama',35.44,139.64],['Osaka',34.69,135.50],['Kyoto',35.01,135.77],['Kobe',34.69,135.20],['Nagoya',35.18,136.91],['Fukuoka',33.59,130.40],['Hiroshima',34.39,132.46],['Sendai',38.27,140.87],['Sapporo',43.06,141.35],['Jakarta',-6.21,106.85]];
  var HARI = ['Minggu','Senin','Selasa','Rabu','Kamis','Jumat','Sabtu'], HARIJ = ['日','月','火','水','木','金','土'];
  var BLN = ['Jan','Feb','Mar','Apr','Mei','Jun','Jul','Agu','Sep','Okt','Nov','Des'];
  function p2(n){ return (n < 10 ? '0' : '') + n; }
  function atOff(h){ return new Date(Date.now() + h * 3600000); }
  function wxInfo(c){
    if (c === 0) return ['☀️', 'Cerah', '晴れ hare'];
    if (c <= 2) return ['🌤️', 'Cerah berawan', '晴れ時々曇り hare tokidoki kumori'];
    if (c === 3) return ['☁️', 'Mendung', '曇り kumori'];
    if (c === 45 || c === 48) return ['🌫️', 'Berkabut', '霧 kiri'];
    if (c >= 51 && c <= 57) return ['🌦️', 'Gerimis', '小雨 kosame'];
    if ((c >= 61 && c <= 67) || (c >= 80 && c <= 82)) return ['🌧️', 'Hujan', '雨 ame'];
    if ((c >= 71 && c <= 77) || c === 85 || c === 86) return ['❄️', 'Salju', '雪 yuki'];
    if (c >= 95) return ['⛈️', 'Badai petir', '雷 kaminari'];
    return ['🌡️', 'Cuaca', ''];
  }
  var todayEl = document.createElement('section');
  todayEl.className = 'qhToday'; todayEl.setAttribute('aria-label', 'Hari ini');
  todayEl.innerHTML =
    '<div class="qtTile"><small>日本 Nihon</small><b data-qt="jt">--:--</b><span data-qt="jd"></span><span data-qt="wib"></span></div>' +
    '<div class="qtTile"><small><label for="qtCity">Cuaca</label><select id="qtCity" aria-label="Pilih kota">' + CITIES.map(function(c){ return '<option>' + c[0] + '</option>'; }).join('') + '</select></small><b data-qt="tp">--&deg;</b><span data-qt="wd">Memuat...</span></div>' +
    '';
  panes.berita.insertBefore(todayEl, listEl);
  function q(k){ return document.querySelector('[data-qt="' + k + '"]'); }
  function tickClock(){
    var j = atOff(9), w = atOff(7);
    q('jt').textContent = p2(j.getUTCHours()) + ':' + p2(j.getUTCMinutes());
    q('jd').textContent = HARI[j.getUTCDay()] + ', ' + j.getUTCDate() + ' ' + BLN[j.getUTCMonth()] + ' · ' + HARIJ[j.getUTCDay()] + '曜日';
    q('wib').textContent = 'Indonesia (WIB) ' + p2(w.getUTCHours()) + ':' + p2(w.getUTCMinutes());
  }
  var cityI = 0; try { cityI = Math.max(0, Math.min(CITIES.length - 1, parseInt(lsGet('qt_city') || '0', 10) || 0)); } catch(e){}
  todayEl.querySelector('#qtCity').selectedIndex = cityI;
  function showWx(d){
    var w = wxInfo(d.c);
    q('tp').textContent = w[0] + ' ' + Math.round(d.t) + '°';
    q('wd').textContent = w[1] + (w[2] ? ' · ' + w[2] : '') + ' · ' + Math.round(d.lo) + '–' + Math.round(d.hi) + '°';
  }
  function loadWx(){
    var c = CITIES[cityI], ck = 'qt_wx_' + cityI, cached = null;
    try { cached = JSON.parse(lsGet(ck) || 'null'); } catch(e){}
    if (cached && Date.now() - cached.at < 1800000) { showWx(cached.d); return; }
    if (cached) showWx(cached.d); else { q('tp').innerHTML = '--&deg;'; q('wd').textContent = 'Memuat...'; }
    var url = 'https://api.open-meteo.com/v1/forecast?latitude=' + c[1] + '&longitude=' + c[2] + '&current=temperature_2m,weather_code&daily=temperature_2m_max,temperature_2m_min&timezone=auto&forecast_days=1';
    fetch(url).then(function(r){ return r.json(); }).then(function(j){
      if (cityI !== CITIES.indexOf(c)) return;
      var d = {t:j.current.temperature_2m, c:j.current.weather_code, hi:j.daily.temperature_2m_max[0], lo:j.daily.temperature_2m_min[0]};
      lsSet(ck, JSON.stringify({at:Date.now(), d:d})); showWx(d);
    }).catch(function(){ if (!cached) q('wd').textContent = 'Cuaca belum bisa dimuat'; });
  }
  todayEl.querySelector('#qtCity').addEventListener('change', function(e){ cityI = e.target.selectedIndex; lsSet('qt_city', String(cityI)); loadWx(); });
  function showKanji(r){
    var a = q('kj'); if (!r || !a) return;
    a.href = '/p/materi-dan-kuis-kanji-metode-bushu.html?q=' + encodeURIComponent(r[1]) + '&tab=asal';
    a.innerHTML = '<small>今日の漢字 Kanji hari ini</small><b>' + esc(r[1]) + '</b><span>' + esc(r[4]) + ' · ' + esc(r[0]) + '<br>' + esc(String(r[2]).split(',')[0]) + (r[3] ? ' / ' + esc(String(r[3]).split(',')[0]) : '') + '</span>';
  }
  function loadKanji(){
    var j = atOff(9), dk = j.getUTCFullYear() + '-' + p2(j.getUTCMonth() + 1) + '-' + p2(j.getUTCDate()), c = null;
    try { c = JSON.parse(lsGet('qt_kd') || 'null'); } catch(e){}
    if (c && c.d === dk && c.r) { showKanji(c.r); return; }
    var go = function(){
      var K = (window.KBQ_DATA && window.KBQ_DATA.KANJI) || [], pool = K.filter(function(r){ return r[0] === 'N5' || r[0] === 'N4'; });
      var ak = {}; ['n5', 'n4'].forEach(function(l){ var o = readSet(l + '_kanji_archived_v1'); for (var k in o) ak[k] = 1; });
      var unseen = pool.filter(function(r){ return !ak[r[1]]; }); if (unseen.length) pool = unseen;
      if (!pool.length) { var kk = q('kj'); if (kk && kk.querySelector('span')) kk.querySelector('span').textContent = 'Belum bisa dimuat'; return; }
      var day = Math.floor(j.getTime() / 86400000), r = pool[(day * 7919) % pool.length];
      lsSet('qt_kd', JSON.stringify({d:dk, r:r.slice(0, 5)})); showKanji(r);
    };
    if (window.KBQ_DATA) go(); else loadScript(DATA_BASE + 'kanji/kanji-data.js?v=2').then(go);
  }

  var KLV = ['n5', 'n4', 'n3', 'n2', 'n1'];
  function readSet(key){
    var o = {}; try { var a = JSON.parse(lsGet(key) || '[]'); if (Array.isArray(a)) a.forEach(function(x){ if (typeof x === 'string') o[x] = 1; }); } catch(e){}
    return o;
  }
  function wkey(w){ return w.kanji + '|' + w.kana; }
  function showKotoba(w){
    var a = q('kt'); if (!a) return;
    if (!w) { a.innerHTML = '<small>\u4eca\u65e5\u306e\u5358\u8a9e Kotoba hari ini</small><b>\u3059\u3054\u3044\uff01</b><span>Semua kotoba sudah kamu tandai hapal. Hebat!</span>'; return; }
    a.href = '/p/materi-jlpt-' + w.lv + '.html';
    a.innerHTML = '<small>\u4eca\u65e5\u306e\u5358\u8a9e Kotoba hari ini<i>' + (w.mode === 'ulang' ? 'Ulangi' : 'Baru') + ' \u00b7 ' + esc(w.lv.toUpperCase()) + '</i></small><b>' + esc(w.kanji || w.kana) + '</b><span>' + esc(w.kana) + ' (' + esc(w.romaji) + ') \u00b7 ' + esc(w.arti) + '</span>';
  }
  function loadLevel(l){
    var g = l.toUpperCase() + '_KOTOBA';
    if (window[g]) return Promise.resolve(window[g]);
    return loadScript(DATA_BASE + l + '/' + l + '-kotoba.js').then(function(){ return window[g] || []; });
  }
  function loadKotoba(){
    var j = atOff(9), dk = j.getUTCFullYear() + '-' + p2(j.getUTCMonth() + 1) + '-' + p2(j.getUTCDate()), c = null, day = Math.floor(j.getTime() / 86400000);
    try { c = JSON.parse(lsGet('qt_kt') || 'null'); } catch(e){}
    if (c && c.d === dk) { showKotoba(c.w); return; }
    var arch = {}, done = [];
    KLV.forEach(function(l){ arch[l] = readSet(l + '_kotoba_archived_v1'); Object.keys(arch[l]).forEach(function(k){ done.push([l, k]); }); });
    function fin(w){ lsSet('qt_kt', JSON.stringify({d:dk, w:w})); showKotoba(w); }
    function slim(w, l, mode){ return {kanji:w.kanji || '', kana:w.kana || '', romaji:w.romaji || '', arti:w.arti || '', lv:l, mode:mode}; }
    function fresh(i){
      if (i >= KLV.length) { fin(null); return; }
      var l = KLV[i];
      loadLevel(l).then(function(L){
        var pool = L.filter(function(w){ return !arch[l][wkey(w)]; });
        if (!pool.length) { fresh(i + 1); return; }
        fin(slim(pool[(day * 7919) % pool.length], l, 'baru'));
      });
    }
    if (done.length >= 5 && day % 2 === 1) {
      var pick = done[(day * 7919) % done.length];
      loadLevel(pick[0]).then(function(L){
        var w = null; for (var i = 0; i < L.length; i++) { if (wkey(L[i]) === pick[1]) { w = L[i]; break; } }
        if (w) fin(slim(w, pick[0], 'ulang')); else fresh(0);
      });
    } else fresh(0);
  }
  function showGoal(){
    var g = q('gl'), d = window.qDaily ? window.qDaily.get() : null; if (!g || !d) return;
    var pct = Math.min(100, Math.round(100 * d.n / d.goal));
    g.innerHTML = '<small>Target hari ini</small><b>' + d.n + ' / ' + d.goal + '</b><span>' + (d.met ? 'Tercapai! すごい' : 'kartu dihapal') + (d.streak ? ' · 🔥 ' + d.streak + ' hari' : '') + '</span><i class="qtBar"><u style="width:' + pct + '%"></u></i>';
  }
  document.addEventListener('click', function(e){
    var b = e.target.closest ? e.target.closest('[data-qt="gl"]') : null;
    if (b && window.qDaily) { window.qDaily.nextGoal(); showGoal(); }
  });
  window.addEventListener('qdaily', showGoal);
  var todayInit = false;
  function refreshToday(){
    tickClock(); showGoal();
    if (!todayInit) { todayInit = true; loadWx(); loadKanji(); }
  }
  setInterval(function(){ if (!todayEl.hidden && !panes.berita.hidden) tickClock(); }, 20000);
  var KLV = ['n5', 'n4', 'n3', 'n2', 'n1'];
  function readSet(key){
    var o = {}; try { var a = JSON.parse(lsGet(key) || '[]'); if (Array.isArray(a)) a.forEach(function(x){ if (typeof x === 'string') o[x] = 1; }); } catch(e){}
    return o;
  }
  function wkey(w){ return w.kanji + '|' + w.kana; }

var MON=['Jan','Feb','Mar','Apr','Mei','Jun','Jul','Agu','Sep','Okt','Nov','Des'];
function fdt(s){var m=/^(\d{4})-(\d\d)-(\d\d)/.exec(s||'');return m?(+m[3])+' '+MON[+m[2]-1]+', '+m[1]:(s||'')}
var HID=/^(Product|Discount[1-9]0)$/,TAGS='<svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M4.17 15.3l4.53 4.53a4.5 4.5 0 0 0 6.75 0l4.39-4.39a4.5 4.5 0 0 0 0-6.75L15.3 4.17A4.5 4.5 0 0 0 11.7 2.78l-5 .24a3.7 3.7 0 0 0-3.69 3.67l-.24 5a4.5 4.5 0 0 0 1.4 3.61z"/><circle cx="9.5" cy="9.5" r="2.5"/></svg>';
function vl(a){return a.filter(function(x){return!HID.test(x)})}
function bar(d){if(d.l.indexOf('Product')<0)return'';var p=d.l.filter(function(x){return/^Discount[1-9]0$/.test(x)})[0];return'<div class="qBar"><span class="qTag">'+TAGS+'</span>'+(p?'<span class="qDisc">-'+p.slice(8)+'%</span>':'')+'</div>'}
function labA(l){return l?'<a class="qLb" href="/search/label/'+encodeURIComponent(l)+'/"># '+esc(l)+'</a>':''}
function cardHtml(d,feat){var th=d.th?'<img src="'+esc(d.th)+'" alt="" loading="lazy">':'<span class="qNoImg"></span>';
  return'<article class="qG'+(feat?' qFeat':'')+'"><div class="qGt"><a class="qThumb" href="'+d.p+'" tabindex="-1">'+th+'</a>'+(window.qBmBtn?window.qBmBtn(d.p,d.t,d.th):'')+bar(d)+'</div>'+labA(vl(d.l)[0])+'<h3><a href="'+d.p+'">'+esc(d.t)+'</a></h3><p>'+esc(d.d)+'</p><small>'+fdt(d.dt)+'</small></article>'}
var curL='',readKey='',extraEl=document.getElementById('qExtra'),showAllL=false;
function postRows(){return posts.filter(function(d){return d.ty==='POST'})}
function renderList(){
  if(!posts||curL)return;
  var rows=postRows(),feat=null;
  for(var i=0;i<rows.length;i++){if(rows[i].th){feat=rows[i];break}}
  var rest=rows.filter(function(d){return d!==feat});
  qs0.innerHTML=(feat?'<h2 class="qhH">Sorotan</h2>'+cardHtml(feat,true):'')+'<h2 class="qhH">Semua Postingan</h2><div class="qGrid">'+rest.slice(0,shown).map(function(d){return cardHtml(d)}).join('')+'</div>';
  var m=document.getElementById('qMore');m.hidden=rest.length<=shown;
  renderExtra(rows,feat);extraEl.hidden=false;
}
function renderExtra(rows,feat){
  var yr=(rows[0]&&rows[0].dt||'').slice(0,4),pop=rows.filter(function(d){return d!==feat&&d.th&&d.dt.slice(0,4)===yr}).map(function(d){var h=0,k=d.p;for(var i=0;i<k.length;i++)h=(h*31+k.charCodeAt(i))>>>0;return[h,d]}).sort(function(a,b){return a[0]-b[0]}).slice(0,5).map(function(x){return x[1]});
  var h='<h2 class="qhH">Postingan Populer</h2><div class="qPop">'+pop.map(function(d,i){
    return'<article class="qPi">'+(i===0?'<a class="qThumb qPh" href="'+d.p+'" tabindex="-1">'+(d.th?'<img src="'+esc(d.th)+'" alt="" loading="lazy">':'')+'</a>':'')+'<div class="qPr"><b class="qPn">0'+(i+1)+'</b><div><div class="qPm">'+fdt(d.dt)+(vl(d.l)[0]?' &middot; '+esc(vl(d.l)[0]):'')+'</div><h3><a href="'+d.p+'">'+esc(d.t)+'</a></h3><p>'+esc(d.d)+'</p></div></div></article>'}).join('')+'</div>';
  var c={};rows.forEach(function(d){vl(d.l).forEach(function(l){c[l]=(c[l]||0)+1})});
  var ks=Object.keys(c).sort(function(a,b){return a.localeCompare(b)}),lim=8,vis=showAllL?ks:ks.slice(0,lim);
  h+='<h2 class="qhH">Label</h2><div class="qLabs">'+vis.map(function(l){return'<a class="qLbx" href="/search/label/'+encodeURIComponent(l)+'/"><span>'+esc(l)+'</span><i>'+c[l]+'</i></a>'}).join('')+'</div>'+(ks.length>lim&&!showAllL?'<button type="button" class="qAll" id="qAll">Tunjukkan semua <small>(+'+(ks.length-lim)+')</small></button>':'');
  extraEl.innerHTML=h;
}
var readEl=document.createElement('div');readEl.className='qhRead';readEl.hidden=true;panes.berita.appendChild(readEl);
function scoreSearch(q){
  var ws=q.toLowerCase().split(/\s+/).filter(Boolean);
  return posts.map(function(d){var sc=0,t=d.t.toLowerCase();
    ws.forEach(function(w){if(t.indexOf(w)>=0)sc+=5;if(d.l.join(' ').toLowerCase().indexOf(w)>=0)sc+=2;if(d.tx.indexOf(w)>=0)sc+=1;else sc-=100});
    return[sc,d]}).filter(function(x){return ws.length&&x[0]>0}).sort(function(a,b){return b[0]-a[0]}).slice(0,60).map(function(x){return x[1]});
}
var dataP=null;
function ensureData(){if(dataP)return dataP;var jobs=[];
  if(!window.KBQ_DATA)jobs.push(loadScript(DATA_BASE+'kanji/kanji-data.js?v=2'));
  ['n5','n4','n3','n2','n1'].forEach(function(n){if(!window[n.toUpperCase()+'_KOTOBA'])jobs.push(loadScript(DATA_BASE+n+'/'+n+'-kotoba.js'))});
  dataP=Promise.all(jobs);return dataP}
function addHits(q,into){
  var ql=q.toLowerCase(),box=document.createElement('div');box.className='qhHits';
  box.innerHTML='<p class="qhLoad">Mencari di Bushu &amp; JLPT...</p>';into.insertBefore(box,into.firstChild);
  ensureData().then(function(){
    var has=function(v){return v&&String(v).toLowerCase().indexOf(ql)>=0},kj=[],kt=[],K=(window.KBQ_DATA&&window.KBQ_DATA.KANJI)||[];
    for(var i=0;i<K.length&&kj.length<14;i++){var r=K[i];if(has(r[1])||has(r[2])||has(r[3])||has(r[4])||has(r[7]))kj.push(r)}
    ['n5','n4','n3','n2','n1'].forEach(function(n){var L=window[n.toUpperCase()+'_KOTOBA']||[];
      for(var j=0;j<L.length&&kt.length<16;j++){var w=L[j];if(has(w.kanji)||has(w.kana)||has(w.romaji)||has(w.arti))kt.push([n,w])}});
    var h='';
    if(kj.length)h+='<h4>Kanji Bushu</h4><div class="qhHL">'+kj.map(function(r){return'<a class="qhHit" href="'+P+'materi-dan-kuis-kanji-metode-bushu.html?q='+encodeURIComponent(r[1])+'&tab=asal"><b>'+esc(r[1])+'</b><span>'+esc(r[0])+' '+esc(r[2])+' - '+esc(r[4])+'</span></a>'}).join('')+'</div>';
    if(kt.length)h+='<h4>Kotoba JLPT</h4><div class="qhHL">'+kt.map(function(p){var w=p[1];return'<a class="qhHit" href="'+P+'materi-jlpt-'+p[0]+'.html?q='+encodeURIComponent(w.kanji||w.kana)+'&tab=daftar"><b>'+esc(w.kanji||w.kana)+'</b><span>'+esc(p[0].toUpperCase())+' '+esc(w.kana)+' ('+esc(w.romaji)+') - '+esc(w.arti)+'</span></a>'}).join('')+'</div>';
    if(!h){if(box.parentNode)box.parentNode.removeChild(box);return}
    box.innerHTML=h});
}
function renderQuery(l){
  var u;try{u=new URL(l,location.origin)}catch(x){return}
  var m=/^\/search\/label\/([^\/]+)/.exec(u.pathname);
  if(m){var lb=decodeURIComponent(m[1]);var rows=posts.filter(function(d){return d.ty==='POST'&&d.l.indexOf(lb)>=0});
    qs0.innerHTML='<h2 class="qhH"># '+esc(lb)+'</h2><div class="qGrid">'+rows.map(function(d){return cardHtml(d)}).join('')+'</div>';return}
  var q=(u.searchParams.get('q')||'').trim();
  var rs=q?scoreSearch(q):[];
  qs0.innerHTML='<h2 class="qhH">Hasil untuk &ldquo;'+esc(q)+'&rdquo;</h2>'+(rs.length?'<div class="qGrid">'+rs.map(function(d){return cardHtml(d)}).join('')+'</div>':'<p class="qhLoad">Tidak ada artikel yang cocok.</p>');
  if(q)addHits(q,qs0);
}
function qhToc(body){
  Array.prototype.forEach.call(readEl.querySelectorAll('.qhTocB,.qhTocP'),function(n){n.parentNode.removeChild(n)});
  var hs=Array.prototype.slice.call(body.querySelectorAll('.postBody h1,.postBody h2,.postBody h3,.postBody h4,.postBody h5,.postBody h6'));
  if(hs.length<2)hs=Array.prototype.slice.call(body.querySelectorAll('h1,h2,h3,h4,h5,h6'));
  if(hs.length<2)return;
  var min=6,links='';
  hs.forEach(function(h){min=Math.min(min,parseInt(h.tagName.charAt(1),10))});
  hs.forEach(function(h,i){
    var slug=(h.textContent||'').toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/^-+|-+$/g,'').slice(0,40);
    h.id='qk'+(i+1)+(slug?'-'+slug:'');h.style.scrollMarginTop='84px';
    links+='<a href="#'+h.id+'" style="padding-left:'+((parseInt(h.tagName.charAt(1),10)-min)*14)+'px">'+esc((h.textContent||'').trim())+'</a>'});
  var btn=document.createElement('button');btn.type='button';btn.className='qhTocB';btn.setAttribute('aria-label','Buka daftar isi');
  btn.innerHTML='<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"><path d="M4 6h16M4 12h16M4 18h10"/></svg>';
  var pan=document.createElement('div');pan.className='qhTocP';pan.hidden=true;
  pan.innerHTML='<button type="button" class="qhTocX">&lsaquo; Konten</button><div class="qhTocC">'+links+'</div>';
  btn.addEventListener('click',function(){pan.hidden=!pan.hidden});
  pan.addEventListener('click',function(e){
    if(e.target.closest('.qhTocX')){pan.hidden=true;return}
    var a=e.target.closest('a[href^="#"]');if(!a)return;
    e.preventDefault();e.stopPropagation();pan.hidden=true;
    var t=document.getElementById(a.getAttribute('href').slice(1));if(t)window.scrollTo({top:t.getBoundingClientRect().top+window.pageYOffset-84,behavior:'smooth'})});
  readEl.appendChild(btn);readEl.appendChild(pan);
}
function showBerita(qs){
  var q=new URLSearchParams(qs),u=q.get('u'),l=q.get('l'),more=document.getElementById('qMore');
  if(u&&ART_RE.test(u)){
    listEl.hidden=true;more.hidden=true;extraEl.hidden=true;readEl.hidden=false;todayEl.hidden=true;
    if(readKey!==u){readKey=u;
      readEl.innerHTML='<div class="qhBar"><button type="button" class="qhBtn alt" data-go="berita'+(curL?'?l='+encodeURIComponent(curL):'')+'">&larr; Kembali</button></div><div class="qhArt pE postBody"><p class="qhLoad">Memuat...</p></div>';
      var body=readEl.querySelector('.qhArt'),my=u;
      fetchHtml(u).then(function(html){if(readKey!==my)return;
        var d=new DOMParser().parseFromString(html,'text/html'),art=d.querySelector('main article')||d.querySelector('article');
        if(!art)throw new Error('isi halaman tidak ditemukan');
        if(d.title)document.title=d.title;
        body.innerHTML='';var scripts=[];
        Array.prototype.slice.call(art.childNodes).forEach(function(n){
          if(n.nodeType===1&&n.tagName==='SCRIPT'){scripts.push(n);return}
          var c=document.importNode(n,true);body.appendChild(c);
          if(c.nodeType===1)Array.prototype.slice.call(c.querySelectorAll('script')).forEach(function(sc){scripts.push(sc);sc.parentNode.removeChild(sc)});
        });
        window.scrollTo(0,0);try{qhToc(body)}catch(e){}return runScripts(body,scripts);
      }).catch(function(err){if(readKey!==my)return;readKey='';body.innerHTML='<div class="qhErr"><p>Halaman belum bisa dimuat ('+esc(err&&err.message)+').</p><button type="button" class="qhBtn" data-go="berita">Ke daftar berita</button></div>'});
    }
    return;
  }
  readKey='';readEl.hidden=true;readEl.innerHTML='';listEl.hidden=false;document.title='Berita | Qategori';
  loadPosts(function(){
    if(l&&l.charAt(0)==='/'&&l.charAt(1)!=='/'){todayEl.hidden=true;more.hidden=true;extraEl.hidden=true;if(curL!==l){curL=l;renderQuery(l)}}
    else{todayEl.hidden=false;refreshToday();if(curL){curL='';lab=''}renderList()}
  });
}
function loadPosts(cb){if(posts)return cb();fetch('/search.json').then(function(r){return r.json()}).then(function(j){posts=j;cb()}).catch(function(){})}
root.addEventListener('click',function(e){
  var c=e.target.closest&&e.target.closest('.qChip');
  if(c){lab=c.getAttribute('data-lab');shown=20;root.querySelectorAll('.qChip').forEach(function(x){x.classList.toggle('on',x===c)});loadPosts(renderList);return}
  if(e.target.id==='qAll'||e.target.closest&&e.target.closest('#qAll')){showAllL=true;loadPosts(renderList);return}
  if(e.target.id==='qMore'){shown+=20;loadPosts(renderList);return}
  var g=e.target.closest&&e.target.closest('[data-go]');if(g&&/^\d+$/.test(g.getAttribute('data-go')||''))g=null;if(g){e.preventDefault();go(g.getAttribute('data-go'));window.scrollTo(0,0);return}
  var r=e.target.closest&&e.target.closest('[data-retry]');if(r){mounted[PANES.filter(function(p){return panes[p].contains(r)})[0]]=null;show();}
});
/* ===== Beranda: Mochi interaktif + ringkasan riwayat + berita terbaru ===== */
var berEl=panes.beranda.querySelector('.qhBody');berEl.classList.remove('pE','postBody');berEl.id='qBeranda';
var MSVG='<svg viewBox="0 0 64 64" aria-hidden="true">'+
 '<ellipse class="mShadow" cx="32" cy="62.5" rx="15" ry="2.2" fill="rgba(0,0,0,.18)"/>'+
 '<g class="qcTail"><path d="M45 54C58 54 60 40 54 34" fill="none" stroke="#5a3a22" stroke-width="7" stroke-linecap="round"/><path d="M45 54C58 54 60 40 54 34" fill="none" stroke="#f2a65a" stroke-width="4.6" stroke-linecap="round"/></g>'+
 '<ellipse cx="32" cy="50" rx="16" ry="12.5" fill="#f2a65a" stroke="#5a3a22" stroke-width="1.6"/>'+
 '<ellipse cx="32" cy="53" rx="8.5" ry="8" fill="#fff3e0"/>'+
 '<ellipse cx="25" cy="59.5" rx="5" ry="3" fill="#fff3e0" stroke="#5a3a22" stroke-width="1.3"/><ellipse cx="39" cy="59.5" rx="5" ry="3" fill="#fff3e0" stroke="#5a3a22" stroke-width="1.3"/>'+
 '<g class="qcHead">'+
  '<g class="qcEarL"><path d="M17.5 24L19 7.5L31 17.5Z" fill="#f2a65a" stroke="#5a3a22" stroke-width="1.6" stroke-linejoin="round"/><path d="M21 19L21.6 12.5L26.5 17Z" fill="#f7b6b6"/></g>'+
  '<g class="qcEarR"><path d="M46.5 24L45 7.5L33 17.5Z" fill="#f2a65a" stroke="#5a3a22" stroke-width="1.6" stroke-linejoin="round"/><path d="M43 19L42.4 12.5L37.5 17Z" fill="#f7b6b6"/></g>'+
  '<ellipse cx="32" cy="29" rx="16" ry="13.5" fill="#f2a65a" stroke="#5a3a22" stroke-width="1.6"/>'+
  '<path d="M32 16.5V21M27 17.5L28 21M37 17.5L36 21" stroke="#c9772e" stroke-width="1.6" stroke-linecap="round"/>'+
  '<ellipse cx="32" cy="34" rx="7.5" ry="5.2" fill="#fff3e0"/>'+
  '<g class="qcEyes"><ellipse cx="25" cy="28.5" rx="2.1" ry="2.8" fill="#3b2415"/><ellipse cx="39" cy="28.5" rx="2.1" ry="2.8" fill="#3b2415"/><circle cx="25.7" cy="27.4" r=".8" fill="#fff"/><circle cx="39.7" cy="27.4" r=".8" fill="#fff"/></g>'+
  '<g class="qcSleep"><path d="M22.5 29Q25 31.5 27.5 29M36.5 29Q39 31.5 41.5 29" fill="none" stroke="#3b2415" stroke-width="1.6" stroke-linecap="round"/></g>'+
  '<path d="M30.2 32.4H33.8L32 34.4Z" fill="#e58a8a"/><path d="M32 34.4V36M32 36Q30.3 37.6 28.6 36.3M32 36Q33.7 37.6 35.4 36.3" fill="none" stroke="#5a3a22" stroke-width="1.1" stroke-linecap="round"/>'+
  '<path d="M18 32L10.5 30.5M18 34.5L10.5 35.5M46 32L53.5 30.5M46 34.5L53.5 35.5" stroke="#5a3a22" stroke-width=".9" stroke-linecap="round" opacity=".55"/>'+
  '<g class="qcAcc qcSakura"><circle cx="43" cy="14.5" r="2" fill="#f9c7d4"/><circle cx="45.6" cy="16.2" r="2" fill="#f9c7d4"/><circle cx="45" cy="19" r="2" fill="#f9c7d4"/><circle cx="41.6" cy="18.4" r="2" fill="#f9c7d4"/><circle cx="41.2" cy="15.4" r="2" fill="#f9c7d4"/><circle cx="43.3" cy="16.9" r="1.2" fill="#f2a65a"/></g>'+
  '<g class="qcAcc qcAki"><path d="M42 13C47 12 49.5 16.5 47.5 20.5C43 20 41 17 42 13Z" fill="#c8431c" stroke="#7a2a10" stroke-width="1"/><path d="M42.5 14.5L46.8 19.6" stroke="#7a2a10" stroke-width=".8"/></g>'+
  '<g class="qcAcc qcSalju"><path d="M20 40Q32 46 44 40L44.5 44Q32 50 19.5 44Z" fill="#d6453d" stroke="#8a2420" stroke-width="1"/><path d="M40 43L42.5 52L46 51L44 43Z" fill="#d6453d" stroke="#8a2420" stroke-width="1" stroke-linejoin="round"/></g>'+
  '<g class="qcAcc qcPanas"><path d="M17 22Q32 14 47 22" fill="none" stroke="#e8c15a" stroke-width="3" stroke-linecap="round"/><path d="M13 22H51" stroke="#d9a93c" stroke-width="3.4" stroke-linecap="round"/><path d="M20 22Q32 8 44 22Z" fill="#f1d27a" stroke="#b88a24" stroke-width="1"/><path d="M20.5 20.5H43.5" stroke="#d6453d" stroke-width="2"/></g>'+
  '<g class="qcAcc qcNightCap"><path d="M19 20Q30 2 46 10Q40 14 46 22Z" fill="#5b6fd6" stroke="#2f3b8a" stroke-width="1"/><path d="M17 21Q32 25 47 21" fill="none" stroke="#e8ecff" stroke-width="3" stroke-linecap="round"/><circle cx="46.5" cy="10" r="2.6" fill="#fff"/><path d="M33 12l1 2 2 .3-1.5 1.4.4 2-1.9-1-1.9 1 .4-2L30 14.3 32 14Z" fill="#ffe27a"/></g>'+
 '</g>'+
 '<g class="qcNite"><path d="M54 3A6 6 0 1 0 54 15A4.8 4.8 0 0 1 54 3Z" fill="#fdf3c0"/><circle class="qcTw" cx="60" cy="20" r="1.1" fill="#fff6c8"/><circle class="qcTw qcTw2" cx="8" cy="8" r="1.2" fill="#fff6c8"/><circle class="qcTw" cx="4" cy="26" r=".9" fill="#fff6c8"/></g></svg>';
var CARSVG='<svg viewBox="0 0 90 44" aria-hidden="true"><path d="M6 30V22Q6 18 11 17L24 16Q28 8 36 8H54Q62 8 66 16L80 18Q86 19 86 25V30Z" fill="#e5484d" stroke="#7a1d22" stroke-width="1.6" stroke-linejoin="round"/><path d="M29 16Q32 11 38 11H50V17Z" fill="#cfeaff" stroke="#7a1d22" stroke-width="1.2"/><path d="M53 11H58Q62 12 64 17H53Z" fill="#cfeaff" stroke="#7a1d22" stroke-width="1.2"/><rect x="80" y="22" width="5" height="4" rx="1.5" fill="#ffe27a"/><rect x="5" y="23" width="4" height="4" rx="1.5" fill="#ff9aa0"/>'+
'<g class="cW" style="transform-origin:24px 32px"><circle cx="24" cy="32" r="8" fill="#2d2d36"/><circle cx="24" cy="32" r="3.2" fill="#c8ccd6"/><path d="M24 25v14M17 32h14" stroke="#8c92a2" stroke-width="1.4"/></g><g class="cW" style="transform-origin:67px 32px"><circle cx="67" cy="32" r="8" fill="#2d2d36"/><circle cx="67" cy="32" r="3.2" fill="#c8ccd6"/><path d="M67 25v14M60 32h14" stroke="#8c92a2" stroke-width="1.4"/></g></svg>';
var BALLSVG='<svg viewBox="0 0 30 30" aria-hidden="true"><g class="bSp"><circle cx="15" cy="15" r="13" fill="#fff" stroke="#3a3a46" stroke-width="1.6"/><path d="M15 6l6 4.4-2.3 7h-7.4L9 10.4Z" fill="#3a3a46"/><path d="M15 6V2M21 10.4l4-1.6M18.7 17.4l2.6 4.4M11.3 17.4l-2.6 4.4M9 10.4L5 8.8" stroke="#3a3a46" stroke-width="1.3"/></g></svg>';
function lv(k){try{var a=JSON.parse(lsGet(k)||'[]');return Array.isArray(a)?a.length:0}catch(e){return 0}}
function ago(ms){var m=Math.round((Date.now()-ms)/60000);if(m<1)return'baru saja';if(m<60)return m+' menit lalu';var h=Math.round(m/60);if(h<24)return h+' jam lalu';return Math.round(h/24)+' hari lalu'}

/* ===== Hari ini (fitur beranda 1, 2, 3, 5; tanpa chip jalur belajar) ===== */
var QH_REG=[
 {w:'sugeng enjing',m:'selamat pagi',l:'Jawa'},
 {w:'sugeng siang',m:'selamat siang',l:'Jawa'},
 {w:'sugeng dalu',m:'selamat malam',l:'Jawa'},
 {w:'matur nuwun',m:'terima kasih',l:'Jawa'},
 {w:'sugeng rawuh',m:'selamat datang',l:'Jawa'},
 {w:'pangapunten',m:'maaf / permisi',l:'Jawa'},
 {w:'wilujeng enjing',m:'selamat pagi',l:'Sunda'},
 {w:'wilujeng siang',m:'selamat siang',l:'Sunda'},
 {w:'wilujeng wengi',m:'selamat malam',l:'Sunda'},
 {w:'hatur nuhun',m:'terima kasih',l:'Sunda'},
 {w:'wilujeng sumping',m:'selamat datang',l:'Sunda'},
 {w:'punten',m:'permisi / maaf',l:'Sunda'},
 {w:'rahajeng semeng',m:'selamat pagi',l:'Bali'},
 {w:'rahajeng tengai',m:'selamat siang',l:'Bali'},
 {w:'rahajeng wengi',m:'selamat malam',l:'Bali'},
 {w:'suksma',m:'terima kasih',l:'Bali'},
 {w:'rahajeng rauh',m:'selamat datang',l:'Bali'},
 {w:'ampura',m:'maaf',l:'Bali'}];
var QH_JA_FALLBACK=[
 {front:'おはよう',read:'ohayou',mean:'selamat pagi',speak:'おはよう',lang:'ja-JP',tag:'Jepang'},
 {front:'こんにちは',read:'konnichiwa',mean:'selamat siang',speak:'こんにちは',lang:'ja-JP',tag:'Jepang'},
 {front:'ありがとう',read:'arigatou',mean:'terima kasih',speak:'ありがとう',lang:'ja-JP',tag:'Jepang'},
 {front:'がんばって',read:'ganbatte',mean:'semangat!',speak:'がんばって',lang:'ja-JP',tag:'Jepang'},
 {front:'すごい',read:'sugoi',mean:'hebat!',speak:'すごい',lang:'ja-JP',tag:'Jepang'},
 {front:'さようなら',read:'sayounara',mean:'selamat tinggal',speak:'さようなら',lang:'ja-JP',tag:'Jepang'}];
function qhDaySeed(){var d=new Date();return d.getFullYear()*372+(d.getMonth()+1)*31+d.getDate()}
function qhTodayKey(){var d=new Date();return d.getFullYear()+'-'+(d.getMonth()+1)+'-'+d.getDate()}
function qhSeeded(arr,seed){var a=arr.slice(),s=seed>>>0,i,j,t;for(i=a.length-1;i>0;i--){s=(s*1664525+1013904223)>>>0;j=s%(i+1);t=a[i];a[i]=a[j];a[j]=t}return a}
function qhSpeak(txt,lang){try{if(!('speechSynthesis' in window))return;window.speechSynthesis.cancel();var u=new SpeechSynthesisUtterance(txt);u.lang=lang||'ja-JP';window.speechSynthesis.speak(u)}catch(e){}}
function qhDailyReg(){return QH_REG[qhDaySeed()%QH_REG.length]}
var qhPoolJA=null;
function qhLoadJA(){
 if(qhPoolJA)return Promise.resolve(qhPoolJA);
 var jobs=[];
 if(!window.N5_KOTOBA)jobs.push(loadScript(DATA_BASE+'n5/n5-kotoba.js'));
 if(!window.KBQ_DATA)jobs.push(loadScript(DATA_BASE+'kanji/kanji-data.js?v=2'));
 return Promise.all(jobs).then(function(){
   var pool=[];
   var L=window.N5_KOTOBA||[];
   L.forEach(function(w){if(w&&w.arti)pool.push({front:w.kanji||w.kana,read:w.kana+' ('+w.romaji+')',mean:w.arti,speak:w.kana,lang:'ja-JP',tag:'Jepang · N5'})});
   var K=(window.KBQ_DATA&&window.KBQ_DATA.KANJI)||[];
   K.forEach(function(r){if((r[0]==='N5'||r[0]==='N4')&&r[1]&&r[4])pool.push({front:r[1],read:String(r[2]).split(',')[0]+(r[3]?' / '+String(r[3]).split(',')[0]:''),mean:r[4],speak:String(r[2]).split(',')[0],lang:'ja-JP',tag:'Kanji · '+r[0]})});
   if(!pool.length)pool=QH_JA_FALLBACK;
   qhPoolJA=pool;return pool;
 }).catch(function(){if(!qhPoolJA)qhPoolJA=QH_JA_FALLBACK;return qhPoolJA});
}
function qhRenderCal(){
 var el=document.getElementById('qhDots');if(!el)return;
 var days={};
 try{var a=JSON.parse(lsGet('qProgressLog')||'[]')||[];a.forEach(function(x){if(x&&x.at){var d=new Date(+x.at);days[d.getFullYear()+'-'+(d.getMonth()+1)+'-'+d.getDate()]=1}})}catch(e){}
 var out='',now=new Date(),i;
 for(i=27;i>=0;i--){var d=new Date(now.getFullYear(),now.getMonth(),now.getDate()-i);var k=d.getFullYear()+'-'+(d.getMonth()+1)+'-'+d.getDate();out+='<i class="qhDot'+(days[k]?' on':'')+(i===0?' today':'')+'" title="'+k+(days[k]?' · ada kuis':'')+'"></i>'}
 el.innerHTML=out;
}
var qhTeachIdx=0;
function qhTeachList(){
 var list=[];
 if(window.qhDailyJA)list.push(window.qhDailyJA);
 if(window.qhDailyReg)list.push(window.qhDailyReg);
 if(!list.length)list=[{front:'おはよう',read:'ohayou',mean:'Selamat pagi'},{front:'sugeng enjing',read:'Jawa',mean:'Selamat pagi'}];
 return list;
}
function qhTeachNext(){var list=qhTeachList();var w=list[qhTeachIdx%list.length];qhTeachIdx++;return w}
var qhChalTimer=0;
function qhFinishChal(score,total,host){
 if(qhChalTimer){clearInterval(qhChalTimer);qhChalTimer=0}
 var today=qhTodayKey();
 if(lsGet('qh_chal_day')!==today){
   lsSet('qh_chal_day',today);
   try{var a=JSON.parse(lsGet('qProgressLog')||'[]')||[];a.push({k:'tantangan-harian',n:'Tantangan 1 menit',s:score,t:total,at:Date.now(),u:0});while(a.length>100)a.shift();lsSet('qProgressLog',JSON.stringify(a))}catch(e){}
   qhRenderCal();
 }
 host.innerHTML='<p class="qhQuizQ">Selesai! Skor kamu <b>'+score+'/'+total+'</b></p><p style="font-size:13px;opacity:.8">Hasilnya tersimpan di riwayat kuis. Tantangan baru tersedia besok.</p><button type="button" class="qhBtn alt" id="qhChalAgain">Main lagi (tanpa simpan skor baru)</button>';
 var ag=document.getElementById('qhChalAgain');if(ag)ag.addEventListener('click',function(){qhStartChal()});
 if(score>=4){mState('wave',2000);say(['すごい','sugoi','Tantangan selesai: '+score+'/'+total+'! Hebat!'])}else{mState('wave',2000);say(['がんばって','ganbatte','Tantangan selesai: '+score+'/'+total+'. Coba lagi besok ya!'])}
}
function qhChalAttempt(){
 var today=qhTodayKey(),n=0;
 try{var raw=lsGet('qh_chal_try');if(raw){var p=JSON.parse(raw);if(p&&p.d===today)n=p.n|0}lsSet('qh_chal_try',JSON.stringify({d:today,n:n+1}))}catch(e){}
 return n;
}
function qhStartChal(){
 var host=document.getElementById('qhChal');if(!host)return;
 if(qhChalTimer){clearInterval(qhChalTimer);qhChalTimer=0}
 host.innerHTML='<p class="qhLoad">Memuat soal…</p>';
 qhLoadJA().then(function(pool){
   var runSeed=qhDaySeed()+qhChalAttempt()*7919;
   var ja=qhSeeded(pool,runSeed+7).slice(0,3);
   var reg=qhSeeded(QH_REG.map(function(r){return{front:r.w,read:r.l,mean:r.m,speak:r.w,lang:'id-ID',tag:r.l}}),runSeed+11).slice(0,2);
   var qs=qhSeeded(ja.concat(reg),runSeed+3);
   var qi=0,score=0,left=60,ended=false;
   var allMeans=[],seen={};
   pool.forEach(function(x){if(x.mean&&!seen[x.mean]){seen[x.mean]=1;allMeans.push(x.mean)}});
   QH_REG.forEach(function(r){if(!seen[r.m]){seen[r.m]=1;allMeans.push(r.m)}});
   function fmt(t){var m=Math.floor(t/60),s=t%60;return m+':'+(s<10?'0':'')+s}
   function renderQ(){
     if(ended)return;
     var q=qs[qi];
     var dist=qhSeeded(allMeans.filter(function(m){return m!==q.mean}),runSeed+qi*13).slice(0,3);
     var opts=qhSeeded([q.mean].concat(dist),runSeed+qi+99);
     var kind=q.tag&&q.tag.indexOf('Kanji')>=0?'kanji':'kata';
     host.innerHTML='<div class="qhQuiz"><div class="qhQuizTop"><span>Soal '+(qi+1)+'/'+qs.length+'</span><span id="qhTime">'+fmt(left)+'</span></div><p class="qhQuizQ">Apa arti '+kind+' “'+esc(q.front)+'”? <small style="opacity:.7;font-weight:400">('+esc(q.tag||'')+')</small></p><div class="qhOpts">'+opts.map(function(o,i){return'<button type="button" class="qhOpt" data-i="'+i+'">'+esc(o)+'</button>'}).join('')+'</div></div>';
     Array.prototype.forEach.call(host.querySelectorAll('.qhOpt'),function(b){
       b.addEventListener('click',function(){
         if(ended)return;
         var ok=b.textContent===q.mean;
         Array.prototype.forEach.call(host.querySelectorAll('.qhOpt'),function(x){x.disabled=true;if(x.textContent===q.mean)x.classList.add('ok');else if(x===b)x.classList.add('no')});
         if(ok)score++;
         setTimeout(function(){qi++;if(qi>=qs.length){ended=true;qhFinishChal(score,qs.length,host)}else renderQ()},650);
       });
     });
   }
   renderQ();
   qhChalTimer=setInterval(function(){
     if(ended){clearInterval(qhChalTimer);qhChalTimer=0;return}
     left--;
     var t=document.getElementById('qhTime');if(t)t.textContent=fmt(Math.max(0,left));
     if(left<=0){ended=true;qhFinishChal(score,qs.length,host)}
   },1000);
 }).catch(function(){host.innerHTML='<p class="qhLoad">Soal belum bisa dimuat. Coba lagi.</p>'});
}
function qhInitHari(){
 var flip=document.getElementById('qhFlip');if(!flip)return;
 qhRenderCal();
 var reg=qhDailyReg();
 window.qhDailyReg={front:reg.w,read:reg.l,mean:reg.m};
 var regEl=document.getElementById('qhReg');if(regEl)regEl.innerHTML='Kata daerah hari ini: <b>'+esc(reg.w)+'</b> ('+esc(reg.l)+') — '+esc(reg.m);
 var doFlip=function(){flip.classList.toggle('flipped')};
 flip.addEventListener('click',doFlip);
 flip.addEventListener('keydown',function(e){if(e.key==='Enter'||e.key===' '){e.preventDefault();doFlip()}});
 var sp=document.getElementById('qhSpeak');if(sp)sp.addEventListener('click',function(e){e.stopPropagation();var w=window.qhDailyJA;if(w)qhSpeak(w.speak,w.lang)});
 qhLoadJA().then(function(pool){
   var w=pool[qhDaySeed()%pool.length];
   window.qhDailyJA={front:w.front,read:w.read,mean:w.mean,speak:w.speak,lang:w.lang};
   var f=document.getElementById('qhCardFront');if(f)f.textContent=w.front;
   var t=document.getElementById('qhCardTag');if(t)t.textContent='Kata hari ini · '+w.tag;
   var t2=document.getElementById('qhCardTag2');if(t2)t2.textContent=w.tag;
   var b=document.getElementById('qhCardBack');if(b)b.textContent=w.read;
   var d=document.getElementById('qhCardDetail');if(d)d.textContent=w.mean;
 });
 var st=document.getElementById('qhChalStart');if(st)st.addEventListener('click',function(){qhStartChal()});
}

function berStats(){
  var LVS=['n5','n4','n3','n2','n1'],T={};try{T=JSON.parse(lsGet('qProgressTotals')||'{}')||{}}catch(e){}
  var d=window.qDaily?window.qDaily.get():{n:0,goal:10,streak:0,best:0,met:false},tot=0,rows='';
  LVS.forEach(function(l){var k=lv(l+'_kotoba_archived_v1'),j=lv(l+'_kanji_archived_v1');tot+=k+j;
    var all=T[l]||0,pct=all?Math.min(100,Math.round(100*k/all)):(k?100:0);
    rows+='<div class="qbLv"><b>'+l.toUpperCase()+'</b><i class="qtBar"><u style="width:'+pct+'%"></u></i><span>'+k+(all?' / '+all:'')+' kotoba'+(j?' · '+j+' kanji':'')+'</span></div>'});
  var log=[];try{log=JSON.parse(lsGet('qProgressLog')||'[]')||[]}catch(e){}
  var lq=log.length?log[log.length-1]:null;
  return{d:d,tot:tot,rows:rows,lq:lq};
}

var BER_TITLE={bushu:'Bushu',jlpt:'JLPT',tg2:'TG2',jawa:'Jawa',sunda:'Sunda',bali:'Bali',kana:'Kana',rambu:'Rambu'};
function stageKind(){var h=new Date().getHours();return h>=6&&h<17?'day':h>=17&&h<19?'dusk':'night'}
var QL={"home": {"order": ["mochi", "berita", "ringkasan"], "off": [], "news": 4}, "traktir": {"url": "https://saweria.co/Bshantoz"}};
function renderBeranda(){
  var s=berStats(),d=s.d,pct=Math.min(100,Math.round(100*d.n/(d.goal||10))),bel=lsGet('qh_bel');
  var cont=bel&&BER_TITLE[bel]?bel:'bushu',sk=stageKind();
  var stars='';if(sk==='night'){for(var i=0;i<26;i++)stars+='<i style="left:'+((i*37+11)%100)+'%;top:'+((i*53+7)%52)+'%;animation-delay:'+((i%7)*.4)+'s"></i>'}
  var B={};B.mochi='<section class="qbHero"><div class="qbStage '+sk+'" id="qbStage"><div class="qbSky">'+stars+'<b class="qbSun"></b><s class="qbCloud c1"></s><s class="qbCloud c2"></s></div><div class="qbHill"></div><div class="qbGround"></div>'+
   '<div class="qbCar" id="qbCar" role="button" aria-label="Mobil mainan">'+CARSVG+'</div><div class="qbBall" id="qbBall" role="button" aria-label="Bola">'+BALLSVG+'</div>'+
   '<div class="mochi" id="qMochi" role="button" tabindex="0" aria-label="Mochi: ketuk untuk menyapa">'+MSVG+'</div><div class="qbBubble" id="qBub"></div><div class="qbHint">Ketuk Mochi, bola, atau mobil</div></div></section>';
  B.ringkasan='<h2 class="qhH">Ringkasan belajar</h2><div class="qbStats">'+
  '<div class="qbSt"><small>Beruntun</small><b>&#128293; '+d.streak+'</b><span>hari'+(d.best?' · terbaik '+d.best:'')+'</span></div>'+
  '<div class="qbSt"><small>Total dihapal</small><b>'+s.tot+'</b><span>kotoba + kanji</span></div>'+
  '<a class="qbSt qtKj" href="/p/materi-dan-kuis-kanji-metode-bushu.html" data-qt="kj"><small>今日の漢字 Kanji hari ini</small><b>·</b><span>Memuat...</span></a>'+
  '<button type="button" class="qbSt qtGl" data-qt="gl" aria-label="Ganti target harian"><small>Target hari ini</small><b>'+d.n+' / '+d.goal+'</b><span>'+(d.met?'Tercapai! すごい':'kartu dihapal')+'</span><i class="qtBar"><u style="width:'+pct+'%"></u></i></button></div>'+
  '<div class="qbAct"><button type="button" class="qhBtn" data-go="'+cont+'">Lanjut belajar &middot; '+BER_TITLE[cont]+'</button><button type="button" class="qhBtn alt" data-go="game">Main game</button></div>'+
  '<div class="qbRiw">'+s.rows+(s.lq&&s.lq.t>0?'<p class="qbLast">Kuis terakhir: <b>'+s.lq.s+'/'+s.lq.t+'</b>'+(s.lq.at?' &middot; '+ago(+s.lq.at):'')+'</p>':'<p class="qbLast">Belum ada riwayat kuis. Ayo coba satu!</p>')+'</div>';
  B.berita='<h2 class="qhH">Berita terbaru</h2><div class="qGrid qbNews" id="qbNews"><p class="qhLoad">Memuat...</p></div>';
  B.hariini='<h2 class="qhH">Hari ini</h2><div class="qhHari">'+
  '<div class="qhFlip" id="qhFlip" role="button" tabindex="0" aria-label="Kartu kata hari ini, ketuk untuk membalik"><div class="qhFlipIn"><div class="qhFace"><small id="qhCardTag">Memuat…</small><b id="qhCardFront">·</b><span>Ketuk untuk membalik</span></div><div class="qhFace qhBack"><small id="qhCardTag2"></small><b id="qhCardBack"></b><span id="qhCardDetail"></span><button type="button" class="qhSpeak" id="qhSpeak" aria-label="Dengarkan pelafalan">Dengarkan</button></div></div></div>'+
  '<p class="qhReg" id="qhReg"></p>'+
  '<div class="qhChal" id="qhChal"><button type="button" class="qhBtn" id="qhChalStart">Mulai tantangan 1 menit</button><span class="qhChalNote">5 soal · 60 detik</span></div>'+
  '<div class="qhCal"><small>Kuis tercatat · 28 hari terakhir</small><div class="qhDots" id="qhDots"></div></div></div>';
  var LH=(typeof QL!=='undefined'&&QL.home)||{order:['mochi','ringkasan','berita'],off:[],news:4},h='',hariDone=false;(LH.order||['mochi','ringkasan','berita']).forEach(function(k){if(B[k]&&(LH.off||[]).indexOf(k)<0){h+=B[k];if(k==='ringkasan'){h+=B.hariini;hariDone=true}}});if(!hariDone)h+=B.hariini;
  berEl.innerHTML=h;
  try{showGoal();loadKanji()}catch(e){}
  loadPosts(function(){var rows=postRows().slice(0,(typeof QL!=='undefined'&&QL.home&&QL.home.news)||4);var n=document.getElementById('qbNews');if(n)n.innerHTML=rows.map(function(x){return cardHtml(x)}).join('')});
  mochiInit(s);
  try{qhInitHari()}catch(e){}
}
var mTimer=0,mBusy=false,mx=8;
function sapa(){var h=new Date().getHours();
  if(h<4)return['こんばんは','konbanwa','Selamat malam'];
  if(h<11)return['おはよう','ohayou','Selamat pagi'];
  if(h<17)return['こんにちは','konnichiwa','Selamat siang'];
  return['こんばんは','konbanwa','Selamat malam']}
function mLines(s){var g=sapa(),d=s.d,h=new Date().getHours(),L=[
  [g[0],g[1],g[2]+'! Aku Mochi, temani belajarmu.'],
  ['がんばって','ganbatte','Semangat! Sedikit tiap hari lebih awet.'],
  ['すごい','sugoi',d.n?'Hari ini sudah '+d.n+' kartu. Keren!':'Belum ada kartu hari ini. Mulai yuk!'],
  ['やった','yatta',d.streak?'Beruntun '+d.streak+' hari. Jangan putus ya!':'Mulai hari pertama streak-mu sekarang.']];
  if(h<4)L.push(['もう遅いよ','mou osoi yo','Sudah lewat tengah malam. Jangan lupa istirahat ya.']);
  return L}
function getWStock(){try{var v=localStorage.getItem('mochi_w_stock');return v!==null?parseInt(v,10)||0:3}catch(e){return 3}}
function setWStock(n){try{localStorage.setItem('mochi_w_stock',String(Math.max(0,n)))}catch(e){}}
function traktirUrl(){return (typeof QL!=='undefined'&&QL.traktir&&QL.traktir.url)||'https://saweria.co/Bshantoz'}
window.feedWhiskas=function(e){if(e){e.stopPropagation();e.preventDefault()}
  var n=getWStock();
  if(n>0){setWStock(n-1);mState('purr',2000);if(window.qcat&&window.qcat.meow)window.qcat.meow();say(['おいしい！','oishii!','Nyam nyam! Whiskas-nya enak banget! 🐟'])}
  else{window.open(traktirUrl(),'_blank','noopener')}};
function say(l){var b=document.getElementById('qBub');if(!b)return;var n=getWStock();
  b.innerHTML='<b>'+l[0]+'</b> <small>'+l[1]+'</small><p>'+l[2]+'</p><button type="button" class="mWhiskasBtn'+(n>0?'':' empty')+'" onclick="feedWhiskas(event)">'+(n>0?'Beri Whiskas ('+n+') 🐟':'Whiskas habis! Traktir Mochi 🐟')+'</button>';b.classList.add('on')}
function mEl(){return document.getElementById('qMochi')}
function mState(c,ms){var m=mEl();if(!m)return;m.className='mochi '+c;if(ms)setTimeout(function(){if(m.className==='mochi '+c)m.className='mochi'},ms)}
function mGo(x,cb){var st=document.getElementById('qbStage'),m=mEl();if(!st||!m){return}
  var max=st.clientWidth-m.offsetWidth-6;x=Math.max(4,Math.min(max,x));var dist=Math.abs(x-mx);
  if(dist<6){if(cb)cb();return}
  var dur=Math.max(.5,dist/170);m.style.setProperty('--dir',x<mx?'-1':'1');m.style.transition='left '+dur+'s linear';m.className='mochi run';m.style.left=x+'px';mx=x;
  setTimeout(function(){m.style.setProperty('--dir','1');if(m.className==='mochi run')m.className='mochi';if(cb)cb()},dur*1000+30)}
function ballEl(){return document.getElementById('qbBall')}
function bx(){var b=ballEl();return b?parseFloat(b.style.left||'150'):150}
function kick(){var st=document.getElementById('qbStage'),b=ballEl(),m=mEl();if(!st||!b||!m||mBusy)return;mBusy=true;
  var from=bx(),W=st.clientWidth,to=Math.max(20,Math.min(W-40,from<W/2?from+W*.45:from-W*.45)),side=to>from?-1:1;
  document.getElementById('qBub').classList.remove('on');
  mGo(from+side*46,function(){var mm=mEl();mm.className='mochi kick';mm.style.setProperty('--dir',to>from?'1':'-1');
    setTimeout(function(){b.className='qbBall fly';b.style.transition='left 1.1s cubic-bezier(.2,.7,.3,1)';b.style.left=to+'px';
      say(['シュート','shuuto','Gol! Tendangan Mochi!']);
      setTimeout(function(){b.className='qbBall';mm.style.setProperty('--dir','1');mm.className='mochi';
        mGo(to-side*46,function(){mState('wave',1800);mBusy=false})},1200)},330)})}
function drive(){var car=document.getElementById('qbCar'),st=document.getElementById('qbStage');if(!car||!st||car.className.indexOf('go')>=0)return;
  var W=st.clientWidth;car.style.transition='none';car.style.left='-96px';void car.offsetWidth;car.className='qbCar go';car.style.transition='left 4.6s linear';car.style.left=(W+20)+'px';
  say(['ブーブー','buu buu','Beep beep! Ada mobil lewat.']);if(!mBusy)mState('wave',2200);
  setTimeout(function(){car.className='qbCar';car.style.transition='none';car.style.left='-96px'},4800)}
function mochiInit(s){
  clearInterval(mTimer);mBusy=false;mx=8;var m=mEl(),L=mLines(s),i=0;if(!m)return;
  var b=ballEl();b.style.left=Math.round(document.getElementById('qbStage').clientWidth*.62)+'px';
  say(L[0]);mState('wave',2200);
  var next=function(){i=(i+1)%L.length;say(L[i])};
  var tapNo=0;
  var tap=function(){if(mBusy)return;tapNo++;if(tapNo%2===1&&m.className.indexOf('wave')<0){var w=qhTeachNext();if(w){say([w.front,w.read,w.mean]);mState('wave',2000);return}}if(m.className.indexOf('wave')>=0){mBusy=true;document.getElementById('qBub').classList.remove('on');mGo(mx>100?8:document.getElementById('qbStage').clientWidth-130,function(){mState('wave',1600);next();mBusy=false});return}next();mState('wave',2000)};
  m.addEventListener('click',tap);m.addEventListener('keydown',function(e){if(e.key==='Enter'||e.key===' '){e.preventDefault();tap()}});
  ballEl().addEventListener('click',kick);document.getElementById('qbCar').addEventListener('click',drive);
  var acts=['sit','wave','kick','stand','car','run'],n=0;
  mTimer=setInterval(function(){if(!mEl()||panes.beranda.hidden||mBusy)return;var a=acts[n++%acts.length];
    if(a==='kick')kick();else if(a==='car')drive();else if(a==='run'){mBusy=true;var st=document.getElementById('qbStage');mGo(mx>100?8:st.clientWidth-130,function(){mState('wave',1600);next();mBusy=false})}
    else{mState(a,2600);if(a==='wave')next()}},6500);
}
function showBeranda(){renderBeranda();document.title='Qategori'}
var first=true;
function show(){
  var r=parse();
  PANES.forEach(function(id){panes[id].hidden=id!==r.tab});
  document.body.classList.toggle('qBer',r.tab==='beranda');
  var act=BEL.indexOf(r.tab)>=0?'belajar':r.tab;
  document.querySelectorAll('a[data-tab]').forEach(function(a){a.classList.toggle('on',a.getAttribute('data-tab')===act)});
  if(BEL.indexOf(r.tab)>=0){lsSet('qh_bel',r.tab);panes[r.tab].querySelectorAll('.qhSeg button').forEach(function(b){b.setAttribute('aria-pressed',b.getAttribute('data-go').split('-')[0]===r.tab?'true':'false')})}
  if(r.tab!=='game'&&r.tab!=='kana')stopT();
  if(r.tab!=='game')closePlay();
  var T={beranda:'Qategori',bushu:'Bushu',jlpt:'Materi JLPT',tg2:'Materi TG2',jawa:'Bahasa Jawa',sunda:'Bahasa Sunda',bali:'Bahasa Bali',kana:'Hapalan Kana',rambu:'Rambu-rambu Jepang',podcast:'Podcast',game:'Game',berita:'Berita',terjemah:'Terjemah Video'};
  document.title=(T[r.tab]||'')+' | Qategori';
  if(r.tab==='game')showGame(r.sub);
  else if(r.tab==='terjemah')showTerjemah(r);
  else if(r.tab==='kana')showKana(r.sub);
  else if(r.tab==='berita'){showBerita(r.qs)}
  else if(r.tab==='beranda'){showBeranda();var mh=mEl();if(mh){mh.classList.add('qcHop');setTimeout(function(){mh.classList.remove('qcHop')},700)}}
  else mount(r.tab,r.sub?r.tab+'-'+r.sub:r.tab);
  if(r.tab!=='berita'&&readKey){readKey='';document.title=document.title}
  if(r.tab==='bushu'){var bq=new URLSearchParams(r.qs);if(bq.get('q')||bq.get('tab')){var ap=function(){if(window.kbqOpen)window.kbqOpen(bq.get('q')||'',bq.get('tab')||'asal')};if(mounted.bushu&&document.getElementById('kuis-kanji'))setTimeout(ap,50);else panes.bushu.__after=ap}}
  if(r.tab==='jlpt'){var jq=new URLSearchParams(r.qs);if(jq.get('q')){var jqq=jq.get('q'),jqt=jq.get('tab')||'daftar',jap=function(){var n=0,iv=setInterval(function(){n++;var pn=panes.jlpt,btn=pn.querySelector('button[data-panel="'+jqt+'"]'),inp=pn.querySelector('#daftarSearch'),bd=pn.querySelector('#daftarBody'),sel=pn.querySelector('#daftarKategori');if(btn&&inp&&bd&&(bd.children.length||(sel&&sel.options.length>1))){clearInterval(iv);btn.click();inp.value=jqq;inp.dispatchEvent(new Event('input',{bubbles:true}));setTimeout(function(){var pp=pn.querySelector('#panel-'+jqt);if(pp)pp.scrollIntoView({block:'start'})},150)}if(n>48)clearInterval(iv)},250)};if(mounted.jlpt)setTimeout(jap,60);else panes.jlpt.__after=jap}}
  if(r.tab==='podcast'){var pc=function(){var pn=panes.podcast,bd=pn.querySelector('.qhBody');if(bd&&bd.children.length&&!pn.querySelector('#qtCard')){var dv=document.createElement('div');dv.id='qtCard';dv.className='qtCard';dv.innerHTML='<b>🎬 Terjemah Video</b><span>Putar video YouTube sambil membaca subtitle bahasa Jepang + terjemahan Indonesianya.</span><button type="button" class="qhBtn" data-go="terjemah">Buka Terjemah Video</button>';bd.insertBefore(dv,bd.firstChild)}};if(mounted.podcast)setTimeout(pc,120);else panes.podcast.__after=function(){setTimeout(pc,120)}}
  first=false;
}
/* navigasi atas/bawah */
document.addEventListener('click',function(e){
  var a=e.target.closest&&e.target.closest('a[data-tab],.qLogo');
  if(a&&!e.defaultPrevented&&!e.button&&!e.metaKey&&!e.ctrlKey){e.preventDefault();go(a.classList.contains('qLogo')?'beranda':a.getAttribute('data-tab'));window.scrollTo(0,0);return}
});
window.qhGo=go;
window.addEventListener('hashchange',function(){closeAll();show()});

/* rambu: chip kategori -> dropdown */
function rbSel(){var pn=panes.rambu;if(!pn)return;
  [].slice.call(pn.querySelectorAll('#rbapp .chips')).forEach(function(c){
    var sel=c.nextElementSibling&&c.nextElementSibling.classList.contains('qSel')?c.nextElementSibling:null;
    if(!sel){sel=document.createElement('select');sel.className='qSel';sel.setAttribute('aria-label','Pilih kategori');c.parentNode.insertBefore(sel,c.nextSibling);
      sel.addEventListener('change',function(){var ch=c.querySelectorAll('.chip')[sel.selectedIndex];if(ch)ch.click()})}
    var ch=[].slice.call(c.querySelectorAll('.chip')),on=0;ch.forEach(function(x,i){if(x.classList.contains('on'))on=i});
    var sig=ch.map(function(x){return x.textContent}).join('|')+'#'+on;
    if(sel.__sig!==sig){sel.__sig=sig;sel.innerHTML=ch.map(function(x){var o=document.createElement('option');o.textContent=x.textContent;return o.outerHTML}).join('');sel.selectedIndex=on}
  })}
if(panes.rambu){var rbT;new MutationObserver(function(){clearTimeout(rbT);rbT=setTimeout(rbSel,60)}).observe(panes.rambu,{childList:true,subtree:true,attributes:true,attributeFilter:['class']})}
show();
})();


/* ===== PWA: daftarkan service worker + petunjuk pasang khusus iPhone/iPad ===== */
(function(){
  if('serviceWorker' in navigator){
    window.addEventListener('load',function(){
      navigator.serviceWorker.register('/sw.js').catch(function(){});
    });
  }
  try{
    var ua=navigator.userAgent||'';
    var ios=/iphone|ipad|ipod/i.test(ua)||(navigator.platform==='MacIntel'&&navigator.maxTouchPoints>1);
    if(!ios) return;
    if(window.navigator.standalone) return;
    if(window.matchMedia&&window.matchMedia('(display-mode: standalone)').matches) return;
    if(!/safari/i.test(ua)||/crios|fxios|edgios|opios/i.test(ua)) return;
    if(localStorage.getItem('qIosHintOff')) return;
    setTimeout(function(){
      if(document.querySelector('.qIosHint')) return;
      var d=document.createElement('div');
      d.className='qIosHint';
      d.innerHTML='<div class="qIosHintT"><b>Pasang Qategori di layar utama</b><span>Ketuk tombol <b>Bagikan</b> di Safari, lalu pilih <b>&ldquo;Tambah ke Layar Utama&rdquo;</b> &mdash; tampilannya jadi seperti aplikasi dan materi bisa dibuka offline.</span></div><button type="button" class="qIosHintX" aria-label="Tutup">&#10005;</button>';
      d.querySelector('.qIosHintX').addEventListener('click',function(){
        try{localStorage.setItem('qIosHintOff','1')}catch(e){}
        d.remove();
      });
      document.body.appendChild(d);
    },1500);
  }catch(e){}


})();

/* Nav dinamis ala X: gulir ke bawah = header sembunyi + nav bawah kaca;
   gulir ke atas / dekat puncak = header tampil + nav bawah pekat lagi. */
(function(){
  var lastY = window.scrollY || 0, tick = false;
  function blocked(){
    return document.querySelector('#forNav:checked,#forJepang:checked,#forProfil:checked,#forBook:checked,#forShare:checked')
      || document.body.classList.contains('qmOpen') || document.body.classList.contains('qSrh');
  }
  function upd(){
    tick = false;
    var y = window.scrollY || 0, de = document.documentElement;
    if (blocked()) { de.classList.remove('qScDown'); lastY = y; return; }
    if (y > 140 && y > lastY + 4) de.classList.add('qScDown');
    else if (y < lastY - 4 || y <= 60) de.classList.remove('qScDown');
    lastY = y;
  }
  window.addEventListener('scroll', function(){ if (!tick) { tick = true; requestAnimationFrame(upd); } }, {passive: true});
})();

/* Persetujuan cookie — dulu widget Blogger "Cookie consent", tidak terbawa
   saat pindah ke situs statis. Tampilan memakai CSS tema .nJ.cookie yang
   memang sudah ada di base.css; di sini markup + logikanya dipulihkan. */
(function(){
  try{
    if(document.cookie.indexOf('qCookieConsent=1')>-1) return;
    try{ if(localStorage.getItem('qCookieConsent')==='1') return; }catch(e){}
    if(document.querySelector('.nJ.cookie')) return;
    var d=document.createElement('div'); d.className='nJ cookie';
    d.innerHTML='<p><span class="opacity">Kami menggunakan cookie untuk memahami bagaimana Anda menggunakan situs kami dan meningkatkan pengalaman Anda. Ini termasuk konten dan iklan yang dipersonalisasi...</span> <a class="extL opacity" aria-label="Pelajari" data-text="Pelajari" href="/p/privacy-policy.html" rel="noreferrer" target="_blank">Pelajari</a></p><div class="flex ft"><span class="acc">Terima</span></div>';
    document.body.appendChild(d);
    d.querySelector('.acc').addEventListener('click',function(){
      var exp=new Date(Date.now()+30*24*60*60*1000).toUTCString();
      document.cookie='qCookieConsent=1; expires='+exp+'; path=/; SameSite=Lax';
      try{ localStorage.setItem('qCookieConsent','1'); }catch(e){}
      d.classList.add('hidden');
    });
  }catch(e){}
})();
