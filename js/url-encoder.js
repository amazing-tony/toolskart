/* URL Encoder/Decoder — Amazing-Tools */
(function () {
  'use strict';

  const textInput = document.getElementById('textInput');
  const textOutput = document.getElementById('textOutput');
  const errorMsg = document.getElementById('errorMsg');
  
  const encodeUrlBtn = document.getElementById('encodeUrlBtn');
  const encodeCompBtn = document.getElementById('encodeCompBtn');
  const decodeUrlBtn = document.getElementById('decodeUrlBtn');
  const decodeCompBtn = document.getElementById('decodeCompBtn');
  
  const clearBtn = document.getElementById('clearBtn');
  const copyBtn = document.getElementById('copyBtn');

  function clearError() {
    errorMsg.style.display = 'none';
    errorMsg.textContent = '';
  }

  function showError(msg) {
    errorMsg.textContent = msg;
    errorMsg.style.display = 'block';
  }

  encodeUrlBtn.addEventListener('click', function() {
    clearError();
    if (!textInput.value) return;
    try {
      textOutput.value = encodeURI(textInput.value);
    } catch (e) {
      showError("Error encoding URL: " + e.message);
    }
  });

  encodeCompBtn.addEventListener('click', function() {
    clearError();
    if (!textInput.value) return;
    try {
      textOutput.value = encodeURIComponent(textInput.value);
    } catch (e) {
      showError("Error encoding component: " + e.message);
    }
  });

  decodeUrlBtn.addEventListener('click', function() {
    clearError();
    if (!textInput.value) return;
    try {
      textOutput.value = decodeURI(textInput.value);
    } catch (e) {
      showError("Error decoding URL. The string might be malformed.");
    }
  });

  decodeCompBtn.addEventListener('click', function() {
    clearError();
    if (!textInput.value) return;
    try {
      textOutput.value = decodeURIComponent(textInput.value);
    } catch (e) {
      showError("Error decoding component. The string might be malformed.");
    }
  });

  clearBtn.addEventListener('click', function() {
    textInput.value = '';
    textOutput.value = '';
    clearError();
  });

  copyBtn.addEventListener('click', function () {
    if (textOutput.value) {
      const TK = window.Amazing-Tools;
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

  textInput.addEventListener('input', clearError);

})();
