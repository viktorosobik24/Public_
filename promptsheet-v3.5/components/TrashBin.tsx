import { useState, useCallback } from 'react';
import {
    Trash2,
    RotateCcw,
    ChevronDown,
    ChevronUp,
} from 'lucide-react';
import { ConfirmModal } from './ConfirmModal';
import type { LibraryItem } from '@/types';

interface TrashBinProps {
    items: LibraryItem[];
    onRestore: (item: LibraryItem) => void;
    onDeletePermanently: (id: string) => void;
    onRestoreAll: () => void;
    onEmptyTrash: () => void;
    onRestoreSelected: (ids: string[]) => void;
    onDeleteSelected: (ids: string[]) => void;
}

export function TrashBin({
    items,
    onRestore,
    onDeletePermanently,
    onRestoreAll,
    onEmptyTrash,
    onRestoreSelected,
    onDeleteSelected,
}: TrashBinProps) {
    const [isExpanded, setIsExpanded] = useState<boolean>(false);
    const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
    const [confirmAction, setConfirmAction] = useState<
        | { type: 'restoreAll' }
        | { type: 'emptyTrash' }
        | { type: 'deleteSelected'; count: number }
        | { type: 'deletePermanently'; id: string; title: string }
        | null
    >(null);

    const hasSelection = selectedIds.size > 0;

    const toggleSelect = useCallback((id: string) => {
        setSelectedIds((prev) => {
            const next = new Set(prev);
            if (next.has(id)) {
                next.delete(id);
            } else {
                next.add(id);
            }
            return next;
        });
    }, []);

    const handleRestoreAll = useCallback(() => {
        setConfirmAction({ type: 'restoreAll' });
    }, []);

    const handleEmptyTrash = useCallback(() => {
        setConfirmAction({ type: 'emptyTrash' });
    }, []);

    const handleDeleteSelected = useCallback(() => {
        setConfirmAction({ type: 'deleteSelected', count: selectedIds.size });
    }, [selectedIds.size]);

    const handleRestoreSelected = useCallback(() => {
        onRestoreSelected(Array.from(selectedIds));
        setSelectedIds(new Set());
    }, [selectedIds, onRestoreSelected]);

    const handleDeletePermanently = useCallback((id: string, title: string) => {
        setConfirmAction({ type: 'deletePermanently', id, title });
    }, []);

    const handleConfirm = useCallback(() => {
        if (!confirmAction) return;
        switch (confirmAction.type) {
            case 'restoreAll':
                onRestoreAll();
                break;
            case 'emptyTrash':
                onEmptyTrash();
                setSelectedIds(new Set());
                break;
            case 'deleteSelected':
                onDeleteSelected(Array.from(selectedIds));
                setSelectedIds(new Set());
                break;
            case 'deletePermanently':
                onDeletePermanently(confirmAction.id);
                setSelectedIds((prev) => {
                    const next = new Set(prev);
                    next.delete(confirmAction.id);
                    return next;
                });
                break;
        }
        setConfirmAction(null);
    }, [confirmAction, selectedIds, onRestoreAll, onEmptyTrash, onDeleteSelected, onDeletePermanently]);

    const getConfirmProps = () => {
        if (!confirmAction) return null;
        switch (confirmAction.type) {
            case 'restoreAll':
                return {
                    title: 'Restore all items?',
                    message: 'They will be returned to your Library.',
                    confirmLabel: 'Restore All',
                    confirmVariant: 'default' as const,
                };
            case 'emptyTrash':
                return {
                    title: 'Permanently delete all items in the Trash?',
                    message: 'This cannot be undone.',
                    confirmLabel: 'Empty Trash',
                    confirmVariant: 'destructive' as const,
                };
            case 'deleteSelected':
                return {
                    title: `Permanently delete ${confirmAction.count} selected item${confirmAction.count > 1 ? 's' : ''}?`,
                    message: 'This cannot be undone.',
                    confirmLabel: 'Delete',
                    confirmVariant: 'destructive' as const,
                };
            case 'deletePermanently':
                return {
                    title: `Permanently delete '${confirmAction.title}'?`,
                    message: 'This cannot be undone.',
                    confirmLabel: 'Delete',
                    confirmVariant: 'destructive' as const,
                };
        }
    };

    return (
        <section className="px-5 py-4">
            <button
                onClick={() => setIsExpanded((prev) => !prev)}
                className="flex items-center justify-between w-full mb-3 outline-none focus:outline-none focus-visible:outline-none"
            >
                <p className="text-xs font-semibold uppercase tracking-widest text-slate-700 dark:text-zinc-300">
                    Trash
                </p>
                {isExpanded ? (
                    <ChevronUp className="w-4 h-4 text-slate-500 dark:text-zinc-400" />
                ) : (
                    <ChevronDown className="w-4 h-4 text-slate-500 dark:text-zinc-400" />
                )}
            </button>

            <div
                className={`transition-all duration-200 overflow-hidden ${isExpanded ? 'max-h-[4000px] opacity-100' : 'max-h-0 opacity-0'
                    }`}
            >
                {items.length === 0 ? (
                    <p className="text-slate-500 dark:text-zinc-400 text-sm text-center py-2">
                        Trash is empty.
                    </p>
                ) : (
                    <>
                        {/* Toolbar */}
                        <div className="flex items-center justify-end gap-2 mb-3">
                            {hasSelection ? (
                                <>
                                    <button
                                        onClick={handleRestoreSelected}
                                        className="flex items-center gap-1.5 rounded-md border border-slate-200 dark:border-zinc-600 text-slate-700 dark:text-zinc-300 text-xs px-3 py-1.5 hover:bg-slate-100 dark:hover:bg-zinc-700 transition-colors outline-none focus:outline-none focus-visible:outline-none"
                                    >
                                        <RotateCcw className="w-3.5 h-3.5" />
                                        Restore Selected
                                    </button>
                                    <button
                                        onClick={handleDeleteSelected}
                                        className="flex items-center gap-1.5 rounded-md border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 text-xs px-3 py-1.5 hover:bg-red-50 dark:hover:bg-red-900/30 transition-colors outline-none focus:outline-none focus-visible:outline-none"
                                    >
                                        <Trash2 className="w-3.5 h-3.5" />
                                        Delete Selected
                                    </button>
                                </>
                            ) : (
                                <>
                                    <button
                                        onClick={handleRestoreAll}
                                        className="flex items-center gap-1.5 rounded-md border border-slate-200 dark:border-zinc-600 text-slate-700 dark:text-zinc-300 text-xs px-3 py-1.5 hover:bg-slate-100 dark:hover:bg-zinc-700 transition-colors outline-none focus:outline-none focus-visible:outline-none"
                                    >
                                        <RotateCcw className="w-3.5 h-3.5" />
                                        Restore All
                                    </button>
                                    <button
                                        onClick={handleEmptyTrash}
                                        className="flex items-center gap-1.5 rounded-md border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 text-xs px-3 py-1.5 hover:bg-red-50 dark:hover:bg-red-900/30 transition-colors outline-none focus:outline-none focus-visible:outline-none"
                                    >
                                        <Trash2 className="w-3.5 h-3.5" />
                                        Empty Trash
                                    </button>
                                </>
                            )}
                        </div>

                        {/* Trash items */}
                        <div className="flex flex-col gap-2">
                            {items.map((item) => (
                                <div
                                    key={item.id}
                                    className="group bg-white dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded-lg p-4 hover:shadow-md dark:hover:shadow-zinc-900/50 transition-shadow relative"
                                >
                                    {/* Checkbox — left side */}
                                    <div
                                        className={`absolute top-3 left-3 transition-opacity ${hasSelection
                                            ? 'opacity-100'
                                            : 'opacity-0 group-hover:opacity-100'
                                            }`}
                                    >
                                        <input
                                            type="checkbox"
                                            checked={selectedIds.has(item.id)}
                                            onChange={() => toggleSelect(item.id)}
                                            className="w-4 h-4 rounded border-slate-300 dark:border-zinc-600 text-slate-800 dark:text-zinc-200 focus:ring-0 outline-none cursor-pointer"
                                        />
                                    </div>

                                    {/* Action buttons — top-right */}
                                    <div className="absolute top-3 right-3 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <button
                                            onClick={() => onRestore(item)}
                                            className="p-1.5 rounded-md text-slate-500 hover:text-slate-700 hover:bg-slate-100 dark:text-zinc-400 dark:hover:text-zinc-200 dark:hover:bg-zinc-700 transition-colors outline-none focus:outline-none focus-visible:outline-none"
                                            title="Restore"
                                        >
                                            <RotateCcw className="w-3.5 h-3.5" />
                                        </button>
                                        <button
                                            onClick={() => handleDeletePermanently(item.id, item.title || 'Untitled')}
                                            className="p-1.5 rounded-md text-red-400 hover:text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:text-red-300 dark:hover:bg-red-900/30 transition-colors outline-none focus:outline-none focus-visible:outline-none"
                                            title="Delete Permanently"
                                        >
                                            <Trash2 className="w-3.5 h-3.5" />
                                        </button>
                                    </div>

                                    {/* Content — offset for checkbox */}
                                    <div className="pl-7">
                                        <h3 className="text-sm font-semibold text-slate-900 dark:text-zinc-100 pr-20">
                                            {item.title || (
                                                <span className="text-slate-500 dark:text-zinc-400 italic">
                                                    Untitled
                                                </span>
                                            )}
                                        </h3>
                                        {item.description && (
                                            <p className="text-slate-500 dark:text-zinc-300 text-sm mt-1 line-clamp-2">
                                                {item.description}
                                            </p>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </>
                )}
            </div>

            {/* Confirmation modal */}
            {confirmAction && (() => {
                const props = getConfirmProps();
                if (!props) return null;
                return (
                    <ConfirmModal
                        title={props.title}
                        message={props.message}
                        confirmLabel={props.confirmLabel}
                        confirmVariant={props.confirmVariant}
                        onConfirm={handleConfirm}
                        onCancel={() => setConfirmAction(null)}
                    />
                );
            })()}
        </section>
    );
}
