/* GST Calculator — ToolsKart */
(function () {
  'use strict';

  const amountInput = document.getElementById('amount');
  const gstRateSelect = document.getElementById('gstRate');
  const customRateGroup = document.getElementById('customRateGroup');
  const customRateInput = document.getElementById('customRate');
  const calculateBtn = document.getElementById('calculateBtn');
  const resetBtn = document.getElementById('resetBtn');
  const resultArea = document.getElementById('resultArea');

  // Show/hide custom rate field
  gstRateSelect.addEventListener('change', function () {
    if (this.value === 'custom') {
      customRateGroup.classList.remove('hidden');
      customRateInput.focus();
    } else {
      customRateGroup.classList.add('hidden');
    }
  });

  // Calculate on button click
  calculateBtn.addEventListener('click', calculate);

  // Also calculate on Enter key
  amountInput.addEventListener('keydown', function (e) {
    if (e.key === 'Enter') calculate();
  });
  if (customRateInput) {
    customRateInput.addEventListener('keydown', function (e) {
      if (e.key === 'Enter') calculate();
    });
  }

  // Reset
  resetBtn.addEventListener('click', function () {
    amountInput.value = '';
    gstRateSelect.value = '18';
    customRateGroup.classList.add('hidden');
    customRateInput.value = '';
    resultArea.classList.add('hidden');
    document.querySelectorAll('input[name="calcType"]')[0].checked = true;
    document.querySelectorAll('input[name="taxType"]')[0].checked = true;
    ToolsKart.clearAllErrors(document.querySelector('.tool-interface'));
  });

  function calculate() {
    const TK = window.ToolsKart;
    TK.clearAllErrors(document.querySelector('.tool-interface'));

    // Get values
    const amount = parseFloat(amountInput.value);
    if (isNaN(amount) || amount <= 0) {
      TK.showError(amountInput, 'Please enter a valid positive amount.');
      return;
    }

    let gstRate;
    if (gstRateSelect.value === 'custom') {
      gstRate = parseFloat(customRateInput.value);
      if (isNaN(gstRate) || gstRate < 0 || gstRate > 100) {
        TK.showError(customRateInput, 'Please enter a valid GST rate (0-100%).');
        return;
      }
    } else {
      gstRate = parseFloat(gstRateSelect.value);
    }

    const calcType = document.querySelector('input[name="calcType"]:checked').value;
    const taxType = document.querySelector('input[name="taxType"]:checked').value;

    // Calculate
    let originalPrice, gstAmount, totalPrice;

    if (calcType === 'add') {
      originalPrice = amount;
      gstAmount = originalPrice * (gstRate / 100);
      totalPrice = originalPrice + gstAmount;
    } else {
      // Remove GST — amount is GST-inclusive
      totalPrice = amount;
      originalPrice = amount / (1 + gstRate / 100);
      gstAmount = totalPrice - originalPrice;
    }

    // Display results
    const resultTitle = document.getElementById('resultTitle');
    const originalLabel = document.getElementById('originalLabel');
    const finalLabel = document.getElementById('finalLabel');

    if (calcType === 'add') {
      resultTitle.textContent = 'GST Added — Result';
      originalLabel.textContent = 'Original Price (excl. GST)';
      finalLabel.textContent = 'Total Price (incl. GST)';
    } else {
      resultTitle.textContent = 'GST Removed — Result';
      originalLabel.textContent = 'Price Before GST';
      finalLabel.textContent = 'GST-Inclusive Price (entered)';
    }

    document.getElementById('originalPrice').textContent = TK.formatINR(originalPrice);
    document.getElementById('totalGst').textContent = TK.formatINR(gstAmount);
    document.getElementById('finalPrice').textContent = TK.formatINR(totalPrice);

    // Tax split
    const cgstSgstRows = document.getElementById('cgstSgstRows');
    const igstRow = document.getElementById('igstRow');

    if (taxType === 'cgst_sgst') {
      cgstSgstRows.classList.remove('hidden');
      igstRow.classList.add('hidden');

      const halfRate = gstRate / 2;
      const halfAmount = gstAmount / 2;

      document.getElementById('cgstLabel').textContent = 'CGST (' + halfRate + '%)';
      document.getElementById('cgstAmount').textContent = TK.formatINR(halfAmount);
      document.getElementById('sgstLabel').textContent = 'SGST (' + halfRate + '%)';
      document.getElementById('sgstAmount').textContent = TK.formatINR(halfAmount);
    } else {
      cgstSgstRows.classList.add('hidden');
      igstRow.classList.remove('hidden');

      document.getElementById('igstLabel').textContent = 'IGST (' + gstRate + '%)';
      document.getElementById('igstAmount').textContent = TK.formatINR(gstAmount);
    }

    TK.showResult('resultArea');

    // Copy button
    document.getElementById('copyResultBtn').onclick = function () {
      let text = resultTitle.textContent + '\n';
      text += originalLabel.textContent + ': ' + TK.formatINR(originalPrice) + '\n';
      if (taxType === 'cgst_sgst') {
        text += 'CGST (' + (gstRate / 2) + '%): ' + TK.formatINR(gstAmount / 2) + '\n';
        text += 'SGST (' + (gstRate / 2) + '%): ' + TK.formatINR(gstAmount / 2) + '\n';
      } else {
        text += 'IGST (' + gstRate + '%): ' + TK.formatINR(gstAmount) + '\n';
      }
      text += 'Total GST: ' + TK.formatINR(gstAmount) + '\n';
      text += finalLabel.textContent + ': ' + TK.formatINR(totalPrice);
      TK.copyToClipboard(text, this);
    };
  }
})();
