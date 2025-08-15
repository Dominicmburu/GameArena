// Admin panel mock data for development and testing

// Admin Dashboard Statistics
export const adminDashboardStats = {
  overview: {
    totalUsers: 45238,
    activeUsers: 12847,
    totalCompetitions: 1523,
    activeCompetitions: 89,
    totalRevenue: 2847392.50,
    monthlyRevenue: 384729.30,
    pendingPayouts: 67342.80,
    systemHealth: 98.7,
    lastUpdated: new Date().toISOString()
  },
  recentActivity: {
    newUsers: 142,
    newCompetitions: 23,
    completedCompetitions: 17,
    supportTickets: 8,
    securityAlerts: 2
  },
  serverMetrics: {
    cpuUsage: 67.4,
    memoryUsage: 74.2,
    diskUsage: 45.8,
    networkTraffic: 892.3,
    uptime: 99.97,
    responseTime: 120
  }
}

// User Management Data
export const adminUsers = [
  {
    id: 'user_001',
    username: 'ProGamer_2024',
    email: 'progamer@example.com',
    fullName: 'Alex Chen',
    status: 'active',
    role: 'user',
    country: 'United States',
    joinDate: '2024-01-15T10:30:00Z',
    lastLogin: '2024-08-15T14:22:00Z',
    totalGames: 2847,
    winRate: 87.5,
    totalEarnings: 12450.75,
    currentBalance: 1250.75,
    verified: true,
    suspended: false,
    warningCount: 0,
    avatar: '🎮'
  },
  {
    id: 'user_002',
    username: 'CyberNinja_X',
    email: 'cyberninja@example.com',
    fullName: 'Yuki Tanaka',
    status: 'active',
    role: 'premium',
    country: 'Japan',
    joinDate: '2023-11-20T08:15:00Z',
    lastLogin: '2024-08-15T16:45:00Z',
    totalGames: 5234,
    winRate: 94.2,
    totalEarnings: 45780.30,
    currentBalance: 8920.50,
    verified: true,
    suspended: false,
    warningCount: 0,
    avatar: '🥇'
  },
  {
    id: 'user_003',
    username: 'SpamBot_123',
    email: 'suspicious@spam.com',
    fullName: 'Suspicious User',
    status: 'flagged',
    role: 'user',
    country: 'Unknown',
    joinDate: '2024-08-14T23:45:00Z',
    lastLogin: '2024-08-15T02:30:00Z',
    totalGames: 0,
    winRate: 0,
    totalEarnings: 0,
    currentBalance: 0,
    verified: false,
    suspended: true,
    warningCount: 3,
    avatar: '⚠️',
    suspensionReason: 'Suspicious activity detected',
    flaggedBy: 'auto_moderator'
  },
  {
    id: 'user_004',
    username: 'QuantumGamer',
    email: 'quantum@example.com',
    fullName: 'Sarah Kim',
    status: 'active',
    role: 'moderator',
    country: 'South Korea',
    joinDate: '2023-08-10T12:00:00Z',
    lastLogin: '2024-08-15T11:30:00Z',
    totalGames: 3456,
    winRate: 89.3,
    totalEarnings: 28934.60,
    currentBalance: 4567.20,
    verified: true,
    suspended: false,
    warningCount: 0,
    avatar: '🥈'
  },
  {
    id: 'user_005',
    username: 'NewPlayer_001',
    email: 'newplayer@example.com',
    fullName: 'John Smith',
    status: 'pending',
    role: 'user',
    country: 'Canada',
    joinDate: '2024-08-15T09:15:00Z',
    lastLogin: '2024-08-15T09:15:00Z',
    totalGames: 0,
    winRate: 0,
    totalEarnings: 0,
    currentBalance: 50.00,
    verified: false,
    suspended: false,
    warningCount: 0,
    avatar: '👤',
    verificationStatus: 'email_pending'
  }
]

