// Mesajlar - Birlik Elektrik Admin Paneli
document.addEventListener('DOMContentLoaded', function() {
    // Firebase oturumunun açık olduğunu kontrol et
    firebase.auth().onAuthStateChanged(function(user) {
        if (user) {
            initializeMessagesPage();
        }
    });
});

// Mesajlar sayfasını başlat
function initializeMessagesPage() {
    const db = firebase.firestore();
    
    // URL'den mesaj ID'sini kontrol et (varsa)
    const urlParams = new URLSearchParams(window.location.search);
    const messageId = urlParams.get('id');
    
    // İstatistikleri yükle
    loadMessageStats(db);
    
    // Filtre durumunu kontrol et
    setupFilters();
    
    // Mesaj listesini yükle
    loadMessages(db);
    
    // Olay dinleyicilerini ekle
    setupEventListeners(db);
    
    // URL'de mesaj ID'si varsa o mesajı aç
    if (messageId) {
        setTimeout(() => {
            viewMessage(db, messageId);
        }, 1000);
    }
}

// Mesaj istatistiklerini yükle
function loadMessageStats(db) {
    // Toplam mesaj sayısı
    db.collection('messages').get()
        .then(snapshot => {
            document.getElementById('totalMessagesCount').textContent = snapshot.size;
        })
        .catch(error => {
            console.error('Mesaj sayısı alınamadı:', error);
            document.getElementById('totalMessagesCount').textContent = '0';
        });
    
    // Okunmamış mesajlar
    db.collection('messages').where('read', '==', false).get()
        .then(snapshot => {
            document.getElementById('unreadMessagesCount').textContent = snapshot.size;
        })
        .catch(error => {
            console.error('Okunmamış mesaj sayısı alınamadı:', error);
            document.getElementById('unreadMessagesCount').textContent = '0';
        });
    
    // Cevaplanmış mesajlar
    db.collection('messages').where('replied', '==', true).get()
        .then(snapshot => {
            document.getElementById('repliedMessagesCount').textContent = snapshot.size;
        })
        .catch(error => {
            console.error('Cevaplanmış mesaj sayısı alınamadı:', error);
            document.getElementById('repliedMessagesCount').textContent = '0';
        });
    
    // Bugünkü mesajlar
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    db.collection('messages')
        .where('createdAt', '>=', today)
        .get()
        .then(snapshot => {
            document.getElementById('todayMessagesCount').textContent = snapshot.size;
        })
        .catch(error => {
            console.error('Bugünkü mesaj sayısı alınamadı:', error);
            document.getElementById('todayMessagesCount').textContent = '0';
        });
}

// Filtreleri ayarla
function setupFilters() {
    // Durum filtreleri
    const filterAll = document.getElementById('filterAll');
    const filterUnread = document.getElementById('filterUnread');
    const filterRead = document.getElementById('filterRead');
    const filterReplied = document.getElementById('filterReplied');
    
    // Tek seferde yalnızca bir durum filtresi seçilebilir
    if (filterAll && filterUnread && filterRead && filterReplied) {
        filterAll.addEventListener('change', function() {
            if (this.checked) {
                filterUnread.checked = false;
                filterRead.checked = false;
                filterReplied.checked = false;
            } else if (!filterUnread.checked && !filterRead.checked && !filterReplied.checked) {
                this.checked = true;
            }
        });
        
        [filterUnread, filterRead, filterReplied].forEach(filter => {
            filter.addEventListener('change', function() {
                if (this.checked) {
                    filterAll.checked = false;
                } else if (!filterUnread.checked && !filterRead.checked && !filterReplied.checked) {
                    filterAll.checked = true;
                }
            });
        });
    }
}

