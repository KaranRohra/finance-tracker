import { Wallet, Shield, Zap, BarChart3 } from 'lucide-react';

export const LoginPage = () => {
    const handleGoogleLogin = () => {
        const baseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080';
        window.location.href = `${baseUrl}/oauth2/authorization/google`;
    };

    return (
        <div className="min-h-screen bg-gray-950 flex">
            {/* Left - branding */}
            <div className="hidden lg:flex lg:flex-1 bg-gradient-to-br from-gray-900 via-gray-900 to-emerald-950 flex-col items-start justify-center px-16 relative overflow-hidden">
                {/* Ambient glow */}
                <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-emerald-500/5 rounded-full blur-3xl"></div>

                <div className="relative z-10">
                    <div className="flex items-center gap-3 mb-10">
                        <div className="w-12 h-12 bg-emerald-500 rounded-2xl flex items-center justify-center shadow-lg shadow-emerald-500/30">
                            <Wallet size={24} className="text-gray-950" />
                        </div>
                        <div>
                            <h1 className="text-2xl font-bold text-white">FinTrack</h1>
                            <p className="text-sm text-emerald-400">AI-Powered Finance</p>
                        </div>
                    </div>

                    <h2 className="text-4xl font-bold text-white mb-3 leading-tight">
                        Your money,<br />fully understood.
                    </h2>
                    <p className="text-gray-400 mb-10 text-lg max-w-md">
                        Connect your Gmail, and let AI automatically track, categorize, and give you insights on every transaction.
                    </p>

                    <div className="space-y-4">
                        {[
                            { icon: Zap, title: 'Automated Gmail Sync', desc: 'AI reads your bank emails and extracts transactions' },
                            { icon: BarChart3, title: 'Smart Analytics', desc: 'Dashboard with spending trends and category breakdown' },
                            { icon: Shield, title: 'Secure Google Login', desc: 'OAuth2 — we never store your Gmail password' },
                        ].map(({ icon: Icon, title, desc }) => (
                            <div key={title} className="flex items-start gap-3">
                                <div className="w-8 h-8 bg-emerald-500/10 border border-emerald-500/20 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5">
                                    <Icon size={15} className="text-emerald-400" />
                                </div>
                                <div>
                                    <p className="text-sm font-semibold text-white">{title}</p>
                                    <p className="text-xs text-gray-500">{desc}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Right - login */}
            <div className="flex-1 flex items-center justify-center px-6 bg-gray-950">
                <div className="w-full max-w-sm">
                    <div className="flex lg:hidden items-center gap-3 mb-10 justify-center">
                        <div className="w-11 h-11 bg-emerald-500 rounded-2xl flex items-center justify-center">
                            <Wallet size={22} className="text-gray-950" />
                        </div>
                        <h1 className="text-xl font-bold text-white">FinTrack</h1>
                    </div>

                    <div className="bg-gray-900 border border-gray-800 rounded-2xl p-8 shadow-2xl">
                        <h2 className="text-xl font-bold text-white mb-1">Welcome back</h2>
                        <p className="text-sm text-gray-400 mb-8">Sign in to your account to continue</p>

                        <button
                            onClick={handleGoogleLogin}
                            id="google-signin-btn"
                            className="w-full flex items-center justify-center gap-3 bg-white hover:bg-gray-50 text-gray-900 font-medium py-3 px-4 rounded-xl transition-all duration-200 shadow-lg hover:shadow-xl active:scale-[0.98]"
                        >
                            <svg width="20" height="20" viewBox="0 0 24 24">
                                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                            </svg>
                            Sign in with Google
                        </button>

                        <p className="text-xs text-gray-600 text-center mt-6">
                            By signing in, you allow FinTrack to read your Gmail<br />
                            to extract bank transaction emails (read-only).
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};
