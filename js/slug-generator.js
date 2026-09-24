/* URL Slug Generator — Amazing-Tools */
(function () {
  'use strict';

  const textInput = document.getElementById('textInput');
  const separatorSelect = document.getElementById('separator');
  const maxLengthInput = document.getElementById('maxLength');
  const transliterateCheckbox = document.getElementById('transliterate');
  const slugOutput = document.getElementById('slugOutput');
  const copyBtn = document.getElementById('copyBtn');

  const charMap = {
    'á': 'a', 'à': 'a', 'â': 'a', 'ä': 'a', 'ã': 'a', 'å': 'a',
    'é': 'e', 'è': 'e', 'ê': 'e', 'ë': 'e',
    'í': 'i', 'ì': 'i', 'î': 'i', 'ï': 'i',
    'ó': 'o', 'ò': 'o', 'ô': 'o', 'ö': 'o', 'õ': 'o', 'ø': 'o',
    'ú': 'u', 'ù': 'u', 'û': 'u', 'ü': 'u',
    'ñ': 'n', 'ç': 'c', 'ß': 'ss', 'ÿ': 'y', 'ý': 'y',
    'æ': 'ae', 'œ': 'oe'
  };

  function generateSlug() {
    let text = textInput.value;
    const separator = separatorSelect.value;
    const maxLength = parseInt(maxLengthInput.value) || 0;
    const transliterate = transliterateCheckbox.checked;

    if (!text) {
      slugOutput.value = '';
      return;
    }

    // Lowercase
    text = text.toLowerCase();

    // Transliterate
    if (transliterate) {
      text = text.replace(/[áàâäãåéèêëíìîïóòôöõøúùûüñçßÿýæœ]/g, match => charMap[match] || match);
    }

    // Replace invalid characters with space
    text = text.replace(/[^a-z0-9\s-]/g, ' ');

    // Replace multiple spaces/hyphens with a single separator
    text = text.replace(/[\s-]+/g, separator);

    // Trim separators from start and end
    if (separator === '-') {
      text = text.replace(/^-+|-+$/g, '');
    } else {
      text = text.replace(/^_+|_+$/g, '');
    }

    // Apply max length
    if (maxLength > 0 && text.length > maxLength) {
      text = text.substring(0, maxLength);
      // Ensure we don't end on a separator after trimming
      if (separator === '-') {
        text = text.replace(/-+$/g, '');
      } else {
        text = text.replace(/_+$/g, '');
      }
    }

    slugOutput.value = text;
  }

  // Event Listeners
  textInput.addEventListener('input', generateSlug);
  separatorSelect.addEventListener('change', generateSlug);
  maxLengthInput.addEventListener('input', generateSlug);
  transliterateCheckbox.addEventListener('change', generateSlug);

  copyBtn.addEventListener('click', function () {
    if (slugOutput.value) {
      const TK = window.Amazing-Tools;
      if (TK && TK.copyToClipboard) {
        TK.copyToClipboard(slugOutput.value, this);
      } else {
        navigator.clipboard.writeText(slugOutput.value);
        const originalText = this.textContent;
        this.textContent = 'Copied!';
        setTimeout(() => this.textContent = originalText, 2000);
      }
    }
  });

})();
