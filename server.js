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
app.use(express.static(path.join(__dirname, './')));

// API rotaları (gerekirse buraya eklenebilir)

// Admin sayfalarını koruma - login hariç tüm admin sayfalarını login.html'e yönlendir
app.get('/admin', (req, res) => {
  res.redirect('/admin/login.html');
});

// Admin sayfası rotası - login.html hariç
app.get('/admin/*', (req, res, next) => {
  // Eğer login sayfasıysa direkt göster
  if (req.path.includes('login.html')) {
    return next();
  }
  // Aksi takdirde dosyayı gönder (client-side auth kontrolü yapılacak)
  res.sendFile(path.join(__dirname, req.path));
});

// Herhangi bir rota tanımlı değilse ana sayfaya yönlendir
app.get('*', function(req, res) {
  res.sendFile(path.join(__dirname, 'index.html'));
});

// Sunucuyu başlat
app.listen(PORT, () => {
  console.log(`Sunucu ${PORT} portunda çalışıyor!`);
  console.log(`http://localhost:${PORT}`);
}); 