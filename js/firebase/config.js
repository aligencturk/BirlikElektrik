// Firebase Yapılandırma Dosyası
const firebaseConfig = {
  apiKey: "AIzaSyDjo8BPQoNqnWgsBy31bC_cim9jCfSsFNI",
  authDomain: "birlikelektrik-90f62.firebaseapp.com",
  projectId: "birlikelektrik-90f62",
  storageBucket: "birlikelektrik-90f62.firebasestorage.app",
  messagingSenderId: "765808232163",
  appId: "1:765808232163:web:d7c92e98e7974c9f9ae7d6"
};

// Firebase modüllerinin varlığını kontrol et
if (typeof firebase === 'undefined') {
  console.error('Firebase kütüphanesi yüklenemedi! Lütfen internet bağlantınızı kontrol edin.');
  throw new Error('Firebase kütüphanesi yüklenemedi! Lütfen internet bağlantınızı kontrol edin.');
}

// Firebase'i başlat
let app, db, storage, auth;

try {
  // Firebase App başlat
  app = firebase.initializeApp(firebaseConfig);
  console.log('Firebase başarıyla başlatıldı.');
  
  // Firebase modüllerini kontrol et
  const isFirestoreAvailable = typeof firebase.firestore === 'function';
  const isStorageAvailable = typeof firebase.storage === 'function';
  const isAuthAvailable = typeof firebase.auth === 'function';
  
  console.log('Firebase modül kontrolleri:', {
    firestore: isFirestoreAvailable ? 'Mevcut' : 'Mevcut değil',
    storage: isStorageAvailable ? 'Mevcut' : 'Mevcut değil',
    auth: isAuthAvailable ? 'Mevcut' : 'Mevcut değil'
  });
  
  // Auth modülü yoksa detaylı hata bilgisi ver
  if (!isAuthAvailable) {
    console.error('Firebase Authentication modülü bulunamadı! Bu sorun şu nedenlerden kaynaklanabilir:');
    console.error('1. firebase-auth.js dosyası yüklenememiş olabilir');
    console.error('2. Script etiketlerinin yükleme sırası doğru olmayabilir');
    console.error('3. CDN veya internet bağlantı sorunu olabilir');
    console.error('4. Tarayıcı önbelleği sorunu olabilir');
    
    // Tarayıcı cache'ini temizlemeleri için kullanıcıya bilgi ver
    console.error('Lütfen tarayıcı önbelleğini temizleyin (Ctrl+F5) ve sayfayı yenileyin');
  }
  
  // Firestore ayarları
  const settings = {
    cacheSizeBytes: firebase.firestore.CACHE_SIZE_UNLIMITED,
    ignoreUndefinedProperties: true,
    merge: true
  };
  
  // Firestore modülünü kontrol et ve başlat
  if (isFirestoreAvailable) {
    db = firebase.firestore();
    db.settings(settings);
    db.enablePersistence({ synchronizeTabs: true })
      .catch(err => {
        if (err.code === 'failed-precondition') {
          // Birden fazla sekme açık olduğunda bu hata oluşabilir
          console.warn('Çevrimdışı kalıcılık birden fazla sekme açıkken kullanılamaz');
        } else if (err.code === 'unimplemented') {
          // Tarayıcı desteklemiyorsa bu hata oluşabilir
          console.warn('Bu tarayıcıda çevrimdışı kalıcılık desteklenmiyor');
        }
      });
  } else {
    console.error('Firebase Firestore modülü bulunamadı!');
  }
  
  // Storage modülünü kontrol et ve başlat
  if (isStorageAvailable) {
    storage = firebase.storage();
  } else {
    console.error('Firebase Storage modülü bulunamadı!');
  }
  
  // Auth modülünü kontrol et ve başlat
  if (isAuthAvailable) {
    try {
      auth = firebase.auth();
      console.log('Firebase Authentication başarıyla başlatıldı.');
    } catch (authError) {
      console.error('Firebase Authentication başlatılırken hata oluştu:', authError);
    }
  } else {
    console.error('Firebase Authentication modülü bulunamadı!');
  }
} catch (error) {
  console.error('Firebase başlatılırken hata oluştu:', error);
}

// Bağlantı durumunu takip et (Realtime Database olmadan)
let isConnected = navigator.onLine;
console.log('Firebase bağlantı durumu:', isConnected ? 'Bağlı' : 'Bağlantı kesik');

