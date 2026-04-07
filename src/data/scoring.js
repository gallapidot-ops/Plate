export const MEAL_TYPES = [
  { id: 'cafe', label: 'קפה' },
  { id: 'bakery', label: 'מאפייה' },
  { id: 'deli', label: 'דלי' },
  { id: 'brunch', label: 'ברנץ׳' },
  { id: 'lunch', label: 'צהריים' },
  { id: 'happy_hour', label: 'האפי אור' },
  { id: 'dinner', label: 'ארוחת ערב' },
  { id: 'drinks', label: 'שתייה' },
]

export const EXPERIENCE_TYPES = [
  {
    id: 'quick_light',
    label: 'מהיר וקליל',
    description: 'יושבים בקצרה, אולי תופסים כריך, מאפה או קפה. לא מיועד לביקורים ארוכים.',
  },
  {
    id: 'catchup',
    label: 'להיפגש / לשוחח',
    description: 'ויב של "בואו נשב ונדבר" – בתי קפה, מקומות כל-היום, ברנץ׳ קז׳ואל עם חברים.',
  },
  {
    id: 'shared_table',
    label: 'שולחן משותף',
    description: 'פותחים את השולחן – הזמנה של כמה מנות, חלקן לשיתוף, אולי יין.',
  },
  {
    id: 'full_experience',
    label: 'חוויה מלאה',
    description: 'ארוחת מסעדה אמיתית: קורסים, פיירינג יין, עיצוב, שירות, תרבות הזמנה.',
  },
]

// Taste scores per meal type
export const TASTE_OPTIONS = [
  {
    id: 'poor',
    label: 'מאכזב',
    scores: { cafe: 0, bakery: 0, deli: 0, brunch: 0, lunch: 0, happy_hour: 0, dinner: 0, drinks: 0 },
  },
  {
    id: 'basic',
    label: 'בסיסי',
    scores: { cafe: 5, bakery: 5, deli: 5, brunch: 4, lunch: 4, happy_hour: 5, dinner: 4, drinks: 5 },
  },
  {
    id: 'good',
    label: 'טעים',
    scores: { cafe: 10, bakery: 10, deli: 10, brunch: 8, lunch: 7, happy_hour: 7, dinner: 9, drinks: 7 },
  },
  {
    id: 'delicious',
    label: 'מדהים!',
    scores: { cafe: 14, bakery: 15, deli: 15, brunch: 10, lunch: 10, happy_hour: 9, dinner: 12, drinks: 9 },
  },
]

// Spread scores per meal type
export const SPREAD_OPTIONS = [
  {
    id: 'minimal',
    label: 'מינימלי',
    scores: { cafe: 1, bakery: 0, deli: 0, brunch: 0, lunch: 1, happy_hour: 2, dinner: 0, drinks: 2 },
  },
  {
    id: 'limited',
    label: 'בחירה מוגבלת',
    scores: { cafe: 2, bakery: 1, deli: 1, brunch: 1, lunch: 2, happy_hour: 3, dinner: 1, drinks: 3 },
  },
  {
    id: 'balanced',
    label: 'מגוון מאוזן',
    scores: { cafe: 3, bakery: 2, deli: 2, brunch: 3, lunch: 3, happy_hour: 4, dinner: 2, drinks: 4 },
  },
  {
    id: 'full',
    label: 'חוויה מלאה',
    scores: { cafe: 3, bakery: 4, deli: 4, brunch: 5, lunch: 4, happy_hour: 4, dinner: 3, drinks: 4 },
  },
  {
    id: 'feast',
    label: 'משתה',
    scores: { cafe: 3, bakery: 5, deli: 5, brunch: 7, lunch: 5, happy_hour: 4, dinner: 4, drinks: 4 },
  },
]

