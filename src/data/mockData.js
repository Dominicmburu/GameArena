// Mock data for development and testing purposes

// User Profile Data
export const mockUser = {
  id: 'user_12345',
  username: 'ProGamer_2024',
  email: 'progamer@example.com',
  firstName: 'Alex',
  lastName: 'Chen',
  avatar: '🎮',
  country: 'United States',
  timezone: 'UTC-5',
  bio: 'Competitive gamer with a passion for strategy games and esports. Always looking to improve and climb the ranks!',
  joinDate: '2024-01-15',
  lastActive: '2024-08-15T10:30:00Z',
  isVerified: true,
  isPremium: false
}

// User Statistics
export const mockUserStats = {
  totalGames: 2847,
  gamesWon: 2491,
  winRate: 87.5,
  totalPrize: 12450,
  globalRank: 42,
  totalHours: 156,
  achievements: 23,
  winStreak: 15,
  longestWinStreak: 28,
  favoriteGame: 'Battle Royale',
  averageRank: 35,
  bestRank: 3,
  totalDeposits: 5420.30,
  totalWithdrawals: 3890.50,
  currentBalance: 1250.75
}

// Competitions Data
export const mockCompetitions = [
  {
    id: 'comp_001',
    title: 'Cyber Clash Championship',
    game: 'Battle Royale',
    gameIcon: '🎯',
    prizePool: 50000,
    players: 2847,
    maxPlayers: 5000,
    startTime: '2024-08-20T18:00:00Z',
    endTime: '2024-08-22T20:00:00Z',
    status: 'ongoing',
    difficulty: 'Expert',
    entryFee: 25,
    featured: true,
    organizer: 'GameArena Official',
    description: 'The ultimate battle royale championship with the biggest prize pool of the season.',
    rules: ['No cheating or exploits', 'Must maintain 90% accuracy', 'Fair play required'],
    category: 'Action'
  },
  {
    id: 'comp_002',
    title: 'Neon Speed Run',
    game: 'Racing',
    gameIcon: '🏎️',
    prizePool: 15000,
    players: 1256,
    maxPlayers: 2000,
    startTime: '2024-08-21T16:00:00Z',
    endTime: '2024-08-21T22:00:00Z',
    status: 'upcoming',
    difficulty: 'Intermediate',
    entryFee: 10,
    featured: false,
    organizer: 'Speed Masters Guild',
    description: 'Fast-paced racing tournament with neon-themed tracks.',
    rules: ['No ramming other players', 'Must complete all checkpoints', 'Time penalties apply'],
    category: 'Racing'
  },
  {
    id: 'comp_003',
    title: 'Brain Hack Tournament',
    game: 'Puzzle',
    gameIcon: '🧩',
    prizePool: 8000,
    players: 892,
    maxPlayers: 1500,
    startTime: '2024-08-19T14:00:00Z',
    endTime: '2024-08-25T20:00:00Z',
    status: 'ongoing',
    difficulty: 'Advanced',
    entryFee: 5,
    featured: false,
    organizer: 'Puzzle Masters',
    description: 'Challenge your mind with complex puzzles and brain teasers.',
    rules: ['No external tools allowed', 'Time limits apply', 'Original solutions only'],
    category: 'Puzzle'
  }
]

// Games Available for Training
export const mockTrainingGames = [
  {
    id: 'game_001',
    name: 'Aim Trainer',
    description: 'Improve your accuracy and reaction time',
    category: 'Accuracy',
    icon: '🎯',
    difficulty: 'Adjustable',
    sessions: 45,
    bestScore: 2450,
    avgScore: 1850,
    improvement: '+12%',
    lastPlayed: '2 hours ago',
    color: '#00F0FF',
    totalTimePlayed: 420, // minutes
    skillsImproved: ['Accuracy', 'Reaction Time', 'Hand-Eye Coordination']
  },
  {
    id: 'game_002',
    name: 'Speed Clicker',
    description: 'Enhance your clicking speed and precision',
    category: 'Speed',
    icon: '⚡',
    difficulty: 'Progressive',
    sessions: 32,
    bestScore: 180,
    avgScore: 145,
    improvement: '+8%',
    lastPlayed: '1 day ago',
    color: '#9B00FF',
    totalTimePlayed: 285,
    skillsImproved: ['Click Speed', 'Precision', 'Endurance']
  },
  {
    id: 'game_003',
    name: 'Memory Palace',
    description: 'Train your memory with pattern recognition',
    category: 'Memory',
    icon: '🧠',
    difficulty: 'Advanced',
    sessions: 28,
    bestScore: 3200,
    avgScore: 2650,
    improvement: '+15%',
    lastPlayed: '3 hours ago',
    color: '#00FF85',
    totalTimePlayed: 395,
    skillsImproved: ['Memory', 'Pattern Recognition', 'Focus']
  }
]

