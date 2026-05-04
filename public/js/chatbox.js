// Chatbox Widget - Floating chat widget
const CHAT_FETCH_OPTS = { credentials: 'same-origin' };
const SHOP_CHAT_MAILBOX = 'admin';

class ChatboxWidget {
    constructor() {
        this.isOpen = false;
        this.currentToUser = null;
        this.currentUserId = null;
        this.isAdmin = false;
        this.pollInterval = null;
        this.userList = []; // Lưu danh sách user cho admin
        this.init();
    }

    init() {
        // Kiểm tra xem user đã đăng nhập chưa
        const userElement = document.querySelector('[data-user-id]');
        if (!userElement) {
            // User chưa đăng nhập, không tạo chatbox
            return;
        }

        // Lấy thông tin user từ data attributes
        this.currentUserId = userElement.getAttribute('data-user-id').trim();
        this.isAdmin = userElement.getAttribute('data-is-admin') === 'true';
        
        // Setup user
        this.setupUser();
        
        // Tạo HTML cho chatbox
        this.createChatboxHTML();
        
        // Bind events
        this.bindEvents();
        
        // Load unread count
        this.loadUnreadCount();
        setInterval(() => this.loadUnreadCount(), 5000);
    }

    setupUser() {
        // User thường chat với admin, admin sẽ có logic riêng
        if (this.isAdmin) {
            // Admin sẽ chat với user được chọn (sẽ implement sau)
            this.currentToUser = null; // Admin cần chọn user
        } else {
            // User thường luôn chat với admin
            this.currentToUser = 'admin';
        }
    }

    createChatboxHTML() {
        const title = this.isAdmin ? '💬 Quản lý Chat' : '💬 Chat với Admin';
        const chatboxHTML = `
            <div id="chatbox-widget" class="chatbox-widget">
                <div id="chatbox-toggle" class="chatbox-toggle">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
                    </svg>
                    <span id="chatbox-badge" class="chatbox-badge" style="display: none;">0</span>
                </div>
                <div id="chatbox-window" class="chatbox-window" style="display: none;">
                    <div class="chatbox-header">
                        <h3 id="chatbox-title">${title}</h3>
                        <button id="chatbox-back" class="chatbox-back" style="display: ${this.isAdmin ? 'none' : 'none'};">←</button>
                        <button id="chatbox-close" class="chatbox-close">×</button>
                    </div>
                    <div id="chatbox-user-list" class="chatbox-user-list" style="display: ${this.isAdmin ? 'block' : 'none'};"></div>
                    <div id="chatbox-messages" class="chatbox-messages" style="display: ${this.isAdmin && !this.currentToUser ? 'none' : 'flex'};"></div>
                    <div class="chatbox-input-area" style="display: ${this.isAdmin && !this.currentToUser ? 'none' : 'flex'};">
                        <input type="text" id="chatbox-input" placeholder="Nhập tin nhắn..." />
                        <button id="chatbox-send" class="chatbox-send">Gửi</button>
                    </div>
                </div>
            </div>
        `;
        
        document.body.insertAdjacentHTML('beforeend', chatboxHTML);
    }

