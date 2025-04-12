export default function HomePage() {
    return (
        <div className="flex min-h-svh flex-col items-center justify-center p-6 md:p-10">
            <div className="w-full max-w-sm md:max-w-3xl">
                <h1 className="text-2xl font-bold">Welcome to Finance Tracker</h1>
                <p className="text-muted-foreground text-balance">
                    Track your finances effortlessly.
                </p>
            </div>
        </div>
    );
}