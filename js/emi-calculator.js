/* =========================================================
   ToolsKart — Loan Prepayment Optimizer & Comparative Analysis
   - Periodic Prepayment (Monthly / Yearly / Step-ups)
   - Ad-hoc / Random Prepayments (Custom Months)
   - Target Payoff Goal (Auto tenure solver)
   - Option A (Prepay) vs Option B (Invest in SIP) Comparison
   - Break-Even Analysis & Smart Recommendation Engine
   - Interactive Visualizations (Chart.js)
   - Yearly & Monthly Amortization Schedule with CSV Download
   ========================================================= */

(function () {
  'use strict';

  // DOM Elements
  const loanAmountInput = document.getElementById('loanAmount');
  const interestRateInput = document.getElementById('interestRate');
  const loanTenureInput = document.getElementById('loanTenure');
  const tenureTypeSelect = document.getElementById('tenureType');

  // Prepayment Inputs
  const monthlyPrepayInput = document.getElementById('monthlyPrepay');
  const yearlyPrepayInput = document.getElementById('yearlyPrepay');
  const prepayStepUpInput = document.getElementById('prepayStepUp');
  const emiStepUpInput = document.getElementById('emiStepUp');

  // Ad-hoc prepayments table & inputs
  const customPrepayBody = document.getElementById('customPrepayBody');
  const newPrepayMonth = document.getElementById('newPrepayMonth');
  const newPrepayAmount = document.getElementById('newPrepayAmount');
  const newPrepayNote = document.getElementById('newPrepayNote');
  const addPrepayRowBtn = document.getElementById('addPrepayRowBtn');

  // Target Goal inputs
  const targetTenureInput = document.getElementById('targetTenure');
  const targetTenureTypeSelect = document.getElementById('targetTenureType');
  const targetGoalHint = document.getElementById('targetGoalHint');

  // Investment Rate Input
  const investRateInput = document.getElementById('investRate');

  // Buttons & Controls
  const calculateBtn = document.getElementById('calculateBtn');
  const resetBtn = document.getElementById('resetBtn');
  const resultArea = document.getElementById('resultArea');
  const copyResultBtn = document.getElementById('copyResultBtn');
  const toggleYearlyBtn = document.getElementById('toggleYearlyBtn');
  const toggleMonthlyBtn = document.getElementById('toggleMonthlyBtn');
  const downloadCsvBtn = document.getElementById('downloadCsvBtn');
  const amortizationTableBody = document.getElementById('amortizationTableBody');
  const periodHeader = document.getElementById('periodHeader');

  // Tab Navigation
  const prepayTabBtns = document.querySelectorAll('.calc-tab-btn');
  const prepayTabPanes = document.querySelectorAll('.calc-tab-pane');
  let activeTab = 'tab-periodic';

  // Chart instances
  let trajectoryChartInstance = null;
  let wealthChartInstance = null;

  // Stored state for schedule view toggle & CSV download
  let currentYearlySchedule = [];
  let currentMonthlySchedule = [];
  let currentScheduleView = 'yearly'; // 'yearly' or 'monthly'

  // Pre-seed with sample custom prepayment (matches AssetYogi Excel Month 16 bonus)
  let customPrepayments = [
    { month: 16, amount: 150000, note: 'Annual Bonus' }
  ];

  // Initialize
  initTabs();
  renderCustomPrepayTable();
  updateTargetHint();
  attachEvents();

  // Auto-calculate on initial page load
  setTimeout(calculate, 200);

  function initTabs() {
    prepayTabBtns.forEach(btn => {
      btn.addEventListener('click', function () {
        prepayTabBtns.forEach(b => b.classList.remove('active'));
        prepayTabPanes.forEach(p => p.classList.remove('active'));
        this.classList.add('active');
        activeTab = this.getAttribute('data-tab');
        const targetPane = document.getElementById(activeTab);
        if (targetPane) targetPane.classList.add('active');
        if (activeTab === 'tab-target') updateTargetHint();
      });
    });
  }

  function attachEvents() {
    calculateBtn.addEventListener('click', calculate);

    [loanAmountInput, interestRateInput, loanTenureInput, monthlyPrepayInput, yearlyPrepayInput, prepayStepUpInput, emiStepUpInput, investRateInput, targetTenureInput].forEach(input => {
      if (input) {
        input.addEventListener('keydown', function (e) {
          if (e.key === 'Enter') calculate();
        });
      }
    });

    if (targetTenureInput) {
      targetTenureInput.addEventListener('input', updateTargetHint);
    }
    if (targetTenureTypeSelect) {
      targetTenureTypeSelect.addEventListener('change', updateTargetHint);
    }
    if (loanAmountInput) {
      loanAmountInput.addEventListener('input', updateTargetHint);
    }
    if (interestRateInput) {
      interestRateInput.addEventListener('input', updateTargetHint);
    }

    if (addPrepayRowBtn) {
      addPrepayRowBtn.addEventListener('click', handleAddCustomPrepayment);
    }

    if (toggleYearlyBtn && toggleMonthlyBtn) {
      toggleYearlyBtn.addEventListener('click', () => setScheduleView('yearly'));
      toggleMonthlyBtn.addEventListener('click', () => setScheduleView('monthly'));
    }

    if (downloadCsvBtn) {
      downloadCsvBtn.addEventListener('click', handleDownloadCsv);
    }

    if (resetBtn) {
      resetBtn.addEventListener('click', handleReset);
    }
  }

  function handleReset() {
    loanAmountInput.value = '4160000';
    interestRateInput.value = '8.75';
    loanTenureInput.value = '20';
    tenureTypeSelect.value = 'years';
    monthlyPrepayInput.value = '0';
    yearlyPrepayInput.value = '0';
    prepayStepUpInput.value = '0';
    emiStepUpInput.value = '0';
    investRateInput.value = '12';
    targetTenureInput.value = '10';
    targetTenureTypeSelect.value = 'years';
    customPrepayments = [{ month: 16, amount: 150000, note: 'Annual Bonus' }];
    renderCustomPrepayTable();
    updateTargetHint();
    calculate();
  }

  function renderCustomPrepayTable() {
    if (!customPrepayBody) return;
    customPrepayBody.innerHTML = '';

    if (customPrepayments.length === 0) {
      customPrepayBody.innerHTML = `
        <tr>
          <td colspan="4" style="text-align: center; color: var(--color-text-muted); padding: 1rem;">
            No custom prepayments added yet. Use the form below to add one.
          </td>
        </tr>
      `;
      return;
    }

    // Sort by month
    customPrepayments.sort((a, b) => a.month - b.month);

    customPrepayments.forEach((item, index) => {
      const tr = document.createElement('tr');
      const yearNum = Math.floor((item.month - 1) / 12) + 1;
      const monthInYear = ((item.month - 1) % 12) + 1;

      tr.innerHTML = `
        <td><strong>Month ${item.month}</strong> <span style="font-size:0.75rem; color:var(--color-text-muted);">(Yr ${yearNum}, M${monthInYear})</span></td>
        <td style="font-weight:600;">₹${window.ToolsKart ? window.ToolsKart.formatIndian(item.amount) : item.amount}</td>
        <td style="color:var(--color-text-secondary);">${item.note || '—'}</td>
        <td style="text-align: center;">
          <button type="button" class="btn-remove-row" data-index="${index}" title="Remove prepayment">&times;</button>
        </td>
      `;
      customPrepayBody.appendChild(tr);
    });

    // Attach delete handlers
    customPrepayBody.querySelectorAll('.btn-remove-row').forEach(btn => {
      btn.addEventListener('click', function () {
        const idx = parseInt(this.getAttribute('data-index'), 10);
        customPrepayments.splice(idx, 1);
        renderCustomPrepayTable();
      });
    });
  }

  function handleAddCustomPrepayment() {
    const month = parseInt(newPrepayMonth.value, 10);
    const amount = parseFloat(newPrepayAmount.value);
    const note = newPrepayNote.value.trim();

    if (isNaN(month) || month < 1) {
      alert('Please enter a valid month number (e.g. 12 for end of Year 1).');
      newPrepayMonth.focus();
      return;
    }
    if (isNaN(amount) || amount <= 0) {
      alert('Please enter a valid prepayment amount greater than 0.');
      newPrepayAmount.focus();
      return;
    }

    customPrepayments.push({ month, amount, note: note || 'Lumpsum' });
    newPrepayMonth.value = '';
    newPrepayAmount.value = '';
    newPrepayNote.value = '';
    renderCustomPrepayTable();
  }

  function updateTargetHint() {
    if (!targetGoalHint) return;
    const principal = parseFloat(loanAmountInput.value) || 0;
    const rate = parseFloat(interestRateInput.value) || 0;
    const targetT = parseFloat(targetTenureInput.value) || 0;
    const tType = targetTenureTypeSelect.value;
    const targetMonths = tType === 'years' ? Math.round(targetT * 12) : Math.round(targetT);

    const origTenure = parseFloat(loanTenureInput.value) || 0;
    const origType = tenureTypeSelect.value;
    const origMonths = origType === 'years' ? Math.round(origTenure * 12) : Math.round(origTenure);

    if (principal <= 0 || rate <= 0 || targetMonths <= 0 || targetMonths >= origMonths) {
      targetGoalHint.innerHTML = `🎯 Target payoff tenure must be less than your original tenure (${origMonths / 12} years).`;
      return;
    }

    const monthlyRate = rate / 12 / 100;
    const baseEmi = computeEmi(principal, monthlyRate, origMonths);
    const targetEmi = computeEmi(principal, monthlyRate, targetMonths);
    const extraMonthly = Math.max(0, targetEmi - baseEmi);
    const extraYearly = extraMonthly * 12;

    const TK = window.ToolsKart;
    targetGoalHint.innerHTML = `
      🎯 To finish your loan in <strong>${targetMonths / 12} years</strong> (${targetMonths} months) instead of ${origMonths / 12} years:
      <br>• Required Revised EMI: <strong>${TK ? TK.formatINR(targetEmi) : '₹' + targetEmi.toFixed(0)}/mo</strong>
      <br>• Extra Monthly Top-Up: <strong>+${TK ? TK.formatINR(extraMonthly) : '₹' + extraMonthly.toFixed(0)}/mo</strong>
      <br>• Or Extra Yearly Lumpsum: <strong>~${TK ? TK.formatINR(extraYearly) : '₹' + extraYearly.toFixed(0)}/year</strong>
    `;
  }

  function computeEmi(principal, monthlyRate, months) {
    if (monthlyRate === 0) return principal / months;
    return principal * monthlyRate * Math.pow(1 + monthlyRate, months) / (Math.pow(1 + monthlyRate, months) - 1);
  }

  function calculate() {
    const TK = window.ToolsKart;
    if (TK) TK.clearAllErrors(document.querySelector('.tool-interface'));

    const principal = parseFloat(loanAmountInput.value);
    if (isNaN(principal) || principal <= 0) {
      if (TK) TK.showError(loanAmountInput, 'Please enter a valid loan amount.');
      return;
    }

    const rate = parseFloat(interestRateInput.value);
    if (isNaN(rate) || rate <= 0 || rate > 50) {
      if (TK) TK.showError(interestRateInput, 'Please enter a valid annual interest rate (e.g. 8.75).');
      return;
    }

    const tenure = parseFloat(loanTenureInput.value);
    if (isNaN(tenure) || tenure <= 0) {
      if (TK) TK.showError(loanTenureInput, 'Please enter a valid loan tenure.');
      return;
    }

    const totalMonths = tenureTypeSelect.value === 'years' ? Math.round(tenure * 12) : Math.round(tenure);
    const monthlyRate = rate / 12 / 100;
    const baseEmi = computeEmi(principal, monthlyRate, totalMonths);

    // Prepayment Parameters based on active tab
    let monthlyPrepay = 0;
    let yearlyPrepay = 0;
    let prepayStepUp = 0;
    let emiStepUp = 0;
    let activeCustomPrepayments = [];

    if (activeTab === 'tab-periodic') {
      monthlyPrepay = parseFloat(monthlyPrepayInput.value) || 0;
      yearlyPrepay = parseFloat(yearlyPrepayInput.value) || 0;
      prepayStepUp = (parseFloat(prepayStepUpInput.value) || 0) / 100;
      emiStepUp = (parseFloat(emiStepUpInput.value) || 0) / 100;
    } else if (activeTab === 'tab-adhoc') {
      activeCustomPrepayments = [...customPrepayments];
    } else if (activeTab === 'tab-target') {
      const targetT = parseFloat(targetTenureInput.value) || 0;
      const targetMonths = targetTenureTypeSelect.value === 'years' ? Math.round(targetT * 12) : Math.round(targetT);
      if (targetMonths > 0 && targetMonths < totalMonths) {
        const targetEmi = computeEmi(principal, monthlyRate, targetMonths);
        monthlyPrepay = Math.max(0, targetEmi - baseEmi);
      }
    }

    const impactMode = document.querySelector('input[name="impactMode"]:checked') ? document.querySelector('input[name="impactMode"]:checked').value : 'tenure';
    const investAnnualRate = (parseFloat(investRateInput.value) || 12) / 100;
    const investMonthlyRate = investAnnualRate / 12;

    // 1. Run Base Loan Amortization (No Prepayments)
    const baseSchedule = runSimulation({
      principal,
      monthlyRate,
      totalMonths,
      baseEmi,
      monthlyPrepay: 0,
      yearlyPrepay: 0,
      prepayStepUp: 0,
      emiStepUp: 0,
      customPrepayments: [],
      impactMode: 'tenure'
    });

    // 2. Run Prepayment Loan Amortization
    const prepaySchedule = runSimulation({
      principal,
      monthlyRate,
      totalMonths,
      baseEmi,
      monthlyPrepay,
      yearlyPrepay,
      prepayStepUp,
      emiStepUp,
      customPrepayments: activeCustomPrepayments,
      impactMode
    });

    // 3. Option B: Alternative Investment Simulation
    // Each month that had an extra prepayment, invest that exact amount into mutual fund SIP compounding at investMonthlyRate
    let totalInvestedCapital = 0;
    let investmentFutureValue = 0;

    prepaySchedule.monthly.forEach(monthItem => {
      const extra = monthItem.prepayment;
      if (extra > 0) {
        totalInvestedCapital += extra;
        // Compounds from month of investment until the end of original loan tenure
        const monthsCompounding = Math.max(0, totalMonths - monthItem.month);
        const fv = extra * Math.pow(1 + investMonthlyRate, monthsCompounding);
        investmentFutureValue += fv;
      }
    });

    const investmentNetProfit = Math.max(0, investmentFutureValue - totalInvestedCapital);

    // Key Performance Indicators
    const baseTotalInterest = baseSchedule.totalInterest;
    const prepayTotalInterest = prepaySchedule.totalInterest;
    const interestSaved = Math.max(0, baseTotalInterest - prepayTotalInterest);
    const monthsSaved = Math.max(0, totalMonths - prepaySchedule.monthsCompleted);
    const yearsSaved = (monthsSaved / 12).toFixed(1);
    const totalExtraPrepaid = prepaySchedule.totalPrepayment;

    // Display Results in UI
    displaySummaryResults({
      baseEmi,
      prepayEmi: prepaySchedule.firstEmi,
      monthsSaved,
      interestSaved,
      baseTotalInterest,
      investmentFutureValue,
      principal,
      totalExtraPrepaid,
      prepayTotalInterest,
      prepayTotalPayment: prepaySchedule.totalPayment,
      totalMonths,
      prepayMonths: prepaySchedule.monthsCompleted,
      totalInvestedCapital,
      investmentNetProfit,
      rate,
      investAnnualRate: investAnnualRate * 100
    });

    // Store schedule for table toggling
    currentYearlySchedule = prepaySchedule.yearly;
    currentMonthlySchedule = prepaySchedule.monthly;
    renderAmortizationTable();

    // Render Chart.js Visualizations
    renderCharts({
      baseSchedule,
      prepaySchedule,
      totalMonths,
      principal,
      baseTotalInterest,
      prepayTotalInterest,
      interestSaved,
      totalExtraPrepaid,
      investmentFutureValue
    });

    if (TK) TK.showResult('resultArea');
  }

  function runSimulation(params) {
    const {
      principal,
      monthlyRate,
      totalMonths,
      baseEmi,
      monthlyPrepay,
      yearlyPrepay,
      prepayStepUp,
      emiStepUp,
      customPrepayments,
      impactMode
    } = params;

    const customMap = {};
    if (customPrepayments && customPrepayments.length > 0) {
      customPrepayments.forEach(c => {
        customMap[c.month] = (customMap[c.month] || 0) + c.amount;
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
    let maxMonths = totalMonths;

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

        // Apply annual step-up to regular EMI if configured
        if (emiStepUp > 0 && yearIndex > 0) {
          curEmi = baseEmi * Math.pow(1 + emiStepUp, yearIndex);
        }
      }

      // Compute monthly extra prepayment
      let extraMonthly = monthlyPrepay;
      if (prepayStepUp > 0 && yearIndex > 0) {
        extraMonthly = monthlyPrepay * Math.pow(1 + prepayStepUp, yearIndex);
      }

      // Check if yearly lumpsum applies at month 12 of each year
      let extraYearly = 0;
      if (monthInYear === 12 && yearlyPrepay > 0) {
        extraYearly = yearlyPrepay;
        if (prepayStepUp > 0 && yearIndex > 0) {
          extraYearly = yearlyPrepay * Math.pow(1 + prepayStepUp, yearIndex);
        }
      }

      // Check custom ad-hoc prepayments
      const extraCustom = customMap[month] || 0;
      const totalExtraThisMonth = extraMonthly + extraYearly + extraCustom;

      const openingBal = balance;
      const interestForMonth = balance * monthlyRate;
      let regularEmiForMonth = curEmi;
      let principalFromEmi = 0;
      let prepayApplied = 0;

      if (balance + interestForMonth <= regularEmiForMonth + totalExtraThisMonth) {
        // Final payoff month!
        const totalPayoffNeeded = balance + interestForMonth;
        if (totalPayoffNeeded <= regularEmiForMonth) {
          regularEmiForMonth = totalPayoffNeeded;
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

        // If impactMode is 'emi', recompute EMI for the remaining months so tenure doesn't shrink
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
      firstEmi: monthly[0] ? monthly[0].regularEmi : baseEmi,
      monthly,
      yearly
    };
  }

  function displaySummaryResults(data) {
    const TK = window.ToolsKart;
    const formatINR = TK ? TK.formatINR.bind(TK) : (v => '₹' + Number(v).toLocaleString('en-IN', { maximumFractionDigits: 0 }));

    // 1. KPI Cards
    const ySaved = Math.floor(data.monthsSaved / 12);
    const mSaved = data.monthsSaved % 12;
    let timeSavedStr = '0 Months';
    if (ySaved > 0 && mSaved > 0) {
      timeSavedStr = `${ySaved} Yrs ${mSaved} Mos`;
    } else if (ySaved > 0) {
      timeSavedStr = `${ySaved} Years`;
    } else if (mSaved > 0) {
      timeSavedStr = `${mSaved} Months`;
    }

    document.getElementById('kpiEmi').textContent = formatINR(data.baseEmi);
    document.getElementById('kpiEmiSub').textContent = data.prepayEmi !== data.baseEmi ? `Initial: ${formatINR(data.prepayEmi)}` : 'Regular EMI';
    document.getElementById('kpiTimeSaved').textContent = timeSavedStr;
    document.getElementById('kpiTimeSavedSub').textContent = data.monthsSaved > 0 ? `Closes in ${(data.prepayMonths / 12).toFixed(1)} yrs` : 'Standard tenure';
    document.getElementById('kpiInterestSaved').textContent = formatINR(data.interestSaved);
    const pctSaved = data.baseTotalInterest > 0 ? ((data.interestSaved / data.baseTotalInterest) * 100).toFixed(1) : 0;
    document.getElementById('kpiInterestSavedSub').textContent = `${pctSaved}% interest eliminated`;
    document.getElementById('kpiInvestWealth').textContent = formatINR(data.investmentFutureValue);
    document.getElementById('kpiInvestWealthSub').textContent = `Profit: ${formatINR(data.investmentNetProfit)}`;

    // 2. Breakdown Rows
    document.getElementById('resPrincipal').textContent = formatINR(data.principal);
    document.getElementById('resBaseInterest').textContent = formatINR(data.baseTotalInterest);
    document.getElementById('resNewInterest').textContent = formatINR(data.prepayTotalInterest);
    document.getElementById('resTotalPrepayment').textContent = formatINR(data.totalExtraPrepaid);
    document.getElementById('resTotalPayment').textContent = formatINR(data.prepayTotalPayment);

    // 3. Option A (Prepayment) Card
    document.getElementById('optAPrepayTotal').textContent = formatINR(data.totalExtraPrepaid);
    document.getElementById('optANewTenure').textContent = `${(data.prepayMonths / 12).toFixed(1)} Years (${data.prepayMonths} Months)`;
    document.getElementById('optAInterestPaid').textContent = formatINR(data.prepayTotalInterest);
    document.getElementById('optAInterestSaved').textContent = formatINR(data.interestSaved);
    document.getElementById('optAReturnRate').textContent = `${data.rate.toFixed(2)}% p.a. (Tax-Free)`;

    // 4. Option B (Investment) Card
    document.getElementById('optBInvestTotal').textContent = formatINR(data.totalInvestedCapital);
    document.getElementById('optBOriginalTenure').textContent = `${(data.totalMonths / 12).toFixed(0)} Years (${data.totalMonths} Months)`;
    document.getElementById('optBInterestPaid').textContent = formatINR(data.baseTotalInterest);
    document.getElementById('optBGrossCorpus').textContent = formatINR(data.investmentFutureValue);
    document.getElementById('optBNetProfit').textContent = formatINR(data.investmentNetProfit);
    document.getElementById('optBReturnRate').textContent = `${data.investAnnualRate.toFixed(1)}% p.a. CAGR`;

    // 5. Verdict & Break-Even Evaluation
    const netDifference = data.investmentNetProfit - data.interestSaved;
    const cardOptionA = document.getElementById('cardOptionA');
    const cardOptionB = document.getElementById('cardOptionB');
    const badgeOptionA = document.getElementById('badgeOptionA');
    const badgeOptionB = document.getElementById('badgeOptionB');
    const verdictIcon = document.getElementById('verdictIcon');
    const verdictHeading = document.getElementById('verdictHeading');
    const verdictSummary = document.getElementById('verdictSummary');
    const verdictDifference = document.getElementById('verdictDifference');
    const breakEvenBadge = document.getElementById('breakEvenBadge');

    // Calculate approximate Break-Even Hurdle Rate
    // By equating investment net profit to loan interest saved
    const breakEvenRate = computeBreakEvenRate(data.totalInvestedCapital, data.interestSaved, data.totalMonths, data.prepayMonths);
    breakEvenBadge.textContent = `Break-even ROI: ${breakEvenRate.toFixed(2)}% p.a.`;

    if (data.totalExtraPrepaid <= 0) {
      cardOptionA.classList.remove('is-winner');
      cardOptionB.classList.remove('is-winner');
      badgeOptionA.style.display = 'none';
      badgeOptionB.style.display = 'none';
      verdictIcon.textContent = 'ℹ️';
      verdictHeading.textContent = 'Enter Prepayment To Compare';
      verdictSummary.textContent = 'Add an extra monthly payment, annual lumpsum, or target payoff tenure above to see your customized Prepayment vs. Investment comparison.';
      verdictDifference.textContent = 'No extra outflow currently modeled.';
    } else if (netDifference > 0) {
      // Option B wins mathematically
      cardOptionA.classList.remove('is-winner');
      cardOptionB.classList.add('is-winner');
      badgeOptionA.style.display = 'none';
      badgeOptionB.style.display = 'inline-block';
      verdictIcon.textContent = '🏆';
      verdictHeading.textContent = 'Option B (Investment) Builds Greater Net Wealth';
      verdictSummary.textContent = `By investing your surplus into an equity/mutual fund portfolio at ${data.investAnnualRate}%, the power of compounding generates more wealth than the interest you would save by prepaying your home loan at ${data.rate}%.`;
      verdictDifference.innerHTML = `<strong>Option B Advantage:</strong> Generates <strong>${formatINR(netDifference)} MORE net wealth</strong> over the loan period!`;
    } else {
      // Option A wins or ties
      cardOptionA.classList.add('is-winner');
      cardOptionB.classList.remove('is-winner');
      badgeOptionA.style.display = 'inline-block';
      badgeOptionB.style.display = 'none';
      verdictIcon.textContent = '🛡️';
      verdictHeading.textContent = 'Option A (Prepayment) is Guaranteed & Superior';
      verdictSummary.textContent = `Prepaying your home loan gives a guaranteed, risk-free savings of ${data.rate}% p.a. Since the expected investment return (${data.investAnnualRate}%) does not beat the break-even hurdle rate (${breakEvenRate.toFixed(2)}%), prepaying is the safer and more profitable move.`;
      verdictDifference.innerHTML = `<strong>Option A Advantage:</strong> Saves <strong>${formatINR(Math.abs(netDifference))} more</strong> guaranteed money while clearing debt early!`;
    }

    // Clipboard Copy Handler
    copyResultBtn.onclick = function () {
      let text = '=== LOAN PREPAYMENT & INVESTMENT SUMMARY ===\n';
      text += `Principal Loan Amount: ${formatINR(data.principal)}\n`;
      text += `Interest Rate: ${data.rate}% p.a.\n`;
      text += `Monthly EMI: ${formatINR(data.baseEmi)}\n`;
      text += `Tenure Saved: ${timeSavedStr}\n`;
      text += `Total Interest Saved: ${formatINR(data.interestSaved)}\n`;
      text += `Total Prepayment Made: ${formatINR(data.totalExtraPrepaid)}\n\n`;
      text += '--- OPTION A (LOAN PREPAYMENT) ---\n';
      text += `Loan Payoff Time: ${(data.prepayMonths / 12).toFixed(1)} Years\n`;
      text += `Guaranteed Interest Saved: ${formatINR(data.interestSaved)}\n\n`;
      text += '--- OPTION B (MUTUAL FUND SIP) ---\n';
      text += `Expected Return: ${data.investAnnualRate}% p.a.\n`;
      text += `Investment Corpus Built: ${formatINR(data.investmentFutureValue)}\n`;
      text += `Net Profit Created: ${formatINR(data.investmentNetProfit)}\n`;
      text += `Break-even Return Rate: ${breakEvenRate.toFixed(2)}% p.a.\n`;
      text += `Verdict: ${netDifference > 0 ? 'Option B creates ' + formatINR(netDifference) + ' MORE wealth' : 'Option A saves ' + formatINR(Math.abs(netDifference)) + ' more guaranteed money'}\n`;
      text += 'Generated via ToolsKart (https://toolskart.github.io)';
      if (TK) TK.copyToClipboard(text, this);
    };
  }

  function computeBreakEvenRate(investedCapital, targetProfit, totalMonths, prepayMonths) {
    if (investedCapital <= 0 || targetProfit <= 0) return 8.75;
    // Binary search for annual rate r in [0.01, 0.40]
    let low = 0.01;
    let high = 0.40;
    const months = totalMonths;

    for (let iter = 0; iter < 25; iter++) {
      const mid = (low + high) / 2;
      const mRate = mid / 12;
      // Approximate future value
      const fv = investedCapital * Math.pow(1 + mRate, months / 2);
      const profit = fv - investedCapital;
      if (profit < targetProfit) {
        low = mid;
      } else {
        high = mid;
      }
    }
    return ((low + high) / 2) * 100;
  }

  function renderCharts(params) {
    if (typeof Chart === 'undefined') return;

    const {
      baseSchedule,
      prepaySchedule,
      principal,
      baseTotalInterest,
      prepayTotalInterest,
      interestSaved,
      totalExtraPrepaid,
      investmentFutureValue
    } = params;

    // 1. Line Chart: Outstanding Loan Balance Trajectory
    const trajectoryCanvas = document.getElementById('loanTrajectoryChart');
    if (trajectoryCanvas) {
      if (trajectoryChartInstance) trajectoryChartInstance.destroy();

      const labels = [];
      const baseBalances = [];
      const prepayBalances = [];

      const maxYears = Math.max(baseSchedule.yearly.length, prepaySchedule.yearly.length);
      labels.push('Year 0');
      baseBalances.push(principal);
      prepayBalances.push(principal);

      for (let y = 1; y <= maxYears; y++) {
        labels.push(`Year ${y}`);
        const baseY = baseSchedule.yearly.find(item => item.year === y);
        const prepayY = prepaySchedule.yearly.find(item => item.year === y);

        baseBalances.push(baseY ? Math.max(0, baseY.closingBalance) : 0);
        prepayBalances.push(prepayY ? Math.max(0, prepayY.closingBalance) : 0);
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
              tension: 0.2
            },
            {
              label: 'With Prepayments',
              data: prepayBalances,
              borderColor: '#10B981',
              backgroundColor: 'rgba(16, 185, 129, 0.12)',
              borderWidth: 2.5,
              fill: true,
              tension: 0.2
            }
          ]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            tooltip: {
              callbacks: {
                label: function (context) {
                  const val = context.parsed.y;
                  return `${context.dataset.label}: ₹${Number(val).toLocaleString('en-IN', { maximumFractionDigits: 0 })}`;
                }
              }
            },
            legend: {
              position: 'top',
              labels: { boxWidth: 12, font: { size: 11 } }
            }
          },
          scales: {
            y: {
              ticks: {
                callback: function (value) {
                  if (value >= 10000000) return '₹' + (value / 10000000).toFixed(1) + ' Cr';
                  if (value >= 100000) return '₹' + (value / 100000).toFixed(0) + ' L';
                  return '₹' + value;
                },
                font: { size: 10 }
              }
            },
            x: {
              ticks: { font: { size: 10 } }
            }
          }
        }
      });
    }

    // 2. Bar Chart: Total Outflow & Wealth Comparison
    const wealthCanvas = document.getElementById('wealthComparisonChart');
    if (wealthCanvas) {
      if (wealthChartInstance) wealthChartInstance.destroy();

      const ctx2 = wealthCanvas.getContext('2d');
      wealthChartInstance = new Chart(ctx2, {
        type: 'bar',
        data: {
          labels: ['Standard Loan', 'Option A (Prepayment)', 'Option B (Investment)'],
          datasets: [
            {
              label: 'Principal Borrowed',
              data: [principal, principal, principal],
              backgroundColor: '#60A5FA'
            },
            {
              label: 'Interest Paid',
              data: [baseTotalInterest, prepayTotalInterest, baseTotalInterest],
              backgroundColor: '#F87171'
            },
            {
              label: 'Prepayment Made / Capital Invested',
              data: [0, totalExtraPrepaid, totalExtraPrepaid],
              backgroundColor: '#FBBF24'
            },
            {
              label: 'Investment Corpus Accumulated',
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
                label: function (context) {
                  const val = context.parsed.y;
                  return `${context.dataset.label}: ₹${Number(val).toLocaleString('en-IN', { maximumFractionDigits: 0 })}`;
                }
              }
            },
            legend: {
              position: 'top',
              labels: { boxWidth: 12, font: { size: 10 } }
            }
          },
          scales: {
            x: {
              stacked: false,
              ticks: { font: { size: 10 } }
            },
            y: {
              ticks: {
                callback: function (value) {
                  if (value >= 10000000) return '₹' + (value / 10000000).toFixed(1) + ' Cr';
                  if (value >= 100000) return '₹' + (value / 100000).toFixed(0) + ' L';
                  return '₹' + value;
                },
                font: { size: 10 }
              }
            }
          }
        }
      });
    }
  }

  function setScheduleView(view) {
    currentScheduleView = view;
    if (view === 'yearly') {
      toggleYearlyBtn.classList.add('active');
      toggleMonthlyBtn.classList.remove('active');
      periodHeader.textContent = 'Year';
    } else {
      toggleYearlyBtn.classList.remove('active');
      toggleMonthlyBtn.classList.add('active');
      periodHeader.textContent = 'Month';
    }
    renderAmortizationTable();
  }

  function renderAmortizationTable() {
    if (!amortizationTableBody) return;
    amortizationTableBody.innerHTML = '';

    const data = currentScheduleView === 'yearly' ? currentYearlySchedule : currentMonthlySchedule;
    const TK = window.ToolsKart;
    const format = TK ? TK.formatIndian.bind(TK) : (v => Number(v).toFixed(2));

    data.forEach(item => {
      const tr = document.createElement('tr');
      const periodLabel = currentScheduleView === 'yearly' ? `Year ${item.year}` : `Month ${item.month}`;

      tr.innerHTML = `
        <td style="text-align: left; font-weight: 600;">${periodLabel}</td>
        <td>${format(item.openingBalance)}</td>
        <td>${format(item.regularEmi)}</td>
        <td style="${item.prepayment > 0 ? 'color:#059669; font-weight:600;' : ''}">${item.prepayment > 0 ? format(item.prepayment) : '—'}</td>
        <td>${format(item.principalPaid)}</td>
        <td>${format(item.interestPaid)}</td>
        <td>${format(item.totalPaid)}</td>
        <td style="font-weight: 600;">${format(Math.max(0, item.closingBalance))}</td>
      `;
      amortizationTableBody.appendChild(tr);
    });
  }

  function handleDownloadCsv() {
    const data = currentScheduleView === 'yearly' ? currentYearlySchedule : currentMonthlySchedule;
    if (!data || data.length === 0) {
      alert('Please calculate your loan schedule before downloading.');
      return;
    }

    const headers = [
      currentScheduleView === 'yearly' ? 'Year' : 'Month',
      'Opening Balance (INR)',
      'Regular EMI (INR)',
      'Prepayment (INR)',
      'Principal Paid (INR)',
      'Interest Paid (INR)',
      'Total Payment (INR)',
      'Closing Balance (INR)'
    ];

    const rows = data.map(item => [
      currentScheduleView === 'yearly' ? `Year ${item.year}` : `Month ${item.month}`,
      item.openingBalance.toFixed(2),
      item.regularEmi.toFixed(2),
      item.prepayment.toFixed(2),
      item.principalPaid.toFixed(2),
      item.interestPaid.toFixed(2),
      item.totalPaid.toFixed(2),
      Math.max(0, item.closingBalance).toFixed(2)
    ]);

    let csvContent = headers.join(',') + '\n';
    rows.forEach(r => {
      csvContent += r.join(',') + '\n';
    });

    const filename = `loan_amortization_schedule_${currentScheduleView}.csv`;
    if (window.ToolsKart) {
      window.ToolsKart.downloadFile(csvContent, filename, 'text/csv');
    }
  }

})();

