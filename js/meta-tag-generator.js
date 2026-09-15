/* Meta Tag Generator — ToolsKart */
(function () {
  'use strict';

  // Inputs
  const inputs = {
    title: document.getElementById('siteTitle'),
    desc: document.getElementById('siteDesc'),
    url: document.getElementById('siteUrl'),
    author: document.getElementById('siteAuthor'),
    keywords: document.getElementById('siteKeywords'),
    image: document.getElementById('ogImage'),
    twitter: document.getElementById('twitterHandle'),
    robotsIndex: document.getElementById('robotsIndex'),
    robotsFollow: document.getElementById('robotsFollow')
  };

  // Preview elements
  const previewTitle = document.getElementById('previewTitle');
  const previewDesc = document.getElementById('previewDesc');
  const previewUrl = document.getElementById('previewUrl');

  // Output
  const outputArea = document.getElementById('outputArea');
  const copyBtn = document.getElementById('copyBtn');

  // Counters
  const titleCount = document.getElementById('titleCount');
  const descCount = document.getElementById('descCount');

  function updatePreview() {
    const title = inputs.title.value.trim();
    const desc = inputs.desc.value.trim();
    const url = inputs.url.value.trim();

    previewTitle.textContent = title || 'Your Page Title Here';
    previewDesc.textContent = desc || 'Your page description will appear here. Make it compelling and include keywords to improve click-through rates.';
    
    if (url) {
        try {
            const urlObj = new URL(url);
            previewUrl.textContent = urlObj.hostname + (urlObj.pathname === '/' ? '' : ' › ' + urlObj.pathname.split('/').filter(p=>p).join(' › '));
        } catch(e) {
            previewUrl.textContent = url;
        }
    } else {
        previewUrl.textContent = 'https://example.com › your-page';
    }

    // Counters
    titleCount.textContent = title.length;
    if (title.length > 60) titleCount.classList.add('over');
    else titleCount.classList.remove('over');

    descCount.textContent = desc.length;
    if (desc.length > 160) descCount.classList.add('over');
    else descCount.classList.remove('over');
  }

  function generateTags() {
    const title = inputs.title.value.trim();
    const desc = inputs.desc.value.trim();
    const url = inputs.url.value.trim();
    const author = inputs.author.value.trim();
    const keywords = inputs.keywords.value.trim();
    const image = inputs.image.value.trim();
    let twitter = inputs.twitter.value.trim();
    if (twitter && !twitter.startsWith('@')) twitter = '@' + twitter;
    
    const rIndex = inputs.robotsIndex.value;
    const rFollow = inputs.robotsFollow.value;

    let html = `<!-- Essential Meta Tags -->\n`;
    
    if (title) {
        html += `<title>${title}</title>\n`;
        html += `<meta name="title" content="${title}">\n`;
    }
    if (desc) {
        html += `<meta name="description" content="${desc}">\n`;
    }
    
    html += `<meta name="robots" content="${rIndex}, ${rFollow}">\n`;
    
    if (author) {
        html += `<meta name="author" content="${author}">\n`;
    }
    if (keywords) {
        html += `<meta name="keywords" content="${keywords}">\n`;
    }
    if (url) {
        html += `<link rel="canonical" href="${url}">\n`;
    }

    html += `\n<!-- Open Graph / Facebook -->\n`;
    html += `<meta property="og:type" content="website">\n`;
    if (url) html += `<meta property="og:url" content="${url}">\n`;
    if (title) html += `<meta property="og:title" content="${title}">\n`;
    if (desc) html += `<meta property="og:description" content="${desc}">\n`;
    if (image) html += `<meta property="og:image" content="${image}">\n`;

    html += `\n<!-- Twitter -->\n`;
    html += `<meta property="twitter:card" content="${image ? 'summary_large_image' : 'summary'}">\n`;
    if (twitter) html += `<meta property="twitter:site" content="${twitter}">\n`;
    if (url) html += `<meta property="twitter:url" content="${url}">\n`;
    if (title) html += `<meta property="twitter:title" content="${title}">\n`;
    if (desc) html += `<meta property="twitter:description" content="${desc}">\n`;
    if (image) html += `<meta property="twitter:image" content="${image}">\n`;

    outputArea.value = html;
  }

  function handleChange() {
    updatePreview();
    generateTags();
  }

  // Attach event listeners
  for (let key in inputs) {
    inputs[key].addEventListener('input', handleChange);
  }
  
  inputs.robotsIndex.addEventListener('change', handleChange);
  inputs.robotsFollow.addEventListener('change', handleChange);

  // Initialize
  handleChange();

  copyBtn.addEventListener('click', function () {
    if (outputArea.value) {
      const TK = window.ToolsKart;
      if (TK && TK.copyToClipboard) {
        TK.copyToClipboard(outputArea.value, this);
      } else {
        navigator.clipboard.writeText(outputArea.value);
        const originalText = this.textContent;
        this.textContent = 'Copied!';
        setTimeout(() => this.textContent = originalText, 2000);
      }
    }
  });

})();