// Achievements Data
export const mockAchievements = [
  {
    id: 'ach_001',
    title: 'First Victory',
    description: 'Win your first competition',
    icon: '🏆',
    rarity: 'Common',
    unlocked: true,
    unlockedDate: '2024-07-15T14:30:00Z',
    progress: 100,
    category: 'Competition'
  },
  {
    id: 'ach_002',
    title: 'Top 10 Player',
    description: 'Reach top 10 in any competition',
    icon: '🥇',
    rarity: 'Rare',
    unlocked: true,
    unlockedDate: '2024-07-20T19:45:00Z',
    progress: 100,
    category: 'Ranking'
  },
  {
    id: 'ach_003',
    title: 'Streak Master',
    description: 'Win 10 games in a row',
    icon: '🔥',
    rarity: 'Epic',
    unlocked: true,
    unlockedDate: '2024-08-01T12:15:00Z',
    progress: 100,
    category: 'Performance'
  },
  {
    id: 'ach_004',
    title: 'Lightning Fast',
    description: 'Achieve 100+ clicks per second',
    icon: '⚡',
    rarity: 'Legendary',
    unlocked: false,
    progress: 87,
    category: 'Training'
  }
]

// Leaderboard Data
export const mockLeaderboard = [
  { rank: 1, player: 'CyberNinja_X', score: 45250, avatar: '🥇', country: 'JP', winRate: 94.5 },
  { rank: 2, player: 'QuantumGamer', score: 42180, avatar: '🥈', country: 'KR', winRate: 92.1 },
  { rank: 3, player: 'NeonStrike', score: 38920, avatar: '🥉', country: 'US', winRate: 89.7 },
  { rank: 4, player: 'PixelWarrior', score: 35640, avatar: '👾', country: 'DE', winRate: 87.3 },
  { rank: 5, player: 'DataHunter', score: 33210, avatar: '🎯', country: 'CN', winRate: 85.9 },
  { rank: 6, player: 'You', score: 28950, avatar: '🎮', country: 'US', winRate: 87.5, isUser: true },
  { rank: 7, player: 'CodeBreaker', score: 27180, avatar: '💻', country: 'CA', winRate: 83.4 },
  { rank: 8, player: 'EliteGamer', score: 25960, avatar: '⚡', country: 'GB', winRate: 81.2 }
]

// Transaction History
export const mockTransactions = [
  {
    id: 'txn_001',
    type: 'deposit',
    amount: 250,
    method: 'Credit Card',
    status: 'completed',
    date: '2024-08-15T10:30:00Z',
    description: 'Account deposit via Visa ending in 4532',
    fee: 0,
    reference: 'DEP_20240815_001'
  },
  {
    id: 'txn_002',
    type: 'withdrawal',
    amount: 150,
    method: 'PayPal',
    status: 'completed',
    date: '2024-08-14T16:45:00Z',
    description: 'Withdrawal to PayPal account',
    fee: 2.5,
    reference: 'WTH_20240814_001'
  },
  {
    id: 'txn_003',
    type: 'deposit',
    amount: 100,
    method: 'Crypto',
    status: 'pending',
    date: '2024-08-14T14:20:00Z',
    description: 'Bitcoin deposit - awaiting confirmations',
    fee: 0,
    reference: 'DEP_20240814_002'
  },
  {
    id: 'txn_004',
    type: 'prize',
    amount: 425,
    method: 'Competition Prize',
    status: 'completed',
    date: '2024-08-12T20:15:00Z',
    description: 'Prize from Brain Hack Tournament - 7th place',
    fee: 0,
    reference: 'PRZ_20240812_001'
  }
]

// Game History
export const mockGameHistory = [
  {
    id: 'game_hist_001',
    competition: 'Cyber Clash Championship',
    game: 'Battle Royale',
    rank: 23,
    totalPlayers: 2847,
    prize: 150,
    date: '2024-08-15T18:30:00Z',
    status: 'completed',
    duration: 45, // minutes
    score: 15420,
    accuracy: 89.5,
    kills: 12
  },
  {
    id: 'game_hist_002',
    competition: 'Brain Hack Tournament',
    game: 'Puzzle',
    rank: 7,
    totalPlayers: 892,
    prize: 425,
    date: '2024-08-12T20:15:00Z',
    status: 'completed',
    duration: 120,
    score: 28950,
    accuracy: 95.2,
    puzzlesSolved: 48
  },
  {
    id: 'game_hist_003',
    competition: 'Speed Run Masters',
    game: 'Racing',
    rank: 156,
    totalPlayers: 1500,
    prize: 25,
    date: '2024-08-10T19:00:00Z',
    status: 'completed',
    duration: 25,
    score: 8450,
    accuracy: 92.1,
    bestLapTime: '1:34.582'
  }
]

