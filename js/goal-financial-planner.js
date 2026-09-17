/* =========================================================
   ToolsKart — Life Goal & Financial Freedom Planner
   Multi-Goal Inflation-Adjusted SIP Engine
   ========================================================= */

(function () {
  'use strict';

  // Global Return Input
  const globalReturnRateInput = document.getElementById('globalReturnRate');

  // Goal 1: Retirement Inputs
  const retCurrentAgeInput = document.getElementById('retCurrentAge');
  const retRetireAgeInput = document.getElementById('retRetireAge');
  const retLifeExpectancyInput = document.getElementById('retLifeExpectancy');
  const retCurrentExpenseInput = document.getElementById('retCurrentExpense');
  const retInflationInput = document.getElementById('retInflation');
  const retPostReturnInput = document.getElementById('retPostReturn');

  const retSipBadge = document.getElementById('retSipBadge');
  const retFutureExpense = document.getElementById('retFutureExpense');
  const retRequiredCorpus = document.getElementById('retRequiredCorpus');
  const retMonthlySipText = document.getElementById('retMonthlySipText');

  // Goal 2: Education Inputs
  const eduChildAgeInput = document.getElementById('eduChildAge');
  const eduCollegeAgeInput = document.getElementById('eduCollegeAge');
  const eduCurrentCostInput = document.getElementById('eduCurrentCost');
  const eduInflationInput = document.getElementById('eduInflation');

  const eduSipBadge = document.getElementById('eduSipBadge');
  const eduYearsToGoal = document.getElementById('eduYearsToGoal');
  const eduFutureCost = document.getElementById('eduFutureCost');
  const eduMonthlySipText = document.getElementById('eduMonthlySipText');

  // Goal 3: Marriage Inputs
  const marYearsToGoalInput = document.getElementById('marYearsToGoal');
  const marCurrentCostInput = document.getElementById('marCurrentCost');
  const marInflationInput = document.getElementById('marInflation');

  const marSipBadge = document.getElementById('marSipBadge');
  const marFutureCost = document.getElementById('marFutureCost');
  const marMonthlySipText = document.getElementById('marMonthlySipText');

  // Goal 4: Home Down Payment Inputs
  const homeYearsToGoalInput = document.getElementById('homeYearsToGoal');
  const homeCurrentCostInput = document.getElementById('homeCurrentCost');
  const homeInflationInput = document.getElementById('homeInflation');

  const homeSipBadge = document.getElementById('homeSipBadge');
  const homeFutureCost = document.getElementById('homeFutureCost');
  const homeMonthlySipText = document.getElementById('homeMonthlySipText');

  // Summary Elements
  const totalRequiredSipBadge = document.getElementById('totalRequiredSipBadge');
  const totalGoalsTargetBadge = document.getElementById('totalGoalsTargetBadge');
  const goalsTableBody = document.getElementById('goalsTableBody');
  const exportGoalsCsvBtn = document.getElementById('exportGoalsCsvBtn');

  // Chart instances
  let sipAllocationChart = null;
  let goalRoadmapChart = null;
  let cachedGoals = [];

  // Helpers
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

  function calculateSipForTarget(futureCorpus, years, annualReturn) {
    if (years <= 0 || futureCorpus <= 0) return 0;
    const months = years * 12;
    const monthlyRate = annualReturn / 12;
    if (monthlyRate === 0) return futureCorpus / months;
    const factor = Math.pow(1 + monthlyRate, months);
    return (futureCorpus * monthlyRate) / ((1 + monthlyRate) * (factor - 1));
  }

  function calculateAllGoals() {
    const globalReturn = (parseFloat(globalReturnRateInput.value) || 12) / 100;

    // 1. Retirement Calculation
    const curAge = parseInt(retCurrentAgeInput.value, 10) || 30;
    const retAge = parseInt(retRetireAgeInput.value, 10) || 58;
    const lifeAge = parseInt(retLifeExpectancyInput.value, 10) || 85;
    const monthlyExp = parseFloat(retCurrentExpenseInput.value) || 45000;
    const retInf = (parseFloat(retInflationInput.value) || 6) / 100;
    const retPostRet = (parseFloat(retPostReturnInput.value) || 8) / 100;

    const yearsToRetire = Math.max(1, retAge - curAge);
    const payoutYears = Math.max(1, lifeAge - retAge);

    // Future monthly and annual expense at retirement
    const futureMonthlyExp = monthlyExp * Math.pow(1 + retInf, yearsToRetire);
    const futureAnnualExp = futureMonthlyExp * 12;

    // Real rate of return in retirement
    const realRetRate = (1 + retPostRet) / (1 + retInf) - 1;
    let requiredCorpus = 0;
    if (Math.abs(realRetRate) < 0.0001) {
      requiredCorpus = futureAnnualExp * payoutYears;
    } else {
      requiredCorpus = futureAnnualExp * ((1 - Math.pow(1 + realRetRate, -payoutYears)) / realRetRate);
    }

    const retSip = calculateSipForTarget(requiredCorpus, yearsToRetire, globalReturn);

    retFutureExpense.textContent = `${formatLakhCrore(futureMonthlyExp)}/mo`;
    retRequiredCorpus.textContent = formatLakhCrore(requiredCorpus);
    retMonthlySipText.textContent = `${formatINR(retSip)}/mo`;
    retSipBadge.textContent = `SIP: ${formatINR(retSip)}/mo`;

    // 2. Education Calculation
    const childAge = parseInt(eduChildAgeInput.value, 10) || 4;
    const collegeAge = parseInt(eduCollegeAgeInput.value, 10) || 18;
    const eduCost0 = parseFloat(eduCurrentCostInput.value) || 2500000;
    const eduInf = (parseFloat(eduInflationInput.value) || 9) / 100;

    const yearsToEdu = Math.max(1, collegeAge - childAge);
    const futureEduCost = eduCost0 * Math.pow(1 + eduInf, yearsToEdu);
    const eduSip = calculateSipForTarget(futureEduCost, yearsToEdu, globalReturn);

    eduYearsToGoal.textContent = `${yearsToEdu} Years`;
    eduFutureCost.textContent = formatLakhCrore(futureEduCost);
    eduMonthlySipText.textContent = `${formatINR(eduSip)}/mo`;
    eduSipBadge.textContent = `SIP: ${formatINR(eduSip)}/mo`;

    // 3. Marriage Calculation
    const yearsToMar = Math.max(1, parseInt(marYearsToGoalInput.value, 10) || 18);
    const marCost0 = parseFloat(marCurrentCostInput.value) || 2000000;
    const marInf = (parseFloat(marInflationInput.value) || 7.5) / 100;

    const futureMarCost = marCost0 * Math.pow(1 + marInf, yearsToMar);
    const marSip = calculateSipForTarget(futureMarCost, yearsToMar, globalReturn);

    marFutureCost.textContent = formatLakhCrore(futureMarCost);
    marMonthlySipText.textContent = `${formatINR(marSip)}/mo`;
    marSipBadge.textContent = `SIP: ${formatINR(marSip)}/mo`;

    // 4. Home Down Payment Calculation
    const yearsToHome = Math.max(1, parseInt(homeYearsToGoalInput.value, 10) || 5);
    const homeCost0 = parseFloat(homeCurrentCostInput.value) || 1500000;
    const homeInf = (parseFloat(homeInflationInput.value) || 7) / 100;

    const futureHomeCost = homeCost0 * Math.pow(1 + homeInf, yearsToHome);
    const homeSip = calculateSipForTarget(futureHomeCost, yearsToHome, globalReturn);

    homeFutureCost.textContent = formatLakhCrore(futureHomeCost);
    homeMonthlySipText.textContent = `${formatINR(homeSip)}/mo`;
    homeSipBadge.textContent = `SIP: ${formatINR(homeSip)}/mo`;

    // --- CONSOLIDATED TOTALS ---
    const totalMonthlySip = retSip + eduSip + marSip + homeSip;
    const totalFutureCorpus = requiredCorpus + futureEduCost + futureMarCost + futureHomeCost;

    totalRequiredSipBadge.textContent = `${formatINR(totalMonthlySip)} / month`;
    totalGoalsTargetBadge.textContent = `To fund 4 life goals totaling ${formatLakhCrore(totalFutureCorpus)} in future value`;

    // Data for Table & Charts
    cachedGoals = [
      { name: '🌴 Retirement Corpus', years: yearsToRetire, currentCost: monthlyExp * 12, inflation: retInf * 100, futureTarget: requiredCorpus, sip: retSip, color: '#2563eb' },
      { name: '🎓 Child Higher Education', years: yearsToEdu, currentCost: eduCost0, inflation: eduInf * 100, futureTarget: futureEduCost, sip: eduSip, color: '#10b981' },
      { name: '💍 Marriage / Celebration', years: yearsToMar, currentCost: marCost0, inflation: marInf * 100, futureTarget: futureMarCost, sip: marSip, color: '#f59e0b' },
      { name: '🏠 Home Down Payment', years: yearsToHome, currentCost: homeCost0, inflation: homeInf * 100, futureTarget: futureHomeCost, sip: homeSip, color: '#8b5cf6' }
    ];

    updateGoalsTable(cachedGoals);
    updateCharts(cachedGoals, totalMonthlySip, globalReturn);
  }

  function updateGoalsTable(goals) {
    if (!goalsTableBody) return;
    let html = '';
    goals.forEach(g => {
      html += `
        <tr style="border-bottom: 1px solid var(--border-color, #f1f5f9);">
          <td style="padding:0.75rem; text-align:left; font-weight:600;">${g.name}</td>
          <td style="padding:0.75rem;">${g.years} Yrs</td>
          <td style="padding:0.75rem;">${formatLakhCrore(g.currentCost)}</td>
          <td style="padding:0.75rem;">${g.inflation.toFixed(1)}%</td>
          <td style="padding:0.75rem; font-weight:700;">${formatLakhCrore(g.futureTarget)}</td>
          <td style="padding:0.75rem; color:#2563eb; font-weight:700;">${formatINR(g.sip)}/mo</td>
        </tr>
      `;
    });
    goalsTableBody.innerHTML = html;
  }

  function updateCharts(goals, totalSip, globalReturn) {
    // 1. Donut Chart - SIP Allocation
    const ctxDonut = document.getElementById('sipAllocationChart');
    if (ctxDonut) {
      if (sipAllocationChart) sipAllocationChart.destroy();
      sipAllocationChart = new Chart(ctxDonut, {
        type: 'doughnut',
        data: {
          labels: goals.map(g => g.name),
          datasets: [{
            data: goals.map(g => Math.round(g.sip)),
            backgroundColor: goals.map(g => g.color),
            borderWidth: 2
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            tooltip: {
              callbacks: {
                label: function (ctx) {
                  const val = ctx.raw;
                  const pct = totalSip > 0 ? ((val / totalSip) * 100).toFixed(1) : 0;
                  return `${ctx.label}: ${formatINR(val)}/mo (${pct}%)`;
                }
              }
            },
            legend: { position: 'right' }
          }
        }
      });
    }

    // 2. Goal Roadmap Chart (Accumulation Curve)
    const ctxRoadmap = document.getElementById('goalRoadmapChart');
    if (ctxRoadmap) {
      if (goalRoadmapChart) goalRoadmapChart.destroy();

      const maxYears = Math.min(30, Math.max(...goals.map(g => g.years)));
      const labels = [];
      const portfolioCurve = [];
      const monthlyRate = globalReturn / 12;

      for (let y = 1; y <= maxYears; y++) {
        labels.push(`Year ${y}`);
        let balance = 0;
        goals.forEach(g => {
          if (y <= g.years) {
            const months = y * 12;
            const factor = Math.pow(1 + monthlyRate, months);
            const val = g.sip * ((factor - 1) / monthlyRate) * (1 + monthlyRate);
            balance += val;
          } else {
            balance += g.futureTarget;
          }
        });
        portfolioCurve.push(Math.round(balance));
      }

      goalRoadmapChart = new Chart(ctxRoadmap, {
        type: 'line',
        data: {
          labels: labels,
          datasets: [{
            label: 'Total Accumulated Wealth Portfolio',
            data: portfolioCurve,
            borderColor: '#2563eb',
            backgroundColor: 'rgba(37, 99, 235, 0.1)',
            borderWidth: 3,
            fill: true,
            tension: 0.3
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            tooltip: {
              callbacks: {
                label: function (ctx) {
                  return `Portfolio: ${formatLakhCrore(ctx.raw)}`;
                }
              }
            }
          },
          scales: {
            y: {
              ticks: {
                callback: function (val) {
                  return formatLakhCrore(val);
                }
              }
            }
          }
        }
      });
    }
  }

  // --- CSV EXPORT ---
  if (exportGoalsCsvBtn) {
    exportGoalsCsvBtn.addEventListener('click', () => {
      if (!cachedGoals.length) return;
      let csv = 'Goal,Years to Goal,Current Cost,Inflation %,Future Target,Monthly SIP Required\n';
      cachedGoals.forEach(g => {
        csv += `"${g.name}",${g.years},${Math.round(g.currentCost)},${g.inflation.toFixed(1)},${Math.round(g.futureTarget)},${Math.round(g.sip)}\n`;
      });
      if (window.ToolsKart && window.ToolsKart.downloadFile) {
        window.ToolsKart.downloadFile(csv, 'Life_Goals_Financial_Roadmap.csv', 'text/csv');
      }
    });
  }

  // Attach event listeners to all inputs
  const allInputs = [
    globalReturnRateInput, retCurrentAgeInput, retRetireAgeInput, retLifeExpectancyInput,
    retCurrentExpenseInput, retInflationInput, retPostReturnInput, eduChildAgeInput,
    eduCollegeAgeInput, eduCurrentCostInput, eduInflationInput, marYearsToGoalInput,
    marCurrentCostInput, marInflationInput, homeYearsToGoalInput, homeCurrentCostInput,
    homeInflationInput
  ];

  allInputs.forEach(input => {
    if (input) {
      input.addEventListener('input', calculateAllGoals);
      input.addEventListener('change', calculateAllGoals);
    }
  });

  // Initial calculation
  calculateAllGoals();

})();
