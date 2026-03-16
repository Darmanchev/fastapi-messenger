const CHANNELS = [
    {
        id: 1,
        name: 'general',
        icon: '💬',
        color: '3d8bfd',
        messages: [
            { from: 'Alice',  me: false, text: 'Привет всем! Добро пожаловать в #general 👋' },
            { from: 'Bob',    me: false, text: 'Спасибо! Рад быть здесь.' },
            { from: 'You',    me: true,  text: 'Всем привет! Чем занимаемся?' },
            { from: 'Alice',  me: false, text: 'Пишем мессенджер для универа' },
        ]
    },
    {
        id: 2,
        name: 'random',
        icon: '🎲',
        color: '20c997',
        messages: [
            { from: 'Dave',   me: false, text: 'Видели новый мем про JavaScript?' },
            { from: 'Eve',    me: false, text: 'Хаха, да! Очень точно.' },
            { from: 'You',    me: true,  text: 'Скиньте ссылку!' },
            { from: 'Dave',   me: false, text: 'Секунду, ищу...' },
        ]
    },
    {
        id: 3,
        name: 'tech',
        icon: '⚙️',
        color: 'fd7e14',
        messages: [
            { from: 'Grace',  me: false, text: 'FastAPI лучше Flask для новых проектов.' },
            { from: 'Hank',   me: false, text: 'Согласен. Async — это важно.' },
            { from: 'You',    me: true,  text: 'И автодокументация через Swagger 🔥' },
            { from: 'Grace',  me: false, text: 'Именно! Плюс Pydantic валидация.' },
        ]
    },
    {
        id: 4,
        name: 'announcements',
        icon: '📢',
        color: 'dc3545',
        messages: [
            { from: 'Admin',  me: false, text: '🎉 BestMessenger v1.0 запущен!' },
            { from: 'Admin',  me: false, text: 'Новые функции: каналы, поиск, WebSocket.' },
            { from: 'Alice',  me: false, text: 'Отличная работа команда! 🚀' },
            { from: 'You',    me: true,  text: 'Новый UI выглядит классно!' },
        ]
    },
    {
        id: 5,
        name: 'design',
        icon: '🎨',
        color: '6f42c1',
        messages: [
            { from: 'Jane',   me: false, text: 'Макеты тёмной темы готовы 🌙' },
            { from: 'You',    me: true,  text: 'Отлично! Нравится цветовая палитра.' },
            { from: 'Jane',   me: false, text: 'Спасибо! Тёмно-синий + индиго акцент.' },
            { from: 'Kate',   me: false, text: 'Можно посмотреть светлую версию?' },
        ]
    },
];

let currentId = null;

// ── Рендер списка каналов ──
function renderChannels(list) {
    const el = document.getElementById('channelsList');
    el.innerHTML = '';
    list.forEach(ch => {
        const a = document.createElement('a');
        a.href = '#';
        a.className = 'list-group-item list-group-item-action p-3 border-0 border-bottom' +
                      (ch.id === currentId ? ' active' : '');
        a.innerHTML = `
            <div class="d-flex align-items-center">
                <div class="rounded-circle me-3 d-flex align-items-center justify-content-center"
                     style="width:40px;height:40px;background:#${ch.color}22;font-size:18px;flex-shrink:0;">
                    ${ch.icon}
                </div>
                <div class="w-100 overflow-hidden">
                    <div class="d-flex justify-content-between">
                        <h6 class="mb-0 text-truncate"># ${ch.name}</h6>
                        <small class="${ch.id === currentId ? 'text-white-50' : 'text-muted'}">${ch.messages.length} msg</small>
                    </div>
                    <small class="${ch.id === currentId ? 'text-white-50' : 'text-muted'} text-truncate d-block">
                        ${ch.messages.at(-1).text}
                    </small>
                </div>
            </div>`;
        a.onclick = (e) => { e.preventDefault(); switchChannel(ch.id); };
        el.appendChild(a);
    });
}

// ── Filter channels ──
function filterChannels(q) {
    const filtered = CHANNELS.filter(c => c.name.toLowerCase().includes(q.toLowerCase()));
    renderChannels(filtered);
}

// ── Switch channel ──
function switchChannel(id) {
    currentId = id;
    const ch = CHANNELS.find(c => c.id === id);
    if (!ch) return;

    renderChannels(CHANNELS);

    document.getElementById('headerIcon').textContent = ch.icon;
    document.getElementById('headerName').textContent = '# ' + ch.name;

    renderMessages(ch.messages);
}

// ── Rendering messages ──
function renderMessages(msgs) {
    const container = document.getElementById('messagesContainer');
    container.innerHTML = '';
    msgs.forEach(m => {
        const div = document.createElement('div');
        div.className = 'p-2 px-3 rounded-3 shadow-sm ' +
            (m.me ? 'bg-primary text-white align-self-end' : 'bg-light align-self-start');
        div.style.maxWidth = '75%';
        if (!m.me) {
            div.innerHTML = `<small class="fw-semibold d-block text-primary mb-1">${m.from}</small>${m.text}`;
        } else {
            div.textContent = m.text;
        }
        container.appendChild(div);
    });
    const area = document.querySelector('.messages-area');
    area.scrollTop = area.scrollHeight;
}

// ── Send message ──
function sendMessage() {
    const input = document.getElementById('msgInput');
    const text = input.value.trim();
    if (!text || !currentId) return;

    const ch = CHANNELS.find(c => c.id === currentId);
    ch.messages.push({ from: 'You', me: true, text });
    input.value = '';

    renderMessages(ch.messages);
    renderChannels(CHANNELS);
}

// ── Load first channel at start ──
switchChannel(1);