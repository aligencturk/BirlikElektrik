// Web sitesindeki verileri Firebase'e aktarma scripti

// NOT: Değişkenler admin.js'den alınacak, tekrar tanımlamıyoruz

// DOM yüklendikten sonra çalış - Bu fonksiyon admin.js içinde zaten çağrıldığı için
// mevcut yükleme olayına bağlanıyoruz
document.addEventListener('DOMContentLoaded', function() {
    // Veri aktarımı için UI ekle
    setupDataMigrationUI();
});

// Veri aktarımı için UI ekle
function setupDataMigrationUI() {
    const container = document.getElementById('dataMigrationContainer');
    if (!container) return;

    container.innerHTML = `
        <div class="migration-panel">
            <h2>Veri Aktarımı</h2>
            <p>Aşağıdaki düğmeler ile web sitesindeki mevcut verileri Firebase veritabanına aktarabilirsiniz.</p>
            
            <div class="migration-actions">
                <button id="migrateProjects" class="btn btn-primary">
                    <i class="fas fa-project-diagram"></i>
                    Projeleri Aktar
                </button>
                <button id="migrateServices" class="btn btn-primary">
                    <i class="fas fa-cogs"></i>
                    Hizmetleri Aktar
                </button>
                <button id="migrateTeam" class="btn btn-primary">
                    <i class="fas fa-users"></i>
                    Ekip Üyelerini Aktar
                </button>
                <button id="migrateGallery" class="btn btn-primary">
                    <i class="fas fa-images"></i>
                    Galeriyi Aktar
                </button>
                <button id="migratePages" class="btn btn-primary">
                    <i class="fas fa-file-alt"></i>
                    Sayfaları Aktar
                </button>
                <button id="migrateSettings" class="btn btn-primary">
                    <i class="fas fa-cog"></i>
                    Ayarları Aktar
                </button>
                <button id="migrateAll" class="btn btn-success">
                    <i class="fas fa-sync-alt"></i>
                    Tümünü Aktar
                </button>
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
    
    // İkon ekle
    const icon = isError ? 'fa-times-circle' : 'fa-check-circle';
    const iconColor = isError ? 'text-danger' : 'text-success';
    
    messageElement.innerHTML = `
        <div class="d-flex align-items-center">
            <i class="fas ${icon} ${iconColor} me-2"></i>
            <div>
                <span class="timestamp">${new Date().toLocaleTimeString()}</span>
                <span class="message">${message}</span>
            </div>
        </div>
    `;
    
    // Yeni mesajı en üste ekle
    statusContainer.insertBefore(messageElement, statusContainer.firstChild);
    
    // Metin yerine içerik yoksa "Henüz aktarım yapılmadı" yazısını kaldır
    const noActivityText = statusContainer.querySelector('p');
    if (noActivityText) {
        statusContainer.removeChild(noActivityText);
    }
    
    // Animasyon ekle
    setTimeout(() => {
        messageElement.classList.add('show');
    }, 10);
}

// Projeleri aktar
function migrateProjects() {
    if (!db) {
        updateStatus('Firebase bağlantısı kurulamadı!', true);
        return;
    }
    
    // Yükleme göstergesini başlat
    const button = document.getElementById('migrateProjects');
    setButtonLoading(button, true);
    
    updateStatus('Projeler aktarılıyor...');
    
    // HTML'den proje verilerini çek
    const projectElements = document.querySelectorAll('.project-item');
    if (!projectElements.length) {
        updateStatus('Web sitesinde proje bulunamadı!', true);
        setButtonLoading(button, false);
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
                    setButtonLoading(button, false);
                }
            })
            .catch(error => {
                console.error('Proje aktarılırken hata:', error);
                updateStatus(`Proje aktarılırken hata: ${error.message}`, true);
                setButtonLoading(button, false);
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
    // Tüm butonları devre dışı bırak
    const buttons = document.querySelectorAll('.migration-actions .btn');
    buttons.forEach(button => {
        button.disabled = true;
    });
    
    // "Tümünü Aktar" butonunu yükleme durumuna getir
    const allButton = document.getElementById('migrateAll');
    setButtonLoading(allButton, true);
    
    updateStatus('Tüm veriler aktarılıyor... Bu işlem biraz zaman alabilir.');
    
    // Sırayla tüm aktarım fonksiyonlarını çağır
    const processProject = () => {
        updateStatus('Projeler aktarılıyor...');
        const projectBtn = document.getElementById('migrateProjects');
        setButtonLoading(projectBtn, true);
        
        return new Promise((resolve) => {
            // Proje aktarımını yap
            const projectElements = document.querySelectorAll('.project-item');
            if (!projectElements.length) {
                updateStatus('Web sitesinde proje bulunamadı!', true);
                setButtonLoading(projectBtn, false);
                resolve();
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
                            setButtonLoading(projectBtn, false);
                            resolve();
                        }
                    })
                    .catch(error => {
                        console.error('Proje aktarılırken hata:', error);
                        updateStatus(`Proje aktarılırken hata: ${error.message}`, true);
                        setButtonLoading(projectBtn, false);
                        resolve();
                    });
            });
            
            // Eğer hiç proje yoksa hemen tamamla
            if (totalCount === 0) {
                resolve();
            }
        });
    };
    
    // Diğer aktarım fonksiyonları için benzer Promise fonksiyonları oluşturun
    
    // Sırayla işlemleri çalıştır
    processProject()
        .then(() => {
            // Diğer işlemleri de sırayla çağırın...
            setTimeout(() => migrateServices(), 1000);
            setTimeout(() => migrateTeam(), 2000);
            setTimeout(() => migrateGallery(), 3000);
            setTimeout(() => migratePages(), 4000);
            setTimeout(() => migrateSettings(), 5000);
            
            // Final durum mesajı
            setTimeout(() => {
                updateStatus('Tüm veri aktarım işlemleri tamamlandı! Admin panelinden kontrol edebilirsiniz.');
                setButtonLoading(allButton, false);
                
                // Tüm butonları tekrar aktif et
                buttons.forEach(button => {
                    button.disabled = false;
                });
            }, 6000);
        });
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

// Hata mesajı göster - admin.js'de aynı isimde fonksiyon varsa kullan
if (typeof showError !== 'function') {
    function showError(message) {
        alert('Hata: ' + message);
    }
}

// Buton yükleme durumunu ayarla
function setButtonLoading(button, isLoading) {
    if (!button) return;
    
    const originalText = button.getAttribute('data-original-text') || button.innerHTML;
    
    if (isLoading) {
        // Orijinal metni sakla
        button.setAttribute('data-original-text', originalText);
        button.disabled = true;
        button.innerHTML = `<span class="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span> İşleniyor...`;
    } else {
        // Orijinal metni geri yükle
        button.innerHTML = originalText;
        button.disabled = false;
    }
}

