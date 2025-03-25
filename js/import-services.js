// Hizmetleri Veritabanına Aktarma Scripti

// Sayfa yüklendiğinde çalıştıran kod butonla ilgili olduğu için kaldırıldı
// Bu özellik artık sadece admin panelinden erişilebilir

// Hizmetleri veritabanına aktar
function importServicesToFirebase() {
    // Firebase'in yüklendiğini kontrol et
    if (typeof firebase === 'undefined' || !firebase.firestore) {
        alert('Firebase yüklenemedi. Lütfen internet bağlantınızı kontrol edin.');
        return;
    }
    
    // Firestore referansı al
    const db = firebase.firestore();
    
    // DOM'dan hizmet kartlarını bul
    const serviceCards = document.querySelectorAll('.service-card');
    if (serviceCards.length === 0) {
        alert('Sayfada hizmet kartı bulunamadı.');
        return;
    }
    
    // Her hizmet kartı için veritabanına kayıt yapalım
    let importedCount = 0;
    let errorCount = 0;
    
    // Onay mesajı göster
    const confirmImport = confirm(`${serviceCards.length} adet hizmet kartı bulundu. Veritabanına aktarmak istiyor musunuz?`);
    
    if (!confirmImport) {
        return;
    }
    
    // İlerleme göstergesi oluştur
    const progressContainer = document.createElement('div');
    progressContainer.className = 'import-progress';
    progressContainer.style.position = 'fixed';
    progressContainer.style.top = '50%';
    progressContainer.style.left = '50%';
    progressContainer.style.transform = 'translate(-50%, -50%)';
    progressContainer.style.backgroundColor = 'white';
    progressContainer.style.padding = '20px';
    progressContainer.style.borderRadius = '10px';
    progressContainer.style.boxShadow = '0 4px 10px rgba(0,0,0,0.2)';
    progressContainer.style.zIndex = '10000';
    progressContainer.style.minWidth = '300px';
    progressContainer.style.textAlign = 'center';
    
    progressContainer.innerHTML = `
        <h4>Hizmetler Aktarılıyor</h4>
        <div class="progress-bar" style="height: 20px; background-color: #f3f3f3; border-radius: 10px; overflow: hidden; margin: 10px 0;">
            <div class="progress" style="height: 100%; width: 0%; background-color: #007bff; transition: width 0.3s;"></div>
        </div>
        <div class="progress-text">0/${serviceCards.length} aktarıldı</div>
    `;
    
    document.body.appendChild(progressContainer);
    
    // Promise'leri tutacak dizi
    const importPromises = [];
    
    // Her hizmet kartından veri çıkarıp Firestore'a kaydet
    serviceCards.forEach((card, index) => {
        // Hizmet verilerini DOM'dan çıkar
        const icon = card.querySelector('.service-icon i')?.className || 'fas fa-tools';
        const title = card.querySelector('h3')?.textContent || 'İsimsiz Hizmet';
        const description = card.querySelector('p')?.textContent || 'Açıklama yok';
        
        // Hizmet detay sayfası bağlantısı (id için kullanılabilir)
        const link = card.querySelector('a')?.getAttribute('href') || '';
        const serviceId = link.split('#')[1] || title.toLowerCase().replace(/\s+/g, '-');
        
        // Firestore'a kaydedilecek veri
        const serviceData = {
            icon: icon,
            title: title,
            description: description,
            detailedDescription: '', // Detaylı açıklama daha sonra editlenebilir
            category: 'Elektrik', // Varsayılan kategori
            status: 'active',
            order: index,
            createdAt: firebase.firestore.FieldValue.serverTimestamp()
        };
        
        // Hizmetin daha önce var olup olmadığını kontrol et
        const checkPromise = db.collection('services')
            .where('title', '==', title)
            .get()
            .then(snapshot => {
                if (!snapshot.empty) {
                    // Zaten var, güncelle
                    const docId = snapshot.docs[0].id;
                    return db.collection('services').doc(docId).update({
                        icon: serviceData.icon,
                        description: serviceData.description,
                        status: 'active',
                        updatedAt: firebase.firestore.FieldValue.serverTimestamp()
                    });
                } else {
                    // Yeni kayıt oluştur
                    return db.collection('services').add(serviceData);
                }
            })
            .then(() => {
                importedCount++;
                updateProgress(importedCount, serviceCards.length);
                return true;
            })
            .catch(error => {
                console.error(`"${title}" hizmeti kaydedilirken hata oluştu:`, error);
                errorCount++;
                return false;
            });
        
        importPromises.push(checkPromise);
    });
    
    // Tüm aktarımlar tamamlandığında
    Promise.all(importPromises)
        .then(() => {
            // İlerleme göstergesini kaldır
            document.body.removeChild(progressContainer);
            
            // Sonuç mesajını göster
            alert(`Aktarım tamamlandı!\nBaşarılı: ${importedCount}\nHata: ${errorCount}`);
            
            // Başarılı ise admin paneline yönlendir
            if (importedCount > 0) {
                if (confirm('Hizmetler başarıyla kaydedildi. Admin panelinde görüntülemek ister misiniz?')) {
                    window.location.href = '/admin/services.html';
                }
            }
        });
    
    // İlerleme göstergesini güncelle
    function updateProgress(current, total) {
        const percent = (current / total) * 100;
        const progressBar = document.querySelector('.progress');
        const progressText = document.querySelector('.progress-text');
        
        progressBar.style.width = `${percent}%`;
        progressText.textContent = `${current}/${total} aktarıldı`;
    }
}

// Hizmet detay sayfalarından detaylı açıklamaları topla ve güncelle
function updateServiceDetails() {
    if (typeof firebase === 'undefined' || !firebase.firestore) {
        return;
    }
    
    const db = firebase.firestore();
    
    // Hizmet detay bölümlerini bul
    const serviceDetails = document.querySelectorAll('.service-detail');
    
    serviceDetails.forEach(detail => {
        // Hizmet ID'sini al
        const serviceId = detail.id;
        if (!serviceId) return;
        
        // Detaylı açıklama içeriğini al
        const featuresList = detail.querySelector('.service-features');
        const detailedDescription = featuresList ? featuresList.innerHTML : '';
        
        // Başlığı al (veritabanında arama yapmak için)
        const title = detail.querySelector('h2')?.textContent;
        if (!title) return;
        
        // Veritabanında bu başlıkla hizmet ara
        db.collection('services')
            .where('title', '==', title)
            .get()
            .then(snapshot => {
                if (!snapshot.empty) {
                    // Belgeyi güncelle
                    const docId = snapshot.docs[0].id;
                    return db.collection('services').doc(docId).update({
                        detailedDescription: detailedDescription,
                        updatedAt: firebase.firestore.FieldValue.serverTimestamp()
                    });
                }
            })
            .catch(error => {
                console.error(`"${title}" hizmeti detayları güncellenirken hata:`, error);
            });
    });
} 