/* JSON Formatter — ToolsKart */
(function () {
  'use strict';

  const jsonInput = document.getElementById('jsonInput');
  const jsonOutput = document.getElementById('jsonOutput');
  const resultArea = document.getElementById('resultArea');
  const validationResult = document.getElementById('validationResult');
  const indentSelect = document.getElementById('indent');
  
  const formatBtn = document.getElementById('formatBtn');
  const minifyBtn = document.getElementById('minifyBtn');
  const validateBtn = document.getElementById('validateBtn');
  const clearBtn = document.getElementById('clearBtn');
  const copyBtn = document.getElementById('copyBtn');
  const downloadBtn = document.getElementById('downloadBtn');
  
  const inputStats = document.getElementById('inputStats');
  const outputStats = document.getElementById('outputStats');

  // Utility to get byte size
  function getByteSize(str) {
    return new Blob([str]).size;
  }
  
  // Format bytes
  function formatBytes(bytes) {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }

  // Update stats
  function updateStats(text, el) {
    if (!text) {
      el.textContent = 'Size: 0 B | Lines: 0';
      return;
    }
    const size = formatBytes(getByteSize(text));
    const lines = text.split('\n').length;
    el.textContent = `Size: ${size} | Lines: ${lines}`;
  }

  jsonInput.addEventListener('input', function() {
    updateStats(this.value, inputStats);
    validationResult.className = 'validation-box';
  });

  clearBtn.addEventListener('click', function () {
    jsonInput.value = '';
    jsonOutput.value = '';
    resultArea.classList.add('hidden');
    validationResult.className = 'validation-box';
    updateStats('', inputStats);
  });

  function processJSON(action) {
    const raw = jsonInput.value.trim();
    if (!raw) return;

    validationResult.className = 'validation-box';
    
    try {
      const parsed = JSON.parse(raw);
      
      if (action === 'validate') {
        validationResult.textContent = '✅ Valid JSON';
        validationResult.className = 'validation-box valid';
        return;
      }
      
      let space;
      if (indentSelect.value === 'tab') {
        space = '\t';
      } else {
        space = parseInt(indentSelect.value) || 2;
      }

      const result = action === 'format' ? JSON.stringify(parsed, null, space) : JSON.stringify(parsed);
      
      jsonOutput.value = result;
      resultArea.classList.remove('hidden');
      updateStats(result, outputStats);
      
      // Implicitly valid if it parsed
      validationResult.textContent = '✅ Valid JSON';
      validationResult.className = 'validation-box valid';
      
    } catch (e) {
      validationResult.textContent = '❌ Invalid JSON: ' + e.message;
      validationResult.className = 'validation-box invalid';
      if (action !== 'validate') {
        resultArea.classList.add('hidden');
      }
    }
  }

  formatBtn.addEventListener('click', () => processJSON('format'));
  minifyBtn.addEventListener('click', () => processJSON('minify'));
  validateBtn.addEventListener('click', () => processJSON('validate'));

  copyBtn.addEventListener('click', function () {
    if (jsonOutput.value) {
      const TK = window.ToolsKart;
      if (TK && TK.copyToClipboard) {
        TK.copyToClipboard(jsonOutput.value, this);
      } else {
        navigator.clipboard.writeText(jsonOutput.value);
        const originalText = this.textContent;
        this.textContent = 'Copied!';
        setTimeout(() => this.textContent = originalText, 2000);
      }
    }
  });

  downloadBtn.addEventListener('click', function () {
    if (jsonOutput.value) {
      const blob = new Blob([jsonOutput.value], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'formatted.json';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    }
  });

})();
