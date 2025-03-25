// Hizmetler Yönetimi - Birlik Elektrik Admin Paneli
document.addEventListener('DOMContentLoaded', function() {
    // Firebase oturumunun açık olduğunu kontrol et
    firebase.auth().onAuthStateChanged(function(user) {
        if (user) {
            initializeServicesPage();
        }
    });
});

// Hizmetler sayfasını başlat
function initializeServicesPage() {
    const db = firebase.firestore();
    
    // İstatistikleri yükle
    loadServiceStats(db);
    
    // Hizmet listesini yükle
    loadServices(db);
    
    // Kategorileri yükle
    loadCategories(db);
    
    // Olay dinleyicilerini ekle
    setupEventListeners(db);
}

// Hizmet istatistiklerini yükle
function loadServiceStats(db) {
    // Toplam hizmet sayısı
    db.collection('services').get()
        .then(snapshot => {
            document.getElementById('totalServicesCount').textContent = snapshot.size;
        })
        .catch(error => {
            console.error('Hizmet sayısı alınamadı:', error);
            document.getElementById('totalServicesCount').textContent = '0';
        });
    
    // Aktif hizmetler
    db.collection('services').where('status', '==', 'active').get()
        .then(snapshot => {
            document.getElementById('activeServicesCount').textContent = snapshot.size;
        })
        .catch(error => {
            console.error('Aktif hizmet sayısı alınamadı:', error);
            document.getElementById('activeServicesCount').textContent = '0';
        });
    
    // Kategorileri say
    db.collection('services').get()
        .then(snapshot => {
            const categories = new Set();
            snapshot.forEach(doc => {
                if (doc.data().category) {
                    categories.add(doc.data().category);
                }
            });
            document.getElementById('totalCategoriesCount').textContent = categories.size;
        })
        .catch(error => {
            console.error('Kategori sayısı alınamadı:', error);
            document.getElementById('totalCategoriesCount').textContent = '0';
        });
    
    // Görüntülenme (opsiyonel, site analytics entegrasyonu ileriki aşamada yapılabilir)
    document.getElementById('viewsCount').textContent = '0';
}

// Hizmet kategorilerini yükle
function loadCategories(db) {
    const categorySelect = document.getElementById('serviceCategoryFilter');
    if (!categorySelect) return;
    
    db.collection('services').get()
        .then(snapshot => {
            const categories = new Set();
            snapshot.forEach(doc => {
                if (doc.data().category) {
                    categories.add(doc.data().category);
                }
            });
            
            // Mevcut seçenekleri temizle (ilk seçenek hariç)
            while (categorySelect.options.length > 1) {
                categorySelect.remove(1);
            }
            
            // Kategorileri ekle
            categories.forEach(category => {
                const option = document.createElement('option');
                option.value = category;
                option.textContent = category;
                categorySelect.appendChild(option);
            });
        })
        .catch(error => {
            console.error('Kategoriler yüklenemedi:', error);
        });
}

