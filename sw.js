/* Service worker Qategori — membuat situs bisa dipasang (PWA) dan dibaca offline.
   Naikkan nomor versi VER setiap kali strategi cache berubah, supaya cache lama dibuang. */
var VER = 'qategori-pwa-v28';
var CORE = [
  '/',
  '/base.css',
  '/site.css',
  '/app.js',
  '/mochi.js',
  '/theme.js',
  '/favicon.ico',
  '/site.webmanifest',
  '/icon-192.png',
  '/icon-512.png',
  '/apple-touch-icon.png'
];

self.addEventListener('install', function (e) {
  e.waitUntil(
    caches.open(VER).then(function (c) { return c.addAll(CORE); })
      .then(function () { return self.skipWaiting(); })
  );
});

self.addEventListener('activate', function (e) {
  e.waitUntil(
    caches.keys().then(function (ks) {
      return Promise.all(ks.map(function (k) {
        if (k !== VER) return caches.delete(k);
      }));
    }).then(function () { return self.clients.claim(); })
  );
});

self.addEventListener('fetch', function (e) {
  var r = e.request;
  if (r.method !== 'GET') return;
  var u = new URL(r.url);
  if (u.origin !== self.location.origin) return;
  /* Jangan cache umpan/feed dan halaman admin: isinya harus selalu segar. */
  if (u.pathname.indexOf('/feeds') === 0 || u.pathname.indexOf('/admin') === 0 ||
      u.pathname.indexOf('/p/admin') === 0) return;

  if (r.mode === 'navigate') {
    /* Halaman: utamakan jaringan, jatuh ke cache (lalu beranda) saat offline. */
    e.respondWith(
      fetch(r).then(function (res) {
        var cp = res.clone();
        caches.open(VER).then(function (c) { c.put(r, cp); });
        return res;
      }).catch(function () {
        return caches.match(r).then(function (m) { return m || caches.match('/'); });
      })
    );
    return;
  }

  /* Aset statis: sajikan dari cache sambil memperbarui di latar belakang. */
  e.respondWith(
    caches.match(r).then(function (m) {
      var net = fetch(r).then(function (res) {
        if (res && res.status === 200) {
          var cp = res.clone();
          caches.open(VER).then(function (c) { c.put(r, cp); });
        }
        return res;
      }).catch(function () { return m; });
      return m || net;
    })
  );
});
