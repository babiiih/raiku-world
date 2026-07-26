# 🐉 RAIKU WORLD — Open World Pixel MMO untuk Komunitas Raiku

Game open world pixel multiplayer dengan **6 biome, boss, waypoint fast-travel, dan siklus siang-malam**.

## ✨ Fitur

- 🔐 Login & daftar pakai **email (Gmail) + password** (Firebase Auth)
- 🎨 **Character creator**: warna badan, crest/duri, perut, mata, sayap, aksesoris + nickname
- 🌍 **Dunia luas 240×160 tile, 6 biome**:
  - **Plaza Genesis** — pusat dunia, patung Raiku, spawn point
  - **Chill Lounge 🔥** — hangout: api unggun, bangku, NPC, HP regen cepat
  - **Training Field ⚔ (Lv.1-5)** — slime & FUD ghost untuk pemula
  - **Gurun Volatilitas ☀ (Lv.6-10)** — scorpion bot di antara kaktus, pasir memperlambat
  - **Rawa Mempool ☠ (Lv.8-12)** — toxic slime, lumpur bikin gerakan berat
  - **Frozen Cache ❄ (Lv.10-15)** — yeti, danau beku yang **licin** (fisika es!)
  - **Volcanic Ridge 🌋 (Lv.15-20)** — imp cepat, **lava melukai** siapa pun yang mendekat
  - **Sarang Kraken ★** — boss **Congestion Kraken Lv.22** di cincin lava (respawn 60 dtk)
- 🗺 **7 waypoint**: dekati gerbang untuk membukanya → fast-travel via **peta dunia (M)**; progress tersimpan di akun
- 🌙 **Siklus siang-malam** — malam hari lentera, kristal & lava bersinar lebih terang
- 👥 **Online multiplayer** real-time + chat global + bubble + emote
- ⚔ **7 skill**, level cap 50, monster berlevel per region
- 🎮 **Game feel kelas studio**: momentum & squash-stretch, hit-stop, knockback, kamera look-ahead
- 📱 **Full mobile**: joystick mengambang, hotbar sentuh, chat collapsible, high-DPI
- 🕹 **Mode demo** tanpa akun

## 📁 Struktur Proyek

```
index.html        — halaman + config Firebase
css/style.css     — seluruh styling
js/util.js        — helper umum
js/audio.js       — SFX WebAudio
js/sprites.js     — pixel art naga, monster, sistem skin
js/world.js       — generator peta 240×160, biome, zona, gerbang
js/entities.js    — pemain, skill, monster per region, NPC
js/render.js      — kamera, tile, animasi prosedural, minimap, siang-malam
js/game.js        — update loop, combat, input, peta dunia, creator
js/net.js         — Firebase auth, multiplayer, chat, penyimpanan
```

---

## 1️⃣ Setup Firebase (sekali saja, ±5 menit, gratis)

1. Buka [console.firebase.google.com](https://console.firebase.google.com) → **Add project** → beri nama (mis. `raiku-world`) → Analytics boleh dimatikan → **Create**.
2. **Aktifkan login email:**
   - Menu kiri **Build → Authentication** → **Get started**
   - Tab **Sign-in method** → pilih **Email/Password** → **Enable** → Save.
3. **Aktifkan database realtime:**
   - Menu kiri **Build → Realtime Database** → **Create database**
   - Pilih lokasi (mis. Singapore) → mulai dalam **locked mode** → Enable.
   - Buka tab **Rules**, ganti seluruh isinya dengan:

   ```json
   {
     "rules": {
       "users": {
         "$uid": {
           ".read": "auth != null",
           ".write": "auth != null && auth.uid == $uid"
         }
       },
       "world": {
         ".read": "auth != null",
         "$uid": {
           ".write": "auth != null && auth.uid == $uid"
         }
       },
       "chat": {
         ".read": "auth != null",
         "$msg": {
           ".write": "auth != null && !data.exists()",
           ".validate": "newData.child('uid').val() == auth.uid && newData.child('txt').isString() && newData.child('txt').val().length <= 140"
         }
       }
     }
   }
   ```

   → klik **Publish**.
4. **Ambil config web app:**
   - Klik ikon ⚙ → **Project settings** → bagian **Your apps** → klik ikon **`</>`** (Web)
   - Beri nama app → **Register** → salin nilai `firebaseConfig` yang muncul.
5. **Tempel ke game:** buka `index.html`, cari `FIREBASE_CONFIG` di bagian atas `<script>`, ganti dengan punyamu:

   ```js
   const FIREBASE_CONFIG = {
     apiKey: "AIzaSy...",
     authDomain: "raiku-world.firebaseapp.com",
     databaseURL: "https://raiku-world-default-rtdb.asia-southeast1.firebasedatabase.app",
     projectId: "raiku-world",
     appId: "1:1234:web:abcd",
   };
   ```

   > ⚠️ `databaseURL` wajib ada. Kalau tidak muncul di config, salin URL dari halaman Realtime Database (yang berawalan `https://...firebasedatabase.app`).

> API key Firebase memang **aman untuk publik** — keamanan diatur oleh Rules di atas.

## 2️⃣ Upload ke GitHub

```bash
git init
git add .
git commit -m "RAIKU WORLD"
git branch -M main
git remote add origin https://github.com/USERNAME/raiku-world.git
git push -u origin main
```

(atau buat repo baru di github.com → **Add file → Upload files** → seret semua file & folder proyek)

## 3️⃣ Deploy ke Vercel

1. Buka [vercel.com](https://vercel.com) → login dengan GitHub
2. **Add New → Project** → pilih repo `raiku-world`
3. Framework preset: **Other** (tanpa build) → **Deploy**
4. Selesai! Game live di `https://raiku-world.vercel.app` 🎉

**Terakhir:** kembali ke Firebase Console → **Authentication → Settings → Authorized domains** → **Add domain** → masukkan domain Vercel-mu (mis. `raiku-world.vercel.app`), supaya login berfungsi di situs live.

> Alternatif: **GitHub Pages** juga bisa — Settings repo → Pages → deploy dari branch `main`, lalu tambahkan domain `USERNAME.github.io` ke Authorized domains Firebase.

---

## 🎮 Kontrol

| Input | Aksi |
|---|---|
| WASD / panah | jalan |
| 1–7 | skill |
| M | peta dunia + fast-travel |
| E | emote lambai 👋 |
| Q | duduk 🧘 |
| Enter | chat |
| `/dance` di chat | menari 🕺 |
| HP | ke Chill Lounge 🔥 — regen cepat |
| HP: sentuh kiri layar | joystick · kanan bawah: skill |

## 🧩 Catatan

- Progress (level, EXP, karakter) tersimpan per akun di cloud.
- Monster bersifat lokal per pemain (biar hemat kuota & anti-lag); posisi pemain, skill FX, dan chat tersinkron online.
- Free tier Firebase (Spark): cukup untuk komunitas kecil–menengah (100 koneksi bersamaan).
- Mau ganti karakter? Tombol **EDIT** di kanan atas dalam game.

Dibuat oleh komunitas untuk komunitas Raiku 🐉⚡
[Website](https://raiku.com/) · [Stake rkuSOL](https://stake.raiku.com/?ref=links) · [Docs](https://docs.raiku.com/) · [X](https://x.com/raikucom) · [Brand Assets](https://raiku.com/brand-assets)
