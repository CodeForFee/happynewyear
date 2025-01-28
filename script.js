let isFireworksActive = false;
let isMusicPlaying = false;
const fireworks = [];

function loadSettings() {
    const settings = JSON.parse(localStorage.getItem('newYearSettings') || '{}');
    
    // Cập nhật background
    if (settings.backgroundUrl) {
        document.querySelector('.background-image').style.backgroundImage = `url('${settings.backgroundUrl}')`;
    }
    
    // Cập nhật music source
    if (settings.musicUrl) {
        const audio = document.getElementById('lunarMusic');
        audio.src = settings.musicUrl;
    }
}

function updateCountdown() {
    // Lấy target date từ settings
    const settings = JSON.parse(localStorage.getItem('newYearSettings') || '{}');
    const targetDate = settings.targetDateTime 
        ? new Date(settings.targetDateTime) 
        : new Date('2025-29-01T00:00:00');
    
    const currentTime = new Date();
    const startOfYear = new Date(currentTime.getFullYear(), 0, 1);
    const totalDuration = targetDate.getTime() - startOfYear.getTime();
    const elapsed = currentTime.getTime() - startOfYear.getTime();
    const progress = (elapsed / totalDuration) * 100;

    const now = currentTime.getTime();
    const distance = targetDate.getTime() - now;

    // Tính toán thời gian
    const days = Math.floor(distance / (1000 * 60 * 60 * 24));
    const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((distance % (1000 * 60)) / 1000);

    // Cập nhật tiêu đề trang
    document.getElementById('newYearMessage').textContent = `Happy New Year ${targetDate.getFullYear()}`;

    // Hiển thị countdown
    if (distance > 0) {
        // Cập nhật progress bar
        document.getElementById('progressBar').style.width = `${Math.min(progress, 100)}%`;
        document.getElementById('progressText').textContent = `${Math.min(Math.floor(progress), 100)}%`;

        // Hiệu ứng scale khi đạt mốc phần trăm chẵn
        if (Math.floor(progress) % 10 === 0 && Math.floor(progress) > 0) {
            document.getElementById('progressText').classList.add('scale-125');
            setTimeout(() => {
                document.getElementById('progressText').classList.remove('scale-125');
            }, 200);
        }

        document.getElementById('days').innerHTML = `${days}<br><span class="text-sm">Days</span>`;
        document.getElementById('hours').innerHTML = `${hours}<br><span class="text-sm">Hours</span>`;
        document.getElementById('minutes').innerHTML = `${minutes}<br><span class="text-sm">Minutes</span>`;
        document.getElementById('seconds').innerHTML = `${seconds}<br><span class="text-sm">Seconds</span>`;
        
        // Hiển thị thời gian hiện tại
        document.getElementById('currentTime').textContent = currentTime.toLocaleTimeString();
    } else {
        // Khi đã qua thời gian đích
        clearInterval(countdownInterval);
        
        // Set progress bar to 100%
        document.getElementById('progressBar').style.width = '100%';
        document.getElementById('progressText').textContent = '100%';
        
        // Hiển thị message và hiệu ứng
        document.getElementById('newYearMessage').classList.remove('hidden');
        
        // Chỉ bật pháo hoa, không tự động phát nhạc
        if (!isFireworksActive) {
            startFireworks();
        }

        // Format ngày tháng năm target
        const dateFormatter = new Intl.DateTimeFormat('vi-VN', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit'
        });

        // Cập nhật hiển thị
        document.getElementById('days').innerHTML = '0<br><span class="text-sm">Days</span>';
        document.getElementById('hours').innerHTML = '0<br><span class="text-sm">Hours</span>';
        document.getElementById('minutes').innerHTML = '0<br><span class="text-sm">Minutes</span>';
        document.getElementById('seconds').innerHTML = '0<br><span class="text-sm">Seconds</span>';
        
        // Hiển thị ngày giờ target
        document.getElementById('currentTime').innerHTML = `
            <div class="text-xl font-bold text-yellow-300">
                ${dateFormatter.format(targetDate)}
            </div>
        `;
    }
}

// Hiển thị progress bar ngay khi tải trang
document.getElementById('progressContainer').classList.remove('hidden');

// Cập nhật mỗi giây
const countdownInterval = setInterval(updateCountdown, 1000);

// Chạy lần đầu để tránh delay
updateCountdown();

// Code xử lý pháo hoa
const canvas = document.getElementById('fireworksCanvas');
const ctx = canvas.getContext('2d');

function resizeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
}
window.addEventListener('resize', resizeCanvas);
resizeCanvas();

class Firework {
    constructor() {
        this.reset();
    }

    reset() {
        this.x = Math.random() * canvas.width;
        this.y = canvas.height;
        this.targetY = Math.random() * (canvas.height * 0.5);
        this.speed = 3 + Math.random() * 3;
        this.particles = [];
        this.exploded = false;
        this.hue = Math.random() * 360;
    }

