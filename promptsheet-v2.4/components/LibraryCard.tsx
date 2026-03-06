import { useState } from 'react';
import { Copy, Trash2, Edit3 } from 'lucide-react';
import type { LibraryItem } from '@/types';

interface LibraryCardProps {
    item: LibraryItem;
    onDelete: (id: string) => void;
    onLoad: (item: LibraryItem) => void;
    onCopy: (item: LibraryItem) => void;
}

export function LibraryCard({ item, onDelete, onLoad, onCopy }: LibraryCardProps) {
    const [copied, setCopied] = useState<boolean>(false);

    const handleCopy = () => {
        onCopy(item);
        setCopied(true);
        setTimeout(() => setCopied(false), 1500);
    };

    return (
        <div className="group bg-white dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded-lg p-4 hover:shadow-md dark:hover:shadow-zinc-900/50 transition-shadow relative">
            <div className="absolute top-3 right-3 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <button
                    onClick={() => onLoad(item)}
                    className="p-1.5 rounded-md text-slate-500 hover:text-slate-700 hover:bg-slate-100 dark:text-zinc-400 dark:hover:text-zinc-200 dark:hover:bg-zinc-700 transition-colors outline-none focus:outline-none focus-visible:outline-none"
                    title="Load into draft"
                >
                    <Edit3 className="w-3.5 h-3.5" />
                </button>
                <button
                    onClick={handleCopy}
                    className="p-1.5 rounded-md text-slate-500 hover:text-slate-700 hover:bg-slate-100 dark:text-zinc-400 dark:hover:text-zinc-200 dark:hover:bg-zinc-700 transition-colors outline-none focus:outline-none focus-visible:outline-none"
                    title="Copy to clipboard"
                >
                    <Copy className="w-3.5 h-3.5" />
                </button>
                <button
                    onClick={() => onDelete(item.id)}
                    className="p-1.5 rounded-md text-red-400 hover:text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:text-red-300 dark:hover:bg-red-900/30 transition-colors outline-none focus:outline-none focus-visible:outline-none"
                    title="Delete"
                >
                    <Trash2 className="w-3.5 h-3.5" />
                </button>
            </div>
            <h3 className="text-sm font-semibold text-slate-900 dark:text-zinc-100 pr-20">
                {item.title}
            </h3>
            {item.description && (
                <p className="text-slate-500 dark:text-zinc-300 text-sm mt-1 line-clamp-2">
                    {item.description}
                </p>
            )}
        </div>
    );
}
