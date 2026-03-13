import { useState, useCallback } from 'react';
import { X, FileJson, FolderArchive, ListChecks } from 'lucide-react';
import { exportAllAsJSON, exportAllAsZip, exportSelectedAsZip, exportSelectedAsJSON } from '@/lib/exportUtils';
import type { ExportFormat } from '@/lib/exportUtils';
import type { LibraryItem } from '@/types';

type View = 'main' | 'files-format' | 'batch' | 'batch-format';

interface ExportModalProps {
    items: LibraryItem[];
    onClose: () => void;
}

export function ExportModal({ items, onClose }: ExportModalProps) {
    const [view, setView] = useState<View>('main');
    const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

    const toggleSelect = useCallback((id: string) => {
        setSelectedIds((prev) => {
            const next = new Set(prev);
            if (next.has(id)) next.delete(id);
            else next.add(id);
            return next;
        });
    }, []);

    const selectAll = useCallback(() => {
        setSelectedIds(new Set(items.map((i) => i.id)));
    }, [items]);

    const deselectAll = useCallback(() => {
        setSelectedIds(new Set());
    }, []);

    const handleExportJSON = useCallback(() => {
        exportAllAsJSON(items);
        onClose();
    }, [items, onClose]);

    const handleExportFiles = useCallback(async (format: ExportFormat) => {
        await exportAllAsZip(items, format);
        onClose();
    }, [items, onClose]);

    const handleBatchExport = useCallback(async (format: ExportFormat | 'json') => {
        const selected = items.filter((i) => selectedIds.has(i.id));
        if (format === 'json') {
            exportSelectedAsJSON(selected);
        } else {
            await exportSelectedAsZip(selected, format);
        }
        onClose();
    }, [items, selectedIds, onClose]);

    const formatButtons = (onPick: (format: ExportFormat) => void) => (
        <div className="flex flex-col gap-2">
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-zinc-400 mb-1">
                Choose format
            </p>
            {(['txt', 'md', 'pdf'] as ExportFormat[]).map((fmt) => (
                <button
                    key={fmt}
                    onClick={() => onPick(fmt)}
                    className="w-full text-left px-4 py-2.5 rounded-md border border-slate-200 dark:border-zinc-600 text-slate-700 dark:text-zinc-300 text-sm hover:bg-slate-50 dark:hover:bg-zinc-700 transition-colors outline-none focus:outline-none"
                >
                    {fmt === 'txt' && 'Plain Text (.txt)'}
                    {fmt === 'md' && 'Markdown (.md)'}
                    {fmt === 'pdf' && 'PDF (.pdf)'}
                </button>
            ))}
        </div>
    );

    return (
        <div
            className="fixed inset-0 bg-black bg-opacity-20 dark:bg-opacity-50 flex items-center justify-center z-50"
            onClick={onClose}
        >
            <div
                className="bg-white dark:bg-zinc-800 rounded-xl shadow-xl dark:shadow-zinc-900/50 p-6 mx-4 max-w-md w-full max-h-[80vh] overflow-y-auto"
                onClick={(e) => e.stopPropagation()}
            >
                <div className="flex items-center justify-between mb-4">
                    <h2 className="text-slate-900 dark:text-zinc-100 font-semibold text-base">
                        {view === 'main' && 'Export Library'}
                        {view === 'files-format' && 'Export as Files'}
                        {view === 'batch' && 'Batch Export'}
                        {view === 'batch-format' && 'Export Selected'}
                    </h2>
                    <button
                        onClick={onClose}
                        className="p-1 rounded-md text-slate-400 hover:text-slate-600 dark:text-zinc-400 dark:hover:text-zinc-200 transition-colors outline-none"
                    >
                        <X className="w-4 h-4" />
                    </button>
                </div>

                {/* Main menu */}
                {view === 'main' && (
                    <div className="flex flex-col gap-2">
                        <button
                            onClick={handleExportJSON}
                            className="flex items-center gap-3 w-full text-left px-4 py-3 rounded-md border border-slate-200 dark:border-zinc-600 text-slate-700 dark:text-zinc-300 text-sm hover:bg-slate-50 dark:hover:bg-zinc-700 transition-colors outline-none"
                        >
                            <FileJson className="w-4 h-4 shrink-0" />
                            <div>
                                <p className="font-medium">Export as JSON</p>
                                <p className="text-xs text-slate-400 dark:text-zinc-500">All items in a single JSON file</p>
                            </div>
                        </button>
                        <button
                            onClick={() => setView('files-format')}
                            className="flex items-center gap-3 w-full text-left px-4 py-3 rounded-md border border-slate-200 dark:border-zinc-600 text-slate-700 dark:text-zinc-300 text-sm hover:bg-slate-50 dark:hover:bg-zinc-700 transition-colors outline-none"
                        >
                            <FolderArchive className="w-4 h-4 shrink-0" />
                            <div>
                                <p className="font-medium">Export as Files</p>
                                <p className="text-xs text-slate-400 dark:text-zinc-500">Zip archive of individual files</p>
                            </div>
                        </button>
                        <button
                            onClick={() => setView('batch')}
                            className="flex items-center gap-3 w-full text-left px-4 py-3 rounded-md border border-slate-200 dark:border-zinc-600 text-slate-700 dark:text-zinc-300 text-sm hover:bg-slate-50 dark:hover:bg-zinc-700 transition-colors outline-none"
                        >
                            <ListChecks className="w-4 h-4 shrink-0" />
                            <div>
                                <p className="font-medium">Batch Export</p>
                                <p className="text-xs text-slate-400 dark:text-zinc-500">Pick specific items to export</p>
                            </div>
                        </button>
                    </div>
                )}

                {/* Files format picker */}
                {view === 'files-format' && (
                    <>
                        <button
                            onClick={() => setView('main')}
                            className="text-xs text-slate-400 dark:text-zinc-500 hover:text-slate-600 dark:hover:text-zinc-300 mb-3 outline-none"
                        >
                            ← Back
                        </button>
                        {formatButtons(handleExportFiles)}
                    </>
                )}

                {/* Batch selection */}
                {view === 'batch' && (
                    <>
                        <button
                            onClick={() => setView('main')}
                            className="text-xs text-slate-400 dark:text-zinc-500 hover:text-slate-600 dark:hover:text-zinc-300 mb-3 outline-none"
                        >
                            ← Back
                        </button>
                        <div className="flex items-center justify-between mb-3">
                            <span className="text-xs text-slate-500 dark:text-zinc-400">
                                {selectedIds.size} of {items.length} selected
                            </span>
                            <div className="flex gap-2">
                                <button
                                    onClick={selectAll}
                                    className="text-xs text-slate-500 dark:text-zinc-400 hover:text-slate-700 dark:hover:text-zinc-200 outline-none"
                                >
                                    Select All
                                </button>
                                <button
                                    onClick={deselectAll}
                                    className="text-xs text-slate-500 dark:text-zinc-400 hover:text-slate-700 dark:hover:text-zinc-200 outline-none"
                                >
                                    Deselect All
                                </button>
                            </div>
                        </div>
                        <div className="max-h-60 overflow-y-auto border border-slate-100 dark:border-zinc-700 rounded-md mb-3">
                            {items.map((item) => (
                                <label
                                    key={item.id}
                                    className="flex items-start gap-3 px-3 py-2.5 hover:bg-slate-50 dark:hover:bg-zinc-700/50 cursor-pointer border-b border-slate-50 dark:border-zinc-700/50 last:border-b-0"
                                >
                                    <input
                                        type="checkbox"
                                        checked={selectedIds.has(item.id)}
                                        onChange={() => toggleSelect(item.id)}
                                        className="mt-0.5 w-4 h-4 rounded border-slate-300 dark:border-zinc-600 cursor-pointer"
                                    />
                                    <div className="min-w-0">
                                        <p className="text-sm font-medium text-slate-800 dark:text-zinc-200 truncate">
                                            {item.title || 'Untitled'}
                                        </p>
                                        {item.description && (
                                            <p className="text-xs text-slate-400 dark:text-zinc-500 truncate">
                                                {item.description}
                                            </p>
                                        )}
                                    </div>
                                </label>
                            ))}
                        </div>
                        <button
                            onClick={() => setView('batch-format')}
                            disabled={selectedIds.size === 0}
                            className="w-full bg-slate-800 dark:bg-zinc-100 text-white dark:text-zinc-900 text-sm px-4 py-2 rounded-md hover:bg-slate-700 dark:hover:bg-zinc-300 transition-colors disabled:opacity-40 disabled:cursor-not-allowed outline-none"
                        >
                            Export Selected ({selectedIds.size})
                        </button>
                    </>
                )}

                {/* Batch format picker */}
                {view === 'batch-format' && (
                    <>
                        <button
                            onClick={() => setView('batch')}
                            className="text-xs text-slate-400 dark:text-zinc-500 hover:text-slate-600 dark:hover:text-zinc-300 mb-3 outline-none"
                        >
                            ← Back
                        </button>
                        <div className="flex flex-col gap-2">
                            <p className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-zinc-400 mb-1">
                                Choose format
                            </p>
                            {(['txt', 'md', 'pdf', 'json'] as const).map((fmt) => (
                                <button
                                    key={fmt}
                                    onClick={() => handleBatchExport(fmt)}
                                    className="w-full text-left px-4 py-2.5 rounded-md border border-slate-200 dark:border-zinc-600 text-slate-700 dark:text-zinc-300 text-sm hover:bg-slate-50 dark:hover:bg-zinc-700 transition-colors outline-none"
                                >
                                    {fmt === 'txt' && 'Plain Text (.txt)'}
                                    {fmt === 'md' && 'Markdown (.md)'}
                                    {fmt === 'pdf' && 'PDF (.pdf)'}
                                    {fmt === 'json' && 'JSON (.json)'}
                                </button>
                            ))}
                        </div>
                    </>
                )}
            </div>
        </div>
    );
}
