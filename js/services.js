// Hizmetleri veritabanından çekip gösteren script

document.addEventListener('DOMContentLoaded', function() {
    console.log('DOMContentLoaded event tetiklendi');
    
    // Firebase'in yüklenmesini bekle
    const checkFirebase = setInterval(() => {
        console.log('Firebase kontrol ediliyor...', {
            firebaseDb: !!window.firebaseDb,
            dbHelper: !!window.dbHelper
        });
        
        if (window.firebaseDb && window.dbHelper) {
            console.log('Firebase başarıyla yüklendi');
            clearInterval(checkFirebase);
            initializeServices();
        }
    }, 100);
});

function initializeServices() {
    console.log('initializeServices başlatıldı');
    // Sayfanın hangi sayfa olduğunu kontrol et
    const currentPath = window.location.pathname;
    console.log('Mevcut sayfa yolu:', currentPath);
    
    // Sayfa yoluna göre uygun fonksiyonu çağır
    if (currentPath.includes('index.html') || currentPath.endsWith('/') || currentPath.endsWith('/pages/')) {
        console.log('Ana sayfa tespit edildi');
        loadStaticServices();
    } else if (currentPath.includes('services.html')) {
        console.log('Hizmetler sayfası tespit edildi');
        loadDynamicServices();
    }
}

// Ana sayfa için statik hizmetleri yükle (index.html)
function loadStaticServices() {
    console.log('Ana sayfa için statik hizmetler yükleniyor...');
    
    // Ana sayfadaki servis grid'ini bul
    const servicesGrid = document.querySelector('.services-grid');
    if (!servicesGrid) {
        console.error("Ana sayfada hizmet konteyneri (.services-grid) bulunamadı");
        return;
    }
    
    // Ana sayfada hizmet kartları zaten HTML'de tanımlı olduğu için
    // mevcut kartları korumak istiyoruz - içeriği silmiyoruz
    console.log('Ana sayfa: Mevcut hizmet kartları korundu.');
}

// Hizmetler sayfası için dinamik hizmetleri yükle
async function loadDynamicServices() {
    try {
        console.log('loadDynamicServices başlatıldı');
        
        // Yükleniyor göstergesini göster
        const loadingSpinner = document.getElementById('loading');
        if (loadingSpinner) {
            loadingSpinner.style.display = 'flex';
            console.log('Yükleniyor göstergesi gösterildi');
        }

        // Hizmetleri getir
        console.log('Hizmetler getiriliyor...');
        const services = await window.dbHelper.getServices();
        console.log('Getirilen hizmetler:', services);
        
        // Yükleniyor göstergesini gizle
        if (loadingSpinner) {
            loadingSpinner.style.display = 'none';
            console.log('Yükleniyor göstergesi gizlendi');
        }

        if (!services || services.length === 0) {
            console.log('Hiç hizmet bulunamadı');
            showError('Henüz hizmet bulunmamaktadır.');
            return;
        }

        // Hizmet kartlarını güncelle
        console.log('Hizmet kartları güncelleniyor...');
        updateServiceCards(services);
        
        // Hizmet detaylarını güncelle
        console.log('Hizmet detayları güncelleniyor...');
        updateServiceDetails(services);

    } catch (error) {
        console.error('Hizmetler yüklenirken hata oluştu:', error);
        showError('Hizmetler yüklenirken bir hata oluştu. Lütfen sayfayı yenileyin.');
        
        // Yükleniyor göstergesini gizle
        const loadingSpinner = document.getElementById('loading');
        if (loadingSpinner) {
            loadingSpinner.style.display = 'none';
        }
    }
}

// Hizmet kartlarını güncelle
function updateServiceCards(services) {
    const servicesContainer = document.querySelector('.services-container');
    if (!servicesContainer) {
        console.error('Hizmet konteyneri bulunamadı');
        return;
    }

    // Mevcut kartları temizle
    servicesContainer.innerHTML = '';

    // Her hizmet için kart oluştur
    services.forEach(service => {
        const card = document.createElement('div');
        card.className = 'service-card';
        card.innerHTML = `
            <div class="service-icon">
                <i class="${service.icon || 'fas fa-tools'}"></i>
            </div>
            <h3>${service.title}</h3>
            <p>${service.shortDescription || ''}</p>
            <a href="#service-${service.id}" class="btn btn-primary">Detaylı Bilgi</a>
        `;
        servicesContainer.appendChild(card);
    });

    // Animasyon için gözlemci ekle
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('animate');
                observer.unobserve(entry.target);
            }
        });
    }, { threshold: 0.1 });

    // Tüm kartları gözlemle
    document.querySelectorAll('.service-card').forEach(card => {
        observer.observe(card);
    });
}

// Hizmet detaylarını güncelle
function updateServiceDetails(services) {
    const detailsContainer = document.querySelector('.service-details');
    if (!detailsContainer) {
        console.error('Hizmet detayları konteyneri bulunamadı');
        return;
    }

    // Mevcut detayları temizle
    detailsContainer.innerHTML = '';

    // Her hizmet için detay bölümü oluştur
    services.forEach(service => {
        const detailSection = document.createElement('section');
        detailSection.id = `service-${service.id}`;
        detailSection.className = 'service-detail';
        
        const features = service.features ? service.features.map(feature => 
            `<li><i class="fas fa-check"></i>${feature}</li>`
        ).join('') : '';

        detailSection.innerHTML = `
            <div class="service-detail-content">
                <div class="service-detail-text">
                    <h2>${service.title}</h2>
                    <p class="service-description">${service.description || service.shortDescription || ''}</p>
                    ${service.featuresTitle ? `<h3>${service.featuresTitle}</h3>` : ''}
                    ${features ? `<ul class="service-features">${features}</ul>` : ''}
                </div>
                ${service.imageUrl ? `
                <div class="service-detail-image">
                    <img src="${service.imageUrl}" alt="${service.title}" loading="lazy">
                </div>
                ` : ''}
            </div>
        `;
        
        detailsContainer.appendChild(detailSection);
    });

    // Animasyon için gözlemci ekle
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('animate');
                observer.unobserve(entry.target);
            }
        });
    }, { threshold: 0.1 });

    // Tüm detay bölümlerini gözlemle
    document.querySelectorAll('.service-detail').forEach(detail => {
        observer.observe(detail);
    });
}

// Hata mesajı göster
function showError(message) {
    const container = document.querySelector('.services-container') || document.querySelector('.service-details');
    if (container) {
        container.innerHTML = `
            <div class="error-message">
                <i class="fas fa-exclamation-circle"></i>
                <p>${message}</p>
            </div>
        `;
    }
} 