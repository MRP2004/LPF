const db = require('../db');

const computeStandings = (tournament = 'Liga Profesional') => {
  const rows = db.prepare(`
    SELECT t.id, t.name,
      COALESCE(s.played, 0) AS played,
      COALESCE(s.won, 0) AS won,
      COALESCE(s.drawn, 0) AS drawn,
      COALESCE(s.lost, 0) AS lost,
      COALESCE(s.gf, 0) AS gf,
      COALESCE(s.ga, 0) AS ga,
      COALESCE(s.points, 0) AS points
    FROM teams t
    LEFT JOIN team_stats s ON s.team_id = t.id AND s.tournament = ?
    ORDER BY points DESC, (gf - ga) DESC, gf DESC, t.name ASC
  `).all(tournament);

  return rows.map((r, i) => ({ ...r, position: i + 1, gd: r.gf - r.ga }));
};

const getFixtures = (tournament) => db.prepare(`
  SELECT m.*, ht.name AS home_name, at.name AS away_name
  FROM matches m
  JOIN teams ht ON ht.id = m.home_team_id
  JOIN teams at ON at.id = m.away_team_id
  WHERE m.tournament = ?
  ORDER BY m.round_number, m.id
`).all(tournament);

module.exports = { computeStandings, getFixtures };
