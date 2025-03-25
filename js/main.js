// Ana JavaScript Dosyası - Birlik Elektrik

document.addEventListener('DOMContentLoaded', function() {
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
    
    // Hero Slider
    const heroSlider = document.querySelector('.hero-slider');
    if (heroSlider) {
        initHeroSlider();
    }
    
    // Animasyonlu elementler
    initAnimations();
});

// Hero Slider İşlevi
function initHeroSlider() {
    const slides = document.querySelectorAll('.hero-slide');
    const indicators = document.querySelectorAll('.hero-indicators .indicator');
    const prevButton = document.querySelector('.prev-slide');
    const nextButton = document.querySelector('.next-slide');
    
    if (slides.length === 0) return;
    
    let currentSlide = 0;
    let slideInterval = setInterval(nextSlide, 6000);
    
    // Sonraki slide'a geç
    function nextSlide() {
        goToSlide((currentSlide + 1) % slides.length);
    }
    
    // Önceki slide'a geç
    function prevSlide() {
        goToSlide((currentSlide - 1 + slides.length) % slides.length);
    }
    
    // Belirli bir slide'a git
    function goToSlide(n) {
        slides[currentSlide].classList.remove('active');
        if (indicators.length > 0) indicators[currentSlide].classList.remove('active');
        
        currentSlide = n;
        
        slides[currentSlide].classList.add('active');
        if (indicators.length > 0) indicators[currentSlide].classList.add('active');
        
        resetInterval();
    }
    
    // Interval'i sıfırla
    function resetInterval() {
        clearInterval(slideInterval);
        slideInterval = setInterval(nextSlide, 6000);
    }
    
    // İlerlet/Geri düğmesi olay dinleyicileri
    if (prevButton) {
        prevButton.addEventListener('click', function() {
            prevSlide();
        });
    }
    
    if (nextButton) {
        nextButton.addEventListener('click', function() {
            nextSlide();
        });
    }
    
    // İndikatör olay dinleyicileri
    if (indicators.length > 0) {
        indicators.forEach((indicator, index) => {
            indicator.addEventListener('click', function() {
                goToSlide(index);
            });
        });
    }
}

// Animasyonlu elementler
function initAnimations() {
    const animatedElements = document.querySelectorAll('.animated-element');
    
    if (animatedElements.length === 0) return;
    
    // IntersectionObserver kullanarak görünür olduğunda animasyon ekle
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('in-view');
                observer.unobserve(entry.target);
            }
        });
    }, {
        threshold: 0.2
    });
    
    // Her animasyonlu elementi gözlemle
    animatedElements.forEach(element => {
        observer.observe(element);
    });
} 