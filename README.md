# Node.js Admin Panel

Node.js + SQLite + Tailwind CSS ile geliştirilmiş modern admin panel uygulaması.

## Özellikler

- 🔐 Güvenli kullanıcı girişi (bcrypt ile şifreleme)
- 📊 Dashboard ile istatistikler
- 👥 Kullanıcı yönetimi
- 📈 Raporlar sayfası
- ⚙️ Ayarlar sayfası
- 🎨 Modern ve responsive tasarım (Tailwind CSS)
- 🗄️ SQLite veritabanı
- 🔒 Session tabanlı kimlik doğrulama

## Kurulum

1. Bağımlılıkları yükleyin:
```bash
npm install
```

2. Tailwind CSS'i derleyin:
```bash
npm run build:css
```

3. Uygulamayı başlatın:
```bash
npm start
```

Geliştirme modu için:
```bash
npm run dev
```

## Demo Kullanıcı

- **Kullanıcı Adı:** admin
- **Şifre:** admin123

## Proje Yapısı

```
├── app.js              # Ana uygulama dosyası
├── package.json        # Proje bağımlılıkları
├── tailwind.config.js  # Tailwind CSS konfigürasyonu
├── views/              # EJS template dosyaları
│   ├── login.ejs       # Giriş sayfası
│   ├── dashboard.ejs   # Ana panel
│   ├── users.ejs       # Kullanıcılar sayfası
│   ├── reports.ejs     # Raporlar sayfası
│   └── settings.ejs    # Ayarlar sayfası
└── public/             # Statik dosyalar
    └── css/
        ├── input.css   # Tailwind input
        └── output.css  # Derlenmiş CSS
```

## Teknolojiler

- **Backend:** Node.js, Express.js
- **Veritabanı:** SQLite3
- **Frontend:** EJS, Tailwind CSS
- **Kimlik Doğrulama:** bcrypt, express-session
- **İkonlar:** Feather Icons

## Lisans

MIT
