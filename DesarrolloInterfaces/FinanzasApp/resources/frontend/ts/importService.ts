import Papa from 'papaparse';
import type { Transaction } from './types';

export interface CSVRow {
    [key: string]: string;
}

export interface ImportMapping {
    date_col: string;
    amount_col: string;
    desc_col: string;
}

export const parseCSV = (file: File): Promise<CSVRow[]> => {
    return new Promise((resolve, reject) => {
        Papa.parse(file, {
            header: true,
            skipEmptyLines: true,
            complete: (results) => {
                resolve(results.data as CSVRow[]);
            },
            error: (error) => {
                reject(error);
            }
        });
    });
};

export const normalizeTransaction = (row: CSVRow, mapping: ImportMapping): Partial<Transaction> => {
    // 1. Parse Amount
    let amountStr = row[mapping.amount_col];
    // Remove symbols like € or $ and replace comma decimals if EUR format
    amountStr = amountStr.replace(/[€$]/g, '').trim();
    if (amountStr.includes(',') && !amountStr.includes('.')) {
        // European format: 1.200,50 -> 1200.50
        amountStr = amountStr.replace(/\./g, '').replace(',', '.');
    } else if (amountStr.includes(',') && amountStr.includes('.')) {
        // Mixed like 1,200.50 (US) vs 1.200,50 (EU). Heuristic: last separator is decimal
        const lastComma = amountStr.lastIndexOf(',');
        const lastDot = amountStr.lastIndexOf('.');
        if (lastComma > lastDot) {
            // EU
            amountStr = amountStr.replace(/\./g, '').replace(',', '.');
        } else {
            // US
            amountStr = amountStr.replace(/,/g, '');
        }
    }
    const amount = parseFloat(amountStr) || 0;

    // 2. Parse Date
    // Try to detect DD/MM/YYYY or YYYY-MM-DD
    const dateStr = row[mapping.date_col];
    let date = new Date().toISOString();

    // Simple parser for common formats (can be improved with libraries like date-fns)
    if (dateStr.includes('/')) {
        const parts = dateStr.split('/');
        if (parts.length === 3) {
            // Assume DD/MM/YYYY for now as it's common in EU banks
            // If year is first, it handles itself usually
            if (parts[0].length === 4) {
                date = new Date(dateStr).toISOString();
            } else {
                // DD/MM/YYYY
                const d = parts[0];
                const m = parts[1];
                const y = parts[2];
                date = new Date(`${y}-${m}-${d}`).toISOString();
            }
        }
    } else {
        const d = new Date(dateStr);
        if (!isNaN(d.getTime())) date = d.toISOString();
    }

    // 3. Determine Type
    const type: 'income' | 'expense' = amount >= 0 ? 'income' : 'expense';

    return {
        amount: Math.abs(amount),
        description: row[mapping.desc_col] || 'Imported Transaction',
        date: date,
        type: type,
        category: 'Otros' // Default category
    };
};
