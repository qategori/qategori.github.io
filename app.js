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
var PANES=['bushu','jlpt','tg2','jawa','sunda','bali','kana','rambu','podcast','game','berita'];
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
  var rt=routeFor(u);if(!rt)return;
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
  if(!panes[tab]){tab='bushu';sub=''}
  if(tab==='game'&&!GAMES.some(function(g){return g.id===sub}))sub='';
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
    '<a class="qtTile qtKj" href="/p/materi-dan-kuis-kanji-metode-bushu.html" data-qt="kj"><small>今日の漢字 Kanji hari ini</small><b>·</b><span>Memuat...</span></a>' +
    '<button type="button" class="qtTile qtGl" data-qt="gl" aria-label="Ganti target harian"><small>Target hari ini</small><b>0 / 10</b><span></span></button>';
  panes.berita.insertBefore(todayEl, listEl);
  function q(k){ return todayEl.querySelector('[data-qt="' + k + '"]'); }
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
      if (!pool.length) { q('kj').querySelector('span').textContent = 'Belum bisa dimuat'; return; }
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
  todayEl.addEventListener('click', function(e){
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
    if(kt.length)h+='<h4>Kotoba JLPT</h4><div class="qhHL">'+kt.map(function(p){var w=p[1];return'<a class="qhHit" href="'+P+'materi-jlpt-'+p[0]+'.html"><b>'+esc(w.kanji||w.kana)+'</b><span>'+esc(p[0].toUpperCase())+' '+esc(w.kana)+' ('+esc(w.romaji)+') - '+esc(w.arti)+'</span></a>'}).join('')+'</div>';
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
  var g=e.target.closest&&e.target.closest('[data-go]');if(g){e.preventDefault();go(g.getAttribute('data-go'));window.scrollTo(0,0);return}
  var r=e.target.closest&&e.target.closest('[data-retry]');if(r){mounted[PANES.filter(function(p){return panes[p].contains(r)})[0]]=null;show();}
});
var first=true;
function show(){
  var r=parse();
  PANES.forEach(function(id){panes[id].hidden=id!==r.tab});
  var act=BEL.indexOf(r.tab)>=0?'belajar':r.tab;
  document.querySelectorAll('a[data-tab]').forEach(function(a){a.classList.toggle('on',a.getAttribute('data-tab')===act)});
  if(BEL.indexOf(r.tab)>=0){lsSet('qh_bel',r.tab);panes[r.tab].querySelectorAll('.qhSeg button').forEach(function(b){b.setAttribute('aria-pressed',b.getAttribute('data-go').split('-')[0]===r.tab?'true':'false')})}
  if(r.tab!=='game'&&r.tab!=='kana')stopT();
  var T={bushu:'Bushu',jlpt:'Materi JLPT',tg2:'Materi TG2',jawa:'Bahasa Jawa',sunda:'Bahasa Sunda',bali:'Bahasa Bali',kana:'Hapalan Kana',rambu:'Rambu-rambu Jepang',podcast:'Podcast',game:'Game',berita:'Berita'};
  document.title=(T[r.tab]||'')+' | Qategori';
  if(r.tab==='game')showGame(r.sub);
  else if(r.tab==='kana')showKana();
  else if(r.tab==='berita'){showBerita(r.qs)}
  else mount(r.tab,r.sub?r.tab+'-'+r.sub:r.tab);
  if(r.tab!=='berita'&&readKey){readKey='';document.title=document.title}
  if(r.tab==='bushu'){var bq=new URLSearchParams(r.qs);if(bq.get('q')||bq.get('tab')){var ap=function(){if(window.kbqOpen)window.kbqOpen(bq.get('q')||'',bq.get('tab')||'asal')};if(mounted.bushu&&document.getElementById('kuis-kanji'))setTimeout(ap,50);else panes.bushu.__after=ap}}
  first=false;
}
/* navigasi atas/bawah */
document.addEventListener('click',function(e){
  var a=e.target.closest&&e.target.closest('a[data-tab],.qLogo');
  if(a&&!e.defaultPrevented&&!e.button&&!e.metaKey&&!e.ctrlKey){e.preventDefault();go(a.classList.contains('qLogo')?'bushu':a.getAttribute('data-tab'));window.scrollTo(0,0);return}
});
window.qhGo=go;
window.addEventListener('hashchange',function(){closeAll();show()});

show();
})();

