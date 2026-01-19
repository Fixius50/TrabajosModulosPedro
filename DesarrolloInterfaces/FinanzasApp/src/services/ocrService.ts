import Tesseract from 'tesseract.js';

export interface OCRResult {
    amount?: number;
    date?: string;
    text: string;
}

export const analyzeReceipt = async (imageFile: File): Promise<OCRResult> => {
    try {
        const result = await Tesseract.recognize(
            imageFile,
            'spa+eng', // Scan for Spanish and English
            { logger: m => console.log(m) }
        );

        const text = result.data.text;
        console.log('OCR Text:', text);

        return {
            amount: extractAmount(text),
            date: extractDate(text),
            text: text
        };

    } catch (error) {
        console.error('OCR Error:', error);
        throw error;
    }
};

const extractAmount = (text: string): number | undefined => {
    // Regex to find currency amounts (e.g., 12.50, 1.200,00)
    // Looks for numbers with decimals, possibly preceded by 'Total' or currency symbols
    const lines = text.split('\n');
    let bestAmount: number | undefined;

    // Strategy 1: Look for "Total" line
    const totalLine = lines.find(l => l.toLowerCase().includes('total'));
    if (totalLine) {
        const matches = totalLine.match(/(\d+[.,]\d{2})/g);
        if (matches) {
            // Parse the last matching number in the "Total" line
            const valStr = matches[matches.length - 1].replace(',', '.'); // Simplify for now
            const val = parseFloat(valStr);
            if (!isNaN(val)) bestAmount = val;
        }
    }

    // Strategy 2: If no "Total", looks for the largest number that looks like a price (simple heuristic)
    if (!bestAmount) {
        const allMatches = text.match(/(\d+[.,]\d{2})/g);
        if (allMatches) {
            const numbers = allMatches.map(m => parseFloat(m.replace(',', '.'))).filter(n => !isNaN(n));
            if (numbers.length > 0) {
                bestAmount = Math.max(...numbers);
            }
        }
    }

    return bestAmount;
};

const extractDate = (text: string): string | undefined => {
    // DD/MM/YYYY or YYYY-MM-DD
    const dateMatch = text.match(/(\d{2}[/-]\d{2}[/-]\d{4})|(\d{4}[/-]\d{2}[/-]\d{2})/);
    if (dateMatch) {
        // Try to parse it
        try {
            let dateStr = dateMatch[0];
            // Normalize separators
            dateStr = dateStr.replace(/-/g, '/');
            const parts = dateStr.split('/');

            if (parts[0].length === 4) {
                // YYYY/MM/DD
                return new Date(dateStr).toISOString();
            } else {
                // DD/MM/YYYY
                const [d, m, y] = parts;
                return new Date(`${y}-${m}-${d}`).toISOString();
            }
        } catch (e) {
            console.warn('Date parse error', e);
        }
    }
    return undefined;
};
