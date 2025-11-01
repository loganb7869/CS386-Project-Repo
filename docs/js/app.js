
console.log("CalPal app.js v18 loaded");


const LS_KEY = "cf";
let state = load();

function load() {
  try 
  
  {
    return JSON.parse(localStorage.getItem(LS_KEY) || "{}");
  } 
  catch 
  
  {
    return {};
  }
}
function save(obj) 

{
  localStorage.setItem(LS_KEY, JSON.stringify(obj));
}


const $  = (sel, root=document) => root.querySelector(sel);
const $$ = (sel, root=document) => Array.from(root.querySelectorAll(sel));

(function markActiveNav() 

{
  const path = location.pathname.split("/").pop() || "index.html"; $$(".nav-tabs a").forEach(a => 
    
    {
    if (a.getAttribute("href") === path) a.classList.add("active");

  });

}

)();

let _chartJSLoaded = false;
function ensureChartJs(cb) 

{

  if (_chartJSLoaded) return cb();
  const s = document.createElement("script");
  s.src = "https://cdn.jsdelivr.net/npm/chart.js@4.4.0/dist/chart.umd.min.js";
  s.onload = () => { _chartJSLoaded = true; cb(); };
  document.head.appendChild(s);

}

function mountDoughnut(canvasId, labels, data) 

{
  const el = document.getElementById(canvasId);
  if (!el) return;

  const ctx = el.getContext("2d");

  // eslint-disable-next-line no-undef
  new Chart(ctx, {
    type: "doughnut",
    data: 
    
    {
      labels,
      datasets: [{
        data,
        borderWidth: 0,
        hoverOffset: 4,
        backgroundColor: ["#8c1f13", "#d8902a", "#2f1b12"]
      }]
    },

    options: 
    
    {
      responsive: true,
      cutout: "60%",
      plugins: { legend: { display: true, position: "bottom" } }
    }

  });

}


function getTodayDiaryEntries() 

{
  state.diary = state.diary || { entries: [], todayKcal: 0 };
  const today = new Date().toISOString().slice(0,10);
  return state.diary.entries.filter(e => {
    return !e.date || e.date === today;

  });

}

// total kcal today
function getTodayCaloriesTotal() 

{
  const entries = getTodayDiaryEntries();
  let sum = 0;
  for (const e of entries) sum += e.kcal || 0;
  return sum;

}

// macro totals today
function getTodayMacroTotals() 

{
  const entries = getTodayDiaryEntries();
  let prot = 0, carb = 0, fat = 0;
  for (const e of entries) 
    {
    if (e.macros) 
      {
      prot += e.macros.proteinG || 0;
      carb += e.macros.carbsG   || 0;
      fat  += e.macros.fatG     || 0;
    }
  }
  return {
    proteinG: +prot.toFixed(1),
    carbsG:   +carb.toFixed(1),
    fatG:     +fat.toFixed(1),
  };
}


// how much $ spent today (from diary + manual cost page)
function getTodaySpend() 

{
  const today = new Date().toISOString().slice(0,10);
  state.cost = state.cost || { items: [] };

  let fromDiary = 0;
  for (const e of getTodayDiaryEntries()) 
    
    {
    if (e.costUsd) 
      
      {
      if (!e.date || e.date === today) 
        
        {
        fromDiary += Number(e.costUsd) || 0;
      }
    }
  }

  let fromCost = 0;
  for (const c of state.cost.items) 
    
    {
    if ((c.date || "") === today) 
      
      {
      fromCost += (c.unitCost || 0) * (c.qty || 0);
    }
  }

  return +(fromDiary + fromCost).toFixed(2);
}

function getMonthSpendStats() 

{
  state.cost = state.cost || { items: [] };
  const ym = new Date().toISOString().slice(0,7);
  let mtd = 0;
  let daySet = new Set();

  for (const c of state.cost.items) 
    
    {
    const d = c.date || "";
    if (d.startsWith(ym)) 
      
      {
      const totalForRow = (c.unitCost || 0) * (c.qty || 0);
      mtd += totalForRow;
      if (d) daySet.add(d);

    }
  }

  // add diary costs that we didn't explicitly log in cost page
  const today = new Date().toISOString().slice(0,10);
  for (const e of state.diary?.entries || []) 
    
    {
    if (e.costUsd) 
      
      {
      if (!e.date || e.date.startsWith(ym)) 
        
        {
        mtd += Number(e.costUsd) || 0;
        daySet.add(e.date || today);
      }
    }
  }

  const daysCount = daySet.size || 1;
  const avg = mtd / daysCount;
  return {
    mtd: +mtd.toFixed(2),
    avg: +avg.toFixed(2)
  };
}

