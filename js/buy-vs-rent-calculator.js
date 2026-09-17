/* ========================================================
   ToolsKart — Buy Home vs. Rent Calculator & Decision Engine
   Indian Real Estate & Wealth Compounding Model
   ======================================================== */

(function () {
  'use strict';

  // --- DOM Elements ---
  const propertyPriceInput = document.getElementById('propertyPrice');
  const propertyPriceSlider = document.getElementById('propertyPriceSlider');
  const propertyPriceWords = document.getElementById('propertyPriceWords');

  const downPaymentPctInput = document.getElementById('downPaymentPct');
  const downPaymentSlider = document.getElementById('downPaymentSlider');
  const downPaymentAmountBadge = document.getElementById('downPaymentAmountBadge');

  const loanRateInput = document.getElementById('loanRate');
  const loanRateSlider = document.getElementById('loanRateSlider');

  const loanTenureInput = document.getElementById('loanTenure');
  const loanTenureSlider = document.getElementById('loanTenureSlider');
  const monthlyEmiBadge = document.getElementById('monthlyEmiBadge');

  const stampDutyPctInput = document.getElementById('stampDutyPct');
  const interiorCostInput = document.getElementById('interiorCost');
  const buyerBrokerageLegalInput = document.getElementById('buyerBrokerageLegal');
  const propertyAppreciationInput = document.getElementById('propertyAppreciation');
  const buyerMaintenanceInput = document.getElementById('buyerMaintenance');
  const propertyTaxInput = document.getElementById('propertyTax');
  const taxRegimeSelect = document.getElementById('taxRegime');

  const monthlyRentInput = document.getElementById('monthlyRent');
  const monthlyRentSlider = document.getElementById('monthlyRentSlider');
  const monthlyRentWords = document.getElementById('monthlyRentWords');

  const rentEscalationInput = document.getElementById('rentEscalation');
  const rentEscalationSlider = document.getElementById('rentEscalationSlider');

  const securityDepositMonthsInput = document.getElementById('securityDepositMonths');
  const securityDepositSlider = document.getElementById('securityDepositSlider');
  const securityDepositBadge = document.getElementById('securityDepositBadge');

  const renterMaintenanceInput = document.getElementById('renterMaintenance');
  const shiftingFrequencySelect = document.getElementById('shiftingFrequencyYears');
  const agentFeeSelect = document.getElementById('agentFeeMonths');
  const shiftingCostInput = document.getElementById('shiftingCost');

  const investmentReturnInput = document.getElementById('investmentReturn');
  const investmentReturnSlider = document.getElementById('investmentReturnSlider');

  const inflationRateInput = document.getElementById('inflationRate');
  const inflationRateSlider = document.getElementById('inflationRateSlider');

  const timeHorizonInput = document.getElementById('timeHorizon');
  const timeHorizonSlider = document.getElementById('timeHorizonSlider');
  const timeHorizonBadge = document.getElementById('timeHorizonBadge');

  // KPI Elements
  const winnerCallout = document.getElementById('winnerCallout');
  const winnerHeadline = document.getElementById('winnerHeadline');
  const winnerSubtext = document.getElementById('winnerSubtext');
  const winnerIcon = document.getElementById('winnerIcon');
  const breakEvenPill = document.getElementById('breakEvenPill');

  const ptrRatioText = document.getElementById('ptrRatioText');
  const ptrBadge = document.getElementById('ptrBadge');

  const buyerAtYearLabel = document.getElementById('buyerAtYearLabel');
  const kpiBuyerNetWorth = document.getElementById('kpiBuyerNetWorth');
  const kpiPropertyVal = document.getElementById('kpiPropertyVal');
  const kpiLoanRemaining = document.getElementById('kpiLoanRemaining');
  const kpiSellingCost = document.getElementById('kpiSellingCost');

  const renterAtYearLabel = document.getElementById('renterAtYearLabel');
  const kpiRenterNetWorth = document.getElementById('kpiRenterNetWorth');
  const kpiLumpSumGrowth = document.getElementById('kpiLumpSumGrowth');
  const kpiSipGrowth = document.getElementById('kpiSipGrowth');
  const kpiRefundedDeposit = document.getElementById('kpiRefundedDeposit');

  const kpiTotalBuyerOutflow = document.getElementById('kpiTotalBuyerOutflow');
  const kpiTotalRenterOutflow = document.getElementById('kpiTotalRenterOutflow');
  const kpiOutflowDifference = document.getElementById('kpiOutflowDifference');

  const kpiYr1Buy = document.getElementById('kpiYr1Buy');
  const kpiYr1Rent = document.getElementById('kpiYr1Rent');
  const kpiMidYearLabel = document.getElementById('kpiMidYearLabel');
  const kpiMidBuy = document.getElementById('kpiMidBuy');
  const kpiMidRent = document.getElementById('kpiMidRent');

  const comparisonTableBody = document.getElementById('comparisonTableBody');
  const exportScheduleBtn = document.getElementById('exportScheduleBtn');
  const copyScheduleBtn = document.getElementById('copyScheduleBtn');

  // Charts
  let netWorthChartInstance = null;
  let cashOutflowChartInstance = null;
  let cachedYearlyData = [];

  // --- Helper Functions ---
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

  function syncSliderAndInput(input, slider, callback) {
    if (!input || !slider) return;
    input.addEventListener('input', () => {
      slider.value = input.value;
      if (callback) callback();
      recalculateAll();
    });
    slider.addEventListener('input', () => {
      input.value = slider.value;
      if (callback) callback();
      recalculateAll();
    });
  }

  // --- Setup Property Type Preset Buttons ---
  const propTypeBtns = document.querySelectorAll('[data-prop-type]');
  propTypeBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      propTypeBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      const type = btn.getAttribute('data-prop-type');
      document.getElementById('propertyType').value = type;

      if (type === 'flat') {
        propertyAppreciationInput.value = '6.0';
        buyerMaintenanceInput.value = '3500';
      } else if (type === 'house') {
        propertyAppreciationInput.value = '8.5';
        buyerMaintenanceInput.value = '2000';
      } else if (type === 'plot') {
        propertyAppreciationInput.value = '9.5';
        buyerMaintenanceInput.value = '500';
      }
      recalculateAll();
    });
  });

  // --- Setup Quick Chips ---
  document.querySelectorAll('.quick-chip[data-target]').forEach(chip => {
    chip.addEventListener('click', function () {
      const targetId = this.getAttribute('data-target');
      const val = this.getAttribute('data-val');
      const targetInput = document.getElementById(targetId);
      const targetSlider = document.getElementById(targetId + 'Slider');

      if (targetInput) {
        targetInput.value = val;
        if (targetSlider) targetSlider.value = val;

        const parentRow = this.parentElement;
        parentRow.querySelectorAll('.quick-chip').forEach(c => c.classList.remove('active'));
        this.classList.add('active');

        recalculateAll();
      }
    });
  });

  // --- Synchronize All Controls ---
  syncSliderAndInput(propertyPriceInput, propertyPriceSlider, () => {
    const p = parseFloat(propertyPriceInput.value) || 0;
    propertyPriceWords.textContent = formatLakhCrore(p);
  });

  syncSliderAndInput(downPaymentPctInput, downPaymentSlider, () => {
    updateDownPaymentBadge();
  });

  syncSliderAndInput(loanRateInput, loanRateSlider);
  syncSliderAndInput(loanTenureInput, loanTenureSlider);

  syncSliderAndInput(monthlyRentInput, monthlyRentSlider, () => {
    const r = parseFloat(monthlyRentInput.value) || 0;
    monthlyRentWords.textContent = `${formatINR(r)} / mo`;
    updateSecurityDepositBadge();
  });

  syncSliderAndInput(rentEscalationInput, rentEscalationSlider);
  syncSliderAndInput(securityDepositMonthsInput, securityDepositSlider, () => {
    updateSecurityDepositBadge();
  });

  syncSliderAndInput(investmentReturnInput, investmentReturnSlider);
  syncSliderAndInput(inflationRateInput, inflationRateSlider);
  syncSliderAndInput(timeHorizonInput, timeHorizonSlider, () => {
    timeHorizonBadge.textContent = `${timeHorizonInput.value} Years`;
  });

  // Advanced Inputs listeners
  [
    stampDutyPctInput, interiorCostInput, buyerBrokerageLegalInput,
    propertyAppreciationInput, buyerMaintenanceInput, propertyTaxInput,
    taxRegimeSelect, renterMaintenanceInput, shiftingFrequencySelect,
    agentFeeSelect, shiftingCostInput
  ].forEach(el => {
    if (el) el.addEventListener('input', recalculateAll);
    if (el) el.addEventListener('change', recalculateAll);
  });

  function updateDownPaymentBadge() {
    const p = parseFloat(propertyPriceInput.value) || 0;
    const dpPct = parseFloat(downPaymentPctInput.value) || 20;
    const dpAmt = p * (dpPct / 100);
    downPaymentAmountBadge.textContent = `${formatLakhCrore(dpAmt)} (${dpPct}%)`;
  }

  function updateSecurityDepositBadge() {
    const r = parseFloat(monthlyRentInput.value) || 0;
    const m = parseFloat(securityDepositMonthsInput.value) || 6;
    const dep = r * m;
    securityDepositBadge.textContent = `${formatLakhCrore(dep)} (${m} Mo)`;
  }

  // --- CORE MATHEMATICAL ENGINE ---
  function recalculateAll() {
    const price = parseFloat(propertyPriceInput.value) || 0;
    const downPaymentPct = parseFloat(downPaymentPctInput.value) || 20;
    const loanRateAnnual = (parseFloat(loanRateInput.value) || 8.5) / 100;
    const loanTenureYears = parseInt(loanTenureInput.value, 10) || 20;

    const stampDutyPct = (parseFloat(stampDutyPctInput.value) || 6) / 100;
    const interiorCost = parseFloat(interiorCostInput.value) || 0;
    const buyerBrokerageLegal = parseFloat(buyerBrokerageLegalInput.value) || 0;
    const propertyAppreciation = (parseFloat(propertyAppreciationInput.value) || 6.5) / 100;
    const buyerMonthlyMaint0 = parseFloat(buyerMaintenanceInput.value) || 0;
    const propertyTax0 = parseFloat(propertyTaxInput.value) || 0;
    const taxRegime = taxRegimeSelect.value;

    const initialRent = parseFloat(monthlyRentInput.value) || 0;
    const rentEscalation = (parseFloat(rentEscalationInput.value) || 7.5) / 100;
    const securityDepositMonths = parseFloat(securityDepositMonthsInput.value) || 6;
    const renterMonthlyMaint0 = parseFloat(renterMaintenanceInput.value) || 0;
    const shiftingFrequency = parseInt(shiftingFrequencySelect.value, 10) || 3;
    const agentFeeMonths = parseFloat(agentFeeSelect.value) || 1;
    const shiftingCost0 = parseFloat(shiftingCostInput.value) || 0;

    const investmentReturnAnnual = (parseFloat(investmentReturnInput.value) || 12) / 100;
    const inflationRate = (parseFloat(inflationRateInput.value) || 6) / 100;
    const horizonYears = parseInt(timeHorizonInput.value, 10) || 15;

    // Upfront Computations
    const downPaymentAmt = price * (downPaymentPct / 100);
    const loanPrincipal = Math.max(0, price - downPaymentAmt);
    const stampDutyAmt = price * stampDutyPct;
    const totalBuyerUpfront = downPaymentAmt + stampDutyAmt + interiorCost + buyerBrokerageLegal;

    const securityDepositAmt = initialRent * securityDepositMonths;
    const totalRenterUpfront = securityDepositAmt;

    // Upfront surplus invested by renter on Day 1
    const initialInvestedSurplus = Math.max(0, totalBuyerUpfront - totalRenterUpfront);

    // Monthly Loan EMI
    const monthlyRate = loanRateAnnual / 12;
    const totalLoanMonths = loanTenureYears * 12;
    let monthlyEmi = 0;
    if (loanPrincipal > 0 && monthlyRate > 0) {
      monthlyEmi = (loanPrincipal * monthlyRate * Math.pow(1 + monthlyRate, totalLoanMonths)) /
        (Math.pow(1 + monthlyRate, totalLoanMonths) - 1);
    }
    monthlyEmiBadge.textContent = `EMI: ${formatINR(monthlyEmi)}/mo`;

    // Price-to-Rent Ratio
    const annualRentYear1 = initialRent * 12;
    const ptrRatio = annualRentYear1 > 0 ? (price / annualRentYear1) : 0;
    ptrRatioText.textContent = `Price-to-Rent Ratio: ${ptrRatio.toFixed(1)} (${((annualRentYear1 / price) * 100).toFixed(2)}% Rental Yield)`;
    if (ptrRatio > 25) {
      ptrBadge.textContent = `🟡 Ratio > 25 (${ptrRatio.toFixed(1)}): Strongly Favors Renting in India`;
      ptrBadge.style.background = 'rgba(234, 179, 8, 0.15)';
      ptrBadge.style.color = '#854d0e';
    } else if (ptrRatio < 15) {
      ptrBadge.textContent = `🟢 Ratio < 15 (${ptrRatio.toFixed(1)}): Highly Attractive for Buying`;
      ptrBadge.style.background = 'rgba(16, 185, 129, 0.15)';
      ptrBadge.style.color = '#065f46';
    } else {
      ptrBadge.textContent = `🔵 Ratio 15 - 25 (${ptrRatio.toFixed(1)}): Balanced / Location Dependent`;
      ptrBadge.style.background = 'rgba(37, 99, 235, 0.15)';
      ptrBadge.style.color = '#1e40af';
    }

    // Monthly Compounding & 30-Year Simulation
    const monthlyInvRate = Math.pow(1 + investmentReturnAnnual, 1 / 12) - 1;
    let outstandingLoan = loanPrincipal;

    let renterPortfolio = initialInvestedSurplus;
    let cumulativeBuyerOutflow = totalBuyerUpfront;
    let cumulativeRenterOutflow = totalRenterUpfront;

    const yearlyData = [];
    let breakEvenYear = null;

    let yr1MonthlyBuyOutflow = 0;
    let yr1MonthlyRentOutflow = 0;
    let midMonthlyBuyOutflow = 0;
    let midMonthlyRentOutflow = 0;

    for (let yr = 1; yr <= 30; yr++) {
      const yearRent = initialRent * Math.pow(1 + rentEscalation, yr - 1);
      const yearBuyerMaint = buyerMonthlyMaint0 * Math.pow(1 + inflationRate, yr - 1);
      const yearRenterMaint = renterMonthlyMaint0 * Math.pow(1 + inflationRate, yr - 1);
      const yearPropertyTax = propertyTax0 * Math.pow(1 + inflationRate, yr - 1);
      const yearShiftingCost = shiftingCost0 * Math.pow(1 + inflationRate, yr - 1);

      let yearPrincipalPaid = 0;
      let yearInterestPaid = 0;

      // 12 months simulation within current year
      for (let m = 1; m <= 12; m++) {
        const monthIndex = (yr - 1) * 12 + m;
        let emiPayment = 0;
        let interestPayment = 0;
        let principalPayment = 0;

        if (outstandingLoan > 0 && monthIndex <= totalLoanMonths) {
          interestPayment = outstandingLoan * monthlyRate;
          principalPayment = Math.min(outstandingLoan, monthlyEmi - interestPayment);
          emiPayment = interestPayment + principalPayment;
          outstandingLoan = Math.max(0, outstandingLoan - principalPayment);

          yearPrincipalPaid += principalPayment;
          yearInterestPaid += interestPayment;
        }

        // Tax benefit deduction
        let monthlyTaxSavings = 0;
        if (taxRegime === 'old_30') {
          const intDedMonth = Math.min(200000 / 12, interestPayment);
          const prinDedMonth = Math.min(150000 / 12, principalPayment);
          monthlyTaxSavings = (intDedMonth + prinDedMonth) * 0.312; // 30% + 4% cess
        } else if (taxRegime === 'old_20') {
          const intDedMonth = Math.min(200000 / 12, interestPayment);
          const prinDedMonth = Math.min(150000 / 12, principalPayment);
          monthlyTaxSavings = (intDedMonth + prinDedMonth) * 0.208;
        }

        const buyerMonthlyOutflow = emiPayment + yearBuyerMaint + (yearPropertyTax / 12) - monthlyTaxSavings;
        cumulativeBuyerOutflow += buyerMonthlyOutflow;

        // Renter monthly expenses
        let movingCostThisMonth = 0;
        if (shiftingFrequency > 0 && monthIndex % (shiftingFrequency * 12) === 0) {
          movingCostThisMonth = yearShiftingCost + (agentFeeMonths * yearRent);
        }

        const renterMonthlyOutflow = yearRent + yearRenterMaint + movingCostThisMonth;
        cumulativeRenterOutflow += renterMonthlyOutflow;

        // Record Year 1 and Mid-Year sample monthly outflows
        if (yr === 1 && m === 1) {
          yr1MonthlyBuyOutflow = buyerMonthlyOutflow;
          yr1MonthlyRentOutflow = renterMonthlyOutflow;
        }
        if (yr === horizonYears && m === 1) {
          midMonthlyBuyOutflow = buyerMonthlyOutflow;
          midMonthlyRentOutflow = renterMonthlyOutflow;
        }

        // Monthly cash flow surplus/deficit invested by renter
        const monthlyDiff = buyerMonthlyOutflow - renterMonthlyOutflow;
        renterPortfolio = (renterPortfolio * (1 + monthlyInvRate)) + monthlyDiff;
      }

      // Year End Metrics
      const propertyValue = price * Math.pow(1 + propertyAppreciation, yr);
      const sellingCost = propertyValue * 0.015; // 1.5% brokerage/legal on sale
      const buyerNetWorth = propertyValue - outstandingLoan - sellingCost;

      // Renter net worth = portfolio + refunded security deposit
      const renterNetWorth = renterPortfolio + securityDepositAmt;

      const diff = buyerNetWorth - renterNetWorth;
      const winner = diff >= 0 ? 'Buy' : 'Rent';

      if (breakEvenYear === null && diff >= 0) {
        breakEvenYear = yr;
      }

      yearlyData.push({
        year: yr,
        propertyValue: propertyValue,
        loanBalance: outstandingLoan,
        buyerNetWorth: buyerNetWorth,
        monthlyRent: yearRent,
        renterNetWorth: renterNetWorth,
        renterPortfolio: renterPortfolio,
        cumulativeBuyerOutflow: cumulativeBuyerOutflow,
        cumulativeRenterOutflow: cumulativeRenterOutflow,
        diff: diff,
        winner: winner
      });
    }

    cachedYearlyData = yearlyData;

    // --- POPULATE SELECTED HORIZON KPI VALUES ---
    const horizonData = yearlyData[horizonYears - 1] || yearlyData[yearlyData.length - 1];

    buyerAtYearLabel.textContent = `At Year ${horizonYears}`;
    renterAtYearLabel.textContent = `At Year ${horizonYears}`;

    kpiBuyerNetWorth.textContent = formatLakhCrore(horizonData.buyerNetWorth);
    kpiPropertyVal.textContent = formatLakhCrore(horizonData.propertyValue);
    kpiLoanRemaining.textContent = formatLakhCrore(horizonData.loanBalance);
    kpiSellingCost.textContent = formatLakhCrore(horizonData.propertyValue * 0.015);

    kpiRenterNetWorth.textContent = formatLakhCrore(horizonData.renterNetWorth);
    // Estimate lump sum growth portion vs SIP portion
    const lumpSumAtHorizon = initialInvestedSurplus * Math.pow(1 + investmentReturnAnnual, horizonYears);
    kpiLumpSumGrowth.textContent = formatLakhCrore(lumpSumAtHorizon);
    kpiSipGrowth.textContent = formatLakhCrore(Math.max(0, horizonData.renterPortfolio - lumpSumAtHorizon));
    kpiRefundedDeposit.textContent = formatLakhCrore(securityDepositAmt);

    kpiTotalBuyerOutflow.textContent = formatLakhCrore(horizonData.cumulativeBuyerOutflow);
    kpiTotalRenterOutflow.textContent = formatLakhCrore(horizonData.cumulativeRenterOutflow);
    const outflowDiff = horizonData.cumulativeBuyerOutflow - horizonData.cumulativeRenterOutflow;
    if (outflowDiff >= 0) {
      kpiOutflowDifference.textContent = `${formatLakhCrore(outflowDiff)} Less`;
      kpiOutflowDifference.style.color = '#059669';
    } else {
      kpiOutflowDifference.textContent = `${formatLakhCrore(Math.abs(outflowDiff))} More`;
      kpiOutflowDifference.style.color = '#dc2626';
    }

    kpiYr1Buy.textContent = formatINR(yr1MonthlyBuyOutflow);
    kpiYr1Rent.textContent = formatINR(yr1MonthlyRentOutflow);
    kpiMidYearLabel.textContent = `Year ${horizonYears} Buy vs Rent:`;
    kpiMidBuy.textContent = formatINR(midMonthlyBuyOutflow);
    kpiMidRent.textContent = formatINR(midMonthlyRentOutflow);

    // --- WINNER BANNER UPDATE ---
    const isBuyerWin = horizonData.diff >= 0;
    const diffAbs = Math.abs(horizonData.diff);

    if (isBuyerWin) {
      winnerCallout.className = 'winner-callout-card winner-buy';
      winnerIcon.textContent = '🏠';
      winnerHeadline.textContent = `At Year ${horizonYears}: Buying Wins by ${formatLakhCrore(diffAbs)}!`;
      winnerSubtext.textContent = `Home appreciation and loan pay-down create higher net equity (${formatLakhCrore(horizonData.buyerNetWorth)}) than the renting investment portfolio (${formatLakhCrore(horizonData.renterNetWorth)}).`;
    } else {
      winnerCallout.className = 'winner-callout-card winner-rent';
      winnerIcon.textContent = '📈';
      winnerHeadline.textContent = `At Year ${horizonYears}: Renting & Investing Wins by ${formatLakhCrore(diffAbs)}!`;
      winnerSubtext.textContent = `Investing the down payment difference and monthly savings in equity compounding (${formatLakhCrore(horizonData.renterNetWorth)}) exceeds home equity (${formatLakhCrore(horizonData.buyerNetWorth)}).`;
    }

    if (breakEvenYear) {
      breakEvenPill.textContent = `Break-Even: Year ${breakEvenYear}`;
      breakEvenPill.style.display = 'inline-block';
    } else {
      breakEvenPill.textContent = `Renting Beats Buying across all 30 Years`;
      breakEvenPill.style.display = 'inline-block';
    }

    // --- UPDATE CHARTS ---
    updateCharts(yearlyData, horizonYears);

    // --- POPULATE TABLE ---
    updateTable(yearlyData, horizonYears);
  }

  // --- CHARTS ENGINE ---
  function updateCharts(yearlyData, horizonYears) {
    const labels = yearlyData.map(d => `Yr ${d.year}`);
    const buyerNW = yearlyData.map(d => Math.round(d.buyerNetWorth));
    const renterNW = yearlyData.map(d => Math.round(d.renterNetWorth));
    const buyerOutflow = yearlyData.map(d => Math.round(d.cumulativeBuyerOutflow));
    const renterOutflow = yearlyData.map(d => Math.round(d.cumulativeRenterOutflow));

    // Chart 1: Net Worth Trajectory
    const ctxNW = document.getElementById('netWorthChart');
    if (ctxNW) {
      if (netWorthChartInstance) {
        netWorthChartInstance.destroy();
      }
      netWorthChartInstance = new Chart(ctxNW, {
        type: 'line',
        data: {
          labels: labels,
          datasets: [
            {
              label: 'Buyer Net Worth (Home Equity)',
              data: buyerNW,
              borderColor: '#2563eb',
              backgroundColor: 'rgba(37, 99, 235, 0.1)',
              borderWidth: 3,
              tension: 0.3,
              fill: false,
              pointRadius: 2,
              pointHoverRadius: 6
            },
            {
              label: 'Renter Net Worth (Invested Portfolio)',
              data: renterNW,
              borderColor: '#10b981',
              backgroundColor: 'rgba(16, 185, 129, 0.1)',
              borderWidth: 3,
              tension: 0.3,
              fill: false,
              pointRadius: 2,
              pointHoverRadius: 6
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
                label: function (ctx) {
                  return `${ctx.dataset.label}: ${formatLakhCrore(ctx.raw)}`;
                }
              }
            },
            legend: {
              position: 'top',
              labels: { font: { family: 'Inter', weight: 600 } }
            }
          },
          scales: {
            y: {
              ticks: {
                callback: function (value) {
                  return formatLakhCrore(value);
                }
              }
            }
          }
        }
      });
    }

    // Chart 2: Cumulative Cash Outflow
    const ctxOutflow = document.getElementById('cashOutflowChart');
    if (ctxOutflow) {
      if (cashOutflowChartInstance) {
        cashOutflowChartInstance.destroy();
      }
      cashOutflowChartInstance = new Chart(ctxOutflow, {
        type: 'line',
        data: {
          labels: labels,
          datasets: [
            {
              label: 'Cumulative Buying Outflow',
              data: buyerOutflow,
              borderColor: '#3b82f6',
              borderDash: [5, 5],
              borderWidth: 2,
              fill: false,
              pointRadius: 1
            },
            {
              label: 'Cumulative Renting Outflow',
              data: renterOutflow,
              borderColor: '#059669',
              borderDash: [5, 5],
              borderWidth: 2,
              fill: false,
              pointRadius: 1
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
                label: function (ctx) {
                  return `${ctx.dataset.label}: ${formatLakhCrore(ctx.raw)}`;
                }
              }
            },
            legend: { position: 'top' }
          },
          scales: {
            y: {
              ticks: {
                callback: function (value) {
                  return formatLakhCrore(value);
                }
              }
            }
          }
        }
      });
    }
  }

  // --- TABLE ENGINE ---
  function updateTable(yearlyData, currentHorizon) {
    if (!comparisonTableBody) return;
    let html = '';

    yearlyData.forEach(d => {
      const isSelected = d.year === currentHorizon;
      const rowStyle = isSelected ? 'background: rgba(37, 99, 235, 0.08); font-weight: 700;' : '';
      const winnerBadge = d.winner === 'Buy'
        ? '<span style="color:#1d4ed8; background:#dbeafe; padding:2px 8px; border-radius:10px; font-size:0.75rem;">🏠 Buy</span>'
        : '<span style="color:#047857; background:#d1fae5; padding:2px 8px; border-radius:10px; font-size:0.75rem;">📈 Rent</span>';

      html += `
        <tr style="${rowStyle} border-bottom: 1px solid var(--border-color, #f1f5f9);">
          <td style="padding:0.6rem; text-align:center;">Yr ${d.year}</td>
          <td style="padding:0.6rem;">${formatLakhCrore(d.propertyValue)}</td>
          <td style="padding:0.6rem;">${d.loanBalance > 0 ? formatLakhCrore(d.loanBalance) : '₹ 0 (Paid Off)'}</td>
          <td style="padding:0.6rem; color:#2563eb;">${formatLakhCrore(d.buyerNetWorth)}</td>
          <td style="padding:0.6rem;">${formatINR(d.monthlyRent)}/mo</td>
          <td style="padding:0.6rem; color:#10b981;">${formatLakhCrore(d.renterNetWorth)}</td>
          <td style="padding:0.6rem; text-align:center;">${winnerBadge}</td>
        </tr>
      `;
    });

    comparisonTableBody.innerHTML = html;
  }

  // --- CSV EXPORT & COPY ---
  if (exportScheduleBtn) {
    exportScheduleBtn.addEventListener('click', () => {
      if (!cachedYearlyData.length) return;
      let csv = 'Year,Property Value,Loan Balance,Buyer Net Worth,Monthly Rent,Renter Portfolio,Winner\n';
      cachedYearlyData.forEach(d => {
        csv += `${d.year},${Math.round(d.propertyValue)},${Math.round(d.loanBalance)},${Math.round(d.buyerNetWorth)},${Math.round(d.monthlyRent)},${Math.round(d.renterNetWorth)},${d.winner}\n`;
      });
      if (window.ToolsKart && window.ToolsKart.downloadFile) {
        window.ToolsKart.downloadFile(csv, 'Buy_vs_Rent_30Year_Comparison.csv', 'text/csv');
      }
    });
  }

  if (copyScheduleBtn) {
    copyScheduleBtn.addEventListener('click', () => {
      const table = document.getElementById('comparisonTable');
      if (!table) return;
      let text = '';
      for (let r of table.rows) {
        let rowText = [];
        for (let c of r.cells) {
          rowText.push(c.innerText.trim());
        }
        text += rowText.join('\t') + '\n';
      }
      navigator.clipboard.writeText(text).then(() => {
        const orig = copyScheduleBtn.textContent;
        copyScheduleBtn.textContent = '✅ Copied!';
        setTimeout(() => copyScheduleBtn.textContent = orig, 2000);
      });
    });
  }

  // Initial Calculation
  recalculateAll();

})();