// Tarayıcı bağlantı event'leri ile bağlantı durumunu izle
window.addEventListener('online', () => {
  isConnected = true;
  const event = new CustomEvent('firebaseConnectionChange', { 
    detail: { isConnected: true } 
  });
  window.dispatchEvent(event);
  console.log('Firebase bağlantı durumu: Bağlı');
});

window.addEventListener('offline', () => {
  isConnected = false;
  const event = new CustomEvent('firebaseConnectionChange', { 
    detail: { isConnected: false } 
  });
  window.dispatchEvent(event);
  console.log('Firebase bağlantı durumu: Bağlantı kesik');
});

// Koleksiyonlara referanslar - null kontrolü ile
const projectsRef = db ? db.collection('projects') : null;
const contactMessagesRef = db ? db.collection('contactMessages') : null;
const newsletterSubscribersRef = db ? db.collection('newsletterSubscribers') : null;
const aboutRef = db ? db.collection('about').doc('content') : null;

// Veritabanı işlemleri için yardımcı fonksiyonlar
const dbHelper = {
  // Projeleri getir
  getProjects: async (limit = 10) => {
    try {
      if (!projectsRef) throw new Error("Firestore bağlantısı kurulamadı");
      
      const snapshot = await projectsRef.orderBy('date', 'desc').limit(limit).get();
      return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
    } catch (error) {
      console.error("Projeler getirilirken hata oluştu:", error);
      return [];
    }
  },
  
  // Proje ekle
  addProject: async (projectData, imageFile) => {
    try {
      if (!projectsRef) throw new Error("Firestore bağlantısı kurulamadı");
      
      let imageUrl = '';
      
      // Eğer resim varsa işle
      if (imageFile) {
        try {
          // CORS sorunu nedeniyle Storage yerine doğrudan base64 ile görsel işleme
          console.log("Görsel base64 formatına dönüştürülüyor...");
          
          // Dosya boyutu kontrol (2MB'dan büyük dosyaları uyar)
          if (imageFile.size > 2 * 1024 * 1024) {
            console.warn("Görsel dosyası büyük! 2MB'den küçük görseller tercih edilir.");
          }
          
          // FileReader ile dosyayı base64'e çevir
          const reader = new FileReader();
          const base64Promise = new Promise((resolve, reject) => {
            reader.onload = (e) => resolve(e.target.result);
            reader.onerror = (e) => reject(new Error("Görsel okunamadı: " + e.target.error));
            reader.readAsDataURL(imageFile);
          });
          
          imageUrl = await base64Promise;
          console.log("Görsel base64 olarak kodlandı ve kullanıma hazır");
        } catch (error) {
          console.error("Görsel işlenirken hata oluştu:", error);
          throw new Error("Görsel işlenirken bir hata oluştu: " + error.message);
        }
      }
      
      // Projeyi veritabanına ekle
      const projectRef = await projectsRef.add({
        ...projectData,
        imageUrl,
        date: new Date().toISOString(),
        createdAt: firebase.firestore.FieldValue.serverTimestamp()
      });
      
      return {
        success: true,
        id: projectRef.id
      };
    } catch (error) {
      console.error("Proje eklenirken hata oluştu:", error);
      return {
        success: false,
        error: error.message || "Bilinmeyen bir hata oluştu"
      };
    }
  },
  
  // Proje güncelle
  updateProject: async (projectId, projectData, imageFile) => {
    try {
      if (!projectsRef) throw new Error("Firestore bağlantısı kurulamadı");
      
      const updateData = { ...projectData };
      
      // Eğer yeni resim varsa işle
      if (imageFile) {
        try {
          // CORS sorunu nedeniyle Storage yerine doğrudan base64 ile görsel işleme
          console.log("Görsel base64 formatına dönüştürülüyor...");
          
          // Dosya boyutu kontrol (2MB'dan büyük dosyaları uyar)
          if (imageFile.size > 2 * 1024 * 1024) {
            console.warn("Görsel dosyası büyük! 2MB'den küçük görseller tercih edilir.");
          }
          
          // FileReader ile dosyayı base64'e çevir
          const reader = new FileReader();
          const base64Promise = new Promise((resolve, reject) => {
            reader.onload = (e) => resolve(e.target.result);
            reader.onerror = (e) => reject(new Error("Görsel okunamadı: " + e.target.error));
            reader.readAsDataURL(imageFile);
          });
          
          updateData.imageUrl = await base64Promise;
          console.log("Görsel base64 olarak kodlandı ve kullanıma hazır");
        } catch (error) {
          console.error("Görsel işlenirken hata oluştu:", error);
          throw new Error("Görsel işlenirken bir hata oluştu: " + error.message);
        }
      }
      
      // Projeyi güncelle
      await projectsRef.doc(projectId).update({
        ...updateData,
        updatedAt: firebase.firestore.FieldValue.serverTimestamp()
      });
      
      return {
        success: true
      };
    } catch (error) {
      console.error("Proje güncellenirken hata oluştu:", error);
      return {
        success: false,
        error: error.message || "Bilinmeyen bir hata oluştu"
      };
    }
  },
  
  // Proje sil
  deleteProject: async (projectId) => {
    try {
      if (!projectsRef) throw new Error("Firestore bağlantısı kurulamadı");
      
      await projectsRef.doc(projectId).delete();
      return {
        success: true
      };
    } catch (error) {
      console.error("Proje silinirken hata oluştu:", error);
      return {
        success: false,
        error: error.message
      };
    }
  },
  
  // İletişim mesajı ekle
  addContactMessage: async (messageData) => {
    try {
      if (!contactMessagesRef) throw new Error("Firestore bağlantısı kurulamadı");
      
      await contactMessagesRef.add({
        ...messageData,
        read: false,
        createdAt: firebase.firestore.FieldValue.serverTimestamp()
      });
      
      return {
        success: true
      };
    } catch (error) {
      console.error("İletişim mesajı eklenirken hata oluştu:", error);
      return {
        success: false,
        error: error.message
      };
    }
  },
  
  // Bültene abone ol
  subscribeToNewsletter: async (email) => {
    try {
      if (!newsletterSubscribersRef) throw new Error("Firestore bağlantısı kurulamadı");
      
      // E-posta adresi daha önce eklenmiş mi kontrol et
      const snapshot = await newsletterSubscribersRef.where('email', '==', email).get();
      
      if (!snapshot.empty) {
        return {
          success: false,
          error: 'Bu e-posta adresi zaten kayıtlı.'
        };
      }
      
      await newsletterSubscribersRef.add({
        email,
        subscribedAt: firebase.firestore.FieldValue.serverTimestamp()
      });
      
      return {
        success: true
      };
    } catch (error) {
      console.error("Bültene abone olunurken hata oluştu:", error);
      return {
        success: false,
        error: error.message
      };
    }
  },
  
  // Hakkımızda verileri getir
  getAboutData: async () => {
    try {
      if (!db) throw new Error("Firestore bağlantısı kurulamadı");
      
      const doc = await aboutRef.get();
      
      if (doc.exists) {
        return doc.data();
      } else {
        console.log("Hakkımızda verisi bulunamadı, boş bir obje döndürülüyor");
        return {};
      }
    } catch (error) {
      console.error("Hakkımızda verileri getirilirken hata oluştu:", error);
      throw error;
    }
  },
  
  // Hakkımızda verilerini kaydet
  saveAboutData: async (aboutData, imageFile) => {
    try {
      if (!db) throw new Error("Firestore bağlantısı kurulamadı");
      
      const updateData = { ...aboutData };
      
      // Mevcut verileri getir (mevcut görsel URL için)
      if (!imageFile) {
        const existingDoc = await aboutRef.get();
        if (existingDoc.exists && existingDoc.data().imageUrl) {
          updateData.imageUrl = existingDoc.data().imageUrl;
        }
      } else {
        try {
          // Görsel işleme - Base64'e çevir
          console.log("Hakkımızda görseli base64 formatına dönüştürülüyor...");
          
          // Dosya boyutu kontrol (5MB'dan büyük dosyaları uyar)
          if (imageFile.size > 5 * 1024 * 1024) {
            console.warn("Görsel dosyası büyük! 5MB'den küçük görseller tercih edilir.");
          }
          
          // FileReader ile dosyayı base64'e çevir
          const reader = new FileReader();
          const base64Promise = new Promise((resolve, reject) => {
            reader.onload = (e) => resolve(e.target.result);
            reader.onerror = (e) => reject(new Error("Görsel okunamadı: " + e.target.error));
            reader.readAsDataURL(imageFile);
          });
          
          updateData.imageUrl = await base64Promise;
          console.log("Görsel base64 olarak kodlandı ve kullanıma hazır");
        } catch (error) {
          console.error("Görsel işlenirken hata oluştu:", error);
          throw new Error("Görsel işlenirken bir hata oluştu: " + error.message);
        }
      }
      
      // Veritabanına kaydet
      await aboutRef.set(updateData, { merge: true });
      
      return {
        success: true,
        imageUrl: updateData.imageUrl
      };
    } catch (error) {
      console.error("Hakkımızda verileri kaydedilirken hata oluştu:", error);
      return {
        success: false,
        error: error.message || "Bilinmeyen bir hata oluştu"
      };
    }
  }
};