// Hizmet listesini yükle
function loadServices(db, filter = 'all', searchQuery = '') {
    const tableBody = document.getElementById('servicesTableBody');
    if (!tableBody) return;
    
    // Yükleniyor göstergesi
    tableBody.innerHTML = `
        <tr>
            <td colspan="6" class="text-center">
                <div class="spinner-border spinner-border-sm" role="status">
                    <span class="sr-only">Yükleniyor...</span>
                </div> Hizmetler yükleniyor...
            </td>
        </tr>
    `;
    
    // Sorguyu oluştur
    let query = db.collection('services').orderBy('title', 'asc');
    
    // Filtre uygula (kategori)
    if (filter !== 'all') {
        query = db.collection('services').where('category', '==', filter);
    }
    
    // Sorguyu çalıştır
    query.get()
        .then(snapshot => {
            if (snapshot.empty) {
                tableBody.innerHTML = `
                    <tr>
                        <td colspan="6" class="text-center">Hizmet bulunamadı. <a href="#" id="createFirstService">İlk hizmeti oluştur</a></td>
                    </tr>
                `;
                
                // İlk hizmet oluşturma bağlantısı
                const createFirstServiceLink = document.getElementById('createFirstService');
                if (createFirstServiceLink) {
                    createFirstServiceLink.addEventListener('click', function(e) {
                        e.preventDefault();
                        document.getElementById('addServiceBtn').click();
                    });
                }
                
                return;
            }
            
            // Hizmetleri al
            let services = [];
            snapshot.forEach(doc => {
                services.push({
                    id: doc.id,
                    ...doc.data()
                });
            });
            
            // Arama filtresini uygula
            if (searchQuery) {
                const searchLower = searchQuery.toLowerCase();
                services = services.filter(service => 
                    service.title?.toLowerCase().includes(searchLower) || 
                    service.description?.toLowerCase().includes(searchLower)
                );
            }
            
            // Sonuçları göster
            renderServices(services, tableBody);
        })
        .catch(error => {
            console.error('Hizmetler alınamadı:', error);
            tableBody.innerHTML = `
                <tr>
                    <td colspan="6" class="text-center text-danger">
                        <i class="fas fa-exclamation-circle"></i> Hizmetler yüklenirken bir hata oluştu.
                    </td>
                </tr>
            `;
        });
}

// Hizmet listesini render et
function renderServices(services, tableBody) {
    tableBody.innerHTML = '';
    
    services.forEach((service, index) => {
        const row = document.createElement('tr');
        row.className = 'fade-in';
        row.setAttribute('data-id', service.id);
        
        // Duruma göre sınıf belirle
        const statusBadgeClass = service.status === 'active' ? 'admin-badge-success' : 'admin-badge-secondary';
        
        // Durumu Türkçe olarak göster
        const statusText = service.status === 'active' ? 'Aktif' : 'Pasif';
        
        row.innerHTML = `
            <td>${index + 1}</td>
            <td>
                <div class="service-icon-preview">
                    <i class="${service.icon || 'fas fa-tools'}"></i>
                </div>
            </td>
            <td>
                <div class="service-info">
                    <h4>${service.title || 'İsimsiz Hizmet'}</h4>
                    <p>${service.description ? service.description.substring(0, 50) + (service.description.length > 50 ? '...' : '') : 'Açıklama yok'}</p>
                </div>
            </td>
            <td>
                <span class="admin-badge admin-badge-primary">${service.category || 'Genel'}</span>
            </td>
            <td>
                <span class="admin-badge ${statusBadgeClass}">${statusText}</span>
            </td>
            <td>
                <div class="admin-table-actions">
                    <button class="admin-btn admin-btn-icon admin-btn-sm edit-service-btn" title="Düzenle" data-id="${service.id}">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="admin-btn admin-btn-icon admin-btn-sm view-service-btn" title="Görüntüle" data-id="${service.id}">
                        <i class="fas fa-eye"></i>
                    </button>
                    <button class="admin-btn admin-btn-icon admin-btn-sm delete-service-btn" title="Sil" data-id="${service.id}">
                        <i class="fas fa-trash-alt"></i>
                    </button>
                </div>
            </td>
        `;
        
        tableBody.appendChild(row);
    });
    
    // Hizmet düğmelerine olay dinleyicileri ekle
    addServiceRowEventListeners();
}

// Tablo satırlarına olay dinleyicileri ekle
function addServiceRowEventListeners() {
    // Düzenleme düğmeleri
    document.querySelectorAll('.edit-service-btn').forEach(button => {
        button.addEventListener('click', function(e) {
            e.stopPropagation();
            const serviceId = this.getAttribute('data-id');
            editService(serviceId);
        });
    });
    
    // Görüntüleme düğmeleri
    document.querySelectorAll('.view-service-btn').forEach(button => {
        button.addEventListener('click', function(e) {
            e.stopPropagation();
            const serviceId = this.getAttribute('data-id');
            viewService(serviceId);
        });
    });
    
    // Silme düğmeleri
    document.querySelectorAll('.delete-service-btn').forEach(button => {
        button.addEventListener('click', function(e) {
            e.stopPropagation();
            const serviceId = this.getAttribute('data-id');
            deleteService(serviceId);
        });
    });
}

