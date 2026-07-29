const CACHE_NAME = 'wakasek-kurikulum-v31';
const ASSETS_TO_CACHE = [
  './',
  './index.html',
  './manifest.json',
  './icon.png',
  './logo.png',
  'https://cdn.jsdelivr.net/npm/chart.js',
  'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css'
];

// Install Service Worker
self.addEventListener('install', (event) => {
  self.skipWaiting();
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log('[Service Worker] Caching App Shell');
      return cache.addAll(ASSETS_TO_CACHE);
    })
  );
});

// Activate Service Worker
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(keys.map(key => {
        if (key !== CACHE_NAME) {
          console.log('[Service Worker] Hapus cache lama:', key);
          return caches.delete(key);
        }
      }));
    }).then(() => self.clients.claim())
  );
});

// Fetch events (Network first, fallback to Cache)
self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET' || !event.request.url.startsWith('http')) {
    return;
  }

  event.respondWith(
    fetch(event.request).then(response => {
      let responseClone = response.clone();
      caches.open(CACHE_NAME).then(cache => {
        cache.put(event.request, responseClone);
      });
      return response;
    }).catch(() => {
      return caches.match(event.request).then(response => {
        if (response) {
          return response;
        }
        // Jika resource tidak ada di cache dan offline, return fallback basic
      });
    })
  );
});

// Receiving alarm schedules from the main app
let userAlarms = [];
let sesiList = [];

self.addEventListener('message', (event) => {
  if (event.data && event.data.action === 'setAlarms') {
    userAlarms = event.data.jadwal || [];
    sesiList = event.data.sesiList || [];
    console.log('[Service Worker] Alarms synchronized:', userAlarms);
  }
});

// Helper for Indonesian Day Name
function getIndonesianDayName(dateString) {
  if (!dateString) return "";
  const date = new Date(dateString);
  const days = ["Ahad", "Senin", "Selasa", "Rabu", "Kamis", "Jumat", "Sabtu"];
  return days[date.getDay()];
}

// Check schedule alarms every 30 seconds
setInterval(() => {
  if (!userAlarms || userAlarms.length === 0) return;
  
  const now = new Date();
  const witaTime = new Date(now.toLocaleString("en-US", { timeZone: "Asia/Makassar" }));
  const currentDay = getIndonesianDayName(witaTime);
  const currentHours = witaTime.getHours().toString().padStart(2, '0');
  const currentMinutes = witaTime.getMinutes().toString().padStart(2, '0');
  const currentTimeStr = `${currentHours}:${currentMinutes}`;
  
  userAlarms.forEach(item => {
    let startTimeStr = "";
    let endTimeStr = "";
    
    if (item.jamKe && item.jamKe.toString().includes("-")) {
      const parts = item.jamKe.split("-").map(p => p.trim());
      startTimeStr = parts[0];
      endTimeStr = parts[1];
    } else {
      const parts = item.jamKe.toString().split(',').map(p => p.trim());
      const matchedSess = sesiList.filter(s => parts.includes(s.namaSesi));
      if (matchedSess.length > 0) {
        matchedSess.sort((a, b) => (a.jamMulai || "").localeCompare(b.jamMulai || ""));
        startTimeStr = matchedSess[0].jamMulai;
        endTimeStr = matchedSess[matchedSess.length - 1].jamSelesai;
      }
    }
    
    if (!startTimeStr || !endTimeStr) return;
    
    // Trigger alarm if day and hour match
    if (item.hari === currentDay && startTimeStr === currentTimeStr) {
      const keyStart = `sw_notif_${item.id}_start_${witaTime.toDateString()}`;
      showSwNotification(keyStart, "⏰ Waktunya Mengajar!", `Hari ini kelas ${item.kelas} dimulai (${startTimeStr} WITA).`);
    }
    
    if (item.hari === currentDay && endTimeStr === currentTimeStr) {
      const keyEnd = `sw_notif_${item.id}_end_${witaTime.toDateString()}`;
      showSwNotification(keyEnd, "🔔 KBM Selesai! Isi Jurnal Mengajar", `Kelas ${item.kelas} telah selesai (${endTimeStr} WITA).`);
    }
  });
}, 30000);

const sentNotifications = {};
function showSwNotification(key, title, body) {
  if (sentNotifications[key]) return;
  sentNotifications[key] = true;
  
  self.registration.showNotification(title, {
    body: body,
    icon: './icon.png',
    badge: './icon.png',
    vibrate: [200, 100, 200, 100, 200, 100, 200],
    tag: key,
    requireInteraction: true,
    data: { key: key }
  });
}

// Handle notification click to focus or open client window
self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
      for (const client of clientList) {
        if (client.url && 'focus' in client) {
          return client.focus();
        }
      }
      if (clients.openWindow) {
        return clients.openWindow('./');
      }
    })
  );
});
