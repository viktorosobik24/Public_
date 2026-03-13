interface ErrorModalProps {
    message: string;
    onDismiss: () => void;
}

export function ErrorModal({ message, onDismiss }: ErrorModalProps) {
    return (
        <div
            className="fixed inset-0 bg-black bg-opacity-20 dark:bg-opacity-50 flex items-center justify-center z-50"
            onClick={onDismiss}
        >
            <div
                className="bg-white dark:bg-zinc-800 rounded-xl shadow-xl dark:shadow-zinc-900/50 p-6 mx-4 max-w-sm w-full"
                onClick={(e) => e.stopPropagation()}
            >
                <h2 className="text-slate-900 dark:text-zinc-100 font-semibold text-base mb-2">
                    Error
                </h2>
                <p className="text-slate-500 dark:text-zinc-300 text-sm mb-6">
                    {message}
                </p>
                <div className="flex flex-col gap-2">
                    <button
                        onClick={onDismiss}
                        className="bg-slate-800 dark:bg-zinc-100 text-white dark:text-zinc-900 text-sm px-4 py-2 rounded-md hover:bg-slate-700 dark:hover:bg-zinc-300 w-full transition-colors outline-none focus:outline-none focus-visible:outline-none"
                    >
                        Dismiss
                    </button>
                </div>
            </div>
        </div>
    );
}
