// Projeler - Birlik Elektrik Admin Paneli
document.addEventListener('DOMContentLoaded', function() {
    // Firebase oturumunun açık olduğunu kontrol et
    firebase.auth().onAuthStateChanged(function(user) {
        if (user) {
            initializeProjectsPage();
        }
    });
});

// Projeler sayfasını başlat
function initializeProjectsPage() {
    const db = firebase.firestore();
    
    // İstatistikleri yükle
    loadProjectStats(db);
    
    // Proje listesini yükle
    loadProjects(db);
    
    // Olay dinleyicilerini ekle
    setupEventListeners(db);
}

// Proje istatistiklerini yükle
function loadProjectStats(db) {
    // Toplam proje sayısı
    db.collection('projects').get()
        .then(snapshot => {
            document.getElementById('totalProjectsCount').textContent = snapshot.size;
        })
        .catch(error => {
            console.error('Proje sayısı alınamadı:', error);
            document.getElementById('totalProjectsCount').textContent = '0';
        });
    
    // Tamamlanan projeler
    db.collection('projects').where('status', '==', 'completed').get()
        .then(snapshot => {
            document.getElementById('completedProjectsCount').textContent = snapshot.size;
        })
        .catch(error => {
            console.error('Tamamlanan proje sayısı alınamadı:', error);
            document.getElementById('completedProjectsCount').textContent = '0';
        });
    
    // Devam eden projeler
    db.collection('projects').where('status', '==', 'active').get()
        .then(snapshot => {
            document.getElementById('activeProjectsCount').textContent = snapshot.size;
        })
        .catch(error => {
            console.error('Devam eden proje sayısı alınamadı:', error);
            document.getElementById('activeProjectsCount').textContent = '0';
        });
    
    // Bu ay eklenen projeler
    const firstDayOfMonth = new Date();
    firstDayOfMonth.setDate(1);
    firstDayOfMonth.setHours(0, 0, 0, 0);
    
    db.collection('projects')
        .where('createdAt', '>=', firstDayOfMonth)
        .get()
        .then(snapshot => {
            document.getElementById('newProjectsCount').textContent = snapshot.size;
        })
        .catch(error => {
            console.error('Yeni proje sayısı alınamadı:', error);
            document.getElementById('newProjectsCount').textContent = '0';
        });
}

// Proje listesini yükle
function loadProjects(db, filter = 'all', searchQuery = '') {
    const tableBody = document.getElementById('projectsTableBody');
    if (!tableBody) return;
    
    // Yükleniyor göstergesi
    tableBody.innerHTML = `
        <tr>
            <td colspan="6" class="text-center">
                <div class="spinner-border spinner-border-sm" role="status">
                    <span class="sr-only">Yükleniyor...</span>
                </div> Projeler yükleniyor...
            </td>
        </tr>
    `;
    
    // Sorguyu oluştur
    let query = db.collection('projects').orderBy('createdAt', 'desc');
    
    // Filtre uygula
    if (filter !== 'all') {
        query = query.where('status', '==', filter);
    }
    
    // Sorguyu çalıştır
    query.get()
        .then(snapshot => {
            if (snapshot.empty) {
                tableBody.innerHTML = `
                    <tr>
                        <td colspan="6" class="text-center">Proje bulunamadı.</td>
                    </tr>
                `;
                updateProjectCount(0);
                return;
            }
            
            // Projeleri al
            let projects = [];
            snapshot.forEach(doc => {
                projects.push({
                    id: doc.id,
                    ...doc.data()
                });
            });
            
            // Arama filtresini uygula
            if (searchQuery) {
                const searchLower = searchQuery.toLowerCase();
                projects = projects.filter(project => 
                    project.title?.toLowerCase().includes(searchLower) || 
                    project.description?.toLowerCase().includes(searchLower)
                );
            }
            
            // Sonuçları göster
            renderProjects(projects, tableBody);
            updateProjectCount(projects.length);
        })
        .catch(error => {
            console.error('Projeler alınamadı:', error);
            tableBody.innerHTML = `
                <tr>
                    <td colspan="6" class="text-center text-danger">
                        <i class="fas fa-exclamation-circle"></i> Projeler yüklenirken bir hata oluştu.
                    </td>
                </tr>
            `;
            updateProjectCount(0);
        });
}

