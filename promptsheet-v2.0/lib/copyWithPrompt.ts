export async function copyWithPrompt(content: string): Promise<boolean> {
    const placeholderRegex = /\{\{(.*?)\}\}/g;
    const matches = content.match(placeholderRegex);

    let finalContent = content;

    if (matches) {
        const uniqueNames = [...new Set(matches.map((m) => m.slice(2, -2).trim()))];

        for (const name of uniqueNames) {
            const userInput = window.prompt(`Enter value for "{{${name}}}":`, '');
            if (userInput === null) {
                return false;
            }
            const escapedName = name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
            finalContent = finalContent.replace(
                new RegExp(`\\{\\{\\s*${escapedName}\\s*\\}\\}`, 'g'),
                userInput
            );
        }
    }

    try {
        await navigator.clipboard.writeText(finalContent);
        return true;
    } catch {
        return false;
    }
}
