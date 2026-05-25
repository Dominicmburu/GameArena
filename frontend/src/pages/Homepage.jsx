import { useState, useEffect, useRef } from 'react'
import { Container, Row, Col, Button, Form, InputGroup, Modal, Badge } from 'react-bootstrap'
import {
  Search, Trophy, Users, Clock, Zap, Star, Play, Info,
  ChevronLeft, ChevronRight, ArrowRight, UserPlus, Gamepad2,
} from 'lucide-react'
import { Link, useNavigate } from 'react-router-dom'
import { useGame } from '../contexts/GameContext'
import { useAuth } from '../contexts/AuthContext'
import { REACT_APP_API_URL } from '../utils/constants'

// ─── Hero slides ─────────────────────────────────────────────────────────────
const HERO_SLIDES = [
  {
    videoSrc:  '/videos/dino_scene.mp4',
    poster:    '/dino_scene.png',
    gameTypes: ['ADVENTURE', 'ARCADE'],
    line1:     'Dino Run',
    line2:     'Ultra',
    description: 'Race through ancient landscapes avoiding obstacles, collecting power-ups and outlasting every rival in this heart-pounding adventure.',
  },
  {
    videoSrc:  '/videos/pacman_scene.mp4',
    poster:    '/pacman_scene.png',
    gameTypes: ['ARCADE', 'PUZZLE'],
    line1:     'Pac-Man',
    line2:     'Arena',
    description: 'Navigate the maze, eat every dot and outsmart the ghosts before time runs out. The classic arcade legend — now in competitive mode.',
  },
  {
    videoSrc:  '/videos/space_scene.mp4',
    poster:    '/space_scene.png',
    gameTypes: ['ACTION', 'ARCADE'],
    line1:     'Space',
    line2:     'Invaders',
    description: 'Defend the galaxy against relentless alien waves. Aim fast, shoot faster and climb the leaderboard in this ultimate space showdown.',
  },
]

const GAME_TYPE_CONFIG = {
  ACTION:     { badge: '#E53E3E' },
  ADVENTURE:  { badge: '#DD6B20' },
  PUZZLE:     { badge: '#3182CE' },
  STRATEGY:   { badge: '#805AD5' },
  RACING:     { badge: '#D69E2E' },
  SPORTS:     { badge: '#38A169' },
  RPG:        { badge: '#9F7AEA' },
  SIMULATION: { badge: '#4299E1' },
  ARCADE:     { badge: '#F687B3' },
  TRIVIA:     { badge: '#F6AD55' },
  CARD:       { badge: '#4FD1C5' },
  BOARD:      { badge: '#76E4F7' },
}

const HOW_IT_WORKS = [
  {
    num: '01', Icon: UserPlus, color: '#C53030',
    title: 'Create Account',
    short: 'Sign up free · fund wallet via M-Pesa',
  },
  {
    num: '02', Icon: Gamepad2, color: '#3182CE',
    title: 'Join a Competition',
    short: 'Browse by game, skill level or prize',
  },
  {
    num: '03', Icon: Users, color: '#805AD5',
    title: 'Play with Friends',
    short: 'Create a private room · invite by code',
  },
  {
    num: '04', Icon: Trophy, color: '#38A169',
    title: 'Win Real KES',
    short: 'Top scorer wins · instant M-Pesa payout',
  },
]

// ─────────────────────────────────────────────────────────────────────────────

