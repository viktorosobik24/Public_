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
                className="flex items-center justify-between w-full mb-3"
            >
                <p className="text-xs font-semibold uppercase tracking-widest text-slate-400">
                    Recent Drafts
                </p>
                {isExpanded ? (
                    <ChevronUp className="w-4 h-4 text-slate-400" />
                ) : (
                    <ChevronDown className="w-4 h-4 text-slate-400" />
                )}
            </button>

            <div
                className={`transition-all duration-200 overflow-hidden ${isExpanded ? 'max-h-[2000px] opacity-100' : 'max-h-0 opacity-0'
                    }`}
            >
                {items.length === 0 ? (
                    <p className="text-slate-400 text-sm text-center py-2">
                        No recent drafts yet.
                    </p>
                ) : (
                    <div className="flex flex-col">
                        {items.map((item) => (
                            <div
                                key={item.id}
                                className="group bg-white border border-slate-200 rounded-lg p-4 relative hover:shadow-md transition-shadow cursor-pointer mb-2"
                            >
                                {/* Copied toast overlay */}
                                {copiedId === item.id && (
                                    <div className="absolute inset-0 flex items-center justify-center bg-green-50 text-green-600 text-xs font-medium rounded-lg">
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
                                            className={`p-1 rounded-md transition-colors ${item.pinned
                                                    ? 'text-slate-600'
                                                    : 'text-slate-300 hover:text-slate-600'
                                                }`}
                                            title={item.pinned ? 'Unpin' : 'Pin'}
                                        >
                                            {item.pinned ? (
                                                <Pin
                                                    className="w-3.5 h-3.5"
                                                    fill="currentColor"
                                                    stroke="none"
                                                />
                                            ) : (
                                                <Pin
                                                    className="w-3.5 h-3.5"
                                                    fill="none"
                                                    stroke="currentColor"
                                                />
                                            )}
                                        </button>
                                    </div>
                                    {/* Copy, Load, Delete — hover only */}
                                    <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <button
                                            onClick={() => handleCopy(item)}
                                            className="p-1 rounded-md text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
                                            title="Copy to clipboard"
                                        >
                                            <Copy className="w-3.5 h-3.5" />
                                        </button>
                                        <button
                                            onClick={() => onLoad(item)}
                                            className="p-1 rounded-md text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
                                            title="Load into draft"
                                        >
                                            <Edit3 className="w-3.5 h-3.5" />
                                        </button>
                                        <button
                                            onClick={() => onDelete(item.id)}
                                            className="p-1 rounded-md text-red-400 hover:text-red-600 hover:bg-red-50 transition-colors"
                                            title="Delete"
                                        >
                                            <Trash2 className="w-3.5 h-3.5" />
                                        </button>
                                    </div>
                                </div>
                                {/* Title — no inline pin icon */}
                                <h4 className="text-slate-800 font-semibold text-sm pr-24">
                                    {item.title ? (
                                        item.title
                                    ) : (
                                        <span className="text-slate-400 italic">
                                            Untitled
                                        </span>
                                    )}
                                </h4>
                                {/* Description */}
                                {item.description && (
                                    <p className="text-slate-400 text-xs mt-0.5 line-clamp-2">
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
