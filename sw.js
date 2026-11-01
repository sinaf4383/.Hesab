// برای به‌روزرسانی بعد از تغییر فایل‌ها، شمارهٔ نسخه را عوض کنید
const CACHE = 'kargah-v9';
const FILES = ['./', './index.html', './extra.js', './ideas.js', './manifest.json', './icon.svg', './icon-180.png', './icon-192.png', './icon-512.png'];
self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(FILES)).catch(() => {}));
  self.skipWaiting();
});
self.addEventListener('activate', e => {
  e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k !== CACHE).map(k => caches.delete(k)))).then(() => self.clients.claim()));
});
// اول از اینترنت (تا نسخهٔ جدید بیاید)، اگر نبود از حافظهٔ گوشی
self.addEventListener('fetch', e => {
  if (e.request.method !== 'GET') return;
  e.respondWith(
    fetch(e.request).then(r => {
      const copy = r.clone();
      caches.open(CACHE).then(c => c.put(e.request, copy)).catch(() => {});
      return r;
    }).catch(() => caches.match(e.request).then(r => r || caches.match('./index.html')))
  );
});

// ---- یادآوری در پس‌زمینه (روی اندروید، برنامهٔ نصب‌شده؛ بدون تضمین زمان دقیق) ----
function idb() {
  return new Promise((res, rej) => {
    const r = indexedDB.open('kargah-rem', 1);
    r.onupgradeneeded = () => { const d = r.result; d.createObjectStore('rem', {keyPath: 'key'}); d.createObjectStore('shown', {keyPath: 'key'}); };
    r.onsuccess = () => res(r.result);
    r.onerror = () => rej(r.error);
  });
}
const getAll = (db, s) => new Promise(res => { const q = db.transaction(s).objectStore(s).getAll(); q.onsuccess = () => res(q.result || []); q.onerror = () => res([]); });
async function checkRem() {
  const db = await idb();
  const rem = await getAll(db, 'rem');
  const shown = new Set((await getAll(db, 'shown')).map(x => x.key));
  const now = Date.now();
  let n = 0;
  for (const r of rem) {
    if (r.at <= now && now - r.at < 2 * 864e5 && !shown.has(r.key) && n < 5) {
      await self.registration.showNotification(r.title, {body: r.body, tag: r.key, icon: 'icon-192.png', dir: 'rtl', lang: 'fa', data: {go: r.go}});
      await new Promise(ok => { const tx = db.transaction('shown', 'readwrite'); tx.objectStore('shown').put({key: r.key, at: now}); tx.oncomplete = ok; tx.onerror = ok; });
      n++;
    }
  }
}
self.addEventListener('periodicsync', e => { if (e.tag === 'kargah-check') e.waitUntil(checkRem().catch(() => {})); });
self.addEventListener('notificationclick', e => {
  e.notification.close();
  const go = (e.notification.data && e.notification.data.go) || null;
  e.waitUntil(self.clients.matchAll({type: 'window', includeUncontrolled: true}).then(cs => {
    if (cs.length) { const c = cs[0]; if (go) c.postMessage({go}); return c.focus(); }
    return self.clients.openWindow('./index.html' + (go ? '#go=' + encodeURIComponent(JSON.stringify(go)) : ''));
  }));
});
