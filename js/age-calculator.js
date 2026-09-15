/* Age Calculator - ToolsKart */
(function () {
    'use strict';
  
    const dobInput = document.getElementById('dob');
    const currentDateInput = document.getElementById('currentDate');
    const calculateBtn = document.getElementById('calculateBtn');
    const resetBtn = document.getElementById('resetBtn');
    const resultArea = document.getElementById('resultArea');
  
    // Set default dates
    const today = new Date();
    const todayStr = today.toISOString().split('T')[0];
    currentDateInput.value = todayStr;
    
    // Set max date for dob to today
    dobInput.max = todayStr;
  
    calculateBtn.addEventListener('click', calculate);
  
    resetBtn.addEventListener('click', function () {
      dobInput.value = '';
      currentDateInput.value = todayStr;
      resultArea.classList.add('hidden');
      ToolsKart.clearAllErrors(document.querySelector('.tool-interface'));
    });
  
    function calculate() {
      const TK = window.ToolsKart;
      TK.clearAllErrors(document.querySelector('.tool-interface'));
  
      if (!dobInput.value) {
        TK.showError(dobInput, 'Please select your Date of Birth.');
        return;
      }
      
      if (!currentDateInput.value) {
        TK.showError(currentDateInput, 'Please select the comparison date.');
        return;
      }
  
      const dob = new Date(dobInput.value);
      const current = new Date(currentDateInput.value);
  
      if (dob > current) {
        TK.showError(dobInput, 'Date of Birth cannot be after the Calculate As Of date.');
        return;
      }
  
      // Calculate age in years, months, days
      let years = current.getFullYear() - dob.getFullYear();
      let months = current.getMonth() - dob.getMonth();
      let days = current.getDate() - dob.getDate();
  
      if (days < 0) {
          months--;
          const prevMonth = new Date(current.getFullYear(), current.getMonth(), 0);
          days += prevMonth.getDate();
      }
      if (months < 0) {
          years--;
          months += 12;
      }
  
      const mainAgeText = `${years} years, ${months} months, ${days} days`;
      document.getElementById('mainAge').textContent = mainAgeText;
  
      // Total calculations
      const diffTime = Math.abs(current - dob);
      const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
      
      const totalMonths = (years * 12) + months;
      const totalWeeks = Math.floor(diffDays / 7);
      const totalHours = diffDays * 24;
  
      document.getElementById('totalMonths').textContent = totalMonths.toLocaleString();
      document.getElementById('totalWeeks').textContent = totalWeeks.toLocaleString();
      document.getElementById('totalDays').textContent = diffDays.toLocaleString();
      document.getElementById('totalHours').textContent = totalHours.toLocaleString();
  
      // Next birthday countdown
      let nextBday = new Date(current.getFullYear(), dob.getMonth(), dob.getDate());
      if (nextBday < current) {
          nextBday.setFullYear(current.getFullYear() + 1);
      }
      const bdayDiffTime = Math.abs(nextBday - current);
      const bdayDiffDays = Math.ceil(bdayDiffTime / (1000 * 60 * 60 * 24));
      
      let nextBirthdayText = "";
      if (bdayDiffDays === 0) {
          nextBirthdayText = "Today! 🎉 Happy Birthday!";
      } else if (bdayDiffDays === 1) {
          nextBirthdayText = "1 day";
      } else {
          // Calculate months and days for next birthday
          let bMonths = nextBday.getMonth() - current.getMonth();
          let bDays = nextBday.getDate() - current.getDate();
          if (bDays < 0) {
              bMonths--;
              const prev = new Date(nextBday.getFullYear(), nextBday.getMonth(), 0);
              bDays += prev.getDate();
          }
          if (bMonths < 0) {
              bMonths += 12;
          }
          nextBirthdayText = `${bMonths} months and ${bDays} days (${bdayDiffDays} total days)`;
      }
      document.getElementById('nextBirthday').textContent = nextBirthdayText;
  
      TK.showResult('resultArea');
  
      document.getElementById('copyResultBtn').onclick = function () {
        let text = 'Age Calculation Result\n';
        text += 'Exact Age: ' + mainAgeText + '\n';
        text += 'Total Days: ' + diffDays.toLocaleString() + '\n';
        text += 'Next Birthday in: ' + nextBirthdayText;
        TK.copyToClipboard(text, this);
      };
    }
  })();
