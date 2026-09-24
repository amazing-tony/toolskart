/* Compound Interest Calculator - Amazing-Tools */
(function () {
    'use strict';
  
    const principalInput = document.getElementById('principal');
    const rateInput = document.getElementById('rate');
    const timeInput = document.getElementById('time');
    const frequencySelect = document.getElementById('compoundingFrequency');
    const calculateBtn = document.getElementById('calculateBtn');
    const resetBtn = document.getElementById('resetBtn');
    const resultArea = document.getElementById('resultArea');
    const growthTableBody = document.getElementById('growthTableBody');
  
    calculateBtn.addEventListener('click', calculate);
    
    [principalInput, rateInput, timeInput].forEach(input => {
      input.addEventListener('keydown', function (e) {
        if (e.key === 'Enter') calculate();
      });
    });
  
    resetBtn.addEventListener('click', function () {
      principalInput.value = '';
      rateInput.value = '';
      timeInput.value = '';
      frequencySelect.value = '1';
      resultArea.classList.add('hidden');
      Amazing-Tools.clearAllErrors(document.querySelector('.tool-interface'));
    });
  
    function calculate() {
      const TK = window.Amazing-Tools;
      TK.clearAllErrors(document.querySelector('.tool-interface'));
  
      const p = parseFloat(principalInput.value);
      if (isNaN(p) || p <= 0) {
        TK.showError(principalInput, 'Please enter a valid principal amount.');
        return;
      }
  
      const rate = parseFloat(rateInput.value);
      if (isNaN(rate) || rate < 0 || rate > 100) {
        TK.showError(rateInput, 'Please enter a valid interest rate.');
        return;
      }
  
      const t = parseFloat(timeInput.value);
      if (isNaN(t) || t <= 0) {
        TK.showError(timeInput, 'Please enter a valid time period.');
        return;
      }
  
      const n = parseInt(frequencySelect.value);
      const r = rate / 100;
  
      // Compound Interest
      let totalAmount = p * Math.pow((1 + (r / n)), (n * t));
      let compoundInterest = totalAmount - p;
  
      // Simple Interest for comparison
      let simpleInterest = p * r * t;
      let difference = compoundInterest - simpleInterest;
  
      document.getElementById('resPrincipal').textContent = TK.formatINR(p);
      document.getElementById('resTotalAmount').textContent = TK.formatINR(totalAmount);
      document.getElementById('resCompoundInterest').textContent = TK.formatINR(compoundInterest);
      document.getElementById('resSimpleInterest').textContent = TK.formatINR(simpleInterest);
      document.getElementById('resDifference').textContent = TK.formatINR(Math.max(0, difference));
  
      // Year by Year Growth
      growthTableBody.innerHTML = '';
      let prevBalance = p;
      let totalYears = Math.ceil(t);
  
      for (let year = 1; year <= totalYears; year++) {
          let currentT = Math.min(year, t);
          let currentBalance = p * Math.pow((1 + (r / n)), (n * currentT));
          let interestForYear = currentBalance - prevBalance;
  
          const tr = document.createElement('tr');
          tr.innerHTML = `
              <td style="text-align: left;">Year ${year}</td>
              <td>${TK.formatIndian(interestForYear)}</td>
              <td>${TK.formatIndian(currentBalance)}</td>
          `;
          growthTableBody.appendChild(tr);
          
          prevBalance = currentBalance;
      }
  
      TK.showResult('resultArea');
  
      document.getElementById('copyResultBtn').onclick = function () {
        let text = 'Compound Interest Result\n';
        text += 'Principal: ' + TK.formatINR(p) + '\n';
        text += 'Compound Interest: ' + TK.formatINR(compoundInterest) + '\n';
        text += 'Total Amount: ' + TK.formatINR(totalAmount);
        TK.copyToClipboard(text, this);
      };
    }
  })();