// Olay dinleyicilerini ayarla
function setupEventListeners(db) {
    // Hizmet arama kutusu
    const searchInput = document.getElementById('serviceSearchInput');
    if (searchInput) {
        searchInput.addEventListener('input', function() {
            const searchQuery = this.value.trim();
            const filter = document.getElementById('serviceCategoryFilter').value;
            loadServices(db, filter, searchQuery);
        });
    }
    
    // Kategori filtreleme
    const categoryFilter = document.getElementById('serviceCategoryFilter');
    if (categoryFilter) {
        categoryFilter.addEventListener('change', function() {
            const searchQuery = document.getElementById('serviceSearchInput').value.trim();
            loadServices(db, this.value, searchQuery);
        });
    }
    
    // Listeyi yenileme
    const refreshBtn = document.getElementById('refreshServicesBtn');
    if (refreshBtn) {
        refreshBtn.addEventListener('click', function() {
            document.getElementById('serviceSearchInput').value = '';
            document.getElementById('serviceCategoryFilter').value = 'all';
            loadServices(db);
            loadCategories(db);
        });
    }
    
    // Yeni hizmet ekleme
    const addServiceBtn = document.getElementById('addServiceBtn');
    if (addServiceBtn) {
        addServiceBtn.addEventListener('click', showAddServiceForm);
    }
    
    // Hızlı erişim butonları
    const quickAddServiceBtn = document.getElementById('quickAddServiceBtn');
    if (quickAddServiceBtn) {
        quickAddServiceBtn.addEventListener('click', function(e) {
            e.preventDefault();
            showAddServiceForm();
        });
    }
    
    // Kategori ekleme düğmesi
    const addCategoryBtn = document.getElementById('addCategoryBtn');
    if (addCategoryBtn) {
        addCategoryBtn.addEventListener('click', function() {
            // Kategori eklemek için modal göster
            alert('Kategori ekleme işlevi yakında eklenecek!');
        });
    }
    
    // Hizmet formu iptal
    const cancelServiceBtn = document.getElementById('cancelServiceBtn');
    if (cancelServiceBtn) {
        cancelServiceBtn.addEventListener('click', function() {
            hideServiceForm();
        });
    }
    
    // Hizmet formu gönderim
    const serviceForm = document.getElementById('serviceForm');
    if (serviceForm) {
        serviceForm.addEventListener('submit', function(e) {
            e.preventDefault();
            saveService(db);
        });
    }
    
    // İkon önizleme
    const iconInput = document.getElementById('serviceIcon');
    if (iconInput) {
        iconInput.addEventListener('input', function() {
            updateIconPreview(this.value);
        });
    }
    
    // İkon önerileri
    const iconSuggestions = document.querySelectorAll('.admin-icon-suggestion');
    if (iconSuggestions) {
        iconSuggestions.forEach(suggestion => {
            suggestion.addEventListener('click', function() {
                const iconClass = this.getAttribute('data-icon');
                document.getElementById('serviceIcon').value = iconClass;
                updateIconPreview(iconClass);
            });
        });
    }
    
    // Görsel yükleme önizleme
    const serviceImage = document.getElementById('serviceImage');
    if (serviceImage) {
        serviceImage.addEventListener('change', function(e) {
            const file = e.target.files[0];
            if (file) {
                const reader = new FileReader();
                reader.onload = function(event) {
                    const preview = document.getElementById('serviceImagePreview');
                    preview.innerHTML = `<img src="${event.target.result}" alt="Görsel Önizleme">`;
                };
                reader.readAsDataURL(file);
            }
        });
    }
    
    // Editör düğmeleri
    const editorButtons = document.querySelectorAll('.admin-editor-btn');
    if (editorButtons) {
        editorButtons.forEach(button => {
            button.addEventListener('click', function(e) {
                e.preventDefault();
                const format = this.getAttribute('data-format');
                formatText(format);
            });
        });
    }
}

