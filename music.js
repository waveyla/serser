let backgroundMusic;
let isMusicPlaying = false;

document.addEventListener('DOMContentLoaded', () => {
    backgroundMusic = document.getElementById('backgroundMusic');

    if (backgroundMusic) {
        backgroundMusic.volume = 0.4; // Biraz daha yüksek ses

        // Kullanıcı etkileşimi sonrası müziği başlat
        document.addEventListener('click', startMusicOnInteraction, { once: true });
        document.addEventListener('keydown', startMusicOnInteraction, { once: true });
    }
});

function startMusicOnInteraction() {
    if (backgroundMusic && !isMusicPlaying) {
        backgroundMusic.play().then(() => {
            isMusicPlaying = true;
            console.log('Cem Adrian - Ben Seni Çok Sevdim başlatıldı ❤️');
        }).catch(error => {
            console.log('Müzik otomatik başlatılamadı:', error);
        });
    }
}