// Proje listesini render et
function renderProjects(projects, tableBody) {
    tableBody.innerHTML = '';
    
    projects.forEach((project, index) => {
        const row = document.createElement('tr');
        row.className = 'fade-in';
        row.setAttribute('data-id', project.id);
        
        // Duruma göre sınıf belirle
        const statusBadgeClass = 
            project.status === 'completed' ? 'admin-badge-success' : 
            project.status === 'active' ? 'admin-badge-warning' : 
            'admin-badge-secondary';
        
        // Durumu Türkçe olarak göster
        const statusText = 
            project.status === 'completed' ? 'Tamamlandı' : 
            project.status === 'active' ? 'Devam Ediyor' : 
            'Beklemede';
        
        // Progress bar rengini belirle
        const progressBarClass = 
            project.status === 'completed' ? 'admin-bg-success' : 
            project.status === 'active' ? 'admin-bg-warning' : 
            'admin-bg-secondary';
        
        // Kategoriye göre özel sınıf
        const categoryClass = getCategoryClass(project.category);
        
        row.innerHTML = `
            <td>${index + 1}</td>
            <td>
                <div class="d-flex align-center gap-1">
                    <div class="admin-project-image">
                        <img src="${project.imageUrl || 'assets/img/project-placeholder.jpg'}" alt="${project.title || 'Proje'}">
                    </div>
                    <div class="admin-project-info">
                        <h4>${project.title || 'İsimsiz Proje'}</h4>
                        <p>${project.description ? project.description.substring(0, 50) + (project.description.length > 50 ? '...' : '') : 'Açıklama yok'}</p>
                    </div>
                </div>
            </td>
            <td>
                <span class="admin-badge ${categoryClass}">${project.category || 'Genel'}</span>
            </td>
            <td>
                <span class="admin-badge ${statusBadgeClass}">${statusText}</span>
            </td>
            <td>
                <div class="admin-progress">
                    <div class="admin-progress-bar ${progressBarClass}" style="width: ${project.progress || 0}%"></div>
                </div>
                <div class="text-right mt-1">
                    <small>${project.progress || 0}%</small>
                </div>
            </td>
            <td>
                <div class="admin-table-actions">
                    <button class="admin-btn admin-btn-icon admin-btn-sm edit-project-btn" title="Düzenle" data-id="${project.id}">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="admin-btn admin-btn-icon admin-btn-sm view-project-btn" title="Görüntüle" data-id="${project.id}">
                        <i class="fas fa-eye"></i>
                    </button>
                    <button class="admin-btn admin-btn-icon admin-btn-sm delete-project-btn" title="Sil" data-id="${project.id}">
                        <i class="fas fa-trash-alt"></i>
                    </button>
                </div>
            </td>
        `;
        
        tableBody.appendChild(row);
    });
    
    // Olay dinleyicilerini ekle
    addProjectRowEventListeners();
}

// Kategori için özel sınıf oluştur
function getCategoryClass(category) {
    if (!category) return 'admin-badge-primary';
    
    switch(category.toLowerCase()) {
        case 'elektrik':
            return 'admin-badge-primary';
        case 'otomasyon':
            return 'admin-badge-info';
        case 'güvenlik':
            return 'admin-badge-danger';
        case 'aydınlatma':
            return 'admin-badge-warning';
        default:
            return 'admin-badge-primary';
    }
}

// Proje sayısını güncelle
function updateProjectCount(count) {
    const countElement = document.getElementById('projectCount');
    if (countElement) {
        countElement.textContent = `Toplam ${count} proje gösteriliyor`;
    }
}

// Tablo satırlarına olay dinleyicileri ekle
function addProjectRowEventListeners() {
    // Düzenleme butonları
    document.querySelectorAll('.edit-project-btn').forEach(button => {
        button.addEventListener('click', function(e) {
            e.stopPropagation();
            const projectId = this.getAttribute('data-id');
            editProject(projectId);
        });
    });
    
    // Görüntüleme butonları
    document.querySelectorAll('.view-project-btn').forEach(button => {
        button.addEventListener('click', function(e) {
            e.stopPropagation();
            const projectId = this.getAttribute('data-id');
            viewProject(projectId);
        });
    });
    
    // Silme butonları
    document.querySelectorAll('.delete-project-btn').forEach(button => {
        button.addEventListener('click', function(e) {
            e.stopPropagation();
            const projectId = this.getAttribute('data-id');
            confirmDeleteProject(projectId);
        });
    });
    
    // Satıra tıklama
    document.querySelectorAll('#projectsTableBody tr').forEach(row => {
        row.addEventListener('click', function() {
            const projectId = this.getAttribute('data-id');
            viewProject(projectId);
        });
    });
}

