import type { LibraryItem } from '@/types';

interface SaveDialogProps {
    pendingTitle: string;
    pendingDescription: string;
    pendingContent: string;
    matchingItem: LibraryItem;
    onSaveAsNew: (title: string, description: string, content: string) => void;
    onOverwrite: (id: string, title: string, description: string, content: string) => void;
    onCancel: () => void;
}

export function SaveDialog({
    pendingTitle,
    pendingDescription,
    pendingContent,
    matchingItem,
    onSaveAsNew,
    onOverwrite,
    onCancel,
}: SaveDialogProps) {
    return (
        <div className="fixed inset-0 bg-black bg-opacity-20 flex items-center justify-center z-50">
            <div className="bg-white rounded-xl shadow-xl p-6 mx-4 max-w-sm w-full">
                <h2 className="text-slate-800 font-semibold text-base mb-2">
                    Duplicate Title Found
                </h2>
                <p className="text-slate-500 text-sm mb-6">
                    A prompt named &quot;{pendingTitle}&quot; already exists. What would
                    you like to do?
                </p>
                <div className="flex flex-col gap-2">
                    <button
                        onClick={() =>
                            onSaveAsNew(pendingTitle, pendingDescription, pendingContent)
                        }
                        className="bg-slate-800 text-white text-sm px-4 py-2 rounded-md hover:bg-slate-700 w-full transition-colors"
                    >
                        Save as New
                    </button>
                    <button
                        onClick={() =>
                            onOverwrite(
                                matchingItem.id,
                                pendingTitle,
                                pendingDescription,
                                pendingContent
                            )
                        }
                        className="border border-slate-200 text-slate-700 text-sm px-4 py-2 rounded-md hover:bg-slate-50 w-full transition-colors"
                    >
                        Overwrite
                    </button>
                    <button
                        onClick={onCancel}
                        className="text-slate-400 text-sm px-4 py-2 rounded-md hover:text-slate-600 w-full transition-colors"
                    >
                        Cancel
                    </button>
                </div>
            </div>
        </div>
    );
}