// Hakkımızda verileri için fonksiyonlar
function getAboutData() {
    return new Promise((resolve, reject) => {
        if (!db) {
            reject(new Error("Veritabanı bağlantısı kurulamadı."));
            return;
        }
        
        db.collection('about').doc('content')
            .get()
            .then(doc => {
                if (doc.exists) {
                    resolve(doc.data());
                } else {
                    // Eğer veri yoksa boş bir about nesnesi döndür
                    resolve({
                        title: "Hakkımızda",
                        subtitle: "Birlik Elektrik olarak hizmetinizdeyiz",
                        content1: "",
                        content2: "",
                        features: [],
                        statistics: {
                            experience: 0,
                            projects: 0,
                            experts: 0,
                            satisfaction: 0
                        }
                    });
                }
            })
            .catch(error => {
                console.error("Hakkımızda verileri alınırken hata:", error);
                reject(error);
            });
    });
}

function saveAboutData(aboutData) {
    return new Promise((resolve, reject) => {
        if (!db) {
            reject(new Error("Veritabanı bağlantısı kurulamadı."));
            return;
        }
        
        // Tarih bilgisi ekle
        aboutData.updatedAt = firebase.firestore.FieldValue.serverTimestamp();
        
        db.collection('about').doc('content')
            .set(aboutData, { merge: true })
            .then(() => {
                resolve(true);
            })
            .catch(error => {
                console.error("Hakkımızda verileri kaydedilirken hata:", error);
                reject(error);
            });
    });
}

