import React, { memo, useState, useEffect } from 'react';
import { Card, Row, Col, Badge, Button } from 'react-bootstrap';
import { Trophy, Clock, Users, Zap, Send, Play, Check, Copy, LogOut, AlertCircle } from 'lucide-react';

const CompetitionCard = memo(({ 
  competition, 
  onPlay, 
  onInvite, 
  onCopyCode, 
  onLeave,
  copiedCode, 
  isActive 
}) => {
  const [timeRemaining, setTimeRemaining] = useState(0);
  const [timeUntilStart, setTimeUntilStart] = useState(0);
  const [isExpired, setIsExpired] = useState(false);
  const [hasStarted, setHasStarted] = useState(false);

  // Calculate time remaining and time until start with real-time countdown
  useEffect(() => {
    if (!isActive) return;

    const calculateTime = () => {
      const now = new Date().getTime();
      const starts = competition.startsAt ? new Date(competition.startsAt).getTime() : now;
      const ends = competition.endsAt ? new Date(competition.endsAt).getTime() : now;
      
      const diffToStart = Math.max(0, Math.floor((starts - now) / 1000));
      const diffToEnd = Math.max(0, Math.floor((ends - now) / 1000));
      
      setTimeUntilStart(diffToStart);
      setTimeRemaining(diffToEnd);
      setHasStarted(diffToStart === 0);
      setIsExpired(diffToEnd === 0);
    };

    calculateTime();
    const timer = setInterval(calculateTime, 1000);

    return () => clearInterval(timer);
  }, [competition.startsAt, competition.endsAt, isActive]);

  const formatTime = (seconds) => {
    if (seconds <= 0) return 'EXPIRED';
    
    const hours = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    
    if (hours > 0) {
      return `${hours}h ${mins}m`;
    }
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getStatusColor = (status) => {
    const colors = {
      'UPCOMING': '#00F0FF',
      'ONGOING': '#00FF85',
      'COMPLETED': '#9B00FF',
      'CANCELED': '#FF003C'
    };
    return colors[status] || '#B0B0B0';
  };

  const getRankColor = (rank) => {
    if (rank === 1) return '#FFD700';
    if (rank === 2) return '#C0C0C0';
    if (rank === 3) return '#CD7F32';
    if (rank <= 10) return '#00F0FF';
    if (rank <= 25) return '#9B00FF';
    return '#B0B0B0';
  };

  // Determine if user can play
  const canPlay = isActive && 
                  !competition.hasPlayed && 
                  !isExpired &&
                  hasStarted &&
                  competition.status === 'ONGOING';

  // Check if user can leave (only before anyone has played)
  const canLeave = isActive && 
                   !competition.hasPlayed && 
                   competition.playedCount === 0 &&
                   !isExpired;

  // Progress calculations
  const progress = competition.maxPlayers > 0 
    ? (competition.currentPlayers / competition.maxPlayers) * 100 
    : 0;

  return (
    <Card 
      className={`cyber-card mb-3 competition-card ${isExpired ? 'opacity-75' : ''}`}
      style={{ 
        transition: 'all 0.3s ease',
        borderLeft: `4px solid ${getStatusColor(competition.status)}`
      }}
    >
      <Card.Body>
        <Row className="align-items-start">
          <Col md={8}>
            {/* Header Section */}
            <div className="d-flex justify-content-between align-items-start mb-3">
              <div className="flex-grow-1">
                <h5 className="text-white mb-1">{competition.title}</h5>
                
                {/* Status Badges */}
                <div className="d-flex gap-2 flex-wrap mb-2">
                  <Badge style={{ background: '#9B00FF' }}>
                    {competition.Game?.name || 'Unknown Game'}
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
                    <Badge style={{ background: '#00FF85' }}>
                      {competition.playedCount}/{competition.currentPlayers} played
                    </Badge>
                  )}
                  {isExpired && (
                    <Badge style={{ background: '#FF003C' }}>
                      <AlertCircle size={12} className="me-1" />
                      EXPIRED
                    </Badge>
                  )}
                </div>

                {/* Competition Code */}
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

                {/* TIME COUNTDOWN - SIMPLIFIED */}
                {isActive && (
                  <div className="mb-2">
                    <div className="d-flex align-items-center ">
                      <small className="text-grey">
                        <Clock size={12} className="me-1" />
                        {!hasStarted ? 'Starts in' : 'Ends in'}
                      </small>
                      <small className="mx-2 text-grey">:</small>
                      <small 
                        className={`fw-bold ${
                          isExpired ? 'text-danger' : 
                          (!hasStarted || timeRemaining > 300) ? 'text-info' : 
                          'text-warning'
                        }`}
                      >
                        {!hasStarted ? formatTime(timeUntilStart) : formatTime(timeRemaining)}
                      </small>
                    </div>
                  </div>
                )}
              </div>

              {/* Rank Display */}
              <div className="rank-display text-center ms-3">
                {isActive ? (
                  <>
                    <div 
                      className="rank-number fw-bold h3"
                      style={{ 
                        color: competition.currentRank ? getRankColor(competition.currentRank) : '#B0B0B0',
                        transition: 'all 0.3s ease'
                      }}
                    >
                      #{competition.currentRank || '-'}
                    </div>
                    <small className="text-white">
                      of {competition.currentPlayers}
                    </small>
                  </>
                ) : (
                  <>
                    <div
                      className="rank-number fw-bold h3"
                      style={{ 
                        color: getRankColor(competition.finalRank || 999),
                        transition: 'color 0.3s ease'
                      }}
                    >
                      #{competition.finalRank || '-'}
                    </div>
                    <small className="text-white">Final</small>
                  </>
                )}
              </div>
            </div>

            {/* Stats Section */}
            <div className="competition-stats mb-3">
              <Row className="g-2">
                <Col xs={6} sm={3}>
                  <div className="d-flex align-items-center">
                    <Trophy size={16} color="#00F0FF" className="me-2" />
                    <span className="text-neon small">
                      {isActive 
                        ? `KSh ${competition.totalPrizePool || 0}` 
                        : `${competition.finalScore || 0} pts`
                      }
                    </span>
                  </div>
                </Col>
                <Col xs={6} sm={3}>
                  <div className="d-flex align-items-center">
                    <Zap size={16} color="#FF003C" className="me-2" />
                    <span className="text-cyber-red small">
                      KSh {competition.entryFee || 0}
                    </span>
                  </div>
                </Col>
                <Col xs={6} sm={3}>
                  <div className="d-flex align-items-center">
                    <Users size={16} color="#9B00FF" className="me-2" />
                    <span className="text-purple small">
                      {competition.currentPlayers || 0}/{competition.maxPlayers}
                    </span>
                  </div>
                </Col>
                <Col xs={6} sm={3}>
                  <div className="d-flex align-items-center">
                    <Trophy size={16} color="#00FF85" className="me-2" />
                    <span className="text-energy-green small">
                      {competition.Game?.level || 'N/A'}
                    </span>
                  </div>
                </Col>
              </Row>
            </div>

            {/* Players List - UPDATED WITH COLOR CODING */}
            {competition.players && competition.players.length > 0 && (
              <div className="players-status">
                <small className="text-grey d-block mb-2">Players:</small>
                <div className="d-flex flex-wrap gap-1">
                  {competition.players.slice(0, 6).map((player, index) => (
                    <Badge
                      key={player.id || index}
                      style={{
                        background: player.hasPlayed ? '#00FF85' : '#FF6B6B',
                        fontSize: '0.7rem',
                        transition: 'background 0.3s ease',
                        color: '#FFFFFF'
                      }}
                    >
                      {player.username} {player.hasPlayed && '✓'}
                      {player.score > 0 && ` (${player.score})`}
                    </Badge>
                  ))}
                  {competition.players.length > 6 && (
                    <Badge style={{ background: '#B0B0B0', fontSize: '0.7rem' }}>
                      +{competition.players.length - 6} more
                    </Badge>
                  )}
                </div>
              </div>
            )}
          </Col>

          {/* Action Buttons */}
          <Col md={4} className="text-end">
            {isActive && (
              <div className="d-flex flex-column gap-2">
                {/* Invite Button */}
                <Button
                  variant="outline-light"
                  size="sm"
                  onClick={() => onInvite(competition)}
                  className="w-100"
                  disabled={competition.currentPlayers >= competition.maxPlayers || isExpired}
                >
                  <Send size={16} className="me-2" />
                  Invite Players
                </Button>

                {/* Play Button */}
                <Button
                  className="btn-cyber w-100"
                  onClick={() => onPlay(competition)}
                  disabled={!canPlay || isExpired || !hasStarted}
                >
                  {competition.hasPlayed ? (
                    <>
                      <Check size={20} className="me-2" />
                      Completed
                    </>
                  ) : isExpired ? (
                    <>
                      <AlertCircle size={20} className="me-2" />
                      Expired
                    </>
                  ) : !hasStarted ? (
                    <>
                      <Clock size={20} className="me-2" />
                      Not Started
                    </>
                  ) : (
                    <>
                      <Play size={20} className="me-2" />
                      Play Now
                    </>
                  )}
                </Button>

                {/* Leave Button */}
                {canLeave && onLeave && (
                  <Button
                    variant="outline-danger"
                    size="sm"
                    onClick={() => onLeave(competition)}
                    className="w-100"
                  >
                    <LogOut size={16} className="me-2" />
                    Leave Competition
                  </Button>
                )}

                {/* Warning Messages */}
                {isExpired && (
                  <small className="text-danger text-center">
                    Competition has expired
                  </small>
                )}
                {hasStarted && !competition.hasPlayed && !isExpired && (
                  <small className="text-warning text-center">
                    Game in progress
                  </small>
                )}
              </div>
            )}

            {/* Completed Competition Info */}
            {!isActive && competition.status === 'COMPLETED' && (
              <div className="text-center">
                <Badge 
                  style={{ 
                    background: getRankColor(competition.finalRank),
                    fontSize: '0.9rem',
                    padding: '8px 16px'
                  }}
                  className="mb-2"
                >
                  Rank #{competition.finalRank}
                </Badge>
                <div className="text-white small">
                  Score: {competition.finalScore || 0}
                </div>
                {competition.earnings > 0 && (
                  <div className="text-energy-green small fw-bold mt-1">
                    Won: KSh {competition.earnings}
                  </div>
                )}
              </div>
            )}

            {/* Canceled Competition Info */}
            {!isActive && competition.status === 'CANCELED' && (
              <div className="text-center">
                <Badge style={{ background: '#FF003C' }}>
                  Canceled
                </Badge>
                <div className="text-grey small mt-2">
                  Refund processed
                </div>
              </div>
            )}
          </Col>
        </Row>
      </Card.Body>
    </Card>
  );
}, (prevProps, nextProps) => {
  return (
    prevProps.competition.id === nextProps.competition.id &&
    prevProps.competition.status === nextProps.competition.status &&
    prevProps.competition.currentPlayers === nextProps.competition.currentPlayers &&
    prevProps.competition.playedCount === nextProps.competition.playedCount &&
    prevProps.competition.currentRank === nextProps.competition.currentRank &&
    prevProps.competition.totalPrizePool === nextProps.competition.totalPrizePool &&
    prevProps.competition.hasPlayed === nextProps.competition.hasPlayed &&
    prevProps.competition.startsAt === nextProps.competition.startsAt &&
    prevProps.competition.endsAt === nextProps.competition.endsAt &&
    prevProps.copiedCode === nextProps.copiedCode &&
    prevProps.isActive === nextProps.isActive &&
    JSON.stringify(prevProps.competition.players) === JSON.stringify(nextProps.competition.players)
  );
});

CompetitionCard.displayName = 'CompetitionCard';

export default CompetitionCard;