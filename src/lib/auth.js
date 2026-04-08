import { supabase } from './supabase'

/* ── Sign in / Sign up ──────────────────────────────────────────── */

export async function signInWithGoogle() {
  const { error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: { redirectTo: window.location.origin },
  })
  if (error) throw error
}

export async function signInWithEmail(email, password) {
  const { error } = await supabase.auth.signInWithPassword({ email, password })
  if (error) throw error
}

export async function signUpWithEmail(email, password) {
  const { data, error } = await supabase.auth.signUp({ email, password })
  if (error) throw error
  return data.user
}

export async function signOut() {
  await supabase.auth.signOut()
}

/* ── Profile ────────────────────────────────────────────────────── */

export async function getProfile(userId) {
  const { data } = await supabase
    .from('users')
    .select('*')
    .eq('id', userId)
    .maybeSingle()
  return data
}

export async function isUsernameAvailable(username) {
  const { data } = await supabase
    .from('users')
    .select('id')
    .eq('username', username)
    .maybeSingle()
  return !data
}

export async function createProfile({ id, email, username, home_city, privacy_level, avatar_url }) {
  const { error } = await supabase.from('users').insert({
    id,
    name:          username,
    email:         email ?? null,
    username,
    home_city:     home_city     ?? null,
    privacy_level: privacy_level ?? 'public',
    avatar_url:    avatar_url    ?? null,
  })
  if (error) throw new Error(error.message)
  return { id, name: username, email, username, home_city, privacy_level, avatar_url }
}

/* ── Avatar storage ─────────────────────────────────────────────── */

export async function uploadAvatar(userId, file) {
  const ext  = file.name.split('.').pop().toLowerCase()
  const path = `${userId}.${ext}`

  const { error } = await supabase.storage
    .from('avatars')
    .upload(path, file, { upsert: true, contentType: file.type })

  if (error) throw new Error(error.message)

  const { data: { publicUrl } } = supabase.storage
    .from('avatars')
    .getPublicUrl(path)

  return publicUrl
}
