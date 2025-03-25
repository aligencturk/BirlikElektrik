// Express sunucu
const express = require('express');
const path = require('path');
const compression = require('compression');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');

// Uygulama örneği oluştur
const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(compression()); // Sıkıştırma için
app.use(cors()); // CORS ayarları
app.use(helmet({ contentSecurityPolicy: false })); // Güvenlik header'ları (CSP devre dışı)
app.use(morgan('dev')); // Loglama

// Statik dosyaları servis et
app.use(express.static(path.join(__dirname)));

// Admin sayfalarını koruma - login hariç tüm admin sayfalarını login.html'e yönlendir
app.get('/admin', (req, res) => {
  res.redirect('/admin/login.html');
});

// Admin sayfası rotası - login.html hariç
app.get('/admin/*', (req, res, next) => {
  if (req.path.includes('login.html')) {
    return next();
  }
  res.sendFile(path.join(__dirname, req.path));
});

// Pages klasöründeki HTML dosyaları için özel rota
app.get('/pages/*', (req, res) => {
  res.sendFile(path.join(__dirname, req.path));
});

// CSS dosyaları için özel rota
app.get('/css/*', (req, res) => {
  res.sendFile(path.join(__dirname, req.path));
});

// Resimler için özel rota
app.get('/img/*', (req, res) => {
  res.sendFile(path.join(__dirname, req.path));
});

// JavaScript dosyaları için özel rota
app.get('/js/*', (req, res) => {
  res.sendFile(path.join(__dirname, req.path));
});

// Ana sayfa yönlendirmesi
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

// 404 - Sayfa bulunamadı
app.use((req, res) => {
  res.status(404).sendFile(path.join(__dirname, 'pages/404.html'));
});

// Sunucuyu başlat
app.listen(PORT, () => {
  console.log(`Sunucu ${PORT} portunda çalışıyor!`);
  console.log(`http://localhost:${PORT}`);
}); 