// daily budget goal
function getDailyBudgetGoal() 

{
  if (!state.budgetDaily) 
    
    {
    state.budgetDaily = 20;
    save(state);
  }
  return Number(state.budgetDaily) || 20;
}

function renderHomeDashboard() 

{

  if (!$("#home-dashboard")) return;


  state.targets    = state.targets    || {};
  state.diary      = state.diary      || { entries: [], todayKcal: 0 };
  state.cost       = state.cost       || { items: [] };
  state.weightLogs = state.weightLogs || [];


  const calGoal       = Number(state.targets.calories) || 0;
  const calFoodTotal  = getTodayCaloriesTotal();
  const exerciseAdj   = 0;
  const calRemain     = Math.max(0, calGoal - calFoodTotal + exerciseAdj);
  const pctCal        = calGoal > 0

    ? Math.min(100, Math.round((calFoodTotal / calGoal) * 100))
    : 0;




  const calRing = $("#calRing");
  if (calRing) 
    {
    if (!calGoal) 
      {
      calRing.classList.add("ring--empty");
      calRing.style.setProperty("--pct", 0);
    } 
    
    else 
      
      {
      calRing.classList.remove("ring--empty");
      calRing.style.setProperty("--pct", pctCal);
    }

  }

  const elCalRemain      = $("#calRemain");
  const elCalGoal        = $("#calGoal");
  const elCalGoalShort   = $("#calGoalShort");
  const elCalFood        = $("#calFood");
  const elCalEx          = $("#calEx");
  const elCalEatenLabel  = $("#calEatenLabel");

  if (elCalRemain)     elCalRemain.textContent     = calRemain.toString();
  if (elCalGoal)       elCalGoal.textContent       = calGoal.toString();
  if (elCalGoalShort)  elCalGoalShort.textContent  = calGoal.toString();
  if (elCalFood)       elCalFood.textContent       = calFoodTotal.toString();
  if (elCalEx)         elCalEx.textContent         = exerciseAdj.toString();
  if (elCalEatenLabel) elCalEatenLabel.textContent = `${calFoodTotal} eaten`;

  const budgetGoal   = getDailyBudgetGoal();
  const spendToday   = getTodaySpend();
  const budgetLeft   = Math.max(0, budgetGoal - spendToday);
  const pctBudget    = budgetGoal > 0

    ? Math.min(100, Math.round((spendToday / budgetGoal) * 100))

    : 0;

  const budgetRing = $("#budgetRing");
  if (budgetRing) 
    
    {
    if (!budgetGoal) 
      
      {
      budgetRing.classList.add("ring--empty");
      budgetRing.style.setProperty("--pct", 0);
    } 
    
    else 
      
      {

      budgetRing.classList.remove("ring--empty");
      budgetRing.style.setProperty("--pct", pctBudget);

    }

  }

  const elBudgetRemain      = $("#budgetRemain");
  const elBudgetGoal        = $("#budgetGoal");
  const elBudgetGoalShort   = $("#budgetGoalShort");
  const elBudgetSpent       = $("#budgetSpent");
  const elBudgetSpentLabel  = $("#budgetSpentLabel");
  const elBudgetSpanLabel   = $("#budgetSpanLabel");
  const elBudgetAvgDay      = $("#budgetAvgDay");

  if (elBudgetRemain)     elBudgetRemain.textContent     = `$${budgetLeft.toFixed(2)}`;
  if (elBudgetGoal)       elBudgetGoal.textContent       = `$${budgetGoal.toFixed(2)}`;
  if (elBudgetGoalShort)  elBudgetGoalShort.textContent  = `$${budgetGoal.toFixed(2)}`;
  if (elBudgetSpent)      elBudgetSpent.textContent      = `$${spendToday.toFixed(2)}`;
  if (elBudgetSpentLabel) elBudgetSpentLabel.textContent = `$${spendToday.toFixed(2)} spent`;
  if (elBudgetSpanLabel)  elBudgetSpanLabel.textContent  = "today";
  if (elBudgetAvgDay)     elBudgetAvgDay.textContent     = `$${getMonthSpendStats().avg.toFixed(2)}`;


  const macroTotals = getTodayMacroTotals();

  const elSumCaloriesNow   = $("#sumCaloriesNow");
  const elSumCaloriesGoal  = $("#sumCaloriesGoal");
  const elSumSpendNow      = $("#sumSpendNow");
  const elSumSpendBudget   = $("#sumSpendBudget");
  const elSumProteinNow    = $("#sumProteinNow");
  const elSumProteinGoal   = $("#sumProteinGoal");
  const elSumCarbNow       = $("#sumCarbNow");
  const elSumCarbGoal      = $("#sumCarbGoal");

  if (elSumCaloriesNow)  elSumCaloriesNow.textContent  = calFoodTotal.toString();
  if (elSumCaloriesGoal) elSumCaloriesGoal.textContent = calGoal.toString();
  if (elSumSpendNow)     elSumSpendNow.textContent     = `$${spendToday.toFixed(2)}`;
  if (elSumSpendBudget)  elSumSpendBudget.textContent  = `$${budgetGoal.toFixed(2)}`;

  if (elSumProteinNow) elSumProteinNow.textContent = macroTotals.proteinG.toString();
  if (elSumProteinGoal) 
    
    {
    elSumProteinGoal.textContent =
      (state.targets.proteinG != null ? state.targets.proteinG : "—");
  }

  if (elSumCarbNow) elSumCarbNow.textContent = macroTotals.carbsG.toString();
  if (elSumCarbGoal) 
    
    {
    elSumCarbGoal.textContent =
      (state.targets.carbsG != null ? state.targets.carbsG : "—");
  }


  const weightChartCanvas = $("#homeWeightLine");
  if (weightChartCanvas) 
    
    {
    ensureChartJs(() => {
      const labels = (state.weightLogs || []).slice(-10).map(w => w.date ?? "");
      const data   = (state.weightLogs || []).slice(-10).map(w => w.value ?? 0);


      new Chart(weightChartCanvas.getContext("2d"), {
        type: "line",
        data: 
        
        {
          labels,
          datasets: [{
            data,
            tension: .35,
            fill: false,
            pointRadius: 3,
            borderWidth: 2,
            borderColor: "#7b2d1e"
          }]
        },
        options: 
        
        {
          plugins: { legend: { display:false } },
          scales: {
            x: { display:false },
            y: { display:false }
          }
        }
      });
    });
  }


  const monthStats = getMonthSpendStats();
  const elHomeBudget    = $("#homeBudget");
  const elHomeBudgetAvg = $("#homeBudgetAvg");
  if (elHomeBudget)    elHomeBudget.textContent    = `$${monthStats.mtd.toFixed(2)}`;
  if (elHomeBudgetAvg) elHomeBudgetAvg.textContent = `$${monthStats.avg.toFixed(2)}`;

  
  const streakEl = $("#streakDays");
  if (streakEl) 
    
    {
    const streak = calcStreakDays();
    streakEl.textContent = streak + " " + (streak === 1 ? "DAY" : "DAYS");
  }
}


