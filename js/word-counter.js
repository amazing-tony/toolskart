/* Word Counter — Amazing-Tools */
(function () {
  'use strict';

  const textInput = document.getElementById('textInput');
  const wordCount = document.getElementById('wordCount');
  const charCount = document.getElementById('charCount');
  const charNoSpaceCount = document.getElementById('charNoSpaceCount');
  const sentenceCount = document.getElementById('sentenceCount');
  const paragraphCount = document.getElementById('paragraphCount');
  const readTime = document.getElementById('readTime');
  const speakTime = document.getElementById('speakTime');
  const keywordList = document.getElementById('keywordList');
  const clearBtn = document.getElementById('clearBtn');
  const copyBtn = document.getElementById('copyBtn');

  // Debounce for performance on large texts
  let timeout = null;

  textInput.addEventListener('input', function () {
    clearTimeout(timeout);
    timeout = setTimeout(analyzeText, 300);
  });

  clearBtn.addEventListener('click', function () {
    textInput.value = '';
    analyzeText();
  });

  copyBtn.addEventListener('click', function () {
    if (textInput.value.trim() !== '') {
      const TK = window.Amazing-Tools;
      if (TK && TK.copyToClipboard) {
        TK.copyToClipboard(textInput.value, this);
      } else {
        navigator.clipboard.writeText(textInput.value);
        const originalText = this.textContent;
        this.textContent = 'Copied!';
        setTimeout(() => this.textContent = originalText, 2000);
      }
    }
  });

  function analyzeText() {
    const text = textInput.value;
    const trimmedText = text.trim();

    // Character counts
    const chars = text.length;
    const charsNoSpace = text.replace(/\s/g, '').length;
    
    // Words
    const wordsArray = trimmedText === '' ? [] : trimmedText.split(/\s+/).filter(word => word.length > 0);
    const words = wordsArray.length;

    // Sentences
    const sentences = trimmedText === '' ? 0 : (text.match(/[.!?]+(?=\s|$)/g) || []).length || (words > 0 ? 1 : 0);

    // Paragraphs
    const paragraphs = trimmedText === '' ? 0 : text.split(/\n+/).filter(p => p.trim().length > 0).length;

    // Times
    const readingTimeMins = Math.ceil(words / 200);
    const speakingTimeMins = Math.ceil(words / 130);

    // Update DOM
    wordCount.textContent = words;
    charCount.textContent = chars;
    charNoSpaceCount.textContent = charsNoSpace;
    sentenceCount.textContent = sentences;
    paragraphCount.textContent = paragraphs;
    readTime.textContent = readingTimeMins + (readingTimeMins === 1 ? ' min' : ' mins');
    speakTime.textContent = speakingTimeMins + (speakingTimeMins === 1 ? ' min' : ' mins');

    // Frequency
    if (words === 0) {
      keywordList.innerHTML = '<span class="text-muted">Type some text to see frequent words.</span>';
      return;
    }

    const wordFreq = {};
    const ignoreWords = ['the', 'and', 'a', 'to', 'of', 'in', 'i', 'is', 'that', 'it', 'on', 'you', 'this', 'for', 'but', 'with', 'are', 'have', 'be', 'at', 'or', 'as', 'was', 'so', 'if', 'out', 'not'];
    
    wordsArray.forEach(word => {
      const w = word.toLowerCase().replace(/[^a-z0-9]/g, '');
      if (w.length > 2 && !ignoreWords.includes(w)) {
        wordFreq[w] = (wordFreq[w] || 0) + 1;
      }
    });

    const sortedWords = Object.keys(wordFreq).sort((a, b) => wordFreq[b] - wordFreq[a]).slice(0, 10);
    
    if (sortedWords.length === 0) {
      keywordList.innerHTML = '<span class="text-muted">No significant words found yet.</span>';
    } else {
      keywordList.innerHTML = sortedWords.map(w => 
        `<span class="freq-item">${w}<span class="freq-count">x${wordFreq[w]}</span></span>`
      ).join('');
    }
  }

  // Initial analyze
  analyzeText();
})();
