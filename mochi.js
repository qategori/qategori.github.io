/* Mochi AI — panel chat mandiri (Cloudflare Worker -> Gemini).
   Sengaja berdiri sendiri (tidak di dalam app.js) supaya selalu jalan. */
(function(){
  'use strict';
  var API = 'https://mochi-ai.bshantoz.workers.dev/chat';
  var HEAD = "<svg class=\"qmHeadSvg\" xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"13 0 38 38\" aria-hidden=\"true\"><ellipse class=\"mShadow\" cx=\"32\" cy=\"62.5\" rx=\"15\" ry=\"2.2\" fill=\"rgba(0,0,0,.18)\"/><g class=\"qcTail\"><path d=\"M45 54C58 54 60 40 54 34\" fill=\"none\" stroke=\"#5a3a22\" stroke-width=\"7\" stroke-linecap=\"round\"/><path d=\"M45 54C58 54 60 40 54 34\" fill=\"none\" stroke=\"#f2a65a\" stroke-width=\"4.6\" stroke-linecap=\"round\"/></g><ellipse cx=\"32\" cy=\"50\" rx=\"16\" ry=\"12.5\" fill=\"#f2a65a\" stroke=\"#5a3a22\" stroke-width=\"1.6\"/><ellipse cx=\"32\" cy=\"53\" rx=\"8.5\" ry=\"8\" fill=\"#fff3e0\"/><ellipse cx=\"25\" cy=\"59.5\" rx=\"5\" ry=\"3\" fill=\"#fff3e0\" stroke=\"#5a3a22\" stroke-width=\"1.3\"/><ellipse cx=\"39\" cy=\"59.5\" rx=\"5\" ry=\"3\" fill=\"#fff3e0\" stroke=\"#5a3a22\" stroke-width=\"1.3\"/><g class=\"qcHead\"><g class=\"qcEarL\"><path d=\"M17.5 24L19 7.5L31 17.5Z\" fill=\"#f2a65a\" stroke=\"#5a3a22\" stroke-width=\"1.6\" stroke-linejoin=\"round\"/><path d=\"M21 19L21.6 12.5L26.5 17Z\" fill=\"#f7b6b6\"/></g><g class=\"qcEarR\"><path d=\"M46.5 24L45 7.5L33 17.5Z\" fill=\"#f2a65a\" stroke=\"#5a3a22\" stroke-width=\"1.6\" stroke-linejoin=\"round\"/><path d=\"M43 19L42.4 12.5L37.5 17Z\" fill=\"#f7b6b6\"/></g><ellipse cx=\"32\" cy=\"29\" rx=\"16\" ry=\"13.5\" fill=\"#f2a65a\" stroke=\"#5a3a22\" stroke-width=\"1.6\"/><path d=\"M32 16.5V21M27 17.5L28 21M37 17.5L36 21\" stroke=\"#c9772e\" stroke-width=\"1.6\" stroke-linecap=\"round\"/><ellipse cx=\"32\" cy=\"34\" rx=\"7.5\" ry=\"5.2\" fill=\"#fff3e0\"/><g class=\"qcEyes\"><ellipse cx=\"25\" cy=\"28.5\" rx=\"2.1\" ry=\"2.8\" fill=\"#3b2415\"/><ellipse cx=\"39\" cy=\"28.5\" rx=\"2.1\" ry=\"2.8\" fill=\"#3b2415\"/><circle cx=\"25.7\" cy=\"27.4\" r=\".8\" fill=\"#fff\"/><circle cx=\"39.7\" cy=\"27.4\" r=\".8\" fill=\"#fff\"/></g><g class=\"qcSleep\"><path d=\"M22.5 29Q25 31.5 27.5 29M36.5 29Q39 31.5 41.5 29\" fill=\"none\" stroke=\"#3b2415\" stroke-width=\"1.6\" stroke-linecap=\"round\"/></g><path d=\"M30.2 32.4H33.8L32 34.4Z\" fill=\"#e58a8a\"/><path d=\"M32 34.4V36M32 36Q30.3 37.6 28.6 36.3M32 36Q33.7 37.6 35.4 36.3\" fill=\"none\" stroke=\"#5a3a22\" stroke-width=\"1.1\" stroke-linecap=\"round\"/><path d=\"M18 32L10.5 30.5M18 34.5L10.5 35.5M46 32L53.5 30.5M46 34.5L53.5 35.5\" stroke=\"#5a3a22\" stroke-width=\".9\" stroke-linecap=\"round\" opacity=\".55\"/><g class=\"qcAcc qcSakura\"><circle cx=\"43\" cy=\"14.5\" r=\"2\" fill=\"#f9c7d4\"/><circle cx=\"45.6\" cy=\"16.2\" r=\"2\" fill=\"#f9c7d4\"/><circle cx=\"45\" cy=\"19\" r=\"2\" fill=\"#f9c7d4\"/><circle cx=\"41.6\" cy=\"18.4\" r=\"2\" fill=\"#f9c7d4\"/><circle cx=\"41.2\" cy=\"15.4\" r=\"2\" fill=\"#f9c7d4\"/><circle cx=\"43.3\" cy=\"16.9\" r=\"1.2\" fill=\"#f2a65a\"/></g><g class=\"qcAcc qcAki\"><path d=\"M42 13C47 12 49.5 16.5 47.5 20.5C43 20 41 17 42 13Z\" fill=\"#c8431c\" stroke=\"#7a2a10\" stroke-width=\"1\"/><path d=\"M42.5 14.5L46.8 19.6\" stroke=\"#7a2a10\" stroke-width=\".8\"/></g><g class=\"qcAcc qcSalju\"><path d=\"M20 40Q32 46 44 40L44.5 44Q32 50 19.5 44Z\" fill=\"#d6453d\" stroke=\"#8a2420\" stroke-width=\"1\"/><path d=\"M40 43L42.5 52L46 51L44 43Z\" fill=\"#d6453d\" stroke=\"#8a2420\" stroke-width=\"1\" stroke-linejoin=\"round\"/></g><g class=\"qcAcc qcPanas\"><path d=\"M17 22Q32 14 47 22\" fill=\"none\" stroke=\"#e8c15a\" stroke-width=\"3\" stroke-linecap=\"round\"/><path d=\"M13 22H51\" stroke=\"#d9a93c\" stroke-width=\"3.4\" stroke-linecap=\"round\"/><path d=\"M20 22Q32 8 44 22Z\" fill=\"#f1d27a\" stroke=\"#b88a24\" stroke-width=\"1\"/><path d=\"M20.5 20.5H43.5\" stroke=\"#d6453d\" stroke-width=\"2\"/></g><g class=\"qcAcc qcNightCap\"><path d=\"M19 20Q30 2 46 10Q40 14 46 22Z\" fill=\"#5b6fd6\" stroke=\"#2f3b8a\" stroke-width=\"1\"/><path d=\"M17 21Q32 25 47 21\" fill=\"none\" stroke=\"#e8ecff\" stroke-width=\"3\" stroke-linecap=\"round\"/><circle cx=\"46.5\" cy=\"10\" r=\"2.6\" fill=\"#fff\"/><path d=\"M33 12l1 2 2 .3-1.5 1.4.4 2-1.9-1-1.9 1 .4-2L30 14.3 32 14Z\" fill=\"#ffe27a\"/></g></g><g class=\"qcNite\"><path d=\"M54 3A6 6 0 1 0 54 15A4.8 4.8 0 0 1 54 3Z\" fill=\"#fdf3c0\"/><circle class=\"qcTw\" cx=\"60\" cy=\"20\" r=\"1.1\" fill=\"#fff6c8\"/><circle class=\"qcTw qcTw2\" cx=\"8\" cy=\"8\" r=\"1.2\" fill=\"#fff6c8\"/><circle class=\"qcTw\" cx=\"4\" cy=\"26\" r=\".9\" fill=\"#fff6c8\"/></g></svg>";
  window.__qmHead = HEAD;
  /* Gaya panel ditanam di sini juga: sebagian peramban dalam aplikasi (mis. TikTok)
     memakai salinan site.css lama dari cache, yang membuat panel tampil tanpa CSS.
     Dengan gaya sendiri ini panel selalu tampil benar di mana pun mochi.js termuat. */
  try{ if(!document.getElementById('qmCss')){ var st=document.createElement('style'); st.id='qmCss'; st.textContent="/* ===== Mochi AI: tombol, avatar kepala beranimasi, panel chat ===== */\n.qProfTop{display:none!important}\n@media(max-width:896px){.headB .qProfTop{display:flex!important;align-items:center;cursor:pointer}}\n.qBottom .qmBtn .qmAv{display:flex;align-items:center;justify-content:center;width:45px;height:45px;border-radius:50%;background:var(--themeBg-alt);border:2px solid var(--themeLink);overflow:hidden;margin-top:-16px;box-shadow:0 5px 14px rgba(0,0,0,.35);animation:none}\n.qBottom .qmBtn .qmAv svg{width:41px;height:41px;display:block}\n#qnvBar [data-k=\"mochi\"] svg{width:30px;height:30px;fill:initial;stroke:none}\n.qmQnvAv{display:flex;align-items:center;justify-content:center;width:34px;height:34px;border-radius:50%;background:var(--themeBg-alt);border:2px solid var(--themeLink);overflow:hidden;flex:0 0 auto}\n.qmAvS{border-radius:50%;overflow:hidden}\n.qmHeadSvg{overflow:visible}\n.qmHeadSvg .qcHead{transform-box:fill-box;transform-origin:50% 85%;animation:qmSway 3.4s ease-in-out infinite}\n.qmHeadSvg .qcEyes{transform-box:fill-box;transform-origin:center;animation:qmBlink 4.8s infinite}\n@keyframes qmBob{0%,100%{transform:translateY(0)}50%{transform:translateY(-2.5px)}}\n@keyframes qmSway{0%,100%{transform:rotate(-2deg)}50%{transform:rotate(2.2deg)}}\n@keyframes qmBlink{0%,92%,100%{transform:scaleY(1)}95%{transform:scaleY(.1)}}\n@media (prefers-reduced-motion:reduce){.qmHeadSvg .qcHead,.qmHeadSvg .qcEyes,.qBottom .qmBtn .qmAv{animation:none}}\nbody.qmOpen{overflow:hidden}\n.qmWrap{position:fixed;inset:0;z-index:95;visibility:hidden}\n.qmOverlay{position:absolute;inset:0;background:rgba(10,10,25,.5);opacity:0;transition:opacity .25s}\n.qmPanel{position:absolute;left:0;right:0;bottom:0;max-height:86dvh;display:flex;flex-direction:column;background:var(--themeBg,#fff);color:var(--themeC,#0e2045);border-radius:22px 22px 0 0;box-shadow:0 -12px 40px rgba(0,0,0,.3);transform:translateY(103%);transition:transform .28s ease;font:14px/1.55 var(--fontBody,'Noto Sans',sans-serif)}\nbody.qmOpen .qmWrap{visibility:visible}\nbody.qmOpen .qmOverlay{opacity:1}\nbody.qmOpen .qmPanel{transform:none}\n@media(min-width:897px){.qmPanel{left:auto;right:16px;bottom:16px;width:430px;max-width:calc(100vw - 32px);max-height:min(660px,88dvh);border-radius:22px}}\n.qmHead{display:flex;align-items:center;gap:10px;padding:12px 14px;border-bottom:1px solid var(--themeBd-color)}\n.qmAvB{width:44px;height:44px;border-radius:50%;background:var(--themeBg-alt);display:flex;align-items:center;justify-content:center;overflow:hidden;flex:0 0 auto}\n.qmAvB svg{width:41px;height:41px}\n.qmHeadT{display:flex;flex-direction:column;line-height:1.25}\n.qmHeadT small{opacity:.65;font-size:12px}\n.qmX{margin-left:auto;border:0;background:var(--themeBg-alt);color:inherit;width:34px;height:34px;border-radius:50%;cursor:pointer;font-size:15px;flex:0 0 auto}\n.qmMsgs{overflow-y:auto;padding:14px;display:flex;flex-direction:column;gap:10px;min-height:180px}\n.qmRow{display:flex;gap:7px;align-items:flex-end;max-width:94%}\n.qmRow.me{align-self:flex-end}\n.qmAvS{width:26px;height:26px;flex:0 0 auto}\n.qmAvS svg{width:26px;height:26px;display:block}\n.qmBub{padding:9px 13px;border-radius:16px;background:var(--themeBg-alt);border:1px solid var(--themeBd-color);font-size:14px;line-height:1.55;overflow-wrap:anywhere}\n.qmRow.me .qmBub{background:var(--themeLink);color:#fff;border-color:transparent}\n.qmBub a{color:inherit;text-decoration:underline}\n.qmBub.typing{opacity:.7;font-style:italic}\n.qmChips{display:flex;gap:8px;padding:2px 14px 8px;flex-wrap:wrap}\n.qmChips button{border:1px solid var(--themeBd-color);background:var(--themeBg-alt);color:var(--themeLink);border-radius:999px;padding:6px 13px;font:inherit;font-size:13px;cursor:pointer}\n.qmForm{display:flex;gap:8px;padding:8px 14px 4px}\n.qmForm input{flex:1;height:44px;border:1px solid var(--themeBd-color);border-radius:999px;background:var(--themeBg-alt);color:inherit;padding:0 16px;font:inherit;min-width:0}\n.qmForm>button{width:44px;height:44px;border-radius:50%;border:0;background:var(--themeLink);color:#fff;cursor:pointer;font-size:19px;flex:0 0 auto}\n.qmNote{text-align:center;font-size:11.5px;opacity:.6;margin:6px 10px 12px}"; (document.head||document.documentElement).appendChild(st); } }catch(e){}
  function lsGet(k){ try{ return localStorage.getItem(k) }catch(e){ return null } }
  function lsSet(k,v){ try{ localStorage.setItem(k,v) }catch(e){} }
  function esc(s){ return String(s==null?'':s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;') }
  var wrap=null, msgsEl=null, inputEl=null, opened=false, busy=false, history=[];
  function today(){ var d=new Date(); return d.getFullYear()+'-'+(d.getMonth()+1)+'-'+d.getDate() }
  function used(){ if(lsGet('qmDay')!==today()) return 0; return parseInt(lsGet('qmN')||'0',10)||0 }
  function bump(){ lsSet('qmDay',today()); lsSet('qmN',String(used()+1)) }
  function fixUrl(u){
    if(u.indexOf('materi-dan-soal-tg2')>-1) return 'https://www.qategori.com/#tg2-semua';
    return u;
  }
  function isSite(u){ try{ var x=new URL(u,location.href); return x.hostname===location.hostname||/(^|\.)qategori\.com$/.test(x.hostname) }catch(e){ return false } }
  function aTag(f,label){ return isSite(f)? '<a href="'+f+'">'+label+'</a>' : '<a href="'+f+'" target="_blank" rel="noopener">'+label+'</a>' }
  function fmtInline(x){
    x=x.replace(/\*\*([^*]+)\*\*/g,'<b>$1</b>');
    x=x.replace(/\*([^\*\n ](?:[^\*\n]*[^\*\n ])?)\*/g,'<i>$1</i>');
    return x;
  }
  function fmt(x){
    x=x.replace(/(^|\n)[\*-]\s+/g,'$1\u2022 ');
    x=fmtInline(x);
    x=x.replace(/(https?:\/\/[^\s<]+)/g,function(u){
      var trail=''; while(u.length && /[).,;:!?]$/.test(u)){ trail=u.slice(-1)+trail; u=u.slice(0,-1); }
      var f=fixUrl(u);
      return aTag(f,f)+trail;
    });
    return x.replace(/\n/g,'<br>');
  }
  function rich(t){
    var s=esc(t), out='', last=0, m;
    var re=/\[([^\]]+)\]\((https?:\/\/[^\s)]+)\)/g;
    while((m=re.exec(s))){ out+=fmt(s.slice(last,m.index)); var f=fixUrl(m[2]); out+=aTag(f,fmtInline(m[1])); last=m.index+m[0].length; }
    out+=fmt(s.slice(last));
    return out;
  }
  function scroll(){ if(msgsEl) msgsEl.scrollTop = msgsEl.scrollHeight }
  function addRow(txt,me){ var r=document.createElement('div'); r.className='qmRow'+(me?' me':'');
    if(!me){ var av=document.createElement('span'); av.className='qmAvS'; av.innerHTML=HEAD; r.appendChild(av) }
    var b=document.createElement('div'); b.className='qmBub'; b.innerHTML=rich(txt); r.appendChild(b); msgsEl.appendChild(r); scroll(); return b }
  function build(){ if(wrap) return;
    wrap=document.createElement('div'); wrap.className='qmWrap'; wrap.setAttribute('aria-hidden','true');
    wrap.innerHTML='<div class="qmOverlay"></div><section class="qmPanel" role="dialog" aria-modal="true" aria-label="Ngobrol dengan Mochi AI">'
      +'<header class="qmHead"><span class="qmAvB">'+HEAD+'</span><div class="qmHeadT"><b>Mochi AI</b><small>Teman belajarmu \u2022 siap membantu</small></div><button type="button" class="qmX" aria-label="Tutup">\u2715</button></header>'
      +'<div class="qmMsgs"></div>'
      +'<div class="qmChips"><button type="button" data-q="Kuis mini dong">Kuis mini</button><button type="button" data-q="Apa kata hari ini?">Kata hari ini</button><button type="button" data-q="Ceritakan tentang kuis Tokutei Ginou">Info TG2</button></div>'
      +'<form class="qmForm"><input maxlength="500" placeholder="Tanya Mochi\u2026" aria-label="Tulis pertanyaan" autocomplete="off"><button type="submit" aria-label="Kirim">\u2191</button></form>'
      +'<p class="qmNote">Gratis \u2022 maks. 20 pertanyaan/hari \u2022 jawaban AI bisa keliru</p></section>';
    document.body.appendChild(wrap);
    msgsEl=wrap.querySelector('.qmMsgs'); inputEl=wrap.querySelector('.qmForm input');
    wrap.querySelector('.qmOverlay').addEventListener('click',closeChat);
    wrap.querySelector('.qmX').addEventListener('click',closeChat);
    wrap.querySelector('.qmForm').addEventListener('submit',function(e){ e.preventDefault(); var v=inputEl.value.trim(); if(!v) return; inputEl.value=''; ask(v) });
    wrap.querySelector('.qmChips').addEventListener('click',function(e){ var b=e.target.closest?e.target.closest('button[data-q]'):null; if(b) ask(b.getAttribute('data-q')) });
    wrap.addEventListener('click',function(e){ var a=e.target.closest?e.target.closest('a[href]'):null; if(a&&isSite(a.getAttribute('href'))) closeChat() });
    document.addEventListener('keydown',function(e){ if(e.key==='Escape') closeChat() });
  }
  /* Ikuti viewport visual: di WebView TikTok/Instagram jendela tidak menyusut
     saat keyboard muncul, jadi tinggi panel disesuaikan manual agar kolom
     ketik tidak tertutup keyboard. */
  var vv=window.visualViewport||null;
  function qmFit(){ if(!wrap) return; var st=wrap.style, pn=wrap.querySelector('.qmPanel'); if(!pn) return; var ps=pn.style;
    if(!document.body.classList.contains('qmOpen')||!vv){ st.height=''; st.top=''; ps.maxHeight=''; return }
    st.height=vv.height+'px'; st.top=vv.offsetTop+'px'; ps.maxHeight=Math.max(200,Math.round(vv.height*0.94))+'px' }
  if(vv){ vv.addEventListener('resize',qmFit); vv.addEventListener('scroll',qmFit) }
  function openChat(){ build(); wrap.setAttribute('aria-hidden','false'); document.body.classList.add('qmOpen'); qmFit();
    if(!opened){ opened=true; addRow('Halo! Aku Mochi, teman belajarmu di Qategori. Mau belajar kata baru, kuis mini, atau tanya soal Tokutei Ginou? Tulis saja pertanyaanmu, nya~') }
    setTimeout(function(){ try{ inputEl.focus() }catch(e){} },320) }
  function closeChat(){ if(wrap) wrap.setAttribute('aria-hidden','true'); document.body.classList.remove('qmOpen'); qmFit() }
  window.qmOpenChat = openChat;
  function ask(text){ if(busy) return;
    if(used()>=20){ addRow(text,true); addRow('Kuota ngobrol gratis hari ini sudah habis (20 pertanyaan). Istirahat dulu ya, besok kita lanjut lagi! Materi dan kuis di situs tetap bisa dipakai sepuasnya.'); return }
    busy=true; addRow(text,true);
    var tb=addRow('Mochi sedang mengetik\u2026'); tb.classList.add('typing');
    var ac=('AbortController' in window)?new AbortController():null;
    var tm=ac?setTimeout(function(){ac.abort()},30000):null;
    fetch(API,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({message:text,history:history.slice(-12)}),signal:ac?ac.signal:undefined})
    .then(function(r){ return r.json() })
    .then(function(j){ if(!j||!j.reply) throw new Error('bad');
      tb.classList.remove('typing'); tb.innerHTML=rich(j.reply);
      history.push({role:'user',text:text}); history.push({role:'model',text:j.reply}); bump(); scroll() })
    .catch(function(){ tb.classList.remove('typing'); tb.innerHTML='Maaf, Mochi sedang susah dihubungi atau lama menjawab. Cek koneksi internetmu, lalu coba tanya lagi ya.'; scroll() })
    .then(function(){ if(tm) clearTimeout(tm); busy=false });
  }
  /* Tombol tengah bar bawah (potret) */
  var qb=document.getElementById('qmBtn');
  if(qb){ var av=qb.querySelector('.qmAv'); if(av) av.innerHTML=HEAD; qb.addEventListener('click',openChat) }
  /* Ikon pil melayang (lanskap): ganti ikon cadangan dengan kepala Mochi */
  function fixQnv(){ var b=document.querySelector('#qnvBar [data-k="mochi"]');
    if(b && !b.querySelector('.qmHeadSvg')) b.innerHTML='<span class=\"qmQnvAv\">'+HEAD+'</span><span>Mochi AI</span>' }
  fixQnv();
  if(document.readyState==='loading') document.addEventListener('DOMContentLoaded',fixQnv);
  [400,1200,2500].forEach(function(t){ setTimeout(fixQnv,t) });
})();
