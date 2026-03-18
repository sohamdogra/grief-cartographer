import { createClient } from "@supabase/supabase-js"

const SUPA_URL = "https://gfyfzplyehcgqzybiqli.supabase.co"
const SUPA_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdmeWZ6cGx5ZWhjZ3F6eWJpcWxpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzMwNzU2NzEsImV4cCI6MjA4ODY1MTY3MX0.lQ8EF4SEBZnWLzRJjwaQlGuP3ZcuJdf2DJ6iH037SuI"

// Create a singleton instance
let supabaseInstance: ReturnType<typeof createClient> | null = null

export function getSupabase() {
  if (!supabaseInstance) {
    supabaseInstance = createClient(SUPA_URL, SUPA_KEY)
  }
  return supabaseInstance
}
