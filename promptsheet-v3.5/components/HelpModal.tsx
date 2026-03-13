import { X } from 'lucide-react';

export function HelpModal({ onClose }: { onClose: () => void }) {
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
                        How to Use PromptSheet
                    </h2>
                    <button
                        onClick={onClose}
                        className="p-1 rounded-md text-slate-400 hover:text-slate-600 dark:text-zinc-400 dark:hover:text-zinc-200 transition-colors outline-none focus:outline-none focus-visible:outline-none"
                    >
                        <X className="w-4 h-4" />
                    </button>
                </div>

                <div className="text-sm text-slate-600 dark:text-zinc-300 space-y-4">
                    <div>
                        <h3 className="font-semibold text-slate-800 dark:text-zinc-100 mb-1">Quick Draft</h3>
                        <p>
                            Use the Quick Draft section to compose text from scratch. Enter a title, an optional description, and your main content in the body field. Use the undo and redo arrows to step through your editing history. Click &ldquo;+New Draft&rdquo; to clear all fields and start fresh (you will be asked to confirm if fields are not empty). Click &ldquo;Copy Draft&rdquo; to copy the body content to your clipboard. Click &ldquo;Save Draft&rdquo; to save your work to the Library.
                        </p>
                    </div>

                    <div>
                        <h3 className="font-semibold text-slate-800 dark:text-zinc-100 mb-1">Recent Drafts</h3>
                        <p>
                            Recent Drafts shows up to 5 of your most recently saved or interacted-with items. Pin an item to keep it in this list regardless of activity. Click any item to load it into Quick Draft. Hover over an item to reveal copy, load, and delete actions.
                        </p>
                    </div>

                    <div>
                        <h3 className="font-semibold text-slate-800 dark:text-zinc-100 mb-1">Library</h3>
                        <p>
                            The Library stores up to 100 saved drafts. Use the search bar to find items by title. Hover over any item to reveal options: load into Quick Draft, copy to clipboard, export as a file, or delete. Deleted items are moved to the Trash. Use the export button above the search bar to export your entire library.
                        </p>
                    </div>

                    <div>
                        <h3 className="font-semibold text-slate-800 dark:text-zinc-100 mb-1">Trash</h3>
                        <p>
                            The Trash holds up to 30 recently deleted items. Hover over an item to restore it to the Library or permanently delete it. Use the toolbar to restore or delete all items at once. Items are permanently removed on a first-in-first-out basis once the 30-item limit is reached.
                        </p>
                    </div>

                    <p className="text-slate-500 dark:text-zinc-400 text-xs italic pt-2 border-t border-slate-100 dark:border-zinc-700">
                        All data is stored locally in your browser. Nothing is sent to any server.
                    </p>
                </div>
            </div>
        </div>
    );
}
