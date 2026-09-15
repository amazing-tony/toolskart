/* FD Calculator - ToolsKart */
(function () {
    'use strict';
  
    const depositAmountInput = document.getElementById('depositAmount');
    const interestRateInput = document.getElementById('interestRate');
    const tenureYearsInput = document.getElementById('tenureYears');
    const tenureMonthsInput = document.getElementById('tenureMonths');
    const compoundingFrequencySelect = document.getElementById('compoundingFrequency');
    const calculateBtn = document.getElementById('calculateBtn');
    const resetBtn = document.getElementById('resetBtn');
    const resultArea = document.getElementById('resultArea');
  
    calculateBtn.addEventListener('click', calculate);
    
    [depositAmountInput, interestRateInput, tenureYearsInput, tenureMonthsInput].forEach(input => {
      input.addEventListener('keydown', function (e) {
        if (e.key === 'Enter') calculate();
      });
    });
  
    resetBtn.addEventListener('click', function () {
      depositAmountInput.value = '';
      interestRateInput.value = '';
      tenureYearsInput.value = '';
      tenureMonthsInput.value = '';
      compoundingFrequencySelect.value = '4';
      resultArea.classList.add('hidden');
      ToolsKart.clearAllErrors(document.querySelector('.tool-interface'));
    });
  
    function calculate() {
      const TK = window.ToolsKart;
      TK.clearAllErrors(document.querySelector('.tool-interface'));
  
      const p = parseFloat(depositAmountInput.value);
      if (isNaN(p) || p <= 0) {
        TK.showError(depositAmountInput, 'Please enter a valid deposit amount.');
        return;
      }
  
      const rate = parseFloat(interestRateInput.value);
      if (isNaN(rate) || rate < 0 || rate > 100) {
        TK.showError(interestRateInput, 'Please enter a valid interest rate.');
        return;
      }
  
      let y = parseFloat(tenureYearsInput.value) || 0;
      let m = parseFloat(tenureMonthsInput.value) || 0;
      
      if (y === 0 && m === 0) {
        TK.showError(tenureYearsInput, 'Please enter tenure.');
        return;
      }
  
      const t = y + (m / 12);
      const n = parseInt(compoundingFrequencySelect.value);
      const r = rate / 100;
  
      // Formula: A = P(1 + r/n)^(nt)
      let maturityAmount = p * Math.pow((1 + (r / n)), (n * t));
      let interestEarned = maturityAmount - p;
      let effectiveRate = (Math.pow((1 + (r / n)), n) - 1) * 100;
  
      document.getElementById('resPrincipal').textContent = TK.formatINR(p);
      document.getElementById('resInterest').textContent = TK.formatINR(interestEarned);
      document.getElementById('resMaturity').textContent = TK.formatINR(maturityAmount);
      document.getElementById('resEffectiveRate').textContent = effectiveRate.toFixed(2) + '%';
  
      TK.showResult('resultArea');
  
      document.getElementById('copyResultBtn').onclick = function () {
        let text = 'Fixed Deposit Result\n';
        text += 'Principal: ' + TK.formatINR(p) + '\n';
        text += 'Interest Earned: ' + TK.formatINR(interestEarned) + '\n';
        text += 'Maturity Amount: ' + TK.formatINR(maturityAmount);
        TK.copyToClipboard(text, this);
      };
    }
  })();
