/* Image Compressor — Amazing-Tools */
(function () {
  'use strict';

  const uploadArea = document.getElementById('uploadArea');
  const fileInput = document.getElementById('fileInput');
  const editorArea = document.getElementById('editorArea');
  
  const originalPreview = document.getElementById('originalPreview');
  const compressedPreview = document.getElementById('compressedPreview');
  
  const originalSizeEl = document.getElementById('originalSize');
  const compressedSizeEl = document.getElementById('compressedSize');
  const savingsText = document.getElementById('savingsText');
  
  const qualitySlider = document.getElementById('qualitySlider');
  const qualityVal = document.getElementById('qualityVal');
  
  const downloadBtn = document.getElementById('downloadBtn');
  const resetBtn = document.getElementById('resetBtn');
  const canvas = document.getElementById('compressCanvas');

  let originalImage = new Image();
  let originalFile = null;
  let compressedBlob = null;
  
  // Format bytes
  function formatBytes(bytes) {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }

  // Upload Handlers
  uploadArea.addEventListener('click', () => fileInput.click());
  
  uploadArea.addEventListener('dragover', (e) => {
    e.preventDefault();
    uploadArea.style.borderColor = 'var(--primary-color)';
  });
  
  uploadArea.addEventListener('dragleave', () => {
    uploadArea.style.borderColor = 'var(--border-color)';
  });
  
  uploadArea.addEventListener('drop', (e) => {
    e.preventDefault();
    uploadArea.style.borderColor = 'var(--border-color)';
    if (e.dataTransfer.files.length) {
      handleFile(e.dataTransfer.files[0]);
    }
  });

  fileInput.addEventListener('change', function() {
    if (this.files.length) {
      handleFile(this.files[0]);
    }
  });

  function handleFile(file) {
    if (!file.type.match('image/jpeg') && !file.type.match('image/png') && !file.type.match('image/webp')) {
      alert("Please upload a JPG, PNG, or WebP image.");
      return;
    }
    
    originalFile = file;
    originalSizeEl.textContent = formatBytes(file.size);
    
    const reader = new FileReader();
    reader.onload = function(e) {
      originalImage.onload = function() {
        originalPreview.src = e.target.result;
        uploadArea.classList.add('hidden');
        editorArea.classList.remove('hidden');
        compressImage(); // initial compression
      }
      originalImage.src = e.target.result;
    }
    reader.readAsDataURL(file);
  }

  // Compression
  let compressTimeout;
  qualitySlider.addEventListener('input', function() {
    qualityVal.textContent = this.value;
    clearTimeout(compressTimeout);
    compressTimeout = setTimeout(compressImage, 200); // debounce
  });

  function compressImage() {
    if (!originalFile) return;

    canvas.width = originalImage.width;
    canvas.height = originalImage.height;
    const ctx = canvas.getContext('2d');
    
    // Draw white background for transparent images if converting to jpeg
    if (originalFile.type === 'image/jpeg') {
      ctx.fillStyle = '#FFFFFF';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
    }
    
    ctx.drawImage(originalImage, 0, 0);
    
    const quality = parseInt(qualitySlider.value) / 100;
    let targetType = originalFile.type;
    
    // For PNGs, using image/jpeg or image/webp gives better compression control in canvas
    if (targetType === 'image/png' && quality < 1.0) {
       targetType = 'image/webp'; // Fallback to webp for better compression of pngs if supported
    }

    canvas.toBlob(function(blob) {
      compressedBlob = blob;
      
      const compressedUrl = URL.createObjectURL(blob);
      compressedPreview.src = compressedUrl;
      compressedSizeEl.textContent = formatBytes(blob.size);
      
      // Calculate savings
      if (blob.size < originalFile.size) {
        const savings = ((originalFile.size - blob.size) / originalFile.size * 100).toFixed(1);
        savingsText.textContent = `Saved: ${savings}%`;
        savingsText.style.color = '#28a745';
      } else {
        savingsText.textContent = `No savings at this quality`;
        savingsText.style.color = '#dc3545';
      }
      
    }, targetType, quality);
  }

  // Download
  downloadBtn.addEventListener('click', function() {
    if (!compressedBlob) return;
    
    const url = URL.createObjectURL(compressedBlob);
    const link = document.createElement('a');
    
    const originalName = originalFile.name.split('.')[0];
    const ext = compressedBlob.type.split('/')[1] || 'jpg';
    
    link.download = `${originalName}_compressed.${ext}`;
    link.href = url;
    link.click();
    
    URL.revokeObjectURL(url);
  });

  // Reset
  resetBtn.addEventListener('click', function() {
    fileInput.value = '';
    originalFile = null;
    compressedBlob = null;
    qualitySlider.value = 80;
    qualityVal.textContent = "80";
    editorArea.classList.add('hidden');
    uploadArea.classList.remove('hidden');
  });

})();
