import { gmailService } from '../services/chatService';
import { useAuth } from '../context/AuthContext';
import { Mail, Shield, Trash2, RefreshCw, Bot } from 'lucide-react';
import toast from 'react-hot-toast';
import { useState } from 'react';

const BANK_SENDERS = [
    'alerts@hdfcbank.net', 'alerts@icicibank.com', 'alerts@axisbank.com',
    'noreply@kotakbank.com', 'alerts@sbicard.com', 'info@indusind.com',
    'do_not_reply@yesbank.in',
];

export const SettingsPage = () => {
    const { user, logout } = useAuth();
    const [syncing, setSyncing] = useState(false);

    const handleSync = async () => {
        setSyncing(true);
        try {
            const result = await gmailService.syncGmail();
            toast.success(`Synced ${result.newTransactions} new transactions!`);
        } catch {
            toast.error('Sync failed');
        } finally {
            setSyncing(false);
        }
    };

    return (
        <div className="max-w-2xl space-y-5">
            <div>
                <h1 className="text-2xl font-bold text-white">Settings</h1>
                <p className="text-sm text-gray-400 mt-0.5">Manage your account and integrations</p>
            </div>

            {/* Profile */}
            <div className="bg-gray-900 border border-gray-800 rounded-2xl p-5">
                <h2 className="text-sm font-semibold text-white mb-4 flex items-center gap-2">
                    <Shield size={16} className="text-emerald-400" /> Account
                </h2>
                <div className="flex items-center gap-4">
                    {user?.pictureUrl ? (
                        <img src={user.pictureUrl} alt={user.name} className="w-14 h-14 rounded-full border-2 border-gray-700" />
                    ) : (
                        <div className="w-14 h-14 bg-emerald-500 rounded-full flex items-center justify-center text-xl font-bold text-gray-950">
                            {user?.name?.[0]?.toUpperCase()}
                        </div>
                    )}
                    <div>
                        <p className="font-semibold text-white">{user?.name}</p>
                        <p className="text-sm text-gray-400">{user?.email}</p>
                        <span className="text-xs bg-emerald-500/15 text-emerald-400 border border-emerald-500/20 px-2 py-0.5 rounded-full mt-1 inline-block">
                            Google Connected
                        </span>
                    </div>
                </div>
                <div className="mt-5 pt-4 border-t border-gray-800">
                    <button onClick={logout}
                        className="flex items-center gap-2 text-sm text-red-400 hover:text-red-300 transition-colors">
                        <Trash2 size={14} />
                        Sign out of account
                    </button>
                </div>
            </div>

            {/* Gmail Integration */}
            <div className="bg-gray-900 border border-gray-800 rounded-2xl p-5">
                <h2 className="text-sm font-semibold text-white mb-4 flex items-center gap-2">
                    <Mail size={16} className="text-indigo-400" /> Gmail Integration
                </h2>
                <p className="text-xs text-gray-500 mb-3">
                    FinTrack monitors emails from these senders to detect bank and credit card transactions:
                </p>
                <div className="flex flex-wrap gap-2 mb-4">
                    {BANK_SENDERS.map(sender => (
                        <span key={sender} className="text-xs bg-gray-800 text-gray-400 border border-gray-700 px-2.5 py-1 rounded-full">
                            {sender}
                        </span>
                    ))}
                </div>
                <button onClick={handleSync} disabled={syncing}
                    className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white rounded-xl text-sm font-medium transition-all">
                    <RefreshCw size={14} className={syncing ? 'animate-spin' : ''} />
                    {syncing ? 'Syncing…' : 'Sync Gmail Now'}
                </button>
            </div>

            {/* AI */}
            <div className="bg-gray-900 border border-gray-800 rounded-2xl p-5">
                <h2 className="text-sm font-semibold text-white mb-3 flex items-center gap-2">
                    <Bot size={16} className="text-amber-400" /> AI Features
                </h2>
                <div className="space-y-2 text-xs text-gray-400">
                    <div className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-emerald-400 rounded-full"></div>
                        <span><span className="text-white font-medium">Transaction Extraction</span> — Gemini AI reads bank emails and extracts structured data</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-emerald-400 rounded-full"></div>
                        <span><span className="text-white font-medium">Finance Chatbot</span> — Gemini 2.0 Flash with your transaction context</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-emerald-400 rounded-full"></div>
                        <span><span className="text-white font-medium">Auto-Categorization</span> — AI assigns categories (Food, Travel, Shopping, etc.)</span>
                    </div>
                </div>
                <div className="mt-4 p-3 bg-amber-500/5 border border-amber-500/15 rounded-xl">
                    <p className="text-xs text-amber-400">
                        <strong>API Used:</strong> Google Gemini API (gemini-2.0-flash) — add your key in <code>application.yml</code>
                    </p>
                </div>
            </div>
        </div>
    );
};
