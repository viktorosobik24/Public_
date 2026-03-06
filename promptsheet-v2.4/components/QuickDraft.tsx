import { useState, useEffect, useRef, useCallback } from 'react';
import {
    Save,
    Copy,
    ArrowLeft,
    ArrowRight,
    RefreshCw,
    ChevronDown,
    ChevronUp,
} from 'lucide-react';
import type { Draft } from '@/types';

interface QuickDraftProps {
    draft: Draft;
    onSave: (title: string, description: string, content: string) => void;
    onSaveDraft: (title: string, description: string, content: string) => void;
    onCopyDraft: (title: string, description: string, content: string) => void;
}

export function QuickDraft({
    draft,
    onSave,
    onSaveDraft,
    onCopyDraft,
}: QuickDraftProps) {
    const [localTitle, setLocalTitle] = useState<string>(draft.title);
    const [localDescription, setLocalDescription] = useState<string>(draft.description);
    const [localContent, setLocalContent] = useState<string>(draft.content);
    const [isExpanded, setIsExpanded] = useState<boolean>(true);
    const [isTextareaExpanded, setIsTextareaExpanded] = useState<boolean>(false);
    const autoSaveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    // Undo/Redo history (session only, not persisted)
    const historyRef = useRef<string[]>([draft.content]);
    const historyIndexRef = useRef<number>(0);
    const historyDebounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
    const isNavigatingRef = useRef<boolean>(false);
    const [, forceRender] = useState<number>(0);

    // Sync local state when draft changes externally (e.g. after a Load)
    useEffect(() => {
        setLocalTitle(draft.title);
        setLocalDescription(draft.description);
        setLocalContent(draft.content);
        if (!isNavigatingRef.current) {
            historyRef.current = [
                ...historyRef.current.slice(0, historyIndexRef.current + 1),
                draft.content,
            ].slice(-50);
            historyIndexRef.current = historyRef.current.length - 1;
            forceRender((n) => n + 1);
        }
    }, [draft.title, draft.description, draft.content]);

    // Auto-save to storage (debounced 600ms)
    useEffect(() => {
        if (autoSaveTimerRef.current) {
            clearTimeout(autoSaveTimerRef.current);
        }
        autoSaveTimerRef.current = setTimeout(() => {
            onSave(localTitle, localDescription, localContent);
        }, 600);
        return () => {
            if (autoSaveTimerRef.current) {
                clearTimeout(autoSaveTimerRef.current);
            }
        };
    }, [localTitle, localDescription, localContent, onSave]);

    const handleContentChange = useCallback((newValue: string) => {
        isNavigatingRef.current = false;
        setLocalContent(newValue);

        if (historyDebounceRef.current) {
            clearTimeout(historyDebounceRef.current);
        }
        historyDebounceRef.current = setTimeout(() => {
            historyRef.current = [
                ...historyRef.current.slice(0, historyIndexRef.current + 1),
                newValue,
            ].slice(-50);
            historyIndexRef.current = historyRef.current.length - 1;
            forceRender((n) => n + 1);
        }, 500);
    }, []);

    const canUndo = historyIndexRef.current > 0;
    const canRedo = historyIndexRef.current < historyRef.current.length - 1;

    const handleUndo = useCallback(() => {
        if (!canUndo) return;
        isNavigatingRef.current = true;
        historyIndexRef.current -= 1;
        setLocalContent(historyRef.current[historyIndexRef.current]);
        forceRender((n) => n + 1);
    }, [canUndo]);

    const handleRedo = useCallback(() => {
        if (!canRedo) return;
        isNavigatingRef.current = true;
        historyIndexRef.current += 1;
        setLocalContent(historyRef.current[historyIndexRef.current]);
        forceRender((n) => n + 1);
    }, [canRedo]);

    const handleClear = useCallback(() => {
        isNavigatingRef.current = false;
        setLocalContent('');
        historyRef.current = [''];
        historyIndexRef.current = 0;
        forceRender((n) => n + 1);
        onSave(localTitle, localDescription, '');
    }, [localTitle, localDescription, onSave]);

    const canSave = localTitle.trim().length > 0 && localContent.trim().length > 0;

    const handleSaveDraft = useCallback(() => {
        if (!canSave) return;
        onSaveDraft(localTitle, localDescription, localContent);
    }, [canSave, localTitle, localDescription, localContent, onSaveDraft]);

    const handleCopyDraft = useCallback(() => {
        if (!localContent.trim()) return;
        onCopyDraft(localTitle, localDescription, localContent);
    }, [localTitle, localDescription, localContent, onCopyDraft]);

    return (
        <section className="px-5 py-4">
            {/* Collapsible header */}
            <button
                onClick={() => setIsExpanded((prev) => !prev)}
                className="flex items-center justify-between w-full mb-3 outline-none focus:outline-none focus-visible:outline-none"
            >
                <p className="text-xs font-semibold uppercase tracking-widest text-slate-700 dark:text-zinc-300">
                    Quick Draft
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
                {/* Title input */}
                <input
                    type="text"
                    value={localTitle}
                    onChange={(e) => setLocalTitle(e.target.value)}
                    placeholder="Prompt title..."
                    className="w-full border border-slate-200 dark:border-zinc-600 rounded-md px-3 py-2 text-sm text-slate-900 dark:text-zinc-100 bg-white dark:bg-zinc-800 outline-none focus:outline-none focus:ring-0 focus:border-slate-200 dark:focus:border-zinc-600 shadow-none focus:shadow-none mb-2 placeholder:text-slate-400 dark:placeholder:text-zinc-500"
                />

                {/* Description input */}
                <input
                    type="text"
                    value={localDescription}
                    onChange={(e) => setLocalDescription(e.target.value)}
                    placeholder="Short description (optional)..."
                    className="w-full border border-slate-200 dark:border-zinc-600 rounded-md px-3 py-2 text-sm text-slate-500 dark:text-zinc-300 bg-white dark:bg-zinc-800 outline-none focus:outline-none focus:ring-0 focus:border-slate-200 dark:focus:border-zinc-600 shadow-none focus:shadow-none mb-2 placeholder:text-slate-400 dark:placeholder:text-zinc-500"
                />

                {/* Textarea with RefreshCw clear icon + expand toggle */}
                <div className="relative">
                    <textarea
                        value={localContent}
                        onChange={(e) => handleContentChange(e.target.value)}
                        placeholder="Start typing..."
                        className={`w-full resize-none border border-slate-200 dark:border-zinc-600 rounded-md p-3 pr-8 pb-8 text-sm text-slate-900 dark:text-zinc-100 bg-white dark:bg-zinc-800 outline-none focus:outline-none focus:ring-0 focus:border-slate-200 dark:focus:border-zinc-600 shadow-none focus:shadow-none placeholder:text-slate-400 dark:placeholder:text-zinc-500 transition-[height] duration-200 ease-in-out`}
                        style={{ height: isTextareaExpanded ? '240px' : '120px' }}
                    />
                    {/* Clear icon — top-right */}
                    <button
                        onClick={handleClear}
                        className="absolute top-2 right-2 text-slate-400 hover:text-slate-600 dark:text-zinc-500 dark:hover:text-zinc-300 transition-colors outline-none focus:outline-none focus-visible:outline-none"
                        title="Clear draft"
                    >
                        <RefreshCw className="w-3.5 h-3.5" />
                    </button>
                    {/* Expand/collapse toggle — bottom-right */}
                    <button
                        onClick={() => setIsTextareaExpanded((prev) => !prev)}
                        className="absolute bottom-2 right-2 text-slate-400 hover:text-slate-600 dark:text-zinc-500 dark:hover:text-zinc-300 transition-colors outline-none focus:outline-none focus-visible:outline-none"
                        title={isTextareaExpanded ? 'Collapse field' : 'Expand field'}
                    >
                        {isTextareaExpanded ? (
                            <ChevronUp className="w-3.5 h-3.5" />
                        ) : (
                            <ChevronDown className="w-3.5 h-3.5" />
                        )}
                    </button>
                </div>

                {/* Navigation arrows + Copy Draft + Save Draft */}
                <div className="mt-3 flex items-center justify-between">
                    <div className="flex items-center gap-1">
                        <button
                            onClick={handleUndo}
                            disabled={!canUndo}
                            className="rounded-md border border-slate-200 dark:border-zinc-600 text-slate-500 dark:text-zinc-400 p-1 hover:bg-slate-100 dark:hover:bg-zinc-700 transition-colors disabled:opacity-40 disabled:cursor-not-allowed outline-none focus:outline-none focus-visible:outline-none"
                            title="Undo"
                        >
                            <ArrowLeft className="w-3.5 h-3.5" />
                        </button>
                        <button
                            onClick={handleRedo}
                            disabled={!canRedo}
                            className="rounded-md border border-slate-200 dark:border-zinc-600 text-slate-500 dark:text-zinc-400 p-1 hover:bg-slate-100 dark:hover:bg-zinc-700 transition-colors disabled:opacity-40 disabled:cursor-not-allowed outline-none focus:outline-none focus-visible:outline-none"
                            title="Redo"
                        >
                            <ArrowRight className="w-3.5 h-3.5" />
                        </button>
                    </div>
                    <div className="flex items-center gap-2">
                        <button
                            onClick={handleCopyDraft}
                            disabled={!localContent.trim()}
                            className="flex items-center gap-1.5 rounded-md border border-slate-200 dark:border-zinc-600 text-slate-700 dark:text-zinc-300 text-xs px-3 py-1.5 hover:bg-slate-100 dark:hover:bg-zinc-700 transition-colors disabled:opacity-40 disabled:cursor-not-allowed outline-none focus:outline-none focus-visible:outline-none"
                        >
                            <Copy className="w-3.5 h-3.5" />
                            Copy Draft
                        </button>
                        <button
                            onClick={handleSaveDraft}
                            disabled={!canSave}
                            className="flex items-center gap-1.5 bg-slate-800 dark:bg-zinc-100 text-white dark:text-zinc-900 text-xs px-3 py-1.5 rounded-md hover:bg-slate-700 dark:hover:bg-zinc-300 transition-colors disabled:opacity-40 disabled:cursor-not-allowed outline-none focus:outline-none focus-visible:outline-none"
                        >
                            <Save className="w-3.5 h-3.5" />
                            Save Draft
                        </button>
                    </div>
                </div>
            </div>
        </section>
    );
}
