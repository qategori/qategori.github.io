/* Mochi AI — panel chat mandiri (Cloudflare Worker -> Gemini).
   Sengaja berdiri sendiri (tidak di dalam app.js) supaya selalu jalan. */
(function(){
  'use strict';
  var API = 'https://mochi-ai.bshantoz.workers.dev/chat';
  var HEAD = "<svg class=\"qmHeadSvg\" xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"13 0 38 38\" aria-hidden=\"true\"><ellipse class=\"mShadow\" cx=\"32\" cy=\"62.5\" rx=\"15\" ry=\"2.2\" fill=\"rgba(0,0,0,.18)\"/><g class=\"qcTail\"><path d=\"M45 54C58 54 60 40 54 34\" fill=\"none\" stroke=\"#5a3a22\" stroke-width=\"7\" stroke-linecap=\"round\"/><path d=\"M45 54C58 54 60 40 54 34\" fill=\"none\" stroke=\"#f2a65a\" stroke-width=\"4.6\" stroke-linecap=\"round\"/></g><ellipse cx=\"32\" cy=\"50\" rx=\"16\" ry=\"12.5\" fill=\"#f2a65a\" stroke=\"#5a3a22\" stroke-width=\"1.6\"/><ellipse cx=\"32\" cy=\"53\" rx=\"8.5\" ry=\"8\" fill=\"#fff3e0\"/><ellipse cx=\"25\" cy=\"59.5\" rx=\"5\" ry=\"3\" fill=\"#fff3e0\" stroke=\"#5a3a22\" stroke-width=\"1.3\"/><ellipse cx=\"39\" cy=\"59.5\" rx=\"5\" ry=\"3\" fill=\"#fff3e0\" stroke=\"#5a3a22\" stroke-width=\"1.3\"/><g class=\"qcHead\"><g class=\"qcEarL\"><path d=\"M17.5 24L19 7.5L31 17.5Z\" fill=\"#f2a65a\" stroke=\"#5a3a22\" stroke-width=\"1.6\" stroke-linejoin=\"round\"/><path d=\"M21 19L21.6 12.5L26.5 17Z\" fill=\"#f7b6b6\"/></g><g class=\"qcEarR\"><path d=\"M46.5 24L45 7.5L33 17.5Z\" fill=\"#f2a65a\" stroke=\"#5a3a22\" stroke-width=\"1.6\" stroke-linejoin=\"round\"/><path d=\"M43 19L42.4 12.5L37.5 17Z\" fill=\"#f7b6b6\"/></g><ellipse cx=\"32\" cy=\"29\" rx=\"16\" ry=\"13.5\" fill=\"#f2a65a\" stroke=\"#5a3a22\" stroke-width=\"1.6\"/><path d=\"M32 16.5V21M27 17.5L28 21M37 17.5L36 21\" stroke=\"#c9772e\" stroke-width=\"1.6\" stroke-linecap=\"round\"/><ellipse cx=\"32\" cy=\"34\" rx=\"7.5\" ry=\"5.2\" fill=\"#fff3e0\"/><g class=\"qcEyes\"><ellipse cx=\"25\" cy=\"28.5\" rx=\"2.1\" ry=\"2.8\" fill=\"#3b2415\"/><ellipse cx=\"39\" cy=\"28.5\" rx=\"2.1\" ry=\"2.8\" fill=\"#3b2415\"/><circle cx=\"25.7\" cy=\"27.4\" r=\".8\" fill=\"#fff\"/><circle cx=\"39.7\" cy=\"27.4\" r=\".8\" fill=\"#fff\"/></g><g class=\"qcSleep\"><path d=\"M22.5 29Q25 31.5 27.5 29M36.5 29Q39 31.5 41.5 29\" fill=\"none\" stroke=\"#3b2415\" stroke-width=\"1.6\" stroke-linecap=\"round\"/></g><path d=\"M30.2 32.4H33.8L32 34.4Z\" fill=\"#e58a8a\"/><path d=\"M32 34.4V36M32 36Q30.3 37.6 28.6 36.3M32 36Q33.7 37.6 35.4 36.3\" fill=\"none\" stroke=\"#5a3a22\" stroke-width=\"1.1\" stroke-linecap=\"round\"/><path d=\"M18 32L10.5 30.5M18 34.5L10.5 35.5M46 32L53.5 30.5M46 34.5L53.5 35.5\" stroke=\"#5a3a22\" stroke-width=\".9\" stroke-linecap=\"round\" opacity=\".55\"/><g class=\"qcAcc qcSakura\"><circle cx=\"43\" cy=\"14.5\" r=\"2\" fill=\"#f9c7d4\"/><circle cx=\"45.6\" cy=\"16.2\" r=\"2\" fill=\"#f9c7d4\"/><circle cx=\"45\" cy=\"19\" r=\"2\" fill=\"#f9c7d4\"/><circle cx=\"41.6\" cy=\"18.4\" r=\"2\" fill=\"#f9c7d4\"/><circle cx=\"41.2\" cy=\"15.4\" r=\"2\" fill=\"#f9c7d4\"/><circle cx=\"43.3\" cy=\"16.9\" r=\"1.2\" fill=\"#f2a65a\"/></g><g class=\"qcAcc qcAki\"><path d=\"M42 13C47 12 49.5 16.5 47.5 20.5C43 20 41 17 42 13Z\" fill=\"#c8431c\" stroke=\"#7a2a10\" stroke-width=\"1\"/><path d=\"M42.5 14.5L46.8 19.6\" stroke=\"#7a2a10\" stroke-width=\".8\"/></g><g class=\"qcAcc qcSalju\"><path d=\"M20 40Q32 46 44 40L44.5 44Q32 50 19.5 44Z\" fill=\"#d6453d\" stroke=\"#8a2420\" stroke-width=\"1\"/><path d=\"M40 43L42.5 52L46 51L44 43Z\" fill=\"#d6453d\" stroke=\"#8a2420\" stroke-width=\"1\" stroke-linejoin=\"round\"/></g><g class=\"qcAcc qcPanas\"><path d=\"M17 22Q32 14 47 22\" fill=\"none\" stroke=\"#e8c15a\" stroke-width=\"3\" stroke-linecap=\"round\"/><path d=\"M13 22H51\" stroke=\"#d9a93c\" stroke-width=\"3.4\" stroke-linecap=\"round\"/><path d=\"M20 22Q32 8 44 22Z\" fill=\"#f1d27a\" stroke=\"#b88a24\" stroke-width=\"1\"/><path d=\"M20.5 20.5H43.5\" stroke=\"#d6453d\" stroke-width=\"2\"/></g><g class=\"qcAcc qcNightCap\"><path d=\"M19 20Q30 2 46 10Q40 14 46 22Z\" fill=\"#5b6fd6\" stroke=\"#2f3b8a\" stroke-width=\"1\"/><path d=\"M17 21Q32 25 47 21\" fill=\"none\" stroke=\"#e8ecff\" stroke-width=\"3\" stroke-linecap=\"round\"/><circle cx=\"46.5\" cy=\"10\" r=\"2.6\" fill=\"#fff\"/><path d=\"M33 12l1 2 2 .3-1.5 1.4.4 2-1.9-1-1.9 1 .4-2L30 14.3 32 14Z\" fill=\"#ffe27a\"/></g></g><g class=\"qcNite\"><path d=\"M54 3A6 6 0 1 0 54 15A4.8 4.8 0 0 1 54 3Z\" fill=\"#fdf3c0\"/><circle class=\"qcTw\" cx=\"60\" cy=\"20\" r=\"1.1\" fill=\"#fff6c8\"/><circle class=\"qcTw qcTw2\" cx=\"8\" cy=\"8\" r=\"1.2\" fill=\"#fff6c8\"/><circle class=\"qcTw\" cx=\"4\" cy=\"26\" r=\".9\" fill=\"#fff6c8\"/></g></svg>";
  window.__qmHead = HEAD;
  function lsGet(k){ try{ return localStorage.getItem(k) }catch(e){ return null } }
  function lsSet(k,v){ try{ localStorage.setItem(k,v) }catch(e){} }
  function esc(s){ return String(s==null?'':s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;') }
  var wrap=null, msgsEl=null, inputEl=null, opened=false, busy=false, history=[];
  function today(){ var d=new Date(); return d.getFullYear()+'-'+(d.getMonth()+1)+'-'+d.getDate() }
  function used(){ if(lsGet('qmDay')!==today()) return 0; return parseInt(lsGet('qmN')||'0',10)||0 }
  function bump(){ lsSet('qmDay',today()); lsSet('qmN',String(used()+1)) }
  function rich(t){ var s=esc(t); s=s.replace(/\*\*([^*]+)\*\*/g,'<b>$1</b>'); s=s.replace(/(https?:\/\/[^\s<]+)/g,'<a href="$1" target="_blank" rel="noopener">$1</a>'); return s.replace(/\n/g,'<br>') }
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
    document.addEventListener('keydown',function(e){ if(e.key==='Escape') closeChat() });
  }
  function openChat(){ build(); wrap.setAttribute('aria-hidden','false'); document.body.classList.add('qmOpen');
    if(!opened){ opened=true; addRow('Halo! Aku Mochi, teman belajarmu di Qategori. Mau belajar kata baru, kuis mini, atau tanya soal Tokutei Ginou? Tulis saja pertanyaanmu, nya~') }
    setTimeout(function(){ try{ inputEl.focus() }catch(e){} },320) }
  function closeChat(){ if(wrap) wrap.setAttribute('aria-hidden','true'); document.body.classList.remove('qmOpen') }
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
    if(b && !b.querySelector('.qmHeadSvg')) b.innerHTML=HEAD+'<span>Mochi AI</span>' }
  fixQnv();
  if(document.readyState==='loading') document.addEventListener('DOMContentLoaded',fixQnv);
  [400,1200,2500].forEach(function(t){ setTimeout(fixQnv,t) });
})();
