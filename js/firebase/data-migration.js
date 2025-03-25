// Web sitesindeki verileri Firebase'e aktarma scripti

// NOT: Firebase yapılandırma bilgileri config.js dosyasından gelir
// bu dosyada tekrar tanımlanmamalıdır.

// Firebase'i başlat
let app, db, storage, auth;

// DOM yüklendikten sonra çalış
document.addEventListener('DOMContentLoaded', function() {
    // Firebase modüllerinin varlığını kontrol et
    initializeFirebase();
    
    // Veri aktarımı için UI ekle
    setupDataMigrationUI();
});

// Firebase'i başlat
function initializeFirebase() {
    try {
        if (typeof firebase === 'undefined') {
            console.error('Firebase bulunamadı. Lütfen gerekli kütüphanelerin yüklendiğinden emin olun.');
            showError('Firebase bulunamadı. Lütfen sayfayı yenileyip tekrar deneyin.');
            return;
        }
        
        // Firebase App başlat (eğer zaten başlatılmamışsa)
        if (!firebase.apps.length) {
            if (typeof firebaseConfig !== 'undefined') {
                app = firebase.initializeApp(firebaseConfig);
            } else {
                console.error('Firebase yapılandırma bilgileri bulunamadı.');
                showError('Firebase yapılandırma bilgileri bulunamadı. Lütfen sayfayı yenileyip tekrar deneyin.');
                return;
            }
        } else {
            app = firebase.app(); // Eğer zaten başlatılmışsa, mevcut app'i kullan
        }
        
        // Firestore referansı al
        if (typeof firebase.firestore === 'function') {
            db = firebase.firestore();
            db.settings({
                cacheSizeBytes: firebase.firestore.CACHE_SIZE_UNLIMITED,
                ignoreUndefinedProperties: true,
                merge: true
            });
        } else {
            console.error('Firebase Firestore bulunamadı');
        }
        
        // Storage referansı al
        if (typeof firebase.storage === 'function') {
            storage = firebase.storage();
        } else {
            console.error('Firebase Storage bulunamadı');
        }
        
        // Auth referansı al
        if (typeof firebase.auth === 'function') {
            auth = firebase.auth();
        } else {
            console.error('Firebase Authentication bulunamadı');
        }
        
        console.log('Firebase başarıyla başlatıldı.');
    } catch (error) {
        console.error('Firebase başlatılırken hata oluştu:', error);
        showError('Firebase başlatılırken hata oluştu. Lütfen sayfayı yenileyip tekrar deneyin.');
    }
}

// Veri aktarımı için UI ekle
function setupDataMigrationUI() {
    const container = document.getElementById('dataMigrationContainer');
    if (!container) return;

    container.innerHTML = `
        <div class="migration-panel">
            <h2>Veri Aktarımı</h2>
            <p>Aşağıdaki düğmeler ile web sitesindeki mevcut verileri Firebase veritabanına aktarabilirsiniz.</p>
            
            <div class="migration-actions">
                <button id="migrateProjects" class="btn btn-primary">Projeleri Aktar</button>
                <button id="migrateServices" class="btn btn-primary">Hizmetleri Aktar</button>
                <button id="migrateTeam" class="btn btn-primary">Ekip Üyelerini Aktar</button>
                <button id="migrateGallery" class="btn btn-primary">Galeriyi Aktar</button>
                <button id="migratePages" class="btn btn-primary">Sayfaları Aktar</button>
                <button id="migrateSettings" class="btn btn-primary">Ayarları Aktar</button>
                <button id="migrateAll" class="btn btn-success">Tümünü Aktar</button>
            </div>
            
            <div class="migration-status">
                <h3>Aktarım Durumu</h3>
                <div id="migrationStatus" class="status-container">
                    <p>Henüz bir aktarım yapılmadı.</p>
                </div>
            </div>
        </div>
    `;
    
    // Event listenerları ekle
    document.getElementById('migrateProjects').addEventListener('click', migrateProjects);
    document.getElementById('migrateServices').addEventListener('click', migrateServices);
    document.getElementById('migrateTeam').addEventListener('click', migrateTeam);
    document.getElementById('migrateGallery').addEventListener('click', migrateGallery);
    document.getElementById('migratePages').addEventListener('click', migratePages);
    document.getElementById('migrateSettings').addEventListener('click', migrateSettings);
    document.getElementById('migrateAll').addEventListener('click', migrateAll);
}

