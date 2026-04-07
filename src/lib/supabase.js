import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL  = 'https://snmvjkncnaqlfiohmqme.supabase.co'
const SUPABASE_ANON = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNubXZqa25jbmFxbGZpb2htcW1lIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzU1NDgxMjMsImV4cCI6MjA5MTEyNDEyM30.2Z3496K0Rm4-JMDSQyasJJj9lDAmaMfnNPzPhk7_e5U'

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON)
