const path = require('path');
const express = require('express');
const cors = require('cors');
const db = require('./db');
const tournamentRoutes = require('./routes/tournamentRoutes');

const app = express();
const port = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());
app.use('/api', tournamentRoutes);
app.use(express.static(path.join(__dirname, '..', 'frontend')));

app.post('/api/reset', (req, res) => {
  db.exec('DELETE FROM matches; DELETE FROM team_stats;');
  res.json({ ok: true });
});

app.get('/api/teams', (req, res) => {
  const q = (req.query.q || '').trim();
  const sql = q
    ? 'SELECT * FROM teams WHERE name LIKE ? ORDER BY favorite DESC, name'
    : 'SELECT * FROM teams ORDER BY favorite DESC, name';
  const teams = db.prepare(sql).all(q ? `%${q}%` : undefined);
  res.json(teams);
});

app.post('/api/favorites/:teamId', (req, res) => {
  const { teamId } = req.params;
  db.prepare('UPDATE teams SET favorite = CASE WHEN favorite = 1 THEN 0 ELSE 1 END WHERE id = ?').run(teamId);
  res.json({ ok: true });
});

app.listen(port, () => {
  console.log(`Servidor en http://localhost:${port}`);
});
