import { useMemo, useState, useCallback } from 'react';
import { Header } from '@/components/Header';
import { QuickDraft } from '@/components/QuickDraft';
import { RecentDrafts } from '@/components/RecentDrafts';
import { Library } from '@/components/Library';
import { SaveDialog } from '@/components/SaveDialog';
import { useStorage } from '@/hooks/useStorage';
import { copyWithPrompt } from '@/lib/copyWithPrompt';
import type { Draft, LibraryItem } from '@/types';

const DEFAULT_DRAFT: Draft = {
    id: 'default',
    title: '',
    description: '',
    content: '',
    updatedAt: 0,
};

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
    const [saveDialog, setSaveDialog] = useState<SaveDialogState | null>(null);

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

            // Find all items matching base title or base title + number suffix
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

    // Load item into Quick Draft
    const handleLoadItem = useCallback(
        (item: LibraryItem) => {
            setDraft({
                ...draft,
                title: item.title,
                description: item.description || '',
                content: item.content,
                updatedAt: Date.now(),
            });
            handleItemInteraction(item.id);
        },
        [draft, setDraft, handleItemInteraction]
    );

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

    // Delete item (works for both Library and Recent Drafts)
    const handleDeleteItem = useCallback(
        (id: string) => {
            setLibraryItems((prev) => prev.filter((item) => item.id !== id));
        },
        [setLibraryItems]
    );

    if (draftLoading || libraryLoading) {
        return (
            <div className="flex items-center justify-center h-screen bg-white">
                <div className="w-5 h-5 border-2 border-slate-200 border-t-slate-500 rounded-full animate-spin" />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-white text-slate-800">
            <Header />

            <QuickDraft
                draft={draft}
                onSave={handleSave}
                onSaveDraft={handleSaveDraft}
                onCopyDraft={handleCopyDraft}
            />

            <div className="border-t border-slate-100 my-0" />

            <RecentDrafts
                items={recentDrafts}
                onDelete={handleDeleteItem}
                onLoad={handleLoadItem}
                onCopy={handleCopyItem}
                onTogglePin={handleTogglePin}
            />

            <div className="border-t border-slate-100 my-0" />

            <Library
                items={libraryItems}
                onDelete={handleDeleteItem}
                onLoad={handleLoadItem}
                onCopy={handleCopyItem}
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
        </div>
    );
}
