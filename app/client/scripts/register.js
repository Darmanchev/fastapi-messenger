const API = 'http://localhost:8000/api/v1';

// if log in go to chat
if (localStorage.getItem('token')) {
    window.location.href = 'chat.html';
}

document.getElementById('registerForm').addEventListener('submit', async (e) => {
    e.preventDefault();

    const username  = document.getElementById('username').value;
    const email     = document.getElementById('email').value;
    const password  = document.getElementById('password').value;
    const errorMsg  = document.getElementById('errorMsg');
    const submitBtn = document.getElementById('submitBtn');

    submitBtn.disabled    = true;
    submitBtn.textContent = 'Loading...';
    errorMsg.classList.add('d-none');

    try {
        const res = await fetch(`${API}/auth/register`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, email, password }),
        });

        const data = await res.json();

        if (!res.ok) {
            errorMsg.textContent = data.detail || 'Registration error';
            errorMsg.classList.remove('d-none');
            return;
        }
        // save token and go to chat page
        localStorage.setItem('token', data.access_token);
        window.location.href = 'chat.html';

    } catch (err) {
        errorMsg.textContent = 'Error connecting to the server';
        errorMsg.classList.remove('d-none');
    } finally {
        submitBtn.disabled    = false;
        submitBtn.textContent = 'Sign up';
    }
});