function calcStreakDays() 

{

  const todayTotal = getTodayCaloriesTotal();
  return (todayTotal > 0) ? 1 : 0;
}



// USDA API key
const FDC_API_KEY = "v4NhmWvujaw80yDFytfbxLEjsUmhjOgEAV9l3f7N";

async function fdcSearch(query, pageSize = 10) 

{

  try 
  
  {
    const viaProxy = await fetch(`http://localhost:4000/api/fdc/search?q=${encodeURIComponent(query)}&pageSize=${pageSize}`);
    if (viaProxy.ok) return viaProxy.json();
  } 
  
  catch {}
  // direct USDA
  const url = new URL("https://api.nal.usda.gov/fdc/v1/foods/search");
  url.searchParams.set("api_key", FDC_API_KEY);
  url.searchParams.set("query", query);
  url.searchParams.set("pageSize", String(pageSize));
  url.searchParams.set("dataType", "Branded,Survey (FNDDS),SR Legacy");
  const res = await fetch(url.toString());
  if (!res.ok) throw new Error("FDC search failed");
  return res.json();
}

function extractMacros(food) 

{
  const byId = new Map((food.foodNutrients || []).map(n => [n.nutrientId, n]));
  const kcal = byId.get(1008)?.value ?? 0;
  const prot = byId.get(1003)?.value ?? 0;
  const carb = byId.get(1005)?.value ?? 0;
  const fat  = byId.get(1004)?.value ?? 0;
  const label = food.brandName
    ? `${food.description} — ${food.brandName}`
    : food.description;
  return {
    label,
    kcalPerServing: Math.round(kcal || 0),
    protPerServing: +prot || 0,
    carbPerServing: +carb || 0,
    fatPerServing:  +fat  || 0,
    servingDesc: (food.servingSize && food.servingSizeUnit)
      ? `${food.servingSize} ${food.servingSizeUnit}`
      : (food.servingSize ? `${food.servingSize}` : (food.brandOwner || ""))
  };

}

