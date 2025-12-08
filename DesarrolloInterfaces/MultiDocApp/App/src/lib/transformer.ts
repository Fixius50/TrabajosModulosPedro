
import html2canvas from 'html2canvas'
import jsPDF from 'jspdf'
import { saveAs } from 'file-saver'

export const Transformer = {
    async toPDF(elementId: string, filename: string = 'document.pdf') {
        const element = document.getElementById(elementId)
        if (!element) throw new Error('Element not found')

        try {
            const canvas = await html2canvas(element, {
                scale: 2, // Better resolution
                useCORS: true, // Allow external images
                logging: false,
                backgroundColor: '#ffffff'
            })

            const imgData = canvas.toDataURL('image/png')
            const pdf = new jsPDF({
                orientation: 'portrait',
                unit: 'mm',
                format: 'a4'
            })

            const imgWidth = 210 // A4 width in mm
            const pageHeight = 297 // A4 height in mm
            const imgHeight = (canvas.height * imgWidth) / canvas.width

            let heightLeft = imgHeight
            let position = 0

            pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight)
            heightLeft -= pageHeight

            while (heightLeft >= 0) {
                position = heightLeft - imgHeight
                pdf.addPage()
                pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight)
                heightLeft -= pageHeight
            }

            pdf.save(filename)
        } catch (error) {
            console.error('PDF Generation failed:', error)
            throw error
        }
    },

    async toImage(elementId: string, filename: string = 'capture.png') {
        const element = document.getElementById(elementId)
        if (!element) throw new Error('Element not found')

        try {
            const canvas = await html2canvas(element, { useCORS: true })
            canvas.toBlob((blob) => {
                if (blob) saveAs(blob, filename)
            })
        } catch (error) {
            console.error('Image Generation failed:', error)
            throw error
        }
    },

    downloadFile(content: string | Blob, filename: string) {
        const blob = content instanceof Blob ? content : new Blob([content], { type: 'text/plain;charset=utf-8' })
        saveAs(blob, filename)
    }
}
