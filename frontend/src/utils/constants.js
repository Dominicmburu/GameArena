export const APP_NAME = 'GameArena'
export const APP_VERSION = '1.0.0'

// export const REACT_APP_API_URL="https://gamearena-qmir.onrender.com/api"
export const REACT_APP_API_URL="http://localhost:5000/api"
export const REACT_APP_SOCKET_URL="http://localhost:5000"
// export const REACT_APP_WS_URL="http://localhost:5000"

// Color Palette
export const COLORS = {
  // Primary Colors
  NEON_BLUE: '#00F0FF',
  ELECTRIC_PURPLE: '#9B00FF',
  
  // Background Tones
  CHARCOAL_BLACK: '#0E0E10',
  GUNMETAL_GRAY: '#1F1F23',
  
  // Accent Colors
  CYBER_RED: '#FF003C',
  ENERGY_GREEN: '#00FF85',
  
  // Text Colors
  WHITE_SMOKE: '#F5F5F5',
  SILVER_GRAY: '#B0B0B0'
}

// Game Categories
export const GAME_CATEGORIES = [
  'Action',
  'Strategy',
  'Puzzle',
  'Racing',
  'Card Game',
  'Memory',
  'Simulation',
  'Sports'
]

// Difficulty Levels
export const DIFFICULTY_LEVELS = [
  { value: 'beginner', label: 'Beginner', color: COLORS.ENERGY_GREEN },
  { value: 'intermediate', label: 'Intermediate', color: COLORS.NEON_BLUE },
  { value: 'advanced', label: 'Advanced', color: COLORS.ELECTRIC_PURPLE },
  { value: 'expert', label: 'Expert', color: COLORS.CYBER_RED }
]

// Competition Status
export const COMPETITION_STATUS = {
  UPCOMING: 'upcoming',
  ONGOING: 'ongoing',
  COMPLETED: 'completed',
  CANCELLED: 'cancelled'
}

// Payment Methods
export const PAYMENT_METHODS = [
  { id: 'credit-card', name: 'Credit/Debit Card', icon: 'credit-card' },
  { id: 'paypal', name: 'PayPal', icon: 'paypal' },
  { id: 'crypto', name: 'Cryptocurrency', icon: 'bitcoin' },
  { id: 'bank', name: 'Bank Transfer', icon: 'bank' }
]

// Achievement Rarities
export const ACHIEVEMENT_RARITIES = {
  COMMON: { name: 'Common', color: COLORS.SILVER_GRAY },
  RARE: { name: 'Rare', color: COLORS.NEON_BLUE },
  EPIC: { name: 'Epic', color: COLORS.ELECTRIC_PURPLE },
  LEGENDARY: { name: 'Legendary', color: COLORS.CYBER_RED }
}

// API Endpoints (for future backend integration)
export const API_ENDPOINTS = {
  BASE_URL: REACT_APP_API_URL,
  COMPETITIONS: '/competitions',
  USERS: '/users',
  GAMES: '/games',
  TRANSACTIONS: '/transactions',
  LEADERBOARDS: '/leaderboards'
}

// Local Storage Keys
export const STORAGE_KEYS = {
  USER_TOKEN: 'gameArena_userToken',
  USER_PROFILE: 'gameArena_userProfile',
  THEME_PREFERENCE: 'gameArena_theme',
  TRAINING_SCORES: 'gameArena_trainingScores'
}

// Default Values
export const DEFAULTS = {
  PAGINATION_LIMIT: 10,
  LEADERBOARD_LIMIT: 100,
  MAX_UPLOAD_SIZE: 5 * 1024 * 1024, // 5MB
  SEARCH_DEBOUNCE_DELAY: 300
}

// Validation Rules
export const VALIDATION = {
  USERNAME: {
    MIN_LENGTH: 3,
    MAX_LENGTH: 20,
    PATTERN: /^[a-zA-Z0-9_]+$/
  },
  PASSWORD: {
    MIN_LENGTH: 8,
    MAX_LENGTH: 128,
    REQUIRE_UPPERCASE: true,
    REQUIRE_LOWERCASE: true,
    REQUIRE_NUMBERS: true,
    REQUIRE_SYMBOLS: true
  },
  DEPOSIT: {
    MIN_AMOUNT: 1,
    MAX_AMOUNT: 10000
  }
}

// Animation Durations (in milliseconds)
export const ANIMATIONS = {
  FAST: 200,
  NORMAL: 300,
  SLOW: 500,
  EXTRA_SLOW: 1000
}

// Breakpoints (matching Bootstrap)
export const BREAKPOINTS = {
  XS: 0,
  SM: 576,
  MD: 768,
  LG: 992,
  XL: 1200,
  XXL: 1400
}