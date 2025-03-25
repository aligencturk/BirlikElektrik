// Dashboard - Birlik Elektrik Admin Paneli
document.addEventListener('DOMContentLoaded', function() {
    // Firebase oturumunun açık olduğunu kontrol et
    firebase.auth().onAuthStateChanged(function(user) {
        if (user) {
            loadDashboardData();
        }
    });
});

// Dashboard verilerini yükle
function loadDashboardData() {
    const db = firebase.firestore();
    
    // İstatistik sayaçlarını al
    loadStatisticCounts(db);
    
    // Son projeleri yükle
    loadRecentProjects(db);
    
    // Son mesajları yükle
    loadRecentMessages(db);
    
    // Ziyaretçi istatistiklerini yükle
    loadVisitorStats(db);
}

// İstatistik sayaçları
function loadStatisticCounts(db) {
    // Projeler sayısı
    db.collection('projects').get().then(snapshot => {
        document.getElementById('totalProjectsCount').textContent = snapshot.size;
    }).catch(error => {
        console.error('Projeler sayısı alınamadı:', error);
        document.getElementById('totalProjectsCount').textContent = '0';
    });
    
    // Mesajlar sayısı
    db.collection('messages').get().then(snapshot => {
        document.getElementById('totalMessagesCount').textContent = snapshot.size;
    }).catch(error => {
        console.error('Mesajlar sayısı alınamadı:', error);
        document.getElementById('totalMessagesCount').textContent = '0';
    });
    
    // Hizmetler sayısı
    db.collection('services').get().then(snapshot => {
        document.getElementById('totalServicesCount').textContent = snapshot.size;
    }).catch(error => {
        console.error('Hizmetler sayısı alınamadı:', error);
        document.getElementById('totalServicesCount').textContent = '0';
    });
    
    // Ziyaretçi sayısı (son 30 gün)
    // Burada firebase analytics veya özel ziyaretçi koleksiyonu kullanılabilir
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    
    db.collection('visitors')
        .where('date', '>=', thirtyDaysAgo)
        .get()
        .then(snapshot => {
            // Benzersiz ziyaretçi sayısını bul
            const uniqueVisitors = new Set();
            snapshot.forEach(doc => {
                const visitorData = doc.data();
                if (visitorData.visitorId) {
                    uniqueVisitors.add(visitorData.visitorId);
                }
            });
            document.getElementById('totalVisitorsCount').textContent = uniqueVisitors.size;
        }).catch(error => {
            console.error('Ziyaretçi sayısı alınamadı:', error);
            document.getElementById('totalVisitorsCount').textContent = '0';
        });
}

// Son eklenen projeler
function loadRecentProjects(db) {
    const recentProjectsElement = document.getElementById('recentProjects');
    if (!recentProjectsElement) return;

    db.collection('projects')
        .orderBy('createdAt', 'desc')
        .limit(3)
        .get()
        .then(snapshot => {
            if (snapshot.empty) {
                recentProjectsElement.innerHTML = '<p class="text-center">Henüz proje eklenmemiş.</p>';
                return;
            }

            let projectsHTML = '';
            
            snapshot.forEach(doc => {
                const project = doc.data();
                projectsHTML += `
                    <div class="admin-table-project fade-in">
                        <div class="admin-table-project-image">
                            <img src="${project.imageUrl || 'assets/img/project-placeholder.jpg'}" alt="${project.title}">
                        </div>
                        <div class="admin-table-project-info">
                            <h4>${project.title || 'İsimsiz Proje'}</h4>
                            <p>${project.status === 'completed' ? 'Tamamlandı' : project.status === 'active' ? 'Devam Ediyor' : 'Beklemede'}</p>
                            <div class="admin-progress">
                                <div class="admin-progress-bar admin-bg-${project.status === 'completed' ? 'success' : 'warning'}" style="width: ${project.progress || 0}%"></div>
                            </div>
                        </div>
                    </div>
                `;
            });
            
            recentProjectsElement.innerHTML = projectsHTML;
        })
        .catch(error => {
            console.error('Son projeler alınamadı:', error);
            recentProjectsElement.innerHTML = '<p class="text-center text-danger">Projeler yüklenirken bir hata oluştu.</p>';
        });
}

