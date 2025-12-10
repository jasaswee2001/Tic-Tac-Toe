# Supabase RLS Setup Guide

## How to Allow Anonymous Users to Insert Data

### Step 1: Go to Supabase Dashboard
1. Open https://app.supabase.com
2. Select your project (Tic-Tac-Toe)

### Step 2: Navigate to the SQL Editor
1. In the left sidebar, click **SQL Editor**
2. Click **New Query**

### Step 3: Run the RLS Policy SQL

Copy and paste **ALL** of the following SQL into the editor and click **Run**:

```sql
-- Enable RLS on both tables
ALTER TABLE players ENABLE ROW LEVEL SECURITY;
ALTER TABLE games ENABLE ROW LEVEL SECURITY;

-- Policy for players: allow anon to INSERT
CREATE POLICY "Allow anon insert players"
ON players
FOR INSERT
WITH CHECK (true);

-- Policy for players: allow anon to SELECT
CREATE POLICY "Allow anon select players"
ON players
FOR SELECT
USING (true);

-- Policy for games: allow anon to INSERT
CREATE POLICY "Allow anon insert games"
ON games
FOR INSERT
WITH CHECK (true);

-- Policy for games: allow anon to SELECT
CREATE POLICY "Allow anon select games"
ON games
FOR SELECT
USING (true);
```

### Step 4: Verify the Policies Were Created
1. In the left sidebar, go to **Authentication** → **Policies**
2. You should see 4 new policies listed:
   - Allow anon insert players
   - Allow anon select players
   - Allow anon insert games
   - Allow anon select games

### Step 5: Test the Connection Again
1. Open `test-connection.html` in your browser
2. All tests should now show ✓ (green)
3. If they pass, reload `game.html` and play a game!

---

## Alternative: Using the Supabase UI (Slower but Visual)

If you prefer the UI instead of SQL:

1. Go to **Authentication** → **Policies** (left sidebar)
2. Select the **players** table
3. Click **New Policy** → **For INSERT**
   - Name: `Allow anon insert`
   - Leave everything default (targets anon role)
   - Click **Create Policy**
4. Click **New Policy** → **For SELECT**
   - Name: `Allow anon select`
   - Click **Create Policy**
5. Repeat for the **games** table

---

## Explanation

RLS (Row Level Security) is a Supabase security feature that blocks all access by default. The policies above allow:
- **anon users** (unauthenticated users) to **INSERT** new rows
- **anon users** to **SELECT** (read) rows

This is safe because your game data isn't sensitive and you want public play.

