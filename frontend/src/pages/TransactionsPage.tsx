import { useState, useEffect, useRef } from 'react';
import { Plus, Search, Trash2, Edit2, RefreshCw, ChevronLeft, ChevronRight } from 'lucide-react';
import toast from 'react-hot-toast';
import { transactionService } from '../services/transactionService';
import { gmailService } from '../services/chatService';
import { TransactionModal } from '../components/TransactionModal';
import { Transaction, CATEGORIES } from '../types';

export const TransactionsPage = () => {
    const [transactions, setTransactions] = useState<Transaction[]>([]);
    const [totalPages, setTotalPages] = useState(0);
    const [page, setPage] = useState(0);
    const [loading, setLoading] = useState(false);
    const [syncing, setSyncing] = useState(false);
    const [showModal, setShowModal] = useState(false);
    const [editTx, setEditTx] = useState<Transaction | undefined>();

    // Filters
    const [search, setSearch] = useState('');
    const [type, setType] = useState('');
    const [category, setCategory] = useState('');
    const searchTimeout = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

    const fetchTransactions = async (p = page) => {
        setLoading(true);
        try {
            const data = await transactionService.getTransactions(
                { search: search || undefined, type: type || undefined, category: category || undefined },
                p, 15
            );
            setTransactions(data.content);
            setTotalPages(data.totalPages);
        } catch {
            toast.error('Failed to load transactions');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        searchTimeout.current && clearTimeout(searchTimeout.current);
        searchTimeout.current = setTimeout(() => {
            setPage(0);
            fetchTransactions(0);
        }, 400);
        return () => clearTimeout(searchTimeout.current);
    }, [search, type, category]);

    useEffect(() => { fetchTransactions(); }, [page]);

    const handleDelete = async (id: string) => {
        if (!confirm('Delete this transaction?')) return;
        try {
            await transactionService.deleteTransaction(id);
            toast.success('Deleted');
            fetchTransactions();
        } catch {
            toast.error('Failed to delete');
        }
    };

    const handleGmailSync = async () => {
        setSyncing(true);
        try {
            const result = await gmailService.syncGmail();
            toast.success(`Synced ${result.newTransactions} new transactions!`);
            fetchTransactions();
        } catch {
            toast.error('Gmail sync failed');
        } finally {
            setSyncing(false);
        }
    };

    const openAdd = () => { setEditTx(undefined); setShowModal(true); };
    const openEdit = (tx: Transaction) => { setEditTx(tx); setShowModal(true); };

    return (
        <div className="space-y-5">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-white">Transactions</h1>
                    <p className="text-sm text-gray-400 mt-0.5">Manage all your financial transactions</p>
                </div>
                <div className="flex gap-3">
                    <button onClick={handleGmailSync} disabled={syncing}
                        className="flex items-center gap-2 px-4 py-2 bg-gray-800 hover:bg-gray-700 text-gray-300 rounded-xl text-sm font-medium transition-all disabled:opacity-50">
                        <RefreshCw size={15} className={syncing ? 'animate-spin' : ''} />
                        {syncing ? 'Syncing…' : 'Sync Gmail'}
                    </button>
                    <button onClick={openAdd}
                        className="flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-sm font-medium transition-all">
                        <Plus size={15} /> Add
                    </button>
                </div>
            </div>

            {/* Filters */}
            <div className="flex flex-wrap gap-3">
                <div className="relative flex-1 min-w-48">
                    <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
                    <input value={search} onChange={e => setSearch(e.target.value)}
                        placeholder="Search merchant, description…"
                        className="input-field pl-9 w-full" />
                </div>
                <select value={type} onChange={e => setType(e.target.value)} className="input-field min-w-36">
                    <option value="">All Types</option>
                    <option value="DEBIT">Debit</option>
                    <option value="CREDIT">Credit</option>
                </select>
                <select value={category} onChange={e => setCategory(e.target.value)} className="input-field min-w-36">
                    <option value="">All Categories</option>
                    {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
            </div>

            {/* Table */}
            <div className="bg-gray-900 border border-gray-800 rounded-2xl overflow-hidden">
                {loading ? (
                    <div className="flex items-center justify-center h-40">
                        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-emerald-400"></div>
                    </div>
                ) : transactions.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-40 text-gray-600 gap-2">
                        <p className="text-sm">No transactions found</p>
                        <button onClick={openAdd} className="text-xs text-emerald-400 hover:underline">Add your first transaction</button>
                    </div>
                ) : (
                    <table className="w-full text-sm">
                        <thead>
                            <tr className="border-b border-gray-800 text-xs text-gray-500">
                                <th className="text-left px-5 py-3.5 font-medium">Date</th>
                                <th className="text-left px-4 py-3.5 font-medium">Merchant</th>
                                <th className="text-left px-4 py-3.5 font-medium">Category</th>
                                <th className="text-left px-4 py-3.5 font-medium">Source</th>
                                <th className="text-right px-4 py-3.5 font-medium">Amount</th>
                                <th className="text-center px-4 py-3.5 font-medium">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-800/50">
                            {transactions.map(tx => (
                                <tr key={tx.id} className="hover:bg-gray-800/30 transition-colors">
                                    <td className="px-5 py-3.5 text-gray-400">{tx.transactionDate}</td>
                                    <td className="px-4 py-3.5">
                                        <div className="text-gray-200 font-medium">{tx.merchant || '—'}</div>
                                        {tx.description && <div className="text-xs text-gray-500 truncate max-w-40">{tx.description}</div>}
                                    </td>
                                    <td className="px-4 py-3.5">
                                        <span className="text-xs bg-gray-800 text-gray-300 px-2 py-0.5 rounded-full">
                                            {tx.category || 'Uncategorized'}
                                        </span>
                                    </td>
                                    <td className="px-4 py-3.5">
                                        <span className={`text-xs px-2 py-0.5 rounded-full ${tx.source === 'GMAIL' ? 'bg-indigo-500/15 text-indigo-400' : 'bg-gray-800 text-gray-400'
                                            }`}>{tx.source}</span>
                                    </td>
                                    <td className={`px-4 py-3.5 text-right font-semibold ${tx.type === 'DEBIT' ? 'text-red-400' : 'text-emerald-400'}`}>
                                        {tx.type === 'DEBIT' ? '-' : '+'}₹{Number(tx.amount).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                                    </td>
                                    <td className="px-4 py-3.5">
                                        <div className="flex items-center justify-center gap-2">
                                            <button onClick={() => openEdit(tx)} className="p-1.5 rounded-lg text-gray-500 hover:text-gray-300 hover:bg-gray-700 transition-all">
                                                <Edit2 size={14} />
                                            </button>
                                            <button onClick={() => handleDelete(tx.id)} className="p-1.5 rounded-lg text-gray-500 hover:text-red-400 hover:bg-red-500/10 transition-all">
                                                <Trash2 size={14} />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
                <div className="flex items-center justify-center gap-3">
                    <button disabled={page === 0} onClick={() => setPage(p => p - 1)}
                        className="p-2 rounded-xl bg-gray-800 text-gray-400 hover:text-white disabled:opacity-40 transition-all">
                        <ChevronLeft size={16} />
                    </button>
                    <span className="text-sm text-gray-400">Page {page + 1} of {totalPages}</span>
                    <button disabled={page >= totalPages - 1} onClick={() => setPage(p => p + 1)}
                        className="p-2 rounded-xl bg-gray-800 text-gray-400 hover:text-white disabled:opacity-40 transition-all">
                        <ChevronRight size={16} />
                    </button>
                </div>
            )}

            {showModal && (
                <TransactionModal
                    onClose={() => setShowModal(false)}
                    onSaved={() => fetchTransactions()}
                    editTransaction={editTx}
                />
            )}
        </div>
    );
};
