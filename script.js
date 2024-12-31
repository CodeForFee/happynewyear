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

    // Hiển thị countdown
    document.getElementById('days').innerHTML = `${days}<br><span class="text-sm">Days</span>`;
    document.getElementById('hours').innerHTML = `${hours}<br><span class="text-sm">Hours</span>`;
    document.getElementById('minutes').innerHTML = `${minutes}<br><span class="text-sm">Minutes</span>`;
    document.getElementById('seconds').innerHTML = `${seconds}<br><span class="text-sm">Seconds</span>`;

    // Hiển thị thời gian hiện tại
    document.getElementById('currentTime').textContent = currentTime.toLocaleTimeString();

    // Khi đến thời điểm năm mới
    if (distance < 0) {
        clearInterval(countdownInterval);
        document.getElementById('newYearMessage').classList.remove('hidden');
        
        // Kích hoạt pháo hoa
        if (typeof startFireworks === 'function') {
            startFireworks();
        }
        
        // Phát nhạc
        const audio = document.getElementById('lunarMusic');
        if (audio) {
            audio.play().catch(e => console.log('Audio play failed:', e));
        }

        // Reset countdown display
        document.getElementById('days').innerHTML = '0<br><span class="text-sm">Days</span>';
        document.getElementById('hours').innerHTML = '0<br><span class="text-sm">Hours</span>';
        document.getElementById('minutes').innerHTML = '0<br><span class="text-sm">Minutes</span>';
        document.getElementById('seconds').innerHTML = '0<br><span class="text-sm">Seconds</span>';
    }
}

// Hiển thị progress bar ngay khi tải trang
document.getElementById('progressContainer').classList.remove('hidden');

// Cập nhật mỗi giây
const countdownInterval = setInterval(updateCountdown, 1000);

// Chạy lần đầu để tránh delay
updateCountdown();