// Web sayfasından doğrudan veri aktarma fonksiyonları
document.addEventListener('DOMContentLoaded', function() {
    // Olay dinleyicilerini ekle
    setupDirectImportUI();
});

// Doğrudan aktarım için UI ve event listener'ları kurulumu
function setupDirectImportUI() {
    const fetchButton = document.getElementById('fetchPageData');
    const startImportButton = document.getElementById('startDirectImport');
    const selectAllButton = document.getElementById('selectAllItems');
    const deselectAllButton = document.getElementById('deselectAllItems');
    
    if (fetchButton) {
        fetchButton.addEventListener('click', fetchPageData);
    }
    
    if (startImportButton) {
        startImportButton.addEventListener('click', startDirectImport);
    }
    
    if (selectAllButton) {
        selectAllButton.addEventListener('click', function() {
            const checkboxes = document.querySelectorAll('#pageDataList input[type="checkbox"]');
            checkboxes.forEach(checkbox => checkbox.checked = true);
            updateImportButtonState();
        });
    }
    
    if (deselectAllButton) {
        deselectAllButton.addEventListener('click', function() {
            const checkboxes = document.querySelectorAll('#pageDataList input[type="checkbox"]');
            checkboxes.forEach(checkbox => checkbox.checked = false);
            updateImportButtonState();
        });
    }
}

