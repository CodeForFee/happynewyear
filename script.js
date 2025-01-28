let isFireworksActive = false;
let isMusicPlaying = false;
const fireworks = [];

// Khởi tạo audio context
let audioContext;
let audioAnalyser;
let audioSource;

function initAudio() {
    try {
        // Only create new audio context if it doesn't exist
        if (!audioContext) {
            audioContext = new (window.AudioContext || window.webkitAudioContext)();
        }
        
        // Reset audio nodes
        if (audioSource) {
            audioSource.disconnect();
        }
        if (audioAnalyser) {
            audioAnalyser.disconnect();
        }

        audioAnalyser = audioContext.createAnalyser();
        const audio = document.getElementById('lunarMusic');
        
        // Important: Only create media element source if audio is properly loaded
        audio.addEventListener('canplaythrough', () => {
            try {
                audioSource = audioContext.createMediaElementSource(audio);
                audioSource.connect(audioAnalyser);
                audioAnalyser.connect(audioContext.destination);
            } catch (error) {
                console.error('Error connecting audio source:', error);
                showNotification('Lỗi kết nối âm thanh', 'error');
            }
        }, { once: true }); // Only trigger once

        // Add error handling for audio loading
        audio.addEventListener('error', (e) => {
            console.error('Audio loading error:', e);
            showNotification('Không thể tải file nhạc', 'error');
        });
    } catch (error) {
        console.error('Audio initialization failed:', error);
        showNotification('Khởi tạo âm thanh thất bại', 'error');
    }
}

function loadSettings() {
    try {
         const DEFAULT_MUSIC_URL = './music1';
        const settings = JSON.parse(localStorage.getItem('newYearSettings') || '{}');
        
        // Handle background loading
        if (settings.backgroundUrl) {
            const bgImage = new Image();
            bgImage.onload = () => {
                document.querySelector('.background-image').style.backgroundImage = `url('${settings.backgroundUrl}')`;
            };
            bgImage.onerror = () => {
                console.error('Background image failed to load');
                document.querySelector('.background-image').style.backgroundImage = 'url("default-bg.jpg")';
            };
            bgImage.src = settings.backgroundUrl;
        }
        
        // Improved music loading
        if (settings.musicUrl) {
            const audio = document.getElementById('lunarMusic');
            
            // Reset audio context and connections
            if (audioContext) {
                audioContext.close().then(() => {
                    audioContext = null;
                    initAudio(); // Reinitialize audio after reset
                });
            }
            
            audio.src = settings.musicUrl;
            
            // Ensure proper loading
            audio.load();
            
            // Add loading indicator
            showNotification('Đang tải nhạc...', 'info');
            
            audio.addEventListener('canplaythrough', () => {
                showNotification('Đã tải xong nhạc', 'info');
            }, { once: true });
        }

        if (settings.theme) {
            applyTheme(settings.theme);
        }
    } catch (error) {
        console.error('Error loading settings:', error);
        showNotification('Lỗi tải cài đặt', 'error');
    }
}


function applyTheme(theme) {
    const root = document.documentElement;
    
    // Set theme colors
    root.style.setProperty('--primary-color', theme.primaryColor || '#3B82F6');
    root.style.setProperty('--secondary-color', theme.secondaryColor || '#1F2937');
    root.style.setProperty('--accent-color', theme.accentColor || '#FBBF24');
    
    // Update countdown items style
    const countdownItems = document.querySelectorAll('.countdown-item');
    countdownItems.forEach(item => {
        item.style.backgroundColor = theme.countdownBg || 'rgba(0, 0, 0, 0.7)';
        item.style.color = theme.countdownText || '#FFFFFF';
    });
}

