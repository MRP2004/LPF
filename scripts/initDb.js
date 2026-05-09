const db = require('../backend/db');

const schema = `
CREATE TABLE IF NOT EXISTS teams (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT UNIQUE NOT NULL,
  crest TEXT,
  stadium TEXT,
  coach TEXT,
  favorite INTEGER DEFAULT 0
);

CREATE TABLE IF NOT EXISTS players (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  team_id INTEGER NOT NULL,
  name TEXT NOT NULL,
  position TEXT,
  FOREIGN KEY(team_id) REFERENCES teams(id)
);

CREATE TABLE IF NOT EXISTS matches (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  tournament TEXT NOT NULL,
  stage TEXT NOT NULL,
  round_number INTEGER DEFAULT 1,
  home_team_id INTEGER NOT NULL,
  away_team_id INTEGER NOT NULL,
  home_goals INTEGER,
  away_goals INTEGER,
  penalties_winner_team_id INTEGER,
  played_at TEXT,
  status TEXT DEFAULT 'pending',
  FOREIGN KEY(home_team_id) REFERENCES teams(id),
  FOREIGN KEY(away_team_id) REFERENCES teams(id),
  FOREIGN KEY(penalties_winner_team_id) REFERENCES teams(id)
);

CREATE TABLE IF NOT EXISTS team_stats (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  tournament TEXT NOT NULL,
  team_id INTEGER NOT NULL,
  played INTEGER DEFAULT 0,
  won INTEGER DEFAULT 0,
  drawn INTEGER DEFAULT 0,
  lost INTEGER DEFAULT 0,
  gf INTEGER DEFAULT 0,
  ga INTEGER DEFAULT 0,
  points INTEGER DEFAULT 0,
  clean_sheets INTEGER DEFAULT 0,
  UNIQUE(tournament, team_id),
  FOREIGN KEY(team_id) REFERENCES teams(id)
);

CREATE TABLE IF NOT EXISTS player_stats (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  player_id INTEGER NOT NULL,
  tournament TEXT NOT NULL,
  goals INTEGER DEFAULT 0,
  assists INTEGER DEFAULT 0,
  yellow_cards INTEGER DEFAULT 0,
  red_cards INTEGER DEFAULT 0,
  UNIQUE(player_id, tournament),
  FOREIGN KEY(player_id) REFERENCES players(id)
);
`;

db.exec(schema);

const teams = [
  ['River Plate', 'Monumental', 'Demichelis'],
  ['Boca Juniors', 'La Bombonera', 'Martínez'],
  ['Racing Club', 'Cilindro', 'Costas'],
  ['Independiente', 'Libertadores de América', 'Tevez'],
  ['San Lorenzo', 'Nuevo Gasómetro', 'Insúa'],
  ['Estudiantes', 'UNO', 'Domínguez'],
  ['Rosario Central', 'Gigante de Arroyito', 'Russo'],
  ['Newells', 'Coloso', 'Larriera']
];

const insertTeam = db.prepare('INSERT OR IGNORE INTO teams (name, stadium, coach) VALUES (?, ?, ?)');
teams.forEach((t) => insertTeam.run(...t));



const teamRows = db.prepare('SELECT id, name FROM teams ORDER BY id').all();
const byName = Object.fromEntries(teamRows.map((t) => [t.name, t.id]));

const fixtures = [
  ['Liga Profesional', 'Fecha 1', 1, 'River Plate', 'Boca Juniors'],
  ['Liga Profesional', 'Fecha 1', 1, 'Racing Club', 'Independiente'],
  ['Apertura', 'Fecha 1', 1, 'San Lorenzo', 'Estudiantes'],
  ['Clausura', 'Fecha 1', 1, 'Rosario Central', 'Newells'],
  ['Copa Argentina', 'Octavos', 1, 'River Plate', 'Newells'],
  ['Copa Argentina', 'Octavos', 1, 'Boca Juniors', 'Racing Club']
];

const insertMatch = db.prepare(`
  INSERT INTO matches (tournament, stage, round_number, home_team_id, away_team_id)
  VALUES (?, ?, ?, ?, ?)
`);
fixtures.forEach(([t,s,r,h,a]) => insertMatch.run(t,s,r,byName[h],byName[a]));

console.log('Base SQLite inicializada en database/app.db');
