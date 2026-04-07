// Practical details keyed by place name – merged into any place object at runtime
export const PLACE_DETAILS = {
  'לחמים': {
    hours: 'א׳–ו׳ 07:00–18:00 | שבת 07:00–14:00',
    website: 'lechamim.co.il',
    parking: true,
    happy_hour: false,
    need_reservation: 'walk_in',
    price: 'fair',
    tags: ['מאפייה', 'בוקר', 'טבעוני ידידותי', 'ללא גלוטן'],
    taste: 'delicious', spread: 'feast', aesthetic: 'charming', service: 'friendly',
  },
  'קפה נמרוד': {
    hours: 'א׳–ש׳ 08:00–22:00',
    website: null,
    parking: false,
    happy_hour: false,
    need_reservation: 'walk_in',
    price: 'fair',
    tags: ['קפה', 'ברנץ׳', 'מתאים לעבודה', 'כניסה חופשית'],
    taste: 'good', spread: 'balanced', aesthetic: 'charming', service: 'friendly',
  },
  'אנטקה': {
    hours: 'ג׳–ש׳ 19:00–00:00',
    website: 'antika-tlv.com',
    parking: false,
    happy_hour: false,
    need_reservation: 'required',
    price: 'worth_every_penny',
    tags: ['ארוחת ערב', 'רומנטי', 'הזמנה חובה', 'חוויה מלאה'],
    taste: 'delicious', spread: 'full', aesthetic: 'super_fine', service: 'professional',
  },
  'פורצ׳סטר': {
    hours: 'א׳–ו׳ 12:00–23:00 | שבת 11:00–23:00',
    website: null,
    parking: true,
    happy_hour: true,
    need_reservation: 'weekends',
    price: 'fair',
    tags: ['צהריים', 'האפי אור', 'עסקי'],
    taste: 'good', spread: 'balanced', aesthetic: 'plain', service: 'professional',
  },
  'הבית של שולמית': {
    hours: 'ו׳ 09:00–16:00 | שבת 09:00–16:00',
    website: null,
    parking: false,
    happy_hour: false,
    need_reservation: 'weekends',
    price: 'great_value',
    tags: ['ברנץ׳', 'צהריים', 'חוץ', 'שבת'],
    taste: 'delicious', spread: 'balanced', aesthetic: 'charming', service: 'friendly',
  },
  'בוקה': {
    hours: 'ג׳–ש׳ 19:30–01:00',
    website: 'boka-tlv.com',
    parking: false,
    happy_hour: false,
    need_reservation: 'required',
    price: 'worth_every_penny',
    tags: ['ארוחת ערב', 'רומנטי', 'הזמנה חובה', 'ויין'],
    taste: 'delicious', spread: 'full', aesthetic: 'super_fine', service: 'professional',
  },
  'ארטיסן': {
    hours: 'א׳–ו׳ 07:00–17:00 | שבת 07:00–13:00',
    website: null,
    parking: false,
    happy_hour: false,
    need_reservation: 'walk_in',
    price: 'great_value',
    tags: ['מאפייה', 'בוקר', 'שבת', 'טבעוני ידידותי'],
    taste: 'delicious', spread: 'feast', aesthetic: 'charming', service: 'friendly',
  },
  'הים והשמש': {
    hours: 'ו׳–ש׳ 09:00–16:00',
    website: null,
    parking: false,
    happy_hour: false,
    need_reservation: 'weekends',
    price: 'fair',
    tags: ['ברנץ׳', 'נוף', 'חוץ', 'שבת'],
    taste: 'good', spread: 'balanced', aesthetic: 'super_fine', service: 'friendly',
  },
  'נורמה': {
    hours: 'ב׳–ש׳ 19:00–03:00',
    website: null,
    parking: false,
    happy_hour: true,
    need_reservation: 'walk_in',
    price: 'fair',
    tags: ['שתייה', 'האפי אור', 'מוזיקה', 'לילה'],
    taste: 'good', spread: 'balanced', aesthetic: 'super_fine', service: 'friendly',
  },
  'מיקס': {
    hours: 'א׳–ש׳ 07:30–21:00',
    website: null,
    parking: false,
    happy_hour: false,
    need_reservation: 'walk_in',
    price: 'fair',
    tags: ['קפה', 'מתאים לעבודה', 'בוקר'],
    taste: 'good', spread: 'limited', aesthetic: 'charming', service: 'friendly',
  },
}

export const RESERVATION_LABELS = {
  grab_go: 'ללא ישיבה / טייק אוויי',
  walk_in: 'כניסה חופשית',
  weekends: 'כדאי להזמין בסופ"ש',
  required: 'הזמנה חובה',
}

export const PRICE_LABELS = {
  overpriced: 'יקר מדי',
  fair: 'הגיוני',
  great_value: 'תמורה מצוינת',
  worth_every_penny: 'שווה כל שקל',
}

export const SCORE_LABELS = {
  taste:     { label: 'טעם',    poor: 0, basic: 5, good: 10, delicious: 14 },
  spread:    { label: 'מגוון',  minimal: 1, limited: 2, balanced: 3, full: 3, feast: 3 },
  aesthetic: { label: 'אווירה', off: 0, plain: 1, charming: 4, super_fine: 5 },
  service:   { label: 'שירות',  off: 0, basic: 1, friendly: 2, professional: 3 },
}

export const CATEGORY_OPTION_LABELS = {
  // taste
  poor: 'מאכזב', basic: 'בסיסי', good: 'טעים', delicious: 'מדהים',
  // spread
  minimal: 'מינימלי', limited: 'בחירה מוגבלת', balanced: 'מאוזן', full: 'חוויה מלאה', feast: 'משתה',
  // aesthetic
  off: 'מפספס', plain: 'פשוט', charming: 'קסום', super_fine: 'מרהיב',
  // service
  friendly: 'ידידותי וחלק', professional: 'מקצועי',
}

// Merge place with its details
export function enrichPlace(place) {
  const details = PLACE_DETAILS[place.name] || {}
  return { ...place, ...details }
}
