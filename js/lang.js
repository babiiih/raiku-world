/* ============================================================
   RAIKU WORLD — lang.js : Bilingual ID/EN
   ============================================================ */
const LANGS = {
  id: {
    // Auth screen
    openWorld: 'OPEN WORLD KOMUNITAS · ONLINE',
    masuk: 'MASUK',
    daftar: 'DAFTAR',
    emailLabel: 'Email (Gmail)',
    emailPh: 'kamu@gmail.com',
    passLabel: 'Password',
    passPh: 'min. 6 karakter',
    pass2Label: 'Ulangi Password',
    pass2Ph: 'ulangi password',
    btnLogin: 'MASUK DUNIA ▶',
    btnRegister: 'DAFTAR & MASUK ▶',
    btnDemo: '🎮 COBA MODE DEMO (TANPA AKUN)',
    serverOnline: 'server online siap ⚡',

    // Auth errors
    errInvalidEmail: 'Format email tidak valid.',
    errUserNotFound: 'Akun tidak ditemukan. Coba DAFTAR dulu.',
    errWrongPassword: 'Password salah.',
    errInvalidCred: 'Email atau password salah.',
    errEmailInUse: 'Email sudah terdaftar. Coba MASUK.',
    errWeakPass: 'Password minimal 6 karakter.',
    errTooMany: 'Terlalu banyak percobaan. Tunggu sebentar.',
    errNetwork: 'Gagal terhubung. Cek koneksi internet.',
    errPassMismatch: 'Password tidak sama.',
    registering: 'Mendaftarkan akun...',
    loggingIn: 'Masuk...',
    errGeneric: 'Gagal',
    errLoadProfile: 'Gagal memuat profil',
    loadingProfile: 'Memuat profil...',

    // Character creator
    createTitle: 'BUAT NAGA-MU',
    nickname: 'Nickname',
    nickPh: 'cth: RaikuFan01',
    colorBody: 'Warna Badan',
    colorCrest: 'Warna Crest / Duri',
    colorBelly: 'Warna Perut',
    colorEye: 'Warna Mata',
    colorWing: 'Sayap',
    colorAcc: 'Aksesoris',
    btnEnterWorld: '⚡ MASUK DUNIA',
    errNickShort: 'Nickname minimal 3 karakter.',
    errNickFormat: 'Hanya huruf, angka, _ dan -',
    errSaveFail: 'Gagal simpan',

    // Game HUD
    mapTitle: '🗺 Peta Dunia Raiku',

    // System messages
    welcome: 'Selamat datang di RAIKU WORLD',
    welcomeMsg: 'Dunia luas menantimu: 6 biome, 7 waypoint, dan boss Kraken di timur laut. Buka PETA (M / 🗺) untuk fast-travel.',
    safeZone: 'Zona aman: Plaza & Chill Lounge 🔥 (HP regen cepat). Zona bahaya ditandai level di banner.',
    demoMsg: 'MODE DEMO — pemain online tidak terlihat. Setup Firebase untuk fitur online penuh (README.md).',
    joined: 'bergabung ke dunia!',
    left: 'meninggalkan dunia.',
    krakenDefeated: '★ KRAKEN DIKALAHKAN! NETWORK AMAN! ★',

    // Biomes
    biomePlaza: 'PLAZA GENESIS',
    biomeChill: 'CHILL LOUNGE 🔥',
    biomeTraining: 'TRAINING FIELD ⚔',
    biomeDesert: 'GURUN VOLATILITAS ☀',
    biomeSwamp: 'RAWA MEMPOOL ☠',
    biomeFrozen: 'FROZEN CACHE ❄',
    biomeVolcanic: 'VOLCANIC RIDGE 🌋',
    biomeKraken: 'SARANG KRAKEN ★BOSS',

    // Map
    fastTravel: 'Fast Travel',
    locked: '🔒 Terkunci',
    unlocked: '✅ Terbuka',

    // Misc
    online: 'Online',
    sfxOn: 'SFX',
    sfxOff: 'SFX ✕',
    edit: 'EDIT',
    logout: 'KELUAR',
  },
  en: {
    // Auth screen
    openWorld: 'OPEN WORLD COMMUNITY · ONLINE',
    masuk: 'LOGIN',
    daftar: 'REGISTER',
    emailLabel: 'Email (Gmail)',
    emailPh: 'you@gmail.com',
    passLabel: 'Password',
    passPh: 'min. 6 characters',
    pass2Label: 'Confirm Password',
    pass2Ph: 're-enter password',
    btnLogin: 'ENTER WORLD ▶',
    btnRegister: 'SIGN UP & ENTER ▶',
    btnDemo: '🎮 TRY DEMO MODE (NO ACCOUNT)',
    serverOnline: 'server online ready ⚡',

    // Auth errors
    errInvalidEmail: 'Invalid email format.',
    errUserNotFound: 'Account not found. Try REGISTER first.',
    errWrongPassword: 'Wrong password.',
    errInvalidCred: 'Wrong email or password.',
    errEmailInUse: 'Email already registered. Try LOGIN.',
    errWeakPass: 'Password must be at least 6 characters.',
    errTooMany: 'Too many attempts. Please wait.',
    errNetwork: 'Connection failed. Check your internet.',
    errPassMismatch: 'Passwords do not match.',
    registering: 'Creating account...',
    loggingIn: 'Logging in...',
    errGeneric: 'Failed',
    errLoadProfile: 'Failed to load profile',
    loadingProfile: 'Loading profile...',

    // Character creator
    createTitle: 'CREATE YOUR DRAGON',
    nickname: 'Nickname',
    nickPh: 'e.g. RaikuFan01',
    colorBody: 'Body Color',
    colorCrest: 'Crest / Spikes',
    colorBelly: 'Belly Color',
    colorEye: 'Eye Color',
    colorWing: 'Wings',
    colorAcc: 'Accessories',
    btnEnterWorld: '⚡ ENTER WORLD',
    errNickShort: 'Nickname must be at least 3 characters.',
    errNickFormat: 'Letters, numbers, _ and - only',
    errSaveFail: 'Failed to save',

    // Game HUD
    mapTitle: '🗺 Raiku World Map',

    // System messages
    welcome: 'Welcome to RAIKU WORLD',
    welcomeMsg: 'A vast world awaits: 6 biomes, 7 waypoints, and the Kraken boss in the northeast. Open MAP (M / 🗺) for fast-travel.',
    safeZone: 'Safe zone: Plaza & Chill Lounge 🔥 (fast HP regen). Danger zones are marked with level banners.',
    demoMsg: 'DEMO MODE — online players not visible. Set up Firebase for full online features (README.md).',
    joined: 'joined the world!',
    left: 'left the world.',
    krakenDefeated: '★ KRAKEN DEFEATED! NETWORK SAFE! ★',

    // Biomes
    biomePlaza: 'GENESIS PLAZA',
    biomeChill: 'CHILL LOUNGE 🔥',
    biomeTraining: 'TRAINING FIELD ⚔',
    biomeDesert: 'VOLATILITY DESERT ☀',
    biomeSwamp: 'MEMPOOL SWAMP ☠',
    biomeFrozen: 'FROZEN CACHE ❄',
    biomeVolcanic: 'VOLCANIC RIDGE 🌋',
    biomeKraken: 'KRAKEN LAIR ★BOSS',

    // Map
    fastTravel: 'Fast Travel',
    locked: '🔒 Locked',
    unlocked: '✅ Unlocked',

    // Misc
    online: 'Online',
    sfxOn: 'SFX',
    sfxOff: 'SFX ✕',
    edit: 'EDIT',
    logout: 'LOGOUT',
  }
};

