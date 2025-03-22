document.addEventListener('DOMContentLoaded', function() {
    // Mobil Menü Fonksiyonu
    const mobileMenuBtn = document.querySelector('.mobile-menu-btn');
    const nav = document.querySelector('.nav');
    
    if (mobileMenuBtn) {
        mobileMenuBtn.addEventListener('click', function() {
            nav.classList.toggle('active');
            
            if (this.querySelector('i').classList.contains('fa-bars')) {
                this.querySelector('i').classList.remove('fa-bars');
                this.querySelector('i').classList.add('fa-times');
            } else {
                this.querySelector('i').classList.remove('fa-times');
                this.querySelector('i').classList.add('fa-bars');
            }
        });
    }
    
    // Menü Öğesi Tıklama
    const navLinks = document.querySelectorAll('.nav-list a');
    
    navLinks.forEach(link => {
        link.addEventListener('click', function() {
            // Mobil menüyü kapat
            if (nav.classList.contains('active')) {
                nav.classList.remove('active');
                mobileMenuBtn.querySelector('i').classList.remove('fa-times');
                mobileMenuBtn.querySelector('i').classList.add('fa-bars');
            }
            
            // Aktif sınıfını kaldır
            navLinks.forEach(navLink => {
                navLink.classList.remove('active');
            });
            
            // Tıklanan link'e aktif sınıfı ekle
            this.classList.add('active');
        });
    });
    
    // Sayfa Kaydırıldığında Header Stili Değiştirme
    const header = document.querySelector('.header');
    
    window.addEventListener('scroll', function() {
        if (window.scrollY > 100) {
            header.style.backgroundColor = '#fff';
            header.style.padding = '10px 0';
        } else {
            header.style.backgroundColor = 'rgba(255, 255, 255, 0.95)';
            header.style.padding = '15px 0';
        }
    });
    
    // Yukarı Git Butonu
    const backToTop = document.querySelector('.back-to-top');
    
    window.addEventListener('scroll', function() {
        if (window.scrollY > 500) {
            backToTop.classList.add('active');
        } else {
            backToTop.classList.remove('active');
        }
    });
    
    // Düzgün Sayfa Kaydırma
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            
            const targetId = this.getAttribute('href');
            
            if (targetId === '#') return;
            
            const targetElement = document.querySelector(targetId);
            
            if (targetElement) {
                window.scrollTo({
                    top: targetElement.offsetTop - 80,
                    behavior: 'smooth'
                });
            }
        });
    });
    
    // Form Gönderimi
    const contactForm = document.querySelector('.contact-form form');
    const newsletterForm = document.querySelector('.newsletter-form');
    
    if (contactForm) {
        contactForm.addEventListener('submit', function(e) {
            e.preventDefault();
            alert('Mesajınız alınmıştır. En kısa sürede sizinle iletişime geçeceğiz.');
            this.reset();
        });
    }
    
    if (newsletterForm) {
        newsletterForm.addEventListener('submit', function(e) {
            e.preventDefault();
            alert('Bültenimize başarıyla abone oldunuz!');
            this.reset();
        });
    }
    
    // Projeler Görselleri ve Müşteri Yorumları için Basit Kaydırma
    const testimonialsSlider = document.querySelector('.testimonials-slider');
    
    if (testimonialsSlider) {
        // Dokunma kaydırma fonksiyonu için değişkenler
        let isDown = false;
        let startX;
        let scrollLeft;
        
        testimonialsSlider.addEventListener('mousedown', (e) => {
            isDown = true;
            startX = e.pageX - testimonialsSlider.offsetLeft;
            scrollLeft = testimonialsSlider.scrollLeft;
        });
        
        testimonialsSlider.addEventListener('mouseleave', () => {
            isDown = false;
        });
        
        testimonialsSlider.addEventListener('mouseup', () => {
            isDown = false;
        });
        
        testimonialsSlider.addEventListener('mousemove', (e) => {
            if (!isDown) return;
            e.preventDefault();
            const x = e.pageX - testimonialsSlider.offsetLeft;
            const walk = (x - startX) * 2;
            testimonialsSlider.scrollLeft = scrollLeft - walk;
        });
    }
    
    // Sayaç Animasyonu
    const counterElements = document.querySelectorAll('.counter');
    const countersSection = document.querySelector('.about-counters');
    
    if (counterElements.length && countersSection) {
        const startCounting = () => {
            counterElements.forEach(counter => {
                const target = parseInt(counter.textContent);
                let count = 0;
                const duration = 2000; // 2 saniye
                const increment = target / (duration / 20); // Her 20ms'de artış miktarı
                
                const timer = setInterval(() => {
                    count += increment;
                    counter.textContent = Math.floor(count);
                    
                    if (count >= target) {
                        counter.textContent = target;
                        clearInterval(timer);
                    }
                }, 20);
            });
        };
        
        // IntersectionObserver ile görüntüye geldiğinde sayaçları başlat
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    startCounting();
                    observer.unobserve(entry.target);
                }
            });
        }, { threshold: 0.5 });
        
        observer.observe(countersSection);
    }
    
    // Testimonial Dots
    const dots = document.querySelectorAll('.dot');
    
    if (dots.length) {
        dots.forEach((dot, index) => {
            dot.addEventListener('click', () => {
                // Aktif dot'u değiştir
                document.querySelector('.dot.active').classList.remove('active');
                dot.classList.add('active');
                
                // Slider'ı kaydır (basit bir slider simülasyonu)
                if (testimonialsSlider) {
                    const cardWidth = testimonialsSlider.querySelector('.testimonial-card').offsetWidth + 30; // 30px gap
                    testimonialsSlider.scrollLeft = cardWidth * index;
                }
            });
        });
    }
    
    // Proje detay görüntüleme için popup
    const projectLinks = document.querySelectorAll('.project-overlay a');
    
    projectLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            const projectTitle = this.closest('.project-card').querySelector('h3').textContent;
            alert(`${projectTitle} projesi detayları yakında eklenecektir.`);
        });
    });
});

// Sayfa kaydırıldığında aktif bölümü işaretle
function highlightActiveSection() {
    const sections = document.querySelectorAll('section[id]');
    const navLinks = document.querySelectorAll('.nav-list a');
    
    window.addEventListener('scroll', () => {
        let current = '';
        
        sections.forEach(section => {
            const sectionTop = section.offsetTop - 120; // Header yüksekliği ve boşluk için ayar
            const sectionHeight = section.offsetHeight;
            const scrollY = window.pageYOffset;
            
            if (scrollY >= sectionTop && scrollY < sectionTop + sectionHeight) {
                current = section.getAttribute('id');
            }
        });
        
        navLinks.forEach(link => {
            link.classList.remove('active');
            if (link.getAttribute('href') === `#${current}`) {
                link.classList.add('active');
            }
        });
    });
}

// Sayfa yüklendiğinde çalıştır
document.addEventListener('DOMContentLoaded', () => {
    highlightActiveSection();
    
    // Tüm menü linklerine tıklandığında 
    const menuLinks = document.querySelectorAll('.nav-list a');
    menuLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            // Mobil menü açıksa kapat
            if (document.querySelector('.nav').classList.contains('active')) {
                document.querySelector('.nav').classList.remove('active');
                document.querySelector('.mobile-menu-btn i').classList.remove('fa-times');
                document.querySelector('.mobile-menu-btn i').classList.add('fa-bars');
            }
        });
    });
}); 