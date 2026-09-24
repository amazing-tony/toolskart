/* Case Converter — Amazing-Tools */
(function () {
  'use strict';

  const textInput = document.getElementById('textInput');
  const textOutput = document.getElementById('textOutput');
  const resultArea = document.getElementById('resultArea');
  const clearBtn = document.getElementById('clearBtn');
  const copyBtn = document.getElementById('copyBtn');
  const caseButtons = document.querySelectorAll('.case-btn');

  clearBtn.addEventListener('click', function () {
    textInput.value = '';
    textOutput.value = '';
    resultArea.classList.add('hidden');
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

  caseButtons.forEach(btn => {
    btn.addEventListener('click', function () {
      const text = textInput.value;
      if (!text) return;

      const action = this.getAttribute('data-action');
      let result = '';

      switch (action) {
        case 'upper':
          result = text.toUpperCase();
          break;
        case 'lower':
          result = text.toLowerCase();
          break;
        case 'title':
          result = toTitleCase(text);
          break;
        case 'sentence':
          result = toSentenceCase(text);
          break;
        case 'camel':
          result = toCamelCase(text);
          break;
        case 'snake':
          result = toSnakeCase(text);
          break;
        case 'kebab':
          result = toKebabCase(text);
          break;
        case 'constant':
          result = toSnakeCase(text).toUpperCase();
          break;
        case 'toggle':
          result = toToggleCase(text);
          break;
      }

      textOutput.value = result;
      resultArea.classList.remove('hidden');
    });
  });

  // Conversion functions
  function toTitleCase(str) {
    return str.toLowerCase().replace(/(?:^|\s|\n|-|_)\w/g, function(match) {
        return match.toUpperCase();
    });
  }

  function toSentenceCase(str) {
    return str.toLowerCase().replace(/(^\s*\w|[.!?]\s*\w)/g, function(match) {
        return match.toUpperCase();
    });
  }

  function toCamelCase(str) {
    return str.replace(/(?:^\w|[A-Z]|\b\w)/g, function(word, index) {
      return index === 0 ? word.toLowerCase() : word.toUpperCase();
    }).replace(/\s+/g, '');
  }

  function toSnakeCase(str) {
    return str.replace(/\W+/g, " ")
      .split(/ |\B(?=[A-Z])/)
      .map(word => word.toLowerCase())
      .join('_');
  }

  function toKebabCase(str) {
    return str.replace(/\W+/g, " ")
      .split(/ |\B(?=[A-Z])/)
      .map(word => word.toLowerCase())
      .join('-');
  }

  function toToggleCase(str) {
    let result = '';
    for (let i = 0; i < str.length; i++) {
      let char = str[i];
      if (char === char.toUpperCase()) {
        result += char.toLowerCase();
      } else {
        result += char.toUpperCase();
      }
    }
    return result;
  }

})();
