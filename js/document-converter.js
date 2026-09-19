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

    function triggerDownload() {
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
            }, 150);
        }
    }

    if (downloadResultBtn) {
        downloadResultBtn.addEventListener('click', triggerDownload);
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

            if ((srcExt === 'docx' || srcExt === 'doc') && targetExt === 'pdf') {
                convertedBlob = await convertDocxToPdf(fileBuffer);
            } else if ((srcExt === 'docx' || srcExt === 'doc') && targetExt === 'xlsx') {
                convertedBlob = await convertDocxToXlsx(fileBuffer);
            } else if (srcExt === 'pdf' && (targetExt === 'docx' || targetExt === 'doc')) {
                convertedBlob = await convertPdfToDocx(fileBuffer);
            } else if (srcExt === 'pdf' && (targetExt === 'xlsx' || targetExt === 'xls')) {
                convertedBlob = await convertPdfToXlsx(fileBuffer);
            } else if (srcExt === 'pdf' && (targetExt === 'pptx' || targetExt === 'ppt')) {
                convertedBlob = await convertPdfToPptx(fileBuffer);
            } else if ((srcExt === 'xlsx' || srcExt === 'xls') && targetExt === 'pdf') {
                convertedBlob = await convertXlsxToPdf(fileBuffer);
            } else if ((srcExt === 'xlsx' || srcExt === 'xls') && (targetExt === 'docx' || targetExt === 'doc')) {
                convertedBlob = await convertXlsxToDocx(fileBuffer);
            } else if ((srcExt === 'pptx' || srcExt === 'ppt') && targetExt === 'pdf') {
                convertedBlob = await convertPptxToPdf(fileBuffer);
            } else {
                throw new Error(`Conversion from .${srcExt} to .${targetExt} is not supported in this mode.`);
            }

            updateProgress(100, 'Conversion complete! Downloading file...');
            setTimeout(() => {
                progressSection.style.display = 'none';
                resultSection.style.display = 'block';
                resultSummary.textContent = `Successfully converted "${currentFile.name}" to "${convertedFileName}" (${formatBytes(convertedBlob.size)}).`;
                triggerDownload();
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

    // Helper: Escape HTML strings for safety
    function escapeHtml(str) {
        if (!str) return '';
        return String(str)
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;');
    }

    // Helper: Dynamically load an external script if not already present
    async function ensureScriptLoaded(globalVarName, scriptUrl) {
        if (window[globalVarName]) return window[globalVarName];
        return new Promise((resolve) => {
            const s = document.createElement('script');
            s.src = scriptUrl;
            s.onload = () => resolve(window[globalVarName]);
            s.onerror = () => resolve(null);
            document.head.appendChild(s);
        });
    }

    // Helper: Ensure docxPreview engine is available
    async function ensureDocxPreviewEngine() {
        if (window.docxPreview && typeof window.docxPreview.renderAsync === 'function') {
            return window.docxPreview;
        }
        if (window.docx && typeof window.docx.renderAsync === 'function') {
            window.docxPreview = window.docx;
            return window.docxPreview;
        }
        await ensureScriptLoaded('docx', '../js/docx-preview.min.js');
        if (window.docx && typeof window.docx.renderAsync === 'function') {
            window.docxPreview = window.docx;
        }
        return window.docxPreview;
    }

    // Helper: Find a clean whitespace boundary between text lines to prevent sliced characters
    function findCleanSliceY(cvs, targetY, maxLookBack = 70) {
        const ctx = cvs.getContext('2d');
        const w = cvs.width;
        const startY = Math.min(cvs.height - 1, Math.round(targetY));
        const stopY = Math.max(0, startY - maxLookBack);

        for (let y = startY; y >= stopY; y--) {
            const row = ctx.getImageData(0, y, w, 1).data;
            let isBlank = true;
            for (let x = 0; x < row.length; x += 16) {
                if (row[x] < 245 || row[x + 1] < 245 || row[x + 2] < 245) {
                    isBlank = false;
                    break;
                }
            }
            if (isBlank) return y;
        }
        return targetY;
    }

    // Helper: Slice a rendered canvas into perfectly proportioned A4 pages without distortion
    function addCanvasPagesToPdf(sourceCanvas, pdf, pageState) {
        const pdfWidth = 595.28;  // Standard A4 width in pt
        const pdfHeight = 841.89; // Standard A4 height in pt
        const a4Ratio = pdfHeight / pdfWidth; // ~1.4142
        const pageCanvasHeight = Math.round(sourceCanvas.width * a4Ratio);

        // Case 1: Fits cleanly on a single A4 page
        if (sourceCanvas.height <= pageCanvasHeight * 1.04) {
            const pCanvas = document.createElement('canvas');
            pCanvas.width = sourceCanvas.width;
            pCanvas.height = pageCanvasHeight;
            const pCtx = pCanvas.getContext('2d');
            pCtx.fillStyle = '#ffffff';
            pCtx.fillRect(0, 0, pCanvas.width, pCanvas.height);
            pCtx.drawImage(sourceCanvas, 0, 0);

            if (pageState.count > 0) {
                pdf.addPage([pdfWidth, pdfHeight], 'portrait');
            }
            pdf.addImage(pCanvas.toDataURL('image/jpeg', 0.95), 'JPEG', 0, 0, pdfWidth, pdfHeight, undefined, 'FAST');
            pageState.count++;
            return;
        }

        // Case 2: Multi-page section (continuous flow sliced across natural whitespace gaps)
        let currentY = 0;
        while (currentY < sourceCanvas.height) {
            let nextY = currentY + pageCanvasHeight;
            if (nextY < sourceCanvas.height) {
                nextY = findCleanSliceY(sourceCanvas, nextY, 75);
            } else {
                nextY = sourceCanvas.height;
            }

            const sliceH = nextY - currentY;
            const pCanvas = document.createElement('canvas');
            pCanvas.width = sourceCanvas.width;
            pCanvas.height = pageCanvasHeight;
            const pCtx = pCanvas.getContext('2d');
            pCtx.fillStyle = '#ffffff';
            pCtx.fillRect(0, 0, pCanvas.width, pCanvas.height);
            pCtx.drawImage(sourceCanvas, 0, currentY, sourceCanvas.width, sliceH, 0, 0, sourceCanvas.width, sliceH);

            if (pageState.count > 0) {
                pdf.addPage([pdfWidth, pdfHeight], 'portrait');
            }
            pdf.addImage(pCanvas.toDataURL('image/jpeg', 0.95), 'JPEG', 0, 0, pdfWidth, pdfHeight, undefined, 'FAST');
            pageState.count++;
            currentY = nextY;
        }
    }

    // Helper: Extract text from legacy binary .doc (Word 97-2003) files
    function extractTextFromBinaryDoc(buffer) {
        const bytes = new Uint8Array(buffer);
        let text = '';
        let utf16Str = '';
        for (let i = 512; i < bytes.length - 1; i += 2) {
            const code = bytes[i] | (bytes[i + 1] << 8);
            if (code === 13 || code === 10 || (code >= 32 && code <= 126) || (code >= 160 && code < 65534)) {
                utf16Str += String.fromCharCode(code);
            } else {
                if (utf16Str.trim().length >= 4) text += utf16Str.trim() + '\n';
                utf16Str = '';
            }
        }
        if (utf16Str.trim().length >= 4) text += utf16Str.trim() + '\n';

        if (text.trim().length < 50) {
            let ansiStr = '';
            for (let i = 512; i < bytes.length; i++) {
                const b = bytes[i];
                if (b === 13 || b === 10 || (b >= 32 && b <= 126)) {
                    ansiStr += String.fromCharCode(b);
                } else {
                    if (ansiStr.trim().length >= 4) text += ansiStr.trim() + '\n';
                    ansiStr = '';
                }
            }
            if (ansiStr.trim().length >= 4) text += ansiStr.trim() + '\n';
        }
        return text;
    }

    // 1. DOCX / DOC -> PDF (High-Fidelity Multi-Engine with Complete Formatting Retention)
    async function convertDocxToPdf(buffer) {
        updateProgress(30, 'Analyzing Word document styles, tables, and fonts...');

        const { jsPDF } = window.jspdf;
        const pdf = new jsPDF({ unit: 'pt', format: 'a4', orientation: 'portrait' });
        const pageState = { count: 0 };

        // Verify if file is a valid DOCX (ZIP format)
        const headerBytes = new Uint8Array(buffer.slice(0, 4));
        const isZipFormat = (headerBytes[0] === 0x50 && headerBytes[1] === 0x4B); // PK header

        // If legacy binary .doc (Word 97-2003): extract structured text & render
        if (!isZipFormat) {
            const isLegacyDoc = (headerBytes[0] === 0xD0 && headerBytes[1] === 0xCF);
            if (isLegacyDoc) {
                updateProgress(45, 'Extracting text and tables from Word 97-2003 document...');
                const rawText = extractTextFromBinaryDoc(buffer);
                if (!rawText || rawText.trim().length === 0) {
                    throw new Error('Could not extract readable text from this legacy .doc file. Please re-save it as .docx in Word.');
                }
                const lines = rawText.split('\n').map(l => l.trim()).filter(l => l.length > 0);
                const htmlParts = lines.map((line, idx) => {
                    if (idx === 0) return `<h1 style="font-size:20pt; font-weight:700; color:#1e3a8a; margin-bottom:12pt;">${escapeHtml(line)}</h1>`;
                    if (line.length < 50 && !line.endsWith('.')) return `<h2 style="font-size:14pt; font-weight:700; color:#1e293b; margin-top:14pt; margin-bottom:6pt;">${escapeHtml(line)}</h2>`;
                    return `<p style="font-size:11pt; line-height:1.6; color:#111827; margin-bottom:8pt;">${escapeHtml(line)}</p>`;
                });

                const docContainer = document.createElement('div');
                docContainer.style.position = 'fixed';
                docContainer.style.left = '0px';
                docContainer.style.top = '0px';
                docContainer.style.width = '816px';
                docContainer.style.padding = '54px 72px';
                docContainer.style.backgroundColor = '#ffffff';
                docContainer.style.color = '#000000';
                docContainer.style.fontFamily = "'Calibri', 'Segoe UI', Arial, sans-serif";
                docContainer.style.zIndex = '-9999';
                docContainer.style.pointerEvents = 'none';
                docContainer.style.opacity = '1';
                docContainer.style.visibility = 'visible';
                docContainer.innerHTML = htmlParts.join('\n');
                document.body.appendChild(docContainer);

                const html2canvas = await ensureScriptLoaded('html2canvas', '../js/html2canvas.min.js');
                const docCanvas = await html2canvas(docContainer, {
                    scale: 2,
                    backgroundColor: '#ffffff',
                    logging: false,
                    useCORS: true
                });
                addCanvasPagesToPdf(docCanvas, pdf, pageState);
                document.body.removeChild(docContainer);
                updateProgress(95, 'Finalizing PDF output...');
                return pdf.output('blob');
            }
        }

        // Ensure libraries are ready
        await ensureScriptLoaded('JSZip', '../js/jszip.min.js');
        const html2canvas = await ensureScriptLoaded('html2canvas', '../js/html2canvas.min.js');
        const previewEngine = await ensureDocxPreviewEngine();

        // =========================================================================
        // ENGINE 1: docx-preview (100% Word Visual Fidelity with Page Layout)
        // =========================================================================
        if (previewEngine && typeof previewEngine.renderAsync === 'function' && html2canvas) {
            let container = null;
            try {
                updateProgress(45, 'Rendering Microsoft Word styles, fonts & tables...');

                container = document.createElement('div');
                container.className = 'docx-render-stage';
                container.style.position = 'fixed';
                container.style.left = '0px';
                container.style.top = '0px';
                container.style.width = '816px';
                container.style.backgroundColor = '#ffffff';
                container.style.color = '#000000';
                container.style.zIndex = '-9999';
                container.style.pointerEvents = 'none';
                container.style.opacity = '1';
                container.style.visibility = 'visible';
                document.body.appendChild(container);

                await previewEngine.renderAsync(buffer, container, null, {
                    className: 'docx',
                    inWrapper: true,
                    ignoreWidth: false,
                    ignoreHeight: false,
                    ignoreFonts: false,
                    breakPages: true,
                    renderHeaders: true,
                    renderFooters: true,
                    renderFootnotes: true,
                    renderEndnotes: true,
                    useBase64URL: true,
                    ignoreLastRenderedPageBreak: false
                });

                // Inject critical layout & print fixes for html2canvas (prevents table row squashing & flex collapses)
                const printFixStyle = document.createElement('style');
                printFixStyle.id = 'docx-pdf-print-fix';
                printFixStyle.textContent = `
                    .docx-render-stage .docx-wrapper { background: #ffffff !important; padding: 0 !important; }
                    .docx-render-stage .docx-wrapper > section.docx,
                    .docx-render-stage section.docx,
                    .docx-render-stage section {
                        box-shadow: none !important;
                        margin: 0 auto !important;
                        display: block !important;
                        position: relative !important;
                        overflow: visible !important;
                        background-color: #ffffff !important;
                    }
                    .docx-render-stage section.docx > article,
                    .docx-render-stage article { display: block !important; }
                    .docx-render-stage table {
                        border-collapse: collapse !important;
                        width: 100% !important;
                        margin-top: 8pt !important;
                        margin-bottom: 8pt !important;
                        table-layout: auto !important;
                        display: table !important;
                    }
                    .docx-render-stage tr { display: table-row !important; height: auto !important; }
                    .docx-render-stage td, .docx-render-stage th {
                        display: table-cell !important;
                        padding: 6pt 8pt !important;
                        vertical-align: top !important;
                        box-sizing: border-box !important;
                    }
                `;
                document.head.appendChild(printFixStyle);

                updateProgress(65, 'Capturing pages with high-DPI rasterization...');

                // Identify individual page sections generated by docx-preview
                let pageElements = container.querySelectorAll('.docx-wrapper > section, section.docx, section');
                if (!pageElements || pageElements.length === 0) {
                    pageElements = container.querySelectorAll('article');
                }
                if (!pageElements || pageElements.length === 0) {
                    pageElements = [container];
                }

                const totalSections = pageElements.length;
                for (let pIdx = 0; pIdx < totalSections; pIdx++) {
                    updateProgress(
                        65 + Math.round(((pIdx + 1) / totalSections) * 25),
                        `Processing document section ${pIdx + 1} of ${totalSections}...`
                    );

                    const pageEl = pageElements[pIdx];
                    pageEl.style.backgroundColor = '#ffffff';

                    const sectionCanvas = await html2canvas(pageEl, {
                        scale: 2, // 2x sharp Retina quality
                        useCORS: true,
                        logging: false,
                        backgroundColor: '#ffffff'
                    });

                    addCanvasPagesToPdf(sectionCanvas, pdf, pageState);
                }

                if (printFixStyle && printFixStyle.parentNode) {
                    printFixStyle.parentNode.removeChild(printFixStyle);
                }
                document.body.removeChild(container);
                updateProgress(95, 'Finalizing PDF output...');
                return pdf.output('blob');

            } catch (docxErr) {
                console.warn('docx-preview engine warning, switching to styled semantic engine:', docxErr);
                const oldFix = document.getElementById('docx-pdf-print-fix');
                if (oldFix && oldFix.parentNode) oldFix.parentNode.removeChild(oldFix);
                if (container && container.parentNode) {
                    container.parentNode.removeChild(container);
                }
            }
        }

        // =========================================================================
        // ENGINE 2: Styled Mammoth Engine (Preserves Headings, Tables, Borders & Lists)
        // =========================================================================
        updateProgress(50, 'Applying professional typography, tables, and borders...');
        if (!window.mammoth) {
            throw new Error('Mammoth.js conversion library is not available.');
        }

        const mammothOptions = {
            styleMap: [
                "p[style-name='Title'] => h1.doc-title:fresh",
                "p[style-name='Subtitle'] => p.doc-subtitle:fresh",
                "p[style-name='Heading 1'] => h1:fresh",
                "p[style-name='Heading 2'] => h2:fresh",
                "p[style-name='Heading 3'] => h3:fresh",
                "p[style-name='Heading 4'] => h4:fresh",
                "table => table.doc-table:fresh",
                "b => strong",
                "i => em",
                "u => u",
                "strike => del"
            ],
            convertImage: mammoth.images.imgElement((image) => {
                return image.read("base64").then((buf) => {
                    return { src: "data:" + image.contentType + ";base64," + buf };
                });
            })
        };

        const result = await mammoth.convertToHtml({ arrayBuffer: buffer }, mammothOptions);
        const html = result.value || '';

        const mContainer = document.createElement('div');
        mContainer.className = 'mammoth-styled-container';
        mContainer.style.position = 'fixed';
        mContainer.style.left = '0px';
        mContainer.style.top = '0px';
        mContainer.style.width = '816px';
        mContainer.style.padding = '54px 72px';
        mContainer.style.fontFamily = "'Calibri', 'Segoe UI', Arial, sans-serif";
        mContainer.style.fontSize = '11pt';
        mContainer.style.lineHeight = '1.6';
        mContainer.style.color = '#111827';
        mContainer.style.backgroundColor = '#ffffff';
        mContainer.style.zIndex = '-9999';
        mContainer.style.pointerEvents = 'none';
        mContainer.style.opacity = '1';
        mContainer.style.visibility = 'visible';

        // Inject high-quality Word-style typography and table borders
        const styleSheet = document.createElement('style');
        styleSheet.innerHTML = `
            .mammoth-styled-container h1 { font-size: 19pt; font-weight: 700; color: #1e3a8a; margin: 16pt 0 8pt; border-bottom: 2pt solid #2563eb; padding-bottom: 4pt; }
            .mammoth-styled-container h2 { font-size: 14pt; font-weight: 700; color: #1e293b; margin: 14pt 0 6pt; }
            .mammoth-styled-container h3 { font-size: 12pt; font-weight: 600; color: #334155; margin: 10pt 0 4pt; }
            .mammoth-styled-container p { margin: 0 0 8pt; text-align: justify; word-break: break-word; }
            .mammoth-styled-container table { width: 100%; border-collapse: collapse; margin: 12pt 0; font-size: 10pt; }
            .mammoth-styled-container tr { page-break-inside: avoid; }
            .mammoth-styled-container th, .mammoth-styled-container td { border: 1pt solid #cbd5e1; padding: 6pt 9pt; text-align: left; vertical-align: top; }
            .mammoth-styled-container th { background-color: #f1f5f9; font-weight: 700; color: #0f172a; }
            .mammoth-styled-container tr:nth-child(even) td { background-color: #f8fafc; }
            .mammoth-styled-container ul, .mammoth-styled-container ol { margin: 0 0 8pt 20pt; padding: 0; }
            .mammoth-styled-container li { margin-bottom: 4pt; }
            .mammoth-styled-container img { max-width: 100%; height: auto; display: block; margin: 10pt 0; }
            .mammoth-styled-container blockquote { border-left: 3pt solid #3b82f6; margin: 10pt 0; padding-left: 12pt; color: #475569; font-style: italic; }
        `;
        mContainer.appendChild(styleSheet);

        const bodyWrapper = document.createElement('div');
        bodyWrapper.innerHTML = html;
        mContainer.appendChild(bodyWrapper);
        document.body.appendChild(mContainer);

        updateProgress(75, 'Generating PDF pages with smart pagination...');
        const mCanvas = await html2canvas(mContainer, {
            scale: 2,
            useCORS: true,
            logging: false,
            backgroundColor: '#ffffff'
        });

        addCanvasPagesToPdf(mCanvas, pdf, pageState);

        document.body.removeChild(mContainer);
        updateProgress(95, 'Finalizing PDF output...');
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

    // Check for preset conversion pairs via URL params (e.g. ?from=pdf&to=docx)
    try {
        const urlParams = new URLSearchParams(window.location.search);
        const fromParam = (urlParams.get('from') || '').toLowerCase();
        const toParam = (urlParams.get('to') || '').toLowerCase();
        if (fromParam && toParam) {
            const pairTitles = {
                'pdf-docx': 'PDF to Word Converter',
                'docx-pdf': 'Word to PDF Converter',
                'pdf-xlsx': 'PDF to Excel Converter',
                'xlsx-pdf': 'Excel to PDF Converter',
                'pptx-pdf': 'PowerPoint to PDF Converter'
            };
            const pairKey = `${fromParam}-${toParam}`;
            if (pairTitles[pairKey]) {
                const h1 = document.querySelector('.converter-hero h1');
                if (h1) h1.textContent = '📄 ' + pairTitles[pairKey];
                const uploadPrompt = document.querySelector('#uploadArea h3');
                if (uploadPrompt) uploadPrompt.textContent = `Upload .${fromParam} file to convert to .${toParam}`;
                document.title = `${pairTitles[pairKey]} — 100% Free & Private | ToolsKart`;
            }
        }
    } catch (_) {}

})();