function wireDiaryEnhanced() 

{
  const searchForm = $("#foodSearchForm");
  const resultsBox = $("#foodResults");
  const addForm    = $("#diaryAddForm");
  const tableBody  = $("#diaryTable tbody");
  if (!searchForm || !resultsBox || !addForm || !tableBody) return;

  state.diary = state.diary || { entries: [], todayKcal: 0 };
  state.cost  = state.cost  || { items: [] };

  let pending = null;

  const renderDiary = () => {
    tableBody.innerHTML = state.diary.entries.slice().reverse().map(e => `
      <tr>
        <td>${e.meal || "—"}</td>
        <td>${e.food}</td>
        <td>${e.servings}</td>
        <td>${e.kcal}</td>
        <td>${e.costUsd ? `$${(+e.costUsd).toFixed(2)}` : "—"}</td>
      </tr>
    `).join("");
  };





  searchForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    const q = new FormData(searchForm).get("q")?.toString().trim();
    resultsBox.innerHTML = "";
    addForm.style.display = "none";
    pending = null;
    if (!q) return;

    resultsBox.innerHTML = `<div class="meta">Searching…</div>`;
    try 
    
    {
      const data = await fdcSearch(q, 12);
      const foods = (data.foods || []).map(extractMacros);

      if (!foods.length) 
        
        {
        resultsBox.innerHTML = `<div class="meta">No results.</div>`;
        return;
      }

      resultsBox.innerHTML = foods.map((f, i) => `
        <div class="card" style="margin-bottom:8px; display:flex; align-items:center; justify-content:space-between; gap:12px;">
          <div>
            <div><strong>${f.label}</strong></div>
            <div class="meta">${f.servingDesc || "per serving"}</div>
            <div class="meta">~ ${f.kcalPerServing} kcal • P ${f.protPerServing}g • C ${f.carbPerServing}g • F ${f.fatPerServing}g</div>
          </div>
          <button class="btn btn-sm" data-pick="${i}">Choose</button>
        </div>
      `).join("");

      resultsBox.querySelectorAll("[data-pick]").forEach(btn => {
        btn.addEventListener("click", () => {
          const i = +btn.dataset.pick;
          pending = foods[i];


          $("#selFoodName").value = pending.label;
          $("#selServings").value = 1;
          $("#selKcal").value     = pending.kcalPerServing;
          $("#selProt").value     = pending.protPerServing;
          $("#selCarb").value     = pending.carbPerServing;
          $("#selFat").value      = pending.fatPerServing;


          addForm.style.display = "grid";
          addForm.scrollIntoView({ behavior: "smooth", block: "center" });
        });


      });
    } 
    
    catch (err) 
    
    {

      console.error(err);
      resultsBox.innerHTML = `<div class="meta">Search failed. Try again.</div>`;

    }

  });




  addForm.addEventListener("submit", (e) => {
    e.preventDefault();
    if (!pending) return;

    const meal     = ($("#selMeal")?.value || "—");
    const servings = parseFloat($("#selServings").value) || 1;
    const kcalPer  = parseFloat($("#selKcal").value)    || 0;
    const protPer  = parseFloat($("#selProt").value)    || 0;
    const carbPer  = parseFloat($("#selCarb").value)    || 0;
    const fatPer   = parseFloat($("#selFat").value)     || 0;
    const pricePer = parseFloat($("#selPrice").value)   || 0;
    const store    = $("#selStore").value || "";
    const todayISO = new Date().toISOString().slice(0,10);





    const kcal = Math.round(kcalPer * servings);
    const entry = {
      date: todayISO,
      meal,
      food: pending.label,
      servings,
      kcal,
      macros: {
        proteinG: +(protPer * servings).toFixed(1),
        carbsG:   +(carbPer * servings).toFixed(1),
        fatG:     +(fatPer  * servings).toFixed(1),
      },

      costUsd: +(pricePer * servings).toFixed(2),
      store
    };

    state.diary.entries.push(entry);

    state.diary.todayKcal = getTodayCaloriesTotal();

    if (entry.costUsd > 0) 
      
      {
      state.cost.items.push({
        date: todayISO,
        name: entry.food,
        unitCost: pricePer,
        qty: servings,
        store
      });
    }

    save(state);
    addForm.reset();
    addForm.style.display = "none";
    resultsBox.innerHTML = "";
    pending = null;
    renderDiary();
  });



  renderDiary();
}


