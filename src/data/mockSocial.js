export const MOCK_FRIENDS = [
  { id: 'u1', name: 'נועה כהן',   avatar: 'https://i.pravatar.cc/150?img=47' },
  { id: 'u2', name: 'תמר לוי',   avatar: 'https://i.pravatar.cc/150?img=44' },
  { id: 'u3', name: 'יובל ברקת', avatar: 'https://i.pravatar.cc/150?img=11' },
  { id: 'u4', name: 'מיה רוזן',  avatar: 'https://i.pravatar.cc/150?img=48' },
]

export const MEAL_TYPE_LABELS = {
  cafe: 'קפה', bakery: 'מאפייה', deli: 'דלי', brunch: 'ברנץ׳',
  lunch: 'צהריים', happy_hour: 'האפי אור', dinner: 'ארוחת ערב', drinks: 'שתייה',
}

export const MOCK_FEED = [
  {
    id: 'f1', user: 'u2',
    place: { name: 'בוקה', address: 'רוטשילד 22, תל אביב' },
    photo: 'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=800&q=80',
    meal_type: 'dinner', score: 24,
    note: 'חוויה שלמה. כל מנה הייתה סיפור בפני עצמו. חובה להזמין מקום.',
    tags: ['רומנטי', 'הזמנה חובה'],
    ago: 'לפני שעתיים',
  },
  {
    id: 'f2', user: 'u1',
    place: { name: 'ארטיסן', address: 'שינקין 12, תל אביב' },
    photo: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?w=800&q=80',
    meal_type: 'bakery', score: 22,
    note: 'הקרואסון הכי טוב שאכלתי בחיים. מגיעה כל שבת בבוקר.',
    tags: ['מאפייה', 'בוקר'],
    ago: 'אתמול',
  },
  {
    id: 'f3', user: 'u3',
    place: { name: 'הים והשמש', address: 'טיילת תל אביב' },
    photo: 'https://images.unsplash.com/photo-1533089860892-a7c6f0a88666?w=800&q=80',
    meal_type: 'brunch', score: 19,
    note: 'ברנץ׳ עם נוף לים. קצת יקר אבל שווה כל שקל בשביל האווירה.',
    tags: ['נוף', 'חוץ', 'שבת'],
    ago: 'לפני 3 ימים',
  },
  {
    id: 'f4', user: 'u4',
    place: { name: 'נורמה', address: 'יהודה הלוי 67, תל אביב' },
    photo: 'https://images.unsplash.com/photo-1551024709-8f23befc6f87?w=800&q=80',
    meal_type: 'drinks', score: 21,
    note: 'קוקטיילים מדהימים, מוזיקה טובה ותאורה מושלמת. מתאים לצאת בקבוצה.',
    tags: ['שתייה', 'מוזיקה', 'לילה'],
    ago: 'לפני 4 ימים',
  },
  {
    id: 'f5', user: 'u1',
    place: { name: 'מיקס', address: 'נחלת בנימין 8, תל אביב' },
    photo: 'https://images.unsplash.com/photo-1554118811-1e0d58224f24?w=800&q=80',
    meal_type: 'cafe', score: 18,
    note: 'קפה נהדר, קצת רועש אבל אוהבת את האנרגיה. מומלץ לבוקר.',
    tags: ['קפה', 'עבודה'],
    ago: 'לפני שבוע',
  },
]

export const MOCK_SWIPE_CARDS = [
  {
    id: 'sw1',
    place: { name: 'הדסה', address: 'אבן גבירול 30, תל אביב' },
    photo: 'https://images.unsplash.com/photo-1600891964092-4316c288032e?w=800&q=80',
    meal_type: 'dinner', score: 23,
    tags: ['רומנטי', 'הזמנה חובה', 'ויין'],
    recommended_by: 'u2',
  },
  {
    id: 'sw2',
    place: { name: 'פרח הלוז', address: 'בזל 14, תל אביב' },
    photo: 'https://images.unsplash.com/photo-1550966871-3ed3cdb5ed0c?w=800&q=80',
    meal_type: 'brunch', score: 20,
    tags: ['ברנץ׳', 'חוץ', 'כניסה חופשית'],
    recommended_by: 'u1',
  },
  {
    id: 'sw3',
    place: { name: 'טרטין', address: 'מונטיפיורי 5, תל אביב' },
    photo: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?w=800&q=80',
    meal_type: 'bakery', score: 25,
    tags: ['מאפייה', 'בוקר', 'שווה כל שקל'],
    recommended_by: 'u3',
  },
  {
    id: 'sw4',
    place: { name: 'ג׳קוב וסיבון', address: 'ליאונרדו דה וינצ׳י 1, תל אביב' },
    photo: 'https://images.unsplash.com/photo-1575023782549-62ca0d244b39?w=800&q=80',
    meal_type: 'happy_hour', score: 22,
    tags: ['האפי אור', 'בר', 'מוזיקה'],
    recommended_by: 'u4',
  },
  {
    id: 'sw5',
    place: { name: 'מסה', address: 'מנחם בגין 64, תל אביב' },
    photo: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=800&q=80',
    meal_type: 'lunch', score: 21,
    tags: ['צהריים', 'עסקי', 'מקצועי'],
    recommended_by: 'u1',
  },
]

export const MOCK_CONVERSATIONS = [
  {
    id: 'c1', with: 'u2',
    messages: [
      { id: 'm1', from: 'u2', text: 'הייתי אמש בבוקה, פשוט מדהים', time: '21:14' },
      { id: 'm2', from: 'me', text: 'שמעתי! כבר מזמן רציתי ללכת', time: '21:16' },
      { id: 'm3', from: 'u2', type: 'place', place: { name: 'בוקה', score: 24, meal_type: 'dinner' }, time: '21:17' },
      { id: 'm4', from: 'me', text: 'וואו 24/25 😍 מוסיפה לרשימה!', time: '21:19' },
    ],
    last_message: 'וואו 24/25 😍 מוסיפה לרשימה!',
    last_time: '21:19',
    unread: 0,
  },
  {
    id: 'c2', with: 'u1',
    messages: [
      { id: 'm5', from: 'u1', text: 'יש לך המלצה לברנץ׳ בשבת?', time: '09:30' },
      { id: 'm6', from: 'me', type: 'place', place: { name: 'הים והשמש', score: 19, meal_type: 'brunch' }, time: '09:32' },
      { id: 'm7', from: 'u1', text: 'מושלם, תודה! ניפגש שם?', time: '09:35' },
    ],
    last_message: 'מושלם, תודה! ניפגש שם?',
    last_time: '09:35',
    unread: 1,
  },
  {
    id: 'c3', with: 'u3',
    messages: [
      { id: 'm8', from: 'u3', text: 'גילית מקום חדש ממש טוב', time: 'אתמול' },
      { id: 'm9', from: 'u3', type: 'place', place: { name: 'טרטין', score: 25, meal_type: 'bakery' }, time: 'אתמול' },
    ],
    last_message: 'גילית מקום חדש ממש טוב',
    last_time: 'אתמול',
    unread: 2,
  },
  {
    id: 'c4', with: 'u4',
    messages: [
      { id: 'm10', from: 'me', text: 'מה שלומך?', time: 'יום ב׳' },
      { id: 'm11', from: 'u4', text: 'מצוין! שמת לב לנורמה?', time: 'יום ב׳' },
    ],
    last_message: 'מצוין! שמת לב לנורמה?',
    last_time: 'יום ב׳',
    unread: 0,
  },
]
