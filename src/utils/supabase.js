// Substitua pelos seus dados reais do Supabase
const SUPABASE_URL = 'https://gfivmnnysomfwrffybeh.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdmaXZtbm55c29tZndyZmZ5YmVoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTMyOTY3NjgsImV4cCI6MjA2ODg3Mjc2OH0.NxetXJoCLh4q9zAqn_olimziI3YP4MAJzB8ed4qf8cg';

export const supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
