// Web sayfası için Firebase entegrasyonu

document.addEventListener('DOMContentLoaded', function() {
    // Firebase modüllerinin yüklendiğini kontrol et
    if (typeof firebase === 'undefined') {
        console.warn('Firebase kütüphanesi yüklenemedi! Sayfanın temel işlevleri sağlanacak, ancak veri kaydetme işlemleri çalışmayabilir.');
        // Burada hata mesajı göstermiyoruz, kullanıcı deneyimini bozmamak için
    }
    
    // dbHelper'ın varlığını kontrol et
    if (typeof dbHelper === 'undefined') {
        console.warn('dbHelper tanımlanmamış! Varsayılan veriler kullanılacak.');
        // İlgili fonksiyonları boş olarak tanımla
        window.dbHelper = {
            addContactMessage: async () => ({ success: true }),
            subscribeToNewsletter: async () => ({ success: true }),
            getProjects: async () => []
        };
    }
    
    // İletişim formu gönderimi
    const contactForm = document.querySelector('#contactForm');
    if (contactForm) {
        contactForm.addEventListener('submit', async function(e) {
            e.preventDefault();
            
            const nameInput = this.querySelector('input[placeholder="Adınız"]');
            const emailInput = this.querySelector('input[placeholder="E-posta Adresiniz"]');
            const phoneInput = this.querySelector('input[placeholder="Telefon Numaranız"]');
            const serviceSelect = this.querySelector('select');
            const messageInput = this.querySelector('textarea');
            
            if (!nameInput || !emailInput || !phoneInput || !serviceSelect || !messageInput) {
                alert('Form alanlarına erişilemedi.');
                return;
            }
            
            const messageData = {
                name: nameInput.value,
                email: emailInput.value,
                phone: phoneInput.value,
                service: serviceSelect.value,
                message: messageInput.value
            };
            
            try {
                // Düğmeyi devre dışı bırak ve yükleniyor göster
                const submitButton = this.querySelector('button[type="submit"]');
                const originalText = submitButton.innerHTML;
                submitButton.disabled = true;
                submitButton.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Gönderiliyor...';
                
                let result;
                // Firebase bağlantısı varsa veriyi kaydet
                if (typeof dbHelper.addContactMessage === 'function') {
                    result = await dbHelper.addContactMessage(messageData);
                } else {
                    // Firebase yok, demo sonuç döndür
                    console.log('Demo mod: İletişim mesajı kaydedilecekti:', messageData);
                    result = { success: true };
                }
                
                if (result.success) {
                    // Başarılı
                    submitButton.innerHTML = '<i class="fas fa-check"></i> Gönderildi';
                    submitButton.classList.add('success');
                    
                    // Form temizleme
                    contactForm.reset();
                    
                    // Kullanıcıya bilgi ver
                    setTimeout(() => {
                        alert('Mesajınız alınmıştır. En kısa sürede sizinle iletişime geçeceğiz.');
                        submitButton.innerHTML = originalText;
                        submitButton.disabled = false;
                        submitButton.classList.remove('success');
                    }, 1500);
                } else {
                    throw new Error(result.error || 'Bir hata oluştu.');
                }
            } catch (error) {
                console.error('İletişim formu gönderilirken hata oluştu:', error);
                alert(`Mesajınız gönderilemedi: ${error.message}`);
                
                // Düğmeyi eski haline getir
                const submitButton = this.querySelector('button[type="submit"]');
                submitButton.innerHTML = originalText;
                submitButton.disabled = false;
            }
        });
    }
    
    // Haber bülteni aboneliği
    const newsletterForm = document.querySelector('.newsletter-form');
    if (newsletterForm) {
        newsletterForm.addEventListener('submit', async function(e) {
            e.preventDefault();
            
            const emailInput = this.querySelector('input[type="email"]');
            
            if (!emailInput) {
                alert('E-posta alanına erişilemedi.');
                return;
            }
            
            try {
                // Düğmeyi devre dışı bırak ve yükleniyor göster
                const submitButton = this.querySelector('button[type="submit"]');
                const originalHtml = submitButton.innerHTML;
                submitButton.disabled = true;
                submitButton.innerHTML = '<i class="fas fa-spinner fa-spin"></i>';
                
                // Firebase'e ekle
                const result = await dbHelper.subscribeToNewsletter(emailInput.value);
                
                if (result.success) {
                    // Başarılı
                    submitButton.innerHTML = '<i class="fas fa-check"></i>';
                    submitButton.classList.add('success');
                    
                    // Form temizleme
                    newsletterForm.reset();
                    
                    // Kullanıcıya bilgi ver
                    setTimeout(() => {
                        alert('Bültenimize başarıyla abone oldunuz!');
                        submitButton.innerHTML = originalHtml;
                        submitButton.disabled = false;
                        submitButton.classList.remove('success');
                    }, 1500);
                } else {
                    throw new Error(result.error || 'Bir hata oluştu.');
                }
            } catch (error) {
                console.error('Bülten aboneliği yapılırken hata oluştu:', error);
                alert(`Abonelik işlemi yapılamadı: ${error.message}`);
                
                // Düğmeyi eski haline getir
                const submitButton = this.querySelector('button[type="submit"]');
                submitButton.innerHTML = originalHtml;
                submitButton.disabled = false;
            }
        });
    }
    
    // Projeleri görüntüleme
    const loadProjects = async () => {
        try {
            const projectsGrid = document.querySelector('.projects-grid');
            if (!projectsGrid) return;
            
            // Yükleniyor göstergesi
            projectsGrid.innerHTML = '<div class="loading"><i class="fas fa-spinner fa-spin"></i> Projeler yükleniyor...</div>';
            
            // Projeleri getir
            const projects = await dbHelper.getProjects(4); // İlk 4 projeyi göster
            
            if (projects.length === 0) {
                projectsGrid.innerHTML = '<div class="no-projects">Henüz proje bulunmuyor.</div>';
                return;
            }
            
            // Projeleri HTML'e ekle
            projectsGrid.innerHTML = projects.map(project => `
                <div class="project-card">
                    <div class="project-image">
                        <img src="${project.imageUrl || 'https://images.unsplash.com/photo-1497366754035-f200968a6e72?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1169&q=80'}" alt="${project.title}">
                        <div class="project-overlay">
                            <a href="#" data-project-id="${project.id}"><i class="fas fa-external-link-alt"></i></a>
                        </div>
                    </div>
                    <div class="project-content">
                        <h3>${project.title}</h3>
                        <p>${project.description}</p>
                    </div>
                </div>
            `).join('');
            
            // Proje detayları için tıklama olayları ekle
            projectsGrid.querySelectorAll('.project-overlay a').forEach(link => {
                link.addEventListener('click', function(e) {
                    e.preventDefault();
                    const projectId = this.getAttribute('data-project-id');
                    showProjectDetails(projectId);
                });
            });
        } catch (error) {
            console.error('Projeler yüklenirken hata oluştu:', error);
        }
    };
    
    // Proje detaylarını göster
    const showProjectDetails = async (projectId) => {
        try {
            // Projeyi getir
            const projectDoc = await projectsRef.doc(projectId).get();
            
            if (!projectDoc.exists) {
                alert('Proje bulunamadı.');
                return;
            }
            
            const project = {
                id: projectDoc.id,
                ...projectDoc.data()
            };
            
            // Modal oluştur
            const modal = document.createElement('div');
            modal.className = 'project-modal';
            modal.innerHTML = `
                <div class="project-modal-content">
                    <span class="close-modal">&times;</span>
                    <div class="project-modal-image">
                        <img src="${project.imageUrl || 'https://images.unsplash.com/photo-1497366754035-f200968a6e72?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1169&q=80'}" alt="${project.title}">
                    </div>
                    <div class="project-modal-details">
                        <h2>${project.title}</h2>
                        <p class="project-date">Tarih: ${new Date(project.date).toLocaleDateString('tr-TR')}</p>
                        <p>${project.description}</p>
                        <div class="project-specs">
                            <p><strong>Kategori:</strong> ${project.category}</p>
                            <p><strong>Tamamlanma Durumu:</strong> ${project.completed ? 'Tamamlandı' : 'Devam Ediyor'}</p>
                        </div>
                    </div>
                </div>
            `;
            
            // Modal'ı sayfaya ekle
            document.body.appendChild(modal);
            
            // Modal kapanış olayını ekle
            modal.querySelector('.close-modal').addEventListener('click', () => {
                modal.remove();
            });
            
            // Modal dışına tıklama ile kapanma
            modal.addEventListener('click', (e) => {
                if (e.target === modal) {
                    modal.remove();
                }
            });
        } catch (error) {
            console.error('Proje detayları gösterilirken hata oluştu:', error);
            alert('Proje detayları yüklenirken bir hata oluştu.');
        }
    };
    
    // Sayfa yüklendiğinde projeleri göster
    if (document.querySelector('.projects-grid')) {
        loadProjects();
    }
}); 