// Aesthetic scores per meal type
export const AESTHETIC_OPTIONS = [
  {
    id: 'off',
    label: 'מפספס',
    scores: { cafe: 0, bakery: 0, deli: 0, brunch: 0, lunch: 0, happy_hour: 0, dinner: 0, drinks: 0 },
  },
  {
    id: 'plain',
    label: 'פשוט',
    scores: { cafe: 1, bakery: 1, deli: 1, brunch: 1, lunch: 1, happy_hour: 1, dinner: 1, drinks: 1 },
  },
  {
    id: 'charming',
    label: 'קסום',
    scores: { cafe: 4, bakery: 2, deli: 2, brunch: 3, lunch: 3, happy_hour: 5, dinner: 3, drinks: 5 },
  },
  {
    id: 'super_fine',
    label: 'מרהיב',
    scores: { cafe: 5, bakery: 2, deli: 2, brunch: 5, lunch: 5, happy_hour: 8, dinner: 5, drinks: 8 },
  },
]

// Service scores per meal type
export const SERVICE_OPTIONS = [
  {
    id: 'off',
    label: 'לא מאורגן',
    scores: { cafe: 0, bakery: 0, deli: 0, brunch: 0, lunch: 0, happy_hour: 0, dinner: 0, drinks: 0 },
  },
  {
    id: 'basic',
    label: 'בסיסי',
    scores: { cafe: 1, bakery: 0, deli: 0, brunch: 1, lunch: 1, happy_hour: 1, dinner: 1, drinks: 1 },
  },
  {
    id: 'friendly',
    label: 'ידידותי וחלק',
    scores: { cafe: 2, bakery: 1, deli: 1, brunch: 2, lunch: 3, happy_hour: 2, dinner: 3, drinks: 2 },
  },
  {
    id: 'professional',
    label: 'מקצועי',
    scores: { cafe: 3, bakery: 3, deli: 3, brunch: 3, lunch: 5, happy_hour: 4, dinner: 4, drinks: 4 },
  },
]

export const NEED_RESERVATION_OPTIONS = [
  { id: 'grab_go', label: 'ללא ישיבה / לקחת ולצאת' },
  { id: 'walk_in', label: 'כניסה חופשית' },
  { id: 'weekends', label: 'כדאי להזמין בסופ"ש / שעות עומס' },
  { id: 'required', label: 'הזמנה חובה' },
]

export const PRICE_OPTIONS = [
  { id: 'overpriced', label: 'יקר מדי' },
  { id: 'fair', label: 'הגיוני' },
  { id: 'great_value', label: 'תמורה מצוינת' },
  { id: 'worth_every_penny', label: 'שווה כל שקל' },
]

export const TAGS = [
  { id: 'kosher', label: 'כשר' },
  { id: 'romantic', label: 'רומנטי' },
  { id: 'work_friendly', label: 'מתאים לעבודה' },
  { id: 'outdoor', label: 'חוץ' },
  { id: 'vegan', label: 'טבעוני' },
  { id: 'group_friendly', label: 'מתאים לקבוצות' },
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
    { key: 'taste',     label: 'טעם',    opts: TASTE_OPTIONS },
    { key: 'spread',    label: 'מגוון',  opts: SPREAD_OPTIONS },
    { key: 'aesthetic', label: 'אווירה', opts: AESTHETIC_OPTIONS },
    { key: 'service',   label: 'שירות',  opts: SERVICE_OPTIONS },
  ]
  return cats.map(cat => {
    const option   = cat.opts.find(o => o.id === rating[cat.key])
    const score    = option?.scores[mealType] ?? 0
    const max      = Math.max(...cat.opts.map(o => o.scores[mealType] ?? 0))
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
    name: 'לחמים',
    address: 'המלאכה 3, תל אביב',
    photo_url: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?w=800&q=80',
  },
  {
    id: '2',
    name: 'קפה נמרוד',
    address: 'שינקין 45, תל אביב',
    photo_url: 'https://images.unsplash.com/photo-1554118811-1e0d58224f24?w=800&q=80',
  },
  {
    id: '3',
    name: 'אנטקה',
    address: 'נחלת בנימין 35, תל אביב',
    photo_url: 'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=800&q=80',
  },
  {
    id: '4',
    name: 'פורצ׳סטר',
    address: 'המלך ג׳ורג 23, תל אביב',
    photo_url: 'https://images.unsplash.com/photo-1600891964092-4316c288032e?w=800&q=80',
  },
  {
    id: '5',
    name: 'הבית של שולמית',
    address: 'דיזנגוף 160, תל אביב',
    photo_url: 'https://images.unsplash.com/photo-1550966871-3ed3cdb5ed0c?w=800&q=80',
  },
]