let curLang = localStorage.getItem('rw_lang') || 'id';

function t(key) {
  return (LANGS[curLang] && LANGS[curLang][key]) || (LANGS.id[key]) || key;
}

function setLang(lang) {
  curLang = lang;
  localStorage.setItem('rw_lang', lang);
  applyLang();
}

function applyLang() {
  // Auth screen
  const ls = document.querySelector('.ls');
  if (ls) ls.textContent = t('openWorld');

  const tabLogin = document.getElementById('tabLogin');
  const tabReg = document.getElementById('tabReg');
  if (tabLogin) tabLogin.textContent = t('masuk');
  if (tabReg) tabReg.textContent = t('daftar');

  // Labels
  const fields = document.querySelectorAll('#authScreen .field');
  if (fields[0]) { fields[0].querySelector('label').textContent = t('emailLabel'); fields[0].querySelector('input').placeholder = t('emailPh'); }
  if (fields[1]) { fields[1].querySelector('label').textContent = t('passLabel'); fields[1].querySelector('input').placeholder = t('passPh'); }
  if (fields[2]) { fields[2].querySelector('label').textContent = t('pass2Label'); fields[2].querySelector('input').placeholder = t('pass2Ph'); }

  // Buttons
  const authBtn = document.getElementById('authBtn');
  if (authBtn && !authBtn.disabled) authBtn.textContent = (typeof regMode !== 'undefined' && regMode) ? t('btnRegister') : t('btnLogin');
  const demoBtn = document.getElementById('demoBtn');
  if (demoBtn) demoBtn.textContent = t('btnDemo');

  // Character creator
  const gt = document.querySelector('.gt');
  if (gt) gt.innerHTML = t('createTitle').replace(/(NAGA-MU|YOUR DRAGON)/, '<span>$1</span>');
  const charLabels = document.querySelectorAll('#charScreen .field label');
  if (charLabels[0]) charLabels[0].textContent = t('nickname');
  const nickInput = document.getElementById('nick');
  if (nickInput) nickInput.placeholder = t('nickPh');
  const optLabels = document.querySelectorAll('#charScreen .optrow .lbl');
  const optKeys = ['colorBody','colorCrest','colorBelly','colorEye','colorWing','colorAcc'];
  optLabels.forEach((el, i) => { if (optKeys[i]) el.textContent = t(optKeys[i]); });
  const charGo = document.getElementById('charGo');
  if (charGo) charGo.textContent = t('btnEnterWorld');

  // Map title
  const mapTitle = document.getElementById('mapTitle');
  if (mapTitle) mapTitle.textContent = t('mapTitle');

  // SFX button
  const muteBtn = document.getElementById('muteBtn2');
  if (muteBtn) muteBtn.textContent = (typeof muted !== 'undefined' && muted) ? t('sfxOff') : t('sfxOn');

  // Lang button highlight
  document.querySelectorAll('.lang-btn').forEach(b => {
    b.classList.toggle('active', b.dataset.lang === curLang);
  });
}