    update() {
        if (!this.exploded) {
            this.y -= this.speed;
            if (this.y <= this.targetY) {
                this.explode();
            }
        }

        for (let i = this.particles.length - 1; i >= 0; i--) {
            this.particles[i].update();
            if (this.particles[i].alpha <= 0) {
                this.particles.splice(i, 1);
            }
        }

        if (this.exploded && this.particles.length === 0) {
            this.reset();
        }
    }

    explode() {
        this.exploded = true;
        for (let i = 0; i < 100; i++) {
            const angle = (Math.PI * 2 / 100) * i;
            const velocity = 2 + Math.random() * 2;
            this.particles.push(new Particle(
                this.x,
                this.y,
                Math.cos(angle) * velocity,
                Math.sin(angle) * velocity,
                this.hue
            ));
        }
    }

    draw() {
        if (!this.exploded) {
            ctx.beginPath();
            ctx.arc(this.x, this.y, 2, 0, Math.PI * 2);
            ctx.fillStyle = `hsl(${this.hue}, 100%, 50%)`;
            ctx.fill();
        }
        this.particles.forEach(particle => particle.draw());
    }
}

class Particle {
    constructor(x, y, vx, vy, hue) {
        this.x = x;
        this.y = y;
        this.vx = vx;
        this.vy = vy;
        this.hue = hue;
        this.alpha = 1;
    }

    update() {
        this.x += this.vx;
        this.y += this.vy;
        this.vy += 0.05;
        this.alpha -= 0.01;
    }

    draw() {
        ctx.beginPath();
        ctx.arc(this.x, this.y, 1, 0, Math.PI * 2);
        ctx.fillStyle = `hsla(${this.hue}, 100%, 50%, ${this.alpha})`;
        ctx.fill();
    }
}

function startFireworks() {
    isFireworksActive = true;
    if (fireworks.length === 0) {
        for (let i = 0; i < 5; i++) {
            fireworks.push(new Firework());
        }
    }
    animate();
}

function stopFireworks() {
    isFireworksActive = false;
    fireworks.length = 0;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
}

function animate() {
    if (!isFireworksActive) return;

    ctx.fillStyle = 'rgba(0, 0, 0, 0.1)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    fireworks.forEach(firework => {
        firework.update();
        firework.draw();
    });

    requestAnimationFrame(animate);
}

// Thêm function để xử lý lời chúc
function getRandomGreeting(name, birthYear) {
    const greetings = JSON.parse(localStorage.getItem('greetings') || '[]');
    console.log('Available greetings:', greetings); // Để debug
    
    if (greetings.length === 0) {
        return `Chúc mừng năm mới ${name}! Chúc bạn một năm mới tràn đầy hạnh phúc và thành công.`;
    }
    
    const randomIndex = Math.floor(Math.random() * greetings.length);
    const template = greetings[randomIndex];
    const age = 2025 - parseInt(birthYear);
    
    const result = template
        .replace(/{name}/g, name)
        .replace(/{year}/g, birthYear)
        .replace(/{age}/g, age);
        
    console.log('Final greeting:', result); // Để debug
    return result;
}

// Gọi loadSettings khi trang được tải
document.addEventListener('DOMContentLoaded', loadSettings);

function toggleFireworks() {
    if (isFireworksActive) {
        stopFireworks();
    } else {
        startFireworks();
    }
}

function toggleMusic() {
    const audio = document.getElementById('lunarMusic');
    const musicIcon = document.getElementById('musicPath');
    
    if (isMusicPlaying) {
        audio.pause();
        musicIcon.setAttribute('d', 'M15.536 8.464a5 5 0 010 7.072M12 18.364a3 3 0 010-4.243M18.364 5.636a8 8 0 010 11.314');
    } else {
        // Thêm xử lý lỗi khi play
        audio.play().then(() => {
            musicIcon.setAttribute('d', 'M5.586 15H4a1 1 0 01-1-1V10a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z');
            isMusicPlaying = true;
        }).catch(e => {
            console.log('Audio play failed:', e);
            // Giữ nguyên icon khi không phát được nhạc
            isMusicPlaying = false;
        });
    }
    isMusicPlaying = !isMusicPlaying;
}

function autoPlayMusic() {
    const audio = document.getElementById('lunarMusic');
    audio.play().catch(e => console.log('Auto play failed:', e));
    isMusicPlaying = true;
    document.getElementById('musicPath').setAttribute('d', 'M5.586 15H4a1 1 0 01-1-1V10a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z');
}

// Giữ lại phần showGreeting trong index.html
function showGreeting() {
    const greetings = JSON.parse(localStorage.getItem('greetings') || '[]');
    let greeting;
    
    if (greetings.length === 0) {
        greeting = "Chúc mừng năm mới! Chúc bạn một năm mới tràn đầy hạnh phúc và thành công.";
    } else {
        const randomIndex = Math.floor(Math.random() * greetings.length);
        greeting = greetings[randomIndex];
    }
    
    const greetingDiv = document.getElementById('personalGreeting');
    greetingDiv.style.opacity = '0';
    greetingDiv.classList.remove('hidden');
    
    setTimeout(() => {
        greetingDiv.textContent = greeting;
        greetingDiv.style.opacity = '1';
    }, 200);
}
