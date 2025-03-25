# Birlik Elektrik Admin Paneli

Bu dosya, Birlik Elektrik admin panelinin kullanımı ve yeni tasarımın uygulanması için rehberdir.

## Yeni Tasarım Hakkında

Admin paneli, modern ve kullanıcı dostu bir arayüz sağlamak için tamamen yeniden tasarlanmıştır. Yeni tasarım şu özellikleri içerir:

- Responsive tasarım (mobil ve masaüstü uyumlu)
- Karanlık mod desteği
- Modern UI/UX prensipleri
- Tutarlı görsel öğeler
- Daha iyi kullanıcı deneyimi
- Firebase veritabanı entegrasyonu

## Yeni Bir Sayfa Oluşturma

Yeni bir admin sayfası oluşturmak için `template.html` dosyasını temel alabilirsiniz. Template dosyası gerekli tüm yapıyı ve stil dosyalarını içerir.

1. `template.html` dosyasını kopyalayın ve yeni bir isimle kaydedin (örn. `yeni-sayfa.html`)
2. HTML içindeki "SAYFA BAŞLIĞI" metnini sayfanın başlığıyla değiştirin
3. `SAYFA_ID` değerini uygun bir değerle değiştirin (sidebar menüsünde doğru öğenin seçilmesi için)
4. "BURAYA SAYFA İÇERİĞİ GELECEK" yorumunu sayfanın asıl içeriğiyle değiştirin
5. "SAYFA ÖZGÜ SCRIPT DOSYASINI BURAYA EKLEYİN" yorumunu sayfa için gereken JavaScript dosyalarıyla değiştirin

## Sayfaları Yeni Tasarıma Dönüştürme

Mevcut bir admin sayfasını yeni tasarıma dönüştürmek için:

1. `template.html` dosyasını temel olarak kullanın
2. Mevcut sayfadaki içeriği "BURAYA SAYFA İÇERİĞİ GELECEK" bölümüne aktarın
3. Özel CSS sınıflarını yeni tasarıma uygun olarak güncelleyin
4. JavaScript kodunu gerekirse ayrı bir dosyaya taşıyın ve "SAYFA ÖZGÜ SCRIPT DOSYASINI BURAYA EKLEYİN" bölümüne dahil edin

## Stil Kılavuzu

### Renkler

Tasarımda kullanılan ana renkler:

- Primary: `--primary-color: #3498db`
- Secondary: `--secondary-color: #2ecc71`
- Danger: `--danger-color: #e74c3c`
- Warning: `--warning-color: #f39c12`
- Info: `--info-color: #3498db`
- Success: `--success-color: #2ecc71`

### Bileşenler

Admin panelinde kullanabileceğiniz birçok hazır bileşen bulunmaktadır:

#### Kartlar

```html
<div class="admin-card">
    <div class="admin-card-header">
        <h2>Kart Başlığı</h2>
    </div>
    <div class="admin-card-body">
        Kart içeriği buraya gelecek
    </div>
    <div class="admin-card-footer">
        Kart alt bilgisi buraya gelecek
    </div>
</div>
```

#### Tablolar

```html
<div class="admin-table-container">
    <table class="admin-table">
        <thead>
            <tr>
                <th>Başlık 1</th>
                <th>Başlık 2</th>
            </tr>
        </thead>
        <tbody>
            <tr>
                <td>Değer 1</td>
                <td>Değer 2</td>
            </tr>
        </tbody>
    </table>
</div>
```

#### Formlar

```html
<div class="admin-form-group">
    <label class="admin-form-label">Alan Adı</label>
    <input type="text" class="admin-form-input">
    <div class="admin-form-help">Yardım metni buraya gelecek</div>
</div>
```

#### Butonlar

```html
<button class="admin-btn admin-btn-primary">Birincil Buton</button>
<button class="admin-btn admin-btn-secondary">İkincil Buton</button>
<button class="admin-btn admin-btn-danger">Tehlike Butonu</button>
<button class="admin-btn admin-btn-warning">Uyarı Butonu</button>
<button class="admin-btn admin-btn-info">Bilgi Butonu</button>
<button class="admin-btn admin-btn-success">Başarı Butonu</button>
<button class="admin-btn admin-btn-light">Açık Buton</button>
<button class="admin-btn admin-btn-dark">Koyu Buton</button>
```

#### İkon Butonlar

```html
<button class="admin-btn-icon">
    <i class="fas fa-icon-name"></i>
</button>
```

#### İstatistik Kartları

```html
<div class="admin-stat-card">
    <div class="admin-stat-icon">
        <i class="fas fa-icon-name"></i>
    </div>
    <div class="admin-stat-content">
        <div class="admin-stat-value">100</div>
        <div class="admin-stat-label">İstatistik Adı</div>
    </div>
</div>
```

#### Bildirimler

JavaScript ile bildirim göstermek için:

```javascript
showSuccess('İşlem başarıyla tamamlandı.');
showError('Bir hata oluştu.');
showInfo('Bilgilendirme mesajı.');
```

#### Modallar

JavaScript ile modal göstermek için:

```javascript
createModal(
    'Modal Başlığı',
    'Modal içeriği buraya gelecek.',
    [
        {
            text: 'İptal',
            type: 'secondary',
            action: function(modal) {
                modal.close();
            }
        },
        {
            text: 'Kaydet',
            type: 'primary',
            action: function(modal) {
                // İşlem kodları
                modal.close();
            }
        }
    ]
);
```

### JavaScript Yardımcıları

Admin panelinde kullanabileceğiniz bazı JavaScript yardımcı fonksiyonları:

- `showError(message)`: Hata bildirimi gösterir
- `showSuccess(message)`: Başarı bildirimi gösterir
- `showInfo(message)`: Bilgi bildirimi gösterir
- `createModal(title, content, buttons)`: Modal gösterir
- `setButtonLoading(button, isLoading)`: Bir butonu yükleniyor durumuna getirir
- `showConfirmModal(title, message, confirmCallback)`: Onay modalı gösterir

## Karanlık Mod

Karanlık mod, kullanıcı tercihlerine göre otomatik olarak etkinleşir veya devre dışı bırakılır. Kullanıcılar, sağ üst köşedeki ay/güneş ikonuna tıklayarak karanlık modu açabilir veya kapatabilirler.

Tasarım, localStorage'da saklanan kullanıcı tercihlerine göre karanlık modu hatırlar.

## Duyarlı Tasarım

Admin paneli, mobil cihazlar dahil tüm ekran boyutlarına uyum sağlar. Mobil cihazlarda yan menü varsayılan olarak gizlenir ve hamburger menü ikonu kullanılarak açılabilir.

## Firebase Entegrasyonu

Admin paneli, verileri Firebase Firestore'dan alır ve günceller. Tüm sayfalar aşağıdaki Firebase modüllerini kullanır:

- Firebase App
- Firebase Auth
- Firebase Firestore
- Firebase Storage

Bu modüller, sayfa yüklendiğinde otomatik olarak başlatılır ve `db` değişkeni ile Firestore veritabanına erişim sağlanır.

## Güvenlik

Admin paneli, sadece yetkili kullanıcıların erişimine izin verir. Giriş yapmayan kullanıcılar, otomatik olarak giriş sayfasına yönlendirilir. 