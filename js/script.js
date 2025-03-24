// Birlik Elektrik Ana Script Dosyası

document.addEventListener('DOMContentLoaded', function() {
    // Sayfa başlık animasyonu
    setTimeout(() => {
        const heroContent = document.querySelector('.hero-content');
        if (heroContent) {
            heroContent.style.opacity = "1";
            
            // İç sayfa hero veya normal hero kontrolü
            if (heroContent.closest('.inner-page-hero')) {
                // İç sayfa hero için transform X değerini koruyarak sadece Y animasyonu uygula
                heroContent.style.transform = "translateX(-50%) translateY(0)";
            } else {
                heroContent.style.transform = "translateY(0)";
            }
        }
    }, 300);
    
    // Animasyonlu elementler için Intersection Observer
    const animatedElements = document.querySelectorAll('.animated-element');
    
    if (animatedElements.length > 0) {
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.style.opacity = "1";
                    entry.target.style.transform = "translateY(0)";
                    observer.unobserve(entry.target);
                }
            });
        }, { threshold: 0.1 });
        
        // Başlangıçta elementleri gizle
        animatedElements.forEach((element, index) => {
            element.style.opacity = "0";
            element.style.transform = "translateY(20px)";
            element.style.transitionDelay = `${index * 0.1}s`;
            observer.observe(element);
        });
    }
    
    // Header scroll efekti
    window.addEventListener('scroll', function() {
        const header = document.querySelector('.header');
        if (header) {
            if (window.scrollY > 100) {
                header.classList.add('scrolled');
            } else {
                header.classList.remove('scrolled');
            }
        }
    });
    
    // Mobil menü
    const mobileMenuBtn = document.querySelector('.mobile-menu-btn');
    const nav = document.querySelector('.nav');
    
    if (mobileMenuBtn && nav) {
        mobileMenuBtn.addEventListener('click', function() {
            nav.classList.toggle('active');
            const icon = mobileMenuBtn.querySelector('i');
            if (icon) {
                icon.classList.toggle('fa-bars');
                icon.classList.toggle('fa-times');
            }
        });
    }
    
    // Yukarı git butonu
    const backToTopBtn = document.querySelector('.back-to-top');
    
    if (backToTopBtn) {
        window.addEventListener('scroll', () => {
            if (window.scrollY > 300) {
                backToTopBtn.classList.add('visible');
            } else {
                backToTopBtn.classList.remove('visible');
            }
        });
        
        backToTopBtn.addEventListener('click', (e) => {
            e.preventDefault();
            window.scrollTo({
                top: 0,
                behavior: 'smooth'
            });
        });
    }
    
    // Form işlemleri
    const contactForm = document.getElementById('contactForm');
    if (contactForm) {
        contactForm.addEventListener('submit', function(e) {
            // Form gönderimini varsayılan olarak engelle
            // firebase/frontend.js içinde zaten işleniyor
            if (!window.dbHelper || !window.dbHelper.addContactMessage) {
                e.preventDefault();
                console.log('Form bilgileri:', {
                    name: contactForm.querySelector('[name="name"]').value,
                    email: contactForm.querySelector('[name="email"]').value,
                    message: contactForm.querySelector('[name="message"]').value
                });
                
                alert('Mesajınız alındı. En kısa sürede size dönüş yapacağız.');
                contactForm.reset();
            }
        });
    }
    
    // Bülten aboneliği
    const newsletterForm = document.querySelector('.newsletter-form');
    if (newsletterForm) {
        newsletterForm.addEventListener('submit', function(e) {
            // Firebase yüklü değilse burada işle
            if (!window.dbHelper || !window.dbHelper.subscribeToNewsletter) {
                e.preventDefault();
                const email = newsletterForm.querySelector('input[type="email"]').value;
                console.log('Bülten aboneliği:', email);
                
                alert('Bültenimize başarıyla abone oldunuz!');
                newsletterForm.reset();
            }
        });
    }
    
    // Proje kategorileri için filtreleme
    const projectCategories = document.querySelectorAll('.project-category');
    if (projectCategories.length > 0) {
        projectCategories.forEach(category => {
            category.addEventListener('click', function() {
                // Aktif sınıfı kaldır
                projectCategories.forEach(cat => {
                    cat.classList.remove('active');
                });
                
                // Tıklanan kategoriye aktif sınıfı ekle
                this.classList.add('active');
                
                // Burada gerçek projeler için filtre mantığı eklenebilir
                const categoryName = this.textContent.toLowerCase();
                const projectItems = document.querySelectorAll('.project-item');
                
                projectItems.forEach(item => {
                    // Animasyon ekle
                    item.style.opacity = '0';
                    item.style.transform = 'translateY(20px)';
                    
                    setTimeout(() => {
                        item.style.opacity = '1';
                        item.style.transform = 'translateY(0)';
                    }, 300);
                });
            });
        });
    }
    
    // Sayaç animasyonu (about sayfası için)
    const startCounter = () => {
        const statCounts = document.querySelectorAll('.stat-item span');
        
        statCounts.forEach(counter => {
            const target = parseInt(counter.textContent);
            let count = 0;
            const duration = 2000; // ms
            const step = Math.ceil(target / (duration / 20)); // 20ms aralıklarla güncelleme
            
            const updateCount = () => {
                if (count < target) {
                    count += step;
                    if (count > target) count = target;
                    counter.textContent = count;
                    setTimeout(updateCount, 20);
                }
            };
            
            updateCount();
        });
    };
    
    // Sayaçlar görüntüye girdiğinde animasyonu başlat
    const statsContainer = document.querySelector('.stats-container');
    if (statsContainer) {
        const statsObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    startCounter();
                    statsObserver.unobserve(entry.target);
                }
            });
        }, { threshold: 0.5 });
        
        statsObserver.observe(statsContainer);
    }
});
