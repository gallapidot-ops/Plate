// Practical details keyed by place name – merged into any place object at runtime
export const PLACE_DETAILS = {
  'Lechamim': {
    hours: 'Sun–Fri 07:00–18:00 | Sat 07:00–14:00',
    website: 'lechamim.co.il',
    parking: true,
    happy_hour: false,
    need_reservation: 'walk_in',
    price: 'fair',
    tags: ['Bakery', 'Morning', 'Vegan-friendly', 'Gluten-free'],
    taste: 'delicious', spread: 'feast', aesthetic: 'charming', service: 'friendly',
  },
  'Café Nimrod': {
    hours: 'Sun–Sat 08:00–22:00',
    website: null,
    parking: false,
    happy_hour: false,
    need_reservation: 'walk_in',
    price: 'fair',
    tags: ['Café', 'Brunch', 'Work-Friendly', 'Walk-in'],
    taste: 'good', spread: 'balanced', aesthetic: 'charming', service: 'friendly',
  },
  'Antika': {
    hours: 'Tue–Sat 19:00–00:00',
    website: 'antika-tlv.com',
    parking: false,
    happy_hour: false,
    need_reservation: 'required',
    price: 'worth_every_penny',
    tags: ['Dinner', 'Romantic', 'Reservation required', 'Full Experience'],
    taste: 'delicious', spread: 'full', aesthetic: 'super_fine', service: 'professional',
  },
  'Porchester': {
    hours: 'Sun–Fri 12:00–23:00 | Sat 11:00–23:00',
    website: null,
    parking: true,
    happy_hour: true,
    need_reservation: 'weekends',
    price: 'fair',
    tags: ['Lunch', 'Happy Hour', 'Business'],
    taste: 'good', spread: 'balanced', aesthetic: 'plain', service: 'professional',
  },
  "Shulamit's House": {
    hours: 'Fri 09:00–16:00 | Sat 09:00–16:00',
    website: null,
    parking: false,
    happy_hour: false,
    need_reservation: 'weekends',
    price: 'great_value',
    tags: ['Brunch', 'Lunch', 'Outdoor', 'Saturday'],
    taste: 'delicious', spread: 'balanced', aesthetic: 'charming', service: 'friendly',
  },
  'Boka': {
    hours: 'Tue–Sat 19:30–01:00',
    website: 'boka-tlv.com',
    parking: false,
    happy_hour: false,
    need_reservation: 'required',
    price: 'worth_every_penny',
    tags: ['Dinner', 'Romantic', 'Reservation required', 'Wine'],
    taste: 'delicious', spread: 'full', aesthetic: 'super_fine', service: 'professional',
  },
  'Artisan': {
    hours: 'Sun–Fri 07:00–17:00 | Sat 07:00–13:00',
    website: null,
    parking: false,
    happy_hour: false,
    need_reservation: 'walk_in',
    price: 'great_value',
    tags: ['Bakery', 'Morning', 'Saturday', 'Vegan-friendly'],
    taste: 'delicious', spread: 'feast', aesthetic: 'charming', service: 'friendly',
  },
  'The Sea & Sun': {
    hours: 'Fri–Sat 09:00–16:00',
    website: null,
    parking: false,
    happy_hour: false,
    need_reservation: 'weekends',
    price: 'fair',
    tags: ['Brunch', 'View', 'Outdoor', 'Saturday'],
    taste: 'good', spread: 'balanced', aesthetic: 'super_fine', service: 'friendly',
  },
  'Norma': {
    hours: 'Mon–Sat 19:00–03:00',
    website: null,
    parking: false,
    happy_hour: true,
    need_reservation: 'walk_in',
    price: 'fair',
    tags: ['Drinks', 'Happy Hour', 'Music', 'Late night'],
    taste: 'good', spread: 'balanced', aesthetic: 'super_fine', service: 'friendly',
  },
  'Mix': {
    hours: 'Sun–Sat 07:30–21:00',
    website: null,
    parking: false,
    happy_hour: false,
    need_reservation: 'walk_in',
    price: 'fair',
    tags: ['Café', 'Work-Friendly', 'Morning'],
    taste: 'good', spread: 'limited', aesthetic: 'charming', service: 'friendly',
  },
}

export const RESERVATION_LABELS = {
  grab_go:  'No seating / Grab & Go',
  walk_in:  'Walk-in',
  weekends: 'Book on weekends',
  required: 'Reservation required',
}

export const PRICE_LABELS = {
  overpriced:        'Overpriced',
  fair:              'Reasonable',
  great_value:       'Great Value',
  worth_every_penny: 'Worth Every Penny',
}

export const SCORE_LABELS = {
  taste:     { label: 'Taste Level',   poor: 0, basic: 5, good: 10, delicious: 14 },
  spread:    { label: 'The Spread',    minimal: 1, limited: 2, balanced: 3, full: 3, feast: 3 },
  aesthetic: { label: 'Aesthetic Mood', off: 0, plain: 1, charming: 4, super_fine: 5 },
  service:   { label: 'Service Flow',  off: 0, basic: 1, friendly: 2, professional: 3 },
}

export const CATEGORY_OPTION_LABELS = {
  // taste
  poor: 'Poor / Disappointing', basic: 'Basic', good: 'Good & Tasty', delicious: 'Delicious!',
  // spread
  minimal: 'Minimal', limited: 'Limited Choice', balanced: 'Balanced Selection', full: 'Full Experience', feast: 'The Feast',
  // aesthetic
  off: 'Off', plain: 'Plain', charming: 'Charming', super_fine: 'Super Fine',
  // service
  friendly: 'Friendly & Smooth', professional: 'Professional',
}

// Merge place with its details
export function enrichPlace(place) {
  const details = PLACE_DETAILS[place.name] || {}
  return { ...place, ...details }
}
