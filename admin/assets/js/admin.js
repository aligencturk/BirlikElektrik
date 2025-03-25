// Admin paneli için Firebase entegrasyonu ve yönetim işlevleri

// DOM yüklendikten sonra çalış
document.addEventListener('DOMContentLoaded', function() {
    // Firebase kontrol et
    if (typeof firebase !== 'undefined') {
        if (typeof firebase.auth === 'function') {
            // Oturum durumunu kontrol et
            firebase.auth().onAuthStateChanged(function(user) {
                if (user) {
                    // Kullanıcı oturum açmış
                    console.log('Oturum açıldı:', user.email);
                    loadUserInfo(user);
                    updateUnreadMessagesCount();
                    initializeDarkMode();
                    setupSidebar();
                } else {
                    // Kullanıcı oturum açmamış, login sayfasına yönlendir
                    if (!window.location.href.includes('login.html')) {
                        window.location.href = 'login.html';
                    }
                }
            });
        } else {
            console.error('Firebase auth modülü bulunamadı! Lütfen firebase-auth.js dosyasının yüklendiğinden emin olun.');
            // Sayfa içeriğini yine de yükle, auth olmadan da temel işlevler çalışsın
            initializeDarkMode();
            setupSidebar();
        }
    } else {
        console.error('Firebase yüklenemedi! Lütfen firebase-app.js ve diğer dosyaların yüklendiğinden emin olun.');
        // Sayfa içeriğini yine de yükle, firebase olmadan da temel işlevler çalışsın
        initializeDarkMode();
        setupSidebar();
    }
    
    // Çıkış düğmesi kontrolü
    const logoutButton = document.getElementById('logoutButton');
    if (logoutButton) {
        logoutButton.addEventListener('click', function() {
            firebase.auth().signOut().then(function() {
                // Çıkış başarılı
                window.location.href = 'login.html';
            }).catch(function(error) {
                // Hata oluştu
                showAlert('Çıkış yapılırken bir hata oluştu: ' + error.message, 'error');
            });
        });
    }
});

// Kullanıcı bilgilerini yükle
function loadUserInfo(user) {
    const db = firebase.firestore();
    
    // Kullanıcı e-postasını göster
    const userEmailEl = document.getElementById('userEmail');
    if (userEmailEl) userEmailEl.textContent = user.email;
    
    // Veritabanından admin bilgilerini al
    db.collection('admins').doc(user.uid).get()
        .then(function(doc) {
            if (doc.exists && doc.data()) {
                const userData = doc.data();
                
                // Kullanıcı adını göster
                const userNameEl = document.getElementById('userName');
                if (userNameEl) userNameEl.textContent = userData.name || 'Admin Kullanıcı';
                
                // Kullanıcı baş harflerini avatar olarak göster
                const userInitialsEl = document.getElementById('userInitials');
                if (userInitialsEl) {
                    const initials = getInitials(userData.name || 'Admin Kullanıcı');
                    userInitialsEl.textContent = initials;
                }
            }
        })
        .catch(function(error) {
            console.error('Kullanıcı bilgileri alınamadı:', error);
        });
}

// İsimden baş harfleri al
function getInitials(name) {
    return name
        .split(' ')
        .map(word => word.charAt(0))
        .join('')
        .toUpperCase()
        .substring(0, 2);
}

// Okunmamış mesaj sayısını güncelle
function updateUnreadMessagesCount() {
    const db = firebase.firestore();
    
    db.collection('messages').where('read', '==', false).get()
        .then(function(querySnapshot) {
            const count = querySnapshot.size;
            const badge = document.getElementById('unreadMessagesBadge');
            if (badge) {
                badge.textContent = count;
                badge.style.display = count > 0 ? 'flex' : 'none';
            }
        })
        .catch(function(error) {
            console.error('Okunmamış mesaj sayısı alınamadı:', error);
        });
}

