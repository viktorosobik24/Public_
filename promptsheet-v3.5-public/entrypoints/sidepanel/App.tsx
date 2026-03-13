import { useMemo, useState, useCallback, useEffect } from 'react';
import { TopBar } from '@/components/TopBar';
import { HelpModal } from '@/components/HelpModal';
import { MailModal } from '@/components/MailModal';
import { QuickDraft } from '@/components/QuickDraft';
import { RecentDrafts } from '@/components/RecentDrafts';
import { Library } from '@/components/Library';
import { TrashBin } from '@/components/TrashBin';
import { SaveDialog } from '@/components/SaveDialog';
import { ConfirmModal } from '@/components/ConfirmModal';
import { ErrorModal } from '@/components/ErrorModal';
import { useStorage } from '@/hooks/useStorage';
import { copyWithPrompt } from '@/lib/copyWithPrompt';
import { isLibraryFull, showErrorModal, LIBRARY_MAX_CAPACITY } from '@/lib/utils';
import type { Draft, LibraryItem } from '@/types';

const DEFAULT_DRAFT: Draft = {
    id: 'default',
    title: '',
    description: '',
    content: '',
    updatedAt: 0,
};

const TRASH_MAX_CAPACITY = 30;

interface SaveDialogState {
    pending: { title: string; description: string; content: string };
    matchingItem: LibraryItem;
}

