/* EMI Calculator - ToolsKart */
(function () {
    'use strict';
  
    const loanAmountInput = document.getElementById('loanAmount');
    const interestRateInput = document.getElementById('interestRate');
    const loanTenureInput = document.getElementById('loanTenure');
    const tenureTypeSelect = document.getElementById('tenureType');
    const calculateBtn = document.getElementById('calculateBtn');
    const resetBtn = document.getElementById('resetBtn');
    const resultArea = document.getElementById('resultArea');
    const amortizationTableBody = document.getElementById('amortizationTableBody');
  
    calculateBtn.addEventListener('click', calculate);
    
    [loanAmountInput, interestRateInput, loanTenureInput].forEach(input => {
      input.addEventListener('keydown', function (e) {
        if (e.key === 'Enter') calculate();
      });
    });
  
    resetBtn.addEventListener('click', function () {
      loanAmountInput.value = '';
      interestRateInput.value = '';
      loanTenureInput.value = '';
      tenureTypeSelect.value = 'years';
      resultArea.classList.add('hidden');
      ToolsKart.clearAllErrors(document.querySelector('.tool-interface'));
    });
  
    function calculate() {
      const TK = window.ToolsKart;
      TK.clearAllErrors(document.querySelector('.tool-interface'));
  
      const principal = parseFloat(loanAmountInput.value);
      if (isNaN(principal) || principal <= 0) {
        TK.showError(loanAmountInput, 'Please enter a valid positive loan amount.');
        return;
      }
  
      const rate = parseFloat(interestRateInput.value);
      if (isNaN(rate) || rate < 0 || rate > 100) {
        TK.showError(interestRateInput, 'Please enter a valid interest rate.');
        return;
      }
  
      let tenure = parseFloat(loanTenureInput.value);
      if (isNaN(tenure) || tenure <= 0) {
        TK.showError(loanTenureInput, 'Please enter a valid positive loan tenure.');
        return;
      }
  
      const tenureType = tenureTypeSelect.value;
      const totalMonths = tenureType === 'years' ? Math.round(tenure * 12) : Math.round(tenure);
  
      const monthlyRate = rate / 12 / 100;
      
      let emi = 0;
      if (monthlyRate === 0) {
          emi = principal / totalMonths;
      } else {
          emi = principal * monthlyRate * Math.pow(1 + monthlyRate, totalMonths) / (Math.pow(1 + monthlyRate, totalMonths) - 1);
      }
  
      const totalPayment = emi * totalMonths;
      const totalInterest = totalPayment - principal;
  
      document.getElementById('monthlyEmi').textContent = TK.formatINR(emi);
      document.getElementById('principalAmount').textContent = TK.formatINR(principal);
      document.getElementById('totalInterest').textContent = TK.formatINR(totalInterest);
      document.getElementById('totalPayment').textContent = TK.formatINR(totalPayment);
  
      // Amortization Schedule (Yearly)
      amortizationTableBody.innerHTML = '';
      let balance = principal;
      let yearlyPrincipal = 0;
      let yearlyInterest = 0;
      let yearCount = 1;
  
      for (let month = 1; month <= totalMonths; month++) {
          let interestForMonth = balance * monthlyRate;
          let principalForMonth = emi - interestForMonth;
          
          yearlyInterest += interestForMonth;
          yearlyPrincipal += principalForMonth;
          balance -= principalForMonth;
  
          if (month % 12 === 0 || month === totalMonths) {
              const tr = document.createElement('tr');
              tr.innerHTML = `
                  <td style="text-align: left;">Year ${yearCount}</td>
                  <td>${TK.formatIndian(yearlyPrincipal)}</td>
                  <td>${TK.formatIndian(yearlyInterest)}</td>
                  <td>${TK.formatIndian(yearlyPrincipal + yearlyInterest)}</td>
                  <td>${TK.formatIndian(Math.max(0, balance))}</td>
              `;
              amortizationTableBody.appendChild(tr);
              yearlyPrincipal = 0;
              yearlyInterest = 0;
              yearCount++;
          }
      }
  
      TK.showResult('resultArea');
  
      document.getElementById('copyResultBtn').onclick = function () {
        let text = 'EMI Calculation Result\n';
        text += 'Monthly EMI: ' + TK.formatINR(emi) + '\n';
        text += 'Principal Amount: ' + TK.formatINR(principal) + '\n';
        text += 'Total Interest: ' + TK.formatINR(totalInterest) + '\n';
        text += 'Total Payment: ' + TK.formatINR(totalPayment);
        TK.copyToClipboard(text, this);
      };
    }
  })();
