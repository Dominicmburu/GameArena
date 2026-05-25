import React from 'react'
import { Trophy, TrendingUp } from 'lucide-react'

const rankColor = (rank) => {
  if (rank === 1) return '#F6AD55'
  if (rank === 2) return '#C0C0C0'
  if (rank === 3) return '#CD7F32'
  if (rank <= 10) return '#3182CE'
  if (rank <= 25) return '#805AD5'
  return '#7A7A7A'
}

const GlobalLeaderboard = ({ leaderboard = [] }) => {
  return (
    <div className="pp-lb">
      <div className="pp-lb-head">
        <div className="pp-lb-title">
          <TrendingUp size={16} color="#C53030" />
          <span>Global Leaderboard</span>
        </div>
        <span className="pp-lb-live">
          <span className="pp-live-dot" /> LIVE
        </span>
      </div>

      {leaderboard.length === 0 ? (
        <div className="pp-lb-empty">
          <Trophy size={28} color="#3A3A3A" />
          <p>No leaderboard data yet</p>
        </div>
      ) : (
        <div className="pp-lb-list">
          {leaderboard.map((player, i) => {
            const rank = player.rank || i + 1
            const isTop3 = rank <= 3
            return (
              <div
                key={player.id || i}
                className={`pp-lb-row ${player.isCurrentUser ? 'pp-lb-row--me' : ''}`}
              >
                <span
                  className="pp-lb-rank"
                  style={{
                    background: isTop3 ? rankColor(rank) : 'transparent',
                    color: isTop3 ? '#0E0E10' : rankColor(rank),
                    border: isTop3 ? 'none' : `1px solid ${rankColor(rank)}55`,
                  }}
                >
                  {rank}
                </span>

                <div className="pp-lb-info">
                  <div className="pp-lb-name">
                    {player.username}
                    {player.isCurrentUser && <span className="pp-lb-you">(You)</span>}
                  </div>
                  <div className="pp-lb-earnings">
                    KES {Number(player.totalEarnings || 0).toLocaleString()} earned
                  </div>
                </div>

                {isTop3 && <Trophy size={14} color={rankColor(rank)} />}
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}

export default GlobalLeaderboard
