let boxes = document.querySelectorAll(".box");
let playAgainBtn = document.getElementById("Play-Again");
let abortBtn = document.getElementById("Abort-Game");

let popup = document.getElementById("confirmPopup");
let cancelAbort = document.getElementById("cancelAbort");
let confirmAbort = document.getElementById("confirmAbort");
let turnInfo = document.getElementById("turnInfo");

let nameXInput = document.getElementById('nameX');
let nameOInput = document.getElementById('nameO');

let turnX = true; 
turnInfo.innerText = "Turn for X";  

let winPatterns = [
    [0, 1, 2],
    [3, 4, 5],
    [6, 7, 8],
    [0, 3, 6],
    [1, 4, 7],
    [2, 5, 8],
    [0, 4, 8],
    [2, 4, 6]
];

function disableBoard() {
    boxes.forEach(box => box.style.pointerEvents = 'none');
}

function enableBoard() {
    boxes.forEach(box => box.style.pointerEvents = 'auto');
}

boxes.forEach((box) => {
    box.addEventListener("click", () => {
        if (box.innerText !== "") 
            return;

        box.innerText = turnX ? "X" : "O";

        checkWinner();
        turnX = !turnX;

        if (![...boxes].every(b => b.disabled || b.innerText !== "")) {
            turnInfo.innerText = turnX ? "Turn for X" : "Turn for O";
        } else {
            turnInfo.innerText = turnX ? "Turn for X" : "Turn for O";
        }
    });
});

const checkWinner = () => {
    for (let pattern of winPatterns) {
        let [a, b, c] = pattern;
        let pos1 = boxes[a].innerText;
        let pos2 = boxes[b].innerText;
        let pos3 = boxes[c].innerText;

        if (pos1 !== "" && pos1 === pos2 && pos2 === pos3) {
            turnInfo.innerText = `${pos1} wins!`;
            alert(`${pos1} wins!`);
            disableBoard();  
            // save result to Supabase (best-effort)
            saveGameResult(pos1);
            return;
        }
    }

    if ([...boxes].every(box => box.innerText !== "")) {
        turnInfo.innerText = "It's a draw!";
        alert("It's a draw!");
        disableBoard();
        saveGameResult('draw');
    }
};

playAgainBtn.addEventListener("click", () => {
    boxes.forEach(box => {
        box.innerText = "";
    });
    enableBoard();
    turnX = true;
    turnInfo.innerText = "Turn for X";  
});

abortBtn.addEventListener("click", () => {
    popup.style.display = "flex";
});

cancelAbort.addEventListener("click", () => {
    popup.style.display = "none";
});

confirmAbort.addEventListener("click", () => {
    boxes.forEach(box => {
        box.innerText = "";
    });
    disableBoard();

    popup.style.display = "none";
    turnInfo.innerText = "Game aborted!";  
    alert("Game aborted!");
    saveGameResult('abort');
});

// ---------------- Supabase integration (lightweight) ----------------
// The code below uses `window.supabaseClient` which is created in `supabaseClient.js`.
// It is safe if the client isn't present — we simply skip remote saves.

async function getOrCreatePlayer(name) {
    if (!name) return null;
    if (!window.supabaseClient) return null;

    // try to find a player with the same name
    const { data: existing, error: fetchErr } = await window.supabaseClient
        .from('players')
        .select('id')
        .eq('name', name)
        .limit(1);

    if (fetchErr) {
        console.warn('Could not query players:', fetchErr);
        return null;
    }

    if (existing && existing.length > 0) return existing[0].id;

    // otherwise insert
    const { data: inserted, error: insertErr } = await window.supabaseClient
        .from('players')
        .insert([{ name }])
        .select('id')
        .limit(1);

    if (insertErr) {
        console.warn('Could not insert player:', insertErr);
        return null;
    }

    return inserted && inserted[0] ? inserted[0].id : null;
}