// Mesaj listesini yükle
function loadMessages(db, filters = {}) {
    const messageList = document.querySelector('.admin-message-list');
    if (!messageList) return;
    
    // Yükleniyor göstergesi
    messageList.innerHTML = `
        <div class="admin-message-item fade-in">
            <div class="d-flex align-center justify-center w-100 p-4">
                <div class="spinner-border" role="status">
                    <span class="sr-only">Yükleniyor...</span>
                </div>
                <span class="ml-3">Mesajlar yükleniyor...</span>
            </div>
        </div>
    `;
    
    // Filtre ayarlarını al
    const statusFilter = getStatusFilter();
    const dateFilter = getDateFilter();
    const searchQuery = document.getElementById('searchMessages')?.value || '';
    
    // Mesaj sorgusu oluştur
    let query = db.collection('messages').orderBy('createdAt', 'desc');
    
    // Durum filtresi uygula
    if (statusFilter === 'unread') {
        query = query.where('read', '==', false);
    } else if (statusFilter === 'read') {
        query = query.where('read', '==', true).where('replied', '==', false);
    } else if (statusFilter === 'replied') {
        query = query.where('replied', '==', true);
    }
    
    // Tarih filtresi uygula
    if (dateFilter !== 'all') {
        const filterDate = getFilterDate(dateFilter);
        if (filterDate) {
            query = query.where('createdAt', '>=', filterDate);
        }
    }
    
    // Sorguyu çalıştır
    query.get()
        .then(snapshot => {
            if (snapshot.empty) {
                messageList.innerHTML = `
                    <div class="admin-message-item fade-in">
                        <div class="d-flex align-center justify-center w-100 p-4">
                            <i class="fas fa-inbox mr-2"></i>
                            <span>Mesaj bulunamadı.</span>
                        </div>
                    </div>
                `;
                updateMessageCount(0);
                return;
            }
            
            // Mesajları al
            let messages = [];
            snapshot.forEach(doc => {
                messages.push({
                    id: doc.id,
                    ...doc.data()
                });
            });
            
            // Arama filtresini uygula
            if (searchQuery) {
                const searchLower = searchQuery.toLowerCase();
                messages = messages.filter(message => 
                    message.name?.toLowerCase().includes(searchLower) || 
                    message.email?.toLowerCase().includes(searchLower) || 
                    message.subject?.toLowerCase().includes(searchLower) || 
                    message.message?.toLowerCase().includes(searchLower)
                );
            }
            
            // Sonuçları göster
            renderMessages(messages, messageList);
            updateMessageCount(messages.length);
        })
        .catch(error => {
            console.error('Mesajlar alınamadı:', error);
            messageList.innerHTML = `
                <div class="admin-message-item fade-in">
                    <div class="d-flex align-center justify-center w-100 p-4 text-danger">
                        <i class="fas fa-exclamation-circle mr-2"></i>
                        <span>Mesajlar yüklenirken bir hata oluştu.</span>
                    </div>
                </div>
            `;
            updateMessageCount(0);
        });
}

// Mesaj listesini render et
function renderMessages(messages, messageList) {
    messageList.innerHTML = '';
    
    messages.forEach((message, index) => {
        const messageItem = document.createElement('div');
        messageItem.className = `admin-message-item ${message.read ? (message.replied ? 'replied' : 'read') : 'unread'} fade-in`;
        messageItem.setAttribute('data-id', message.id);
        
        const statusIcon = message.replied ? 'reply' : message.read ? 'envelope-open' : 'envelope';
        const messageDate = message.createdAt ? timeAgo(message.createdAt) : 'Belirtilmemiş';
        
        messageItem.innerHTML = `
            <div class="admin-message-select">
                <input type="checkbox" class="message-checkbox" id="msgCheck${index}" data-id="${message.id}">
                <label for="msgCheck${index}"></label>
            </div>
            <div class="admin-message-status">
                <i class="fas fa-${statusIcon}"></i>
            </div>
            <div class="admin-message-content">
                <div class="admin-message-header">
                    <div class="admin-message-info">
                        <h3 class="admin-message-sender">${message.name || 'İsimsiz'}</h3>
                        <span class="admin-message-date">${messageDate}</span>
                    </div>
                    <div class="admin-message-actions">
                        <button class="admin-btn admin-btn-icon admin-btn-sm reply-message-btn" title="Cevapla" data-id="${message.id}">
                            <i class="fas fa-reply"></i>
                        </button>
                        <button class="admin-btn admin-btn-icon admin-btn-sm toggle-read-btn" title="${message.read ? 'Okunmadı İşaretle' : 'Okundu İşaretle'}" data-id="${message.id}" data-read="${message.read}">
                            <i class="fas fa-${message.read ? 'envelope' : 'envelope-open'}"></i>
                        </button>
                        <button class="admin-btn admin-btn-icon admin-btn-sm delete-message-btn" title="Sil" data-id="${message.id}">
                            <i class="fas fa-trash-alt"></i>
                        </button>
                    </div>
                </div>
                <div class="admin-message-subject">${message.subject || 'Konu Belirtilmemiş'}</div>
                <div class="admin-message-preview">${message.message ? message.message.substring(0, 120) + (message.message.length > 120 ? '...' : '') : 'İçerik yok'}</div>
            </div>
        `;
        
        messageList.appendChild(messageItem);
    });
    
    // Olay dinleyicilerini ekle
    addMessageItemEventListeners();
}