// İndeks sayfasında Hakkımızda verileri için yardımcı fonksiyon
function displayAboutData(aboutData) {
    // İlgili HTML elementlerini bul ve verileri yerleştir
    if (document.getElementById('aboutTitle')) {
        document.getElementById('aboutTitle').textContent = aboutData.title || 'Hakkımızda';
    }
    
    if (document.getElementById('aboutSubtitle')) {
        document.getElementById('aboutSubtitle').textContent = aboutData.subtitle || 'Birlik Elektrik olarak hizmetinizdeyiz';
    }
    
    if (document.getElementById('aboutContent1')) {
        document.getElementById('aboutContent1').textContent = aboutData.content1 || '';
    }
    
    if (document.getElementById('aboutContent2')) {
        document.getElementById('aboutContent2').textContent = aboutData.content2 || '';
    }
    
    // Özellikler listesini doldur
    const featuresElement = document.getElementById('aboutFeaturesList');
    if (featuresElement && aboutData.features && aboutData.features.length > 0) {
        featuresElement.innerHTML = '';
        aboutData.features.forEach(feature => {
            const li = document.createElement('li');
            li.innerHTML = `<i class="fas fa-check"></i> ${feature}`;
            featuresElement.appendChild(li);
        });
    }
    
    // İstatistikleri doldur
    if (aboutData.statistics) {
        const stats = aboutData.statistics;
        
        if (document.getElementById('aboutExperienceCount')) {
            document.getElementById('aboutExperienceCount').textContent = stats.experience || '0';
        }
        
        if (document.getElementById('aboutProjectsCount')) {
            document.getElementById('aboutProjectsCount').textContent = stats.projects || '0';
        }
        
        if (document.getElementById('aboutExpertsCount')) {
            document.getElementById('aboutExpertsCount').textContent = stats.experts || '0';
        }
        
        if (document.getElementById('aboutSatisfactionCount')) {
            document.getElementById('aboutSatisfactionCount').textContent = stats.satisfaction || '0';
        }
    }
    
    // Görsel varsa güncelle
    if (aboutData.imageUrl && document.getElementById('aboutImage')) {
        document.getElementById('aboutImage').src = aboutData.imageUrl;
    }
}
