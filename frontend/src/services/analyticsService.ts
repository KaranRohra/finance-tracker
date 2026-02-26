import api from './api';

export const analyticsService = {
    async getSummary() {
        const res = await api.get('/api/analytics/summary');
        return res.data;
    },

    async getCategoryBreakdown(startDate?: string, endDate?: string) {
        const params = new URLSearchParams();
        if (startDate) params.append('startDate', startDate);
        if (endDate) params.append('endDate', endDate);
        const res = await api.get(`/api/analytics/categories?${params.toString()}`);
        return res.data;
    },

    async getMonthlyTrend(months = 6) {
        const res = await api.get(`/api/analytics/monthly-trend?months=${months}`);
        return res.data;
    },

    async getTopMerchants(startDate?: string, endDate?: string, limit = 10) {
        const params = new URLSearchParams();
        if (startDate) params.append('startDate', startDate);
        if (endDate) params.append('endDate', endDate);
        params.append('limit', String(limit));
        const res = await api.get(`/api/analytics/top-merchants?${params.toString()}`);
        return res.data;
    },
};
