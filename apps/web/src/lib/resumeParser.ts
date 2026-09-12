import { pdfjsLib } from './pdfWorker';
import mammoth from 'mammoth';

export async function parsePdfText(file: File): Promise<string> {
    try {
        const arrayBuffer = await file.arrayBuffer();
        const loadingTask = pdfjsLib.getDocument({ data: arrayBuffer });

        const pdf = await loadingTask.promise;
        if (pdf.numPages === 0) {
            throw new Error('PDF has no pages.');
        }

        let textContent = '';
        for (let i = 1; i <= pdf.numPages; i++) {
            const page = await pdf.getPage(i);
            const content = await page.getTextContent();
            const strings = content.items.map((item: any) => item.str || '');

            textContent += strings.join(' ') + '\n\n';
        }

        // Attempt to normalize random weird spaces
        const final = textContent.replace(/\s{3,}/g, ' ').trim();
        if (!final) {
            throw new Error("This PDF doesn't contain selectable text. Please upload a text-based PDF or DOCX.");
        }
        return final;
    } catch (err: any) {
        if (err.message?.includes('selectable text')) {
            throw err; // Re-throw our explicit scanned error
        }
        console.error('PDF Parse error:', err);
        throw new Error("We couldn't process this PDF. Please try another PDF file.");
    }
}

export async function parseDocxText(file: File): Promise<string> {
    try {
        const arrayBuffer = await file.arrayBuffer();
        const result = await mammoth.extractRawText({ arrayBuffer });
        const final = result.value.trim();
        if (!final) {
            throw new Error("This DOCX doesn't contain selectable text.");
        }
        return final;
    } catch (err) {
        console.error('DOCX Parse error:', err);
        throw new Error("We couldn't process this Word document. Please try another DOCX file.");
    }
}
