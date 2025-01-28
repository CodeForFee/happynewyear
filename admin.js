// Mật khẩu admin - trong thực tế nên được mã hóa và lưu trữ an toàn
const ADMIN_PASSWORD = "1";

// Thêm vào đầu file, sau ADMIN_PASSWORD
const DEFAULT_GREETINGS = [
    "Chúc mừng năm mới 2025! Chúc bạn một năm mới tràn đầy sức khỏe và thành công.",
    "Năm mới Tết đến, xin chúc bạn luôn vui vẻ, hạnh phúc và gặt hái được nhiều thành công mới!",
    "Năm 2025 đã đến, chúc bạn phát tài phát lộc, vạn sự như ý, an khang thịnh vượng.",
    "Chúc mừng năm mới! Chúc bạn 12 tháng phú quý, 365 ngày phát tài, 8760 giờ sung túc, 525600 phút thành công!",
    "Năm mới 2025, chúc bạn có một năm tràn ngập niềm vui, hạnh phúc và những điều tốt đẹp nhất.",
    "Chúc bạn năm mới vạn sự cát tường, vạn sự như ý, tỷ sự hanh thông!"
];

// Kiểm tra đăng nhập
function login() {
    const password = document.getElementById('adminPassword').value;
    if (password === ADMIN_PASSWORD) {
        document.getElementById('loginForm').classList.add('hidden');
        document.getElementById('adminPanel').classList.remove('hidden');
        loadCurrentSettings();
    } else {
        alert('Incorrect password!');
    }
}

function logout() {
    document.getElementById('loginForm').classList.remove('hidden');
    document.getElementById('adminPanel').classList.add('hidden');
    document.getElementById('adminPassword').value = '';
}

// Load current settings
function loadCurrentSettings() {
    const settings = JSON.parse(localStorage.getItem('newYearSettings') || '{}');
    
    if (settings.targetDateTime) {
        // Format ngày giờ cho input datetime-local
        const targetDate = new Date(settings.targetDateTime);
        const formattedDate = targetDate.toISOString().slice(0, 16);
        document.getElementById('targetDateTime').value = formattedDate;
    } else {
        // Set giá trị mặc định là 1/1/2025
        const defaultDate = new Date('2025-01-01T00:00');
        document.getElementById('targetDateTime').value = defaultDate.toISOString().slice(0, 16);
    }
    if (settings.backgroundUrl) {
        document.getElementById('backgroundUrl').value = settings.backgroundUrl;
    }
    if (settings.musicUrl) {
        document.getElementById('musicUrl').value = settings.musicUrl;
        document.getElementById('musicPreview').src = settings.musicUrl;
    }
    
    // Kiểm tra và thêm lời chúc mặc định nếu chưa có
    const greetings = JSON.parse(localStorage.getItem('greetings') || '[]');
    if (greetings.length === 0) {
        localStorage.setItem('greetings', JSON.stringify(DEFAULT_GREETINGS));
    }
    
    loadGreetings();
}

// Save countdown settings
function saveCountdownSettings() {
    const targetDateTime = document.getElementById('targetDateTime').value;
    if (!targetDateTime) {
        alert('Please select a target date and time');
        return;
    }

    try {
        // Kiểm tra định dạng ngày hợp lệ
        const targetDate = new Date(targetDateTime);
        if (isNaN(targetDate.getTime())) {
            throw new Error('Invalid date format');
        }

        const settings = JSON.parse(localStorage.getItem('newYearSettings') || '{}');
        settings.targetDateTime = targetDateTime;
        localStorage.setItem('newYearSettings', JSON.stringify(settings));
        alert('Countdown settings saved!');
    } catch (error) {
        alert('Error saving date: ' + error.message);
    }
}

// Save background settings
function saveBackgroundSettings() {
    const backgroundUrl = document.getElementById('backgroundUrl').value;
    if (!backgroundUrl) {
        alert('Please enter a background URL');
        return;
    }

    const settings = JSON.parse(localStorage.getItem('newYearSettings') || '{}');
    settings.backgroundUrl = backgroundUrl;
    localStorage.setItem('newYearSettings', JSON.stringify(settings));
    alert('Background settings saved!');
}

// Save music settings
function saveMusicSettings() {
    const musicUrl = document.getElementById('musicUrl').value;
    if (!musicUrl) {
        alert('Please enter a music URL or upload a file');
        return;
    }

    const settings = JSON.parse(localStorage.getItem('newYearSettings') || '{}');
    settings.musicUrl = musicUrl;
    localStorage.setItem('newYearSettings', JSON.stringify(settings));
    
    // Update preview
    document.getElementById('musicPreview').src = musicUrl;
    alert('Music settings saved!');
}

// Greetings management
function saveGreeting() {
    const template = document.getElementById('greetingTemplate').value;
    if (!template) {
        alert('Please enter a greeting template');
        return;
    }

    const greetings = JSON.parse(localStorage.getItem('greetings') || '[]');
    greetings.push(template);
    localStorage.setItem('greetings', JSON.stringify(greetings));
    
    document.getElementById('greetingTemplate').value = '';
    loadGreetings();
    alert('Greeting template added!');
}

function loadGreetings() {
    const greetings = JSON.parse(localStorage.getItem('greetings') || '[]');
    const greetingsList = document.getElementById('greetingsList');
    greetingsList.innerHTML = '';

    greetings.forEach((greeting, index) => {
        const div = document.createElement('div');
        div.className = 'flex justify-between items-center p-2 border-b';
        div.innerHTML = `
            <span>${greeting}</span>
            <button onclick="deleteGreeting(${index})" 
                    class="text-red-500 hover:text-red-700">Delete</button>
        `;
        greetingsList.appendChild(div);
    });
}

function deleteGreeting(index) {
    const greetings = JSON.parse(localStorage.getItem('greetings') || '[]');
    greetings.splice(index, 1);
    localStorage.setItem('greetings', JSON.stringify(greetings));
    loadGreetings();
}

// Thêm hàm reset greetings
function resetGreetings() {
    if (confirm('Bạn có chắc muốn reset tất cả lời chúc về mặc định?')) {
        localStorage.setItem('greetings', JSON.stringify(DEFAULT_GREETINGS));
        loadGreetings();
        alert('Đã reset lời chúc về mặc định!');
    }
}

// Thêm hàm clearAllGreetings để xóa hoàn toàn và reset về mặc định
function clearAllGreetings() {
    if (confirm('Bạn có chắc muốn xóa tất cả lời chúc và reset về mặc định?')) {
        localStorage.removeItem('greetings'); // Xóa hoàn toàn
        localStorage.setItem('greetings', JSON.stringify(DEFAULT_GREETINGS)); // Set lại mặc định
        loadGreetings();
        alert('Đã reset lời chúc về mặc định!');
    }
}

// Thêm hàm xử lý upload nhạc
function handleMusicUpload(event) {
    const file = event.target.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = function(e) {
            const musicUrl = e.target.result;
            document.getElementById('musicUrl').value = musicUrl;
            document.getElementById('musicPreview').src = musicUrl;
        };
        reader.readAsDataURL(file);
    }
}