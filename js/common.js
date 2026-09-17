/* ========================================
   ToolsKart — Common JavaScript Utilities
   Shared across all pages
   ======================================== */

(function () {
  'use strict';

  // ---- Multi-Theme Switching Engine ----
  const THEME_KEY = 'toolskart_theme';
  const DEFAULT_THEME = 'adminlte';
  const themeLabels = {
    'adminlte': 'AdminLTE Slate',
    'dark': 'Midnight Cyber',
    'emerald': 'FinTech Emerald',
    'royal': 'Royal Velvet'
  };

  function applyTheme(themeName) {
    if (!themeLabels[themeName]) themeName = DEFAULT_THEME;
    document.documentElement.setAttribute('data-theme', themeName);
    try {
      localStorage.setItem(THEME_KEY, themeName);
    } catch (e) {}

    const themeLabelEl = document.getElementById('currentThemeLabel');
    if (themeLabelEl) {
      themeLabelEl.textContent = themeLabels[themeName] || 'Theme';
    }

    document.querySelectorAll('.theme-option-item').forEach(item => {
      item.classList.toggle('active', item.getAttribute('data-theme-choice') === themeName);
    });

    const toolIframe = document.getElementById('toolIframe');
    if (toolIframe && toolIframe.contentDocument) {
      try {
        toolIframe.contentDocument.documentElement.setAttribute('data-theme', themeName);
      } catch (e) {}
    }
  }

  // Detect and set initial theme
  let savedTheme = DEFAULT_THEME;
  try {
    savedTheme = localStorage.getItem(THEME_KEY) || DEFAULT_THEME;
  } catch (e) {}
  applyTheme(savedTheme);

  // If running inside an iframe, enable embedded mode
  if (window.self !== window.top) {
    document.body.classList.add('is-embedded');
  }

  // Theme dropdown interaction
  const themeToggleBtn = document.getElementById('themeToggleBtn');
  const themeDropdown = document.getElementById('themeDropdown');
  if (themeToggleBtn && themeDropdown) {
    themeToggleBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      themeDropdown.classList.toggle('show');
    });

    themeDropdown.querySelectorAll('.theme-option-item').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const choice = btn.getAttribute('data-theme-choice');
        applyTheme(choice);
        themeDropdown.classList.remove('show');
      });
    });

    document.addEventListener('click', (e) => {
      if (!themeDropdown.contains(e.target) && e.target !== themeToggleBtn) {
        themeDropdown.classList.remove('show');
      }
    });
  }

  // ---- Mobile Navigation Toggle ----
  const mobileToggle = document.getElementById('mobileToggle');
  const mainNav = document.getElementById('mainNav');
  if (mobileToggle && mainNav) {
    mobileToggle.addEventListener('click', () => {
      mainNav.classList.toggle('active');
      mobileToggle.textContent = mainNav.classList.contains('active') ? '✕' : '☰';
    });
    // Close nav on link click
    mainNav.querySelectorAll('a').forEach(link => {
      link.addEventListener('click', () => {
        mainNav.classList.remove('active');
        mobileToggle.textContent = '☰';
      });
    });
  }

  // ---- Left Sidebar Navigation Toggle & Search ----
  const sidebarToggle = document.getElementById('sidebarToggle');
  const portalSidebar = document.getElementById('portalSidebar');
  if (sidebarToggle && portalSidebar) {
    sidebarToggle.addEventListener('click', (e) => {
      e.stopPropagation();
      portalSidebar.classList.toggle('open');
    });

    // Close sidebar on click outside on mobile
    document.addEventListener('click', (e) => {
      if (window.innerWidth <= 1024 && portalSidebar.classList.contains('open')) {
        if (!portalSidebar.contains(e.target) && e.target !== sidebarToggle) {
          portalSidebar.classList.remove('open');
        }
      }
    });

    // Close sidebar when clicking any sidebar link on mobile
    portalSidebar.querySelectorAll('.sidebar-link').forEach(link => {
      link.addEventListener('click', () => {
        if (window.innerWidth <= 1024) {
          portalSidebar.classList.remove('open');
        }
      });
    });
  }

  // Quick search filter inside sidebar
  const sidebarSearch = document.getElementById('sidebarSearch');
  if (sidebarSearch && portalSidebar) {
    sidebarSearch.addEventListener('input', function () {
      const q = this.value.toLowerCase().trim();
      const links = portalSidebar.querySelectorAll('.sidebar-link');
      const groups = portalSidebar.querySelectorAll('.sidebar-group');

      links.forEach(link => {
        const text = link.textContent.toLowerCase();
        link.style.display = text.includes(q) ? '' : 'none';
      });

      groups.forEach(grp => {
        const visibleLinks = grp.querySelectorAll('.sidebar-link:not([style*="display: none"])');
        grp.style.display = visibleLinks.length === 0 && q ? 'none' : '';
      });
    });
  }

  // ---- Category Filter Pills (Homepage) ----
  const filterPills = document.querySelectorAll('.filter-pill');
  if (filterPills.length > 0) {
    filterPills.forEach(pill => {
      pill.addEventListener('click', function () {
        filterPills.forEach(p => p.classList.remove('active'));
        this.classList.add('active');
        const filter = this.getAttribute('data-filter');

        const featuredSec = document.getElementById('featured-section');
        const sections = document.querySelectorAll('.category-section:not(#facilities)');

        if (filter === 'all') {
          if (featuredSec) featuredSec.style.display = '';
          sections.forEach(sec => sec.style.display = '');
        } else if (filter === 'featured') {
          if (featuredSec) {
            featuredSec.style.display = '';
            featuredSec.scrollIntoView({ behavior: 'smooth', block: 'start' });
          }
          sections.forEach(sec => sec.style.display = 'none');
        } else {
          if (featuredSec) featuredSec.style.display = 'none';
          sections.forEach(sec => {
            if (sec.id === filter) {
              sec.style.display = '';
              sec.scrollIntoView({ behavior: 'smooth', block: 'start' });
            } else {
              sec.style.display = 'none';
            }
          });
        }
      });
    });
  }

  // ---- Tool Search (Homepage) ----
  const toolSearch = document.getElementById('toolSearch');
  if (toolSearch) {
    // Keyboard shortcut '/' to search
    document.addEventListener('keydown', function (e) {
      if (e.key === '/' && document.activeElement !== toolSearch && document.activeElement.tagName !== 'INPUT' && document.activeElement.tagName !== 'TEXTAREA') {
        e.preventDefault();
        toolSearch.focus();
      }
    });

    toolSearch.addEventListener('input', function () {
      const query = this.value.toLowerCase().trim();
      const cards = document.querySelectorAll('.tool-card');
      const featuredCards = document.querySelectorAll('.featured-card');
      const sections = document.querySelectorAll('.category-section:not(#facilities)');
      const featuredSec = document.getElementById('featured-section');

      cards.forEach(card => {
        const text = card.textContent.toLowerCase();
        card.style.display = text.includes(query) ? '' : 'none';
      });

      featuredCards.forEach(card => {
        const text = card.textContent.toLowerCase();
        card.style.display = text.includes(query) ? '' : 'none';
      });

      // Hide empty sections
      sections.forEach(section => {
        const visibleCards = section.querySelectorAll('.tool-card:not([style*="display: none"])');
        section.style.display = visibleCards.length === 0 ? 'none' : '';
      });

      if (featuredSec) {
        const visibleFeatured = featuredSec.querySelectorAll('.featured-card:not([style*="display: none"])');
        featuredSec.style.display = visibleFeatured.length === 0 ? 'none' : '';
      }
    });
  }

  // ---- Single-Portal Tool Loading & Routing Engine ----
  const toolRegistry = {
    'document-converter': { title: 'Universal Document Converter', category: 'Document Tools', url: 'pages/document-converter.html' },
    'video-downloader': { title: 'Video & Audio Downloader', category: 'Media Tools', url: 'pages/video-downloader.html' },
    'income-tax-calculator': { title: 'Income Tax Optimizer (Old vs New)', category: 'Financial Calculators', url: 'pages/income-tax-calculator.html' },
    'emi-calculator': { title: 'Loan Prepayment & Debt-Freedom Planner', category: 'Financial Calculators', url: 'pages/emi-calculator.html' },
    'gst-calculator': { title: 'GST Calculator & Tax Splitter', category: 'Financial Calculators', url: 'pages/gst-calculator.html' },
    'sip-calculator': { title: 'SIP & Wealth Builder', category: 'Financial Calculators', url: 'pages/sip-calculator.html' },
    'age-calculator': { title: 'Age Calculator', category: 'Everyday Calculators', url: 'pages/age-calculator.html' },
    'compound-interest': { title: 'Compound Interest Calculator', category: 'Financial Calculators', url: 'pages/compound-interest.html' },
    'fd-calculator': { title: 'Fixed Deposit (FD) Calculator', category: 'Financial Calculators', url: 'pages/fd-calculator.html' },
    'percentage-calculator': { title: 'Percentage Calculator', category: 'Everyday Calculators', url: 'pages/percentage-calculator.html' },
    'word-counter': { title: 'Word & Character Counter', category: 'Text Tools', url: 'pages/word-counter.html' },
    'case-converter': { title: 'Case Converter', category: 'Text Tools', url: 'pages/case-converter.html' },
    'lorem-ipsum': { title: 'Lorem Ipsum Generator', category: 'Text Tools', url: 'pages/lorem-ipsum.html' },
    'slug-generator': { title: 'URL Slug Generator', category: 'Text Tools', url: 'pages/slug-generator.html' },
    'json-formatter': { title: 'JSON Formatter & Validator', category: 'Developer Tools', url: 'pages/json-formatter.html' },
    'base64-tool': { title: 'Base64 Encoder / Decoder', category: 'Developer Tools', url: 'pages/base64-tool.html' },
    'image-resizer': { title: 'Image Resizer', category: 'Image Tools', url: 'pages/image-resizer.html' },
    'image-compressor': { title: 'Image Compressor', category: 'Image Tools', url: 'pages/image-compressor.html' },
    'color-picker': { title: 'Color Picker & Converter', category: 'Image Tools', url: 'pages/color-picker.html' },
    'url-encoder': { title: 'URL Encoder / Decoder', category: 'Developer Tools', url: 'pages/url-encoder.html' },
    'regex-tester': { title: 'Regex Tester', category: 'Developer Tools', url: 'pages/regex-tester.html' },
    'meta-tag-generator': { title: 'Meta Tag & SEO Generator', category: 'Developer Tools', url: 'pages/meta-tag-generator.html' }
  };

  function extractSlugFromUrl(url) {
    if (!url) return null;
    const match = url.match(/(?:pages\/|^)([\w-]+)\.html/);
    return match ? match[1] : null;
  }

  function openToolInPortal(slug, customTitle, customCat) {
    const dashboardOverview = document.getElementById('dashboardOverview');
    const toolPanel = document.getElementById('toolContentPanel');
    const toolIframe = document.getElementById('toolIframe');
    const breadcrumbCat = document.getElementById('panelBreadcrumbCategory');
    const breadcrumbTitle = document.getElementById('panelBreadcrumbTitle');

    if (!toolPanel || !toolIframe) {
      // If outside index.html, navigate to index.html#slug
      const prefix = window.location.pathname.includes('/pages/') ? '../index.html#' : 'index.html#';
      window.location.href = prefix + slug;
      return;
    }

    const tool = toolRegistry[slug] || {
      title: customTitle || slug.replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase()),
      category: customCat || 'Tools',
      url: 'pages/' + slug + '.html'
    };

    // Update breadcrumbs
    if (breadcrumbCat) breadcrumbCat.textContent = tool.category;
    if (breadcrumbTitle) breadcrumbTitle.textContent = tool.title;

    // Show tool panel and hide overview
    if (dashboardOverview) dashboardOverview.style.display = 'none';
    toolPanel.style.display = 'flex';

    // Set iframe target if different
    const targetUrl = tool.url;
    if (!toolIframe.src.endsWith(targetUrl)) {
      toolIframe.src = targetUrl;
    }

    // Smooth scroll to tool panel
    toolPanel.scrollIntoView({ behavior: 'smooth', block: 'start' });

    // Update URL hash
    if (history.pushState) {
      history.pushState(null, null, '#' + slug);
    } else {
      window.location.hash = slug;
    }

    // Update active state in sidebar
    document.querySelectorAll('.sidebar-link').forEach(link => {
      const linkSlug = link.getAttribute('data-tool') || extractSlugFromUrl(link.getAttribute('href'));
      link.classList.toggle('is-active', linkSlug === slug);
    });

    // Close mobile sidebar if open
    const portalSidebar = document.getElementById('portalSidebar');
    if (portalSidebar && window.innerWidth <= 1024) {
      portalSidebar.classList.remove('open');
    }
  }

  function closeToolPanel() {
    const dashboardOverview = document.getElementById('dashboardOverview');
    const toolPanel = document.getElementById('toolContentPanel');

    if (toolPanel) {
      toolPanel.style.display = 'none';
      toolPanel.classList.remove('is-fullscreen');
    }
    if (dashboardOverview) {
      dashboardOverview.style.display = '';
      dashboardOverview.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
    // Clear URL hash
    if (history.pushState) {
      history.pushState(null, null, window.location.pathname + window.location.search);
    } else {
      window.location.hash = '';
    }
    // Clear sidebar active highlights
    document.querySelectorAll('.sidebar-link').forEach(link => link.classList.remove('is-active'));
  }

  // Bind Tool Panel Buttons
  const toolCloseBtn = document.getElementById('toolCloseBtn');
  const breadcrumbDashboardLink = document.getElementById('breadcrumbDashboardLink');
  const toolFullscreenBtn = document.getElementById('toolFullscreenBtn');

  if (toolCloseBtn) {
    toolCloseBtn.addEventListener('click', (e) => {
      e.preventDefault();
      closeToolPanel();
    });
  }
  if (breadcrumbDashboardLink) {
    breadcrumbDashboardLink.addEventListener('click', (e) => {
      e.preventDefault();
      closeToolPanel();
    });
  }
  if (toolFullscreenBtn) {
    toolFullscreenBtn.addEventListener('click', () => {
      const toolPanel = document.getElementById('toolContentPanel');
      if (toolPanel) {
        toolPanel.classList.toggle('is-fullscreen');
        const isFull = toolPanel.classList.contains('is-fullscreen');
        toolFullscreenBtn.innerHTML = isFull ? '<span>🗗</span> Exit Fullscreen' : '<span>🗖</span> Fullscreen';
      }
    });
  }

  // Intercept click on tools, cards, and sidebar links
  document.addEventListener('click', function (e) {
    const trigger = e.target.closest('[data-tool], .tool-card, .featured-card, .sidebar-link');
    if (!trigger) return;

    const toolPanel = document.getElementById('toolContentPanel');
    if (!toolPanel) return;

    let slug = trigger.getAttribute('data-tool');
    const href = trigger.getAttribute('href');

    if (!slug && href) {
      slug = extractSlugFromUrl(href);
    }

    if (slug && toolRegistry[slug]) {
      e.preventDefault();
      const title = trigger.querySelector('h3')?.textContent?.trim() || toolRegistry[slug].title;
      openToolInPortal(slug, title);
    }
  });

  // Check URL hash on page load or on hashchange
  function checkUrlHash() {
    const hash = window.location.hash.replace('#', '').trim();
    if (hash && toolRegistry[hash]) {
      openToolInPortal(hash);
    }
  }
  window.addEventListener('load', checkUrlHash);
  window.addEventListener('hashchange', checkUrlHash);

  // Sync theme when iframe finishes loading
  const toolIframeEl = document.getElementById('toolIframe');
  if (toolIframeEl) {
    toolIframeEl.addEventListener('load', () => {
      try {
        const curTheme = document.documentElement.getAttribute('data-theme') || DEFAULT_THEME;
        if (toolIframeEl.contentDocument) {
          toolIframeEl.contentDocument.documentElement.setAttribute('data-theme', curTheme);
          toolIframeEl.contentDocument.body.classList.add('is-embedded');
        }
      } catch (e) {}
    });
  }

  // ---- Utility Functions (globally available) ----
  window.ToolsKart = {
    openTool: openToolInPortal,
    closeTool: closeToolPanel,
    setTheme: applyTheme,

    // Format number with commas (Indian system)
    formatIndian: function (num) {
      if (num === null || num === undefined || isNaN(num)) return '0';
      const parts = num.toFixed(2).split('.');
      let intPart = parts[0];
      const decPart = parts[1];
      const isNeg = intPart.startsWith('-');
      if (isNeg) intPart = intPart.substring(1);
      
      let result = '';
      if (intPart.length > 3) {
        result = intPart.substring(intPart.length - 3);
        intPart = intPart.substring(0, intPart.length - 3);
        while (intPart.length > 2) {
          result = intPart.substring(intPart.length - 2) + ',' + result;
          intPart = intPart.substring(0, intPart.length - 2);
        }
        if (intPart.length > 0) result = intPart + ',' + result;
      } else {
        result = intPart;
      }
      return (isNeg ? '-' : '') + result + '.' + decPart;
    },

    // Format number with commas (International system)
    formatNumber: function (num, decimals = 2) {
      if (num === null || num === undefined || isNaN(num)) return '0';
      return Number(num).toLocaleString('en-IN', {
        minimumFractionDigits: decimals,
        maximumFractionDigits: decimals
      });
    },

    // Format as INR currency
    formatINR: function (num) {
      if (num === null || num === undefined || isNaN(num)) return '₹0.00';
      return '₹' + this.formatIndian(num);
    },

    // Parse number (remove commas, currency symbols)
    parseNumber: function (str) {
      if (typeof str === 'number') return str;
      if (!str) return 0;
      return parseFloat(str.toString().replace(/[₹$,\s]/g, '')) || 0;
    },

    // Copy text to clipboard
    copyToClipboard: function (text, btnEl) {
      navigator.clipboard.writeText(text).then(() => {
        if (btnEl) {
          const originalText = btnEl.textContent;
          btnEl.textContent = '✓ Copied!';
          btnEl.style.color = '#10B981';
          setTimeout(() => {
            btnEl.textContent = originalText;
            btnEl.style.color = '';
          }, 1500);
        }
      }).catch(() => {
        // Fallback for older browsers
        const ta = document.createElement('textarea');
        ta.value = text;
        ta.style.position = 'fixed';
        ta.style.opacity = '0';
        document.body.appendChild(ta);
        ta.select();
        document.execCommand('copy');
        document.body.removeChild(ta);
        if (btnEl) {
          const originalText = btnEl.textContent;
          btnEl.textContent = '✓ Copied!';
          setTimeout(() => { btnEl.textContent = originalText; }, 1500);
        }
      });
    },

    // Show result area with animation
    showResult: function (elementId) {
      const el = document.getElementById(elementId);
      if (el) {
        el.classList.remove('hidden');
        el.classList.add('animate-in');
      }
    },

    // Hide result area
    hideResult: function (elementId) {
      const el = document.getElementById(elementId);
      if (el) el.classList.add('hidden');
    },

    // Validate that a value is a positive number
    validatePositive: function (value, fieldName) {
      const num = parseFloat(value);
      if (isNaN(num) || num < 0) {
        return { valid: false, message: fieldName + ' must be a valid positive number.' };
      }
      return { valid: true, value: num };
    },

    // Show inline error on a form group
    showError: function (inputEl, message) {
      inputEl.classList.add('error');
      let errEl = inputEl.parentElement.querySelector('.error-msg');
      if (!errEl) {
        errEl = document.createElement('div');
        errEl.className = 'error-msg';
        errEl.style.cssText = 'color:#EF4444;font-size:0.8rem;margin-top:0.25rem;';
        inputEl.parentElement.appendChild(errEl);
      }
      errEl.textContent = message;
    },

    // Clear error from input
    clearError: function (inputEl) {
      inputEl.classList.remove('error');
      const errEl = inputEl.parentElement.querySelector('.error-msg');
      if (errEl) errEl.remove();
    },

    // Clear all errors in a form
    clearAllErrors: function (containerEl) {
      if (!containerEl) return;
      containerEl.querySelectorAll('.error').forEach(el => el.classList.remove('error'));
      containerEl.querySelectorAll('.error-msg').forEach(el => el.remove());
    },

    // Download text content as a file
    downloadFile: function (content, filename, mimeType) {
      mimeType = mimeType || 'text/plain';
      const blob = new Blob([content], { type: mimeType });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    },

    // Debounce function
    debounce: function (fn, delay) {
      let timer;
      return function (...args) {
        clearTimeout(timer);
        timer = setTimeout(() => fn.apply(this, args), delay);
      };
    },

    // Get today's date in YYYY-MM-DD
    today: function () {
      return new Date().toISOString().split('T')[0];
    },

    // Convert number to words (Indian numbering - for invoices/results)
    numberToWordsIndian: function (num) {
      if (num === 0) return 'Zero';
      const ones = ['', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine',
        'Ten', 'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen', 'Seventeen', 'Eighteen', 'Nineteen'];
      const tens = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];

      function convertHundreds(n) {
        let str = '';
        if (n >= 100) { str += ones[Math.floor(n / 100)] + ' Hundred '; n %= 100; }
        if (n >= 20) { str += tens[Math.floor(n / 10)] + ' '; n %= 10; }
        if (n > 0) str += ones[n] + ' ';
        return str.trim();
      }

      let result = '';
      if (num >= 10000000) { result += convertHundreds(Math.floor(num / 10000000)) + ' Crore '; num %= 10000000; }
      if (num >= 100000) { result += convertHundreds(Math.floor(num / 100000)) + ' Lakh '; num %= 100000; }
      if (num >= 1000) { result += convertHundreds(Math.floor(num / 1000)) + ' Thousand '; num %= 1000; }
      if (num > 0) result += convertHundreds(num);
      return result.trim();
    }
  };

  // ---- Smooth scroll for anchor links ----
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
      const target = document.querySelector(this.getAttribute('href'));
      if (target) {
        e.preventDefault();
        target.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    });
  });

  // ---- Auto-close mobile nav on outside click ----
  document.addEventListener('click', function (e) {
    if (mainNav && mainNav.classList.contains('active') && !mainNav.contains(e.target) && e.target !== mobileToggle) {
      mainNav.classList.remove('active');
      if (mobileToggle) mobileToggle.textContent = '☰';
    }
  });

})();
