/* =========================================================
   ToolsKart — Comprehensive Income Tax Calculator (FY 2025-26)
   - Old vs New Regime Side-by-Side Comparison
   - Full Old Regime Deductions Suite (80C, NPS, 80D, HRA, Sec 24b, 80EEA, 80TTA)
   - Interactive HRA Exemption Calculator
   - Section 87A Rebate, Surcharge & 4% Health & Education Cess
   - Smart Break-Even Deduction Analyzer
   - Real-time 60fps calculation on any slider / input change
   ========================================================= */

(function () {
  'use strict';

  // --- DOM Elements: Income & Demographics ---
  const grossSalaryInput = document.getElementById('grossSalary');
  const grossSalarySlider = document.getElementById('grossSalarySlider');
  const grossIncomeWords = document.getElementById('grossIncomeWords');
  const taxAgeGroup = document.getElementById('taxAgeGroup');

  // Deductions Elements
  const btnMaxDeductions = document.getElementById('btnMaxDeductions');
  const btnClearDeductions = document.getElementById('btnClearDeductions');
  const totalDeductionsDisplay = document.getElementById('totalDeductionsDisplay');

  const deduction80C = document.getElementById('deduction80C');
  const deduction80CSlider = document.getElementById('deduction80CSlider');
  const deductionNPS = document.getElementById('deductionNPS');
  const deductionNPSSlider = document.getElementById('deductionNPSSlider');

  const deduction80DSelf = document.getElementById('deduction80DSelf');
  const deduction80DParents = document.getElementById('deduction80DParents');

  const homeLoanInterest = document.getElementById('homeLoanInterest');
  const deduction80EEA = document.getElementById('deduction80EEA');

  // HRA Calculator Elements
  const enableHraCalculator = document.getElementById('enableHraCalculator');
  const hraInputsContainer = document.getElementById('hraInputsContainer');
  const hraExemptBadge = document.getElementById('hraExemptBadge');
  const hraBasicSalary = document.getElementById('hraBasicSalary');
  const hraReceived = document.getElementById('hraReceived');
  const hraRentPaid = document.getElementById('hraRentPaid');
  const hraCityType = document.getElementById('hraCityType');

  // Other Deductions
  const deduction80E = document.getElementById('deduction80E');
  const deduction80G = document.getElementById('deduction80G');
  const deduction80TTA = document.getElementById('deduction80TTA');
  const professionalTax = document.getElementById('professionalTax');

  // Results & Comparison Elements
  const verdictMainTitle = document.getElementById('verdictMainTitle');
  const verdictTaxSavings = document.getElementById('verdictTaxSavings');
  const verdictSubText = document.getElementById('verdictSubText');
  const verdictTrophy = document.getElementById('verdictTrophy');

  const cardOldRegime = document.getElementById('cardOldRegime');
  const cardNewRegime = document.getElementById('cardNewRegime');
  const winnerBadgeOld = document.getElementById('winnerBadgeOld');
  const winnerBadgeNew = document.getElementById('winnerBadgeNew');

  // Old Regime Breakdown
  const oldTotalTaxDisplay = document.getElementById('oldTotalTaxDisplay');
  const oldEffectiveRateDisplay = document.getElementById('oldEffectiveRateDisplay');
  const oldGrossDisplay = document.getElementById('oldGrossDisplay');
  const oldOtherDeductionsDisplay = document.getElementById('oldOtherDeductionsDisplay');
  const oldTaxableDisplay = document.getElementById('oldTaxableDisplay');
  const oldSlabTaxDisplay = document.getElementById('oldSlabTaxDisplay');
  const oldRebateDisplay = document.getElementById('oldRebateDisplay');
  const oldCessDisplay = document.getElementById('oldCessDisplay');
  const oldMonthlyTakeHome = document.getElementById('oldMonthlyTakeHome');

  // New Regime Breakdown
  const newTotalTaxDisplay = document.getElementById('newTotalTaxDisplay');
  const newEffectiveRateDisplay = document.getElementById('newEffectiveRateDisplay');
  const newGrossDisplay = document.getElementById('newGrossDisplay');
  const newTaxableDisplay = document.getElementById('newTaxableDisplay');
  const newSlabTaxDisplay = document.getElementById('newSlabTaxDisplay');
  const newRebateDisplay = document.getElementById('newRebateDisplay');
  const newCessDisplay = document.getElementById('newCessDisplay');
  const newMonthlyTakeHome = document.getElementById('newMonthlyTakeHome');

  // Break-Even Analyzer
  const breakEvenTargetPill = document.getElementById('breakEvenTargetPill');
  const currentDeductionsLabel = document.getElementById('currentDeductionsLabel');
  const targetDeductionsLabel = document.getElementById('targetDeductionsLabel');
  const breakevenFill = document.getElementById('breakevenFill');
  const breakevenAdviceText = document.getElementById('breakevenAdviceText');

  let calculationRafId = null;

  // Initialize
  initSyncSliders();
  initQuickChips();
  initEventListeners();
  updateWordDisplays();
  triggerLiveCalculation();

  // --- 1. Dual-Sync Sliders ---
  function initSyncSliders() {
    bindPair(grossSalaryInput, grossSalarySlider, () => {
      updateWordDisplays();
      triggerLiveCalculation();
      syncActiveChip('grossSalary', grossSalaryInput.value);
    });

    bindPair(deduction80C, deduction80CSlider, triggerLiveCalculation);
    bindPair(deductionNPS, deductionNPSSlider, triggerLiveCalculation);
  }

  function bindPair(numInput, sliderInput, onChange) {
    if (!numInput || !sliderInput) return;
    numInput.addEventListener('input', () => {
      const val = parseFloat(numInput.value);
      if (!isNaN(val)) sliderInput.value = val;
      if (onChange) onChange();
    });
    sliderInput.addEventListener('input', () => {
      numInput.value = sliderInput.value;
      if (onChange) onChange();
    });
  }

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

  // --- 2. Event Listeners ---
  function initEventListeners() {
    if (taxAgeGroup) taxAgeGroup.addEventListener('change', triggerLiveCalculation);

    const inputs = [
      deduction80DSelf, deduction80DParents, homeLoanInterest,
      deduction80EEA, deduction80E, deduction80G, deduction80TTA, professionalTax,
      hraBasicSalary, hraReceived, hraRentPaid, hraCityType
    ];

    inputs.forEach(input => {
      if (input) input.addEventListener('input', triggerLiveCalculation);
    });

    if (enableHraCalculator) {
      enableHraCalculator.addEventListener('change', function () {
        hraInputsContainer.style.display = this.checked ? 'block' : 'none';
        hraExemptBadge.style.display = this.checked ? 'inline-block' : 'none';
        triggerLiveCalculation();
      });
    }

    if (btnMaxDeductions) {
      btnMaxDeductions.addEventListener('click', handleMaxDeductions);
    }

    if (btnClearDeductions) {
      btnClearDeductions.addEventListener('click', handleClearDeductions);
    }
  }

  function handleMaxDeductions() {
    deduction80C.value = 150000;
    if (deduction80CSlider) deduction80CSlider.value = 150000;
    deductionNPS.value = 50000;
    if (deductionNPSSlider) deductionNPSSlider.value = 50000;
    deduction80DSelf.value = 25000;
    deduction80DParents.value = 25000;
    homeLoanInterest.value = 200000;
    professionalTax.value = 2400;
    triggerLiveCalculation();
  }

  function handleClearDeductions() {
    deduction80C.value = 0;
    if (deduction80CSlider) deduction80CSlider.value = 0;
    deductionNPS.value = 0;
    if (deductionNPSSlider) deductionNPSSlider.value = 0;
    deduction80DSelf.value = 0;
    deduction80DParents.value = 0;
    homeLoanInterest.value = 0;
    deduction80EEA.value = 0;
    deduction80E.value = 0;
    deduction80G.value = 0;
    deduction80TTA.value = 0;
    professionalTax.value = 0;
    if (enableHraCalculator) {
      enableHraCalculator.checked = false;
      hraInputsContainer.style.display = 'none';
      hraExemptBadge.style.display = 'none';
    }
    triggerLiveCalculation();
  }

  // --- 3. Word Formatter ---
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
    const p = parseFloat(grossSalaryInput.value) || 0;
    if (grossIncomeWords) grossIncomeWords.textContent = formatLakhsCrores(p);
  }

  // --- 4. Core Calculations ---
  function triggerLiveCalculation() {
    if (calculationRafId) cancelAnimationFrame(calculationRafId);
    calculationRafId = requestAnimationFrame(calculateTaxAndRender);
  }

  function calculateHraExemption() {
    if (!enableHraCalculator || !enableHraCalculator.checked) return 0;
    const basic = parseFloat(hraBasicSalary.value) || 0;
    const received = parseFloat(hraReceived.value) || 0;
    const rent = parseFloat(hraRentPaid.value) || 0;
    const isMetro = hraCityType.value === 'metro';

    if (basic <= 0 || rent <= 0 || received <= 0) return 0;

    const condition1 = received;
    const condition2 = Math.max(0, rent - 0.10 * basic);
    const condition3 = (isMetro ? 0.50 : 0.40) * basic;

    const exempt = Math.max(0, Math.min(condition1, condition2, condition3));
    if (hraExemptBadge) hraExemptBadge.textContent = `Exempt HRA: ₹ ${Math.round(exempt).toLocaleString('en-IN')}`;
    return exempt;
  }

  function calculateTaxAndRender() {
    const grossIncome = parseFloat(grossSalaryInput.value) || 0;
    if (grossIncome <= 0) return;

    const age = taxAgeGroup ? taxAgeGroup.value : 'regular';

    // Calculate Old Regime Deductions
    const c80C = Math.min(150000, Math.max(0, parseFloat(deduction80C.value) || 0));
    const nps = Math.min(50000, Math.max(0, parseFloat(deductionNPS.value) || 0));
    const dSelf = Math.min(50000, Math.max(0, parseFloat(deduction80DSelf.value) || 0));
    const dParents = Math.min(50000, Math.max(0, parseFloat(deduction80DParents.value) || 0));
    const homeLoan = Math.min(200000, Math.max(0, parseFloat(homeLoanInterest.value) || 0));
    const eea = Math.min(150000, Math.max(0, parseFloat(deduction80EEA.value) || 0));
    const eduLoan = Math.max(0, parseFloat(deduction80E.value) || 0);
    const donations = Math.max(0, parseFloat(deduction80G.value) || 0);
    const savingsInterest = Math.min(age === 'regular' ? 10000 : 50000, Math.max(0, parseFloat(deduction80TTA.value) || 0));
    const profTax = Math.min(2500, Math.max(0, parseFloat(professionalTax.value) || 0));
    const exemptHra = calculateHraExemption();

    const otherDeductions = c80C + nps + dSelf + dParents + homeLoan + eea + eduLoan + donations + savingsInterest + profTax + exemptHra;
    const oldStdDeduction = 50000;
    const totalOldDeductions = oldStdDeduction + otherDeductions;

    if (totalDeductionsDisplay) {
      totalDeductionsDisplay.textContent = `₹ ${Math.round(totalOldDeductions).toLocaleString('en-IN')}`;
    }

    // 1. Old Regime Calculation
    const oldTaxable = Math.max(0, grossIncome - totalOldDeductions);
    const oldResult = computeOldRegimeTax(oldTaxable, age, grossIncome);

    // 2. New Regime Calculation (FY 2025-26)
    const newStdDeduction = 75000;
    const newTaxable = Math.max(0, grossIncome - newStdDeduction);
    const newResult = computeNewRegimeTax(newTaxable, grossIncome);

    // 3. Break-Even Deduction Calculation
    const breakEvenThreshold = computeBreakEvenDeductions(grossIncome, age, newResult.totalTax);

    // Render Displays
    renderResultsUI({
      grossIncome,
      oldStdDeduction,
      otherDeductions,
      oldTaxable,
      oldResult,
      newStdDeduction,
      newTaxable,
      newResult,
      totalOldDeductions,
      breakEvenThreshold
    });
  }

  // --- 5. Tax Computation Algorithms ---
  function computeOldRegimeTax(taxableIncome, age, grossIncome) {
    let basicLimit = 250000;
    if (age === 'senior') basicLimit = 300000;
    if (age === 'superSenior') basicLimit = 500000;

    let slabTax = 0;
    if (taxableIncome > 1000000) {
      slabTax += (taxableIncome - 1000000) * 0.30;
      slabTax += 500000 * 0.20;
      slabTax += Math.max(0, 500000 - basicLimit) * 0.05;
    } else if (taxableIncome > 500000) {
      slabTax += (taxableIncome - 500000) * 0.20;
      slabTax += Math.max(0, 500000 - basicLimit) * 0.05;
    } else if (taxableIncome > basicLimit) {
      slabTax += (taxableIncome - basicLimit) * 0.05;
    }

    // Section 87A Rebate: if taxable <= ₹5,00,000 -> full rebate up to ₹12,500
    let rebate87A = 0;
    if (taxableIncome <= 500000 && age !== 'superSenior') {
      rebate87A = Math.min(slabTax, 12500);
    }
    let taxAfterRebate = Math.max(0, slabTax - rebate87A);

    // Surcharge
    let surchargeRate = 0;
    if (grossIncome > 50000000) surchargeRate = 0.37;
    else if (grossIncome > 20000000) surchargeRate = 0.25;
    else if (grossIncome > 10000000) surchargeRate = 0.15;
    else if (grossIncome > 5000000) surchargeRate = 0.10;

    let surcharge = taxAfterRebate * surchargeRate;
    let cess = (taxAfterRebate + surcharge) * 0.04;
    let totalTax = Math.round(taxAfterRebate + surcharge + cess);

    return {
      slabTax: Math.round(slabTax),
      rebate87A: Math.round(rebate87A),
      cess: Math.round(cess),
      totalTax: totalTax,
      takeHome: Math.max(0, grossIncome - totalTax),
      monthlyTakeHome: Math.round(Math.max(0, grossIncome - totalTax) / 12)
    };
  }

  function computeNewRegimeTax(taxableIncome, grossIncome) {
    // Slabs FY 2025-26
    // 0 - 3L: Nil
    // 3L - 7L: 5% (4,00,000 * 5% = 20,000)
    // 7L - 10L: 10% (3,00,000 * 10% = 30,000)
    // 10L - 12L: 15% (2,00,000 * 15% = 30,000)
    // 12L - 15L: 20% (3,00,000 * 20% = 60,000)
    // Above 15L: 30%

    let slabTax = 0;
    if (taxableIncome > 1500000) {
      slabTax += (taxableIncome - 1500000) * 0.30;
      slabTax += 60000; // 12L to 15L
      slabTax += 30000; // 10L to 12L
      slabTax += 30000; // 7L to 10L
      slabTax += 20000; // 3L to 7L
    } else if (taxableIncome > 1200000) {
      slabTax += (taxableIncome - 1200000) * 0.20;
      slabTax += 30000;
      slabTax += 30000;
      slabTax += 20000;
    } else if (taxableIncome > 1000000) {
      slabTax += (taxableIncome - 1000000) * 0.15;
      slabTax += 30000;
      slabTax += 20000;
    } else if (taxableIncome > 700000) {
      slabTax += (taxableIncome - 700000) * 0.10;
      slabTax += 20000;
    } else if (taxableIncome > 300000) {
      slabTax += (taxableIncome - 300000) * 0.05;
    }

    // Section 87A Rebate: if taxable <= ₹7,00,000 -> full rebate up to ₹25,000
    let rebate87A = 0;
    if (taxableIncome <= 700000) {
      rebate87A = Math.min(slabTax, 25000);
    }
    let taxAfterRebate = Math.max(0, slabTax - rebate87A);

    // New regime surcharge (capped at 25%)
    let surchargeRate = 0;
    if (grossIncome > 20000000) surchargeRate = 0.25;
    else if (grossIncome > 10000000) surchargeRate = 0.15;
    else if (grossIncome > 5000000) surchargeRate = 0.10;

    let surcharge = taxAfterRebate * surchargeRate;
    let cess = (taxAfterRebate + surcharge) * 0.04;
    let totalTax = Math.round(taxAfterRebate + surcharge + cess);

    return {
      slabTax: Math.round(slabTax),
      rebate87A: Math.round(rebate87A),
      cess: Math.round(cess),
      totalTax: totalTax,
      takeHome: Math.max(0, grossIncome - totalTax),
      monthlyTakeHome: Math.round(Math.max(0, grossIncome - totalTax) / 12)
    };
  }

  // --- 6. Break-Even Deduction Solver ---
  function computeBreakEvenDeductions(grossIncome, age, targetNewTax) {
    if (targetNewTax <= 0) {
      // If new tax is 0 (income <= 7.75L), Old regime needs taxable <= 5L to be 0 tax
      return Math.max(50000, grossIncome - 500000);
    }

    // Binary search for deduction in [50000, grossIncome]
    let low = 50000;
    let high = grossIncome;
    let breakEven = low;

    for (let i = 0; i < 30; i++) {
      let mid = (low + high) / 2;
      let taxable = Math.max(0, grossIncome - mid);
      let taxOld = computeOldRegimeTax(taxable, age, grossIncome).totalTax;

      if (taxOld <= targetNewTax) {
        breakEven = mid;
        high = mid; // Try smaller deduction
      } else {
        low = mid; // Need more deductions
      }
    }

    return Math.round(breakEven);
  }

  // --- 7. Render UI ---
  function renderResultsUI(data) {
    const fmt = v => '₹ ' + Math.round(v).toLocaleString('en-IN');
    const oldTax = data.oldResult.totalTax;
    const newTax = data.newResult.totalTax;
    const diff = Math.abs(oldTax - newTax);

    // 1. Verdict Banner & Winner Badges
    if (newTax < oldTax) {
      // New Regime wins
      cardNewRegime.classList.add('is-recommended');
      cardOldRegime.classList.remove('is-recommended');
      winnerBadgeNew.style.display = 'inline-block';
      winnerBadgeOld.style.display = 'none';

      verdictTrophy.textContent = '⚡';
      verdictMainTitle.innerHTML = `New Tax Regime Saves You <span class="text-highlight-green">${fmt(diff)}</span> in Taxes!`;
      verdictSubText.innerHTML = `
        With your current deductions of <strong>${fmt(data.totalOldDeductions)}</strong>, the New Regime offers lower tax rates and an extra <strong>${fmt(Math.round(diff / 12))}/month</strong> in take-home pay.
      `;
    } else if (oldTax < newTax) {
      // Old Regime wins
      cardOldRegime.classList.add('is-recommended');
      cardNewRegime.classList.remove('is-recommended');
      winnerBadgeOld.style.display = 'inline-block';
      winnerBadgeNew.style.display = 'none';

      verdictTrophy.textContent = '🛡️';
      verdictMainTitle.innerHTML = `Old Tax Regime Saves You <span class="text-highlight-green">${fmt(diff)}</span> in Taxes!`;
      verdictSubText.innerHTML = `
        Your deductions total <strong>${fmt(data.totalOldDeductions)}</strong>, which beats the break-even threshold! Sticking with the Old Regime gives you <strong>${fmt(diff)} more</strong> in your pocket.
      `;
    } else {
      // Tie
      cardNewRegime.classList.remove('is-recommended');
      cardOldRegime.classList.remove('is-recommended');
      winnerBadgeNew.style.display = 'none';
      winnerBadgeOld.style.display = 'none';
      verdictTrophy.textContent = '⚖️';
      verdictMainTitle.textContent = 'Both Tax Regimes Result in the Exact Same Tax!';
      verdictSubText.textContent = 'You are exactly at the break-even point. Either regime will result in identical take-home salary.';
    }

    // 2. Old Regime Card Rows
    oldTotalTaxDisplay.textContent = fmt(oldTax);
    oldEffectiveRateDisplay.textContent = `Effective Rate: ${data.grossIncome > 0 ? ((oldTax / data.grossIncome) * 100).toFixed(2) : 0}%`;
    oldGrossDisplay.textContent = fmt(data.grossIncome);
    oldOtherDeductionsDisplay.textContent = '- ' + fmt(data.otherDeductions);
    oldTaxableDisplay.textContent = fmt(data.oldTaxable);
    oldSlabTaxDisplay.textContent = fmt(data.oldResult.slabTax);
    oldRebateDisplay.textContent = data.oldResult.rebate87A > 0 ? '- ' + fmt(data.oldResult.rebate87A) : '₹ 0';
    oldCessDisplay.textContent = fmt(data.oldResult.cess);
    oldMonthlyTakeHome.textContent = `${fmt(data.oldResult.monthlyTakeHome)} / mo`;

    // 3. New Regime Card Rows
    newTotalTaxDisplay.textContent = fmt(newTax);
    newEffectiveRateDisplay.textContent = `Effective Rate: ${data.grossIncome > 0 ? ((newTax / data.grossIncome) * 100).toFixed(2) : 0}%`;
    newGrossDisplay.textContent = fmt(data.grossIncome);
    newTaxableDisplay.textContent = fmt(data.newTaxable);
    newSlabTaxDisplay.textContent = fmt(data.newResult.slabTax);
    newRebateDisplay.textContent = data.newResult.rebate87A > 0 ? '- ' + fmt(data.newResult.rebate87A) : '₹ 0';
    newCessDisplay.textContent = fmt(data.newResult.cess);
    newMonthlyTakeHome.textContent = `${fmt(data.newResult.monthlyTakeHome)} / mo`;

    // 4. Break-Even Analyzer UI
    const targetThreshold = data.breakEvenThreshold;
    const currentDed = data.totalOldDeductions;
    const pct = Math.min(100, Math.max(5, (currentDed / Math.max(1, targetThreshold)) * 100));

    if (breakEvenTargetPill) breakEvenTargetPill.textContent = `Break-even Target: ${fmt(targetThreshold)}`;
    if (currentDeductionsLabel) currentDeductionsLabel.textContent = fmt(currentDed);
    if (targetDeductionsLabel) targetDeductionsLabel.textContent = fmt(targetThreshold);
    if (breakevenFill) breakevenFill.style.width = `${pct}%`;

    if (breakevenAdviceText) {
      if (currentDed < targetThreshold) {
        const gap = targetThreshold - currentDed;
        breakevenAdviceText.innerHTML = `
          You need an additional <strong>${fmt(gap)}</strong> in deductions (via HRA, home loan interest, NPS, or 80D) before the Old Regime becomes better than the New Regime. <em>Until then, stick with the New Regime!</em>
        `;
      } else {
        const surplus = currentDed - targetThreshold;
        breakevenAdviceText.innerHTML = `
          Congratulations! Your total deductions exceed the break-even threshold by <strong>${fmt(surplus)}</strong>. Choosing the Old Regime will save you <strong>${fmt(diff)}</strong> in tax this year!
        `;
      }
    }
  }

})();