// Mesaj sayısını güncelle
function updateMessageCount(count) {
    const countElement = document.querySelector('.admin-pagination-info');
    if (countElement) {
        countElement.textContent = `Toplam ${count} mesaj gösteriliyor`;
    }
}

// Durum filtresini al
function getStatusFilter() {
    const filterUnread = document.getElementById('filterUnread');
    const filterRead = document.getElementById('filterRead');
    const filterReplied = document.getElementById('filterReplied');
    
    if (filterUnread && filterUnread.checked) return 'unread';
    if (filterRead && filterRead.checked) return 'read';
    if (filterReplied && filterReplied.checked) return 'replied';
    
    return 'all';
}

// Tarih filtresini al
function getDateFilter() {
    const dateRangeFilter = document.getElementById('dateRangeFilter');
    return dateRangeFilter ? dateRangeFilter.value : 'all';
}

// Tarih filtre değerini dönüştür
function getFilterDate(filterType) {
    const date = new Date();
    
    switch (filterType) {
        case 'today':
            date.setHours(0, 0, 0, 0);
            return date;
        case 'yesterday':
            date.setDate(date.getDate() - 1);
            date.setHours(0, 0, 0, 0);
            return date;
        case 'week':
            date.setDate(date.getDate() - 7);
            date.setHours(0, 0, 0, 0);
            return date;
        case 'month':
            date.setMonth(date.getMonth() - 1);
            date.setHours(0, 0, 0, 0);
            return date;
        default:
            return null;
    }
}

// Mesaj öğelerine olay dinleyicileri ekle
function addMessageItemEventListeners() {
    // Tıklanan mesajı görüntüle
    document.querySelectorAll('.admin-message-item').forEach(item => {
        item.addEventListener('click', function(e) {
            // Checkbox veya butonlara tıklanmışsa olay dinleme
            if (e.target.closest('.admin-message-select') || 
                e.target.closest('.admin-message-actions')) {
                return;
            }
            
            const messageId = this.getAttribute('data-id');
            const db = firebase.firestore();
            viewMessage(db, messageId);
        });
    });
    
    // Cevaplama butonları
    document.querySelectorAll('.reply-message-btn').forEach(button => {
        button.addEventListener('click', function(e) {
            e.stopPropagation();
            const messageId = this.getAttribute('data-id');
            const db = firebase.firestore();
            viewMessage(db, messageId, true);
        });
    });
    
    // Okundu/Okunmadı butonları
    document.querySelectorAll('.toggle-read-btn').forEach(button => {
        button.addEventListener('click', function(e) {
            e.stopPropagation();
            const messageId = this.getAttribute('data-id');
            const isRead = this.getAttribute('data-read') === 'true';
            toggleMessageRead(!isRead, messageId);
        });
    });
    
    // Silme butonları
    document.querySelectorAll('.delete-message-btn').forEach(button => {
        button.addEventListener('click', function(e) {
            e.stopPropagation();
            const messageId = this.getAttribute('data-id');
            confirmDeleteMessage(messageId);
        });
    });
    
    // Checkboxlar değiştiğinde butonları aktifleştir/devre dışı bırak
    const checkboxes = document.querySelectorAll('.message-checkbox');
    checkboxes.forEach(checkbox => {
        checkbox.addEventListener('change', function() {
            updateBulkActionButtons();
        });
    });
}

// Toplu işlem butonlarını güncelle
function updateBulkActionButtons() {
    const checkboxes = document.querySelectorAll('.message-checkbox:checked');
    const bulkDeleteBtn = document.getElementById('bulkDeleteBtn');
    const markReadBtn = document.getElementById('markReadBtn');
    
    if (bulkDeleteBtn) {
        bulkDeleteBtn.disabled = checkboxes.length === 0;
    }
    
    if (markReadBtn) {
        markReadBtn.disabled = checkboxes.length === 0;
    }
}

