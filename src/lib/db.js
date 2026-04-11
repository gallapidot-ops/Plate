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
    name, address, city, photo_url,
    personal_note, is_regular, last_visited,
    meal_types, experience_type,
    ratings, computed_score, price_tier, tags,
    placeId, lat, lng, website,
  } = placeData

  const userId          = await getUserId()
  const primaryMealType = meal_types?.[0] ?? null

  console.log('[savePlace] userId:', userId)
  console.log('[savePlace] meal_types:', meal_types, '| computed_score:', computed_score)

  const placeRow = {
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
  }
  if (city != null) placeRow.city = city   // requires migration 008

  console.log('[savePlace] inserting place row:', placeRow)

  const { data: place, error: placeErr } = await supabase
    .from('places')
    .insert(placeRow)
    .select()
    .single()

  if (placeErr) {
    console.error('[savePlace] places insert error:', placeErr)
    throw new Error(`places insert: ${placeErr.message}`)
  }

  console.log('[savePlace] place inserted, id:', place.id)

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

  console.log('[savePlace] inserting rating rows:', ratingRows)

  if (ratingRows.length > 0) {
    const { error: ratingErr } = await supabase.from('place_ratings').insert(ratingRows)
    if (ratingErr) {
      console.error('[savePlace] place_ratings insert error:', ratingErr)
      throw new Error(`place_ratings insert: ${ratingErr.message}`)
    }
  }

  console.log('[savePlace] done ✓')
  return place
}

