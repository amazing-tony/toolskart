/* =========================================================
   Amazing-Tools — RD (Recurring Deposit) Calculator
   Quarterly & Monthly Compounding Engine
   ========================================================= */

(function () {
  'use strict';

  const rdMonthlyAmountInput = document.getElementById('rdMonthlyAmount');
  const rdInterestRateInput = document.getElementById('rdInterestRate');
  const rdTenureYearsInput = document.getElementById('rdTenureYears');
  const rdTenureMonthsInput = document.getElementById('rdTenureMonths');
  const rdCompoundingSelect = document.getElementById('rdCompounding');

  const kpiRdMaturity = document.getElementById('kpiRdMaturity');
  const kpiRdSummary = document.getElementById('kpiRdSummary');
  const kpiRdInvested = document.getElementById('kpiRdInvested');
  const kpiRdInterest = document.getElementById('kpiRdInterest');
  const kpiRdYield = document.getElementById('kpiRdYield');

  let rdChartInstance = null;

  function formatINR(val) {
    if (isNaN(val) || val === null) return '₹ 0';
    return '₹ ' + Math.round(val).toLocaleString('en-IN');
  }

  function recalculate() {
    const P = parseFloat(rdMonthlyAmountInput.value) || 0;
    const r = (parseFloat(rdInterestRateInput.value) || 0) / 100;
    const years = parseInt(rdTenureYearsInput.value, 10) || 0;
    const months = parseInt(rdTenureMonthsInput.value, 10) || 0;
    const t = years + (months / 12);
    const n = parseFloat(rdCompoundingSelect.value) || 4; // Compounding frequency per year

    const totalMonths = (years * 12) + months;
    const totalInvested = P * totalMonths;

    if (P <= 0 || t <= 0 || r <= 0) {
      kpiRdMaturity.textContent = formatINR(totalInvested);
      kpiRdInvested.textContent = formatINR(totalInvested);
      kpiRdInterest.textContent = '₹ 0';
      kpiRdYield.textContent = '0.00%';
      renderChart(totalInvested, 0);
      return;
    }

    // Standard formula: M = P * ((1 + r/n)^(n*t) - 1) / (1 - (1 + r/n)^(-n/12))
    const numerator = Math.pow(1 + r / n, n * t) - 1;
    const denominator = 1 - Math.pow(1 + r / n, -n / 12);
    const maturity = P * (numerator / denominator);
    const interest = Math.max(0, maturity - totalInvested);

    // Effective Annual Yield
    const effectiveYield = (Math.pow(1 + r / n, n) - 1) * 100;

    kpiRdMaturity.textContent = formatINR(maturity);
    kpiRdSummary.textContent = `Total Invested: ${formatINR(totalInvested)} • Total Interest: ${formatINR(interest)}`;
    kpiRdInvested.textContent = formatINR(totalInvested);
    kpiRdInterest.textContent = formatINR(interest);
    kpiRdYield.textContent = `${effectiveYield.toFixed(2)}%`;

    renderChart(totalInvested, interest);
  }

  function renderChart(invested, interest) {
    const ctx = document.getElementById('rdChart');
    if (!ctx) return;
    if (rdChartInstance) rdChartInstance.destroy();

    rdChartInstance = new Chart(ctx, {
      type: 'doughnut',
      data: {
        labels: ['Total Principal Invested', 'Total Interest Earned'],
        datasets: [{
          data: [Math.round(invested), Math.round(interest)],
          backgroundColor: ['#2563eb', '#10b981'],
          borderWidth: 2
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          tooltip: {
            callbacks: {
              label: (ctx) => `${ctx.label}: ${formatINR(ctx.raw)}`
            }
          },
          legend: { position: 'bottom' }
        }
      }
    });
  }

  // Quick Chips
  document.querySelectorAll('.quick-chip[data-val]').forEach(chip => {
    chip.addEventListener('click', function () {
      const val = this.getAttribute('data-val');
      rdMonthlyAmountInput.value = val;
      this.parentElement.querySelectorAll('.quick-chip').forEach(c => c.classList.remove('active'));
      this.classList.add('active');
      recalculate();
    });
  });

  [rdMonthlyAmountInput, rdInterestRateInput, rdTenureYearsInput, rdTenureMonthsInput, rdCompoundingSelect].forEach(el => {
    el.addEventListener('input', recalculate);
    el.addEventListener('change', recalculate);
  });

  recalculate();

})();