// Olay dinleyicilerini ayarla
function setupEventListeners(db) {
    // Proje ekleme butonu
    const addProjectBtn = document.getElementById('addProjectBtn');
    if (addProjectBtn) {
        addProjectBtn.addEventListener('click', function() {
            document.getElementById('projectsTableContainer').style.display = 'none';
            document.getElementById('projectFormContainer').style.display = 'block';
            
            // Form başlığını güncelle
            document.querySelector('#projectFormContainer .admin-card-title').innerHTML = `
                <i class="fas fa-plus-circle"></i> Yeni Proje Ekle
            `;
            
            // Formu sıfırla
            document.getElementById('projectForm').reset();
            document.getElementById('projectImagePreview').innerHTML = '';
            document.getElementById('projectImagePreview').style.display = 'none';
        });
    }
    
    // İptal butonu
    const cancelProjectBtn = document.getElementById('cancelProjectBtn');
    if (cancelProjectBtn) {
        cancelProjectBtn.addEventListener('click', function() {
            document.getElementById('projectsTableContainer').style.display = 'block';
            document.getElementById('projectFormContainer').style.display = 'none';
        });
    }
    
    // Proje formu gönderimi
    const projectForm = document.getElementById('projectForm');
    if (projectForm) {
        projectForm.addEventListener('submit', function(e) {
            e.preventDefault();
            saveProject(db);
        });
    }
    
    // Arama kutusu
    const searchInput = document.getElementById('projectSearchInput');
    if (searchInput) {
        searchInput.addEventListener('keyup', debounce(function() {
            const filterSelect = document.getElementById('projectStatusFilter');
            const filter = filterSelect ? filterSelect.value : 'all';
            loadProjects(db, filter, this.value);
        }, 300));
    }
    
    // Durum filtresi
    const statusFilter = document.getElementById('projectStatusFilter');
    if (statusFilter) {
        statusFilter.addEventListener('change', function() {
            const searchInput = document.getElementById('projectSearchInput');
            const searchQuery = searchInput ? searchInput.value : '';
            loadProjects(db, this.value, searchQuery);
        });
    }
    
    // Listeyi yenileme butonu
    const refreshBtn = document.getElementById('refreshProjectsBtn');
    if (refreshBtn) {
        refreshBtn.addEventListener('click', function() {
            const filterSelect = document.getElementById('projectStatusFilter');
            const filter = filterSelect ? filterSelect.value : 'all';
            const searchInput = document.getElementById('projectSearchInput');
            const searchQuery = searchInput ? searchInput.value : '';
            
            loadProjects(db, filter, searchQuery);
            loadProjectStats(db);
        });
    }
    
    // Modal kapatma butonları
    document.querySelectorAll('#closeProjectDetailModal, #closeProjectDetailBtn').forEach(btn => {
        if (btn) {
            btn.addEventListener('click', function() {
                document.getElementById('projectDetailModal').style.display = 'none';
            });
        }
    });
    
    // Proje resmi önizleme
    setupFileUpload('projectImage', 'projectImagePreview');
}

