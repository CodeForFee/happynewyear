function updateCountdown() {
    const newYear = new Date('January 1, 2025 00:00:00').getTime();
    const now = new Date().getTime();
    const distance = newYear - now;

    const days = Math.floor(distance / (1000 * 60 * 60 * 24));
    const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((distance % (1000 * 60)) / 1000);

    document.getElementById('days').innerText = `${days} Days`;
    document.getElementById('hours').innerText = `${hours} Hours`;
    document.getElementById('minutes').innerText = `${minutes} Minutes`;
    document.getElementById('seconds').innerText = `${seconds} Seconds`;

    // Update current date and time
    const currentTime = new Date();
    const options = { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit', second: '2-digit' };
    const currentDateTimeString = currentTime.toLocaleString('en-US', options);
    document.getElementById('currentTime').innerText = `Current: ${currentDateTimeString}`;

    if (distance < 0) {
        triggerNewYear();
    }
}

function triggerNewYear() {
    // Chỉ hiển thị progress bar, chưa hiển thị message và pháo hoa
    document.getElementById('progressContainer').classList.remove('hidden');
    startProgressBar();
}

function startFireworks() {
    const canvas = document.getElementById('fireworksCanvas');
    canvas.classList.remove('hidden');
    const ctx = canvas.getContext("2d");

    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    window.addEventListener("resize", () => {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
    }, false);

    class Firework {
        constructor() {
            this.x = Math.random() * canvas.width;
            this.y = canvas.height;
            this.sx = Math.random() * 3 - 1.5;
            this.sy = Math.random() * -3 - 3;
            this.size = Math.random() * 2 + 1;
            const colorVal = Math.round(0xffffff * Math.random());
            [this.r, this.g, this.b] = [colorVal >> 16, (colorVal >> 8) & 255, colorVal & 255];
            this.shouldExplode = false;
        }
        update() {
            this.shouldExplode = this.sy >= -2 || this.y <= 100 || this.x <= 0 || this.x >= canvas.width;
            this.sy += 0.01;
            [this.x, this.y] = [this.x + this.sx, this.y + this.sy];
        }
        draw() {
            ctx.fillStyle = `rgba(${this.r},${this.g},${this.b}, 0.3)`;
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
            ctx.fill();
        }
    }

    class Particle {
        constructor(x, y, r, g, b) {
            [this.x, this.y, this.sx, this.sy, this.r, this.g, this.b] = [x, y, Math.random() * 3 - 1.5, Math.random() * 3 - 1.5, r, g, b];
            this.size = Math.random() * 2 + 1;
            this.life = 100;
        }
        update() {
            [this.x, this.y, this.life] = [this.x + this.sx, this.y + this.sy, this.life - 1];
        }
        draw() {
            ctx.fillStyle = `rgba(${this.r}, ${this.g}, ${this.b}, ${this.life / 100 * 0.3})`;
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
            ctx.fill();
        }
    }

    const fireworks = [new Firework()];
    const particles = [];

    function animate() {
        ctx.fillStyle = "rgba(0, 0, 0, 0.1)";
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        Math.random() < 0.25 && fireworks.push(new Firework());  //Controlling the number of fireworks
        fireworks.forEach((firework, i) => {
            firework.update();
            firework.draw();
            if (firework.shouldExplode) {
                for (let j = 0; j < 50; j++) particles.push(new Particle(firework.x, firework.y, firework.r, firework.g, firework.b));
                fireworks.splice(i, 1);
            }
        });
        particles.forEach((particle, i) => {
            particle.update();
            particle.draw();
            if (particle.life <= 0) particles.splice(i, 1);
        });
        requestAnimationFrame(animate);
    }

    animate();
}

function startProgressBar() {
    const progressBar = document.getElementById('progressBar');
    const container = document.querySelector('.container-bg');
    progressBar.style.display = 'flex';
    progressBar.style.alignItems = 'center';
    progressBar.style.justifyContent = 'center';
    progressBar.style.color = '#ffeb3b';
    progressBar.style.fontWeight = 'bold';
    progressBar.style.textShadow = '0 0 5px rgba(255, 255, 255, 0.5)';

    let width = 0;
    const interval = setInterval(() => {
        if (width >= 100) {
            clearInterval(interval);
            progressBar.innerText = '100%';
            // Sau khi đạt 100% mới hiển thị message và pháo hoa
            document.getElementById('newYearMessage').classList.remove('hidden');
            // Làm nhạt container và thêm hiệu ứng màu
            container.style.backgroundColor = 'rgba(0, 0, 0, 0.1)';
            container.style.backdropFilter = 'blur(2px)';
            container.style.transition = 'all 0.5s ease';
            // Thêm hiệu ứng glow với màu của pháo hoa
            container.style.boxShadow = `
                0 0 15px rgba(255, 235, 59, 0.2),
                0 0 30px rgba(255, 235, 59, 0.1)
            `;
            startFireworks();
        } else {
            width++;
            progressBar.style.width = width + '%';
            progressBar.innerText = width + '%';
        }
    }, 50);
}

const countdownInterval = setInterval(updateCountdown, 1000);
updateCountdown();
