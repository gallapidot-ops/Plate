export const MEAL_TYPES = [
  { id: 'cafe',        label: 'Café'          },
  { id: 'brunch',      label: 'Brunch'        },
  { id: 'lunch',       label: 'Lunch'         },
  { id: 'dinner',      label: 'Dinner'        },
  { id: 'bakery_deli', label: 'Bakery & Deli' },
  { id: 'drinks',      label: 'Drinks'        },
  /* Legacy ids kept for backward-compat with existing saved data */
  { id: 'bakery',      label: 'Bakery'        },
  { id: 'deli',        label: 'Deli'          },
  { id: 'happy_hour',  label: 'Happy Hour'    },
]

export const EXPERIENCE_TYPES = [
  {
    id: 'quick_light',
    label: 'Quick & Light',
    description: 'A quick stop — grabbing a sandwich, pastry, or coffee. Not meant for long stays.',
  },
  {
    id: 'catchup',
    label: 'Catch-up / Hangout',
    description: 'Sit-and-talk vibe — cafés, all-day spots, casual brunch with friends.',
  },
  {
    id: 'shared_table',
    label: 'Shared Table',
    description: 'Opening up the table — ordering several dishes, some to share, maybe wine.',
  },
  {
    id: 'full_experience',
    label: 'Full Experience',
    description: 'A proper restaurant meal: courses, wine pairing, design, service, the whole culture.',
  },
]

// Taste scores per meal type
export const TASTE_OPTIONS = [
  {
    id: 'poor',
    label: 'Poor / Disappointing',
    scores: { cafe: 0, bakery: 0, deli: 0, bakery_deli: 0, brunch: 0, lunch: 0, happy_hour: 0, dinner: 0, drinks: 0 },
  },
  {
    id: 'basic',
    label: 'Basic',
    scores: { cafe: 5, bakery: 5, deli: 5, bakery_deli: 5, brunch: 4, lunch: 4, happy_hour: 5, dinner: 4, drinks: 5 },
  },
  {
    id: 'good',
    label: 'Good & Tasty',
    scores: { cafe: 10, bakery: 10, deli: 10, bakery_deli: 10, brunch: 8, lunch: 7, happy_hour: 7, dinner: 9, drinks: 7 },
  },
  {
    id: 'delicious',
    label: 'Delicious!',
    scores: { cafe: 14, bakery: 15, deli: 15, bakery_deli: 15, brunch: 10, lunch: 10, happy_hour: 9, dinner: 12, drinks: 9 },
  },
]

// Spread scores per meal type
export const SPREAD_OPTIONS = [
  {
    id: 'minimal',
    label: 'Minimal',
    scores: { cafe: 1, bakery: 0, deli: 0, bakery_deli: 0, brunch: 0, lunch: 1, happy_hour: 2, dinner: 0, drinks: 2 },
  },
  {
    id: 'limited',
    label: 'Limited Choice',
    scores: { cafe: 2, bakery: 1, deli: 1, bakery_deli: 1, brunch: 1, lunch: 2, happy_hour: 3, dinner: 1, drinks: 3 },
  },
  {
    id: 'balanced',
    label: 'Balanced Selection',
    scores: { cafe: 3, bakery: 2, deli: 2, bakery_deli: 2, brunch: 3, lunch: 3, happy_hour: 4, dinner: 2, drinks: 4 },
  },
  {
    id: 'full',
    label: 'Full Experience',
    scores: { cafe: 3, bakery: 4, deli: 4, bakery_deli: 4, brunch: 5, lunch: 4, happy_hour: 4, dinner: 3, drinks: 4 },
  },
  {
    id: 'feast',
    label: 'The Feast',
    scores: { cafe: 3, bakery: 5, deli: 5, bakery_deli: 5, brunch: 7, lunch: 5, happy_hour: 4, dinner: 4, drinks: 4 },
  },
]

// Aesthetic scores per meal type
export const AESTHETIC_OPTIONS = [
  {
    id: 'off',
    label: 'Off',
    scores: { cafe: 0, bakery: 0, deli: 0, bakery_deli: 0, brunch: 0, lunch: 0, happy_hour: 0, dinner: 0, drinks: 0 },
  },
  {
    id: 'plain',
    label: 'Plain',
    scores: { cafe: 1, bakery: 1, deli: 1, bakery_deli: 1, brunch: 1, lunch: 1, happy_hour: 1, dinner: 1, drinks: 1 },
  },
  {
    id: 'charming',
    label: 'Charming',
    scores: { cafe: 4, bakery: 2, deli: 2, bakery_deli: 2, brunch: 3, lunch: 3, happy_hour: 5, dinner: 3, drinks: 5 },
  },
  {
    id: 'super_fine',
    label: 'Super Fine',
    scores: { cafe: 5, bakery: 2, deli: 2, bakery_deli: 2, brunch: 5, lunch: 5, happy_hour: 8, dinner: 5, drinks: 8 },
  },
]

