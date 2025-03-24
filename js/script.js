// Birlik Elektrik Ana Script Dosyası

document.addEventListener('DOMContentLoaded', function() {
    // Sayfa başlık animasyonu
    const heroContents = document.querySelectorAll('.hero-content');
    heroContents.forEach(heroContent => {
        // Başlangıçta görünür yap
        heroContent.style.opacity = "1";
            
        // İç sayfa hero veya normal hero kontrolü
        if (heroContent.closest('.inner-page-hero')) {
            // İç sayfa hero için transform X değerini koruyarak sadece Y animasyonu uygula
            heroContent.style.transform = "translateX(-50%) translateY(0)";
        } else {
            heroContent.style.transform = "translateY(0)";
        }
    });
    
    // Hero Slider Fonksiyonları
    const initHeroSlider = () => {
        const slides = document.querySelectorAll('.hero-slide');
        const prevBtn = document.querySelector('.prev-slide');
        const nextBtn = document.querySelector('.next-slide');
        const indicators = document.querySelectorAll('.indicator');
        let currentSlide = 0;
        let slideInterval;
        
        // Otomatik slider için interval
        const startSlideInterval = () => {
            slideInterval = setInterval(() => {
                goToNextSlide();
            }, 5000); // 5 saniyede bir
        };
        
        // Interval'ı durdur
        const stopSlideInterval = () => {
            clearInterval(slideInterval);
        };
        
        // Gösterge noktalarını güncelle
        const updateIndicators = () => {
            indicators.forEach((indicator, index) => {
                indicator.classList.toggle('active', index === currentSlide);
            });
        };
        
        // Slaytları güncelle
        const updateSlides = () => {
            slides.forEach((slide, index) => {
                // Önce tüm slaytları inaktif yap
                slide.classList.remove('active');
                
                // Animasyonu sıfırlamak için önce stil özelliklerini resetle
                const content = slide.querySelector('.hero-content');
                if (content) {
                    const heading = content.querySelector('h1');
                    const paragraph = content.querySelector('p');
                    const buttons = content.querySelector('.hero-buttons');
                    
                    if (heading) {
                        heading.style.opacity = "0";
                        heading.style.transform = "translateY(30px)";
                    }
                    
                    if (paragraph) {
                        paragraph.style.opacity = "0";
                        paragraph.style.transform = "translateY(30px)";
                    }
                    
                    if (buttons) {
                        buttons.style.opacity = "0";
                        buttons.style.transform = "translateY(30px)";
                    }
                }
            });
            
            // Sonra aktif slaytı ayarla
            slides[currentSlide].classList.add('active');
            
            // Eğer ilk slayta geçildi ve içinde video varsa, videoyu yeniden başlat
            if (currentSlide === 0) {
                const videoElement = slides[0].querySelector('video');
                if (videoElement) {
                    videoElement.currentTime = 0;
                    videoElement.play();
                }
            }
            
            // Animasyonları tetikle (küçük bir gecikme ile)
            setTimeout(() => {
                const activeSlide = slides[currentSlide];
                const content = activeSlide.querySelector('.hero-content');
                if (content) {
                    const heading = content.querySelector('h1');
                    const paragraph = content.querySelector('p');
                    const buttons = content.querySelector('.hero-buttons');
                    
                    if (heading) {
                        heading.style.opacity = "";
                        heading.style.transform = "";
                    }
                    
                    if (paragraph) {
                        paragraph.style.opacity = "";
                        paragraph.style.transform = "";
                    }
                    
                    if (buttons) {
                        buttons.style.opacity = "";
                        buttons.style.transform = "";
                    }
                }
            }, 50);
            
            updateIndicators();
        };
        
        // Önceki slayta git
        const goToPrevSlide = () => {
            currentSlide = (currentSlide === 0) ? slides.length - 1 : currentSlide - 1;
            updateSlides();
        };
        
        // Sonraki slayta git
        const goToNextSlide = () => {
            currentSlide = (currentSlide === slides.length - 1) ? 0 : currentSlide + 1;
            updateSlides();
        };
        
        // Belirli bir slayta git
        const goToSlide = (slideIndex) => {
            currentSlide = slideIndex;
            updateSlides();
        };
        
        // Event Listeners ekle
        if (prevBtn) {
            prevBtn.addEventListener('click', () => {
                goToPrevSlide();
                stopSlideInterval();
                startSlideInterval(); // Yeniden başlat
            });
        }
        
        if (nextBtn) {
            nextBtn.addEventListener('click', () => {
                goToNextSlide();
                stopSlideInterval();
                startSlideInterval(); // Yeniden başlat
            });
        }
        
        indicators.forEach((indicator, index) => {
            indicator.addEventListener('click', () => {
                goToSlide(index);
                stopSlideInterval();
                startSlideInterval(); // Yeniden başlat
            });
        });
        
        // Otomatik slider'ı başlat
        startSlideInterval();
    };
    
    // Hero Slider varsa başlat
    if (document.querySelector('.hero-slider')) {
        initHeroSlider();
    }
    
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
