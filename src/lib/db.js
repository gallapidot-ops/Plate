import { supabase } from './supabase'

/* ── Current user ID (falls back to dev seed if not logged in) ───── */
const DEV_USER_ID = '00000000-0000-0000-0000-000000000001'

async function getUserId() {
  const { data: { user } } = await supabase.auth.getUser()
  return user?.id ?? DEV_USER_ID
}

/* ═══════════════════════════════════════════════════════════
   PLACES
═══════════════════════════════════════════════════════════ */

export async function savePlace(placeData) {
  const {
    name, address, photo_url,
    personal_note, is_regular, last_visited,
    meal_types, experience_type,
    ratings, computed_score, price_tier, tags,
    placeId, lat, lng, website,
  } = placeData

  const userId          = await getUserId()
  const primaryMealType = meal_types?.[0] ?? null

  const { data: place, error: placeErr } = await supabase
    .from('places')
    .insert({
      name,
      address:         address         ?? null,
      photo_url:       photo_url       ?? null,
      personal_note:   personal_note   ?? null,
      is_regular:      !!is_regular,
      last_visited: is_regular
        ? null
        : (last_visited || new Date().toISOString().split('T')[0]),
      google_place_id: placeId         ?? null,
      lat:             lat             ?? null,
      lng:             lng             ?? null,
      website:         website         ?? null,
      created_by:      userId,
    })
    .select()
    .single()

  if (placeErr) throw new Error(`places insert: ${placeErr.message}`)

  const ratingRows = (meal_types ?? []).filter(Boolean).map(mt => ({
    place_id:        place.id,
    user_id:         userId,
    meal_type:       mt,
    experience_type: experience_type ?? null,
    taste:           ratings?.[mt]?.taste     ?? null,
    spread:          ratings?.[mt]?.spread    ?? null,
    aesthetic:       ratings?.[mt]?.aesthetic ?? null,
    service:         ratings?.[mt]?.service   ?? null,
    price:           price_tier ?? null,
    computed_score:  mt === primaryMealType ? (computed_score ?? 0) : null,
    tags:            mt === primaryMealType ? (tags ?? []) : [],
  }))

  if (ratingRows.length > 0) {
    const { error: ratingErr } = await supabase.from('place_ratings').insert(ratingRows)
    if (ratingErr) throw new Error(`place_ratings insert: ${ratingErr.message}`)
  }

  return place
}

export async function getMyPlaces() {
  const userId = await getUserId()

  const { data, error } = await supabase
    .from('places')
    .select(`
      *,
      place_ratings (
        id, meal_type, experience_type, computed_score,
        taste, spread, aesthetic, service, tags, price
      )
    `)
    .eq('created_by', userId)
    .order('last_visited', { ascending: false, nullsFirst: false })

  if (error) { console.error('[db] getMyPlaces:', error.message); return [] }

  return (data ?? []).map(p => ({
    ...p,
    meal_types:      (p.place_ratings ?? []).map(r => r.meal_type).filter(Boolean),
    computed_score:  p.place_ratings?.[0]?.computed_score ?? 0,
    experience_type: p.place_ratings?.[0]?.experience_type ?? null,
    ratings: Object.fromEntries(
      (p.place_ratings ?? []).map(r => [
        r.meal_type,
        { taste: r.taste, spread: r.spread, aesthetic: r.aesthetic, service: r.service },
      ])
    ),
  }))
}

/* ═══════════════════════════════════════════════════════════
   WISHLIST
═══════════════════════════════════════════════════════════ */

export async function getWishlist() {
  const userId = await getUserId()

  const { data, error } = await supabase
    .from('wishlists')
    .select(`
      added_from, added_note, priority, saved_at,
      places ( id, name, address, photo_url, meal_types_cache:place_ratings(meal_type) )
    `)
    .eq('user_id', userId)
    .order('saved_at', { ascending: false })

  if (error) { console.error('[db] getWishlist:', error.message); return [] }

  return (data ?? []).map(w => ({
    ...w.places,
    meal_types: (w.places?.meal_types_cache ?? []).map(r => r.meal_type),
    added_from: w.added_from,
    added_note: w.added_note,
    priority:   w.priority,
    saved_at:   w.saved_at,
  }))
}

export async function addToWishlist(placeId, opts = {}) {
  const userId = await getUserId()

  const { error } = await supabase.from('wishlists').upsert({
    user_id:    userId,
    place_id:   placeId,
    added_from: opts.added_from ?? 'גילוי',
    added_note: opts.added_note ?? null,
    priority:   opts.priority   ?? 'medium',
  })

  if (error) throw new Error(`addToWishlist: ${error.message}`)
}

export async function addPlaceToWishlist(placeData, opts = {}) {
  const userId = await getUserId()

  const { data: existing } = await supabase
    .from('places')
    .select('id')
    .eq('name', placeData.name)
    .eq('address', placeData.address ?? '')
    .maybeSingle()

  let placeId = existing?.id

  if (!placeId) {
    const { data: newPlace, error: insertErr } = await supabase
      .from('places')
      .insert({
        name:       placeData.name,
        address:    placeData.address   ?? null,
        photo_url:  placeData.photo_url ?? null,
        created_by: userId,
      })
      .select('id')
      .single()

    if (insertErr) throw new Error(`addPlaceToWishlist insert: ${insertErr.message}`)
    placeId = newPlace.id
  }

  await addToWishlist(placeId, opts)
  return placeId
}

export async function getFollowCounts(userId) {
  const [{ count: followers }, { count: following }] = await Promise.all([
    supabase.from('follows').select('*', { count: 'exact', head: true }).eq('following_id', userId),
    supabase.from('follows').select('*', { count: 'exact', head: true }).eq('follower_id',  userId),
  ])
  return { followers: followers ?? 0, following: following ?? 0 }
}

export async function removeFromWishlist(placeId) {
  const userId = await getUserId()

  const { error } = await supabase
    .from('wishlists')
    .delete()
    .eq('user_id',  userId)
    .eq('place_id', placeId)

  if (error) throw new Error(`removeFromWishlist: ${error.message}`)
}
