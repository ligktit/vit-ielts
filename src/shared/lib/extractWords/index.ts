export function extractWords(text: string): string[] {
    const regex = /\{(.*?)\}/g;
    const matches = [];
    let match;

    while ((match = regex.exec(text)) !== null) {
        if (match[1].trim() !== '') {
            matches.push(match[1].replace(/\s*\|\s*/g, '|').trim());
        }
    }

    return matches;
}