// Zengin metin editörü formatlamaları
function formatText(format) {
    const textarea = document.getElementById('serviceDetailedDescription');
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = textarea.value.substring(start, end);
    let replacement = '';
    
    switch (format) {
        case 'bold':
            replacement = `<strong>${selectedText}</strong>`;
            break;
        case 'italic':
            replacement = `<em>${selectedText}</em>`;
            break;
        case 'underline':
            replacement = `<u>${selectedText}</u>`;
            break;
        case 'h2':
            replacement = `<h2>${selectedText}</h2>`;
            break;
        case 'link':
            const url = prompt('Link URL:', 'https://');
            if (url) {
                replacement = `<a href="${url}" target="_blank">${selectedText || url}</a>`;
            } else {
                return;
            }
            break;
        case 'list-ul':
            if (selectedText) {
                const items = selectedText.split('\n').filter(item => item.trim() !== '');
                replacement = '<ul>\n' + items.map(item => `  <li>${item}</li>`).join('\n') + '\n</ul>';
            } else {
                replacement = '<ul>\n  <li>Liste öğesi</li>\n</ul>';
            }
            break;
        case 'list-ol':
            if (selectedText) {
                const items = selectedText.split('\n').filter(item => item.trim() !== '');
                replacement = '<ol>\n' + items.map(item => `  <li>${item}</li>`).join('\n') + '\n</ol>';
            } else {
                replacement = '<ol>\n  <li>Liste öğesi</li>\n</ol>';
            }
            break;
    }
    
    // Metni değiştir
    textarea.focus();
    textarea.value = textarea.value.substring(0, start) + replacement + textarea.value.substring(end);
    
    // İmleci uygun konuma getir
    const newCursorPos = start + replacement.length;
    textarea.setSelectionRange(newCursorPos, newCursorPos);
}

// Yeni hizmet ekleme formunu göster
function showAddServiceForm() {
    // Form başlığını güncelle
    document.querySelector('#serviceFormContainer .admin-card-title').innerHTML = '<i class="fas fa-plus-circle"></i> Yeni Hizmet Ekle';
    
    // Formu temizle
    document.getElementById('serviceForm').reset();
    document.getElementById('serviceForm').removeAttribute('data-id');
    
    // İkon önizlemesini sıfırla
    updateIconPreview('fas fa-tools');
    
    // Görsel önizlemesini sıfırla
    document.getElementById('serviceImagePreview').innerHTML = '<i class="fas fa-image"></i><span>Görsel yok</span>';
    
    // Kategorileri yükle
    loadCategoryOptions();
    
    // Formu göster, tabloyu gizle
    document.getElementById('serviceFormContainer').style.display = 'block';
    document.getElementById('servicesTableContainer').style.display = 'none';
}

// Kategori seçeneklerini yükle
function loadCategoryOptions() {
    const db = firebase.firestore();
    const datalist = document.getElementById('categoryOptions');
    
    if (!datalist) return;
    
    // Önce temizle
    datalist.innerHTML = '';
    
    db.collection('services').get()
        .then(snapshot => {
            const categories = new Set();
            snapshot.forEach(doc => {
                if (doc.data().category) {
                    categories.add(doc.data().category);
                }
            });
            
            // Kategorileri ekle
            categories.forEach(category => {
                const option = document.createElement('option');
                option.value = category;
                datalist.appendChild(option);
            });
        })
        .catch(error => {
            console.error('Kategoriler yüklenemedi:', error);
        });
}

// Hizmet formunu gizle
function hideServiceForm() {
    document.getElementById('serviceFormContainer').style.display = 'none';
    document.getElementById('servicesTableContainer').style.display = 'block';
}

// İkon önizlemesini güncelle
function updateIconPreview(iconClass) {
    const iconPreview = document.getElementById('iconPreview');
    if (iconPreview) {
        iconPreview.innerHTML = '';
        if (iconClass) {
            const iconElement = document.createElement('i');
            iconElement.className = iconClass;
            iconPreview.appendChild(iconElement);
        } else {
            iconPreview.innerHTML = '<i class="fas fa-info-circle"></i> İkon seçilmedi';
        }
    }
}