// Olay dinleyicilerini ayarla
function setupEventListeners(db) {
    // Filtreleri uygula butonu
    const applyFiltersBtn = document.getElementById('applyFiltersBtn');
    if (applyFiltersBtn) {
        applyFiltersBtn.addEventListener('click', function() {
            loadMessages(db);
        });
    }
    
    // Filtreleri sıfırla butonu
    const resetFiltersBtn = document.getElementById('resetFiltersBtn');
    if (resetFiltersBtn) {
        resetFiltersBtn.addEventListener('click', function() {
            // Durum filtrelerini sıfırla
            document.getElementById('filterAll').checked = true;
            document.getElementById('filterUnread').checked = false;
            document.getElementById('filterRead').checked = false;
            document.getElementById('filterReplied').checked = false;
            
            // Tarih filtresini sıfırla
            document.getElementById('dateRangeFilter').value = 'all';
            
            // Arama kutusunu temizle
            document.getElementById('searchMessages').value = '';
            
            // Mesajları yeniden yükle
            loadMessages(db);
        });
    }
    
    // Arama kutusu
    const searchInput = document.getElementById('searchMessages');
    if (searchInput) {
        searchInput.addEventListener('keyup', debounce(function() {
            loadMessages(db);
        }, 300));
    }
    
    // Mesajları yenile butonu
    const refreshBtn = document.getElementById('refreshMessages');
    if (refreshBtn) {
        refreshBtn.addEventListener('click', function() {
            loadMessages(db);
            loadMessageStats(db);
        });
    }
    
    // Toplu silme butonu
    const bulkDeleteBtn = document.getElementById('bulkDeleteBtn');
    if (bulkDeleteBtn) {
        bulkDeleteBtn.addEventListener('click', function() {
            bulkDeleteMessages();
        });
    }
    
    // Toplu okundu işaretle butonu
    const markReadBtn = document.getElementById('markReadBtn');
    if (markReadBtn) {
        markReadBtn.addEventListener('click', function() {
            bulkMarkMessagesAsRead();
        });
    }
    
    // Modal kapatma butonları
    document.querySelectorAll('#closeMessageDetailModal, #closeMessageDetailBtn').forEach(btn => {
        if (btn) {
            btn.addEventListener('click', function() {
                document.getElementById('messageDetailModal').style.display = 'none';
            });
        }
    });
    
    // Cevap gönderme butonu
    const sendReplyBtn = document.getElementById('sendReplyBtn');
    if (sendReplyBtn) {
        sendReplyBtn.addEventListener('click', function() {
            const messageId = this.getAttribute('data-id');
            replyToMessage(messageId);
        });
    }
    
    // Mesaj silme butonu (modal içinde)
    const deleteMessageBtn = document.getElementById('deleteMessageBtn');
    if (deleteMessageBtn) {
        deleteMessageBtn.addEventListener('click', function() {
            const messageId = this.getAttribute('data-id');
            document.getElementById('messageDetailModal').style.display = 'none';
            deleteMessage(messageId);
        });
    }
}

// Mesajı görüntüle
function viewMessage(db, messageId, focusReply = false) {
    db.collection('messages').doc(messageId).get()
        .then(doc => {
            if (doc.exists) {
                const message = doc.data();
                
                // Modal içeriğini doldur
                document.getElementById('detailMessageSubject').textContent = message.subject || 'Konu Belirtilmemiş';
                document.getElementById('detailMessageSender').textContent = message.name || 'İsimsiz';
                document.getElementById('detailMessageEmail').textContent = message.email || 'E-posta belirtilmemiş';
                document.getElementById('detailMessageContent').textContent = message.message || 'Mesaj içeriği yok';
                
                // Gönderici baş harfleri
                const senderInitials = document.getElementById('senderInitials');
                if (senderInitials) {
                    const initials = getInitials(message.name || 'İsimsiz');
                    senderInitials.textContent = initials;
                }
                
                // Tarih
                const messageDate = message.createdAt ? formatDateTime(message.createdAt) : 'Belirtilmemiş';
                document.getElementById('detailMessageDate').textContent = messageDate;
                
                // Butonlara mesaj ID'sini ekle
                document.getElementById('sendReplyBtn').setAttribute('data-id', messageId);
                document.getElementById('deleteMessageBtn').setAttribute('data-id', messageId);
                
                // Cevap alanını temizle
                document.getElementById('messageReply').value = '';
                
                // Modal'ı göster
                document.getElementById('messageDetailModal').style.display = 'flex';
                
                // Eğer mesaj okunmamışsa, okundu olarak işaretle
                if (!message.read) {
                    toggleMessageRead(true, messageId);
                }
                
                // Cevap alanına odaklan (istenirse)
                if (focusReply) {
                    document.getElementById('messageReply').focus();
                }
            } else {
                showAlert('Mesaj bulunamadı.', 'error');
            }
        })
        .catch(error => {
            console.error('Mesaj detayları alınamadı:', error);
            showAlert('Mesaj detayları yüklenirken bir hata oluştu.', 'error');
        });
}

