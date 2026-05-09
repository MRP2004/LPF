const db = require('../db');
const { computeStandings, getFixtures } = require('../models/tournamentModel');

const upsertStat = db.prepare(`
  INSERT INTO team_stats (tournament, team_id, played, won, drawn, lost, gf, ga, points, clean_sheets)
  VALUES (?, ?, 0, 0, 0, 0, 0, 0, 0, 0)
  ON CONFLICT(tournament, team_id) DO NOTHING
`);

const getDashboard = (req, res) => {
  const league = computeStandings('Liga Profesional');
  const apertura = computeStandings('Apertura');
  const clausura = computeStandings('Clausura');
  const copa = getFixtures('Copa Argentina');
  res.json({ league, apertura, clausura, copa });
};

const simulateMatch = (req, res) => {
  const { matchId, homeGoals, awayGoals, penaltiesWinnerTeamId } = req.body;
  const match = db.prepare('SELECT * FROM matches WHERE id = ?').get(matchId);
  if (!match) return res.status(404).json({ error: 'Partido no encontrado' });

  const tx = db.transaction(() => {
    db.prepare(`UPDATE matches SET home_goals=?, away_goals=?, penalties_winner_team_id=?, status='played' WHERE id=?`)
      .run(homeGoals, awayGoals, penaltiesWinnerTeamId || null, matchId);

    [match.home_team_id, match.away_team_id].forEach((teamId) => upsertStat.run(match.tournament, teamId));

    db.prepare('UPDATE team_stats SET played = played + 1, gf = gf + ?, ga = ga + ?, clean_sheets = clean_sheets + ? WHERE tournament=? AND team_id=?')
      .run(homeGoals, awayGoals, awayGoals === 0 ? 1 : 0, match.tournament, match.home_team_id);

    db.prepare('UPDATE team_stats SET played = played + 1, gf = gf + ?, ga = ga + ?, clean_sheets = clean_sheets + ? WHERE tournament=? AND team_id=?')
      .run(awayGoals, homeGoals, homeGoals === 0 ? 1 : 0, match.tournament, match.away_team_id);

    if (homeGoals > awayGoals) {
      db.prepare('UPDATE team_stats SET won = won + 1, points = points + 3 WHERE tournament=? AND team_id=?').run(match.tournament, match.home_team_id);
      db.prepare('UPDATE team_stats SET lost = lost + 1 WHERE tournament=? AND team_id=?').run(match.tournament, match.away_team_id);
    } else if (awayGoals > homeGoals) {
      db.prepare('UPDATE team_stats SET won = won + 1, points = points + 3 WHERE tournament=? AND team_id=?').run(match.tournament, match.away_team_id);
      db.prepare('UPDATE team_stats SET lost = lost + 1 WHERE tournament=? AND team_id=?').run(match.tournament, match.home_team_id);
    } else {
      db.prepare('UPDATE team_stats SET drawn = drawn + 1, points = points + 1 WHERE tournament=? AND team_id=?').run(match.tournament, match.home_team_id);
      db.prepare('UPDATE team_stats SET drawn = drawn + 1, points = points + 1 WHERE tournament=? AND team_id=?').run(match.tournament, match.away_team_id);
    }
  });

  tx();
  res.json({ ok: true, standings: computeStandings(match.tournament) });
};

module.exports = { getDashboard, simulateMatch };