function wireDiarySimple() 

{
  const form = $("#diaryForm");
  const table = $("#diaryTable tbody");
  if (!form || !table) return;

  state.diary = state.diary || { entries: [], todayKcal: 0 };

  const render = () => {
    table.innerHTML = state.diary.entries
      .slice().reverse()
      .map(e => `<tr>
        <td>${e.meal||"—"}</td>
        <td>${e.food}</td>
        <td>${e.servings}</td>
        <td>${e.kcal}</td>
        <td>${e.costUsd?`$${e.costUsd.toFixed(2)}`:"—"}</td>
      </tr>`).join("");
  };



  form.addEventListener("submit", (e) => {
    e.preventDefault();
    const fd = new FormData(form);
    const servings = parseFloat(fd.get("servings")) || 1;
    const kcal = (parseFloat(fd.get("kcal")) || 0) * servings;
    const todayISO = new Date().toISOString().slice(0,10);


    const row = 
    
    {
      date: todayISO,
      meal: fd.get("meal")||"—",
      food: fd.get("food")||"",
      servings: fd.get("servings")||"1",
      kcal,
      costUsd: 0
    };



    state.diary.entries.push(row);
    state.diary.todayKcal = getTodayCaloriesTotal();
    save(state);
    form.reset();
    render();
  });



  render();
}


async function krogerFindStores(zip) 


{
  const res = await fetch(`http://localhost:4000/api/kroger/stores?zip=${encodeURIComponent(zip)}`);
  if (!res.ok) throw new Error("stores lookup failed");
  return res.json();

}

async function krogerFindProducts(storeId, q) 



{
  const res = await fetch(
    `http://localhost:4000/api/kroger/products?storeId=${encodeURIComponent(storeId)}&q=${encodeURIComponent(q)}`
  );
  if (!res.ok) throw new Error("products lookup failed");
  return res.json();
}

function wireStorePricing() 


{
  const zipInput        = $("#storeZip");
  const findStoresBtn   = $("#findStoresBtn");
  const storeSelect     = $("#storeSelect");
  const findPricesBtn   = $("#findPricesBtn");
  const priceResults    = $("#priceResults");
  const selFoodName     = $("#selFoodName");
  const selServingGrams = $("#selServingGrams");
  const selPrice        = $("#selPrice");


  if (!zipInput || !findStoresBtn || !storeSelect || !findPricesBtn || !priceResults) return;




  findStoresBtn.addEventListener("click", async (e) => {
    e.preventDefault();
    priceResults.innerHTML = "";
    storeSelect.innerHTML = "";
    if (!zipInput.value.trim()) 
      
      
      
      {
      alert("Enter a ZIP");
      return;
    }

    try 
    
    
    {
      const json = await krogerFindStores(zipInput.value.trim());
      const opts = (json.data || []).map(s => {
        const name = s.name || "Store";
        const addr = [s.address?.addressLine1, s.address?.city, s.address?.state, s.address?.zipCode]
          .filter(Boolean).join(", ");
        return { id: s.locationId, label: `${name} — ${addr}` };
      });
      if (!opts.length) {
        storeSelect.innerHTML = "<option>No stores found</option>";
        return;
      }

      storeSelect.innerHTML = opts.map(o =>
        `<option value="${o.id}">${o.label}</option>`
      ).join("");
    } 
    
    catch (err) 
    
    
    {
      console.error(err);
      alert("Store lookup failed");

    }
  });


  findPricesBtn.addEventListener("click", async (e) => {
    e.preventDefault();
    priceResults.innerHTML = "";
    const storeId = storeSelect.value;
    const q = selFoodName.value || "";
    if (!storeId) 
      
      
      {
      alert("Pick a store");
      return;
    }

    if (!q) 
      
      
      
      {



      alert("Choose a food first (above)");
      return;
    }

    priceResults.innerHTML = `<div class="meta">Searching prices…</div>`;
    try 
    
    
    {
      const json = await krogerFindProducts(storeId, q);
      const data = json.data || [];
      if (!data.length) 
        
        {
        priceResults.innerHTML = `<div class="meta">No products found.</div>`;
        return;
        
      }

      priceResults.innerHTML = data.map((p, i) => {
        const per100g = (p.pricePer100g != null) ? `$${p.pricePer100g.toFixed(2)}/100g` : "—";
        const priceStr = (p.price != null) ? `$${p.price.toFixed(2)}` : "—";
        const size = p.size || "—";
        return `
          <div class="card" style="margin-bottom:8px; display:flex; align-items:center; justify-content:space-between; gap:12px;">
            <div>
              <div><strong>${p.name}</strong></div>
              <div class="meta">${size} — ${priceStr} (${per100g})</div>
            </div>
            <button class="btn btn-sm" data-pick-price="${i}">Use</button>
          </div>
        `;
      }).join("");


      
      
      
      priceResults.querySelectorAll("[data-pick-price]").forEach(btn => {
        btn.addEventListener("click", () => {
          const i = +btn.dataset.pickPrice;
          const p = data[i];
          const grams = Math.max(1, parseFloat(selServingGrams.value) || 100);
          if (p.pricePer100g == null) {
            alert("This item has no parsable size for per-gram price; enter price manually.");
            return;
          }







          const pricePerServing = (p.pricePer100g / 100) * grams;
          selPrice.value = pricePerServing.toFixed(2);
          priceResults.innerHTML =
            `<div class="meta">Filled price per serving: $${selPrice.value} (serving ${grams} g)</div>`;
        });
      });

    } 
    
    
    catch (err) 
    
    
    {
      console.error(err);
      priceResults.innerHTML = `<div class="meta">Price lookup failed.</div>`;
    }
  });
}