// Hizmet kaydetme fonksiyonu
function saveService(db) {
    const serviceForm = document.getElementById('serviceForm');
    const serviceId = serviceForm.getAttribute('data-id');
    
    // Form verilerini al
    const serviceData = {
        title: document.getElementById('serviceTitle').value.trim(),
        icon: document.getElementById('serviceIcon').value.trim(),
        description: document.getElementById('serviceDescription').value.trim(),
        category: document.getElementById('serviceCategory').value.trim(),
        status: document.getElementById('serviceStatus').value,
        detailedDescription: document.getElementById('serviceDetailedDescription').value.trim(),
        order: parseInt(document.getElementById('serviceOrder').value) || 0,
        updatedAt: firebase.firestore.FieldValue.serverTimestamp()
    };
    
    // Yeni kayıt ise createdAt ekle
    if (!serviceId) {
        serviceData.createdAt = firebase.firestore.FieldValue.serverTimestamp();
    }
    
    // Görsel dosyası kontrolü
    const imageFile = document.getElementById('serviceImage').files[0];
    
    // Görsel yoksa direk kaydet
    if (!imageFile) {
        saveServiceToFirestore(db, serviceId, serviceData);
        return;
    }
    
    // Görsel varsa önce yükle
    const storage = firebase.storage();
    const storageRef = storage.ref();
    const imageRef = storageRef.child('services/' + (serviceId || Date.now()) + '_' + imageFile.name);
    
    imageRef.put(imageFile)
        .then(snapshot => {
            return snapshot.ref.getDownloadURL();
        })
        .then(downloadURL => {
            serviceData.imageUrl = downloadURL;
            saveServiceToFirestore(db, serviceId, serviceData);
        })
        .catch(error => {
            console.error('Görsel yüklenirken hata oluştu:', error);
            showAlert('Görsel yüklenirken bir hata oluştu: ' + error.message, 'error');
        });
}

// Verileri Firestore'a kaydet
function saveServiceToFirestore(db, serviceId, serviceData) {
    // Yeni kayıt veya güncelleme
    const serviceRef = serviceId ? 
        db.collection('services').doc(serviceId) : 
        db.collection('services').doc();
    
    serviceRef.set(serviceData, { merge: true })
        .then(() => {
            showAlert('Hizmet başarıyla kaydedildi.', 'success');
            hideServiceForm();
            loadServices(db);
            loadServiceStats(db);
            loadCategories(db);
        })
        .catch(error => {
            console.error('Hizmet kaydedilirken hata oluştu:', error);
            showAlert('Hizmet kaydedilirken bir hata oluştu: ' + error.message, 'error');
        });
}

// Hizmet düzenleme
function editService(serviceId) {
    const db = firebase.firestore();
    
    // Hizmet verilerini al
    db.collection('services').doc(serviceId).get()
        .then(doc => {
            if (doc.exists) {
                const serviceData = doc.data();
                
                // Form başlığını güncelle
                document.querySelector('#serviceFormContainer .admin-card-title').innerHTML = '<i class="fas fa-edit"></i> Hizmet Düzenle';
                
                // Form alanlarını doldur
                document.getElementById('serviceTitle').value = serviceData.title || '';
                document.getElementById('serviceIcon').value = serviceData.icon || '';
                document.getElementById('serviceDescription').value = serviceData.description || '';
                document.getElementById('serviceCategory').value = serviceData.category || '';
                document.getElementById('serviceStatus').value = serviceData.status || 'active';
                document.getElementById('serviceDetailedDescription').value = serviceData.detailedDescription || '';
                document.getElementById('serviceOrder').value = serviceData.order || 0;
                
                // İkon önizlemesini güncelle
                updateIconPreview(serviceData.icon);
                
                // Görsel önizlemesini güncelle
                const imagePreviewContainer = document.getElementById('serviceImagePreview');
                if (serviceData.imageUrl) {
                    imagePreviewContainer.innerHTML = `<img src="${serviceData.imageUrl}" alt="${serviceData.title}">`;
                } else {
                    imagePreviewContainer.innerHTML = '<i class="fas fa-image"></i><span>Görsel yok</span>';
                }
                
                // Formu servis ID'si ile işaretle
                document.getElementById('serviceForm').setAttribute('data-id', serviceId);
                
                // Kategorileri yükle
                loadCategoryOptions();
                
                // Formu göster, tabloyu gizle
                document.getElementById('serviceFormContainer').style.display = 'block';
                document.getElementById('servicesTableContainer').style.display = 'none';
            } else {
                showAlert('Hizmet bulunamadı.', 'error');
            }
        })
        .catch(error => {
            showAlert('Hizmet bilgileri alınırken bir hata oluştu: ' + error.message, 'error');
        });
}