// Mesajı okundu/okunmadı olarak işaretle
function toggleMessageRead(isRead, messageId) {
    const db = firebase.firestore();
    
    db.collection('messages').doc(messageId).update({
        read: isRead,
        updatedAt: firebase.firestore.FieldValue.serverTimestamp()
    })
    .then(() => {
        // Mesaj listesindeki elemanı güncelle
        const messageItem = document.querySelector(`.admin-message-item[data-id="${messageId}"]`);
        if (messageItem) {
            if (isRead) {
                messageItem.classList.remove('unread');
                messageItem.classList.add('read');
                messageItem.querySelector('.admin-message-status i').className = 'fas fa-envelope-open';
                messageItem.querySelector('.toggle-read-btn').title = 'Okunmadı İşaretle';
                messageItem.querySelector('.toggle-read-btn i').className = 'fas fa-envelope';
                messageItem.querySelector('.toggle-read-btn').setAttribute('data-read', 'true');
            } else {
                messageItem.classList.remove('read', 'replied');
                messageItem.classList.add('unread');
                messageItem.querySelector('.admin-message-status i').className = 'fas fa-envelope';
                messageItem.querySelector('.toggle-read-btn').title = 'Okundu İşaretle';
                messageItem.querySelector('.toggle-read-btn i').className = 'fas fa-envelope-open';
                messageItem.querySelector('.toggle-read-btn').setAttribute('data-read', 'false');
            }
        }
        
        // İstatistikleri güncelle
        loadMessageStats(db);
    })
    .catch(error => {
        console.error('Mesaj durumu güncellenemedi:', error);
        showAlert('Mesaj durumu güncellenirken bir hata oluştu.', 'error');
    });
}

// Mesaja cevap ver
function replyToMessage(messageId) {
    const db = firebase.firestore();
    const replyText = document.getElementById('messageReply').value.trim();
    
    if (!replyText) {
        showAlert('Lütfen bir cevap yazın.', 'warning');
        return;
    }
    
    // Yükleme göstergesi
    const replyBtn = document.getElementById('sendReplyBtn');
    const originalBtnText = replyBtn.innerHTML;
    replyBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Gönderiliyor...';
    replyBtn.disabled = true;
    
    db.collection('messages').doc(messageId).get()
        .then(doc => {
            if (!doc.exists) {
                throw new Error('Mesaj bulunamadı.');
            }
            
            const message = doc.data();
            
            // E-posta gönderme işlemi burada yapılacak (cloud functions veya harici e-posta API'si kullanılabilir)
            // Örnek olarak, e-posta gönderildi varsayıyoruz
            
            // Mesajı cevaplanmış olarak işaretle
            return db.collection('messages').doc(messageId).update({
                read: true,
                replied: true,
                replyText: replyText,
                repliedAt: firebase.firestore.FieldValue.serverTimestamp(),
                updatedAt: firebase.firestore.FieldValue.serverTimestamp()
            });
        })
        .then(() => {
            showAlert('Cevap başarıyla gönderildi.', 'success');
            
            // Modal'ı kapat
            document.getElementById('messageDetailModal').style.display = 'none';
            
            // Mesaj listesindeki elemanı güncelle
            const messageItem = document.querySelector(`.admin-message-item[data-id="${messageId}"]`);
            if (messageItem) {
                messageItem.classList.remove('unread', 'read');
                messageItem.classList.add('replied');
                messageItem.querySelector('.admin-message-status i').className = 'fas fa-reply';
            }
            
            // İstatistikleri güncelle
            loadMessageStats(db);
        })
        .catch(error => {
            console.error('Cevap gönderilemedi:', error);
            showAlert('Cevap gönderilirken bir hata oluştu: ' + error.message, 'error');
        })
        .finally(() => {
            // Buton durumunu sıfırla
            replyBtn.innerHTML = originalBtnText;
            replyBtn.disabled = false;
        });
}

// Mesaj silme onayı
function confirmDeleteMessage(messageId) {
    if (confirm('Bu mesajı silmek istediğinize emin misiniz? Bu işlem geri alınamaz.')) {
        deleteMessage(messageId);
    }
}

