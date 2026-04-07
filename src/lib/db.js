import { supabase } from './supabase'

/* ── Dev user (seeded in migration) ─────────────────────── */
export const DEV_USER_ID = '00000000-0000-0000-0000-000000000001'

/* ═══════════════════════════════════════════════════════════
   PLACES
═══════════════════════════════════════════════════════════ */

/**
 * Save a new place visit + ratings to Supabase.
 * Returns the saved place row, or throws on failure.
 */
export async function savePlace(placeData) {
  const {
    name, address, photo_url,
    personal_note, is_regular, last_visited,
    meal_types, experience_type,
    ratings, computed_score, price_tier, tags,
    placeId, lat, lng, website,
  } = placeData

  const primaryMealType = meal_types?.[0] ?? null

  // 1. Insert place row
  const { data: place, error: placeErr } = await supabase
    .from('places')
    .insert({
      name,
      address:          address          ?? null,
      photo_url:        photo_url        ?? null,
      personal_note:    personal_note    ?? null,
      is_regular:       !!is_regular,
      last_visited: is_regular
        ? null
        : (last_visited || new Date().toISOString().split('T')[0]),
      google_place_id:  placeId          ?? null,
      lat:              lat              ?? null,
      lng:              lng              ?? null,
      website:          website          ?? null,
      created_by: DEV_USER_ID,
    })
    .select()
    .single()

  if (placeErr) throw new Error(`places insert: ${placeErr.message}`)

  // 2. Insert one rating row per meal type
  const ratingRows = (meal_types ?? []).filter(Boolean).map(mt => ({
    place_id:        place.id,
    user_id:         DEV_USER_ID,
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
    const { error: ratingErr } = await supabase
      .from('place_ratings')
      .insert(ratingRows)

    if (ratingErr) throw new Error(`place_ratings insert: ${ratingErr.message}`)
  }

  return place
}

/**
 * Fetch the current user's saved places with their ratings.
 * Returns [] if nothing saved yet.
 */
export async function getMyPlaces() {
  const { data, error } = await supabase
    .from('places')
    .select(`
      *,
      place_ratings (
        id, meal_type, experience_type, computed_score,
        taste, spread, aesthetic, service, tags, price
      )
    `)
    .eq('created_by', DEV_USER_ID)
    .order('last_visited', { ascending: false, nullsFirst: false })

  if (error) {
    console.error('[db] getMyPlaces:', error.message)
    return []
  }

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

/**
 * Fetch the current user's wishlist.
 * Returns [] if empty.
 */
export async function getWishlist() {
  const { data, error } = await supabase
    .from('wishlists')
    .select(`
      added_from, added_note, priority, saved_at,
      places ( id, name, address, photo_url, meal_types_cache:place_ratings(meal_type) )
    `)
    .eq('user_id', DEV_USER_ID)
    .order('saved_at', { ascending: false })

  if (error) {
    console.error('[db] getWishlist:', error.message)
    return []
  }

  return (data ?? []).map(w => ({
    ...w.places,
    meal_types: (w.places?.meal_types_cache ?? []).map(r => r.meal_type),
    added_from: w.added_from,
    added_note: w.added_note,
    priority:   w.priority,
    saved_at:   w.saved_at,
  }))
}

/**
 * Add a place (by known place_id) to wishlist.
 */
export async function addToWishlist(placeId, opts = {}) {
  const { error } = await supabase
    .from('wishlists')
    .upsert({
      user_id:    DEV_USER_ID,
      place_id:   placeId,
      added_from: opts.added_from ?? 'גילוי',
      added_note: opts.added_note ?? null,
      priority:   opts.priority   ?? 'medium',
    })

  if (error) throw new Error(`addToWishlist: ${error.message}`)
}

/**
 * Save a place stub + add it to wishlist in one call.
 * Used when adding a search result that isn't in the DB yet.
 */
export async function addPlaceToWishlist(placeData, opts = {}) {
  // 1. Check if place already exists (by name + address)
  const { data: existing } = await supabase
    .from('places')
    .select('id')
    .eq('name', placeData.name)
    .eq('address', placeData.address ?? '')
    .maybeSingle()

  let placeId = existing?.id

  // 2. If not, insert a minimal place stub
  if (!placeId) {
    const { data: newPlace, error: insertErr } = await supabase
      .from('places')
      .insert({
        name:       placeData.name,
        address:    placeData.address   ?? null,
        photo_url:  placeData.photo_url ?? null,
        created_by: DEV_USER_ID,
      })
      .select('id')
      .single()

    if (insertErr) throw new Error(`addPlaceToWishlist insert: ${insertErr.message}`)
    placeId = newPlace.id
  }

  // 3. Add to wishlist
  await addToWishlist(placeId, opts)
  return placeId
}

/**
 * Remove a place from the current user's wishlist.
 */
export async function removeFromWishlist(placeId) {
  const { error } = await supabase
    .from('wishlists')
    .delete()
    .eq('user_id',  DEV_USER_ID)
    .eq('place_id', placeId)

  if (error) throw new Error(`removeFromWishlist: ${error.message}`)
}