function getDefaultTargetDate() {
    const now = new Date();
    const currentYear = now.getFullYear();
    
    // Define Lunar New Year dates for upcoming years (Gregorian calendar)
    const lunarNewYearDates = {
        2025: new Date('2025-01-29T00:00:00'), // Year of the Snake
        2026: new Date('2026-02-17T00:00:00'), // Year of the Dragon
        2027: new Date('2027-02-06T00:00:00'), // Year of the Horse
        2028: new Date('2028-01-26T00:00:00'), // Year of the Sheep
        2029: new Date('2029-02-13T00:00:00')  // Year of the Monkey
    };
    
    // Find the next Lunar New Year date
    let targetYear = currentYear;
    let targetDate = lunarNewYearDates[targetYear];
    
    // If current date is past this year's Lunar New Year, get next year's date
    while (targetDate && now > targetDate) {
        targetYear++;
        targetDate = lunarNewYearDates[targetYear];
    }
    
    // If no future date found in our predefined dates, use default calculation
    if (!targetDate) {
        console.warn('No predefined Lunar New Year date found for year ' + targetYear);
        // Default to Jan 29th of next year as a fallback
        targetDate = new Date(`${targetYear}-01-29T00:00:00`);
    }
    
    return targetDate;
}

function updateCountdown() {
    try {
        const settings = JSON.parse(localStorage.getItem('newYearSettings') || '{}');
        let targetDate;

        if (settings.targetDateTime && isValidDate(settings.targetDateTime)) {
            targetDate = new Date(settings.targetDateTime);
        } else {
            targetDate = getDefaultTargetDate();
        }

        const currentTime = new Date();
        const startOfYear = new Date(currentTime.getFullYear(), 0, 1);
        const totalDuration = targetDate.getTime() - startOfYear.getTime();
        const elapsed = currentTime.getTime() - startOfYear.getTime();
        const progress = Math.max(0, Math.min(100, (elapsed / totalDuration) * 100));
        const distance = targetDate.getTime() - currentTime.getTime();

        updateCountdownDisplay(distance, currentTime, targetDate, progress);

        if (distance <= 0) {
            handleCountdownComplete(targetDate);
        }

        // Update document title with countdown
        if (distance > 0) {
            const days = Math.floor(distance / (1000 * 60 * 60 * 24));
            document.title = `${days} ngày nữa - Tết ${targetDate.getFullYear()}`;
        } else {
            document.title = `Chúc mừng năm mới ${targetDate.getFullYear()}!`;
        }
    } catch (error) {
        console.error('Error in updateCountdown:', error);
        handleCountdownError();
    }
}

function updateCountdownDisplay(distance, currentTime, targetDate, progress) {
    if (distance > 0) {
        const timeUnits = calculateTimeUnits(distance);
        updateTimeDisplay(timeUnits);
        updateProgressBar(progress);
        document.getElementById('currentTime').textContent = formatCurrentTime(currentTime);
        document.getElementById('newYearMessage').textContent = `Happy New Year ${targetDate.getFullYear()}`;
    }
}

function calculateTimeUnits(distance) {
    return {
        days: Math.max(0, Math.floor(distance / (1000 * 60 * 60 * 24))),
        hours: Math.max(0, Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))),
        minutes: Math.max(0, Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60))),
        seconds: Math.max(0, Math.floor((distance % (1000 * 60)) / 1000))
    };
}

function updateTimeDisplay(timeUnits) {
    Object.entries(timeUnits).forEach(([unit, value]) => {
        const element = document.getElementById(unit);
        if (element) {
            element.innerHTML = `${value}<br><span class="text-sm">${unit.charAt(0).toUpperCase() + unit.slice(1)}</span>`;
        }
    });
}

function updateProgressBar(progress) {
    const progressBar = document.getElementById('progressBar');
    const progressText = document.getElementById('progressText');
    
    progressBar.style.width = `${progress}%`;
    progressText.textContent = `${Math.floor(progress)}%`;

    if (Math.floor(progress) % 10 === 0 && Math.floor(progress) > 0) {
        progressText.classList.add('scale-125');
        setTimeout(() => progressText.classList.remove('scale-125'), 200);
    }
}

function handleCountdownComplete(targetDate) {
    clearInterval(countdownInterval);
    document.getElementById('progressBar').style.width = '100%';
    document.getElementById('progressText').textContent = '100%';
    document.getElementById('newYearMessage').classList.remove('hidden');
    
    if (!isFireworksActive) {
        startFireworks();
        autoPlayMusic();
    }

    displayCompletionMessage(targetDate);
}

function displayCompletionMessage(targetDate) {
    const dateFormatter = new Intl.DateTimeFormat('vi-VN', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit'
    });

    resetCountdownDisplays();
    document.getElementById('currentTime').innerHTML = `
        <div class="text-xl font-bold text-yellow-300">
            ${dateFormatter.format(targetDate)}
        </div>
    `;
}