// Proje görüntüleme fonksiyonu
function viewProject(projectId) {
    const db = firebase.firestore();
    
    db.collection('projects').doc(projectId).get()
        .then(doc => {
            if (doc.exists) {
                const project = doc.data();
                
                // Modal içeriğini doldur
                document.getElementById('detailProjectName').textContent = project.title || 'İsimsiz Proje';
                document.getElementById('detailProjectCategory').textContent = project.category || 'Belirtilmemiş';
                
                // Durumu Türkçe olarak göster
                const statusText = 
                    project.status === 'completed' ? 'Tamamlandı' : 
                    project.status === 'active' ? 'Devam Ediyor' : 
                    'Beklemede';
                document.getElementById('detailProjectStatus').textContent = statusText;
                
                // Progress bar'ı ayarla
                const progressBar = document.getElementById('detailProjectProgressBar');
                progressBar.style.width = `${project.progress || 0}%`;
                progressBar.className = `admin-progress-bar ${
                    project.status === 'completed' ? 'admin-bg-success' : 
                    project.status === 'active' ? 'admin-bg-warning' : 
                    'admin-bg-secondary'
                }`;
                document.getElementById('detailProjectProgress').textContent = `%${project.progress || 0}`;
                
                // Açıklama
                document.getElementById('detailProjectDescription').textContent = project.description || 'Açıklama yok';
                
                // Görsel
                document.getElementById('detailProjectImage').src = project.imageUrl || 'assets/img/project-placeholder.jpg';
                
                // Tarihler
                document.getElementById('detailProjectCreated').textContent = formatDate(project.createdAt);
                document.getElementById('detailProjectStartDate').textContent = formatDate(project.startDate);
                document.getElementById('detailProjectEndDate').textContent = project.endDate ? formatDate(project.endDate) : 'Belirtilmemiş';
                
                // Düzenle butonu olay dinleyicisi
                const editBtn = document.getElementById('editProjectBtn');
                if (editBtn) {
                    editBtn.onclick = function() {
                        document.getElementById('projectDetailModal').style.display = 'none';
                        editProject(projectId);
                    };
                }
                
                // Sil butonu olay dinleyicisi
                const deleteBtn = document.getElementById('deleteProjectBtn');
                if (deleteBtn) {
                    deleteBtn.onclick = function() {
                        document.getElementById('projectDetailModal').style.display = 'none';
                        confirmDeleteProject(projectId);
                    };
                }
                
                // Modal'ı göster
                document.getElementById('projectDetailModal').style.display = 'flex';
            } else {
                showAlert('Proje bulunamadı.', 'error');
            }
        })
        .catch(error => {
            console.error('Proje detayları alınamadı:', error);
            showAlert('Proje detayları yüklenirken bir hata oluştu.', 'error');
        });
}

// Proje düzenleme fonksiyonu
function editProject(projectId) {
    const db = firebase.firestore();
    
    db.collection('projects').doc(projectId).get()
        .then(doc => {
            if (doc.exists) {
                const project = doc.data();
                
                // Form başlığını güncelle
                document.querySelector('#projectFormContainer .admin-card-title').innerHTML = `
                    <i class="fas fa-edit"></i> Projeyi Düzenle
                `;
                
                // Form alanlarını doldur
                document.getElementById('projectTitle').value = project.title || '';
                document.getElementById('projectCategory').value = project.category || '';
                document.getElementById('projectDescription').value = project.description || '';
                document.getElementById('projectStatus').value = project.status || 'active';
                document.getElementById('projectProgress').value = project.progress || 0;
                
                // Tarihler
                if (project.startDate) {
                    const startDate = project.startDate.toDate ? project.startDate.toDate() : new Date(project.startDate);
                    document.getElementById('projectStartDate').value = startDate.toISOString().split('T')[0];
                }
                
                if (project.endDate) {
                    const endDate = project.endDate.toDate ? project.endDate.toDate() : new Date(project.endDate);
                    document.getElementById('projectEndDate').value = endDate.toISOString().split('T')[0];
                }
                
                // Resim önizleme
                const previewContainer = document.getElementById('projectImagePreview');
                if (project.imageUrl) {
                    previewContainer.innerHTML = `<img src="${project.imageUrl}" alt="Proje Görseli">`;
                    previewContainer.style.display = 'block';
                } else {
                    previewContainer.innerHTML = '';
                    previewContainer.style.display = 'none';
                }
                
                // Form submit olay dinleyicisini güncelle
                const projectForm = document.getElementById('projectForm');
                projectForm.onsubmit = function(e) {
                    e.preventDefault();
                    saveProject(db, projectId);
                };
                
                // Formu göster, tabloyu gizle
                document.getElementById('projectsTableContainer').style.display = 'none';
                document.getElementById('projectFormContainer').style.display = 'block';
            } else {
                showAlert('Proje bulunamadı.', 'error');
            }
        })
        .catch(error => {
            console.error('Proje detayları alınamadı:', error);
            showAlert('Proje detayları yüklenirken bir hata oluştu.', 'error');
        });
}