const Homepage = () => {
  const navigate = useNavigate()
  const { isAuthenticated } = useAuth()
  const {
    publicCompetitions,
    games,
    participatedCompetitions,
    loading,
    joinCompetitionByCode,
    fetchPublicCompetitions,
    fetchParticipatedCompetitions,
  } = useGame()

  const [searchTerm,           setSearchTerm]           = useState('')
  const [selectedFilter,       setSelectedFilter]       = useState('all')
  const [showCompetitionModal, setShowCompetitionModal] = useState(false)
  const [selectedCompetition,  setSelectedCompetition]  = useState(null)
  const [joiningCompetition,   setJoiningCompetition]   = useState(false)
  const [heroIndex,            setHeroIndex]            = useState(0)

  const videoRef = useRef(null)

  // ── Data fetching ─────────────────────────────────────────────────────────
  useEffect(() => {
    fetchPublicCompetitions()
    if (isAuthenticated) fetchParticipatedCompetitions()
  }, [isAuthenticated])

  useEffect(() => {
    if (!videoRef.current) return
    videoRef.current.load()
    videoRef.current.play().catch(() => {})
  }, [heroIndex])


  // ── Carousel ─────────────────────────────────────────────────────────────
  const total      = HERO_SLIDES.length
  const goTo       = (i) => setHeroIndex((i + total) % total)
  const prevHero   = () => goTo(heroIndex - 1)
  const nextHero   = () => goTo(heroIndex + 1)
  const handleVideoEnd = () => goTo(heroIndex + 1)
  const slide      = HERO_SLIDES[heroIndex]

  // ── Helpers ───────────────────────────────────────────────────────────────
  const formatKES = (cents) =>
    `KES ${Number(cents).toLocaleString('en-KE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`

  const hasJoinedCompetition = (id) =>
    participatedCompetitions.some(c => c.id === id)

  const getDifficultyColor = (level) => {
    switch (level?.toUpperCase()) {
      case 'BEGINNER':     return '#38A169'
      case 'INTERMEDIATE': return '#3182CE'
      case 'ADVANCED':     return '#805AD5'
      case 'EXPERT':       return '#C53030'
      default:             return '#B0B0B0'
    }
  }

  const getStatusColor = (status) => {
    switch (status?.toUpperCase()) {
      case 'ONGOING':   return '#38A169'
      case 'UPCOMING':  return '#3182CE'
      case 'COMPLETED': return '#B0B0B0'
      case 'CANCELED':  return '#C53030'
      default:          return '#B0B0B0'
    }
  }

  const formatTimeLeft = (endsAt, status) => {
    if (status === 'ONGOING' || status === 'UPCOMING') {
      const diff = new Date(endsAt) - new Date()
      if (diff < 0) return 'Expired'
      const h = Math.floor(diff / 3600000)
      const m = Math.floor((diff % 3600000) / 60000)
      const d = Math.floor(h / 24)
      if (d > 0) return `${d}d ${h % 24}h`
      if (h > 0) return `${h}h ${m}m`
      return `${m}m`
    }
    return status === 'COMPLETED' ? 'Ended' : 'Canceled'
  }

  const handleJoinCompetition = async (competition) => {
    if (!isAuthenticated) { navigate('/auth'); return }
    if (hasJoinedCompetition(competition.id)) { navigate('/play'); return }
    if (competition.currentPlayers >= competition.maxPlayers) { alert('This competition is full!'); return }

    setJoiningCompetition(true)
    try {
      await joinCompetitionByCode(competition.code)
      alert(`Successfully joined ${competition.title}!`)
      setShowCompetitionModal(false)
      await Promise.all([fetchPublicCompetitions(), fetchParticipatedCompetitions()])
      navigate('/play')
    } catch (err) {
      alert(err.message || 'Failed to join competition')
    } finally {
      setJoiningCompetition(false)
    }
  }

  // ── Derived data ──────────────────────────────────────────────────────────
  const stats = {
    activeCompetitions: publicCompetitions.filter(c => c.status === 'ONGOING' || c.status === 'UPCOMING').length,
    totalPrizePool:     publicCompetitions.reduce((s, c) => s + (c.totalPrizePool || 0), 0),
    gameCategories:     games.length || 0,
    totalPlayers:       publicCompetitions.reduce((s, c) => s + (c.currentPlayers || 0), 0),
  }

  const liveCompetitions = publicCompetitions.filter(c => c.status === 'ONGOING').slice(0, 3)

  const filteredCompetitions = publicCompetitions.filter(comp => {
    const matchesSearch =
      comp.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      comp.Game?.name?.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesFilter =
      selectedFilter === 'all' ||
      comp.status?.toUpperCase() === selectedFilter.toUpperCase()
    return matchesSearch && matchesFilter
  })

  const tickerItems = [
    `${stats.activeCompetitions} competitions live now`,
    `${formatKES(stats.totalPrizePool)} in active prize pools`,
    `${stats.gameCategories} games available to compete`,
    `${stats.totalPlayers} players competing today`,
    ...publicCompetitions.filter(c => c.status === 'ONGOING').slice(0, 5)
      .map(c => `${c.title} · ${formatKES(c.totalPrizePool)} prize pool`),
    `Real KES prizes · Instant M-Pesa withdrawals`,
    `New competitions added daily`,
  ]

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <div style={{ background: '#0E0E10', minHeight: '100vh' }}>

      {/* ══════════════════════════════════════════════
          1. HERO VIDEO CAROUSEL
      ══════════════════════════════════════════════ */}
      <div style={{ position: 'relative', width: '100%', height: '70vh', minHeight: '480px', overflow: 'hidden' }}>

        <video
          ref={videoRef}
          key={heroIndex}
          autoPlay muted playsInline
          onEnded={handleVideoEnd}
          poster={slide.poster}
          style={{
            position: 'absolute', inset: 0,
            width: '100%', height: '100%',
            objectFit: 'cover',
            filter: 'brightness(0.92)',
          }}
        >
          <source src={slide.videoSrc} type="video/mp4" />
        </video>

        <div style={{
          position: 'absolute', inset: 0,
          background: 'linear-gradient(to right, rgba(0,0,0,0.92) 0%, rgba(0,0,0,0.55) 50%, rgba(0,0,0,0.08) 100%)',
          zIndex: 1,
        }} />
        <div style={{
          position: 'absolute', bottom: 0, left: 0, right: 0,
          height: '160px',
          background: 'linear-gradient(to top, #0E0E10 0%, transparent 100%)',
          zIndex: 1,
        }} />

        {/* Slide content */}
        <div
          key={`content-${heroIndex}`}
          style={{
            position: 'absolute', bottom: '18%', left: '8%',
            maxWidth: '620px', zIndex: 3,
            animation: 'heroContentIn 0.55s ease',
          }}
        >
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: '16px' }}>
            {slide.gameTypes.map(gt => (
              <span key={gt} style={{
                background: GAME_TYPE_CONFIG[gt]?.badge || '#555',
                color: '#fff', fontSize: '0.68rem', fontWeight: 700,
                letterSpacing: '1.5px', padding: '3px 12px',
                borderRadius: '2px', textTransform: 'uppercase',
              }}>{gt}</span>
            ))}
          </div>
          <div style={{ marginBottom: '14px' }}>
            {[slide.line1, slide.line2].map((line, i) => (
              <div key={i} style={{
                color: '#fff', fontWeight: 900,
                fontSize: 'clamp(2.6rem, 6vw, 6rem)',
                lineHeight: 1.0,
                textShadow: '0 4px 24px rgba(0,0,0,0.9)',
                letterSpacing: '-0.5px',
              }}>{line}</div>
            ))}
          </div>
          <p style={{
            color: 'rgba(255,255,255,0.78)', fontSize: '0.93rem',
            lineHeight: 1.65, marginBottom: '28px', maxWidth: '480px',
          }}>{slide.description}</p>
          <div className="hero-cta-row">
            <button className="hero-btn-primary" onClick={() => navigate('/play')}>
              <Play size={17} style={{ flexShrink: 0 }} /> PLAY NOW
            </button>
            <button className="hero-btn-secondary" onClick={() => navigate('/game-rules')}>
              <Info size={17} style={{ flexShrink: 0 }} /> MORE INFO
            </button>
          </div>
        </div>

        {/* Diamond nav buttons */}
        <button className="diamond-nav diamond-nav-left" onClick={prevHero} aria-label="Previous">
          <span className="diamond-bg" />
          <ChevronLeft size={22} color="#fff" style={{ position: 'relative', zIndex: 1 }} />
        </button>
        <button className="diamond-nav diamond-nav-right" onClick={nextHero} aria-label="Next">
          <span className="diamond-bg" />
          <ChevronRight size={22} color="#fff" style={{ position: 'relative', zIndex: 1 }} />
        </button>

        {/* Slide indicators */}
        <div style={{
          position: 'absolute', bottom: '28px', left: '50%',
          transform: 'translateX(-50%)',
          display: 'flex', alignItems: 'center', gap: '6px', zIndex: 4,
        }}>
          {HERO_SLIDES.map((_, i) => (
            <button key={i} onClick={() => goTo(i)} style={{
              width: i === heroIndex ? '36px' : '10px', height: '4px',
              borderRadius: '2px',
              background: i === heroIndex ? '#fff' : 'rgba(255,255,255,0.3)',
              border: 'none', cursor: 'pointer', padding: 0,
              transition: 'width 0.35s ease, background 0.35s ease',
            }} aria-label={`Slide ${i + 1}`} />
          ))}
        </div>
      </div>

      {/* ══════════════════════════════════════════════
          2. LIVE ACTIVITY TICKER
      ══════════════════════════════════════════════ */}
      <div style={{
        background: 'rgba(197,48,48,0.06)',
        borderTop: '1px solid rgba(197,48,48,0.18)',
        borderBottom: '1px solid rgba(197,48,48,0.18)',
        overflow: 'hidden',
        padding: '10px 0',
        position: 'relative',
      }}>
        <div style={{
          position: 'absolute', left: 0, top: 0, bottom: 0, width: '80px',
          background: 'linear-gradient(to right, #0E0E10, transparent)',
          zIndex: 1, pointerEvents: 'none',
        }} />
        <div style={{
          position: 'absolute', right: 0, top: 0, bottom: 0, width: '80px',
          background: 'linear-gradient(to left, #0E0E10, transparent)',
          zIndex: 1, pointerEvents: 'none',
        }} />
        <div className="ticker-track">
          {[...tickerItems, ...tickerItems].map((item, i) => (
            <span key={i} className="ticker-item">
              <span className="ticker-dot-red" />
              {item}
            </span>
          ))}
        </div>
      </div>

      {/* ══════════════════════════════════════════════
          3. STATS BAR
      ══════════════════════════════════════════════ */}
      <div style={{
        background: '#0a0a0c',
        borderBottom: '1px solid rgba(255,255,255,0.04)',
        padding: '32px 0',
      }}>
        <Container>
          <Row className="g-0 text-center">
            {[
              { value: stats.activeCompetitions,        label: 'Active Competitions', color: '#3182CE', mono: true },
              { value: formatKES(stats.totalPrizePool),  label: 'Active Prize Pool',   color: '#38A169', mono: false },
              { value: stats.totalPlayers,               label: 'Players Competing',   color: '#C53030', mono: true },
              { value: stats.gameCategories,             label: 'Game Categories',      color: '#805AD5', mono: true },
            ].map((stat, i, arr) => (
              <Col xs={6} lg={3} key={i} className="mb-4 mb-lg-0">
                <div style={{
                  borderRight: i < arr.length - 1 ? '1px solid rgba(255,255,255,0.06)' : 'none',
                  padding: '0 16px',
                }}>
                  <div style={{
                    color: stat.color,
                    fontWeight: 800,
                    fontSize: stat.mono ? '2.2rem' : '1.2rem',
                    lineHeight: 1.1,
                    fontFamily: stat.mono ? "'Orbitron', monospace" : 'inherit',
                    marginBottom: '8px',
                  }}>
                    {stat.value}
                  </div>
                  <div style={{
                    color: 'rgba(255,255,255,0.35)',
                    fontSize: '0.68rem',
                    textTransform: 'uppercase',
                    letterSpacing: '1.5px',
                  }}>
                    {stat.label}
                  </div>
                </div>
              </Col>
            ))}
          </Row>
        </Container>
      </div>

      {/* ══════════════════════════════════════════════
          4. HOW IT WORKS  (compact strip)
      ══════════════════════════════════════════════ */}
      <div style={{
        background: '#0a0a0c',
        borderTop: '1px solid rgba(255,255,255,0.04)',
        borderBottom: '1px solid rgba(255,255,255,0.04)',
        padding: '20px 0',
      }}>
        <Container>
          <div className="hiw-strip-header">
            <span style={{
              color: '#C53030', fontSize: '0.65rem', fontWeight: 700,
              letterSpacing: '2.5px', textTransform: 'uppercase',
            }}>
              GET STARTED IN 4 STEPS
            </span>
            <span className="hiw-strip-sep" />
            <span className="hiw-strip-subtitle">
              How GameArena Works
            </span>
          </div>
          <Row className="g-0">
            {HOW_IT_WORKS.map((step, i) => (
              <Col xs={6} md={3} key={i}>
                <div className={`hiw-step hiw-step-${i}`}>
                  <div style={{
                    width: '34px', height: '34px', borderRadius: '8px', flexShrink: 0,
                    background: `${step.color}14`,
                    border: `1px solid ${step.color}35`,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                  }}>
                    <step.Icon size={16} color={step.color} />
                  </div>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '5px', marginBottom: '2px' }}>
                      <span style={{
                        fontFamily: "'Orbitron', monospace",
                        fontSize: '0.58rem', fontWeight: 900,
                        color: step.color, opacity: 0.55, letterSpacing: '0.5px',
                      }}>{step.num}</span>
                      <span style={{ color: '#F5F5F5', fontWeight: 700, fontSize: '0.82rem' }}>
                        {step.title}
                      </span>
                    </div>
                    <span style={{ color: 'rgba(255,255,255,0.3)', fontSize: '0.68rem', lineHeight: 1.4 }}>
                      {step.short}
                    </span>
                  </div>
                </div>
              </Col>
            ))}
          </Row>
        </Container>
      </div>

      {/* ══════════════════════════════════════════════
          5. CHOOSE HOW YOU PLAY
      ══════════════════════════════════════════════ */}
      <div style={{ background: '#111114', padding: '56px 0' }}>
        <Container>
          <div style={{ textAlign: 'center', marginBottom: '36px' }}>
            <div style={{
              color: '#C53030', fontSize: '0.68rem', fontWeight: 700,
              letterSpacing: '2.5px', textTransform: 'uppercase', marginBottom: '10px',
            }}>
              CHOOSE HOW YOU PLAY
            </div>
            <h2 style={{ color: '#fff', fontWeight: 800, fontSize: 'clamp(1.4rem, 2.5vw, 1.9rem)', margin: 0 }}>
              Jump In and Start Playing
            </h2>
          </div>
          <Row className="g-4">
            {/* Join a Competition */}
            <Col md={6}>
              <div className="hiw-action-card hiw-action-card--red">
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '18px' }}>
                  <div style={{
                    width: '52px', height: '52px', borderRadius: '12px', flexShrink: 0,
                    background: 'rgba(197,48,48,0.12)', border: '1px solid rgba(197,48,48,0.3)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                  }}>
                    <Trophy size={24} color="#C53030" />
                  </div>
                  <div style={{ flex: 1 }}>
                    <h4 style={{ color: '#fff', fontWeight: 800, fontSize: '1.1rem', marginBottom: '8px' }}>
                      Join a Competition
                    </h4>
                    <p style={{ color: '#6B6B6B', fontSize: '0.85rem', lineHeight: 1.7, marginBottom: '18px' }}>
                      Browse live tournaments across multiple games. Pay a small entry fee and compete against real players for real KES — paid instantly to M-Pesa.
                    </p>
                    <div style={{ display: 'flex', gap: '7px', flexWrap: 'wrap', marginBottom: '20px' }}>
                      {['Live 24/7', 'All Skill Levels', 'Instant Payouts'].map(tag => (
                        <span key={tag} style={{
                          background: 'rgba(197,48,48,0.1)', border: '1px solid rgba(197,48,48,0.25)',
                          color: '#C53030', fontSize: '0.68rem', fontWeight: 600,
                          padding: '3px 10px', borderRadius: '20px', letterSpacing: '0.3px',
                        }}>{tag}</span>
                      ))}
                    </div>
                    <Button as={Link} to="/play" className="btn-cyber" style={{ padding: '9px 22px', fontSize: '0.8rem' }}>
                      <Play size={14} className="me-2" /> Browse Competitions
                    </Button>
                  </div>
                </div>
              </div>
            </Col>

            {/* Play with Friends */}
            <Col md={6}>
              <div className="hiw-action-card hiw-action-card--blue">
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '18px' }}>
                  <div style={{
                    width: '52px', height: '52px', borderRadius: '12px', flexShrink: 0,
                    background: 'rgba(49,130,206,0.12)', border: '1px solid rgba(49,130,206,0.3)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                  }}>
                    <Users size={24} color="#3182CE" />
                  </div>
                  <div style={{ flex: 1 }}>
                    <h4 style={{ color: '#fff', fontWeight: 800, fontSize: '1.1rem', marginBottom: '8px' }}>
                      Play with Friends
                    </h4>
                    <p style={{ color: '#6B6B6B', fontSize: '0.85rem', lineHeight: 1.7, marginBottom: '18px' }}>
                      Create a private competition, invite friends with a code, and battle head-to-head. You set the entry fee — winner takes the prize pool.
                    </p>
                    <div style={{ display: 'flex', gap: '7px', flexWrap: 'wrap', marginBottom: '20px' }}>
                      {['Private Room', 'Invite by Code', 'You Set the Prize'].map(tag => (
                        <span key={tag} style={{
                          background: 'rgba(49,130,206,0.1)', border: '1px solid rgba(49,130,206,0.25)',
                          color: '#3182CE', fontSize: '0.68rem', fontWeight: 600,
                          padding: '3px 10px', borderRadius: '20px', letterSpacing: '0.3px',
                        }}>{tag}</span>
                      ))}
                    </div>
                    <Button
                      as={Link} to="/create"
                      style={{
                        display: 'inline-flex', alignItems: 'center', gap: '7px',
                        background: 'transparent', border: '1.5px solid #3182CE', color: '#3182CE',
                        fontWeight: 700, fontSize: '0.8rem', padding: '9px 22px',
                        borderRadius: '4px', textTransform: 'uppercase', letterSpacing: '0.8px',
                        transition: 'background 0.2s ease, color 0.2s ease',
                      }}
                      onMouseEnter={e => { e.currentTarget.style.background = '#3182CE'; e.currentTarget.style.color = '#fff' }}
                      onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = '#3182CE' }}
                    >
                      <Users size={14} /> Create Competition
                    </Button>
                  </div>
                </div>
              </div>
            </Col>
          </Row>
        </Container>
      </div>

      {/* ══════════════════════════════════════════════
          6. FEATURED LIVE COMPETITIONS
      ══════════════════════════════════════════════ */}
      {liveCompetitions.length > 0 && (
        <div style={{ background: '#0E0E10', padding: '64px 0 48px' }}>
          <Container>
            <div style={{
              display: 'flex', alignItems: 'center',
              justifyContent: 'space-between',
              marginBottom: '28px', flexWrap: 'wrap', gap: '12px',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <span className="live-pulse" />
                <h2 style={{ color: '#fff', fontWeight: 800, fontSize: '1.4rem', margin: 0 }}>
                  Live Now
                </h2>
              </div>
              <Link to="/play" className="section-link">
                View All <ArrowRight size={14} />
              </Link>
            </div>

            <Row className="g-4">
              {liveCompetitions.map(comp => {
                const gameType = comp.Game?.gameType || 'ACTION'
                const config   = GAME_TYPE_CONFIG[gameType] || { badge: '#555' }
                const fillPct  = Math.min(100, ((comp.currentPlayers || 0) / comp.maxPlayers) * 100)

                return (
                  <Col lg={4} key={comp.id}>
                    <div className="featured-card">
                      <div style={{ position: 'relative', height: '190px', overflow: 'hidden' }}>
                        <img
                          src={comp.Game?.imageUrl || '/image.png'}
                          alt={comp.Game?.name}
                          style={{ width: '100%', height: '100%', objectFit: 'cover', filter: 'brightness(0.5)' }}
                          onError={e => { e.currentTarget.src = '/image.png' }}
                        />
                        {/* LIVE badge */}
                        <div style={{
                          position: 'absolute', top: 12, left: 12,
                          display: 'flex', alignItems: 'center', gap: '6px',
                          background: '#C53030', color: '#fff',
                          fontSize: '0.68rem', fontWeight: 700, letterSpacing: '1px',
                          padding: '4px 10px', borderRadius: '3px', textTransform: 'uppercase',
                        }}>
                          <span className="live-dot-sm" /> LIVE
                        </div>
                        {/* Game type */}
                        <span style={{
                          position: 'absolute', bottom: 12, left: 12,
                          background: config.badge, color: '#fff',
                          fontSize: '0.68rem', fontWeight: 700,
                          padding: '3px 10px', borderRadius: '3px', textTransform: 'uppercase',
                        }}>{gameType}</span>
                        {/* Prize pool */}
                        <div style={{
                          position: 'absolute', bottom: 12, right: 12,
                          background: 'rgba(0,0,0,0.72)', backdropFilter: 'blur(6px)',
                          borderRadius: '6px', padding: '6px 12px', textAlign: 'right',
                        }}>
                          <div style={{ color: '#38A169', fontWeight: 800, fontSize: '1rem', lineHeight: 1 }}>
                            {formatKES(comp.totalPrizePool || 0)}
                          </div>
                          <div style={{ color: 'rgba(255,255,255,0.45)', fontSize: '0.6rem', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                            Prize Pool
                          </div>
                        </div>
                      </div>

                      <div style={{ padding: '18px 18px 14px' }}>
                        <h5 style={{ color: '#fff', fontWeight: 700, fontSize: '1rem', marginBottom: '4px' }}>
                          {comp.title}
                        </h5>
                        <small style={{ color: 'rgba(255,255,255,0.38)', fontSize: '0.78rem' }}>
                          {comp.Game?.name}
                        </small>

                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', margin: '14px 0' }}>
                          <div className="comp-stat">
                            <Users size={12} color="#805AD5" />
                            <span style={{ color: '#805AD5', fontWeight: 600, fontSize: '0.8rem' }}>
                              {comp.currentPlayers || 0}/{comp.maxPlayers}
                            </span>
                          </div>
                          <div className="comp-stat">
                            <Clock size={12} color="#3182CE" />
                            <span style={{ color: '#3182CE', fontWeight: 600, fontSize: '0.8rem' }}>
                              {formatTimeLeft(comp.endsAt, comp.status)}
                            </span>
                          </div>
                          <div className="comp-stat">
                            <Zap size={12} color="#FF9900" />
                            <span style={{ color: 'rgba(255,255,255,0.6)', fontSize: '0.8rem' }}>
                              {formatKES(comp.entryFee || 0)}
                            </span>
                          </div>
                          <div className="comp-stat">
                            <Star size={12} color="#B0B0B0" />
                            <span style={{ color: 'rgba(255,255,255,0.6)', fontSize: '0.8rem' }}>
                              {(comp.gameLevel || comp.Game?.level || 'Open').toUpperCase()}
                            </span>
                          </div>
                        </div>

                        <div style={{ height: '3px', background: 'rgba(255,255,255,0.07)', borderRadius: '2px', marginBottom: '14px' }}>
                          <div style={{
                            height: '100%', width: `${fillPct}%`,
                            background: 'linear-gradient(90deg, #C53030, #805AD5)',
                            borderRadius: '2px', transition: 'width 0.4s ease',
                          }} />
                        </div>

                        <button
                          className="card-join-btn"
                          style={{ width: '100%' }}
                          onClick={() => hasJoinedCompetition(comp.id) ? navigate('/play') : handleJoinCompetition(comp)}
                        >
                          <Play size={14} />
                          {hasJoinedCompetition(comp.id) ? 'Continue Playing' : 'Join Competition'}
                        </button>
                      </div>
                    </div>
                  </Col>
                )
              })}
            </Row>
          </Container>
        </div>
      )}

      {/* ══════════════════════════════════════════════
          8. SIGN-UP CTA BANNER (non-auth only)
      ══════════════════════════════════════════════ */}
      {!isAuthenticated && (
        <div style={{
          background: 'linear-gradient(135deg, rgba(197,48,48,0.13) 0%, #0E0E10 65%)',
          borderTop: '1px solid rgba(197,48,48,0.2)',
          borderBottom: '1px solid rgba(197,48,48,0.2)',
          padding: '72px 0',
        }}>
          <Container>
            <div style={{ textAlign: 'center', maxWidth: '560px', margin: '0 auto' }}>
              <div style={{
                color: '#C53030', fontSize: '0.7rem', fontWeight: 700,
                letterSpacing: '2.5px', textTransform: 'uppercase', marginBottom: '14px',
              }}>
                JOIN THE ARENA
              </div>
              <h2 style={{
                color: '#fff', fontWeight: 800,
                fontSize: 'clamp(1.8rem, 4vw, 2.6rem)',
                lineHeight: 1.2, marginBottom: '16px',
              }}>
                Start Winning<br />Real KES Today
              </h2>
              <p style={{
                color: 'rgba(255,255,255,0.42)', fontSize: '0.95rem',
                lineHeight: 1.7, marginBottom: '32px',
              }}>
                Join thousands of players competing in live tournaments.
                Sign up free, deposit via M-Pesa, and play your first competition in minutes.
              </p>
              <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', flexWrap: 'wrap' }}>
                <Button as={Link} to="/auth" className="btn-cyber" style={{ padding: '13px 36px', fontSize: '0.9rem' }}>
                  <UserPlus size={17} className="me-2" /> Create Free Account
                </Button>
                <Button
                  as={Link} to="/play"
                  variant="outline-secondary"
                  style={{ borderColor: 'rgba(255,255,255,0.15)', color: '#7A7A7A', padding: '13px 28px', fontSize: '0.9rem' }}
                >
                  Browse Competitions
                </Button>
              </div>
            </div>
          </Container>
        </div>
      )}

      {/* ══════════════════════════════════════════════
          9. ALL COMPETITIONS GRID
      ══════════════════════════════════════════════ */}
      <div style={{ background: '#0E0E10', padding: '64px 0 48px' }}>
        <Container>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '24px' }}>
            <Star size={20} color="#3182CE" />
            <h2 style={{ color: '#fff', fontWeight: 700, fontSize: '1.3rem', margin: 0 }}>
              All Competitions
            </h2>
          </div>

          {/* Search + Filter */}
          <Row className="mb-4">
            <Col lg={8} className="mb-3 mb-lg-0">
              <InputGroup>
                <InputGroup.Text style={{
                  background: 'rgba(31,31,35,0.9)',
                  border: '1px solid rgba(49,130,206,0.25)', borderRight: 'none',
                }}>
                  <Search size={18} color="#3182CE" />
                </InputGroup.Text>
                <Form.Control
                  type="text"
                  placeholder="Search competitions, games..."
                  value={searchTerm}
                  onChange={e => setSearchTerm(e.target.value)}
                  style={{
                    background: 'rgba(31,31,35,0.9)',
                    border: '1px solid rgba(49,130,206,0.25)', borderLeft: 'none',
                    color: '#fff',
                  }}
                />
              </InputGroup>
            </Col>
            <Col lg={4}>
              <Form.Select
                value={selectedFilter}
                onChange={e => setSelectedFilter(e.target.value)}
                style={{
                  background: 'rgba(31,31,35,0.9)',
                  border: '1px solid rgba(49,130,206,0.25)', color: '#fff',
                }}
              >
                <option value="all">All Competitions</option>
                <option value="ongoing">Live Now</option>
                <option value="upcoming">Upcoming</option>
              </Form.Select>
            </Col>
          </Row>

          {loading.publicCompetitions ? (
            <div className="text-center py-5">
              <div className="spinner-border text-info" role="status" />
              <p className="text-white mt-3">Loading competitions...</p>
            </div>
          ) : (
            <Row>
              {filteredCompetitions.map(comp => {
                const gameType = comp.Game?.gameType || 'ACTION'
                const config   = GAME_TYPE_CONFIG[gameType] || { badge: '#555' }
                const fillPct  = Math.min(100, ((comp.currentPlayers || 0) / comp.maxPlayers) * 100)
                const canJoin  = comp.status !== 'COMPLETED' && comp.status !== 'CANCELED' && comp.currentPlayers < comp.maxPlayers

                return (
                  <Col lg={6} xl={4} key={comp.id} className="mb-4">
                    <div className="comp-card">
                      <div style={{ position: 'relative', height: '145px', overflow: 'hidden' }}>
                        <img
                          src={comp.Game?.imageUrl || '/image.png'}
                          alt={comp.Game?.name}
                          style={{ width: '100%', height: '100%', objectFit: 'cover', filter: 'brightness(0.65)' }}
                          onError={e => { e.currentTarget.src = '/image.png' }}
                        />
                        <span style={{
                          position: 'absolute', top: 10, left: 10,
                          background: getStatusColor(comp.status), color: '#0E0E10',
                          fontSize: '0.68rem', fontWeight: 700,
                          padding: '3px 10px', borderRadius: '3px', textTransform: 'uppercase',
                        }}>{comp.status}</span>
                        <span style={{
                          position: 'absolute', top: 10, right: 10,
                          background: getDifficultyColor(comp.gameLevel || comp.Game?.level), color: '#0E0E10',
                          fontSize: '0.68rem', fontWeight: 700,
                          padding: '3px 10px', borderRadius: '3px', textTransform: 'uppercase',
                        }}>{(comp.gameLevel || comp.Game?.level || 'N/A').toUpperCase()}</span>
                        <span style={{
                          position: 'absolute', bottom: 10, left: 10,
                          background: config.badge, color: '#fff',
                          fontSize: '0.68rem', fontWeight: 700,
                          padding: '3px 10px', borderRadius: '3px', textTransform: 'uppercase',
                        }}>{gameType}</span>
                      </div>

                      <div style={{ padding: '14px 16px 10px' }}>
                        <h5 style={{ color: '#fff', fontWeight: 700, fontSize: '0.98rem', marginBottom: '2px' }}>
                          {comp.title}
                        </h5>
                        <small style={{ color: 'rgba(255,255,255,0.38)', fontSize: '0.78rem' }}>
                          {comp.Game?.name}
                        </small>

                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', marginTop: '12px' }}>
                          <div className="comp-stat">
                            <Trophy size={13} color="#3182CE" />
                            <span style={{ color: '#3182CE', fontWeight: 600, fontSize: '0.82rem' }}>
                              {formatKES(comp.totalPrizePool || 0)}
                            </span>
                          </div>
                          <div className="comp-stat">
                            <Users size={13} color="#805AD5" />
                            <span style={{ color: '#805AD5', fontWeight: 600, fontSize: '0.82rem' }}>
                              {comp.currentPlayers || 0}/{comp.maxPlayers}
                            </span>
                          </div>
                          <div className="comp-stat">
                            <Clock size={13} color="#38A169" />
                            <span style={{ color: '#38A169', fontWeight: 600, fontSize: '0.82rem' }}>
                              {formatTimeLeft(comp.endsAt, comp.status)}
                            </span>
                          </div>
                          <div className="comp-stat">
                            <Zap size={13} color="#FF9900" />
                            <span style={{ color: 'rgba(255,255,255,0.65)', fontSize: '0.82rem' }}>
                              {formatKES(comp.entryFee || 0)}
                            </span>
                          </div>
                        </div>

                        <div style={{ marginTop: '12px', height: '3px', background: 'rgba(255,255,255,0.07)', borderRadius: '2px' }}>
                          <div style={{
                            height: '100%', width: `${fillPct}%`,
                            background: 'linear-gradient(90deg, #3182CE, #805AD5)',
                            borderRadius: '2px', transition: 'width 0.4s ease',
                          }} />
                        </div>
                        <small style={{ color: 'rgba(255,255,255,0.28)', fontSize: '0.72rem' }}>
                          {fillPct.toFixed(0)}% full
                        </small>
                      </div>

                      <div style={{
                        padding: '10px 16px 14px', display: 'flex', gap: '8px',
                        borderTop: '1px solid rgba(255,255,255,0.05)',
                      }}>
                        <button
                          className="card-join-btn"
                          disabled={(!canJoin && !hasJoinedCompetition(comp.id)) || joiningCompetition}
                          onClick={() => hasJoinedCompetition(comp.id) ? navigate('/play') : handleJoinCompetition(comp)}
                        >
                          {joiningCompetition ? <span className="spinner-border spinner-border-sm" />
                            : hasJoinedCompetition(comp.id) ? <><Play size={13} /> View</>
                            : !canJoin ? (comp.status === 'COMPLETED' ? 'Ended' : comp.status === 'CANCELED' ? 'Canceled' : 'Full')
                            : 'Join Now'}
                        </button>
                        <button
                          className="card-info-btn"
                          onClick={() => { setSelectedCompetition(comp); setShowCompetitionModal(true) }}
                        >
                          <Info size={16} />
                        </button>
                      </div>
                    </div>
                  </Col>
                )
              })}
            </Row>
          )}

          {filteredCompetitions.length === 0 && !loading.publicCompetitions && (
            <div className="text-center py-5">
              <Search size={56} color="#333" className="mb-3" />
              <h4 className="text-white mb-1">No competitions found</h4>
              <p style={{ color: 'rgba(255,255,255,0.38)' }}>Try adjusting your search or filter</p>
              <button className="hero-btn-primary" style={{ margin: '0 auto' }} onClick={() => navigate('/create')}>
                <Play size={17} /> Create a Competition
              </button>
            </div>
          )}
        </Container>
      </div>

      {/* ══════════════════════════════════════════════
          COMPETITION DETAILS MODAL
      ══════════════════════════════════════════════ */}
      <Modal show={showCompetitionModal} onHide={() => setShowCompetitionModal(false)} size="lg" className="cyber-modal">
        <Modal.Header closeButton>
          <Modal.Title className="d-flex align-items-center">
            <Trophy size={24} className="me-2 text-neon" />
            {selectedCompetition?.title}
          </Modal.Title>
        </Modal.Header>

        <Modal.Body>
          {selectedCompetition && (
            <div>
              <Row className="mb-4">
                <Col md={8}>
                  <div className="d-flex align-items-center gap-3 mb-3 flex-wrap">
                    <Badge style={{ background: getStatusColor(selectedCompetition.status), color: '#0E0E10', padding: '6px 12px' }}>
                      {selectedCompetition.status?.toUpperCase()}
                    </Badge>
                    <Badge style={{ background: getDifficultyColor(selectedCompetition.gameLevel || selectedCompetition.Game?.level), color: '#0E0E10', padding: '6px 12px' }}>
                      {(selectedCompetition.gameLevel || selectedCompetition.Game?.level || 'N/A').toUpperCase()}
                    </Badge>
                    <Badge style={{ background: '#805AD5', padding: '6px 12px' }}>
                      {selectedCompetition.Game?.name || 'Unknown Game'}
                    </Badge>
                  </div>
                  <p className="text-white mb-3">
                    {selectedCompetition.Game?.description || 'No description available'}
                  </p>
                  <Row>
                    <Col sm={6} className="mb-2">
                      <strong className="text-white">Creator:</strong>
                      <div className="text-white">{selectedCompetition.creator?.username || selectedCompetition.creator || 'Unknown'}</div>
                    </Col>
                    <Col sm={6} className="mb-2">
                      <strong className="text-white">Game Type:</strong>
                      <div className="text-white">{selectedCompetition.Game?.gameType || 'N/A'}</div>
                    </Col>
                    <Col sm={6} className="mb-2">
                      <strong className="text-white">Starts:</strong>
                      <div className="text-white">{new Date(selectedCompetition.startsAt || selectedCompetition.createdAt).toLocaleString()}</div>
                    </Col>
                    <Col sm={6} className="mb-2">
                      <strong className="text-white">Ends:</strong>
                      <div className="text-white">{new Date(selectedCompetition.endsAt).toLocaleString()}</div>
                    </Col>
                  </Row>
                </Col>
                <Col md={4}>
                  <div className="cyber-card p-3">
                    <h6 className="text-neon mb-3">Competition Stats</h6>
                    {[
                      { label: 'Prize Pool', value: formatKES(selectedCompetition.totalPrizePool || 0), color: '#38A169' },
                      { label: 'Entry Fee',  value: formatKES(selectedCompetition.entryFee || 0),       color: '#fff' },
                      { label: 'Players',    value: `${selectedCompetition.currentPlayers || 0}/${selectedCompetition.maxPlayers}`, color: '#805AD5' },
                      { label: 'Time Left',  value: formatTimeLeft(selectedCompetition.endsAt, selectedCompetition.status), color: '#C53030' },
                    ].map(({ label, value, color }) => (
                      <div key={label} className="d-flex justify-content-between mb-2">
                        <span className="text-white">{label}:</span>
                        <span style={{ color, fontWeight: 700 }}>{value}</span>
                      </div>
                    ))}
                    <div className="progress mt-2 mb-1" style={{ height: '5px' }}>
                      <div className="progress-bar" style={{
                        width: `${((selectedCompetition.currentPlayers || 0) / selectedCompetition.maxPlayers) * 100}%`,
                        background: 'linear-gradient(90deg, #3182CE, #805AD5)',
                      }} />
                    </div>
                    <small className="text-white">
                      {(((selectedCompetition.currentPlayers || 0) / selectedCompetition.maxPlayers) * 100).toFixed(1)}% Full
                    </small>
                  </div>
                </Col>
              </Row>
              {selectedCompetition.code && (
                <div>
                  <h6 className="text-white mb-2">Competition Code</h6>
                  <div className="d-flex align-items-center gap-2">
                    <code className="text-neon bg-dark p-2 rounded flex-grow-1">{selectedCompetition.code}</code>
                    <Button variant="outline-info" size="sm"
                      onClick={() => { navigator.clipboard.writeText(selectedCompetition.code); alert('Code copied!') }}>
                      Copy
                    </Button>
                  </div>
                </div>
              )}
            </div>
          )}
        </Modal.Body>

        <Modal.Footer>
          <Button variant="outline-secondary" onClick={() => setShowCompetitionModal(false)}>Close</Button>
          {selectedCompetition && (
            <Button
              className="btn-cyber"
              disabled={
                selectedCompetition.currentPlayers >= selectedCompetition.maxPlayers ||
                joiningCompetition ||
                selectedCompetition.status === 'COMPLETED' ||
                selectedCompetition.status === 'CANCELED'
              }
              onClick={() => handleJoinCompetition(selectedCompetition)}
            >
              {joiningCompetition ? <><span className="spinner-border spinner-border-sm me-2" />Joining...</>
                : hasJoinedCompetition(selectedCompetition.id) ? <><Play size={18} className="me-2" />Go to Competition</>
                : selectedCompetition.currentPlayers >= selectedCompetition.maxPlayers ? 'Competition Full'
                : selectedCompetition.status === 'COMPLETED' ? 'Competition Ended'
                : selectedCompetition.status === 'CANCELED'  ? 'Competition Canceled'
                : <><Trophy size={18} className="me-2" />Join Competition</>}
            </Button>
          )}
        </Modal.Footer>
      </Modal>

      {/* ══════════════════════════════════════════════
          STYLES
      ══════════════════════════════════════════════ */}
      <style>{`
        @keyframes heroContentIn {
          from { opacity: 0; transform: translateY(16px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes tickerScroll {
          from { transform: translateX(0); }
          to   { transform: translateX(-50%); }
        }
        @keyframes livePulse {
          0%, 100% { opacity: 1; transform: scale(1); }
          50%       { opacity: 0.5; transform: scale(0.85); }
        }

        /* ── Ticker ── */
        .ticker-track {
          display: inline-flex;
          white-space: nowrap;
          animation: tickerScroll 38s linear infinite;
        }
        .ticker-item {
          display: inline-flex; align-items: center; gap: 10px;
          padding: 0 36px;
          color: rgba(255,255,255,0.55);
          font-size: 0.82rem; font-weight: 500; letter-spacing: 0.3px;
        }
        .ticker-dot-red {
          width: 6px; height: 6px; background: #C53030;
          border-radius: 50%; display: inline-block; flex-shrink: 0;
        }

        /* ── Live indicators ── */
        .live-pulse {
          width: 10px; height: 10px; background: #C53030; border-radius: 50%;
          display: inline-block; flex-shrink: 0;
          animation: livePulse 1.5s ease infinite;
          box-shadow: 0 0 8px rgba(197,48,48,0.7);
        }
        .live-dot-sm {
          width: 5px; height: 5px; background: #fff; border-radius: 50%;
          display: inline-block; animation: livePulse 1.2s ease infinite;
        }

        /* ── Section link ── */
        .section-link {
          color: #C53030; font-size: 0.82rem; text-decoration: none;
          display: inline-flex; align-items: center; gap: 4px;
          font-weight: 600; transition: color 0.2s ease;
        }
        .section-link:hover { color: #9B2C2C; text-decoration: none; }

        /* ── Hero buttons ── */
        .hero-cta-row {
          display: inline-flex;       /* size to content, not parent's max-width */
          gap: 10px;
          flex-wrap: nowrap;
        }
        .hero-btn-primary {
          display: inline-flex; align-items: center; justify-content: center; gap: 8px;
          background: #C53030; color: #fff; border: none;
          font-weight: 700; font-size: 0.9rem;
          padding: 12px 22px; letter-spacing: 1px;
          text-transform: uppercase; border-radius: 3px;
          cursor: pointer; transition: background 0.2s, transform 0.2s;
          white-space: nowrap;
          min-width: 150px;          /* equal width with secondary */
        }
        .hero-btn-primary:hover { background: #9B2C2C; transform: translateY(-2px); }
        .hero-btn-primary:disabled { opacity: 0.45; cursor: not-allowed; }

        .hero-btn-secondary {
          display: inline-flex; align-items: center; justify-content: center; gap: 8px;
          background: rgba(255,255,255,0.08);
          border: 1.5px solid rgba(255,255,255,0.35);
          color: #fff; font-weight: 700; font-size: 0.9rem;
          padding: 12px 22px; letter-spacing: 1px;
          text-transform: uppercase; border-radius: 3px;
          cursor: pointer; transition: background 0.2s, border-color 0.2s, transform 0.2s;
          backdrop-filter: blur(6px);
          white-space: nowrap;
          min-width: 150px;          /* equal width with primary */
        }
        .hero-btn-secondary:hover {
          background: rgba(255,255,255,0.16);
          border-color: rgba(255,255,255,0.6);
          transform: translateY(-2px);
        }

        /* Phones: smaller padding/font so both buttons sit in a single row */
        @media (max-width: 575px) {
          .hero-cta-row { gap: 8px; }
          .hero-btn-primary,
          .hero-btn-secondary {
            padding: 9px 14px;
            font-size: 0.74rem;
            letter-spacing: 0.5px;
            gap: 6px;
            flex: 1 1 0;
            min-width: 0;
            justify-content: center;
          }
        }

        /* Very narrow phones only (≤320px, e.g. iPhone SE 1st gen): stack vertically */
        @media (max-width: 320px) {
          .hero-cta-row { flex-wrap: wrap; }
          .hero-btn-primary,
          .hero-btn-secondary {
            flex: 1 1 100%;
          }
        }

        /* ── Diamond nav ── */
        .diamond-nav {
          position: absolute; top: 50%; transform: translateY(-50%);
          z-index: 4; width: 54px; height: 54px;
          background: none; border: none;
          display: flex; align-items: center; justify-content: center;
          cursor: pointer; opacity: 0.18;
          transition: transform 0.25s, opacity 0.25s;
        }
        .diamond-nav:hover { transform: translateY(-50%) scale(1.1); opacity: 1; }
        .diamond-nav-left  { left: 24px; }
        .diamond-nav-right { right: 24px; }
        .diamond-bg {
          position: absolute; inset: 0; margin: auto;
          width: 42px; height: 42px;
          background: rgba(0,0,0,0.68);
          border: 1.5px solid rgba(255,255,255,0.38);
          transform: rotate(45deg); display: block;
          transition: background 0.25s, border-color 0.25s;
        }
        .diamond-nav:hover .diamond-bg {
          background: rgba(0,0,0,0.88);
          border-color: rgba(255,255,255,0.7);
        }
        @media (max-width: 576px) { .diamond-nav { display: none; } }

        /* ── Featured card ── */
        .featured-card {
          background: rgba(31,31,35,0.9);
          border: 1px solid rgba(255,255,255,0.07);
          border-radius: 12px; overflow: hidden;
          height: 100%;
          transition: transform 0.25s ease, box-shadow 0.25s ease;
        }
        .featured-card:hover {
          transform: translateY(-6px);
          box-shadow: 0 16px 48px rgba(197,48,48,0.1);
        }

        /* ── How It Works compact strip ── */
        .hiw-strip-header {
          display: flex; align-items: center; gap: 10px; margin-bottom: 16px;
        }
        .hiw-strip-sep {
          flex: 1; height: 1px; background: rgba(255,255,255,0.05);
        }
        .hiw-strip-subtitle {
          color: rgba(255,255,255,0.25); font-size: 0.65rem;
          font-weight: 600; letter-spacing: 1.5px; text-transform: uppercase;
        }

        .hiw-step {
          display: flex; align-items: center; gap: 10px;
          padding: 12px 16px;
        }

        /* Desktop: right border on first 3, no bottom borders */
        @media (min-width: 768px) {
          .hiw-step-0, .hiw-step-1, .hiw-step-2 {
            border-right: 1px solid rgba(255,255,255,0.05);
          }
        }

        /* Mobile (2×2 grid): right border on left column, bottom border between rows */
        @media (max-width: 767px) {
          .hiw-strip-sep, .hiw-strip-subtitle { display: none; }
          .hiw-step { padding: 14px 12px; }
          .hiw-step-0, .hiw-step-2 { border-right: 1px solid rgba(255,255,255,0.05); }
          .hiw-step-0, .hiw-step-1 { border-bottom: 1px solid rgba(255,255,255,0.05); }
        }

        /* ── How It Works action cards ── */
        .hiw-action-card {
          background: rgba(31,31,35,0.7);
          border-radius: 14px; padding: 28px 24px;
          height: 100%;
          transition: border-color 0.25s ease, transform 0.25s ease;
        }
        .hiw-action-card--red {
          border: 1px solid rgba(197,48,48,0.18);
        }
        .hiw-action-card--red:hover {
          border-color: rgba(197,48,48,0.4);
          transform: translateY(-3px);
        }
        .hiw-action-card--blue {
          border: 1px solid rgba(49,130,206,0.18);
        }
        .hiw-action-card--blue:hover {
          border-color: rgba(49,130,206,0.4);
          transform: translateY(-3px);
        }

        /* ── Competition cards ── */
        .comp-card {
          background: rgba(31,31,35,0.9);
          border: 1px solid rgba(255,255,255,0.06);
          border-radius: 10px; overflow: hidden;
          transition: transform 0.25s ease, box-shadow 0.25s ease;
        }
        .comp-card:hover {
          transform: translateY(-5px);
          box-shadow: 0 12px 36px rgba(0,0,0,0.4);
        }

        .comp-stat { display: flex; align-items: center; gap: 6px; }

        .card-join-btn {
          flex: 1; display: inline-flex; align-items: center;
          justify-content: center; gap: 6px;
          background: #C53030; color: #fff; border: none;
          font-weight: 700; font-size: 0.82rem; padding: 8px 12px;
          text-transform: uppercase; letter-spacing: 0.5px;
          border-radius: 4px; cursor: pointer; transition: background 0.2s;
        }
        .card-join-btn:hover:not(:disabled) { background: #9B2C2C; }
        .card-join-btn:disabled { opacity: 0.45; cursor: not-allowed; }

        .card-info-btn {
          background: rgba(49,130,206,0.07);
          border: 1px solid rgba(49,130,206,0.22);
          color: #3182CE; padding: 8px 14px; border-radius: 4px;
          cursor: pointer; display: flex; align-items: center;
          justify-content: center; transition: background 0.2s;
        }
        .card-info-btn:hover { background: rgba(49,130,206,0.16); }

        .form-control::placeholder { color: rgba(255,255,255,0.3) !important; }
        .form-control:focus {
          box-shadow: 0 0 0 2px rgba(49,130,206,0.18) !important;
          border-color: rgba(49,130,206,0.45) !important;
          background: rgba(31,31,35,0.9) !important;
          color: #fff !important;
        }
        .form-select option { background: #1f1f23; color: #fff; }
      `}</style>
    </div>
  )
}

export default Homepage
