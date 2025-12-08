// Initialize Supabase client using the UMD bundle loaded in the page.
// Assumes `supabase` global (from the CDN UMD build) and `window.SUPABASE_URL`/`window.SUPABASE_ANON_KEY` exist.
if (typeof supabase === 'undefined') {
    console.warn('Supabase library not found. Make sure to include the Supabase UMD script before this file.');
} else if (!window.SUPABASE_URL || !window.SUPABASE_ANON_KEY || window.SUPABASE_ANON_KEY === '<REPLACE_WITH_ANON_KEY>') {
    console.warn('Supabase config missing. Set window.SUPABASE_URL and window.SUPABASE_ANON_KEY in supabaseConfig.js');
} else {
    // createClient is available on the global `supabase` object for the UMD build
    window.supabaseClient = supabase.createClient(window.SUPABASE_URL, window.SUPABASE_ANON_KEY);
}

// Helper export for code that expects a named symbol
// (in files loaded after this one you can access `window.supabaseClient`).
