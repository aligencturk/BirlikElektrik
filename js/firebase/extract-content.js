// Web sitesindeki içeriği ayıklama aracı

document.addEventListener('DOMContentLoaded', function() {
    console.log('İçerik ayıklama aracı yüklendi');
    
    // Ayıklama butonunu ekle
    addExtractButton();
});

// Ayıklama butonu ekle
function addExtractButton() {
    const button = document.createElement('button');
    button.id = 'extractContentBtn';
    button.textContent = 'İçeriği Ayıkla';
    button.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        z-index: 9999;
        background: #0d6efd;
        color: white;
        border: none;
        border-radius: 4px;
        padding: 8px 16px;
        font-weight: bold;
        cursor: pointer;
        box-shadow: 0 2px 5px rgba(0,0,0,0.2);
    `;
    
    button.addEventListener('click', extractPageContent);
    document.body.appendChild(button);
}

// Sayfa içeriğini ayıkla
function extractPageContent() {
    // Sayfanın hangi sayfa olduğunu belirle
    const currentPath = window.location.pathname;
    const pageName = currentPath.split('/').pop().split('.')[0] || 'index';
    
    console.log(`Sayfa ayıklanıyor: ${pageName}`);
    
    let extractedContent = {
        pageName: pageName,
        title: document.title,
        url: window.location.href,
        content: {}
    };
    
    // Sayfa tipine göre içeriği ayıkla
    switch(pageName) {
        case 'index':
            extractHomePageContent(extractedContent);
            break;
        case 'about':
            extractAboutPageContent(extractedContent);
            break;
        case 'services':
            extractServicesPageContent(extractedContent);
            break;
        case 'projects':
            extractProjectsPageContent(extractedContent);
            break;
        case 'gallery':
            extractGalleryPageContent(extractedContent);
            break;
        case 'team':
            extractTeamPageContent(extractedContent);
            break;
        case 'contact':
            extractContactPageContent(extractedContent);
            break;
        default:
            extractGenericPageContent(extractedContent);
    }
    
    // İçerik yakalamayı göster
    showExtractedContent(extractedContent);
}

// Ana sayfa içeriğini ayıkla
function extractHomePageContent(data) {
    // Slider
    const sliderItems = [];
    document.querySelectorAll('.slider-item').forEach((item, index) => {
        sliderItems.push({
            title: item.querySelector('.slider-title')?.textContent.trim() || '',
            subtitle: item.querySelector('.slider-subtitle')?.textContent.trim() || '',
            description: item.querySelector('.slider-description')?.textContent.trim() || '',
            image: item.querySelector('img')?.src || '',
            order: index
        });
    });
    data.content.slider = sliderItems;
    
    // Hizmetler
    const services = [];
    document.querySelectorAll('.service-item').forEach((item, index) => {
        services.push({
            title: item.querySelector('.service-title')?.textContent.trim() || '',
            description: item.querySelector('.service-description')?.textContent.trim() || '',
            icon: item.querySelector('.service-icon i')?.className || '',
            order: index
        });
    });
    data.content.services = services;
    
    // Projeler
    const projects = [];
    document.querySelectorAll('.project-item').forEach((item, index) => {
        projects.push({
            title: item.querySelector('.project-title')?.textContent.trim() || '',
            description: item.querySelector('.project-description')?.textContent.trim() || '',
            category: item.querySelector('.project-category')?.textContent.trim() || '',
            image: item.querySelector('img')?.src || '',
            order: index
        });
    });
    data.content.projects = projects;
}

// Hakkımızda sayfası içeriğini ayıkla
function extractAboutPageContent(data) {
    // Hakkımızda başlık
    data.content.title = document.querySelector('.about-title')?.textContent.trim() || '';
    
    // Hakkımızda içerik
    data.content.description = document.querySelector('.about-content')?.textContent.trim() || '';
    
    // Hakkımızda resim
    data.content.image = document.querySelector('.about-image img')?.src || '';
    
    // İstatistikler
    const stats = [];
    document.querySelectorAll('.stat-item').forEach((item, index) => {
        stats.push({
            title: item.querySelector('.stat-title')?.textContent.trim() || '',
            value: item.querySelector('.stat-value')?.textContent.trim() || '',
            icon: item.querySelector('.stat-icon i')?.className || '',
            order: index
        });
    });
    data.content.stats = stats;
}

// Hizmetler sayfası içeriğini ayıkla
function extractServicesPageContent(data) {
    // Hizmetler başlık
    data.content.title = document.querySelector('.services-title')?.textContent.trim() || '';
    
    // Hizmetler açıklama
    data.content.description = document.querySelector('.services-description')?.textContent.trim() || '';
    
    // Hizmetler
    const services = [];
    document.querySelectorAll('.service-item').forEach((item, index) => {
        services.push({
            title: item.querySelector('.service-title')?.textContent.trim() || '',
            description: item.querySelector('.service-description')?.textContent.trim() || '',
            icon: item.querySelector('.service-icon i')?.className || '',
            image: item.querySelector('img')?.src || '',
            order: index
        });
    });
    data.content.services = services;
}

// Projeler sayfası içeriğini ayıkla
function extractProjectsPageContent(data) {
    // Projeler başlık
    data.content.title = document.querySelector('.projects-title')?.textContent.trim() || '';
    
    // Projeler açıklama
    data.content.description = document.querySelector('.projects-description')?.textContent.trim() || '';
    
    // Kategoriler
    const categories = [];
    document.querySelectorAll('.project-filter-item').forEach((item, index) => {
        categories.push({
            name: item.textContent.trim(),
            value: item.getAttribute('data-filter') || '',
            order: index
        });
    });
    data.content.categories = categories;
    
    // Projeler
    const projects = [];
    document.querySelectorAll('.project-item').forEach((item, index) => {
        projects.push({
            title: item.querySelector('.project-title')?.textContent.trim() || '',
            description: item.querySelector('.project-description')?.textContent.trim() || '',
            category: item.querySelector('.project-category')?.textContent.trim() || '',
            image: item.querySelector('img')?.src || '',
            order: index
        });
    });
    data.content.projects = projects;
}

// Galeri sayfası içeriğini ayıkla
function extractGalleryPageContent(data) {
    // Galeri başlık
    data.content.title = document.querySelector('.gallery-title')?.textContent.trim() || '';
    
    // Galeri açıklama
    data.content.description = document.querySelector('.gallery-description')?.textContent.trim() || '';
    
    // Galeri resimler
    const gallery = [];
    document.querySelectorAll('.gallery-item').forEach((item, index) => {
        gallery.push({
            title: item.querySelector('.gallery-title')?.textContent.trim() || '',
            category: item.querySelector('.gallery-category')?.textContent.trim() || '',
            image: item.querySelector('img')?.src || '',
            order: index
        });
    });
    data.content.gallery = gallery;
}

// Takım sayfası içeriğini ayıkla
function extractTeamPageContent(data) {
    // Takım başlık
    data.content.title = document.querySelector('.team-title')?.textContent.trim() || '';
    
    // Takım açıklama
    data.content.description = document.querySelector('.team-description')?.textContent.trim() || '';
    
    // Takım üyeleri
    const team = [];
    document.querySelectorAll('.team-member').forEach((item, index) => {
        team.push({
            name: item.querySelector('.team-member-name')?.textContent.trim() || '',
            title: item.querySelector('.team-member-title')?.textContent.trim() || '',
            bio: item.querySelector('.team-member-bio')?.textContent.trim() || '',
            image: item.querySelector('img')?.src || '',
            order: index
        });
    });
    data.content.team = team;
}

// İletişim sayfası içeriğini ayıkla
function extractContactPageContent(data) {
    // İletişim başlık
    data.content.title = document.querySelector('.contact-title')?.textContent.trim() || '';
    
    // İletişim açıklama
    data.content.description = document.querySelector('.contact-description')?.textContent.trim() || '';
    
    // İletişim bilgileri
    data.content.contact = {
        address: document.querySelector('.contact-address')?.textContent.trim() || '',
        phone: document.querySelector('.contact-phone')?.textContent.trim() || '',
        email: document.querySelector('.contact-email')?.textContent.trim() || '',
        workHours: document.querySelector('.contact-hours')?.textContent.trim() || ''
    };
    
    // Sosyal medya
    const socialMedia = {};
    if (document.querySelector('.social-facebook')) {
        socialMedia.facebook = document.querySelector('.social-facebook').href;
    }
    if (document.querySelector('.social-twitter')) {
        socialMedia.twitter = document.querySelector('.social-twitter').href;
    }
    if (document.querySelector('.social-instagram')) {
        socialMedia.instagram = document.querySelector('.social-instagram').href;
    }
    if (document.querySelector('.social-linkedin')) {
        socialMedia.linkedin = document.querySelector('.social-linkedin').href;
    }
    data.content.socialMedia = socialMedia;
}

// Genel sayfa içeriğini ayıkla
function extractGenericPageContent(data) {
    // Sayfa başlığı
    data.content.title = document.querySelector('h1')?.textContent.trim() || document.title;
    
    // Sayfa içeriği
    const contentElement = document.querySelector('.page-content') || document.querySelector('main');
    if (contentElement) {
        data.content.html = contentElement.innerHTML;
        data.content.text = contentElement.textContent.trim();
    }
}

// Ayıklanan içeriği göster
function showExtractedContent(data) {
    // Modal oluştur
    const modal = document.createElement('div');
    modal.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0,0,0,0.8);
        z-index: 10000;
        display: flex;
        justify-content: center;
        align-items: center;
        padding: 20px;
    `;
    
    // Modal içerik
    const modalContent = document.createElement('div');
    modalContent.style.cssText = `
        background: white;
        border-radius: 8px;
        width: 90%;
        max-width: 800px;
        max-height: 80vh;
        overflow-y: auto;
        padding: 20px;
        position: relative;
    `;
    
    // Kapat butonu
    const closeButton = document.createElement('button');
    closeButton.textContent = 'X';
    closeButton.style.cssText = `
        position: absolute;
        top: 10px;
        right: 10px;
        background: #dc3545;
        color: white;
        border: none;
        border-radius: 50%;
        width: 30px;
        height: 30px;
        font-weight: bold;
        cursor: pointer;
    `;
    closeButton.addEventListener('click', () => {
        document.body.removeChild(modal);
    });
    
    // Başlık
    const title = document.createElement('h2');
    title.textContent = `İçerik Ayıklandı: ${data.title}`;
    title.style.cssText = `
        margin-top: 0;
        margin-bottom: 20px;
        padding-bottom: 10px;
        border-bottom: 1px solid #ddd;
    `;
    
    // İçerik
    const content = document.createElement('pre');
    content.style.cssText = `
        background: #f8f9fa;
        border-radius: 4px;
        padding: 15px;
        overflow: auto;
        font-size: 14px;
        line-height: 1.5;
    `;
    content.textContent = JSON.stringify(data, null, 2);
    
    // Kopyala butonu
    const copyButton = document.createElement('button');
    copyButton.textContent = 'Kopyala';
    copyButton.style.cssText = `
        background: #0d6efd;
        color: white;
        border: none;
        border-radius: 4px;
        padding: 8px 16px;
        font-weight: bold;
        cursor: pointer;
        margin-top: 15px;
    `;
    copyButton.addEventListener('click', () => {
        navigator.clipboard.writeText(JSON.stringify(data, null, 2))
            .then(() => {
                copyButton.textContent = 'Kopyalandı!';
                setTimeout(() => {
                    copyButton.textContent = 'Kopyala';
                }, 2000);
            })
            .catch(err => {
                console.error('Kopyalama hatası:', err);
                alert('Kopyalama başarısız oldu.');
            });
    });
    
    // JSON indirme butonu
    const downloadButton = document.createElement('button');
    downloadButton.textContent = 'JSON İndir';
    downloadButton.style.cssText = `
        background: #198754;
        color: white;
        border: none;
        border-radius: 4px;
        padding: 8px 16px;
        font-weight: bold;
        cursor: pointer;
        margin-top: 15px;
        margin-left: 10px;
    `;
    downloadButton.addEventListener('click', () => {
        // JSON dosyasını oluştur ve indir
        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${data.pageName}-content.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    });
    
    // Butonları grup içine al
    const buttonGroup = document.createElement('div');
    buttonGroup.style.cssText = `
        display: flex;
        gap: 10px;
    `;
    buttonGroup.appendChild(copyButton);
    buttonGroup.appendChild(downloadButton);
    
    // Tüm elementleri modalContent'e ekle
    modalContent.appendChild(closeButton);
    modalContent.appendChild(title);
    modalContent.appendChild(content);
    modalContent.appendChild(buttonGroup);
    
    // Modal'ı body'e ekle
    modal.appendChild(modalContent);
    document.body.appendChild(modal);
    
    // Konsola da yazdır
    console.log('Ayıklanan içerik:', data);
} 