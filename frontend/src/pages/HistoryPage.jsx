import React, { useEffect, useMemo, useState } from 'react'
import { Container, Spinner } from 'react-bootstrap'
import { Link } from 'react-router-dom'
import {
  History, Trophy, Users, TrendingUp, Calendar, ChevronLeft, Gamepad2, Send,
} from 'lucide-react'
import { useGame } from '../contexts/GameContext'
import { formatKES } from '../utils/formatters'
import '../styles/PlayPage.css'

const formatDate = (iso) => {
  if (!iso) return '—'
  return new Date(iso).toLocaleString('en-KE', {
    month: 'short', day: 'numeric', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  })
}

const rankColor = (rank) => {
  if (rank === 1) return '#F6AD55'
  if (rank === 2) return '#C0C0C0'
  if (rank === 3) return '#CD7F32'
  if (rank <= 10) return '#3182CE'
  return '#805AD5'
}

const HistoryPage = () => {
  const {
    myCompetitions,
    participatedCompetitions,
    gameHistory,
    loading,
    fetchMyCompetitions,
    fetchParticipatedCompetitions,
    fetchGameHistory,
  } = useGame()

  const [tab, setTab] = useState('competitions')

  useEffect(() => {
    fetchMyCompetitions()
    fetchParticipatedCompetitions()
    fetchGameHistory()
  }, [])

  const completed = useMemo(() => {
    const all = [
      ...myCompetitions.filter(c => c.status === 'COMPLETED' || c.status === 'CANCELED'),
      ...participatedCompetitions.filter(c => c.status === 'COMPLETED' || c.status === 'CANCELED'),
    ]
    const deduped = all.filter((c, i, self) => i === self.findIndex(x => x.id === c.id))
    return deduped.sort((a, b) => new Date(b.endsAt || b.createdAt) - new Date(a.endsAt || a.createdAt))
  }, [myCompetitions, participatedCompetitions])

  const stats = useMemo(() => {
    const games = completed.filter(c => c.status === 'COMPLETED')
    const totalEarnings = games.reduce((sum, c) => sum + (c.earnings || 0), 0)
    const wins = games.filter(c => c.finalRank === 1).length
    const winRate = games.length > 0 ? Math.round((wins / games.length) * 100) : 0
    const bestRank = games.length > 0
      ? Math.min(...games.map(c => c.finalRank || 999))
      : null
    return {
      total: games.length,
      totalEarnings,
      wins,
      winRate,
      bestRank: bestRank === 999 ? null : bestRank,
    }
  }, [completed])

  const isLoading = loading.myCompetitions || loading.participatedCompetitions || loading.gameHistory

  return (
    <div className="pp-page">
      <Container fluid className="pp-container">
        <div className="pp-header pp-history-header">
          <div className="pp-header-top">
            <div>
              <Link to="/play" className="pp-back-link">
                <ChevronLeft size={14} /> Back to Play
              </Link>
              <h1 className="pp-title">
                <History size={22} style={{ marginRight: 10, verticalAlign: 'middle', color: '#C53030' }} />
                History
              </h1>
              <p className="pp-subtitle">Your past competitions, players, and earnings</p>
            </div>
          </div>

          {/* Stats summary */}
          <div className="pp-history-stats">
            <div className="pp-history-stat">
              <Trophy size={16} color="#C53030" />
              <span className="pp-history-stat-label">Games Played</span>
              <span className="pp-history-stat-value">{stats.total}</span>
            </div>
            <div className="pp-history-stat">
              <TrendingUp size={16} color="#38A169" />
              <span className="pp-history-stat-label">Total Won</span>
              <span className="pp-history-stat-value">{formatKES(stats.totalEarnings)}</span>
            </div>
            <div className="pp-history-stat">
              <Trophy size={16} color="#F6AD55" />
              <span className="pp-history-stat-label">Wins</span>
              <span className="pp-history-stat-value">{stats.wins}</span>
            </div>
            <div className="pp-history-stat">
              <TrendingUp size={16} color="#3182CE" />
              <span className="pp-history-stat-label">Win Rate</span>
              <span className="pp-history-stat-value">{stats.winRate}%</span>
            </div>
            <div className="pp-history-stat">
              <Trophy size={16} color="#805AD5" />
              <span className="pp-history-stat-label">Best Rank</span>
              <span className="pp-history-stat-value">{stats.bestRank ? `#${stats.bestRank}` : '—'}</span>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="pp-maintabs">
          <button
            type="button"
            className={`pp-maintab ${tab === 'competitions' ? 'active' : ''}`}
            onClick={() => setTab('competitions')}
          >
            <Gamepad2 size={15} />
            <span>Past Competitions</span>
            {completed.length > 0 && <span className="pp-maintab-count">{completed.length}</span>}
          </button>
          <button
            type="button"
            className={`pp-maintab ${tab === 'players' ? 'active' : ''}`}
            onClick={() => setTab('players')}
          >
            <Users size={15} />
            <span>Players Played With</span>
            {gameHistory?.length > 0 && <span className="pp-maintab-count">{gameHistory.length}</span>}
          </button>
        </div>

        {isLoading && completed.length === 0 && (
          <div className="pp-loader" style={{ height: '40vh' }}>
            <Spinner animation="border" style={{ color: '#C53030' }} />
            <div>Loading history...</div>
          </div>
        )}

        {/* Past Competitions */}
        {!isLoading && tab === 'competitions' && (
          completed.length === 0 ? (
            <div className="pp-empty">
              <Gamepad2 size={42} color="#3A3A3A" />
              <h5>No past competitions</h5>
              <p>Once you finish a competition, it'll appear here with your rank and earnings.</p>
              <Link to="/play" className="pp-btn pp-btn-primary">
                Browse Competitions
              </Link>
            </div>
          ) : (
            <div className="pp-history-table">
              <div className="pp-history-row pp-history-row--head">
                <div className="pp-history-col-title">Competition</div>
                <div className="pp-history-col-game">Game</div>
                <div className="pp-history-col-rank">Rank</div>
                <div className="pp-history-col-score">Score</div>
                <div className="pp-history-col-earned">Earned</div>
                <div className="pp-history-col-date">Date</div>
              </div>
              {completed.map(comp => (
                <div key={comp.id} className="pp-history-row">
                  <div className="pp-history-col-title">
                    <span className="pp-history-title">{comp.title}</span>
                    <span className="pp-history-status">
                      {comp.status === 'CANCELED' ? 'Canceled · Refund processed' : 'Completed'}
                    </span>
                  </div>
                  <div className="pp-history-col-game">
                    <span className="pp-pill pp-pill-game">{comp.Game?.name || 'Unknown'}</span>
                  </div>
                  <div className="pp-history-col-rank">
                    {comp.finalRank ? (
                      <span style={{ color: rankColor(comp.finalRank), fontWeight: 700 }}>
                        #{comp.finalRank}
                      </span>
                    ) : <span className="pp-history-muted">—</span>}
                  </div>
                  <div className="pp-history-col-score">
                    {comp.finalScore !== undefined && comp.finalScore !== null
                      ? <span>{comp.finalScore} pts</span>
                      : <span className="pp-history-muted">—</span>}
                  </div>
                  <div className="pp-history-col-earned">
                    {comp.earnings > 0
                      ? <span style={{ color: '#5BC58A', fontWeight: 700 }}>+{formatKES(comp.earnings)}</span>
                      : <span className="pp-history-muted">—</span>}
                  </div>
                  <div className="pp-history-col-date">
                    <Calendar size={11} style={{ marginRight: 4 }} />
                    {formatDate(comp.endsAt || comp.createdAt)}
                  </div>
                </div>
              ))}
            </div>
          )
        )}

        {/* Players */}
        {!isLoading && tab === 'players' && (
          (!gameHistory || gameHistory.length === 0) ? (
            <div className="pp-empty">
              <Users size={42} color="#3A3A3A" />
              <h5>No players yet</h5>
              <p>Players you've competed against will show up here.</p>
            </div>
          ) : (
            <div className="pp-cardlist">
              {gameHistory.map(player => (
                <div key={player.playerId || player.id} className="pp-player-card">
                  <div className="pp-player-avatar">
                    {player.username?.charAt(0)?.toUpperCase() || '?'}
                  </div>
                  <div className="pp-player-info">
                    <div className="pp-player-name">{player.username}</div>
                    <div className="pp-player-meta">
                      {player.gamesPlayed} games · Last played {formatDate(player.lastPlayed)}
                    </div>
                    {player.gameTypes?.length > 0 && (
                      <div className="pp-player-types">
                        {player.gameTypes.map(t => (
                          <span key={t} className="pp-pill pp-pill-game">{t}</span>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )
        )}
      </Container>
    </div>
  )
}

export default HistoryPage