// Service scores per meal type
export const SERVICE_OPTIONS = [
  {
    id: 'off',
    label: 'Off / Disorganized',
    scores: { cafe: 0, bakery: 0, deli: 0, bakery_deli: 0, brunch: 0, lunch: 0, happy_hour: 0, dinner: 0, drinks: 0 },
  },
  {
    id: 'basic',
    label: 'Basic',
    scores: { cafe: 1, bakery: 0, deli: 0, bakery_deli: 0, brunch: 1, lunch: 1, happy_hour: 1, dinner: 1, drinks: 1 },
  },
  {
    id: 'friendly',
    label: 'Friendly & Smooth',
    scores: { cafe: 2, bakery: 1, deli: 1, bakery_deli: 1, brunch: 2, lunch: 3, happy_hour: 2, dinner: 3, drinks: 2 },
  },
  {
    id: 'professional',
    label: 'Professional',
    scores: { cafe: 3, bakery: 3, deli: 3, bakery_deli: 3, brunch: 3, lunch: 5, happy_hour: 4, dinner: 4, drinks: 4 },
  },
]

export const NEED_RESERVATION_OPTIONS = [
  { id: 'grab_go',  label: 'No seating / Grab & Go'       },
  { id: 'walk_in',  label: 'Walk-in'                      },
  { id: 'weekends', label: 'Book on weekends / peak hours' },
  { id: 'required', label: 'Reservation required'         },
]

export const PRICE_OPTIONS = [
  { id: 'overpriced',        label: 'Overpriced'        },
  { id: 'fair',              label: 'Reasonable'        },
  { id: 'great_value',       label: 'Great Value'       },
  { id: 'worth_every_penny', label: 'Worth Every Penny' },
]

export const TAGS = [
  { id: 'kosher',         label: 'Kosher'         },
  { id: 'romantic',       label: 'Romantic'       },
  { id: 'work_friendly',  label: 'Work-Friendly'  },
  { id: 'outdoor',        label: 'Outdoor'        },
  { id: 'vegan',          label: 'Vegan'          },
  { id: 'group_friendly', label: 'Group Friendly' },
]

export function computeScore(rating, mealType) {
  if (!mealType || !rating?.taste) return 0
  const taste     = TASTE_OPTIONS.find(o => o.id === rating.taste)?.scores[mealType] ?? 0
  const spread    = SPREAD_OPTIONS.find(o => o.id === rating.spread)?.scores[mealType] ?? 0
  const aesthetic = AESTHETIC_OPTIONS.find(o => o.id === rating.aesthetic)?.scores[mealType] ?? 0
  const service   = SERVICE_OPTIONS.find(o => o.id === rating.service)?.scores[mealType] ?? 0
  return taste + spread + aesthetic + service
}

// Full breakdown for a rating+mealType: [{key, label, optionLabel, score, max}]
export function computeBreakdown(rating, mealType) {
  if (!rating || !mealType) return []
  const cats = [
    { key: 'taste',     label: 'Taste Level',   opts: TASTE_OPTIONS     },
    { key: 'spread',    label: 'The Spread',     opts: SPREAD_OPTIONS    },
    { key: 'aesthetic', label: 'Aesthetic Mood', opts: AESTHETIC_OPTIONS },
    { key: 'service',   label: 'Service Flow',   opts: SERVICE_OPTIONS   },
  ]
  return cats.map(cat => {
    const option = cat.opts.find(o => o.id === rating[cat.key])
    const score  = option?.scores[mealType] ?? 0
    const max    = Math.max(...cat.opts.map(o => o.scores[mealType] ?? 0))
    return { key: cat.key, label: cat.label, optionLabel: option?.label ?? '', score, max }
  })
}

// Returns { [mealType]: totalScore } for all rated meal types on a place
export function getPlaceScores(place) {
  if (!place?.ratings) return {}
  return Object.fromEntries(
    Object.entries(place.ratings).map(([mt, r]) => [mt, computeScore(r, mt)])
  )
}

// Best (highest) score across all rated meal types; falls back to computed_score
export function getBestScore(place) {
  const scores = Object.values(getPlaceScores(place))
  if (scores.length > 0) return Math.max(...scores)
  return place.computed_score ?? place.score ?? null
}

// Score for a specific meal type; falls back to best score
export function getDisplayScore(place, mealTypeFilter) {
  if (mealTypeFilter) {
    const scores = getPlaceScores(place)
    if (scores[mealTypeFilter] !== undefined) return scores[mealTypeFilter]
  }
  return getBestScore(place)
}

export const MOCK_PLACES = [
  {
    id: '1',
    name: 'Lechamim',
    address: '3 HaMelacha St, Tel Aviv',
    photo_url: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?w=800&q=80',
  },
  {
    id: '2',
    name: 'Café Nimrod',
    address: '45 Shenkin St, Tel Aviv',
    photo_url: 'https://images.unsplash.com/photo-1554118811-1e0d58224f24?w=800&q=80',
  },
  {
    id: '3',
    name: 'Antika',
    address: '35 Nachalat Binyamin, Tel Aviv',
    photo_url: 'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=800&q=80',
  },
  {
    id: '4',
    name: 'Porchester',
    address: '23 King George St, Tel Aviv',
    photo_url: 'https://images.unsplash.com/photo-1600891964092-4316c288032e?w=800&q=80',
  },
  {
    id: '5',
    name: "Shulamit's House",
    address: '160 Dizengoff St, Tel Aviv',
    photo_url: 'https://images.unsplash.com/photo-1550966871-3ed3cdb5ed0c?w=800&q=80',
  },
]
