const state = { view: 'liga' };

const mapView = { liga: 'league', apertura: 'apertura', clausura: 'clausura' };

async function loadDashboard() {
  const data = await fetch('/api/dashboard').then((r) => r.json());
  renderStandings(data[mapView[state.view]] || data.league);
  renderFixtures(state.view === 'copa' ? data.copa : []);
}

function renderStandings(rows) {
  const el = document.getElementById('standings');
  el.innerHTML = `<h2>Tabla ${state.view}</h2>
  <table class="table"><thead><tr><th>#</th><th>Equipo</th><th>PTS</th><th>PJ</th><th>GF</th><th>GC</th><th>DG</th><th>G</th><th>E</th><th>P</th></tr></thead>
  <tbody>${rows.map((r)=>`<tr><td>${r.position}</td><td>${r.name}</td><td>${r.points}</td><td>${r.played}</td><td>${r.gf}</td><td>${r.ga}</td><td>${r.gd}</td><td>${r.won}</td><td>${r.drawn}</td><td>${r.lost}</td></tr>`).join('')}</tbody></table>`;
}

function renderFixtures(matches) {
  const el = document.getElementById('fixtures');
  el.innerHTML = `<h2>Cuadro / Fixtures</h2>${matches.map((m)=>`
  <div class="match">
    <strong>${m.stage}</strong> · ${m.home_name} vs ${m.away_name}<br/>
    <input type="number" min="0" id="hg-${m.id}" placeholder="Local" />
    <input type="number" min="0" id="ag-${m.id}" placeholder="Visita" />
    <button onclick="simulate(${m.id})">Cargar</button>
  </div>`).join('')}`;
}

async function simulate(matchId) {
  const homeGoals = Number(document.getElementById(`hg-${matchId}`).value || 0);
  const awayGoals = Number(document.getElementById(`ag-${matchId}`).value || 0);
  await fetch('/api/simulate', {
    method: 'POST', headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ matchId, homeGoals, awayGoals })
  });
  loadDashboard();
}

document.querySelectorAll('[data-view]').forEach((b) => {
  b.addEventListener('click', () => { state.view = b.dataset.view; loadDashboard(); });
});

document.getElementById('teamSearch').addEventListener('input', async (e) => {
  const teams = await fetch(`/api/teams?q=${encodeURIComponent(e.target.value)}`).then((r)=>r.json());
  console.log('equipos', teams.map((t)=>t.name).join(', '));
});

document.getElementById('reset').addEventListener('click', async () => {
  await fetch('/api/reset', { method:'POST' });
  loadDashboard();
});

loadDashboard();
window.simulate = simulate;
