    let lastCalculation = null;
/* SIP Calculator - Amazing-Tools */
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
      Amazing-Tools.clearAllErrors(document.querySelector('.tool-interface'));
    });
  
    function calculate() {
      const TK = window.Amazing-Tools;
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
  
      lastCalculation = {
      p, rate, years, n, r,
      investedAmount, estimatedReturns, futureValue,
      tableData: Array.from(growthTableBody.querySelectorAll('tr')).map(tr => {
        const tds = tr.querySelectorAll('td');
        return [tds[0].textContent.trim(), tds[1].textContent.trim(), tds[2].textContent.trim(), tds[3].textContent.trim()];
      })
    };

    TK.showResult('resultArea');
  
      document.getElementById('copyResultBtn').onclick = function () {
        let text = 'SIP Calculation Result\n';
        text += 'Invested Amount: ' + TK.formatINR(investedAmount) + '\n';
        text += 'Estimated Returns: ' + TK.formatINR(estimatedReturns) + '\n';
        text += 'Total Wealth Generated: ' + TK.formatINR(futureValue);
        TK.copyToClipboard(text, this);
      };
    }
  
    const downloadSipCsvBtn = document.getElementById('downloadSipCsvBtn');
    if (downloadSipCsvBtn) {
      downloadSipCsvBtn.addEventListener('click', function () {
        if (!lastCalculation) return;
        let csv = 'Year,Invested (INR),Estimated Returns (INR),Total Value (INR)\n';
        lastCalculation.tableData.forEach(row => {
          csv += `"${row[0]}","${row[1]}","${row[2]}","${row[3]}"\n`;
        });
        csv += '\n# USER VERIFICATION DECLARATION & DISCLAIMER NOTICE\n';
        csv += '# This output is provided freely by Amazing-tools (amazing-tools.github.io) solely for educational and planning assistance.\n';
        csv += '# All calculations must be independently verified at user level with your financial advisor or fund house.\n';
        csv += '# Amazing-tools is not responsible or liable for any miscalculations or financial decisions made.\n';
        csv += '# Please report any discrepancies on our portal (hello@Amazing-Tools.com) for future corrections.\n';

        if (window.Amazing-Tools && window.Amazing-Tools.downloadFile) {
          window.Amazing-Tools.downloadFile(csv, 'SIP_Growth_Schedule.csv', 'text/csv');
        }
      });
    }

    const downloadSipPdfBtn = document.getElementById('downloadSipPdfBtn');
    if (downloadSipPdfBtn) {
      downloadSipPdfBtn.addEventListener('click', function () {
        if (!lastCalculation || typeof window.jspdf === 'undefined') {
          window.print();
          return;
        }
        const { jsPDF } = window.jspdf;
        const doc = new jsPDF({ orientation: 'portrait', unit: 'pt', format: 'a4' });
        const primaryColor = [37, 99, 235];

        // Header
        doc.setFillColor(...primaryColor);
        doc.rect(0, 0, 595, 60, 'F');
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(16);
        doc.setTextColor(255, 255, 255);
        doc.text('Amazing-tools | SIP Wealth Growth Report', 30, 36);
        doc.setFontSize(9);
        doc.setFont('helvetica', 'normal');
        doc.setTextColor(220, 235, 252);
        doc.text('Generated at amazing-tools.github.io • 100% Client-Side Private Analysis', 30, 50);

        // Summary Table
        doc.autoTable({
          startY: 80,
          head: [['Investment Parameter', 'Value']],
          body: [
            ['Monthly SIP Investment', '₹ ' + Math.round(lastCalculation.p).toLocaleString('en-IN')],
            ['Expected Return Rate (CAGR)', `${lastCalculation.rate}% p.a.`],
            ['Investment Duration', `${lastCalculation.years} Years (${lastCalculation.n} Installments)`],
            ['Total Amount Deposited', document.getElementById('investedAmount').textContent],
            ['Estimated Wealth Gain (Returns)', document.getElementById('estimatedReturns').textContent],
            ['Total Final Wealth Generated', document.getElementById('totalValue').textContent]
          ],
          theme: 'striped',
          headStyles: { fillColor: primaryColor, textColor: 255, fontStyle: 'bold' },
          styles: { fontSize: 9, cellPadding: 5 }
        });

        // Growth Table
        doc.autoTable({
          startY: doc.lastAutoTable.finalY + 15,
          head: [['Year', 'Total Invested (INR)', 'Returns Earned (INR)', 'Accumulated Corpus (INR)']],
          body: lastCalculation.tableData,
          theme: 'grid',
          headStyles: { fillColor: [71, 85, 105], textColor: 255 },
          styles: { fontSize: 8, cellPadding: 4 }
        });

        let curY = doc.lastAutoTable.finalY + 15;
        if (curY > 670) {
          doc.addPage();
          curY = 40;
        }

        // Declaration Box
        doc.setFillColor(254, 243, 199);
        doc.setDrawColor(245, 158, 11);
        doc.setLineWidth(1.5);
        doc.roundedRect(30, curY, 535, 95, 4, 4, 'FD');

        doc.setFont('helvetica', 'bold');
        doc.setFontSize(9);
        doc.setTextColor(180, 83, 9);
        doc.text('USER VERIFICATION DECLARATION & DISCLAIMER NOTICE', 42, curY + 16);

        doc.setFont('helvetica', 'normal');
        doc.setFontSize(7.5);
        doc.setTextColor(69, 26, 3);
        const declText = 
          "This calculation report is provided freely by Amazing-tools (amazing-tools.github.io) solely for educational and financial scenario planning assistance. " +
          "Mutual fund investments are subject to market risks, and actual returns may fluctuate based on macroeconomic market conditions, fund NAVs, and expense ratios.\n\n" +
          "Mandatory Verification: Users must independently verify all returns, compounding projections, and tax implications with their certified financial planner or fund house before making investment commitments. " +
          "Amazing-tools and its operators assume no legal or financial liability for any discrepancies or financial decisions made based on this output.\n\n" +
          "Report Miscalculations: If you notice any calculation discrepancy, please report it directly on our portal (hello@Amazing-Tools.com) for prompt verification and correction.";
        
        doc.text(doc.splitTextToSize(declText, 510), 42, curY + 28);
        doc.save(`SIP_Wealth_Report_${Math.round(lastCalculation.p)}pm_${lastCalculation.years}yr.pdf`);
      });
    }

})();
