import { prisma } from '../src/prisma.js'

const games = [
  {
    name:        'Dino Run',
    description: 'Race through ancient landscapes avoiding obstacles, collecting power-ups, and outlasting every rival in this heart-pounding adventure.',
    gameType:    'ARCADE',
    level:       'BEGINNER',
    minPlayers:  2,
    maxPlayers:  8,
    minEntryFee: 10,
    isPopular:   true,
    imageUrl:    'https://placehold.co/240x240/C53030/F5F5F5/png?text=Dino+Run',
  },
  {
    name:        'Pac-Man Arena',
    description: 'Navigate the maze, eat every dot, and outsmart the ghosts before time runs out. The classic arcade legend, now in competitive mode.',
    gameType:    'ARCADE',
    level:       'INTERMEDIATE',
    minPlayers:  2,
    maxPlayers:  4,
    minEntryFee: 20,
    isPopular:   true,
    imageUrl:    'https://placehold.co/240x240/DD6B20/F5F5F5/png?text=Pac-Man',
  },
  {
    name:        'Space Invaders',
    description: 'Defend the galaxy against relentless alien waves. Aim fast, shoot faster, and climb the leaderboard in this ultimate space showdown.',
    gameType:    'ACTION',
    level:       'INTERMEDIATE',
    minPlayers:  2,
    maxPlayers:  6,
    minEntryFee: 25,
    isPopular:   true,
    imageUrl:    'https://placehold.co/240x240/3182CE/F5F5F5/png?text=Space',
  },
  {
    name:        'Tetris Tournament',
    description: 'Stack falling blocks, clear lines, and chase the highest score. Pure skill, classic gameplay, real KES prizes.',
    gameType:    'PUZZLE',
    level:       'BEGINNER',
    minPlayers:  2,
    maxPlayers:  10,
    minEntryFee: 10,
    isPopular:   true,
    imageUrl:    'https://placehold.co/240x240/805AD5/F5F5F5/png?text=Tetris',
  },
  {
    name:        'Memory Match',
    description: 'Flip cards, memorize positions, and match every pair before your opponents. A mental sprint where focus pays in cash.',
    gameType:    'PUZZLE',
    level:       'BEGINNER',
    minPlayers:  2,
    maxPlayers:  6,
    minEntryFee: 5,
    isPopular:   false,
    imageUrl:    'https://placehold.co/240x240/38A169/F5F5F5/png?text=Memory',
  },
  {
    name:        'Snake Royale',
    description: 'Slither, grow, and survive. The longer you live, the bigger the prize. Avoid your own tail and crush the competition.',
    gameType:    'ARCADE',
    level:       'BEGINNER',
    minPlayers:  2,
    maxPlayers:  8,
    minEntryFee: 10,
    isPopular:   true,
    imageUrl:    'https://placehold.co/240x240/38A169/F5F5F5/png?text=Snake',
  },
  {
    name:        'Chess Blitz',
    description: 'Five-minute games, all-or-nothing tactics. Outmaneuver opponents in the most prestigious board game of all time.',
    gameType:    'STRATEGY',
    level:       'ADVANCED',
    minPlayers:  2,
    maxPlayers:  2,
    minEntryFee: 50,
    isPopular:   false,
    imageUrl:    'https://placehold.co/240x240/1F1F23/F5F5F5/png?text=Chess',
  },
  {
    name:        'Card Clash',
    description: 'Outplay your rivals in a classic card duel. Read the table, time your moves, and take the pot.',
    gameType:    'CARD',
    level:       'INTERMEDIATE',
    minPlayers:  2,
    maxPlayers:  4,
    minEntryFee: 30,
    isPopular:   false,
    imageUrl:    'https://placehold.co/240x240/E53E3E/F5F5F5/png?text=Cards',
  },
  {
    name:        'Trivia Showdown',
    description: 'Test your knowledge across pop culture, sports, history, and more. Fastest correct answer takes the prize.',
    gameType:    'TRIVIA',
    level:       'INTERMEDIATE',
    minPlayers:  2,
    maxPlayers:  10,
    minEntryFee: 15,
    isPopular:   false,
    imageUrl:    'https://placehold.co/240x240/F6AD55/0E0E10/png?text=Trivia',
  },
  {
    name:        'Drift Racing',
    description: 'Corner hard, slide harder. Top lap time wins the pool. For drivers who treat the racing line as a suggestion.',
    gameType:    'RACING',
    level:       'ADVANCED',
    minPlayers:  2,
    maxPlayers:  6,
    minEntryFee: 40,
    isPopular:   false,
    imageUrl:    'https://placehold.co/240x240/D69E2E/0E0E10/png?text=Drift',
  },
]

async function main() {
  console.log('🌱 Seeding games...')

  for (const game of games) {
    const result = await prisma.game.upsert({
      where:  { name: game.name },
      update: game,
      create: game,
    })
    console.log(`  ✓ ${result.name} (${result.gameType} · ${result.level})`)
  }

  const total = await prisma.game.count()
  console.log(`\n✅ Done. ${games.length} games seeded · ${total} games in database.`)
}

main()
  .catch((err) => {
    console.error('❌ Seed failed:', err)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