// Son mesajlar
function loadRecentMessages(db) {
    const recentMessagesElement = document.getElementById('recentMessages');
    if (!recentMessagesElement) return;

    db.collection('messages')
        .orderBy('createdAt', 'desc')
        .limit(3)
        .get()
        .then(snapshot => {
            if (snapshot.empty) {
                recentMessagesElement.innerHTML = '<p class="text-center">Henüz mesaj alınmamış.</p>';
                return;
            }

            let messagesHTML = '';
            
            snapshot.forEach(doc => {
                const message = doc.data();
                const messageDate = message.createdAt ? timeAgo(message.createdAt) : 'Belirtilmemiş';
                
                messagesHTML += `
                    <div class="admin-message-item ${message.read ? '' : 'unread'} fade-in" data-id="${doc.id}">
                        <div class="admin-message-status">
                            <i class="fas fa-${message.read ? 'envelope-open' : 'envelope'}"></i>
                        </div>
                        <div class="admin-message-content">
                            <div class="admin-message-header">
                                <div class="admin-message-info">
                                    <h3 class="admin-message-sender">${message.name || 'İsimsiz'}</h3>
                                    <span class="admin-message-date">${messageDate}</span>
                                </div>
                            </div>
                            <div class="admin-message-subject">${message.subject || 'Konu Belirtilmemiş'}</div>
                            <div class="admin-message-preview">${message.message ? message.message.substring(0, 80) + '...' : 'İçerik yok'}</div>
                        </div>
                    </div>
                `;
            });
            
            recentMessagesElement.innerHTML = messagesHTML;
            
            // Mesajlara tıklandığında mesajlar sayfasına yönlendir
            document.querySelectorAll('#recentMessages .admin-message-item').forEach(item => {
                item.addEventListener('click', function() {
                    const messageId = this.getAttribute('data-id');
                    window.location.href = `messages.html?id=${messageId}`;
                });
            });
        })
        .catch(error => {
            console.error('Son mesajlar alınamadı:', error);
            recentMessagesElement.innerHTML = '<p class="text-center text-danger">Mesajlar yüklenirken bir hata oluştu.</p>';
        });
}

// Ziyaretçi istatistikleri
function loadVisitorStats(db) {
    const visitorChartElement = document.getElementById('visitorStats');
    if (!visitorChartElement) return;

    // Son 7 günün tarihleri
    const dates = [];
    const counts = [];
    
    for (let i = 6; i >= 0; i--) {
        const date = new Date();
        date.setDate(date.getDate() - i);
        
        const formattedDate = new Intl.DateTimeFormat('tr-TR', {
            day: '2-digit',
            month: '2-digit'
        }).format(date);
        
        dates.push(formattedDate);
        
        // Veritabanında o güne ait kayıt yoksa varsayılan olarak 0 ata
        counts.push(Math.floor(Math.random() * 50) + 10); // Örnek veri
    }
    
    // Ziyaretçi istatistiklerini çizim için hazırla
    visitorChartElement.innerHTML = `
        <div class="admin-visitor-chart">
            <div class="admin-chart-labels">
                ${dates.map(date => `<div class="admin-chart-label">${date}</div>`).join('')}
            </div>
            <div class="admin-chart-bars">
                ${counts.map(count => `
                    <div class="admin-chart-bar-container" title="${count} ziyaretçi">
                        <div class="admin-chart-bar" style="height: ${count * 2}px;"></div>
                        <div class="admin-chart-value">${count}</div>
                    </div>
                `).join('')}
            </div>
        </div>
    `;
} 