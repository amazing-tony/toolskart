/* Image Resizer — Amazing-Tools */
(function () {
  'use strict';

  const uploadArea = document.getElementById('uploadArea');
  const fileInput = document.getElementById('fileInput');
  const editorArea = document.getElementById('editorArea');
  const imagePreview = document.getElementById('imagePreview');
  const imageInfo = document.getElementById('imageInfo');
  
  const widthInput = document.getElementById('widthInput');
  const heightInput = document.getElementById('heightInput');
  const maintainRatio = document.getElementById('maintainRatio');
  const aspectRatioLock = document.getElementById('aspectRatioLock');
  
  const presetBtns = document.querySelectorAll('.preset-btn');
  const downloadBtn = document.getElementById('downloadBtn');
  const resetBtn = document.getElementById('resetBtn');
  const canvas = document.getElementById('resizeCanvas');

  let originalImage = new Image();
  let originalWidth = 0;
  let originalHeight = 0;
  let aspectRatio = 1;
  let originalType = 'image/jpeg';
  let originalFileName = 'image';

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
    if (!file.type.match('image.*')) return;
    
    originalType = file.type;
    originalFileName = file.name.split('.')[0];
    
    const reader = new FileReader();
    reader.onload = function(e) {
      originalImage.onload = function() {
        originalWidth = originalImage.width;
        originalHeight = originalImage.height;
        aspectRatio = originalWidth / originalHeight;
        
        imagePreview.src = e.target.result;
        imageInfo.textContent = `Original: ${originalWidth} × ${originalHeight} px`;
        
        widthInput.value = originalWidth;
        heightInput.value = originalHeight;
        
        uploadArea.classList.add('hidden');
        editorArea.classList.remove('hidden');
      }
      originalImage.src = e.target.result;
    }
    reader.readAsDataURL(file);
  }

  // Dimension Handlers
  widthInput.addEventListener('input', function() {
    if (maintainRatio.checked && this.value) {
      heightInput.value = Math.round(this.value / aspectRatio);
    }
  });

  heightInput.addEventListener('input', function() {
    if (maintainRatio.checked && this.value) {
      widthInput.value = Math.round(this.value * aspectRatio);
    }
  });

  maintainRatio.addEventListener('change', function() {
    aspectRatioLock.textContent = this.checked ? '🔒' : '🔓';
    if (this.checked && widthInput.value) {
      heightInput.value = Math.round(widthInput.value / aspectRatio);
    }
  });

  aspectRatioLock.addEventListener('click', function() {
    maintainRatio.checked = !maintainRatio.checked;
    this.textContent = maintainRatio.checked ? '🔒' : '🔓';
    if (maintainRatio.checked && widthInput.value) {
      heightInput.value = Math.round(widthInput.value / aspectRatio);
    }
  });

  // Presets
  presetBtns.forEach(btn => {
    btn.addEventListener('click', function() {
      const w = parseInt(this.getAttribute('data-w'));
      const h = parseInt(this.getAttribute('data-h'));
      maintainRatio.checked = false;
      aspectRatioLock.textContent = '🔓';
      widthInput.value = w;
      heightInput.value = h;
    });
  });

  // Download
  downloadBtn.addEventListener('click', function() {
    const w = parseInt(widthInput.value);
    const h = parseInt(heightInput.value);
    
    if (!w || !h || w <= 0 || h <= 0) {
      alert('Please enter valid dimensions');
      return;
    }

    canvas.width = w;
    canvas.height = h;
    const ctx = canvas.getContext('2d');
    
    // Draw white background in case of transparent png to jpeg
    if (originalType === 'image/jpeg') {
      ctx.fillStyle = '#FFFFFF';
      ctx.fillRect(0, 0, w, h);
    }
    
    ctx.drawImage(originalImage, 0, 0, w, h);
    
    const ext = originalType.split('/')[1] || 'jpg';
    
    const link = document.createElement('a');
    link.download = `${originalFileName}_${w}x${h}.${ext}`;
    link.href = canvas.toDataURL(originalType, 0.92);
    link.click();
  });

  // Reset
  resetBtn.addEventListener('click', function() {
    fileInput.value = '';
    editorArea.classList.add('hidden');
    uploadArea.classList.remove('hidden');
  });

})();
