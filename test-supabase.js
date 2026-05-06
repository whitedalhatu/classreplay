import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  'https://zjtiunvakvsbqjojrklz.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpqdGl1bnZha3ZzYnFqb2pya2x6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzgwMTEzMDksImV4cCI6MjA5MzU4NzMwOX0.BS0N9O_5nX3wOrm7TIqwZiPGB5B66jq434hJ3TrLt9U'
)

async function test() {
  const { data, error } = await supabase.from('programs').select('*')
  console.log('Data:', data)
  console.log('Error:', error)
}

test()
