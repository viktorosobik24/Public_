import { useState, useEffect, useCallback } from 'react';

export function useStorage<T>(
    key: string,
    defaultValue: T
): [T, (value: T | ((prev: T) => T)) => void, boolean] {
    const [value, setValueState] = useState<T>(defaultValue);
    const [loading, setLoading] = useState<boolean>(true);

    useEffect(() => {
        chrome.storage.local.get(key).then((result: Record<string, unknown>) => {
            if (result[key] !== undefined) {
                setValueState(result[key] as T);
            }
            setLoading(false);
        });
    }, [key]);

    useEffect(() => {
        const listener = (
            changes: { [key: string]: chrome.storage.StorageChange },
            areaName: string
        ) => {
            if (areaName === 'local' && changes[key]) {
                setValueState(changes[key].newValue as T);
            }
        };

        chrome.storage.onChanged.addListener(listener);
        return () => chrome.storage.onChanged.removeListener(listener);
    }, [key]);

    const setValue = useCallback(
        (newValue: T | ((prev: T) => T)) => {
            setValueState((prev) => {
                const resolved =
                    typeof newValue === 'function'
                        ? (newValue as (prev: T) => T)(prev)
                        : newValue;
                chrome.storage.local.set({ [key]: resolved });
                return resolved;
            });
        },
        [key]
    );

    return [value, setValue, loading];
}
