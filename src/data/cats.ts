export interface CatCompanion {
  id: string;
  name: string;
  avatar: string;
  mood: string;
  phrases: string[];
}

export const CAT_COMPANIONS: CatCompanion[] = [
  {
    id: 'mochi',
    name: 'Mochi',
    avatar: '🐾 ฅ^•ﻌ•^ฅ',
    mood: 'Content & Purring',
    phrases: [
      "I'm keeping watch over your quiet sanctuary today.",
      "Take a soft breath. You don't have to hurry here.",
      "A warm cup of tea and a blank page are waiting for you.",
      "You are safe here, sweetheart. Write what you feel."
    ]
  },
  {
    id: 'luna',
    name: 'Luna',
    avatar: '🌙 ( =Φ ᆺ Φ= )',
    mood: 'Mysterious & Gentle',
    phrases: [
      "Even the darkest night holds silent stars for you.",
      "Don't worry about being perfect. Just be real.",
      "I saved a quiet corner of the room just for your thoughts.",
      "The moon watches with gentle patience. So do I."
    ]
  },
  {
    id: 'oliver',
    name: 'Oliver',
    avatar: '🌿 (=^-ω-^=)',
    mood: 'Peaceful Thinker',
    phrases: [
      "Reading Kafka by candlelight feels like dreaming awake.",
      "You've survived all of your hardest days so far, champ.",
      "Resting is also doing something important.",
      "Your ideas have quiet dignity. Treasure them."
    ]
  },
  {
    id: 'milo',
    name: 'Milo',
    avatar: '✨ (=^･ω･^=)',
    mood: 'Playful Spark',
    phrases: [
      "Did you write today? Even two words count as a victory!",
      "I believe in you more than words can say, star.",
      "Look at how much you've preserved in your vault already!",
      "High paws! You are doing amazingly well today."
    ]
  },
  {
    id: 'cleo',
    name: 'Cleo',
    avatar: '👑 ( =`ω´= )',
    mood: 'Regal Protector',
    phrases: [
      "No intruder, no cloud trackers, no prying eyes. Pure privacy.",
      "This castle of your thoughts is sacred ground.",
      "Hold your head up high. You are the architect here.",
      "Everything here belongs only to you."
    ]
  },
  {
    id: 'daisy',
    name: 'Daisy',
    avatar: '🌸 ( ˶ˆ꒳ˆ˵ )',
    mood: 'Tender Sunshine',
    phrases: [
      "May today bring you small, unexpected moments of joy.",
      "You are so loved, sweetheart. Never forget it.",
      "Sending you the warmest purrs from across the screen.",
      "Be kind to yourself today, okay?"
    ]
  },
  {
    id: 'jasper',
    name: 'Jasper',
    avatar: '🍂 ( • ̀ω•́ )',
    mood: 'Observant Guide',
    phrases: [
      "One page at a time. The road reveals itself as you walk.",
      "Reflect on what made you pause today.",
      "Honesty with oneself is the greatest form of courage.",
      "Let's capture this fleeting moment before it slips away."
    ]
  },
  {
    id: 'smokey',
    name: 'Smokey',
    avatar: '☁️ (=ↀωↀ=)',
    mood: 'Serene Cloud',
    phrases: [
      "Slow down. The world will wait for you.",
      "Thoughts like clouds drift by; your center remains calm.",
      "Even a rainy afternoon is a gift of quiet time.",
      "Wrap yourself in gentleness today."
    ]
  },
  {
    id: 'coco',
    name: 'Coco',
    avatar: '☕ (=^･ｪ･^=)',
    mood: 'Warm Cinnamon',
    phrases: [
      "Here is a warm cinnamon hug for your spirit.",
      "Whatever you are carrying, set it down for a while.",
      "You make this digital refuge feel truly alive.",
      "Keep shining your quiet, steady light."
    ]
  }
];

export const GENDER_NICKNAMES = {
  'She/Her': ['sweetheart', 'darling', 'queen', 'my dear', 'star', 'gentle soul'],
  'He/Him': ['champ', 'captain', 'brother', 'star', 'warrior', 'traveler'],
  'They/Them': ['friend', 'star', 'gentle traveler', 'radiant soul', 'beloved one']
};

