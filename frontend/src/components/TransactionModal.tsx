import { useState } from 'react';
import { X } from 'lucide-react';
import toast from 'react-hot-toast';
import { transactionService } from '../services/transactionService';
import { Transaction, CreateTransactionRequest, CATEGORIES } from '../types';

interface Props {
    onClose: () => void;
    onSaved: () => void;
    editTransaction?: Transaction;
}

export const TransactionModal = ({ onClose, onSaved, editTransaction }: Props) => {
    const [form, setForm] = useState<CreateTransactionRequest>({
        amount: editTransaction?.amount ?? 0,
        currency: editTransaction?.currency ?? 'INR',
        category: editTransaction?.category ?? '',
        merchant: editTransaction?.merchant ?? '',
        description: editTransaction?.description ?? '',
        transactionDate: editTransaction?.transactionDate ?? new Date().toISOString().split('T')[0],
        type: editTransaction?.type ?? 'DEBIT',
        accountType: editTransaction?.accountType ?? 'BANK',
        bankName: editTransaction?.bankName ?? '',
    });
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!form.amount || form.amount <= 0) {
            toast.error('Enter a valid amount');
            return;
        }
        setLoading(true);
        try {
            if (editTransaction) {
                await transactionService.updateTransaction(editTransaction.id, form);
                toast.success('Transaction updated!');
            } else {
                await transactionService.createTransaction(form);
                toast.success('Transaction added!');
            }
            onSaved();
            onClose();
        } catch {
            toast.error('Failed to save transaction');
        } finally {
            setLoading(false);
        }
    };

    const set = (field: keyof CreateTransactionRequest, value: any) =>
        setForm(f => ({ ...f, [field]: value }));

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-gray-900 border border-gray-700 rounded-2xl p-6 w-full max-w-lg shadow-2xl">
                <div className="flex items-center justify-between mb-5">
                    <h2 className="text-lg font-bold text-white">
                        {editTransaction ? 'Edit Transaction' : 'Add Transaction'}
                    </h2>
                    <button onClick={onClose} className="text-gray-500 hover:text-gray-300 transition-colors">
                        <X size={20} />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                    {/* Type toggle */}
                    <div className="flex rounded-xl overflow-hidden border border-gray-700">
                        {(['DEBIT', 'CREDIT'] as const).map(t => (
                            <button key={t} type="button"
                                onClick={() => set('type', t)}
                                className={`flex-1 py-2 text-sm font-medium transition-all ${form.type === t
                                    ? t === 'DEBIT' ? 'bg-red-500/20 text-red-400' : 'bg-emerald-500/20 text-emerald-400'
                                    : 'text-gray-500 hover:text-gray-300'
                                    }`}
                            >
                                {t === 'DEBIT' ? '↓ Debit' : '↑ Credit'}
                            </button>
                        ))}
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                        <div className="col-span-2">
                            <label className="text-xs text-gray-400 mb-1 block">Amount (₹) *</label>
                            <input type="number" step="0.01" min="0" required
                                value={form.amount || ''}
                                onChange={e => set('amount', parseFloat(e.target.value) || 0)}
                                className="input-field"
                                placeholder="0.00"
                            />
                        </div>
                        <div>
                            <label className="text-xs text-gray-400 mb-1 block">Date *</label>
                            <input type="date" required
                                value={form.transactionDate}
                                onChange={e => set('transactionDate', e.target.value)}
                                className="input-field"
                            />
                        </div>
                        <div>
                            <label className="text-xs text-gray-400 mb-1 block">Category</label>
                            <select value={form.category} onChange={e => set('category', e.target.value)} className="input-field">
                                <option value="">Select category</option>
                                {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                            </select>
                        </div>
                        <div>
                            <label className="text-xs text-gray-400 mb-1 block">Merchant</label>
                            <input value={form.merchant} onChange={e => set('merchant', e.target.value)}
                                className="input-field" placeholder="Amazon, Swiggy…" />
                        </div>
                        <div>
                            <label className="text-xs text-gray-400 mb-1 block">Bank / Card</label>
                            <input value={form.bankName} onChange={e => set('bankName', e.target.value)}
                                className="input-field" placeholder="HDFC, ICICI…" />
                        </div>
                        <div>
                            <label className="text-xs text-gray-400 mb-1 block">Account Type</label>
                            <select value={form.accountType} onChange={e => set('accountType', e.target.value as any)} className="input-field">
                                <option value="BANK">Bank Account</option>
                                <option value="CREDIT_CARD">Credit Card</option>
                            </select>
                        </div>
                        <div className="col-span-2">
                            <label className="text-xs text-gray-400 mb-1 block">Description</label>
                            <input value={form.description} onChange={e => set('description', e.target.value)}
                                className="input-field" placeholder="Optional notes…" />
                        </div>
                    </div>

                    <button type="submit" disabled={loading}
                        className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white font-medium rounded-xl transition-all">
                        {loading ? 'Saving…' : editTransaction ? 'Update Transaction' : 'Add Transaction'}
                    </button>
                </form>
            </div>
        </div>
    );
};
