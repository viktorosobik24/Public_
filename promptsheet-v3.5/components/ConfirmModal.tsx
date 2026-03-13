interface ConfirmModalProps {
    title: string;
    message: string;
    confirmLabel: string;
    confirmVariant?: 'default' | 'destructive';
    onConfirm: () => void;
    onCancel: () => void;
}

export function ConfirmModal({
    title,
    message,
    confirmLabel,
    confirmVariant = 'default',
    onConfirm,
    onCancel,
}: ConfirmModalProps) {
    const confirmClasses =
        confirmVariant === 'destructive'
            ? 'bg-red-600 text-white hover:bg-red-700 dark:bg-red-600 dark:hover:bg-red-700'
            : 'bg-slate-800 dark:bg-zinc-100 text-white dark:text-zinc-900 hover:bg-slate-700 dark:hover:bg-zinc-300';

    return (
        <div
            className="fixed inset-0 bg-black bg-opacity-20 dark:bg-opacity-50 flex items-center justify-center z-50"
            onClick={onCancel}
        >
            <div
                className="bg-white dark:bg-zinc-800 rounded-xl shadow-xl dark:shadow-zinc-900/50 p-6 mx-4 max-w-sm w-full"
                onClick={(e) => e.stopPropagation()}
            >
                <h2 className="text-slate-900 dark:text-zinc-100 font-semibold text-base mb-2">
                    {title}
                </h2>
                <p className="text-slate-500 dark:text-zinc-300 text-sm mb-6">
                    {message}
                </p>
                <div className="flex flex-col gap-2">
                    <button
                        onClick={onConfirm}
                        className={`${confirmClasses} text-sm px-4 py-2 rounded-md w-full transition-colors outline-none focus:outline-none focus-visible:outline-none`}
                    >
                        {confirmLabel}
                    </button>
                    <button
                        onClick={onCancel}
                        className="text-slate-500 dark:text-zinc-400 text-sm px-4 py-2 rounded-md hover:text-slate-700 dark:hover:text-zinc-300 w-full transition-colors outline-none focus:outline-none focus-visible:outline-none"
                    >
                        Cancel
                    </button>
                </div>
            </div>
        </div>
    );
}
