/* 天運者離線快取：網路快就拿最新，網路慢或斷線就用手機裡的副本 */
const C='tianyun-v1';
self.addEventListener('install',e=>self.skipWaiting());
self.addEventListener('activate',e=>e.waitUntil(self.clients.claim()));
const timeout=(p,ms)=>new Promise((res,rej)=>{const t=setTimeout(()=>rej('timeout'),ms);p.then(v=>{clearTimeout(t);res(v)},err=>{clearTimeout(t);rej(err)})});
self.addEventListener('fetch',e=>{const r=e.request;if(r.method!=='GET'||new URL(r.url).origin!==location.origin)return;
 const isImg=/\.(jpg|jpeg|png|webp|mp3|ogg)$/i.test(new URL(r.url).pathname);
 if(isImg){e.respondWith(caches.open(C).then(c=>c.match(r).then(hit=>{const net=fetch(r).then(res=>{if(res.ok)c.put(r,res.clone());return res}).catch(()=>hit);return hit||net})));return}
 e.respondWith(caches.open(C).then(c=>timeout(fetch(r,{cache:'no-cache'}),4000).then(res=>{if(res.ok)c.put(r,res.clone());return res}).catch(()=>c.match(r).then(hit=>hit||fetch(r)))))});
