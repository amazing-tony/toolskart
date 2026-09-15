/* SIP Calculator - ToolsKart */
(function () {
    'use strict';
  
    const monthlyInvestmentInput = document.getElementById('monthlyInvestment');
    const returnRateInput = document.getElementById('returnRate');
    const investmentPeriodInput = document.getElementById('investmentPeriod');
    const calculateBtn = document.getElementById('calculateBtn');
    const resetBtn = document.getElementById('resetBtn');
    const resultArea = document.getElementById('resultArea');
    const growthTableBody = document.getElementById('growthTableBody');
  
    calculateBtn.addEventListener('click', calculate);
    
    [monthlyInvestmentInput, returnRateInput, investmentPeriodInput].forEach(input => {
      input.addEventListener('keydown', function (e) {
        if (e.key === 'Enter') calculate();
      });
    });
  
    resetBtn.addEventListener('click', function () {
      monthlyInvestmentInput.value = '';
      returnRateInput.value = '';
      investmentPeriodInput.value = '';
      resultArea.classList.add('hidden');
      ToolsKart.clearAllErrors(document.querySelector('.tool-interface'));
    });
  
    function calculate() {
      const TK = window.ToolsKart;
      TK.clearAllErrors(document.querySelector('.tool-interface'));
  
      const p = parseFloat(monthlyInvestmentInput.value);
      if (isNaN(p) || p <= 0) {
        TK.showError(monthlyInvestmentInput, 'Please enter a valid positive monthly investment.');
        return;
      }
  
      const rate = parseFloat(returnRateInput.value);
      if (isNaN(rate) || rate < 0 || rate > 100) {
        TK.showError(returnRateInput, 'Please enter a valid return rate.');
        return;
      }
  
      let years = parseFloat(investmentPeriodInput.value);
      if (isNaN(years) || years <= 0) {
        TK.showError(investmentPeriodInput, 'Please enter a valid positive investment period.');
        return;
      }
  
      const n = years * 12;
      const r = rate / 12 / 100;
  
      // SIP Formula: FV = P × ((1+r)^n - 1) / r × (1+r)
      let futureValue = 0;
      if (r === 0) {
          futureValue = p * n;
      } else {
          futureValue = p * (Math.pow(1 + r, n) - 1) / r * (1 + r);
      }
  
      const investedAmount = p * n;
      const estimatedReturns = futureValue - investedAmount;
  
      document.getElementById('investedAmount').textContent = TK.formatINR(investedAmount);
      document.getElementById('estimatedReturns').textContent = TK.formatINR(estimatedReturns);
      document.getElementById('totalValue').textContent = TK.formatINR(futureValue);
  
      // Year-by-Year Growth Table
      growthTableBody.innerHTML = '';
      
      for (let year = 1; year <= years; year++) {
          let months = year * 12;
          let yInvested = p * months;
          let yTotalValue = 0;
          if (r === 0) {
              yTotalValue = yInvested;
          } else {
              yTotalValue = p * (Math.pow(1 + r, months) - 1) / r * (1 + r);
          }
          let yReturns = yTotalValue - yInvested;
  
          const tr = document.createElement('tr');
          tr.innerHTML = `
              <td style="text-align: left;">Year ${year}</td>
              <td>${TK.formatIndian(yInvested)}</td>
              <td>${TK.formatIndian(yReturns)}</td>
              <td>${TK.formatIndian(yTotalValue)}</td>
          `;
          growthTableBody.appendChild(tr);
      }
  
      TK.showResult('resultArea');
  
      document.getElementById('copyResultBtn').onclick = function () {
        let text = 'SIP Calculation Result\n';
        text += 'Invested Amount: ' + TK.formatINR(investedAmount) + '\n';
        text += 'Estimated Returns: ' + TK.formatINR(estimatedReturns) + '\n';
        text += 'Total Wealth Generated: ' + TK.formatINR(futureValue);
        TK.copyToClipboard(text, this);
      };
    }
  })();
