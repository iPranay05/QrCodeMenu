const fs = require('fs');
const { createClient } = require('@supabase/supabase-js');

// Parse .env.local manually
const envFile = fs.readFileSync('.env.local', 'utf-8');
const env = {};
envFile.split('\n').forEach(line => {
  const parts = line.split('=');
  if (parts.length >= 2) {
    env[parts[0].trim()] = parts.slice(1).join('=').trim();
  }
});

const url = env.NEXT_PUBLIC_SUPABASE_URL;
const anonKey = env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

console.log("Supabase URL:", url);
console.log("Supabase Anon Key exists:", !!anonKey);

const supabase = createClient(url, anonKey);

async function test() {
  console.log("Checking restaurants...");
  const { data: restData, error: restError } = await supabase.from('restaurants').select('*');
  console.log("restaurants select response:", { data: restData, error: restError });

  console.log("Checking menu_categories...");
  const cats = await supabase.from('menu_categories').select('*');
  console.log("menu_categories select response:", { data: cats.data, error: cats.error });
}

test();
