import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabaseUrl = process.env.SUPABASE_URL || 'https://mock.supabase.co';
const supabaseKey = process.env.SUPABASE_KEY || 'mock-key';

if (supabaseUrl === 'https://mock.supabase.co') {
  console.warn('Missing Supabase Environment Variables. Using mock values.');
}

export const supabase = createClient(supabaseUrl, supabaseKey);
