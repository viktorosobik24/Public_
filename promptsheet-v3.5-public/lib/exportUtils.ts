import JSZip from 'jszip';
import { jsPDF } from 'jspdf';
import type { LibraryItem } from '@/types';

export type ExportFormat = 'txt' | 'md' | 'pdf' | 'json';

/**
 * Sanitize a string for use as a filename.
 */
function sanitizeFilename(name: string): string {
    return name
        .replace(/[<>:"/\\|?*]/g, '')
        .replace(/\s+/g, '_')
        .replace(/_{2,}/g, '_')
        .replace(/^_+|_+$/g, '')
        || 'untitled';
}

/**
 * Format a single item as .txt content.
 */
function formatItemAsTxt(item: LibraryItem): string {
    return `Title: ${item.title}\nDescription: ${item.description}\n---\n${item.content}`;
}

/**
 * Format a single item as .md content.
 */
function formatItemAsMd(item: LibraryItem): string {
    return `# ${item.title}\n${item.description}\n\n---\n\n${item.content}`;
}

/**
 * Get today's date as YYYY-MM-DD.
 */
function getDateString(): string {
    const d = new Date();
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
}

/**
 * Trigger a browser download for a Blob.
 */
function downloadBlob(blob: Blob, filename: string): void {
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
}

/**
 * Generate a PDF blob for a single item.
 */
function generatePdfBlob(item: LibraryItem): Blob {
    const doc = new jsPDF({ unit: 'mm', format: 'a4' });
    const pageWidth = doc.internal.pageSize.getWidth();
    const margin = 15;
    const maxWidth = pageWidth - margin * 2;
    let y = 20;

    // Title
    doc.setFontSize(16);
    doc.setFont('helvetica', 'bold');
    const titleLines = doc.splitTextToSize(item.title || 'Untitled', maxWidth);
    doc.text(titleLines, margin, y);
    y += titleLines.length * 7 + 4;

    // Description
    if (item.description) {
        doc.setFontSize(11);
        doc.setFont('helvetica', 'italic');
        const descLines = doc.splitTextToSize(item.description, maxWidth);
        doc.text(descLines, margin, y);
        y += descLines.length * 5 + 6;
    }

    // Horizontal rule
    doc.setDrawColor(180);
    doc.setLineWidth(0.3);
    doc.line(margin, y, pageWidth - margin, y);
    y += 8;

    // Body content
    doc.setFontSize(11);
    doc.setFont('helvetica', 'normal');
    const bodyLines = doc.splitTextToSize(item.content, maxWidth);
    const lineHeight = 5;
    const pageHeight = doc.internal.pageSize.getHeight();

    for (const line of bodyLines) {
        if (y + lineHeight > pageHeight - margin) {
            doc.addPage();
            y = 20;
        }
        doc.text(line, margin, y);
        y += lineHeight;
    }

    return doc.output('blob');
}

/**
 * Get file content for a given format.
 */
function getFileContent(item: LibraryItem, format: ExportFormat): { content: string | Blob; ext: string } {
    switch (format) {
        case 'md':
            return { content: formatItemAsMd(item), ext: 'md' };
        case 'pdf':
            return { content: generatePdfBlob(item), ext: 'pdf' };
        case 'txt':
        default:
            return { content: formatItemAsTxt(item), ext: 'txt' };
    }
}

// ——— Single-item exports ———

/**
 * Export a single Library item as a .txt file download.
 */
export function exportItemAsTxt(item: LibraryItem): void {
    const content = formatItemAsTxt(item);
    const filename = `${sanitizeFilename(item.title)}.txt`;
    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
    downloadBlob(blob, filename);
}

/**
 * Export a single Library item as a .md file download.
 */
export function exportItemAsMd(item: LibraryItem): void {
    const content = formatItemAsMd(item);
    const filename = `${sanitizeFilename(item.title)}.md`;
    const blob = new Blob([content], { type: 'text/markdown;charset=utf-8' });
    downloadBlob(blob, filename);
}

/**
 * Export a single Library item as a .pdf file download.
 */
export function exportItemAsPdf(item: LibraryItem): void {
    const blob = generatePdfBlob(item);
    const filename = `${sanitizeFilename(item.title)}.pdf`;
    downloadBlob(blob, filename);
}

/**
 * Export a single Library item as a .json file download.
 */
export function exportItemAsJson(item: LibraryItem): void {
    const data = {
        title: item.title,
        description: item.description,
        content: item.content,
    };
    const json = JSON.stringify(data, null, 2);
    const filename = `${sanitizeFilename(item.title)}.json`;
    const blob = new Blob([json], { type: 'application/json;charset=utf-8' });
    downloadBlob(blob, filename);
}

/**
 * Export a single item in the given format.
 */
export function exportItem(item: LibraryItem, format: ExportFormat): void {
    switch (format) {
        case 'md':
            exportItemAsMd(item);
            break;
        case 'pdf':
            exportItemAsPdf(item);
            break;
        case 'json':
            exportItemAsJson(item);
            break;
        case 'txt':
        default:
            exportItemAsTxt(item);
            break;
    }
}

// ——— Bulk exports ———

/**
 * Export all Library items as a single formatted JSON file.
 */
export function exportAllAsJSON(items: LibraryItem[]): void {
    const data = items.map((item) => ({
        title: item.title,
        description: item.description,
        content: item.content,
    }));
    const json = JSON.stringify(data, null, 2);
    const filename = `PromptSheet_export_${getDateString()}.json`;
    const blob = new Blob([json], { type: 'application/json;charset=utf-8' });
    downloadBlob(blob, filename);
}

/**
 * Export items as individual files inside a .zip archive.
 */
export async function exportAllAsZip(
    items: LibraryItem[],
    format: ExportFormat = 'txt'
): Promise<void> {
    const zip = new JSZip();
    const usedNames = new Map<string, number>();

    for (const item of items) {
        let baseName = sanitizeFilename(item.title);
        const count = usedNames.get(baseName) ?? 0;
        if (count > 0) {
            baseName = `${baseName}_${count}`;
        }
        usedNames.set(sanitizeFilename(item.title), count + 1);

        const { content, ext } = getFileContent(item, format);
        if (content instanceof Blob) {
            zip.file(`${baseName}.${ext}`, content);
        } else {
            zip.file(`${baseName}.${ext}`, content);
        }
    }

    const blob = await zip.generateAsync({ type: 'blob' });
    const filename = `PromptSheet_export_${getDateString()}.zip`;
    downloadBlob(blob, filename);
}

/**
 * Export selected items as JSON.
 */
export function exportSelectedAsJSON(items: LibraryItem[]): void {
    exportAllAsJSON(items);
}

/**
 * Export selected items as a zip of files in the given format.
 */
export async function exportSelectedAsZip(
    items: LibraryItem[],
    format: ExportFormat = 'txt'
): Promise<void> {
    await exportAllAsZip(items, format);
}
