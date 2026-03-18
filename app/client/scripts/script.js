const API = 'http://localhost:8000/api/v1';

// Иконки и цвета для каналов — только визуал, не данные
const CHANNEL_META = {
    'general':       { icon: '💬', color: '3d8bfd' },
    'random':        { icon: '🎲', color: '20c997' },
    'tech':          { icon: '⚙️', color: 'fd7e14' },
    'announcements': { icon: '📢', color: 'dc3545' },
    'design':        { icon: '🎨', color: '6f42c1' },
};

function getMeta(name) {
    return CHANNEL_META[name] || { icon: '💬', color: '6c757d' };
}

let currentId   = null;
let allChannels = [];   // сохраняем каналы из API

// ── Загрузить каналы из API ────────────────────
async function loadChannels() {
    try {
        const res      = await fetch(`${API}/channels`);
        const channels = await res.json();
        allChannels    = channels;
        renderChannels(channels);

        // открываем первый канал
        if (channels.length > 0) {
            switchChannel(channels[0].id);
        }
    } catch (err) {
        console.error('Ошибка загрузки каналов:', err);
    }
}

// ── Загрузить сообщения канала из API ─────────
async function loadMessages(channelId) {
    try {
        const res      = await fetch(`${API}/channels/${channelId}/messages`);
        const messages = await res.json();
        renderMessages(messages);
    } catch (err) {
        console.error('Ошибка загрузки сообщений:', err);
    }
}

// ── Рендер списка каналов ─────────────────────
function renderChannels(list) {
    const el = document.getElementById('channelsList');
    el.innerHTML = '';

    list.forEach(ch => {
        const meta = getMeta(ch.name);
        const a    = document.createElement('a');

        a.href      = '#';
        a.className = 'list-group-item list-group-item-action p-3 border-0 border-bottom' +
                      (ch.id === currentId ? ' active' : '');

        a.innerHTML = `
            <div class="d-flex align-items-center">
                <div class="rounded-circle me-3 d-flex align-items-center justify-content-center"
                     style="width:40px;height:40px;background:#${meta.color}22;font-size:18px;flex-shrink:0;">
                    ${meta.icon}
                </div>
                <div class="w-100 overflow-hidden">
                    <div class="d-flex justify-content-between">
                        <h6 class="mb-0 text-truncate"># ${ch.name}</h6>
                    </div>
                </div>
            </div>`;

        a.onclick = (e) => { e.preventDefault(); switchChannel(ch.id); };
        el.appendChild(a);
    });
}

// ── Фильтр каналов ────────────────────────────
function filterChannels(q) {
    const filtered = allChannels.filter(c =>
        c.name.toLowerCase().includes(q.toLowerCase())
    );
    renderChannels(filtered);
}

// ── Переключение канала ───────────────────────
function switchChannel(id) {
    currentId  = id;
    const ch   = allChannels.find(c => c.id === id);
    if (!ch) return;

    const meta = getMeta(ch.name);

    // обновить сайдбар
    renderChannels(allChannels);

    // обновить заголовок
    document.getElementById('headerIcon').textContent = meta.icon;
    document.getElementById('headerName').textContent = '# ' + ch.name;

    // загрузить сообщения из API
    loadMessages(id);
}

// ── Рендер сообщений ──────────────────────────
function renderMessages(msgs) {
    const container = document.getElementById('messagesContainer');
    container.innerHTML = '';

    msgs.forEach(m => {
        const div = document.createElement('div');

        // message.author.username — приходит из API (MessageOut → author: UserOut)
        const isMe = m.author.username === 'alice'; // временно — заменим на JWT

        div.className  = 'p-2 px-3 rounded-3 shadow-sm ' +
            (isMe ? 'bg-primary text-white align-self-end' : 'bg-light align-self-start');
        div.style.maxWidth = '75%';

        if (!isMe) {
            div.innerHTML = `
                <small class="fw-semibold d-block text-primary mb-1">${m.author.username}</small>
                ${m.content}
                <small class="d-block text-muted mt-1" style="font-size:0.7rem">
                    ${new Date(m.sent_at).toLocaleTimeString('ru', { hour: '2-digit', minute: '2-digit' })}
                </small>`;
        } else {
            div.innerHTML = `
                ${m.content}
                <small class="d-block text-white-50 mt-1" style="font-size:0.7rem">
                    ${new Date(m.sent_at).toLocaleTimeString('ru', { hour: '2-digit', minute: '2-digit' })}
                </small>`;
        }

        container.appendChild(div);
    });

    // прокрутить вниз
    const area = document.querySelector('.messages-area');
    area.scrollTop = area.scrollHeight;
}

// ── Отправка сообщения (пока локально) ────────
function sendMessage() {
    const input = document.getElementById('msgInput');
    const text  = input.value.trim();
    if (!text || !currentId) return;

    // TODO: заменить на WebSocket после авторизации
    const div = document.createElement('div');
    div.className  = 'p-2 px-3 rounded-3 shadow-sm bg-primary text-white align-self-end';
    div.style.maxWidth = '75%';
    div.textContent    = text;

    document.getElementById('messagesContainer').appendChild(div);
    input.value = '';

    const area = document.querySelector('.messages-area');
    area.scrollTop = area.scrollHeight;
}

// ── Удалить канал ─────────────────────────────
async function deleteChannel() {
    if (!currentId) return;

    const ch = allChannels.find(c => c.id === currentId);
    if (!confirm(`Удалить канал #${ch.name}?`)) return;

    try {
        const res = await fetch(`${API}/channels/${currentId}`, {
            method: 'DELETE',
        });

        if (res.status === 204) {
            // убираем из списка
            allChannels = allChannels.filter(c => c.id !== currentId);
            currentId   = null;

            // очищаем заголовок и сообщения
            document.getElementById('headerIcon').textContent = '';
            document.getElementById('headerName').textContent = '—';
            document.getElementById('messagesContainer').innerHTML = '';

            // переключаемся на первый оставшийся канал
            renderChannels(allChannels);
            if (allChannels.length > 0) {
                switchChannel(allChannels[0].id);
            }
        }
    } catch (err) {
        console.error('Ошибка удаления:', err);
    }
}

// ── Создать канал ─────────────────────────────
async function createChannel() {
    const input    = document.getElementById('newChannelName');
    const errorEl  = document.getElementById('channelError');
    const name     = input.value.trim().toLowerCase().replace(/\s+/g, '-');

    if (name.length < 2) {
        errorEl.textContent = 'Минимум 2 символа';
        return;
    }

    try {
        const res = await fetch(`${API}/channels`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name }),
        });

        if (res.status === 400) {
            const data = await res.json();
            errorEl.textContent = data.detail;
            return;
        }

        const channel = await res.json();

        // закрываем модалку
        bootstrap.Modal.getInstance(
            document.getElementById('createChannelModal')
        ).hide();

        // очищаем поле
        input.value     = '';
        errorEl.textContent = '';

        // добавляем в список и переключаемся
        allChannels.push(channel);
        renderChannels(allChannels);
        switchChannel(channel.id);

    } catch (err) {
        errorEl.textContent = 'Ошибка соединения с сервером';
        console.error(err);
    }
}

// ── Старт ─────────────────────────────────────
loadChannels();