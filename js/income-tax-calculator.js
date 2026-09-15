/* Income Tax Calculator - ToolsKart */
(function () {
    'use strict';
  
    const annualIncomeInput = document.getElementById('annualIncome');
    const ageGroupSelect = document.getElementById('ageGroup');
    const calculateBtn = document.getElementById('calculateBtn');
    const resetBtn = document.getElementById('resetBtn');
    const resultArea = document.getElementById('resultArea');
    const slabBreakdown = document.getElementById('slabBreakdown');
  
    calculateBtn.addEventListener('click', calculate);
    
    annualIncomeInput.addEventListener('keydown', function (e) {
      if (e.key === 'Enter') calculate();
    });
  
    resetBtn.addEventListener('click', function () {
      annualIncomeInput.value = '';
      ageGroupSelect.value = 'under60';
      document.querySelectorAll('input[name="taxRegime"]')[0].checked = true;
      resultArea.classList.add('hidden');
      ToolsKart.clearAllErrors(document.querySelector('.tool-interface'));
    });
  
    function calculateSlabTax(income, slabs) {
        let tax = 0;
        let remaining = income;
        let breakdown = [];
        let prevLimit = 0;
  
        for (let i = 0; i < slabs.length; i++) {
            let limit = slabs[i].limit;
            let rate = slabs[i].rate;
            let slabSize = limit === Infinity ? Infinity : limit - prevLimit;
  
            if (remaining > 0) {
                let taxableInSlab = Math.min(remaining, slabSize);
                let taxInSlab = taxableInSlab * (rate / 100);
                tax += taxInSlab;
                remaining -= taxableInSlab;
                
                let rangeStr = limit === Infinity ? `Above ${prevLimit/100000}L` : `${prevLimit/100000}L - ${limit/100000}L`;
                breakdown.push({
                    range: rangeStr,
                    rate: rate,
                    taxable: taxableInSlab,
                    tax: taxInSlab
                });
            }
            prevLimit = limit;
        }
        return { totalTax: tax, breakdown: breakdown };
    }
  
    function calculate() {
      const TK = window.ToolsKart;
      TK.clearAllErrors(document.querySelector('.tool-interface'));
  
      const grossIncome = parseFloat(annualIncomeInput.value);
      if (isNaN(grossIncome) || grossIncome < 0) {
        TK.showError(annualIncomeInput, 'Please enter a valid gross income.');
        return;
      }
  
      const ageGroup = ageGroupSelect.value;
      const regime = document.querySelector('input[name="taxRegime"]:checked').value;
  
      let standardDeduction = regime === 'new' ? 75000 : 50000;
      let taxableIncome = Math.max(0, grossIncome - standardDeduction);
  
      let taxResult;
  
      if (regime === 'new') {
          // New Regime FY 2025-26 Slabs
          const slabs = [
              { limit: 400000, rate: 0 },
              { limit: 800000, rate: 5 },
              { limit: 1200000, rate: 10 },
              { limit: 1600000, rate: 15 },
              { limit: 2000000, rate: 20 },
              { limit: 2400000, rate: 25 },
              { limit: Infinity, rate: 30 }
          ];
          taxResult = calculateSlabTax(taxableIncome, slabs);
      } else {
          // Old Regime
          let basicExemption = 250000;
          if (ageGroup === '60to80') basicExemption = 300000;
          if (ageGroup === 'above80') basicExemption = 500000;
  
          const slabs = [
              { limit: basicExemption, rate: 0 },
              { limit: 500000, rate: 5 },
              { limit: 1000000, rate: 20 },
              { limit: Infinity, rate: 30 }
          ];
          taxResult = calculateSlabTax(taxableIncome, slabs);
      }
  
      let incomeTax = taxResult.totalTax;
      let cess = incomeTax * 0.04;
      let totalTax = incomeTax + cess;
      let takeHome = grossIncome - totalTax;
      let effectiveRate = grossIncome > 0 ? (totalTax / grossIncome) * 100 : 0;
  
      document.getElementById('resGrossIncome').textContent = TK.formatINR(grossIncome);
      document.getElementById('resStdDeduction').textContent = TK.formatINR(standardDeduction);
      document.getElementById('resTaxableIncome').textContent = TK.formatINR(taxableIncome);
      
      slabBreakdown.innerHTML = '';
      taxResult.breakdown.forEach(b => {
          if(b.tax > 0 || b.rate === 0) {
              slabBreakdown.innerHTML += `<div style="display:flex; justify-content:space-between; margin-bottom: 4px;">
                  <span>${b.range} (@${b.rate}%)</span>
                  <span>${TK.formatINR(b.tax)}</span>
              </div>`;
          }
      });
  
      document.getElementById('resIncomeTax').textContent = TK.formatINR(incomeTax);
      document.getElementById('resCess').textContent = TK.formatINR(cess);
      document.getElementById('resTotalTax').textContent = TK.formatINR(totalTax);
      document.getElementById('resTakeHome').textContent = TK.formatINR(takeHome);
      document.getElementById('resEffectiveRate').textContent = effectiveRate.toFixed(2) + '%';
  
      TK.showResult('resultArea');
  
      document.getElementById('copyResultBtn').onclick = function () {
        let text = `Income Tax Calculation (${regime === 'new' ? 'New' : 'Old'} Regime)\n`;
        text += 'Gross Income: ' + TK.formatINR(grossIncome) + '\n';
        text += 'Taxable Income: ' + TK.formatINR(taxableIncome) + '\n';
        text += 'Total Tax: ' + TK.formatINR(totalTax) + '\n';
        text += 'Take-Home Salary: ' + TK.formatINR(takeHome);
        TK.copyToClipboard(text, this);
      };
    }
  })();