function resetCountdownDisplays() {
    ['days', 'hours', 'minutes', 'seconds'].forEach(unit => {
        document.getElementById(unit).innerHTML = `0<br><span class="text-sm">${unit.charAt(0).toUpperCase() + unit.slice(1)}</span>`;
    });
}

function handleCountdownError() {
    const defaultDate = getDefaultTargetDate();
    localStorage.setItem('newYearSettings', JSON.stringify({ 
        targetDateTime: defaultDate.toISOString() 
    }));
    showNotification('Đã xảy ra lỗi, đặt lại thời gian mặc định', 'error');
}

function showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.className = `fixed top-4 right-4 p-4 rounded-lg shadow-lg z-50 ${
        type === 'error' ? 'bg-red-500' : 'bg-green-500'
    } text-white opacity-0 transition-opacity duration-300`;
    notification.textContent = message;
    
    document.body.appendChild(notification);
    setTimeout(() => notification.style.opacity = '1', 100);
    setTimeout(() => {
        notification.style.opacity = '0';
        setTimeout(() => notification.remove(), 300);
    }, 3000);
}

function isValidDate(dateString) {
    const date = new Date(dateString);
    return date instanceof Date && !isNaN(date) && date.getTime() > new Date().getTime();
}

function formatCurrentTime(date) {
    return new Intl.DateTimeFormat('vi-VN', {
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit'
    }).format(date);
}

// Fireworks related code remains the same
// ... (keep all the existing fireworks code)

function toggleMusic() {
    const audio = document.getElementById('lunarMusic');
    const musicIcon = document.getElementById('musicPath');
    
    if (!audio.src) {
        showNotification('Chưa có file nhạc nào được tải', 'error');
        return;
    }
    
    if (isMusicPlaying) {
        audio.pause();
        musicIcon.setAttribute('d', 'M15.536 8.464a5 5 0 010 7.072M12 18.364a3 3 0 010-4.243M18.364 5.636a8 8 0 010 11.314');
        isMusicPlaying = false;
    } else {
        // Resume AudioContext if suspended
        if (audioContext?.state === 'suspended') {
            audioContext.resume();
        }
        
        // Play with proper error handling
        audio.play().then(() => {
            musicIcon.setAttribute('d', 'M5.586 15H4a1 1 0 01-1-1V10a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z');
            isMusicPlaying = true;
        }).catch(e => {
            console.error('Audio play failed:', e);
            showNotification('Không thể phát nhạc - ' + e.message, 'error');
            isMusicPlaying = false;
        });
    }
}

function autoPlayMusic() {
    const audio = document.getElementById('lunarMusic');
    
    if (!audio.src) {
        console.error('No music source set');
        showNotification('Chưa có file nhạc nào được tải', 'error');
        return;
    }
    
    if (audioContext?.state === 'suspended') {
        audioContext.resume();
    }
    
    audio.play().catch(e => {
        console.error('Auto play failed:', e);
        showNotification('Tự động phát nhạc thất bại - ' + e.message, 'error');
    });
    
    isMusicPlaying = true;
    document.getElementById('musicPath').setAttribute('d', 'M5.586 15H4a1 1 0 01-1-1V10a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z');
}
// Greetings function
function showGreeting() {
    try {
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
    } catch (error) {
        console.error('Error showing greeting:', error);
        showNotification('Không thể hiển thị lời chúc', 'error');
    }
}

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    loadSettings();
    initAudio();
    updateCountdown();
    document.getElementById('progressContainer').classList.remove('hidden');
    
    // Add page visibility handling
    document.addEventListener('visibilitychange', () => {
        if (document.hidden) {
            if (isFireworksActive) stopFireworks();
            if (isMusicPlaying) document.getElementById('lunarMusic').pause();
        } else {
            updateCountdown(); // Update immediately when page becomes visible
        }
    });
});

// Start countdown interval
const countdownInterval = setInterval(updateCountdown, 1000);

// Add window resize handler
let resizeTimeout;
window.addEventListener('resize', () => {
    clearTimeout(resizeTimeout);
    resizeTimeout = setTimeout(() => {
        resizeCanvas();
        if (isFireworksActive) {
            stopFireworks();
            startFireworks();
        }
    }, 250);
});
