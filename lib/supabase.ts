'use client'
import { createBrowserClient } from '@supabase/ssr'

let client: any = null;

export function getSupabase() {
  if (typeof window === 'undefined') return null;
  
  if (!client) {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://zjtiunvakvsbqjojrklz.supabase.co';
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpqdGl1bnZha3ZzYnFqb2pya2x6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzgwMTEzMDksImV4cCI6MjA5MzU4NzMwOX0.BS0N9O_5nX3wOrm7TIqwZiPGB5B66jq434hJ3TrLt9U';
    
    client = createBrowserClient(supabaseUrl, supabaseKey);
  }
  
  return client;
}

// For backwards compatibility
export const supabase = typeof window !== 'undefined' ? getSupabase() : null;