// Proje silme onayı fonksiyonu
function confirmDeleteProject(projectId) {
    if (confirm('Bu projeyi silmek istediğinize emin misiniz? Bu işlem geri alınamaz.')) {
        deleteProject(projectId);
    }
}

// Proje silme fonksiyonu
function deleteProject(projectId) {
    const db = firebase.firestore();
    
    db.collection('projects').doc(projectId).get()
        .then(doc => {
            if (doc.exists) {
                const project = doc.data();
                
                // Önce görseli sil (varsa)
                let deletePromise = Promise.resolve();
                if (project.imageUrl) {
                    deletePromise = deleteFile(project.imageUrl);
                }
                
                // Sonra belgeyi sil
                return deletePromise.then(() => {
                    return db.collection('projects').doc(projectId).delete();
                });
            }
        })
        .then(() => {
            showAlert('Proje başarıyla silindi.', 'success');
            
            // Projeleri yeniden yükle
            loadProjects(db);
            loadProjectStats(db);
        })
        .catch(error => {
            console.error('Proje silinemedi:', error);
            showAlert('Proje silinirken bir hata oluştu.', 'error');
        });
}

// Proje kaydetme fonksiyonu
async function saveProject(db, projectId = null) {
    const title = document.getElementById('projectTitle').value;
    const category = document.getElementById('projectCategory').value;
    const description = document.getElementById('projectDescription').value;
    const status = document.getElementById('projectStatus').value;
    const progress = parseInt(document.getElementById('projectProgress').value) || 0;
    const startDate = document.getElementById('projectStartDate').value;
    const endDate = document.getElementById('projectEndDate').value;
    
    // Gerekli alanları kontrol et
    if (!title || !category || !description || !startDate) {
        showAlert('Lütfen gerekli alanları doldurun.', 'warning');
        return;
    }
    
    try {
        // Yükleme göstergesi
        const submitBtn = document.querySelector('#projectForm [type="submit"]');
        const originalBtnText = submitBtn.innerHTML;
        submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Kaydediliyor...';
        submitBtn.disabled = true;
        
        // Dosya yükleme
        let imageUrl = null;
        const imageInput = document.getElementById('projectImage');
        if (imageInput.files && imageInput.files[0]) {
            const file = imageInput.files[0];
            const path = `projects/${Date.now()}_${file.name}`;
            imageUrl = await uploadFile(file, path);
        }
        
        // Proje verileri
        const projectData = {
            title,
            category,
            description,
            status,
            progress,
            startDate: new Date(startDate),
            updatedAt: firebase.firestore.FieldValue.serverTimestamp()
        };
        
        // Opsiyonel alanlar
        if (endDate) {
            projectData.endDate = new Date(endDate);
        }
        
        if (imageUrl) {
            projectData.imageUrl = imageUrl;
        }
        
        // Yeni proje mi düzenleme mi?
        if (projectId) {
            // Varolan projeyi güncelle
            await db.collection('projects').doc(projectId).update(projectData);
            showAlert('Proje başarıyla güncellendi.', 'success');
        } else {
            // Yeni proje oluştur
            projectData.createdAt = firebase.firestore.FieldValue.serverTimestamp();
            await db.collection('projects').add(projectData);
            showAlert('Yeni proje başarıyla eklendi.', 'success');
        }
        
        // Formu sıfırla ve tabloyu göster
        document.getElementById('projectForm').reset();
        document.getElementById('projectsTableContainer').style.display = 'block';
        document.getElementById('projectFormContainer').style.display = 'none';
        
        // Projeleri yeniden yükle
        loadProjects(db);
        loadProjectStats(db);
    } catch (error) {
        console.error('Proje kaydedilemedi:', error);
        showAlert('Proje kaydedilirken bir hata oluştu: ' + error.message, 'error');
    } finally {
        // Yükleme göstergesini kaldır
        const submitBtn = document.querySelector('#projectForm [type="submit"]');
        submitBtn.innerHTML = originalBtnText;
        submitBtn.disabled = false;
    }
}

// Yardımcı fonksiyonlar
function debounce(func, wait) {
    let timeout;
    return function(...args) {
        const context = this;
        clearTimeout(timeout);
        timeout = setTimeout(() => func.apply(context, args), wait);
    };
} 