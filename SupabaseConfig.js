// SupabaseConfig.js
const _supabaseUrl = "https://wrjivuysumgpoqmabwpw.supabase.co";
const _supabaseKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Indyaml2dXlzdW1ncG9xbWFid3B3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODEwNzczMTEsImV4cCI6MjA5NjY1MzMxMX0.Cfi1IwCFDEHGq1f4g_1amRduxeEiWvoZy4BwxNAtv8A";

// Create a SINGLE client instance and store it globally
if (!window._sharedSupabaseClient) {
    window._sharedSupabaseClient = supabase.createClient(_supabaseUrl, _supabaseKey);
    console.log("Supabase client initialized once");
}

// Make it available globally
const supabaseClient = window._sharedSupabaseClient;

// Also export for module usage if needed
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { supabaseClient, _supabaseUrl, _supabaseKey };
}
