import { useState, useRef, useEffect, useCallback } from 'react';
import { Copy, Check, Trash2, Edit3, Download } from 'lucide-react';
import { exportItem } from '@/lib/exportUtils';
import type { ExportFormat } from '@/lib/exportUtils';
import type { LibraryItem } from '@/types';

interface LibraryCardProps {
    item: LibraryItem;
    onDelete: (id: string, title: string) => void;
    onLoad: (item: LibraryItem) => void;
    onCopy: (item: LibraryItem) => void;
}

export function LibraryCard({ item, onDelete, onLoad, onCopy }: LibraryCardProps) {
    const [copied, setCopied] = useState<boolean>(false);
    const [showFormatPicker, setShowFormatPicker] = useState<boolean>(false);
    const [openDirection, setOpenDirection] = useState<'down' | 'up'>('down');
    const pickerRef = useRef<HTMLDivElement>(null);
    const downloadBtnRef = useRef<HTMLButtonElement>(null);

    const handleCopy = () => {
        onCopy(item);
        setCopied(true);
        setTimeout(() => setCopied(false), 1500);
    };

    const handleExport = useCallback((format: ExportFormat) => {
        exportItem(item, format);
        setShowFormatPicker(false);
    }, [item]);

    const toggleFormatPicker = useCallback(() => {
        setShowFormatPicker((prev) => {
            if (!prev && downloadBtnRef.current) {
                const rect = downloadBtnRef.current.getBoundingClientRect();
                // Dropdown is roughly 140px tall (4 items)
                const spaceBelow = window.innerHeight - rect.bottom;
                setOpenDirection(spaceBelow < 140 ? 'up' : 'down');
            }
            return !prev;
        });
    }, []);

    // Dismiss format picker on click outside
    useEffect(() => {
        if (!showFormatPicker) return;
        const handler = (e: MouseEvent) => {
            if (pickerRef.current && !pickerRef.current.contains(e.target as Node)) {
                setShowFormatPicker(false);
            }
        };
        document.addEventListener('mousedown', handler);
        return () => document.removeEventListener('mousedown', handler);
    }, [showFormatPicker]);

    const dropdownPositionClasses =
        openDirection === 'up'
            ? 'bottom-full mb-1'
            : 'top-full mt-1';

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
                    {copied ? (
                        <Check className="w-3.5 h-3.5 text-green-500 dark:text-green-400" />
                    ) : (
                        <Copy className="w-3.5 h-3.5" />
                    )}
                </button>
                {/* Export with format picker */}
                <div className="relative" ref={pickerRef}>
                    <button
                        ref={downloadBtnRef}
                        onClick={toggleFormatPicker}
                        className="p-1.5 rounded-md text-slate-500 hover:text-slate-700 hover:bg-slate-100 dark:text-zinc-400 dark:hover:text-zinc-200 dark:hover:bg-zinc-700 transition-colors outline-none focus:outline-none focus-visible:outline-none"
                        title="Export"
                    >
                        <Download className="w-3.5 h-3.5" />
                    </button>
                    {showFormatPicker && (
                        <div className={`absolute right-0 ${dropdownPositionClasses} bg-white dark:bg-zinc-800 border border-slate-200 dark:border-zinc-600 rounded-md shadow-lg dark:shadow-zinc-900/50 py-1 z-50 min-w-[120px]`}>
                            <button
                                onClick={() => handleExport('txt')}
                                className="w-full text-left px-3 py-1.5 text-xs text-slate-700 dark:text-zinc-300 hover:bg-slate-50 dark:hover:bg-zinc-700 outline-none"
                            >
                                Text (.txt)
                            </button>
                            <button
                                onClick={() => handleExport('md')}
                                className="w-full text-left px-3 py-1.5 text-xs text-slate-700 dark:text-zinc-300 hover:bg-slate-50 dark:hover:bg-zinc-700 outline-none"
                            >
                                Markdown (.md)
                            </button>
                            <button
                                onClick={() => handleExport('pdf')}
                                className="w-full text-left px-3 py-1.5 text-xs text-slate-700 dark:text-zinc-300 hover:bg-slate-50 dark:hover:bg-zinc-700 outline-none"
                            >
                                PDF (.pdf)
                            </button>
                            <button
                                onClick={() => handleExport('json')}
                                className="w-full text-left px-3 py-1.5 text-xs text-slate-700 dark:text-zinc-300 hover:bg-slate-50 dark:hover:bg-zinc-700 outline-none"
                            >
                                JSON (.json)
                            </button>
                        </div>
                    )}
                </div>
                <button
                    onClick={() => onDelete(item.id, item.title)}
                    className="p-1.5 rounded-md text-red-400 hover:text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:text-red-300 dark:hover:bg-red-900/30 transition-colors outline-none focus:outline-none focus-visible:outline-none"
                    title="Delete"
                >
                    <Trash2 className="w-3.5 h-3.5" />
                </button>
            </div>
            <h3 className="text-sm font-semibold text-slate-900 dark:text-zinc-100 pr-24">
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