// Competition Management Data
export const adminCompetitions = [
  {
    id: 'comp_001',
    title: 'Cyber Clash Championship',
    game: 'Battle Royale',
    organizer: 'GameArena Official',
    organizerId: 'admin_001',
    status: 'ongoing',
    participants: 2847,
    maxParticipants: 5000,
    prizePool: 50000,
    entryFee: 25,
    startTime: '2024-08-20T18:00:00Z',
    endTime: '2024-08-22T20:00:00Z',
    createdAt: '2024-08-15T10:00:00Z',
    approved: true,
    approvedBy: 'admin_001',
    approvedAt: '2024-08-15T11:00:00Z',
    featured: true,
    visibility: 'public',
    reports: 0,
    revenue: 71175, // (2847 * 25)
    payoutStatus: 'pending'
  },
  {
    id: 'comp_002',
    title: 'Underground Hacker Tournament',
    game: 'Puzzle',
    organizer: 'SuspiciousUser123',
    organizerId: 'user_789',
    status: 'pending_approval',
    participants: 0,
    maxParticipants: 100,
    prizePool: 10000,
    entryFee: 50,
    startTime: '2024-08-25T20:00:00Z',
    endTime: '2024-08-26T02:00:00Z',
    createdAt: '2024-08-14T22:30:00Z',
    approved: false,
    approvedBy: null,
    approvedAt: null,
    featured: false,
    visibility: 'public',
    reports: 3,
    revenue: 0,
    payoutStatus: 'not_applicable',
    flaggedReason: 'Inappropriate content and suspicious organizer'
  },
  {
    id: 'comp_003',
    title: 'Speed Run Masters',
    game: 'Racing',
    organizer: 'ProGamer_2024',
    organizerId: 'user_001',
    status: 'completed',
    participants: 1500,
    maxParticipants: 1500,
    prizePool: 15000,
    entryFee: 10,
    startTime: '2024-08-10T16:00:00Z',
    endTime: '2024-08-10T22:00:00Z',
    createdAt: '2024-08-08T14:20:00Z',
    approved: true,
    approvedBy: 'admin_002',
    approvedAt: '2024-08-08T15:00:00Z',
    featured: false,
    visibility: 'public',
    reports: 0,
    revenue: 15000,
    payoutStatus: 'completed',
    completedAt: '2024-08-10T22:15:00Z'
  }
]

// Financial Management Data
export const adminFinancials = {
  revenue: {
    total: 2847392.50,
    thisMonth: 384729.30,
    lastMonth: 356892.15,
    growth: 7.8,
    breakdown: {
      entryFees: 1984567.80,
      premiumSubscriptions: 456789.20,
      advertisements: 234567.90,
      merchandise: 89234.60,
      other: 82233.00
    }
  },
  expenses: {
    total: 1567893.25,
    thisMonth: 198456.75,
    lastMonth: 187234.60,
    breakdown: {
      serverCosts: 345678.90,
      staffSalaries: 789012.35,
      marketing: 234567.80,
      prizes: 156789.20,
      other: 41845.00
    }
  },
  transactions: [
    {
      id: 'txn_admin_001',
      type: 'revenue',
      category: 'entry_fee',
      amount: 25.00,
      userId: 'user_001',
      competitionId: 'comp_001',
      status: 'completed',
      timestamp: '2024-08-15T14:30:00Z',
      description: 'Entry fee for Cyber Clash Championship'
    },
    {
      id: 'txn_admin_002',
      type: 'payout',
      category: 'prize',
      amount: 5000.00,
      userId: 'user_002',
      competitionId: 'comp_003',
      status: 'completed',
      timestamp: '2024-08-10T22:30:00Z',
      description: 'First place prize - Speed Run Masters'
    },
    {
      id: 'txn_admin_003',
      type: 'expense',
      category: 'server',
      amount: 2850.00,
      userId: null,
      competitionId: null,
      status: 'completed',
      timestamp: '2024-08-15T00:00:00Z',
      description: 'Monthly server hosting costs'
    }
  ],
  pendingPayouts: [
    {
      id: 'payout_001',
      userId: 'user_001',
      username: 'ProGamer_2024',
      amount: 1250.75,
      competitionId: 'comp_001',
      competitionTitle: 'Cyber Clash Championship',
      requestedAt: '2024-08-15T10:00:00Z',
      status: 'pending',
      method: 'paypal'
    },
    {
      id: 'payout_002',
      userId: 'user_004',
      username: 'QuantumGamer',
      amount: 750.50,
      competitionId: 'comp_001',
      competitionTitle: 'Cyber Clash Championship',
      requestedAt: '2024-08-14T16:20:00Z',
      status: 'processing',
      method: 'bank_transfer'
    }
  ]
}