// Durum mesajı göster
function updateStatus(message, isError = false) {
    const statusContainer = document.getElementById('migrationStatus');
    if (!statusContainer) return;
    
    const messageElement = document.createElement('div');
    messageElement.className = isError ? 'status-message error' : 'status-message';
    messageElement.innerHTML = `
        <span class="timestamp">${new Date().toLocaleTimeString()}</span>
        <span class="message">${message}</span>
    `;
    
    statusContainer.innerHTML = '';
    statusContainer.appendChild(messageElement);
}

// Projeleri aktar
function migrateProjects() {
    if (!db) {
        updateStatus('Firebase bağlantısı kurulamadı!', true);
        return;
    }
    
    updateStatus('Projeler aktarılıyor...');
    
    // HTML'den proje verilerini çek
    const projectElements = document.querySelectorAll('.project-item');
    if (!projectElements.length) {
        updateStatus('Web sitesinde proje bulunamadı!', true);
        return;
    }
    
    let successCount = 0;
    const totalCount = projectElements.length;
    
    projectElements.forEach((project, index) => {
        const projectData = {
            title: project.querySelector('.project-title').textContent.trim(),
            description: project.querySelector('.project-description') ? 
                         project.querySelector('.project-description').textContent.trim() : '',
            category: project.querySelector('.project-category') ? 
                      project.querySelector('.project-category').textContent.trim() : 'Genel',
            imageUrl: project.querySelector('img') ? 
                      project.querySelector('img').src : '',
            order: index,
            active: true,
            createdAt: firebase.firestore.FieldValue.serverTimestamp()
        };
        
        // Firebase'e ekle
        db.collection('projects').add(projectData)
            .then(() => {
                successCount++;
                if (successCount === totalCount) {
                    updateStatus(`${successCount} proje başarıyla aktarıldı.`);
                }
            })
            .catch(error => {
                console.error('Proje aktarılırken hata:', error);
                updateStatus(`Proje aktarılırken hata: ${error.message}`, true);
            });
    });
}

// Hizmetleri aktar
function migrateServices() {
    if (!db) {
        updateStatus('Firebase bağlantısı kurulamadı!', true);
        return;
    }
    
    updateStatus('Hizmetler aktarılıyor...');
    
    // HTML'den hizmet verilerini çek
    const serviceElements = document.querySelectorAll('.service-item');
    if (!serviceElements.length) {
        updateStatus('Web sitesinde hizmet bulunamadı!', true);
        return;
    }
    
    let successCount = 0;
    const totalCount = serviceElements.length;
    
    serviceElements.forEach((service, index) => {
        const serviceData = {
            title: service.querySelector('.service-title').textContent.trim(),
            description: service.querySelector('.service-description') ? 
                         service.querySelector('.service-description').textContent.trim() : '',
            icon: service.querySelector('.service-icon i') ? 
                  service.querySelector('.service-icon i').className : 'fas fa-bolt',
            iconColor: '#0d6efd',
            slug: generateSlug(service.querySelector('.service-title').textContent.trim()),
            order: index,
            active: true,
            createdAt: firebase.firestore.FieldValue.serverTimestamp()
        };
        
        // Firebase'e ekle
        db.collection('services').add(serviceData)
            .then(() => {
                successCount++;
                if (successCount === totalCount) {
                    updateStatus(`${successCount} hizmet başarıyla aktarıldı.`);
                }
            })
            .catch(error => {
                console.error('Hizmet aktarılırken hata:', error);
                updateStatus(`Hizmet aktarılırken hata: ${error.message}`, true);
            });
    });
}

