import React, { useState, useEffect, useMemo } from 'react'
import { Container, Modal, Spinner } from 'react-bootstrap'
import {
  Dumbbell, Search, Gamepad2, Trophy, Clock, TrendingUp, Play, Star,
} from 'lucide-react'
import { useGame } from '../contexts/GameContext'
import trainingService from '../services/trainingService'
import DinoGame from '../games/dino/DinoGame'
import '../styles/PlayPage.css'
import '../styles/TrainPage.css'

const FILTERS = [
  { key: 'all',     label: 'All Games' },
  { key: 'played',  label: 'Played' },
  { key: 'untried', label: 'Untried' },
]

const formatDate = (iso) => {
  if (!iso) return ''
  const d = new Date(iso)
  const now = Date.now()
  const diff = Math.floor((now - d.getTime()) / 60000)
  if (diff < 60)   return `${diff} min ago`
  if (diff < 1440) return `${Math.floor(diff / 60)} h ago`
  return d.toLocaleDateString('en-KE', { month: 'short', day: 'numeric' })
}

const formatDuration = (seconds) => {
  if (!seconds) return '0s'
  if (seconds < 60) return `${seconds}s`
  const m = Math.floor(seconds / 60)
  const s = seconds % 60
  return s ? `${m}m ${s}s` : `${m}m`
}