// Support Tickets Data
export const adminSupportTickets = [
  {
    id: 'ticket_001',
    userId: 'user_001',
    username: 'ProGamer_2024',
    email: 'progamer@example.com',
    subject: 'Payment not received',
    category: 'financial',
    priority: 'high',
    status: 'open',
    assignedTo: 'admin_002',
    createdAt: '2024-08-15T09:30:00Z',
    lastUpdated: '2024-08-15T11:45:00Z',
    description: 'I won a competition 3 days ago but haven\'t received my prize money yet.',
    responses: [
      {
        id: 'response_001',
        author: 'ProGamer_2024',
        timestamp: '2024-08-15T09:30:00Z',
        message: 'I won a competition 3 days ago but haven\'t received my prize money yet.',
        isAdmin: false
      },
      {
        id: 'response_002',
        author: 'admin_002',
        timestamp: '2024-08-15T11:45:00Z',
        message: 'Thank you for contacting us. I\'m looking into your payment status now.',
        isAdmin: true
      }
    ]
  },
  {
    id: 'ticket_002',
    userId: 'user_005',
    username: 'NewPlayer_001',
    email: 'newplayer@example.com',
    subject: 'Account verification issues',
    category: 'account',
    priority: 'medium',
    status: 'resolved',
    assignedTo: 'admin_003',
    createdAt: '2024-08-14T14:20:00Z',
    lastUpdated: '2024-08-15T08:15:00Z',
    resolvedAt: '2024-08-15T08:15:00Z',
    description: 'Can\'t verify my email address, not receiving verification emails.',
    responses: [
      {
        id: 'response_003',
        author: 'NewPlayer_001',
        timestamp: '2024-08-14T14:20:00Z',
        message: 'Can\'t verify my email address, not receiving verification emails.',
        isAdmin: false
      },
      {
        id: 'response_004',
        author: 'admin_003',
        timestamp: '2024-08-15T08:15:00Z',
        message: 'I\'ve resent the verification email. Please check your spam folder.',
        isAdmin: true
      }
    ]
  }
]

// Security Logs Data
export const adminSecurityLogs = [
  {
    id: 'log_001',
    type: 'failed_login',
    severity: 'medium',
    userId: 'user_003',
    username: 'SpamBot_123',
    ipAddress: '192.168.1.100',
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
    timestamp: '2024-08-15T15:30:00Z',
    details: 'Multiple failed login attempts detected',
    action: 'account_locked',
    resolved: true
  },
  {
    id: 'log_002',
    type: 'suspicious_activity',
    severity: 'high',
    userId: 'user_unknown',
    username: null,
    ipAddress: '45.123.45.67',
    userAgent: 'Bot/1.0',
    timestamp: '2024-08-15T12:15:00Z',
    details: 'Automated registration attempts detected',
    action: 'ip_blocked',
    resolved: true
  },
  {
    id: 'log_003',
    type: 'payment_fraud',
    severity: 'critical',
    userId: 'user_789',
    username: 'FraudUser',
    ipAddress: '78.234.56.89',
    userAgent: 'Mozilla/5.0 (Linux; Android 10; SM-G975F)',
    timestamp: '2024-08-15T08:45:00Z',
    details: 'Chargeback request for multiple transactions',
    action: 'account_suspended',
    resolved: false
  }
]

// Content Moderation Data
export const adminModerationQueue = [
  {
    id: 'mod_001',
    type: 'user_report',
    reportedContent: 'Competition Description',
    contentId: 'comp_002',
    reportedBy: 'user_001',
    reportedUser: 'user_789',
    reason: 'inappropriate_content',
    description: 'Competition description contains offensive language',
    status: 'pending',
    priority: 'medium',
    createdAt: '2024-08-15T13:20:00Z',
    content: 'This is a super cool hacker competition for elite players only...',
    assignedTo: null
  },
  {
    id: 'mod_002',
    type: 'auto_flagged',
    reportedContent: 'User Profile Bio',
    contentId: 'user_profile_456',
    reportedBy: 'auto_moderator',
    reportedUser: 'user_456',
    reason: 'spam_detected',
    description: 'Bio contains suspicious links and promotional content',
    status: 'reviewed',
    priority: 'low',
    createdAt: '2024-08-14T20:30:00Z',
    content: 'Check out my amazing gaming channel at [suspicious-link]...',
    assignedTo: 'admin_002',
    action: 'content_removed'
  }
]

