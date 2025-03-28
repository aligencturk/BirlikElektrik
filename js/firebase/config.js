// Firebase Yapılandırma Dosyası
const firebaseConfig = {
  apiKey: "AIzaSyDjo8BPQoNqnWgsBy31bC_cim9jCfSsFNI",
  authDomain: "birlikelektrik-90f62.firebaseapp.com",
  projectId: "birlikelektrik-90f62",
  storageBucket: "birlikelektrik-90f62.appspot.com",
  messagingSenderId: "765808232163",
  appId: "1:765808232163:web:d7c92e98e7974c9f9ae7d6"
};

// Firebase'i başlat
let app = null;
let db = null;
let auth = null;
let storage = null;

try {
    console.log('Firebase başlatılıyor...');
    
    // Firebase App başlatma
    if (firebase.apps.length === 0) {
        app = firebase.initializeApp(firebaseConfig);
        console.log('Firebase App başlatıldı');
    } else {
        app = firebase.apps[0];
        console.log('Mevcut Firebase App kullanılıyor');
    }

    // Firestore başlatma
    if (firebase.firestore) {
        db = firebase.firestore();
        db.settings({
            cacheSizeBytes: firebase.firestore.CACHE_SIZE_UNLIMITED,
            ignoreUndefinedProperties: true,
            merge: true
        });
        console.log('Firestore başlatıldı');
        
        // Offline persistence etkinleştirme
        db.enablePersistence({ synchronizeTabs: true })
            .catch((err) => {
                if (err.code === 'failed-precondition') {
                    console.warn('Firestore persistence çoklu sekme açık olduğu için etkinleştirilemedi');
                } else if (err.code === 'unimplemented') {
                    console.warn('Firestore persistence bu tarayıcıda desteklenmiyor');
                }
            });
    }

    // Storage başlatma
    if (firebase.storage) {
        storage = firebase.storage();
        console.log('Firebase Storage başlatıldı');
    }

    // Auth başlatma
    if (firebase.auth) {
        auth = firebase.auth();
        console.log('Firebase Auth başlatıldı');
    }

    // Global değişkenleri ata
    window.firebaseApp = app;
    window.firebaseDb = db;
    window.firebaseStorage = storage;
    window.firebaseAuth = auth;

    console.log('Firebase başarıyla başlatıldı:', {
        app: window.firebaseApp ? 'Hazır' : 'Yok',
        db: window.firebaseDb ? 'Hazır' : 'Yok',
        storage: window.firebaseStorage ? 'Hazır' : 'Yok',
        auth: window.firebaseAuth ? 'Hazır' : 'Yok'
    });

} catch (error) {
    console.error('Firebase başlatılırken bir hata oluştu:', error);
}

// Koleksiyonlara referanslar
const servicesRef = db ? db.collection('services') : null;
console.log('Services koleksiyonu referansı:', servicesRef);
const projectsRef = db ? db.collection('projects') : null;
const contactMessagesRef = db ? db.collection('contactMessages') : null;
const newsletterSubscribersRef = db ? db.collection('newsletterSubscribers') : null;
const aboutRef = db ? db.collection('about').doc('content') : null;
const teamRef = db ? db.collection('team') : null;
const galleryRef = db ? db.collection('gallery') : null;
const usersRef = db ? db.collection('users') : null;
const settingsRef = db ? db.collection('settings').doc('site') : null;

// Bağlantı durumunu takip et
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

// Veritabanı işlemleri için yardımcı fonksiyonlar
const dbHelper = {
    // Hizmetleri getir
    getServices: async () => {
        try {
            if (!servicesRef) {
                console.error('Services koleksiyonu referansı bulunamadı');
                throw new Error('Firestore bağlantısı kurulamadı');
            }
            
            console.log('Hizmetler getiriliyor...');
            const snapshot = await servicesRef.orderBy('order', 'asc').get();
            console.log('Firestore snapshot:', snapshot);
            
            const services = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));
            
            console.log('Getirilen hizmetler:', services);
            return services;
        } catch (error) {
            console.error('Hizmetler getirilirken hata oluştu:', error);
            return [];
        }
    },

    // Hizmet ekle
    addService: async (serviceData, imageFile) => {
        try {
            if (!servicesRef) throw new Error('Firestore bağlantısı kurulamadı');
            if (!storage) throw new Error('Storage bağlantısı kurulamadı');
            
            let imageUrl = '';
            
            if (imageFile) {
                const storageRef = storage.ref();
                const fileRef = storageRef.child(`services/${Date.now()}_${imageFile.name}`);
                await fileRef.put(imageFile);
                imageUrl = await fileRef.getDownloadURL();
            }
            
            const serviceRef = await servicesRef.add({
                ...serviceData,
                imageUrl,
                createdAt: firebase.firestore.FieldValue.serverTimestamp()
            });
            
            return {
                success: true,
                id: serviceRef.id
            };
        } catch (error) {
            console.error('Hizmet eklenirken hata oluştu:', error);
            return {
                success: false,
                error: error.message
            };
        }
    },

    // Hizmet güncelle
    updateService: async (serviceId, serviceData, imageFile) => {
        try {
            if (!servicesRef) throw new Error('Firestore bağlantısı kurulamadı');
            if (!storage) throw new Error('Storage bağlantısı kurulamadı');
            
            const updateData = { ...serviceData };
            
            if (imageFile) {
                const storageRef = storage.ref();
                const fileRef = storageRef.child(`services/${Date.now()}_${imageFile.name}`);
                await fileRef.put(imageFile);
                updateData.imageUrl = await fileRef.getDownloadURL();
            }
            
            await servicesRef.doc(serviceId).update({
                ...updateData,
                updatedAt: firebase.firestore.FieldValue.serverTimestamp()
            });
            
            return {
                success: true
            };
        } catch (error) {
            console.error('Hizmet güncellenirken hata oluştu:', error);
            return {
                success: false,
                error: error.message
            };
        }
    },

    // Hizmet sil
    deleteService: async (serviceId) => {
        try {
            if (!servicesRef) throw new Error('Firestore bağlantısı kurulamadı');
            
            await servicesRef.doc(serviceId).delete();
            
            return {
                success: true
            };
        } catch (error) {
            console.error('Hizmet silinirken hata oluştu:', error);
            return {
                success: false,
                error: error.message
            };
        }
    },

    // Diğer veritabanı işlemleri
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

    addProject: async (projectData, imageFile) => {
        try {
            if (!projectsRef) throw new Error("Firestore bağlantısı kurulamadı");
            
            let imageUrl = '';
            
            if (imageFile) {
                const storageRef = storage.ref();
                const fileRef = storageRef.child(`projects/${Date.now()}_${imageFile.name}`);
                await fileRef.put(imageFile);
                imageUrl = await fileRef.getDownloadURL();
            }
            
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
                error: error.message
            };
        }
    }
};

// Global olarak dbHelper'ı dışa aktar
window.dbHelper = dbHelper;
