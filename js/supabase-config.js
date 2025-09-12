const supabaseUrl = 'https://wfctdfyvxybynayzjjfv.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndmY3RkZnl2eHlieW5heXpqamZ2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3MDczMjk0MDUsImV4cCI6MjAyMjkwNTQwNX0.JbAXEIxS1XtZVUOCSdCPt5hVukUWVoBuitEzOpv8D2U';

const supabase = supabase.createClient(supabaseUrl, supabaseKey);

window.supabase = supabase; // Rendre supabase disponible globalement