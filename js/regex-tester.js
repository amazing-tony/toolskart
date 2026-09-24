/* Regex Tester — Amazing-Tools */
(function () {
  'use strict';

  const regexPattern = document.getElementById('regexPattern');
  const regexFlagsInput = document.getElementById('regexFlagsInput');
  const flagCbs = document.querySelectorAll('.flag-cb');
  const testString = document.getElementById('testString');
  const editorBackdrop = document.getElementById('editorBackdrop');
  const matchesList = document.getElementById('matchesList');
  const matchCountBadge = document.getElementById('matchCountBadge');

  // Sync checkboxes with flag input
  function syncFlagsToInput() {
    let flags = '';
    flagCbs.forEach(cb => {
      if (cb.checked) flags += cb.value;
    });
    regexFlagsInput.value = flags;
    evaluateRegex();
  }

  function syncInputToFlags() {
    const flags = regexFlagsInput.value;
    flagCbs.forEach(cb => {
      cb.checked = flags.includes(cb.value);
    });
    evaluateRegex();
  }

  flagCbs.forEach(cb => cb.addEventListener('change', syncFlagsToInput));
  regexFlagsInput.addEventListener('input', syncInputToFlags);
  
  regexPattern.addEventListener('input', evaluateRegex);
  testString.addEventListener('input', () => {
    evaluateRegex();
    syncScroll();
  });
  testString.addEventListener('scroll', syncScroll);

  function syncScroll() {
    editorBackdrop.scrollTop = testString.scrollTop;
    editorBackdrop.scrollLeft = testString.scrollLeft;
  }

  // Escape HTML to prevent injection in backdrop
  function escapeHtml(unsafe) {
    return unsafe
         .replace(/&/g, "&amp;")
         .replace(/</g, "&lt;")
         .replace(/>/g, "&gt;")
         .replace(/"/g, "&quot;")
         .replace(/'/g, "&#039;");
  }

  function evaluateRegex() {
    const pattern = regexPattern.value;
    const flags = regexFlagsInput.value;
    const text = testString.value;

    if (!pattern) {
      editorBackdrop.innerHTML = escapeHtml(text);
      matchesList.innerHTML = '<div class="match-item text-muted">No pattern entered.</div>';
      matchCountBadge.textContent = '0 matches';
      return;
    }

    let regex;
    try {
      regex = new RegExp(pattern, flags);
    } catch (e) {
      editorBackdrop.innerHTML = escapeHtml(text);
      matchesList.innerHTML = `<div class="error-text">❌ Invalid Regular Expression: ${e.message}</div>`;
      matchCountBadge.textContent = 'Error';
      matchCountBadge.style.background = '#dc3545';
      return;
    }

    matchCountBadge.style.background = 'var(--primary-color)';

    let match;
    let matchCount = 0;
    const resultsHtml = [];
    
    // We need to reconstruct the highlighted text
    let highlightedText = '';
    let lastIndex = 0;

    // Reset regex index if global
    if (regex.global) regex.lastIndex = 0;

    while ((match = regex.exec(text)) !== null) {
      matchCount++;
      
      // Highlight logic
      const beforeMatch = text.slice(lastIndex, match.index);
      highlightedText += escapeHtml(beforeMatch);
      highlightedText += `<mark class="match-hl">${escapeHtml(match[0])}</mark>`;
      lastIndex = match.index + match[0].length;

      // Result List Logic
      let itemHtml = `<div class="match-item">
          <strong>Match ${matchCount}</strong> (Index: ${match.index}-${match.index + match[0].length})<br>
          <span style="color: var(--primary-color);">${escapeHtml(match[0])}</span>`;
      
      if (match.length > 1) {
        for (let i = 1; i < match.length; i++) {
          if (match[i] !== undefined) {
            itemHtml += `<div class="group-item">Group ${i}: <span style="color: #333;">${escapeHtml(match[i])}</span></div>`;
          }
        }
      }
      itemHtml += `</div>`;
      resultsHtml.push(itemHtml);

      // Prevent infinite loops if regex matches empty string
      if (!regex.global) break;
      if (match[0].length === 0) regex.lastIndex++;
    }

    highlightedText += escapeHtml(text.slice(lastIndex));
    
    // Account for trailing newlines in textarea
    if(text.endsWith('\n')) {
      highlightedText += ' '; // Keeps the backdrop size matching textarea
    }

    editorBackdrop.innerHTML = highlightedText;

    if (matchCount === 0) {
      matchesList.innerHTML = '<div class="match-item text-muted">No matches found.</div>';
    } else {
      matchesList.innerHTML = resultsHtml.join('');
    }
    
    matchCountBadge.textContent = `${matchCount} match${matchCount !== 1 ? 'es' : ''}`;
  }

  // Initial eval
  evaluateRegex();
})();
