import type { LibraryItem } from '@/types';

export const LIBRARY_MAX_CAPACITY = 100;

/**
 * Returns true if the library has reached its maximum capacity (100 items).
 */
export function isLibraryFull(items: LibraryItem[]): boolean {
    return items.length >= LIBRARY_MAX_CAPACITY;
}

/**
 * Renders a dismissible error modal displaying the provided message.
 *
 * Usage (future phase): call this from App-level state to set an error message,
 * then render `<ErrorModal message={errorMessage} onDismiss={...} />`.
 *
 * This function signature is provided as a convenience wrapper.
 * The actual rendering is handled by the ErrorModal React component.
 */
export function showErrorModal(
    message: string,
    setError: (msg: string | null) => void
): void {
    setError(message);
}
