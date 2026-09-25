/* =========================================================
   Amazing-Tools — User-Friendly Loan Prepayment & Debt-Freedom Planner
   - Dual-input sliders with 2-way sync
   - Real-time Indian currency words (Lakhs & Crores)
   - Quick preset chips (₹25L, ₹50L, 8.5%, 10Yrs, etc.)
   - Instant 60fps live calculation (no click required)
   - 1-Click "Pay 1 Extra EMI / Year" Hack
   - Target Debt-Free Date Solver
   - Visual Payoff Timeline Progress Bar
   - Side-by-side Prepay vs SIP Decision Arena
   - Chart.js Balance Trajectory & Outflow Comparison
   - Full Amortization Schedule (Yearly/Monthly + CSV Download)
   ========================================================= */

(function () {
  'use strict';

  // --- DOM Elements: Base Loan Inputs & Sliders ---
  const loanAmountInput = document.getElementById('loanAmount');
  const loanAmountSlider = document.getElementById('loanAmountSlider');
  const loanAmountWords = document.getElementById('loanAmountWords');

  const interestRateInput = document.getElementById('interestRate');
  const interestRateSlider = document.getElementById('interestRateSlider');

  const loanTenureInput = document.getElementById('loanTenure');
  const loanTenureSlider = document.getElementById('loanTenureSlider');
  const tenureMonthsLabel = document.getElementById('tenureMonthsLabel');

  // Loan Start Date / First EMI elements
  const loanStartDateInput = document.getElementById('loanStartDate');
  const startDateDisplay = document.getElementById('startDateDisplay');
  const chipStartThisMonth = document.getElementById('chipStartThisMonth');
  const chipStartNextMonth = document.getElementById('chipStartNextMonth');
  const chipStartJanNext = document.getElementById('chipStartJanNext');

  // Baseline display previews
  const baselineEmiDisplay = document.getElementById('baselineEmiDisplay');
  const baselineInterestDisplay = document.getElementById('baselineInterestDisplay');
  const baselineTotalDisplay = document.getElementById('baselineTotalDisplay');

  // Prepayment Inputs & Sliders
  const monthlyPrepayInput = document.getElementById('monthlyPrepay');
  const monthlyPrepaySlider = document.getElementById('monthlyPrepaySlider');
  const monthlyPrepayWords = document.getElementById('monthlyPrepayWords');
  const enableStepUp = document.getElementById('enableStepUp');
  const prepayStepUp = document.getElementById('prepayStepUp');

  const yearlyPrepayInput = document.getElementById('yearlyPrepay');
  const yearlyPrepaySlider = document.getElementById('yearlyPrepaySlider');
  const yearlyPrepayWords = document.getElementById('yearlyPrepayWords');
  const btnOneExtraEmi = document.getElementById('btnOneExtraEmi');

  const targetTenureInput = document.getElementById('targetTenure');
  const targetTenureSlider = document.getElementById('targetTenureSlider');
  const targetTenureWords = document.getElementById('targetTenureWords');
  const targetGoalYears = document.getElementById('targetGoalYears');
  const targetGoalDetails = document.getElementById('targetGoalDetails');
  const btnApplyTarget = document.getElementById('btnApplyTarget');

  // Lumpsum inputs
  const newPrepayYear = document.getElementById('newPrepayYear');
  const newPrepayAmount = document.getElementById('newPrepayAmount');
  const newPrepayNote = document.getElementById('newPrepayNote');
  const btnAddLumpsum = document.getElementById('btnAddLumpsum');
  const lumpsumTagsList = document.getElementById('lumpsumTagsList');
  const newPrepayMonth = document.getElementById('newPrepayMonth');
  const schedulerTableBody = document.getElementById('schedulerTableBody');
  const schedulerSummaryStrip = document.getElementById('schedulerSummaryStrip');
  const btnCalculatePlan = document.getElementById('btnCalculatePlan');
  const liveSyncStatus = document.getElementById('liveSyncStatus');
  const liveSyncText = document.getElementById('liveSyncText');
  const btnDownloadReport = document.getElementById('btnDownloadReport');

  // Impact mode & SIP
  const labelImpactTenure = document.getElementById('labelImpactTenure');
  const labelImpactEmi = document.getElementById('labelImpactEmi');
  const investRateInput = document.getElementById('investRate');
  const investRateSlider = document.getElementById('investRateSlider');
  const investRateDisplay = document.getElementById('investRateDisplay');
  const btnResetAll = document.getElementById('btnResetAll');

  // Results elements
  const freedomHeadline = document.getElementById('freedomHeadline');
  const freedomSubHeadline = document.getElementById('freedomSubHeadline');
  const heroYearsSaved = document.getElementById('heroYearsSaved');
  const heroNewTenure = document.getElementById('heroNewTenure');
  const heroInterestSaved = document.getElementById('heroInterestSaved');
  const heroFreedomDate = document.getElementById('heroFreedomDate');
  const heroOrigDate = document.getElementById('heroOrigDate');
  const btnCopySummary = document.getElementById('btnCopySummary');

  // Visual Timeline
  const timelineOrigYears = document.getElementById('timelineOrigYears');
  const timelineOrigInterest = document.getElementById('timelineOrigInterest');
  const timelineNewYears = document.getElementById('timelineNewYears');
  const timelineNewBar = document.getElementById('timelineNewBar');
  const timelineNewInterest = document.getElementById('timelineNewInterest');
  const timelineSavedGhost = document.getElementById('timelineSavedGhost');
  const timelineSavedText = document.getElementById('timelineSavedText');

  // KPI Metrics
  const kpiEmi = document.getElementById('kpiEmi');
  const kpiEmiSub = document.getElementById('kpiEmiSub');
  const kpiTimeSaved = document.getElementById('kpiTimeSaved');
  const kpiTimeSavedSub = document.getElementById('kpiTimeSavedSub');
  const kpiInterestSaved = document.getElementById('kpiInterestSaved');
  const kpiInterestSavedSub = document.getElementById('kpiInterestSavedSub');
  const kpiInvestWealth = document.getElementById('kpiInvestWealth');
  const kpiInvestWealthSub = document.getElementById('kpiInvestWealthSub');

  // Decision Arena (Prepay vs SIP)
  const cardPrepay = document.getElementById('cardPrepay');
  const cardInvest = document.getElementById('cardInvest');
  const badgeOptionA = document.getElementById('badgeOptionA');
  const badgeOptionB = document.getElementById('badgeOptionB');
  const statPrepayTotal = document.getElementById('statPrepayTotal');
  const statPrepayTenure = document.getElementById('statPrepayTenure');
  const statPrepaySaved = document.getElementById('statPrepaySaved');
  const statInvestTotal = document.getElementById('statInvestTotal');
  const statInvestTenure = document.getElementById('statInvestTenure');
  const statInvestCorpus = document.getElementById('statInvestCorpus');
  const statInvestProfit = document.getElementById('statInvestProfit');

  // Verdict banner
  const verdictIcon = document.getElementById('verdictIcon');
  const verdictHeading = document.getElementById('verdictHeading');
  const verdictText = document.getElementById('verdictText');
  const breakEvenRateBadge = document.getElementById('breakEvenRateBadge');
  const advantageDifferenceBadge = document.getElementById('advantageDifferenceBadge');

  // Amortization controls
  const toggleYearlyBtn = document.getElementById('toggleYearlyBtn');
  const toggleMonthlyBtn = document.getElementById('toggleMonthlyBtn');
  const downloadCsvBtn = document.getElementById('downloadCsvBtn');
  const amortizationTableBody = document.getElementById('amortizationTableBody');
  const periodHeader = document.getElementById('periodHeader');

  // Featured Trend Chart Controls
  const toggleTrendYearlyBtn = document.getElementById('toggleTrendYearlyBtn');
  const toggleTrendMonthlyBtn = document.getElementById('toggleTrendMonthlyBtn');
  const crossoverMilestoneBadge = document.getElementById('crossoverMilestoneBadge');
  const crossoverMilestoneText = document.getElementById('crossoverMilestoneText');
  const earlyInterestTrapBadge = document.getElementById('earlyInterestTrapBadge');
  const earlyInterestTrapText = document.getElementById('earlyInterestTrapText');

  // Charts
  let trajectoryChartInstance = null;
  let wealthChartInstance = null;
  let trendChartInstance = null;
  let currentTrendView = 'yearly';
  let latestSimulationParams = null;

  // State
  let customLumpsums = [];
  let currentScheduleView = 'yearly';
  let currentYearlySchedule = [];
  let currentMonthlySchedule = [];
  let calculationRafId = null;

  // (Initialization moved to bottom of file)

  // --- 1. Dual-Sync Sliders & Inputs ---
  function initDualSyncSliders() {
    bindPair(loanAmountInput, loanAmountSlider, () => {
      updateWordDisplays();
      updateTargetSolver();
      triggerLiveCalculation();
      syncActiveChip('loanAmount', loanAmountInput.value);
    });

    bindPair(interestRateInput, interestRateSlider, () => {
      updateWordDisplays();
      updateTargetSolver();
      triggerLiveCalculation();
      syncActiveChip('interestRate', interestRateInput.value);
    });

    bindPair(loanTenureInput, loanTenureSlider, () => {
      updateWordDisplays();
      updateTargetSolver();
      triggerLiveCalculation();
      syncActiveChip('loanTenure', loanTenureInput.value);
    });

    bindPair(monthlyPrepayInput, monthlyPrepaySlider, () => {
      updateWordDisplays();
      triggerLiveCalculation();
      syncActiveChip('monthlyPrepay', monthlyPrepayInput.value);
    });

    bindPair(yearlyPrepayInput, yearlyPrepaySlider, () => {
      updateWordDisplays();
      triggerLiveCalculation();
      syncActiveChip('yearlyPrepay', yearlyPrepayInput.value);
    });

    bindPair(targetTenureInput, targetTenureSlider, () => {
      updateWordDisplays();
      updateTargetSolver();
    });

    bindPair(investRateInput, investRateSlider, () => {
      updateWordDisplays();
      triggerLiveCalculation();
      syncActiveChip('investRate', investRateInput.value);
    });
  }

  function bindPair(numInput, sliderInput, onChangeCallback) {
    if (!numInput || !sliderInput) return;

    numInput.addEventListener('input', () => {
      const val = parseFloat(numInput.value);
      if (!isNaN(val)) {
        sliderInput.value = val;
      }
      if (onChangeCallback) onChangeCallback();
    });

    sliderInput.addEventListener('input', () => {
      numInput.value = sliderInput.value;
      if (onChangeCallback) onChangeCallback();
    });
  }

  // --- 2. Quick Chips Handler ---
  function initQuickChips() {
    document.querySelectorAll('.quick-chip').forEach(chip => {
      chip.addEventListener('click', function () {
        const targetId = this.getAttribute('data-target');
        const val = this.getAttribute('data-val');
        const inputEl = document.getElementById(targetId);
        const sliderEl = document.getElementById(targetId + 'Slider');

        if (inputEl) inputEl.value = val;
        if (sliderEl) sliderEl.value = val;

        syncActiveChip(targetId, val);
        updateWordDisplays();
        updateTargetSolver();
        triggerLiveCalculation();
      });
    });
  }

  function syncActiveChip(targetId, currentVal) {
    const numVal = parseFloat(currentVal);
    document.querySelectorAll(`.quick-chip[data-target="${targetId}"]`).forEach(chip => {
      const chipVal = parseFloat(chip.getAttribute('data-val'));
      if (Math.abs(chipVal - numVal) < 0.001) {
        chip.classList.add('active');
      } else {
        chip.classList.remove('active');
      }
    });
  }

  // --- 3. Prepayment Mode Tabs ---
  function initPrepayModeTabs() {
    const buttons = document.querySelectorAll('.prepay-mode-btn');
    buttons.forEach(btn => {
      btn.addEventListener('click', function () {
        buttons.forEach(b => b.classList.remove('active'));
        this.classList.add('active');
        const mode = this.getAttribute('data-mode');

        document.querySelectorAll('.prepay-pane').forEach(pane => {
          pane.classList.remove('active');
        });
        const activePane = document.getElementById('pane-' + mode);
        if (activePane) activePane.classList.add('active');

        if (mode === 'target') updateTargetSolver();
      });
    });
  }

  // --- 4. Impact Radio Tiles ---
  function initImpactRadios() {
    const radios = document.querySelectorAll('input[name="impactMode"]');
    radios.forEach(radio => {
      radio.addEventListener('change', function () {
        if (this.value === 'tenure') {
          labelImpactTenure.classList.add('active');
          labelImpactEmi.classList.remove('active');
        } else {
          labelImpactTenure.classList.remove('active');
          labelImpactEmi.classList.add('active');
        }
        triggerLiveCalculation();
      });
    });
  }

  // --- 4b. Loan Start Date & Trend Controls ---
  const MONTH_NAMES_SHORT = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const MONTH_NAMES_LONG = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

  function getParsedStartDate() {
    let val = loanStartDateInput ? loanStartDateInput.value : '';
    if (!val || !/^\d{4}-\d{2}$/.test(val)) {
      const now = new Date();
      let y = now.getFullYear();
      let m = now.getMonth() + 2; // default to next month
      if (m > 12) { y += 1; m = 1; }
      val = `${y}-${String(m).padStart(2, '0')}`;
      if (loanStartDateInput) loanStartDateInput.value = val;
    }
    const parts = val.split('-');
    return {
      year: parseInt(parts[0], 10),
      month: parseInt(parts[1], 10)
    };
  }

  function getPeriodDate(startYear, startMonth, monthOffset) {
    const totalMonthIndex = (startMonth - 1) + monthOffset;
    const y = startYear + Math.floor(totalMonthIndex / 12);
    const m = ((totalMonthIndex % 12) + 12) % 12;
    return {
      year: y,
      month: m + 1,
      short: `${MONTH_NAMES_SHORT[m]} ${y}`,
      long: `${MONTH_NAMES_LONG[m]} ${y}`
    };
  }

  function updateStartDateDisplay() {
    const d = getParsedStartDate();
    const currentPeriod = getPeriodDate(d.year, d.month, 0);
    if (startDateDisplay) {
      startDateDisplay.textContent = `Starting: ${currentPeriod.long}`;
    }
  }

  function setActiveStartChip(activeChip) {
    [chipStartThisMonth, chipStartNextMonth, chipStartJanNext].forEach(chip => {
      if (chip) chip.classList.remove('active');
    });
    if (activeChip) activeChip.classList.add('active');
  }

  function initStartDateControls() {
    if (loanStartDateInput) {
      loanStartDateInput.addEventListener('change', () => {
        updateStartDateDisplay();
        triggerLiveCalculation();
      });
      loanStartDateInput.addEventListener('input', () => {
        updateStartDateDisplay();
        triggerLiveCalculation();
      });
    }

    const now = new Date();
    const thisYear = now.getFullYear();
    const thisMonth = now.getMonth() + 1;

    let nextYear = thisYear;
    let nextMonth = thisMonth + 1;
    if (nextMonth > 12) { nextYear += 1; nextMonth = 1; }

    const janNextYear = thisYear + 1;

    const thisMonthVal = `${thisYear}-${String(thisMonth).padStart(2, '0')}`;
    const nextMonthVal = `${nextYear}-${String(nextMonth).padStart(2, '0')}`;
    const janNextVal = `${janNextYear}-01`;

    if (chipStartThisMonth) {
      chipStartThisMonth.addEventListener('click', () => {
        if (loanStartDateInput) loanStartDateInput.value = thisMonthVal;
        setActiveStartChip(chipStartThisMonth);
        updateStartDateDisplay();
        triggerLiveCalculation();
      });
    }

    if (chipStartNextMonth) {
      chipStartNextMonth.addEventListener('click', () => {
        if (loanStartDateInput) loanStartDateInput.value = nextMonthVal;
        setActiveStartChip(chipStartNextMonth);
        updateStartDateDisplay();
        triggerLiveCalculation();
      });
    }

    if (chipStartJanNext) {
      chipStartJanNext.addEventListener('click', () => {
        if (loanStartDateInput) loanStartDateInput.value = janNextVal;
        setActiveStartChip(chipStartJanNext);
        updateStartDateDisplay();
        triggerLiveCalculation();
      });
    }
  }

  function initTrendChartControls() {
    if (toggleTrendYearlyBtn && toggleTrendMonthlyBtn) {
      toggleTrendYearlyBtn.addEventListener('click', () => setTrendView('yearly'));
      toggleTrendMonthlyBtn.addEventListener('click', () => setTrendView('monthly'));
    }
  }

  function setTrendView(view) {
    currentTrendView = view;
    if (view === 'yearly') {
      if (toggleTrendYearlyBtn) toggleTrendYearlyBtn.classList.add('active');
      if (toggleTrendMonthlyBtn) toggleTrendMonthlyBtn.classList.remove('active');
    } else {
      if (toggleTrendYearlyBtn) toggleTrendYearlyBtn.classList.remove('active');
      if (toggleTrendMonthlyBtn) toggleTrendMonthlyBtn.classList.add('active');
    }
    if (latestSimulationParams) {
      renderPrincipalInterestChart(latestSimulationParams);
    }
  }

  // --- 5. Event Listeners ---
  function initEventListeners() {
    // Enable Step Up
    if (enableStepUp) {
      enableStepUp.addEventListener('change', triggerLiveCalculation);
    }
    if (prepayStepUp) {
      prepayStepUp.addEventListener('input', triggerLiveCalculation);
    }

    // 1 Extra EMI Hack button
    if (btnOneExtraEmi) {
      btnOneExtraEmi.addEventListener('click', handleOneExtraEmiHack);
    }

    // Target Debt-Free Apply button
    if (btnApplyTarget) {
      btnApplyTarget.addEventListener('click', handleApplyTargetGoal);
    }

    // Lumpsum Add Button
    if (btnAddLumpsum) {
      btnAddLumpsum.addEventListener('click', handleAddLumpsum);
    }

    // Reset button
    if (btnResetAll) {
      btnResetAll.addEventListener('click', handleResetAll);
    }

    // Schedule view toggles
    if (toggleYearlyBtn && toggleMonthlyBtn) {
      toggleYearlyBtn.addEventListener('click', () => setScheduleView('yearly'));
      toggleMonthlyBtn.addEventListener('click', () => setScheduleView('monthly'));
    }

    // Download CSV
    if (downloadCsvBtn) {
      downloadCsvBtn.addEventListener('click', handleDownloadCsv);
    }

    // Copy Summary
    if (btnCopySummary) {
      btnCopySummary.addEventListener('click', handleCopySummary);
    }

    // Calculate My Plan Button
    if (btnCalculatePlan) {
      btnCalculatePlan.addEventListener('click', () => {
        calculateAndRender();
        const resultsEl = document.getElementById('resultsDashboard');
        if (resultsEl) {
          resultsEl.scrollIntoView({ behavior: 'smooth', block: 'start' });
          resultsEl.classList.remove('results-highlight-pulse');
          void resultsEl.offsetWidth;
          resultsEl.classList.add('results-highlight-pulse');
        }
      });
    }

    // Download PDF Report Button
    if (btnDownloadReport) {
      btnDownloadReport.addEventListener('click', handleDownloadReport);
    }
  }

  // --- 6. Helper: Convert Numbers to Indian Words (Lakhs & Crores) ---
  function formatLakhsCrores(val) {
    const num = Math.round(Number(val));
    if (isNaN(num) || num <= 0) return '₹ 0';

    if (num >= 10000000) {
      const cr = num / 10000000;
      return `₹ ${cr.toFixed(cr % 1 === 0 ? 0 : 2)} Crore`;
    }
    if (num >= 100000) {
      const lk = num / 100000;
      return `₹ ${lk.toFixed(lk % 1 === 0 ? 0 : 2)} Lakhs`;
    }
    return '₹ ' + num.toLocaleString('en-IN');
  }

  function updateWordDisplays() {
    const p = parseFloat(loanAmountInput.value) || 0;
    if (loanAmountWords) loanAmountWords.textContent = formatLakhsCrores(p);

    const tenureY = parseFloat(loanTenureInput.value) || 0;
    if (tenureMonthsLabel) tenureMonthsLabel.textContent = `${Math.round(tenureY * 12)} Months`;

    const mPrepay = parseFloat(monthlyPrepayInput.value) || 0;
    if (monthlyPrepayWords) {
      monthlyPrepayWords.textContent = mPrepay > 0 ? `+ ${formatLakhsCrores(mPrepay)} / mo` : '₹ 0 / mo';
    }

    const yPrepay = parseFloat(yearlyPrepayInput.value) || 0;
    if (yearlyPrepayWords) {
      yearlyPrepayWords.textContent = yPrepay > 0 ? `+ ${formatLakhsCrores(yPrepay)} / yr` : '₹ 0 / yr';
    }

    const tTenure = parseFloat(targetTenureInput.value) || 0;
    if (targetTenureWords) targetTenureWords.textContent = `${tTenure} Years`;

    const invR = parseFloat(investRateInput.value) || 12;
    if (investRateDisplay) investRateDisplay.textContent = `${invR}% p.a.`;
  }

  // --- 7. Target Debt-Free Date Solver ---
  function updateTargetSolver() {
    const principal = parseFloat(loanAmountInput.value) || 0;
    const rate = parseFloat(interestRateInput.value) || 0;
    const origTenureYears = parseFloat(loanTenureInput.value) || 20;
    const targetYears = parseFloat(targetTenureInput.value) || 10;

    if (targetTenureSlider) {
      targetTenureSlider.max = Math.max(2, Math.round(origTenureYears) - 1);
      if (targetYears >= origTenureYears) {
        targetTenureInput.value = Math.max(1, Math.round(origTenureYears / 2));
        targetTenureSlider.value = targetTenureInput.value;
      }
    }

    if (targetGoalYears) targetGoalYears.textContent = targetTenureInput.value;

    const currentTargetY = parseFloat(targetTenureInput.value) || 10;
    if (principal <= 0 || rate <= 0 || currentTargetY >= origTenureYears) {
      if (targetGoalDetails) {
        targetGoalDetails.innerHTML = 'Target years must be less than your original tenure (' + origTenureYears + ' Yrs).';
      }
      return;
    }

    const monthlyRate = rate / 12 / 100;
    const baseEmi = computeEmi(principal, monthlyRate, origTenureYears * 12);
    const targetEmi = computeEmi(principal, monthlyRate, currentTargetY * 12);
    const extraMonthlyNeeded = Math.max(0, targetEmi - baseEmi);
    const yearsSaved = origTenureYears - currentTargetY;

    if (targetGoalDetails) {
      targetGoalDetails.innerHTML = `
        Pay an extra <strong>+₹${Math.round(extraMonthlyNeeded).toLocaleString('en-IN')}/mo</strong> to close your loan <strong>${yearsSaved} Years Earlier!</strong>
      `;
    }
  }

  function handleApplyTargetGoal() {
    const principal = parseFloat(loanAmountInput.value) || 0;
    const rate = parseFloat(interestRateInput.value) || 0;
    const origTenureYears = parseFloat(loanTenureInput.value) || 20;
    const targetYears = parseFloat(targetTenureInput.value) || 10;

    const monthlyRate = rate / 12 / 100;
    const baseEmi = computeEmi(principal, monthlyRate, origTenureYears * 12);
    const targetEmi = computeEmi(principal, monthlyRate, targetYears * 12);
    const extraMonthly = Math.round(Math.max(0, targetEmi - baseEmi));

    monthlyPrepayInput.value = extraMonthly;
    if (monthlyPrepaySlider) monthlyPrepaySlider.value = Math.min(50000, extraMonthly);

    // Switch to Monthly tab
    const monthlyTabBtn = document.querySelector('.prepay-mode-btn[data-mode="monthly"]');
    if (monthlyTabBtn) monthlyTabBtn.click();

    updateWordDisplays();
    triggerLiveCalculation();
  }

  // --- 8. 1 Extra EMI Hack Handler ---
  function handleOneExtraEmiHack() {
    const principal = parseFloat(loanAmountInput.value) || 0;
    const rate = parseFloat(interestRateInput.value) || 0;
    const tenureYears = parseFloat(loanTenureInput.value) || 20;
    const monthlyRate = rate / 12 / 100;
    const baseEmi = Math.round(computeEmi(principal, monthlyRate, tenureYears * 12));

    yearlyPrepayInput.value = baseEmi;
    if (yearlyPrepaySlider) yearlyPrepaySlider.value = Math.min(500000, baseEmi);

    btnOneExtraEmi.classList.add('applied');
    btnOneExtraEmi.innerHTML = `✓ Applied 1 EMI (₹${baseEmi.toLocaleString('en-IN')}/yr)`;

    updateWordDisplays();
    triggerLiveCalculation();
  }

  // --- 9. Custom Month & Year Prepayment Scheduler Handler ---
  function updateSchedulerYearOptions() {
    if (!newPrepayYear) return;
    const tenureYears = Math.max(1, Math.round(parseFloat(loanTenureInput.value) || 20));
    const currentVal = parseInt(newPrepayYear.value, 10) || 2;
    newPrepayYear.innerHTML = '';
    for (let y = 1; y <= tenureYears; y++) {
      const opt = document.createElement('option');
      opt.value = y;
      opt.textContent = `Year ${y}`;
      if (y === currentVal || (currentVal > tenureYears && y === tenureYears)) {
        opt.selected = true;
      }
      newPrepayYear.appendChild(opt);
    }
  }

  function handleAddLumpsum() {
    const year = parseInt(newPrepayYear ? newPrepayYear.value : '1', 10) || 1;
    const monthInYear = parseInt(newPrepayMonth ? newPrepayMonth.value : '1', 10) || 1;
    const amount = parseFloat(newPrepayAmount.value);
    const note = newPrepayNote ? newPrepayNote.value.trim() : '';

    if (isNaN(amount) || amount <= 0) {
      alert('Please enter a valid prepayment amount (e.g. ₹ 50,000).');
      if (newPrepayAmount) newPrepayAmount.focus();
      return;
    }

    const tenureYears = parseFloat(loanTenureInput.value) || 20;
    const totalMaxMonths = Math.round(tenureYears * 12);
    const loanMonth = (year - 1) * 12 + monthInYear;

    if (loanMonth > totalMaxMonths) {
      alert(`Selected timing (Year ${year}, Month ${monthInYear}) is beyond your total loan tenure of ${tenureYears} years.`);
      return;
    }

    customLumpsums.push({
      id: 'sched_' + Date.now() + '_' + Math.floor(Math.random() * 10000),
      year,
      monthInYear,
      loanMonth,
      month: loanMonth,
      amount,
      note: note || `Year ${year} Month ${monthInYear} Prepayment`
    });

    customLumpsums.sort((a, b) => a.loanMonth - b.loanMonth);

    if (newPrepayAmount) newPrepayAmount.value = '';
    if (newPrepayNote) newPrepayNote.value = '';

    triggerLiveCalculation();
  }

  function renderSchedulerTable(currentParams) {
    if (!schedulerTableBody) return;
    schedulerTableBody.innerHTML = '';

    if (!customLumpsums || customLumpsums.length === 0) {
      schedulerTableBody.innerHTML = `
        <tr>
          <td colspan="6" style="text-align: center; color: var(--color-text-muted); padding: 1.25rem 1rem;">
            No custom prepayments scheduled yet. Select a year, month, and amount above to see your exact time and interest savings!
          </td>
        </tr>
      `;
      if (schedulerSummaryStrip) schedulerSummaryStrip.innerHTML = '';
      return;
    }

    const startDate = getParsedStartDate();
    let totalScheduledAmount = 0;

    customLumpsums.forEach((item, index) => {
      totalScheduledAmount += item.amount;
      const calDate = getPeriodDate(startDate.year, startDate.month, item.loanMonth - 1);

      // Calculate isolated gain for this single prepayment
      let gainBadgeHtml = '<span class="scheduler-gain-badge">Calculating...</span>';
      if (currentParams) {
        const withoutThis = runSimulation({
          ...currentParams,
          customLumpsums: customLumpsums.filter(x => x.id !== item.id)
        });
        const mSaved = Math.max(0, withoutThis.monthsCompleted - currentParams.prepaySchedule.monthsCompleted);
        const intSaved = Math.max(0, withoutThis.totalInterest - currentParams.prepaySchedule.totalInterest);

        if (mSaved > 0 && intSaved > 0) {
          const y = Math.floor(mSaved / 12);
          const remM = mSaved % 12;
          const timeText = (y > 0 && remM > 0) ? `${y}y ${remM}m` : (y > 0 ? `${y} yrs` : `${remM} mos`);
          gainBadgeHtml = `<span class="scheduler-gain-badge">⏳ ~${timeText} saved • 💰 ₹${Math.round(intSaved).toLocaleString('en-IN')}</span>`;
        } else if (intSaved > 0) {
          gainBadgeHtml = `<span class="scheduler-gain-badge">💰 ₹${Math.round(intSaved).toLocaleString('en-IN')} interest saved</span>`;
        } else {
          gainBadgeHtml = `<span class="scheduler-gain-badge" style="background:rgba(100,116,139,0.1); color:var(--color-text-secondary); border-color:transparent;">Paid near close</span>`;
        }
      }

      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td><strong>Year ${item.year}, Month ${item.monthInYear}</strong> <span style="font-size:0.75rem; color:var(--color-text-muted);">(Month ${item.loanMonth})</span></td>
        <td>${calDate.long}</td>
        <td><strong style="color:var(--color-text);">₹ ${Math.round(item.amount).toLocaleString('en-IN')}</strong></td>
        <td>${item.note || 'Scheduled Prepayment'}</td>
        <td>${gainBadgeHtml}</td>
        <td style="text-align: center;">
          <button type="button" class="scheduler-del-btn" data-id="${item.id}" title="Remove this prepayment">🗑️ Delete</button>
        </td>
      `;
      schedulerTableBody.appendChild(tr);
    });

    // Wire up delete buttons
    schedulerTableBody.querySelectorAll('.scheduler-del-btn').forEach(btn => {
      btn.addEventListener('click', function () {
        const idToDelete = this.getAttribute('data-id');
        customLumpsums = customLumpsums.filter(x => x.id !== idToDelete);
        triggerLiveCalculation();
      });
    });

    if (schedulerSummaryStrip && currentParams) {
      const allWithoutScheduler = runSimulation({
        ...currentParams,
        customLumpsums: []
      });
      const schedMonthsSaved = Math.max(0, allWithoutScheduler.monthsCompleted - currentParams.prepaySchedule.monthsCompleted);
      const schedInterestSaved = Math.max(0, allWithoutScheduler.totalInterest - currentParams.prepaySchedule.totalInterest);
      const y = Math.floor(schedMonthsSaved / 12);
      const remM = schedMonthsSaved % 12;
      const totalTimeText = (y > 0 && remM > 0) ? `${y} Years ${remM} Months` : (y > 0 ? `${y} Years` : `${remM} Months`);

      schedulerSummaryStrip.innerHTML = `
        <div style="background: rgba(37,99,235,0.06); border: 1px solid rgba(37,99,235,0.2); border-radius: var(--radius-sm); padding: 0.6rem 0.85rem; display: flex; flex-wrap: wrap; justify-content: space-between; align-items: center; gap: 0.5rem;">
          <span><strong>Total Scheduled Prepayments:</strong> ₹ ${Math.round(totalScheduledAmount).toLocaleString('en-IN')} (${customLumpsums.length} payments)</span>
          <span style="color: #059669; font-weight: 700;">🚀 Total Gains: ~${totalTimeText} Saved • ₹ ${Math.round(schedInterestSaved).toLocaleString('en-IN')} Interest Eliminated</span>
        </div>
      `;
    }
  }

  // --- 10. Reset All Handler ---
  function handleResetAll() {
    loanAmountInput.value = '5000000';
    loanAmountSlider.value = '5000000';
    interestRateInput.value = '8.75';
    interestRateSlider.value = '8.75';
    loanTenureInput.value = '20';
    loanTenureSlider.value = '20';

    monthlyPrepayInput.value = '5000';
    monthlyPrepaySlider.value = '5000';
    yearlyPrepayInput.value = '0';
    yearlyPrepaySlider.value = '0';
    if (enableStepUp) enableStepUp.checked = false;
    if (prepayStepUp) prepayStepUp.value = '5';

    investRateInput.value = '12';
    investRateSlider.value = '12';

    if (labelImpactTenure) labelImpactTenure.classList.add('active');
    if (labelImpactEmi) labelImpactEmi.classList.remove('active');
    const tenureRadio = document.querySelector('input[name="impactMode"][value="tenure"]');
    if (tenureRadio) tenureRadio.checked = true;

    if (btnOneExtraEmi) {
      btnOneExtraEmi.classList.remove('applied');
      btnOneExtraEmi.innerHTML = '⚡ Apply 1 Extra EMI / Year';
    }

    customLumpsums = [];
    updateSchedulerYearOptions();
    renderSchedulerTable(null);

    // Default mode tab: monthly
    const monthlyBtn = document.querySelector('.prepay-mode-btn[data-mode="monthly"]');
    if (monthlyBtn) monthlyBtn.click();

    updateWordDisplays();
    updateTargetSolver();
    triggerLiveCalculation();
  }

  // --- 11. Core Mathematical Simulation ---
  function computeEmi(p, r, m) {
    if (r === 0) return p / m;
    return (p * r * Math.pow(1 + r, m)) / (Math.pow(1 + r, m) - 1);
  }

  function triggerLiveCalculation() {
    if (calculationRafId) cancelAnimationFrame(calculationRafId);
    calculationRafId = requestAnimationFrame(calculateAndRender);
  }

  function calculateAndRender() {
    const principal = parseFloat(loanAmountInput.value) || 0;
    const rate = parseFloat(interestRateInput.value) || 0;
    const tenureYears = parseFloat(loanTenureInput.value) || 0;

    if (principal <= 0 || rate <= 0 || tenureYears <= 0) return;

    const totalMonths = Math.round(tenureYears * 12);
    const monthlyRate = rate / 12 / 100;
    const baseEmi = computeEmi(principal, monthlyRate, totalMonths);

    // Prepayment inputs
    const monthlyPrepay = parseFloat(monthlyPrepayInput.value) || 0;
    const yearlyPrepay = parseFloat(yearlyPrepayInput.value) || 0;
    const stepUpRate = enableStepUp && enableStepUp.checked ? (parseFloat(prepayStepUp.value) || 0) / 100 : 0;
    const impactMode = document.querySelector('input[name="impactMode"]:checked') ? document.querySelector('input[name="impactMode"]:checked').value : 'tenure';
    const investAnnualRate = (parseFloat(investRateInput.value) || 12) / 100;
    const investMonthlyRate = investAnnualRate / 12;

    // Run baseline simulation (Zero Prepayment)
    const baseSchedule = runSimulation({
      principal,
      monthlyRate,
      totalMonths,
      baseEmi,
      monthlyPrepay: 0,
      yearlyPrepay: 0,
      stepUpRate: 0,
      customLumpsums: [],
      impactMode: 'tenure'
    });

    // Run prepayment simulation
    const prepaySchedule = runSimulation({
      principal,
      monthlyRate,
      totalMonths,
      baseEmi,
      monthlyPrepay,
      yearlyPrepay,
      stepUpRate,
      customLumpsums,
      impactMode
    });

    // Option B: Mutual Fund SIP Simulation
    let totalInvestedCapital = 0;
    let investmentFutureValue = 0;

    prepaySchedule.monthly.forEach(item => {
      const extra = item.prepayment;
      if (extra > 0) {
        totalInvestedCapital += extra;
        const monthsCompounding = Math.max(0, totalMonths - item.month);
        const fv = extra * Math.pow(1 + investMonthlyRate, monthsCompounding);
        investmentFutureValue += fv;
      }
    });

    const investmentNetProfit = Math.max(0, investmentFutureValue - totalInvestedCapital);

    // Core KPIs
    const interestSaved = Math.max(0, baseSchedule.totalInterest - prepaySchedule.totalInterest);
    const monthsSaved = Math.max(0, totalMonths - prepaySchedule.monthsCompleted);
    const yearsSaved = monthsSaved / 12;
    const newTenureYears = prepaySchedule.monthsCompleted / 12;

    // Update UI Previews
    if (liveSyncText) {
      liveSyncText.textContent = `Live Calculated for ₹ ${formatLakhsCrores(principal).replace('₹ ', '')} @ ${rate}% over ${tenureYears} Yrs`;
    }

    renderBaselinePreview(baseEmi, baseSchedule.totalInterest, principal + baseSchedule.totalInterest);
    renderSchedulerTable({
      principal,
      monthlyRate,
      totalMonths,
      baseEmi,
      monthlyPrepay,
      yearlyPrepay,
      stepUpRate,
      impactMode,
      prepaySchedule
    });
    renderHeroFreedomCard({
      yearsSaved,
      monthsSaved,
      interestSaved,
      newTenureYears,
      totalMonths,
      prepayMonths: prepaySchedule.monthsCompleted,
      baseTotalInterest: baseSchedule.totalInterest,
      prepayTotalInterest: prepaySchedule.totalInterest
    });
    renderKpiCards({
      baseEmi,
      newEmi: prepaySchedule.newEmi,
      monthlyPrepay,
      impactMode,
      monthsSaved,
      newTenureYears,
      interestSaved,
      baseTotalInterest: baseSchedule.totalInterest,
      investmentFutureValue
    });
    renderDecisionArena({
      totalExtraPrepaid: prepaySchedule.totalPrepayment,
      newTenureYears,
      interestSaved,
      rate,
      totalMonths,
      totalInvestedCapital,
      investmentFutureValue,
      investmentNetProfit,
      investAnnualRate: investAnnualRate * 100
    });

    // Store schedule for table
    currentYearlySchedule = prepaySchedule.yearly;
    currentMonthlySchedule = prepaySchedule.monthly;
    renderAmortizationTable();

    // Cache latest simulation params for view switching
    latestSimulationParams = {
      principal,
      totalMonths,
      baseSchedule,
      prepaySchedule,
      investmentFutureValue
    };

    // Render Charts
    renderVisualCharts(latestSimulationParams);
  }

  function runSimulation(params) {
    const {
      principal,
      monthlyRate,
      totalMonths,
      baseEmi,
      monthlyPrepay,
      yearlyPrepay,
      stepUpRate,
      customLumpsums,
      impactMode
    } = params;

    const lumpsumMap = {};
    if (customLumpsums && customLumpsums.length > 0) {
      customLumpsums.forEach(item => {
        const m = item.loanMonth || item.month || (item.year * 12);
        lumpsumMap[m] = (lumpsumMap[m] || 0) + item.amount;
      });
    }

    let balance = principal;
    let totalInterest = 0;
    let totalPrincipalPaid = 0;
    let totalPrepayment = 0;
    let totalPayment = 0;

    const monthly = [];
    const yearly = [];

    let curYearPrincipal = 0;
    let curYearInterest = 0;
    let curYearPrepay = 0;
    let curYearEmi = 0;
    let yearOpeningBalance = principal;
    let curEmi = baseEmi;

    let month = 1;

    while (balance > 0.01 && month <= 600) {
      const yearIndex = Math.floor((month - 1) / 12);
      const yearNum = yearIndex + 1;
      const monthInYear = ((month - 1) % 12) + 1;

      if (monthInYear === 1) {
        yearOpeningBalance = balance;
        curYearPrincipal = 0;
        curYearInterest = 0;
        curYearPrepay = 0;
        curYearEmi = 0;
      }

      // Step-up on monthly prepay
      let extraMonthly = monthlyPrepay;
      if (stepUpRate > 0 && yearIndex > 0) {
        extraMonthly = monthlyPrepay * Math.pow(1 + stepUpRate, yearIndex);
      }

      // Annual prepayment at month 12 of each year
      let extraYearly = 0;
      if (monthInYear === 12 && yearlyPrepay > 0) {
        extraYearly = yearlyPrepay;
        if (stepUpRate > 0 && yearIndex > 0) {
          extraYearly = yearlyPrepay * Math.pow(1 + stepUpRate, yearIndex);
        }
      }

      // Lumpsums
      const extraLumpsum = lumpsumMap[month] || 0;
      const totalExtraThisMonth = extraMonthly + extraYearly + extraLumpsum;

      const openingBal = balance;
      const interestForMonth = balance * monthlyRate;
      let regularEmiForMonth = curEmi;
      let principalFromEmi = 0;
      let prepayApplied = 0;

      if (balance + interestForMonth <= regularEmiForMonth + totalExtraThisMonth) {
        const payoffNeeded = balance + interestForMonth;
        if (payoffNeeded <= regularEmiForMonth) {
          regularEmiForMonth = payoffNeeded;
          principalFromEmi = balance;
          prepayApplied = 0;
        } else {
          principalFromEmi = regularEmiForMonth - interestForMonth;
          prepayApplied = balance - principalFromEmi;
        }
        balance = 0;
      } else {
        principalFromEmi = Math.max(0, regularEmiForMonth - interestForMonth);
        prepayApplied = Math.min(balance - principalFromEmi, totalExtraThisMonth);
        balance = Math.max(0, balance - principalFromEmi - prepayApplied);

        // EMI reduction mode
        if (impactMode === 'emi' && prepayApplied > 0) {
          const remainingMonths = Math.max(1, totalMonths - month);
          curEmi = computeEmi(balance, monthlyRate, remainingMonths);
        }
      }

      const totalPaidThisMonth = regularEmiForMonth + prepayApplied;
      totalInterest += interestForMonth;
      totalPrincipalPaid += (principalFromEmi + prepayApplied);
      totalPrepayment += prepayApplied;
      totalPayment += totalPaidThisMonth;

      curYearPrincipal += (principalFromEmi + prepayApplied);
      curYearInterest += interestForMonth;
      curYearPrepay += prepayApplied;
      curYearEmi += regularEmiForMonth;

      monthly.push({
        month,
        year: yearNum,
        openingBalance: openingBal,
        regularEmi: regularEmiForMonth,
        prepayment: prepayApplied,
        principalPaid: principalFromEmi + prepayApplied,
        interestPaid: interestForMonth,
        totalPaid: totalPaidThisMonth,
        closingBalance: balance
      });

      if (monthInYear === 12 || balance <= 0.01) {
        yearly.push({
          year: yearNum,
          openingBalance: yearOpeningBalance,
          regularEmi: curYearEmi,
          prepayment: curYearPrepay,
          principalPaid: curYearPrincipal,
          interestPaid: curYearInterest,
          totalPaid: curYearEmi + curYearPrepay,
          closingBalance: balance
        });
      }

      month++;
    }

    return {
      monthsCompleted: month - 1,
      totalInterest,
      totalPrincipalPaid,
      totalPrepayment,
      totalPayment,
      monthly,
      yearly
    };
  }

  // --- 12. UI Renderers ---
  function renderBaselinePreview(emi, interest, total) {
    if (baselineEmiDisplay) baselineEmiDisplay.textContent = '₹ ' + Math.round(emi).toLocaleString('en-IN');
    if (baselineInterestDisplay) baselineInterestDisplay.textContent = formatLakhsCrores(interest);
    if (baselineTotalDisplay) baselineTotalDisplay.textContent = formatLakhsCrores(total);
  }

  function renderHeroFreedomCard(data) {
    const ySaved = Math.floor(data.monthsSaved / 12);
    const mSaved = data.monthsSaved % 12;

    let timeSavedStr = '';
    if (ySaved > 0 && mSaved > 0) {
      timeSavedStr = `${ySaved} Years ${mSaved} Months Earlier!`;
    } else if (ySaved > 0) {
      timeSavedStr = `${ySaved} Years Earlier!`;
    } else if (mSaved > 0) {
      timeSavedStr = `${mSaved} Months Earlier!`;
    } else {
      timeSavedStr = '0 Months';
    }

    const freedomBadge = document.getElementById('freedomBadge');
    if (data.monthsSaved > 0 || data.interestSaved > 0) {
      if (freedomBadge) {
        freedomBadge.textContent = '🎉 Massive Financial Savings';
        freedomBadge.style.background = 'rgba(5, 150, 105, 0.12)';
        freedomBadge.style.color = '#059669';
      }
      if (heroYearsSaved) heroYearsSaved.textContent = timeSavedStr;
      if (freedomHeadline) freedomHeadline.innerHTML = `You Will Be 100% Debt-Free <span class="text-highlight">${timeSavedStr}</span>`;
      if (freedomSubHeadline) {
        freedomSubHeadline.innerHTML = `
          Your loan finishes in <strong>${data.newTenureYears.toFixed(1)} Years</strong> instead of ${(data.totalMonths / 12).toFixed(0)} Years, saving you a massive <strong class="text-highlight-green">${formatLakhsCrores(data.interestSaved)}</strong> in bank interest!
        `;
      }
    } else {
      if (freedomBadge) {
        freedomBadge.textContent = 'ℹ️ Standard Loan Trajectory (No Prepayment Added)';
        freedomBadge.style.background = 'rgba(100, 116, 139, 0.12)';
        freedomBadge.style.color = 'var(--color-text-secondary)';
      }
      if (heroYearsSaved) heroYearsSaved.textContent = `${(data.totalMonths / 12).toFixed(0)} Years (Standard)`;
      if (freedomHeadline) freedomHeadline.innerHTML = `Standard Loan Duration: <span class="text-highlight">${(data.totalMonths / 12).toFixed(0)} Years</span>`;
      if (freedomSubHeadline) {
        freedomSubHeadline.innerHTML = `
          No prepayments added yet. Try adjusting the sliders in Step 2 above to discover how many years and lakhs in bank interest you can save!
        `;
      }
    }

    // Calendar Debt-Free Dates
    const startDate = getParsedStartDate();
    const newFinishDate = getPeriodDate(startDate.year, startDate.month, Math.max(0, data.prepayMonths - 1));
    const origFinishDate = getPeriodDate(startDate.year, startDate.month, Math.max(0, data.totalMonths - 1));

    if (heroFreedomDate) {
      heroFreedomDate.textContent = newFinishDate.long;
    }
    if (heroOrigDate) {
      if (data.monthsSaved > 0) {
        heroOrigDate.textContent = `(Original: ${origFinishDate.long})`;
        heroOrigDate.style.display = 'inline';
      } else {
        heroOrigDate.textContent = `(Standard Schedule: ${origFinishDate.long})`;
        heroOrigDate.style.display = 'inline';
      }
    }

    // Timeline comparison bar
    const origY = (data.totalMonths / 12).toFixed(1);
    const newY = data.newTenureYears.toFixed(1);
    const newBarPct = Math.min(100, Math.max(10, (data.prepayMonths / data.totalMonths) * 100));
    const savedPct = Math.max(0, 100 - newBarPct);

    if (timelineOrigYears) timelineOrigYears.textContent = `${origY} Years`;
    if (timelineOrigInterest) timelineOrigInterest.textContent = `Total Interest: ${formatLakhsCrores(data.baseTotalInterest)}`;
    if (timelineNewYears) timelineNewYears.textContent = `${newY} Years`;
    if (timelineNewBar) timelineNewBar.style.width = `${newBarPct}%`;
    if (timelineNewInterest) timelineNewInterest.textContent = `Interest: ${formatLakhsCrores(data.prepayTotalInterest)}`;

    if (timelineSavedGhost) {
      timelineSavedGhost.style.width = `${savedPct}%`;
      if (savedPct < 8) {
        timelineSavedGhost.style.display = 'none';
      } else {
        timelineSavedGhost.style.display = 'flex';
        if (timelineSavedText) timelineSavedText.textContent = `Saved: ${data.yearsSaved.toFixed(1)} Yrs 🎉`;
      }
    }
  }

  function renderKpiCards(data) {
    if (data.impactMode === 'emi') {
      const activeEmi = data.newEmi || data.baseEmi;
      if (kpiEmi) kpiEmi.textContent = '₹ ' + Math.round(activeEmi).toLocaleString('en-IN');
      const diff = Math.max(0, data.baseEmi - activeEmi);
      if (kpiEmiSub) kpiEmiSub.textContent = diff > 0 ? `Reduced from original ₹${Math.round(data.baseEmi).toLocaleString('en-IN')} (saves ₹${Math.round(diff).toLocaleString('en-IN')}/mo)` : 'Standard installment';
    } else {
      if (kpiEmi) kpiEmi.textContent = '₹ ' + Math.round(data.baseEmi).toLocaleString('en-IN');
      if (kpiEmiSub) {
        if (data.monthlyPrepay > 0) {
          kpiEmiSub.textContent = `+ ₹${Math.round(data.monthlyPrepay).toLocaleString('en-IN')} prepay = ₹${Math.round(data.baseEmi + data.monthlyPrepay).toLocaleString('en-IN')} total monthly outflow`;
        } else {
          kpiEmiSub.textContent = 'Standard monthly installment';
        }
      }
    }

    const y = Math.floor(data.monthsSaved / 12);
    const m = data.monthsSaved % 12;
    let timeStr = '0 Mos';
    if (y > 0 && m > 0) timeStr = `${y} Yrs ${m} Mos`;
    else if (y > 0) timeStr = `${y} Years`;
    else if (m > 0) timeStr = `${m} Months`;

    if (kpiTimeSaved) kpiTimeSaved.textContent = timeStr;
    if (kpiTimeSavedSub) kpiTimeSavedSub.textContent = data.monthsSaved > 0 ? `Closes in ${data.newTenureYears.toFixed(1)} yrs` : 'Standard tenure (0 prepay)';

    if (kpiInterestSaved) kpiInterestSaved.textContent = '₹ ' + Math.round(data.interestSaved).toLocaleString('en-IN');
    const pctSaved = data.baseTotalInterest > 0 ? ((data.interestSaved / data.baseTotalInterest) * 100).toFixed(1) : 0;
    if (kpiInterestSavedSub) kpiInterestSavedSub.textContent = data.interestSaved > 0 ? `${pctSaved}% interest eliminated` : '0% saved yet';

    if (kpiInvestWealth) kpiInvestWealth.textContent = formatLakhsCrores(data.investmentFutureValue);
  }

  function renderDecisionArena(data) {
    if (statPrepayTotal) statPrepayTotal.textContent = formatLakhsCrores(data.totalExtraPrepaid);
    if (statPrepayTenure) statPrepayTenure.textContent = `${data.newTenureYears.toFixed(1)} Years`;
    if (statPrepaySaved) statPrepaySaved.textContent = formatLakhsCrores(data.interestSaved);

    if (statInvestTotal) statInvestTotal.textContent = formatLakhsCrores(data.totalInvestedCapital);
    if (statInvestTenure) statInvestTenure.textContent = `${(data.totalMonths / 12).toFixed(1)} Years`;
    if (statInvestCorpus) statInvestCorpus.textContent = formatLakhsCrores(data.investmentFutureValue);
    if (statInvestProfit) statInvestProfit.textContent = formatLakhsCrores(data.investmentNetProfit);

    const netDifference = data.investmentNetProfit - data.interestSaved;
    const breakEvenRate = computeBreakEvenRate(data.totalInvestedCapital, data.interestSaved, data.totalMonths);

    if (breakEvenRateBadge) breakEvenRateBadge.textContent = `Break-even ROI: ${breakEvenRate.toFixed(2)}% p.a.`;

    if (data.totalExtraPrepaid <= 0) {
      if (cardPrepay) cardPrepay.classList.remove('is-winner');
      if (cardInvest) cardInvest.classList.remove('is-winner');
      if (badgeOptionA) badgeOptionA.style.display = 'none';
      if (badgeOptionB) badgeOptionB.style.display = 'none';
      if (verdictIcon) verdictIcon.textContent = 'ℹ️';
      if (verdictHeading) verdictHeading.textContent = 'Enter Prepayment Amount to Compare';
      if (verdictText) verdictText.textContent = 'Add an extra monthly payment or annual bonus above to see whether prepaying or investing in SIP gives you higher net wealth.';
      if (advantageDifferenceBadge) advantageDifferenceBadge.textContent = 'No prepayment surplus entered yet';
    } else if (netDifference > 0) {
      // Option B wins financially
      if (cardPrepay) cardPrepay.classList.remove('is-winner');
      if (cardInvest) cardInvest.classList.add('is-winner');
      if (badgeOptionA) badgeOptionA.style.display = 'none';
      if (badgeOptionB) badgeOptionB.style.display = 'inline-block';
      if (verdictIcon) verdictIcon.textContent = '📈';
      if (verdictHeading) verdictHeading.textContent = 'Option B (Mutual Fund SIP) Builds Greater Net Wealth';
      if (verdictText) {
        verdictText.innerHTML = `
          Because your expected equity return (<strong>${data.investAnnualRate}%</strong>) beats your loan interest rate (<strong>${data.rate}%</strong>), investing your extra cash builds more compounding wealth over time than prepaying the loan. However, prepaying gives 100% risk-free peace of mind!
        `;
      }
      if (advantageDifferenceBadge) {
        advantageDifferenceBadge.textContent = `Option B creates ${formatLakhsCrores(netDifference)} MORE wealth`;
      }
    } else {
      // Option A wins
      if (cardPrepay) cardPrepay.classList.add('is-winner');
      if (cardInvest) cardInvest.classList.remove('is-winner');
      if (badgeOptionA) badgeOptionA.style.display = 'inline-block';
      if (badgeOptionB) badgeOptionB.style.display = 'none';
      if (verdictIcon) verdictIcon.textContent = '🛡️';
      if (verdictHeading) verdictHeading.textContent = 'Option A (Prepayment) is Guaranteed & Superior';
      if (verdictText) {
        verdictText.innerHTML = `
          Prepaying your loan saves a guaranteed <strong>${data.rate}% p.a.</strong> tax-free interest. Since your expected investment return does not beat the break-even hurdle rate (<strong>${breakEvenRate.toFixed(2)}%</strong>), eliminating debt early is both safer and more profitable.
        `;
      }
      if (advantageDifferenceBadge) {
        advantageDifferenceBadge.textContent = `Option A saves ${formatLakhsCrores(Math.abs(netDifference))} more guaranteed money`;
      }
    }
  }

  function computeBreakEvenRate(investedCapital, targetProfit, totalMonths) {
    if (investedCapital <= 0 || targetProfit <= 0) return 8.75;
    let low = 0.01;
    let high = 0.40;
    for (let iter = 0; iter < 25; iter++) {
      const mid = (low + high) / 2;
      const mRate = mid / 12;
      const fv = investedCapital * Math.pow(1 + mRate, totalMonths / 2);
      const profit = fv - investedCapital;
      if (profit < targetProfit) low = mid;
      else high = mid;
    }
    return ((low + high) / 2) * 100;
  }

  // --- 13. Charts (Chart.js) ---
  function renderVisualCharts(params) {
    if (typeof Chart === 'undefined') return;
    renderPrincipalInterestChart(params);
    renderTrajectoryChart(params);
    renderWealthChart(params);
  }

  // 1. Featured Chart: Principal vs. Interest Breakdown Trend
  function renderPrincipalInterestChart(params) {
    const canvas = document.getElementById('principalInterestChart');
    if (!canvas || typeof Chart === 'undefined') return;

    if (trendChartInstance) {
      trendChartInstance.destroy();
      trendChartInstance = null;
    }

    const { prepaySchedule, principal } = params;
    const startDate = getParsedStartDate();

    const labels = [];
    const principalData = [];
    const prepayData = [];
    const interestData = [];
    const balanceData = [];

    if (currentTrendView === 'yearly') {
      const yearly = prepaySchedule.yearly;
      yearly.forEach(item => {
        const startD = getPeriodDate(startDate.year, startDate.month, (item.year - 1) * 12);
        labels.push(`Year ${item.year} (${startD.year})`);
        principalData.push(Math.round(item.principalPaid));
        prepayData.push(Math.round(item.prepayment));
        interestData.push(Math.round(item.interestPaid));
        balanceData.push(Math.round(Math.max(0, item.closingBalance)));
      });

      // Find Crossover Year
      let crossoverYear = null;
      let crossoverObj = null;
      for (let i = 0; i < yearly.length; i++) {
        const item = yearly[i];
        if (item.principalPaid + item.prepayment >= item.interestPaid) {
          crossoverYear = item.year;
          crossoverObj = item;
          break;
        }
      }

      if (crossoverYear && crossoverMilestoneBadge && crossoverMilestoneText) {
        const crossD = getPeriodDate(startDate.year, startDate.month, (crossoverYear - 1) * 12);
        crossoverMilestoneText.innerHTML = `<strong>Crossover in Year ${crossoverYear} (${crossD.year}):</strong> Principal paid (${formatLakhsCrores(crossoverObj.principalPaid + crossoverObj.prepayment)}) surpasses interest (${formatLakhsCrores(crossoverObj.interestPaid)})!`;
        crossoverMilestoneBadge.style.display = 'inline-flex';
      } else if (crossoverMilestoneBadge) {
        crossoverMilestoneBadge.style.display = 'none';
      }

      if (yearly.length > 0 && earlyInterestTrapBadge && earlyInterestTrapText) {
        const yr1 = yearly[0];
        const yr1Pct = yr1.totalPaid > 0 ? ((yr1.interestPaid / yr1.totalPaid) * 100).toFixed(0) : 0;
        earlyInterestTrapText.innerHTML = `<strong>Year 1 Reality:</strong> ${yr1Pct}% of your installment goes into bank interest!`;
        earlyInterestTrapBadge.style.display = 'inline-flex';
      }
    } else {
      // Monthly View
      const monthly = prepaySchedule.monthly;
      monthly.forEach(item => {
        const mD = getPeriodDate(startDate.year, startDate.month, item.month - 1);
        labels.push(mD.short);
        principalData.push(Math.round(item.principalPaid));
        prepayData.push(Math.round(item.prepayment));
        interestData.push(Math.round(item.interestPaid));
        balanceData.push(Math.round(Math.max(0, item.closingBalance)));
      });

      // Find Crossover Month
      let crossoverMonth = null;
      let crossoverObj = null;
      for (let i = 0; i < monthly.length; i++) {
        const item = monthly[i];
        if (item.principalPaid + item.prepayment >= item.interestPaid) {
          crossoverMonth = item.month;
          crossoverObj = item;
          break;
        }
      }

      if (crossoverMonth && crossoverMilestoneBadge && crossoverMilestoneText) {
        const crossD = getPeriodDate(startDate.year, startDate.month, crossoverMonth - 1);
        crossoverMilestoneText.innerHTML = `<strong>Crossover in ${crossD.short} (Month ${crossoverMonth}):</strong> Principal repayment overtakes bank interest!`;
        crossoverMilestoneBadge.style.display = 'inline-flex';
      } else if (crossoverMilestoneBadge) {
        crossoverMilestoneBadge.style.display = 'none';
      }

      if (monthly.length > 0 && earlyInterestTrapBadge && earlyInterestTrapText) {
        const m1 = monthly[0];
        const m1Pct = m1.totalPaid > 0 ? ((m1.interestPaid / m1.totalPaid) * 100).toFixed(0) : 0;
        earlyInterestTrapText.innerHTML = `<strong>Month 1 Reality:</strong> ${m1Pct}% of installment goes into bank interest.`;
        earlyInterestTrapBadge.style.display = 'inline-flex';
      }
    }

    const ctx = canvas.getContext('2d');
    trendChartInstance = new Chart(ctx, {
      type: 'bar',
      data: {
        labels,
        datasets: [
          {
            type: 'line',
            label: 'Remaining Principal Balance',
            data: balanceData,
            borderColor: '#3B82F6',
            backgroundColor: 'rgba(59, 130, 246, 0.08)',
            borderWidth: 2.5,
            pointRadius: currentTrendView === 'yearly' ? 3 : 0,
            pointHoverRadius: 5,
            fill: false,
            tension: 0.15,
            yAxisID: 'y1'
          },
          {
            type: 'bar',
            label: 'Principal Repaid',
            data: principalData,
            backgroundColor: '#10B981',
            stack: 'outflow',
            borderRadius: 4,
            yAxisID: 'y'
          },
          {
            type: 'bar',
            label: 'Extra Prepayment',
            data: prepayData,
            backgroundColor: '#F59E0B',
            stack: 'outflow',
            borderRadius: 4,
            yAxisID: 'y'
          },
          {
            type: 'bar',
            label: 'Interest Paid',
            data: interestData,
            backgroundColor: '#EF4444',
            stack: 'outflow',
            borderRadius: 4,
            yAxisID: 'y'
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        interaction: {
          mode: 'index',
          intersect: false
        },
        plugins: {
          tooltip: {
            callbacks: {
              label: function (ctx) {
                return `${ctx.dataset.label}: ${formatLakhsCrores(ctx.parsed.y)}`;
              }
            }
          },
          legend: {
            position: 'bottom',
            labels: { boxWidth: 12, font: { size: 11, family: "'Inter', sans-serif" } }
          }
        },
        scales: {
          x: {
            stacked: true,
            ticks: {
              font: { size: 10 },
              maxRotation: 45,
              autoSkip: true,
              maxTicksLimit: currentTrendView === 'yearly' ? 25 : 24
            },
            grid: { display: false }
          },
          y: {
            stacked: true,
            position: 'left',
            title: {
              display: true,
              text: 'Installment Breakdown (₹)',
              font: { size: 10, weight: '600' }
            },
            ticks: {
              callback: function (v) {
                if (v >= 10000000) return '₹' + (v / 10000000).toFixed(1) + ' Cr';
                if (v >= 100000) return '₹' + (v / 100000).toFixed(0) + ' L';
                return '₹' + v;
              },
              font: { size: 10 }
            }
          },
          y1: {
            position: 'right',
            grid: { drawOnChartArea: false },
            title: {
              display: true,
              text: 'Remaining Balance (₹)',
              font: { size: 10, weight: '600' }
            },
            ticks: {
              callback: function (v) {
                if (v >= 10000000) return '₹' + (v / 10000000).toFixed(1) + ' Cr';
                if (v >= 100000) return '₹' + (v / 100000).toFixed(0) + ' L';
                return '₹' + v;
              },
              font: { size: 10 }
            }
          }
        }
      }
    });
  }

  // 2. Balance Trajectory Line Chart
  function renderTrajectoryChart(params) {
    const { principal, baseSchedule, prepaySchedule } = params;
    const trajectoryCanvas = document.getElementById('loanTrajectoryChart');
    if (!trajectoryCanvas) return;

    if (trajectoryChartInstance) trajectoryChartInstance.destroy();

    const labels = [];
    const baseBalances = [];
    const prepayBalances = [];
    const maxYears = Math.max(baseSchedule.yearly.length, prepaySchedule.yearly.length);

    labels.push('Yr 0');
    baseBalances.push(principal);
    prepayBalances.push(principal);

    for (let y = 1; y <= maxYears; y++) {
      labels.push(`Yr ${y}`);
      const b = baseSchedule.yearly.find(i => i.year === y);
      const p = prepaySchedule.yearly.find(i => i.year === y);
      baseBalances.push(b ? Math.max(0, b.closingBalance) : 0);
      prepayBalances.push(p ? Math.max(0, p.closingBalance) : 0);
    }

    const ctx1 = trajectoryCanvas.getContext('2d');
    trajectoryChartInstance = new Chart(ctx1, {
      type: 'line',
      data: {
        labels,
        datasets: [
          {
            label: 'Standard Loan (No Prepayment)',
            data: baseBalances,
            borderColor: '#94A3B8',
            borderDash: [5, 5],
            borderWidth: 2,
            fill: false,
            tension: 0.15
          },
          {
            label: 'With Your Prepayments',
            data: prepayBalances,
            borderColor: '#10B981',
            backgroundColor: 'rgba(16, 185, 129, 0.12)',
            borderWidth: 3,
            fill: true,
            tension: 0.15
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          tooltip: {
            callbacks: {
              label: function (ctx) {
                return `${ctx.dataset.label}: ${formatLakhsCrores(ctx.parsed.y)}`;
              }
            }
          },
          legend: { display: false }
        },
        scales: {
          y: {
            ticks: {
              callback: function (v) {
                if (v >= 10000000) return '₹' + (v / 10000000).toFixed(1) + ' Cr';
                if (v >= 100000) return '₹' + (v / 100000).toFixed(0) + ' L';
                return '₹' + v;
              },
              font: { size: 10 }
            }
          },
          x: { ticks: { font: { size: 10 } } }
        }
      }
    });
  }

  // 3. Outflow vs Wealth Bar Chart
  function renderWealthChart(params) {
    const { principal, baseSchedule, prepaySchedule, investmentFutureValue } = params;
    const wealthCanvas = document.getElementById('wealthComparisonChart');
    if (!wealthCanvas) return;

    if (wealthChartInstance) wealthChartInstance.destroy();

    const ctx2 = wealthCanvas.getContext('2d');
    wealthChartInstance = new Chart(ctx2, {
      type: 'bar',
      data: {
        labels: ['Standard Loan', 'Option A (Prepay)', 'Option B (SIP)'],
        datasets: [
          {
            label: 'Principal',
            data: [principal, principal, principal],
            backgroundColor: '#93C5FD'
          },
          {
            label: 'Interest Paid',
            data: [baseSchedule.totalInterest, prepaySchedule.totalInterest, baseSchedule.totalInterest],
            backgroundColor: '#F87171'
          },
          {
            label: 'Extra Paid / Invested',
            data: [0, prepaySchedule.totalPrepayment, prepaySchedule.totalPrepayment],
            backgroundColor: '#FBBF24'
          },
          {
            label: 'SIP Corpus Created',
            data: [0, 0, investmentFutureValue],
            backgroundColor: '#34D399'
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          tooltip: {
            callbacks: {
              label: function (ctx) {
                return `${ctx.dataset.label}: ${formatLakhsCrores(ctx.parsed.y)}`;
              }
            }
          },
          legend: { position: 'bottom', labels: { boxWidth: 10, font: { size: 10 } } }
        },
        scales: {
          y: {
            ticks: {
              callback: function (v) {
                if (v >= 10000000) return '₹' + (v / 10000000).toFixed(1) + ' Cr';
                if (v >= 100000) return '₹' + (v / 100000).toFixed(0) + ' L';
                return '₹' + v;
              },
              font: { size: 10 }
            }
          },
          x: { ticks: { font: { size: 10 } } }
        }
      }
    });
  }

  // --- 14. Amortization Schedule Table ---
  function setScheduleView(view) {
    currentScheduleView = view;
    if (view === 'yearly') {
      toggleYearlyBtn.classList.add('active');
      toggleMonthlyBtn.classList.remove('active');
      periodHeader.textContent = 'Year / Date';
    } else {
      toggleYearlyBtn.classList.remove('active');
      toggleMonthlyBtn.classList.add('active');
      periodHeader.textContent = 'Month / Date';
    }
    renderAmortizationTable();
  }

  function renderAmortizationTable() {
    if (!amortizationTableBody) return;
    amortizationTableBody.innerHTML = '';

    const data = currentScheduleView === 'yearly' ? currentYearlySchedule : currentMonthlySchedule;
    const format = v => Math.round(v).toLocaleString('en-IN');
    const startDate = getParsedStartDate();

    data.forEach(item => {
      const tr = document.createElement('tr');
      let periodText = '';
      if (currentScheduleView === 'yearly') {
        const startD = getPeriodDate(startDate.year, startDate.month, (item.year - 1) * 12);
        const endD = getPeriodDate(startDate.year, startDate.month, (item.year - 1) * 12 + 11);
        periodText = `Year ${item.year} <span style="font-size:0.75rem; font-weight:400; color:#64748B; display:block;">${startD.short} – ${endD.short}</span>`;
      } else {
        const mD = getPeriodDate(startDate.year, startDate.month, item.month - 1);
        periodText = `${mD.short} <span style="font-size:0.75rem; font-weight:400; color:#64748B; display:block;">Month ${item.month}</span>`;
      }

      tr.innerHTML = `
        <td style="font-weight: 600;">${periodText}</td>
        <td>₹ ${format(item.openingBalance)}</td>
        <td>₹ ${format(item.regularEmi)}</td>
        <td style="${item.prepayment > 0 ? 'color:#059669; font-weight:700;' : ''}">${item.prepayment > 0 ? '₹ ' + format(item.prepayment) : '—'}</td>
        <td>₹ ${format(item.principalPaid)}</td>
        <td>₹ ${format(item.interestPaid)}</td>
        <td>₹ ${format(item.totalPaid)}</td>
        <td style="font-weight: 700;">₹ ${format(Math.max(0, item.closingBalance))}</td>
      `;
      amortizationTableBody.appendChild(tr);
    });
  }

  function handleDownloadCsv() {
    const data = currentScheduleView === 'yearly' ? currentYearlySchedule : currentMonthlySchedule;
    if (!data || data.length === 0) {
      alert('Schedule data is not available.');
      return;
    }

    const startDate = getParsedStartDate();

    const headers = [
      currentScheduleView === 'yearly' ? 'Year' : 'Month',
      'Calendar Period',
      'Opening Balance (INR)',
      'Regular EMI (INR)',
      'Prepayment (INR)',
      'Principal Paid (INR)',
      'Interest Paid (INR)',
      'Total Payment (INR)',
      'Closing Balance (INR)'
    ];

    const rows = data.map(item => {
      let dateLabel = '';
      if (currentScheduleView === 'yearly') {
        const startD = getPeriodDate(startDate.year, startDate.month, (item.year - 1) * 12);
        const endD = getPeriodDate(startDate.year, startDate.month, (item.year - 1) * 12 + 11);
        dateLabel = `${startD.short} to ${endD.short}`;
      } else {
        const mD = getPeriodDate(startDate.year, startDate.month, item.month - 1);
        dateLabel = mD.short;
      }

      return [
        currentScheduleView === 'yearly' ? `Year ${item.year}` : `Month ${item.month}`,
        `"${dateLabel}"`,
        item.openingBalance.toFixed(2),
        item.regularEmi.toFixed(2),
        item.prepayment.toFixed(2),
        item.principalPaid.toFixed(2),
        item.interestPaid.toFixed(2),
        item.totalPaid.toFixed(2),
        Math.max(0, item.closingBalance).toFixed(2)
      ];
    });

    let csvContent = headers.join(',') + '\n';
    rows.forEach(r => {
      csvContent += r.join(',') + '\n';
    });

    csvContent += '\n# USER VERIFICATION DECLARATION & DISCLAIMER NOTICE\n';
    csvContent += '# This calculation output is provided freely by Amazing-tools (amazing-tools.github.io) solely for educational and planning assistance.\n';
    csvContent += '# All calculations must be independently verified at user level with your lending institution or bank statement.\n';
    csvContent += '# Amazing-tools is not responsible or liable for any miscalculations, bank differences, or financial decisions made.\n';
    csvContent += '# Please report any miscalculations on our portal (hello@Amazing-Tools.com) for future corrections.\n';
    const filename = `loan_prepayment_schedule_${currentScheduleView}.csv`;
    if ((window.AmazingTools || window['Amazing-Tools'])) {
      (window.AmazingTools || window['Amazing-Tools']).downloadFile(csvContent, filename, 'text/csv');
    } else {
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      link.href = URL.createObjectURL(blob);
      link.download = filename;
      link.click();
    }
  }

  // --- 15. Copy Summary Handler ---
  
  // --- 16. PDF Report Generation with User Verification Declaration ---
  function handleDownloadReport() {
    if (typeof window.jspdf === 'undefined') {
      window.print();
      return;
    }

    const { jsPDF } = window.jspdf;
    const doc = new jsPDF({
      orientation: 'portrait',
      unit: 'pt',
      format: 'a4'
    });

    const primaryColor = [37, 99, 235];
    const darkTextColor = [30, 41, 59];
    const accentGreen = [5, 150, 105];

    // Header banner
    doc.setFillColor(...primaryColor);
    doc.rect(0, 0, 595, 60, 'F');

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(16);
    doc.setTextColor(255, 255, 255);
    doc.text('Amazing-tools | Loan Prepayment & Debt-Freedom Plan', 30, 35);

    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(220, 235, 252);
    doc.text('Generated at amazing-tools.github.io • 100% Client-Side Private Analysis', 30, 50);

    const principal = parseFloat(loanAmountInput.value) || 0;
    const rate = parseFloat(interestRateInput.value) || 0;
    const tenureYears = parseFloat(loanTenureInput.value) || 0;
    const totalMonths = Math.round(tenureYears * 12);
    const monthlyRate = rate / 12 / 100;
    const baseEmi = computeEmi(principal, monthlyRate, totalMonths);
    const monthlyPrepay = parseFloat(monthlyPrepayInput.value) || 0;
    const yearlyPrepay = parseFloat(yearlyPrepayInput.value) || 0;
    const impactMode = document.querySelector('input[name="impactMode"]:checked') ? document.querySelector('input[name="impactMode"]:checked').value : 'tenure';

    const baseSchedule = runSimulation({
      principal, monthlyRate, totalMonths, baseEmi,
      monthlyPrepay: 0, yearlyPrepay: 0, stepUpRate: 0, customLumpsums: [], impactMode: 'tenure'
    });

    const prepaySchedule = runSimulation({
      principal, monthlyRate, totalMonths, baseEmi,
      monthlyPrepay, yearlyPrepay,
      stepUpRate: enableStepUp && enableStepUp.checked ? (parseFloat(prepayStepUp.value) || 0) / 100 : 0,
      customLumpsums, impactMode
    });

    const interestSaved = Math.max(0, baseSchedule.totalInterest - prepaySchedule.totalInterest);
    const monthsSaved = Math.max(0, totalMonths - prepaySchedule.monthsCompleted);
    const yearsSaved = monthsSaved / 12;
    const newTenureYears = prepaySchedule.monthsCompleted / 12;

    const startDate = getParsedStartDate();
    const newFinishDate = getPeriodDate(startDate.year, startDate.month, Math.max(0, prepaySchedule.monthsCompleted - 1));
    const origFinishDate = getPeriodDate(startDate.year, startDate.month, Math.max(0, totalMonths - 1));

    let curY = 80;

    // Section 1: Loan & Savings Summary Table
    doc.autoTable({
      startY: curY,
      head: [['Loan Parameter', 'Standard Baseline', 'With Your Prepayments', 'Net Benefit / Savings']],
      body: [
        ['Loan Principal Amount', '₹ ' + Math.round(principal).toLocaleString('en-IN'), '₹ ' + Math.round(principal).toLocaleString('en-IN'), '—'],
        ['Interest Rate', `${rate}% p.a.`, `${rate}% p.a.`, '—'],
        ['Loan Tenure', `${tenureYears.toFixed(1)} Years (${totalMonths} Mos)`, `${newTenureYears.toFixed(1)} Years (${prepaySchedule.monthsCompleted} Mos)`, `${yearsSaved.toFixed(1)} Years Earlier (${monthsSaved} Mos Saved)`],
        ['Monthly Installment', '₹ ' + Math.round(baseEmi).toLocaleString('en-IN'), impactMode === 'emi' ? ('₹ ' + Math.round(prepaySchedule.newEmi || baseEmi).toLocaleString('en-IN') + ' (Reduced)') : ('₹ ' + Math.round(baseEmi).toLocaleString('en-IN') + (monthlyPrepay > 0 ? ' (+₹' + Math.round(monthlyPrepay).toLocaleString('en-IN') + ' prepay)' : '')), impactMode === 'emi' ? ('₹ ' + Math.round(baseEmi - (prepaySchedule.newEmi || baseEmi)).toLocaleString('en-IN') + ' saved/mo') : 'Tenure eliminated'],
        ['Total Interest Payable', '₹ ' + Math.round(baseSchedule.totalInterest).toLocaleString('en-IN'), '₹ ' + Math.round(prepaySchedule.totalInterest).toLocaleString('en-IN'), '₹ ' + Math.round(interestSaved).toLocaleString('en-IN') + ' Interest Saved'],
        ['Total Bank Outflow', '₹ ' + Math.round(principal + baseSchedule.totalInterest).toLocaleString('en-IN'), '₹ ' + Math.round(prepaySchedule.totalPayment).toLocaleString('en-IN'), '₹ ' + Math.round(interestSaved).toLocaleString('en-IN') + ' Total Savings'],
        ['Debt-Free Calendar Date', origFinishDate.long, newFinishDate.long, `${yearsSaved.toFixed(1)} Years Ahead of Schedule`]
      ],
      theme: 'striped',
      headStyles: { fillColor: primaryColor, textColor: 255, fontStyle: 'bold' },
      styles: { fontSize: 8.5, cellPadding: 4.5, textColor: darkTextColor },
      columnStyles: { 3: { fontStyle: 'bold', textColor: accentGreen } }
    });

    curY = doc.lastAutoTable.finalY + 12;

    // Section 2: Strategy Details
    doc.autoTable({
      startY: curY,
      head: [['Prepayment Strategy Element', 'Configured Input']],
      body: [
        ['Extra Monthly Prepayment', monthlyPrepay > 0 ? ('₹ ' + monthlyPrepay.toLocaleString('en-IN') + ' / month') : 'None'],
        ['Annual Step-Up on Prepayment', (enableStepUp && enableStepUp.checked) ? (`${prepayStepUp.value}% hike every year`) : 'None'],
        ['Annual Festive / Bonus Prepayment', yearlyPrepay > 0 ? ('₹ ' + yearlyPrepay.toLocaleString('en-IN') + ' / year') : 'None'],
        ['Custom Scheduled Month/Year Prepayments', customLumpsums.length > 0 ? (`${customLumpsums.length} prepayments scheduled`) : 'None'],
        ['Prepayment Impact Mode', impactMode === 'tenure' ? 'Close Loan Early (Reduce Tenure - Maximum Interest Savings)' : 'Lower Monthly Installment (Keep Tenure)']
      ],
      theme: 'grid',
      headStyles: { fillColor: [71, 85, 105], textColor: 255 },
      styles: { fontSize: 8, cellPadding: 4, textColor: darkTextColor }
    });

    curY = doc.lastAutoTable.finalY + 12;

    // Section 3: Scheduled Prepayments (if any)
    if (customLumpsums.length > 0) {
      const rows = customLumpsums.map(item => {
        const cal = getPeriodDate(startDate.year, startDate.month, item.loanMonth - 1);
        return [
          `Year ${item.year}, Month ${item.monthInYear} (Month ${item.loanMonth})`,
          cal.long,
          '₹ ' + Math.round(item.amount).toLocaleString('en-IN'),
          item.note || 'Scheduled Prepayment'
        ];
      });

      doc.autoTable({
        startY: curY,
        head: [['Tenure Timing', 'Calendar Date', 'Scheduled Prepayment', 'Purpose / Note']],
        body: rows,
        theme: 'grid',
        headStyles: { fillColor: [5, 150, 105], textColor: 255 },
        styles: { fontSize: 8, cellPadding: 4, textColor: darkTextColor }
      });

      curY = doc.lastAutoTable.finalY + 12;
    }

    // Check page space for Declaration Box
    if (curY > 660) {
      doc.addPage();
      curY = 40;
    }

    // Official User Verification Declaration & Disclaimer
    doc.setFillColor(254, 243, 199);
    doc.setDrawColor(245, 158, 11);
    doc.setLineWidth(1.5);
    doc.roundedRect(30, curY, 535, 100, 4, 4, 'FD');

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9);
    doc.setTextColor(180, 83, 9);
    doc.text('USER VERIFICATION DECLARATION & DISCLAIMER NOTICE', 42, curY + 16);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7.5);
    doc.setTextColor(69, 26, 3);
    const declarationText = 
      "This calculation report is provided freely by Amazing-tools (amazing-tools.github.io) solely for educational, indicative, and scenario planning assistance. " +
      "Actual loan interest accrual, rest periods, and amortization can vary based on your lending institution's exact compounding method (daily reducing vs. monthly reducing balance), " +
      "EMI billing dates, interest rate reset cycles, and bank fees.\n\n" +
      "Mandatory Verification: Users must independently verify all calculations, amortization schedules, and savings estimates with their respective bank, lender, " +
      "or official loan statement before executing any prepayment or binding financial decision. Amazing-tools and its operators assume no legal or financial liability for any " +
      "miscalculations, bank policy differences, or financial decisions made.\n\n" +
      "Report Miscalculations: We continuously strive for 100% mathematical precision. If you spot any calculation discrepancy or difference from your bank statement, " +
      "please report it on our portal (hello@Amazing-Tools.com) for prompt verification and future portal updates.";

    const splitDeclaration = doc.splitTextToSize(declarationText, 510);
    doc.text(splitDeclaration, 42, curY + 28);

    doc.save(`Debt_Freedom_Plan_${Math.round(principal/100000)}L.pdf`);
    const api = window.AmazingTools || window['Amazing-Tools'];
    if (api && api.flashSupportToast) {
      api.flashSupportToast({
        title: 'Debt Freedom Plan Saved!',
        message: 'If Amazing-Tools helped you plan your debt-freedom and save on interest, consider supporting our free platform. Even your continued usage keeps us motivated to build more free tools in the right direction!'
      });
    }
  }

  function handleCopySummary() {
    const p = parseFloat(loanAmountInput.value) || 0;
    const r = parseFloat(interestRateInput.value) || 0;
    const t = parseFloat(loanTenureInput.value) || 0;
    const emi = kpiEmi ? kpiEmi.textContent : '';
    const timeSaved = kpiTimeSaved ? kpiTimeSaved.textContent : '';
    const intSaved = kpiInterestSaved ? kpiInterestSaved.textContent : '';
    const sipCorpus = kpiInvestWealth ? kpiInvestWealth.textContent : '';
    const debtFreeDate = heroFreedomDate ? heroFreedomDate.textContent : '';

    let text = '=== LOAN PREPAYMENT & FREEDOM SUMMARY ===\n';
    text += `Loan Amount: ${formatLakhsCrores(p)}\n`;
    text += `Interest Rate: ${r}% p.a.\n`;
    text += `Tenure: ${t} Years\n`;
    text += `Monthly EMI: ${emi}\n\n`;
    if (debtFreeDate) text += `🗓️ Target Debt-Free Date: ${debtFreeDate}\n`;
    text += `🎉 Time Saved: ${timeSaved}\n`;
    text += `💰 Interest Saved: ${intSaved}\n`;
    text += `📈 Option B Mutual Fund Corpus: ${sipCorpus}\n\n`;
    text += 'Calculated at Amazing-Tools (https://amazing-tools.github.io/pages/emi-calculator.html)';

    if ((window.AmazingTools || window['Amazing-Tools'])) {
      (window.AmazingTools || window['Amazing-Tools']).copyToClipboard(text, btnCopySummary);
    } else {
      navigator.clipboard.writeText(text).then(() => {
        btnCopySummary.textContent = '✓ Copied!';
        setTimeout(() => { btnCopySummary.textContent = '📋 Copy Summary'; }, 2000);
      });
    }
  }

  // Initialize
  initPrepayModeTabs();
  initDualSyncSliders();
  initQuickChips();
  initImpactRadios();
  initStartDateControls();
  initTrendChartControls();
  initEventListeners();
  updateWordDisplays();
  updateStartDateDisplay();
  updateTargetSolver();
  triggerLiveCalculation();

})();