// Ekip üyelerini aktar
function migrateTeam() {
    if (!db) {
        updateStatus('Firebase bağlantısı kurulamadı!', true);
        return;
    }
    
    updateStatus('Ekip üyeleri aktarılıyor...');
    
    // HTML'den ekip verilerini çek
    const teamElements = document.querySelectorAll('.team-member');
    if (!teamElements.length) {
        updateStatus('Web sitesinde ekip üyesi bulunamadı!', true);
        return;
    }
    
    let successCount = 0;
    const totalCount = teamElements.length;
    
    teamElements.forEach((member, index) => {
        const memberData = {
            name: member.querySelector('.team-member-name').textContent.trim(),
            title: member.querySelector('.team-member-title') ? 
                   member.querySelector('.team-member-title').textContent.trim() : '',
            department: member.querySelector('.team-member-department') ? 
                        member.querySelector('.team-member-department').textContent.trim() : 'Genel',
            imageUrl: member.querySelector('img') ? 
                      member.querySelector('img').src : '',
            order: index,
            active: true,
            createdAt: firebase.firestore.FieldValue.serverTimestamp()
        };
        
        // Firebase'e ekle
        db.collection('team').add(memberData)
            .then(() => {
                successCount++;
                if (successCount === totalCount) {
                    updateStatus(`${successCount} ekip üyesi başarıyla aktarıldı.`);
                }
            })
            .catch(error => {
                console.error('Ekip üyesi aktarılırken hata:', error);
                updateStatus(`Ekip üyesi aktarılırken hata: ${error.message}`, true);
            });
    });
}

// Galeriyi aktar
function migrateGallery() {
    if (!db) {
        updateStatus('Firebase bağlantısı kurulamadı!', true);
        return;
    }
    
    updateStatus('Galeri resimleri aktarılıyor...');
    
    // HTML'den galeri verilerini çek
    const galleryElements = document.querySelectorAll('.gallery-item');
    if (!galleryElements.length) {
        updateStatus('Web sitesinde galeri resmi bulunamadı!', true);
        return;
    }
    
    let successCount = 0;
    const totalCount = galleryElements.length;
    
    galleryElements.forEach((item, index) => {
        const galleryData = {
            title: item.querySelector('.gallery-title') ? 
                   item.querySelector('.gallery-title').textContent.trim() : `Galeri Resmi ${index + 1}`,
            category: item.querySelector('.gallery-category') ? 
                      item.querySelector('.gallery-category').textContent.trim() : 'Genel',
            imageUrl: item.querySelector('img') ? 
                      item.querySelector('img').src : '',
            order: index,
            active: true,
            createdAt: firebase.firestore.FieldValue.serverTimestamp()
        };
        
        // Firebase'e ekle
        db.collection('gallery').add(galleryData)
            .then(() => {
                successCount++;
                if (successCount === totalCount) {
                    updateStatus(`${successCount} galeri resmi başarıyla aktarıldı.`);
                }
            })
            .catch(error => {
                console.error('Galeri resmi aktarılırken hata:', error);
                updateStatus(`Galeri resmi aktarılırken hata: ${error.message}`, true);
            });
    });
}

// Sayfaları aktar
function migratePages() {
    if (!db) {
        updateStatus('Firebase bağlantısı kurulamadı!', true);
        return;
    }
    
    updateStatus('Sayfalar aktarılıyor...');
    
    // Temel sayfaları manuel olarak ekle
    const pages = [
        {
            title: 'Ana Sayfa',
            slug: 'index',
            content: document.querySelector('.home-content') ? 
                     document.querySelector('.home-content').innerHTML : '',
            isPublished: true,
            order: 1,
            createdAt: firebase.firestore.FieldValue.serverTimestamp()
        },
        {
            title: 'Hakkımızda',
            slug: 'about',
            content: document.querySelector('.about-content') ? 
                     document.querySelector('.about-content').innerHTML : '',
            isPublished: true,
            order: 2,
            createdAt: firebase.firestore.FieldValue.serverTimestamp()
        },
        {
            title: 'Hizmetlerimiz',
            slug: 'services',
            content: document.querySelector('.services-content') ? 
                     document.querySelector('.services-content').innerHTML : '',
            isPublished: true,
            order: 3,
            createdAt: firebase.firestore.FieldValue.serverTimestamp()
        },
        {
            title: 'Projelerimiz',
            slug: 'projects',
            content: document.querySelector('.projects-content') ? 
                     document.querySelector('.projects-content').innerHTML : '',
            isPublished: true,
            order: 4,
            createdAt: firebase.firestore.FieldValue.serverTimestamp()
        },
        {
            title: 'İletişim',
            slug: 'contact',
            content: document.querySelector('.contact-content') ? 
                     document.querySelector('.contact-content').innerHTML : '',
            isPublished: true,
            order: 5,
            createdAt: firebase.firestore.FieldValue.serverTimestamp()
        }
    ];
    
    let successCount = 0;
    const totalCount = pages.length;
    
    pages.forEach(page => {
        // Firebase'e ekle
        db.collection('pages').doc(page.slug).set(page)
            .then(() => {
                successCount++;
                if (successCount === totalCount) {
                    updateStatus(`${successCount} sayfa başarıyla aktarıldı.`);
                }
            })
            .catch(error => {
                console.error('Sayfa aktarılırken hata:', error);
                updateStatus(`Sayfa aktarılırken hata: ${error.message}`, true);
            });
    });
}

