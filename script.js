function updateCountdown() {
    const currentTime = new Date();
    const newYear = new Date('January 1, 2025 00:00:00').getTime();
    const now = currentTime.getTime();
    const distance = newYear - now;

    // Tính toán thời gian
    const days = Math.floor(distance / (1000 * 60 * 60 * 24));
    const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((distance % (1000 * 60)) / 1000);

    // Hiển thị countdown
    if (distance > 0) {
        // Cập nhật progress bar
        const totalSeconds = Math.floor(distance / 1000);
        const totalSecondsInYear = 365 * 24 * 60 * 60;
        const progress = 100 - ((totalSeconds / totalSecondsInYear) * 100);
        
        document.getElementById('progressBar').style.width = progress + '%';
        document.getElementById('progressText').textContent = Math.floor(progress) + '%';

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
        // Khi đã qua năm 2025
        clearInterval(countdownInterval);
        
        // Set progress bar to 100%
        document.getElementById('progressBar').style.width = '100%';
        document.getElementById('progressText').textContent = '100%';
        
        // Hiển thị message và hiệu ứng
        document.getElementById('newYearMessage').classList.remove('hidden');
        startFireworks();
        
        // Phát nhạc
        const audio = document.getElementById('lunarMusic');
        if (audio) {
            audio.play().catch(e => console.log('Audio play failed:', e));
        }

        // Format ngày tháng năm 2025
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
        
        // Hiển thị ngày tháng năm 2025
        document.getElementById('currentTime').innerHTML = `
            <div class="text-xl font-bold text-yellow-300">
                ${dateFormatter.format(new Date('January 1, 2025'))}
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

const fireworks = [];
let isFireworksActive = false;

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