function wireWeight() 


{
  const form   = $("#weightForm");
  const table  = $("#weightsTable tbody");
  const chartEl= $("#weightLine");
  if (!form || !table) return;

  state.weightLogs = state.weightLogs || [];

  const render = () => {

    table.innerHTML = state.weightLogs.slice().reverse().map(w =>
      `<tr><td>${w.date}</td><td>${w.value}</td></tr>`
    ).join("");


    if (chartEl) {
      ensureChartJs(() => {
        const labels = state.weightLogs.map(w => w.date);
        const vals   = state.weightLogs.map(w => w.value);



        const ctx = chartEl.getContext("2d");



        new Chart(ctx, {
          type: "line",
          data: {
            labels,
            datasets: [{
              data: vals,
              tension: .35,
              borderColor: "#7b2d1e",
              pointRadius: 3
            }]
          },
          options: {
            plugins: { legend: { display: false } }
          }
        });
      });
    }
  };




  form.addEventListener("submit", (e) => {
    e.preventDefault();
    const fd = new FormData(form);
    const row = {
      date: fd.get("date") || new Date().toISOString().slice(0,10),
      value: parseFloat(fd.get("weight")) || 0
    };
    state.weightLogs.push(row);
    save(state);
    form.reset();
    render();
  });

  render();
}




function wireCost() 


{
  const form = $("#costForm");
  const out  = $("#costOut");
  if (!form || !out) return;

  state.cost = state.cost || { items: [] };

  const render = () => {
    const { mtd } = getMonthSpendStats();
    out.innerHTML = `<div class="card">
      <div class="meta">Estimated spend this month</div>
      <div style="font-size:32px;font-weight:800">$${mtd.toFixed(2)}</div>
    </div>`;
  };




  form.addEventListener("submit", (e) => {
    e.preventDefault();
    const fd = new FormData(form);
    const row = {
      date: fd.get("date") || new Date().toISOString().slice(0,10),
      name: fd.get("item") || "",
      qty: parseFloat(fd.get("qty")) || 1,
      unitCost: parseFloat(fd.get("unitCost")) || 0,
      store: fd.get("store") || "",
      cat: fd.get("cat") || ""
    };



    state.cost.items.push(row);
    save(state);
    form.reset();
    render();
  });




  render();
}


function wireAllergies() 



{
  const form = $("#allergyForm");
  const list = $("#allergyList");
  if (!form || !list) return;

  state.allergies = state.allergies || [];

  const render = () => {
    list.innerHTML = state.allergies
      .map(a => `<span class="pill" style="margin-right:8px">${a}</span>`)
      .join("");
  };





  form.addEventListener("submit", (e) => {
    e.preventDefault();
    const name = (new FormData(form).get("name") || "").trim();
    if (!name) return;
    state.allergies.push(name);
    save(state);
    form.reset();
    render();
  });



  render();
}




