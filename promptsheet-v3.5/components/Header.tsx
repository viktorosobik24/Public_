import { Sun, Moon } from 'lucide-react';

interface HeaderProps {
    isDarkMode: boolean;
    onToggleDarkMode: () => void;
}

export function Header({ isDarkMode, onToggleDarkMode }: HeaderProps) {
    return (
        <header className="flex items-center justify-between px-5 py-4 border-b border-slate-100 dark:border-zinc-700">
            <h1 className="text-lg font-bold tracking-tight text-slate-900 dark:text-zinc-100">
                PromptSheet
            </h1>
            <div className="flex items-center gap-1">
                <button
                    onClick={onToggleDarkMode}
                    className="p-1 rounded-md text-slate-500 hover:text-slate-700 hover:bg-slate-100 dark:text-zinc-400 dark:hover:text-zinc-200 dark:hover:bg-zinc-700 transition-colors outline-none focus:outline-none focus-visible:outline-none"
                    title={isDarkMode ? 'Switch to light mode' : 'Switch to dark mode'}
                >
                    {isDarkMode ? (
                        <Sun className="w-4 h-4" />
                    ) : (
                        <Moon className="w-4 h-4" />
                    )}
                </button>
            </div>
        </header>
    );
}
