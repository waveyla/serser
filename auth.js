// Şifre koruması sistemi - Seren & Serkan için
let isAuthenticated = false;

// Şifre: tanışma tarihiniz (DDMMYYYY formatında)
const correctPassword = '30092017'; // 30 Eylül 2017

function showPasswordScreen() {
    document.body.innerHTML = `
        <div style="
            position: fixed;
            top: 0; left: 0;
            width: 100%; height: 100%;
            background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%);
            display: flex;
            justify-content: center;
            align-items: center;
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            color: white;
            z-index: 10000;
        ">
            <div style="
                background: rgba(255, 255, 255, 0.1);
                padding: 40px;
                border-radius: 20px;
                backdrop-filter: blur(10px);
                border: 1px solid rgba(255, 255, 255, 0.2);
                text-align: center;
                max-width: 400px;
                width: 90%;
            ">
                <h1 style="
                    font-size: 2.5em;
                    margin-bottom: 20px;
                    background: linear-gradient(45deg, #ff6b6b, #ffd93d);
                    -webkit-background-clip: text;
                    -webkit-text-fill-color: transparent;
                    background-clip: text;
                ">💕 Bizim Hikayemiz 💕</h1>

                <p style="
                    font-size: 1.2em;
                    margin-bottom: 30px;
                    color: rgba(255, 255, 255, 0.8);
                ">Bu özel hikayemizi görüntülemek için şifreyi girin:</p>

                <input type="password" id="passwordInput" placeholder="Şifre" style="
                    width: 100%;
                    padding: 15px;
                    border: 1px solid rgba(255, 255, 255, 0.3);
                    border-radius: 10px;
                    background: rgba(255, 255, 255, 0.1);
                    color: white;
                    font-size: 1.1em;
                    text-align: center;
                    margin-bottom: 20px;
                    outline: none;
                " />

                <button onclick="checkPassword()" style="
                    width: 100%;
                    padding: 15px;
                    background: linear-gradient(45deg, #ff6b6b, #ffd93d);
                    border: none;
                    border-radius: 10px;
                    color: white;
                    font-size: 1.2em;
                    font-weight: bold;
                    cursor: pointer;
                    transition: all 0.3s ease;
                    margin-bottom: 15px;
                ">Giriş Yap</button>

                <div id="errorMessage" style="
                    color: #ff6b6b;
                    font-size: 0.9em;
                    display: none;
                ">Yanlış şifre! Tanışma tarihinizi deneyin... 💭</div>

                <p style="
                    font-size: 0.8em;
                    color: rgba(255, 255, 255, 0.5);
                    margin-top: 20px;
                ">💡 İpucu: İlk tanıştığınız tarih (GGAAYYYY)</p>
            </div>
        </div>
    `;

    // Enter tuşu ile giriş
    document.getElementById('passwordInput').addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            checkPassword();
        }
    });

    // Input focus
    document.getElementById('passwordInput').focus();
}

function checkPassword() {
    const inputPassword = document.getElementById('passwordInput').value;
    const errorDiv = document.getElementById('errorMessage');

    if (inputPassword === correctPassword) {
        isAuthenticated = true;
        // Şifreyi localStorage'a kaydet (sayfa yenilendiğinde tekrar sormasın)
        localStorage.setItem('serser_auth', 'true');
        loadMainApp();
    } else {
        errorDiv.style.display = 'block';
        document.getElementById('passwordInput').value = '';
        document.getElementById('passwordInput').focus();

        // 3 saniye sonra hata mesajını gizle
        setTimeout(() => {
            errorDiv.style.display = 'none';
        }, 3000);
    }
}

function loadMainApp() {
    // Ana uygulamayı yükle
    window.location.reload();
}

function checkAuth() {
    // localStorage'da auth var mı kontrol et
    const stored = localStorage.getItem('serser_auth');
    if (stored === 'true') {
        isAuthenticated = true;
        return true;
    }

    showPasswordScreen();
    return false;
}

// Sayfa yüklendiğinde auth kontrolü
document.addEventListener('DOMContentLoaded', function() {
    if (!checkAuth()) {
        return; // Şifre ekranı gösterildi
    }

    // Auth başarılı, normal yükleme devam etsin
    console.log('✅ Kimlik doğrulandı, uygulama yükleniyor...');
});

// Çıkış fonksiyonu (isteğe bağlı)
function logout() {
    localStorage.removeItem('serser_auth');
    isAuthenticated = false;
    location.reload();
}

// Global değişken
window.logout = logout;