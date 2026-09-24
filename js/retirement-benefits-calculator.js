/* =========================================================
   Amazing-Tools — Retirement Benefits, Gratuity & EPF Calculator
   Statutory Indian Formulas & EPF Compounding
   ========================================================= */

(function () {
  'use strict';

  const basicPayInput = document.getElementById('basicPay');
  const daPctInput = document.getElementById('daPct');
  const annualIncrementInput = document.getElementById('annualIncrement');
  const pastServiceYearsInput = document.getElementById('pastServiceYears');
  const remainingServiceYearsInput = document.getElementById('remainingServiceYears');

  const currentPfBalanceInput = document.getElementById('currentPfBalance');
  const vpfMonthlyInput = document.getElementById('vpfMonthly');
  const epfInterestRateInput = document.getElementById('epfInterestRate');

  const earnedLeaveDaysInput = document.getElementById('earnedLeaveDays');
  const gratuityCeilingInput = document.getElementById('gratuityCeiling');
  const epsWageOptionSelect = document.getElementById('epsWageOption');

  const kpiTotalLumpSum = document.getElementById('kpiTotalLumpSum');
  const kpiLumpSumBreakdown = document.getElementById('kpiLumpSumBreakdown');
  const kpiMonthlyPension = document.getElementById('kpiMonthlyPension');

  const kpiEpfCorpus = document.getElementById('kpiEpfCorpus');
  const kpiGratuity = document.getElementById('kpiGratuity');
  const kpiGratuityNote = document.getElementById('kpiGratuityNote');
  const kpiLeaveEncash = document.getElementById('kpiLeaveEncash');
  const kpiEpsPension = document.getElementById('kpiEpsPension');

  let benefitsChartInstance = null;

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

  function recalculate() {
    const basic0 = parseFloat(basicPayInput.value) || 75000;
    const daPct = (parseFloat(daPctInput.value) || 42) / 100;
    const incrementRate = (parseFloat(annualIncrementInput.value) || 5) / 100;
    const pastYears = parseInt(pastServiceYearsInput.value, 10) || 12;
    const remainingYears = parseInt(remainingServiceYearsInput.value, 10) || 18;
    const totalServiceYears = pastYears + remainingYears;

    let pfBalance = parseFloat(currentPfBalanceInput.value) || 1800000;
    const vpfMonthly0 = parseFloat(vpfMonthlyInput.value) || 5000;
    const epfRate = (parseFloat(epfInterestRateInput.value) || 8.25) / 100;

    const leaveDays = Math.min(300, parseInt(earnedLeaveDaysInput.value, 10) || 300);
    const gratuityCeiling = parseFloat(gratuityCeilingInput.value) || 2000000;
    const epsOption = epsWageOptionSelect.value;

    // Simulate EPF Growth over remaining service years
    let currentBasic = basic0;
    let totalEpfAccumulated = pfBalance;

    for (let y = 1; y <= remainingYears; y++) {
      const basicDaMonthly = currentBasic * (1 + daPct);

      // Employee 12% + Employer 3.67% + VPF
      const employeeShare = basicDaMonthly * 0.12;
      const employerShare = basicDaMonthly * 0.0367; // 3.67% goes to EPF, 8.33% goes to EPS
      const annualPfContribution = (employeeShare + employerShare + vpfMonthly0) * 12;

      // Interest credited on opening balance + half-year contribution approximation
      const yearInterest = (totalEpfAccumulated * epfRate) + (annualPfContribution * (epfRate / 2));
      totalEpfAccumulated = totalEpfAccumulated + annualPfContribution + yearInterest;

      // Annual increment
      currentBasic = currentBasic * (1 + incrementRate);
    }

    // Final basic + DA at retirement
    const finalBasicDa = currentBasic * (1 + daPct);

    // 1. Gratuity: (15 * (Last Basic + DA) * Years of Service) / 26
    const calculatedGratuity = (15 * finalBasicDa * totalServiceYears) / 26;
    const finalGratuity = Math.min(calculatedGratuity, gratuityCeiling);

    // 2. Leave Encashment: ((Last Basic + DA) / 30) * Leave Days
    const finalLeaveEncashment = (finalBasicDa / 30) * leaveDays;

    // 3. EPS-95 Pension: (Pensionable Salary * Service Years) / 70
    // If service > 20 years, 2 bonus years added per EPS rules
    const pensionableService = totalServiceYears > 20 ? (totalServiceYears + 2) : totalServiceYears;
    let pensionableSalary = 0;
    if (epsOption === 'actual') {
      pensionableSalary = finalBasicDa;
    } else {
      pensionableSalary = 15000; // Statutory cap
    }
    const monthlyPension = (pensionableSalary * pensionableService) / 70;

    // Total Lumpsum Windfall
    const totalLumpSum = totalEpfAccumulated + finalGratuity + finalLeaveEncashment;

    // Update UI
    kpiTotalLumpSum.textContent = formatLakhCrore(totalLumpSum);
    kpiLumpSumBreakdown.textContent = `EPF: ${formatLakhCrore(totalEpfAccumulated)} • Gratuity: ${formatLakhCrore(finalGratuity)} • Leave: ${formatLakhCrore(finalLeaveEncashment)}`;
    kpiMonthlyPension.textContent = `${formatINR(monthlyPension)} / mo`;

    kpiEpfCorpus.textContent = formatLakhCrore(totalEpfAccumulated);
    kpiGratuity.textContent = formatLakhCrore(finalGratuity);
    if (calculatedGratuity > gratuityCeiling) {
      kpiGratuityNote.textContent = `Formula gives ${formatLakhCrore(calculatedGratuity)}; capped at ${formatLakhCrore(gratuityCeiling)}`;
    } else {
      kpiGratuityNote.textContent = `15/26 formula: uncapped`;
    }

    kpiLeaveEncash.textContent = formatLakhCrore(finalLeaveEncashment);
    kpiEpsPension.textContent = `${formatINR(monthlyPension)} / mo`;

    renderChart(totalEpfAccumulated, finalGratuity, finalLeaveEncashment);
  }

  function renderChart(epf, gratuity, leave) {
    const ctx = document.getElementById('retBenefitsChart');
    if (!ctx) return;
    if (benefitsChartInstance) benefitsChartInstance.destroy();

    benefitsChartInstance = new Chart(ctx, {
      type: 'doughnut',
      data: {
        labels: ['EPF & VPF Corpus', 'Gratuity Payout', 'Leave Encashment'],
        datasets: [{
          data: [Math.round(epf), Math.round(gratuity), Math.round(leave)],
          backgroundColor: ['#2563eb', '#059669', '#d97706'],
          borderWidth: 2
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          tooltip: {
            callbacks: {
              label: (ctx) => `${ctx.label}: ${formatLakhCrore(ctx.raw)}`
            }
          },
          legend: { position: 'right' }
        }
      }
    });
  }

  const inputs = [
    basicPayInput, daPctInput, annualIncrementInput, pastServiceYearsInput,
    remainingServiceYearsInput, currentPfBalanceInput, vpfMonthlyInput,
    epfInterestRateInput, earnedLeaveDaysInput, gratuityCeilingInput,
    epsWageOptionSelect
  ];

  inputs.forEach(el => {
    el.addEventListener('input', recalculate);
    el.addEventListener('change', recalculate);
  });

  recalculate();

})();
