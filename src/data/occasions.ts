export interface OccasionInfo {
  date: string; // DD/MM
  title: string;
  message: string;
  emoji: string;
}

export const OCCASIONS: OccasionInfo[] = [
  // Valentine Week
  { date: '07/02', title: 'Rose Day', message: 'A delicate rose for your poetic heart. May your thoughts bloom softly.', emoji: '🌹' },
  { date: '08/02', title: 'Propose Day', message: 'Make a promise to honor your dreams and protect your inner peace.', emoji: '💍' },
  { date: '09/02', title: 'Chocolate Day', message: 'May your thoughts be rich, comforting, and sweet today.', emoji: '🍫' },
  { date: '10/02', title: 'Teddy Day', message: 'Sending you a gentle, soft presence whenever the world feels overwhelming.', emoji: '🧸' },
  { date: '11/02', title: 'Promise Day', message: 'Promise yourself never to abandon your own sanctuary.', emoji: '🤞' },
  { date: '12/02', title: 'Hug Day', message: 'A warm, safe embrace for your spirit. You are held and valued.', emoji: '🫂' },
  { date: '13/02', title: 'Kiss Day', message: 'A tender touch of kindness for every battle you fought in silence.', emoji: '💋' },
  { date: '14/02', title: "Valentine's Day", message: 'Celebrating profound love - for art, words, quiet moments, and yourself.', emoji: '❤️' },

  // Key Milestones & Seasonal Days
  { date: '01/01', title: 'New Year Day', message: 'A fresh, unwritten chapter begins. Welcome to your quiet beginning.', emoji: '✨' },
  { date: '21/03', title: 'World Poetry Day', message: 'Words are sacred bridges. Write a verse that touches eternity.', emoji: '📜' },
  { date: '20/03', title: 'Spring Equinox', message: 'Light and shadow in perfect equilibrium. A season of rebirth begins.', emoji: '🌱' },
  { date: '23/04', title: 'World Book Day', message: 'A book is an axe for the frozen sea within us. Treasure literature.', emoji: '📚' },
  { date: '21/06', title: 'Summer Solstice', message: 'The longest sunlit day. May warmth fill your sanctuary.', emoji: '☀️' },
  { date: '23/09', title: 'Autumn Equinox', message: 'Crisp golden leaves and quiet reflections by the window.', emoji: '🍂' },
  { date: '10/10', title: 'Mental Health Day', message: 'Your mind is precious. Resting, feeling, and pausing is sacred work.', emoji: '🧠' },
  { date: '21/12', title: 'Winter Solstice', message: 'The longest night whispers: inward light shines the brightest.', emoji: '❄️' },
  { date: '31/12', title: "New Year's Eve", message: 'Gratitude for every breath, lesson, memory, and whisper of courage.', emoji: '🥂' },
];

export function checkSpecialOccasion(birthday?: string): OccasionInfo | null {
  const now = new Date();
  const day = String(now.getDate()).padStart(2, '0');
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const todayKey = `${day}/${month}`;

  // Check Birthday
  if (birthday) {
    const parts = birthday.split('-');
    if (parts.length === 3) {
      const bDay = parts[2].padStart(2, '0');
      const bMonth = parts[1].padStart(2, '0');
      if (`${bDay}/${bMonth}` === todayKey) {
        return {
          date: todayKey,
          title: 'Happy Birthday!',
          message: 'The stars aligned on this day to give the world your light. Celebrate your sacred journey!',
          emoji: '🎂'
        };
      }
    }
  }

  // Check standard occasions
  const occasion = OCCASIONS.find(o => o.date === todayKey);
  return occasion || null;
}

