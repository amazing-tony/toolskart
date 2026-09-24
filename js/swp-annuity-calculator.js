/* =========================================================
   Amazing-Tools — SWP & Annuity Pension Calculator
   Inflation-Indexed Payout & Drawdown Engine
   ========================================================= */

(function () {
  'use strict';

  let currentMode = 'corpusToPayout'; // or 'payoutToCorpus'

  const modeCorpusToPayoutBtn = document.getElementById('modeCorpusToPayout');
  const modePayoutToCorpusBtn = document.getElementById('modePayoutToCorpus');

  const step1Title = document.getElementById('step1Title');
  const step1Subtitle = document.getElementById('step1Subtitle');
  const primaryAmountLabel = document.getElementById('primaryAmountLabel');
  const primaryAmountInput = document.getElementById('primaryAmount');
  const primaryAmountSlider = document.getElementById('primaryAmountSlider');
  const primaryAmountBadge = document.getElementById('primaryAmountBadge');
  const corpusQuickChips = document.getElementById('corpusQuickChips');

  const annualReturnInput = document.getElementById('annualReturn');
  const payoutYearsInput = document.getElementById('payoutYears');
  const inflationEscalationInput = document.getElementById('inflationEscalation');
  const payoutFreqSelect = document.getElementById('payoutFreq');

  const kpiMainLabel = document.getElementById('kpiMainLabel');
  const kpiMainValue = document.getElementById('kpiMainValue');
  const kpiMainSubtext = document.getElementById('kpiMainSubtext');
  const kpiTotalPayout = document.getElementById('kpiTotalPayout');
  const kpiTotalInterest = document.getElementById('kpiTotalInterest');
  const kpiFinalPayout = document.getElementById('kpiFinalPayout');

  const scheduleTableBody = document.getElementById('scheduleTableBody');
  const exportScheduleCsvBtn = document.getElementById('exportScheduleCsvBtn');

  let annuityChartInstance = null;
  let cachedSchedule = [];

  function formatINR(val) {
    if (isNaN(val) || val === null) return '₹ 0';
    return '₹ ' + Math.round(val).toLocaleString('en-IN');
  }

  function formatLakhCrore(val) {
    if (isNaN(val)) return '₹ 0';
    const absVal = Math.abs(val);
    const sign = val < 0 ? '-' : '';
    if (absVal >= 10000000) {
      return `${sign}₹ ${(absVal / 10000000).toFixed(2)} Cr`;
    } else if (absVal >= 100000) {
      return `${sign}₹ ${(absVal / 100000).toFixed(2)} L`;
    } else if (absVal >= 1000) {
      return `${sign}₹ ${(absVal / 1000).toFixed(1)} K`;
    }
    return `${sign}₹ ${Math.round(absVal)}`;
  }

  function syncSlider() {
    primaryAmountInput.addEventListener('input', () => {
      primaryAmountSlider.value = primaryAmountInput.value;
      updateBadge();
      recalculate();
    });
    primaryAmountSlider.addEventListener('input', () => {
      primaryAmountInput.value = primaryAmountSlider.value;
      updateBadge();
      recalculate();
    });
  }

  function updateBadge() {
    const val = parseFloat(primaryAmountInput.value) || 0;
    if (currentMode === 'corpusToPayout') {
      primaryAmountBadge.textContent = formatLakhCrore(val);
    } else {
      primaryAmountBadge.textContent = `${formatINR(val)} / mo`;
    }
  }

  // Switch Modes
  modeCorpusToPayoutBtn.addEventListener('click', () => {
    currentMode = 'corpusToPayout';
    modeCorpusToPayoutBtn.classList.add('active');
    modePayoutToCorpusBtn.classList.remove('active');

    step1Title.textContent = 'Starting Capital / Principal Corpus';
    step1Subtitle.textContent = 'Total retirement nest-egg available for systematic withdrawals';
    primaryAmountLabel.textContent = 'Principal Investment Corpus (₹)';
    primaryAmountInput.value = '5000000';
    primaryAmountSlider.min = '500000';
    primaryAmountSlider.max = '20000000';
    primaryAmountSlider.step = '100000';
    primaryAmountSlider.value = '5000000';

    corpusQuickChips.innerHTML = `
      <button type="button" class="quick-chip" data-val="2500000">₹ 25 L</button>
      <button type="button" class="quick-chip active" data-val="5000000">₹ 50 L</button>
      <button type="button" class="quick-chip" data-val="7500000">₹ 75 L</button>
      <button type="button" class="quick-chip" data-val="10000000">₹ 1 Cr</button>
      <button type="button" class="quick-chip" data-val="20000000">₹ 2 Cr</button>
    `;
    bindChips();
    updateBadge();
    recalculate();
  });

  modePayoutToCorpusBtn.addEventListener('click', () => {
    currentMode = 'payoutToCorpus';
    modePayoutToCorpusBtn.classList.add('active');
    modeCorpusToPayoutBtn.classList.remove('active');

    step1Title.textContent = 'Desired Monthly Pension / Income';
    step1Subtitle.textContent = 'Target income required in Year 1 of retirement';
    primaryAmountLabel.textContent = 'Desired Monthly Payout (₹/mo)';
    primaryAmountInput.value = '40000';
    primaryAmountSlider.min = '10000';
    primaryAmountSlider.max = '300000';
    primaryAmountSlider.step = '5000';
    primaryAmountSlider.value = '40000';

    corpusQuickChips.innerHTML = `
      <button type="button" class="quick-chip" data-val="25000">₹ 25,000</button>
      <button type="button" class="quick-chip active" data-val="40000">₹ 40,000</button>
      <button type="button" class="quick-chip" data-val="60000">₹ 60,000</button>
      <button type="button" class="quick-chip" data-val="100000">₹ 1 Lakh</button>
      <button type="button" class="quick-chip" data-val="150000">₹ 1.5 Lakh</button>
    `;
    bindChips();
    updateBadge();
    recalculate();
  });

  function bindChips() {
    corpusQuickChips.querySelectorAll('.quick-chip').forEach(chip => {
      chip.addEventListener('click', function () {
        const val = this.getAttribute('data-val');
        primaryAmountInput.value = val;
        primaryAmountSlider.value = val;
        corpusQuickChips.querySelectorAll('.quick-chip').forEach(c => c.classList.remove('active'));
        this.classList.add('active');
        updateBadge();
        recalculate();
      });
    });
  }

  // Calculation Core
  function recalculate() {
    const inputVal = parseFloat(primaryAmountInput.value) || 0;
    const rAnnual = (parseFloat(annualReturnInput.value) || 8) / 100;
    const years = parseInt(payoutYearsInput.value, 10) || 20;
    const gInf = (parseFloat(inflationEscalationInput.value) || 5) / 100;
    const mFreq = parseInt(payoutFreqSelect.value, 10) || 12;

    const periods = years * mFreq;
    const rPeriod = rAnnual / mFreq;
    const gPeriod = gInf / mFreq;

    // Real interest rate per period
    const realRate = (1 + rPeriod) / (1 + gPeriod) - 1;

    let initialPrincipal = 0;
    let initialPayoutPeriod = 0;

    if (currentMode === 'corpusToPayout') {
      initialPrincipal = inputVal;
      if (Math.abs(realRate) < 0.00001) {
        initialPayoutPeriod = initialPrincipal / periods;
      } else {
        initialPayoutPeriod = (initialPrincipal * realRate) / (1 - Math.pow(1 + realRate, -periods));
      }
    } else {
      // Input is desired monthly payout
      const desiredMonthly = inputVal;
      initialPayoutPeriod = desiredMonthly * (12 / mFreq);
      if (Math.abs(realRate) < 0.00001) {
        initialPrincipal = initialPayoutPeriod * periods;
      } else {
        initialPrincipal = initialPayoutPeriod * ((1 - Math.pow(1 + realRate, -periods)) / realRate);
      }
    }

    const initialMonthlyPayout = initialPayoutPeriod / (12 / mFreq);

    // Build Year-by-Year Schedule
    let balance = initialPrincipal;
    let totalPayoutSum = 0;
    let totalInterestSum = 0;
    let finalMonthlyPayout = initialMonthlyPayout;

    const yearlySchedule = [];

    for (let y = 1; y <= years; y++) {
      const yearStartBalance = balance;
      let yearPayout = 0;
      let yearInterest = 0;

      for (let p = 1; p <= mFreq; p++) {
        const periodIdx = (y - 1) * mFreq + p;
        const periodPayout = initialPayoutPeriod * Math.pow(1 + gPeriod, periodIdx - 1);
        const periodInterest = balance * rPeriod;

        yearInterest += periodInterest;
        yearPayout += periodPayout;

        balance = Math.max(0, balance + periodInterest - periodPayout);
      }

      totalPayoutSum += yearPayout;
      totalInterestSum += yearInterest;
      finalMonthlyPayout = (yearPayout / 12);

      yearlySchedule.push({
        year: y,
        openingBalance: yearStartBalance,
        annualPayout: yearPayout,
        monthlyEquivalent: yearPayout / 12,
        interestEarned: yearInterest,
        closingBalance: balance
      });
    }

    cachedSchedule = yearlySchedule;

    // Update KPI UI
    if (currentMode === 'corpusToPayout') {
      kpiMainLabel.textContent = 'Sustainable Initial Monthly Pension';
      kpiMainValue.textContent = `${formatINR(initialMonthlyPayout)} / mo`;
      kpiMainSubtext.textContent = gInf > 0
        ? `Escalates by ${(gInf * 100).toFixed(1)}% p.a. to reach ${formatINR(finalMonthlyPayout)}/mo in Year ${years}`
        : `Fixed static pension of ${formatINR(initialMonthlyPayout)}/mo for ${years} years`;
    } else {
      kpiMainLabel.textContent = 'Required Starting Retirement Corpus';
      kpiMainValue.textContent = formatLakhCrore(initialPrincipal);
      kpiMainSubtext.textContent = `To fund ${formatINR(inputVal)}/mo starting income escalating at ${(gInf * 100).toFixed(1)}% for ${years} years`;
    }

    kpiTotalPayout.textContent = formatLakhCrore(totalPayoutSum);
    kpiTotalInterest.textContent = formatLakhCrore(totalInterestSum);
    kpiFinalPayout.textContent = `${formatINR(finalMonthlyPayout)} / mo`;

    // Render Table
    let tableHtml = '';
    yearlySchedule.forEach(row => {
      tableHtml += `
        <tr style="border-bottom: 1px solid var(--border-color, #f1f5f9);">
          <td style="padding:0.6rem; text-align:center; font-weight:600;">Year ${row.year}</td>
          <td style="padding:0.6rem;">${formatLakhCrore(row.openingBalance)}</td>
          <td style="padding:0.6rem; color:#059669; font-weight:700;">${formatLakhCrore(row.annualPayout)}</td>
          <td style="padding:0.6rem;">${formatINR(row.monthlyEquivalent)}/mo</td>
          <td style="padding:0.6rem; color:#2563eb;">${formatLakhCrore(row.interestEarned)}</td>
          <td style="padding:0.6rem; font-weight:600;">${formatLakhCrore(row.closingBalance)}</td>
        </tr>
      `;
    });
    scheduleTableBody.innerHTML = tableHtml;

    // Render Chart
    renderChart(yearlySchedule);
  }

  function renderChart(schedule) {
    const ctx = document.getElementById('annuityChart');
    if (!ctx) return;
    if (annuityChartInstance) annuityChartInstance.destroy();

    const labels = schedule.map(s => `Yr ${s.year}`);
    const balanceData = schedule.map(s => Math.round(s.closingBalance));
    let cumPayout = 0;
    const payoutData = schedule.map(s => {
      cumPayout += s.annualPayout;
      return Math.round(cumPayout);
    });

    annuityChartInstance = new Chart(ctx, {
      type: 'line',
      data: {
        labels: labels,
        datasets: [
          {
            label: 'Remaining Capital Balance',
            data: balanceData,
            borderColor: '#2563eb',
            backgroundColor: 'rgba(37, 99, 235, 0.1)',
            borderWidth: 3,
            fill: true,
            tension: 0.3
          },
          {
            label: 'Cumulative Payouts Received',
            data: payoutData,
            borderColor: '#059669',
            borderWidth: 2.5,
            borderDash: [5, 5],
            fill: false,
            tension: 0.3
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        interaction: { mode: 'index', intersect: false },
        plugins: {
          tooltip: {
            callbacks: {
              label: (ctx) => `${ctx.dataset.label}: ${formatLakhCrore(ctx.raw)}`
            }
          }
        },
        scales: {
          y: {
            ticks: {
              callback: (v) => formatLakhCrore(v)
            }
          }
        }
      }
    });
  }

  // CSV Export
  if (exportScheduleCsvBtn) {
    exportScheduleCsvBtn.addEventListener('click', () => {
      if (!cachedSchedule.length) return;
      let csv = 'Year,Opening Balance,Annual Payout,Monthly Equiv,Interest Earned,Closing Balance\n';
      cachedSchedule.forEach(s => {
        csv += `${s.year},${Math.round(s.openingBalance)},${Math.round(s.annualPayout)},${Math.round(s.monthlyEquivalent)},${Math.round(s.interestEarned)},${Math.round(s.closingBalance)}\n`;
      });
      if (window.Amazing-Tools && window.Amazing-Tools.downloadFile) {
        csv += '\n# USER VERIFICATION DECLARATION & DISCLAIMER NOTICE\n';
      csv += '# This output is provided freely by Amazing-tools (amazing-tools.github.io) solely for educational and planning assistance.\n';
      csv += '# Annuity and SWP payout calculations are estimates and do not guarantee future performance.\n';
      csv += '# All computations must be independently verified at user level with your financial institution or insurer.\n';
      csv += '# Amazing-tools is not responsible or liable for any miscalculations or financial decisions made.\n';
      csv += '# Please report any discrepancies on our portal (hello@Amazing-Tools.com) for future corrections.\n';
      window.Amazing-Tools.downloadFile(csv, 'Annuity_SWP_Schedule.csv', 'text/csv');
      }
    });
  }

  // Attach input listeners
  [annualReturnInput, payoutYearsInput, inflationEscalationInput, payoutFreqSelect].forEach(el => {
    el.addEventListener('input', recalculate);
    el.addEventListener('change', recalculate);
  });

  syncSlider();
  bindChips();
  recalculate();

})();
