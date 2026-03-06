import { useState } from 'react';
import { FileText, ChevronDown, ChevronUp } from 'lucide-react';
import { LibraryCard } from './LibraryCard';
import type { LibraryItem } from '@/types';

interface LibraryProps {
    items: LibraryItem[];
    onDelete: (id: string) => void;
    onLoad: (item: LibraryItem) => void;
    onCopy: (item: LibraryItem) => void;
}

export function Library({ items, onDelete, onLoad, onCopy }: LibraryProps) {
    const [isExpanded, setIsExpanded] = useState<boolean>(true);
    const [searchQuery, setSearchQuery] = useState<string>('');

    const filteredItems = items
        .filter((item) =>
            item.title.toLowerCase().includes(searchQuery.toLowerCase())
        )
        .sort((a, b) => b.createdAt - a.createdAt);

    return (
        <section className="px-5 py-4">
            <button
                onClick={() => setIsExpanded((prev) => !prev)}
                className="flex items-center justify-between w-full mb-3"
            >
                <p className="text-xs font-semibold uppercase tracking-widest text-slate-400">
                    Library
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
                <input
                    type="text"
                    placeholder="Search prompts..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full border border-slate-200 rounded-md px-3 py-1.5 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-slate-300 mb-3"
                />

                {filteredItems.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-10 text-center">
                        <FileText className="w-8 h-8 text-slate-200 mb-3" />
                        <p className="text-sm text-slate-400">
                            {items.length === 0
                                ? 'No prompts yet.'
                                : 'No matching prompts found.'}
                        </p>
                    </div>
                ) : (
                    <div className="flex flex-col gap-2">
                        {filteredItems.map((item) => (
                            <LibraryCard
                                key={item.id}
                                item={item}
                                onDelete={onDelete}
                                onLoad={onLoad}
                                onCopy={onCopy}
                            />
                        ))}
                    </div>
                )}
            </div>
        </section>
    );
}
