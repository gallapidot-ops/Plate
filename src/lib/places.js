/**
 * Google Places API (New) helpers
 * Docs: https://developers.google.com/maps/documentation/places/web-service/op-overview
 */

const KEY      = import.meta.env.VITE_GOOGLE_PLACES_KEY
const BASE     = 'https://places.googleapis.com/v1'


/* ── Autocomplete ─────────────────────────────────────────────────────
   Returns [{ placeId, name, address, mainText, secondaryText }]
─────────────────────────────────────────────────────────────────────── */
export async function autocomplete(query) {
  if (!query || query.length < 2) return []

  const res = await fetch(`${BASE}/places:autocomplete`, {
    method: 'POST',
    headers: {
      'Content-Type':  'application/json',
      'X-Goog-Api-Key': KEY,
    },
    body: JSON.stringify({
      input:        query,
      languageCode: 'he',
    }),
  })

  if (!res.ok) {
    console.error('[places] autocomplete error:', res.status, await res.text())
    return []
  }

  const json = await res.json()

  return (json.suggestions ?? []).map(s => {
    const p = s.placePrediction
    return {
      placeId:       p.placeId,
      name:          p.structuredFormat?.mainText?.text    ?? p.text?.text ?? '',
      address:       p.structuredFormat?.secondaryText?.text ?? '',
      mainText:      p.structuredFormat?.mainText?.text    ?? '',
      secondaryText: p.structuredFormat?.secondaryText?.text ?? '',
    }
  })
}

/* ── City Autocomplete ────────────────────────────────────────────────
   Returns [{ placeId, name }] — cities only
─────────────────────────────────────────────────────────────────────── */
export async function autocompleteCity(query) {
  if (!query || query.length < 2) return []

  const res = await fetch(`${BASE}/places:autocomplete`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'X-Goog-Api-Key': KEY },
    body: JSON.stringify({
      input:               query,
      languageCode:        'he',
      includedPrimaryTypes: ['locality'],
    }),
  })

  if (!res.ok) return []

  const json = await res.json()
  return (json.suggestions ?? []).map(s => ({
    placeId: s.placePrediction.placeId,
    name:    s.placePrediction.structuredFormat?.mainText?.text
          ?? s.placePrediction.text?.text
          ?? '',
  }))
}

/* ── Place Details ────────────────────────────────────────────────────
   Returns { placeId, name, address, lat, lng, photo_url, website }
   photo_url is the first photo from Google (ready-to-use URL)
─────────────────────────────────────────────────────────────────────── */
export async function getPlaceDetails(placeId) {
  const fields = [
    'id',
    'displayName',
    'formattedAddress',
    'addressComponents',
    'location',
    'photos',
    'websiteUri',
    'regularOpeningHours',
  ].join(',')

  const res = await fetch(`${BASE}/places/${placeId}?languageCode=he`, {
    headers: {
      'X-Goog-Api-Key':  KEY,
      'X-Goog-FieldMask': fields,
    },
  })

  if (!res.ok) {
    console.error('[places] details error:', res.status, await res.text())
    return null
  }

  const p = await res.json()

  // Extract city from address components:
  // locality (exact city) → sublocality_level_1 → administrative_area_level_2
  // Never use administrative_area_level_1 (that's the district/state, e.g. "Tel Aviv District")
  const addrComponents = p.addressComponents ?? []
  const localityComp =
    addrComponents.find(c => c.types?.includes('locality')) ??
    addrComponents.find(c => c.types?.includes('sublocality_level_1')) ??
    addrComponents.find(c => c.types?.includes('administrative_area_level_2'))
  const city = localityComp?.longText ?? null

  // Build a direct photo URL for the first photo
  const photoName = p.photos?.[0]?.name
  const photo_url = photoName
    ? `${BASE}/${photoName}/media?maxHeightPx=800&key=${KEY}`
    : null

  return {
    placeId:  p.id,
    name:     p.displayName?.text ?? '',
    address:  p.formattedAddress  ?? '',
    city,
    lat:      p.location?.latitude  ?? null,
    lng:      p.location?.longitude ?? null,
    photo_url,
    website:  p.websiteUri ?? null,
  }
}
