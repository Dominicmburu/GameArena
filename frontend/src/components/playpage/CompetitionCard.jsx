import React, { memo, useState, useEffect } from 'react'
import { Trophy, Clock, Users, Zap, Send, Play, Check, Copy, LogOut, AlertCircle, ChevronRight } from 'lucide-react'

const STATUS_COLOR = {
  UPCOMING:  '#3182CE',
  ONGOING:   '#38A169',
  COMPLETED: '#805AD5',
  CANCELED:  '#C53030',
}

const rankColor = (rank) => {
  if (rank === 1) return '#F6AD55'
  if (rank === 2) return '#C0C0C0'
  if (rank === 3) return '#CD7F32'
  if (rank <= 10) return '#3182CE'
  if (rank <= 25) return '#805AD5'
  return '#B0B0B0'
}

const formatKES = (n) =>
  `KES ${Number(n || 0).toLocaleString('en-KE')}`

const formatTime = (seconds) => {
  if (seconds <= 0) return 'EXPIRED'
  const h = Math.floor(seconds / 3600)
  const m = Math.floor((seconds % 3600) / 60)
  const s = seconds % 60
  if (h > 0) return `${h}h ${m}m`
  return `${m}:${s.toString().padStart(2, '0')}`
}

const CompetitionCard = memo(({
  competition,
  mode = 'joined',  // 'public' | 'joined' | 'completed'
  onPlay,
  onJoin,
  onInvite,
  onCopyCode,
  onLeave,
  copiedCode,
}) => {
  const [timeRemaining, setTimeRemaining] = useState(0)
  const [timeUntilStart, setTimeUntilStart] = useState(0)
  const [hasStarted, setHasStarted] = useState(false)
  const [isExpired, setIsExpired] = useState(false)

  const isJoined    = mode === 'joined'
  const isPublic    = mode === 'public'
  const isCompleted = mode === 'completed'

  useEffect(() => {
    if (isCompleted) return
    const tick = () => {
      const now    = Date.now()
      const starts = competition.startsAt ? new Date(competition.startsAt).getTime() : now
      const ends   = competition.endsAt   ? new Date(competition.endsAt).getTime()   : now
      const toStart = Math.max(0, Math.floor((starts - now) / 1000))
      const toEnd   = Math.max(0, Math.floor((ends - now) / 1000))
      setTimeUntilStart(toStart)
      setTimeRemaining(toEnd)
      setHasStarted(toStart === 0)
      setIsExpired(toEnd === 0)
    }
    tick()
    const timer = setInterval(tick, 1000)
    return () => clearInterval(timer)
  }, [competition.startsAt, competition.endsAt, isCompleted])

  const statusColor   = STATUS_COLOR[competition.status] || '#B0B0B0'
  const canPlay       = isJoined && !competition.hasPlayed && !isExpired && hasStarted && competition.status === 'ONGOING'
  const canLeave      = isJoined && !competition.hasPlayed && competition.playedCount === 0 && !isExpired
  const isFull        = competition.currentPlayers >= competition.maxPlayers
  const playerPct     = competition.maxPlayers > 0
    ? Math.min(100, (competition.currentPlayers / competition.maxPlayers) * 100)
    : 0

  return (
    <div className="pp-card" style={{ borderLeftColor: statusColor }}>
      {/* Top row: title + status pills */}
      <div className="pp-card-top">
        <div className="pp-card-titlewrap">
          <h5 className="pp-card-title">{competition.title}</h5>
          <div className="pp-card-pills">
            <span className="pp-pill pp-pill-game">
              {competition.Game?.name || 'Unknown Game'}
            </span>
            <span className="pp-pill" style={{ background: `${statusColor}22`, color: statusColor, border: `1px solid ${statusColor}55` }}>
              {competition.status}
            </span>
            {competition.Game?.level && (
              <span className="pp-pill pp-pill-level">{competition.Game.level}</span>
            )}
            {isJoined && competition.playedCount > 0 && (
              <span className="pp-pill pp-pill-progress">
                {competition.playedCount}/{competition.currentPlayers} played
              </span>
            )}
            {isExpired && !isCompleted && (
              <span className="pp-pill pp-pill-expired">
                <AlertCircle size={11} /> Expired
              </span>
            )}
          </div>
        </div>

        {/* Rank badge */}
        {isJoined && (
          <div className="pp-rank">
            <div className="pp-rank-num" style={{ color: competition.currentRank ? rankColor(competition.currentRank) : '#666' }}>
              #{competition.currentRank || '-'}
            </div>
            <span className="pp-rank-label">of {competition.currentPlayers}</span>
          </div>
        )}
        {isCompleted && (
          <div className="pp-rank">
            <div className="pp-rank-num" style={{ color: rankColor(competition.finalRank || 999) }}>
              #{competition.finalRank || '-'}
            </div>
            <span className="pp-rank-label">Final</span>
          </div>
        )}
      </div>

      {/* Stats row */}
      <div className="pp-card-stats">
        <div className="pp-stat">
          <Trophy size={14} color="#C53030" />
          <span className="pp-stat-label">Prize</span>
          <span className="pp-stat-value">{formatKES(competition.totalPrizePool)}</span>
        </div>
        <div className="pp-stat">
          <Zap size={14} color="#DD6B20" />
          <span className="pp-stat-label">Entry</span>
          <span className="pp-stat-value">{formatKES(competition.entryFee)}</span>
        </div>
        <div className="pp-stat">
          <Users size={14} color="#3182CE" />
          <span className="pp-stat-label">Players</span>
          <span className="pp-stat-value">{competition.currentPlayers || 0}/{competition.maxPlayers}</span>
        </div>
        {!isCompleted && (
          <div className="pp-stat">
            <Clock size={14} color={!hasStarted ? '#3182CE' : isExpired ? '#C53030' : '#38A169'} />
            <span className="pp-stat-label">{!hasStarted ? 'Starts in' : 'Ends in'}</span>
            <span className="pp-stat-value">
              {!hasStarted ? formatTime(timeUntilStart) : formatTime(timeRemaining)}
            </span>
          </div>
        )}
        {isCompleted && competition.finalScore !== undefined && (
          <div className="pp-stat">
            <Trophy size={14} color="#38A169" />
            <span className="pp-stat-label">Score</span>
            <span className="pp-stat-value">{competition.finalScore} pts</span>
          </div>
        )}
      </div>

      {/* Capacity bar (public/joined only) */}
      {!isCompleted && (
        <div className="pp-progress">
          <div className="pp-progress-fill" style={{
            width: `${playerPct}%`,
            background: isFull ? '#C53030' : 'linear-gradient(90deg, #C53030, #DD6B20)',
          }} />
        </div>
      )}

      {/* Bottom: code + actions */}
      <div className="pp-card-bottom">
        {competition.code && (
          <div className="pp-code">
            <span className="pp-code-label">Code</span>
            <button
              type="button"
              className="pp-code-value"
              onClick={() => onCopyCode?.(competition.code)}
              title="Copy code"
            >
              {competition.code}
              {copiedCode === competition.code
                ? <Check size={12} color="#38A169" />
                : <Copy size={12} color="#7A7A7A" />
              }
            </button>
          </div>
        )}

        <div className="pp-card-actions">
          {/* PUBLIC mode */}
          {isPublic && (
            <button
              type="button"
              className="pp-btn pp-btn-primary"
              onClick={() => onJoin?.(competition)}
              disabled={isFull || isExpired}
            >
              {isFull ? 'Full' : isExpired ? 'Expired' : (<>Join Competition <ChevronRight size={14} /></>)}
            </button>
          )}

          {/* JOINED mode */}
          {isJoined && (
            <>
              {canLeave && (
                <button type="button" className="pp-btn pp-btn-ghost-danger" onClick={() => onLeave?.(competition)}>
                  <LogOut size={14} /> Leave
                </button>
              )}
              <button
                type="button"
                className="pp-btn pp-btn-ghost"
                onClick={() => onInvite?.(competition)}
                disabled={isFull || isExpired}
              >
                <Send size={14} /> Invite
              </button>
              <button
                type="button"
                className="pp-btn pp-btn-primary"
                onClick={() => onPlay?.(competition)}
                disabled={!canPlay}
              >
                {competition.hasPlayed
                  ? (<><Check size={14} /> Played</>)
                  : isExpired
                    ? (<><AlertCircle size={14} /> Expired</>)
                    : !hasStarted
                      ? (<><Clock size={14} /> Not Started</>)
                      : (<><Play size={14} /> Play Now</>)
                }
              </button>
            </>
          )}

          {/* COMPLETED mode */}
          {isCompleted && competition.earnings > 0 && (
            <div className="pp-earnings">
              <Trophy size={14} color="#38A169" />
              <span>Won {formatKES(competition.earnings)}</span>
            </div>
          )}
          {isCompleted && competition.status === 'CANCELED' && (
            <span className="pp-canceled-note">Refund processed</span>
          )}
        </div>
      </div>
    </div>
  )
}, (prev, next) => (
  prev.competition.id === next.competition.id &&
  prev.competition.status === next.competition.status &&
  prev.competition.currentPlayers === next.competition.currentPlayers &&
  prev.competition.playedCount === next.competition.playedCount &&
  prev.competition.currentRank === next.competition.currentRank &&
  prev.competition.totalPrizePool === next.competition.totalPrizePool &&
  prev.competition.hasPlayed === next.competition.hasPlayed &&
  prev.competition.startsAt === next.competition.startsAt &&
  prev.competition.endsAt === next.competition.endsAt &&
  prev.copiedCode === next.copiedCode &&
  prev.mode === next.mode
))

CompetitionCard.displayName = 'CompetitionCard'

export default CompetitionCard
