import api from './api';
import { Transaction, TransactionFilters, CreateTransactionRequest } from '../types';

export const transactionService = {
    async getTransactions(filters: TransactionFilters = {}, page = 0, size = 20) {
        const params = new URLSearchParams();
        if (filters.startDate) params.append('startDate', filters.startDate);
        if (filters.endDate) params.append('endDate', filters.endDate);
        if (filters.category) params.append('category', filters.category);
        if (filters.type) params.append('type', filters.type);
        if (filters.search) params.append('search', filters.search);
        params.append('page', String(page));
        params.append('size', String(size));
        const res = await api.get(`/api/transactions?${params.toString()}`);
        return res.data;
    },

    async createTransaction(data: CreateTransactionRequest): Promise<Transaction> {
        const res = await api.post('/api/transactions', data);
        return res.data;
    },

    async updateTransaction(id: string, data: CreateTransactionRequest): Promise<Transaction> {
        const res = await api.put(`/api/transactions/${id}`, data);
        return res.data;
    },

    async deleteTransaction(id: string): Promise<void> {
        await api.delete(`/api/transactions/${id}`);
    },
};
