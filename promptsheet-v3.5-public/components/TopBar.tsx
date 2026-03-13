import { Mail, HelpCircle, Sun, Moon } from 'lucide-react';

interface TopBarProps {
    isDarkMode: boolean;
    onToggleDarkMode: () => void;
    onOpenHelp: () => void;
    onOpenMail: () => void;
}

export function TopBar({
    isDarkMode,
    onToggleDarkMode,
    onOpenHelp,
    onOpenMail,
}: TopBarProps) {
    return (
        <div className="sticky top-0 z-40 flex items-center justify-end gap-1 px-3 py-1.5 bg-white dark:bg-zinc-900 border-b border-slate-100 dark:border-zinc-700">
            <button
                onClick={onOpenMail}
                className="p-1.5 rounded-md text-slate-400 hover:text-slate-600 hover:bg-slate-100 dark:text-zinc-400 dark:hover:text-zinc-200 dark:hover:bg-zinc-700 transition-colors outline-none focus:outline-none focus-visible:outline-none"
                title="Mailing list"
            >
                <Mail className="w-4 h-4" />
            </button>
            <button
                onClick={onOpenHelp}
                className="p-1.5 rounded-md text-slate-400 hover:text-slate-600 hover:bg-slate-100 dark:text-zinc-400 dark:hover:text-zinc-200 dark:hover:bg-zinc-700 transition-colors outline-none focus:outline-none focus-visible:outline-none"
                title="Help"
            >
                <HelpCircle className="w-4 h-4" />
            </button>
            <button
                onClick={onToggleDarkMode}
                className="p-1.5 rounded-md text-slate-400 hover:text-slate-600 hover:bg-slate-100 dark:text-zinc-400 dark:hover:text-zinc-200 dark:hover:bg-zinc-700 transition-colors outline-none focus:outline-none focus-visible:outline-none"
                title={isDarkMode ? 'Switch to light mode' : 'Switch to dark mode'}
            >
                {isDarkMode ? (
                    <Sun className="w-4 h-4" />
                ) : (
                    <Moon className="w-4 h-4" />
                )}
            </button>
        </div>
    );
}