// Karanlık Mod İşlevi
function initializeDarkMode() {
    const darkModeToggle = document.getElementById('darkModeToggle');
    const darkModeIcon = darkModeToggle ? darkModeToggle.querySelector('i') : null;
    
    // Kaydedilmiş tercihi al
    const isDarkMode = localStorage.getItem('darkMode') === 'true';
    
    // Tercih varsa uygula
    if (isDarkMode) {
        document.body.classList.add('dark-mode');
        if (darkModeIcon) {
            darkModeIcon.classList.remove('fa-moon');
            darkModeIcon.classList.add('fa-sun');
        }
    }
    
    // Karanlık mod değiştirme
    if (darkModeToggle) {
        darkModeToggle.addEventListener('click', function() {
            document.body.classList.toggle('dark-mode');
            const isDark = document.body.classList.contains('dark-mode');
            
            // Tercihi kaydet
            localStorage.setItem('darkMode', isDark);
            
            // İkonu güncelle
            if (darkModeIcon) {
                if (isDark) {
                    darkModeIcon.classList.remove('fa-moon');
                    darkModeIcon.classList.add('fa-sun');
                } else {
                    darkModeIcon.classList.remove('fa-sun');
                    darkModeIcon.classList.add('fa-moon');
                }
            }
        });
    }
}

// Sidebar İşlevleri
function setupSidebar() {
    const sidebarToggle = document.getElementById('sidebarToggle');
    const sidebar = document.getElementById('sidebar');
    const mobileMenuToggle = document.getElementById('mobileMenuToggle');
    
    // Kaydedilmiş tercihi al
    const isCollapsed = localStorage.getItem('sidebarCollapsed') === 'true';
    
    // Tercih varsa uygula
    if (isCollapsed && window.innerWidth > 992) {
        sidebar.classList.add('collapsed');
        document.querySelector('.admin-main').style.marginLeft = 'var(--sidebar-collapsed-width)';
    }
    
    // Sidebar genişlik değiştirme (desktop)
    if (sidebarToggle) {
        sidebarToggle.addEventListener('click', function() {
            sidebar.classList.toggle('collapsed');
            const isNowCollapsed = sidebar.classList.contains('collapsed');
            
            // Tercihi kaydet
            localStorage.setItem('sidebarCollapsed', isNowCollapsed);
            
            // Ana içeriğin margin'ini ayarla
            if (window.innerWidth > 992) {
                document.querySelector('.admin-main').style.marginLeft = isNowCollapsed ? 
                    'var(--sidebar-collapsed-width)' : 'var(--sidebar-width)';
            }
        });
    }
    
    // Mobil menü toggle
    if (mobileMenuToggle && sidebar) {
        mobileMenuToggle.addEventListener('click', function() {
            sidebar.classList.toggle('expanded');
        });
    }
    
    // Sidebar dışına tıklandığında mobilde kapansın
    document.addEventListener('click', function(event) {
        if (window.innerWidth <= 992 && 
            sidebar && 
            sidebar.classList.contains('expanded') &&
            !sidebar.contains(event.target) && 
            event.target !== mobileMenuToggle) {
            sidebar.classList.remove('expanded');
        }
    });
}

// Bildirim Gösterme Fonksiyonu
function showAlert(message, type = 'info') {
    const alertsContainer = document.querySelector('.admin-alerts');
    if (!alertsContainer) return;
    
    const alertEl = document.createElement('div');
    alertEl.className = `admin-alert admin-alert-${type} fade-in`;
    
    const icon = type === 'success' ? 'check-circle' : 
                type === 'error' ? 'exclamation-circle' : 
                type === 'warning' ? 'exclamation-triangle' : 'info-circle';
    
    alertEl.innerHTML = `
        <i class="fas fa-${icon}"></i>
        <div>${message}</div>
        <button class="admin-alert-close"><i class="fas fa-times"></i></button>
    `;
    
    alertsContainer.appendChild(alertEl);
    
    // Kapatma düğmesi
    const closeBtn = alertEl.querySelector('.admin-alert-close');
    if (closeBtn) {
        closeBtn.addEventListener('click', function() {
            alertEl.style.opacity = '0';
            setTimeout(() => {
                alertsContainer.removeChild(alertEl);
            }, 300);
        });
    }
    
    // Otomatik kapanma
    setTimeout(() => {
        if (alertEl.parentNode) {
            alertEl.style.opacity = '0';
            setTimeout(() => {
                if (alertEl.parentNode) {
                    alertsContainer.removeChild(alertEl);
                }
            }, 300);
        }
    }, 5000);
}

