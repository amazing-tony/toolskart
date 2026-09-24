/*!
 * Amazing-Tools — https://amazing-tools.github.io/
 * Copyright (c) 2024-2026 Amazing-Tools (tonymagical09@gmail.com)
 * Licensed under CC BY-NC 4.0 — Non-commercial use only.
 * Commercial use requires written permission. See LICENSE file.
 *//**
 * Amazing-Tools — Currency Module
 * Live rates from open.er-api.com (free, no key)
 * 1-hour TTL cache in localStorage
 */
(function () {
  'use strict';

  const RATE_API  = 'https://open.er-api.com/v6/latest/USD';
  const CACHE_KEY = 'at_currency_rates';
  const CURR_KEY  = 'at_preferred_currency';
  const TTL_MS    = 60 * 60 * 1000; // 1 hour

  // Supported currencies with display labels and flag emoji
  window.AT_CURRENCIES = [
    { code: 'USD', label: 'US Dollar',        flag: '🇺🇸' },
    { code: 'INR', label: 'Indian Rupee',      flag: '🇮🇳' },
    { code: 'EUR', label: 'Euro',              flag: '🇪🇺' },
    { code: 'GBP', label: 'British Pound',     flag: '🇬🇧' },
    { code: 'AED', label: 'UAE Dirham',        flag: '🇦🇪' },
    { code: 'SGD', label: 'Singapore Dollar',  flag: '🇸🇬' },
    { code: 'AUD', label: 'Australian Dollar', flag: '🇦🇺' },
    { code: 'CAD', label: 'Canadian Dollar',   flag: '🇨🇦' },
    { code: 'JPY', label: 'Japanese Yen',      flag: '🇯🇵' },
    { code: 'CNY', label: 'Chinese Yuan',      flag: '🇨🇳' },
    { code: 'CHF', label: 'Swiss Franc',       flag: '🇨🇭' },
    { code: 'MYR', label: 'Malaysian Ringgit', flag: '🇲🇾' },
    { code: 'SAR', label: 'Saudi Riyal',       flag: '🇸🇦' },
    { code: 'BRL', label: 'Brazilian Real',    flag: '🇧🇷' },
    { code: 'ZAR', label: 'South African Rand',flag: '🇿🇦' },
  ];

  let _rates = null; // { rates: {USD:1, INR:83.2, ...}, timestamp: ms }

  // ── Cache helpers ─────────────────────────────────────
  function loadCache() {
    try {
      const raw = localStorage.getItem(CACHE_KEY);
      if (!raw) return null;
      const obj = JSON.parse(raw);
      if (Date.now() - obj.timestamp < TTL_MS) return obj;
    } catch (_) {}
    return null;
  }

  function saveCache(obj) {
    try { localStorage.setItem(CACHE_KEY, JSON.stringify(obj)); } catch (_) {}
  }

  // ── Fetch live rates ──────────────────────────────────
  async function fetchRates() {
    const cached = loadCache();
    if (cached) { _rates = cached; return _rates; }
    try {
      const res  = await fetch(RATE_API);
      const json = await res.json();
      if (json.result !== 'success') throw new Error('API error');
      _rates = { rates: json.rates, timestamp: Date.now() };
      saveCache(_rates);
      return _rates;
    } catch (e) {
      // Fallback hardcoded snapshot (updated 2025-09 approximate)
      _rates = {
        rates: { USD:1, INR:83.5, EUR:0.93, GBP:0.79, AED:3.67, SGD:1.34,
                 AUD:1.55, CAD:1.36, JPY:147.5, CNY:7.28, CHF:0.90,
                 MYR:4.72, SAR:3.75, BRL:5.01, ZAR:18.6 },
        timestamp: 0 // force refetch next load
      };
      console.warn('[AT Currency] Using fallback rates:', e.message);
      return _rates;
    }
  }

  // ── Preferred currency ────────────────────────────────
  function getPreferred() {
    try { return localStorage.getItem(CURR_KEY) || 'INR'; } catch (_) { return 'INR'; }
  }

  function setPreferred(code) {
    try { localStorage.setItem(CURR_KEY, code); } catch (_) {}
    window.preferredCurrency = code;
    document.dispatchEvent(new CustomEvent('at:currencyChanged', { detail: { code } }));
  }

  // ── Format a number as currency ───────────────────────
  function formatCurrency(amount, code) {
    code = code || getPreferred();
    try {
      return new Intl.NumberFormat(undefined, {
        style: 'currency', currency: code, maximumFractionDigits: 2
      }).format(amount);
    } catch (_) {
      return `${code} ${Number(amount).toLocaleString(undefined, { maximumFractionDigits: 2 })}`;
    }
  }

  // ── Convert amount from one currency to another ───────
  function convert(amount, from, to) {
    if (!_rates) return null;
    const r = _rates.rates;
    if (!r[from] || !r[to]) return null;
    return (amount / r[from]) * r[to];
  }

  // ── Render currency selector in header ───────────────
  function renderHeaderToggle() {
    const wrap = document.getElementById('currencyToggleWrap');
    if (!wrap) return;
    const preferred = getPreferred();
    const curr = window.AT_CURRENCIES.find(c => c.code === preferred) || window.AT_CURRENCIES[0];

    wrap.innerHTML = `
      <div class="currency-toggle-btn" id="currencyBtn" title="Switch currency" tabindex="0" role="button" aria-haspopup="true">
        <span class="currency-flag">${curr.flag}</span>
        <span class="currency-code">${curr.code}</span>
        <span style="font-size:0.5rem;opacity:0.6;">▾</span>
      </div>
      <div class="currency-dropdown" id="currencyDropdown" style="display:none;">
        ${window.AT_CURRENCIES.map(c => `
          <button class="currency-option ${c.code === preferred ? 'active' : ''}" data-code="${c.code}">
            <span>${c.flag}</span>
            <span class="currency-opt-code">${c.code}</span>
            <span class="currency-opt-label">${c.label}</span>
          </button>
        `).join('')}
      </div>
    `;

    const btn = document.getElementById('currencyBtn');
    const dropdown = document.getElementById('currencyDropdown');

    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      const isOpen = dropdown.style.display !== 'none';
      dropdown.style.display = isOpen ? 'none' : 'block';
    });

    dropdown.querySelectorAll('.currency-option').forEach(opt => {
      opt.addEventListener('click', () => {
        setPreferred(opt.dataset.code);
        dropdown.style.display = 'none';
        renderHeaderToggle(); // refresh display
      });
    });

    document.addEventListener('click', () => { dropdown.style.display = 'none'; });
  }

  // ── Init ──────────────────────────────────────────────
  async function init() {
    window.preferredCurrency = getPreferred();
    await fetchRates();
    renderHeaderToggle();
  }

  // ── Public API ────────────────────────────────────────
  window.AT_Currency = {
    init,
    getPreferred,
    setPreferred,
    formatCurrency,
    convert,
    getRates: () => _rates,
    currencies: window.AT_CURRENCIES
  };

  // Auto-init when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