// System Settings Data
export const adminSystemSettings = {
  platform: {
    maintenanceMode: false,
    allowNewRegistrations: true,
    allowCompetitionCreation: true,
    maxCompetitionsPerUser: 5,
    minEntryFee: 1.00,
    maxEntryFee: 1000.00,
    platformFeePercentage: 10,
    maxPlayersPerCompetition: 10000
  },
  security: {
    maxLoginAttempts: 5,
    sessionTimeout: 3600,
    requireEmailVerification: true,
    require2FA: false,
    passwordMinLength: 8,
    enableCaptcha: true
  },
  moderation: {
    autoModerationEnabled: true,
    profanityFilterEnabled: true,
    autoSuspendThreshold: 3,
    requireApprovalForNewCompetitions: false,
    maxReportsBeforeReview: 3
  },
  notifications: {
    emailNotificationsEnabled: true,
    pushNotificationsEnabled: true,
    smsNotificationsEnabled: false,
    maintenanceNotifications: true
  },
  features: {
    spectatorModeEnabled: true,
    streamingEnabled: true,
    chatEnabled: true,
    leaderboardsEnabled: true,
    achievementsEnabled: true,
    referralSystemEnabled: true
  }
}

// Analytics Data
export const adminAnalytics = {
  userMetrics: {
    totalUsers: 45238,
    newUsersToday: 142,
    newUsersThisWeek: 892,
    newUsersThisMonth: 3456,
    activeUsers: 12847,
    retentionRate: 78.5,
    averageSessionTime: 45.2,
    userGrowthRate: 12.3
  },
  competitionMetrics: {
    totalCompetitions: 1523,
    activeCompetitions: 89,
    completedToday: 17,
    completedThisWeek: 98,
    completedThisMonth: 387,
    averageParticipants: 156,
    completionRate: 94.7,
    popularGames: [
      { game: 'Battle Royale', count: 456, percentage: 30.0 },
      { game: 'Puzzle', count: 289, percentage: 19.0 },
      { game: 'Racing', count: 234, percentage: 15.4 },
      { game: 'Strategy', count: 198, percentage: 13.0 },
      { game: 'Card Game', count: 156, percentage: 10.2 },
      { game: 'Other', count: 190, percentage: 12.4 }
    ]
  },
  financialMetrics: {
    totalRevenue: 2847392.50,
    revenueToday: 12456.78,
    revenueThisWeek: 67890.45,
    revenueThisMonth: 384729.30,
    averageTransactionValue: 45.67,
    conversionRate: 23.4,
    revenueGrowthRate: 15.7
  },
  performanceMetrics: {
    averageResponseTime: 120,
    uptime: 99.97,
    errorRate: 0.03,
    pageLoadTime: 1.8,
    apiResponseTime: 85,
    serverLoad: 67.4
  }
}

// Admin Users (Staff)
export const adminStaff = [
  {
    id: 'admin_001',
    username: 'admin_john',
    email: 'john@gamearena.com',
    fullName: 'John Administrator',
    role: 'super_admin',
    permissions: ['all'],
    lastLogin: '2024-08-15T16:00:00Z',
    status: 'active',
    department: 'Operations',
    joinDate: '2023-01-15T10:00:00Z'
  },
  {
    id: 'admin_002',
    username: 'support_sarah',
    email: 'sarah@gamearena.com',
    fullName: 'Sarah Support',
    role: 'support_admin',
    permissions: ['tickets', 'users', 'competitions'],
    lastLogin: '2024-08-15T14:30:00Z',
    status: 'active',
    department: 'Customer Support',
    joinDate: '2023-03-20T09:00:00Z'
  },
  {
    id: 'admin_003',
    username: 'mod_mike',
    email: 'mike@gamearena.com',
    fullName: 'Mike Moderator',
    role: 'content_moderator',
    permissions: ['moderation', 'users'],
    lastLogin: '2024-08-15T12:15:00Z',
    status: 'active',
    department: 'Content Moderation',
    joinDate: '2023-06-10T11:00:00Z'
  }
]

// Export all admin data
export default {
  dashboardStats: adminDashboardStats,
  users: adminUsers,
  competitions: adminCompetitions,
  financials: adminFinancials,
  supportTickets: adminSupportTickets,
  securityLogs: adminSecurityLogs,
  moderationQueue: adminModerationQueue,
  systemSettings: adminSystemSettings,
  analytics: adminAnalytics,
  staff: adminStaff
}