export async function updatePlace(placeId, placeData) {
  const {
    name, address, city, photo_url,
    personal_note, is_regular, last_visited,
    meal_types, experience_type,
    ratings, computed_score, price_tier, tags,
    lat, lng, website,
  } = placeData

  const userId          = await getUserId()
  const primaryMealType = meal_types?.[0] ?? null

  const updateRow = {
    name,
    address:       address       ?? null,
    photo_url:     photo_url     ?? null,
    personal_note: personal_note ?? null,
    is_regular:    !!is_regular,
    last_visited: is_regular
      ? null
      : (last_visited || new Date().toISOString().split('T')[0]),
    lat:           lat           ?? null,
    lng:           lng           ?? null,
    website:       website       ?? null,
  }
  if (city != null) updateRow.city = city   // requires migration 008

  // Update the place row
  const { error: placeErr } = await supabase
    .from('places')
    .update(updateRow)
    .eq('id',         placeId)
    .eq('created_by', userId)

  if (placeErr) throw new Error(`places update: ${placeErr.message}`)

  // Replace all ratings for this user+place
  await supabase.from('place_ratings').delete()
    .eq('place_id', placeId).eq('user_id', userId)

  const ratingRows = (meal_types ?? []).filter(Boolean).map(mt => ({
    place_id:        placeId,
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
    if (ratingErr) throw new Error(`place_ratings insert (update): ${ratingErr.message}`)
  }
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

  return (data ?? [])
    .filter(p => (p.place_ratings ?? []).length > 0)   // exclude wishlist-only entries
    .map(p => ({
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

  const row = {
    user_id:    userId,
    place_id:   placeId,
    added_from: opts.added_from ?? 'Discovery',
    added_note: opts.added_note ?? null,
    priority:   opts.priority   ?? 'medium',
  }

  const { error } = await supabase.from('wishlists').upsert(row)

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

/* ═══════════════════════════════════════════════════════════
   SEARCH
═══════════════════════════════════════════════════════════ */

/**
 * Search places filtered by meal types + optional filters.
 * scope: 'mine' | 'social' | 'all'
 *
 * Accepts arrays: mealTypes[], experiences[]
 * Also accepts legacy single values: mealType, experience (for backward compat)
 */
export async function searchPlaces({
  mealTypes   = [],
  experiences = [],
  mealType,     // legacy single value
  experience,   // legacy single value
  location,
  tags        = [],
  price       = [],
  reservation = [],
  scope       = 'all',
}) {
  const userId = await getUserId()

  // Normalise to arrays (support legacy single-value callers)
  const effectiveMealTypes = mealTypes.length > 0 ? mealTypes : (mealType ? [mealType] : [])
  const effectiveExps      = experiences.length > 0 ? experiences : (experience ? [experience] : [])

  // Fetch following IDs for social scope
  let userIds = null
  if (scope === 'mine') {
    userIds = [userId]
  } else if (scope === 'social') {
    const { data: follows } = await supabase
      .from('follows')
      .select('following_id')
      .eq('follower_id', userId)
    userIds = [userId, ...(follows ?? []).map(f => f.following_id)]
  }

  let query = supabase
    .from('place_ratings')
    .select(`
      meal_type, experience_type, computed_score,
      places ( id, name, address, photo_url )
    `)
    .order('computed_score', { ascending: false })

  if (effectiveMealTypes.length > 0) {
    query = query.in('meal_type', effectiveMealTypes)
  }

  if (userIds) {
    query = query.in('user_id', userIds)
  }

  if (effectiveExps.length > 0) {
    query = query.in('experience_type', effectiveExps)
  }

  if (tags.length > 0) {
    query = query.overlaps('tags', tags)
  }

  if (price.length > 0) {
    query = query.in('price', price)
  }

  if (reservation.length > 0) {
    query = query.in('need_reservation', reservation)
  }

  const { data, error } = await query

  if (error) { console.error('[db] searchPlaces:', error.message); return [] }

  let results = (data ?? [])
    .filter(r => r.places !== null)
    .map(r => ({
      id:              r.places.id,
      name:            r.places.name,
      address:         r.places.address,
      photo_url:       r.places.photo_url,
      computed_score:  r.computed_score,
      experience_type: r.experience_type,
    }))

  // Client-side location filter on address
  if (location && location.trim()) {
    const loc = location.trim().toLowerCase()
    results = results.filter(r => r.address?.toLowerCase().includes(loc))
  }

  // Deduplicate by place id (a place may have multiple ratings)
  const seen = new Set()
  return results.filter(r => {
    if (seen.has(r.id)) return false
    seen.add(r.id)
    return true
  })
}

/**
 * Fetch all community places for Best Match discovery.
 * Returns places with lat/lng, sorted by score desc.
 * Optionally filtered by meal types and/or experience types.
 */
export async function getPlacesForDiscovery({ mealTypes = [], experienceTypes = [] } = {}) {
  let query = supabase
    .from('place_ratings')
    .select(`
      meal_type, experience_type, computed_score,
      places ( id, name, address, city, photo_url, lat, lng, google_place_id )
    `)
    .order('computed_score', { ascending: false })

  if (mealTypes.length > 0) {
    query = query.in('meal_type', mealTypes)
  }
  if (experienceTypes.length > 0) {
    query = query.in('experience_type', experienceTypes)
  }

  const { data, error } = await query
  if (error) { console.error('[db] getPlacesForDiscovery:', error.message); return [] }

  // Deduplicate by place id — keep highest computed_score row
  const map = new Map()
  for (const r of data ?? []) {
    const p = r.places
    if (!p?.lat || !p?.lng) continue
    const existing = map.get(p.id)
    if (!existing || (r.computed_score ?? 0) > (existing.computed_score ?? 0)) {
      map.set(p.id, {
        id:              p.id,
        name:            p.name,
        address:         p.address,
        city:            p.city,
        photo_url:       p.photo_url,
        lat:             p.lat,
        lng:             p.lng,
        google_place_id: p.google_place_id,
        computed_score:  r.computed_score ?? 0,
        meal_type:       r.meal_type,
        experience_type: r.experience_type,
      })
    }
  }

  return [...map.values()].sort((a, b) => b.computed_score - a.computed_score)
}

/**
 * Search users by username (partial match, min 2 chars).
 */
export async function searchUsers(query) {
  if (!query || query.trim().length < 2) return []

  const { data, error } = await supabase
    .from('users')
    .select('id, name, username, avatar_url, home_city, privacy_level')
    .ilike('username', `%${query.trim()}%`)
    .limit(20)

  if (error) { console.error('[db] searchUsers:', error.message); return [] }
  return data ?? []
}

/* ═══════════════════════════════════════════════════════════
   FOLLOW SYSTEM
═══════════════════════════════════════════════════════════ */

/** Immediately follow a public-profile user. */
export async function followUser(targetUserId) {
  const userId = await getUserId()
  const { error } = await supabase.from('follows').insert({
    follower_id:  userId,
    following_id: targetUserId,
  })
  if (error && !error.message.includes('duplicate')) throw new Error(error.message)
}

/** Unfollow a user. */
export async function unfollowUser(targetUserId) {
  const userId = await getUserId()
  const { error } = await supabase.from('follows')
    .delete()
    .eq('follower_id',  userId)
    .eq('following_id', targetUserId)
  if (error) throw new Error(error.message)
}

/** Send a follow request (private / followers-only profile). */
export async function sendFollowRequest(targetUserId) {
  const userId = await getUserId()
  const { error } = await supabase.from('follow_requests').upsert({
    from_user_id: userId,
    to_user_id:   targetUserId,
    status:       'pending',
  })
  if (error) throw new Error(error.message)
}

/** Cancel (withdraw) a previously-sent follow request. */
export async function cancelFollowRequest(targetUserId) {
  const userId = await getUserId()
  const { error } = await supabase.from('follow_requests')
    .delete()
    .eq('from_user_id', userId)
    .eq('to_user_id',   targetUserId)
  if (error) throw new Error(error.message)
}

/**
 * Return current follow relationship from the logged-in user → targetUserId.
 * Returns: 'following' | 'requested' | 'none'
 */
export async function getFollowStatus(targetUserId) {
  const userId = await getUserId()
  const [{ data: follow }, { data: request }] = await Promise.all([
    supabase.from('follows')
      .select('follower_id')
      .eq('follower_id',  userId)
      .eq('following_id', targetUserId)
      .maybeSingle(),
    supabase.from('follow_requests')
      .select('status')
      .eq('from_user_id', userId)
      .eq('to_user_id',   targetUserId)
      .maybeSingle(),
  ])
  if (follow) return 'following'
  if (request?.status === 'pending') return 'requested'
  return 'none'
}

/** Pending follow requests sent TO the current user (for Notifications). */
export async function getPendingFollowRequests() {
  const userId = await getUserId()
  const { data, error } = await supabase
    .from('follow_requests')
    .select(`
      id, created_at,
      from_user:from_user_id ( id, name, username, avatar_url )
    `)
    .eq('to_user_id', userId)
    .eq('status', 'pending')
    .order('created_at', { ascending: false })
  if (error) { console.error('[db] getPendingFollowRequests:', error.message); return [] }
  return data ?? []
}

/** Count of pending requests — used for notification badge. */
export async function getPendingRequestCount() {
  const userId = await getUserId()
  const { count, error } = await supabase
    .from('follow_requests')
    .select('*', { count: 'exact', head: true })
    .eq('to_user_id', userId)
    .eq('status', 'pending')
  if (error) return 0
  return count ?? 0
}

/**
 * Accept a follow request:
 * inserts follower → currentUser into follows, marks request accepted.
 */
export async function acceptFollowRequest(requestId, fromUserId) {
  const userId = await getUserId()
  const { error: fErr } = await supabase.from('follows').insert({
    follower_id:  fromUserId,
    following_id: userId,
  })
  if (fErr && !fErr.message.includes('duplicate')) throw new Error(fErr.message)
  const { error: rErr } = await supabase.from('follow_requests')
    .update({ status: 'accepted' })
    .eq('id', requestId)
  if (rErr) throw new Error(rErr.message)
}

/** Decline a follow request (marks as declined, leaves in table). */
export async function declineFollowRequest(requestId) {
  const { error } = await supabase.from('follow_requests')
    .update({ status: 'declined' })
    .eq('id', requestId)
  if (error) throw new Error(error.message)
}

/** Fetch all places logged by a specific user (same shape as getMyPlaces). */
export async function getPlacesByUser(userId) {
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

  if (error) { console.error('[db] getPlacesByUser:', error.message); return [] }

  return (data ?? [])
    .filter(p => (p.place_ratings ?? []).length > 0)   // exclude wishlist-only entries
    .map(p => ({
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

/** Number of places a user has logged. */
export async function getPlaceCountByUser(userId) {
  const { count, error } = await supabase
    .from('places')
    .select('*', { count: 'exact', head: true })
    .eq('created_by', userId)
  if (error) return 0
  return count ?? 0
}

/* ═══════════════════════════════════════════════════════════
   NOTIFICATIONS
═══════════════════════════════════════════════════════════ */

/** Returns the list of users the current user follows (for sharing). */
export async function getFollowing() {
  const userId = await getUserId()

  const { data: followData, error: followErr } = await supabase
    .from('follows')
    .select('following_id')
    .eq('follower_id', userId)

  if (followErr) { console.error('[db] getFollowing follows:', followErr.message); return [] }

  const ids = (followData ?? []).map(f => f.following_id)
  if (ids.length === 0) return []

  const { data, error } = await supabase
    .from('users')
    .select('id, name, username, avatar_url')
    .in('id', ids)

  if (error) { console.error('[db] getFollowing users:', error.message); return [] }
  return data ?? []
}

/** Share a place with another user — inserts a place_share notification row. */
export async function sharePlace(toUserId, placeId) {
  const userId = await getUserId()
  const { error } = await supabase.from('notifications').insert({
    type:         'place_share',
    from_user_id: userId,
    to_user_id:   toUserId,
    place_id:     placeId ?? null,
  })
  if (error) throw new Error(`sharePlace: ${error.message}`)
}

/** Fetch place_share notifications received by the current user. */
export async function getPlaceShareNotifications() {
  const userId = await getUserId()
  const { data, error } = await supabase
    .from('notifications')
    .select(`
      id, read, created_at,
      from_user:from_user_id ( id, name, username, avatar_url ),
      place:place_id ( id, name, address, photo_url )
    `)
    .eq('to_user_id', userId)
    .eq('type', 'place_share')
    .order('created_at', { ascending: false })
  if (error) { console.error('[db] getPlaceShareNotifications:', error.message); return [] }
  return data ?? []
}

/** Mark a notification as read. */
export async function markNotificationRead(notifId) {
  const { error } = await supabase
    .from('notifications')
    .update({ read: true })
    .eq('id', notifId)
  if (error) throw new Error(`markNotificationRead: ${error.message}`)
}

/** Count of unread place_share notifications for badge display. */
export async function getUnreadShareCount() {
  const userId = await getUserId()
  const { count, error } = await supabase
    .from('notifications')
    .select('*', { count: 'exact', head: true })
    .eq('to_user_id', userId)
    .eq('type', 'place_share')
    .eq('read', false)
  if (error) return 0
  return count ?? 0
}

/** Delete a place (and its ratings) owned by the current user. */
export async function deletePlace(placeId) {
  const userId = await getUserId()
  console.log('[deletePlace] userId:', userId, '| placeId:', placeId)

  // Ratings are deleted first (FK constraint); then the place row.
  const { error: rErr } = await supabase.from('place_ratings')
    .delete()
    .eq('place_id', placeId)
    .eq('user_id',  userId)

  if (rErr) {
    console.error('[deletePlace] place_ratings delete error:', rErr)
    throw new Error(`deletePlace ratings: ${rErr.message}`)
  }

  const { error } = await supabase.from('places')
    .delete()
    .eq('id',         placeId)
    .eq('created_by', userId)

  if (error) {
    console.error('[deletePlace] places delete error:', error)
    throw new Error(`deletePlace: ${error.message}`)
  }

  console.log('[deletePlace] done ✓')
}