async function saveGameResult(winner) {
    // prepare moves as simple array of 9 strings
    const moves = [...boxes].map(b => b.innerText || null);
    const playerXName = nameXInput ? nameXInput.value.trim() : null;
    const playerOName = nameOInput ? nameOInput.value.trim() : null;
    // If an API_BASE is configured, prefer saving via the secure server endpoint.
    if (window.API_BASE && window.API_BASE.trim() !== '') {
        try {
            const res = await fetch(window.API_BASE + '/api/save-game', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    player_x_name: playerXName,
                    player_o_name: playerOName,
                    winner,
                    moves
                })
            });

            if (!res.ok) {
                const text = await res.text();
                console.warn('Server save failed:', res.status, text);
            } else {
                const body = await res.json();
                console.log('Saved game via server:', body);
            }
            return;
        } catch (err) {
            console.warn('Error saving to server, falling back to direct Supabase client:', err);
        }
    }

    // Fallback: use supabaseClient directly in the browser (requires anon key configured).
    if (!window.supabaseClient) {
        console.log('Supabase client not configured — skipping save.');
        console.log({ winner, moves, playerXName, playerOName });
        return;
    }

    try {
        const playerXId = await getOrCreatePlayer(playerXName);
        const playerOId = await getOrCreatePlayer(playerOName);

        const payload = {
            player_x: playerXId,
            player_o: playerOId,
            winner: winner,
            moves: moves
        };

        const { data, error } = await window.supabaseClient
            .from('games')
            .insert([payload])
            .select();

        if (error) {
            console.warn('Failed to save game:', error);
        } else {
            console.log('Saved game:', data);
        }
    } catch (err) {
        console.error('Unexpected error when saving game:', err);
    }
}

// ---------------- Leaderboard helpers ----------------
async function fetchLeaderboard() {
    // If server API available use it
    if (window.API_BASE && window.API_BASE.trim() !== '') {
        try {
            const res = await fetch(window.API_BASE + '/api/leaderboard');
            if (!res.ok) throw new Error('Leaderboard fetch failed: ' + res.status);
            return await res.json();
        } catch (err) {
            console.warn('Could not fetch leaderboard from server:', err);
            return [];
        }
    }

    // Otherwise try Supabase client directly
    if (!window.supabaseClient) return [];

    try {
        const { data: games, error } = await window.supabaseClient
            .from('games')
            .select('*')
            .order('created_at', { ascending: false })
            .limit(20);

        if (error) {
            console.warn('Error loading leaderboard from Supabase:', error);
            return [];
        }

        // Map player ids to names
        const playerIds = new Set();
        games.forEach(g => { if (g.player_x) playerIds.add(g.player_x); if (g.player_o) playerIds.add(g.player_o); });
        const ids = Array.from(playerIds);
        const players = {};
        if (ids.length > 0) {
            const { data: pls, error: perr } = await window.supabaseClient
                .from('players')
                .select('id,name')
                .in('id', ids);
            if (!perr && pls) pls.forEach(p => players[p.id] = p.name);
        }

        return games.map(g => ({
            id: g.id,
            winner: g.winner,
            moves: g.moves,
            created_at: g.created_at,
            player_x_name: g.player_x ? players[g.player_x] || null : null,
            player_o_name: g.player_o ? players[g.player_o] || null : null
        }));
    } catch (err) {
        console.error('Unexpected error fetching leaderboard:', err);
        return [];
    }
}

function renderLeaderboard(items) {
    const ul = document.getElementById('leaderboardList');
    if (!ul) return;
    ul.innerHTML = '';
    if (!items || items.length === 0) {
        ul.innerHTML = '<li>No recent games found.</li>';
        return;
    }

    items.forEach(i => {
        const li = document.createElement('li');
        const px = i.player_x_name || 'Player X';
        const po = i.player_o_name || 'Player O';
        li.innerText = `${new Date(i.created_at).toLocaleString()} — ${px} vs ${po} — winner: ${i.winner}`;
        ul.appendChild(li);
    });
}

document.getElementById('loadLeaderboard')?.addEventListener('click', async () => {
    const items = await fetchLeaderboard();
    renderLeaderboard(items);
});
