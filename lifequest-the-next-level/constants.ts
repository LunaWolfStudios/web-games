import { DialogueNode, GameLevel, Insight, GameType, Mentor } from './types';

// --- Assets & Config ---

export const MENTORS: Mentor[] = [
  { id: 'leo', name: 'Coach Leo', avatar: 'https://images.unsplash.com/photo-1599566150163-29194dcaad36?auto=format&fit=crop&w=200&q=80', bio: 'Energetic and encouraging!' },
  { id: 'maya', name: 'Guide Maya', avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=200&q=80', bio: 'Calm, wise, and patient.' },
  { id: 'kenji', name: 'Sensei Kenji', avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&q=80', bio: 'Focuses on discipline and clarity.' },
  { id: 'sofia', name: 'Mentor Sofia', avatar: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&w=200&q=80', bio: 'Warm, friendly, and practical.' },
  { id: 'sam', name: 'Captain Sam', avatar: 'https://images.unsplash.com/photo-1504593811423-6dd665756598?auto=format&fit=crop&w=200&q=80', bio: 'Adventurous and direct.' },
];

// --- Knowledge Base (Insights) ---
export const INSIGHTS: Record<string, Insight> = {
  'needs_vs_wants': {
    id: 'needs_vs_wants',
    title: 'Financial Literacy',
    description: 'Understanding terms like Budget, Rent, and Savings is the first step to wealth.',
    icon: 'Landmark',
    category: 'MONEY'
  },
  'hygiene_habit': {
    id: 'hygiene_habit',
    title: 'Fresh & Clean',
    description: 'Brushing teeth and showering daily keeps you healthy and feeling good.',
    icon: 'Sparkles',
    category: 'HEALTH'
  },
  'healthy_eating': {
    id: 'healthy_eating',
    title: 'Fuel Your Body',
    description: 'Your body is an engine. Vegetables and fruits run it better than candy.',
    icon: 'Apple',
    category: 'HEALTH'
  },
  'alarm_clock': {
    id: 'alarm_clock',
    title: 'Time Master',
    description: 'Setting an alarm implies respect for yourself and others.',
    icon: 'Clock',
    category: 'WORK'
  },
  'chore_routine': {
    id: 'chore_routine',
    title: 'Sort & Sustain',
    description: 'Recycling helps the planet. Trash goes in the bin. Keep your space organized.',
    icon: 'Recycle',
    category: 'HOME'
  },
  'social_boundaries': {
    id: 'social_boundaries',
    title: 'Saying No',
    description: 'It is okay to say "No" if you are uncomfortable or busy.',
    icon: 'Hand',
    category: 'SOCIAL'
  },
  'job_prep': {
    id: 'job_prep',
    title: 'Professionalism',
    description: 'Work requires specific behaviors. Being on time and polite is key.',
    icon: 'Briefcase',
    category: 'WORK'
  },
  'emotion_check': {
    id: 'emotion_check',
    title: 'Coping Skills',
    description: 'When angry or sad, use healthy coping skills like breathing or talking to a friend.',
    icon: 'Heart',
    category: 'SELF'
  },
};

// --- Narrative Script ---
export const DIALOGUE_TREE: Record<string, DialogueNode> = {
  // --- Chapter 1: Intro ---
  'start': {
    id: 'start',
    text: "Welcome to LifeQuest! This is your safe space to practice being an independent adult. Ready to level up?",
    speaker: 'MENTOR',
    background: 'HOME',
    options: [
      { text: "I'm ready!", nextId: 'c1_intro', sentiment: 'positive' },
      { text: "I'm nervous...", nextId: 'c1_reassurance', sentiment: 'neutral' },
    ]
  },
  'c1_reassurance': {
    id: 'c1_reassurance',
    text: "Nerves are normal! We'll take it one step at a time. No wrong answers here, just learning.",
    speaker: 'MENTOR',
    background: 'HOME',
    options: [{ text: "Okay, let's go.", nextId: 'c1_intro', sentiment: 'positive' }]
  },

  // --- Chapter 2: Money (Matching Game) ---
  'c1_intro': {
    id: 'c1_intro',
    text: "Let's start with CASH. Adulting involves a lot of new words. Do you know what a 'Budget' is?",
    speaker: 'MENTOR',
    background: 'BANK',
    options: [
      { text: "A plan for money.", nextId: 'c1_confirm', sentiment: 'positive' },
      { text: "I have no idea.", nextId: 'c1_teach', sentiment: 'curious' }
    ]
  },
  'c1_confirm': {
    id: 'c1_confirm',
    text: "Exactly! It's a map for your money so you don't get lost.",
    speaker: 'MENTOR',
    background: 'BANK',
    options: [{ text: "Let's play!", nextId: 'c1_game_start', sentiment: 'positive' }]
  },
  'c1_teach': {
    id: 'c1_teach',
    text: "That's totally okay! A budget is simply a plan that helps you track your money so you don't run out.",
    speaker: 'MENTOR',
    background: 'BANK',
    options: [{ text: "Oh, that makes sense.", nextId: 'c1_game_start', sentiment: 'positive' }]
  },
  'c1_game_start': {
    id: 'c1_game_start',
    text: "Let's learn some other terms. Drag the Money Word to its Meaning!",
    speaker: 'MENTOR',
    background: 'BANK',
    options: [{ text: "Start Matching", nextId: 'c1_post_game', triggerGame: GameType.MATCHING_MONEY, sentiment: 'positive' }]
  },
  'c1_post_game': {
    id: 'c1_post_game',
    text: "Solid work! Knowing the lingo is half the battle at the bank.",
    speaker: 'MENTOR',
    background: 'BANK',
    unlockInsightId: 'needs_vs_wants',
    options: [{ text: "What about hygiene?", nextId: 'c2_intro', sentiment: 'curious' }]
  },

  // --- Chapter 3: Hygiene ---
  'c2_intro': {
    id: 'c2_intro',
    text: "Being an adult means taking care of your body. When we look and smell good, we feel good!",
    speaker: 'MENTOR',
    background: 'BEDROOM',
    options: [{ text: "I brush my teeth!", nextId: 'c2_habit', sentiment: 'positive' }]
  },
  'c2_habit': {
    id: 'c2_habit',
    text: "Exactly. Showering, deodorant, and brushing teeth are daily quests. They give you a +10 Charisma buff in real life.",
    speaker: 'MENTOR',
    background: 'BEDROOM',
    unlockInsightId: 'hygiene_habit',
    options: [{ text: "+10 Charisma? Nice.", nextId: 'c3_intro', sentiment: 'positive' }]
  },

  // --- Chapter 4: Food (Drop Sort - 2 buckets) ---
  'c3_intro': {
    id: 'c3_intro',
    text: "Let's head to the kitchen. You can't run on just energy drinks. We need real fuel.",
    speaker: 'MENTOR',
    background: 'KITCHEN',
    options: [
      { text: "I love pizza though.", nextId: 'c3_balance', sentiment: 'neutral' },
      { text: "I eat veggies.", nextId: 'c3_game_start', sentiment: 'positive' }
    ]
  },
  'c3_balance': {
    id: 'c3_balance',
    text: "Pizza is okay sometimes! But 'Sometimes Foods' shouldn't be 'Everyday Foods'.",
    speaker: 'MENTOR',
    background: 'KITCHEN',
    options: [{ text: "Let's sort food.", nextId: 'c3_game_start', sentiment: 'positive' }]
  },
  'c3_game_start': {
    id: 'c3_game_start',
    text: "Catch the falling food! Drag 'Fuel' to Green and 'Junk' to Orange.",
    speaker: 'MENTOR',
    background: 'KITCHEN',
    options: [{ text: "I'm hungry!", nextId: 'c3_post_game', triggerGame: GameType.DROP_SORT_FOOD, sentiment: 'positive' }]
  },
  'c3_post_game': {
    id: 'c3_post_game',
    text: "Deliciously done. Your body thanks you.",
    speaker: 'MENTOR',
    background: 'KITCHEN',
    unlockInsightId: 'healthy_eating',
    options: [{ text: "Next topic!", nextId: 'c4_intro', sentiment: 'positive' }]
  },

  // --- Chapter 5: Home Care (Drop Sort - 3 Buckets) ---
  'c4_intro': {
    id: 'c4_intro',
    text: "Look at this mess! Part of having your own place is dealing with stuff. Do you Recycle?",
    speaker: 'MENTOR',
    background: 'HOME',
    options: [{ text: "Sometimes.", nextId: 'c4_fun', sentiment: 'neutral' }]
  },
  'c4_fun': {
    id: 'c4_fun',
    text: "Let's clean up. Drag items to Trash, Recycle Bin, or the Closet to Keep them.",
    speaker: 'MENTOR',
    background: 'HOME',
    options: [{ text: "Let's clean up.", nextId: 'c4_game_start', sentiment: 'positive' }]
  },
  'c4_game_start': {
    id: 'c4_game_start',
    text: "Sort the items: Keep, Trash, or Recycle!",
    speaker: 'MENTOR',
    background: 'HOME',
    options: [{ text: "Cleaning time.", nextId: 'c4_post_game', triggerGame: GameType.DROP_SORT_HOME, sentiment: 'positive' }]
  },
  'c4_post_game': {
    id: 'c4_post_game',
    text: "Sparkling clean! A clean room makes for a clear mind.",
    speaker: 'MENTOR',
    background: 'HOME',
    unlockInsightId: 'chore_routine',
    options: [{ text: "Moving on.", nextId: 'c5_intro', sentiment: 'positive' }]
  },

  // --- Chapter 6: Time (Drop Sort) ---
  'c5_intro': {
    id: 'c5_intro',
    text: "Time creates stress if we let it. Do you use an alarm clock?",
    speaker: 'MENTOR',
    background: 'BEDROOM',
    options: [
      { text: "I sleep in.", nextId: 'c5_advice', sentiment: 'neutral' },
      { text: "Yes, on my phone.", nextId: 'c5_praise', sentiment: 'positive' }
    ]
  },
  'c5_advice': {
    id: 'c5_advice',
    text: "Sleeping is great, but missing appointments causes trouble. Let's practice prioritizing tasks.",
    speaker: 'MENTOR',
    background: 'BEDROOM',
    unlockInsightId: 'alarm_clock',
    options: [{ text: "I'll try.", nextId: 'c6_game_start', sentiment: 'positive' }]
  },
  'c5_praise': {
    id: 'c5_praise',
    text: "Excellent. Punctuality is a superpower. Let's test your time management.",
    speaker: 'MENTOR',
    background: 'BEDROOM',
    unlockInsightId: 'alarm_clock',
    options: [{ text: "Bring it on!", nextId: 'c6_game_start', sentiment: 'positive' }]
  },
  'c6_game_start': {
    id: 'c6_game_start',
    text: "Tasks are falling! Sort them into: Do Now, Do Later, or Ignore.",
    speaker: 'MENTOR',
    background: 'BEDROOM',
    options: [{ text: "Start Timer!", nextId: 'c6_post_game', triggerGame: GameType.DROP_SORT_TIME, sentiment: 'positive' }]
  },
  'c6_post_game': {
    id: 'c6_post_game',
    text: "You mastered the clock! Now you have time for fun without the guilt.",
    speaker: 'MENTOR',
    background: 'BEDROOM',
    options: [{ text: "Let's go out.", nextId: 'c6_intro', sentiment: 'positive' }]
  },

  // --- Chapter 7: Social (Binary Sort) ---
  'c6_intro': {
    id: 'c6_intro',
    text: "We're at the park. Friends are amazing, but sometimes we need boundaries.",
    speaker: 'MENTOR',
    background: 'PARK',
    options: [{ text: "Boundaries?", nextId: 'c6_explain', sentiment: 'curious' }]
  },
  'c6_explain': {
    id: 'c6_explain',
    text: "It means saying 'No' to things that aren't safe or right for you.",
    speaker: 'MENTOR',
    background: 'PARK',
    options: [{ text: "Like what?", nextId: 'c7_game_start', sentiment: 'curious' }]
  },
  'c7_game_start': {
    id: 'c7_game_start',
    text: "Swipe YES if it's okay, or NO if you should set a boundary.",
    speaker: 'MENTOR',
    background: 'PARK',
    options: [{ text: "I'm ready.", nextId: 'c7_post_game', triggerGame: GameType.BINARY_SORT_SOCIAL, sentiment: 'positive' }]
  },
  'c7_post_game': {
    id: 'c7_post_game',
    text: "Strong boundaries keep you safe and happy. Good friends will respect them.",
    speaker: 'MENTOR',
    background: 'PARK',
    unlockInsightId: 'social_boundaries',
    options: [{ text: "To the office!", nextId: 'c7_intro', sentiment: 'positive' }]
  },

  // --- Chapter 8: Work (Binary Sort) ---
  'c7_intro': {
    id: 'c7_intro',
    text: "We're at the office. Work has unwritten rules about how to behave.",
    speaker: 'MENTOR',
    background: 'OFFICE',
    options: [{ text: "Like what?", nextId: 'c7_tip', sentiment: 'curious' }]
  },
  'c7_tip': {
    id: 'c7_tip',
    text: "Let's play a game. Swipe RIGHT for 'Professional' (Good) or LEFT for 'Unprofessional' (Bad).",
    speaker: 'MENTOR',
    background: 'OFFICE',
    options: [{ text: "I'm the boss!", nextId: 'c7_post_game_work', triggerGame: GameType.BINARY_SORT_WORK, sentiment: 'positive' }]
  },
  'c7_post_game_work': {
    id: 'c7_post_game_work',
    text: "You're hired! Dress clean, be early, and stay polite.",
    speaker: 'MENTOR',
    background: 'OFFICE',
    unlockInsightId: 'job_prep',
    options: [{ text: "I can do that.", nextId: 'c8_intro', sentiment: 'positive' }]
  },

  // --- Chapter 9: Emotions ---
  'c8_intro': {
    id: 'c8_intro',
    text: "Sometimes, things go wrong. We get angry or sad. That's okay.",
    speaker: 'MENTOR',
    background: 'CITY',
    options: [{ text: "What do I do?", nextId: 'c8_skill', sentiment: 'curious' }]
  },
  'c8_skill': {
    id: 'c8_skill',
    text: "You choose how to react. Let's sort Healthy Coping vs Unhealthy Coping skills.",
    speaker: 'MENTOR',
    background: 'CITY',
    options: [{ text: "Let's sort.", nextId: 'c8_post_game', triggerGame: GameType.BINARY_SORT_EMOTIONS, sentiment: 'positive' }]
  },
  'c8_post_game': {
    id: 'c8_post_game',
    text: "Great! Deep breaths and talking help. Yelling and throwing things do not.",
    speaker: 'MENTOR',
    background: 'CITY',
    unlockInsightId: 'emotion_check',
    options: [{ text: "I feel better.", nextId: 'c9_intro', sentiment: 'positive' }]
  },

  // --- Chapter 10: Conclusion ---
  'c9_intro': {
    id: 'c9_intro',
    text: "You've journeyed through Money, Food, Home, Time, Social, Work, and Mind. You are well on your way to becoming a Life Hero.",
    speaker: 'MENTOR',
    background: 'HOME',
    options: [{ text: "I feel stronger.", nextId: 'end_loop', sentiment: 'positive' }]
  },
  'end_loop': {
    id: 'end_loop',
    text: "You've completed LifeQuest! Click below to see your final score.",
    speaker: 'MENTOR',
    background: 'HOME',
    options: [{ text: "See Summary", nextId: 'SUMMARY_SCREEN', sentiment: 'positive' }] // Special ID caught in App.tsx
  }
};

// --- Mini-Games Levels ---

export const LEVELS: Record<string, GameLevel> = {
  [GameType.MATCHING_MONEY]: {
    type: 'MATCHING',
    title: "Money Match",
    insightRewardId: 'needs_vs_wants',
    nextDialogueId: 'c1_post_game',
    pairs: [
      { id: '1', text: 'Budget', icon: 'Map', matchText: 'A plan for your money', explanation: 'A Budget helps you track where every dollar goes so you don\'t run out.' },
      { id: '2', text: 'Rent', icon: 'Home', matchText: 'Money for housing', explanation: 'Rent is usually your biggest monthly expense and must be paid first.' },
      { id: '3', text: 'Savings', icon: 'PiggyBank', matchText: 'Money for later', explanation: 'Savings help you pay for emergencies or big goals in the future.' },
      { id: '4', text: 'Debt', icon: 'CreditCard', matchText: 'Money you owe', explanation: 'Debt is money borrowed that must be paid back, usually with interest.' },
    ]
  },
  [GameType.DROP_SORT_FOOD]: {
    type: 'DROP_SORT',
    title: "Fuel vs Junk",
    insightRewardId: 'healthy_eating',
    targetScore: 50,
    nextDialogueId: 'c3_post_game',
    buckets: [
      { id: 'healthy', label: 'FUEL', color: 'bg-green-600' },
      { id: 'junk', label: 'SOMETIMES', color: 'bg-orange-400' }
    ],
    items: [
      { id: '1', text: 'Apple', category: 'healthy', icon: '🍎', explanation: 'Apples provide vitamins and fiber.' },
      { id: '2', text: 'Soda', category: 'junk', icon: '🥤', explanation: 'Soda has lots of sugar and no nutrients.' },
      { id: '3', text: 'Broccoli', category: 'healthy', icon: '🥦', explanation: 'Green veggies are essential for energy.' },
      { id: '4', text: 'Chips', category: 'junk', icon: '🥔', explanation: 'Chips are tasty but high in salt and fat.' },
      { id: '5', text: 'Water', category: 'healthy', icon: '💧', explanation: 'Water is the best thing you can drink.' },
      { id: '6', text: 'Cake', category: 'junk', icon: '🍰', explanation: 'Cake is a treat, not a meal.' },
    ]
  },
  [GameType.DROP_SORT_HOME]: {
    type: 'DROP_SORT',
    title: "Keep vs Trash vs Recycle",
    insightRewardId: 'chore_routine',
    targetScore: 60,
    nextDialogueId: 'c4_post_game',
    buckets: [
      { id: 'keep', label: 'KEEP', color: 'bg-blue-500' },
      { id: 'trash', label: 'TRASH', color: 'bg-gray-600' },
      { id: 'recycle', label: 'RECYCLE', color: 'bg-green-500' }
    ],
    items: [
      { id: '1', text: 'Crumpled Paper', category: 'recycle', icon: '📄', explanation: 'Paper can be recycled into new paper products.' },
      { id: '2', text: 'Favorite Shirt', category: 'keep', icon: '👕', explanation: 'Put clothes away in drawers or closets.' },
      { id: '3', text: 'Banana Peel', category: 'trash', icon: '🍌', explanation: 'Food waste goes in the trash (or compost).' },
      { id: '4', text: 'Soda Can', category: 'recycle', icon: '🥫', explanation: 'Aluminum cans are highly recyclable.' },
      { id: '5', text: 'Dirty Tissue', category: 'trash', icon: '🤧', explanation: 'Tissues cannot be recycled due to germs.' },
      { id: '6', text: 'Textbook', category: 'keep', icon: '📚', explanation: 'Books should be kept on shelves.' },
    ]
  },
  [GameType.DROP_SORT_TIME]: {
    type: 'DROP_SORT',
    title: "Time Master",
    insightRewardId: 'alarm_clock',
    targetScore: 50,
    nextDialogueId: 'c6_post_game',
    buckets: [
      { id: 'now', label: 'DO NOW', color: 'bg-green-600' },
      { id: 'later', label: 'DO LATER', color: 'bg-yellow-500' },
      { id: 'ignore', label: 'IGNORE', color: 'bg-red-500' }
    ],
    items: [
      { id: '1', text: 'Brush Teeth', category: 'now', icon: 'Sparkles', explanation: 'Personal hygiene should be a priority.' },
      { id: '2', text: 'Watch TV', category: 'later', icon: 'Tv', explanation: 'Entertainment is good, but usually after work is done.' },
      { id: '3', text: 'Scroll Phone', category: 'ignore', icon: 'Smartphone', explanation: 'Doom scrolling wastes time. Try to limit it.' },
      { id: '4', text: 'Pay Rent', category: 'now', icon: 'Banknote', explanation: 'Bills must be paid on time to avoid fees.' },
      { id: '5', text: 'Video Games', category: 'later', icon: 'Gamepad', explanation: 'Games are a great reward after finishing tasks.' },
      { id: '6', text: 'Spam Call', category: 'ignore', icon: 'PhoneOff', explanation: 'Ignore unknown numbers or spam to save focus.' },
    ]
  },
  [GameType.BINARY_SORT_SOCIAL]: {
    type: 'BINARY_SORT',
    title: "Boundaries",
    insightRewardId: 'social_boundaries',
    nextDialogueId: 'c7_post_game',
    leftLabel: "NO",
    rightLabel: "YES",
    items: [
      { id: '1', text: 'Friend asks for password', icon: 'Lock', isTrue: false, explanation: 'Never share passwords, even with friends.' },
      { id: '2', text: 'Teacher asks for homework', icon: 'BookOpen', isTrue: true, explanation: 'It is expected to share work with teachers.' },
      { id: '3', text: 'Stranger asks to get in car', icon: 'Car', isTrue: false, explanation: 'Never get in a car with someone you do not know.' },
      { id: '4', text: 'Relative asks for a hug', icon: 'Hand', isTrue: false, explanation: 'You can say no to hugs if you are uncomfortable.' },
      { id: '5', text: 'Doctor asks about health', icon: 'Stethoscope', isTrue: true, explanation: 'Doctors need information to keep you healthy.' },
    ]
  },
  [GameType.BINARY_SORT_WORK]: {
    type: 'BINARY_SORT',
    title: "Pro or No?",
    insightRewardId: 'job_prep',
    nextDialogueId: 'c7_post_game_work',
    leftLabel: "UNPROFESSIONAL",
    rightLabel: "PROFESSIONAL",
    items: [
      { id: '1', text: 'Arriving 5 mins early', icon: 'Clock', isTrue: true, explanation: 'Being early shows you are reliable and ready.' },
      { id: '2', text: 'Wearing dirty pajamas', icon: 'Shirt', isTrue: false, explanation: 'Clean clothes show respect for your workplace.' },
      { id: '3', text: 'Yelling at a customer', icon: 'Megaphone', isTrue: false, explanation: 'Always stay calm, even if a customer is rude.' },
      { id: '4', text: 'Asking questions', icon: 'HelpCircle', isTrue: true, explanation: 'Asking questions shows you want to learn and do a good job.' },
      { id: '5', text: 'Checking phone constantly', icon: 'Smartphone', isTrue: false, explanation: 'Focus on your work, save the phone for breaks.' },
    ]
  },
  [GameType.BINARY_SORT_EMOTIONS]: {
    type: 'BINARY_SORT',
    title: "Coping Skills",
    insightRewardId: 'emotion_check',
    nextDialogueId: 'c8_post_game',
    leftLabel: "UNHEALTHY",
    rightLabel: "HEALTHY",
    items: [
      { id: '1', text: 'Taking 3 deep breaths', icon: 'Wind', isTrue: true, explanation: 'Deep breathing calms your nervous system.' },
      { id: '2', text: 'Screaming at a friend', icon: 'Megaphone', isTrue: false, explanation: 'Screaming hurts feelings and ruins relationships.' },
      { id: '3', text: 'Counting to 10', icon: 'Hash', isTrue: true, explanation: 'Pausing gives your brain time to think before acting.' },
      { id: '4', text: 'Breaking a toy', icon: 'Hammer', isTrue: false, explanation: 'Breaking things is aggressive and creates more mess.' },
      { id: '5', text: 'Talking to a mentor', icon: 'UserPlus', isTrue: true, explanation: 'Asking for help is a sign of strength.' },
    ]
  }
};