function macroSplitAuto(weightKg, goal, targetKcal) {
  const cfg = {
    cut:      { ppk: 2.0, fpk: 0.6 },
    maintain: { ppk: 1.6, fpk: 0.7 },
    bulk:     { ppk: 1.8, fpk: 0.8 },
  }[goal] || { ppk: 1.6, fpk: 0.7 };

  const proteinG = Math.round(Math.max(0, weightKg * cfg.ppk));
  const fatG     = Math.round(Math.max(0, weightKg * cfg.fpk));
  const used     = proteinG * 4 + fatG * 9;
  const carbsG   = Math.max(0, Math.round((targetKcal - used) / 4));
  return { proteinG, fatG, carbsG };
}




function suggestAdjustments(bmi, tdee, goal) 



{
  let opts = [];
  if (goal === "maintain") 
    
    {
    opts = [
      { label: "Maintain (0)",          delta: 0 },
      { label: "Slight surplus (+100)", delta: +100 },
      { label: "Slight deficit (–100)", delta: -100 },
    ];
  } 
  
  
  else if 
  
  
  (goal === "cut") 
    
    {
    if (bmi < 22) {
      opts = [
        { label: "Very slight cut (–100)", delta: -100 },
        { label: "Gentle cut (–200)",      delta: -200 },
        { label: "Moderate cut (–300)",    delta: -300 },
      ];
    } 
    
    
    else if (bmi < 27) 
      
      
      {
      opts = [
        { label: "Gentle cut (–200)",   delta: -200 },
        { label: "Moderate cut (–300)", delta: -300 },
        { label: "Assertive cut (–400)",delta: -400 },
      ];
    }
    
    
    else 
      
      
      {
      opts = [
        { label: "Moderate cut (–300)",   delta: -300 },
        { label: "Assertive cut (–400)",  delta: -400 },
        { label: "Aggressive cut (–500)", delta: -500 },
      ];
    }
  } 
  
  
  else if (goal === "bulk") 
    
    
    {
    if (bmi < 20) {
      opts = [
        { label: "Slight bulk (+150)",       delta: +150 },
        { label: "Moderate bulk (+250)",     delta: +250 },
        { label: "Conservative bulk (+200)", delta: +200 },
      ];
    } 
    
    
    else if (bmi < 25) 
      
      
      {
      opts = [
        { label: "Slight bulk (+150)",   delta: +150 },
        { label: "Moderate bulk (+250)", delta: +250 },
        { label: "Lean bulk (+200)",     delta: +200 },
      ];
    } 
    
    
    else
      
      
    {
      opts = [
        { label: "Very slight bulk (+100)",  delta: +100 },
        { label: "Lean bulk (+150)",         delta: +150 },
        { label: "Conservative bulk (+200)", delta: +200 },
      ];
    }

  }

  return opts.map(o => ({
    ...o,
    target: Math.max(1200, Math.round(tdee + o.delta))
  }));


}

