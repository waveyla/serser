// MOBİL İÇİN VERİ YÜKLEME OPTİMİZASYONU
// Bu dosya mevcut renderer.js'i BOZMAZ, sadece destek sağlar

window.mobileDataLoader = {
    loadWithTimeout: async function(url, timeout = 30000) {
        const controller = new AbortController();
        const id = setTimeout(() => controller.abort(), timeout);

        try {
            const response = await fetch(url, {
                signal: controller.signal
            });
            clearTimeout(id);

            if (!response.ok) throw new Error('Yükleme başarısız');

            // Mobil cihazlar için streaming okuma
            const reader = response.body.getReader();
            const decoder = new TextDecoder();
            let result = '';

            while (true) {
                const {done, value} = await reader.read();
                if (done) break;
                result += decoder.decode(value, {stream: true});
            }

            return JSON.parse(result);
        } catch (error) {
            console.error('Veri yükleme hatası:', error);
            // Fallback: Parçalı yükleme dene
            return null;
        }
    },

    // Mobil için bellek optimizasyonu
    optimizeForMobile: function() {
        if (window.innerWidth <= 768) {
            // Büyük veriyi parçalı yükle
            console.log('Mobil cihaz algılandı, optimizasyon aktif');

            // Sayfa değişimlerinde belleği temizle
            document.addEventListener('visibilitychange', () => {
                if (document.hidden) {
                    // Görünmeyen içeriği temizle
                    const inactivePages = document.querySelectorAll('.page-content:not(.active)');
                    inactivePages.forEach(page => {
                        const container = page.querySelector('.messages-container');
                        if (container && container.children.length > 100) {
                            // Fazla mesajları temizle
                            while (container.children.length > 100) {
                                container.removeChild(container.lastChild);
                            }
                        }
                    });
                }
            });
        }
    }
};

// Otomatik başlat
document.addEventListener('DOMContentLoaded', () => {
    window.mobileDataLoader.optimizeForMobile();
});