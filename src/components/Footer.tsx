import Link from 'next/link';

export default function Footer() {
    const currentYear = new Date().getFullYear();

    return (
        <footer className="relative border-t border-slate-200 bg-white py-6">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex flex-col items-center justify-center gap-4">
                    <Link href="/" className="flex items-center gap-2 group">
                        <span className="text-xl font-display font-black text-slate-900 tracking-tight">
                            12th Grade Shabbaton
                        </span>
                    </Link>
                    <p className="text-slate-400 text-sm font-medium">
                        © {currentYear} 12th Grade Shabbaton 2026.
                    </p>
                </div>
            </div>
        </footer>
    );
}