// Tarihi formatla
function formatDate(timestamp) {
    if (!timestamp) return 'Belirtilmemiş';
    
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    
    return new Intl.DateTimeFormat('tr-TR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
    }).format(date);
}

// Zaman damgasını formatla
function formatDateTime(timestamp) {
    if (!timestamp) return 'Belirtilmemiş';
    
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    
    return new Intl.DateTimeFormat('tr-TR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    }).format(date);
}

// Kısa zaman gösterimi
function timeAgo(timestamp) {
    if (!timestamp) return '';
    
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    const now = new Date();
    const diffInSeconds = Math.floor((now - date) / 1000);
    
    if (diffInSeconds < 60) {
        return 'Az önce';
    }
    
    const diffInMinutes = Math.floor(diffInSeconds / 60);
    if (diffInMinutes < 60) {
        return `${diffInMinutes} dakika önce`;
    }
    
    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) {
        return `${diffInHours} saat önce`;
    }
    
    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays < 7) {
        return `${diffInDays} gün önce`;
    }
    
    // 7 günden eski ise normal tarih göster
    return formatDate(date);
}

// Dosya yükleme işlevi
async function uploadFile(file, path) {
    if (!file) return null;
    
    const storage = firebase.storage();
    const storageRef = storage.ref();
    const fileRef = storageRef.child(path);
    
    try {
        // Dosyayı yükle
        const snapshot = await fileRef.put(file);
        // Dosya URL'ini al
        const downloadURL = await snapshot.ref.getDownloadURL();
        return downloadURL;
    } catch (error) {
        console.error('Dosya yükleme hatası:', error);
        showAlert('Dosya yüklenirken bir hata oluştu: ' + error.message, 'error');
        return null;
    }
}

// Dosya silme işlevi
async function deleteFile(fileURL) {
    if (!fileURL) return;
    
    try {
        const storage = firebase.storage();
        const fileRef = storage.refFromURL(fileURL);
        await fileRef.delete();
        console.log('Dosya silindi:', fileURL);
    } catch (error) {
        console.error('Dosya silme hatası:', error);
    }
}

// Yükle Butonu Aktifleştirme
function setupFileUpload(inputId, previewId, defaultImageURL = '') {
    const fileInput = document.getElementById(inputId);
    const previewContainer = document.getElementById(previewId);
    
    if (!fileInput || !previewContainer) return;
    
    // Varsayılan görsel varsa göster
    if (defaultImageURL) {
        previewContainer.innerHTML = `<img src="${defaultImageURL}" alt="Görsel Önizleme">`;
        previewContainer.style.display = 'block';
    }
    
    fileInput.addEventListener('change', function(e) {
        const file = e.target.files[0];
        if (!file) return;
        
        // Dosya türünü kontrol et
        if (!file.type.match('image.*')) {
            showAlert('Lütfen sadece resim dosyaları yükleyin.', 'warning');
            return;
        }
        
        // Dosya boyutunu kontrol et (max 5MB)
        if (file.size > 5 * 1024 * 1024) {
            showAlert('Dosya boyutu 5MB\'dan küçük olmalıdır.', 'warning');
            return;
        }
        
        // Önizleme göster
        const reader = new FileReader();
        reader.onload = function(e) {
            previewContainer.innerHTML = `<img src="${e.target.result}" alt="Görsel Önizleme">`;
            previewContainer.style.display = 'block';
        };
        reader.readAsDataURL(file);
    });
}
