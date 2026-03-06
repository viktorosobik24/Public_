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
        <div className="group bg-white border border-slate-200 rounded-lg p-4 hover:shadow-md transition-shadow relative">
            <div className="absolute top-3 right-3 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <button
                    onClick={() => onLoad(item)}
                    className="p-1.5 rounded-md text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
                    title="Load into draft"
                >
                    <Edit3 className="w-3.5 h-3.5" />
                </button>
                <button
                    onClick={handleCopy}
                    className="p-1.5 rounded-md text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
                    title="Copy to clipboard"
                >
                    <Copy className="w-3.5 h-3.5" />
                </button>
                <button
                    onClick={() => onDelete(item.id)}
                    className="p-1.5 rounded-md text-red-400 hover:text-red-600 hover:bg-red-50 transition-colors"
                    title="Delete"
                >
                    <Trash2 className="w-3.5 h-3.5" />
                </button>
            </div>
            <h3 className="text-sm font-semibold text-slate-800 pr-20">
                {item.title}
            </h3>
            {item.description && (
                <p className="text-slate-400 text-sm mt-1 line-clamp-2">
                    {item.description}
                </p>
            )}
        </div>
    );
}
