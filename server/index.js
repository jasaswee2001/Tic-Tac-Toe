require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { createClient } = require('@supabase/supabase-js');

const app = express();
app.use(cors());
app.use(express.json());

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY;
if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
  console.error('Please set SUPABASE_URL and SUPABASE_SERVICE_KEY in environment');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

// POST /api/save-game
// Body: { player_x_name, player_o_name, winner, moves }
app.post('/api/save-game', async (req, res) => {
  try {
    const { player_x_name, player_o_name, winner, moves } = req.body || {};

    // Helper to get or insert player
    async function findOrInsertPlayer(name) {
      if (!name) return null;
      const { data: existing, error: e1 } = await supabase
        .from('players')
        .select('id')
        .eq('name', name)
        .limit(1);
      if (e1) throw e1;
      if (existing && existing.length > 0) return existing[0].id;
      const { data: inserted, error: e2 } = await supabase
        .from('players')
        .insert([{ name }])
        .select('id')
        .limit(1);
      if (e2) throw e2;
      return inserted && inserted[0] ? inserted[0].id : null;
    }

    const player_x = await findOrInsertPlayer(player_x_name);
    const player_o = await findOrInsertPlayer(player_o_name);

    const payload = { player_x, player_o, winner, moves };
    const { data, error } = await supabase.from('games').insert([payload]).select();
    if (error) {
      console.error('Insert error:', error);
      return res.status(500).json({ error: error.message || error });
    }
    res.json({ success: true, data });
  } catch (err) {
    console.error('Unexpected server error:', err);
    res.status(500).json({ error: err.message || err });
  }
});

// GET /api/leaderboard - returns recent games with player names
app.get('/api/leaderboard', async (req, res) => {
  try {
    const { data: games, error } = await supabase.from('games').select('*').order('created_at', { ascending: false }).limit(20);
    if (error) return res.status(500).json({ error: error.message || error });

    // Collect player ids and fetch names
    const ids = new Set();
    games.forEach(g => { if (g.player_x) ids.add(g.player_x); if (g.player_o) ids.add(g.player_o); });
    const idArr = Array.from(ids);
    let players = {};
    if (idArr.length > 0) {
      const { data: pls, error: perr } = await supabase.from('players').select('id,name').in('id', idArr);
      if (!perr && pls) pls.forEach(p => players[p.id] = p.name);
    }

    const out = games.map(g => ({
      id: g.id,
      winner: g.winner,
      moves: g.moves,
      created_at: g.created_at,
      player_x_name: g.player_x ? players[g.player_x] || null : null,
      player_o_name: g.player_o ? players[g.player_o] || null : null
    }));

    res.json(out);
  } catch (err) {
    console.error('Leaderboard error:', err);
    res.status(500).json({ error: err.message || err });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server listening on ${PORT}`));
