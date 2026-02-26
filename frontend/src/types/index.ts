export interface User {
    id: string;
    email: string;
    name: string;
    pictureUrl: string;
}

export interface Transaction {
    id: string;
    amount: number;
    currency: string;
    category: string;
    merchant: string;
    description: string;
    transactionDate: string;
    source: 'GMAIL' | 'MANUAL';
    type: 'DEBIT' | 'CREDIT';
    accountType: 'BANK' | 'CREDIT_CARD';
    bankName: string;
}

export interface TransactionFilters {
    startDate?: string;
    endDate?: string;
    category?: string;
    type?: string;
    search?: string;
}

export interface CreateTransactionRequest {
    amount: number;
    currency?: string;
    category?: string;
    merchant?: string;
    description?: string;
    transactionDate: string;
    type: 'DEBIT' | 'CREDIT';
    accountType?: 'BANK' | 'CREDIT_CARD';
    bankName?: string;
}

export interface DashboardSummary {
    totalDebit: number;
    totalCredit: number;
    netSavings: number;
    transactionCount: number;
    month: string;
}

export interface CategoryBreakdown {
    category: string;
    total: number;
    percentage: number;
    count: number;
}

export interface MonthlyTrend {
    year: number;
    month: number;
    totalDebit: number;
    totalCredit: number;
}

export interface TopMerchant {
    merchant: string;
    total: number;
}

export interface ChatMessage {
    id: string;
    role: 'user' | 'assistant';
    content: string;
    createdAt: string;
}

export const CATEGORIES = [
    'Food', 'Travel', 'Shopping', 'Entertainment', 'Healthcare',
    'Utilities', 'Education', 'Investment', 'Salary', 'Other'
];
