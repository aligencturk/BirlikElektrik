// İletişim Formu - Birlik Elektrik
document.addEventListener('DOMContentLoaded', function() {
    // Firebase yapılandırmasını kontrol et
    if (!firebase || !firebase.firestore) {
        console.error('Firebase yüklenemedi veya yapılandırılamadı.');
        return;
    }
    
    // İletişim formunu bul
    const contactForm = document.getElementById('contactForm');
    if (!contactForm) {
        console.warn('İletişim formu bulunamadı.');
        return;
    }
    
    // Form gönderimini dinle
    contactForm.addEventListener('submit', async function(e) {
        e.preventDefault();
        
        // Form verilerini al
        const name = document.getElementById('name').value.trim();
        const email = document.getElementById('email').value.trim();
        const phone = document.getElementById('phone')?.value.trim() || '';
        const subject = document.getElementById('subject').value.trim();
        const message = document.getElementById('message').value.trim();
        
        // Basit doğrulama
        if (!name || !email || !subject || !message) {
            showFormAlert('Lütfen tüm zorunlu alanları doldurun.', 'error');
            return;
        }
        
        // Yükleniyor durumunu göster
        const submitButton = contactForm.querySelector('button[type="submit"]');
        const originalButtonText = submitButton.innerHTML;
        submitButton.disabled = true;
        submitButton.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Gönderiliyor...';
        
        try {
            // Firebase Firestore'a mesajı kaydet
            const db = firebase.firestore();
            
            await db.collection('messages').add({
                name,
                email,
                phone,
                subject,
                message,
                read: false,
                replied: false,
                createdAt: firebase.firestore.FieldValue.serverTimestamp()
            });
            
            // Başarılı mesajını göster
            showFormAlert('Mesajınız başarıyla gönderildi. En kısa sürede size dönüş yapacağız.', 'success');
            
            // Formu temizle
            contactForm.reset();
        } catch (error) {
            console.error('Mesaj gönderilemedi:', error);
            showFormAlert('Mesajınız gönderilirken bir hata oluştu. Lütfen daha sonra tekrar deneyin.', 'error');
        } finally {
            // Butonun durumunu sıfırla
            submitButton.disabled = false;
            submitButton.innerHTML = originalButtonText;
        }
    });
    
    // Form uyarı mesajını gösterme fonksiyonu
    function showFormAlert(message, type = 'info') {
        const alertContainer = document.querySelector('.contact-form-alert');
        if (!alertContainer) {
            // Uyarı konteyneri yoksa oluştur
            const formGroup = contactForm.querySelector('.form-group:first-child');
            const alert = document.createElement('div');
            alert.className = `contact-form-alert alert alert-${type}`;
            alert.innerHTML = message;
            contactForm.insertBefore(alert, formGroup);
        } else {
            // Mevcut uyarı konteynerini güncelle
            alertContainer.className = `contact-form-alert alert alert-${type}`;
            alertContainer.innerHTML = message;
            alertContainer.style.display = 'block';
        }
        
        // 5 saniye sonra uyarıyı kaldır
        setTimeout(() => {
            const alert = document.querySelector('.contact-form-alert');
            if (alert) {
                alert.style.display = 'none';
            }
        }, 5000);
    }
}); 