// Bonus Offers
export const mockBonusOffers = [
  {
    id: 'bonus_001',
    title: 'Welcome Bonus',
    description: '100% match up to $500 on first deposit',
    minDeposit: 50,
    maxBonus: 500,
    percentage: 100,
    code: 'WELCOME100',
    active: true,
    expiryDate: '2024-12-31T23:59:59Z',
    terms: ['Valid for new users only', 'Must be used within 30 days', 'Wagering requirements apply']
  },
  {
    id: 'bonus_002',
    title: 'Weekend Warrior',
    description: '50% bonus on weekend deposits',
    minDeposit: 100,
    maxBonus: 250,
    percentage: 50,
    code: 'WEEKEND50',
    active: false,
    expiryDate: '2024-08-18T23:59:59Z',
    terms: ['Valid Friday-Sunday only', 'Maximum one use per weekend']
  },
  {
    id: 'bonus_003',
    title: 'High Roller',
    description: '25% bonus on deposits over $1000',
    minDeposit: 1000,
    maxBonus: 1000,
    percentage: 25,
    code: 'HIGHROLL25',
    active: true,
    expiryDate: '2024-09-30T23:59:59Z',
    terms: ['VIP status required', 'Limited time offer']
  }
]

// Available Games for Competition Creation
export const mockAvailableGames = [
  {
    id: 'ag_001',
    name: 'Battle Royale',
    description: 'Last player standing wins in this intense survival game',
    category: 'Action',
    difficulty: 'Expert',
    icon: '🎯',
    players: '1-100',
    avgDuration: '15-30 min',
    popular: true,
    thumbnail: '/images/battle-royale.jpg',
    features: ['Real-time combat', 'Shrinking map', 'Weapon variety', 'Solo/Team modes']
  },
  {
    id: 'ag_002',
    name: 'Speed Racing',
    description: 'Fast-paced racing with power-ups and obstacles',
    category: 'Racing',
    difficulty: 'Intermediate',
    icon: '🏎️',
    players: '1-20',
    avgDuration: '5-10 min',
    popular: true,
    thumbnail: '/images/speed-racing.jpg',
    features: ['Multiple tracks', 'Power-ups', 'Time trials', 'Championships']
  },
  {
    id: 'ag_003',
    name: 'Brain Puzzle',
    description: 'Mind-bending puzzles that test your logic and creativity',
    category: 'Puzzle',
    difficulty: 'Advanced',
    icon: '🧩',
    players: '1-50',
    avgDuration: '10-20 min',
    popular: false,
    thumbnail: '/images/brain-puzzle.jpg',
    features: ['Logic puzzles', 'Pattern matching', 'Time challenges', 'Difficulty scaling']
  }
]

// Daily Challenges
export const mockDailyChallenges = [
  {
    id: 'challenge_001',
    title: 'Precision Master',
    description: 'Score 2500+ in Aim Trainer with 95% accuracy',
    game: 'Aim Trainer',
    icon: '🎯',
    reward: {
      xp: 500,
      currency: 50,
      badge: 'Sharpshooter'
    },
    progress: 0,
    target: 1,
    completed: false,
    expiryDate: '2024-08-16T23:59:59Z',
    difficulty: 'Hard'
  },
  {
    id: 'challenge_002',
    title: 'Speed Demon',
    description: 'Complete 5 racing games under 3 minutes each',
    game: 'Speed Racing',
    icon: '🏎️',
    reward: {
      xp: 300,
      currency: 30,
      badge: 'Speed Demon'
    },
    progress: 2,
    target: 5,
    completed: false,
    expiryDate: '2024-08-16T23:59:59Z',
    difficulty: 'Medium'
  }
]

// Notifications
export const mockNotifications = [
  {
    id: 'notif_001',
    type: 'competition',
    title: 'Competition Starting Soon',
    message: 'Cyber Clash Championship starts in 30 minutes!',
    timestamp: '2024-08-15T17:30:00Z',
    read: false,
    actionUrl: '/play',
    icon: '🏆'
  },
  {
    id: 'notif_002',
    type: 'achievement',
    title: 'Achievement Unlocked',
    message: 'You earned the "Streak Master" achievement!',
    timestamp: '2024-08-15T12:15:00Z',
    read: true,
    actionUrl: '/profile',
    icon: '🏅'
  },
  {
    id: 'notif_003',
    type: 'deposit',
    title: 'Deposit Confirmed',
    message: 'Your $250 deposit has been processed successfully.',
    timestamp: '2024-08-15T10:30:00Z',
    read: true,
    actionUrl: '/deposit',
    icon: '💰'
  }
]

// Export all mock data
export default {
  user: mockUser,
  userStats: mockUserStats,
  competitions: mockCompetitions,
  trainingGames: mockTrainingGames,
  achievements: mockAchievements,
  leaderboard: mockLeaderboard,
  transactions: mockTransactions,
  gameHistory: mockGameHistory,
  bonusOffers: mockBonusOffers,
  availableGames: mockAvailableGames,
  dailyChallenges: mockDailyChallenges,
  notifications: mockNotifications
}