// Web sayfasındaki verileri getir
function fetchPageData() {
    const sourceUrl = document.getElementById('sourceUrl').value.trim();
    
    if (!sourceUrl) {
        showAlert('Lütfen bir URL girin', 'error');
        return;
    }
    
    // URL'nin geçerli olduğunu kontrol et
    try {
        new URL(sourceUrl);
    } catch (e) {
        showAlert('Geçersiz URL formatı', 'error');
        return;
    }
    
    // Yükleniyor göstergesini başlat
    const fetchButton = document.getElementById('fetchPageData');
    setButtonLoading(fetchButton, true);
    
    // CORS sorununu aşmak için iframe yaklaşımı - Aynı domain'deki sayfalar için etkili
    const iframe = document.createElement('iframe');
    iframe.style.display = 'none';
    iframe.src = sourceUrl;
    
    // iFrame yüklendiğinde verileri işle
    iframe.onload = function() {
        try {
            // Sayfa içeriğine erişim
            const iframeDocument = iframe.contentDocument || iframe.contentWindow.document;
            
            // Sayfa içerisindeki hizmet kartlarını bul ve işle
            processServiceCards(iframeDocument);
            
            // İşlem tamamlandı
            setButtonLoading(fetchButton, false);
            
            // iframe'i kaldır
            document.body.removeChild(iframe);
            
        } catch (error) {
            console.error('Sayfa verisi çekilirken hata oluştu:', error);
            showAlert('Sayfa verisi çekilirken bir hata oluştu. CORS kısıtlamaları olabilir.', 'error');
            setButtonLoading(fetchButton, false);
            
            // iframe'i kaldır
            if (iframe.parentNode) {
                document.body.removeChild(iframe);
            }
        }
    };
    
    // İframe yüklenme hatası
    iframe.onerror = function() {
        showAlert('Sayfa yüklenemedi. URL doğru mu?', 'error');
        setButtonLoading(fetchButton, false);
        
        // iframe'i kaldır
        if (iframe.parentNode) {
            document.body.removeChild(iframe);
        }
    };
    
    // iframe'i sayfaya ekle
    document.body.appendChild(iframe);
}

// Sayfadaki hizmet kartlarını işle ve göster
function processServiceCards(doc) {
    const serviceCards = doc.querySelectorAll('.service-card');
    const pageDataList = document.getElementById('pageDataList');
    const dataCountElement = document.getElementById('dataFoundCount');
    const dataPreview = document.getElementById('dataPreview');
    
    // Sonuç alanını temizle
    if (pageDataList) {
        pageDataList.innerHTML = '';
    }
    
    // Veri önizleme alanını göster
    if (dataPreview) {
        dataPreview.style.display = 'block';
    }
    
    if (serviceCards.length === 0) {
        if (pageDataList) {
            pageDataList.innerHTML = '<div class="alert alert-warning">Bu sayfada herhangi bir hizmet kartı bulunamadı.</div>';
        }
        if (dataCountElement) {
            dataCountElement.textContent = '0';
        }
        return;
    }
    
    // Bulunan hizmet sayısını güncelle
    if (dataCountElement) {
        dataCountElement.textContent = serviceCards.length;
    }
    
    // Her hizmet kartı için önizleme oluştur
    serviceCards.forEach((card, index) => {
        let icon = '';
        let title = '';
        let description = '';
        
        // Simge bilgisini al
        const iconElement = card.querySelector('.service-icon i, .service-icon svg');
        if (iconElement) {
            icon = iconElement.className || iconElement.outerHTML;
        }
        
        // Başlık bilgisini al
        const titleElement = card.querySelector('.service-title, h3, h4');
        if (titleElement) {
            title = titleElement.textContent.trim();
        }
        
        // Açıklama bilgisini al
        const descElement = card.querySelector('.service-description, p');
        if (descElement) {
            description = descElement.textContent.trim();
        }
        
        // Veri önizleme kartını oluştur
        const cardHtml = `
            <div class="admin-preview-card">
                <div class="admin-preview-checkbox">
                    <input type="checkbox" id="service-${index}" class="import-item" checked 
                           data-icon="${icon}" 
                           data-title="${title}" 
                           data-description="${description}"
                           data-category="Genel">
                </div>
                <div class="admin-preview-icon">
                    <i class="${icon.includes('fa-') ? icon : 'fas fa-cogs'}"></i>
                </div>
                <div class="admin-preview-content">
                    <h4>${title || 'İsimsiz Hizmet'}</h4>
                    <p>${description || 'Açıklama bulunmuyor'}</p>
                </div>
            </div>
        `;
        
        // Kartı listeye ekle
        if (pageDataList) {
            pageDataList.innerHTML += cardHtml;
        }
    });
    
    // Checkboxlara olay dinleyicisi ekle
    const checkboxes = document.querySelectorAll('#pageDataList input[type="checkbox"]');
    checkboxes.forEach(checkbox => {
        checkbox.addEventListener('change', updateImportButtonState);
    });
    
    // İçe aktarma butonunun durumunu güncelle
    updateImportButtonState();
}

