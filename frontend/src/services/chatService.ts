import api from './api';

export const chatService = {
    async getHistory() {
        const res = await api.get('/api/chat/history');
        return res.data;
    },

    async sendMessage(message: string) {
        const res = await api.post('/api/chat/message', { message });
        return res.data;
    },
};

export const gmailService = {
    async syncGmail() {
        const res = await api.post('/api/gmail/sync');
        return res.data;
    },
};
