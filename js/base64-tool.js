/* Base64 Tool — ToolsKart */
(function () {
  'use strict';

  const textInput = document.getElementById('textInput');
  const textOutput = document.getElementById('textOutput');
  const encodeBtn = document.getElementById('encodeBtn');
  const decodeBtn = document.getElementById('decodeBtn');
  const swapBtn = document.getElementById('swapBtn');
  const clearBtn = document.getElementById('clearBtn');
  const copyBtn = document.getElementById('copyBtn');
  const inputStats = document.getElementById('inputStats');
  const outputStats = document.getElementById('outputStats');
  const errorMsg = document.getElementById('errorMsg');

  // Utility to get byte size
  function getByteSize(str) {
    return new Blob([str]).size;
  }
  
  // Format bytes
  function formatBytes(bytes) {
    if (bytes === 0) return '0 B';
    if (bytes < 1024) return bytes + ' B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }

  function updateInputStats() {
    inputStats.textContent = `Size: ${formatBytes(getByteSize(textInput.value))}`;
    errorMsg.style.display = 'none';
  }

  function updateOutputStats() {
    outputStats.textContent = `Size: ${formatBytes(getByteSize(textOutput.value))}`;
  }

  textInput.addEventListener('input', updateInputStats);

  // Safely encode/decode UTF-8
  function utf8_to_b64(str) {
    return window.btoa(unescape(encodeURIComponent(str)));
  }

  function b64_to_utf8(str) {
    return decodeURIComponent(escape(window.atob(str)));
  }

  encodeBtn.addEventListener('click', function() {
    if (!textInput.value) return;
    try {
      const result = utf8_to_b64(textInput.value);
      textOutput.value = result;
      updateOutputStats();
      errorMsg.style.display = 'none';
    } catch (e) {
      errorMsg.textContent = "Error encoding: " + e.message;
      errorMsg.style.display = 'block';
    }
  });

  decodeBtn.addEventListener('click', function() {
    if (!textInput.value) return;
    // Trim whitespace that might invalidate base64
    const input = textInput.value.trim();
    try {
      const result = b64_to_utf8(input);
      textOutput.value = result;
      updateOutputStats();
      errorMsg.style.display = 'none';
    } catch (e) {
      errorMsg.textContent = "Error decoding. Please ensure input is a valid Base64 string.";
      errorMsg.style.display = 'block';
    }
  });

  swapBtn.addEventListener('click', function() {
    const out = textOutput.value;
    if (out) {
      textInput.value = out;
      textOutput.value = '';
      updateInputStats();
      updateOutputStats();
    }
  });

  clearBtn.addEventListener('click', function() {
    textInput.value = '';
    textOutput.value = '';
    updateInputStats();
    updateOutputStats();
  });

  copyBtn.addEventListener('click', function () {
    if (textOutput.value) {
      const TK = window.ToolsKart;
      if (TK && TK.copyToClipboard) {
        TK.copyToClipboard(textOutput.value, this);
      } else {
        navigator.clipboard.writeText(textOutput.value);
        const originalText = this.textContent;
        this.textContent = 'Copied!';
        setTimeout(() => this.textContent = originalText, 2000);
      }
    }
  });

})();
