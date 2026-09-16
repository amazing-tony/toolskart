/* ========================================
   ToolsKart — Common JavaScript Utilities
   Shared across all pages
   ======================================== */

(function () {
  'use strict';

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

  // ---- Utility Functions (globally available) ----
  window.ToolsKart = {
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
