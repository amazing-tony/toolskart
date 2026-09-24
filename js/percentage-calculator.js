/* Percentage Calculator - Amazing-Tools */
(function () {
    'use strict';
  
    const tabBtns = document.querySelectorAll('.tab-btn');
    const tabContents = document.querySelectorAll('.tab-content');
    const resultArea = document.getElementById('resultArea');
    const mainResultText = document.getElementById('mainResultText');
    const formulaUsed = document.getElementById('formulaUsed');
  
    // Tab switching
    tabBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            tabBtns.forEach(b => b.classList.remove('active'));
            tabContents.forEach(c => c.classList.remove('active'));
            
            btn.classList.add('active');
            document.getElementById(btn.getAttribute('data-target')).classList.add('active');
            resultArea.classList.add('hidden');
        });
    });
  
    const TK = window.Amazing-Tools;
  
    function displayResult(text, formula) {
        mainResultText.innerHTML = text;
        formulaUsed.textContent = formula;
        TK.showResult('resultArea');
    }
  
    window.calculateMode1 = function() {
        const xStr = document.getElementById('m1_x').value;
        const yStr = document.getElementById('m1_y').value;
        TK.clearAllErrors(document.getElementById('mode1'));
        if(!xStr || !yStr) return;
  
        const x = parseFloat(xStr);
        const y = parseFloat(yStr);
        
        const res = (x / 100) * y;
        displayResult(`${x}% of ${y} is <strong>${TK.formatNumber(res)}</strong>`, `${x} / 100 × ${y} = ${res}`);
    };
  
    window.calculateMode2 = function() {
        const xStr = document.getElementById('m2_x').value;
        const yStr = document.getElementById('m2_y').value;
        TK.clearAllErrors(document.getElementById('mode2'));
        if(!xStr || !yStr) return;
  
        const x = parseFloat(xStr);
        const y = parseFloat(yStr);
        if(y === 0) {
            alert("Y cannot be zero.");
            return;
        }
        
        const res = (x / y) * 100;
        displayResult(`${x} is <strong>${TK.formatNumber(res)}%</strong> of ${y}`, `(${x} / ${y}) × 100 = ${res}%`);
    };
  
    window.calculateMode3 = function() {
        const xStr = document.getElementById('m3_x').value;
        const yStr = document.getElementById('m3_y').value;
        TK.clearAllErrors(document.getElementById('mode3'));
        if(!xStr || !yStr) return;
  
        const x = parseFloat(xStr);
        const y = parseFloat(yStr);
        if(x === 0) {
            alert("Original value cannot be zero.");
            return;
        }
        
        const res = ((y - x) / Math.abs(x)) * 100;
        const word = res >= 0 ? "increase" : "decrease";
        displayResult(`A <strong>${Math.abs(res).toFixed(2)}%</strong> ${word}`, `((${y} - ${x}) / |${x}|) × 100 = ${res}%`);
    };
  
    window.calculateMode4 = function() {
        const xStr = document.getElementById('m4_x').value;
        const op = document.getElementById('m4_op').value;
        const yStr = document.getElementById('m4_y').value;
        TK.clearAllErrors(document.getElementById('mode4'));
        if(!xStr || !yStr) return;
  
        const x = parseFloat(xStr);
        const y = parseFloat(yStr);
        
        const change = x * (y / 100);
        const res = op === 'inc' ? x + change : x - change;
        const opSign = op === 'inc' ? '+' : '-';
        displayResult(`Result is <strong>${TK.formatNumber(res)}</strong>`, `${x} ${opSign} (${x} × ${y}/100) = ${res}`);
    };
  
    document.getElementById('copyResultBtn').onclick = function () {
        let text = mainResultText.innerText + '\nFormula: ' + formulaUsed.textContent;
        TK.copyToClipboard(text, this);
    };
  
  })();
