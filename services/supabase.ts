
import { createClient } from '@supabase/supabase-js';

// URL derivada do Project Ref contido na sua chave JWT
const supabaseUrl = 'https://bwehjlkfwekgmtqlvmth.supabase.co';
// Sua Anon Public Key fornecida
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJ3ZWhqbGtmd2VrZ210cWx2bXRoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjcwMjkzOTYsImV4cCI6MjA4MjYwNTM5Nn0.hgVswDsg4RVAHwsK7HlznE-U7erUejTC04Hk0t2Nl5s';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
