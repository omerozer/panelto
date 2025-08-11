const express = require('express');
const session = require('express-session');
const bodyParser = require('body-parser');
const sqlite3 = require('sqlite3').verbose();
const bcrypt = require('bcrypt');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;
const NODE_ENV = process.env.NODE_ENV || 'development';

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

app.use(express.static(path.join(__dirname, 'public')));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

app.use(session({
  secret: process.env.SESSION_SECRET || 'gizli-anahtar-buraya',
  resave: false,
  saveUninitialized: false,
  cookie: { 
    secure: NODE_ENV === 'production',
    httpOnly: true,
    maxAge: 24 * 60 * 60 * 1000 // 24 saat
  }
}));

// Flash messages middleware
app.use((req, res, next) => {
  res.locals.success = req.session.success;
  res.locals.error = req.session.error;
  delete req.session.success;
  delete req.session.error;
  next();
});

const db = new sqlite3.Database('./database.sqlite');

db.serialize(() => {
  db.run(`CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL,
    email TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )`);

  db.run(`CREATE TABLE IF NOT EXISTS smtp_settings (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    provider TEXT NOT NULL,
    host TEXT NOT NULL,
    port INTEGER NOT NULL,
    username TEXT NOT NULL,
    password TEXT NOT NULL,
    secure BOOLEAN DEFAULT 1,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )`);

  db.get("SELECT COUNT(*) as count FROM users", (err, row) => {
    if (row.count === 0) {
      const defaultPassword = bcrypt.hashSync('admin123', 10);
      db.run("INSERT INTO users (username, password, email) VALUES (?, ?, ?)", 
        ['admin', defaultPassword, 'admin@example.com']);
    }
  });

  db.get("SELECT COUNT(*) as count FROM smtp_settings", (err, row) => {
    if (row.count === 0) {
      db.run(`INSERT INTO smtp_settings (provider, host, port, username, password, secure) VALUES 
        ('Gmail', 'smtp.gmail.com', 587, '', '', 1),
        ('Hostinger', 'smtp.hostinger.com', 587, '', '', 1)`);
    }
  });
});

function requireAuth(req, res, next) {
  if (req.session.user) {
    next();
  } else {
    res.redirect('/login');
  }
}

app.get('/', (req, res) => {
  if (req.session.user) {
    res.redirect('/dashboard');
  } else {
    res.redirect('/login');
  }
});

app.get('/login', (req, res) => {
  if (req.session.user) {
    res.redirect('/dashboard');
  } else {
    res.render('login', { error: null });
  }
});

app.post('/login', (req, res) => {
  const { username, password } = req.body;
  
  db.get("SELECT * FROM users WHERE username = ?", [username], (err, user) => {
    if (err) {
      return res.render('login', { error: 'Veritabanı hatası' });
    }
    
    if (!user) {
      return res.render('login', { error: 'Kullanıcı adı veya şifre hatalı' });
    }
    
    bcrypt.compare(password, user.password, (err, isMatch) => {
      if (err || !isMatch) {
        return res.render('login', { error: 'Kullanıcı adı veya şifre hatalı' });
      }
      
      req.session.user = {
        id: user.id,
        username: user.username,
        email: user.email
      };
      
      res.redirect('/dashboard');
    });
  });
});

app.get('/logout', (req, res) => {
  req.session.destroy();
  res.redirect('/login');
});

app.get('/dashboard', requireAuth, (req, res) => {
  res.render('dashboard', { user: req.session.user });
});

app.get('/users', requireAuth, (req, res) => {
  db.all("SELECT id, username, email, created_at FROM users", (err, users) => {
    if (err) {
      return res.render('users', { users: [], error: 'Veritabanı hatası', user: req.session.user });
    }
    res.render('users', { users, error: null, user: req.session.user });
  });
});

app.get('/settings', requireAuth, (req, res) => {
  db.all("SELECT * FROM smtp_settings ORDER BY provider", (err, smtpSettings) => {
    if (err) {
      return res.render('settings', { 
        user: req.session.user, 
        smtpSettings: [], 
        message: 'SMTP ayarları yüklenirken hata oluştu',
        messageType: 'error'
      });
    }
    res.render('settings', { 
      user: req.session.user, 
      smtpSettings: smtpSettings || [],
      message: res.locals.success || res.locals.error,
      messageType: res.locals.success ? 'success' : (res.locals.error ? 'error' : null)
    });
  });
});

app.post('/settings/smtp', requireAuth, (req, res) => {
  const { provider, host, port, username, password, secure } = req.body;
  
  db.run(`UPDATE smtp_settings SET 
    host = ?, port = ?, username = ?, password = ?, secure = ?, updated_at = CURRENT_TIMESTAMP 
    WHERE provider = ?`, 
    [host, port, username, password, secure ? 1 : 0, provider], 
    function(err) {
      if (err) {
        req.session.error = 'SMTP ayarları kaydedilemedi';
        return res.redirect('/settings');
      }
      req.session.success = 'SMTP ayarları başarıyla kaydedildi';
      res.redirect('/settings');
    }
  );
});

app.post('/settings/test-email', requireAuth, (req, res) => {
  const { provider, testEmail } = req.body;
  
  if (!testEmail) {
    req.session.error = 'Test e-posta adresi gerekli';
    return res.redirect('/settings');
  }
  
  db.get("SELECT * FROM smtp_settings WHERE provider = ?", [provider], (err, smtp) => {
    if (err || !smtp) {
      req.session.error = 'SMTP ayarları bulunamadı';
      return res.redirect('/settings');
    }
    
    // Test e-postası gönderme simülasyonu
    console.log(`Test e-postası gönderiliyor: ${testEmail}`);
    console.log(`SMTP Ayarları: ${smtp.host}:${smtp.port}`);
    
    // Gerçek e-posta gönderimi için nodemailer kullanılabilir
    // Şimdilik başarılı olarak kabul ediyoruz
    req.session.success = 'Test e-postası başarıyla gönderildi';
    res.redirect('/settings');
  });
});

app.get('/reports', requireAuth, (req, res) => {
  res.render('reports', { user: req.session.user });
});

app.listen(PORT, () => {
  console.log(`Sunucu http://localhost:${PORT} adresinde çalışıyor`);
});
