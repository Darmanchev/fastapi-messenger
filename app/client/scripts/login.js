const API = 'http://localhost:8000/api/v1';

// Если уже залогинен — сразу в чат
if (localStorage.getItem('token')) {
    window.location.href = 'chat.html';
}

document.getElementById('loginForm').addEventListener('submit', async (e) => {
    e.preventDefault();

    const email    = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    const errorMsg = document.getElementById('errorMsg');
    const submitBtn = document.getElementById('submitBtn');

    // Блокируем кнопку пока идёт запрос
    submitBtn.disabled    = true;
    submitBtn.textContent = 'Loading...';
    errorMsg.classList.add('d-none');

    try {
        const res = await fetch(`${API}/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password }),
        });

        const data = await res.json();

        if (!res.ok) {
            // Показываем ошибку от сервера
            errorMsg.textContent = data.detail || 'Ошибка входа';
            errorMsg.classList.remove('d-none');
            return;
        }

        // Сохраняем токен
        localStorage.setItem('token', data.access_token);

        // Переходим в чат
        window.location.href = 'chat.html';

    } catch (err) {
        errorMsg.textContent = 'Ошибка соединения с сервером';
        errorMsg.classList.remove('d-none');
    } finally {
        submitBtn.disabled    = false;
        submitBtn.textContent = 'Log in';
    }
});