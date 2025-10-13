import React from 'react';
import { Card, Badge } from 'react-bootstrap';
import { TrendingUp, Trophy } from 'lucide-react';

const GlobalLeaderboard = ({ leaderboard }) => {
  const getRankColor = (rank) => {
    if (rank <= 3) return '#00FF85';
    if (rank <= 10) return '#00F0FF';
    if (rank <= 25) return '#9B00FF';
    return '#B0B0B0';
  };

  return (
    <Card className="cyber-card sticky-top" style={{ top: '100px' }}>
      <Card.Header className="d-flex align-items-center justify-content-between">
        <div className="d-flex align-items-center">
          <TrendingUp size={20} color="#00F0FF" className="me-2" />
          <span className="fw-bold">Global Leaderboard</span>
        </div>
        <Badge className="pulse" style={{ background: '#00FF85' }}>LIVE</Badge>
      </Card.Header>
      <Card.Body className="p-0">
        <div className="leaderboard-list">
          {leaderboard.length === 0 ? (
            <div className="text-center p-4">
              <p className="text-grey mb-0">No leaderboard data available</p>
            </div>
          ) : (
            leaderboard.map((player, index) => (
              <div
                key={player.id || index}
                className={`leaderboard-item p-3 d-flex align-items-center ${player.isCurrentUser ? 'user-row' : ''}`}
              >
                <div
                  className="rank-badge me-3"
                  style={{
                    width: '30px',
                    height: '30px',
                    borderRadius: '50%',
                    background: getRankColor(player.rank || index + 1),
                    color: '#0E0E10',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '0.8rem',
                    fontWeight: 'bold'
                  }}
                >
                  {player.rank || index + 1}
                </div>

                <div className="player-avatar me-3" style={{ fontSize: '1.5rem' }}>
                  {player.avatar || '🎮'}
                </div>

                <div className="player-info flex-grow-1">
                  <div className="player-name fw-bold text-white">
                    {player.username}
                    {player.isCurrentUser && <span className="text-neon ms-2">(You)</span>}
                  </div>
                  <div className="player-score text-grey small">
                    KSh {player.totalEarnings?.toLocaleString() || 0} earned
                  </div>
                </div>

                {(player.rank || index + 1) <= 3 && (
                  <div className="trophy-icon">
                    <Trophy size={16} color={getRankColor(player.rank || index + 1)} />
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </Card.Body>
    </Card>
  );
};

export default GlobalLeaderboard;