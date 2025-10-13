import React, { memo } from 'react';
import { Card, Row, Col, Badge, Button } from 'react-bootstrap';
import { Trophy, Clock, Users, Zap, Send, Play, Check, Copy } from 'lucide-react';

// Memoize the component to prevent unnecessary re-renders
const CompetitionCard = memo(({ competition, onPlay, onInvite, onCopyCode, copiedCode, isActive }) => {
  const getStatusColor = (status) => {
    switch (status) {
      case 'UPCOMING': return '#00F0FF';
      case 'ONGOING': return '#00FF85';
      case 'COMPLETED': return '#B0B0B0';
      case 'CANCELED': return '#FF003C';
      default: return '#B0B0B0';
    }
  };

  const getRankColor = (rank) => {
    if (rank <= 3) return '#00FF85';
    if (rank <= 10) return '#00F0FF';
    if (rank <= 25) return '#9B00FF';
    return '#B0B0B0';
  };

  return (
    <Card 
      className="cyber-card mb-3 competition-card"
      style={{ transition: 'all 0.3s ease' }} // Smooth transitions for updates
    >
      <Card.Body>
        <Row className="align-items-center">
          <Col md={8}>
            <div className="d-flex justify-content-between align-items-start mb-3">
              <div>
                <h5 className="text-white mb-1">{competition.title}</h5>
                <div className="d-flex gap-2 flex-wrap mb-2">
                  <Badge style={{ background: '#9B00FF' }}>
                    {competition.Game?.name || competition.gameName || 'Unknown Game'}
                  </Badge>
                  <Badge 
                    style={{ 
                      background: getStatusColor(competition.status),
                      transition: 'background 0.3s ease'
                    }}
                  >
                    {competition.status}
                  </Badge>
                  {competition.playedCount > 0 && (
                    <Badge 
                      style={{ 
                        background: '#00FF85',
                        transition: 'all 0.3s ease'
                      }}
                    >
                      {competition.playedCount} played
                    </Badge>
                  )}
                </div>
                <div className="competition-code d-flex align-items-center mb-2">
                  <span className="text-grey me-2">Code:</span>
                  <code
                    className="text-neon bg-dark px-2 py-1 rounded cursor-pointer"
                    onClick={() => onCopyCode(competition.code)}
                    style={{ cursor: 'pointer' }}
                  >
                    {competition.code}
                  </code>
                  <Button
                    variant="link"
                    size="sm"
                    className="p-0 ms-2"
                    onClick={() => onCopyCode(competition.code)}
                  >
                    {copiedCode === competition.code ? (
                      <Check size={14} color="#00FF85" />
                    ) : (
                      <Copy size={14} color="#B0B0B0" />
                    )}
                  </Button>
                </div>
              </div>
              <div className="rank-display text-center">
                {isActive ? (
                  <>
                    <div 
                      className="rank-number fw-bold h3 text-neon"
                      style={{ transition: 'all 0.3s ease' }}
                    >
                      #{competition.currentRank || competition.rank || '0'}
                    </div>
                    <small className="text-white">
                      of {competition.currentPlayers || competition.totalPlayers}
                    </small>
                  </>
                ) : (
                  <>
                    <div
                      className="rank-number fw-bold h3"
                      style={{ 
                        color: getRankColor(competition.finalRank || competition.rank),
                        transition: 'color 0.3s ease'
                      }}
                    >
                      #{competition.finalRank || competition.rank || '0'}
                    </div>
                    <small className="text-white">Final</small>
                  </>
                )}
              </div>
            </div>

            <div className="competition-stats mb-3">
              <Row className="g-2">
                <Col xs={6} sm={3}>
                  <div 
                    className="d-flex align-items-center"
                    style={{ transition: 'all 0.3s ease' }}
                  >
                    <Trophy size={16} color="#00F0FF" className="me-2" />
                    <span className="text-neon small">
                      {isActive 
                        ? `KSh ${competition.totalPrizePool || competition.prizePool || 0}` 
                        : `${competition.finalScore || competition.score || 0} pts`
                      }
                    </span>
                  </div>
                </Col>
                <Col xs={6} sm={3}>
                  <div className="d-flex align-items-center">
                    <Clock size={16} color="#FF003C" className="me-2" />
                    <span className="text-cyber-red small">
                      {competition.minutesToPlay || competition.duration || 0}min
                    </span>
                  </div>
                </Col>
                <Col xs={6} sm={3}>
                  <div 
                    className="d-flex align-items-center"
                    style={{ transition: 'all 0.3s ease' }}
                  >
                    <Users size={16} color="#9B00FF" className="me-2" />
                    <span className="text-purple small">
                      {competition.currentPlayers || competition.participantCount || 0}/
                      {competition.maxPlayers || 'unlimited'}
                    </span>
                  </div>
                </Col>
                <Col xs={6} sm={3}>
                  <div className="d-flex align-items-center">
                    <Zap size={16} color="#00FF85" className="me-2" />
                    <span className="text-energy-green small">
                      {isActive 
                        ? `KSh ${competition.entryFee || 0}` 
                        : `KSh ${competition.earnings || 0}`
                      }
                    </span>
                  </div>
                </Col>
              </Row>
            </div>

            {competition.players && competition.players.length > 0 && (
              <div 
                className="players-status mb-3"
                style={{ transition: 'all 0.3s ease' }}
              >
                <small className="text-grey">Players: </small>
                <div className="d-flex flex-wrap gap-1">
                  {competition.players.slice(0, 5).map((player, index) => (
                    <Badge
                      key={player.id || index}
                      style={{
                        background: player.hasPlayed ? '#00FF85' : '#FF003C',
                        fontSize: '0.7rem',
                        transition: 'background 0.3s ease'
                      }}
                    >
                      {player.username} {player.hasPlayed && '✓'}
                    </Badge>
                  ))}
                  {competition.players.length > 5 && (
                    <Badge style={{ background: '#B0B0B0', fontSize: '0.7rem' }}>
                      +{competition.players.length - 5} more
                    </Badge>
                  )}
                </div>
              </div>
            )}

            {competition.participants && competition.participants.length > 0 && (
              <div 
                className="players-status mb-3"
                style={{ transition: 'all 0.3s ease' }}
              >
                <small className="text-grey">Players: </small>
                <div className="d-flex flex-wrap gap-1">
                  {competition.participants.slice(0, 5).map((participant, index) => (
                    <Badge
                      key={participant.id || index}
                      style={{
                        background: (participant.hasPlayed || participant.score !== null) ? '#00FF85' : '#FF003C',
                        fontSize: '0.7rem',
                        transition: 'background 0.3s ease'
                      }}
                    >
                      {participant.user?.username || participant.username} {(participant.hasPlayed || participant.score !== null) && '✓'}
                    </Badge>
                  ))}
                  {competition.participants.length > 5 && (
                    <Badge style={{ background: '#B0B0B0', fontSize: '0.7rem' }}>
                      +{competition.participants.length - 5} more
                    </Badge>
                  )}
                </div>
              </div>
            )}
          </Col>

          <Col md={4} className="text-end">
            {isActive && (
              <div className="d-flex flex-column gap-2">
                <Button
                  variant="outline-light"
                  size="sm"
                  onClick={() => onInvite(competition)}
                  className="w-100"
                  disabled={competition.currentPlayers >= competition.maxPlayers}
                  style={{ transition: 'all 0.2s ease' }}
                >
                  <Send size={16} className="me-2" />
                  Invite Players
                </Button>
                <Button
                  className="btn-cyber w-100"
                  onClick={() => onPlay(competition)}
                  disabled={competition.hasPlayed || competition.userHasPlayed}
                  style={{ transition: 'all 0.2s ease' }}
                >
                  {(competition.hasPlayed || competition.userHasPlayed) ? (
                    <>
                      <Check size={20} className="me-2" />
                      Completed
                    </>
                  ) : (
                    <>
                      <Play size={20} className="me-2" />
                      Play Now
                    </>
                  )}
                </Button>
              </div>
            )}
          </Col>
        </Row>
      </Card.Body>
    </Card>
  );
}, (prevProps, nextProps) => {
  // Custom comparison function for memo
  // Only re-render if these specific fields change
  return (
    prevProps.competition.id === nextProps.competition.id &&
    prevProps.competition.status === nextProps.competition.status &&
    prevProps.competition.currentPlayers === nextProps.competition.currentPlayers &&
    prevProps.competition.playedCount === nextProps.competition.playedCount &&
    prevProps.competition.currentRank === nextProps.competition.currentRank &&
    prevProps.competition.totalPrizePool === nextProps.competition.totalPrizePool &&
    prevProps.competition.hasPlayed === nextProps.competition.hasPlayed &&
    prevProps.copiedCode === nextProps.copiedCode &&
    prevProps.isActive === nextProps.isActive &&
    JSON.stringify(prevProps.competition.players) === JSON.stringify(nextProps.competition.players)
  );
});

CompetitionCard.displayName = 'CompetitionCard';

export default CompetitionCard;