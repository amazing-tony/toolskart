/*!
 * Amazing-Tools — https://amazing-tools.github.io/
 * Copyright (c) 2024-2026 Amazing-Tools (tonymagical09@gmail.com)
 * Licensed under CC BY-NC 4.0 — Non-commercial use only.
 * Commercial use requires written permission. See LICENSE file.
 *//**
 * Amazing-Tools — Portal Features Module
 * Handles: Recently Used, What's New strip, Command Palette (Ctrl+K),
 *          Feedback/Rating FAB, Tool Ratings (localStorage), Tool Request form
 */
(function () {
  'use strict';

  /* ─────────────────────────────────────────────────────────
     TOOL REGISTRY — all tools for command palette + search
  ───────────────────────────────────────────────────────── */
  const ALL_TOOLS = [
    { id:'pdf-tools',         name:'PDF Studio Suite',         emoji:'⚡', cat:'Documents',   href:'pages/pdf-tools.html' },
    { id:'document-converter',name:'Document Converter',       emoji:'🔄', cat:'Documents',   href:'pages/document-converter.html' },
    { id:'video-downloader',  name:'Video Downloader',         emoji:'🎥', cat:'Media',       href:'pages/video-downloader.html' },
    { id:'image-compressor',  name:'Image Compressor',         emoji:'🗜️', cat:'Images',      href:'pages/image-compressor.html' },
    { id:'image-resizer',     name:'Image Resizer',            emoji:'📐', cat:'Images',      href:'pages/image-resizer.html' },
    { id:'color-picker',      name:'Color Picker',             emoji:'🎨', cat:'Images',      href:'pages/color-picker.html' },
    { id:'income-tax-calculator',name:'Income Tax Calculator', emoji:'📑', cat:'Tax',         href:'pages/income-tax-calculator.html' },
    { id:'emi-calculator',    name:'Loan & EMI Calculator',    emoji:'🏦', cat:'Finance',     href:'pages/emi-calculator.html' },
    { id:'buy-vs-rent-calculator',name:'Buy vs Rent',          emoji:'🏡', cat:'Finance',     href:'pages/buy-vs-rent-calculator.html' },
    { id:'gst-calculator',    name:'GST Calculator',           emoji:'🧾', cat:'Tax',         href:'pages/gst-calculator.html' },
    { id:'sip-calculator',    name:'SIP Calculator',           emoji:'🌱', cat:'Investments', href:'pages/sip-calculator.html' },
    { id:'swp-annuity-calculator',name:'SWP & Pension',        emoji:'💵', cat:'Investments', href:'pages/swp-annuity-calculator.html' },
    { id:'goal-financial-planner',name:'Goal Planner',         emoji:'🎯', cat:'Investments', href:'pages/goal-financial-planner.html' },
    { id:'retirement-benefits-calculator',name:'Retirement & Gratuity',emoji:'👴',cat:'Finance',href:'pages/retirement-benefits-calculator.html'},
    { id:'compound-interest', name:'Compound Interest',        emoji:'📈', cat:'Finance',     href:'pages/compound-interest.html' },
    { id:'fd-calculator',     name:'FD Calculator',            emoji:'🏛️', cat:'Finance',     href:'pages/fd-calculator.html' },
    { id:'rd-calculator',     name:'RD Calculator',            emoji:'💳', cat:'Finance',     href:'pages/rd-calculator.html' },
    { id:'percentage-calculator',name:'Percentage Calculator', emoji:'%',  cat:'Math',        href:'pages/percentage-calculator.html' },
    { id:'age-calculator',    name:'Age Calculator',           emoji:'🎂', cat:'Everyday',    href:'pages/age-calculator.html' },
    { id:'word-counter',      name:'Word Counter',             emoji:'🔢', cat:'Text',        href:'pages/word-counter.html' },
    { id:'case-converter',    name:'Case Converter',           emoji:'🔤', cat:'Text',        href:'pages/case-converter.html' },
    { id:'json-formatter',    name:'JSON Formatter',           emoji:'⚡', cat:'Dev',         href:'pages/json-formatter.html' },
    { id:'base64-tool',       name:'Base64 Tool',              emoji:'🔐', cat:'Dev',         href:'pages/base64-tool.html' },
    { id:'lorem-ipsum',       name:'Lorem Ipsum Generator',    emoji:'📄', cat:'Text',        href:'pages/lorem-ipsum.html' },
    { id:'slug-generator',    name:'URL Slug Generator',       emoji:'🔗', cat:'Dev',         href:'pages/slug-generator.html' },
    { id:'url-encoder',       name:'URL Encoder / Decoder',    emoji:'🌐', cat:'Dev',         href:'pages/url-encoder.html' },
    { id:'regex-tester',      name:'Regex Tester',             emoji:'🔍', cat:'Dev',         href:'pages/regex-tester.html' },
    { id:'meta-tag-generator',name:'Meta Tag Generator',       emoji:'🏷️', cat:'Dev',         href:'pages/meta-tag-generator.html' },
    { id:'unit-converter',    name:'Unit Converter',           emoji:'📏', cat:'Everyday',    href:'pages/unit-converter.html' },
    { id:'currency-converter',name:'Currency Converter',       emoji:'💱', cat:'Finance',     href:'pages/currency-converter.html' },
    { id:'qr-generator',      name:'QR Code Generator',        emoji:'▦',  cat:'Utilities',   href:'pages/qr-generator.html' },
    { id:'password-generator',name:'Password Generator',       emoji:'🔑', cat:'Security',    href:'pages/password-generator.html' },
    { id:'timezone-converter',name:'Time Zone Converter',      emoji:'🕐', cat:'Everyday',    href:'pages/timezone-converter.html' },
    { id:'tip-calculator',    name:'Tip Calculator',           emoji:'🍽️', cat:'Everyday',    href:'pages/tip-calculator.html' },
    { id:'bmi-calculator',    name:'BMI Calculator',           emoji:'⚖️', cat:'Health',      href:'pages/bmi-calculator.html' },
    { id:'markdown-previewer',name:'Markdown Previewer',       emoji:'✍️', cat:'Dev',         href:'pages/markdown-previewer.html' },
  ];
  window.AT_TOOLS = ALL_TOOLS;

  /* ─────────────────────────────────────────────────────────
     RECENTLY USED
  ───────────────────────────────────────────────────────── */
  const RU_KEY  = 'at_recently_used';
  const RU_MAX  = 5;

  function getRecentlyUsed() {
    try { return JSON.parse(localStorage.getItem(RU_KEY) || '[]'); } catch(_){ return []; }
  }

  function addRecentlyUsed(toolId) {
    let list = getRecentlyUsed().filter(id => id !== toolId);
    list.unshift(toolId);
    if (list.length > RU_MAX) list = list.slice(0, RU_MAX);
    try { localStorage.setItem(RU_KEY, JSON.stringify(list)); } catch(_){}
  }

  function renderRecentlyUsed() {
    const bar   = document.getElementById('recentlyUsedBar');
    const chips = document.getElementById('recentChips');
    if (!bar || !chips) return;
    const ids = getRecentlyUsed();
    if (ids.length === 0) { bar.style.display = 'none'; return; }
    bar.style.display = 'flex';
    chips.innerHTML = ids.map(id => {
      const t = ALL_TOOLS.find(x => x.id === id);
      if (!t) return '';
      return `<a href="${t.href}" class="ru-chip" data-tool="${t.id}">
        <span class="ru-chip-icon">${t.emoji}</span>
        <span class="ru-chip-name">${t.name}</span>
      </a>`;
    }).join('');
  }

  // Track tool clicks to update recently used
  function initRecentlyUsed() {
    renderRecentlyUsed();
    document.addEventListener('click', (e) => {
      const link = e.target.closest('[data-tool]');
      if (link && link.dataset.tool) {
        addRecentlyUsed(link.dataset.tool);
      }
    });
  }

  /* ─────────────────────────────────────────────────────────
     WHAT'S NEW STRIP
  ───────────────────────────────────────────────────────── */
  const WN_DISMISSED_KEY = 'at_wn_dismissed';
  const WN_VERSION       = 'v5'; // bump to re-show after new features

  const ANNOUNCEMENTS = [
    { icon:'🆕', text:'<strong>New:</strong> Sidebar mini-rail — collapse to icons, hover to expand. Try <kbd>Ctrl+B</kbd>!' },
    { icon:'🌍', text:'<strong>New:</strong> 8 global tools added — Unit Converter, QR Generator, BMI, Currency & more!' },
    { icon:'⭐', text:'<strong>New:</strong> Rate tools & suggest new ones — click the ⭐ button to share your feedback!' },
    { icon:'⌨️', text:'<strong>New:</strong> Command palette — press <kbd>Ctrl+K</kbd> to instantly search any of 36 tools!' },
  ];
  let wnIndex = 0;

  function initWhatsNew() {
    const strip   = document.getElementById('whatsNewStrip');
    const textEl  = document.getElementById('whatsNewText');
    const dismiss = document.getElementById('whatsNewDismiss');
    if (!strip) return;
    try {
      if (localStorage.getItem(WN_DISMISSED_KEY) === WN_VERSION) {
        strip.style.display = 'none';
        return;
      }
    } catch(_){}

    // Rotate announcements every 4s
    function showAnnouncement() {
      if (!textEl) return;
      const a = ANNOUNCEMENTS[wnIndex % ANNOUNCEMENTS.length];
      textEl.innerHTML = `${a.icon} ${a.text}`;
      wnIndex++;
    }
    showAnnouncement();
    setInterval(showAnnouncement, 5000);

    dismiss && dismiss.addEventListener('click', () => {
      strip.style.display = 'none';
      try { localStorage.setItem(WN_DISMISSED_KEY, WN_VERSION); } catch(_){}
    });
  }

  /* ─────────────────────────────────────────────────────────
     COMMAND PALETTE (Ctrl+K)
  ───────────────────────────────────────────────────────── */
  let cmdOpen = false;

  function openCmdPalette() {
    const pal = document.getElementById('cmdPalette');
    const inp = document.getElementById('cmdSearch');
    if (!pal) return;
    cmdOpen = true;
    pal.style.display = 'flex';
    inp && setTimeout(() => inp.focus(), 50);
    renderCmdResults('');
  }

  function closeCmdPalette() {
    const pal = document.getElementById('cmdPalette');
    if (pal) pal.style.display = 'none';
    cmdOpen = false;
  }

  function renderCmdResults(q) {
    const container = document.getElementById('cmdResults');
    if (!container) return;
    q = q.toLowerCase().trim();
    const results = q
      ? ALL_TOOLS.filter(t =>
          t.name.toLowerCase().includes(q) ||
          t.cat.toLowerCase().includes(q)  ||
          t.id.toLowerCase().includes(q)
        )
      : ALL_TOOLS;

    if (results.length === 0) {
      container.innerHTML = `<div class="cmd-empty">No tools found for "<strong>${q}</strong>"</div>`;
      return;
    }

    container.innerHTML = results.slice(0, 10).map((t, i) => `
      <a href="${t.href}" class="cmd-result ${i===0?'cmd-result-selected':''}" data-tool="${t.id}">
        <span class="cmd-r-icon">${t.emoji}</span>
        <div class="cmd-r-info">
          <span class="cmd-r-name">${t.name}</span>
          <span class="cmd-r-cat">${t.cat}</span>
        </div>
        <span class="cmd-r-arrow">↵</span>
      </a>
    `).join('');
  }

  function initCmdPalette() {
    const pal   = document.getElementById('cmdPalette');
    const inp   = document.getElementById('cmdSearch');
    const close = document.getElementById('cmdPaletteClose');
    if (!pal) return;

    inp && inp.addEventListener('input', () => renderCmdResults(inp.value));

    inp && inp.addEventListener('keydown', (e) => {
      const items = pal.querySelectorAll('.cmd-result');
      const sel   = pal.querySelector('.cmd-result-selected');
      const idx   = Array.from(items).indexOf(sel);
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        const next = items[Math.min(idx + 1, items.length - 1)];
        sel && sel.classList.remove('cmd-result-selected');
        next && next.classList.add('cmd-result-selected');
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        const prev = items[Math.max(idx - 1, 0)];
        sel && sel.classList.remove('cmd-result-selected');
        prev && prev.classList.add('cmd-result-selected');
      } else if (e.key === 'Enter') {
        e.preventDefault();
        sel && sel.click();
      } else if (e.key === 'Escape') {
        closeCmdPalette();
      }
    });

    close && close.addEventListener('click', closeCmdPalette);

    pal.addEventListener('click', (e) => {
      if (e.target === pal) closeCmdPalette();
    });

    document.addEventListener('keydown', (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        cmdOpen ? closeCmdPalette() : openCmdPalette();
      }
    });
  }

  /* ─────────────────────────────────────────────────────────
     STAR RATINGS (localStorage — per tool)
  ───────────────────────────────────────────────────────── */
  const RATINGS_KEY = 'at_tool_ratings';

  function getRatings() {
    try { return JSON.parse(localStorage.getItem(RATINGS_KEY) || '{}'); } catch(_){ return {}; }
  }

  function getRating(toolId) {
    return getRatings()[toolId] || null;
  }

  function setRating(toolId, stars) {
    const r = getRatings();
    r[toolId] = { stars, ts: Date.now() };
    try { localStorage.setItem(RATINGS_KEY, JSON.stringify(r)); } catch(_){}
    return r[toolId];
  }

  /* ─────────────────────────────────────────────────────────
     FEEDBACK FAB + PANEL
  ───────────────────────────────────────────────────────── */
  function initFeedbackFAB() {
    const fab   = document.getElementById('feedbackFab');
    const panel = document.getElementById('feedbackPanel');
    if (!fab || !panel) return;
    let panelOpen = false;

    fab.addEventListener('click', () => {
      panelOpen = !panelOpen;
      panel.style.display = panelOpen ? 'block' : 'none';
      fab.classList.toggle('fab-active', panelOpen);
    });

    // Star rating in panel
    const stars = panel.querySelectorAll('.fp-star');
    const input = panel.querySelector('#fpStarValue');
    stars.forEach((star, i) => {
      star.addEventListener('click', () => {
        const val = i + 1;
        if (input) input.value = val;
        stars.forEach((s, j) => s.classList.toggle('active', j <= i));
      });
      star.addEventListener('mouseenter', () => {
        stars.forEach((s, j) => s.classList.toggle('hover', j <= i));
      });
      star.addEventListener('mouseleave', () => {
        stars.forEach(s => s.classList.remove('hover'));
      });
    });

    // Tool select in panel
    const toolSel = panel.querySelector('#fpToolSelect');
    if (toolSel) {
      toolSel.innerHTML = `<option value="">Select a tool (optional)</option>` +
        ALL_TOOLS.map(t => `<option value="${t.id}">${t.emoji} ${t.name}</option>`).join('');
    }

    // Submit
    const submitBtn = panel.querySelector('#fpSubmit');
    submitBtn && submitBtn.addEventListener('click', () => {
      const stars   = Number(input ? input.value : 0);
      const tool    = toolSel ? toolSel.value : '';
      const tag     = panel.querySelector('.fp-tag-btn.active');
      const msg     = panel.querySelector('#fpMessage');
      const msgText = msg ? msg.value.trim() : '';
      const tagVal  = tag ? tag.dataset.tag : '';

      if (stars > 0 && tool) setRating(tool, stars);

      // Compose mailto
      const subject = encodeURIComponent('Amazing-Tools Feedback');
      const body    = encodeURIComponent(
        `Rating: ${stars}/5\nTool: ${tool || 'General'}\nCategory: ${tagVal}\nMessage: ${msgText || '(none)'}`
      );
      const mailto  = `mailto:tonymagical09@gmail.com?subject=${subject}&body=${body}`;

      // Save to localStorage wishlist
      if (msgText) {
        try {
          const wishlist = JSON.parse(localStorage.getItem('at_wishlist') || '[]');
          wishlist.unshift({ text: msgText, tag: tagVal, ts: Date.now() });
          localStorage.setItem('at_wishlist', JSON.stringify(wishlist.slice(0, 50)));
        } catch(_){}
      }

      // Show confirmation toast
      const toast = document.getElementById('themeToast');
      if (toast) {
        toast.textContent = '✅ Thanks for your feedback!';
        toast.style.display = 'block';
        toast.style.opacity = '1';
        setTimeout(() => { toast.style.opacity = '0'; setTimeout(() => toast.style.display='none', 400); }, 3000);
      }

      // Open mailto (non-blocking)
      if (msgText || stars > 0) window.open(mailto);

      // Reset panel
      if (msg) msg.value = '';
      if (input) input.value = '0';
      stars && stars.forEach && stars.forEach(s => s.classList.remove('active'));
      panel.style.display = 'none';
      panelOpen = false;
      fab.classList.remove('fab-active');
    });

    // Tag buttons
    panel.querySelectorAll('.fp-tag-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        panel.querySelectorAll('.fp-tag-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
      });
    });

    // Close on outside click
    document.addEventListener('click', (e) => {
      if (panelOpen && !panel.contains(e.target) && e.target !== fab) {
        panel.style.display = 'none';
        panelOpen = false;
        fab.classList.remove('fab-active');
      }
    });
  }

  /* ─────────────────────────────────────────────────────────
     TOOL REQUEST SECTION — render community wishlist
  ───────────────────────────────────────────────────────── */
  function renderWishlist() {
    const container = document.getElementById('wishlistItems');
    if (!container) return;
    try {
      const wishlist = JSON.parse(localStorage.getItem('at_wishlist') || '[]');
      if (wishlist.length === 0) {
        container.innerHTML = '<p class="wishlist-empty">No suggestions yet — be the first! ⭐</p>';
        return;
      }
      container.innerHTML = wishlist.slice(0, 8).map(item => `
        <div class="wishlist-card">
          <span class="wishlist-tag ${item.tag ? 'tag-'+item.tag : ''}">${item.tag || 'Idea'}</span>
          <p class="wishlist-text">${escapeHtml(item.text)}</p>
          <span class="wishlist-ts">${timeAgo(item.ts)}</span>
        </div>
      `).join('');
    } catch(_){}
  }

  /* ─────────────────────────────────────────────────────────
     HELPERS
  ───────────────────────────────────────────────────────── */
  function escapeHtml(str) {
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
  }

  function timeAgo(ts) {
    const diff = Date.now() - ts;
    const mins = Math.floor(diff / 60000);
    if (mins < 1)  return 'just now';
    if (mins < 60) return `${mins}m ago`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24)  return `${hrs}h ago`;
    return `${Math.floor(hrs/24)}d ago`;
  }

  /* ─────────────────────────────────────────────────────────
     INIT
  ───────────────────────────────────────────────────────── */
  function init() {
    initRecentlyUsed();
    initWhatsNew();
    initCmdPalette();
    initFeedbackFAB();
    renderWishlist();
  }

  window.AT_Features = {
    init,
    addRecentlyUsed,
    getRating,
    setRating,
    openCmdPalette,
    closeCmdPalette,
    ALL_TOOLS,
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
