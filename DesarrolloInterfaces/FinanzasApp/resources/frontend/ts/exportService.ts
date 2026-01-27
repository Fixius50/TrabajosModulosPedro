import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import type { Transaction } from '../types';

export const exportToJSON = (data: any, filename: string) => {
    const jsonString = JSON.stringify(data, null, 2);
    const blob = new Blob([jsonString], { type: 'application/json' });
    const href = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = href;
    link.download = `${filename}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(href);
};

export const exportToPDF = (transactions: Transaction[], title: string = 'Reporte de Transacciones') => {
    const doc = new jsPDF();

    doc.setFontSize(18);
    doc.text(title, 14, 22);
    doc.setFontSize(11);
    doc.setTextColor(100);
    doc.text(`Fecha de reporte: ${new Date().toLocaleDateString()}`, 14, 30);

    const tableColumn = ["Fecha", "Descripción", "Categoría", "Tipo", "Monto"];
    const tableRows: any[] = [];

    transactions.forEach(transaction => {
        const transactionData = [
            new Date(transaction.date).toLocaleDateString(),
            transaction.description,
            transaction.category,
            transaction.type === 'income' ? 'Ingreso' : 'Gasto',
            `${transaction.amount.toFixed(2)} €`
        ];
        tableRows.push(transactionData);
    });

    autoTable(doc, {
        head: [tableColumn],
        body: tableRows,
        startY: 35,
        theme: 'grid',
        headStyles: { fillColor: [66, 139, 202] } // Custom blue header
    });

    doc.save('reporte_finanzas.pdf');
};