// İçe aktarma butonunun durumunu güncelle
function updateImportButtonState() {
    const checkboxes = document.querySelectorAll('#pageDataList input[type="checkbox"]:checked');
    const startImportButton = document.getElementById('startDirectImport');
    
    if (startImportButton) {
        startImportButton.disabled = checkboxes.length === 0;
    }
}

// Direkt içe aktarmayı başlat
async function startDirectImport() {
    // Firebase kontrolü
    if (typeof firebase === 'undefined') {
        showAlert('Firebase yüklenemedi. Sayfayı yenileyin ve tekrar deneyin.', 'error');
        return;
    }

    if (typeof firebase.firestore !== 'function') {
        showAlert('Firebase Firestore modülü yüklenemedi. Sayfayı yenileyin ve tekrar deneyin.', 'error');
        return;
    }
    
    // Seçili öğeleri al
    const selectedItems = document.querySelectorAll('#pageDataList input[type="checkbox"]:checked');
    
    if (selectedItems.length === 0) {
        showAlert('Lütfen içe aktarılacak en az bir hizmet seçin.', 'warning');
        return;
    }
    
    // Toplam ve işlenecek öğe sayısı
    const totalCount = selectedItems.length;
    let processedCount = 0;
    let successCount = 0;
    let errorCount = 0;
    
    // İlerleme çubuğu ve sonuç alanını göster
    const progressContainer = document.getElementById('importProgressContainer');
    const progressBar = document.getElementById('importProgressBar');
    const progressText = document.getElementById('importProgressText');
    const resultsList = document.getElementById('importResultsList');
    const resultsContainer = document.getElementById('importResultsContainer');
    
    if (progressContainer) progressContainer.style.display = 'block';
    if (resultsContainer) resultsContainer.style.display = 'block';
    if (resultsList) resultsList.innerHTML = '';
    
    // İçe aktarma butonunu devre dışı bırak
    const startImportButton = document.getElementById('startDirectImport');
    if (startImportButton) {
        setButtonLoading(startImportButton, true);
    }
    
    try {
        // Veritabanı referansı
        const db = firebase.firestore();
        const servicesCollection = db.collection('services');
        
        // İçe aktarma ayarlarını al
        const overwriteExisting = document.getElementById('overwriteExisting').checked;
        const autoActivate = document.getElementById('autoActivate').checked;
        
        // Her seçili öğe için işlem yap
        for (const item of selectedItems) {
            try {
                // Veri öğelerini al
                const icon = item.dataset.icon || 'fas fa-cogs';
                const title = item.dataset.title || 'İsimsiz Hizmet';
                const description = item.dataset.description || '';
                const category = item.dataset.category || 'Genel';
                
                // Başlık kontrol
                if (!title || title === 'İsimsiz Hizmet') {
                    throw new Error('Hizmet başlığı bulunamadı');
                }
                
                // Benzersiz ID oluştur (başlıktan türetilmiş)
                const serviceId = title
                    .toLowerCase()
                    .replace(/\s+/g, '-')
                    .replace(/[^a-z0-9-]/g, '')
                    .substring(0, 30);
                
                // Mevcut hizmeti kontrol et
                let existingService = null;
                if (!overwriteExisting) {
                    const querySnapshot = await servicesCollection
                        .where('title', '==', title)
                        .limit(1)
                        .get();
                        
                    if (!querySnapshot.empty) {
                        existingService = querySnapshot.docs[0];
                    }
                }
                
                // Eğer üzerine yazma aktif değilse ve hizmet mevcutsa atla
                if (!overwriteExisting && existingService) {
                    // Sonuca ekle (zaten mevcut)
                    if (resultsList) {
                        resultsList.innerHTML += `
                            <div class="admin-result-item warning">
                                <span class="result-title">${title}</span>
                                <span class="result-status">
                                    <i class="fas fa-exclamation-triangle"></i>
                                    Zaten mevcut
                                </span>
                            </div>
                        `;
                    }
                } else {
                    // Yeni hizmet verisi
                    const serviceData = {
                        icon: icon,
                        title: title,
                        description: description,
                        category: category,
                        status: autoActivate ? 'active' : 'inactive',
                        updatedAt: firebase.firestore.FieldValue.serverTimestamp()
                    };
                    
                    // Eğer yeni ekleme ise createdAt alanını ekle
                    if (!existingService) {
                        serviceData.createdAt = firebase.firestore.FieldValue.serverTimestamp();
                    }
                    
                    // Veritabanına ekle veya güncelle
                    if (existingService) {
                        await servicesCollection.doc(existingService.id).update(serviceData);
                    } else {
                        await servicesCollection.doc(serviceId).set(serviceData);
                    }
                    
                    // Başarılı sonucu ekle
                    successCount++;
                    if (resultsList) {
                        resultsList.innerHTML += `
                            <div class="admin-result-item success">
                                <span class="result-title">${title}</span>
                                <span class="result-status">
                                    <i class="fas fa-check-circle"></i>
                                    ${existingService ? 'Güncellendi' : 'Eklendi'}
                                </span>
                            </div>
                        `;
                    }
                }
            } catch (error) {
                console.error('Hizmet içe aktarma hatası:', error);
                
                // Hata sonucunu ekle
                errorCount++;
                if (resultsList) {
                    resultsList.innerHTML += `
                        <div class="admin-result-item error">
                            <span class="result-title">${item.dataset.title || 'Bilinmeyen Hizmet'}</span>
                            <span class="result-status">
                                <i class="fas fa-times-circle"></i>
                                Hata: ${error.message}
                            </span>
                        </div>
                    `;
                }
            }
            
            // İşlenen sayısını artır ve ilerleme çubuğunu güncelle
            processedCount++;
            const progress = Math.round((processedCount / totalCount) * 100);
            
            if (progressBar) progressBar.style.width = `${progress}%`;
            if (progressText) progressText.textContent = `${processedCount}/${totalCount} hizmet işlendi (${successCount} başarılı, ${errorCount} hatalı)`;
        }
    } catch (mainError) {
        console.error('Toplu içe aktarma hatası:', mainError);
        showAlert(`İçe aktarma sırasında kritik bir hata oluştu: ${mainError.message}`, 'error');
    } finally {
        // İşlem tamamlandı
        if (startImportButton) {
            setButtonLoading(startImportButton, false);
        }
        
        // Sonuç mesajı göster
        showAlert(`İçe aktarma tamamlandı: ${totalCount} hizmet işlendi (${successCount} başarılı, ${errorCount} hatalı)`, 
            errorCount > 0 ? 'warning' : 'success');
    }
}

// Bildirim göster
function showAlert(message, type = 'info') {
    const alertContainer = document.getElementById('alertContainer');
    if (!alertContainer) return;
    
    const alertBox = document.createElement('div');
    alertBox.className = `alert alert-${type}`;
    alertBox.innerHTML = `
        <div class="alert-content">
            <div class="alert-icon">
                <i class="fas fa-${type === 'success' ? 'check-circle' : type === 'error' ? 'exclamation-circle' : type === 'warning' ? 'exclamation-triangle' : 'info-circle'}"></i>
            </div>
            <div class="alert-message">${message}</div>
            <button type="button" class="alert-close"><i class="fas fa-times"></i></button>
        </div>
    `;
    
    // Kapatma düğmesine olay dinleyicisi ekle
    const closeButton = alertBox.querySelector('.alert-close');
    if (closeButton) {
        closeButton.addEventListener('click', function() {
            alertContainer.removeChild(alertBox);
        });
    }
    
    // Alerti ekle
    alertContainer.appendChild(alertBox);
    
    // 5 saniye sonra otomatik kapat
    setTimeout(() => {
        if (alertBox.parentNode === alertContainer) {
            alertContainer.removeChild(alertBox);
        }
    }, 5000);
} 