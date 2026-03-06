import { useState, useCallback } from 'react';
import {
    Copy,
    Edit3,
    Trash2,
    Pin,
    ChevronDown,
    ChevronUp,
} from 'lucide-react';
import type { LibraryItem } from '@/types';

interface RecentDraftsProps {
    items: LibraryItem[];
    onDelete: (id: string) => void;
    onLoad: (item: LibraryItem) => void;
    onCopy: (item: LibraryItem) => void;
    onTogglePin: (id: string) => void;
}

export function RecentDrafts({
    items,
    onDelete,
    onLoad,
    onCopy,
    onTogglePin,
}: RecentDraftsProps) {
    const [isExpanded, setIsExpanded] = useState<boolean>(true);
    const [copiedId, setCopiedId] = useState<string | null>(null);

    const handleCopy = useCallback(
        (item: LibraryItem) => {
            onCopy(item);
            setCopiedId(item.id);
            setTimeout(() => setCopiedId(null), 1500);
        },
        [onCopy]
    );

    return (
        <section className="px-5 py-4">
            <button
                onClick={() => setIsExpanded((prev) => !prev)}
                className="flex items-center justify-between w-full mb-3 outline-none focus:outline-none focus-visible:outline-none"
            >
                <p className="text-xs font-semibold uppercase tracking-widest text-slate-700 dark:text-zinc-300">
                    Recent Drafts
                </p>
                {isExpanded ? (
                    <ChevronUp className="w-4 h-4 text-slate-500 dark:text-zinc-400" />
                ) : (
                    <ChevronDown className="w-4 h-4 text-slate-500 dark:text-zinc-400" />
                )}
            </button>

            <div
                className={`transition-all duration-200 overflow-hidden ${isExpanded ? 'max-h-[2000px] opacity-100' : 'max-h-0 opacity-0'
                    }`}
            >
                {items.length === 0 ? (
                    <p className="text-slate-500 dark:text-zinc-400 text-sm text-center py-2">
                        No recent drafts yet.
                    </p>
                ) : (
                    <div className="flex flex-col">
                        {items.map((item) => (
                            <div
                                key={item.id}
                                className="group bg-white dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded-lg p-4 relative hover:shadow-md dark:hover:shadow-zinc-900/50 transition-shadow cursor-pointer mb-2"
                            >
                                {/* Copied toast overlay */}
                                {copiedId === item.id && (
                                    <div className="absolute inset-0 flex items-center justify-center bg-green-50 dark:bg-green-900/30 text-green-600 dark:text-green-400 text-xs font-medium rounded-lg">
                                        Copied!
                                    </div>
                                )}
                                {/* Action buttons — top-right corner */}
                                <div className="absolute top-2 right-2 flex gap-1">
                                    {/* Pin button — always visible when pinned, hover-only when not */}
                                    <div
                                        className={`transition-opacity ${item.pinned
                                            ? 'opacity-100'
                                            : 'opacity-0 group-hover:opacity-100'
                                            }`}
                                    >
                                        <button
                                            onClick={() => onTogglePin(item.id)}
                                            className={`p-1 rounded-md transition-colors outline-none focus:outline-none focus-visible:outline-none ${item.pinned
                                                ? 'text-slate-700 dark:text-zinc-200'
                                                : 'text-slate-300 hover:text-slate-600 dark:text-zinc-500 dark:hover:text-zinc-300'
                                                }`}
                                            title={item.pinned ? 'Unpin' : 'Pin'}
                                        >
                                            <Pin
                                                className="w-3.5 h-3.5"
                                                fill={item.pinned ? 'currentColor' : 'none'}
                                                stroke="currentColor"
                                                strokeWidth={2}
                                            />
                                        </button>
                                    </div>
                                    {/* Copy, Load, Delete — hover only */}
                                    <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <button
                                            onClick={() => handleCopy(item)}
                                            className="p-1 rounded-md text-slate-500 hover:text-slate-700 hover:bg-slate-100 dark:text-zinc-400 dark:hover:text-zinc-200 dark:hover:bg-zinc-700 transition-colors outline-none focus:outline-none focus-visible:outline-none"
                                            title="Copy to clipboard"
                                        >
                                            <Copy className="w-3.5 h-3.5" />
                                        </button>
                                        <button
                                            onClick={() => onLoad(item)}
                                            className="p-1 rounded-md text-slate-500 hover:text-slate-700 hover:bg-slate-100 dark:text-zinc-400 dark:hover:text-zinc-200 dark:hover:bg-zinc-700 transition-colors outline-none focus:outline-none focus-visible:outline-none"
                                            title="Load into draft"
                                        >
                                            <Edit3 className="w-3.5 h-3.5" />
                                        </button>
                                        <button
                                            onClick={() => onDelete(item.id)}
                                            className="p-1 rounded-md text-red-400 hover:text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:text-red-300 dark:hover:bg-red-900/30 transition-colors outline-none focus:outline-none focus-visible:outline-none"
                                            title="Delete"
                                        >
                                            <Trash2 className="w-3.5 h-3.5" />
                                        </button>
                                    </div>
                                </div>
                                {/* Title */}
                                <h4 className="text-slate-900 dark:text-zinc-100 font-semibold text-sm pr-24">
                                    {item.title ? (
                                        item.title
                                    ) : (
                                        <span className="text-slate-500 dark:text-zinc-400 italic">
                                            Untitled
                                        </span>
                                    )}
                                </h4>
                                {/* Description */}
                                {item.description && (
                                    <p className="text-slate-500 dark:text-zinc-300 text-xs mt-0.5 line-clamp-2">
                                        {item.description}
                                    </p>
                                )}
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </section>
    );
}