// Hizmet görüntüleme
function viewService(serviceId) {
    const db = firebase.firestore();
    
    // Hizmet verilerini al
    db.collection('services').doc(serviceId).get()
        .then(doc => {
            if (doc.exists) {
                const serviceData = doc.data();
                
                // Modal içeriğini oluştur
                const modalContent = `
                    <div class="service-detail-view">
                        <div class="service-icon-large">
                            <i class="${serviceData.icon || 'fas fa-tools'}"></i>
                        </div>
                        <h2>${serviceData.title || 'İsimsiz Hizmet'}</h2>
                        <div class="service-meta">
                            <span class="admin-badge admin-badge-primary">${serviceData.category || 'Genel'}</span>
                            <span class="admin-badge ${serviceData.status === 'active' ? 'admin-badge-success' : 'admin-badge-secondary'}">
                                ${serviceData.status === 'active' ? 'Aktif' : 'Pasif'}
                            </span>
                        </div>
                        <div class="service-description">
                            <h3>Kısa Açıklama</h3>
                            <p>${serviceData.description || 'Açıklama yok'}</p>
                        </div>
                        <div class="service-detailed-description">
                            <h3>Detaylı Açıklama</h3>
                            <div>${serviceData.detailedDescription || 'Detaylı açıklama yok'}</div>
                        </div>
                        <div class="service-info-grid">
                            <div class="service-info-item">
                                <div class="service-info-label">Oluşturulma Tarihi</div>
                                <div class="service-info-value">${serviceData.createdAt ? formatDateTime(serviceData.createdAt) : 'Belirtilmemiş'}</div>
                            </div>
                            <div class="service-info-item">
                                <div class="service-info-label">Sıralama</div>
                                <div class="service-info-value">${serviceData.order || '0'}</div>
                            </div>
                        </div>
                    </div>
                `;
                
                // Modal başlığını ayarla
                document.querySelector('#serviceDetailModal .admin-modal-title').textContent = 'Hizmet Detayı';
                
                // Modal içeriğini ayarla
                document.querySelector('#serviceDetailModal .admin-modal-body').innerHTML = modalContent;
                
                // Modalı göster
                document.getElementById('serviceDetailModal').style.display = 'flex';
            } else {
                showAlert('Hizmet bulunamadı.', 'error');
            }
        })
        .catch(error => {
            showAlert('Hizmet bilgileri alınırken bir hata oluştu: ' + error.message, 'error');
        });
        
    // Modal kapat düğmesi
    document.getElementById('closeServiceDetailModal').addEventListener('click', function() {
        document.getElementById('serviceDetailModal').style.display = 'none';
    });
    
    // Dışa tıklama ile kapat
    document.getElementById('serviceDetailModal').addEventListener('click', function(e) {
        if (e.target === this) {
            this.style.display = 'none';
        }
    });
}

// Hizmet silme
function deleteService(serviceId) {
    if (confirm('Bu hizmeti silmek istediğinizden emin misiniz? Bu işlem geri alınamaz.')) {
        const db = firebase.firestore();
        
        db.collection('services').doc(serviceId).delete()
            .then(() => {
                showAlert('Hizmet başarıyla silindi.', 'success');
                loadServices(db);
                loadServiceStats(db);
                loadCategories(db);
            })
            .catch(error => {
                showAlert('Hizmet silinirken bir hata oluştu: ' + error.message, 'error');
            });
    }
} 