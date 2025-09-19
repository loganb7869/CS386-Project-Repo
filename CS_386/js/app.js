
(function(){
  const path = location.pathname.split('/').pop() || 'index.html';
  document.querySelectorAll('.left-menu a').forEach(a => {
    if (a.getAttribute('href') === path) a.classList.add('active');
  });

  const weightRows = document.getElementById('weightRows');
  if (weightRows) {
    const sample = [{date:'2025-09-01', w:80.2},{date:'2025-08-31', w:80.6},{date:'2025-08-30', w:80.4}];
    weightRows.innerHTML = sample.map(s=>`<tr><td>${s.date}</td><td>${s.w}</td></tr>`).join('');
  }

  window.demoCalculateMacros = function(e){
    e.preventDefault();
    const f=e.target,w=parseFloat(f.weight.value||0),ppk=parseFloat(f.ppk.value||1.8),fpk=parseFloat(f.fpk.value||0.6);
    const protein=Math.round(w*ppk),fat=Math.round(w*fpk),calories=Math.round(w*30);
    const carbs=Math.max(0,Math.round((calories-(protein*4+fat*9))/4));
    document.getElementById('macroResult').style.display='block';
    cals.textContent=calories;prot.textContent=protein;carb.textContent=carbs;fat.textContent=fat;
    return false;
  };
  window.demoAddGoal = e => {e.preventDefault(); const f=e.target;
    goalsTable.querySelector('tbody').insertAdjacentHTML('afterbegin',`<tr><td>${f.type.value}</td><td>${f.target.value}</td><td>${f.unit.value}</td><td>${f.date.value}</td></tr>`); f.reset(); return false;};
  window.demoEstimateCost = e => {e.preventDefault(); const f=e.target; const per=(parseFloat(f.budget.value||0)/(parseInt(f.days.value||30,10)||1)); costOut.innerHTML=`<div class="card"><strong>$${per.toFixed(2)}</strong> per day (est.)</div>`; return false;};
  window.demoAddAllergy = e => {e.preventDefault(); const name=e.target.name.value.trim(); if(!name) return false; allergyList.insertAdjacentHTML('beforeend',`<span class="pill" style="margin-right:8px">${name}</span>`); e.target.reset(); return false;};
  window.demoAddWeight = e => {e.preventDefault(); const f=e.target; weightsTable.querySelector('tbody').insertAdjacentHTML('afterbegin',`<tr><td>${f.date.value}</td><td>${f.weight.value}</td></tr>`); f.reset(); return false;};
  window.demoAddEntry = e => {e.preventDefault(); const f=e.target; const kcal=(parseFloat(f.kcal.value)||0)*(parseFloat(f.servings.value)||1); diaryTable.querySelector('tbody').insertAdjacentHTML('afterbegin',`<tr><td>${f.meal.value}</td><td>${f.food.value}</td><td>${f.servings.value}</td><td>${kcal}</td></tr>`); f.reset(); return false;};
})();