export function App() {
    const [draft, setDraft, draftLoading] = useStorage<Draft>(
        'quick_draft',
        DEFAULT_DRAFT
    );
    const [libraryItems, setLibraryItems, libraryLoading] = useStorage<
        LibraryItem[]
    >('library_items', []);
    const [trashItems, setTrashItems, trashLoading] = useStorage<LibraryItem[]>(
        'trash_items',
        []
    );
    const [darkMode, setDarkMode, darkModeLoading] =
        useStorage<boolean>('darkMode', false);
    const [saveDialog, setSaveDialog] = useState<SaveDialogState | null>(null);

    // Deletion confirmation state
    const [deleteTarget, setDeleteTarget] = useState<{ id: string; title: string } | null>(null);

    // Load confirmation state
    const [loadTarget, setLoadTarget] = useState<LibraryItem | null>(null);

    // Error modal state
    const [errorMessage, setErrorMessage] = useState<string | null>(null);

    // Help and Mail modal state
    const [showHelp, setShowHelp] = useState<boolean>(false);
    const [showMail, setShowMail] = useState<boolean>(false);

    // Toggle dark class on root element
    useEffect(() => {
        if (darkMode) {
            document.documentElement.classList.add('dark');
        } else {
            document.documentElement.classList.remove('dark');
        }
    }, [darkMode]);

    // Derived Recent Drafts view
    const recentDrafts = useMemo(() => {
        const pinned = libraryItems
            .filter((item) => item.pinned)
            .sort((a, b) => b.lastAccessedAt - a.lastAccessedAt);
        const unpinned = libraryItems
            .filter((item) => !item.pinned)
            .sort((a, b) => b.lastAccessedAt - a.lastAccessedAt)
            .slice(0, 5);
        return [...pinned, ...unpinned];
    }, [libraryItems]);

    // Auto-save draft fields
    const handleSave = useCallback(
        (title: string, description: string, content: string) => {
            setDraft({
                ...draft,
                title,
                description,
                content,
                updatedAt: Date.now(),
            });
        },
        [draft, setDraft]
    );

    // Internal: actually create a new library item
    const createLibraryItem = useCallback(
        (title: string, description: string, content: string) => {
            const finalDescription =
                description.trim() === ''
                    ? content.trim().slice(0, 60) +
                    (content.trim().length > 60 ? '...' : '')
                    : description;

            const newItem: LibraryItem = {
                id: crypto.randomUUID(),
                title,
                description: finalDescription,
                content,
                createdAt: Date.now(),
                lastAccessedAt: Date.now(),
                pinned: false,
            };

            setLibraryItems((prev) => [newItem, ...prev]);
        },
        [setLibraryItems]
    );

    // Save to Library (with duplicate title check)
    const handleSaveDraft = useCallback(
        (title: string, description: string, content: string) => {
            if (!content.trim() || !title.trim()) return;

            const match = libraryItems.find(
                (item) =>
                    item.title.trim().toLowerCase() === title.trim().toLowerCase()
            );

            if (match) {
                setSaveDialog({
                    pending: { title, description, content },
                    matchingItem: match,
                });
            } else {
                createLibraryItem(title, description, content);
            }
        },
        [libraryItems, createLibraryItem]
    );

    // Save as New (from dialog) — auto-increment title
    const handleSaveAsNew = useCallback(
        (title: string, description: string, content: string) => {
            const baseTitle = title.trim();
            const baseLower = baseTitle.toLowerCase();

            const suffixPattern = new RegExp(
                `^${baseLower.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}(\\s+(\\d+))?$`
            );

            let highestNum = 0;
            for (const item of libraryItems) {
                const match = item.title.trim().toLowerCase().match(suffixPattern);
                if (match) {
                    const num = match[2] ? parseInt(match[2], 10) : 1;
                    if (num > highestNum) highestNum = num;
                }
            }

            let finalTitle = baseTitle;
            if (highestNum > 0) {
                const nextNum = Math.min(highestNum + 1, 99);
                finalTitle = `${baseTitle} ${nextNum}`;
            }

            createLibraryItem(finalTitle, description, content);
            setSaveDialog(null);
        },
        [libraryItems, createLibraryItem]
    );

    // Overwrite existing item (from dialog)
    const handleOverwrite = useCallback(
        (id: string, title: string, description: string, content: string) => {
            const finalDescription =
                description.trim() === ''
                    ? content.trim().slice(0, 60) +
                    (content.trim().length > 60 ? '...' : '')
                    : description;

            setLibraryItems((prev) =>
                prev.map((item) =>
                    item.id === id
                        ? {
                            ...item,
                            title,
                            description: finalDescription,
                            content,
                            lastAccessedAt: Date.now(),
                        }
                        : item
                )
            );
            setSaveDialog(null);
        },
        [setLibraryItems]
    );

    // Update lastAccessedAt on an existing Library item
    const handleItemInteraction = useCallback(
        (id: string) => {
            setLibraryItems((prev) =>
                prev.map((item) =>
                    item.id === id
                        ? { ...item, lastAccessedAt: Date.now() }
                        : item
                )
            );
        },
        [setLibraryItems]
    );

    // Copy Draft button (from Quick Draft textarea)
    const handleCopyDraft = useCallback(
        async (title: string, description: string, content: string) => {
            await copyWithPrompt(content);

            const match = libraryItems.find((item) => item.content === content);
            if (match) {
                handleItemInteraction(match.id);
            }
        },
        [libraryItems, handleItemInteraction]
    );

    // Load item into Quick Draft (check for unsaved content)
    const handleLoadItem = useCallback(
        (item: LibraryItem) => {
            const hasContent =
                draft.title.trim().length > 0 ||
                draft.description.trim().length > 0 ||
                draft.content.trim().length > 0;

            if (hasContent) {
                setLoadTarget(item);
            } else {
                setDraft({
                    ...draft,
                    title: item.title,
                    description: item.description || '',
                    content: item.content,
                    updatedAt: Date.now(),
                });
                handleItemInteraction(item.id);
            }
        },
        [draft, setDraft, handleItemInteraction]
    );

    // Confirm load
    const confirmLoad = useCallback(() => {
        if (!loadTarget) return;
        setDraft({
            ...draft,
            title: loadTarget.title,
            description: loadTarget.description || '',
            content: loadTarget.content,
            updatedAt: Date.now(),
        });
        handleItemInteraction(loadTarget.id);
        setLoadTarget(null);
    }, [loadTarget, draft, setDraft, handleItemInteraction]);

    // Copy item (from Library or Recent Drafts card)
    const handleCopyItem = useCallback(
        async (item: LibraryItem) => {
            await copyWithPrompt(item.content);
            handleItemInteraction(item.id);
        },
        [handleItemInteraction]
    );

    // Toggle pin
    const handleTogglePin = useCallback(
        (id: string) => {
            setLibraryItems((prev) =>
                prev.map((item) =>
                    item.id === id ? { ...item, pinned: !item.pinned } : item
                )
            );
        },
        [setLibraryItems]
    );

    // Delete item — show confirmation first
    const handleDeleteItem = useCallback(
        (id: string, title: string) => {
            setDeleteTarget({ id, title });
        },
        []
    );

    // Confirm delete — move to trash instead of permanent delete
    const confirmDelete = useCallback(() => {
        if (!deleteTarget) return;
        const item = libraryItems.find((i) => i.id === deleteTarget.id);
        if (item) {
            // Add to trash with FIFO (max 30)
            setTrashItems((prev) => {
                const updated = [...prev, { ...item, pinned: false }];
                return updated.length > TRASH_MAX_CAPACITY
                    ? updated.slice(updated.length - TRASH_MAX_CAPACITY)
                    : updated;
            });
        }
        setLibraryItems((prev) => prev.filter((i) => i.id !== deleteTarget.id));
        setDeleteTarget(null);
    }, [deleteTarget, libraryItems, setLibraryItems, setTrashItems]);

    // --- Trash bin handlers ---

    // Restore single item from trash
    const handleTrashRestore = useCallback(
        (item: LibraryItem) => {
            if (isLibraryFull(libraryItems)) {
                showErrorModal(
                    'Cannot restore — your Library is full. Please delete an item first.',
                    setErrorMessage
                );
                return;
            }
            setLibraryItems((prev) => [...prev, { ...item, lastAccessedAt: Date.now() }]);
            setTrashItems((prev) => prev.filter((i) => i.id !== item.id));
        },
        [libraryItems, setLibraryItems, setTrashItems]
    );

    // Delete permanently from trash
    const handleTrashDeletePermanently = useCallback(
        (id: string) => {
            setTrashItems((prev) => prev.filter((i) => i.id !== id));
        },
        [setTrashItems]
    );

    // Restore all from trash
    const handleTrashRestoreAll = useCallback(() => {
        const spaceAvailable = LIBRARY_MAX_CAPACITY - libraryItems.length;
        if (spaceAvailable < trashItems.length) {
            showErrorModal(
                'Cannot restore — not enough space in your Library. Please delete some items first.',
                setErrorMessage
            );
            return;
        }
        const restoredItems = trashItems.map((item) => ({
            ...item,
            lastAccessedAt: Date.now(),
        }));
        setLibraryItems((prev) => [...prev, ...restoredItems]);
        setTrashItems([]);
    }, [libraryItems, trashItems, setLibraryItems, setTrashItems]);

    // Empty trash
    const handleTrashEmpty = useCallback(() => {
        setTrashItems([]);
    }, [setTrashItems]);

    // Restore selected from trash
    const handleTrashRestoreSelected = useCallback(
        (ids: string[]) => {
            const spaceAvailable = LIBRARY_MAX_CAPACITY - libraryItems.length;
            if (spaceAvailable < ids.length) {
                showErrorModal(
                    'Cannot restore — not enough space in your Library. Please delete some items first.',
                    setErrorMessage
                );
                return;
            }
            const itemsToRestore = trashItems
                .filter((i) => ids.includes(i.id))
                .map((item) => ({ ...item, lastAccessedAt: Date.now() }));
            setLibraryItems((prev) => [...prev, ...itemsToRestore]);
            setTrashItems((prev) => prev.filter((i) => !ids.includes(i.id)));
        },
        [libraryItems, trashItems, setLibraryItems, setTrashItems]
    );

    // Delete selected from trash permanently
    const handleTrashDeleteSelected = useCallback(
        (ids: string[]) => {
            setTrashItems((prev) => prev.filter((i) => !ids.includes(i.id)));
        },
        [setTrashItems]
    );

    const handleToggleDarkMode = useCallback(() => {
        setDarkMode((prev) => !prev);
    }, [setDarkMode]);

    if (draftLoading || libraryLoading || darkModeLoading || trashLoading) {
        return (
            <div className="flex items-center justify-center h-screen bg-white dark:bg-zinc-900">
                <div className="w-5 h-5 border-2 border-slate-200 border-t-slate-500 dark:border-zinc-600 dark:border-t-zinc-300 rounded-full animate-spin" />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-white dark:bg-zinc-900 text-slate-800 dark:text-zinc-100">
            <TopBar
                isDarkMode={darkMode}
                onToggleDarkMode={handleToggleDarkMode}
                onOpenHelp={() => setShowHelp(true)}
                onOpenMail={() => setShowMail(true)}
            />

            <QuickDraft
                draft={draft}
                libraryItems={libraryItems}
                onSave={handleSave}
                onSaveDraft={handleSaveDraft}
                onCopyDraft={handleCopyDraft}
            />

            <div className="border-t border-slate-100 dark:border-zinc-700 my-0" />

            <RecentDrafts
                items={recentDrafts}
                onDelete={handleDeleteItem}
                onLoad={handleLoadItem}
                onCopy={handleCopyItem}
                onTogglePin={handleTogglePin}
            />

            <div className="border-t border-slate-100 dark:border-zinc-700 my-0" />

            <Library
                items={libraryItems}
                onDelete={handleDeleteItem}
                onLoad={handleLoadItem}
                onCopy={handleCopyItem}
            />

            <div className="border-t border-slate-100 dark:border-zinc-700 my-0" />

            <TrashBin
                items={trashItems}
                onRestore={handleTrashRestore}
                onDeletePermanently={handleTrashDeletePermanently}
                onRestoreAll={handleTrashRestoreAll}
                onEmptyTrash={handleTrashEmpty}
                onRestoreSelected={handleTrashRestoreSelected}
                onDeleteSelected={handleTrashDeleteSelected}
            />

            {saveDialog && (
                <SaveDialog
                    pendingTitle={saveDialog.pending.title}
                    pendingDescription={saveDialog.pending.description}
                    pendingContent={saveDialog.pending.content}
                    matchingItem={saveDialog.matchingItem}
                    onSaveAsNew={handleSaveAsNew}
                    onOverwrite={handleOverwrite}
                    onCancel={() => setSaveDialog(null)}
                />
            )}

            {/* Deletion confirmation modal */}
            {deleteTarget && (
                <ConfirmModal
                    title={`Delete '${deleteTarget.title}'?`}
                    message="This action cannot be undone."
                    confirmLabel="Delete"
                    confirmVariant="destructive"
                    onConfirm={confirmDelete}
                    onCancel={() => setDeleteTarget(null)}
                />
            )}

            {/* Load confirmation modal */}
            {loadTarget && (
                <ConfirmModal
                    title={`Load '${loadTarget.title}'?`}
                    message="Your current draft will be replaced."
                    confirmLabel="Load"
                    onConfirm={confirmLoad}
                    onCancel={() => setLoadTarget(null)}
                />
            )}

            {/* Error modal */}
            {errorMessage && (
                <ErrorModal
                    message={errorMessage}
                    onDismiss={() => setErrorMessage(null)}
                />
            )}

            {/* Help modal */}
            {showHelp && <HelpModal onClose={() => setShowHelp(false)} />}

            {/* Mail modal */}
            {showMail && <MailModal onClose={() => setShowMail(false)} />}
        </div>
    );
}