// Ayarları aktar
function migrateSettings() {
    if (!db) {
        updateStatus('Firebase bağlantısı kurulamadı!', true);
        return;
    }
    
    updateStatus('Site ayarları aktarılıyor...');
    
    // Meta verilerini ve iletişim bilgilerini al
    const siteName = document.querySelector('title') ? 
                     document.querySelector('title').textContent.trim() : 'Birlik Elektrik';
    const siteDescription = document.querySelector('meta[name="description"]') ? 
                            document.querySelector('meta[name="description"]').getAttribute('content') : '';
    const siteEmail = document.querySelector('.contact-email') ? 
                      document.querySelector('.contact-email').textContent.trim() : '';
    const sitePhone = document.querySelector('.contact-phone') ? 
                      document.querySelector('.contact-phone').textContent.trim() : '';
    const siteAddress = document.querySelector('.contact-address') ? 
                        document.querySelector('.contact-address').textContent.trim() : '';
    
    const settingsData = {
        siteName: siteName,
        siteDescription: siteDescription,
        contactEmail: siteEmail,
        contactPhone: sitePhone,
        contactAddress: siteAddress,
        logoUrl: document.querySelector('.navbar-brand img') ? 
                 document.querySelector('.navbar-brand img').src : '',
        faviconUrl: document.querySelector('link[rel="icon"]') ? 
                    document.querySelector('link[rel="icon"]').href : '',
        socialMedia: {
            facebook: document.querySelector('.social-facebook') ? 
                      document.querySelector('.social-facebook').href : '',
            twitter: document.querySelector('.social-twitter') ? 
                     document.querySelector('.social-twitter').href : '',
            instagram: document.querySelector('.social-instagram') ? 
                       document.querySelector('.social-instagram').href : '',
            linkedin: document.querySelector('.social-linkedin') ? 
                      document.querySelector('.social-linkedin').href : ''
        },
        updatedAt: firebase.firestore.FieldValue.serverTimestamp()
    };
    
    // Firebase'e ekle
    db.collection('settings').doc('site').set(settingsData)
        .then(() => {
            updateStatus('Site ayarları başarıyla aktarıldı.');
        })
        .catch(error => {
            console.error('Ayarlar aktarılırken hata:', error);
            updateStatus(`Ayarlar aktarılırken hata: ${error.message}`, true);
        });
}

// Tüm verileri aktar
function migrateAll() {
    updateStatus('Tüm veriler aktarılıyor... Bu işlem biraz zaman alabilir.');
    
    // Sırayla tüm aktarım fonksiyonlarını çağır
    migrateProjects();
    setTimeout(() => migrateServices(), 2000);
    setTimeout(() => migrateTeam(), 4000);
    setTimeout(() => migrateGallery(), 6000);
    setTimeout(() => migratePages(), 8000);
    setTimeout(() => migrateSettings(), 10000);
    
    // Final durum mesajı
    setTimeout(() => {
        updateStatus('Tüm veri aktarım işlemleri tamamlandı! Admin panelinden kontrol edebilirsiniz.');
    }, 12000);
}

// Slug oluşturma yardımcı fonksiyonu
function generateSlug(text) {
    return text
        .toString()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .toLowerCase()
        .trim()
        .replace(/\s+/g, '-')
        .replace(/[^\w\-]+/g, '')
        .replace(/\-\-+/g, '-');
}

// Hata mesajı göster
function showError(message) {
    alert('Hata: ' + message);
} 