function wireMacrosForm() {
  const form = $("#macroCalc");
  if (!form) return;

  const baseBox     = $("#macroStep1");
  const optionsHost = $("#intensityOptions");
  const results     = $("#macroResults");

  const r = (id) => document.getElementById(id);

  form.addEventListener("submit", (e) => {
    e.preventDefault();
    const fd = new FormData(form);

    const sex        = fd.get("sex");
    const age        = +fd.get("age") || 0;


    let weightVal    = +fd.get("weight") || 0;
    let heightVal    = +fd.get("height_in") || 0;

    const hUnit      = fd.get("height_unit");
    const wUnit      = fd.get("weight_unit");

    const activity   = fd.get("activity");
    const goal       = fd.get("goal") || "maintain";


    const height_cm  = (hUnit === "in") ? (heightVal * 2.54)       : heightVal;
    const weight_kg  = (wUnit === "lb") ? (weightVal * 0.45359237) : weightVal;


    if (!height_cm || !weight_kg || !age) {
      alert("Please fill age, height and weight.");
      return;
    }


    const bmr = (sex === "male")
      ? 10*weight_kg + 6.25*height_cm - 5*age + 5
      : 10*weight_kg + 6.25*height_cm - 5*age - 161;


    const factor = ({
      sedentary:    1.2,
      light:        1.375,
      moderate:     1.55,
      active:       1.725,
      very_active:  1.9
    }[activity] || 1.55);

    const tdee = bmr * factor;


    const bmi = weight_kg / Math.pow(height_cm / 100, 2);


    r("r_bmi").textContent     = bmi.toFixed(2);
    r("r_bmi_cat").textContent = `(${
      bmi < 18.5 ? "Underweight" :
      bmi < 25   ? "Normal" :
      bmi < 30   ? "Overweight" : "Obese"
    })`;
    r("r_bmr").textContent     = Math.round(bmr);
    r("r_tdee").textContent    = Math.round(tdee);

    const suggestions = suggestAdjustments(bmi, tdee, goal);
    optionsHost.innerHTML = `
      <h4>Choose your intensity</h4>
      <div style="display:flex;gap:10px;flex-wrap:wrap">
        ${suggestions.map(s =>
          `<button class="btn btn-sm" data-target="${s.target}">${s.label}</button>`
        ).join("")}
      </div>
    `;

    baseBox.style.display = "block";
    results.style.display = "none";


    optionsHost.querySelectorAll("[data-target]").forEach(btn => {
      btn.addEventListener("click", (ev) => {
        ev.preventDefault();
        const target = +btn.dataset.target;


        const split  = macroSplitAuto(weight_kg, goal, target);


        r("r_target").textContent    = target;
        r("r_protein_g").textContent = split.proteinG;
        r("r_carbs_g").textContent   = split.carbsG;
        r("r_fat_g").textContent     = split.fatG;


        state.targets = {
          calories: target,
          proteinG: split.proteinG,
          carbsG:   split.carbsG,
          fatG:     split.fatG
        };
        save(state);


        const calFromProtein = split.proteinG * 4;
        const calFromCarb    = split.carbsG   * 4;
        const calFromFat     = split.fatG     * 9;

        const pctProtein = target > 0 ? (calFromProtein / target) * 100 : 0;
        const pctCarb    = target > 0 ? (calFromCarb    / target) * 100 : 0;
        const pctFat     = target > 0 ? (calFromFat     / target) * 100 : 0;

        const ringProtein = document.getElementById("ringProtein");
        const ringCarbs   = document.getElementById("ringCarbs");
        const ringFat     = document.getElementById("ringFat");

        if (ringProtein) ringProtein.style.setProperty("--pct", pctProtein.toFixed(1));
        if (ringCarbs)   ringCarbs.style.setProperty("--pct", pctCarb.toFixed(1));
        if (ringFat)     ringFat.style.setProperty("--pct", pctFat.toFixed(1));

        results.style.display = "block";
        results.scrollIntoView({ behavior: "smooth", block: "start" });
      });
    });
  });


  if (state.targets && state.targets.calories && $("#macroResults")) 
    
    {


    const { calories, proteinG, carbsG, fatG } = state.targets;
    r("r_target").textContent    = calories;
    r("r_protein_g").textContent = proteinG;
    r("r_carbs_g").textContent   = carbsG;
    r("r_fat_g").textContent     = fatG;


    const calFromProtein = proteinG * 4;
    const calFromCarb    = carbsG   * 4;
    const calFromFat     = fatG     * 9;

    const pctProtein = calories > 0 ? (calFromProtein / calories) * 100 : 0;
    const pctCarb    = calories > 0 ? (calFromCarb    / calories) * 100 : 0;
    const pctFat     = calories > 0 ? (calFromFat     / calories) * 100 : 0;

    const ringProtein = document.getElementById("ringProtein");
    const ringCarbs   = document.getElementById("ringCarbs");
    const ringFat     = document.getElementById("ringFat");

    if (ringProtein) ringProtein.style.setProperty("--pct", pctProtein.toFixed(1));
    if (ringCarbs)   ringCarbs.style.setProperty("--pct", pctCarb.toFixed(1));
    if (ringFat)     ringFat.style.setProperty("--pct", pctFat.toFixed(1));

    $("#macroResults").style.display = "block";
  }

}

function renderSettingsPreview() 


{
  const c = $("#tgt_cal") || $("#preview_cals");
  const p = $("#tgt_pro") || $("#preview_prot");
  const k = $("#tgt_car") || $("#preview_carb");
  const f = $("#tgt_fat") || $("#preview_fat");
  if (!c || !p || !k || !f) return;

  
  const t = state.targets || {};
  c.textContent = t.calories ?? "—";
  p.textContent = t.proteinG ?? "—";
  k.textContent = t.carbsG   ?? "—";
  f.textContent = t.fatG     ?? "—";
}


document.addEventListener("DOMContentLoaded", () => {

  renderHomeDashboard();




  if ($("#foodSearchForm")) 
    
    {
    wireDiaryEnhanced();
    wireStorePricing();
  } 
  
  
  else 
    
    {
    wireDiarySimple();
  }

  // Weight page
  wireWeight();

  // Cost page
  wireCost();

  // Allergies page
  wireAllergies();

  // Macros calculator page
  wireMacrosForm();

  // Settings page preview
  renderSettingsPreview();

});