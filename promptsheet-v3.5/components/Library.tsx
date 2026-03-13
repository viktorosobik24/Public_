import { useState } from 'react';
import { FileText, ChevronDown, ChevronUp, Download } from 'lucide-react';
import { LibraryCard } from './LibraryCard';
import { ExportModal } from './ExportModal';
import type { LibraryItem } from '@/types';

interface LibraryProps {
    items: LibraryItem[];
    onDelete: (id: string, title: string) => void;
    onLoad: (item: LibraryItem) => void;
    onCopy: (item: LibraryItem) => void;
}

export function Library({ items, onDelete, onLoad, onCopy }: LibraryProps) {
    const [isExpanded, setIsExpanded] = useState<boolean>(true);
    const [searchQuery, setSearchQuery] = useState<string>('');
    const [showExportModal, setShowExportModal] = useState<boolean>(false);

    const filteredItems = items
        .filter((item) =>
            item.title.toLowerCase().includes(searchQuery.toLowerCase())
        )
        .sort((a, b) => b.createdAt - a.createdAt);

    return (
        <section className="px-5 py-4">
            <button
                onClick={() => setIsExpanded((prev) => !prev)}
                className="flex items-center justify-between w-full mb-3 outline-none focus:outline-none focus-visible:outline-none"
            >
                <p className="text-xs font-semibold uppercase tracking-widest text-slate-700 dark:text-zinc-300">
                    Library
                </p>
                {isExpanded ? (
                    <ChevronUp className="w-4 h-4 text-slate-500 dark:text-zinc-400" />
                ) : (
                    <ChevronDown className="w-4 h-4 text-slate-500 dark:text-zinc-400" />
                )}
            </button>

            <div
                className={`transition-all duration-200 ${isExpanded ? 'max-h-[2000px] opacity-100 overflow-visible' : 'max-h-0 opacity-0 overflow-hidden'
                    }`}
            >
                {/* Export Library button */}
                {items.length > 0 && (
                    <button
                        onClick={() => setShowExportModal(true)}
                        className="flex items-center gap-1.5 rounded-md border border-slate-200 dark:border-zinc-600 text-slate-700 dark:text-zinc-300 text-xs px-3 py-1.5 hover:bg-slate-100 dark:hover:bg-zinc-700 transition-colors outline-none focus:outline-none focus-visible:outline-none mb-3"
                    >
                        <Download className="w-3.5 h-3.5" />
                        Export Library
                    </button>
                )}

                <input
                    type="text"
                    placeholder="Search drafts..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full border border-slate-200 dark:border-zinc-600 rounded-md px-3 py-1.5 text-sm text-slate-900 dark:text-zinc-100 bg-white dark:bg-zinc-800 outline-none focus:outline-none focus:ring-0 focus:border-slate-200 dark:focus:border-zinc-600 shadow-none focus:shadow-none mb-3 placeholder:text-slate-400 dark:placeholder:text-zinc-500"
                />

                {filteredItems.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-10 text-center">
                        <FileText className="w-8 h-8 text-slate-300 dark:text-zinc-600 mb-3" />
                        <p className="text-sm text-slate-500 dark:text-zinc-400">
                            {items.length === 0
                                ? 'No drafts yet.'
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

            {/* Export modal */}
            {showExportModal && (
                <ExportModal
                    items={items}
                    onClose={() => setShowExportModal(false)}
                />
            )}
        </section>
    );
}