const TrainPage = () => {
  const { games, fetchGames, loading: gameLoading } = useGame()

  const [stats, setStats]         = useState([])
  const [sessions, setSessions]   = useState([])
  const [loading, setLoading]     = useState(true)
  const [filter, setFilter]       = useState('all')
  const [search, setSearch]       = useState('')

  const [activeGame, setActiveGame]     = useState(null)
  const [sessionStart, setSessionStart] = useState(null)
  const [saving, setSaving]             = useState(false)
  const [feedback, setFeedback]         = useState(null)

  // Load all data
  const loadData = async () => {
    try {
      setLoading(true)
      const [statsRes, sessionsRes] = await Promise.all([
        trainingService.getStats(),
        trainingService.getMySessions({ limit: 10 }),
      ])
      setStats(statsRes)
      setSessions(sessionsRes)
    } catch (err) {
      console.error('Failed to load training data:', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchGames()
    loadData()
  }, [])

  // Map game stats by name for quick lookup
  const statsByGame = useMemo(() => {
    const map = {}
    stats.forEach(s => { map[s.gameName] = s })
    return map
  }, [stats])

  // Merge games + stats
  const gameList = useMemo(() => {
    const list = (games || [])
      .filter(g => g.isActive !== false)
      .map(g => ({
        ...g,
        stat: statsByGame[g.name] || null,
      }))

    const q = search.trim().toLowerCase()
    return list.filter(g => {
      if (filter === 'played'  && !g.stat) return false
      if (filter === 'untried' && g.stat)  return false
      if (q && !g.name.toLowerCase().includes(q)) return false
      return true
    })
  }, [games, statsByGame, filter, search])

  // Summary stats across all games
  const summary = useMemo(() => {
    const totalSessions = stats.reduce((s, x) => s + (x.sessionsPlayed || 0), 0)
    const totalDuration = stats.reduce((s, x) => s + (x.totalDuration || 0), 0)
    const best = stats.reduce((acc, x) =>
      (x.bestScore > (acc?.bestScore || 0) ? x : acc), null)
    return {
      totalSessions,
      totalDuration,
      bestGame: best,
    }
  }, [stats])

  const topGame = useMemo(() => {
    if (!stats.length) return null
    return [...stats].sort((a, b) =>
      (b.sessionsPlayed || 0) - (a.sessionsPlayed || 0) ||
      (b.bestScore || 0) - (a.bestScore || 0)
    )[0]
  }, [stats])

  const handlePractice = (game) => {
    setActiveGame(game)
    setSessionStart(Date.now())
    setFeedback(null)
  }

  const handleClose = () => {
    setActiveGame(null)
    setSessionStart(null)
  }

  const handleGameEnd = async (result) => {
    if (!activeGame || typeof result?.score !== 'number') {
      handleClose()
      return
    }
    const duration = sessionStart
      ? Math.max(0, Math.floor((Date.now() - sessionStart) / 1000))
      : 0

    try {
      setSaving(true)
      await trainingService.createSession({
        gameName: activeGame.name,
        score:    Math.max(0, Math.round(result.score)),
        duration,
      })
      setFeedback({
        type: 'ok',
        msg:  `Session saved! Score ${result.score} · ${formatDuration(duration)}`,
      })
      await loadData()
    } catch (err) {
      setFeedback({
        type: 'err',
        msg:  err.message || 'Failed to save session',
      })
    } finally {
      setSaving(false)
      setActiveGame(null)
      setSessionStart(null)
      setTimeout(() => setFeedback(null), 5000)
    }
  }

  const isInitialLoading = (loading && stats.length === 0) || gameLoading.games

  return (
    <div className="pp-page">
      <Container fluid className="pp-container">
        {/* Header */}
        <div className="pp-header">
          <div className="pp-header-top">
            <div className="pp-header-titleblock">
              <h1 className="pp-title">
                <Dumbbell size={20} style={{ marginRight: 10, verticalAlign: 'middle', color: '#C53030' }} />
                Practice Arena
              </h1>
              <p className="pp-subtitle">
                Train on the same games you compete in — free, no entry fee, no risk
              </p>
            </div>
          </div>

          <div className="tp-summary">
            <div className="tp-summary-stat">
              <Trophy size={16} color="#C53030" />
              <span className="tp-summary-label">Sessions</span>
              <span className="tp-summary-value">{summary.totalSessions}</span>
            </div>
            <div className="tp-summary-stat">
              <Clock size={16} color="#3182CE" />
              <span className="tp-summary-label">Time Trained</span>
              <span className="tp-summary-value">{formatDuration(summary.totalDuration)}</span>
            </div>
            <div className="tp-summary-stat">
              <Star size={16} color="#F6AD55" />
              <span className="tp-summary-label">Best</span>
              <span className="tp-summary-value">
                {summary.bestGame
                  ? `${summary.bestGame.bestScore.toLocaleString()} · ${summary.bestGame.gameName}`
                  : '—'}
              </span>
            </div>
          </div>
        </div>

        {feedback && (
          <div className={`tp-feedback tp-feedback--${feedback.type}`}>
            {feedback.msg}
          </div>
        )}

        {isInitialLoading ? (
          <div className="pp-loader" style={{ height: '40vh' }}>
            <Spinner animation="border" style={{ color: '#C53030' }} />
            <div>Loading practice arena...</div>
          </div>
        ) : (
          <div className="pp-layout">
            <div className="pp-main">
              {/* Filter bar */}
              <div className="pp-filterbar">
                <div className="pp-status-pills">
                  {FILTERS.map(f => (
                    <button
                      key={f.key}
                      type="button"
                      className={`pp-status-pill ${filter === f.key ? 'active' : ''}`}
                      onClick={() => setFilter(f.key)}
                    >
                      {f.label}
                    </button>
                  ))}
                </div>
                <div className="pp-filter-controls">
                  <div className="pp-search">
                    <Search size={14} color="#7A7A7A" />
                    <input
                      type="text"
                      placeholder="Search games..."
                      value={search}
                      onChange={e => setSearch(e.target.value)}
                    />
                  </div>
                </div>
              </div>

              {gameList.length === 0 ? (
                <div className="pp-empty">
                  <Gamepad2 size={42} color="#3A3A3A" />
                  <h5>No games match your filters</h5>
                  <p>Try a different filter or clear the search.</p>
                </div>
              ) : (
                <div className="tp-grid">
                  {gameList.map(game => {
                    const s = game.stat
                    return (
                      <div key={game.id} className="tp-card">
                        <div className="tp-card-img">
                          {game.imageUrl ? (
                            <img
                              src={game.imageUrl}
                              alt={game.name}
                              onError={(e) => { e.currentTarget.style.display = 'none' }}
                            />
                          ) : (
                            <Gamepad2 size={32} color="#555" />
                          )}
                          {!s && (
                            <span className="tp-untried-badge">Untried</span>
                          )}
                        </div>

                        <div className="tp-card-body">
                          <h4 className="tp-card-name">{game.name}</h4>
                          <div className="tp-card-pills">
                            <span className="pp-pill pp-pill-game">{game.gameType}</span>
                            <span className="pp-pill">{game.level}</span>
                          </div>

                          <div className="tp-card-stats">
                            <div className="tp-card-stat">
                              <span className="tp-card-stat-label">Best</span>
                              <span className="tp-card-stat-value">
                                {s ? s.bestScore.toLocaleString() : '—'}
                              </span>
                            </div>
                            <div className="tp-card-stat">
                              <span className="tp-card-stat-label">Avg</span>
                              <span className="tp-card-stat-value">
                                {s ? s.averageScore.toLocaleString() : '—'}
                              </span>
                            </div>
                            <div className="tp-card-stat">
                              <span className="tp-card-stat-label">Plays</span>
                              <span className="tp-card-stat-value">
                                {s ? s.sessionsPlayed : 0}
                              </span>
                            </div>
                          </div>

                          <button
                            type="button"
                            className="pp-btn pp-btn-primary tp-card-cta"
                            onClick={() => handlePractice(game)}
                          >
                            <Play size={14} />
                            {s ? 'Practice' : 'Try it'}
                          </button>
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}
            </div>

            {/* Sidebar */}
            <aside className="pp-aside">
              <div className="tp-side-card">
                <div className="tp-side-head">
                  <TrendingUp size={14} color="#C53030" />
                  <span>Recent Sessions</span>
                </div>
                {sessions.length === 0 ? (
                  <div className="tp-side-empty">
                    <p>No sessions yet — play a game to get started.</p>
                  </div>
                ) : (
                  <div className="tp-side-list">
                    {sessions.slice(0, 6).map(s => (
                      <div key={s.id} className="tp-side-row">
                        <div className="tp-side-row-main">
                          <div className="tp-side-row-game">{s.gameName}</div>
                          <div className="tp-side-row-meta">
                            {formatDate(s.createdAt)} · {formatDuration(s.duration)}
                          </div>
                        </div>
                        <div className="tp-side-row-score">
                          {s.score.toLocaleString()}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {topGame && (
                <div className="tp-side-card">
                  <div className="tp-side-head">
                    <Star size={14} color="#F6AD55" />
                    <span>Your Top Game</span>
                  </div>
                  <div className="tp-top-game">
                    <div className="tp-top-game-name">{topGame.gameName}</div>
                    <div className="tp-top-game-rows">
                      <div className="tp-top-row">
                        <span>Best score</span>
                        <strong>{topGame.bestScore.toLocaleString()}</strong>
                      </div>
                      <div className="tp-top-row">
                        <span>Average</span>
                        <strong>{topGame.averageScore.toLocaleString()}</strong>
                      </div>
                      <div className="tp-top-row">
                        <span>Sessions</span>
                        <strong>{topGame.sessionsPlayed}</strong>
                      </div>
                      <div className="tp-top-row">
                        <span>Time trained</span>
                        <strong>{formatDuration(topGame.totalDuration)}</strong>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </aside>
          </div>
        )}
      </Container>

      {/* Practice game modal */}
      <Modal
        show={!!activeGame}
        onHide={handleClose}
        size="xl"
        fullscreen="lg-down"
        className="pp-modal"
        backdrop="static"
      >
        <Modal.Header closeButton>
          <Modal.Title>
            <span className="pp-modal-title-icon"><Dumbbell size={16} /></span>
            Practice · {activeGame?.name}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body className="p-0">
          {activeGame && (
            <DinoGame onGameEnd={handleGameEnd} />
          )}
        </Modal.Body>
      </Modal>

      {saving && (
        <div className="tp-saving-overlay">
          <Spinner animation="border" style={{ color: '#C53030' }} />
          <span>Saving your session...</span>
        </div>
      )}
    </div>
  )
}

export default TrainPage
