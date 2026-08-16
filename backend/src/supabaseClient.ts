import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const rawUrl = process.env.SUPABASE_URL || '';
const rawKey = process.env.SUPABASE_KEY || '';

// Only use env values if they look like real URLs/keys
const isValidUrl = /^https?:\/\//i.test(rawUrl);
const supabaseUrl = isValidUrl ? rawUrl : 'https://mock.supabase.co';
const supabaseKey = isValidUrl ? rawKey : 'mock-key';

if (!isValidUrl) {
  console.warn('⚠ Supabase not configured — using mock values. Set SUPABASE_URL and SUPABASE_KEY in .env');
}

export const supabase = createClient(supabaseUrl, supabaseKey);
