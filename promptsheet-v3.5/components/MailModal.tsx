import { useState, useCallback } from 'react';
import { X } from 'lucide-react';

interface MailModalProps {
    onClose: () => void;
}

export function MailModal({ onClose }: MailModalProps) {
    const [email, setEmail] = useState('');
    const [status, setStatus] = useState<'idle' | 'sending' | 'success' | 'error'>('idle');
    const [errorMsg, setErrorMsg] = useState('');

    const isValidEmail = (value: string): boolean => {
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
    };

    const handleSubmit = useCallback(async () => {
        if (!email.trim() || !isValidEmail(email.trim())) {
            setErrorMsg('Please enter a valid email address.');
            return;
        }

        setErrorMsg('');
        setStatus('sending');

        try {
            const response = await fetch(
                'https://script.google.com/macros/s/AKfycbyqi8CAlIvX3JT5hxLs8Mpko_DrslzEbBt5AGE286RddnHZVOSdiAtrr4Nxqi4mxgZL/exec',
                {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ email: email.trim() }),
                    mode: 'no-cors',
                }
            );

            // Google Apps Script with no-cors returns opaque response, treat as success
            setStatus('success');
            setTimeout(() => onClose(), 2000);
        } catch {
            setStatus('error');
            setErrorMsg('Something went wrong. Please try again.');
        }
    }, [email, onClose]);

    return (
        <div
            className="fixed inset-0 bg-black bg-opacity-20 dark:bg-opacity-50 flex items-center justify-center z-50"
            onClick={onClose}
        >
            <div
                className="bg-white dark:bg-zinc-800 rounded-xl shadow-xl dark:shadow-zinc-900/50 p-6 mx-4 max-w-sm w-full"
                onClick={(e) => e.stopPropagation()}
            >
                {status === 'success' ? (
                    <div className="text-center py-4">
                        <p className="text-slate-900 dark:text-zinc-100 font-semibold text-base">
                            You&apos;re on the list!
                        </p>
                    </div>
                ) : (
                    <>
                        <div className="flex items-center justify-between mb-2">
                            <h2 className="text-slate-900 dark:text-zinc-100 font-semibold text-base">
                                Stay in the Loop
                            </h2>
                            <button
                                onClick={onClose}
                                className="p-1 rounded-md text-slate-400 hover:text-slate-600 dark:text-zinc-400 dark:hover:text-zinc-200 transition-colors outline-none focus:outline-none focus-visible:outline-none"
                            >
                                <X className="w-4 h-4" />
                            </button>
                        </div>
                        <p className="text-slate-500 dark:text-zinc-300 text-sm mb-4">
                            Get notified about my new projects.
                        </p>

                        <input
                            type="email"
                            value={email}
                            onChange={(e) => {
                                setEmail(e.target.value);
                                setErrorMsg('');
                            }}
                            placeholder="your@email.com"
                            className="w-full border border-slate-200 dark:border-zinc-600 rounded-md px-3 py-2 text-sm text-slate-900 dark:text-zinc-100 bg-white dark:bg-zinc-800 outline-none focus:outline-none focus:ring-0 focus:border-slate-200 dark:focus:border-zinc-600 shadow-none focus:shadow-none mb-3 placeholder:text-slate-400 dark:placeholder:text-zinc-500"
                        />

                        {errorMsg && (
                            <p className="text-red-500 dark:text-red-400 text-xs mb-3">
                                {errorMsg}
                            </p>
                        )}

                        <div className="flex flex-col gap-2">
                            <button
                                onClick={handleSubmit}
                                disabled={status === 'sending'}
                                className="bg-slate-800 dark:bg-zinc-100 text-white dark:text-zinc-900 text-sm px-4 py-2 rounded-md hover:bg-slate-700 dark:hover:bg-zinc-300 w-full transition-colors disabled:opacity-60 outline-none focus:outline-none focus-visible:outline-none"
                            >
                                {status === 'sending' ? 'Joining...' : 'Join'}
                            </button>
                            <button
                                onClick={onClose}
                                className="text-slate-500 dark:text-zinc-400 text-sm px-4 py-2 rounded-md hover:text-slate-700 dark:hover:text-zinc-300 w-full transition-colors outline-none focus:outline-none focus-visible:outline-none"
                            >
                                Cancel
                            </button>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
}