// Mesaj silme
function deleteMessage(messageId) {
    const db = firebase.firestore();
    
    db.collection('messages').doc(messageId).delete()
        .then(() => {
            showAlert('Mesaj başarıyla silindi.', 'success');
            
            // Mesajı listeden kaldır
            const messageItem = document.querySelector(`.admin-message-item[data-id="${messageId}"]`);
            if (messageItem) {
                messageItem.remove();
            }
            
            // İstatistikleri güncelle
            loadMessageStats(db);
            
            // Mesaj sayısını güncelle
            const messageItems = document.querySelectorAll('.admin-message-item');
            updateMessageCount(messageItems.length);
        })
        .catch(error => {
            console.error('Mesaj silinemedi:', error);
            showAlert('Mesaj silinirken bir hata oluştu.', 'error');
        });
}

// Toplu mesaj silme
function bulkDeleteMessages() {
    const selectedIds = getSelectedMessageIds();
    
    if (selectedIds.length === 0) {
        showAlert('Lütfen en az bir mesaj seçin.', 'warning');
        return;
    }
    
    if (confirm(`${selectedIds.length} mesajı silmek istediğinize emin misiniz? Bu işlem geri alınamaz.`)) {
        const db = firebase.firestore();
        const batch = db.batch();
        
        selectedIds.forEach(id => {
            const messageRef = db.collection('messages').doc(id);
            batch.delete(messageRef);
        });
        
        batch.commit()
            .then(() => {
                showAlert(`${selectedIds.length} mesaj başarıyla silindi.`, 'success');
                
                // Silinen mesajları listeden kaldır
                selectedIds.forEach(id => {
                    const messageItem = document.querySelector(`.admin-message-item[data-id="${id}"]`);
                    if (messageItem) {
                        messageItem.remove();
                    }
                });
                
                // İstatistikleri güncelle
                loadMessageStats(db);
                
                // Butonları devre dışı bırak
                updateBulkActionButtons();
                
                // Mesaj sayısını güncelle
                const messageItems = document.querySelectorAll('.admin-message-item');
                updateMessageCount(messageItems.length);
            })
            .catch(error => {
                console.error('Mesajlar toplu olarak silinemedi:', error);
                showAlert('Mesajlar silinirken bir hata oluştu.', 'error');
            });
    }
}

// Toplu okundu işaretle
function bulkMarkMessagesAsRead() {
    const selectedIds = getSelectedMessageIds();
    
    if (selectedIds.length === 0) {
        showAlert('Lütfen en az bir mesaj seçin.', 'warning');
        return;
    }
    
    const db = firebase.firestore();
    const batch = db.batch();
    
    selectedIds.forEach(id => {
        const messageRef = db.collection('messages').doc(id);
        batch.update(messageRef, {
            read: true,
            updatedAt: firebase.firestore.FieldValue.serverTimestamp()
        });
    });
    
    batch.commit()
        .then(() => {
            showAlert(`${selectedIds.length} mesaj okundu olarak işaretlendi.`, 'success');
            
            // Mesaj öğelerini güncelle
            selectedIds.forEach(id => {
                const messageItem = document.querySelector(`.admin-message-item[data-id="${id}"]`);
                if (messageItem && messageItem.classList.contains('unread')) {
                    messageItem.classList.remove('unread');
                    messageItem.classList.add('read');
                    messageItem.querySelector('.admin-message-status i').className = 'fas fa-envelope-open';
                    messageItem.querySelector('.toggle-read-btn').title = 'Okunmadı İşaretle';
                    messageItem.querySelector('.toggle-read-btn i').className = 'fas fa-envelope';
                    messageItem.querySelector('.toggle-read-btn').setAttribute('data-read', 'true');
                }
            });
            
            // Bütün checkboxları temizle
            document.querySelectorAll('.message-checkbox:checked').forEach(checkbox => {
                checkbox.checked = false;
            });
            
            // Butonları devre dışı bırak
            updateBulkActionButtons();
            
            // İstatistikleri güncelle
            loadMessageStats(db);
        })
        .catch(error => {
            console.error('Mesajlar toplu olarak güncellenemedi:', error);
            showAlert('Mesajlar güncellenirken bir hata oluştu.', 'error');
        });
}

// Seçili mesaj ID'lerini al
function getSelectedMessageIds() {
    const selectedIds = [];
    document.querySelectorAll('.message-checkbox:checked').forEach(checkbox => {
        selectedIds.push(checkbox.getAttribute('data-id'));
    });
    return selectedIds;
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