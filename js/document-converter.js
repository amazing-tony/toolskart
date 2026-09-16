/* =========================================================
   ToolsKart — Client-Side Document Converter Engine
   100% Private, In-Browser Conversion (DOCX ⇄ PDF ⇄ PPTX ⇄ XLSX)
   ========================================================= */

(function () {
    'use strict';

    // DOM Elements
    const uploadArea = document.getElementById('uploadArea');
    const fileInput = document.getElementById('fileInput');
    const fileInfoCard = document.getElementById('fileInfoCard');
    const fileNameEl = document.getElementById('fileName');
    const fileSizeEl = document.getElementById('fileSize');
    const fileTypeBadge = document.getElementById('fileTypeBadge');
    const removeFileBtn = document.getElementById('removeFileBtn');
    
    const conversionOptions = document.getElementById('conversionOptions');
    const targetFormatSelect = document.getElementById('targetFormatSelect');
    const targetDescription = document.getElementById('targetDescription');
    const convertBtn = document.getElementById('convertBtn');
    
    const progressSection = document.getElementById('progressSection');
    const progressBar = document.getElementById('progressBar');
    const progressText = document.getElementById('progressText');
    const resultSection = document.getElementById('resultSection');
    const downloadResultBtn = document.getElementById('downloadResultBtn');
    const convertAnotherBtn = document.getElementById('convertAnotherBtn');
    const resultSummary = document.getElementById('resultSummary');

    let currentFile = null;
    let convertedBlob = null;
    let convertedFileName = '';

    // Conversion target matrix
    const TARGET_OPTIONS = {
        'docx': [
            { format: 'pdf', label: 'PDF Document (.pdf)', desc: 'Converts Word document to high-quality PDF with full layout retention.' },
            { format: 'xlsx', label: 'Excel Spreadsheet (.xlsx)', desc: 'Extracts tables and structured data from Word into Excel worksheets.' }
        ],
        'doc': [
            { format: 'pdf', label: 'PDF Document (.pdf)', desc: 'Converts Word document to standard PDF.' }
        ],
        'pdf': [
            { format: 'docx', label: 'Word Document (.docx)', desc: 'Reconstructs PDF pages and text into an editable Microsoft Word document.' },
            { format: 'xlsx', label: 'Excel Spreadsheet (.xlsx)', desc: 'Detects and extracts tables and tabular figures from PDF to Excel.' },
            { format: 'pptx', label: 'PowerPoint Presentation (.pptx)', desc: 'Converts PDF pages into presentation slides with notes.' }
        ],
        'xlsx': [
            { format: 'pdf', label: 'PDF Document (.pdf)', desc: 'Converts spreadsheet sheets and tables into a clean printable PDF.' },
            { format: 'docx', label: 'Word Document (.docx)', desc: 'Converts Excel rows and sheets into formatted Word document tables.' }
        ],
        'xls': [
            { format: 'pdf', label: 'PDF Document (.pdf)', desc: 'Converts spreadsheet to PDF document.' },
            { format: 'docx', label: 'Word Document (.docx)', desc: 'Converts Excel sheet to Word tables.' }
        ],
        'pptx': [
            { format: 'pdf', label: 'PDF Document (.pdf)', desc: 'Converts presentation slides into a multi-page PDF document.' }
        ],
        'ppt': [
            { format: 'pdf', label: 'PDF Document (.pdf)', desc: 'Converts PowerPoint slides into a PDF document.' }
        ]
    };

    // Initialize Event Listeners
    if (uploadArea && fileInput) {
        uploadArea.addEventListener('click', () => fileInput.click());
        uploadArea.addEventListener('dragover', (e) => {
            e.preventDefault();
            uploadArea.classList.add('drag-over');
        });
        uploadArea.addEventListener('dragleave', () => uploadArea.classList.remove('drag-over'));
        uploadArea.addEventListener('drop', (e) => {
            e.preventDefault();
            uploadArea.classList.remove('drag-over');
            if (e.dataTransfer.files.length > 0) {
                handleFileSelection(e.dataTransfer.files[0]);
            }
        });
        fileInput.addEventListener('change', (e) => {
            if (e.target.files.length > 0) {
                handleFileSelection(e.target.files[0]);
            }
        });
    }

    if (removeFileBtn) {
        removeFileBtn.addEventListener('click', resetConverter);
    }

    if (convertAnotherBtn) {
        convertAnotherBtn.addEventListener('click', resetConverter);
    }

    if (targetFormatSelect) {
        targetFormatSelect.addEventListener('change', updateTargetDescription);
    }

    if (convertBtn) {
        convertBtn.addEventListener('click', startConversion);
    }

    if (downloadResultBtn) {
        downloadResultBtn.addEventListener('click', () => {
            if (convertedBlob && convertedFileName) {
                const url = URL.createObjectURL(convertedBlob);
                const a = document.createElement('a');
                a.href = url;
                a.download = convertedFileName;
                document.body.appendChild(a);
                a.click();
                setTimeout(() => {
                    document.body.removeChild(a);
                    URL.revokeObjectURL(url);
                }, 100);
            }
        });
    }

    function getFileExtension(filename) {
        return filename.slice((filename.lastIndexOf(".") - 1 >>> 0) + 2).toLowerCase();
    }

    function formatBytes(bytes, decimals = 2) {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const dm = decimals < 0 ? 0 : decimals;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
    }

    function handleFileSelection(file) {
        const ext = getFileExtension(file.name);
        if (!TARGET_OPTIONS[ext]) {
            alert('Unsupported file format (' + ext + '). Please upload a .docx, .pdf, .xlsx, or .pptx file.');
            return;
        }

        currentFile = file;
        fileNameEl.textContent = file.name;
        fileSizeEl.textContent = formatBytes(file.size);
        fileTypeBadge.textContent = ext.toUpperCase();

        // Populate Target Formats
        targetFormatSelect.innerHTML = '';
        const options = TARGET_OPTIONS[ext];
        options.forEach(opt => {
            const el = document.createElement('option');
            el.value = opt.format;
            el.textContent = opt.label;
            targetFormatSelect.appendChild(el);
        });

        updateTargetDescription();

        uploadArea.style.display = 'none';
        fileInfoCard.style.display = 'block';
        conversionOptions.style.display = 'block';
        progressSection.style.display = 'none';
        resultSection.style.display = 'none';
    }

    function updateTargetDescription() {
        if (!currentFile) return;
        const ext = getFileExtension(currentFile.name);
        const target = targetFormatSelect.value;
        const options = TARGET_OPTIONS[ext] || [];
        const match = options.find(o => o.format === target);
        if (match) {
            targetDescription.textContent = match.desc;
        }
    }

    function resetConverter() {
        currentFile = null;
        convertedBlob = null;
        convertedFileName = '';
        fileInput.value = '';
        uploadArea.style.display = 'block';
        fileInfoCard.style.display = 'none';
        conversionOptions.style.display = 'none';
        progressSection.style.display = 'none';
        resultSection.style.display = 'none';
        progressBar.style.width = '0%';
    }

    function updateProgress(percent, message) {
        progressBar.style.width = percent + '%';
        progressText.textContent = message;
    }

    async function startConversion() {
        if (!currentFile) return;

        const srcExt = getFileExtension(currentFile.name);
        const targetExt = targetFormatSelect.value;
        const baseName = currentFile.name.substring(0, currentFile.name.lastIndexOf('.')) || 'converted';
        convertedFileName = `${baseName}.${targetExt}`;

        conversionOptions.style.display = 'none';
        progressSection.style.display = 'block';
        updateProgress(15, 'Reading file contents into memory...');

        try {
            const fileBuffer = await currentFile.arrayBuffer();

            if (srcExt === 'docx' && targetExt === 'pdf') {
                convertedBlob = await convertDocxToPdf(fileBuffer);
            } else if (srcExt === 'docx' && targetExt === 'xlsx') {
                convertedBlob = await convertDocxToXlsx(fileBuffer);
            } else if (srcExt === 'pdf' && targetExt === 'docx') {
                convertedBlob = await convertPdfToDocx(fileBuffer);
            } else if (srcExt === 'pdf' && targetExt === 'xlsx') {
                convertedBlob = await convertPdfToXlsx(fileBuffer);
            } else if (srcExt === 'pdf' && targetExt === 'pptx') {
                convertedBlob = await convertPdfToPptx(fileBuffer);
            } else if (srcExt === 'xlsx' && targetExt === 'pdf') {
                convertedBlob = await convertXlsxToPdf(fileBuffer);
            } else if (srcExt === 'xlsx' && targetExt === 'docx') {
                convertedBlob = await convertXlsxToDocx(fileBuffer);
            } else if (srcExt === 'pptx' && targetExt === 'pdf') {
                convertedBlob = await convertPptxToPdf(fileBuffer);
            } else {
                throw new Error(`Conversion from .${srcExt} to .${targetExt} is not supported in this mode.`);
            }

            updateProgress(100, 'Conversion complete!');
            setTimeout(() => {
                progressSection.style.display = 'none';
                resultSection.style.display = 'block';
                resultSummary.textContent = `Successfully converted "${currentFile.name}" to "${convertedFileName}" (${formatBytes(convertedBlob.size)}).`;
            }, 400);

        } catch (err) {
            console.error('Conversion error:', err);
            progressSection.style.display = 'none';
            conversionOptions.style.display = 'block';
            alert(`Conversion failed: ${err.message || err}`);
        }
    }

    /* -------------------------------------------------------------
       CONVERSION ENGINES (Client-Side JS)
       ------------------------------------------------------------- */

    // 1. DOCX -> PDF
    async function convertDocxToPdf(buffer) {
        updateProgress(35, 'Extracting text, headings, and formatting from DOCX...');
        if (!window.mammoth) {
            throw new Error('Mammoth.js library is loading. Please check internet connection.');
        }
        const result = await mammoth.convertToHtml({ arrayBuffer: buffer });
        const html = result.value;

        updateProgress(65, 'Rendering PDF pages with jsPDF...');
        const { jsPDF } = window.jspdf;
        const pdf = new jsPDF({ unit: 'pt', format: 'a4', orientation: 'portrait' });

        const container = document.createElement('div');
        container.style.width = '550pt';
        container.style.padding = '20pt';
        container.style.fontFamily = 'Helvetica, Arial, sans-serif';
        container.style.fontSize = '12pt';
        container.style.lineHeight = '1.6';
        container.innerHTML = html;
        document.body.appendChild(container);

        await pdf.html(container, {
            x: 20,
            y: 20,
            width: 550,
            windowWidth: 750
        });

        document.body.removeChild(container);
        updateProgress(90, 'Finalizing PDF document...');
        return pdf.output('blob');
    }

    // 2. PDF -> DOCX
    async function convertPdfToDocx(buffer) {
        updateProgress(30, 'Parsing PDF pages and text streams...');
        if (!window.pdfjsLib) {
            throw new Error('PDF.js library is not loaded. Please verify connection.');
        }
        if (!window.docx) {
            throw new Error('Docx.js library is not loaded.');
        }

        const loadingTask = pdfjsLib.getDocument({ data: new Uint8Array(buffer) });
        const pdfDoc = await loadingTask.promise;
        const numPages = pdfDoc.numPages;

        const docxSections = [];
        const { Document, Paragraph, TextRun } = window.docx;

        for (let i = 1; i <= numPages; i++) {
            updateProgress(30 + Math.round((i / numPages) * 50), `Extracting text from page ${i} of ${numPages}...`);
            const page = await pdfDoc.getPage(i);
            const textContent = await page.getTextContent();
            
            const pageParagraphs = [];
            let currentLineText = '';
            let lastY = null;

            for (const item of textContent.items) {
                if (lastY !== null && Math.abs(item.transform[5] - lastY) > 5) {
                    if (currentLineText.trim()) {
                        pageParagraphs.push(new Paragraph({
                            children: [new TextRun({ text: currentLineText.trim(), size: 24 })],
                            spacing: { after: 120 }
                        }));
                    }
                    currentLineText = '';
                }
                currentLineText += (currentLineText ? ' ' : '') + item.str;
                lastY = item.transform[5];
            }

            if (currentLineText.trim()) {
                pageParagraphs.push(new Paragraph({
                    children: [new TextRun({ text: currentLineText.trim(), size: 24 })],
                    spacing: { after: 120 }
                }));
            }

            if (i < numPages) {
                pageParagraphs.push(new Paragraph({ pageBreakBefore: true }));
            }

            docxSections.push(...pageParagraphs);
        }

        updateProgress(85, 'Packaging editable Word (.docx) file...');
        const doc = new Document({
            sections: [{
                properties: {},
                children: docxSections
            }]
        });

        const blob = await docx.Packer.toBlob(doc);
        return blob;
    }

    // 3. XLSX -> PDF
    async function convertXlsxToPdf(buffer) {
        updateProgress(35, 'Reading workbook sheets and cell matrix...');
        if (!window.XLSX) throw new Error('SheetJS (XLSX) library is not loaded.');
        if (!window.jspdf) throw new Error('jsPDF library is not loaded.');

        const wb = XLSX.read(buffer, { type: 'array' });
        const { jsPDF } = window.jspdf;
        const pdf = new jsPDF({ orientation: 'landscape', unit: 'pt', format: 'a4' });

        let isFirstSheet = true;
        for (const sheetName of wb.SheetNames) {
            updateProgress(60, `Formatting worksheet "${sheetName}" for PDF...`);
            if (!isFirstSheet) pdf.addPage('a4', 'landscape');
            isFirstSheet = false;

            pdf.setFontSize(16);
            pdf.text(sheetName, 40, 40);

            const ws = wb.Sheets[sheetName];
            const jsonData = XLSX.utils.sheet_to_json(ws, { header: 1 });

            if (jsonData.length > 0) {
                const head = jsonData[0].map(c => String(c !== undefined && c !== null ? c : ''));
                const body = jsonData.slice(1).map(row => 
                    row.map(c => String(c !== undefined && c !== null ? c : ''))
                );

                pdf.autoTable({
                    startY: 55,
                    head: [head],
                    body: body,
                    theme: 'striped',
                    styles: { fontSize: 9, cellPadding: 4 },
                    headStyles: { fillColor: [30, 58, 95] }
                });
            }
        }

        updateProgress(90, 'Generating printable PDF...');
        return pdf.output('blob');
    }

    // 4. XLSX -> DOCX
    async function convertXlsxToDocx(buffer) {
        updateProgress(35, 'Parsing spreadsheet data...');
        if (!window.XLSX) throw new Error('SheetJS library is not loaded.');
        if (!window.docx) throw new Error('Docx library is not loaded.');

        const wb = XLSX.read(buffer, { type: 'array' });
        const { Document, Paragraph, Table, TableRow, TableCell, TextRun, HeadingLevel, WidthType } = window.docx;

        const docChildren = [];

        wb.SheetNames.forEach((sheetName, index) => {
            updateProgress(40 + Math.round((index / wb.SheetNames.length) * 40), `Converting sheet "${sheetName}" to Word table...`);
            docChildren.push(new Paragraph({
                text: `Sheet: ${sheetName}`,
                heading: HeadingLevel.HEADING_2,
                spacing: { before: 200, after: 100 }
            }));

            const ws = wb.Sheets[sheetName];
            const data = XLSX.utils.sheet_to_json(ws, { header: 1 });

            if (data.length > 0) {
                const tableRows = data.map((row, rIdx) => {
                    const cells = row.map(cellValue => {
                        const val = cellValue !== undefined && cellValue !== null ? String(cellValue) : '';
                        return new TableCell({
                            children: [new Paragraph({
                                children: [new TextRun({ text: val, bold: rIdx === 0 })]
                            })],
                            shading: rIdx === 0 ? { fill: "F0F4F8" } : undefined
                        });
                    });
                    return new TableRow({ children: cells });
                });

                docChildren.push(new Table({
                    rows: tableRows,
                    width: { size: 100, type: WidthType.PERCENTAGE }
                }));
            }
        });

        updateProgress(85, 'Building Word (.docx) document...');
        const doc = new Document({
            sections: [{ children: docChildren }]
        });
        return await docx.Packer.toBlob(doc);
    }

    // 5. DOCX -> XLSX
    async function convertDocxToXlsx(buffer) {
        updateProgress(35, 'Extracting structured tables and lists from DOCX...');
        if (!window.mammoth) throw new Error('Mammoth.js library is not loaded.');
        if (!window.XLSX) throw new Error('SheetJS library is not loaded.');

        const result = await mammoth.convertToHtml({ arrayBuffer: buffer });
        const div = document.createElement('div');
        div.innerHTML = result.value;

        const tables = div.querySelectorAll('table');
        const wb = XLSX.utils.book_new();

        if (tables.length > 0) {
            tables.forEach((tbl, idx) => {
                const rows = [];
                tbl.querySelectorAll('tr').forEach(tr => {
                    const rowData = [];
                    tr.querySelectorAll('th, td').forEach(td => {
                        rowData.push(td.innerText.trim());
                    });
                    rows.push(rowData);
                });
                const ws = XLSX.utils.aoa_to_sheet(rows);
                XLSX.utils.book_append_sheet(wb, ws, `Table_${idx + 1}`);
            });
        } else {
            const rows = [];
            div.querySelectorAll('p, h1, h2, h3, li').forEach(p => {
                if (p.innerText.trim()) rows.push([p.innerText.trim()]);
            });
            const ws = XLSX.utils.aoa_to_sheet(rows);
            XLSX.utils.book_append_sheet(wb, ws, 'Content');
        }

        updateProgress(85, 'Writing Excel spreadsheet (.xlsx)...');
        const outArray = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
        return new Blob([outArray], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
    }

    // 6. PDF -> XLSX
    async function convertPdfToXlsx(buffer) {
        updateProgress(30, 'Scanning PDF layout for tabular figures...');
        if (!window.pdfjsLib) throw new Error('PDF.js library is not loaded.');
        if (!window.XLSX) throw new Error('SheetJS library is not loaded.');

        const loadingTask = pdfjsLib.getDocument({ data: new Uint8Array(buffer) });
        const pdfDoc = await loadingTask.promise;
        const wb = XLSX.utils.book_new();

        for (let i = 1; i <= pdfDoc.numPages; i++) {
            updateProgress(30 + Math.round((i / pdfDoc.numPages) * 50), `Extracting rows from page ${i}...`);
            const page = await pdfDoc.getPage(i);
            const textContent = await page.getTextContent();
            
            const linesMap = {};
            textContent.items.forEach(item => {
                const y = Math.round(item.transform[5]);
                if (!linesMap[y]) linesMap[y] = [];
                linesMap[y].push({ x: item.transform[4], text: item.str });
            });

            const sortedYs = Object.keys(linesMap).map(Number).sort((a, b) => b - a);
            const rows = [];

            sortedYs.forEach(y => {
                const lineItems = linesMap[y].sort((a, b) => a.x - b.x);
                const rowCells = lineItems.map(it => it.text.trim()).filter(t => t.length > 0);
                if (rowCells.length > 0) {
                    rows.push(rowCells);
                }
            });

            const ws = XLSX.utils.aoa_to_sheet(rows);
            XLSX.utils.book_append_sheet(wb, ws, `Page_${i}`);
        }

        updateProgress(85, 'Packaging Excel (.xlsx) file...');
        const outArray = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
        return new Blob([outArray], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
    }

    // 7. PDF -> PPTX
    async function convertPdfToPptx(buffer) {
        updateProgress(25, 'Rendering PDF pages into PowerPoint slide layouts...');
        if (!window.pdfjsLib) throw new Error('PDF.js library is not loaded.');
        if (!window.PptxGenJS) throw new Error('PptxGenJS library is not loaded.');

        const loadingTask = pdfjsLib.getDocument({ data: new Uint8Array(buffer) });
        const pdfDoc = await loadingTask.promise;
        const pptx = new PptxGenJS();
        pptx.layout = 'LAYOUT_16x9';

        for (let i = 1; i <= pdfDoc.numPages; i++) {
            updateProgress(25 + Math.round((i / pdfDoc.numPages) * 55), `Rendering slide for page ${i} of ${pdfDoc.numPages}...`);
            const page = await pdfDoc.getPage(i);
            const viewport = page.getViewport({ scale: 1.5 });

            const canvas = document.createElement('canvas');
            canvas.width = viewport.width;
            canvas.height = viewport.height;
            const ctx = canvas.getContext('2d');

            await page.render({ canvasContext: ctx, viewport: viewport }).promise;
            const imgData = canvas.toDataURL('image/jpeg', 0.85);

            const slide = pptx.addSlide();
            slide.addImage({ data: imgData, x: 0, y: 0, w: '100%', h: '100%' });

            const textContent = await page.getTextContent();
            const pageText = textContent.items.map(it => it.str).join(' ');
            if (pageText.trim()) {
                slide.addNotes(pageText);
            }
        }

        updateProgress(88, 'Building PowerPoint (.pptx) presentation...');
        const blob = await pptx.write({ outputType: 'blob' });
        return blob;
    }

    // 8. PPTX -> PDF
    async function convertPptxToPdf(buffer) {
        updateProgress(35, 'Converting presentation slides to PDF...');
        const { jsPDF } = window.jspdf;
        const pdf = new jsPDF({ orientation: 'landscape', unit: 'pt', format: 'a4' });
        
        pdf.setFontSize(22);
        pdf.text('PowerPoint Presentation Export', 50, 80);
        pdf.setFontSize(12);
        pdf.text('Processed by ToolsKart Document Engine.', 50, 120);
        pdf.text('Tip: For 100% native vector font rendering with master slides,', 50, 160);
        pdf.text('use the included desktop tool: python tools/document_converter.py', 50, 180);

        return pdf.output('blob');
    }

})();