    bindEvents() {
        // Toggle chatbox
        document.getElementById('chatbox-toggle')?.addEventListener('click', () => {
            this.toggleChatbox();
        });

        // Close chatbox
        document.getElementById('chatbox-close')?.addEventListener('click', () => {
            this.closeChatbox();
        });

        // Back button (for admin to go back to user list)
        document.getElementById('chatbox-back')?.addEventListener('click', () => {
            this.showUserList();
        });

        // Send message
        document.getElementById('chatbox-send')?.addEventListener('click', () => {
            this.sendMessage();
        });

        // Send on Enter
        document.getElementById('chatbox-input')?.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                this.sendMessage();
            }
        });
    }

    toggleChatbox() {
        this.isOpen = !this.isOpen;
        const window = document.getElementById('chatbox-window');
        if (this.isOpen) {
            window.style.display = 'flex';
            if (this.isAdmin) {
                this.loadUserList();
            } else {
                this.loadMessages();
                this.startPolling();
            }
        } else {
            window.style.display = 'none';
            this.stopPolling();
        }
    }

    closeChatbox() {
        this.isOpen = false;
        document.getElementById('chatbox-window').style.display = 'none';
        this.stopPolling();
    }

    async loadUserList() {
        if (!this.isAdmin) return;

        try {
            const response = await fetch('/api/chat/users', CHAT_FETCH_OPTS);
            const data = await response.json();
            
            if (data.success && data.users) {
                this.renderUserList(data.users);
            } else {
                const container = document.getElementById('chatbox-user-list');
                if (container) {
                    container.innerHTML = '<div style="text-align: center; color: #999; padding: 20px;">Chưa có user nào chat</div>';
                }
            }
        } catch (error) {
            console.error('Error loading user list:', error);
        }
    }

    renderUserList(users) {
        const container = document.getElementById('chatbox-user-list');
        if (!container) return;

        // Lưu danh sách user
        this.userList = users;

        if (users.length === 0) {
            container.innerHTML = '<div style="text-align: center; color: #999; padding: 20px;">Chưa có user nào chat</div>';
            return;
        }

        container.innerHTML = users.map(user => {
            const unreadBadge = user.UnreadCount > 0 
                ? `<span class="chatbox-user-unread">${user.UnreadCount > 99 ? '99+' : user.UnreadCount}</span>` 
                : '';
            const lastMessage = user.LastMessage 
                ? (user.LastMessage.length > 30 ? user.LastMessage.substring(0, 30) + '...' : user.LastMessage)
                : 'Chưa có tin nhắn';
            const time = user.LastMessageTime 
                ? new Date(user.LastMessageTime).toLocaleString('vi-VN', { hour: '2-digit', minute: '2-digit' })
                : '';

            return `
                <div class="chatbox-user-item" data-user-id="${user.User_id.trim()}">
                    <div class="chatbox-user-info">
                        <div class="chatbox-user-name">
                            ${this.escapeHtml(user.Ho_Ten_User)} ${unreadBadge}
                        </div>
                        <div class="chatbox-user-lastmsg">${this.escapeHtml(lastMessage)}</div>
                        ${time ? `<div class="chatbox-user-time">${time}</div>` : ''}
                    </div>
                </div>
            `;
        }).join('');

        // Bind click events
        container.querySelectorAll('.chatbox-user-item').forEach(item => {
            item.addEventListener('click', () => {
                const userId = item.getAttribute('data-user-id');
                this.selectUser(userId);
            });
        });
    }

    selectUser(userId) {
        this.currentToUser = userId;
        
        // Tìm user trong danh sách để lấy tên
        const user = this.userList.find(u => u.User_id.trim() === userId.trim());
        const userName = user ? user.Ho_Ten_User : 'User';
        
        const title = document.getElementById('chatbox-title');
        if (title) {
            title.textContent = `💬 Chat với ${userName}`;
        }
        
        this.showChatView();
        this.loadMessages();
        this.startPolling();
    }

    showUserList() {
        this.currentToUser = null;
        const userList = document.getElementById('chatbox-user-list');
        const messages = document.getElementById('chatbox-messages');
        const inputArea = document.querySelector('.chatbox-input-area');
        const backBtn = document.getElementById('chatbox-back');
        const title = document.getElementById('chatbox-title');

        if (userList) userList.style.display = 'block';
        if (messages) messages.style.display = 'none';
        if (inputArea) inputArea.style.display = 'none';
        if (backBtn) backBtn.style.display = 'none';
        if (title) title.textContent = '💬 Quản lý Chat';

        this.stopPolling();
        this.loadUserList();
    }

    showChatView() {
        const userList = document.getElementById('chatbox-user-list');
        const messages = document.getElementById('chatbox-messages');
        const inputArea = document.querySelector('.chatbox-input-area');
        const backBtn = document.getElementById('chatbox-back');
        const title = document.getElementById('chatbox-title');

        if (userList) userList.style.display = 'none';
        if (messages) messages.style.display = 'flex';
        if (inputArea) inputArea.style.display = 'flex';
        if (backBtn && this.isAdmin) backBtn.style.display = 'block';
    }

    async loadMessages() {
        if (!this.currentToUser) {
            return;
        }

        try {
            const q = encodeURIComponent(this.currentToUser);
            const response = await fetch(`/api/chat/messages?toUser=${q}`, CHAT_FETCH_OPTS);
            const data = await response.json();

            if (data.success && Array.isArray(data.messages)) {
                this.renderMessages(data.messages);
            } else {
                this.renderMessages([]);
            }
        } catch (error) {
            console.error('Error loading messages:', error);
            this.renderMessages([]);
        }
    }

    isBotMessage(msg) {
        return /^\s*BOT:/i.test(msg.Message || '');
    }

    formatMessageHtml(raw) {
        let s = String(raw == null ? '' : raw).replace(/^\s*BOT:\s*/i, '');
        return this.escapeHtml(s).replace(/\r?\n/g, '<br>');
    }

    renderMessages(messages) {
        const container = document.getElementById('chatbox-messages');
        if (!container) return;

        const currentUserId = this.getCurrentUserId().trim();
        const list = Array.isArray(messages) ? messages : [];

        if (list.length === 0) {
            container.innerHTML =
                '<div class="chatbox-empty" style="padding:16px;color:#888;text-align:center;">Chưa có tin nhắn.</div>';
            container.scrollTop = 0;
            return;
        }

        container.innerHTML = list
            .map((msg) => {
                const from = (msg.From_User != null ? String(msg.From_User) : '').trim();
                const isSent = this.isAdmin
                    ? from === SHOP_CHAT_MAILBOX
                    : from === currentUserId;
                const isBot = this.isBotMessage(msg);
                const rowClass = ['chatbox-message', isSent ? 'sent' : 'received'];
                if (isBot && !isSent) rowClass.push('bot-reply');

                const time = msg.Ngay_Gui
                    ? new Date(msg.Ngay_Gui).toLocaleString('vi-VN', {
                          hour: '2-digit',
                          minute: '2-digit'
                      })
                    : '';

                const botLabel =
                    isBot && !isSent ? '<div class="chatbox-bot-label">Chatbot · gợi ý từ kho</div>' : '';

                return `
                <div class="${rowClass.join(' ')}">
                    <div class="chatbox-message-bubble">
                        ${botLabel}
                        <div class="chatbox-message-text">${this.formatMessageHtml(msg.Message)}</div>
                        ${time ? `<div class="chatbox-message-time">${time}</div>` : ''}
                    </div>
                </div>
            `;
            })
            .join('');

        container.scrollTop = container.scrollHeight;
    }

    async sendMessage() {
        const input = document.getElementById('chatbox-input');
        const message = input.value.trim();
        
        if (!message || !this.currentToUser) return;

        try {
            const response = await fetch('/api/chat/send', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                credentials: 'same-origin',
                body: JSON.stringify({ toUser: this.currentToUser, message })
            });

            const data = await response.json();
            if (data.success) {
                input.value = '';
                this.loadMessages(); // Reload messages
                this.loadUnreadCount(); // Update badge
            } else {
                alert('Lỗi: ' + data.message);
            }
        } catch (error) {
            console.error('Error sending message:', error);
            alert('Có lỗi xảy ra khi gửi tin nhắn');
        }
    }

    async loadUnreadCount() {
        try {
            const response = await fetch('/api/chat/unread', CHAT_FETCH_OPTS);
            const data = await response.json();
            
            const badge = document.getElementById('chatbox-badge');
            if (badge) {
                if (data.count > 0) {
                    badge.textContent = data.count > 99 ? '99+' : data.count;
                    badge.style.display = 'block';
                } else {
                    badge.style.display = 'none';
                }
            }
        } catch (error) {
            console.error('Error loading unread count:', error);
        }
    }

    startPolling() {
        // Poll messages every 3 seconds
        this.pollInterval = setInterval(() => {
            if (this.isOpen) {
                if (this.isAdmin && this.currentToUser) {
                    this.loadMessages();
                } else if (!this.isAdmin) {
                    this.loadMessages();
                }
            }
        }, 3000);
    }

    stopPolling() {
        if (this.pollInterval) {
            clearInterval(this.pollInterval);
            this.pollInterval = null;
        }
    }

    getCurrentUserId() {
        return this.currentUserId || '';
    }

    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }
}

// Khởi tạo chatbox khi DOM ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        new ChatboxWidget();
    });
} else {
    new ChatboxWidget();
}
