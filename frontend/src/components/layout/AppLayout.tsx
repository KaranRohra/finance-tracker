import { Outlet, NavLink } from 'react-router-dom';
import {
    LayoutDashboard, ArrowLeftRight, MessageSquare, Settings, LogOut,
    TrendingUp, Wallet
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

const navItems = [
    { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
    { to: '/transactions', icon: ArrowLeftRight, label: 'Transactions' },
    { to: '/chat', icon: MessageSquare, label: 'AI Chat' },
    { to: '/settings', icon: Settings, label: 'Settings' },
];

export const AppLayout = () => {
    const { user, logout } = useAuth();

    return (
        <div className="flex min-h-screen bg-gray-950 text-gray-100">
            {/* Sidebar */}
            <aside className="w-64 bg-gray-900 border-r border-gray-800 flex flex-col fixed h-full z-10">
                {/* Logo */}
                <div className="px-6 py-5 border-b border-gray-800 flex items-center gap-3">
                    <div className="w-9 h-9 bg-emerald-500 rounded-xl flex items-center justify-center">
                        <Wallet size={20} className="text-gray-950" />
                    </div>
                    <div>
                        <h1 className="text-base font-bold text-white">FinTrack</h1>
                        <p className="text-xs text-gray-500">Finance Tracker</p>
                    </div>
                </div>

                {/* Nav */}
                <nav className="flex-1 px-3 py-4 space-y-1">
                    {navItems.map(({ to, icon: Icon, label }) => (
                        <NavLink
                            key={to}
                            to={to}
                            className={({ isActive }) =>
                                `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-150 ${isActive
                                    ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/20'
                                    : 'text-gray-400 hover:bg-gray-800 hover:text-gray-200'
                                }`
                            }
                        >
                            <Icon size={18} />
                            {label}
                        </NavLink>
                    ))}
                </nav>

                {/* User + Logout */}
                <div className="px-4 py-4 border-t border-gray-800">
                    <div className="flex items-center gap-3 mb-3 px-1">
                        {user?.pictureUrl ? (
                            <img src={user.pictureUrl} alt={user.name} className="w-8 h-8 rounded-full" />
                        ) : (
                            <div className="w-8 h-8 bg-emerald-500 rounded-full flex items-center justify-center text-xs font-bold text-gray-950">
                                {user?.name?.[0]?.toUpperCase()}
                            </div>
                        )}
                        <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-white truncate">{user?.name}</p>
                            <p className="text-xs text-gray-500 truncate">{user?.email}</p>
                        </div>
                    </div>
                    <button
                        onClick={logout}
                        className="flex items-center gap-2 w-full px-3 py-2 rounded-xl text-sm text-gray-400 hover:bg-red-500/10 hover:text-red-400 transition-all"
                    >
                        <LogOut size={16} />
                        Sign out
                    </button>
                </div>
            </aside>

            {/* Main content */}
            <main className="flex-1 ml-64 min-h-screen">
                {/* Top bar */}
                <header className="sticky top-0 z-10 bg-gray-950/80 backdrop-blur border-b border-gray-800 px-8 py-4 flex items-center justify-between">
                    <div className="flex items-center gap-2 text-sm text-gray-400">
                        <TrendingUp size={16} className="text-emerald-400" />
                        <span>Finance Overview</span>
                    </div>
                    <div className="text-xs text-gray-500">
                        {new Date().toLocaleDateString('en-IN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                    </div>
                </header>

                <div className="p-8">
                    <Outlet />
                </div>
            </main>
        </div>
    );
};
