/*!
 * Amazing-Tools — https://amazing-tools.github.io/
 * Copyright (c) 2024-2026 Amazing-Tools (tonymagical09@gmail.com)
 * Licensed under CC BY-NC 4.0 — Non-commercial use only.
 * Commercial use requires written permission. See LICENSE file.
 *//* ========================================
   ToolsKart — Common JavaScript Utilities
   Shared across all pages
   ======================================== */

(function () {
  'use strict';

  // ---- Multi-Theme Architecture: 11 Distinct Design Systems ----
  const THEME_KEY = 'toolskart_theme';
  const THEME_USER_SET_KEY = 'toolskart_theme_user_set';
  const DEFAULT_THEME = 'theme-09-paper';

  const THEMES = [
    { id: 'theme-01-executive', name: 'Executive' },
    { id: 'theme-02-horizon',   name: 'Horizon' },
    { id: 'theme-03-heritage',  name: 'Heritage' },
    { id: 'theme-04-slate',     name: 'Slate' },
    { id: 'theme-05-copper',    name: 'Copper' },
    { id: 'theme-06-ocean',     name: 'Ocean' },
    { id: 'theme-07-forest',    name: 'Forest' },
    { id: 'theme-08-graphite',  name: 'Graphite' },
    { id: 'theme-09-paper',     name: 'Paper' },
    { id: 'theme-10-studio',    name: 'Studio' },
    { id: 'theme-11-midnight',  name: 'Midnight' }
  ];

  const THEME_ALIASES = {
    'executive': 'theme-01-executive',
    'us-tech': 'theme-01-executive',
    'adminlte': 'theme-01-executive',
    'teal': 'theme-01-executive',
    'sejda': 'theme-01-executive',
    'horizon': 'theme-02-horizon',
    'minimal-light': 'theme-02-horizon',
    'white': 'theme-02-horizon',
    'heritage': 'theme-03-heritage',
    'indian-ethos': 'theme-03-heritage',
    'ivory': 'theme-03-heritage',
    'warm-ivory': 'theme-03-heritage',
    'slate': 'theme-04-slate',
    'nordic': 'theme-04-slate',
    'grey': 'theme-04-slate',
    'copper': 'theme-05-copper',
    'kolkata': 'theme-05-copper',
    'amber': 'theme-05-copper',
    'ocean': 'theme-06-ocean',
    'forest': 'theme-07-forest',
    'uk-oxford': 'theme-07-forest',
    'emerald': 'theme-07-forest',
    'graphite': 'theme-08-graphite',
    'minimal-dark': 'theme-08-graphite',
    'dark': 'theme-08-graphite',
    'paper': 'theme-09-paper',
    'chinese-harmony': 'theme-09-paper',
    'studio': 'theme-10-studio',
    'punjabi': 'theme-10-studio',
    'royal': 'theme-10-studio',
    'midnight': 'theme-11-midnight',
    'delhi-metro': 'theme-11-midnight',
    'russian-granite': 'theme-11-midnight',
    'facebook': 'theme-11-midnight'
  };

  let toastTimer = null;

  function showThemeToast(themeName, index, total) {
    let toastEls = document.querySelectorAll('.theme-toast');
    if (toastEls.length === 0) {
      const wrap = document.querySelector('.theme-cycle-wrap');
      const newToast = document.createElement('div');
      newToast.className = 'theme-toast';
      newToast.setAttribute('role', 'status');
      newToast.setAttribute('aria-live', 'polite');
      if (wrap) {
        wrap.appendChild(newToast);
      } else {
        document.body.appendChild(newToast);
      }
      toastEls = [newToast];
    }

    const label = (index !== undefined && total !== undefined)
      ? `Theme (${index + 1}/${total}): ${themeName}`
      : `Theme: ${themeName}`;

    toastEls.forEach(toast => {
      toast.textContent = label;
      toast.classList.add('visible');
    });

    if (toastTimer) clearTimeout(toastTimer);
    toastTimer = setTimeout(() => {
      toastEls.forEach(toast => toast.classList.remove('visible'));
    }, 1500);
  }

  function applyTheme(themeId, triggerToast = false, isUserAction = false) {
    if (THEME_ALIASES[themeId]) themeId = THEME_ALIASES[themeId];
    const themeObj = THEMES.find(t => t.id === themeId) || THEMES.find(t => t.id === DEFAULT_THEME) || THEMES[0];
    const resolvedId = themeObj.id;
    const themeIndex = THEMES.findIndex(t => t.id === resolvedId);

    document.documentElement.setAttribute('data-theme', resolvedId);
    
    // Persist per-user independently whenever the user actively selects/changes their theme
    if (isUserAction) {
      try {
        localStorage.setItem(THEME_KEY, resolvedId);
        localStorage.setItem(THEME_USER_SET_KEY, 'true');
      } catch (e) {}
    }

    // Update all theme buttons title and aria-labels
    document.querySelectorAll('.theme-cycle-btn, .theme-toggle-btn').forEach(btn => {
      const idxText = themeIndex >= 0 ? ` (${themeIndex + 1}/${THEMES.length})` : '';
      btn.setAttribute('title', `Theme: ${themeObj.name}${idxText} (Click or Shift+T to cycle)`);
      btn.setAttribute('aria-label', `Theme: ${themeObj.name}${idxText}. Click to cycle theme.`);
    });

    // Update theme dropdown active option if present
    document.querySelectorAll('.theme-option-item').forEach(item => {
      const optTheme = item.getAttribute('data-theme');
      if (optTheme === resolvedId || THEME_ALIASES[optTheme] === resolvedId) {
        item.classList.add('active');
      } else {
        item.classList.remove('active');
      }
    });

    if (triggerToast) {
      showThemeToast(themeObj.name, themeIndex, THEMES.length);
    }

    // Propagate to iframe if present
    const toolIframe = document.getElementById('toolIframe');
    if (toolIframe && toolIframe.contentDocument) {
      try {
        toolIframe.contentDocument.documentElement.setAttribute('data-theme', resolvedId);
      } catch (e) {}
    }

    // If embedded in an iframe, notify top window as well
    if (window.self !== window.top) {
      try {
        window.top.postMessage({ type: 'TOOLSKART_THEME_CHANGE', themeId: resolvedId }, '*');
      } catch (e) {}
    }
  }

  function cycleTheme() {
    let currentId = document.documentElement.getAttribute('data-theme') || DEFAULT_THEME;
    if (THEME_ALIASES[currentId]) currentId = THEME_ALIASES[currentId];
    
    let currentIndex = THEMES.findIndex(t => t.id === currentId);
    if (currentIndex === -1) currentIndex = 0;

    const nextIndex = (currentIndex + 1) % THEMES.length;
    applyTheme(THEMES[nextIndex].id, true, true);
  }

  // Detect and set initial theme: Paper by default, or user's explicit saved choice
  let savedTheme = DEFAULT_THEME;
  try {
    const isUserSet = localStorage.getItem(THEME_USER_SET_KEY) === 'true';
    const stored = localStorage.getItem(THEME_KEY);
    if (stored) {
      if (isUserSet) {
        // Explicit user choice persists independently for this user
        savedTheme = stored;
      } else if (stored !== 'theme-01-executive' && stored !== 'executive' && stored !== 'adminlte' && stored !== 'teal' && stored !== 'us-tech' && stored !== 'sejda') {
        savedTheme = stored;
      } else {
        // Migrate old automatic default to new 'paper' default
        savedTheme = DEFAULT_THEME;
      }
    }
  } catch (e) {}
  applyTheme(savedTheme, false, false);

  // If running inside an iframe, enable embedded mode
  if (window.self !== window.top) {
    document.body.classList.add('is-embedded');
  }

  // Theme Cycle Button listener (Single Icon ◐, toggle buttons, and dropdown options)
  document.addEventListener('click', (e) => {
    const cycleBtn = e.target.closest('.theme-cycle-btn, .theme-toggle-btn, [data-action="cycle-theme"]');
    if (cycleBtn) {
      e.preventDefault();
      e.stopPropagation();
      cycleTheme();
      return;
    }

    const themeItem = e.target.closest('.theme-option-item');
    if (themeItem) {
      e.preventDefault();
      const targetTheme = themeItem.getAttribute('data-theme');
      if (targetTheme) {
        applyTheme(targetTheme, true, true);
      }
      return;
    }
  });

  // Shift + T keyboard shortcut
  document.addEventListener('keydown', (e) => {
    if (e.shiftKey && (e.key === 'T' || e.key === 't')) {
      const activeTag = document.activeElement ? document.activeElement.tagName : '';
      if (activeTag !== 'INPUT' && activeTag !== 'TEXTAREA') {
        e.preventDefault();
        cycleTheme();
      }
    }
  });

  // Cross-tab synchronization via storage event
  window.addEventListener('storage', (e) => {
    if (e.key === THEME_KEY && e.newValue) {
      applyTheme(e.newValue, false, false);
    }
  });

  // Cross-frame synchronization via postMessage
  window.addEventListener('message', (event) => {
    if (event.data && event.data.type === 'TOOLSKART_THEME_CHANGE' && event.data.themeId) {
      applyTheme(event.data.themeId, false, false);
    }
  });

  // Expose global methods for tool panels or external controls
  window.cycleTheme = cycleTheme;
  window.applyTheme = applyTheme;
  window.THEMES = THEMES;

  const dynamicWords = [
    { text: "100% Secure", color: "#34D399", bg: "rgba(16, 185, 129, 0.15)", border: "rgba(16, 185, 129, 0.45)" },
    { text: "Completely Private", color: "#38BDF8", bg: "rgba(56, 189, 248, 0.15)", border: "rgba(56, 189, 248, 0.45)" },
    { text: "Client-Side Only", color: "#FBBF24", bg: "rgba(245, 158, 11, 0.15)", border: "rgba(245, 158, 11, 0.45)" },
    { text: "Zero Server Uploads", color: "#A78BFA", bg: "rgba(139, 92, 246, 0.15)", border: "rgba(139, 92, 246, 0.45)" },
    { text: "Blazing Fast & Private", color: "#FB7185", bg: "rgba(244, 63, 94, 0.15)", border: "rgba(244, 63, 94, 0.45)" },
    { text: "AI-Powered & Local", color: "#22D3EE", bg: "rgba(6, 182, 212, 0.15)", border: "rgba(6, 182, 212, 0.45)" }
  ];

  function initDynamicUspRotator() {
    const el = document.getElementById('dynamicUspText');
    if (!el) return;

    let wordIndex = 0;
    let charIndex = 0;
    let isDeleting = false;
    let typingSpeed = 90;

    function typeStep() {
      const current = dynamicWords[wordIndex];
      const fullText = current.text;

      el.style.color = current.color;
      el.style.backgroundColor = current.bg;
      el.style.borderColor = current.border;
      el.style.textShadow = `0 0 16px ${current.color}66`;

      if (isDeleting) {
        el.textContent = fullText.substring(0, charIndex - 1);
        charIndex--;
        typingSpeed = 45;
      } else {
        el.textContent = fullText.substring(0, charIndex + 1);
        charIndex++;
        typingSpeed = 85;
      }

      if (!isDeleting && charIndex === fullText.length) {
        typingSpeed = 2200;
        isDeleting = true;
      } else if (isDeleting && charIndex === 0) {
        isDeleting = false;
        wordIndex = (wordIndex + 1) % dynamicWords.length;
        typingSpeed = 400;
      }

      setTimeout(typeStep, typingSpeed);
    }

    typeStep();
  }

  // Initialize typewriter on load
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initDynamicUspRotator);
  } else {
    initDynamicUspRotator();
  }

  // ---- Smart Header Category Navigation & Direct Filtering ----
  document.querySelectorAll('.nav-category-link[data-category-target]').forEach(link => {
    link.addEventListener('click', function (e) {
      e.preventDefault();
      const targetCatId = this.getAttribute('data-category-target');

      // If a tool is open, close it so dashboard overview is visible
      const toolPanel = document.getElementById('toolContentPanel');
      if (toolPanel && toolPanel.style.display !== 'none') {
        closeToolPanel();
      }

      // Trigger matching category filter pill
      const targetFilterPill = document.querySelector(`.filter-pill[data-filter="${targetCatId}"]`);
      if (targetFilterPill) {
        targetFilterPill.click();
      } else {
        const sec = document.getElementById(targetCatId);
        if (sec) sec.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }

      // Close mobile navigation if active
      if (mainNav && mainNav.classList.contains('active')) {
        mainNav.classList.remove('active');
        if (mobileToggle) mobileToggle.textContent = '☰';
      }
    });
  });

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
  const sidebarBackdrop = document.getElementById('sidebarBackdrop');

  if (sidebarToggle && portalSidebar) {
    // Restore desktop collapsed preference
    try {
      const savedCollapsed = localStorage.getItem('portal_sidebar_collapsed');
      if (savedCollapsed === '1' && window.innerWidth > 1024) {
        document.body.classList.add('sidebar-collapsed');
        portalSidebar.classList.add('is-collapsed');
        sidebarToggle.classList.add('is-active');
        sidebarToggle.setAttribute('title', 'Expand Sidebar');
        sidebarToggle.setAttribute('aria-expanded', 'false');
      } else {
        sidebarToggle.setAttribute('title', 'Collapse Sidebar');
        sidebarToggle.setAttribute('aria-expanded', 'true');
      }
    } catch (_) {}

    const closeMobileSidebar = () => {
      portalSidebar.classList.remove('open');
      if (sidebarBackdrop) sidebarBackdrop.classList.remove('active');
    };

    sidebarToggle.addEventListener('click', (e) => {
      e.stopPropagation();
      if (window.innerWidth <= 1024) {
        const isOpen = portalSidebar.classList.toggle('open');
        if (sidebarBackdrop) sidebarBackdrop.classList.toggle('active', isOpen);
      } else {
        const isCollapsed = document.body.classList.toggle('sidebar-collapsed');
        portalSidebar.classList.toggle('is-collapsed', isCollapsed);
        sidebarToggle.classList.toggle('is-active', isCollapsed);
        sidebarToggle.setAttribute('title', isCollapsed ? 'Expand Sidebar' : 'Collapse Sidebar');
        sidebarToggle.setAttribute('aria-expanded', isCollapsed ? 'false' : 'true');
        try { localStorage.setItem('portal_sidebar_collapsed', isCollapsed ? '1' : '0'); } catch (_) {}
      }
    });

    if (sidebarBackdrop) sidebarBackdrop.addEventListener('click', closeMobileSidebar);

    document.addEventListener('click', (e) => {
      if (window.innerWidth <= 1024 && portalSidebar.classList.contains('open')) {
        if (!portalSidebar.contains(e.target) && e.target !== sidebarToggle) closeMobileSidebar();
      }
    });

    // Close mobile sidebar on link click
    portalSidebar.querySelectorAll('.sb-item, .sb-child').forEach(link => {
      link.addEventListener('click', () => { if (window.innerWidth <= 1024) closeMobileSidebar(); });
    });

    // Ctrl+B shortcut
    document.addEventListener('keydown', (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'b' && !['INPUT','TEXTAREA','SELECT'].includes(e.target.tagName)) {
        e.preventDefault();
        sidebarToggle.click();
      }
    });
  }

  // ---- Hierarchical Treeview Accordion ----
  portalSidebar && portalSidebar.querySelectorAll('.sb-tree-toggle').forEach(btn => {
    btn.addEventListener('click', () => {
      const treeId = btn.dataset.tree;
      const body = document.getElementById('tree-' + treeId);
      if (!body) return;

      const isOpen = body.classList.contains('is-open');

      // Close all other trees (accordion behaviour)
      portalSidebar.querySelectorAll('.sb-tree-body.is-open').forEach(el => {
        if (el !== body) {
          el.classList.remove('is-open');
          const toggle = portalSidebar.querySelector(`[data-tree="${el.id.replace('tree-','')}"]`);
          if (toggle) toggle.setAttribute('aria-expanded', 'false');
          const sec = el.closest('.sb-section');
          if (sec) sec.classList.remove('is-open');
        }
      });

      // Toggle this tree
      body.classList.toggle('is-open', !isOpen);
      btn.setAttribute('aria-expanded', (!isOpen).toString());
      const section = btn.closest('.sb-section');
      if (section) section.classList.toggle('is-open', !isOpen);

      // Auto-scroll into view if opening
      if (!isOpen) {
        setTimeout(() => {
          body.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        }, 120);
      }
    });
  });

  // Mark active sidebar item based on current URL
  if (portalSidebar) {
    const currentPath = window.location.pathname + window.location.search;
    portalSidebar.querySelectorAll('.sb-item, .sb-child').forEach(link => {
      const href = link.getAttribute('href') || '';
      if (href && currentPath.includes(href.split('?')[0]) && href !== '/' && href !== '#') {
        link.classList.add('is-active');
        // Open parent tree if nested
        const parentBody = link.closest('.sb-tree-body');
        if (parentBody) {
          parentBody.classList.add('is-open');
          const treeId = parentBody.id.replace('tree-', '');
          const toggle = portalSidebar.querySelector(`[data-tree="${treeId}"]`);
          if (toggle) toggle.setAttribute('aria-expanded', 'true');
          const parentSec = parentBody.closest('.sb-section');
          if (parentSec) parentSec.classList.add('is-open');
        }
      }
    });
  }

  // Quick search filter inside sidebar (new sb-nav classes)
  const sidebarSearch = document.getElementById('sidebarSearch');
  if (sidebarSearch && portalSidebar) {
    sidebarSearch.addEventListener('input', function () {
      const q = this.value.toLowerCase().trim();
      const items = portalSidebar.querySelectorAll('.sb-item, .sb-child');
      const sections = portalSidebar.querySelectorAll('.sb-section');

      if (!q) {
        items.forEach(el => el.style.display = '');
        sections.forEach(s => s.style.display = '');
        return;
      }

      items.forEach(el => {
        el.style.display = el.textContent.toLowerCase().includes(q) ? '' : 'none';
      });

      sections.forEach(s => {
        const visible = s.querySelectorAll('.sb-item:not([style*="display: none"]), .sb-child:not([style*="display: none"])');
        s.style.display = visible.length === 0 ? 'none' : '';
        // Auto-open tree body if it has results
        const body = s.querySelector('.sb-tree-body');
        if (body && visible.length > 0) {
          body.classList.add('is-open');
          s.classList.add('is-open');
          const toggle = s.querySelector('.sb-tree-toggle');
          if (toggle) toggle.setAttribute('aria-expanded', 'true');
        }
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
    // Dedicated PDF Document Studio & Sub-Tool Aliases
    'pdf-tools': { title: 'PDF Document Studio', category: 'Document Tools', url: 'pages/pdf-tools.html' },
    'split': { title: 'Split PDF Pages', category: 'Document Tools', url: 'pages/pdf-tools.html?tool=split' },
    'merge': { title: 'Merge PDF Files', category: 'Document Tools', url: 'pages/pdf-tools.html?tool=merge' },
    'edit': { title: 'PDF Editor & Sign', category: 'Document Tools', url: 'pages/pdf-tools.html?tool=edit' },
    'compress': { title: 'Compress & Optimize PDF', category: 'Document Tools', url: 'pages/pdf-tools.html?tool=compress' },
    'organize': { title: 'Organize & Rotate PDF Pages', category: 'Document Tools', url: 'pages/pdf-tools.html?tool=organize' },
    'pdf-to-img': { title: 'PDF to JPG / PNG Images', category: 'Document Tools', url: 'pages/pdf-tools.html?tool=pdf-to-img' },
    'img-to-pdf': { title: 'Images to PDF Converter', category: 'Document Tools', url: 'pages/pdf-tools.html?tool=img-to-pdf' },
    'watermark': { title: 'Watermark PDF', category: 'Document Tools', url: 'pages/pdf-tools.html?tool=watermark' },
    'page-numbers': { title: 'Add Page Numbers to PDF', category: 'Document Tools', url: 'pages/pdf-tools.html?tool=page-numbers' },
    'protect': { title: 'Protect & Lock PDF', category: 'Document Tools', url: 'pages/pdf-tools.html?tool=protect' },
    'unlock': { title: 'Unlock PDF', category: 'Document Tools', url: 'pages/pdf-tools.html?tool=unlock' },
    'crop': { title: 'Crop PDF Margins', category: 'Document Tools', url: 'pages/pdf-tools.html?tool=crop' },
    'extract-text': { title: 'Extract Text from PDF', category: 'Document Tools', url: 'pages/pdf-tools.html?tool=extract-text' },
    'metadata': { title: 'PDF Metadata Editor', category: 'Document Tools', url: 'pages/pdf-tools.html?tool=metadata' },

    // Doc Converter Sub-tools
    'document-converter': { title: 'Universal Document Converter', category: 'Document Tools', url: 'pages/document-converter.html' },
    'pdf-to-word': { title: 'PDF to Word Converter', category: 'Document Tools', url: 'pages/document-converter.html?from=pdf&to=docx' },
    'word-to-pdf': { title: 'Word to PDF Converter', category: 'Document Tools', url: 'pages/document-converter.html?from=docx&to=pdf' },
    'pdf-to-excel': { title: 'PDF to Excel Converter', category: 'Document Tools', url: 'pages/document-converter.html?from=pdf&to=xlsx' },
    'excel-to-pdf': { title: 'Excel to PDF Converter', category: 'Document Tools', url: 'pages/document-converter.html?from=xlsx&to=pdf' },
    'pptx-to-pdf': { title: 'PowerPoint to PDF Converter', category: 'Document Tools', url: 'pages/document-converter.html?from=pptx&to=pdf' },

    // Standalone Web Applications & Sub-tools
    'video-downloader': { title: 'Video & Audio Downloader', category: 'Media Tools', url: 'pages/video-downloader.html' },
    'video-audio': { title: 'MP3 Audio Extractor', category: 'Media Tools', url: 'pages/video-downloader.html#audio' },
    'video-shorts': { title: 'Reels & Shorts Downloader', category: 'Media Tools', url: 'pages/video-downloader.html#shorts' },
    'video-youtube': { title: 'YouTube HD Video Downloader', category: 'Media Tools', url: 'pages/video-downloader.html#youtube' },
    'income-tax-calculator': { title: 'Income Tax Optimizer (Old vs New)', category: 'Financial Calculators', url: 'pages/income-tax-calculator.html' },
    'emi-calculator': { title: 'Loan Prepayment & Debt-Freedom Planner', category: 'Financial Calculators', url: 'pages/emi-calculator.html' },
    'prepayment': { title: 'Loan Prepayment & Debt Planner', category: 'Financial Calculators', url: 'pages/emi-calculator.html#prepay' },
    'gst-calculator': { title: 'GST Calculator & Tax Splitter', category: 'Financial Calculators', url: 'pages/gst-calculator.html' },
    'sip-calculator': { title: 'SIP & Wealth Builder', category: 'Financial Calculators', url: 'pages/sip-calculator.html' },
    'buy-vs-rent-calculator': { title: 'Buy Home vs Rent Decision', category: 'Financial Calculators', url: 'pages/buy-vs-rent-calculator.html' },
    'goal-financial-planner': { title: 'Life Goal & Freedom Planner', category: 'Financial Calculators', url: 'pages/goal-financial-planner.html' },
    'swp-annuity-calculator': { title: 'SWP & Pension Annuity Planner', category: 'Financial Calculators', url: 'pages/swp-annuity-calculator.html' },
    'retirement-benefits-calculator': { title: 'Retirement Benefits & Gratuity', category: 'Financial Calculators', url: 'pages/retirement-benefits-calculator.html' },
    'rd-calculator': { title: 'Recurring Deposit (RD) Calculator', category: 'Financial Calculators', url: 'pages/rd-calculator.html' },
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
    'meta-tag-generator': { title: 'Meta Tag & SEO Generator', category: 'Developer Tools', url: 'pages/meta-tag-generator.html' },
    'unit-converter': { title: 'Universal Unit Converter', category: 'Everyday Calculators', url: 'pages/unit-converter.html' },
    'currency-converter': { title: 'Currency Converter (Live Rates)', category: 'Financial Calculators', url: 'pages/currency-converter.html' },
    'qr-generator': { title: 'QR Code Generator', category: 'Developer Tools', url: 'pages/qr-generator.html' },
    'password-generator': { title: 'Password Generator & Strength Meter', category: 'Security Tools', url: 'pages/password-generator.html' },
    'timezone-converter': { title: 'Time Zone & World Clock', category: 'Everyday Calculators', url: 'pages/timezone-converter.html' },
    'tip-calculator': { title: 'Tip & Bill Split Calculator', category: 'Everyday Calculators', url: 'pages/tip-calculator.html' },
    'bmi-calculator': { title: 'BMI & Body Health Calculator', category: 'Health & Fitness', url: 'pages/bmi-calculator.html' },
    'markdown-previewer': { title: 'Markdown Live Editor & Previewer', category: 'Developer Tools', url: 'pages/markdown-previewer.html' },
    'support': { title: 'Support Amazing-Tools', category: 'About', url: 'support.html' },
    'terms': { title: 'Terms of Service', category: 'Legal', url: 'terms.html' },
    'privacy-policy': { title: 'Privacy Policy', category: 'Legal', url: 'privacy-policy.html' },
    'about': { title: 'About Us', category: 'Company', url: 'about.html' }
  };

  function extractSlugFromUrl(url) {
    if (!url) return null;
    if (url.includes('from=pdf&to=docx')) return 'pdf-to-word';
    if (url.includes('from=docx&to=pdf')) return 'word-to-pdf';
    if (url.includes('from=pdf&to=xlsx')) return 'pdf-to-excel';
    if (url.includes('from=xlsx&to=pdf')) return 'excel-to-pdf';
    if (url.includes('from=pptx&to=pdf')) return 'pptx-to-pdf';
    if (url.includes('#prepay')) return 'prepayment';
    if (url.includes('#audio')) return 'video-audio';
    if (url.includes('#shorts')) return 'video-shorts';
    if (url.includes('#youtube')) return 'video-youtube';
    const toolParam = url.match(/[?&]tool=([\w-]+)/);
    if (toolParam) return toolParam[1];
    const match = url.match(/(?:pages\/|^|\/)([\w-]+)\.html(?:\?|#|$)/);
    return match ? match[1] : null;
  }

  // ---- Suite Facilities Quick Switcher Definitions ----
  const PORTAL_SUITES = [
    {
      id: 'pdf',
      badge: '📄 PDF Studio (14 Tools)',
      tools: [
        { slug: 'edit', name: 'Edit & Sign', icon: '✏️', url: 'pages/pdf-tools.html?tool=edit' },
        { slug: 'merge', name: 'Merge PDF', icon: '🔀', url: 'pages/pdf-tools.html?tool=merge' },
        { slug: 'split', name: 'Split PDF', icon: '✂️', url: 'pages/pdf-tools.html?tool=split' },
        { slug: 'compress', name: 'Compress PDF', icon: '🗜️', url: 'pages/pdf-tools.html?tool=compress' },
        { slug: 'organize', name: 'Organize', icon: '🔄', url: 'pages/pdf-tools.html?tool=organize' },
        { slug: 'pdf-to-img', name: 'PDF → JPG', icon: '🖼️', url: 'pages/pdf-tools.html?tool=pdf-to-img' },
        { slug: 'img-to-pdf', name: 'JPG → PDF', icon: '📄', url: 'pages/pdf-tools.html?tool=img-to-pdf' },
        { slug: 'watermark', name: 'Watermark', icon: '💧', url: 'pages/pdf-tools.html?tool=watermark' },
        { slug: 'page-numbers', name: 'Page No.', icon: '🔢', url: 'pages/pdf-tools.html?tool=page-numbers' },
        { slug: 'protect', name: 'Protect', icon: '🔒', url: 'pages/pdf-tools.html?tool=protect' },
        { slug: 'unlock', name: 'Unlock', icon: '🔓', url: 'pages/pdf-tools.html?tool=unlock' },
        { slug: 'crop', name: 'Crop Margins', icon: '📐', url: 'pages/pdf-tools.html?tool=crop' },
        { slug: 'extract-text', name: 'Extract Text', icon: '📝', url: 'pages/pdf-tools.html?tool=extract-text' },
        { slug: 'metadata', name: 'Metadata', icon: '🏷️', url: 'pages/pdf-tools.html?tool=metadata' }
      ],
      matches: ['pdf-tools', 'edit', 'merge', 'split', 'compress', 'organize', 'pdf-to-img', 'img-to-pdf', 'watermark', 'page-numbers', 'protect', 'unlock', 'crop', 'extract-text', 'metadata']
    },
    {
      id: 'converter',
      badge: '🔄 Doc Converter Suite',
      tools: [
        { slug: 'document-converter', name: 'Universal', icon: '🔄', url: 'pages/document-converter.html' },
        { slug: 'pdf-to-word', name: 'PDF → Word', icon: '📄', url: 'pages/document-converter.html?from=pdf&to=docx' },
        { slug: 'word-to-pdf', name: 'Word → PDF', icon: '📝', url: 'pages/document-converter.html?from=docx&to=pdf' },
        { slug: 'pdf-to-excel', name: 'PDF → Excel', icon: '📊', url: 'pages/document-converter.html?from=pdf&to=xlsx' },
        { slug: 'excel-to-pdf', name: 'Excel → PDF', icon: '📈', url: 'pages/document-converter.html?from=xlsx&to=pdf' },
        { slug: 'pptx-to-pdf', name: 'PPTX → PDF', icon: '📽️', url: 'pages/document-converter.html?from=pptx&to=pdf' }
      ],
      matches: ['document-converter', 'pdf-to-word', 'word-to-pdf', 'pdf-to-excel', 'excel-to-pdf', 'pptx-to-pdf']
    },
    {
      id: 'media',
      badge: '🎥 Video & Media Suite',
      tools: [
        { slug: 'video-downloader', name: 'Universal Downloader', icon: '📥', url: 'pages/video-downloader.html' },
        { slug: 'video-audio', name: 'MP3 Extract', icon: '🎵', url: 'pages/video-downloader.html#audio' },
        { slug: 'video-shorts', name: 'Reels & Shorts', icon: '📱', url: 'pages/video-downloader.html#shorts' },
        { slug: 'video-youtube', name: 'YouTube HD', icon: '▶️', url: 'pages/video-downloader.html#youtube' }
      ],
      matches: ['video-downloader', 'video-audio', 'video-shorts', 'video-youtube']
    },
    {
      id: 'loans',
      badge: '🏦 Loans & Debt Suite',
      tools: [
        { slug: 'emi-calculator', name: 'EMI Calculator', icon: '📊', url: 'pages/emi-calculator.html' },
        { slug: 'prepayment', name: 'Prepayment Planner', icon: '💰', url: 'pages/emi-calculator.html#prepay' },
        { slug: 'buy-vs-rent-calculator', name: 'Buy vs Rent', icon: '🏡', url: 'pages/buy-vs-rent-calculator.html' },
        { slug: 'fd-calculator', name: 'FD Calculator', icon: '🏛️', url: 'pages/fd-calculator.html' },
        { slug: 'rd-calculator', name: 'RD Calculator', icon: '💳', url: 'pages/rd-calculator.html' }
      ],
      matches: ['emi-calculator', 'prepayment', 'buy-vs-rent-calculator', 'fd-calculator', 'rd-calculator']
    },
    {
      id: 'tax',
      badge: '📑 Tax & Income Suite',
      tools: [
        { slug: 'income-tax-calculator', name: 'Income Tax (FY26)', icon: '🏛️', url: 'pages/income-tax-calculator.html' },
        { slug: 'gst-calculator', name: 'GST Calculator', icon: '🧾', url: 'pages/gst-calculator.html' },
        { slug: 'percentage-calculator', name: 'Percentage Calc', icon: '%', url: 'pages/percentage-calculator.html' }
      ],
      matches: ['income-tax-calculator', 'gst-calculator', 'percentage-calculator']
    },
    {
      id: 'wealth',
      badge: '📈 Wealth & Investments',
      tools: [
        { slug: 'sip-calculator', name: 'SIP Builder', icon: '🌱', url: 'pages/sip-calculator.html' },
        { slug: 'swp-annuity-calculator', name: 'SWP & Pension', icon: '💵', url: 'pages/swp-annuity-calculator.html' },
        { slug: 'goal-financial-planner', name: 'Goal Planner', icon: '🎯', url: 'pages/goal-financial-planner.html' },
        { slug: 'retirement-benefits-calculator', name: 'Retirement & Gratuity', icon: '👴', url: 'pages/retirement-benefits-calculator.html' },
        { slug: 'compound-interest', name: 'Compound Interest', icon: '📈', url: 'pages/compound-interest.html' }
      ],
      matches: ['sip-calculator', 'swp-annuity-calculator', 'goal-financial-planner', 'retirement-benefits-calculator', 'compound-interest']
    },
    {
      id: 'text',
      badge: '📝 Text & Content Suite',
      tools: [
        { slug: 'word-counter', name: 'Word Counter', icon: '🔢', url: 'pages/word-counter.html' },
        { slug: 'case-converter', name: 'Case Converter', icon: '🔤', url: 'pages/case-converter.html' },
        { slug: 'json-formatter', name: 'JSON Formatter', icon: '⚡', url: 'pages/json-formatter.html' },
        { slug: 'base64-tool', name: 'Base64 Tool', icon: '🔐', url: 'pages/base64-tool.html' },
        { slug: 'lorem-ipsum', name: 'Lorem Ipsum', icon: '📄', url: 'pages/lorem-ipsum.html' },
        { slug: 'slug-generator', name: 'Slug Generator', icon: '🔗', url: 'pages/slug-generator.html' }
      ],
      matches: ['word-counter', 'case-converter', 'json-formatter', 'base64-tool', 'lorem-ipsum', 'slug-generator']
    },
    {
      id: 'dev',
      badge: '💻 Dev & Media Suite',
      tools: [
        { slug: 'image-compressor', name: 'Image Compressor', icon: '🖼️', url: 'pages/image-compressor.html' },
        { slug: 'image-resizer', name: 'Image Resizer', icon: '📐', url: 'pages/image-resizer.html' },
        { slug: 'regex-tester', name: 'Regex Tester', icon: '🔍', url: 'pages/regex-tester.html' },
        { slug: 'color-picker', name: 'Color Picker', icon: '🎨', url: 'pages/color-picker.html' },
        { slug: 'url-encoder', name: 'URL Encoder', icon: '🌐', url: 'pages/url-encoder.html' },
        { slug: 'meta-tag-generator', name: 'Meta Tag SEO', icon: '🏷️', url: 'pages/meta-tag-generator.html' }
      ],
      matches: ['image-compressor', 'image-resizer', 'regex-tester', 'color-picker', 'url-encoder', 'meta-tag-generator']
    }
  ];

  function updatePortalSuiteStrip(activeSlug) {
    const strip = document.getElementById('portalSuiteStrip');
    if (!strip) return;

    const matchedSuite = PORTAL_SUITES.find(s => s.matches.includes(activeSlug));
    if (!matchedSuite) {
      strip.style.display = 'none';
      strip.innerHTML = '';
      return;
    }

    let html = `<span class="portal-suite-badge">${matchedSuite.badge}:</span>`;
    html += '<div class="portal-suite-items">';
    matchedSuite.tools.forEach(t => {
      const isCurrent = t.slug === activeSlug || (activeSlug === 'pdf-tools' && t.slug === 'edit');
      html += `<button type="button" class="portal-suite-chip ${isCurrent ? 'active' : ''}" data-tool="${t.slug}" data-url="${t.url}" title="${t.name}">
        <span>${t.icon}</span><span>${t.name}</span>
      </button>`;
    });
    html += '</div>';

    strip.innerHTML = html;
    strip.style.display = 'flex';

    strip.querySelectorAll('.portal-suite-chip').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.preventDefault();
        const slug = btn.getAttribute('data-tool');
        const url = btn.getAttribute('data-url');
        const title = btn.getAttribute('title');
        openToolInPortal(slug, title, null, url);
      });
    });
  }

  function openToolInPortal(slug, customTitle, customCat, fullUrl) {
    const dashboardOverview = document.getElementById('dashboardOverview');
    const toolPanel = document.getElementById('toolContentPanel');
    updatePortalSuiteStrip(slug);
    const toolIframe = document.getElementById('toolIframe');
    const breadcrumbCat = document.getElementById('panelBreadcrumbCategory');
    const breadcrumbTitle = document.getElementById('panelBreadcrumbTitle');

    if (!toolPanel || !toolIframe) {
      // If outside index.html or inside an iframe, navigate parent to index.html#slug
      if (window.self !== window.top) {
        try {
          if (window.top && window.top.ToolsKart && window.top.ToolsKart.openTool) {
            window.top.ToolsKart.openTool(slug, customTitle, customCat, fullUrl);
            return;
          }
        } catch (e) {}
        window.top.location.href = (window.location.pathname.includes('/pages/') ? '../index.html#' : 'index.html#') + slug;
        return;
      }
      const prefix = window.location.pathname.includes('/pages/') ? '../index.html#' : 'index.html#';
      window.location.href = prefix + slug;
      return;
    }

    const regTool = toolRegistry[slug];
    if (!regTool && !fullUrl) {
      console.warn('Unknown tool slug:', slug);
      return;
    }

    const tool = regTool || {
      title: customTitle || slug.replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase()),
      category: customCat || 'Document Tools',
      url: fullUrl || ('pages/' + slug + '.html')
    };

    // Update breadcrumbs
    if (breadcrumbCat) breadcrumbCat.textContent = tool.category;
    if (breadcrumbTitle) breadcrumbTitle.textContent = tool.title;

    // Show tool panel and hide overview
    if (dashboardOverview) dashboardOverview.style.display = 'none';
    toolPanel.style.display = 'flex';

    // Target URL for iframe
    let targetUrl = fullUrl || tool.url;
    const rootLevelPages = ['terms.html', 'privacy-policy.html', 'about.html', 'support.html'];
    if (targetUrl.startsWith('pages/')) {
      const pageName = targetUrl.replace('pages/', '');
      if (rootLevelPages.includes(pageName)) {
        targetUrl = pageName;
      }
    } else if (!targetUrl.startsWith('http') && !rootLevelPages.includes(targetUrl)) {
      targetUrl = 'pages/' + targetUrl;
    }

    const activeUrl = toolIframe.getAttribute('data-active-url') || '';
    const activeBase = activeUrl.split('?')[0];
    const targetBase = targetUrl.split('?')[0];

    if (activeBase && activeBase === targetBase && activeBase.includes('pdf-tools.html') && targetUrl.includes('?tool=')) {
      toolIframe.setAttribute('data-active-url', targetUrl);
      try {
        const u = new URL(targetUrl, window.location.origin);
        const sub = u.searchParams.get('tool');
        if (sub && toolIframe.contentWindow) {
          toolIframe.contentWindow.postMessage({ type: 'activateTool', tool: sub }, '*');
        }
      } catch (err) {
        toolIframe.src = targetUrl;
      }
    } else if (activeUrl !== targetUrl) {
      toolIframe.setAttribute('data-active-url', targetUrl);
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
    document.querySelectorAll('.sb-item, .sb-child, .sidebar-link, .sidebar-sublink').forEach(link => {
      const linkSlug = link.getAttribute('data-tool') || extractSlugFromUrl(link.getAttribute('href'));
      const isMatch = linkSlug === slug;
      link.classList.toggle('is-active', isMatch);
      link.classList.toggle('active', isMatch);
      if (isMatch) {
        const parentBody = link.closest('.sb-tree-body');
        if (parentBody) {
          parentBody.classList.add('is-open');
          const treeId = parentBody.id.replace('tree-', '');
          const toggle = document.querySelector(`[data-tree="${treeId}"]`);
          if (toggle) toggle.setAttribute('aria-expanded', 'true');
          const parentSec = parentBody.closest('.sb-section');
          if (parentSec) parentSec.classList.add('is-open');
        }
      }
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
    document.querySelectorAll('.sb-item, .sb-child, .sidebar-link, .sidebar-sublink').forEach(link => {
      link.classList.remove('is-active', 'active');
    });
    const strip = document.getElementById('portalSuiteStrip');
    if (strip) {
      strip.style.display = 'none';
      strip.innerHTML = '';
    }
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

  // Intercept click on tools, cards, footer links, and sidebar links
  document.addEventListener('click', function (e) {
    // If inside pdf-tools sub-tool card or in-page interactive components, do not intercept
    if (e.target.closest('.pdf-suite-card') || e.target.closest('.sejda-tool-card') || e.target.closest('[data-pdf-subtool]')) {
      return;
    }

    const trigger = e.target.closest('[data-tool], a[href*="pages/"], .tool-card, .featured-card, .sidebar-link, .sidebar-sublink, .nav-quick-item, .bql-chip, .ru-chip, .footer a');
    if (!trigger) return;

    let slug = trigger.getAttribute('data-tool');
    const href = trigger.getAttribute('href');

    if (!slug && href) {
      slug = extractSlugFromUrl(href);
    }

    if (slug && toolRegistry[slug]) {
      const toolPanel = document.getElementById('toolContentPanel');
      if (toolPanel) {
        e.preventDefault();
        const title = trigger.querySelector('h3')?.textContent?.trim() || 
                      trigger.querySelector('span')?.textContent?.trim() || 
                      (toolRegistry[slug] && toolRegistry[slug].title);
        openToolInPortal(slug, title, null, href);
      } else if (window.self !== window.top) {
        // We are inside an iframe; only forward if slug is a valid registered tool or has a valid href
        e.preventDefault();
        try {
          if (window.top && window.top.ToolsKart && window.top.ToolsKart.openTool) {
            window.top.ToolsKart.openTool(slug, null, null, href);
            return;
          }
        } catch (err) {}
        const isInPages = window.location.pathname.includes('/pages/');
        window.top.location.href = (isInPages ? '../index.html#' : 'index.html#') + slug;
      }
    }
  });

  // Check URL hash on page load or on hashchange
  function checkUrlHash() {
    const hash = window.location.hash.replace('#', '').trim();
    if (hash && toolRegistry[hash]) {
      const tool = toolRegistry[hash];
      const search = window.location.search || '';
      const fullUrl = tool.url.includes('?') ? tool.url : (tool.url + search);
      openToolInPortal(hash, tool.title, tool.category, fullUrl);
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
    setTheme: function (themeId, triggerToast = false) {
      applyTheme(themeId, triggerToast, true);
    },
    hasAdPlacedInLeaderboard: hasAdPlacedInLeaderboard,

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

  // ---- Helper to detect if ads are placed in 'ad-unit ad-leaderboard' ----
  function hasAdPlacedInLeaderboard() {
    const leaderboard = document.querySelector('.ad-unit.ad-leaderboard');
    if (!leaderboard) return false;

    // 1. Explicit class markers
    if (leaderboard.classList.contains('ad-filled') || leaderboard.classList.contains('has-ad')) {
      return true;
    }

    // 2. Google AdSense: check if adsbygoogle has data-ad-status="filled" or contains an ad iframe
    const ins = leaderboard.querySelector('ins.adsbygoogle');
    if (ins) {
      const status = ins.getAttribute('data-ad-status');
      if (status === 'filled') return true;
      const adIframe = ins.querySelector('iframe');
      if (adIframe) return true;
    }

    // 3. Custom ad content or banner placed (excluding the sponsor-card placeholder & ad badge)
    const adElements = leaderboard.querySelectorAll('iframe, .active-ad, .ad-content, a[data-ad]');
    for (let el of adElements) {
      if (!el.closest('.ad-placeholder') && !el.closest('.sponsor-card')) {
        return true;
      }
    }

    return false;
  }

  // ---- Privacy USP Strip: Shown until ads are placed in 'ad-unit ad-leaderboard' ----
  function initPrivacyUspStrip() {
    const strips = document.querySelectorAll('.privacy-usp-strip');
    if (!strips.length) return;

    strips.forEach(strip => {
      if (strip.dataset.uspDismissInit) return;
      strip.dataset.uspDismissInit = 'true';

      const content = strip.querySelector('.usp-strip-content');
      let closeBtn = strip.querySelector('.usp-close-btn');
      if (!closeBtn && content) {
        closeBtn = document.createElement('button');
        closeBtn.type = 'button';
        closeBtn.className = 'usp-close-btn';
        closeBtn.setAttribute('aria-label', 'Dismiss notice');
        closeBtn.setAttribute('title', 'Dismiss notice');
        closeBtn.innerHTML = '&times;';
        content.appendChild(closeBtn);
      }

      function dismissNotice() {
        if (strip.classList.contains('is-dismissing') || strip.classList.contains('is-hidden')) return;
        strip.classList.add('is-dismissing');
        setTimeout(() => {
          strip.classList.add('is-hidden');
          strip.style.display = 'none';
        }, 650);
      }

      // Check if an ad is currently placed in 'ad-unit ad-leaderboard'
      // The notice is shown as long as no ads are placed.
      // If an ad IS placed, the notice is dismissed.
      if (hasAdPlacedInLeaderboard()) {
        dismissNotice();
      }

      // Dynamically monitor 'ad-unit ad-leaderboard' for when an ad is placed (e.g. AdSense async fill)
      const leaderboard = document.querySelector('.ad-unit.ad-leaderboard');
      if (leaderboard) {
        const observer = new MutationObserver(() => {
          if (hasAdPlacedInLeaderboard()) {
            dismissNotice();
            observer.disconnect();
          }
        });
        observer.observe(leaderboard, {
          childList: true,
          subtree: true,
          attributes: true,
          attributeFilter: ['data-ad-status', 'class']
        });
      }

      // Manual dismiss on close button click
      if (closeBtn) {
        closeBtn.addEventListener('click', (e) => {
          e.preventDefault();
          e.stopPropagation();
          dismissNotice();
        });
      }
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initPrivacyUspStrip);
  } else {
    initPrivacyUspStrip();
  }

})();
