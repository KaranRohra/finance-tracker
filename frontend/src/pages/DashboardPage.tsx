import { useState, useEffect } from 'react';
import {
    AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell,
    XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend
} from 'recharts';
import { TrendingDown, TrendingUp, PiggyBank, Activity, RefreshCw, Plus } from 'lucide-react';
import toast from 'react-hot-toast';
import { analyticsService } from '../services/analyticsService';
import { gmailService } from '../services/chatService';
import { TransactionModal } from '../components/TransactionModal';
import { DashboardSummary, CategoryBreakdown, MonthlyTrend, TopMerchant } from '../types';

const COLORS = ['#10b981', '#6366f1', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4', '#f97316', '#84cc16', '#ec4899', '#64748b'];

const MONTH_NAMES = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

export const DashboardPage = () => {
    const [summary, setSummary] = useState<DashboardSummary | null>(null);
    const [categories, setCategories] = useState<CategoryBreakdown[]>([]);
    const [trend, setTrend] = useState<MonthlyTrend[]>([]);
    const [merchants, setMerchants] = useState<TopMerchant[]>([]);
    const [loading, setLoading] = useState(true);
    const [syncing, setSyncing] = useState(false);
    const [showAddModal, setShowAddModal] = useState(false);

    const fetchData = async () => {
        setLoading(true);
        try {
            const [s, c, t, m] = await Promise.all([
                analyticsService.getSummary(),
                analyticsService.getCategoryBreakdown(),
                analyticsService.getMonthlyTrend(6),
                analyticsService.getTopMerchants(),
            ]);
            setSummary(s);
            setCategories(c);
            setTrend(t);
            setMerchants(m);
        } catch {
            toast.error('Failed to load dashboard data');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchData(); }, []);

    const handleGmailSync = async () => {
        setSyncing(true);
        try {
            const result = await gmailService.syncGmail();
            toast.success(`Synced ${result.newTransactions} new transactions!`);
            fetchData();
        } catch {
            toast.error('Gmail sync failed. Try re-logging in.');
        } finally {
            setSyncing(false);
        }
    };

    const trendData = trend.map(t => ({
        name: MONTH_NAMES[t.month - 1],
        Spent: Number(t.totalDebit),
        Income: Number(t.totalCredit),
    }));

    const merchantData = merchants.map(m => ({
        name: m.merchant?.length > 15 ? m.merchant.slice(0, 15) + '…' : m.merchant,
        amount: Number(m.total),
    }));

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-emerald-400"></div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-white">Dashboard</h1>
                    <p className="text-sm text-gray-400 mt-0.5">{summary?.month}</p>
                </div>
                <div className="flex gap-3">
                    <button
                        onClick={handleGmailSync}
                        disabled={syncing}
                        className="flex items-center gap-2 px-4 py-2 bg-gray-800 hover:bg-gray-700 text-gray-300 rounded-xl text-sm font-medium transition-all disabled:opacity-50"
                    >
                        <RefreshCw size={15} className={syncing ? 'animate-spin' : ''} />
                        {syncing ? 'Syncing…' : 'Sync Gmail'}
                    </button>
                    <button
                        onClick={() => setShowAddModal(true)}
                        className="flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-sm font-medium transition-all"
                    >
                        <Plus size={15} />
                        Add Transaction
                    </button>
                </div>
            </div>

            {/* Summary Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
                <SummaryCard
                    title="Total Spent"
                    value={`₹${(summary?.totalDebit ?? 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}`}
                    icon={<TrendingDown size={20} className="text-red-400" />}
                    color="red"
                />
                <SummaryCard
                    title="Total Income"
                    value={`₹${(summary?.totalCredit ?? 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}`}
                    icon={<TrendingUp size={20} className="text-emerald-400" />}
                    color="emerald"
                />
                <SummaryCard
                    title="Net Savings"
                    value={`₹${(summary?.netSavings ?? 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}`}
                    icon={<PiggyBank size={20} className="text-indigo-400" />}
                    color="indigo"
                    negative={(summary?.netSavings ?? 0) < 0}
                />
                <SummaryCard
                    title="Transactions"
                    value={String(summary?.transactionCount ?? 0)}
                    icon={<Activity size={20} className="text-amber-400" />}
                    color="amber"
                />
            </div>

            {/* Charts Row */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                {/* Trend Chart */}
                <div className="lg:col-span-2 bg-gray-900 border border-gray-800 rounded-2xl p-5">
                    <h3 className="text-sm font-semibold text-white mb-4">Spending vs Income (Last 6 Months)</h3>
                    {trendData.length === 0 ? (
                        <EmptyChart message="No data yet. Add transactions or sync Gmail." />
                    ) : (
                        <ResponsiveContainer width="100%" height={220}>
                            <AreaChart data={trendData}>
                                <defs>
                                    <linearGradient id="spentGrad" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#ef4444" stopOpacity={0.3} />
                                        <stop offset="95%" stopColor="#ef4444" stopOpacity={0} />
                                    </linearGradient>
                                    <linearGradient id="incomeGrad" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                                        <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" />
                                <XAxis dataKey="name" tick={{ fill: '#6b7280', fontSize: 12 }} />
                                <YAxis tick={{ fill: '#6b7280', fontSize: 12 }} tickFormatter={(v) => `₹${(v / 1000).toFixed(0)}k`} />
                                <Tooltip
                                    contentStyle={{ background: '#1f2937', border: '1px solid #374151', borderRadius: 8, color: '#f9fafb' }}
                                    formatter={(v: any) => [`₹${v.toLocaleString('en-IN')}`, '']}
                                />
                                <Legend wrapperStyle={{ color: '#9ca3af', fontSize: 12 }} />
                                <Area type="monotone" dataKey="Spent" stroke="#ef4444" fill="url(#spentGrad)" strokeWidth={2} />
                                <Area type="monotone" dataKey="Income" stroke="#10b981" fill="url(#incomeGrad)" strokeWidth={2} />
                            </AreaChart>
                        </ResponsiveContainer>
                    )}
                </div>

                {/* Category Pie */}
                <div className="bg-gray-900 border border-gray-800 rounded-2xl p-5">
                    <h3 className="text-sm font-semibold text-white mb-4">Spending by Category</h3>
                    {categories.length === 0 ? (
                        <EmptyChart message="No spending data yet." />
                    ) : (
                        <>
                            <ResponsiveContainer width="100%" height={160}>
                                <PieChart>
                                    <Pie data={categories} cx="50%" cy="50%" innerRadius={45} outerRadius={70}
                                        dataKey="total" nameKey="category" paddingAngle={2}>
                                        {categories.map((_, idx) => (
                                            <Cell key={idx} fill={COLORS[idx % COLORS.length]} />
                                        ))}
                                    </Pie>
                                    <Tooltip
                                        contentStyle={{ background: '#1f2937', border: '1px solid #374151', borderRadius: 8, color: '#f9fafb' }}
                                        formatter={(v: any) => [`₹${v.toLocaleString('en-IN')}`, '']}
                                    />
                                </PieChart>
                            </ResponsiveContainer>
                            <div className="space-y-1.5 mt-2">
                                {categories.slice(0, 5).map((c, idx) => (
                                    <div key={c.category} className="flex items-center justify-between text-xs">
                                        <div className="flex items-center gap-2">
                                            <span className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ background: COLORS[idx % COLORS.length] }} />
                                            <span className="text-gray-400">{c.category}</span>
                                        </div>
                                        <span className="text-gray-300 font-medium">{c.percentage}%</span>
                                    </div>
                                ))}
                            </div>
                        </>
                    )}
                </div>
            </div>

            {/* Top Merchants */}
            <div className="bg-gray-900 border border-gray-800 rounded-2xl p-5">
                <h3 className="text-sm font-semibold text-white mb-4">Top Merchants (This Month)</h3>
                {merchantData.length === 0 ? (
                    <EmptyChart message="No merchant data yet." />
                ) : (
                    <ResponsiveContainer width="100%" height={200}>
                        <BarChart data={merchantData} layout="vertical">
                            <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" horizontal={false} />
                            <XAxis type="number" tick={{ fill: '#6b7280', fontSize: 12 }} tickFormatter={(v) => `₹${v.toLocaleString('en-IN')}`} />
                            <YAxis type="category" dataKey="name" tick={{ fill: '#9ca3af', fontSize: 12 }} width={100} />
                            <Tooltip
                                contentStyle={{ background: '#1f2937', border: '1px solid #374151', borderRadius: 8, color: '#f9fafb' }}
                                formatter={(v: any) => [`₹${v.toLocaleString('en-IN')}`, 'Spent']}
                            />
                            <Bar dataKey="amount" fill="#6366f1" radius={[0, 4, 4, 0]} />
                        </BarChart>
                    </ResponsiveContainer>
                )}
            </div>

            {showAddModal && (
                <TransactionModal onClose={() => setShowAddModal(false)} onSaved={fetchData} />
            )}
        </div>
    );
};

const SummaryCard = ({ title, value, icon, color, negative }: {
    title: string; value: string; icon: React.ReactNode; color: string; negative?: boolean;
}) => {
    const borderColors: Record<string, string> = {
        red: 'border-red-500/20',
        emerald: 'border-emerald-500/20',
        indigo: 'border-indigo-500/20',
        amber: 'border-amber-500/20',
    };
    const bgColors: Record<string, string> = {
        red: 'bg-red-500/10',
        emerald: 'bg-emerald-500/10',
        indigo: 'bg-indigo-500/10',
        amber: 'bg-amber-500/10',
    };

    return (
        <div className={`bg-gray-900 border ${borderColors[color]} rounded-2xl p-5`}>
            <div className="flex items-center justify-between mb-3">
                <span className="text-xs text-gray-400 font-medium">{title}</span>
                <div className={`w-8 h-8 ${bgColors[color]} rounded-xl flex items-center justify-center`}>
                    {icon}
                </div>
            </div>
            <div className={`text-xl font-bold ${negative ? 'text-red-400' : 'text-white'}`}>{value}</div>
        </div>
    );
};

const EmptyChart = ({ message }: { message: string }) => (
    <div className="flex items-center justify-center h-40 text-gray-600 text-sm">{message}</div>
);
