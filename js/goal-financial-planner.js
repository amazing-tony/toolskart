/* =========================================================
   Amazing-Tools — Life Goal & Financial Freedom Planner
   Multi-Goal Inflation-Adjusted SIP Engine with Multi-Child Support
   ========================================================= */

(function () {
  'use strict';

  // Global Return Input
  const globalReturnRateInput = document.getElementById('globalReturnRate');

  // Goal 1: Retirement Inputs
  const retCurrentAgeInput = document.getElementById('retCurrentAge');
  const retRetireAgeInput = document.getElementById('retRetireAge');
  const retLifeExpectancyInput = document.getElementById('retLifeExpectancy');
  const retCurrentExpenseInput = document.getElementById('retCurrentExpense');
  const retInflationInput = document.getElementById('retInflation');
  const retPostReturnInput = document.getElementById('retPostReturn');

  const retSipBadge = document.getElementById('retSipBadge');
  const retAgeExpenseLabel = document.getElementById('retAgeExpenseLabel');
  const retFutureExpense = document.getElementById('retFutureExpense');
  const retRequiredCorpus = document.getElementById('retRequiredCorpus');
  const retMonthlySipText = document.getElementById('retMonthlySipText');

  // Goal 2: Children Planning Module
  const childrenContainer = document.getElementById('childrenContainer');
  const btnAddChild = document.getElementById('btnAddChild');
  const allChildrenSipBadge = document.getElementById('allChildrenSipBadge');

  // Goal 3: Home Down Payment Inputs
  const homeYearsToGoalInput = document.getElementById('homeYearsToGoal');
  const homeCurrentCostInput = document.getElementById('homeCurrentCost');
  const homeInflationInput = document.getElementById('homeInflation');

  const homeSipBadge = document.getElementById('homeSipBadge');
  const homeFutureCost = document.getElementById('homeFutureCost');
  const homeMonthlySipText = document.getElementById('homeMonthlySipText');

  // Goal 4: Other Milestones Inputs
  const otherGoalNameInput = document.getElementById('otherGoalName');
  const otherYearsToGoalInput = document.getElementById('otherYearsToGoal');
  const otherCurrentCostInput = document.getElementById('otherCurrentCost');
  const otherInflationInput = document.getElementById('otherInflation');

  const otherSipBadge = document.getElementById('otherSipBadge');
  const otherFutureCost = document.getElementById('otherFutureCost');
  const otherMonthlySipText = document.getElementById('otherMonthlySipText');

  // Summary Elements
  const totalRequiredSipBadge = document.getElementById('totalRequiredSipBadge');
  const totalGoalsTargetBadge = document.getElementById('totalGoalsTargetBadge');
  const goalsTableBody = document.getElementById('goalsTableBody');
  const exportGoalsCsvBtn = document.getElementById('exportGoalsCsvBtn');

  // Chart instances
  let sipAllocationChart = null;
  let goalRoadmapChart = null;
  let cachedGoals = [];

  // Child State Data (Defaults to 2 children matching Financial_Planning-8.xls model)
  let nextChildId = 3;
  let children = [
    {
      id: 1,
      name: 'Child 1',
      currentAge: 8,
      collegeAge: 18,
      eduCost: 2000000,
      eduInflation: 9.0,
      eduEnabled: true,
      marriageAge: 24,
      marCost: 1500000,
      marInflation: 7.5,
      marEnabled: true
    },
    {
      id: 2,
      name: 'Child 2',
      currentAge: 4,
      collegeAge: 18,
      eduCost: 2000000,
      eduInflation: 9.0,
      eduEnabled: true,
      marriageAge: 28,
      marCost: 1500000,
      marInflation: 7.5,
      marEnabled: true
    }
  ];

  // Distinct color palettes for child goals
  const childPalette = [
    { edu: '#10b981', mar: '#f59e0b' },
    { edu: '#06b6d4', mar: '#ec4899' },
    { edu: '#14b8a6', mar: '#f97316' },
    { edu: '#3b82f6', mar: '#a855f7' }
  ];

  // Helpers
  function formatINR(val) {
    if (isNaN(val) || val === null) return '₹ 0';
    return '₹ ' + Math.round(val).toLocaleString('en-IN');
  }

  function formatLakhCrore(val) {
    if (isNaN(val)) return '₹ 0';
    const absVal = Math.abs(val);
    const sign = val < 0 ? '-' : '';
    if (absVal >= 10000000) {
      return `${sign}₹ ${(absVal / 10000000).toFixed(2)} Cr`;
    } else if (absVal >= 100000) {
      return `${sign}₹ ${(absVal / 100000).toFixed(2)} L`;
    } else if (absVal >= 1000) {
      return `${sign}₹ ${(absVal / 1000).toFixed(1)} K`;
    }
    return `${sign}₹ ${Math.round(absVal)}`;
  }

  function calculateSipForTarget(futureCorpus, years, annualReturn) {
    if (years <= 0 || futureCorpus <= 0) return 0;
    const months = years * 12;
    const monthlyRate = annualReturn / 12;
    if (monthlyRate === 0) return futureCorpus / months;
    const factor = Math.pow(1 + monthlyRate, months);
    return (futureCorpus * monthlyRate) / ((1 + monthlyRate) * (factor - 1));
  }

  // Render Dynamic Children Cards
  function renderChildren() {
    if (!childrenContainer) return;
    if (children.length === 0) {
      childrenContainer.innerHTML = `
        <div style="text-align:center; padding:2rem 1rem; background:rgba(0,0,0,0.02); border:1px dashed var(--color-border, #cbd5e1); border-radius:10px;">
          <p style="margin:0 0 0.75rem; color:var(--color-text-secondary); font-size:0.92rem;">No children goals currently added.</p>
          <button type="button" class="btn btn-primary btn-sm" id="btnEmptyAddChild">➕ Add First Child</button>
        </div>
      `;
      const btnEmptyAddChild = document.getElementById('btnEmptyAddChild');
      if (btnEmptyAddChild) {
        btnEmptyAddChild.addEventListener('click', addChild);
      }
      return;
    }

    let html = '';
    children.forEach((child, index) => {
      const colors = childPalette[index % childPalette.length];
      html += `
        <div class="child-card" data-child-id="${child.id}" style="background:var(--color-surface, #fff); border:1px solid var(--color-border, #e2e8f0); border-radius:10px; padding:1.25rem; box-shadow:0 2px 8px rgba(0,0,0,0.03);">
          <div style="display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:0.75rem; border-bottom:1px solid var(--color-border, #e2e8f0); padding-bottom:0.75rem; margin-bottom:1rem;">
            <div style="display:flex; align-items:center; gap:0.6rem; flex-wrap:wrap;">
              <span style="font-size:1.3rem;">👶</span>
              <input type="text" class="input-field child-name-input" data-child-id="${child.id}" value="${child.name}" style="font-weight:700; width:130px; padding:0.35rem 0.6rem; font-size:0.95rem;">
              <div style="display:flex; align-items:center; gap:0.35rem; font-size:0.88rem; color:var(--color-text-secondary);">
                <label>Current Age:</label>
                <input type="number" class="input-field child-age-input" data-child-id="${child.id}" value="${child.currentAge}" min="0" max="25" style="width:65px; padding:0.35rem 0.45rem; text-align:center;">
                <span>Yrs</span>
              </div>
            </div>
            <div style="display:flex; align-items:center; gap:0.75rem; flex-wrap:wrap;">
              <span class="calc-val-badge child-combined-sip-badge" id="childSipBadge_${child.id}" style="background:rgba(16,185,129,0.12); color:#047857; border:1px solid #a7f3d0; font-weight:700; font-size:0.85rem;">SIP: ₹ 0/mo</span>
              <button type="button" class="btn btn-outline btn-sm btn-remove-child" data-child-id="${child.id}" title="Remove Child" style="color:#ef4444; border-color:#fca5a5; padding:0.25rem 0.65rem; font-size:0.78rem;">🗑️ Remove</button>
            </div>
          </div>

          <!-- 2 Columns: Higher Education & Marriage -->
          <div style="display:grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap:1.25rem;">
            <!-- Higher Education Column -->
            <div style="background:rgba(16,185,129,0.03); border:1px solid rgba(16,185,129,0.22); border-radius:8px; padding:1rem;">
              <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:0.75rem;">
                <label style="display:flex; align-items:center; gap:0.45rem; font-weight:700; color:#065f46; cursor:pointer; font-size:0.92rem;">
                  <input type="checkbox" class="child-edu-enabled" data-child-id="${child.id}" ${child.eduEnabled ? 'checked' : ''} style="accent-color:#10b981; width:16px; height:16px;">
                  🎓 Higher Education
                </label>
                <span class="child-edu-years-badge" id="childEduYears_${child.id}" style="font-size:0.8rem; color:#047857; font-weight:600;">10 Yrs away</span>
              </div>
              <div style="display:grid; grid-template-columns: 1fr 1fr; gap:0.75rem;">
                <div class="form-group" style="margin-bottom:0.5rem;">
                  <label style="font-size:0.8rem; margin-bottom:0.2rem;">College Entry Age</label>
                  <input type="number" class="input-field child-college-age" data-child-id="${child.id}" value="${child.collegeAge}" min="14" max="28">
                </div>
                <div class="form-group" style="margin-bottom:0.5rem;">
                  <label style="font-size:0.8rem; margin-bottom:0.2rem;">Today's Cost (₹)</label>
                  <input type="number" class="input-field child-edu-cost" data-child-id="${child.id}" value="${child.eduCost}" min="100000" step="100000">
                </div>
              </div>
              <div class="form-group" style="margin-bottom:0.75rem;">
                <label style="font-size:0.8rem; margin-bottom:0.2rem;">Education Inflation (% p.a.)</label>
                <input type="number" class="input-field child-edu-inf" data-child-id="${child.id}" value="${child.eduInflation}" min="4" max="15" step="0.5">
              </div>
              <div class="goal-result-strip" style="background:rgba(16,185,129,0.08); border:1px solid rgba(16,185,129,0.25); border-radius:6px; padding:0.5rem 0.75rem; font-size:0.82rem; display:flex; justify-content:space-between; flex-wrap:wrap; gap:0.5rem; color:var(--color-text, #0f172a);">
                <span>Future Target: <strong id="childEduFuture_${child.id}" style="color:#047857;">₹ 0</strong></span>
                <span>SIP: <strong id="childEduSip_${child.id}" style="color:#10b981;">₹ 0/mo</strong></span>
              </div>
            </div>

            <!-- Marriage Column -->
            <div style="background:rgba(245,158,11,0.03); border:1px solid rgba(245,158,11,0.22); border-radius:8px; padding:1rem;">
              <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:0.75rem;">
                <label style="display:flex; align-items:center; gap:0.45rem; font-weight:700; color:#92400e; cursor:pointer; font-size:0.92rem;">
                  <input type="checkbox" class="child-mar-enabled" data-child-id="${child.id}" ${child.marEnabled ? 'checked' : ''} style="accent-color:#f59e0b; width:16px; height:16px;">
                  💍 Marriage Celebration
                </label>
                <span class="child-mar-years-badge" id="childMarYears_${child.id}" style="font-size:0.8rem; color:#b45309; font-weight:600;">16 Yrs away</span>
              </div>
              <div style="display:grid; grid-template-columns: 1fr 1fr; gap:0.75rem;">
                <div class="form-group" style="margin-bottom:0.5rem;">
                  <label style="font-size:0.8rem; margin-bottom:0.2rem;">Marriage Age</label>
                  <input type="number" class="input-field child-mar-age" data-child-id="${child.id}" value="${child.marriageAge}" min="18" max="40">
                </div>
                <div class="form-group" style="margin-bottom:0.5rem;">
                  <label style="font-size:0.8rem; margin-bottom:0.2rem;">Today's Cost (₹)</label>
                  <input type="number" class="input-field child-mar-cost" data-child-id="${child.id}" value="${child.marCost}" min="100000" step="100000">
                </div>
              </div>
              <div class="form-group" style="margin-bottom:0.75rem;">
                <label style="font-size:0.8rem; margin-bottom:0.2rem;">Marriage Inflation (% p.a.)</label>
                <input type="number" class="input-field child-mar-inf" data-child-id="${child.id}" value="${child.marInflation}" min="3" max="15" step="0.5">
              </div>
              <div class="goal-result-strip" style="background:rgba(245,158,11,0.08); border:1px solid rgba(245,158,11,0.25); border-radius:6px; padding:0.5rem 0.75rem; font-size:0.82rem; display:flex; justify-content:space-between; flex-wrap:wrap; gap:0.5rem; color:var(--color-text, #0f172a);">
                <span>Future Target: <strong id="childMarFuture_${child.id}" style="color:#b45309;">₹ 0</strong></span>
                <span>SIP: <strong id="childMarSip_${child.id}" style="color:#d97706;">₹ 0/mo</strong></span>
              </div>
            </div>
          </div>
        </div>
      `;
    });

    childrenContainer.innerHTML = html;
    bindChildEvents();
  }

  // Bind Events for Dynamically Created Child Inputs
  function bindChildEvents() {
    if (!childrenContainer) return;

    // Child Name
    childrenContainer.querySelectorAll('.child-name-input').forEach(input => {
      input.addEventListener('input', (e) => {
        const id = parseInt(e.target.dataset.childId, 10);
        const child = children.find(c => c.id === id);
        if (child) {
          child.name = e.target.value.trim() || `Child ${id}`;
          calculateAllGoals();
        }
      });
    });

    // Current Age
    childrenContainer.querySelectorAll('.child-age-input').forEach(input => {
      input.addEventListener('input', (e) => {
        const id = parseInt(e.target.dataset.childId, 10);
        const child = children.find(c => c.id === id);
        if (child) {
          child.currentAge = Math.max(0, parseInt(e.target.value, 10) || 0);
          calculateAllGoals();
        }
      });
    });

    // Education Checkbox
    childrenContainer.querySelectorAll('.child-edu-enabled').forEach(input => {
      input.addEventListener('change', (e) => {
        const id = parseInt(e.target.dataset.childId, 10);
        const child = children.find(c => c.id === id);
        if (child) {
          child.eduEnabled = e.target.checked;
          calculateAllGoals();
        }
      });
    });

    // College Age
    childrenContainer.querySelectorAll('.child-college-age').forEach(input => {
      input.addEventListener('input', (e) => {
        const id = parseInt(e.target.dataset.childId, 10);
        const child = children.find(c => c.id === id);
        if (child) {
          child.collegeAge = parseInt(e.target.value, 10) || 18;
          calculateAllGoals();
        }
      });
    });

    // Education Cost
    childrenContainer.querySelectorAll('.child-edu-cost').forEach(input => {
      input.addEventListener('input', (e) => {
        const id = parseInt(e.target.dataset.childId, 10);
        const child = children.find(c => c.id === id);
        if (child) {
          child.eduCost = parseFloat(e.target.value) || 0;
          calculateAllGoals();
        }
      });
    });

    // Education Inflation
    childrenContainer.querySelectorAll('.child-edu-inf').forEach(input => {
      input.addEventListener('input', (e) => {
        const id = parseInt(e.target.dataset.childId, 10);
        const child = children.find(c => c.id === id);
        if (child) {
          child.eduInflation = parseFloat(e.target.value) || 9.0;
          calculateAllGoals();
        }
      });
    });

    // Marriage Checkbox
    childrenContainer.querySelectorAll('.child-mar-enabled').forEach(input => {
      input.addEventListener('change', (e) => {
        const id = parseInt(e.target.dataset.childId, 10);
        const child = children.find(c => c.id === id);
        if (child) {
          child.marEnabled = e.target.checked;
          calculateAllGoals();
        }
      });
    });

    // Marriage Age
    childrenContainer.querySelectorAll('.child-mar-age').forEach(input => {
      input.addEventListener('input', (e) => {
        const id = parseInt(e.target.dataset.childId, 10);
        const child = children.find(c => c.id === id);
        if (child) {
          child.marriageAge = parseInt(e.target.value, 10) || 26;
          calculateAllGoals();
        }
      });
    });

    // Marriage Cost
    childrenContainer.querySelectorAll('.child-mar-cost').forEach(input => {
      input.addEventListener('input', (e) => {
        const id = parseInt(e.target.dataset.childId, 10);
        const child = children.find(c => c.id === id);
        if (child) {
          child.marCost = parseFloat(e.target.value) || 0;
          calculateAllGoals();
        }
      });
    });

    // Marriage Inflation
    childrenContainer.querySelectorAll('.child-mar-inf').forEach(input => {
      input.addEventListener('input', (e) => {
        const id = parseInt(e.target.dataset.childId, 10);
        const child = children.find(c => c.id === id);
        if (child) {
          child.marInflation = parseFloat(e.target.value) || 7.5;
          calculateAllGoals();
        }
      });
    });

    // Remove Child Button
    childrenContainer.querySelectorAll('.btn-remove-child').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const id = parseInt(e.currentTarget.dataset.childId, 10);
        removeChild(id);
      });
    });
  }

  function addChild() {
    const newId = nextChildId++;
    const newName = `Child ${newId}`;
    children.push({
      id: newId,
      name: newName,
      currentAge: 2,
      collegeAge: 18,
      eduCost: 2000000,
      eduInflation: 9.0,
      eduEnabled: true,
      marriageAge: 26,
      marCost: 1500000,
      marInflation: 7.5,
      marEnabled: true
    });
    renderChildren();
    calculateAllGoals();
  }

  function removeChild(id) {
    children = children.filter(c => c.id !== id);
    renderChildren();
    calculateAllGoals();
  }

  if (btnAddChild) {
    btnAddChild.addEventListener('click', addChild);
  }

  // Master Calculation Function
  function calculateAllGoals() {
    const globalReturn = (parseFloat(globalReturnRateInput ? globalReturnRateInput.value : 12) || 12) / 100;

    // 1. Retirement Calculation
    const curAge = parseInt(retCurrentAgeInput.value, 10) || 37;
    const retAge = parseInt(retRetireAgeInput.value, 10) || 60;
    const lifeAge = parseInt(retLifeExpectancyInput.value, 10) || 73;
    const monthlyExp = parseFloat(retCurrentExpenseInput.value) || 45000;
    const retInf = (parseFloat(retInflationInput.value) || 6) / 100;
    const retPostRet = (parseFloat(retPostReturnInput.value) || 8) / 100;

    const yearsToRetire = Math.max(1, retAge - curAge);
    const payoutYears = Math.max(1, lifeAge - retAge);

    if (retAgeExpenseLabel) {
      retAgeExpenseLabel.textContent = retAge;
    }

    const futureMonthlyExp = monthlyExp * Math.pow(1 + retInf, yearsToRetire);
    const futureAnnualExp = futureMonthlyExp * 12;

    const realRetRate = (1 + retPostRet) / (1 + retInf) - 1;
    let requiredCorpus = 0;
    if (Math.abs(realRetRate) < 0.0001) {
      requiredCorpus = futureAnnualExp * payoutYears;
    } else {
      requiredCorpus = futureAnnualExp * ((1 - Math.pow(1 + realRetRate, -payoutYears)) / realRetRate);
    }

    const retSip = calculateSipForTarget(requiredCorpus, yearsToRetire, globalReturn);

    retFutureExpense.textContent = `${formatLakhCrore(futureMonthlyExp)}/mo`;
    retRequiredCorpus.textContent = formatLakhCrore(requiredCorpus);
    retMonthlySipText.textContent = `${formatINR(retSip)}/mo`;
    retSipBadge.textContent = `SIP: ${formatINR(retSip)}/mo`;

    // 2. Multi-Child Calculation
    let allChildrenTotalSip = 0;
    let allChildrenFutureCorpus = 0;
    const childGoalItems = [];

    children.forEach((child, index) => {
      let childCombinedSip = 0;
      const palette = childPalette[index % childPalette.length];

      // Higher Education
      if (child.eduEnabled && child.eduCost > 0) {
        const yearsToEdu = Math.max(1, child.collegeAge - child.currentAge);
        const futureEduCost = child.eduCost * Math.pow(1 + (child.eduInflation / 100), yearsToEdu);
        const eduSip = calculateSipForTarget(futureEduCost, yearsToEdu, globalReturn);

        childCombinedSip += eduSip;
        allChildrenTotalSip += eduSip;
        allChildrenFutureCorpus += futureEduCost;

        const eduYearsEl = document.getElementById(`childEduYears_${child.id}`);
        const eduFutureEl = document.getElementById(`childEduFuture_${child.id}`);
        const eduSipEl = document.getElementById(`childEduSip_${child.id}`);
        if (eduYearsEl) eduYearsEl.textContent = `${yearsToEdu} Yrs away`;
        if (eduFutureEl) eduFutureEl.textContent = formatLakhCrore(futureEduCost);
        if (eduSipEl) eduSipEl.textContent = `${formatINR(eduSip)}/mo`;

        childGoalItems.push({
          name: `🎓 ${child.name} - Higher Education`,
          years: yearsToEdu,
          currentCost: child.eduCost,
          inflation: child.eduInflation,
          futureTarget: futureEduCost,
          sip: eduSip,
          color: palette.edu
        });
      } else {
        const eduFutureEl = document.getElementById(`childEduFuture_${child.id}`);
        const eduSipEl = document.getElementById(`childEduSip_${child.id}`);
        if (eduFutureEl) eduFutureEl.textContent = '₹ 0 (Excluded)';
        if (eduSipEl) eduSipEl.textContent = '₹ 0/mo';
      }

      // Marriage
      if (child.marEnabled && child.marCost > 0) {
        const yearsToMar = Math.max(1, child.marriageAge - child.currentAge);
        const futureMarCost = child.marCost * Math.pow(1 + (child.marInflation / 100), yearsToMar);
        const marSip = calculateSipForTarget(futureMarCost, yearsToMar, globalReturn);

        childCombinedSip += marSip;
        allChildrenTotalSip += marSip;
        allChildrenFutureCorpus += futureMarCost;

        const marYearsEl = document.getElementById(`childMarYears_${child.id}`);
        const marFutureEl = document.getElementById(`childMarFuture_${child.id}`);
        const marSipEl = document.getElementById(`childMarSip_${child.id}`);
        if (marYearsEl) marYearsEl.textContent = `${yearsToMar} Yrs away`;
        if (marFutureEl) marFutureEl.textContent = formatLakhCrore(futureMarCost);
        if (marSipEl) marSipEl.textContent = `${formatINR(marSip)}/mo`;

        childGoalItems.push({
          name: `💍 ${child.name} - Marriage Fund`,
          years: yearsToMar,
          currentCost: child.marCost,
          inflation: child.marInflation,
          futureTarget: futureMarCost,
          sip: marSip,
          color: palette.mar
        });
      } else {
        const marFutureEl = document.getElementById(`childMarFuture_${child.id}`);
        const marSipEl = document.getElementById(`childMarSip_${child.id}`);
        if (marFutureEl) marFutureEl.textContent = '₹ 0 (Excluded)';
        if (marSipEl) marSipEl.textContent = '₹ 0/mo';
      }

      const childBadgeEl = document.getElementById(`childSipBadge_${child.id}`);
      if (childBadgeEl) {
        childBadgeEl.textContent = `${child.name} SIP: ${formatINR(childCombinedSip)}/mo`;
      }
    });

    if (allChildrenSipBadge) {
      allChildrenSipBadge.textContent = `All Children SIP: ${formatINR(allChildrenTotalSip)}/mo`;
    }

    // 3. Home Down Payment Calculation
    const yearsToHome = Math.max(1, parseInt(homeYearsToGoalInput.value, 10) || 5);
    const homeCost0 = parseFloat(homeCurrentCostInput.value) || 1500000;
    const homeInf = (parseFloat(homeInflationInput.value) || 7) / 100;

    const futureHomeCost = homeCost0 * Math.pow(1 + homeInf, yearsToHome);
    const homeSip = calculateSipForTarget(futureHomeCost, yearsToHome, globalReturn);

    homeFutureCost.textContent = formatLakhCrore(futureHomeCost);
    homeMonthlySipText.textContent = `${formatINR(homeSip)}/mo`;
    homeSipBadge.textContent = `SIP: ${formatINR(homeSip)}/mo`;

    // 4. Other Milestones Calculation
    const otherName = (otherGoalNameInput && otherGoalNameInput.value.trim()) || 'Vehicle / Dream Vacation';
    const yearsToOther = Math.max(1, parseInt(otherYearsToGoalInput ? otherYearsToGoalInput.value : 3, 10) || 3);
    const otherCost0 = parseFloat(otherCurrentCostInput ? otherCurrentCostInput.value : 500000) || 0;
    const otherInf = (parseFloat(otherInflationInput ? otherInflationInput.value : 6) || 6) / 100;

    let futureOtherCost = 0;
    let otherSip = 0;
    if (otherCost0 > 0) {
      futureOtherCost = otherCost0 * Math.pow(1 + otherInf, yearsToOther);
      otherSip = calculateSipForTarget(futureOtherCost, yearsToOther, globalReturn);
    }

    if (otherFutureCost) otherFutureCost.textContent = formatLakhCrore(futureOtherCost);
    if (otherMonthlySipText) otherMonthlySipText.textContent = `${formatINR(otherSip)}/mo`;
    if (otherSipBadge) otherSipBadge.textContent = `SIP: ${formatINR(otherSip)}/mo`;

    // --- CONSOLIDATED TOTALS ---
    const totalMonthlySip = retSip + allChildrenTotalSip + homeSip + otherSip;
    const totalFutureCorpus = requiredCorpus + allChildrenFutureCorpus + futureHomeCost + futureOtherCost;

    totalRequiredSipBadge.textContent = `${formatINR(totalMonthlySip)} / month`;
    const totalGoalCount = 1 + childGoalItems.length + 1 + (otherCost0 > 0 ? 1 : 0);
    totalGoalsTargetBadge.textContent = `To fund ${totalGoalCount} life goals totaling ${formatLakhCrore(totalFutureCorpus)} in future value`;

    // Data for Table & Charts
    cachedGoals = [
      { name: '🌴 Retirement Corpus', years: yearsToRetire, currentCost: monthlyExp * 12, inflation: retInf * 100, futureTarget: requiredCorpus, sip: retSip, color: '#2563eb' },
      ...childGoalItems,
      { name: '🏠 Home Down Payment', years: yearsToHome, currentCost: homeCost0, inflation: homeInf * 100, futureTarget: futureHomeCost, sip: homeSip, color: '#8b5cf6' }
    ];

    if (otherCost0 > 0) {
      cachedGoals.push({
        name: `🎉 ${otherName}`,
        years: yearsToOther,
        currentCost: otherCost0,
        inflation: otherInf * 100,
        futureTarget: futureOtherCost,
        sip: otherSip,
        color: '#f59e0b'
      });
    }

    updateGoalsTable(cachedGoals);
    updateCharts(cachedGoals, totalMonthlySip, globalReturn);
  }

  function updateGoalsTable(goals) {
    if (!goalsTableBody) return;
    let html = '';
    goals.forEach(g => {
      html += `
        <tr style="border-bottom: 1px solid var(--border-color, #f1f5f9);">
          <td style="padding:0.75rem; text-align:left; font-weight:600; color:var(--color-text, #0f172a);">${g.name}</td>
          <td style="padding:0.75rem; color:var(--color-text-secondary, #475569);">${g.years} Yrs</td>
          <td style="padding:0.75rem; color:var(--color-text-secondary, #475569);">${formatLakhCrore(g.currentCost)}</td>
          <td style="padding:0.75rem; color:var(--color-text-secondary, #475569);">${g.inflation.toFixed(1)}%</td>
          <td style="padding:0.75rem; font-weight:700; color:var(--color-text, #0f172a);">${formatLakhCrore(g.futureTarget)}</td>
          <td style="padding:0.75rem; color:#2563eb; font-weight:700;">${formatINR(g.sip)}/mo</td>
        </tr>
      `;
    });
    goalsTableBody.innerHTML = html;
  }

  function updateCharts(goals, totalSip, globalReturn) {
    // 1. Donut Chart - SIP Allocation
    const ctxDonut = document.getElementById('sipAllocationChart');
    if (ctxDonut) {
      if (sipAllocationChart) sipAllocationChart.destroy();
      sipAllocationChart = new Chart(ctxDonut, {
        type: 'doughnut',
        data: {
          labels: goals.map(g => g.name),
          datasets: [{
            data: goals.map(g => Math.round(g.sip)),
            backgroundColor: goals.map(g => g.color),
            borderWidth: 2
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            tooltip: {
              callbacks: {
                label: function (ctx) {
                  const val = ctx.raw;
                  const pct = totalSip > 0 ? ((val / totalSip) * 100).toFixed(1) : 0;
                  return `${ctx.label}: ${formatINR(val)}/mo (${pct}%)`;
                }
              }
            },
            legend: { position: 'right' }
          }
        }
      });
    }

    // 2. Goal Roadmap Chart (Accumulation Curve)
    const ctxRoadmap = document.getElementById('goalRoadmapChart');
    if (ctxRoadmap) {
      if (goalRoadmapChart) goalRoadmapChart.destroy();

      const maxYears = Math.min(30, Math.max(10, ...goals.map(g => g.years)));
      const labels = [];
      const portfolioCurve = [];
      const monthlyRate = globalReturn / 12;

      for (let y = 1; y <= maxYears; y++) {
        labels.push(`Year ${y}`);
        let balance = 0;
        goals.forEach(g => {
          if (y <= g.years) {
            const months = y * 12;
            const factor = Math.pow(1 + monthlyRate, months);
            const val = g.sip * ((factor - 1) / monthlyRate) * (1 + monthlyRate);
            balance += val;
          } else {
            balance += g.futureTarget;
          }
        });
        portfolioCurve.push(Math.round(balance));
      }

      const targetWrap = document.querySelector('.planner-summary-card') || document.querySelector('.roadmap-card') || ctxRoadmap.parentElement;
      const api = window.AmazingTools || window['Amazing-Tools'];
      if (targetWrap && api && api.attachGratitudeBadge) {
        api.attachGratitudeBadge(targetWrap, {
          title: 'Did this financial roadmap bring clarity to your goals?',
          desc: 'Amazing-Tools is 100% free and client-side private. Support our developer or feel free to keep planning your family’s future — your success inspires us!'
        });
      }

      goalRoadmapChart = new Chart(ctxRoadmap, {
        type: 'line',
        data: {
          labels: labels,
          datasets: [{
            label: 'Total Accumulated Wealth Portfolio',
            data: portfolioCurve,
            borderColor: '#2563eb',
            backgroundColor: 'rgba(37, 99, 235, 0.1)',
            borderWidth: 3,
            fill: true,
            tension: 0.3
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            tooltip: {
              callbacks: {
                label: function (ctx) {
                  return `Portfolio: ${formatLakhCrore(ctx.raw)}`;
                }
              }
            }
          },
          scales: {
            y: {
              ticks: {
                callback: function (val) {
                  return formatLakhCrore(val);
                }
              }
            }
          }
        }
      });
    }
  }

  // --- CSV EXPORT ---
  if (exportGoalsCsvBtn) {
    exportGoalsCsvBtn.addEventListener('click', () => {
      if (!cachedGoals.length) return;
      let csv = 'Goal,Years to Goal,Current Cost (INR),Inflation %,Future Target (INR),Monthly SIP Required (INR)\n';
      cachedGoals.forEach(g => {
        csv += `"${g.name}",${g.years},${Math.round(g.currentCost)},${g.inflation.toFixed(1)},${Math.round(g.futureTarget)},${Math.round(g.sip)}\n`;
      });

      const totalSip = cachedGoals.reduce((sum, g) => sum + g.sip, 0);
      const totalFuture = cachedGoals.reduce((sum, g) => sum + g.futureTarget, 0);
      csv += `\n"TOTAL CONSOLIDATED PORTFOLIO",-,${formatINR(totalFuture)},-,${formatINR(totalFuture)},${formatINR(totalSip)}/mo\n`;

      csv += '\n# USER VERIFICATION DECLARATION & DISCLAIMER NOTICE\n';
      csv += '# This output is provided freely by Amazing-tools (amazing-tools.github.io) solely for educational and planning assistance.\n';
      csv += '# Life goal milestones and required SIP contributions are subject to market returns and inflation variability.\n';
      csv += '# All computations must be independently verified at user level with your certified financial planner.\n';
      csv += '# Amazing-tools is not responsible or liable for any miscalculations or financial decisions made.\n';
      csv += '# Please report any discrepancies on our portal (hello@Amazing-Tools.com) for future corrections.\n';

      if ((window.AmazingTools || window['Amazing-Tools']) && (window.AmazingTools || window['Amazing-Tools']).downloadFile) {
        (window.AmazingTools || window['Amazing-Tools']).downloadFile(csv, 'Life_Goals_Financial_Roadmap.csv', 'text/csv');
      } else {
        const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'Life_Goals_Financial_Roadmap.csv';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
      }
    });
  }

  // Attach event listeners to static inputs
  const staticInputs = [
    globalReturnRateInput, retCurrentAgeInput, retRetireAgeInput, retLifeExpectancyInput,
    retCurrentExpenseInput, retInflationInput, retPostReturnInput,
    homeYearsToGoalInput, homeCurrentCostInput, homeInflationInput,
    otherGoalNameInput, otherYearsToGoalInput, otherCurrentCostInput, otherInflationInput
  ];

  staticInputs.forEach(input => {
    if (input) {
      input.addEventListener('input', calculateAllGoals);
      input.addEventListener('change', calculateAllGoals);
    }
  });

  // Initial render & calculation
  renderChildren();
  calculateAllGoals();

})();
